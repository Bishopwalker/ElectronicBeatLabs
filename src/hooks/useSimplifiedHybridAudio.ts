/**
 * useSimplifiedHybridAudio - Clean Hybrid Audio Orchestrator
 * 
 * CRITICAL POINTS:
 * 1. Uses ONE AudioContext from provider
 * 2. Uses ONE AudioState for all state
 * 3. BOTH engines handle STEREO (left + right)
 * 4. AudioMixer combines two STEREO sources
 * 5. NO frequency splitting between engines!
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAudioContextProvider } from '../providers/AudioContextProvider';
import { useAudioState } from './useAudioState';
import { FrontendAudioEngine } from '../engines/FrontendAudioEngine';
import { BackendAudioEngine } from '../engines/BackendAudioEngine';
import { AudioMixer } from '../utils/AudioMixer';
import type { BinauralBeatConfig } from '../types';

export const useSimplifiedHybridAudio = () => {
  const { audioContext, analyserNode, initializeAudio, isInitialized } = useAudioContextProvider();
  const audioState = useAudioState();
  
  // Engine instances
  const [frontendEngine, setFrontendEngine] = useState<FrontendAudioEngine | null>(null);
  const [backendEngine, setBackendEngine] = useState<BackendAudioEngine | null>(null);
  const [mixer, setMixer] = useState<AudioMixer | null>(null);
  
  // Track initialization
  const isEnginesInitialized = useRef(false);

  /**
   * Initialize all audio components
   */
  const initializeEngines = useCallback(async () => {
    if (isEnginesInitialized.current || !audioContext || !analyserNode) {
      return;
    }

    try {
      // Create mixer
      const audioMixer = new AudioMixer(audioContext);
      setMixer(audioMixer);

      // Create STEREO frontend engine
      const frontend = new FrontendAudioEngine(
        audioContext, 
        audioMixer.getFrontendGain()
      );
      setFrontendEngine(frontend);

      // Create STEREO backend engine  
      const backend = new BackendAudioEngine(
        audioContext,
        audioMixer.getBackendGain()
      );
      setBackendEngine(backend);

      isEnginesInitialized.current = true;
    } catch (error) {
    }
  }, [audioContext, analyserNode]);

  /**
   * Initialize when audio context is ready
   */
  useEffect(() => {
    if (isInitialized && audioContext && analyserNode && !isEnginesInitialized.current) {
      initializeEngines();
    }
  }, [isInitialized, audioContext, analyserNode, initializeEngines]);

  /**
   * Start binaural beat with BOTH frequencies in BOTH engines
   */
  const start = useCallback(async (config?: BinauralBeatConfig) => {
    // Initialize audio context if needed
    if (!isInitialized) {
      await initializeAudio();
    }

    // Initialize engines if needed
    if (!isEnginesInitialized.current) {
      await initializeEngines();
    }

    if (!frontendEngine || !mixer) {
      return;
    }

    // Use config or current state
    const leftFreq = config 
      ? config.base_frequency 
      : audioState.state.leftFreq;
    const rightFreq = config 
      ? config.base_frequency + config.beat_frequency
      : audioState.state.rightFreq;
    const volume = config?.volume ?? audioState.state.volume;
    const waveform = config?.waveform ?? audioState.state.waveform;

    // Update state
    audioState.updateFrequencies(leftFreq, rightFreq);
    audioState.updateVolume(volume);
    audioState.updateWaveform(waveform);
    audioState.setPlaying(true);
    audioState.setCurrentEngine('frontend');

    // Start frontend immediately (STEREO)
    frontendEngine.start(leftFreq, rightFreq, volume, waveform);

    // Try to connect backend (non-blocking)
    if (backendEngine && !audioState.state.backendConnected) {
      backendEngine.connect()
        .then(() => {
          audioState.setBackendStatus(true);
          
          // Start backend STEREO session
          return backendEngine.startSession(leftFreq, rightFreq, volume);
        })
        .then(() => {
          mixer.crossfadeToBackend(2.0);
          audioState.setCurrentEngine('backend');
          audioState.setBackendStatus(true, backendEngine.getSessionId());
        })
        .catch(err => {
        });
    }
  }, [
    isInitialized, 
    initializeAudio, 
    initializeEngines,
    frontendEngine, 
    backendEngine, 
    mixer,
    audioState
  ]);

  /**
   * Stop all audio
   */
  const stop = useCallback(() => {

    if (frontendEngine) {
      frontendEngine.stop();
    }

    if (backendEngine && audioState.state.sessionId) {
      backendEngine.stopSession();
    }

    audioState.setPlaying(false);
  }, [frontendEngine, backendEngine, audioState]);

  /**
   * Update STEREO frequencies in BOTH engines
   */
  const updateFrequencies = useCallback((leftFreq: number, rightFreq: number) => {

    // Update state
    audioState.updateFrequencies(leftFreq, rightFreq);

    // Update BOTH engines with BOTH frequencies
    if (frontendEngine && frontendEngine.getIsPlaying()) {
      frontendEngine.updateFrequencies(leftFreq, rightFreq);
    }

    if (backendEngine && audioState.state.sessionId) {
      backendEngine.updateFrequencies(leftFreq, rightFreq);
    }
  }, [frontendEngine, backendEngine, audioState]);

  /**
   * Update volume
   */
  const updateVolume = useCallback((volume: number) => {
    const safeVolume = Math.max(0, Math.min(2, volume));
    
    // Update state
    audioState.updateVolume(safeVolume);

    // Update mixer master volume
    if (mixer) {
      mixer.setMasterVolume(safeVolume);
    }
  }, [mixer, audioState]);

  /**
   * Update waveform
   */
  const updateWaveform = useCallback((waveform: 'sine' | 'square' | 'triangle' | 'sawtooth') => {
    audioState.updateWaveform(waveform);

    if (frontendEngine && frontendEngine.getIsPlaying()) {
      frontendEngine.updateWaveform(waveform as OscillatorType);
    }
  }, [frontendEngine, audioState]);

  /**
   * Monitor backend connection and auto-crossfade
   */
  useEffect(() => {
    if (!backendEngine || !mixer) return;

    // Backend just connected and has session
    if (audioState.state.backendConnected && 
        audioState.state.sessionId && 
        audioState.state.currentEngine === 'frontend') {
      mixer.crossfadeToBackend(2.0);
      audioState.setCurrentEngine('backend');
    }

    // Backend disconnected - instant failover
    if (!audioState.state.backendConnected && 
        audioState.state.currentEngine === 'backend') {
      mixer.failoverToFrontend();
      audioState.setCurrentEngine('frontend');
    }
  }, [
    audioState.state.backendConnected,
    audioState.state.sessionId,
    audioState.state.currentEngine,
    backendEngine,
    mixer,
    audioState.setCurrentEngine
  ]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (frontendEngine) {
        frontendEngine.destroy();
      }
      if (backendEngine) {
        backendEngine.destroy();
      }
      if (mixer) {
        mixer.destroy();
      }
    };
  }, [frontendEngine, backendEngine, mixer]);

  return {
    // Core controls
    start,
    stop,
    updateFrequencies,  // STEREO update
    updateVolume,
    updateWaveform,
    
    // State
    audioState: audioState.state,
    
    // Context references
    audioContext,
    analyserNode,
    
    // Status
    isInitialized,
    isPlaying: audioState.state.isPlaying,
    currentEngine: audioState.state.currentEngine,
    backendConnected: audioState.state.backendConnected,
    
    // Direct control
    initializeAudio
  };
};