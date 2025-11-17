/**
 * Backend-Integrated Audio Engine Hook
 * Combines local Web Audio API with backend-generated binaural beats and spatial effects
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useWebSocketContext } from './useWebsocketContext';
import type { BackendAudioEngineState, BinauralBeatConfig, ElectromagneticField, PatternConfig } from '../types';
import { DEFAULT_BASE_FREQUENCY, DEFAULT_BEAT_FREQUENCY, DEFAULT_VOLUME } from '../constants/audio.constants';

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

interface WebkitWindow extends Window {
  webkitAudioContext: typeof AudioContext;
}

const WEBSOCKET_CONNECTION_TIMEOUT_MS = 5000;
const SESSION_CONNECTION_TIMEOUT_MS = 10000;
const CONNECTION_CHECK_INTERVAL_MS = 100;
const SESSION_START_DELAY_MS = 100;
const MESSAGE_DEBOUNCE_MS = 16;
const MIN_VOLUME = 0;
const MAX_VOLUME = 2;
const SWEEP_MIN_STEPS = 10;
const SWEEP_STEP_DURATION_MS = 100;
const PROTOCOL_MINUTES_TO_MS = 60 * 1000;
const DEFAULT_PROTOCOL_DURATION_MINUTES = 10;

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
  const [firstFrameReceived, setFirstFrameReceived] = useState(false);
  const connectionPromiseRef = useRef<((value: boolean) => void) | null>(null);
  const pendingSettingsRef = useRef<Record<string, unknown> | null>(null);

  const audioContext = useRef<AudioContext | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const audioWorkletNode = useRef<AudioWorkletNode | null>(null);
  const analyserNode = useRef<AnalyserNode | null>(null);
  const workletLoaded = useRef<boolean>(false);
  const initializingWorklet = useRef<boolean>(false);

  const externalOutputNodeRef = useRef<GainNode | null>(null);
  const externalAnalyserRef = useRef<AnalyserNode | null>(null);
  const externalAudioContextRef = useRef<AudioContext | null>(null);

  const websocket = useWebSocketContext();

  const isWebSocketOpen = useCallback(() => {
    if (typeof (websocket as { isOpenSync?: () => boolean }).isOpenSync === 'function') {
      return (websocket as { isOpenSync: () => boolean }).isOpenSync();
    }
    return websocket.isConnected;
  }, [websocket]);

  const initializeAudio = useCallback(async (): Promise<AudioContext | null> => {
    if (externalAudioContextRef.current) {
      if (audioContext.current && audioContext.current !== externalAudioContextRef.current) {
        audioContext.current = null;
      }
      audioContext.current = externalAudioContextRef.current;
    } else {
      if (!audioContext.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as WebkitWindow).webkitAudioContext;
        audioContext.current = new AudioContextClass();
      }
    }

    if (audioContext.current.state === 'suspended') {
      await audioContext.current.resume();
    }

    setElectromagnetic(prev => ({
      ...prev,
      state: 'ACTIVE'
    }));

    return audioContext.current;
  }, []);

  const initializePersistentAudio = useCallback(async () => {
    if (!audioContext.current) return;

    if (initializingWorklet.current) {
      return;
    }

    if (audioWorkletNode.current) {
      audioWorkletNode.current.port.postMessage({ type: 'stop' });
      audioWorkletNode.current.port.postMessage({ type: 'clearBuffer' });
      audioWorkletNode.current.disconnect();
      audioWorkletNode.current = null;
    }

    initializingWorklet.current = true;

    if (!workletLoaded.current) {
      await audioContext.current.audioWorklet.addModule(`/backend-audio-processor.js?v=${Date.now()}`);
      workletLoaded.current = true;
    }

    const outputNode = externalOutputNodeRef.current;
    const analyser = externalAnalyserRef.current;

    if (outputNode) {
      analyserNode.current = analyser;
    } else {
      if (!gainNode.current) {
        gainNode.current = audioContext.current.createGain();
        gainNode.current.gain.value = audioState.config?.volume ?? DEFAULT_VOLUME;
        gainNode.current.connect(audioContext.current.destination);
      }

      if (!analyserNode.current) {
        analyserNode.current = audioContext.current.createAnalyser();
        analyserNode.current.fftSize = 2048;
        analyserNode.current.smoothingTimeConstant = 0.8;
        gainNode.current.disconnect();
        gainNode.current.connect(audioContext.current.destination);
        analyserNode.current.connect(gainNode.current);
      }
    }

    audioWorkletNode.current = new AudioWorkletNode(
      audioContext.current,
      'backend-audio-processor',
      {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [2],
        processorOptions: {
          volume: audioState.config?.volume ?? DEFAULT_VOLUME
        }
      }
    );

    audioWorkletNode.current.port.onmessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'metrics') {
        setElectromagnetic(prev => ({
          ...prev,
          ...message.data
        }));
      }
    };

    if (outputNode) {
      if (analyserNode.current) {
        audioWorkletNode.current.connect(analyserNode.current);
      }
      audioWorkletNode.current.connect(outputNode);
    } else if (gainNode.current) {
      if (analyserNode.current) {
        audioWorkletNode.current.connect(analyserNode.current);
      }
      audioWorkletNode.current.connect(gainNode.current);
    }

    initializingWorklet.current = false;
  }, [audioState.config?.volume]);

  useEffect(() => {
    if (!audioWorkletNode.current || !audioContext.current) return;

    const volumeParam = audioWorkletNode.current.parameters.get('volume');
    if (volumeParam && audioState.config?.volume !== undefined) {
      volumeParam.setValueAtTime(audioState.config.volume, audioContext.current.currentTime);
    }
  }, [audioState.config?.volume]);

  const processAudioFrame = useCallback((frame: BackendAudioFrame | ArrayBuffer) => {
    if (!audioContext.current || !audioWorkletNode.current) return;

    if (!firstFrameReceived) {
      setFirstFrameReceived(true);
    }

    if (frame instanceof ArrayBuffer) {
      audioWorkletNode.current.port.postMessage({
        type: 'audioFrame',
        data: frame
      });
      return;
    }

    audioWorkletNode.current.port.postMessage({
      type: 'audioFrame',
      data: {
        left: frame.left,
        right: frame.right,
        sample_rate: frame.sample_rate,
        frame_size: frame.frame_size
      }
    });

    setAudioState(prev => ({
      ...prev,
      config: {
        ...prev.config!,
        base_frequency: frame.frequencies.left,
        beat_frequency: frame.frequencies.beat,
        volume: audioState.config?.volume,
        duration: audioContext.current?.currentTime || Date.now()
      }
    }));
  }, [audioState.config?.volume, firstFrameReceived]);

  const processFieldFrame = useCallback((frame: BackendFieldFrame) => {
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

  useEffect(() => {
    if (waitingForConnection && websocket.isConnected && connectionPromiseRef.current) {
      connectionPromiseRef.current(true);
      connectionPromiseRef.current = null;
      setWaitingForConnection(false);
    }
  }, [websocket.isConnected, waitingForConnection]);

  useEffect(() => {
    if (websocket.sessionId && !sessionId) {
      setSessionId(websocket.sessionId);
    }
  }, [websocket.sessionId, sessionId]);

  useEffect(() => {
    websocket.registerFrameHandler((message: { type: string; data: unknown }) => {
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

  const lastProcessedMessageRef = useRef<number>(0);

  useEffect(() => {
    const handleMessage = async () => {
      if (websocket.lastMessage && sessionId) {
        const message = websocket.lastMessage;

        if (message.type === 'frame' || message.type === 'audio_frame') {
          const now = Date.now();
          if (now - lastProcessedMessageRef.current < MESSAGE_DEBOUNCE_MS) {
            return;
          }
          lastProcessedMessageRef.current = now;
        }

        switch (message.type) {
          case 'frame':
          case 'audio_frame': {
            const audioData = message.data;

            if (audioData && typeof audioData === 'object' && (audioData as { error?: string }).error) {
              if ((audioData as { error: string }).error === 'Session not found') {
                if (audioWorkletNode.current) {
                  audioWorkletNode.current.port.postMessage({ type: 'clearBuffer' });
                  audioWorkletNode.current.disconnect();
                  audioWorkletNode.current = null;
                }
                setAudioState(prev => ({ ...prev, isPlaying: false }));
                setSessionId(null);
                setBackendConnected(false);
                setTimeout(() => websocket.disconnect(), SESSION_START_DELAY_MS);
              }
              return;
            }

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
            if (pendingSettingsRef.current && websocket.isConnected) {
              websocket.sendMessage({
                type: 'update_settings',
                data: pendingSettingsRef.current
              });
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
        }
      }
    };

    handleMessage();
  }, [websocket.lastMessage, sessionId, processAudioFrame, processFieldFrame, initializeAudio, initializePersistentAudio, websocket]);

  const connectBackend = useCallback(async () => {
    if (backendConnected) {
      return;
    }

    if (websocket.isConnecting) {
      return;
    }

    if (isWebSocketOpen()) {
      setBackendConnected(true);
      if (websocket.sessionId && !sessionId) {
        setSessionId(websocket.sessionId);
      }
      return;
    }

    const httpProtocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = window.location.hostname;
    const port = (import.meta as { env?: { DEV?: boolean } }).env?.DEV ? '8000' : (window.location.port || (httpProtocol === 'https:' ? '443' : '80'));
    const healthUrl = `${httpProtocol}//${host}:${port}/health`;
    await fetch(healthUrl, { mode: 'no-cors' }).catch(() => undefined);

    if (!isWebSocketOpen() && !websocket.isConnecting) {
      websocket.connect();

      const wsConnected = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          resolve(false);
        }, WEBSOCKET_CONNECTION_TIMEOUT_MS);

        const checkConnection = () => {
          if (isWebSocketOpen()) {
            clearTimeout(timeout);
            resolve(true);
          } else {
            setTimeout(checkConnection, CONNECTION_CHECK_INTERVAL_MS);
          }
        };

        checkConnection();
      });

      if (!wsConnected) {
        setBackendConnected(false);
        throw new Error('WebSocket connection failed - backend may not be ready yet');
      }
    }

    const actuallyConnected = isWebSocketOpen();
    setBackendConnected(actuallyConnected);

    if (websocket.sessionId && !sessionId) {
      setSessionId(websocket.sessionId);
    }

    if (!actuallyConnected) {
      throw new Error('Backend connection failed - WebSocket not connected');
    }
  }, [backendConnected, sessionId, websocket, isWebSocketOpen]);

  const stopBackendSession = useCallback(async () => {
    if (sessionId) {
      websocket.sendMessage({ type: 'stop_stream' });
      websocket.sendMessage({ type: 'stop_session' });

      setSessionId(null);
      setBackendConnected(false);
      setFirstFrameReceived(false);
    }

    if (audioWorkletNode.current) {
      audioWorkletNode.current.port.postMessage({ type: 'stop' });
      audioWorkletNode.current.port.postMessage({ type: 'clearBuffer' });
    }

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

  const startBackendSession = useCallback(async (config?: BinauralBeatConfig & {
    spatial_enabled?: boolean;
    spatial_settings?: Record<string, unknown>;
  }) => {
    if (startingSession) {
      return;
    }

    setStartingSession(true);

    if (sessionId) {
      await stopBackendSession();
      await new Promise(resolve => setTimeout(resolve, SESSION_START_DELAY_MS));
    }

    const sessionConfig: BackendSessionConfig = config ? {
      base_frequency: !isNaN(config.base_frequency) ? config.base_frequency : DEFAULT_BASE_FREQUENCY,
      beat_frequency: !isNaN(config.beat_frequency) ? config.beat_frequency : DEFAULT_BEAT_FREQUENCY,
      volume: !isNaN(config.volume) ? config.volume : DEFAULT_VOLUME,
      spatial_enabled: config.spatial_enabled || false,
      spatial_settings: config.spatial_settings || {}
    } : {
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

    if (!websocket.isConnected && !websocket.isConnecting) {
      if (typeof websocket.connect === 'function') {
        websocket.connect();
      }

      setWaitingForConnection(true);

      const connected = await new Promise<boolean>((resolve) => {
        connectionPromiseRef.current = resolve;

        const timeout = setTimeout(() => {
          if (connectionPromiseRef.current) {
            connectionPromiseRef.current(false);
            connectionPromiseRef.current = null;
            setWaitingForConnection(false);
          }
        }, SESSION_CONNECTION_TIMEOUT_MS);

        if (isWebSocketOpen()) {
          clearTimeout(timeout);
          resolve(true);
          connectionPromiseRef.current = null;
          setWaitingForConnection(false);
        }
      });

      if (!connected) {
        setStartingSession(false);
        throw new Error('WebSocket connection timeout or error');
      }
    } else if (websocket.isConnecting) {
      setWaitingForConnection(true);

      const connected = await new Promise<boolean>((resolve) => {
        connectionPromiseRef.current = resolve;

        const timeout = setTimeout(() => {
          if (connectionPromiseRef.current) {
            connectionPromiseRef.current(false);
            connectionPromiseRef.current = null;
            setWaitingForConnection(false);
          }
        }, SESSION_CONNECTION_TIMEOUT_MS);

        if (isWebSocketOpen()) {
          clearTimeout(timeout);
          resolve(true);
          connectionPromiseRef.current = null;
          setWaitingForConnection(false);
        }
      });

      if (!connected) {
        setStartingSession(false);
        throw new Error('WebSocket connection failed');
      }
    } else if (!websocket.isConnected) {
      websocket.connect();

      setWaitingForConnection(true);
      const connected = await new Promise<boolean>((resolve) => {
        connectionPromiseRef.current = resolve;

        const timeout = setTimeout(() => {
          if (connectionPromiseRef.current) {
            connectionPromiseRef.current(false);
            connectionPromiseRef.current = null;
            setWaitingForConnection(false);
          }
        }, SESSION_CONNECTION_TIMEOUT_MS);

        if (isWebSocketOpen()) {
          clearTimeout(timeout);
          resolve(true);
          connectionPromiseRef.current = null;
          setWaitingForConnection(false);
        }
      });

      if (!connected) {
        setStartingSession(false);
        throw new Error('WebSocket connection failed in fallback');
      }
    }

    if (isWebSocketOpen()) {
      const wsSessionId = websocket.sessionId;
      const newSessionId = wsSessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);

      await new Promise(resolve => setTimeout(resolve, SESSION_START_DELAY_MS));

      websocket.sendMessage({
        type: 'start_stream',
        data: sessionConfig
      });

      const context = await initializeAudio();
      if (context) {
        await initializePersistentAudio();

        if (gainNode.current) {
          gainNode.current.gain.setValueAtTime(sessionConfig.volume, context.currentTime);
        }

        if (audioWorkletNode.current) {
          audioWorkletNode.current.port.postMessage({ type: 'start' });
        }
      }

      const computedLeft = sessionConfig.base_frequency;
      const computedRight = sessionConfig.base_frequency + sessionConfig.beat_frequency;
      setAudioState(prev => ({
        ...prev,
        isPlaying: true,
        config: {
          ...prev.config!,
          base_frequency: sessionConfig.base_frequency,
          beat_frequency: sessionConfig.beat_frequency,
          volume: sessionConfig.volume
        },
        leftFreq: computedLeft,
        rightFreq: computedRight,
        beat_frequency: sessionConfig.beat_frequency
      }));

      if (pendingSettingsRef.current) {
        websocket.sendMessage({
          type: 'update_settings',
          data: pendingSettingsRef.current
        });
        pendingSettingsRef.current = null;
      }
    }

    setStartingSession(false);
  }, [sessionId, stopBackendSession, audioState, websocket, initializeAudio, initializePersistentAudio, startingSession, isWebSocketOpen]);

  const updateSettings = useCallback((settings: Record<string, unknown>) => {
    if (isWebSocketOpen() && sessionId) {
      websocket.sendMessage({
        type: 'update_settings',
        data: settings
      });
    } else {
      pendingSettingsRef.current = {
        ...(pendingSettingsRef.current || {}),
        ...settings
      };
    }
  }, [websocket, sessionId, isWebSocketOpen]);

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

  const updateFrequency = useCallback((baseFrequency: number, beatFrequency: number) => {
    const frequencyUpdate = {
      base_frequency: baseFrequency,
      beat_frequency: beatFrequency,
      volume: audioState.config?.volume ?? DEFAULT_VOLUME,
      spatial_enabled: audioState.config?.spatial?.enabled || false,
      spatial_settings: audioState.config?.spatial || {}
    };

    updateSettings(frequencyUpdate);

    setAudioState(prev => ({
      ...prev,
      config: {
        ...prev.config!,
        base_frequency: baseFrequency,
        beat_frequency: beatFrequency
      },
      leftFreq: baseFrequency,
      rightFreq: baseFrequency + beatFrequency,
      beat_frequency: beatFrequency
    }));
  }, [updateSettings, audioState.config]);

  const updateVolume = useCallback((volume: number) => {
    const safeVolume = isNaN(volume) ? DEFAULT_VOLUME : Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, volume));

    updateSettings({ volume: safeVolume });

    if (gainNode.current && audioContext.current) {
      gainNode.current.gain.setValueAtTime(safeVolume, audioContext.current.currentTime);
    }

    setAudioState(prev => ({
      ...prev,
      config: {
        ...prev.config!,
        volume: safeVolume
      }
    }));
  }, [updateSettings]);

  const updateSpatialSettings = useCallback((spatialSettings: Record<string, unknown>) => {
    if (isWebSocketOpen() && sessionId) {
      websocket.sendMessage({
        type: 'enable_spatial',
        spatial_settings: spatialSettings
      });
    }
  }, [websocket, sessionId, isWebSocketOpen]);

  const disconnectBackend = useCallback(async () => {
    if (sessionId) {
      await stopBackendSession();
    }

    if (isWebSocketOpen()) {
      websocket.disconnect();
    }

    setSessionId(null);
    setBackendConnected(false);
  }, [sessionId, stopBackendSession, websocket, isWebSocketOpen]);

  const startBinauralBeat = useCallback(async (config: BinauralBeatConfig) => {
    if (!audioContext.current) {
      const ctx = await initializeAudio();
      if (!ctx) {
        throw new Error('Failed to initialize audio context');
      }
    }

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

    await startBackendSession(sessionConfig);
  }, [sessionId, websocket, startBackendSession, initializeAudio, initializePersistentAudio]);

  const stopBinauralBeat = useCallback(async () => {
    await stopBackendSession();
  }, [stopBackendSession]);

  const updateWaveform = useCallback((waveform: 'sine' | 'square' | 'triangle' | 'sawtooth') => {
    updateSettings({ waveform });
  }, [updateSettings]);

  const generateTestTones = useCallback((leftFreq: number, rightFreq: number, duration = 5000) => {
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

  const frequencySweep = useCallback(async (startFreq: number, endFreq: number, duration: number) => {
    if (!sessionId || !isWebSocketOpen()) {
      return;
    }

    const steps = Math.max(SWEEP_MIN_STEPS, Math.floor(duration / SWEEP_STEP_DURATION_MS));
    const stepDuration = duration / steps;
    const freqStep = (endFreq - startFreq) / steps;

    for (let i = 0; i <= steps; i++) {
      const currentFreq = startFreq + (freqStep * i);

      await updateSettings({
        base_frequency: currentFreq,
        beat_frequency: DEFAULT_BEAT_FREQUENCY
      });

      if (i < steps) {
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
    }
  }, [sessionId, updateSettings, isWebSocketOpen]);

  const createGammaProtocol = useCallback((protocol: { gammaFreq?: number; intensity?: number; duration?: number }) => {
    const config: BinauralBeatConfig = {
      base_frequency: DEFAULT_BASE_FREQUENCY,
      beat_frequency: protocol.gammaFreq || 40,
      volume: (protocol.intensity || 70) / 100,
      waveform: 'sine'
    };

    startBinauralBeat(config);

    setTimeout(() => {
      stopBinauralBeat();
    }, (protocol.duration || DEFAULT_PROTOCOL_DURATION_MINUTES) * PROTOCOL_MINUTES_TO_MS);
  }, [startBinauralBeat, stopBinauralBeat]);

  const setExternalNodes = useCallback((
    outputGainNode: GainNode | null,
    analyserNodeParam: AnalyserNode | null,
    audioContextParam?: AudioContext | null
  ) => {
    externalOutputNodeRef.current = outputGainNode;
    externalAnalyserRef.current = analyserNodeParam;

    if (audioContextParam) {
      externalAudioContextRef.current = audioContextParam;
    }
  }, []);

  useEffect(() => {
    return () => {
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
    setExternalNodes,
    isSupported: !!(window.AudioContext || (window as unknown as WebkitWindow).webkitAudioContext),
    audioContext: audioContext.current,
    analyserNode: externalAnalyserRef.current || analyserNode.current,
    audioWorkletStatus: {
      moduleLoaded: workletLoaded.current,
      nodeExists: !!audioWorkletNode.current,
      nodeReference: audioWorkletNode.current,
      isProcessing: audioState.isPlaying && !!audioWorkletNode.current && firstFrameReceived
    }
  };
};
