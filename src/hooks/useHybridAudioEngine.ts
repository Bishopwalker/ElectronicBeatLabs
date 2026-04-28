/**
 * Hybrid Audio Engine Hook
 * Combines frontend and backend engines with seamless crossfading
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAudioEngine } from './useAudioEngine';
import { useBackendAudioEngine } from './useBackendAudioEngine';
import { AudioMixer } from '../utils/AudioMixer';
import type { BinauralBeatConfig, PatternConfig } from '../types';
import { DEFAULT_BASE_FREQUENCY, DEFAULT_BEAT_FREQUENCY, DEFAULT_VOLUME } from '../constants/audio.constants';

const MIXER_INIT_DELAY_MS = 100;
const CROSSFADE_DURATION_SECONDS = 2.0;

export const useHybridAudioEngine = () => {
  const frontendEngine = useAudioEngine();
  const backendEngine = useBackendAudioEngine();

  const mixerRef = useRef<AudioMixer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentEngine, setCurrentEngine] = useState<'frontend' | 'backend' | 'hybrid'>('frontend');
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const previousBackendConnected = useRef(backendEngine.backendConnected);

  const initializeMixer = useCallback(async () => {
    if (mixerRef.current) {
      return;
    }

    if (!frontendEngine.audioContext) {
      await frontendEngine.initializeAudio();
    }

    if (frontendEngine.audioContext) {
      mixerRef.current = new AudioMixer(frontendEngine.audioContext);
      setAnalyserNode(mixerRef.current.analyserNode);

      const wasPlaying = frontendEngine.audioState.isPlaying;
      const currentConfig = wasPlaying ? {
        base_frequency: frontendEngine.audioState.leftFreq || DEFAULT_BASE_FREQUENCY,
        beat_frequency: frontendEngine.audioState.beat_frequency || DEFAULT_BEAT_FREQUENCY,
        volume: frontendEngine.audioState.volume || DEFAULT_VOLUME,
        waveform: frontendEngine.audioState.waveform || 'sine'
      } : null;

      if (wasPlaying) {
        frontendEngine.stopBinauralBeat();
        await new Promise(resolve => setTimeout(resolve, MIXER_INIT_DELAY_MS));
      }

      frontendEngine.setExternalNodes(
        mixerRef.current.getFrontendInput(),
        mixerRef.current.analyserNode,
        frontendEngine.audioContext
      );

      backendEngine.setExternalNodes(
        mixerRef.current.getBackendInput(),
        mixerRef.current.analyserNode,
        frontendEngine.audioContext
      );

      if (wasPlaying && currentConfig) {
        await frontendEngine.startBinauralBeat(currentConfig);
      }

      setIsInitialized(true);
    }
  }, [frontendEngine, backendEngine]);

  useEffect(() => {
    if (frontendEngine.audioContext && !mixerRef.current) {
      initializeMixer();
    }
  }, [!!frontendEngine.audioContext, initializeMixer]);

  useEffect(() => {
    const backendNowConnected = backendEngine.backendConnected && !!backendEngine.sessionId;
    const backendWasConnected = previousBackendConnected.current;
    const isAudioPlaying = frontendEngine.audioState.isPlaying || backendEngine.audioState.isPlaying;
    const backendHasAudioData = backendEngine.audioWorkletStatus?.isProcessing || false;

    if (backendNowConnected && !backendWasConnected && mixerRef.current) {
      if (isAudioPlaying && backendHasAudioData) {
        mixerRef.current.crossfadeToBackend(CROSSFADE_DURATION_SECONDS);
        setCurrentEngine('backend');
      }
    }

    if (!backendNowConnected && backendWasConnected && mixerRef.current) {
      if (isAudioPlaying) {
        mixerRef.current.failoverToFrontend();
        setCurrentEngine('frontend');
      }
    }

    previousBackendConnected.current = backendNowConnected;
  }, [
    backendEngine.backendConnected,
    backendEngine.sessionId,
    backendEngine.audioWorkletStatus?.isProcessing,
    frontendEngine.audioState.isPlaying,
    backendEngine.audioState.isPlaying
  ]);

  const startBinauralBeat = useCallback(async (config: BinauralBeatConfig) => {
    if (!mixerRef.current) {
      await initializeMixer();
    }

    await frontendEngine.startBinauralBeat(config);

    if (!mixerRef.current) {
      await initializeMixer();
    }
    
    // Apply waveform compensation when starting
    if (mixerRef.current && config.waveform) {
      mixerRef.current.updateWaveformCompensation(config.waveform);
    }

    if (frontendEngine.setAudioState) {
      frontendEngine.setAudioState((prev: ReturnType<typeof frontendEngine.audioState>) => ({
        ...prev,
        isPlaying: true
      }));
    }

    setCurrentEngine('frontend');

    backendEngine.startBackendSession(config).then(() => {
      if (backendEngine.audioState) {
        backendEngine.audioState.isPlaying = true;
      }
    }).catch(() => {
      // Backend connection failed - frontend audio continues playing
    });
  }, [frontendEngine, backendEngine, initializeMixer]);

  const stopBinauralBeat = useCallback(async () => {
    if (frontendEngine.audioState) {
      frontendEngine.stopBinauralBeat();

      if (frontendEngine.setAudioState) {
        frontendEngine.setAudioState((prev: ReturnType<typeof frontendEngine.audioState>) => ({
          ...prev,
          isPlaying: false
        }));
      }
    }

    if (backendEngine.audioState) {
      await backendEngine.stopBinauralBeat();
      backendEngine.audioState.isPlaying = false;
    }
  }, [frontendEngine, backendEngine]);

  const updateFrequency = useCallback((leftFreq: number, rightFreq: number) => {
    const beatFreq = Math.abs(rightFreq - leftFreq);
    const baseFreq = Math.min(leftFreq, rightFreq);

    frontendEngine.updateFrequency(leftFreq, rightFreq);

    if (backendEngine.updateFrequency) {
      backendEngine.updateFrequency(baseFreq, beatFreq);
    }
  }, [frontendEngine, backendEngine]);

  const updateSettings = useCallback((settings: { base_frequency?: number; beat_frequency?: number }) => {
    if (backendEngine.updateSettings) {
      backendEngine.updateSettings(settings);
    }

    if (settings.base_frequency !== undefined && settings.beat_frequency !== undefined) {
      const leftFreq = settings.base_frequency;
      const rightFreq = settings.base_frequency + settings.beat_frequency;
      frontendEngine.updateFrequency(leftFreq, rightFreq);
    }
  }, [frontendEngine, backendEngine]);

  const updateVolume = useCallback((volume: number) => {
    const safeVolume = isNaN(volume) ? DEFAULT_VOLUME : Math.max(0, Math.min(2, volume));

    if (mixerRef.current) {
      mixerRef.current.setMasterVolume(safeVolume);
    }
  }, []);

  const updateWaveform = useCallback((waveform: 'sine' | 'square' | 'triangle' | 'sawtooth') => {
    // Update frontend engine waveform
    frontendEngine.updateWaveform(waveform);
    
    // Apply waveform compensation in mixer to prevent distortion
    if (mixerRef.current) {
      mixerRef.current.updateWaveformCompensation(waveform);
    }
  }, [frontendEngine]);

  const updateSpatialSettings = useCallback((spatialSettings: Record<string, unknown>) => {
    if (backendEngine.backendConnected) {
      const baseFreq = frontendEngine.audioState.leftFreq || backendEngine.audioState.config?.base_frequency || DEFAULT_BASE_FREQUENCY;
      const beatFreq = frontendEngine.audioState.beat_frequency || backendEngine.audioState.config?.beat_frequency || DEFAULT_BEAT_FREQUENCY;

      backendEngine.updateSettings({
        spatial_settings: spatialSettings,
        base_frequency: baseFreq,
        beat_frequency: beatFreq
      });
    }
  }, [backendEngine, frontendEngine.audioState.leftFreq, frontendEngine.audioState.beat_frequency]);

  const loadPattern = useCallback(async (pattern: PatternConfig) => {
    const config: BinauralBeatConfig = {
      base_frequency: pattern.frequencies.carrier,
      beat_frequency: pattern.frequencies.beat,
      waveform: 'sine',
      volume: DEFAULT_VOLUME
    };

    await startBinauralBeat(config);
  }, [startBinauralBeat]);

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

  const frequencySweep = useCallback((
    startFreq: number,
    endFreq: number,
    duration: number,
    beatFrequency: number
  ) => {
    if (currentEngine === 'backend' && backendEngine.backendConnected) {
      backendEngine.frequencySweep(startFreq, endFreq, duration);
    } else {
      frontendEngine.frequencySweep(startFreq, endFreq, duration, beatFrequency);
    }
  }, [currentEngine, frontendEngine, backendEngine]);

  const createGammaProtocol = useCallback((protocol: { gammaFreq?: number; intensity?: number; duration?: number }) => {
    frontendEngine.createGammaProtocol(protocol);
  }, [frontendEngine]);

  const initializeAudio = useCallback(async () => {
    const context = await frontendEngine.initializeAudio();
    if (context) {
      if (frontendEngine.setAudioState) {
        frontendEngine.setAudioState((prev: ReturnType<typeof frontendEngine.audioState>) => ({
          ...prev,
          context
        }));
      }

      if (!mixerRef.current) {
        await initializeMixer();
      }

      return context;
    }
    return null;
  }, [frontendEngine, initializeMixer]);

  useEffect(() => {
    const autoInitialize = async () => {
      if (!frontendEngine.audioContext) {
        const context = await frontendEngine.initializeAudio();
        if (context && !mixerRef.current) {
          await initializeMixer();
        }
      } else if (frontendEngine.audioContext && !mixerRef.current) {
        await initializeMixer();
      }
    };

    autoInitialize();
  }, [!!frontendEngine.audioContext, initializeMixer]);

  useEffect(() => {
    return () => {
      if (mixerRef.current) {
        mixerRef.current.destroy();
        mixerRef.current = null;
      }
    };
  }, []);

  const isPlaying = frontendEngine.audioState.isPlaying || backendEngine.audioState.isPlaying;

  const defaultElectromagnetic = {
    strength: 0,
    frequency: DEFAULT_BEAT_FREQUENCY,
    phase: 0,
    coherence: 0,
    resonance: 0,
    state: 'INACTIVE' as const,
    stability: 0
  };

  const electromagnetic = currentEngine === 'backend'
    ? { ...defaultElectromagnetic, ...backendEngine.electromagnetic }
    : { ...defaultElectromagnetic, ...frontendEngine.electromagnetic };

  useEffect(() => {
    const newAnalyser = mixerRef.current?.analyserNode || frontendEngine.analyserNode;
    if (newAnalyser && newAnalyser !== analyserNode) {
      setAnalyserNode(newAnalyser);
    }
  }, [mixerRef.current?.analyserNode, frontendEngine.analyserNode, analyserNode]);

  const audioState = useMemo(() => {
    const baseFreq = frontendEngine.audioState.leftFreq || backendEngine.audioState.config?.base_frequency || DEFAULT_BASE_FREQUENCY;
    const beatFreq = frontendEngine.audioState.beat_frequency || backendEngine.audioState.config?.beat_frequency || DEFAULT_BEAT_FREQUENCY;
    const leftFreq = baseFreq;
    const rightFreq = baseFreq + beatFreq;
    const volume = frontendEngine.audioState.volume || backendEngine.audioState.config?.volume || DEFAULT_VOLUME;
    const waveform = frontendEngine.audioState.waveform || 'sine';

    return {
      isPlaying,
      volume,
      leftFreq,
      rightFreq,
      beat_frequency: beatFreq,
      waveform,
      config: {
        base_frequency: baseFreq,
        beat_frequency: beatFreq,
        volume,
        waveform
      },
      context: frontendEngine.audioContext || null,
      gainL: frontendEngine.audioState.gainL || null,
      gainR: frontendEngine.audioState.gainR || null,
      oscillatorL: frontendEngine.audioState.oscillatorL || null,
      oscillatorR: frontendEngine.audioState.oscillatorR || null
    };
  }, [
    isPlaying,
    frontendEngine.audioState.leftFreq,
    frontendEngine.audioState.beat_frequency,
    frontendEngine.audioState.volume,
    frontendEngine.audioState.waveform,
    frontendEngine.audioContext,
    frontendEngine.audioState.gainL,
    frontendEngine.audioState.gainR,
    frontendEngine.audioState.oscillatorL,
    frontendEngine.audioState.oscillatorR,
    backendEngine.audioState.config?.base_frequency,
    backendEngine.audioState.config?.beat_frequency,
    backendEngine.audioState.config?.volume
  ]);

  // Route EQ through mixer (not frontend engine) so it affects both engines
  const setEqualizerNodes = useCallback((inputNode: GainNode | null, outputNode: GainNode | null) => {
    if (mixerRef.current) {
      mixerRef.current.setEqualizerNodes(inputNode, outputNode);
    } else {
      // Fallback to frontend engine if mixer not ready (rare case)
      frontendEngine.setEqualizerNodes(inputNode, outputNode);
    }
  }, [frontendEngine]);

  // Spatial effect control through mixer
  const setSpatialEffect = useCallback((
    mode: 'toroidal' | 'vortex' | 'spiral' | 'wave' | 'pattern8D' | 'combined' | 'none',
    intensity: number = 0.5,
    speed: number = 1
  ) => {
    if (mixerRef.current) {
      mixerRef.current.setSpatialEffect(mode, intensity, speed);
    }
  }, []);

  const setSpatialIntensity = useCallback((intensity: number) => {
    if (mixerRef.current) {
      mixerRef.current.setSpatialIntensity(intensity);
    }
  }, []);

  return {
    audioState,
    electromagnetic,
    startBinauralBeat,
    stopBinauralBeat,
    updateFrequency,
    updateSettings,
    updateVolume,
    updateWaveform,
    updateSpatialSettings,
    loadPattern,
    generateTestTones,
    frequencySweep,
    createGammaProtocol,
    initializeAudio,
    setAudioState: frontendEngine.setAudioState,
    setEqualizerNodes,
    setSpatialEffect,
    setSpatialIntensity,
    audioContext: frontendEngine.audioContext,
    analyserNode,
    currentEngine,
    isInitialized,
    backendConnected: backendEngine.backendConnected,
    backendSessionId: backendEngine.sessionId,
    mixer: mixerRef.current,
    websocketState: backendEngine.websocketState,
    isSupported: frontendEngine.isSupported,
    audioWorkletStatus: backendEngine.audioWorkletStatus,
    frontendEngine,
    backendEngine
  };
};
