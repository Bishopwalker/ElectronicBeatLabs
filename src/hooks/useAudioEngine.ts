/**
 * Electromagnetic Beat Lab - Audio Engine Hook
 * Advanced binaural beats generator with electromagnetic field simulation
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ADHDProtocol,
  BinauralBeatConfig,
  ElectromagneticField,
  ElectromagneticFieldState,
  FrontendAudioEngineState,
  PatternConfig,
  WaveForm
} from '../types';
import {
  DEFAULT_BASE_FREQUENCY,
  DEFAULT_BEAT_FREQUENCY,
  DEFAULT_LEFT_FREQUENCY,
  DEFAULT_RIGHT_FREQUENCY,
  DEFAULT_VOLUME
} from '../constants/audio.constants';

declare global {
  interface Window {
    __EBL_AUDIO_CONTEXT__?: AudioContext;
    __EBL_ANALYSER_NODE__?: AnalyserNode;
    __EBL_INIT_LOCK__?: boolean;
  }
}

const INIT_LOCK_CHECK_INTERVAL_MS = 100;
const INIT_LOCK_MAX_ATTEMPTS = 20;
const ANALYSER_FFT_SIZE = 2048;
const ANALYSER_SMOOTHING = 0.8;
const AUDIO_STOP_DELAY_MS = 100;
const MIN_VOLUME = 0;
const MAX_VOLUME = 2;
const PROTOCOL_MINUTES_TO_MS = 60 * 1000;

interface WebkitWindow extends Window {
  webkitAudioContext: typeof AudioContext;
}

export const useAudioEngine = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const externalOutputNodeRef = useRef<GainNode | null>(null);
  const externalAnalyserRef = useRef<AnalyserNode | null>(null);
  const equalizerInputRef = useRef<GainNode | null>(null);
  const equalizerOutputRef = useRef<GainNode | null>(null);
  const stopLockRef = useRef<boolean>(false);

  const [audioState, setAudioState] = useState<FrontendAudioEngineState>({
    isPlaying: false,
    volume: DEFAULT_VOLUME,
    leftFreq: DEFAULT_LEFT_FREQUENCY,
    rightFreq: DEFAULT_RIGHT_FREQUENCY,
    beat_frequency: DEFAULT_BEAT_FREQUENCY,
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

  const animationRef = useRef<number | undefined>(undefined);

  const initializeAudio = useCallback(async (): Promise<AudioContext | null> => {
    if (window.__EBL_AUDIO_CONTEXT__) {
      if (window.__EBL_AUDIO_CONTEXT__.state === 'running') {
        audioContextRef.current = window.__EBL_AUDIO_CONTEXT__;
        analyserNodeRef.current = window.__EBL_ANALYSER_NODE__ || null;
        return window.__EBL_AUDIO_CONTEXT__;
      } else if (window.__EBL_AUDIO_CONTEXT__.state === 'suspended') {
        await window.__EBL_AUDIO_CONTEXT__.resume();
        audioContextRef.current = window.__EBL_AUDIO_CONTEXT__;
        analyserNodeRef.current = window.__EBL_ANALYSER_NODE__ || null;
        return window.__EBL_AUDIO_CONTEXT__;
      }
    }

    if (window.__EBL_INIT_LOCK__) {
      let attempts = 0;
      while (window.__EBL_INIT_LOCK__ && attempts < INIT_LOCK_MAX_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, INIT_LOCK_CHECK_INTERVAL_MS));
        attempts++;
      }
      if (window.__EBL_AUDIO_CONTEXT__) {
        audioContextRef.current = window.__EBL_AUDIO_CONTEXT__;
        analyserNodeRef.current = window.__EBL_ANALYSER_NODE__ || null;
        return window.__EBL_AUDIO_CONTEXT__;
      }
    }

    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      return audioContextRef.current;
    }

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
      return audioContextRef.current;
    }

    window.__EBL_INIT_LOCK__ = true;

    const AudioContextClass = window.AudioContext || (window as unknown as WebkitWindow).webkitAudioContext;
    const context = new AudioContextClass();

    const analyser = context.createAnalyser();
    analyser.fftSize = ANALYSER_FFT_SIZE;
    analyser.smoothingTimeConstant = ANALYSER_SMOOTHING;

    window.__EBL_AUDIO_CONTEXT__ = context;
    window.__EBL_ANALYSER_NODE__ = analyser;

    if (context.state === 'suspended') {
      await context.resume().catch(() => {
        // Browser autoplay policy blocks AudioContext.resume() without user gesture
      });
    }

    setElectromagnetic(prev => ({
      ...prev,
      state: 'ACTIVE'
    }));

    audioContextRef.current = context;
    analyserNodeRef.current = analyser;

    setAudioState(prev => ({
      ...prev,
      context
    }));

    window.__EBL_INIT_LOCK__ = false;

    return context;
  }, []);

  useEffect(() => {
    const initAudioContextOnMount = async () => {
      if (!audioState.context) {
        const context = await initializeAudio();
        if (context) {
          setAudioState(prev => ({
            ...prev,
            context
          }));
        }
      }
    };

    initAudioContextOnMount();
  }, [audioState.context, initializeAudio]);

  const createOscillator = useCallback((
    context: AudioContext,
    frequency: number,
    waveform: WaveForm
  ): OscillatorNode => {
    const oscillator = context.createOscillator();
    oscillator.type = waveform as OscillatorType;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    return oscillator;
  }, []);

  const createGainNode = useCallback((
    context: AudioContext,
    gain: number
  ): GainNode => {
    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(gain, context.currentTime);
    return gainNode;
  }, []);

  const calculateElectromagneticField = useCallback((
    leftFreq: number,
    rightFreq: number,
    beatFrequency: number,
    time: number
  ): ElectromagneticField => {
    const strength = Math.sin(time * 0.001 * beatFrequency) * 0.5 + 0.5;
    const frequency = beatFrequency;
    const phase = (time * 0.001 * beatFrequency * 360) % 360;
    const coherence = Math.min(1, 1 / (Math.abs(leftFreq - rightFreq) * 0.1 + 1));
    const resonance = strength * coherence;

    let state: ElectromagneticFieldState = 'INACTIVE';
    if (strength > 0.1) state = 'CHARGING';
    if (strength > 0.5) state = 'ACTIVE';
    if (resonance > 0.8) state = 'RESONANT';
    if (resonance > 0.95) state = 'CRITICAL';

    const stability = 1 - Math.abs(0.5 - strength) * 2;

    return {
      strength,
      frequency,
      phase,
      coherence,
      resonance,
      state,
      stability
    };
  }, []);

  const startBinauralBeat = useCallback(async (config: BinauralBeatConfig) => {
    stopLockRef.current = false;

    if (audioState.isPlaying) {
      if (audioState.oscillatorL) {
        audioState.oscillatorL.stop();
        audioState.oscillatorL.disconnect();
      }
      if (audioState.oscillatorR) {
        audioState.oscillatorR.stop();
        audioState.oscillatorR.disconnect();
      }
      await new Promise(resolve => setTimeout(resolve, AUDIO_STOP_DELAY_MS));
    }

    const context = audioContextRef.current || await initializeAudio();
    if (!context) {
      return;
    }

    if (context.state === 'suspended') {
      await context.resume();
    }

    const leftFreq = config.base_frequency;
    const rightFreq = config.base_frequency + config.beat_frequency;

    const oscL = createOscillator(context, leftFreq, config.waveform);
    const oscR = createOscillator(context, rightFreq, config.waveform);

    const gainL = createGainNode(context, config.volume ?? audioState.volume ?? DEFAULT_VOLUME);
    const gainR = createGainNode(context, config.volume ?? audioState.volume ?? DEFAULT_VOLUME);

    const merger = context.createChannelMerger(2);

    const analyser = externalAnalyserRef.current || window.__EBL_ANALYSER_NODE__ || analyserNodeRef.current;
    if (!analyser) {
      const newAnalyser = context.createAnalyser();
      newAnalyser.fftSize = ANALYSER_FFT_SIZE;
      // 🔥 FIX: Clamp smoothingTimeConstant to valid range
      newAnalyser.smoothingTimeConstant = Math.max(0, Math.min(1, ANALYSER_SMOOTHING));
      analyserNodeRef.current = newAnalyser;
      window.__EBL_ANALYSER_NODE__ = newAnalyser;
    } else {
      analyserNodeRef.current = analyser;
    }

    oscL.connect(gainL);
    gainL.connect(merger, 0, 0);

    oscR.connect(gainR);
    gainR.connect(merger, 0, 1);

    const outputNode = externalOutputNodeRef.current;
    if (outputNode) {
      if (equalizerInputRef.current && equalizerOutputRef.current) {
        merger.connect(equalizerInputRef.current);
        equalizerOutputRef.current.connect(outputNode);
      } else {
        merger.connect(outputNode);
      }
    } else {
      if (equalizerInputRef.current && equalizerOutputRef.current && analyserNodeRef.current) {
        merger.connect(equalizerInputRef.current);
        equalizerOutputRef.current.connect(analyserNodeRef.current);
      } else if (analyserNodeRef.current) {
        merger.connect(analyserNodeRef.current);
      }

      if (analyserNodeRef.current) {
        analyserNodeRef.current.connect(context.destination);
      }
    }

    oscL.start(context.currentTime);
    oscR.start(context.currentTime);

    calculateElectromagneticField(leftFreq, rightFreq, config.beat_frequency, context.currentTime);

    setAudioState(prev => ({
      ...prev,
      isPlaying: true,
      leftFreq,
      rightFreq,
      beat_frequency: config.beat_frequency,
      waveform: config.waveform,
      gainL,
      gainR,
      oscillatorL: oscL,
      oscillatorR: oscR,
      context: audioContextRef.current
    }));
  }, [audioState.volume, audioState.isPlaying, audioState.oscillatorL, audioState.oscillatorR, calculateElectromagneticField, createGainNode, createOscillator, initializeAudio]);

  const stopBinauralBeat = useCallback(() => {
    stopLockRef.current = true;

    if (audioState.oscillatorL) {
      audioState.oscillatorL.stop();
      audioState.oscillatorL.disconnect();
    }

    if (audioState.oscillatorR) {
      audioState.oscillatorR.stop();
      audioState.oscillatorR.disconnect();
    }

    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }

    setAudioState(prev => ({
      ...prev,
      isPlaying: false,
      gainL: null,
      gainR: null,
      oscillatorL: null,
      oscillatorR: null,
      context: audioContextRef.current
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
  }, [audioState.oscillatorL, audioState.oscillatorR]);

  const updateFrequency = useCallback((leftFreq: number, rightFreq: number) => {
    if (audioState.oscillatorL && audioState.oscillatorR && audioState.context) {
      const now = audioState.context.currentTime;
      audioState.oscillatorL.frequency.setValueAtTime(leftFreq, now);
      audioState.oscillatorR.frequency.setValueAtTime(rightFreq, now);

      const beatFrequency = Math.abs(rightFreq - leftFreq);

      setAudioState(prev => ({
        ...prev,
        leftFreq,
        rightFreq,
        beat_frequency: beatFrequency
      }));

      const avgFreq = (leftFreq + rightFreq) / 2;
      const fieldStrength = Math.min(1, Math.max(0, beatFrequency / 100));
      const coherence = Math.min(1, Math.max(0.1, 1 - (beatFrequency / 50)));

      setElectromagnetic({
        strength: fieldStrength,
        frequency: avgFreq,
        phase: Date.now() * 0.001,
        coherence,
        resonance: beatFrequency,
        state: 'ACTIVE',
        stability: Math.min(1, Math.max(0.5, 1 - Math.abs(leftFreq - rightFreq) / 100))
      });
    }
  }, [audioState.oscillatorL, audioState.oscillatorR, audioState.context]);

  const updateVolume = useCallback((volume: number) => {
    const safeVolume = isNaN(volume) ? DEFAULT_VOLUME : Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, volume));

    if (audioState.gainL && audioState.gainR && audioState.context) {
      const now = audioState.context.currentTime;
      audioState.gainL.gain.setValueAtTime(safeVolume, now);
      audioState.gainR.gain.setValueAtTime(safeVolume, now);
    }

    setAudioState(prev => ({
      ...prev,
      volume: safeVolume
    }));
  }, [audioState.gainL, audioState.gainR, audioState.context]);

  const updateWaveform = useCallback((waveform: 'sine' | 'square' | 'triangle' | 'sawtooth') => {
    if (audioState.oscillatorL && audioState.oscillatorR) {
      audioState.oscillatorL.type = waveform;
      audioState.oscillatorR.type = waveform;

      setAudioState(prev => ({
        ...prev,
        waveform
      }));
    }
  }, [audioState.oscillatorL, audioState.oscillatorR]);

  const loadPattern = useCallback((pattern: PatternConfig) => {
    const config: BinauralBeatConfig = {
      base_frequency: pattern.frequencies.carrier,
      beat_frequency: pattern.frequencies.beat,
      volume: 0.5,
      waveform: 'sine'
    };

    startBinauralBeat(config);
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
    if (!audioState.context || !audioState.oscillatorL || !audioState.oscillatorR) return;

    const now = audioState.context.currentTime;
    const endTime = now + duration / 1000;

    audioState.oscillatorL.frequency.setValueAtTime(startFreq, now);
    audioState.oscillatorL.frequency.linearRampToValueAtTime(endFreq, endTime);

    audioState.oscillatorR.frequency.setValueAtTime(startFreq + beatFrequency, now);
    audioState.oscillatorR.frequency.linearRampToValueAtTime(endFreq + beatFrequency, endTime);
  }, [audioState.context, audioState.oscillatorL, audioState.oscillatorR]);

  const createGammaProtocol = useCallback((protocol: ADHDProtocol) => {
    const config: BinauralBeatConfig = {
      base_frequency: DEFAULT_BASE_FREQUENCY,
      beat_frequency: protocol.gammaFreq,
      volume: protocol.intensity / 100,
      waveform: 'sine'
    };

    startBinauralBeat(config);

    setTimeout(() => {
      stopBinauralBeat();
    }, protocol.duration * PROTOCOL_MINUTES_TO_MS);
  }, [startBinauralBeat, stopBinauralBeat]);

  const updateSpatialSettings = useCallback((_spatialSettings: Record<string, unknown>) => {
    // Frontend engine doesn't support spatial settings
  }, []);

  const setEqualizerNodes = useCallback((inputNode: GainNode | null, outputNode: GainNode | null) => {
    equalizerInputRef.current = inputNode;
    equalizerOutputRef.current = outputNode;
  }, []);

  const setExternalNodes = useCallback((
    outputGainNode: GainNode | null,
    analyserNodeParam: AnalyserNode | null,
    _audioContext?: AudioContext | null
  ) => {
    externalOutputNodeRef.current = outputGainNode;
    externalAnalyserRef.current = analyserNodeParam;
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      if (audioState.isPlaying) {
        stopBinauralBeat();
      }
    };
  }, [audioState.isPlaying, stopBinauralBeat]);

  return {
    audioState,
    electromagnetic,
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
    initializeAudio,
    setAudioState,
    setEqualizerNodes,
    setExternalNodes,
    backendConnected: false,
    sessionId: null,
    websocketState: {
      connected: false,
      connecting: false,
      error: null
    },
    isSupported: !!(window.AudioContext || (window as unknown as WebkitWindow).webkitAudioContext),
    audioContext: audioState.context,
    analyserNode: externalAnalyserRef.current || analyserNodeRef.current
  };
};
