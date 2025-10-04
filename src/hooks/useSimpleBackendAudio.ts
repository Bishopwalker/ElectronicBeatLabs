// SIMPLIFIED Backend Audio Engine Hook - NO BULLSHIT VERSION
// Cuts: Complex session management, buffer health monitoring, reconnection logic
// Keeps: Basic WebSocket, AudioWorklet, 8D spatial effects

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocketContext } from './useWebsocketContext';
import type {
  BackendAudioEngineState,
  BinauralBeatConfig
} from '../types';

interface SimpleAudioFrame {
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

export const useSimpleBackendAudio = () => {
  const [audioState, setAudioState] = useState<BackendAudioEngineState>({
    error: '',
    sessionId: '',
    connected: false,
    isPlaying: false,
    config: {
      amplitude: 0.3,
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

  const [isConnected, setIsConnected] = useState(false);

  // Audio processing refs
  const audioContext = useRef<AudioContext | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const audioWorkletNode = useRef<AudioWorkletNode | null>(null);

  // WebSocket hook
  const websocket = useWebSocketContext();

  // Initialize audio context - SIMPLIFIED
  const initializeAudio = useCallback(async (): Promise<boolean> => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize audio context:', error);
      return false;
    }
  }, []);

  // Initialize AudioWorklet - SIMPLIFIED
  const initializeAudioWorklet = useCallback(async (): Promise<boolean> => {
    if (!audioContext.current) return false;

    try {
      // Load simplified processor (NO COMPLEX BUFFERING)
      await audioContext.current.audioWorklet.addModule(`/simple-audio-processor.js?v=${Date.now()}`);

      // Create gain node
      if (!gainNode.current) {
        gainNode.current = audioContext.current.createGain();
        gainNode.current.gain.value = audioState.config?.amplitude || 0.3;
        gainNode.current.connect(audioContext.current.destination);
      }

      // Create AudioWorklet node
      if (!audioWorkletNode.current) {
        audioWorkletNode.current = new AudioWorkletNode(
          audioContext.current,
          'simple-audio-processor',
          {
            numberOfInputs: 0,
            numberOfOutputs: 1,
            outputChannelCount: [2],
            processorOptions: {
              volume: audioState.config?.amplitude || 0.3
            }
          }
        );

        // Handle messages from AudioWorklet
        audioWorkletNode.current.port.onmessage = (event) => {
          const message = event.data;
          if (message.type === 'frameProcessed') {
            // Optional: Update UI with buffer status
            // console.log('Frame processed, buffer size:', message.bufferSize);
          }
        };

        // Connect to audio graph
        audioWorkletNode.current.connect(gainNode.current);
        console.log('✅ Simple AudioWorklet connected');
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize AudioWorklet:', error);
      return false;
    }
  }, [audioState.config?.amplitude]);

  // Process incoming audio frames - SIMPLIFIED
  const processAudioFrame = useCallback((frame: SimpleAudioFrame) => {
    if (!audioWorkletNode.current) {
      console.warn('⚠️ No AudioWorklet available');
      return;
    }

    // Send frame directly to AudioWorklet
    audioWorkletNode.current.port.postMessage({
      type: 'audioFrame',
      data: {
        left: frame.left,
        right: frame.right,
        sample_rate: frame.sample_rate,
        frame_size: frame.frame_size
      }
    });

    // Update volume if needed
    const volumeParam = audioWorkletNode.current.parameters.get('volume');
    if (volumeParam && audioContext.current) {
      volumeParam.setValueAtTime(
        audioState.config?.amplitude || 0.3,
        audioContext.current.currentTime
      );
    }

    // Update frequency state
    setAudioState(prev => ({
      ...prev,
      config: {
        ...prev.config!,
        base_frequency: frame.frequencies.left,
        beat_frequency: frame.frequencies.beat
      }
    }));
  }, [audioState.config?.amplitude]);

  // Handle WebSocket messages - SIMPLIFIED
  useEffect(() => {
    if (websocket.lastMessage && websocket.sessionId) {
      const message = websocket.lastMessage;

      switch (message.type) {
        case 'frame': {
          const audioData = message.data?.audio;
          if (audioData && typeof audioData === 'object' && 'left' in audioData && 'right' in audioData) {
            processAudioFrame(audioData as SimpleAudioFrame);
          }
          break;
        }

        case 'session_started': {
          console.log('✅ Session started');
          setIsConnected(true);
          break;
        }

        case 'session_stopped': {
          console.log('🛑 Session stopped');
          setAudioState(prev => ({ ...prev, isPlaying: false }));
          break;
        }

        case 'error': {
          console.error('❌ Session error:', message.data);
          setAudioState(prev => ({ ...prev, error: message.data || 'Unknown error' }));
          break;
        }
      }
    }
  }, [websocket.lastMessage, websocket.sessionId, processAudioFrame]);

  // Start audio session - SIMPLIFIED
  const startSession = useCallback(async (config?: BinauralBeatConfig) => {
    console.log('🎵 Starting simple audio session...');

    try {
      // Initialize audio if needed
      const audioReady = await initializeAudio();
      if (!audioReady) {
        throw new Error('Failed to initialize audio');
      }

      const workletReady = await initializeAudioWorklet();
      if (!workletReady) {
        throw new Error('Failed to initialize AudioWorklet');
      }

      // Connect WebSocket if not connected
      if (!websocket.isConnected) {
        const base_frequency = config?.base_frequency || audioState.config?.base_frequency || 144;
        const beat_frequency = config?.beat_frequency || audioState.config?.beat_frequency || 4;
        websocket.connect(base_frequency, beat_frequency);

        // Wait for connection
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);

          const checkConnection = () => {
            if (websocket.isConnected) {
              clearTimeout(timeout);
              resolve();
            } else {
              setTimeout(checkConnection, 50);
            }
          };

          checkConnection();
        });
      }

      // Send start message with configuration
      const sessionConfig = {
        base_frequency: config?.base_frequency || audioState.config?.base_frequency || 144,
        beat_frequency: config?.beat_frequency || audioState.config?.beat_frequency || 4,
        amplitude: config?.amplitude || audioState.config?.amplitude || 0.3,
        spatial_enabled: config?.spatial?.enabled || audioState.config?.spatial?.enabled || true,
        spatial_settings: {
          movement_speed: 0.08,
          spatial_intensity: 0.85,
          reverb_enabled: true
        }
      };

      websocket.sendMessage({
        type: 'start_stream',
        data: { settings: sessionConfig }
      });

      // Start AudioWorklet
      if (audioWorkletNode.current) {
        audioWorkletNode.current.port.postMessage({ type: 'start' });
      }

      // Update state
      setAudioState(prev => ({
        ...prev,
        isPlaying: true,
        sessionId: websocket.sessionId || '',
        connected: true,
        error: ''
      }));

      console.log('✅ Simple audio session started');
    } catch (error) {
      console.error('❌ Failed to start session:', error);
      setAudioState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Session start failed'
      }));
      throw error;
    }
  }, [audioState.config, websocket, initializeAudio, initializeAudioWorklet]);

  // Stop audio session - SIMPLIFIED
  const stopSession = useCallback(async () => {
    console.log('🛑 Stopping simple audio session...');

    // Send stop message
    if (websocket.isConnected) {
      websocket.sendMessage({ type: 'stop_stream' });
    }

    // Stop AudioWorklet
    if (audioWorkletNode.current) {
      audioWorkletNode.current.port.postMessage({ type: 'stop' });
    }

    // Update state
    setAudioState(prev => ({
      ...prev,
      isPlaying: false
    }));

    console.log('✅ Simple audio session stopped');
  }, [websocket]);

  // Update volume - SIMPLIFIED
  const updateVolume = useCallback((volume: number) => {
    const safeVolume = Math.max(0, Math.min(1, volume));

    // Update AudioWorklet volume
    if (audioWorkletNode.current) {
      audioWorkletNode.current.port.postMessage({
        type: 'setVolume',
        volume: safeVolume
      });
    }

    // Update state
    setAudioState(prev => ({
      ...prev,
      config: {
        ...prev.config!,
        amplitude: safeVolume
      }
    }));

    // Send to backend
    if (websocket.isConnected) {
      websocket.sendMessage({
        type: 'update_settings',
        settings: { amplitude: safeVolume }
      });
    }
  }, [websocket]);

  // Update frequency - SIMPLIFIED
  const updateFrequency = useCallback((base_frequency: number, beat_frequency: number) => {
    if (websocket.isConnected) {
      websocket.sendMessage({
        type: 'update_settings',
        settings: {
          base_frequency: base_frequency,
          beat_frequency: beat_frequency
        }
      });
    }

    setAudioState(prev => ({
      ...prev,
      config: {
        ...prev.config!,
        base_frequency: base_frequency,
        beat_frequency: beat_frequency
      }
    }));
  }, [websocket]);

  // Enable spatial audio
  const enableSpatial = useCallback((settings?: Record<string, unknown>) => {
    const spatialSettings = settings || {
      movement_speed: 0.08,
      spatial_intensity: 0.85,
      reverb_enabled: true
    };

    if (websocket.isConnected) {
      websocket.sendMessage({
        type: 'enable_spatial',
        spatial_settings: spatialSettings
      });
    }
  }, [websocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioWorkletNode.current) {
        audioWorkletNode.current.disconnect();
        audioWorkletNode.current = null;
      }
      if (gainNode.current) {
        gainNode.current.disconnect();
        gainNode.current = null;
      }
    };
  }, []);

  // Compatibility methods for timer and existing components
  const startBinauralBeat = useCallback(async (config: BinauralBeatConfig) => {
    console.log('🔄 Compatibility: startBinauralBeat called, redirecting to startSession');
    return startSession(config);
  }, [startSession]);

  const stopBinauralBeat = useCallback(async () => {
    console.log('🔄 Compatibility: stopBinauralBeat called, redirecting to stopSession');
    return stopSession();
  }, [stopSession]);

  return {
    audioState,
    isConnected,
    websocketState: {
      connected: websocket.isConnected,
      connecting: websocket.isConnecting,
      error: websocket.error?.message || null
    },
    // New simplified methods
    startSession,
    stopSession,
    updateVolume,
    updateFrequency,
    enableSpatial,
    // Compatibility methods for existing components
    startBinauralBeat,
    stopBinauralBeat,
    isSupported: !!(window.AudioContext || (window as any).webkitAudioContext)
  };
};