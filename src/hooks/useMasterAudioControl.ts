// Master Audio Control Hook
// Centralized management of all audio systems with emergency stop functionality

import { useCallback, useState, useEffect } from 'react';
import { useAudioEngine } from './useAudioEngine';
import { useBackendAudioEngine } from './useBackendAudioEngine';
import { use8DPatterns } from './use8DPatterns';

interface ActiveAudioStatus {
  binauralEngine: boolean;
  backendEngine: boolean;
  spatialAudio: boolean;
  patterns: boolean;
  testTones: boolean;
}

export const useMasterAudioControl = () => {
  const audioEngine = useAudioEngine();
  const backendEngine = useBackendAudioEngine();
  const patternsEngine = use8DPatterns();

  const [testTonesActive, setTestTonesActive] = useState(false);

  // Track all active audio systems
  const getActiveStatus = useCallback((): ActiveAudioStatus => {
    return {
      binauralEngine: audioEngine.audioState.isPlaying,
      backendEngine: backendEngine.audioState.isPlaying,
      spatialAudio: backendEngine.backendConnected && backendEngine.sessionId !== null,
      patterns: patternsEngine.isAnimating,
      testTones: testTonesActive,
    };
  }, [
    audioEngine.audioState.isPlaying,
    backendEngine.audioState.isPlaying,
    backendEngine.backendConnected,
    backendEngine.sessionId,
    patternsEngine.isAnimating,
    testTonesActive
  ]);

  // Master stop function - stops ALL audio systems
  const masterStop = useCallback(() => {
    console.log('🛑 MASTER STOP - Stopping all audio systems');
    
    try {
      // Stop binaural engine
      if (audioEngine.audioState.isPlaying) {
        audioEngine.stopBinauralBeat();
        console.log('✅ Stopped binaural engine');
      }

      // Stop backend engine
      if (backendEngine.audioState.isPlaying || backendEngine.sessionId) {
        backendEngine.stopBackendSession();
        console.log('✅ Stopped backend engine');
      }

      // Stop patterns
      if (patternsEngine.isAnimating) {
        patternsEngine.stopAnimation();
        console.log('✅ Stopped patterns engine');
      }

      // Stop test tones
      if (testTonesActive) {
        setTestTonesActive(false);
        console.log('✅ Stopped test tones');
      }

      // Additional cleanup - stop any Web Audio contexts
      if (audioEngine.audioState.context) {
        try {
          // Suspend context to free resources
          audioEngine.audioState.context.suspend();
        } catch (error) {
          console.warn('Warning stopping audio context:', error);
        }
      }

      console.log('🏁 Master stop completed');
    } catch (error) {
      console.error('Error during master stop:', error);
    }
  }, [
    audioEngine,
    backendEngine,
    patternsEngine,
    testTonesActive
  ]);

  // Quick start function - starts default binaural beat
  const quickStart = useCallback(() => {
    console.log('🎯 Quick Start - Starting default binaural beat');
    
    const defaultConfig = {
      leftFreq: 200,
      rightFreq: 204,
      beatFreq: 4,
      amplitude: 0.3,
      waveform: 'sine' as const
    };

    audioEngine.startBinauralBeat(defaultConfig);
  }, [audioEngine]);

  // Get current frequency information
  const getFrequencyInfo = useCallback(() => {
    // Prioritize active engines for frequency display
    if (audioEngine.audioState.isPlaying) {
      return {
        left: audioEngine.audioState.leftFreq,
        right: audioEngine.audioState.rightFreq,
        beat: audioEngine.audioState.beatFreq
      };
    }

    if (backendEngine.audioState.isPlaying) {
      return {
        left: backendEngine.audioState.leftFreq,
        right: backendEngine.audioState.rightFreq,
        beat: backendEngine.audioState.beatFreq
      };
    }

    return undefined;
  }, [audioEngine.audioState, backendEngine.audioState]);

  // Get current volume (use highest volume from active systems)
  const getCurrentVolume = useCallback(() => {
    let maxVolume = 0;
    
    if (audioEngine.audioState.isPlaying) {
      maxVolume = Math.max(maxVolume, audioEngine.audioState.volume);
    }
    
    if (backendEngine.audioState.isPlaying) {
      maxVolume = Math.max(maxVolume, backendEngine.audioState.volume);
    }
    
    return maxVolume;
  }, [audioEngine.audioState, backendEngine.audioState]);

  // Monitor test tones from audio engines
  useEffect(() => {
    // This is a simplification - in reality you might track test tone timers
    // For now we'll rely on the engines' isPlaying states
  }, []);

  return {
    activeStatus: getActiveStatus(),
    masterStop,
    quickStart,
    frequencies: getFrequencyInfo(),
    volume: getCurrentVolume(),
    setTestTonesActive,
    
    // Expose individual engines for advanced control
    engines: {
      audioEngine,
      backendEngine,
      patternsEngine
    }
  };
};