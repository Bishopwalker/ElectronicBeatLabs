// Backend-Integrated Audio Engine Hook - FIXED VERSION
// Combines local Web Audio API with backend-generated binaural beats and spatial effects

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocketContext } from './useWebsocketContext';
import { useBackendAPI } from './useBackendAPI';
import type {
  BackendAudioEngineState,
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
  const [audioState, setAudioState] = useState<BackendAudioEngineState>({
    error: '',
    sessionId: '',
    connected: false,
    isPlaying: false,
    config: {
      amplitude: 1.2,
      base_frequency: 144,
      beat_frequency: 4,
      waveform: 'sine',
      spatial: {
        enabled: true,
        mode: '3d',
        positioning: 'headphones',
        roomSize: 'small'
      }
    }
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
          await audioContext.current.audioWorklet.addModule(`/backend-audio-processor.js?v=${Date.now()}`);
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
        gainNode.current.gain.value = audioState.config?.amplitude || 1.2;
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
                amplitude: audioState.config?.amplitude || 1.2
              }
            }
        );

        // Handle messages from AudioWorklet
        audioWorkletNode.current.port.onmessage = (event: MessageEvent) => {
          const message = event.data;
          switch (message.type) {
            case 'frameProcessed':
              // Reduced logging - only log every 60 frames (1 second)
              break;
            case 'bufferStatus':
              console.log('📊 Buffer Status:', message.data);
              break;
            case 'bufferExhausted':
              console.warn('⚠️ Backend Engine: Audio buffer exhausted, need new frame');
              break;
            case 'processingError':
              console.error('❌ Backend Engine: AudioWorklet processing error:', message.error);
              break;
            default:
              break;
          }
        };

        // Connect AudioWorklet to gain node
        audioWorkletNode.current.connect(gainNode.current);
        console.log('✅ Backend Engine: AudioWorklet node created and connected to gain node');
      }
    } catch (error) {
      console.error('❌ Backend Engine: Failed to initialize AudioWorklet audio:', error);
    }
  }, [audioState]);
/* console.log('🎧 Backend Engine: Processing audio frame with', frame.frame_size, 'samples',
    //     'Left:', frame.frequencies.left, 'Hz Right:', frame.frequencies.right, 'Hz Beat:', frame.frequencies.beat, 'Hz');
*/
  // Process backend audio frame (send to AudioWorklet)
  const processAudioFrame = useCallback((frame: BackendAudioFrame | ArrayBuffer) => {

    if (!audioContext.current) {
      // Silently skip - audio pipeline not ready yet
      return;
    }

    if (!audioWorkletNode.current) {
      // Silently skip - AudioWorklet not initialized yet, frames will be buffered by backend
      return;
    }

    try {
      // Handle binary frame (ArrayBuffer) - 50% faster, 50% smaller
      if (frame instanceof ArrayBuffer) {
        audioWorkletNode.current.port.postMessage({
          type: 'audioFrame',
          data: frame // Pass ArrayBuffer directly to AudioWorklet
        });
        //console.log('🔊 Backend Engine: Binary audio frame sent to AudioWorklet');
        return;
      }

      // Handle legacy JSON frame
      audioWorkletNode.current.port.postMessage({
        type: 'audioFrame',
        data: {
          left: frame.left,
          right: frame.right,
          sample_rate: frame.sample_rate,
          frame_size: frame.frame_size
        }
      });

      // Update volume parameter on AudioWorklet (legacy JSON frames only)
      const volumeParam = audioWorkletNode.current.parameters.get('volume');
      if (volumeParam && !(frame instanceof ArrayBuffer)) {
        volumeParam.setValueAtTime(
            audioState.config?.amplitude || 1.2,
            audioContext.current.currentTime
        );
      }

      console.log('🔊 Backend Engine: Audio frame sent to AudioWorklet, amplitude:', audioState.config?.amplitude || 1.2);

      // Update frequency state in config (legacy JSON frames only)
      if (!(frame instanceof ArrayBuffer)) {
        setAudioState(prev => ({
          ...prev,
          config: {
            ...prev.config!,
            base_frequency: frame.frequencies.left,
            beat_frequency: frame.frequencies.beat,
            amplitude: audioState.config?.amplitude || 1.2,
            duration: audioContext.current?.currentTime || Date.now(),
          }
        }));
      }

    } catch (error) {
      console.error('❌ Backend Engine: Failed to process audio frame:', error);
    }
  }, [audioState.config?.amplitude]);

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
      state: fieldStrength > 80 ? 'CRITICAL' :
          fieldStrength > 0.7 ? 'RESONANT' :
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

  // Sync session ID from WebSocket when it becomes available
  useEffect(() => {
    if (websocket.sessionId && !sessionId) {
      console.log('🔄 Backend Engine: Syncing session ID from WebSocket:', websocket.sessionId);
      setSessionId(websocket.sessionId);
    }
  }, [websocket.sessionId, sessionId]);

  // CRITICAL FIX: Initialize AudioWorklet EARLY on WebSocket connection
  useEffect(() => {
    const initAudioPipeline = async () => {
      if (websocket.isConnected && !audioWorkletNode.current) {
        console.log('🎵 Backend Engine: WebSocket connected, initializing audio pipeline early...');

        // Initialize audio context first
        const context = await initializeAudio();
        if (context) {
          // Initialize AudioWorklet pipeline BEFORE frames start arriving
          await initializePersistentAudio();
          console.log('✅ Backend Engine: Audio pipeline initialized and ready for frames');
        }
      }
    };

    initAudioPipeline();
  }, [websocket.isConnected, initializeAudio, initializePersistentAudio]);

  // CRITICAL FIX: Register frame handler to receive audio frames from WebSocket
  useEffect(() => {
    console.log('🎵 Backend Engine: Registering frame handler for audio processing');

    websocket.registerFrameHandler((message: any) => {
      // Process frame messages directly without triggering re-renders
      if (message.type === 'frame' || message.type === 'audio_frame') {
        const audioData = message.data;

        // Handle binary frames (ArrayBuffer)
        if (audioData instanceof ArrayBuffer) {
          processAudioFrame(audioData);
          return;
        }

        // Handle legacy JSON frames
        if (audioData && typeof audioData === 'object' && 'left' in audioData && 'right' in audioData) {
          processAudioFrame(audioData as BackendAudioFrame);
        }
      }
    });

    console.log('✅ Backend Engine: Frame handler registered successfully');
  }, [websocket, processAudioFrame]);

  // Handle WebSocket messages with debouncing for frame messages
  const lastProcessedMessageRef = useRef<number>(0);

  useEffect(() => {
    const handleMessage = async () => {
      if (websocket.lastMessage && sessionId) { // Only process if we have active session
        const message = websocket.lastMessage;

        // Debounce frame messages to prevent infinite loops
        if (message.type === 'frame' || message.type === 'audio_frame') {
          const now = Date.now();
          if (now - lastProcessedMessageRef.current < 16) { // Max 60 FPS processing
            return;
          }
          lastProcessedMessageRef.current = now;
        }

        console.log('📨 Backend Engine: Received WebSocket message type:', message.type);
     //   console.log('🔍 Backend Engine: Full message object:', JSON.stringify(message, null, 2));

        switch (message.type) {
          case 'frame':
          case 'audio_frame': {
            console.log('🎵 Backend Engine: Processing audio frame - UPDATED');
            // audio_websocket.py sends: { type: 'frame', data: {left: [], right: [], ...} }
            // Direct access to audio data (no nested 'audio' wrapper from audio_websocket.py)
            const audioData = message.data;
            const fieldData = null; // audio_websocket.py doesn't send field data

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

            // Handle binary frames
            if (audioData instanceof ArrayBuffer) {
              processAudioFrame(audioData);
            } else if (audioData && typeof audioData === 'object' && 'left' in audioData && 'right' in audioData) {
              // Handle legacy JSON frames
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

    handleMessage().then();
  }, [websocket.lastMessage, sessionId, processAudioFrame, processFieldFrame, initializeAudio, initializePersistentAudio, websocket]);

  // Connect to backend with auto WebSocket connection
  const connectBackend = useCallback(async () => {
    // Prevent multiple simultaneous connection attempts
    if (backendConnected || websocket.isConnecting) {
      console.log('⏭️ Backend Engine: Connection already established or in progress, skipping...');
      return;
    }

    console.log('🔌 Backend Engine: Connecting to backend...');
    try {
      // First check backend health
      const healthResponse = await api.healthCheck();
      if (healthResponse.status !== 200) {
        throw new Error('Backend health check failed');
      }

      console.log('✅ Backend Engine: Backend is healthy, establishing WebSocket connection...');

      // Auto-connect WebSocket when backend connects
      if (!websocket.isConnected && !websocket.isConnecting) {
        console.log('🔗 Backend Engine: Auto-starting WebSocket connection...');
        websocket.connect(144, 4); // Default frequencies for initial connection

        // Wait for WebSocket connection with timeout
        const wsConnected = await new Promise<boolean>((resolve) => {
          const timeout = setTimeout(() => {
            console.log('⚠️ Backend Engine: WebSocket connection timeout during backend connect');
            resolve(false);
          }, 5000); // 5 seconds timeout for WebSocket connection

          const checkConnection = () => {
            if (websocket.isConnected) {
              clearTimeout(timeout);
              console.log('✅ Backend Engine: WebSocket connected, session ID:', websocket.sessionId);
              resolve(true);
            } else if (!websocket.isConnecting) {
              // If not connecting and not connected, it failed
              clearTimeout(timeout);
              console.log('⚠️ Backend Engine: WebSocket connection stopped without connecting');
              resolve(false);
            } else {
              // Still connecting, check again
              setTimeout(checkConnection, 100);
            }
          };

          checkConnection();
        });

        if (!wsConnected) {
          console.warn('⚠️ Backend Engine: WebSocket connection failed, but backend is available');
        }
      }

      setBackendConnected(true);

      // Update session ID from WebSocket if available
      if (websocket.sessionId && !sessionId) {
        console.log('🆔 Backend Engine: Setting session ID from WebSocket:', websocket.sessionId);
        setSessionId(websocket.sessionId);
      }

      console.log('✅ Backend Engine: Connected successfully with WebSocket state:', {
        connected: websocket.isConnected,
        connecting: websocket.isConnecting,
        backendConnected: true,
        sessionId: websocket.sessionId
      });
      console.log('🆔 Backend Engine: Current session ID after connection:', sessionId || websocket.sessionId);

      // Force a re-render by updating a timestamp
      console.log('🔄 Backend Engine: Forcing component re-render after connection');
    } catch (error) {
      console.error('❌ Backend Engine: Connection failed:', error);
      setBackendConnected(false);
      throw error;
    }
  }, [api, backendConnected, sessionId, websocket]);

  // Stop backend session
  const stopBackendSession = useCallback(async () => {
    console.log('🛑 stopBackendSession: Starting - sessionId:', sessionId);
    if (sessionId) {
      // Send stop commands via WebSocket
      console.log('📨 stopBackendSession: Sending stop_stream message');
      websocket.sendMessage({
        type: 'stop_stream'
      });

      console.log('📨 stopBackendSession: Sending stop_session message');
      websocket.sendMessage({
        type: 'stop_session'
      });

      // Don't disconnect WebSocket - keep it alive for future operations
      // DON'T clear sessionId - this causes Advanced Controls to switch to frontend engine!
      console.log('🔄 stopBackendSession: Keeping session state so Advanced Controls stay connected to backend');
      // setSessionId(null);  // REMOVED - this breaks Advanced Controls
      setBackendConnected(true); // KEEP backend connected for Advanced Controls
    }

    // STOP the AudioWorklet processor and clear buffer
    if (audioWorkletNode.current) {
      console.log('🛑 stopBackendSession: Stopping AudioWorklet processor');
      audioWorkletNode.current.port.postMessage({ type: 'stop' });
      audioWorkletNode.current.port.postMessage({ type: 'clearBuffer' });
    }

    // Mute the gain node to ensure no humming
    if (gainNode.current) {
      console.log('🔇 stopBackendSession: Muting gain node to eliminate humming');
      gainNode.current.gain.setValueAtTime(0, audioContext.current!.currentTime);
    }

    setAudioState(prev => ({
      ...prev,
      isPlaying: false
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
  }, [websocket.sessionId]);

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
        base_frequency: (!isNaN(config.base_frequency))
            ? config.base_frequency : 140,
        beat_frequency: ( !isNaN(config.beat_frequency))
            ? config.beat_frequency : 4,
        amplitude: ( !isNaN(config.amplitude))
            ? config.amplitude : 0.7,
        spatial_enabled: config.spatial_enabled || false,
        spatial_settings: config.spatial_settings || {}
      } : {
        // When no config, use current audioState.config with proper fallbacks
        base_frequency: audioState.config?.base_frequency || 144,
        beat_frequency: audioState.config?.beat_frequency || 4,
        amplitude: audioState.config?.amplitude || 1.2,
        spatial_enabled: audioState.config?.spatial?.enabled || false,
        spatial_settings: {
          mode: audioState.config?.spatial?.mode || 'binaural',
          positioning: audioState.config?.spatial?.positioning || 'headphones',
          room_size: audioState.config?.spatial?.roomSize || 'small'
        }
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
              console.log('❌ Backend Engine: WebSocket connection timeout after 10000ms');
              console.log('Final WebSocket state:', {
                isConnected: websocket.isConnected,
                isConnecting: websocket.isConnecting
              });
              connectionPromiseRef.current(false);
              connectionPromiseRef.current = null;
              setWaitingForConnection(false);
            }
          }, 10000);
          
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
              console.log('❌ Backend Engine: WebSocket connection timeout after 10000ms (isConnecting case)');
              console.log('Final WebSocket state:', {
                isConnected: websocket.isConnected,
                isConnecting: websocket.isConnecting
              });
              connectionPromiseRef.current(false);
              connectionPromiseRef.current = null;
              setWaitingForConnection(false);
            }
          }, 10000);
          
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
          }, 10000);
          
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
        // Use the WebSocket's session ID or generate one
        const wsSessionId = websocket.sessionId;
        const newSessionId = wsSessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log('🆔 Backend Engine: Using session ID from WebSocket:', wsSessionId, '| Final ID:', newSessionId);
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

          // Unmute gain node for playback
          if (gainNode.current) {
            console.log('🔊 startBackendSession: Unmuting gain node for playback');
            gainNode.current.gain.setValueAtTime(sessionConfig.amplitude, context.currentTime);
          }

          // Send start command to AudioWorklet to enable immediate playback
          if (audioWorkletNode.current) {
            console.log('🔊 startBackendSession: Sending start command to AudioWorklet');
            audioWorkletNode.current.port.postMessage({ type: 'start' });
          }
        }

        // Update audio state to match backend calculation
        setAudioState(prev => ({
          ...prev,
          isPlaying: true,
          config: {
            ...prev.config!,
            base_frequency: sessionConfig.base_frequency,
            beat_frequency: sessionConfig.beat_frequency,
            amplitude: sessionConfig.amplitude
          }
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
      base_frequency: pattern.frequencies.carrier,
      beat_frequency: pattern.frequencies.beat,
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
  const updateFrequency = useCallback((base_frequency: number, beat_frequency: number) => {
    updateSettings({
      base_frequency: base_frequency,
      beat_frequency: beat_frequency
    });

    setAudioState(prev => ({
      ...prev,
      config: {
        ...prev.config!,
        base_frequency: base_frequency,
        beat_frequency: beat_frequency
      }
    }));
  }, [updateSettings]);

  // Update volume
  const updateVolume = useCallback((volume: number) => {
    // Protect against NaN and invalid values
    const safeVolume = isNaN(volume) ? 1.2 : Math.max(0, Math.min(2, volume));
    console.log('🎵 Backend updateVolume:', { original: volume, safe: safeVolume });

    updateSettings({
      amplitude: safeVolume
    });

    setAudioState(prev => ({
      ...prev,
      config: {
        ...prev.config!,
        amplitude: safeVolume
      }
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

    // Stop any active session first
    if (sessionId) {
      await stopBackendSession();
    }

    // Disconnect WebSocket
    if (websocket.isConnected) {
      console.log('🔗 Backend Engine: Disconnecting WebSocket...');
      websocket.disconnect();
    }

    // Clear session and connection state
    setSessionId(null);
    setBackendConnected(false);

    console.log('✅ Backend Engine: Disconnected successfully');
  }, [sessionId, stopBackendSession, websocket]);

  // Timer compatibility methods
  const startBinauralBeat = useCallback(async (config: BinauralBeatConfig) => {
    const sessionConfig = {
      base_frequency: config.base_frequency || 80,
      beat_frequency: config.beat_frequency || 15,
      amplitude: config.amplitude || 1.2,
      waveform: config.waveform || 'sine',
      spatial_enabled: config.spatial?.enabled || true,
      spatial_settings: {
        mode: config.spatial?.mode || 'binaural',
        positioning: config.spatial?.positioning || 'headphones',
        room_size: config.spatial?.roomSize || 'small'
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
          config: {
            ...prev.config!,
            base_frequency: sessionConfig.base_frequency,
            beat_frequency: sessionConfig.beat_frequency,
            amplitude: sessionConfig.amplitude
          }
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
    console.log('🛑 Backend Engine: Stopping binaural beat - ONLY CLEARING BUFFER, KEEPING WEBSOCKET ALIVE');
    try {
      await stopBackendSession();
      console.log('✅ Backend Engine: Binaural beat stopped - WebSocket and AudioWorklet should still be connected');
    } catch (error) {
      console.error('❌ Backend Engine: Failed to stop binaural beat:', error);
      throw error;
    }
  }, [stopBackendSession]);

  // AudioEngine interface compatibility methods
  const updateWaveform = useCallback((waveform: 'sine' | 'square' | 'triangle' | 'sawtooth') => {
    updateSettings({ waveform });
  }, [updateSettings]);

  const generateTestTones = useCallback((leftFreq: number, rightFreq: number, duration: number = 5000) => {
    const config: BinauralBeatConfig = {
      base_frequency: leftFreq,
      beat_frequency: Math.abs(rightFreq - leftFreq),
      amplitude: 1.2,
      waveform: 'sine'
    };

    startBinauralBeat(config);

    // Auto-stop after duration
    setTimeout(() => {
      stopBinauralBeat();
    }, duration);
  }, [startBinauralBeat, stopBinauralBeat]);

  const frequencySweep = useCallback(async (startFreq: number, endFreq: number, duration: number) => {
    console.log(`🌊 Starting frequency sweep: ${startFreq}Hz → ${endFreq}Hz over ${duration}ms`);

    if (!sessionId || !websocket.isConnected) {
      console.warn('⚠️ Cannot perform frequency sweep: backend not connected');
      return;
    }

    const steps = Math.max(10, Math.floor(duration / 100)); // Update every 100ms minimum
    const stepDuration = duration / steps;
    const freqStep = (endFreq - startFreq) / steps;

    try {
      for (let i = 0; i <= steps; i++) {
        const currentFreq = startFreq + (freqStep * i);
        const progress = i / steps;

        console.log(`🌊 Frequency sweep step ${i}/${steps}: ${currentFreq.toFixed(1)}Hz (${(progress * 100).toFixed(1)}%)`);

        // Update backend frequency
        await updateSettings({
          base_frequency: currentFreq,
          beat_frequency: 4 // Keep beat frequency constant during sweep
        });

        // Wait for step duration
        if (i < steps) {
          await new Promise(resolve => setTimeout(resolve, stepDuration));
        }
      }

      console.log(`✅ Frequency sweep completed: ${startFreq}Hz → ${endFreq}Hz`);
    } catch (error) {
      console.error('❌ Frequency sweep failed:', error);
    }
  }, [sessionId, websocket.isConnected, updateSettings]);

  const createGammaProtocol = useCallback((protocol: any) => {
    const config: BinauralBeatConfig = {
      base_frequency: 144,
      beat_frequency: protocol.gammaFreq || 40,
      amplitude: (protocol.intensity || 70) / 100,
      waveform: 'sine'
    };

    startBinauralBeat(config);

    // Auto-stop after protocol duration
    setTimeout(() => {
      stopBinauralBeat();
    }, (protocol.duration || 10) * 60 * 1000);
  }, [startBinauralBeat, stopBinauralBeat]);

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
      connected: websocket.isConnected,
      connecting: websocket.isConnecting,
      error: websocket.error?.message || null
    },
    connectBackend,
    disconnectBackend,
    startBackendSession,
    stopBackendSession,
    startBinauralBeat,
    stopBinauralBeat,
    updateFrequency,
    updateVolume,
    updateWaveform,
    updateSpatialSettings,
    loadPattern,
    generateTestTones,
    frequencySweep,
    createGammaProtocol,
    updateSettings,
    isSupported: !!(window.AudioContext || (window as any).webkitAudioContext)
  };
};