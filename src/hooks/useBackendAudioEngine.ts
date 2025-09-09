// Backend-Integrated Audio Engine Hook
// Combines local Web Audio API with backend-generated binaural beats and spatial effects

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { useBackendAPI } from './useBackendAPI';
import type { 
  AudioEngineState, 
  BinauralBeatConfig, 
  ElectromagneticField,
  PatternConfig 
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
  const websocket = useWebSocket();
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
    if (websocket.state.lastMessage && sessionId) { // Only process if we have active session
      const message = websocket.state.lastMessage;
      console.log('📨 Backend Engine: Received WebSocket message type:', message.type);
      
      switch (message.type) {
        case 'frame':
        case 'audio_frame':
          console.log('🎵 Backend Engine: Processing audio frame - UPDATED');
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
          
          if (fieldData && typeof fieldData === 'object' && fieldData !== null && 'field' in fieldData && 'grid_size' in fieldData) {
            processFieldFrame(fieldData as BackendFieldFrame);
          }
          break;
          
        case 'session_started':
          console.log('✅ Backend Engine: Session started message received');
          setBackendConnected(true);
          break;
          
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
  }, [websocket.state.lastMessage, sessionId, processAudioFrame, processFieldFrame]);

  // Connect to backend (test health endpoint and set ready state)
  const connectBackend = useCallback(async () => {
    console.log('🔌 Backend Engine: Connecting to backend...');
    try {
      // Test backend health endpoint
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
  }, []);

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
      // Use current audioState values as defaults if no config provided
      const sessionConfig = config ? {
        base_frequency: typeof config.leftFreq === 'number' && !isNaN(config.leftFreq) ? config.leftFreq : 440,
        beat_frequency: typeof config.rightFreq === 'number' && !isNaN(config.rightFreq) && typeof config.leftFreq === 'number' && !isNaN(config.leftFreq) 
          ? Math.abs(config.rightFreq - config.leftFreq) : 4,
        amplitude: typeof config.amplitude === 'number' && !isNaN(config.amplitude) ? config.amplitude : 0.7,
        spatial_enabled: config.spatial_enabled || false,
        spatial_settings: config.spatial_settings || {}
      } : {
        base_frequency: typeof audioState.leftFreq === 'number' && !isNaN(audioState.leftFreq) ? audioState.leftFreq : 440,
        beat_frequency: typeof audioState.rightFreq === 'number' && !isNaN(audioState.rightFreq) && typeof audioState.leftFreq === 'number' && !isNaN(audioState.leftFreq)
          ? Math.abs(audioState.rightFreq - audioState.leftFreq) : 4,
        amplitude: typeof audioState.volume === 'number' && !isNaN(audioState.volume) ? audioState.volume : 0.3,
        spatial_enabled: false,
        spatial_settings: {}
      };

      console.log('🔧 Backend Engine: Creating WebSocket-only session with config:', sessionConfig);
      
      // Generate a unique session ID for WebSocket (don't use REST API)
      const newSessionId = 'ws-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      console.log('✅ Backend Engine: Generated WebSocket session ID:', newSessionId);
      setSessionId(newSessionId);
      
      // Initialize audio context FIRST
      console.log('🎵 Backend Engine: Initializing audio context');
      await initializeAudio();
      
      // Initialize persistent audio pipeline
      console.log('🔧 Backend Engine: Setting up persistent audio pipeline');
      await initializePersistentAudio();
      
      // Connect WebSocket with our generated session ID
      console.log('🔌 Backend Engine: Connecting WebSocket for session:', newSessionId);
      websocket.connect(newSessionId);
      
      // Wait for WebSocket connection
      let connectAttempts = 0;
      while (!websocket.state.connected && connectAttempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        connectAttempts++;
      }
      
      if (websocket.state.connected) {
        console.log('✅ Backend Engine: WebSocket connected successfully');
        
        // Send session initialization immediately after connection
        console.log('📡 Backend Engine: Sending start_session to create audio session');
        websocket.sendMessage({
          type: 'start_session',
          settings: sessionConfig
        });
        
        // Wait a moment for session to be set up on backend
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Then send start streaming command
        console.log('📡 Backend Engine: Sending start_stream command');
        websocket.sendMessage({
          type: 'start_stream',
          data: {
            settings: sessionConfig
          }
        });

        setAudioState(prev => ({
          ...prev,
          isPlaying: true,
          context: audioContext.current,
          leftFreq: sessionConfig.base_frequency,
          rightFreq: sessionConfig.base_frequency + sessionConfig.beat_frequency
        }));
        
        console.log('🚀 Backend Engine: Session started successfully');
      } else {
        throw new Error('Failed to establish WebSocket connection');
      }
    } catch (error) {
      console.error('❌ Backend Engine: Failed to start backend session:', error);
      // Clean up on failure
      if (sessionId) {
        setSessionId(null);
        setBackendConnected(false);
        websocket.disconnect();
      }
      throw error;
    }
  }, [api, websocket, initializeAudio, audioState, sessionId, stopBackendSession]);

  // Update settings in real-time
  const updateSettings = useCallback((settings: Record<string, unknown>) => {
    if (websocket.state.connected) {
      websocket.sendMessage({
        type: 'update_settings',
        data: {settings}
      });
    }
  }, [websocket]);

  // Load pattern with backend integration
const  loadPattern = useCallback(async(pattern: PatternConfig) => {
    const config: BinauralBeatConfig & { spatial_enabled?: boolean, spatial_settings?: Record<string, unknown> } = {
      leftFreq: pattern.frequencies.carrier,
      rightFreq: pattern.frequencies.carrier + pattern.frequencies.beat,
      beatFreq: pattern.frequencies.beat,
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
  const updateFrequency = useCallback((leftFreq: number, rightFreq: number) => {
    const beatFreq = Math.abs(rightFreq - leftFreq);
    
    updateSettings({
      base_frequency: leftFreq,
      beat_frequency: beatFreq
    });
    
    setAudioState(prev => ({
      ...prev,
      leftFreq,
      rightFreq,
      beatFreq
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

  // Timer compatibility interface
  const startBinauralBeat = useCallback(async (config: BinauralBeatConfig) => {
    console.log('🔥 Backend Engine (Timer): Starting binaural beat with config:', config);
    
    try {
      // Connect to backend if not already connected
      if (!backendConnected) {
        console.log('🔌 Backend Engine (Timer): Connecting to backend first...');
        await connectBackend();
        
        // Wait a bit for connection to establish
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Start backend session with timer configuration
      // IMPORTANT: Backend expects beat_frequency as the difference between left/right frequencies
      const calculatedBeatFreq = Math.abs(config.rightFreq - config.leftFreq);
      
      const sessionConfig = {
        base_frequency: config.leftFreq,           // Backend expects base_frequency
        beat_frequency: calculatedBeatFreq,        // Backend expects beat_frequency  
        amplitude: config.amplitude,               // ✅ Correct
        spatial_enabled: true,                     // ✅ Correct
        spatial_settings: {                        // ✅ Correct
          pattern: 'tornado',
          movement_speed: 0.33,
          spatial_intensity: 0.85,
          reverb_enabled: true
        }
      };
      
      console.log('🔧 Backend Engine (Timer): Frequency mapping - Timer wants', config.beatFreq, 'Hz binaural beat, sending', calculatedBeatFreq, 'Hz frequency difference');
      
      console.log('🎧 Backend Engine (Timer): Starting session with config:', sessionConfig);
      await startBackendSession(sessionConfig);
      console.log('✅ Backend Engine (Timer): Binaural beat session started successfully');
      
    } catch (error) {
      console.error('❌ Backend Engine (Timer): Failed to start binaural beat:', error);
      throw error;
    }
  }, [backendConnected, connectBackend, startBackendSession]);

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
    websocketState: websocket.state,
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