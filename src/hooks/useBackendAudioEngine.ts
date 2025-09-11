// Backend-Integrated Audio Engine Hook
// Combines local Web Audio API with backend-generated binaural beats and spatial effects

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocketContext as useWebSocket} from './useWebsocketContext.ts';
import { useBackendAPI } from './useBackendAPI';
 import type {
  AudioEngineState, 

  ElectromagneticField,
  PatternConfig ,
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
    volume: 0.3,
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


  const audioContext = useRef<AudioContext | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const audioWorkletNode = useRef<AudioWorkletNode | null>(null);
  const workletLoaded = useRef<boolean>(false);

  // Backend communication hooks
  const websocket = useWebSocket('ws://localhost:8000');
  const api = useBackendAPI();

  // Initialize audio context
  const initializeAudio = useCallback(async (): Promise<AudioContext | null> => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      
      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }

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
        gainNode.current.gain.value = audioState.volume;
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
              volume: audioState.volume
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
  }, [audioState.volume]);

  // Process backend audio frame (send to AudioWorklet)
  const processAudioFrame = useCallback((frame: BackendAudioFrame) => {
    console.log('🎧 Backend Engine: Processing audio frame with', frame.frame_size, 'samples', 
                'Left:', frame.frequencies.left, 'Hz Right:', frame.frequencies.right, 'Hz Beat:', frame.frequencies.beat, 'Hz');
    
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
      if (audioWorkletNode.current.parameters.get('volume')) {
        audioWorkletNode.current.parameters.get('volume')!.setValueAtTime(
          audioState.volume, 
          audioContext.current.currentTime
        );
      }

      console.log('🔊 Backend Engine: Audio frame sent to AudioWorklet, volume:', audioState.volume);

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
  }, [audioState.volume]);

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

  // Handle WebSocket messages
 
   useEffect(() => {
    const handleMessage = async () => {
    if (websocket.lastMessage && sessionId) { // Only process if we have active session
      const message = websocket.lastMessage;
      console.log('📨 Backend Engine: Received WebSocket message type:', message.type);
      console.log('🔍 Backend Engine: Full message object:', JSON.stringify(message, null, 2));
      
      switch (message.type) {
        case 'frame':
        case 'audio_frame':
          { console.log('🎵 Backend Engine: Processing audio frame - UPDATED');
          // Handle both 'frame' (legacy) and 'audio_frame' (new format)
          const audioData = message.type === 'audio_frame' ? message.data : message.data?.data?.audio;
          const fieldData = message.data?.data?.field;
          
          // Check for session errors
          if (audioData && typeof audioData === 'object' && audioData.error) {
            console.error('❌ Backend Engine: Session error from backend:', audioData.error);
            if (audioData.error === 'Session not found') {
              console.log('🔄 Backend Engine: Session lost, forcing cleanup and stop...');
              
              // Prevent processing of any more messages during cleanup
              const currentSessionId = sessionId;
              
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
              
              // Clear session state (this will prevent further message processing)
              setSessionId(null);
              setBackendConnected(false);
              
              // Disconnect WebSocket last (to prevent reconnection attempts)
              setTimeout(() => {
                websocket.disconnect();
              }, 100); // Small delay to ensure state is cleared first
              
              console.log('🛑 Backend Engine: Session cleanup complete for session:', currentSessionId);
            }
            return; // Exit early to prevent further processing
          }
          
          if (audioData && typeof audioData === 'object' && audioData !== null && 'left' in audioData && 'right' in audioData) {
            processAudioFrame(audioData as BackendAudioFrame);
          } else {
            console.warn('⚠️ Backend Engine: Audio data not available - backend may not be generating audio properly');
            console.warn('🔍 Backend Engine: Message type:', message.type, 'Audio data:', audioData);
          }
          
          if (fieldData && typeof fieldData === 'object' && 'field' in fieldData && 'grid_size' in fieldData) {
            processFieldFrame(fieldData as BackendFieldFrame);
          }
          break; }
        case 'session_started': {
          // Initialize audio context first
          const context = await initializeAudio();
          if (!context) {
            throw new Error('Failed to initialize audio context');
          }

// THEN INITIALIZE YOUR FUCKING AUDIOWORKLET PIPELINE!
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
  }, [websocket.lastMessage, sessionId, processAudioFrame, processFieldFrame]);

  // Connect to backend (test health endpoint and set ready state)
  const connectBackend = useCallback(async () => {
    console.log('🔌 Backend Engine: Connecting to backend...');
    try {
      // Test backend health endpoint
      const healthResponse = await api.healthCheck();
      if (healthResponse.status === 200) {
        setBackendConnected(true);
        console.log('✅ Backend Engine: Connected successfully (backend health check passed)');
        // DO NOT automatically create a session or connect WebSocket
        // Sessions should only be created when the user actually starts playing audio
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

      // Disconnect WebSocket
      websocket.disconnect();

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
  }, [sessionId, websocket, api]);


// Start backend session (creates audio session)
  const startBackendSession = useCallback(async (config?: BinauralBeatConfig & {
    spatial_enabled?: boolean;
    spatial_settings?: Record<string, unknown>
  }) => {
    console.log('🎧 Backend Engine: Starting session with config:', config);

    // Clean up any existing session first
    if (sessionId) {
      console.log('🧹 Backend Engine: Cleaning up existing session before starting new one');
      await stopBackendSession();
      await new Promise(resolve => setTimeout(resolve, 100)); // Brief pause
    }

    try {
      // Convert frontend config (camelCase) to backend format (snake_case)
      const sessionConfig: BackendSessionConfig = config ? {
        // When config is provided, convert from camelCase to snake_case
       /*     base_frequency: typeof config.baseFrequency === 'number' && !isNaN(config.baseFrequency) ? config.baseFrequency : 440,
            433 +          beat_frequency: typeof config.beatFrequency === 'number' && !isNaN(config.beatFrequency) ? config.beatFrequency : 4,
          434            amplitude: typeof config.amplitude === 'number' && !isNaN(config.amplitude) ? config.amplitude : 0.7,*/
        base_frequency: !isNaN(config.baseFrequency) ? config.baseFrequency : 440,
        beat_frequency: !isNaN(config.beatFrequency) ? config.beatFrequency : 4,
        amplitude: !isNaN(config.amplitude) ? config.amplitude : 0.7,
        spatial_enabled: config.spatial_enabled || false,
        spatial_settings: config.spatial_settings || {}
      } : {
        // When no config, calculate from audioState
        // Remember: base_frequency = RIGHT ear, beat = right - left
        base_frequency: isNaN(audioState.rightFreq) ? audioState.rightFreq : 440,
        beat_frequency: ( !isNaN(audioState.rightFreq) && !isNaN(audioState.leftFreq))
            ? Math.abs(audioState.rightFreq - audioState.leftFreq) : 4,
        amplitude: !isNaN(audioState.volume) ? audioState.volume : 0.3,
        spatial_enabled: false,
        spatial_settings: {}
      };

      // Now sessionConfig is properly typed as BackendSessionConfig
      // Send it to your backend API or WebSocket
      console.log('📤 Sending config to backend:', sessionConfig);

      // ... rest of your function
    } catch (error) {
      console.error('Failed to start backend session:', error);
    }
  }, [sessionId, stopBackendSession, audioState]);

  // Update settings in real-time
  const updateSettings = useCallback((settings: Record<string, unknown>) => {
    if (websocket.isConnected) {
      websocket.sendMessage({
        type: 'update_settings',
        data: {settings}
      });
    }
  }, [websocket]);

  // Load pattern with backend integration
  const loadPattern = useCallback(async(pattern: PatternConfig) => {
    const config: BinauralBeatConfig & { spatial_enabled?: boolean, spatial_settings?: Record<string, unknown> } = {
      baseFrequency: pattern.frequencies.carrier,  // BASE frequency (right ear)
      beatFrequency: pattern.frequencies.beat,      // BEAT frequency
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

  const updateFrequency = useCallback((baseFreq: number, beatFreq: number) => {
    // Backend expects base_frequency (right ear) and beat_frequency
    updateSettings({
      base_frequency: baseFreq,
      beat_frequency: beatFreq
    });

    // Calculate left/right for audio state
    // RIGHT ear = base frequency
    // LEFT ear = base - beat (to create the binaural beat)
    setAudioState(prev => ({
      ...prev,
      leftFreq: baseFreq - beatFreq,  // LEFT ear frequency
      rightFreq: baseFreq,            // RIGHT ear frequency (base)
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!sessionId) {
        // Simple cleanup without calling the full stopBackendSession
        websocket.disconnect();
        setSessionId(null);
        setBackendConnected(false);
      }
      // Clean up persistent audio pipeline
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
  }, []);

  // Disconnect from backend
  const disconnectBackend = useCallback(async () => {
    console.log('🔌 Backend Engine: Disconnecting from backend...');
    if (sessionId) {
      await stopBackendSession();
    }
    setBackendConnected(false);
    console.log('✅ Backend Engine: Disconnected successfully');
  }, [sessionId, stopBackendSession]);

  const startBinauralBeat = useCallback(async (config: any) => {
    // Build complete session config
    const sessionConfig = {
      base_frequency: config.leftFreq || 440,
      beat_frequency: config.beatFreq || (config.rightFreq - config.leftFreq) || 15,
      amplitude: config.amplitude || 0.7,
      waveform: config.waveform || 'sine',
      spatial_enabled: true,
      spatial_settings: {
        mode: 'binaural',
        positioning: 'headphones',
        room_size: 'medium'
      }
    };

    try {
      // 1. Reuse existing connected session
      if (sessionId && websocket.isConnected) {
        console.log('♻️ Reusing existing session:', sessionId);
        console.log('📡 Sending start_session with config:', sessionConfig);
        
        // Send start_session first to initialize audio on backend
        websocket.sendMessage({
          type: 'start_session',
          data: sessionConfig
        });
        
        // Then start the stream
        await new Promise(resolve => setTimeout(resolve, 200));
        websocket.sendMessage({
          type: 'start_stream',
          data: { settings: sessionConfig }
        });
        
        setAudioState(prev => ({
          ...prev,
          isPlaying: true,
          leftFreq: sessionConfig.base_frequency,
          rightFreq: sessionConfig.base_frequency + sessionConfig.beat_frequency,
          beatFreq: sessionConfig.beat_frequency,
          volume: sessionConfig.amplitude
        }));
        
        console.log('✅ Backend Engine: Started binaural beat on existing session');
        return;
      }

      // 2. Session exists but disconnected - reconnect
      if (sessionId && !websocket.isConnected) {
        console.log('⏳ Reconnecting to session:', sessionId);
        websocket.connect(sessionId);
        
        // Wait for reconnection
        let attempts = 0;
        while (!websocket.isConnected && attempts < 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (websocket.isConnected) {
          // Now send the config
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
            leftFreq: sessionConfig.base_frequency,
            rightFreq: sessionConfig.base_frequency + sessionConfig.beat_frequency,
            beatFreq: sessionConfig.beat_frequency,
            volume: sessionConfig.amplitude
          }));
          
          console.log('✅ Backend Engine: Reconnected and started binaural beat');
          return;
        } else {
          throw new Error('Failed to reconnect to session');
        }
      }

      // 3. No session - create new
      if (!sessionId) {
        console.log('🆕 Creating new session with config');
        await startBackendSession(config);
        return;
      }
    } catch (error) {
      console.error('❌ Failed:', error);
      throw error;
    }
  }, [sessionId, websocket, startBackendSession]);


  const stopBinauralBeat = useCallback(async () => {
    console.log('🛑 Backend Engine (Timer): Stopping binaural beat session');
    try {
      await stopBackendSession();
      console.log('✅ Backend Engine (Timer): Binaural beat session stopped successfully');
    } catch (error) {
      console.error('❌ Backend Engine (Timer): Failed to stop binaural beat:', error);
      throw error;
    }
  }, [stopBackendSession]);

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
    startBinauralBeat, // Timer compatibility
    stopBinauralBeat,  // Timer compatibility
    updateFrequency,
    updateVolume,
    updateSpatialSettings,
    loadPattern,
    updateSettings,
    isSupported: !!(window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
  };
};