// useLocalAudio - Master Audio Hook
// Replaces useAudioEngine, useBackendAudioEngine, and all other audio hooks
// Uses LocalAudio as the single source of truth

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocketContext } from './useWebsocketContext';
import { useBackendAPI } from './useBackendAPI';
import type { LocalAudio, createLocalAudio } from '../types/localaudio.types';
import type { AudioConfig, Pattern } from '../types/clean.types';

export interface UseLocalAudioOptions {
  initialConfig?: Partial<AudioConfig>;
  autoConnect?: boolean;
  preferredEngine?: 'frontend' | 'backend' | 'auto';
}

export const useLocalAudio = (options: UseLocalAudioOptions = {}) => {
  const { initialConfig, autoConnect = false, preferredEngine = 'frontend' } = options;

  // Initialize LocalAudio state
  const [audio, setAudio] = useState<LocalAudio>(() => {
    const { createLocalAudio } = require('../types/localaudio.types');
    return createLocalAudio(initialConfig);
  });

  // Backend communication hooks
  const websocket = useWebSocketContext();
  const api = useBackendAPI();

  // Audio context and nodes (shared between engines)
  const audioContext = useRef<AudioContext | null>(null);

  // Frontend engine nodes
  const oscillatorL = useRef<OscillatorNode | null>(null);
  const oscillatorR = useRef<OscillatorNode | null>(null);
  const gainL = useRef<GainNode | null>(null);
  const gainR = useRef<GainNode | null>(null);

  // Backend engine nodes
  const workletNode = useRef<AudioWorkletNode | null>(null);
  const backendGainNode = useRef<GainNode | null>(null);
  const workletLoaded = useRef<boolean>(false);

  // ==========================================
  // CORE ACTIONS - Frontend Engine
  // ==========================================

  const initializeFrontend = useCallback(async (): Promise<AudioContext | null> => {
    try {
      audioContext.current ??= new (window.AudioContext || (window as any).webkitAudioContext)();

      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }

      setAudio(prev => ({
        ...prev,
        engine: {
          ...prev.engine,
          frontend: {
            ...prev.engine.frontend,
            isAvailable: true,
            context: audioContext.current
          }
        }
      }));

      return audioContext.current;
    } catch (error) {
      console.error('Failed to initialize frontend audio:', error);
      return null;
    }
  }, []);

  const startFrontend = useCallback(async (config?: Partial<AudioConfig>) => {
    const ctx = await initializeFrontend();
    if (!ctx) return;

    const finalConfig = { ...audio.config, ...config };
    const baseFreq = finalConfig.baseFrequency;
    const beatFreq = finalConfig.beat_frequency;
    const leftFreq = baseFreq;
    const rightFreq = baseFreq + beatFreq;

    // Create oscillators
    oscillatorL.current = ctx.createOscillator();
    oscillatorR.current = ctx.createOscillator();
    gainL.current = ctx.createGain();
    gainR.current = ctx.createGain();

    oscillatorL.current.type = finalConfig.waveform || 'sine';
    oscillatorR.current.type = finalConfig.waveform || 'sine';
    oscillatorL.current.frequency.value = leftFreq;
    oscillatorR.current.frequency.value = rightFreq;

    gainL.current.gain.value = finalConfig.amplitude;
    gainR.current.gain.value = finalConfig.amplitude;

    // Create stereo merger
    const merger = ctx.createChannelMerger(2);
    oscillatorL.current.connect(gainL.current).connect(merger, 0, 0);
    oscillatorR.current.connect(gainR.current).connect(merger, 0, 1);
    merger.connect(ctx.destination);

    oscillatorL.current.start();
    oscillatorR.current.start();

    const now = Date.now();
    setAudio(prev => ({
      ...prev,
      type: 'frontend',
      config: finalConfig,
      engine: {
        ...prev.engine,
        frontend: {
          ...prev.engine.frontend,
          isActive: true,
          oscillatorL: oscillatorL.current,
          oscillatorR: oscillatorR.current,
          gainL: gainL.current,
          gainR: gainR.current
        }
      },
      playback: {
        ...prev.playback,
        state: 'playing',
        isPlaying: true,
        startTime: now
      },
      timestamps: {
        ...prev.timestamps,
        lastModified: now,
        lastPlayed: now
      }
    }));
  }, [audio.config, initializeFrontend]);

  const stopFrontend = useCallback(() => {
    if (oscillatorL.current) oscillatorL.current.stop();
    if (oscillatorR.current) oscillatorR.current.stop();

    oscillatorL.current = null;
    oscillatorR.current = null;
    gainL.current = null;
    gainR.current = null;

    const now = Date.now();
    setAudio(prev => ({
      ...prev,
      engine: {
        ...prev.engine,
        frontend: {
          ...prev.engine.frontend,
          isActive: false,
          oscillatorL: null,
          oscillatorR: null,
          gainL: null,
          gainR: null
        }
      },
      playback: {
        ...prev.playback,
        state: 'stopped',
        isPlaying: false
      },
      timestamps: {
        ...prev.timestamps,
        lastModified: now,
        lastStopped: now
      }
    }));
  }, []);

  // ==========================================
  // CORE ACTIONS - Backend Engine
  // ==========================================

  const initializeBackendAudioWorklet = useCallback(async (): Promise<boolean> => {
    try {
      // Initialize audio context if needed
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }

      // Load AudioWorklet processor if not already loaded
      if (!workletLoaded.current) {
        try {
          await audioContext.current.audioWorklet.addModule(`/backend-audio-processor.js?v=${Date.now()}`);
          workletLoaded.current = true;
          console.log('✅ LocalAudio: AudioWorklet processor loaded');
        } catch (error) {
          console.error('❌ LocalAudio: Failed to load AudioWorklet:', error);
          return false;
        }
      }

      // Create gain node for backend
      if (!backendGainNode.current) {
        backendGainNode.current = audioContext.current.createGain();
        backendGainNode.current.gain.value = audio.config.amplitude;
        backendGainNode.current.connect(audioContext.current.destination);
      }

      // Create AudioWorklet node
      if (!workletNode.current) {
        workletNode.current = new AudioWorkletNode(
          audioContext.current,
          'backend-audio-processor',
          {
            numberOfInputs: 0,
            numberOfOutputs: 1,
            outputChannelCount: [2],
            processorOptions: {
              amplitude: audio.config.amplitude
            }
          }
        );

        // Connect to gain node
        workletNode.current.connect(backendGainNode.current);
        console.log('✅ LocalAudio: AudioWorklet connected to backend pipeline');
      }

      return true;
    } catch (error) {
      console.error('❌ LocalAudio: Failed to initialize AudioWorklet:', error);
      return false;
    }
  }, [audio.config.amplitude]);

  const connectBackend = useCallback(async () => {
    try {
      const healthResponse = await api.healthCheck();
      if (healthResponse.status !== 200) {
        throw new Error('Backend health check failed');
      }

      if (!websocket.isConnected) {
        websocket.connect(audio.config.baseFrequency, audio.config.beat_frequency);
      }

      setAudio(prev => ({
        ...prev,
        engine: {
          ...prev.engine,
          backend: {
            ...prev.engine.backend,
            isAvailable: true,
            isConnected: websocket.isConnected,
            websocketState: 'connected'
          }
        }
      }));
    } catch (error: any) {
      setAudio(prev => ({
        ...prev,
        engine: {
          ...prev.engine,
          backend: {
            ...prev.engine.backend,
            lastError: error.message,
            websocketState: 'error'
          }
        },
        errors: {
          ...prev.errors,
          current: error
        }
      }));
    }
  }, [api, websocket, audio.config]);

  const startBackend = useCallback(async (config?: Partial<AudioConfig>) => {
    try {
      // Connect to backend if not connected
      if (!audio.engine.backend.isConnected) {
        await connectBackend();
      }

      // Initialize AudioWorklet for audio playback
      const audioReady = await initializeBackendAudioWorklet();
      if (!audioReady) {
        throw new Error('Failed to initialize audio pipeline');
      }

      const finalConfig = { ...audio.config, ...config };

      // Send start stream message to backend
      websocket.sendMessage({
        type: 'start_stream',
        data: {
          base_frequency: finalConfig.baseFrequency,
          beat_frequency: finalConfig.beat_frequency,
          amplitude: finalConfig.amplitude,
          spatial_enabled: audio.spatial.enabled,
          spatial_settings: audio.spatial,
          use_binary: true // Request binary WebSocket frames
        }
      });

      // Unmute gain node
      if (backendGainNode.current) {
        backendGainNode.current.gain.setValueAtTime(
          finalConfig.amplitude,
          audioContext.current!.currentTime
        );
      }

      // Send start command to AudioWorklet
      if (workletNode.current) {
        workletNode.current.port.postMessage({ type: 'start' });
      }

      const now = Date.now();
      setAudio(prev => ({
        ...prev,
        type: 'backend',
        config: finalConfig,
        engine: {
          ...prev.engine,
          backend: {
            ...prev.engine.backend,
            isActive: true,
            sessionId: websocket.sessionId
          }
        },
        playback: {
          ...prev.playback,
          state: 'playing',
          isPlaying: true,
          startTime: now
        },
        timestamps: {
          ...prev.timestamps,
          lastModified: now,
          lastPlayed: now
        }
      }));
    } catch (error) {
      console.error('❌ LocalAudio: Failed to start backend, falling back to frontend:', error);
      // Fallback to frontend
      await startFrontend(config);
    }
  }, [audio, connectBackend, initializeBackendAudioWorklet, websocket, startFrontend]);

  const stopBackend = useCallback(() => {
    // Send stop messages to backend
    websocket.sendMessage({
      type: 'stop_stream'
    });

    // Stop AudioWorklet processor
    if (workletNode.current) {
      workletNode.current.port.postMessage({ type: 'stop' });
      workletNode.current.port.postMessage({ type: 'clearBuffer' });
    }

    // Mute gain node
    if (backendGainNode.current && audioContext.current) {
      backendGainNode.current.gain.setValueAtTime(0, audioContext.current.currentTime);
    }

    const now = Date.now();
    setAudio(prev => ({
      ...prev,
      engine: {
        ...prev.engine,
        backend: {
          ...prev.engine.backend,
          isActive: false
        }
      },
      playback: {
        ...prev.playback,
        state: 'stopped',
        isPlaying: false
      },
      timestamps: {
        ...prev.timestamps,
        lastModified: now,
        lastStopped: now
      }
    }));
  }, [websocket]);

  // ==========================================
  // UNIFIED ACTIONS - Work with either engine
  // ==========================================

  const start = useCallback(async (config?: Partial<AudioConfig>) => {
    // Backend-first strategy with frontend fallback
    if (preferredEngine === 'backend' || preferredEngine === 'auto') {
      try {
        await startBackend(config);
      } catch (error) {
        console.warn('⚠️ LocalAudio: Backend failed, falling back to frontend:', error);
        await startFrontend(config);
      }
    } else {
      // Frontend explicitly requested
      await startFrontend(config);
    }
  }, [preferredEngine, startBackend, startFrontend]);

  const stop = useCallback(() => {
    if (audio.engine.frontend.isActive) {
      stopFrontend();
    }
    if (audio.engine.backend.isActive) {
      stopBackend();
    }
  }, [audio.engine, stopFrontend, stopBackend]);

  const updateFrequency = useCallback((base: number, beat: number) => {
    setAudio(prev => ({
      ...prev,
      config: {
        ...prev.config,
        baseFrequency: base,
        beat_frequency: beat
      },
      timestamps: {
        ...prev.timestamps,
        lastModified: Date.now()
      }
    }));

    // Update active engine
    if (audio.engine.frontend.isActive && oscillatorL.current && oscillatorR.current) {
      oscillatorL.current.frequency.value = base;
      oscillatorR.current.frequency.value = base + beat;
    } else if (audio.engine.backend.isActive) {
      websocket.sendMessage({
        type: 'update_settings',
        data: {
          settings: {
            base_frequency: base,
            beat_frequency: beat
          }
        }
      });
    }
  }, [audio.engine, websocket]);

  const updateVolume = useCallback((volume: number) => {
    const safeVolume = Math.max(0, Math.min(2, volume));

    setAudio(prev => ({
      ...prev,
      config: {
        ...prev.config,
        amplitude: safeVolume
      },
      timestamps: {
        ...prev.timestamps,
        lastModified: Date.now()
      }
    }));

    // Update active engine
    if (audio.engine.frontend.isActive && gainL.current && gainR.current) {
      gainL.current.gain.value = safeVolume;
      gainR.current.gain.value = safeVolume;
    } else if (audio.engine.backend.isActive) {
      // Update backend via WebSocket
      websocket.sendMessage({
        type: 'update_settings',
        data: {
          settings: {
            amplitude: safeVolume
          }
        }
      });

      // Also update local gain node
      if (backendGainNode.current && audioContext.current) {
        backendGainNode.current.gain.setValueAtTime(
          safeVolume,
          audioContext.current.currentTime
        );
      }
    }
  }, [audio.engine, websocket]);

  const updateWaveform = useCallback((waveform: AudioConfig['waveform']) => {
    setAudio(prev => ({
      ...prev,
      config: {
        ...prev.config,
        waveform
      },
      timestamps: {
        ...prev.timestamps,
        lastModified: Date.now()
      }
    }));

    // Frontend engine only (backend generates sine waves)
    if (audio.engine.frontend.isActive && oscillatorL.current && oscillatorR.current) {
      oscillatorL.current.type = waveform;
      oscillatorR.current.type = waveform;
    }
  }, [audio.engine]);

  const loadPattern = useCallback(async (pattern: Pattern) => {
    setAudio(prev => ({
      ...prev,
      pattern: {
        ...prev.pattern,
        current: pattern,
        history: [...prev.pattern.history, pattern]
      }
    }));

    await start({
      baseFrequency: pattern.frequencies.carrier,
      beat_frequency: pattern.frequencies.beat
    });
  }, [start]);

  const switchEngine = useCallback(async (engine: 'frontend' | 'backend') => {
    const wasPlaying = audio.playback.isPlaying;
    const currentConfig = audio.config;

    // Stop current engine
    stop();

    // Start new engine
    if (engine === 'backend') {
      if (wasPlaying) {
        await startBackend(currentConfig);
      }
      setAudio(prev => ({ ...prev, type: 'backend' }));
    } else {
      if (wasPlaying) {
        await startFrontend(currentConfig);
      }
      setAudio(prev => ({ ...prev, type: 'frontend' }));
    }
  }, [audio, stop, startBackend, startFrontend]);

  // ==========================================
  // WEBSOCKET FRAME HANDLER - Binary Audio Frames
  // ==========================================

  useEffect(() => {
    // Register frame handler for binary audio from backend
    websocket.registerFrameHandler((message: any) => {
      if (message.type === 'frame' || message.type === 'audio_frame') {
        const audioData = message.data;

        // Handle binary frames (ArrayBuffer)
        if (audioData instanceof ArrayBuffer && workletNode.current) {
          workletNode.current.port.postMessage({
            type: 'audioFrame',
            data: audioData
          });
        }
        // Handle legacy JSON frames
        else if (audioData && typeof audioData === 'object' && 'left' in audioData && workletNode.current) {
          workletNode.current.port.postMessage({
            type: 'audioFrame',
            data: {
              left: audioData.left,
              right: audioData.right,
              sample_rate: audioData.sample_rate,
              frame_size: audioData.frame_size
            }
          });
        }
      }
    });
  }, [websocket]);

  // ==========================================
  // ELECTROMAGNETIC FIELD UPDATES
  // ==========================================

  useEffect(() => {
    if (!audio.playback.isPlaying) return;

    const updateElectromagnetic = () => {
      setAudio(prev => ({
        ...prev,
        visualization: {
          ...prev.visualization,
          electromagnetic: {
            strength: Math.min(1, prev.config.amplitude * 0.8),
            frequency: prev.config.baseFrequency,
            phase: (Date.now() * prev.config.beat_frequency * 0.36) % 360,
            coherence: prev.engine.backend.isActive ? 0.9 : 0.75,
            resonance: Math.min(1, prev.config.beat_frequency / 10),
            state: prev.config.amplitude > 0.7 ? 'RESONANT' :
                   prev.config.amplitude > 0.4 ? 'ACTIVE' : 'CHARGING',
            stability: prev.engine.backend.isActive ? 0.95 : 0.8
          }
        }
      }));
    };

    const interval = setInterval(updateElectromagnetic, 1000 / 60); // 60 FPS
    return () => clearInterval(interval);
  }, [audio.playback.isPlaying, audio.config, audio.engine.backend.isActive]);

  // ==========================================
  // AUTO-CONNECT ON MOUNT
  // ==========================================

  useEffect(() => {
    if (autoConnect && preferredEngine === 'backend') {
      connectBackend();
    }
  }, [autoConnect, preferredEngine, connectBackend]);

  // ==========================================
  // POPULATE ACTIONS IN STATE
  // ==========================================

  // FIXED: Removed 'audio' from dependencies to prevent infinite loop
  useEffect(() => {
    setAudio(prev => ({
      ...prev,
      actions: {
        start,
        stop,
        pause: () => {
          // Pause implementation
          setAudio(prev => ({
            ...prev,
            playback: {
              ...prev.playback,
              state: 'paused',
              isPaused: true,
              pauseTime: Date.now()
            }
          }));
        },
        resume: () => {
          // Resume implementation
          setAudio(prev => ({
            ...prev,
            playback: {
              ...prev.playback,
              state: 'playing',
              isPaused: false,
              pauseTime: null
            }
          }));
        },
        restart: async () => {
          stop();
          await start();
        },
        updateFrequency,
        updateVolume,
        updateWaveform,
        updateSpatial: (spatial) => {
          setAudio(prev => ({ ...prev, spatial: { ...prev.spatial, ...spatial } }));
        },
        loadPattern,
        queuePattern: (pattern) => {
          setAudio(prev => ({
            ...prev,
            pattern: {
              ...prev.pattern,
              queue: [...prev.pattern.queue, pattern]
            }
          }));
        },
        clearQueue: () => {
          setAudio(prev => ({
            ...prev,
            pattern: {
              ...prev.pattern,
              queue: []
            }
          }));
        },
        switchEngine,
        connectBackend,
        disconnectBackend: () => {
          websocket.disconnect();
          setAudio(prev => ({
            ...prev,
            engine: {
              ...prev.engine,
              backend: {
                ...prev.engine.backend,
                isConnected: false,
                websocketState: 'disconnected'
              }
            }
          }));
        },
        reset: () => {
          stop();
          const { createLocalAudio } = require('../types/localaudio.types');
          setAudio(createLocalAudio(initialConfig));
        },
        exportState: () => JSON.stringify(prev),
        importState: (state: string) => {
          try {
            setAudio(JSON.parse(state));
          } catch (error) {
            console.error('Failed to import state:', error);
          }
        }
      }
    }));
  }, [start, stop, updateFrequency, updateVolume, updateWaveform, loadPattern, switchEngine, connectBackend, websocket, initialConfig]);

  return {
    // Main state
    audio,
    setAudio,

    // Quick access helpers (backward compatibility)
    isPlaying: audio.playback.isPlaying,
    config: audio.config,
    electromagnetic: audio.visualization.electromagnetic,

    // Engine info
    isFrontend: audio.type === 'frontend',
    isBackend: audio.type === 'backend',
    backendConnected: audio.engine.backend.isConnected,
    sessionId: audio.engine.backend.sessionId,

    // Core actions
    start,
    stop,
    updateFrequency,
    updateVolume,
    updateWaveform,
    loadPattern,
    switchEngine,
    connectBackend,

    // Compatibility with old AudioEngine interface
    audioState: {
      isPlaying: audio.playback.isPlaying,
      baseFrequency: audio.config.baseFrequency,
      beat_frequency: audio.config.beat_frequency,
      amplitude: audio.config.amplitude,
      waveform: audio.config.waveform
    },

    isSupported: !!(window.AudioContext || (window as any).webkitAudioContext)
  };
};

export default useLocalAudio;
