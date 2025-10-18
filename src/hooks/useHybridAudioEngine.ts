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
import { 
  DEFAULT_VOLUME,
  DEFAULT_BEAT_FREQUENCY,
  DEFAULT_BASE_FREQUENCY
} from '../constants/audio.constants';

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
          mixerRef.current.analyserNode,
          frontendEngine.audioContext // 🔥 FIXED: Pass audioContext
        );

        // Connect backend engine to mixer's backend gain
        // 🔥 CRITICAL FIX: Pass the SAME audioContext so backend doesn't create its own
        backendEngine.setExternalNodes(
          mixerRef.current.getBackendGain(),
          mixerRef.current.analyserNode,
          frontendEngine.audioContext // 🔥 FIXED: Use frontend's context!
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

    previousBackendConnected.current as unknown as String ;
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
      
      // 🔥 FIXED: Properly update frontend engine state
      if (frontendEngine.setAudioState) {
        frontendEngine.setAudioState((prev: any) => ({
          ...prev,
          isPlaying: true
        }));
        console.log('✅ Frontend engine state updated: isPlaying = true');
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
      if (backendEngine.audioState){
        backendEngine.audioState.isPlaying = true;
      }
      console.log('✅ Hybrid Engine: Audio started (frontend playing, backend connecting)');
    } catch (error) {
      console.error('❌ Hybrid Engine: Failed to start audio:', error);
      throw error;
    }
  }, [frontendEngine.audioState, backendEngine, initializeMixer]);

  /**
   * Stop binaural beat (stops both engines)
   */
  const stopBinauralBeat = useCallback(async () => {
    console.log('🛑 Hybrid Engine: stopBinauralBeat called');
    console.log('🛑 Frontend isPlaying:', frontendEngine.audioState.isPlaying);
    console.log('🛑 Backend isPlaying:', backendEngine.audioState.isPlaying);

    let stoppedSuccessfully = false;

    try {
      // Stop frontend
      if (frontendEngine.audioState) {
        console.log('🛑 Stopping frontend engine...');
        frontendEngine.stopBinauralBeat();
        
        // 🔥 FIXED: Properly update frontend state after stopping
        if (frontendEngine.setAudioState) {
          frontendEngine.setAudioState((prev: any) => ({
            ...prev,
            isPlaying: false
          }));
        }
        console.log('✅ Frontend engine stopped and state updated');
        stoppedSuccessfully = true;
      } else {
        console.log('⏭️ Frontend engine not playing, skipping');
      }

      // Stop backend
      if (backendEngine.audioState) {
        console.log('🛑 Stopping backend engine...');
        await backendEngine.stopBinauralBeat();
        backendEngine.audioState.isPlaying = false;
        console.log('✅ Backend engine stopped');
        stoppedSuccessfully = true;
      } else {
        console.log('⏭️ Backend engine not playing, skipping');
      }
      
      if (!stoppedSuccessfully) {
        console.warn('⚠️ No engines were playing, nothing to stop');
      } else {
        console.log('✅ Hybrid Engine: Both engines stopped successfully');
      }
    } catch (error) {
      console.error('❌ Hybrid Engine: Failed to stop audio:', error);
      throw error; // 🔥 IMPORTANT: Throw error so caller knows it failed
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
      const rightFreq =  settings.beat_frequency;
      frontendEngine.updateFrequency(leftFreq, rightFreq);
    }
  }, [frontendEngine, backendEngine]);

  /**
   * Update volume (affects both engines via mixer)
   * 🔥 FIXED: Only update mixer volume - engines are routed through mixer, so no duplicate setting
   */
  const updateVolume = useCallback((volume: number) => {
    const safeVolume = isNaN(volume) ? DEFAULT_VOLUME : Math.max(0, Math.min(2, volume));

    console.log('🎚️ Hybrid Engine: Setting master volume to:', safeVolume);

    // Update mixer master volume - this controls both engines since they're routed through it
    if (mixerRef.current) {
      mixerRef.current.setMasterVolume(safeVolume);
      console.log('✅ Hybrid Engine: Mixer master volume updated (controls both engines)');
    } else {
      console.warn('⚠️ Hybrid Engine: Mixer not initialized, volume update skipped');
    }

    // 🔥 REMOVED: Individual engine volume updates - caused duplicate volume setting
    // Both engines are routed through mixer, so mixer volume is the single source of truth
    // frontendEngine.updateVolume(safeVolume); // ❌ DUPLICATE
    // backendEngine.updateVolume(safeVolume);  // ❌ DUPLICATE
  }, []);

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
  
  // 🔥 FIXED: Ensure electromagnetic has defaults (no nulls)
  const defaultElectromagnetic = {
    strength: 0,
    frequency: DEFAULT_BEAT_FREQUENCY,
    phase: 0,
    coherence: 0,
    resonance: 0,
    state: 'INACTIVE' as const,
    stability: 0
  };
  
  const electromagnetic = currentEngine === 'backend'
    ? { ...defaultElectromagnetic, ...backendEngine.electromagnetic }
    : { ...defaultElectromagnetic, ...frontendEngine.electromagnetic };

  // 🔥 CRITICAL FIX: Return the CORRECT analyserNode based on what's actually playing
  // - If backend is active, use mixer's analyserNode (has backend audio data)
  // - If frontend is active, use frontend's analyserNode (has frontend audio data)
  // - This ensures FrequencyVisualizer always gets audio data
  const activeAnalyserNode = currentEngine === 'backend' && mixerRef.current
    ? mixerRef.current.analyserNode  // Backend → use mixer analyser
    : frontendEngine.analyserNode;    // Frontend → use frontend analyser

  // 🔥 FIXED: Compute unified audio state showing ACTUAL synchronized values
  // Instead of showing only one engine's state, show the REAL state that's playing
  // 🔥 CRITICAL: Ensure NO NULL VALUES - all fields have defaults
  const baseFreq = frontendEngine.audioState.leftFreq || backendEngine.audioState.config?.base_frequency || DEFAULT_BASE_FREQUENCY;
  const beatFreq = frontendEngine.audioState.beat_frequency || backendEngine.audioState.config?.beat_frequency || DEFAULT_BEAT_FREQUENCY;
  const leftFreq = baseFreq;
  const rightFreq = baseFreq + beatFreq;
  const amplitude = frontendEngine.audioState.amplitude || backendEngine.audioState.config?.amplitude || DEFAULT_VOLUME;
  const waveform = frontendEngine.audioState.waveform || 'sine';
  
  const audioState = {
    isPlaying, // Boolean - never null
    amplitude, // Number - always has default
    leftFreq, // Number - always has default
    rightFreq, // Number - always has default
    beat_frequency: beatFreq, // Number - always has default
    waveform, // String - always has default
    config: {
      base_frequency: baseFreq, // Number - always has default
      beat_frequency: beatFreq, // Number - always has default
      amplitude, // Number - always has default
      waveform // String - always has default
    },
    // 🔥 NEW: Add context and nodes for compatibility
    context: frontendEngine.audioContext || null,
    gainL: frontendEngine.audioState.gainL || null,
    gainR: frontendEngine.audioState.gainR || null,
    oscillatorL: frontendEngine.audioState.oscillatorL || null,
    oscillatorR: frontendEngine.audioState.oscillatorR || null
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