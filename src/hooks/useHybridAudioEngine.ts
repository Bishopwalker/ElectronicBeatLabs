/**
 * Hybrid Audio Engine Hook
 * Combines frontend and backend engines with seamless crossfading
 *
 * Benefits:
 * - Instant start (frontend) + precision (backend)
 * - Automatic failover on backend disconnect
 * - Shared AudioContext and AnalyserNode for visualization
 * - Zero dropout during network issues
 * - Progressive enhancement: works offline, better online
 *
 * Usage:
 * ```tsx
 * const hybridEngine = useHybridAudioEngine();
 *
 * // Start audio (frontend plays instantly, backend connects in background)
 * await hybridEngine.startBinauralBeat({ base_frequency: 140, beat_frequency: 4 });
 *
 * // Visualization works throughout
 * <FrequencyVisualizer
 *   audioContext={hybridEngine.audioContext}
 *   analyserNode={hybridEngine.analyserNode}
 * />
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAudioEngine } from './useAudioEngine';
import { useBackendAudioEngine } from './useBackendAudioEngine';
import { AudioMixer } from '../utils/AudioMixer';
import type { BinauralBeatConfig, PatternConfig } from '../types';
import { DEFAULT_VOLUME } from '../constants/audio.constants';

export const useHybridAudioEngine = () => {
  // Initialize both engines (will be routed through mixer after mixer is created)
  const frontendEngine = useAudioEngine();
  const backendEngine = useBackendAudioEngine();

  // Audio mixer for crossfading
  const mixerRef = useRef<AudioMixer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentEngine, setCurrentEngine] = useState<'frontend' | 'backend' | 'hybrid'>('frontend');

  // Track backend connection state for auto-crossfade
  const previousBackendConnected = useRef(backendEngine.backendConnected);

  /**
   * Initialize audio mixer and connect both engines
   */
  const initializeMixer = useCallback(async () => {
    if (mixerRef.current || !frontendEngine.audioContext) {
      return;
    }

    console.log('🎚️ Hybrid Engine: Initializing audio mixer...');

    try {
      // Ensure frontend audio context is ready
      if (!frontendEngine.audioContext) {
        await frontendEngine.initializeAudio();
      }

      if (frontendEngine.audioContext) {
        // Create mixer
        mixerRef.current = new AudioMixer(frontendEngine.audioContext);

        // 🔥 CRITICAL FIX: Connect BOTH engines to mixer
        // This ensures both frontend and backend audio route through mixer for synchronized volume control

        // Connect frontend engine to mixer's frontend gain
        frontendEngine.setExternalNodes(
          mixerRef.current.getFrontendGain(),
          mixerRef.current.analyserNode
        );

        // Connect backend engine to mixer's backend gain
        backendEngine.setExternalNodes(
          mixerRef.current.getBackendGain(),
          mixerRef.current.analyserNode
        );

        console.log('✅ Hybrid Engine: Audio mixer initialized and connected to BOTH engines');
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('❌ Hybrid Engine: Failed to initialize mixer:', error);
    }
  }, [frontendEngine, backendEngine]);

  /**
   * Initialize mixer when frontend context becomes available
   */
  useEffect(() => {
    if (frontendEngine.audioContext && !mixerRef.current) {
      initializeMixer();
    }
  }, [frontendEngine.audioContext, initializeMixer]);

  /**
   * Monitor backend connection and auto-crossfade
   */
  useEffect(() => {
    const backendNowConnected = backendEngine.backendConnected && backendEngine.sessionId;
    const backendWasConnected = previousBackendConnected.current;

    // Backend just connected - crossfade to it
    if (backendNowConnected && !backendWasConnected && mixerRef.current) {
      console.log('🔄 Hybrid Engine: Backend connected, crossfading from frontend to backend...');
      mixerRef.current.crossfadeToBackend(2.0);
      setCurrentEngine('backend');
    }

    // Backend just disconnected - instant failover
    if (!backendNowConnected && backendWasConnected && mixerRef.current) {
      console.log('🚨 Hybrid Engine: Backend disconnected, instant failover to frontend!');
      mixerRef.current.failoverToFrontend();
      setCurrentEngine('frontend');
    }

    previousBackendConnected.current = backendNowConnected;
  }, [backendEngine.backendConnected, backendEngine.sessionId]);

  /**
   * Start binaural beat with hybrid approach
   * 1. Frontend starts immediately (instant audio)
   * 2. Backend connects in background
   * 3. Auto-crossfade to backend when ready
   */
  const startBinauralBeat = useCallback(async (config: BinauralBeatConfig) => {
    console.log('🎵 Hybrid Engine: Starting binaural beat with config:', config);

    // Initialize mixer if not ready
    if (!mixerRef.current) {
      await initializeMixer();
    }

    try {
      // STEP 1: Start frontend immediately (instant audio)
      console.log('⚡ Hybrid Engine: Starting FRONTEND engine (instant)...');
      await frontendEngine.startBinauralBeat(config);
      
      // 🔥 CRITICAL FIX: Route frontend audio through mixer
      if (mixerRef.current && frontendEngine.audioContext) {
        console.log('🔌 Hybrid Engine: Routing frontend audio through mixer...');
        
        // Get the merger node that frontend created (it's connected to its analyser)
        // We need to disconnect it from its analyser and connect to mixer instead
        // This is a bit hacky but necessary since frontend engine doesn't know about mixer
        
        // The frontend engine's audio chain is:
        // oscillators → gains → merger → analyser → destination
        
        // We can't easily intercept this without modifying frontend engine
        // So instead, we'll use the mixer's analyser which will work when backend connects
        
        // For now, keep frontend using its own analyser until backend connects
        console.log('⚠️ Hybrid Engine: Frontend using its own analyser until backend connects');
      }
      
      setCurrentEngine('frontend');

      // STEP 2: Connect backend in background (no await - non-blocking)
      console.log('🔌 Hybrid Engine: Connecting BACKEND engine (background)...');

      // Try to connect backend without blocking
      if (!backendEngine.backendConnected) {
        backendEngine.connectBackend().catch(err => {
          console.warn('⚠️ Hybrid Engine: Backend unavailable, continuing frontend-only:', err);
        });
      }

      // Start backend session
      backendEngine.startBackendSession(config).then(() => {
        console.log('✅ Hybrid Engine: Backend session started, crossfade will happen automatically');
      }).catch(err => {
        console.warn('⚠️ Hybrid Engine: Backend session failed, continuing frontend-only:', err);
      });

      console.log('✅ Hybrid Engine: Audio started (frontend playing, backend connecting)');
    } catch (error) {
      console.error('❌ Hybrid Engine: Failed to start audio:', error);
      throw error;
    }
  }, [frontendEngine, backendEngine, initializeMixer]);

  /**
   * Stop binaural beat (stops both engines)
   */
  const stopBinauralBeat = useCallback(async () => {
    console.log('🛑 Hybrid Engine: Stopping both engines...');

    try {
      // Stop frontend
      if (frontendEngine.audioState.isPlaying) {
        frontendEngine.stopBinauralBeat();
      }

      // Stop backend
      if (backendEngine.audioState.isPlaying) {
        await backendEngine.stopBinauralBeat();
      }

      console.log('✅ Hybrid Engine: Both engines stopped');
    } catch (error) {
      console.error('❌ Hybrid Engine: Failed to stop audio:', error);
    }
  }, [frontendEngine, backendEngine]);

  /**
   * Update frequency (applies to BOTH engines for synchronization)
   * 🔥 CRITICAL FIX: ALWAYS update both engines regardless of connection state
   */
  const updateFrequency = useCallback((leftFreq: number, rightFreq: number) => {
    const beatFreq = Math.abs(rightFreq - leftFreq);
    const baseFreq = Math.min(leftFreq, rightFreq);

    console.log('🎛️ Hybrid Engine: Syncing frequency to BOTH engines -', {
      leftFreq,
      rightFreq,
      baseFreq,
      beatFreq
    });

    // 🔥 FIXED: Update FRONTEND engine (uses leftFreq/rightFreq format)
    frontendEngine.updateFrequency(leftFreq, rightFreq);

    // 🔥 FIXED: Update BACKEND engine ALWAYS (not just when connected)
    // This ensures when backend connects later, it has the correct settings
    if (backendEngine.updateFrequency) {
      backendEngine.updateFrequency(baseFreq, beatFreq);
    }
  }, [frontendEngine, backendEngine]);

  /**
   * Update settings (base_frequency/beat_frequency format)
   * 🔥 CRITICAL FIX: Syncs both engines with new frequency settings
   */
  const updateSettings = useCallback((settings: { base_frequency?: number; beat_frequency?: number }) => {
    console.log('🎛️ Hybrid Engine: Syncing settings to BOTH engines -', settings);

    // Update BACKEND engine (native format)
    if (backendEngine.updateSettings) {
      backendEngine.updateSettings(settings);
    }

    // Update FRONTEND engine (convert to leftFreq/rightFreq format)
    if (settings.base_frequency !== undefined && settings.beat_frequency !== undefined) {
      const leftFreq = settings.base_frequency;
      const rightFreq = settings.base_frequency + settings.beat_frequency;
      frontendEngine.updateFrequency(leftFreq, rightFreq);
    }
  }, [frontendEngine, backendEngine]);

  /**
   * Update volume (affects both engines via mixer)
   */
  const updateVolume = useCallback((volume: number) => {
    const safeVolume = isNaN(volume) ? DEFAULT_VOLUME : Math.max(0, Math.min(2, volume));

    // Update mixer master volume
    if (mixerRef.current) {
      mixerRef.current.setMasterVolume(safeVolume);
    }

    // Update both engines' internal state
    frontendEngine.updateVolume(safeVolume);
    backendEngine.updateVolume(safeVolume);
  }, [frontendEngine, backendEngine]);

  /**
   * Update waveform (applies to frontend only)
   */
  const updateWaveform = useCallback((waveform: 'sine' | 'square' | 'triangle' | 'sawtooth') => {
    frontendEngine.updateWaveform(waveform);
  }, [frontendEngine]);

  /**
   * Update spatial settings (backend only feature)
   */
  const updateSpatialSettings = useCallback((spatialSettings: Record<string, unknown>) => {
    if (backendEngine.backendConnected) {
      backendEngine.updateSpatialSettings(spatialSettings);
    } else {
      console.warn('🎧 Spatial audio requires backend connection');
    }
  }, [backendEngine]);

  /**
   * Load pattern (hybrid approach)
   */
  const loadPattern = useCallback(async (pattern: PatternConfig) => {
    const config: BinauralBeatConfig = {
      base_frequency: pattern.frequencies.carrier,
      beat_frequency: pattern.frequencies.beat,
      amplitude: 0.5,
      waveform: 'sine'
    };

    await startBinauralBeat(config);
  }, [startBinauralBeat]);

  /**
   * Generate test tones
   */
  const generateTestTones = useCallback((leftFreq: number, rightFreq: number, duration: number = 5000) => {
    const config: BinauralBeatConfig = {
      base_frequency: leftFreq,
      beat_frequency: Math.abs(rightFreq - leftFreq),
      amplitude: DEFAULT_VOLUME,
      waveform: 'sine'
    };

    startBinauralBeat(config);

    setTimeout(() => {
      stopBinauralBeat();
    }, duration);
  }, [startBinauralBeat, stopBinauralBeat]);

  /**
   * Frequency sweep (uses active engine)
   */
  const frequencySweep = useCallback((
    startFreq: number,
    endFreq: number,
    duration: number,
    beatFrequency: number
  ) => {
    if (currentEngine === 'backend' && backendEngine.backendConnected) {
      backendEngine.frequencySweep(startFreq, endFreq, duration);
    } else {
      frontendEngine.frequencySweep(startFreq, endFreq, duration, beatFrequency);
    }
  }, [currentEngine, frontendEngine, backendEngine]);

  /**
   * Create ADHD protocol
   */
  const createGammaProtocol = useCallback((protocol: any) => {
    frontendEngine.createGammaProtocol(protocol);
  }, [frontendEngine]);

  /**
   * Initialize audio context manually (required for user gesture)
   * This is the CRITICAL method that SettingsTab uses
   */
  const initializeAudio = useCallback(async () => {
    console.log('🎵 Hybrid Engine: Manual audio context initialization...');
    try {
      const context = await frontendEngine.initializeAudio();
      if (context) {
        // CRITICAL: Update frontend engine state like SettingsTab does
        if (frontendEngine.setAudioState) {
          frontendEngine.setAudioState((prev: any) => ({
            ...prev,
            context
          }));
        }
        console.log('✅ Hybrid Engine: Audio context initialized, state:', context.state);

        // Initialize mixer now that context is ready
        if (!mixerRef.current) {
          await initializeMixer();
        }

        return context;
      }
    } catch (error) {
      console.error('❌ Hybrid Engine: Failed to initialize audio context:', error);
      throw error;
    }
  }, [frontendEngine, initializeMixer]);

  /**
   * Proactively initialize audio context on mount (like SettingsTab does)
   */
  useEffect(() => {
    const autoInitialize = async () => {
      if (!frontendEngine.audioContext) {
        console.log('🎵 Hybrid Engine: Proactively initializing audio context on mount...');
        try {
          await initializeAudio();
        } catch (error) {
          console.log('⚠️ Hybrid Engine: Auto-initialization requires user gesture');
        }
      }
    };

    autoInitialize();
  }, []); // Run once on mount

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (mixerRef.current) {
        console.log('🧹 Hybrid Engine: Cleaning up mixer...');
        mixerRef.current.destroy();
        mixerRef.current = null;
      }
    };
  }, []);

  // Determine which engine's state to show
  const isPlaying = frontendEngine.audioState.isPlaying || backendEngine.audioState.isPlaying;
  const electromagnetic = currentEngine === 'backend'
    ? backendEngine.electromagnetic
    : frontendEngine.electromagnetic;

  // 🔥 CRITICAL FIX: Return the CORRECT analyserNode based on what's actually playing
  // - If backend is active, use mixer's analyserNode (has backend audio data)
  // - If frontend is active, use frontend's analyserNode (has frontend audio data)
  // - This ensures FrequencyVisualizer always gets audio data
  const activeAnalyserNode = currentEngine === 'backend' && mixerRef.current
    ? mixerRef.current.analyserNode  // Backend → use mixer analyser
    : frontendEngine.analyserNode;    // Frontend → use frontend analyser

  // 🔥 FIXED: Compute unified audio state showing ACTUAL synchronized values
  // Instead of showing only one engine's state, show the REAL state that's playing
  const baseFreq = frontendEngine.audioState.leftFreq || backendEngine.audioState.config?.base_frequency || 140;
  const beatFreq = frontendEngine.audioState.beat_frequency || backendEngine.audioState.config?.beat_frequency || 4;
  const leftFreq = baseFreq;
  const rightFreq = baseFreq + beatFreq;
  
  const audioState = {
    isPlaying,
    amplitude: frontendEngine.audioState.amplitude || backendEngine.audioState.config?.amplitude || DEFAULT_VOLUME,
    leftFreq,
    rightFreq,
    beat_frequency: beatFreq,
    waveform: frontendEngine.audioState.waveform,
    config: {
      base_frequency: baseFreq,
      beat_frequency: beatFreq,
      amplitude: frontendEngine.audioState.amplitude || backendEngine.audioState.config?.amplitude || DEFAULT_VOLUME,
      waveform: frontendEngine.audioState.waveform
    }
  };

  return {
    // Unified state
    audioState,
    electromagnetic,

    // Audio control
    startBinauralBeat,
    stopBinauralBeat,
    updateFrequency,
    updateSettings, // 🔥 NEW: Sync both engines with base_frequency/beat_frequency
    updateVolume,
    updateWaveform,
    updateSpatialSettings,
    loadPattern,
    generateTestTones,
    frequencySweep,
    createGammaProtocol,

    // Audio context management (CRITICAL for SettingsTab compatibility)
    initializeAudio,
    setAudioState: frontendEngine.setAudioState, // Passthrough to frontend engine

    // 🔥 FIXED: Return correct analyserNode based on active engine
    audioContext: frontendEngine.audioContext,
    analyserNode: activeAnalyserNode,

    // Engine status
    currentEngine,
    isInitialized,
    backendConnected: backendEngine.backendConnected,
    backendSessionId: backendEngine.sessionId,

    // Mixer control (advanced)
    mixer: mixerRef.current,

    // WebSocket state
    websocketState: backendEngine.websocketState,

    // Browser support
    isSupported: frontendEngine.isSupported,

    // EXPOSED INTERNAL ENGINES (for legacy component compatibility)
    // These are the SAME engines managed internally by hybrid
    frontendEngine,
    backendEngine
  };
};
