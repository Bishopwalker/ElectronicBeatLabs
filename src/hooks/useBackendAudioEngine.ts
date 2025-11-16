// Backend-Integrated Audio Engine Hook - FIXED VERSION
// Combines local Web Audio API with backend-generated binaural beats and spatial effects

import {useCallback, useEffect, useRef, useState} from 'react';
import {useWebSocketContext} from './useWebsocketContext';
import type {BackendAudioEngineState, BinauralBeatConfig, ElectromagneticField, PatternConfig} from '../types';
import {DEFAULT_BASE_FREQUENCY, DEFAULT_BEAT_FREQUENCY, DEFAULT_VOLUME} from '../constants/audio.constants';

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
  volume: number;
  spatial_enabled: boolean;
  spatial_settings: Record<string, unknown>;
}

export const useBackendAudioEngine = () => {
  const [audioState, setAudioState] = useState<BackendAudioEngineState>({
    beat_frequency: 0,
    context: undefined,
    gainL: undefined,
    gainR: undefined,
    leftFreq: 0,
    oscillatorL: undefined,
    oscillatorR: undefined,
    rightFreq: 0,
    webSocket: false,
    error: '',
    sessionId: '',
    connected: false,
    isPlaying: false,
    config: {
      volume: DEFAULT_VOLUME,
      base_frequency: DEFAULT_BASE_FREQUENCY,
      beat_frequency: DEFAULT_BEAT_FREQUENCY,
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
  const [firstFrameReceived, setFirstFrameReceived] = useState(false); // 🔥 Track if backend has actually sent audio data
  const connectionPromiseRef = useRef<((value: boolean) => void) | null>(null);
  // Queue settings made before WebSocket/session are ready
  const pendingSettingsRef = useRef<Record<string, unknown> | null>(null);

  const audioContext = useRef<AudioContext | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const audioWorkletNode = useRef<AudioWorkletNode | null>(null);
  const analyserNode = useRef<AnalyserNode | null>(null);
  const workletLoaded = useRef<boolean>(false);
  const initializingWorklet = useRef<boolean>(false); // 🔥 NEW: Prevent concurrent initialization

  // Store external mixer nodes (can be set dynamically)
  const externalOutputNodeRef = useRef<GainNode | null>(null);
  const externalAnalyserRef = useRef<AnalyserNode | null>(null);
  const externalAudioContextRef = useRef<AudioContext | null>(null); // 🔥 NEW: Store external context

  // Backend communication hooks
  const websocket = useWebSocketContext();
// When creating AudioContext

   // Initialize audio context
  const initializeAudio = useCallback(async (): Promise<AudioContext | null> => {
    try {
      // 🔥 CRITICAL FIX: Use external context if provided (AudioMixer integration)
      if (externalAudioContextRef.current) {
        // Reset existing context if it's different from external
        if (audioContext.current && audioContext.current !== externalAudioContextRef.current) {
          audioContext.current = null;
        }
        audioContext.current = externalAudioContextRef.current;
      } else {
        // Standalone mode: create new context only if none exists
        if (!audioContext.current) {
          audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
      }

       if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }

      setElectromagnetic((prev) => ({
        ...prev,
        state: 'ACTIVE'

      }));

      return audioContext.current;

    } catch (error) {
      console.error('❌ Backend Engine: Failed to initialize audio context:', error);
      return null;
    }
  }, []);

  // Initialize AudioWorklet audio pipeline
  const initializePersistentAudio = useCallback(async () => {
    if (!audioContext.current) return;

    // 🔥 CRITICAL FIX: Prevent concurrent initialization (race condition)
    if (initializingWorklet.current) {
      return;
    }

    // 🔥 CRITICAL FIX: Clean up existing AudioWorkletNode BEFORE creating new one
    if (audioWorkletNode.current) {
      try {
        audioWorkletNode.current.port.postMessage({ type: 'stop' });
        audioWorkletNode.current.port.postMessage({ type: 'clearBuffer' });
        audioWorkletNode.current.disconnect();
        audioWorkletNode.current = null;
      } catch (error) {
      }
    }

    initializingWorklet.current = true; // Lock

    try {
      // Load AudioWorklet processor if not already loaded
      if (!workletLoaded.current) {
        try {
          await audioContext.current.audioWorklet.addModule(`/backend-audio-processor.js?v=${audioContext.current.getOutputTimestamp()}`);
          workletLoaded.current = true;

        } catch (error) {
          initializingWorklet.current = false; // Release lock
          return;
        }
      }

      // Use external nodes if provided (AudioMixer integration)
      const outputNode = externalOutputNodeRef.current;
      const analyser = externalAnalyserRef.current;

      if (outputNode) {
        // AudioMixer mode: Route directly to mixer's backend gain node
        analyserNode.current = analyser;
      } else {
        // Standalone mode: Create local gain and analyser nodes
        if (!gainNode.current) {
          gainNode.current = audioContext.current.createGain();
          gainNode.current.gain.value = audioState.config?.volume ?? DEFAULT_VOLUME;
          gainNode.current.connect(audioContext.current.destination);
        }

        if (!analyserNode.current) {
        analyserNode.current = audioContext.current.createAnalyser();
        analyserNode.current.fftSize = 2048;
        analyserNode.current.smoothingTimeConstant = 0.8;
        // 🔥 FIX: Don't connect analyser yet - AudioWorklet will connect to it later
        // Connection order will be: AudioWorklet → AnalyserNode → GainNode → Destination
        gainNode.current.disconnect();
        gainNode.current.connect(audioContext.current.destination);
        analyserNode.current.connect(gainNode.current); // Analyser output → GainNode
        }
      }

      // Create NEW AudioWorkletNode for real-time audio processing
      audioWorkletNode.current = new AudioWorkletNode(
          audioContext.current,
          'backend-audio-processor',
          {
            numberOfInputs: 0,
            numberOfOutputs: 1,
            outputChannelCount: [2],
            processorOptions: {
              volume: audioState.config?.volume ?? audioState.context
            }
          }
      );

      // Handle messages from AudioWorklet
      audioWorkletNode.current.port.onmessage = (event: MessageEvent) => {
        const message = event.data;
        switch (message.type) {
          case 'frameProcessed':
            // Optional: Log buffer health warnings
            if (message.data?.bufferHealth === 'critical') {
              console.warn('⚠️ Backend buffer critical:', message.data);
            }
            break;

          case 'bufferStatus':
            // Optional: Could update UI with buffer health indicator
            break;

          case 'metrics':
            // Handle metrics data for electromagnetic field visualization
            setElectromagnetic((prev) => ({
              ...prev,
              ...message.data
            }));
            break;

          case 'processingError':
            console.error('❌ AudioWorklet processing error:', message.error);
            // Could trigger fallback to frontend engine here
            break;

          default:
            // Ignore unknown messages
            break;
        }
      };

// 🔥 CRITICAL FIX: Split signal for independent volume control
// AudioWorklet connects to BOTH analyser (full strength) AND gain (volume controlled)
// This allows visualizer to stay strong even when volume is low
      if (outputNode) {
        // AudioMixer mode: AudioWorklet splits to both analyser and output

        if (analyserNode.current) {
          // Connect analyser directly to AudioWorklet (full strength signal!)
          audioWorkletNode.current.connect(analyserNode.current);
          // AnalyserNode is passive (doesn't pass audio), so no output connection needed
        }

        // Connect AudioWorklet to output for volume-controlled playback
        audioWorkletNode.current.connect(outputNode);

      } else if (gainNode.current) {
        // Standalone mode: AudioWorklet splits to both analyser and gain

        if (analyserNode.current) {
          // Connect analyser directly to AudioWorklet (full strength signal!)
          audioWorkletNode.current.connect(analyserNode.current);
          // AnalyserNode is passive (doesn't pass audio), so no output connection needed
        }

        // Connect AudioWorklet to gain for volume-controlled playback
        audioWorkletNode.current.connect(gainNode.current);

      } else {
        // Fallback: Direct connection (shouldn't happen)
      }

    } catch (error) {
    } finally {
      initializingWorklet.current = false; // Always release lock
    }
  }, [audioState]);

  // ✅ FIXED: Set volume ONLY when it changes - moved outside processAudioFrame
  useEffect(() => {
    if (!audioWorkletNode.current || !audioContext.current) return;
    
    const volumeParam = audioWorkletNode.current.parameters.get('volume');
    if (volumeParam && audioState.config?.volume !== undefined) {
      volumeParam.setValueAtTime(
        audioState.config.volume,
        audioContext.current.currentTime
      );
    }
  }, [audioState.config?.volume]); // 👈 Only runs when volume changes

  // Process backend audio frame (send to AudioWorklet)
  const processAudioFrame = useCallback((frame: BackendAudioFrame | ArrayBuffer) => {
    if (!audioContext.current || !audioWorkletNode.current) return;

    try {
      // 🔥 Mark that we've received the first audio frame (prevents premature crossfade)
      if (!firstFrameReceived) {
        setFirstFrameReceived(true);
        console.log('🎵 Backend: First audio frame received - ready for crossfade');
      }

      // Handle binary frame (ArrayBuffer)
      if (frame instanceof ArrayBuffer) {
        audioWorkletNode.current.port.postMessage({
          type: 'audioFrame',
          data: frame
        });
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

      // Update frequency state (no volume updates here!)
      setAudioState(prev => ({
        ...prev,
        config: {
          ...prev.config!,
          base_frequency: frame.frequencies.left,
          beat_frequency: frame.frequencies.beat,
          volume: audioState.config?.volume,
          duration: audioContext.current?.currentTime || Date.now(),
        }
      }));
    } catch (error) {
      console.error('❌ Error processing audio frame:', error);
    }
  }, [audioState.config?.volume, firstFrameReceived]);

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
      connectionPromiseRef.current(true);
      connectionPromiseRef.current = null;
      setWaitingForConnection(false);
    }
  }, [websocket.isConnected, waitingForConnection]);

  // Sync session ID from WebSocket when it becomes available
  useEffect(() => {
    if (websocket.sessionId && !sessionId) {
      setSessionId(websocket.sessionId);
    }
  }, [websocket.sessionId, sessionId]);

  // Register frame handler to receive audio frames from WebSocket
  useEffect(() => {
    websocket.registerFrameHandler((message: any) => {
      if (message.type === 'frame' || message.type === 'audio_frame') {
        const audioData = message.data;
        if (audioData instanceof ArrayBuffer) {
          processAudioFrame(audioData);
        } else if (audioData && typeof audioData === 'object' && 'left' in audioData && 'right' in audioData) {
          processAudioFrame(audioData as BackendAudioFrame);
        }
      }
    });
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

        switch (message.type) {
          case 'frame':
          case 'audio_frame': {
            const audioData = message.data;

            // Check for session errors
            if (audioData && typeof audioData === 'object' && audioData.error) {
              if (audioData.error === 'Session not found') {
                // Clean up audio nodes
                if (audioWorkletNode.current) {
                  audioWorkletNode.current.port.postMessage({ type: 'clearBuffer' });
                  audioWorkletNode.current.disconnect();
                  audioWorkletNode.current = null;
                }
                setAudioState(prev => ({ ...prev, isPlaying: false }));
                setSessionId(null);
                setBackendConnected(false);
                setTimeout(() => websocket.disconnect(), 100);
              }
              return;
            }

            // Handle binary/JSON frames
            if (audioData instanceof ArrayBuffer || (audioData && typeof audioData === 'object' && 'left' in audioData)) {
              processAudioFrame(audioData as BackendAudioFrame | ArrayBuffer);
            }
            break;
          }

          case 'session_started': {
            const context = await initializeAudio();
            if (!context) throw new Error('Failed to initialize audio context');
          await initializePersistentAudio();
          setBackendConnected(true);
          // Apply pending settings if any
          if (pendingSettingsRef.current && websocket.isConnected) {
            // 🔥 FIX: Use 'data' field for consistency
            websocket.sendMessage({
              type: 'update_settings',
              data: pendingSettingsRef.current  // 🔥 FIXED: Changed from 'settings' to 'data'
            } as any);
            pendingSettingsRef.current = null;
          }
          break;
        }

          case 'session_stopped':
            setAudioState(prevState => ({
              ...prevState,
              isPlaying: false
            }));
            setBackendConnected(false);
            break;

          case 'error':
            break;
        }
      }
    };

    handleMessage().then();
  }, [websocket.lastMessage, sessionId, processAudioFrame, processFieldFrame, initializeAudio, initializePersistentAudio, websocket]);

  // Connect to backend with auto WebSocket connection
  const connectBackend = useCallback(async () => {
    console.log('🔌 Backend Engine: connectBackend() called');
    
    // Prevent multiple simultaneous connection attempts
    if (backendConnected) {
      console.log('✅ Backend already connected, skipping');
      return;
    }

    if (websocket.isConnecting) {
      console.log('⏳ WebSocket already connecting, waiting...');
      return;
    }

    // Short-circuit if the underlying socket is already OPEN
    const isOpenNow = (typeof (websocket as any).isOpenSync === 'function'
      ? (websocket as any).isOpenSync()
      : websocket.isConnected);
    if (isOpenNow) {
      setBackendConnected(true);
      if (websocket.sessionId && !sessionId) {
        setSessionId(websocket.sessionId);
      }
      console.log('✅ Backend Engine: WebSocket already open; marking connected.');
      return;
    }

    try {
      // Best-effort health touch (non-blocking)
      try {
        const httpProtocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
        const host = window.location.hostname;
        const port = (import.meta as any).env?.DEV ? '8000' : (window.location.port || (httpProtocol === 'https:' ? '443' : '80'));
        const healthUrl = `${httpProtocol}//${host}:${port}/health`;
        console.log('🩺 Checking backend health:', healthUrl);
        await fetch(healthUrl, { mode: 'no-cors' }).catch(() => undefined);
      } catch {}

      // Attempt WebSocket connection
      if (!isOpenNow && !websocket.isConnecting) {
        console.log('🔌 Initiating WebSocket connection...');
        websocket.connect(); // 🔥 FIX: No frequency params - they come from messages

        // Wait for WebSocket connection with timeout
        const wsConnected = await new Promise<boolean>((resolve) => {
          const timeout = setTimeout(() => {
            console.log('❌ WebSocket connection TIMEOUT (5s)');
            resolve(false);
          }, 5000); // 5 seconds timeout for WebSocket connection

          const checkConnection = () => {
            // Prefer synchronous readyState from provider to avoid stale React state in closures
            if (typeof (websocket as any).isOpenSync === 'function' ? (websocket as any).isOpenSync() : websocket.isConnected) {
              console.log('✅ WebSocket connected!');
              clearTimeout(timeout);
              resolve(true);
            } else {
              // 🔥 FIX: Keep checking until connected or timeout
              // Don't resolve(false) based on isConnecting state - it's unreliable due to React state update timing
              // Let the timeout handle failure cases
              setTimeout(checkConnection, 100);
            }
          };

          checkConnection();
        });

        if (!wsConnected) {
          console.error('❌ Backend connection FAILED - WebSocket did not connect');
          setBackendConnected(false);
          throw new Error('WebSocket connection failed - backend may not be ready yet');
        }
      }

      // 🔥 CRITICAL FIX: Only set backendConnected=true if WebSocket is ACTUALLY connected
      // Use provider's synchronous readyState check to avoid stale React state
      const actuallyConnected =
        (typeof (websocket as any).isOpenSync === 'function'
          ? (websocket as any).isOpenSync()
          : websocket.isConnected);
      setBackendConnected(actuallyConnected);

      // Update session ID from WebSocket if available
      if (websocket.sessionId && !sessionId) {
        setSessionId(websocket.sessionId);
      }

      if (actuallyConnected) {
        console.log('✅ Backend Engine: Connection SUCCESSFUL!', {
          connected: websocket.isConnected,
          connecting: websocket.isConnecting,
          backendConnected: actuallyConnected,
          sessionId: websocket.sessionId
        });
      } else {
        console.error('❌ Backend Engine: Connection FAILED!', {
          connected: websocket.isConnected,
          connecting: websocket.isConnecting,
          backendConnected: actuallyConnected,
          sessionId: websocket.sessionId
        });
        throw new Error('Backend connection failed - WebSocket not connected');
      }

    } catch (error) {
      console.error('❌ Backend connection error:', error);
      setBackendConnected(false);
      throw error;
    }
  }, [backendConnected, sessionId, websocket]);

  // Stop backend session
  // 🔥 CRITICAL FIX: Properly disconnect backend to prevent auto-restart
  const stopBackendSession = useCallback(async () => {
    if (sessionId) {
      // Send stop commands via WebSocket
      websocket.sendMessage({
        type: 'stop_stream'
      });

      websocket.sendMessage({
        type: 'stop_session'
      });

      // 🔥 FIXED: Clear session state to prevent crossfade trigger
      setSessionId(null);
      setBackendConnected(false); // 🔥 FIXED: Actually disconnect to prevent crossfade!
      setFirstFrameReceived(false); // 🔥 FIXED: Reset frame flag for next session
    }

    // STOP the AudioWorklet processor and clear buffer
    if (audioWorkletNode.current) {
      audioWorkletNode.current.port.postMessage({ type: 'stop' });
      audioWorkletNode.current.port.postMessage({ type: 'clearBuffer' });
    }

    // Mute the gain node to ensure no humming
    if (gainNode.current && audioContext.current) {
      gainNode.current.gain.setValueAtTime(0, audioContext.current.currentTime);
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
  }, [sessionId, websocket]);

  // Start backend session - FIXED NaN CHECKS
  const startBackendSession = useCallback(async (config?: BinauralBeatConfig & {
    spatial_enabled?: boolean;
    spatial_settings?: Record<string, unknown>;
  }) => {
    // Prevent concurrent session starts
    if (startingSession) {
      return;
    }

    setStartingSession(true);

    // Clean up any existing session first
    if (sessionId) {
      await stopBackendSession();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      // FIXED: Correct NaN checks and default values
      const sessionConfig: BackendSessionConfig = config ? {
        // When config is provided, check if values are valid numbers
        base_frequency: (!isNaN(config.base_frequency))
            ? config.base_frequency : DEFAULT_BASE_FREQUENCY,
        beat_frequency: ( !isNaN(config.beat_frequency))
            ? config.beat_frequency : DEFAULT_BEAT_FREQUENCY,
        volume: ( !isNaN(config.volume))
            ? config.volume : DEFAULT_VOLUME,
        spatial_enabled: config.spatial_enabled || false,
        spatial_settings: config.spatial_settings || {}
      } : {
        // When no config, use current audioState.config with proper fallbacks
        base_frequency: audioState.config?.base_frequency || DEFAULT_BASE_FREQUENCY,
        beat_frequency: audioState.config?.beat_frequency || DEFAULT_BEAT_FREQUENCY,
        volume: audioState.config?.volume ?? DEFAULT_VOLUME,
        spatial_enabled: audioState.config?.spatial?.enabled || false,
        spatial_settings: {
          mode: audioState.config?.spatial?.mode || 'binaural',
          positioning: audioState.config?.spatial?.positioning || 'headphones',
          room_size: audioState.config?.spatial?.roomSize || 'small'
        }
      };

      // Connect WebSocket if not connected
      console.log('🔍 Backend Engine: WebSocket state:', { 
        isConnected: websocket.isConnected, 
        isConnecting: websocket.isConnecting,
        hasConnectFunction: typeof websocket.connect === 'function'
      });
      
      if (!websocket.isConnected && !websocket.isConnecting) {
        
        if (typeof websocket.connect === 'function') {
          websocket.connect(); // 🔥 FIX: No params - frequencies from messages
        } else {
        }

        // Wait for connection with timeout - use effect to watch for state changes
        setWaitingForConnection(true);
        
        const connected = await new Promise<boolean>((resolve) => {
          connectionPromiseRef.current = resolve;
          
          // Also set a timeout
          const timeout = setTimeout(() => {
            if (connectionPromiseRef.current) {
              console.log('Final WebSocket state:', {
                isConnected: websocket.isConnected,
                isConnecting: websocket.isConnecting
              });
              connectionPromiseRef.current(false);
              connectionPromiseRef.current = null;
              setWaitingForConnection(false);
            }
          }, 10000);
          
          // Check if already connected (prefer synchronous readyState)
          if (typeof (websocket as any).isOpenSync === 'function'
                ? (websocket as any).isOpenSync()
                : websocket.isConnected) {
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
        setWaitingForConnection(true);
        
        const connected = await new Promise<boolean>((resolve) => {
          connectionPromiseRef.current = resolve;
          
          // Set a timeout
          const timeout = setTimeout(() => {
            if (connectionPromiseRef.current) {
              console.log('Final WebSocket state:', {
                isConnected: websocket.isConnected,
                isConnecting: websocket.isConnecting
              });
              connectionPromiseRef.current(false);
              connectionPromiseRef.current = null;
              setWaitingForConnection(false);
            }
          }, 10000);
          
          // Check if already connected (prefer synchronous readyState)
          if (typeof (websocket as any).isOpenSync === 'function'
                ? (websocket as any).isOpenSync()
                : websocket.isConnected) {
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
      } else {
        // This shouldn't happen but let's handle it gracefully
        websocket.connect(); // 🔥 FIX: No params - frequencies from messages
        
        // Wait for connection
        setWaitingForConnection(true);
        const connected = await new Promise<boolean>((resolve) => {
          connectionPromiseRef.current = resolve;
          
          const timeout = setTimeout(() => {
            if (connectionPromiseRef.current) {
              connectionPromiseRef.current(false);
              connectionPromiseRef.current = null;
              setWaitingForConnection(false);
            }
          }, 10000);
          
          if (typeof (websocket as any).isOpenSync === 'function'
                ? (websocket as any).isOpenSync()
                : websocket.isConnected) {
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
      if ((typeof (websocket as any).isOpenSync === 'function'
            ? (websocket as any).isOpenSync()
            : websocket.isConnected)) {
        // Use the WebSocket's session ID or generate one
        const wsSessionId = websocket.sessionId;
        const newSessionId = wsSessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);

        // Wait for WebSocket to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Send start_stream message
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
            gainNode.current.gain.setValueAtTime(sessionConfig.volume, context.currentTime);
          }

          // Send start command to AudioWorklet to enable immediate playback
          if (audioWorkletNode.current) {
            audioWorkletNode.current.port.postMessage({ type: 'start' });
          }
        }

        // Update audio state to match backend calculation
        // CRITICAL: Compute leftFreq/rightFreq for UI compatibility
        const computedLeft = sessionConfig.base_frequency;
        const computedRight = sessionConfig.base_frequency + sessionConfig.beat_frequency;
        console.log('🔢 Backend Engine: Computing frequencies -', {
          base: sessionConfig.base_frequency,
          beat: sessionConfig.beat_frequency,
          computedLeft,
          computedRight
        });
        setAudioState(prev => ({
          ...prev,
          isPlaying: true,
          config: {
            ...prev.config!,
            base_frequency: sessionConfig.base_frequency,
            beat_frequency: sessionConfig.beat_frequency,
            volume: sessionConfig.volume
          },
          // Computed properties for UI (FrequencyVisualizer, etc.)
          leftFreq: computedLeft,
          rightFreq: computedRight,
          beat_frequency: sessionConfig.beat_frequency
        }));

        // Apply any queued settings after session starts
        if (pendingSettingsRef.current) {
          // 🔥 FIX: Use 'data' field for consistency
          websocket.sendMessage({
            type: 'update_settings',
            data: pendingSettingsRef.current  // 🔥 FIXED: Changed from 'settings' to 'data'
          } as any);
          pendingSettingsRef.current = null;
        }
      }
      
      // Reset the flag on successful completion
      setStartingSession(false);
    } catch (error) {
      setStartingSession(false);  // Reset flag on error
      throw error;  // Re-throw to propagate the error
    }
  }, [sessionId, stopBackendSession, audioState, websocket, initializeAudio, initializePersistentAudio, startingSession]);

  // Update settings in real-time
  const updateSettings = useCallback((settings: Record<string, unknown>) => {
    const isOpen = (typeof (websocket as any).isOpenSync === 'function'
      ? (websocket as any).isOpenSync()
      : websocket.isConnected);
    if (isOpen && sessionId) {
      // 🔥 FIX: Send settings in 'data' field as backend expects
      console.log('🎛️ Sending frequency update to backend:', settings);
      websocket.sendMessage({
        type: 'update_settings',
        data: settings  // 🔥 FIXED: Changed from 'settings' to 'data'
      } as any);
    } else {
      // Cache for application when session comes up
      pendingSettingsRef.current = {
        ...(pendingSettingsRef.current || {}),
        ...settings
      };
    }
  }, [websocket, sessionId]);

  // Load pattern with backend integration
  const loadPattern = useCallback(async (pattern: PatternConfig) => {
    const config: BinauralBeatConfig & { spatial_enabled?: boolean; spatial_settings?: Record<string, unknown> } = {
      base_frequency: pattern.frequencies.carrier,
      beat_frequency: pattern.frequencies.beat,
      volume: 0.5,
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
    // 🔥 FIX: Log what we're sending for debugging
    console.log('🎛️ updateFrequency called:', { base_frequency, beat_frequency });
    
    // 🔥 CRITICAL: Include ALL required fields to prevent backend defaults
    const frequencyUpdate = {
      base_frequency: base_frequency,
      beat_frequency: beat_frequency,
      volume: audioState.config?.volume ?? DEFAULT_VOLUME, // Include current volume
      spatial_enabled: audioState.config?.spatial?.enabled || false,
      spatial_settings: audioState.config?.spatial || {}
    };
    
    console.log('📡 Sending complete frequency update to backend:', frequencyUpdate);
    updateSettings(frequencyUpdate);

    setAudioState(prev => ({
      ...prev,
      config: {
        ...prev.config!,
        base_frequency: base_frequency,
        beat_frequency: beat_frequency
      },
      // Computed properties for UI compatibility
      leftFreq: base_frequency,
      rightFreq: base_frequency + beat_frequency,
      beat_frequency: beat_frequency
    }));
  }, [updateSettings, audioState.config]);

  // Update volume
  const updateVolume = useCallback((volume: number) => {
    // Protect against NaN and invalid values
    const safeVolume = isNaN(volume) ? DEFAULT_VOLUME : Math.max(0, Math.min(2, volume));

    // Send update to backend via WebSocket
    updateSettings({
      volume: safeVolume
    });

    // CRITICAL FIX: Update gain node directly for immediate volume change
    if (gainNode.current && audioContext.current) {
      gainNode.current.gain.setValueAtTime(safeVolume, audioContext.current.currentTime);
    }

    // Update local state
    setAudioState(prev => ({
      ...prev,
      config: {
        ...prev.config!,
        volume: safeVolume
      }
    }));
  }, [updateSettings]);

  // Update spatial settings - sends enable_spatial message to backend
  const updateSpatialSettings = useCallback((spatialSettings: Record<string, unknown>) => {
    const isOpen = (typeof (websocket as any).isOpenSync === 'function'
      ? (websocket as any).isOpenSync()
      : websocket.isConnected);

    if (isOpen && sessionId) {
      console.log('🎧 Sending spatial settings to backend:', spatialSettings);
      // Send enable_spatial message which the backend actually processes
      websocket.sendMessage({
        type: 'enable_spatial',
        spatial_settings: spatialSettings
      } as any);
    } else {
      console.warn('🎧 Cannot send spatial settings - not connected');
    }
  }, [websocket, sessionId]);

  // Disconnect from backend
  const disconnectBackend = useCallback(async () => {

    // Stop any active session first
    if (sessionId) {
      await stopBackendSession();
    }

    // Disconnect WebSocket
    if ((typeof (websocket as any).isOpenSync === 'function'
      ? (websocket as any).isOpenSync()
      : websocket.isConnected)) {
      websocket.disconnect();
    }

    // Clear session and connection state
    setSessionId(null);
    setBackendConnected(false);

  }, [sessionId, stopBackendSession, websocket]);

  // Timer compatibility methods
  const startBinauralBeat = useCallback(async (config: BinauralBeatConfig) => {

    // CRITICAL: Initialize audio context first (required for user gesture)
    if (!audioContext.current) {
      const ctx = await initializeAudio();
      if (!ctx) {
        throw new Error('Failed to initialize audio context');
      }
    }

    // Initialize AudioWorklet pipeline
    await initializePersistentAudio();

    const sessionConfig = {
      base_frequency: config.base_frequency || 80,
      beat_frequency: config.beat_frequency || 15,
      volume: config.volume ?? DEFAULT_VOLUME,
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
            volume: sessionConfig.volume
          }
        }));

        return;
      }

      // No session - create new
      await startBackendSession(sessionConfig);
    } catch (error) {
      throw error;
    }
  }, [sessionId, websocket, startBackendSession, audioState, stopBackendSession, initializeAudio, initializePersistentAudio]);

  const stopBinauralBeat = useCallback(async () => {
    try {
      await stopBackendSession();
    } catch (error) {
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
      volume: DEFAULT_VOLUME,
      waveform: 'sine'
    };

    startBinauralBeat(config);

    // Auto-stop after duration
    setTimeout(() => {
      stopBinauralBeat();
    }, duration);
  }, [startBinauralBeat, stopBinauralBeat]);

  const frequencySweep = useCallback(async (startFreq: number, endFreq: number, duration: number) => {

    const isOpen = (typeof (websocket as any).isOpenSync === 'function'
      ? (websocket as any).isOpenSync()
      : websocket.isConnected);
    if (!sessionId || !isOpen) {
      return;
    }

    const steps = Math.max(10, Math.floor(duration / 100)); // Update every 100ms minimum
    const stepDuration = duration / steps;
    const freqStep = (endFreq - startFreq) / steps;

    try {
      for (let i = 0; i <= steps; i++) {
        const currentFreq = startFreq + (freqStep * i);
        const progress = i / steps;

        // Update backend frequency
        await updateSettings({
          base_frequency: currentFreq,
          beat_frequency: DEFAULT_BEAT_FREQUENCY // Keep beat frequency constant during sweep
        });

        // Wait for step duration
        if (i < steps) {
          await new Promise(resolve => setTimeout(resolve, stepDuration));
        }
      }

    } catch (error) {
    }
  }, [sessionId, websocket.isConnected, updateSettings]);

  const createGammaProtocol = useCallback((protocol: any) => {
    const config: BinauralBeatConfig = {
      base_frequency: DEFAULT_BASE_FREQUENCY,
      beat_frequency: protocol.gammaFreq || 40,
      volume: (protocol.intensity || 70) / 100,
      waveform: 'sine'
    };

    startBinauralBeat(config);

    // Auto-stop after protocol duration
    setTimeout(() => {
      stopBinauralBeat();
    }, (protocol.duration || 10) * 60 * 1000);
  }, [startBinauralBeat, stopBinauralBeat]);

  /**
   * Set external mixer nodes for AudioMixer integration
   * Call this after creating the AudioMixer to route backend audio through it
   * 🔥 CRITICAL FIX: Now also accepts external AudioContext to prevent context mismatch
   */
  const setExternalNodes = useCallback((outputGainNode: GainNode | null, analyserNode: AnalyserNode | null, audioContext?: AudioContext | null) => {
    externalOutputNodeRef.current = outputGainNode;
    externalAnalyserRef.current = analyserNode;
    
    // 🔥 NEW: Store external AudioContext to prevent creating a different one
    if (audioContext) {
      externalAudioContextRef.current = audioContext;
    }

    // If AudioWorklet exists, warn that restart is needed
    if (audioWorkletNode.current) {
    } else {
    }
  }, []);

  // Cleanup on unmount ONLY - not on sessionId changes
  useEffect(() => {
    return () => {
      // Only clean up on actual unmount, not on sessionId changes

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
    setExternalNodes, // 🔥 NEW: Allow dynamic routing through AudioMixer
    isSupported: !!(window.AudioContext || (window as any).webkitAudioContext),
    // 🔥 CRITICAL FIX: Return external analyser if set (AudioMixer integration)
    // This ensures visualizers work even before audio starts
    audioContext: audioContext.current,
    analyserNode: externalAnalyserRef.current || analyserNode.current,
    // 🔥 NEW: Expose AudioWorklet status for debugging and visibility
    audioWorkletStatus: {
      moduleLoaded: workletLoaded.current,
      nodeExists: !!audioWorkletNode.current,
      nodeReference: audioWorkletNode.current, // Direct ref for advanced debugging
      isProcessing: audioState.isPlaying && !!audioWorkletNode.current && firstFrameReceived // 🔥 FIX: Only true when audio data is actually flowing
    }
  };
};