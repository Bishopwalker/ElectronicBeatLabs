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

// 🔥 GLOBAL SINGLETON TO PREVENT MULTIPLE AUDIO CONTEXTS
declare global {
  interface Window {
    __EBL_AUDIO_CONTEXT__?: AudioContext;
    __EBL_ANALYSER_NODE__?: AnalyserNode;
    __EBL_INIT_LOCK__?: boolean;
  }
}

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
  const startTimeRef = useRef<number>(0);

  // Initialize Web Audio API with user gesture handling (persistent context)
  const initializeAudio = useCallback(async (): Promise<AudioContext | null> => {
    try {
      // 🔥 GLOBAL SINGLETON CHECK FIRST
      if (window.__EBL_AUDIO_CONTEXT__) {
        if (window.__EBL_AUDIO_CONTEXT__.state === 'running') {
          if (import.meta && (import.meta as any).env?.DEV) console.log('✅ [GLOBAL] Using existing global audio context');
          audioContextRef.current = window.__EBL_AUDIO_CONTEXT__;
          analyserNodeRef.current = window.__EBL_ANALYSER_NODE__ || null;
          return window.__EBL_AUDIO_CONTEXT__;
        } else if (window.__EBL_AUDIO_CONTEXT__.state === 'suspended') {
          if (import.meta && (import.meta as any).env?.DEV) console.log('🎵 [GLOBAL] Resuming suspended global context');
          await window.__EBL_AUDIO_CONTEXT__.resume();
          audioContextRef.current = window.__EBL_AUDIO_CONTEXT__;
          analyserNodeRef.current = window.__EBL_ANALYSER_NODE__ || null;
          return window.__EBL_AUDIO_CONTEXT__;
        }
      }

      // 🔥 GLOBAL LOCK CHECK
      if (window.__EBL_INIT_LOCK__) {
        if (import.meta && (import.meta as any).env?.DEV) console.warn('⚠️ [GLOBAL LOCK] Another initialization in progress');
        // Wait for it to complete
        let attempts = 0;
        while (window.__EBL_INIT_LOCK__ && attempts < 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        // Check if context was created
        if (window.__EBL_AUDIO_CONTEXT__) {
          audioContextRef.current = window.__EBL_AUDIO_CONTEXT__;
          analyserNodeRef.current = window.__EBL_ANALYSER_NODE__ || null;
          return window.__EBL_AUDIO_CONTEXT__;
        }
      }

      // 🔥 LOCAL REF CHECK
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        if (import.meta && (import.meta as any).env?.DEV) console.log('✅ [LOCAL] Using existing local audio context');
        return audioContextRef.current;
      }

      // Resume existing context if suspended
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        if (import.meta && (import.meta as any).env?.DEV) console.log('🎵 [LOCAL] Resuming suspended local context');
        await audioContextRef.current.resume();
        return audioContextRef.current;
      }

      // 🔥 SET GLOBAL INITIALIZATION LOCK
      window.__EBL_INIT_LOCK__ = true;
      if (import.meta && (import.meta as any).env?.DEV) console.log('🔒 [GLOBAL LOCK] Acquired for new context creation');

      // Create new context only if none exists
      if (import.meta && (import.meta as any).env?.DEV) console.log('🎵 Creating new GLOBAL audio context...');
      const context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // 🔥 CREATE GLOBAL ANALYSER NODE
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      
      // 🔥 STORE GLOBALLY
      window.__EBL_AUDIO_CONTEXT__ = context;
      window.__EBL_ANALYSER_NODE__ = analyser;
      
      if (import.meta && (import.meta as any).env?.DEV) console.log('🎵 Global audio context created, state:', context.state);

      // Resume if suspended (required for user gesture)
      if (context.state === 'suspended') {
        if (import.meta && (import.meta as any).env?.DEV) console.log('🎵 Audio context suspended, attempting to resume...');
        try {
          await context.resume();
          if (import.meta && (import.meta as any).env?.DEV) console.log('✅ Audio context resumed successfully, new state:', context.state);
        } catch (error) {
          // 🔥 FIX: Browser autoplay policy blocks AudioContext.resume() without user gesture
          // This is EXPECTED on page load - context will resume when user clicks "start"
          // Don't throw error - just leave context suspended until user interaction
        }
      }

      if (context.state !== 'running') {
        // Don't try to force-start with dummy oscillator - this also requires user gesture
        // Context will resume automatically when user clicks "start" button
      }

      setElectromagnetic(prev=>({
        ...prev,
        state:'ACTIVE'
      }));

      // Store the persistent context locally too
      audioContextRef.current = context;
      analyserNodeRef.current = analyser;

      // Update state to trigger re-render with new context
      setAudioState(prev => ({
        ...prev,
        context: context
      }));

      if (import.meta && (import.meta as any).env?.DEV) console.log('✅ Global audio context initialized successfully');

      // 🔥 RELEASE GLOBAL LOCK
      window.__EBL_INIT_LOCK__ = false;
      if (import.meta && (import.meta as any).env?.DEV) console.log('🔓 [GLOBAL LOCK] Released');

      return context;
    } catch (error) {
      // 🔥 RELEASE GLOBAL LOCK ON ERROR
      window.__EBL_INIT_LOCK__ = false;
      if (import.meta && (import.meta as any).env?.DEV) console.log('🔓 [GLOBAL LOCK] Released (error path)');

      return null;
    }
  }, []);

  useEffect(() => {

    const initAudioContextOnMount = async () => {
      if (!audioState.context) {
        if (import.meta && (import.meta as any).env?.DEV) console.log('🎵 Frontend Engine: Initializing audio context on mount...');
        try {
          const context = await initializeAudio();
          if (context) {
            setAudioState(prev => ({
              ...prev,
              context
            }));
            if (import.meta && (import.meta as any).env?.DEV) console.log('✅ Frontend Engine: Audio context initialized and stored in state, state:', context.state);
          }
        } catch (error) {
          if (import.meta && (import.meta as any).env?.DEV) console.log('⚠️ Frontend Engine: Audio context initialization requires user gesture:', error);
        }
      }
    };

    initAudioContextOnMount();
  }, [audioState.context, initializeAudio]); // Only depend on skipInitialization, initializeAudio is stable

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
    
    // 🔥 FIXED: Clear stop lock FIRST to allow restart
    stopLockRef.current = false;
    
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
        return;
      }

      // Ensure context is running
      if (context.state === 'suspended') {
        await context.resume();
      }

      // Calculate actual frequencies from config
      // CRITICAL: left = base_frequency, right = base_frequency + beat_frequency
      const leftFreq = config.base_frequency;
      const rightFreq = config.base_frequency + config.beat_frequency;

      // Create oscillators
      const oscL = createOscillator(context, leftFreq, config.waveform);
      const oscR = createOscillator(context, rightFreq, config.waveform);

      // Create gain nodes - use config volume or default volume (no multiplication)
      const gainL = createGainNode(context, config.volume ?? audioState.volume ?? DEFAULT_VOLUME);
      const gainR = createGainNode(context, config.volume ?? audioState.volume ?? DEFAULT_VOLUME);

      // Create channel merger for proper stereo separation
      const merger = context.createChannelMerger(2);

      // Use external analyser if provided (for AudioMixer integration), otherwise use global one
      const analyser = externalAnalyserRef.current || window.__EBL_ANALYSER_NODE__ || analyserNodeRef.current;
      if (!analyser) {
        // This shouldn't happen anymore since we create it globally
        const newAnalyser = context.createAnalyser();
        newAnalyser.fftSize = 2048;
        newAnalyser.smoothingTimeConstant = 0.8;
        analyserNodeRef.current = newAnalyser;
        window.__EBL_ANALYSER_NODE__ = newAnalyser;
      } else {
        analyserNodeRef.current = analyser;
      }

      // Connect left oscillator to left channel only
      oscL.connect(gainL);
      gainL.connect(merger, 0, 0); // ✅ FIXED: Connect to left input (index 0)

      // Connect right oscillator to right channel only
      oscR.connect(gainR);
      gainR.connect(merger, 0, 1); // ✅ Connect to right input (index 1)

      // 🔥 CRITICAL FIX: Route through external output gain node if provided (AudioMixer integration)
      // This ensures the mixer can control frontend engine volume
      const outputNode = externalOutputNodeRef.current;
      if (outputNode) {

        // Route: merger → equalizer (if exists) → external gain node
        if (equalizerInputRef.current && equalizerOutputRef.current) {
          merger.connect(equalizerInputRef.current);
          equalizerOutputRef.current.connect(outputNode);
        } else {
          merger.connect(outputNode);
        }

        // Analyser already connected by mixer, no need to connect here
      } else {
        // Standalone mode: route directly to analyser → destination

        if (equalizerInputRef.current && equalizerOutputRef.current) {
          merger.connect(equalizerInputRef.current);
          equalizerOutputRef.current.connect(analyserNodeRef.current!);
        } else {
          merger.connect(analyserNodeRef.current!);
        }

        analyserNodeRef.current!.connect(context.destination);
      }

      // Add error handling for oscillators
      oscL.addEventListener('ended', () => {
      });
      
      oscR.addEventListener('ended', () => {
      });

      // Start oscillators
      oscL.start(context.currentTime);
      oscR.start(context.currentTime);

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
    }

    // Don't start animation for frontend engine when backend is being used
    // This prevents the infinite loop issue

  }, [audioState.volume, audioState.isPlaying, audioState.oscillatorL, audioState.oscillatorR, calculateElectromagneticField, createGainNode, createOscillator, initializeAudio]);

  // Stop binaural beat playback
  const stopBinauralBeat = useCallback(() => {
    
    // 🔥 CRITICAL FIX: Set stop lock to prevent auto-restart
    stopLockRef.current = true;
    
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
      volume: 0.5,
      waveform: 'sine'
    };

    startBinauralBeat(config);
  }, [startBinauralBeat]);

  // Generate binaural test tones
  const generateTestTones = useCallback((leftFreq: number, rightFreq: number, duration: number = 5000) => {
    const config: BinauralBeatConfig = {
      base_frequency: leftFreq,
      beat_frequency: Math.abs(rightFreq - leftFreq),
      volume: DEFAULT_VOLUME,
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
      volume: protocol.intensity / 100, // Convert percentage to volume
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
  }, []);

  // Set equalizer nodes for audio chain routing
  const setEqualizerNodes = useCallback((inputNode: GainNode | null, outputNode: GainNode | null) => {
    equalizerInputRef.current = inputNode;
    equalizerOutputRef.current = outputNode;

    // If audio is currently playing, we need to reconnect the audio chain
    if (audioState.isPlaying && audioContextRef.current) {
      // The audio will automatically route through the equalizer on next start
      // For now, just log that equalizer is ready
      if (inputNode && outputNode) {
      } else {
      }
    }
  }, [audioState.isPlaying]);

  /**
   * Set external mixer nodes for AudioMixer integration
   * Call this after creating the AudioMixer to route frontend audio through it
   * 🔥 CRITICAL FIX: Now accepts audioContext parameter (even though frontend doesn't use it)
   */
  const setExternalNodes = useCallback((outputGainNode: GainNode | null, analyserNode: AnalyserNode | null, audioContext?: AudioContext | null) => {
    externalOutputNodeRef.current = outputGainNode;
    externalAnalyserRef.current = analyserNode;
    // Frontend uses persistent audioContextRef, ignores external context parameter

    // If audio is currently playing, warn that restart is needed
    if (audioState.isPlaying) {
    } else {
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