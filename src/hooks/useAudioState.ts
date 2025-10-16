/**
 * useAudioState - Centralized Audio State Management
 * 
 * SINGLE SOURCE OF TRUTH for all audio state
 * Both engines read/write to this shared state
 * 
 * CRITICAL: Always maintains STEREO state (left + right frequencies)
 * Never splits frequencies between engines!
 */

import { useState, useCallback } from 'react';
import { 
  DEFAULT_LEFT_FREQUENCY,
  DEFAULT_RIGHT_FREQUENCY,
  DEFAULT_VOLUME,
  DEFAULT_WAVEFORM
} from '../constants/audio.constants';

export interface AudioState {
  // Playback state
  isPlaying: boolean;
  currentEngine: 'frontend' | 'backend' | 'transitioning';
  
  // STEREO frequencies - BOTH engines use BOTH
  leftFreq: number;   // Left ear frequency (Hz)
  rightFreq: number;  // Right ear frequency (Hz)
  
  // Computed values (for display)
  baseFreq: number;   // Lower of the two frequencies
  beatFreq: number;   // Difference between frequencies
  
  // Audio parameters
  volume: number;
  waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
  
  // Backend specific
  backendConnected: boolean;
  sessionId: string | null;
  
  // Spatial audio (backend only)
  spatialEnabled: boolean;
  spatialMode: '3d' | '8d' | 'off';
}

export const useAudioState = () => {
  const [state, setState] = useState<AudioState>({
    // Playback
    isPlaying: false,
    currentEngine: 'frontend',
    
    // STEREO frequencies
    leftFreq: DEFAULT_LEFT_FREQUENCY,
    rightFreq: DEFAULT_RIGHT_FREQUENCY,
    
    // Computed
    baseFreq: Math.min(DEFAULT_LEFT_FREQUENCY, DEFAULT_RIGHT_FREQUENCY),
    beatFreq: Math.abs(DEFAULT_RIGHT_FREQUENCY - DEFAULT_LEFT_FREQUENCY),
    
    // Parameters
    volume: DEFAULT_VOLUME,
    waveform: DEFAULT_WAVEFORM as 'sine',
    
    // Backend
    backendConnected: false,
    sessionId: null,
    
    // Spatial
    spatialEnabled: false,
    spatialMode: 'off'
  });

  /**
   * Update STEREO frequencies
   * BOTH engines will use BOTH frequencies
   */
  const updateFrequencies = useCallback((leftFreq: number, rightFreq: number) => {
    console.log(`🎵 Updating STEREO frequencies: L=${leftFreq}Hz, R=${rightFreq}Hz`);
    
    setState(prev => ({
      ...prev,
      leftFreq,
      rightFreq,
      baseFreq: Math.min(leftFreq, rightFreq),
      beatFreq: Math.abs(rightFreq - leftFreq)
    }));
  }, []);

  /**
   * Update using base/beat format (backend style)
   */
  const updateFromBaseBeat = useCallback((baseFreq: number, beatFreq: number) => {
    const leftFreq = baseFreq;
    const rightFreq = baseFreq + beatFreq;
    
    console.log(`🎵 Converting base/beat to STEREO: base=${baseFreq}, beat=${beatFreq} → L=${leftFreq}, R=${rightFreq}`);
    updateFrequencies(leftFreq, rightFreq);
  }, [updateFrequencies]);

  /**
   * Update volume (0.0 - 2.0 range)
   */
  const updateVolume = useCallback((volume: number) => {
    const safeVolume = Math.max(0, Math.min(2, volume));
    console.log(`🔊 Volume updated: ${safeVolume.toFixed(2)}`);
    
    setState(prev => ({
      ...prev,
      volume: safeVolume
    }));
  }, []);

  /**
   * Update waveform
   */
  const updateWaveform = useCallback((waveform: AudioState['waveform']) => {
    console.log(`🌊 Waveform updated: ${waveform}`);
    
    setState(prev => ({
      ...prev,
      waveform
    }));
  }, []);

  /**
   * Set playing state
   */
  const setPlaying = useCallback((isPlaying: boolean) => {
    console.log(`▶️ Playing state: ${isPlaying}`);
    
    setState(prev => ({
      ...prev,
      isPlaying
    }));
  }, []);

  /**
   * Set current engine
   */
  const setCurrentEngine = useCallback((engine: AudioState['currentEngine']) => {
    console.log(`🔄 Current engine: ${engine}`);
    
    setState(prev => ({
      ...prev,
      currentEngine: engine
    }));
  }, []);

  /**
   * Update backend connection status
   */
  const setBackendStatus = useCallback((connected: boolean, sessionId: string | null = null) => {
    console.log(`🔌 Backend status: connected=${connected}, session=${sessionId}`);
    
    setState(prev => ({
      ...prev,
      backendConnected: connected,
      sessionId
    }));
  }, []);

  /**
   * Update spatial audio settings
   */
  const setSpatialAudio = useCallback((enabled: boolean, mode: AudioState['spatialMode'] = '3d') => {
    console.log(`🎧 Spatial audio: enabled=${enabled}, mode=${mode}`);
    
    setState(prev => ({
      ...prev,
      spatialEnabled: enabled,
      spatialMode: mode
    }));
  }, []);

  /**
   * Reset to defaults
   */
  const reset = useCallback(() => {
    console.log('🔄 Resetting audio state to defaults');
    
    setState({
      isPlaying: false,
      currentEngine: 'frontend',
      leftFreq: DEFAULT_LEFT_FREQUENCY,
      rightFreq: DEFAULT_RIGHT_FREQUENCY,
      baseFreq: Math.min(DEFAULT_LEFT_FREQUENCY, DEFAULT_RIGHT_FREQUENCY),
      beatFreq: Math.abs(DEFAULT_RIGHT_FREQUENCY - DEFAULT_LEFT_FREQUENCY),
      volume: DEFAULT_VOLUME,
      waveform: DEFAULT_WAVEFORM as 'sine',
      backendConnected: false,
      sessionId: null,
      spatialEnabled: false,
      spatialMode: 'off'
    });
  }, []);

  return {
    state,
    
    // Frequency updates (STEREO!)
    updateFrequencies,      // Direct left/right
    updateFromBaseBeat,     // Convert from base/beat
    
    // Parameter updates
    updateVolume,
    updateWaveform,
    
    // State updates
    setPlaying,
    setCurrentEngine,
    setBackendStatus,
    setSpatialAudio,
    
    // Utility
    reset
  };
};
