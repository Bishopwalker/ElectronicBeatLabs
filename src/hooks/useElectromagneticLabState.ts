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
          electromagnetic: enhancedElectromagnetic
          // 🔥 REMOVED: isPlaying, volume, base_frequency, beat_frequency
          // These now live in HybridAudioEngine.audioState - read from there!
        }
      }));
    }
  }, [manager]);

  // Force electromagnetic field update when pattern changes
  // 🔥 NOTE: isPlaying and volume now come from HybridEngine, passed by caller
  const updateElectromagneticForPattern = useCallback((isPlaying: boolean, volume: number) => {
    // 🔥 BULLETPROOF: Check pattern AND frequencies exist before accessing .beat
    if (state.appState.currentPattern?.frequencies?.beat) {
      const frequency = state.appState.currentPattern.frequencies.beat;

      const immediateElectromagnetic = manager.createImmediateElectromagnetic(
        frequency,
        isPlaying,
        volume
      );

      setState((prev: any) => ({
        ...prev,
        appState: {
          ...prev.appState,
          electromagnetic: immediateElectromagnetic
        }
      }));

    } else {
    }
  }, [
    state.appState.currentPattern?.id,
    state.appState.currentPattern?.frequencies?.beat,
    manager
  ]);

  return {
    // State
    ...state,
    
    // Manager methods
    handlePatternSelect: (patternId: string, audioEngine: AudioEngine, patterns8D: PatternMode) =>
      manager.handlePatternSelect(patternId, audioEngine, patterns8D),
    
    handleModeChange: (mode: PatternMode, masterAudio: any) =>
      manager.handleModeChange(mode, masterAudio),
    
    handleFrequencyChange: (base_frequency: number, beat_frequency: number, audioEngine: AudioEngine) =>
      manager.handleFrequencyChange(base_frequency, beat_frequency, audioEngine),
    
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
