// Electromagnetic Beat Lab Manager - State and Logic Helper
// Separates complex state management and business logic from UI component

import type {
  AppState,
  ElectromagneticBeatLabProps,
  PatternMode,
  ElectromagneticFieldState,
  AudioEngine, PatternConfig, Pattern8D
} from '../../types';
import { WAVE_PATTERNS } from '../../data/patterns';
import { convertPatternConfigToPattern8D } from '../../utils/patternGeometry';

export interface ElectromagneticLabState {
  closedSections: string[];
  advancedControlsOpen: boolean;
  darkScreen: boolean;
  appState: AppState;
}

export class ElectromagneticLabManager {
  public state: ElectromagneticLabState;
  public setState: (updater: (prev: ElectromagneticLabState) => ElectromagneticLabState) => void;

  constructor(
    initialState: ElectromagneticLabState,
    setState: (updater: (prev: ElectromagneticLabState) => ElectromagneticLabState) => void
  ) {
    this.state = initialState;
    this.setState = setState;
  }

  // Initialize with pattern
  initializeWithPattern(audioEngine: any, initialPattern?: string, autoStart: boolean = false) {
    if (initialPattern) {
      const pattern = WAVE_PATTERNS.find(p => p.id === initialPattern);
      if (pattern) {
        this.updateAppState({ currentPattern: pattern });
        if (autoStart) {
          audioEngine.loadPattern(pattern);
        }
      }
    } else {
      // Default to first pattern only if no pattern is set
      if (!this.state.appState.currentPattern) {
        const defaultPattern = WAVE_PATTERNS[0];
        this.updateAppState({ currentPattern: defaultPattern });
      }
    }
  }

  // Update app state helper
  updateAppState(partialState: Partial<AppState>) {
    this.setState(prev => ({
      ...prev,
      appState: { ...prev.appState, ...partialState }
    }));
  }

  // Enhanced electromagnetic field calculation
  calculateEnhancedElectromagnetic(currentElectromagnetic: any, currentAudioState: any) {
    // Get volume from either backend (config.volume) or frontend (volume) format
    const volume = currentAudioState?.config?.volume ?? currentAudioState?.volume ?? 0.5;
    const beatFreq = currentAudioState?.beat_frequency ?? currentAudioState?.config?.beat_frequency ?? 4;

    return {
      ...currentElectromagnetic,
      frequency: beatFreq,
      strength: currentAudioState.isPlaying ? Math.min(1, volume * 2) : 0,
      resonance: currentAudioState.isPlaying ? 0.7 + (beatFreq / 40) * 0.3 : 0,
      coherence: currentAudioState.isPlaying ? 0.8 : 0,
      // Stability: Use volume as proxy - higher volume = more stable signal
      // Scale from 0-1 volume to 0.5-1.0 stability range for playing state
      stability: currentAudioState.isPlaying ? Math.max(0.5, volume) : 0
    };
  }

  // Create immediate electromagnetic field for visualizer responsiveness
  createImmediateElectromagnetic(frequency: number, isPlaying: boolean, volume: number) {
    // All values calculated dynamically from inputs - no hardcoded values
    const safeVolume = volume || 0.5;
    return {
      strength: isPlaying ? Math.min(1, safeVolume * 2) : (safeVolume * 0.6), // Dynamic: idle strength based on volume
      frequency: frequency,
      phase: 0,
      coherence: isPlaying ? Math.min(1, safeVolume + 0.3) : (safeVolume * 0.5), // Dynamic: coherence based on volume
      resonance: Math.min(1, 0.7 + (frequency / 40) * 0.3), // Dynamic: frequency-dependent resonance
      state: (isPlaying ? 'ACTIVE' : 'INACTIVE') as ElectromagneticFieldState,
      stability: isPlaying ? Math.max(0.5, safeVolume) : (safeVolume * 0.8) // Dynamic: stability based on volume
    };
  }

  // Handle pattern selection
  handlePatternSelect(patternId: string, audioEngine: any, patterns8D: any) {
    const pattern = WAVE_PATTERNS.find(p => p.id === patternId);
    if (pattern) {
      this.updateAppState({
        currentPattern: pattern
      });

      // Load pattern into audio engine if it supports it
      if (audioEngine.loadPattern) {
        audioEngine.loadPattern(pattern);
      }

      // ✅ FIXED: Convert PatternConfig → Pattern8D before setting for visualization
      if (patterns8D && patterns8D.setActivePattern) {
        const pattern8D = convertPatternConfigToPattern8D(pattern);
        patterns8D.setActivePattern(pattern8D);
      }
    }
  }

  // Handle mode change
  handleModeChange(mode: PatternMode, masterAudio: any) {
    this.updateAppState({ mode });
    
    if (mode === 'OFF') {
      masterAudio.masterStop();
    }
  }

  // Handle frequency change
  handleFrequencyChange(base_frequency: number, beat_frequency: number, audioEngine: any) {
    // Prefer unified settings API when available; fallback to left/right
    if (audioEngine?.updateSettings) {
      audioEngine.updateSettings({ base_frequency, beat_frequency });
      return;
    }

    // Compute channel frequencies from base/beat
    const leftFreq = base_frequency;
    const rightFreq = base_frequency + beat_frequency;
    if (audioEngine?.updateFrequency) {
      audioEngine.updateFrequency(leftFreq, rightFreq);
    }
  }

  // Handle volume change
  handleVolumeChange(volume: number, audioEngine: any) {
    // Protect against NaN values
    const safeVolume = isNaN(volume) ? 0.3 : Math.max(0, Math.min(1, volume));
    audioEngine.updateVolume(safeVolume);
  }

  // Handle play
  handlePlay(audioEngine: any, backendEngine: any, patterns8D: any) {

    // 🔥 BULLETPROOF: Get pattern with full null checking and defaults
    const pattern = this.state.appState.currentPattern?.frequencies ? 
      this.state.appState.currentPattern : 
      {
        frequencies: {
          carrier: 140,
          beat: 4
        }
      };

    // Always proceed with play - let the audio engine handle the actual audio state
    // Choose engine based on spatial audio settings
    const useSpatialAudio = this.state.appState.spatialAudio?.enabled && backendEngine.backendConnected;

    if (useSpatialAudio) {
      if (backendEngine.loadPattern && this.state.appState.currentPattern) {
        backendEngine.loadPattern(this.state.appState.currentPattern);
      }
      if (backendEngine.startBinauralBeat) {
        // Both engines now use consistent BinauralBeatConfig format
        // 🔥 BULLETPROOF: Extra safety on frequency access
        const config = {
          base_frequency: pattern.frequencies?.carrier || 140,
          beat_frequency: pattern.frequencies?.beat || 4,
          volume: 0.3,
          waveform: 'sine' as const,
          spatial: {
            enabled: true,
            mode: '3d' as const,
            positioning: 'headphones' as const,
            roomSize: 'small' as const
          }
        };
        backendEngine.startBinauralBeat(config);
      }
    } else {
      if (audioEngine.loadPattern && this.state.appState.currentPattern) {
        audioEngine.loadPattern(this.state.appState.currentPattern);
      }
      if (audioEngine.startBinauralBeat) {
        // Both engines now use consistent BinauralBeatConfig format
        // 🔥 BULLETPROOF: Extra safety on frequency access
        const config = {
          base_frequency: pattern.frequencies?.carrier || 140,
          beat_frequency: pattern.frequencies?.beat || 4,
          volume: 0.3,
          waveform: 'sine' as const
        };
        audioEngine.startBinauralBeat(config);
      }
    }

    // ✅ FIXED: Convert PatternConfig → Pattern8D before setting for visualizer (only if real pattern)
    if (patterns8D && patterns8D.setActivePattern && this.state.appState.currentPattern) {
      const pattern8D = convertPatternConfigToPattern8D(this.state.appState.currentPattern);
      patterns8D.setActivePattern(pattern8D);
    }

  }

  // Handle stop
  handleStop(audioEngine: AudioEngine, backendEngine: any, patterns8D: any) {

    // Stop both audio engines
    if (backendEngine.stopBinauralBeat) {
      backendEngine.stopBinauralBeat();
    }
    if (audioEngine.stopBinauralBeat) {
      audioEngine.stopBinauralBeat();
    }

    // Clear visualizer pattern
    if (patterns8D && patterns8D.clearActivePattern) {
      patterns8D.clearActivePattern();
    }

  }

  // Handle tab change
  handleTabChange(tabId: string) {
    this.updateAppState({ activeTab: tabId });
  }

  // Handle section close
  handleSectionClose(id: string) {
    this.setState(prev => ({
      ...prev,
      closedSections: [...prev.closedSections, id]
    }));
  }

  // Handle section restore
  handleSectionRestore(id: string) {
    this.setState(prev => ({
      ...prev,
      closedSections: prev.closedSections.filter(sectionId => sectionId !== id)
    }));
  }

  // Toggle advanced controls and auto-connect backend when opening
  toggleAdvancedControls(backendEngine?: any) {
    this.setState(prev => {
      const willOpen = !prev.advancedControlsOpen;
      
      // Auto-connect backend when opening advanced controls (only if not connected and not connecting)
      if (willOpen && backendEngine && !backendEngine.backendConnected && !backendEngine.websocketState?.connecting) {
        try {
          backendEngine.connectBackend();
        } catch (error) {
        }
      } else if (willOpen && backendEngine?.websocketState?.connecting) {
      }
      
      return {
        ...prev,
        advancedControlsOpen: willOpen
      };
    });
  }

  // Toggle dark screen
  toggleDarkScreen() {
    this.setState(prev => ({
      ...prev,
      darkScreen: !prev.darkScreen
    }));
  }
}
