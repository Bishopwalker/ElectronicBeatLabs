// Electromagnetic Beat Lab - Audio Engine Hook
// Advanced binaural beats generator with electromagnetic field simulation

import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  AudioEngineState, 
  BinauralBeatConfig, 
  ElectromagneticField,
  ElectromagneticFieldState,
  PatternConfig 
} from '../types/index';

export const useAudioEngine = () => {
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

  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);

  // Initialize Web Audio API
  const initializeAudio = useCallback(async (): Promise<AudioContext | null> => {
    try {
      const context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      if (context.state === 'suspended') {
        await context.resume();
      }

      return context;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return null;
    }
  }, []);

  // Create oscillator with specified waveform
  const createOscillator = useCallback((
    context: AudioContext,
    frequency: number,
    waveform: 'sine' | 'square' | 'triangle' | 'sawtooth'
  ): OscillatorNode => {
    const oscillator = context.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    return oscillator;
  }, []);

  // Create gain node
  const createGainNode = useCallback((
    context: AudioContext,
    gain: number
  ): GainNode => {
    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(gain, context.currentTime);
    return gainNode;
  }, []);

  // Calculate electromagnetic field properties
  const calculateElectromagneticField = useCallback((
    leftFreq: number,
    rightFreq: number,
    beatFreq: number,
    time: number
  ): ElectromagneticField => {
    const strength = Math.sin(time * 0.001 * beatFreq) * 0.5 + 0.5;
    const frequency = beatFreq;
    const phase = (time * 0.001 * beatFreq * 360) % 360;
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

  // Start binaural beat playback
  const startBinauralBeat = useCallback(async (config: BinauralBeatConfig) => {
    try {
      // Stop any existing audio first
      if (audioState.isPlaying) {
        // Inline stop logic to avoid circular dependency
        if (audioState.oscillatorL) {
          audioState.oscillatorL.stop();
          audioState.oscillatorL.disconnect();
        }
        if (audioState.oscillatorR) {
          audioState.oscillatorR.stop();
          audioState.oscillatorR.disconnect();
        }
        // Wait for cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const context = audioState.context || await initializeAudio();
      if (!context) {
        console.error('Failed to initialize audio context');
        return;
      }

      // Ensure context is running
      if (context.state === 'suspended') {
        await context.resume();
      }

      // Create oscillators
      const oscL = createOscillator(context, config.leftFreq, config.waveform);
      const oscR = createOscillator(context, config.rightFreq, config.waveform);

      // Create gain nodes
      const gainL = createGainNode(context, config.amplitude * audioState.volume);
      const gainR = createGainNode(context, config.amplitude * audioState.volume);

      // Create stereo panner for spatial audio
      const pannerL = context.createStereoPanner();
      const pannerR = context.createStereoPanner();
      pannerL.pan.setValueAtTime(-1, context.currentTime); // Full left
      pannerR.pan.setValueAtTime(1, context.currentTime);  // Full right

      // Connect audio graph
      oscL.connect(gainL).connect(pannerL).connect(context.destination);
      oscR.connect(gainR).connect(pannerR).connect(context.destination);

      // Add error handling for oscillators
      oscL.addEventListener('ended', () => {
        console.log('Left oscillator ended');
      });
      
      oscR.addEventListener('ended', () => {
        console.log('Right oscillator ended');
      });

      // Start oscillators
      oscL.start(context.currentTime);
      oscR.start(context.currentTime);

      console.log(`Starting binaural beat: ${config.leftFreq}Hz (L) / ${config.rightFreq}Hz (R) = ${config.beatFreq}Hz beat`);

      // Update state
      setAudioState(prev => ({
        ...prev,
        isPlaying: true,
        leftFreq: config.leftFreq,
        rightFreq: config.rightFreq,
        beatFreq: config.beatFreq,
        waveform: config.waveform as 'sine' | 'square' | 'triangle' | 'sawtooth',
        gainL,
        gainR,
        oscillatorL: oscL,
        oscillatorR: oscR,
        context
      }));
    } catch (error) {
      console.error('Error starting binaural beat:', error);
    }

    // Start electromagnetic field animation at reduced rate for performance
    startTimeRef.current = Date.now();
    
    const animate = () => {
      const currentTime = Date.now();
      const field = calculateElectromagneticField(
        config.leftFreq,
        config.rightFreq,
        config.beatFreq,
        currentTime - startTimeRef.current
      );
      
      setElectromagnetic(field);
      
      // Update field at 10fps instead of 60fps for eyes-closed usage
      animationRef.current = window.setTimeout(animate, 100) as unknown as number;
    };
    
    // Start animation
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    animationRef.current = window.setTimeout(animate, 100) as unknown as number;

  }, [audioState.volume, audioState.context, audioState.isPlaying, audioState.oscillatorL, audioState.oscillatorR, initializeAudio, createOscillator, createGainNode, calculateElectromagneticField]);

  // Stop binaural beat playback
  const stopBinauralBeat = useCallback(() => {
    try {
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
        context: prev.context // Keep context alive for reuse
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
    } catch (error) {
      console.error('Error stopping binaural beat:', error);
    }
  }, [audioState]);

  // Update frequency
  const updateFrequency = useCallback((leftFreq: number, rightFreq: number) => {
    if (audioState.oscillatorL && audioState.oscillatorR && audioState.context) {
      const now = audioState.context.currentTime;
      audioState.oscillatorL.frequency.setValueAtTime(leftFreq, now);
      audioState.oscillatorR.frequency.setValueAtTime(rightFreq, now);
      
      const beatFreq = Math.abs(rightFreq - leftFreq);
      
      setAudioState(prev => ({
        ...prev,
        leftFreq,
        rightFreq,
        beatFreq
      }));
    }
  }, [audioState]);

  // Update volume
  const updateVolume = useCallback((volume: number) => {
    if (audioState.gainL && audioState.gainR && audioState.context) {
      const now = audioState.context.currentTime;
      audioState.gainL.gain.setValueAtTime(volume, now);
      audioState.gainR.gain.setValueAtTime(volume, now);
    }
    
    setAudioState(prev => ({
      ...prev,
      volume
    }));
  }, [audioState]);

  // Update waveform
  const updateWaveform = useCallback((waveform: 'sine' | 'square' | 'triangle' | 'sawtooth') => {
    if (audioState.oscillatorL && audioState.oscillatorR) {
      audioState.oscillatorL.type = waveform;
      audioState.oscillatorR.type = waveform;
      
      setAudioState(prev => ({
        ...prev,
        waveform
      }));
    }
  }, [audioState]);

  // Load pattern configuration
  const loadPattern = useCallback((pattern: PatternConfig) => {
    const config: BinauralBeatConfig = {
      leftFreq: pattern.frequencies.carrier,
      rightFreq: pattern.frequencies.carrier + pattern.frequencies.beat,
      beatFreq: pattern.frequencies.beat,
      amplitude: 0.5,
      waveform: 'sine'
    };

    startBinauralBeat(config);
  }, [startBinauralBeat]);

  // Generate binaural test tones
  const generateTestTones = useCallback((leftFreq: number, rightFreq: number, duration: number = 5000) => {
    const config: BinauralBeatConfig = {
      leftFreq,
      rightFreq,
      beatFreq: Math.abs(rightFreq - leftFreq),
      amplitude: 0.3,
      waveform: 'sine'
    };

    startBinauralBeat(config);

    // Auto-stop after duration
    setTimeout(() => {
      stopBinauralBeat();
    }, duration);
  }, [startBinauralBeat, stopBinauralBeat]);

  // Advanced frequency sweeping
  const frequencySweep = useCallback((
    startFreq: number,
    endFreq: number,
    duration: number,
    beatFreq: number = 4
  ) => {
    if (!audioState.context || !audioState.oscillatorL || !audioState.oscillatorR) return;

    const now = audioState.context.currentTime;
    const endTime = now + duration / 1000;

    // Sweep left frequency
    audioState.oscillatorL.frequency.setValueAtTime(startFreq, now);
    audioState.oscillatorL.frequency.linearRampToValueAtTime(endFreq, endTime);

    // Keep beat frequency constant
    audioState.oscillatorR.frequency.setValueAtTime(startFreq + beatFreq, now);
    audioState.oscillatorR.frequency.linearRampToValueAtTime(endFreq + beatFreq, endTime);

  }, [audioState]);

  // Create gamma wave protocol for ADHD
  const createGammaProtocol = useCallback((frequency: number = 40, duration: number = 1200000) => {
    const config: BinauralBeatConfig = {
      leftFreq: 200,
      rightFreq: 200 + frequency,
      beatFreq: frequency,
      amplitude: 0.4,
      waveform: 'sine'
    };

    startBinauralBeat(config);

    // Auto-stop after duration (20 minutes default)
    setTimeout(() => {
      stopBinauralBeat();
    }, duration);
  }, [startBinauralBeat, stopBinauralBeat]);

  // Cleanup on unmount
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
    loadPattern,
    generateTestTones,
    frequencySweep,
    createGammaProtocol,
    isSupported: !!(window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
  };
};