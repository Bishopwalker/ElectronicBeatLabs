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


  const audioSource = useRef<AudioBufferSourceNode | null>(null);
  const audioContext = useRef<AudioContext | null>(null);

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

  // Process backend audio frame
  const processAudioFrame = useCallback((frame: BackendAudioFrame) => {
    if (!audioContext.current) return;

    try {
      // Convert PCM data to Float32Array
      const leftData = new Float32Array(frame.left.map(sample => sample / 32767));
      const rightData = new Float32Array(frame.right.map(sample => sample / 32767));

      // Create audio buffer
      const buffer = audioContext.current.createBuffer(2, frame.frame_size, frame.sample_rate);
      buffer.copyToChannel(leftData, 0);
      buffer.copyToChannel(rightData, 1);

      // Create source node
      const source = audioContext.current.createBufferSource();
      source.buffer = buffer;

      // Create gain node for volume control
      const gainNode = audioContext.current.createGain();
      gainNode.gain.value = audioState.volume;

      // Connect nodes
      source.connect(gainNode).connect(audioContext.current.destination);

      // Play immediately
      source.start();

      // Update frequency state
      setAudioState(prev => ({
        ...prev,
        leftFreq: frame.frequencies.left,
        rightFreq: frame.frequencies.right,
        beatFreq: frame.frequencies.beat
      }));

    } catch (error) {
      console.error('Failed to process audio frame:', error);
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
    if (websocket.state.lastMessage) {
      const message = websocket.state.lastMessage;
      
      switch (message.type) {
        case 'frame':
          if (message.data?.audio && typeof message.data.audio === 'object' && message.data.audio !== null && 'left' in message.data.audio && 'right' in message.data.audio) {
            processAudioFrame(message.data.audio as BackendAudioFrame);
          }
          if (message.data?.field && typeof message.data.field === 'object' && message.data.field !== null && 'field' in message.data.field && 'grid_size' in message.data.field) {
            processFieldFrame(message.data.field as BackendFieldFrame);
          }
          break;
          
        case 'session_started':
          setBackendConnected(true);
          break;
          
        case 'session_stopped':
          setBackendConnected(false);
          break;
          
        case 'error':
          console.error('Backend error:', message.data);
          break;
      }
    }
  }, [websocket.state.lastMessage, processAudioFrame, processFieldFrame]);

  // Start backend session
  const startBackendSession = useCallback(async (config: BinauralBeatConfig & { spatial_enabled?: boolean, spatial_settings?: Record<string, unknown> }) => {
    try {
      // Start session via API
      const response = await api.startSession({
        base_frequency: config.leftFreq,
        beat_frequency: config.beatFreq,
        amplitude: config.amplitude,
        spatial_enabled: config.spatial_enabled || false,
        spatial_settings: config.spatial_settings || {}
      });

      if (response.data?.session_id && typeof response.data.session_id === 'string') {
        const newSessionId = response.data.session_id;
        setSessionId(newSessionId);
        
        // Connect WebSocket
        websocket.connect(newSessionId);
        
        // Initialize audio context
        await initializeAudio();
        
        // Send start streaming command
        websocket.sendMessage({
          type: 'start_stream',
          data: {
            settings: {
              base_frequency: config.leftFreq,
              beat_frequency: config.beatFreq,
              amplitude: config.amplitude,
              spatial_enabled: config.spatial_enabled,
              spatial_settings: config.spatial_settings
            }
          }
        });

        setAudioState(prev => ({
          ...prev,
          isPlaying: true,
          leftFreq: config.leftFreq,
          rightFreq: config.rightFreq,
          beatFreq: config.beatFreq,
          context: audioContext.current
        }));
      }
    } catch (error) {
      console.error('Failed to start backend session:', error);
    }
  }, [api, websocket, initializeAudio]);

  // Stop backend session
  const stopBackendSession = useCallback(async () => {
    if (sessionId) {
      // Send stop command via WebSocket
      websocket.sendMessage({
        type: 'stop_stream'
      });

      // Stop session via API
      await api.stopSession(sessionId);

      // Disconnect WebSocket
      websocket.disconnect();

      setSessionId(null);
      setBackendConnected(false);
    }

    // Stop local audio
    if (audioSource.current) {
      audioSource.current.stop();
      audioSource.current = null;
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

  // Update settings in real-time
  const updateSettings = useCallback((settings: Record<string, unknown>) => {
    if (websocket.state.connected) {
      websocket.sendMessage({
        type: 'update_settings',
        data: { settings }
      });
    }
  }, [websocket]);

  // Load pattern with backend integration
  const loadPattern = useCallback((pattern: PatternConfig) => {
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
      stopBackendSession();
    }
    
    startBackendSession(config);
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
      stopBackendSession();
    };
  }, []);

  return {
    audioState,
    electromagnetic,
    sessionId,
    backendConnected,
    websocketState: websocket.state,
    startBackendSession,
    stopBackendSession,
    updateFrequency,
    updateVolume,
    updateSpatialSettings,
    loadPattern,
    updateSettings,
    isSupported: !!(window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
  };
};