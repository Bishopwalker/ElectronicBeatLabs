// Electromagnetic Beat Lab - Audio Engine Hook
// Advanced binaural beats generator with electromagnetic field simulation

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  FrontendAudioEngineState,
  BinauralBeatConfig,
  ElectromagneticField,
  ElectromagneticFieldState,
  PatternConfig,
  ADHDProtocol, WaveForm
} from '../types';

export const useAudioEngine = () => {
  // Persistent audio context that survives start/stop cycles
  const audioContextRef = useRef<AudioContext | null>(null);

  const [audioState, setAudioState] = useState<FrontendAudioEngineState>({
    isPlaying: false,
    amplitude: 0.3,
    leftFreq: 144,
    rightFreq: 148,
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

  // Initialize Web Audio API with user gesture handling (persistent context)
  const initializeAudio = useCallback(async (): Promise<AudioContext | null> => {
    try {
      // Return existing context if already initialized and running
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        console.log('🎵 Using existing audio context:', audioContextRef.current.state);
        return audioContextRef.current;
      }

      // Resume existing context if suspended
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        console.log('🎵 Resuming suspended audio context...');
        await audioContextRef.current.resume();


        console.log('🎵 Audio context resumed, new state:', audioContextRef.current.state);
        return audioContextRef.current;
      }

      // Create new context only if none exists
      console.log('🎵 Creating new persistent audio context...');
      const context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      console.log('🎵 Audio context created, state:', context.state);

      // Resume if suspended (required for user gesture)
      if (context.state === 'suspended') {
        console.log('🎵 Audio context suspended, resuming...');
        await context.resume();
        console.log('🎵 Audio context resumed, new state:', context.state);
      }

      if (context.state !== 'running') {
        console.warn('⚠️ Audio context not running after resume. State:', context.state);
        // Try to create a dummy sound to trigger user gesture
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        gainNode.gain.setValueAtTime(0, context.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.01);
      }

      setElectromagnetic(prev=>({
        ...prev,
        state:'ACTIVE'
      }));

      // Store the persistent context
      audioContextRef.current = context;
      console.log('✅ Persistent audio context initialized successfully');
      return context;
    } catch (error) {
      console.error('❌ Failed to initialize audio context:', error);
      return null;

    }
  }, []);

  // Initialize audio context on component mount (requires user gesture)
  useEffect(() => {
    const initAudioContextOnMount = async () => {
      if (!audioState.context) {
        console.log('🎵 Frontend Engine: Initializing audio context on mount...');
        try {
          const context = await initializeAudio();
          if (context) {
            setAudioState(prev => ({
              ...prev,
              context
            }));
            console.log('✅ Frontend Engine: Audio context initialized and stored in state, state:', context.state);
          }
        } catch (error) {
          console.log('⚠️ Frontend Engine: Audio context initialization requires user gesture:', error);
        }
      }
    };

    initAudioContextOnMount();
  }, [initializeAudio]); // Include initializeAudio in deps

  // Create oscillator with specified waveform
  const createOscillator = useCallback((
      context: AudioContext,
      frequency: number,
      waveform: WaveForm,
  ): OscillatorNode => {
    const oscillator = context.createOscillator();
    oscillator.type = waveform as OscillatorType;
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

      // Use persistent context or initialize if needed
      const context = audioContextRef.current || await initializeAudio();
      if (!context) {
        console.error('Failed to initialize audio context');
        return;
      }

      // Ensure context is running
      if (context.state === 'suspended') {
        await context.resume();
      }

      // Calculate actual frequencies from config
      const leftFreq = config.baseFrequency;
      const rightFreq = config.baseFrequency + config.beatFrequency;

      // Create oscillators
      const oscL = createOscillator(context, leftFreq, config.waveform);
      const oscR = createOscillator(context, rightFreq, config.waveform);

      // Create gain nodes
      const gainL = createGainNode(context, config.amplitude * audioState.amplitude);
      const gainR = createGainNode(context, config.amplitude * audioState.amplitude);

      // Create channel merger for proper stereo separation
      const merger = context.createChannelMerger(2);

      // Connect left oscillator to left channel only
      oscL.connect(gainL);
      gainL.connect(merger, 0, 0); // Connect to left output channel

      // Connect right oscillator to right channel only  
      oscR.connect(gainR);
      gainR.connect(merger, 0, 1); // Connect to right output channel

      // Connect merged output to destination
      merger.connect(context.destination);

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

      console.log(`Starting binaural beat: ${leftFreq}Hz (L) / ${rightFreq}Hz (R) = ${config.beatFrequency}Hz beat`);
      calculateElectromagneticField(leftFreq,rightFreq, config.beatFrequency,context.currentTime);
      // Update state with persistent context
      setAudioState(prev => ({
        ...prev,
        isPlaying: true,
        leftFreq: leftFreq,
        rightFreq: rightFreq,
        beatFreq: config.beatFrequency,
        waveform: config.waveform,
        gainL,
        gainR,
        oscillatorL: oscL,
        oscillatorR: oscR,
        context: audioContextRef.current // Always use the persistent context
      }));
    } catch (error) {
      console.error('Error starting binaural beat:', error);
    }

    // Don't start animation for frontend engine when backend is being used
    // This prevents the infinite loop issue

  }, [audioState.isPlaying, audioState.context, audioState.amplitude, audioState.oscillatorL, audioState.oscillatorR, initializeAudio, createOscillator, createGainNode]);

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
        context: audioContextRef.current // Keep persistent context alive
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
  }, []);

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

      // Update electromagnetic field based on frequency changes
      const avgFreq = (leftFreq + rightFreq) / 2;
      const fieldStrength = Math.min(1, Math.max(0, beatFreq / 100)); // Normalize beat frequency to 0-1
      const coherence = Math.min(1, Math.max(0.1, 1 - (beatFreq / 50))); // Higher coherence for lower beat frequencies
      
      setElectromagnetic({
        strength: fieldStrength,
        frequency: avgFreq,
        phase: Date.now() * 0.001, // Dynamic phase for animation
        coherence: coherence,
        resonance: beatFreq,
        state: 'ACTIVE',
        stability: Math.min(1, Math.max(0.5, 1 - Math.abs(leftFreq - rightFreq) / 100))
      });
    }
  }, [audioState.oscillatorL, audioState.oscillatorR, audioState.context]);

  // Update volume
  const updateVolume = useCallback((volume: number) => {
    // Protect against NaN and invalid values
    const safeVolume = isNaN(volume) ? 0.3 : Math.max(0, Math.min(1, volume));
    console.log('🎶 Frontend updateVolume:', { original: volume, safe: safeVolume });

    if (audioState.gainL && audioState.gainR && audioState.context) {
      const now = audioState.context.currentTime;
      audioState.gainL.gain.setValueAtTime(safeVolume, now);
      audioState.gainR.gain.setValueAtTime(safeVolume, now);
    }

    setAudioState(prev => ({
      ...prev,
      amplitude: safeVolume
    }));
  }, [audioState.gainL, audioState.gainR, audioState.context]);

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
  }, [audioState.oscillatorL, audioState.oscillatorR]);

  // Load pattern configuration
  const loadPattern = useCallback((pattern: PatternConfig) => {
    const config: BinauralBeatConfig = {
      baseFrequency: pattern.frequencies.carrier,
      beatFrequency: pattern.frequencies.beat,
      amplitude: 0.5,
      waveform: 'sine'
    };

    startBinauralBeat(config);
  }, [startBinauralBeat]);

  // Generate binaural test tones
  const generateTestTones = useCallback((leftFreq: number, rightFreq: number, duration: number = 5000) => {
    const config: BinauralBeatConfig = {
      baseFrequency: leftFreq,
      beatFrequency: Math.abs(rightFreq - leftFreq),
      amplitude: 0.3,
      waveform: 'sine'
    };

    startBinauralBeat(config);

    // Auto-stop after duration
    setTimeout(() => {
      stopBinauralBeat();
    }, duration);
  }, [startBinauralBeat]);

  // Advanced frequency sweeping
  const frequencySweep = useCallback((
    startFreq: number,
    endFreq: number,
    duration: number,
    beatFreq: number
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

  }, []);

  // Create gamma wave protocol for ADHD
  const createGammaProtocol = useCallback((protocol: ADHDProtocol) => {
    const config: BinauralBeatConfig = {
      baseFrequency: 144,
      beatFrequency: protocol.gammaFreq,
      amplitude: protocol.intensity / 100, // Convert percentage to amplitude
      waveform: 'sine'
    };

    startBinauralBeat(config);

    // Auto-stop after protocol duration
    setTimeout(() => {
      stopBinauralBeat();
    }, protocol.duration * 60 * 1000); // Convert minutes to milliseconds
  }, [startBinauralBeat, stopBinauralBeat]);

  // Update spatial settings (frontend engine doesn't support this)
  const updateSpatialSettings = useCallback((spatialSettings: Record<string, unknown>) => {
    console.warn('🎧 Spatial audio (8D effects) requires Backend Engine connection');
    console.warn('Current settings ignored:', spatialSettings);
    console.warn('To use spatial audio, connect to the Python backend server');
  }, []);

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
    updateSpatialSettings,
    loadPattern,
    generateTestTones,
    frequencySweep,
    createGammaProtocol,
    initializeAudio,
    setAudioState,
    backendConnected: false, // Frontend engine is never connected to backend
    sessionId: null,
    websocketState: { connected: false, connecting: false, error: null },
    isSupported: !!(window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
  };
};