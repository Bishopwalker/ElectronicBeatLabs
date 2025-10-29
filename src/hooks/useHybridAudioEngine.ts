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

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAudioEngine } from './useAudioEngine';
import { useBackendAudioEngine } from './useBackendAudioEngine';
import { AudioMixer } from '../utils/AudioMixer';
import type { BinauralBeatConfig, PatternConfig } from '../types';
import {
  DEFAULT_VOLUME,
  DEFAULT_BEAT_FREQUENCY,
  DEFAULT_BASE_FREQUENCY
} from '../constants/audio.constants';
import { debugLog, debugDecision, debugBreakpoint } from '../utils/audioDebugger';
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

  // 🔥 FIX: Track initialization attempts to prevent React StrictMode double-mounting issues
  const initAttemptedRef = useRef(false);

  /**
   * Initialize audio mixer and connect both engines
   */
  const initializeMixer = useCallback(async () => {
    if (mixerRef.current || !frontendEngine.audioContext) {
      return;
    }

    try {
      // Ensure frontend audio context is ready
      if (!frontendEngine.audioContext) {
        await frontendEngine.initializeAudio();
      }

      if (frontendEngine.audioContext) {
        // Create mixer
        mixerRef.current = new AudioMixer(frontendEngine.audioContext);

        // 🔥 CRITICAL FIX: Save current playing state and config BEFORE setting external nodes
        const wasPlaying = frontendEngine.audioState.isPlaying;
        const currentConfig = wasPlaying ? {
          base_frequency: frontendEngine.audioState.leftFreq || DEFAULT_BASE_FREQUENCY,
          beat_frequency: frontendEngine.audioState.beat_frequency || DEFAULT_BEAT_FREQUENCY,
          volume: frontendEngine.audioState.volume || DEFAULT_VOLUME,
          waveform: frontendEngine.audioState.waveform || 'sine'
        } : null;

        // 🔥 CRITICAL FIX: STOP audio before changing nodes to avoid disconnection issues
        if (wasPlaying) {
          frontendEngine.stopBinauralBeat();
          // Wait for audio to fully stop
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Connect BOTH engines to mixer
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

        // 🔥 CRITICAL FIX: RESTART audio if it was playing, now routing through mixer
        if (wasPlaying && currentConfig) {
          await frontendEngine.startBinauralBeat(currentConfig);
        }

        setIsInitialized(true);
      }
    } catch (error) {
    }
  }, [frontendEngine, backendEngine]);

  /**
   * Initialize mixer when frontend context becomes available
   * 🔥 FIXED: Use stable dependencies to prevent duplicate mixer creation
   */
  useEffect(() => {
    if (frontendEngine.audioContext && !mixerRef.current) {
      initializeMixer();
    }
    // Only re-run when audioContext actually changes (null -> object)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!frontendEngine.audioContext]);

  /**
   * Monitor backend connection and auto-crossfade
   * 🔥 CRITICAL FIX: Crossfade if audio playing OR backend has active session
   */
  useEffect(() => {
    const backendNowConnected = backendEngine.backendConnected && backendEngine.sessionId?true:false;
    const backendWasConnected = previousBackendConnected.current;
    const isAudioPlaying = frontendEngine.audioState.isPlaying || backendEngine.audioState.isPlaying;
    const hasActiveSession = !!backendEngine.sessionId; // Backend has session = will play soon

    // Backend just connected - crossfade if audio playing OR has active session
    if (backendNowConnected && !backendWasConnected && mixerRef.current) {
      if (isAudioPlaying || hasActiveSession) {
        mixerRef.current.crossfadeToBackend(2.0);
        setCurrentEngine('backend');
      } else {
      }
    }

    // Backend just disconnected - instant failover ONLY IF AUDIO IS PLAYING
    if (!backendNowConnected && backendWasConnected && mixerRef.current) {
      if (isAudioPlaying) {
        mixerRef.current.failoverToFrontend();
        setCurrentEngine('frontend');
      } else {
      }
    }

    previousBackendConnected.current = backendNowConnected;
  }, [backendEngine.backendConnected, backendEngine.sessionId, frontendEngine.audioState.isPlaying, backendEngine.audioState.isPlaying]);

  /**
   * Start binaural beat with hybrid approach
   * 1. Frontend starts immediately (instant audio)
   * 2. Backend connects in background
   * 3. Auto-crossfade to backend when ready
   */
  const startBinauralBeat = useCallback(async (config: BinauralBeatConfig) => {
    // 🔍 DEBUG LOGGING: Track start parameters
    debugLog('HYBRID_START', 'Starting binaural beat', {
      base_frequency: config.base_frequency,
      beat_frequency: config.beat_frequency,
      volume: config.volume ?? DEFAULT_VOLUME,
      waveform: config.waveform
    });

    // 🔍 BREAKPOINT: Set conditional breakpoint for debugging
    debugBreakpoint(!mixerRef.current, 'Mixer not initialized at start', { config });

    // Initialize mixer if not ready
    debugDecision('Mixer initialization check', !mixerRef.current, 'Initialize mixer');
    if (!mixerRef.current) {
      await initializeMixer();
    }

    try {
      // STEP 1: Start frontend immediately (instant audio)
      debugLog('HYBRID_START', 'Starting FRONTEND engine (instant audio)');
      await frontendEngine.startBinauralBeat(config);
      
      // 🔥 FIXED: Properly update frontend engine state
      if (frontendEngine.setAudioState) {
        frontendEngine.setAudioState((prev: any) => ({
          ...prev,
          isPlaying: true
        }));
      }
      
      setCurrentEngine('frontend');

      // STEP 2: Connect backend in background with proper sequencing

      // 🔥 CRITICAL FIX: Properly sequence backend connection and session start
      // This prevents race condition where session starts before WebSocket is connected
      if (!backendEngine.backendConnected) {
        // Connect backend first, THEN start session (proper chaining)
        backendEngine.connectBackend()
          .then(async () => {
            // Only start session after connection succeeds
            return backendEngine.startBackendSession(config);
          })
          .then(() => {
            if (backendEngine.audioState) {
              backendEngine.audioState.isPlaying = true;
            }
          })
          .catch(err => {
          });
      } else {
        // Already connected, just start session
        backendEngine.startBackendSession(config)
          .then(() => {
            if (backendEngine.audioState) {
              backendEngine.audioState.isPlaying = true;
            }
          })
          .catch(err => {
          });
      }

    } catch (error) {
      throw error;
    }
  }, [frontendEngine.audioState, backendEngine, initializeMixer]);

  /**
   * Stop binaural beat (stops both engines)
   */
  const stopBinauralBeat = useCallback(async () => {

    let stoppedSuccessfully = false;

    try {
      // Stop frontend
      if (frontendEngine.audioState) {
        frontendEngine.stopBinauralBeat();
        
        // 🔥 FIXED: Properly update frontend state after stopping
        if (frontendEngine.setAudioState) {
          frontendEngine.setAudioState((prev: any) => ({
            ...prev,
            isPlaying: false
          }));
        }
        stoppedSuccessfully = true;
      } else {
      }

      // Stop backend
      if (backendEngine.audioState) {
        await backendEngine.stopBinauralBeat();
        backendEngine.audioState.isPlaying = false;
        stoppedSuccessfully = true;
      } else {
      }
      
      if (!stoppedSuccessfully) {
      } else {
      }
    } catch (error) {
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
    const safeVolume = DEFAULT_VOLUME || Math.max(0, Math.min(2, volume));

    // 🔍 DEBUG LOGGING: Track volume updates (Phase 1)

    // Update mixer master volume - this controls both engines since they're routed through it
    if (mixerRef.current) {
      mixerRef.current.setMasterVolume(safeVolume);
    } else {
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
    }
  }, [backendEngine]);

  /**
   * Load pattern (hybrid approach)
   */
  const loadPattern = useCallback(async (pattern: PatternConfig) => {
    const config: BinauralBeatConfig = {
      base_frequency: pattern.frequencies.carrier,
      beat_frequency: pattern.frequencies.beat,
      waveform: 'sine', // PatternConfig doesn't have waveform property, default to sine
      volume: DEFAULT_VOLUME
    };
    const appstate:AppState ={

    }

    await startBinauralBeat(config);
  }, [startBinauralBeat]);

  /**
   * Generate test tones
   */
  const generateTestTones = useCallback((leftFreq: number, rightFreq: number, duration: number = 5000) => {
    const config: BinauralBeatConfig = {
      base_frequency: leftFreq,
      beat_frequency: Math.abs(rightFreq - leftFreq),
      volume: DEFAULT_VOLUME,
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

        // Initialize mixer now that context is ready
        if (!mixerRef.current) {
          await initializeMixer();
        }

        return context;
      }
    } catch (error) {
      throw error;
    }
  }, [frontendEngine, initializeMixer]);

  /**
   * Proactively initialize audio context on mount (like SettingsTab does)
   * 🔥 FIXED: Prevent duplicate AudioContext creation by using stable dependencies
   */
  useEffect(() => {
    const autoInitialize = async () => {
      // 🔥 FIX: Skip if already attempted during this mount cycle (React StrictMode safeguard)
      if (initAttemptedRef.current) {
        return;
      }

      // 🔥 CRITICAL FIX: Only run on initial mount when context is null
      // This prevents duplicate context creation when frontendEngine object changes
      if (!frontendEngine.audioContext) {
        initAttemptedRef.current = true; // Mark as attempted
        try {
          // Create a simple user interaction to trigger audio context
          // This ensures analyser node exists for visualizers
          const context = await frontendEngine.initializeAudio();
          if (context) {
            // Mixer will be initialized by the other useEffect when context is ready
          }
        } catch (error) {
          // Reset flag on error so user can retry
          initAttemptedRef.current = false;
        }
      } else if (frontendEngine.audioContext && !mixerRef.current) {
        // Context exists but mixer doesn't - initialize mixer
        await initializeMixer();
      }
    };

    autoInitialize();
    // 🔥 ONLY run when audioContext presence changes (null -> object or object -> null)
    // Using !! converts to boolean for stable comparison
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!frontendEngine.audioContext]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (mixerRef.current) {
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

  // 🔥 PERFORMANCE FIX: Memoize audioState to prevent wasteful recalculation on every render
  // Only recalculates when dependencies actually change
  const audioState = useMemo(() => {
    const baseFreq = frontendEngine.audioState.leftFreq || backendEngine.audioState.config?.base_frequency || DEFAULT_BASE_FREQUENCY;
    const beatFreq = frontendEngine.audioState.beat_frequency || backendEngine.audioState.config?.beat_frequency || DEFAULT_BEAT_FREQUENCY;
    const leftFreq = baseFreq;
    const rightFreq = baseFreq + beatFreq;
    const volume = frontendEngine.audioState.volume || backendEngine.audioState.config?.volume || DEFAULT_VOLUME;
    const waveform = frontendEngine.audioState.waveform || 'sine';
    
    return {
      isPlaying, // Boolean - never null
      volume, // Number - always has default
      leftFreq, // Number - always has default
      rightFreq, // Number - always has default
      beat_frequency: beatFreq, // Number - always has default
      waveform, // String - always has default
      config: {
        base_frequency: baseFreq, // Number - always has default
        beat_frequency: beatFreq, // Number - always has default
        volume, // Number - always has default
        waveform // String - always has default
      },
      // 🔥 NEW: Add context and nodes for compatibility
      context: frontendEngine.audioContext || null,
      gainL: frontendEngine.audioState.gainL || null,
      gainR: frontendEngine.audioState.gainR || null,
      oscillatorL: frontendEngine.audioState.oscillatorL || null,
      oscillatorR: frontendEngine.audioState.oscillatorR || null
    };
  }, [
    // Only recalculate when these dependencies change
    isPlaying,
    frontendEngine.audioState.leftFreq,
    frontendEngine.audioState.beat_frequency,
    frontendEngine.audioState.volume,
    frontendEngine.audioState.waveform,
    frontendEngine.audioContext,
    frontendEngine.audioState.gainL,
    frontendEngine.audioState.gainR,
    frontendEngine.audioState.oscillatorL,
    frontendEngine.audioState.oscillatorR,
    backendEngine.audioState.config?.base_frequency,
    backendEngine.audioState.config?.beat_frequency,
    backendEngine.audioState.config?.volume
  ]);

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
    setEqualizerNodes: frontendEngine.setEqualizerNodes, // 🔥 NEW: Passthrough for equalizer

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

    // 🔥 NEW: AudioWorklet status (for debugging and visibility)
    audioWorkletStatus: backendEngine.audioWorkletStatus,

    // EXPOSED INTERNAL ENGINES (for legacy component compatibility)
    // These are the SAME engines managed internally by hybrid
    frontendEngine,
    backendEngine
  };
};