// Backend-Integrated Audio Engine Hook - FIXED VERSION
// Combines local Web Audio API with backend-generated binaural beats and spatial effects

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocketContext } from './useWebsocketContext';
import { useBackendAPI } from './useBackendAPI';
import type {
  AudioEngineState,
  ElectromagneticField,
  PatternConfig,
  BinauralBeatConfig
} from '../types';

interface BackendAudioFrame {
  left: number[];
  right: number[];
  sample_rate: number;
  frame_size: number;
  frequencies: {
    left: number;
    right: number;
    beat: number;
  };
  spatial?: {
    movement_speed: number;
    spatial_intensity: number;
    pan_phase: number;
    effect_type: string;
  };
}

interface BackendFieldFrame {
  field: number[][];
  grid_size: [number, number];
  pattern: string;
  metrics: {
    mean: number;
    std: number;
    max: number;
    min: number;
    energy: number;
  };
  time: number;
}

interface BackendSessionConfig {
  base_frequency: number;
  beat_frequency: number;
  amplitude: number;
  spatial_enabled: boolean;
  spatial_settings: Record<string, unknown>;
}

export const useBackendAudioEngine = () => {
  const [audioState, setAudioState] = useState<AudioEngineState>({
    isPlaying: false,
    amplitude: 0.3,
    leftFreq: 440,
    rightFreq: 444,
    beatFreq: 4,
    waveform: 'sine',
    gainL: null,
    gainR: null,
    oscillatorL: null,
    oscillatorR: null,
    context: null
  });

  const [electromagnetic, setElectromagnetic] = useState<ElectromagneticField>({
    strength: 0,
    frequency: 0,
    phase: 0,
    coherence: 0,
    resonance: 0,
    state: 'INACTIVE',
    stability: 0
  });

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [waitingForConnection, setWaitingForConnection] = useState(false);
  const [startingSession, setStartingSession] = useState(false);
  const connectionPromiseRef = useRef<((value: boolean) => void) | null>(null);

  const audioContext = useRef<AudioContext | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const audioWorkletNode = useRef<AudioWorkletNode | null>(null);
  const workletLoaded = useRef<boolean>(false);

  // Backend communication hooks - FIXED IMPORT
  const websocket = useWebSocketContext();
  const api = useBackendAPI();
// When creating AudioContext


   // Initialize audio context
  const initializeAudio = useCallback(async (): Promise<AudioContext | null> => {
    try {

      audioContext.current ??= new (window.AudioContext || (window as any).webkitAudioContext)();

       if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }

      setElectromagnetic((prev) => ({
        ...prev,
        state: 'ACTIVE'
      }));

      return audioContext.current;

    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return null;
    }
  }, []);

  // Initialize AudioWorklet audio pipeline
  const initializePersistentAudio = useCallback(async () => {
    if (!audioContext.current) return;

    try {
      // Load AudioWorklet processor if not already loaded
      if (!workletLoaded.current) {
        try {
          await audioContext.current.audioWorklet.addModule('/backend-audio-processor.js');
          workletLoaded.current = true;
          console.log('✅ Backend Engine: AudioWorklet processor loaded successfully');
        } catch (error) {
          console.error('❌ Backend Engine: Failed to load AudioWorklet processor:', error);
          return;
        }
      }

      // Create persistent gain node
      if (!gainNode.current) {
        gainNode.current = audioContext.current.createGain();
        gainNode.current.gain.value = audioState.amplitude;
        gainNode.current.connect(audioContext.current.destination);
      }

      // Create AudioWorkletNode for real-time audio processing
      if (!audioWorkletNode.current) {

        audioWorkletNode.current = new AudioWorkletNode(
            audioContext.current,
            'backend-audio-processor',
            {
              numberOfInputs: 0,
              numberOfOutputs: 1,
              outputChannelCount: [2], // Stereo output
              processorOptions: {
                amplitude: audioState.amplitude
              }
            }
        );

        // Handle messages from AudioWorklet
        audioWorkletNode.current.port.onmessage = (event) => {
          const message = event.data;
          switch (message.type) {
            case 'frameProcessed':
              console.log('🎵 Backend Engine: Frame processed -', message.data.frameSize, 'samples');
              break;
            case 'bufferExhausted':
              console.log('🔄 Backend Engine: Audio buffer exhausted, need new frame');
              break;
            case 'processingError':
              console.error('❌ Backend Engine: AudioWorklet processing error:', message.error);
              break;
          }
        };

        // Connect AudioWorklet to gain node
        audioWorkletNode.current.connect(gainNode.current);
        console.log('✅ Backend Engine: AudioWorklet node created and connected');
      }
    } catch (error) {
      console.error('❌ Backend Engine: Failed to initialize AudioWorklet audio:', error);
    }
  }, [audioState.amplitude]);

  // Process backend audio frame (send to AudioWorklet)
  const processAudioFrame = useCallback((frame: BackendAudioFrame) => {
    // console.log('🎧 Backend Engine: Processing audio frame with', frame.frame_size, 'samples',
    //     'Left:', frame.frequencies.left, 'Hz Right:', frame.frequencies.right, 'Hz Beat:', frame.frequencies.beat, 'Hz');

    if (!audioContext.current) {
      console.error('❌ Backend Engine: No audio context available for frame processing');
      return;
    }

    if (!audioWorkletNode.current) {
      console.error('❌ Backend Engine: No AudioWorklet node available for frame processing');
      return;
    }

    try {
      // Send audio frame directly to AudioWorklet processor
      audioWorkletNode.current.port.postMessage({
        type: 'audioFrame',
        data: {
          left: frame.left,
          right: frame.right,
          sample_rate: frame.sample_rate,
          frame_size: frame.frame_size
        }
      });

      // Update volume parameter on AudioWorklet
      const volumeParam = audioWorkletNode.current.parameters.get('volume');
      if (volumeParam) {
        volumeParam.setValueAtTime(
            audioState.amplitude,
            audioContext.current.currentTime
        );
      }

      console.log('🔊 Backend Engine: Audio frame sent to AudioWorklet, amplitude:', audioState.amplitude);

      // Update frequency state
      setAudioState(prev => ({
        ...prev,
        leftFreq: frame.frequencies.left,
        rightFreq: frame.frequencies.right,
        beatFreq: frame.frequencies.beat
      }));

    } catch (error) {
      console.error('❌ Backend Engine: Failed to process audio frame:', error);
    }
  }, [audioState.amplitude]);

  // Process backend field frame
  const processFieldFrame = useCallback((frame: BackendFieldFrame) => {
    // Convert field data to electromagnetic state
    const fieldStrength = (frame.metrics.max - frame.metrics.min) / 2;
    const fieldEnergy = frame.metrics.energy;

    setElectromagnetic({
      strength: Math.min(1, fieldStrength),
      frequency: frame.metrics.mean,
      phase: (frame.time * 360) % 360,
      coherence: 1 - frame.metrics.std,
      resonance: Math.min(1, fieldEnergy / 100),
      state: fieldStrength > 0.8 ? 'CRITICAL' :
          fieldStrength > 0.6 ? 'RESONANT' :
              fieldStrength > 0.4 ? 'ACTIVE' :
                  fieldStrength > 0.2 ? 'CHARGING' : 'INACTIVE',
      stability: 1 - Math.abs(frame.metrics.std)
    });
  }, []);

  // Watch for WebSocket connection state changes
  useEffect(() => {
    if (waitingForConnection && websocket.isConnected && connectionPromiseRef.current) {
      console.log('🎉 Backend Engine: WebSocket connected! Resolving promise...');
      connectionPromiseRef.current(true);
      connectionPromiseRef.current = null;
      setWaitingForConnection(false);
    }
  }, [websocket.isConnected, waitingForConnection]);

  // Handle WebSocket messages
  useEffect(() => {
    const handleMessage = async () => {
      if (websocket.lastMessage && sessionId) { // Only process if we have active session
        const message = websocket.lastMessage;
        console.log('📨 Backend Engine: Received WebSocket message type:', message.type);
        console.log('🔍 Backend Engine: Full message object:', JSON.stringify(message, null, 2));

        switch (message.type) {
          case 'frame':
          case 'audio_frame': {
            console.log('🎵 Backend Engine: Processing audio frame - UPDATED');
            // Handle both 'frame' (from main.py) and 'audio_frame' formats
            // Frame structure from backend main.py is: { type: 'frame', data: { audio: {...}, field: {...} } }
            const audioData = message.type === 'frame' ? message.data?.audio : message.data;
            const fieldData = message.type === 'frame' ? message.data?.field : message.data?.field;

            // Check for session errors
            if (audioData && typeof audioData === 'object' && audioData.error) {
              console.error('❌ Backend Engine: Session error from backend:', audioData.error);
              if (audioData.error === 'Session not found') {
                console.log('🔄 Backend Engine: Session lost, forcing cleanup and stop...');

                // Clean up audio nodes first
                if (audioWorkletNode.current) {
                  audioWorkletNode.current.port.postMessage({ type: 'clearBuffer' });
                  audioWorkletNode.current.disconnect();
                  audioWorkletNode.current = null;
                }

                // Stop audio playback
                setAudioState(prev => ({
                  ...prev,
                  isPlaying: false
                }));

                // Clear session state
                setSessionId(null);
                setBackendConnected(false);

                // Disconnect WebSocket
                setTimeout(() => {
                  websocket.disconnect();
                }, 100);

                console.log('🛑 Backend Engine: Session cleanup complete');
              }
              return;
            }

            if (audioData && typeof audioData === 'object' && 'left' in audioData && 'right' in audioData) {
              processAudioFrame(audioData as BackendAudioFrame);
            } else {
              console.warn('⚠️ Backend Engine: Audio data not available');
            }

            if (fieldData && typeof fieldData === 'object' && 'field' in fieldData && 'grid_size' in fieldData) {
              processFieldFrame(fieldData as BackendFieldFrame);
            }
            break;
          }

          case 'session_started': {
            // Initialize audio context first
            const context = await initializeAudio();
            if (!context) {
              throw new Error('Failed to initialize audio context');
            }

            // Initialize AudioWorklet pipeline
            await initializePersistentAudio();
            console.log('✅ Backend Engine: Session started message received');
            setBackendConnected(true);
            break;
          }

          case 'session_stopped':
            console.log('🛑 Backend Engine: Session stopped message received');
            setBackendConnected(false);
            break;

          case 'error':
            console.error('❌ Backend Engine: Error message received:', message.data);
            break;

          default:
            console.log('❓ Backend Engine: Unknown message type:', message.type);
            break;
        }
      }
    };

    handleMessage();
  }, [websocket.lastMessage, sessionId, processAudioFrame, processFieldFrame, initializeAudio, initializePersistentAudio]);

  // Connect to backend
  const connectBackend = useCallback(async () => {
    console.log('🔌 Backend Engine: Connecting to backend...');
    try {
      const healthResponse = await api.healthCheck();
      if (healthResponse.status === 200) {
        setBackendConnected(true);
        console.log('✅ Backend Engine: Connected successfully');
      } else {
        throw new Error('Backend health check failed');
      }
    } catch (error) {
      console.error('❌ Backend Engine: Connection failed:', error);
      setBackendConnected(false);
    }
  }, [api]);

  // Stop backend session
  const stopBackendSession = useCallback(async () => {
    if (sessionId) {
      // Send stop commands via WebSocket
      websocket.sendMessage({
        type: 'stop_stream'
      });

      websocket.sendMessage({
        type: 'stop_session'
      });

      // Don't disconnect WebSocket - keep it alive for future operations
      // Just clear the session state
      setSessionId(null);
      setBackendConnected(false);
    }

    // Stop persistent audio pipeline
    if (audioWorkletNode.current) {
      audioWorkletNode.current.port.postMessage({ type: 'clearBuffer' });
      audioWorkletNode.current.disconnect();
      audioWorkletNode.current = null;
    }
    if (gainNode.current) {
      gainNode.current.disconnect();
      gainNode.current = null;
    }

    setAudioState(prev => ({
      ...prev,
      isPlaying: false,
      gainL: null,
      gainR: null,
      oscillatorL: null,
      oscillatorR: null,
      context: null
    }));

    setElectromagnetic({
      strength: 0,
      frequency: 0,
      phase: 0,
      coherence: 0,
      resonance: 0,
      state: 'INACTIVE',
      stability: 0
    });
  }, [sessionId, websocket]);

  // Start backend session - FIXED NaN CHECKS
  const startBackendSession = useCallback(async (config?: BinauralBeatConfig & {
    spatial_enabled?: boolean;
    spatial_settings?: Record<string, unknown>;
  }) => {
    // Prevent concurrent session starts
    if (startingSession) {
      console.log('⏳ Backend Engine: Session start already in progress, skipping duplicate call');
      return;
    }

    setStartingSession(true);
    
    console.log('🎧 Backend Engine: Starting session with config:', config);
    console.log('🔍 Backend Engine: Current sessionId:', sessionId);
    console.log('🔍 Backend Engine: WebSocket available:', !!websocket);

    // Clean up any existing session first
    if (sessionId) {
      console.log('🧹 Backend Engine: Cleaning up existing session');
      await stopBackendSession();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      console.log('📊 Backend Engine: Building session config...');
      // FIXED: Correct NaN checks and default values
      const sessionConfig: BackendSessionConfig = config ? {
        // When config is provided, check if values are valid numbers
        base_frequency: (!isNaN(config.baseFrequency))
            ? config.baseFrequency : 440,
        beat_frequency: ( !isNaN(config.beatFrequency))
            ? config.beatFrequency : 4,
        amplitude: ( !isNaN(config.amplitude))
            ? config.amplitude : 0.7,
        spatial_enabled: config.spatial_enabled || false,
        spatial_settings: config.spatial_settings || {}
      } : {
        // When no config, calculate from audioState with proper NaN checks
        base_frequency: (!isNaN(audioState.rightFreq)) ? audioState.rightFreq : 440,
        beat_frequency: (!isNaN(audioState.rightFreq) && !isNaN(audioState.leftFreq))
            ? Math.abs(audioState.rightFreq - audioState.leftFreq) : 4,
        amplitude: (!isNaN(audioState.amplitude)) ? audioState.amplitude : 0.3,
        spatial_enabled: false,
        spatial_settings: {}
      };

      console.log('📤 Backend Engine: Sending config to backend:', sessionConfig);

      // Connect WebSocket if not connected
      console.log('🔍 Backend Engine: WebSocket state:', { 
        isConnected: websocket.isConnected, 
        isConnecting: websocket.isConnecting,
        hasConnectFunction: typeof websocket.connect === 'function'
      });
      
      if (!websocket.isConnected && !websocket.isConnecting) {
        console.log('🔌 Backend Engine: Calling websocket.connect() with:', sessionConfig.base_frequency, sessionConfig.beat_frequency);
        
        if (typeof websocket.connect === 'function') {
          websocket.connect(sessionConfig.base_frequency, sessionConfig.beat_frequency);
          console.log('✅ Backend Engine: websocket.connect() called');
        } else {
          console.error('❌ Backend Engine: websocket.connect is not a function!', websocket);
        }

        // Wait for connection with timeout - use effect to watch for state changes
        setWaitingForConnection(true);
        
        const connected = await new Promise<boolean>((resolve) => {
          connectionPromiseRef.current = resolve;
          
          // Also set a timeout
          const timeout = setTimeout(() => {
            if (connectionPromiseRef.current) {
              console.log('❌ Backend Engine: WebSocket connection timeout after 5000ms');
              console.log('Final WebSocket state:', { 
                isConnected: websocket.isConnected, 
                isConnecting: websocket.isConnecting 
              });
              connectionPromiseRef.current(false);
              connectionPromiseRef.current = null;
              setWaitingForConnection(false);
            }
          }, 5000);
          
          // Check if already connected
          if (websocket.isConnected) {
            clearTimeout(timeout);
            resolve(true);
            connectionPromiseRef.current = null;
            setWaitingForConnection(false);
          }
        });

        if (!connected) {
          throw new Error('WebSocket connection timeout or error');
        }
      } else if (websocket.isConnecting) {
        // If already connecting, wait for it to complete using the same mechanism
        console.log('⏳ Backend Engine: WebSocket already connecting, setting up wait...');
        setWaitingForConnection(true);
        
        const connected = await new Promise<boolean>((resolve) => {
          connectionPromiseRef.current = resolve;
          
          // Set a timeout
          const timeout = setTimeout(() => {
            if (connectionPromiseRef.current) {
              console.log('❌ Backend Engine: WebSocket connection timeout after 5000ms (isConnecting case)');
              console.log('Final WebSocket state:', { 
                isConnected: websocket.isConnected, 
                isConnecting: websocket.isConnecting 
              });
              connectionPromiseRef.current(false);
              connectionPromiseRef.current = null;
              setWaitingForConnection(false);
            }
          }, 5000);
          
          // Check if already connected (race condition where it connected between checks)
          if (websocket.isConnected) {
            clearTimeout(timeout);
            resolve(true);
            connectionPromiseRef.current = null;
            setWaitingForConnection(false);
          }
        });

        if (!connected) {
          throw new Error('WebSocket connection failed');
        }
      } else if (websocket.isConnected) {
        // Already connected, proceed immediately
        console.log('✅ Backend Engine: WebSocket already connected, proceeding...');
      } else {
        // This shouldn't happen but let's handle it gracefully
        console.log('⚠️ Backend Engine: Unexpected WebSocket state, attempting connection...');
        websocket.connect(sessionConfig.base_frequency, sessionConfig.beat_frequency);
        
        // Wait for connection
        setWaitingForConnection(true);
        const connected = await new Promise<boolean>((resolve) => {
          connectionPromiseRef.current = resolve;
          
          const timeout = setTimeout(() => {
            if (connectionPromiseRef.current) {
              console.log('❌ Backend Engine: WebSocket connection timeout (fallback case)');
              connectionPromiseRef.current(false);
              connectionPromiseRef.current = null;
              setWaitingForConnection(false);
            }
          }, 5000);
          
          if (websocket.isConnected) {
            clearTimeout(timeout);
            resolve(true);
            connectionPromiseRef.current = null;
            setWaitingForConnection(false);
          }
        });
        
        if (!connected) {
          throw new Error('WebSocket connection failed in fallback');
        }
      }

      // Only proceed if WebSocket is connected
      if (websocket.isConnected) {
        // Generate session ID
        const newSessionId = `session-${Date.now()}`;
        setSessionId(newSessionId);

        // Wait for WebSocket to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Send start_stream message
        console.log('📨 Backend Engine: Sending start_stream message');
        websocket.sendMessage({
          type: 'start_stream',
          data: sessionConfig
        });

        // Initialize audio context and worklet
        const context = await initializeAudio();
        if (context) {
          await initializePersistentAudio();
        }

        // Update audio state
        setAudioState(prev => ({
          ...prev,
          isPlaying: true,
          leftFreq: sessionConfig.base_frequency - sessionConfig.beat_frequency,
          rightFreq: sessionConfig.base_frequency,
          beatFreq: sessionConfig.beat_frequency,
          volume: sessionConfig.amplitude
        }));
      }
      
      // Reset the flag on successful completion
      setStartingSession(false);
    } catch (error) {
      console.error('❌ Backend Engine: Failed to start backend session:', error);
      setStartingSession(false);  // Reset flag on error
      throw error;  // Re-throw to propagate the error
    }
  }, [sessionId, stopBackendSession, audioState, websocket, initializeAudio, initializePersistentAudio, startingSession]);

  // Update settings in real-time
  const updateSettings = useCallback((settings: Record<string, unknown>) => {
    if (websocket.isConnected) {
      websocket.sendMessage({
        type: 'update_settings',
        data: { settings }
      });
    }
  }, [websocket]);

  // Load pattern with backend integration
  const loadPattern = useCallback(async (pattern: PatternConfig) => {
    const config: BinauralBeatConfig & { spatial_enabled?: boolean; spatial_settings?: Record<string, unknown> } = {
      baseFrequency: pattern.frequencies.carrier,
      beatFrequency: pattern.frequencies.beat,
      amplitude: 0.5,
      waveform: 'sine',
      spatial_enabled: true,
      spatial_settings: {
        movement_speed: 0.08,
        spatial_intensity: 0.85,
        reverb_enabled: true
      }
    };

    if (audioState.isPlaying) {
      await stopBackendSession();
    }

    await startBackendSession(config);
  }, [audioState.isPlaying, startBackendSession, stopBackendSession]);

  // Update frequency
  const updateFrequency = useCallback((baseFreq: number, beatFreq: number) => {
    updateSettings({
      base_frequ1ency: baseFreq,
      beat_frequency: beatFreq
    });

    setAudioState(prev => ({
      ...prev,
      leftFreq: baseFreq - beatFreq,
      rightFreq: baseFreq,
      beatFreq: beatFreq
    }));
  }, [updateSettings]);

  // Update volume
  const updateVolume = useCallback((volume: number) => {
    updateSettings({
      amplitude: volume
    });

    setAudioState(prev => ({
      ...prev,
      volume
    }));
  }, [updateSettings]);

  // Update spatial settings
  const updateSpatialSettings = useCallback((spatialSettings: Record<string, unknown>) => {
    updateSettings({
      spatial_settings: spatialSettings
    });
  }, [updateSettings]);

  // Disconnect from backend
  const disconnectBackend = useCallback(async () => {
    console.log('🔌 Backend Engine: Disconnecting from backend...');
    if (sessionId) {
      await stopBackendSession();
    }
    setBackendConnected(false);
    console.log('✅ Backend Engine: Disconnected successfully');
  }, [sessionId, stopBackendSession]);

  // Timer compatibility methods
  const startBinauralBeat = useCallback(async (config: AudioEngineState) => {
    const sessionConfig = {
      baseFrequency: config.leftFreq || 80,
      beatFrequency: config.beatFreq || 15,
      amplitude: config.amplitude || 0.3,
      waveform: config.waveform || 'sine',
      spatial_enabled: true,
      spatial_settings: {
        mode: 'binaural',
        positioning: 'headphones',
        room_size: 'small'
      }
    };

    try {
      if (sessionId && websocket.isConnected) {
        console.log('♻️ Reusing existing session:', sessionId);

        websocket.sendMessage({
          type: 'start_session',
          data: sessionConfig
        });

        await new Promise(resolve => setTimeout(resolve, 200));
        websocket.sendMessage({
          type: 'start_stream',
          data: { settings: sessionConfig }
        });

        setAudioState(prev => ({
          ...prev,
          isPlaying: true,
          leftFreq: sessionConfig.baseFrequency,
          rightFreq: sessionConfig.baseFrequency + sessionConfig.beatFrequency,
          beatFreq: sessionConfig.beatFrequency,
          volume: sessionConfig.amplitude
        }));

        console.log('✅ Backend Engine: Started binaural beat');
        return;
      }

      // No session - create new
      console.log('🆕 Creating new session');
      await startBackendSession(sessionConfig);
    } catch (error) {
      console.error('❌ Failed to start binaural beat:', error);
      throw error;
    }
  }, [sessionId, websocket, startBackendSession, audioState, stopBackendSession]);

  const stopBinauralBeat = useCallback(async () => {
    console.log('🛑 Backend Engine: Stopping binaural beat');
    try {
      await stopBackendSession();
      console.log('✅ Backend Engine: Binaural beat stopped');
    } catch (error) {
      console.error('❌ Backend Engine: Failed to stop binaural beat:', error);
      throw error;
    }
  }, [stopBackendSession]);

  // Cleanup on unmount ONLY - not on sessionId changes
  useEffect(() => {
    return () => {
      // Only clean up on actual unmount, not on sessionId changes
      console.log('🧹 Backend Engine: Component unmounting, cleaning up...');
      
      // Clean up audio pipeline
      if (audioWorkletNode.current) {
        audioWorkletNode.current.port.postMessage({ type: 'clearBuffer' });
        audioWorkletNode.current.disconnect();
        audioWorkletNode.current = null;
      }
      if (gainNode.current) {
        gainNode.current.disconnect();
        gainNode.current = null;
      }
    };
  }, []); // Empty deps - only run on mount/unmount

  return {
    audioState,
    electromagnetic,
    sessionId,
    backendConnected,
    websocketState: {
      isConnected: websocket.isConnected,
      isConnecting: websocket.isConnecting,
      error: websocket.error
    },
    connectBackend,
    disconnectBackend,
    startBackendSession,
    stopBackendSession,
    startBinauralBeat,
    stopBinauralBeat,
    updateFrequency,
    updateVolume,
    updateSpatialSettings,
    loadPattern,
    updateSettings,
    isSupported: !!(window.AudioContext || (window as any).webkitAudioContext)
  };
};