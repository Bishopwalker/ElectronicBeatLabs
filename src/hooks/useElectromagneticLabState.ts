// Custom hook for Electromagnetic Beat Lab state management
// Extracted complex state logic from main component

import { useState, useEffect, useRef, useCallback } from 'react';
import type {AppState, AudioEngine, BackendAudioConfig, PatternMode} from '../types';
import { WAVE_PATTERNS } from '../data/patterns';
import { DEFAULT_APP_STATE, DEFAULT_CLOSED_SECTIONS } from '../components/config/ElectromagneticLabConfig';
import { ElectromagneticLabManager, type ElectromagneticLabState } from '../components/helpers/ElectromagneticLabManager';

export const useElectromagneticLabState = (initialPattern?: string, autoStart: boolean = false) => {
  // Main state
  const [state, setState] = useState<ElectromagneticLabState>({
    closedSections: DEFAULT_CLOSED_SECTIONS,
    advancedControlsOpen: false,
    darkScreen: false,
    appState: DEFAULT_APP_STATE
  });

  // State manager instance (memoized but updated with current state)
  const managerRef = useRef<ElectromagneticLabManager | null>(null);
  if (!managerRef.current) {
    managerRef.current = new ElectromagneticLabManager(state, setState);
  } else {
    // Update the manager with current state and setState
    managerRef.current.state = state;
    managerRef.current.setState = setState;
  }
  const manager = managerRef.current;

  // Refs for preventing infinite loops
  const lastElectromagneticRef = useRef<any>(null);
  const lastAudioStateRef = useRef<any>(null);

  // Initialize with pattern (only on mount)
  useEffect(() => {
    if (initialPattern) {
      const pattern = WAVE_PATTERNS.find(p => p.id === initialPattern);
      if (pattern) {
        setState(prev => ({ 
          ...prev, 
          appState: { ...prev.appState, currentPattern: pattern }
        }));
      }
    } else if (!state.appState.currentPattern) {
      const defaultPattern = WAVE_PATTERNS[0];
      setState(prev => ({ 
        ...prev, 
        appState: { ...prev.appState, currentPattern: defaultPattern }
      }));
    }
  }, []); // Only run on mount

  // Update electromagnetic state with audio engine data
  const updateElectromagneticState = useCallback((activeEngine: any) => {
    // Use the provided active engine (could be frontend or backend)
    const currentElectromagnetic = activeEngine.electromagnetic;
    const currentAudioState = activeEngine.audioState;
    
    if (
      currentElectromagnetic !== lastElectromagneticRef.current ||
      currentAudioState !== lastAudioStateRef.current ||
      currentAudioState.isPlaying !== lastAudioStateRef.current?.isPlaying ||
      currentAudioState.amplitude !== lastAudioStateRef.current?.amplitude ||
      currentAudioState.beat_frequency !== lastAudioStateRef.current?.beat_frequency
    ) {
      lastElectromagneticRef.current = currentElectromagnetic;
      lastAudioStateRef.current = currentAudioState;
      
      const enhancedElectromagnetic = manager.calculateEnhancedElectromagnetic(
        currentElectromagnetic, 
        currentAudioState
      );
      
      setState(prev => ({
        ...prev,
        appState: {
          ...prev.appState,
          electromagnetic: enhancedElectromagnetic,
          isPlaying: currentAudioState.isPlaying,
          volume: isNaN(currentAudioState.amplitude) ? prev.appState.volume : currentAudioState.amplitude,
          base_frequency: currentAudioState.base_frequency,
          beat_frequency: currentAudioState.beat_frequency

        }
      }));
    }
  }, [manager]);

  // Force electromagnetic field update when pattern changes
  const updateElectromagneticForPattern = useCallback(() => {
    if (state.appState.currentPattern) {
      const frequency = state.appState.currentPattern.frequencies.beat;
      const isPlaying = state.appState.isPlaying;
      
      const immediateElectromagnetic = manager.createImmediateElectromagnetic(
        frequency, 
        isPlaying, 
        state.appState.volume
      );
      
      setState(prev => ({
        ...prev,
        appState: {
          ...prev.appState,
          electromagnetic: immediateElectromagnetic,
          frequency: frequency
        }
      }));
      
      console.log('🎨 Visualizer updated for pattern:', state.appState.currentPattern.name, 'Frequency:', frequency);
    }
  }, [
    state.appState.currentPattern?.id, 
    state.appState.currentPattern?.frequencies.beat,
    state.appState.isPlaying, 
    state.appState.volume
  ]);

  // Trigger electromagnetic update when relevant values change
  useEffect(() => {
    if (state.appState.currentPattern) {
      const frequency = state.appState.currentPattern.frequencies.beat;
      const isPlaying = state.appState.isPlaying;
      
      const immediateElectromagnetic = manager.createImmediateElectromagnetic(
        frequency, 
        isPlaying, 
        state.appState.volume
      );
      
      setState(prev => ({
        ...prev,
        appState: {
          ...prev.appState,
          electromagnetic: immediateElectromagnetic,
          frequency: frequency
        }
      }));
      
      console.log('🎨 Visualizer updated for pattern:', state.appState.currentPattern.name, 'Frequency:', frequency);
    }
  }, [
    state.appState.currentPattern?.id, 
    state.appState.currentPattern?.name,
    state.appState.currentPattern?.frequencies.beat,
    state.appState.isPlaying, 
    state.appState.volume
  ]);

  return {
    // State
    ...state,
    
    // Manager methods
    handlePatternSelect: (patternId: string, audioEngine: AudioEngine, patterns8D: PatternMode) =>
      manager.handlePatternSelect(patternId, audioEngine, patterns8D),
    
    handleModeChange: (mode: PatternMode, masterAudio: any) =>
      manager.handleModeChange(mode, masterAudio),
    
    handleFrequencyChange: (frequency: number, audioEngine: AudioEngine) =>
      manager.handleFrequencyChange(frequency, audioEngine),
    
    handleVolumeChange: (volume: number, audioEngine: AudioEngine) =>
      manager.handleVolumeChange(volume, audioEngine),
    
    handlePlay: (audioEngine: AudioEngine, backendEngine: BackendAudioConfig, patterns8D: PatternMode) =>
      manager.handlePlay(audioEngine, backendEngine, patterns8D),
    
    handleTabChange: (tabId: string) => manager.handleTabChange(tabId),
    
    handleSectionClose: (id: string) => manager.handleSectionClose(id),
    
    handleSectionRestore: (id: string) => manager.handleSectionRestore(id),
    
    toggleAdvancedControls: (backendEngine?: BackendAudioConfig) => manager.toggleAdvancedControls(backendEngine),
    
    toggleDarkScreen: () => manager.toggleDarkScreen(),
    
    // State update methods
    updateAppState: (partialState: Partial<AppState>) => manager.updateAppState(partialState),
    
    updateElectromagneticState,
    
    updateElectromagneticForPattern
  };
};