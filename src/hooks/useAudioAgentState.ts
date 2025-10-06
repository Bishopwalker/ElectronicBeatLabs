import { useState, useEffect, useCallback, useRef } from 'react';

// Audio Agent State Types
interface AudioAgentState {
  // Connection status
  isConnected: boolean;
  isInitialized: boolean;
  lastUpdate: number;

  // Agent status
  agentStatus: 'idle' | 'generating' | 'streaming' | 'error';
  sessionId: string | null;
  error: string | null;

  // Audio configuration
  audioConfig: {
    type: 'binaural' | 'isochronic' | 'em_field';
    baseFrequency: number;
    beatFrequency: number;
    amplitude: number;
    duration: number;
    sampleRate: number;
  };

  // Real-time audio metrics
  audioMetrics: {
    isPlaying: boolean;
    currentFrequencyLeft: number;
    currentFrequencyRight: number;
    actualBeatFrequency: number;
    qualityScore: number;
    bufferHealth: 'good' | 'warning' | 'critical';
    bufferMs: number;
    underruns: number;
  };

  // Engine performance
  engineState: {
    activeGenerators: number;
    cpuUsage: number;
    memoryUsage: number;
    streamRate: number;
    chunkSize: number;
    errorCount: number;
  };
}

interface AudioAgentActions {
  // Connection management
  connect: () => Promise<boolean>;
  disconnect: () => void;

  // Audio generation
  generateAudio: (config: Partial<AudioAgentState['audioConfig']>) => Promise<void>;
  stopAudio: () => void;

  // Configuration
  updateConfig: (config: Partial<AudioAgentState['audioConfig']>) => void;
  loadPreset: (presetName: string) => Promise<void>;

  // State management
  syncWithBackend: () => Promise<void>;
  resetState: () => void;
}

const initialState: AudioAgentState = {
  isConnected: false,
  isInitialized: false,
  lastUpdate: 0,

  agentStatus: 'idle',
  sessionId: null,
  error: null,

  audioConfig: {
    type: 'binaural',
    baseFrequency: 200,
    beatFrequency: 10,
    amplitude: 0.5,
    duration: 60,
    sampleRate: 44100
  },

  audioMetrics: {
    isPlaying: false,
    currentFrequencyLeft: 0,
    currentFrequencyRight: 0,
    actualBeatFrequency: 0,
    qualityScore: 0,
    bufferHealth: 'good',
    bufferMs: 0,
    underruns: 0
  },

  engineState: {
    activeGenerators: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    streamRate: 30,
    chunkSize: 1024,
    errorCount: 0
  }
};

export const useAudioAgentState = (): [AudioAgentState, AudioAgentActions] => {
  const [state, setState] = useState<AudioAgentState>(initialState);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate unique session ID
  const generateSessionId = useCallback(() => {
    return `audio-agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Connect to Audio Agent WebSocket
  const connect = useCallback(async (): Promise<boolean> => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return true;
      }

      const sessionId = generateSessionId();
      const wsUrl = `ws://localhost:8000/api/agents/audio/stream`;

      wsRef.current = new WebSocket(wsUrl);

      return new Promise((resolve) => {
        if (!wsRef.current) {
          resolve(false);
          return;
        }

        wsRef.current.onopen = () => {
          console.log('🎵 Audio Agent WebSocket connected');
          setState(prev => ({
            ...prev,
            isConnected: true,
            sessionId,
            agentStatus: 'idle',
            error: null,
            lastUpdate: Date.now()
          }));
          resolve(true);
        };

        wsRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        wsRef.current.onclose = () => {
          console.log('🎵 Audio Agent WebSocket disconnected');
          setState(prev => ({
            ...prev,
            isConnected: false,
            agentStatus: 'idle'
          }));

          // Auto-reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        };

        wsRef.current.onerror = (error) => {
          console.error('Audio Agent WebSocket error:', error);
          setState(prev => ({
            ...prev,
            error: 'WebSocket connection error',
            agentStatus: 'error'
          }));
          resolve(false);
        };
      });

    } catch (error) {
      console.error('Failed to connect to Audio Agent:', error);
      setState(prev => ({
        ...prev,
        error: 'Connection failed',
        agentStatus: 'error'
      }));
      return false;
    }
  }, [generateSessionId]);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'agent_status':
        setState(prev => ({
          ...prev,
          isInitialized: message.data.initialized,
          engineState: {
            ...prev.engineState,
            ...message.data.engine_state
          },
          lastUpdate: Date.now()
        }));
        break;

      case 'audio_metrics':
        setState(prev => ({
          ...prev,
          audioMetrics: {
            ...prev.audioMetrics,
            ...message.data
          },
          lastUpdate: Date.now()
        }));
        break;

      case 'generation_started':
        setState(prev => ({
          ...prev,
          agentStatus: 'generating',
          audioMetrics: {
            ...prev.audioMetrics,
            isPlaying: true
          }
        }));
        break;

      case 'generation_completed':
        setState(prev => ({
          ...prev,
          agentStatus: 'idle',
          audioMetrics: {
            ...prev.audioMetrics,
            qualityScore: message.data.quality_score || 0
          }
        }));
        break;

      case 'error':
        setState(prev => ({
          ...prev,
          error: message.data.message,
          agentStatus: 'error'
        }));
        break;

      default:
        console.log('Unknown Audio Agent message:', message);
    }
  }, []);

  // Generate audio with current configuration
  const generateAudio = useCallback(async (config: Partial<AudioAgentState['audioConfig']>) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to Audio Agent');
    }

    const fullConfig = { ...state.audioConfig, ...config };

    setState(prev => ({
      ...prev,
      audioConfig: fullConfig,
      agentStatus: 'generating',
      error: null
    }));

    // Send generation request via WebSocket
    wsRef.current.send(JSON.stringify({
      type: 'generate_audio',
      data: {
        session_id: state.sessionId,
        config: fullConfig
      }
    }));

    // Also call HTTP API for analysis
    try {
      const response = await fetch('/api/agents/audio/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: fullConfig.type,
          config: {
            base_frequency: fullConfig.baseFrequency,
            beat_frequency: fullConfig.beatFrequency,
            duration: Math.min(fullConfig.duration, 30),
            amplitude: fullConfig.amplitude
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        setState(prev => ({
          ...prev,
          audioMetrics: {
            ...prev.audioMetrics,
            qualityScore: result.data.quality_score || 0,
            currentFrequencyLeft: fullConfig.baseFrequency - (fullConfig.beatFrequency / 2),
            currentFrequencyRight: fullConfig.baseFrequency + (fullConfig.beatFrequency / 2),
            actualBeatFrequency: fullConfig.beatFrequency
          }
        }));
      }
    } catch (error) {
      console.error('Error calling Audio Agent API:', error);
    }

  }, [state.audioConfig, state.sessionId]);

  // Stop audio generation
  const stopAudio = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'stop_audio',
        session_id: state.sessionId
      }));
    }

    setState(prev => ({
      ...prev,
      agentStatus: 'idle',
      audioMetrics: {
        ...prev.audioMetrics,
        isPlaying: false
      }
    }));
  }, [state.sessionId]);

  // Update configuration
  const updateConfig = useCallback((config: Partial<AudioAgentState['audioConfig']>) => {
    setState(prev => ({
      ...prev,
      audioConfig: {
        ...prev.audioConfig,
        ...config
      }
    }));
  }, []);

  // Load preset from backend
  const loadPreset = useCallback(async (presetName: string) => {
    try {
      const response = await fetch('/api/agents/audio/patterns');
      if (response.ok) {
        const data = await response.json();
        const preset = data.frequency_presets[presetName];

        if (preset) {
          updateConfig({
            baseFrequency: preset.base_frequency,
            beatFrequency: preset.beat_frequencies[0] || 10,
            duration: preset.duration
          });
        }
      }
    } catch (error) {
      console.error('Error loading preset:', error);
      setState(prev => ({
        ...prev,
        error: `Failed to load preset: ${presetName}`
      }));
    }
  }, [updateConfig]);

  // Sync with backend status
  const syncWithBackend = useCallback(async () => {
    try {
      const response = await fetch('/api/agents/audio/status');
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          isInitialized: data.engine_state.is_initialized,
          engineState: {
            ...prev.engineState,
            activeGenerators: data.engine_state.active_generators,
            errorCount: data.engine_state.error_count
          },
          lastUpdate: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error syncing with backend:', error);
    }
  }, []);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      agentStatus: 'idle'
    }));
  }, []);

  // Reset state to initial values
  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  // Auto-connect on mount and sync periodically
  useEffect(() => {
    connect();

    // Sync with backend every 5 seconds
    const syncInterval = setInterval(syncWithBackend, 5000);

    return () => {
      clearInterval(syncInterval);
      disconnect();
    };
  }, [connect, syncWithBackend, disconnect]);

  const actions: AudioAgentActions = {
    connect,
    disconnect,
    generateAudio,
    stopAudio,
    updateConfig,
    loadPreset,
    syncWithBackend,
    resetState
  };

  return [state, actions];
};