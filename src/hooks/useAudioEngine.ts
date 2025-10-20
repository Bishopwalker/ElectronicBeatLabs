// Electromagnetic Beat Lab - Audio Engine Hook
// Advanced binaural beats generator with electromagnetic field simulation

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  BinauralBeatConfig,
  ElectromagneticField,
  ElectromagneticFieldState,
  PatternConfig,
  ADHDProtocol, WaveForm, FrontendAudioEngineState
} from '../types';
import {
  DEFAULT_BASE_FREQUENCY,
  DEFAULT_BEAT_FREQUENCY,
  DEFAULT_VOLUME,
  DEFAULT_LEFT_FREQUENCY,
  DEFAULT_RIGHT_FREQUENCY
} from '../constants/audio.constants';

/**
 * Frontend Audio Engine Hook
 */
export const useAudioEngine = () => {
  // Persistent audio context that survives start/stop cycles
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  // Store external mixer nodes (can be set dynamically)
  const externalOutputNodeRef = useRef<GainNode | null>(null);
  const externalAnalyserRef = useRef<AnalyserNode | null>(null);
  const equalizerInputRef = useRef<GainNode | null>(null);
  const equalizerOutputRef = useRef<GainNode | null>(null);
  
  // 🔥 CRITICAL FIX: Stop lock to prevent auto-restart race conditions
  const stopLockRef = useRef<boolean>(false);
  
  const [audioState, setAudioState] = useState<FrontendAudioEngineState>({
    isPlaying: false,
    amplitude: DEFAULT_VOLUME,
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

      // Update state to trigger re-render with new context
      setAudioState(prev => ({
        ...prev,
        context: context
      }));

      console.log('✅ Persistent audio context initialized successfully');
      return context;
    } catch (error) {
      console.error('❌ Failed to initialize audio context:', error);
      return null;

    }
  }, []);

  // Initialize audio context on component mount (requires user gesture)
  // useEffect(() => {
  //   if (skipInitialization) {
  //     console.log('🚫 Frontend Engine: Skipping initialization (backend engine active)');
  //     return;
  //   }
  //
  //   const initAudioContextOnMount = async () => {
  //     if (!audioState.context) {
  //       console.log('🎵 Frontend Engine: Initializing audio context on mount...');
  //       try {
  //         const context = await initializeAudio();
  //         if (context) {
  //           setAudioState(prev => ({
  //             ...prev,
  //             context
  //           }));
  //           console.log('✅ Frontend Engine: Audio context initialized and stored in state, state:', context.state);
  //         }
  //       } catch (error) {
  //         console.log('⚠️ Frontend Engine: Audio context initialization requires user gesture:', error);
  //       }
  //     }
  //   };
  //
  //   initAudioContextOnMount();
  // }, [audioState.context, initializeAudio, skipInitialization]); // Only depend on skipInitialization, initializeAudio is stable

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
    beat_frequency: number,
    time: number
  ): ElectromagneticField => {
    const strength = Math.sin(time * 0.001 * beat_frequency) * 0.5 + 0.5;
    const frequency = beat_frequency;
    const phase = (time * 0.001 * beat_frequency * 360) % 360;
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
    console.log('🎵 Frontend Engine: startBinauralBeat called with config:', config);
    
    // 🔥 FIXED: Clear stop lock FIRST to allow restart
    stopLockRef.current = false;
    console.log('🔓 Frontend Engine: Stop lock CLEARED (allowing audio start)');
    
    try {
      // Stop any existing audio first
      if (audioState.isPlaying) {
        console.log('🛑 Frontend Engine: Stopping existing audio...');
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
      console.log('🎵 Frontend Engine: Initializing audio context...');
      const context = audioContextRef.current || await initializeAudio();
      if (!context) {
        console.error('❌ Frontend Engine: Failed to initialize audio context');
        return;
      }
      console.log('✅ Frontend Engine: Audio context ready, state:', context.state);

      // Ensure context is running
      if (context.state === 'suspended') {
        console.log('⏸️ Frontend Engine: Audio context suspended, resuming...');
        await context.resume();
        console.log('▶️ Frontend Engine: Audio context resumed, new state:', context.state);
      }

      // Calculate actual frequencies from config
      // CRITICAL: left = base_frequency, right = base_frequency + beat_frequency
      const leftFreq = config.base_frequency;
      const rightFreq = config.base_frequency + config.beat_frequency;

      // Create oscillators
      const oscL = createOscillator(context, leftFreq, config.waveform);
      const oscR = createOscillator(context, rightFreq, config.waveform);

      // Create gain nodes - use config amplitude or default volume (no multiplication)
      const gainL = createGainNode(context, config.amplitude ?? DEFAULT_VOLUME);
      const gainR = createGainNode(context, config.amplitude ?? DEFAULT_VOLUME);

      // Create channel merger for proper stereo separation
      const merger = context.createChannelMerger(2);

      // Use external analyser if provided (for AudioMixer integration), otherwise create/reuse local one
      const analyser = externalAnalyserRef.current || analyserNodeRef.current;
      if (!analyser) {
        analyserNodeRef.current = context.createAnalyser();
        analyserNodeRef.current.fftSize = 2048;
        analyserNodeRef.current.smoothingTimeConstant = 0.8;
        console.log('✅ Created local AnalyserNode for visualization');
      } else if (externalAnalyserRef.current) {
        // Use external analyser but keep local reference for compatibility
        analyserNodeRef.current = externalAnalyserRef.current;
        console.log('✅ Using external AnalyserNode from AudioMixer');
      }

      // Connect left oscillator to left channel only
      oscL.connect(gainL);
      gainL.connect(merger, 0, 0); // Connect to left output channel

      // Connect right oscillator to right channel only
      oscR.connect(gainR);
      gainR.connect(merger, 0, 1); // Connect to right output channel

      // 🔥 CRITICAL FIX: Route through external output gain node if provided (AudioMixer integration)
      // This ensures the mixer can control frontend engine volume
      const outputNode = externalOutputNodeRef.current;
      if (outputNode) {
        console.log('🎚️ Frontend Engine: Routing through external gain node (AudioMixer mode)');

        // Route: merger → equalizer (if exists) → external gain node
        if (equalizerInputRef.current && equalizerOutputRef.current) {
          console.log('🎵 With equalizer: merger → equalizer → mixerGain');
          merger.connect(equalizerInputRef.current);
          equalizerOutputRef.current.connect(outputNode);
        } else {
          console.log('🎵 Direct: merger → mixerGain');
          merger.connect(outputNode);
        }

        // Analyser already connected by mixer, no need to connect here
        console.log('✅ Frontend Engine: Audio routed through AudioMixer successfully');
      } else {
        // Standalone mode: route directly to analyser → destination
        console.log('🎵 Frontend Engine: Standalone mode - routing to destination');

        if (equalizerInputRef.current && equalizerOutputRef.current) {
          console.log('🎚️ With equalizer: merger → equalizer → analyser → destination');
          merger.connect(equalizerInputRef.current);
          equalizerOutputRef.current.connect(analyserNodeRef.current!);
        } else {
          console.log('🎵 Direct: merger → analyser → destination');
          merger.connect(analyserNodeRef.current!);
        }

        analyserNodeRef.current!.connect(context.destination);
      }

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

      console.log(`Starting binaural beat: ${leftFreq}Hz (L) / ${rightFreq}Hz (R) = ${config.beat_frequency}Hz beat`);
      calculateElectromagneticField(leftFreq,rightFreq, config.beat_frequency,context.currentTime);
      // Update state with persistent context
      setAudioState(prev => ({
        ...prev,
        isPlaying: true,
        leftFreq: leftFreq,
        rightFreq: rightFreq,
        beat_frequency: config.beat_frequency,
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

  }, [audioState.amplitude, audioState.isPlaying, audioState.oscillatorL, audioState.oscillatorR, calculateElectromagneticField, createGainNode, createOscillator, initializeAudio]);

  // Stop binaural beat playback
  const stopBinauralBeat = useCallback(() => {
    console.log('🛑 Frontend Engine: stopBinauralBeat called');
    
    // 🔥 CRITICAL FIX: Set stop lock to prevent auto-restart
    stopLockRef.current = true;
    console.log('🔒 Frontend Engine: Stop lock ENABLED');
    
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
  }, [audioState.oscillatorL, audioState.oscillatorR]);

  // Update frequency
  const updateFrequency = useCallback((leftFreq: number, rightFreq: number) => {
    if (audioState.oscillatorL && audioState.oscillatorR && audioState.context) {
      const now = audioState.context.currentTime;
      audioState.oscillatorL.frequency.setValueAtTime(leftFreq, now);
      audioState.oscillatorR.frequency.setValueAtTime(rightFreq, now);
      
      const beat_frequency = Math.abs(rightFreq - leftFreq);
      
      setAudioState(prev => ({
        ...prev,
        leftFreq,
        rightFreq,
        beat_frequency
      }));

      // Update electromagnetic field based on frequency changes
      const avgFreq = (leftFreq + rightFreq) / 2;
      const fieldStrength = Math.min(1, Math.max(0, beat_frequency / 100)); // Normalize beat frequency to 0-1
      const coherence = Math.min(1, Math.max(0.1, 1 - (beat_frequency / 50))); // Higher coherence for lower beat frequencies
      
      setElectromagnetic({
        strength: fieldStrength,
        frequency: avgFreq,
        phase: Date.now() * 0.001, // Dynamic phase for animation
        coherence: coherence,
        resonance: beat_frequency,
        state: 'ACTIVE',
        stability: Math.min(1, Math.max(0.5, 1 - Math.abs(leftFreq - rightFreq) / 100))
      });
    }
  }, [audioState.oscillatorL, audioState.oscillatorR, audioState.context]);

  // Update volume
  const updateVolume = useCallback((volume: number) => {
    // Protect against NaN and invalid values
    const safeVolume = isNaN(volume) ? DEFAULT_VOLUME : Math.max(0, Math.min(2, volume));
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
      base_frequency: pattern.frequencies.carrier,
      beat_frequency: pattern.frequencies.beat,
      amplitude: 0.5,
      waveform: 'sine'
    };

    startBinauralBeat(config);
  }, [startBinauralBeat]);

  // Generate binaural test tones
  const generateTestTones = useCallback((leftFreq: number, rightFreq: number, duration: number = 5000) => {
    const config: BinauralBeatConfig = {
      base_frequency: leftFreq,
      beat_frequency: Math.abs(rightFreq - leftFreq),
      amplitude: DEFAULT_VOLUME,
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
    beat_frequency: number
  ) => {
    if (!audioState.context || !audioState.oscillatorL || !audioState.oscillatorR) return;

    const now = audioState.context.currentTime;
    const endTime = now + duration / 1000;

    // Sweep left frequency
    audioState.oscillatorL.frequency.setValueAtTime(startFreq, now);
    audioState.oscillatorL.frequency.linearRampToValueAtTime(endFreq, endTime);

    // Keep beat frequency constant
    audioState.oscillatorR.frequency.setValueAtTime(startFreq + beat_frequency, now);
    audioState.oscillatorR.frequency.linearRampToValueAtTime(endFreq + beat_frequency, endTime);

  }, []);

  // Create gamma wave protocol for ADHD
  const createGammaProtocol = useCallback((protocol: ADHDProtocol) => {
    const config: BinauralBeatConfig = {
      base_frequency: DEFAULT_BASE_FREQUENCY,
      beat_frequency: protocol.gammaFreq,
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

  // Set equalizer nodes for audio chain routing
  const setEqualizerNodes = useCallback((inputNode: GainNode | null, outputNode: GainNode | null) => {
    console.log('🎚️ Setting equalizer nodes:', { inputNode, outputNode });
    equalizerInputRef.current = inputNode;
    equalizerOutputRef.current = outputNode;

    // If audio is currently playing, we need to reconnect the audio chain
    if (audioState.isPlaying && audioContextRef.current) {
      console.log('🔄 Reconnecting audio chain with equalizer changes');
      // The audio will automatically route through the equalizer on next start
      // For now, just log that equalizer is ready
      if (inputNode && outputNode) {
        console.log('✅ Equalizer enabled and ready for audio routing');
      } else {
        console.log('❌ Equalizer disabled, audio will route directly');
      }
    }
  }, [audioState.isPlaying]);

  /**
   * Set external mixer nodes for AudioMixer integration
   * Call this after creating the AudioMixer to route frontend audio through it
   * 🔥 CRITICAL FIX: Now accepts audioContext parameter (even though frontend doesn't use it)
   */
  const setExternalNodes = useCallback((outputGainNode: GainNode | null, analyserNode: AnalyserNode | null, audioContext?: AudioContext | null) => {
    console.log('🎚️ Frontend Engine: Setting external mixer nodes:', { outputGainNode, analyserNode, audioContext });
    externalOutputNodeRef.current = outputGainNode;
    externalAnalyserRef.current = analyserNode;
    // Frontend uses persistent audioContextRef, ignores external context parameter

    // If audio is currently playing, warn that restart is needed
    if (audioState.isPlaying) {
      console.warn('⚠️ Frontend Engine: External nodes changed while playing. Restart audio for changes to take effect.');
    } else {
      console.log('✅ Frontend Engine: External nodes set successfully, will be used on next audio start');
    }
  }, [audioState.isPlaying]);

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
    setEqualizerNodes,
    setExternalNodes, // 🔥 NEW: Allow dynamic routing through AudioMixer
    backendConnected: false, // Frontend engine is never connected to backend
    sessionId: null,
    websocketState: {
      connected: false,
      connecting: false,
      error: null
    },
    isSupported: !!(window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext),
    audioContext: audioState.context, // ✅ FIXED: Use reactive state value instead of ref
    // 🔥 CRITICAL FIX: Return external analyser if set (AudioMixer integration)
    // This ensures visualizers work even before audio starts
    analyserNode: externalAnalyserRef.current || analyserNodeRef.current
  };
};