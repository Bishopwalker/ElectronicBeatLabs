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
    // Get amplitude from either backend (config.amplitude) or frontend (amplitude) format
    const amplitude = currentAudioState.config?.amplitude ?? currentAudioState.amplitude ?? 0.5;
    const beatFreq = currentAudioState.beat_frequency ?? currentAudioState.config?.beat_frequency ?? this.state.appState.beat_frequency ?? 4;

    return {
      ...currentElectromagnetic,
      frequency: beatFreq,
      strength: currentAudioState.isPlaying ? Math.min(1, amplitude * 2) : 0,
      resonance: currentAudioState.isPlaying ? 0.7 + (beatFreq / 40) * 0.3 : 0,
      coherence: currentAudioState.isPlaying ? 0.8 : 0,
      // Stability: Use amplitude as proxy - higher amplitude = more stable signal
      // Scale from 0-1 amplitude to 0.5-1.0 stability range for playing state
      stability: currentAudioState.isPlaying ? Math.max(0.5, amplitude) : 0
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
        console.log('🎨 Converting pattern to Pattern8D for visualization:', pattern8D);
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
  handleFrequencyChange(frequency: number, audioEngine: any) {
    this.updateAppState({ frequency });
    
    // 🔥 BULLETPROOF: Check pattern AND frequencies exist
    if (this.state.appState.currentPattern?.frequencies?.carrier) {
      const leftFreq = this.state.appState.currentPattern.frequencies.carrier;
      const rightFreq = leftFreq + frequency;
      audioEngine.updateFrequency(leftFreq, rightFreq);
    } else {
      console.warn('⚠️ Cannot update frequency - pattern or frequencies missing');
    }
  }

  // Handle volume change
  handleVolumeChange(volume: number, audioEngine: any) {
    // Protect against NaN values
    const safeVolume = isNaN(volume) ? 0.3 : Math.max(0, Math.min(1, volume));
    console.log('🔊 handleVolumeChange:', { original: volume, safe: safeVolume });
    this.updateAppState({ volume: safeVolume });
    audioEngine.updateVolume(safeVolume);
  }

  // Handle play
  handlePlay(audioEngine: any, backendEngine: any, patterns8D: any) {
    console.log('🎛️ HandlePlay called - Current Pattern:', this.state.appState.currentPattern?.name, 'Is Playing:', this.state.appState.isPlaying);

    // 🔥 BULLETPROOF: Get pattern with full null checking and defaults
    const pattern = this.state.appState.currentPattern?.frequencies ? 
      this.state.appState.currentPattern : 
      {
        frequencies: {
          carrier: this.state.appState.frequency || 140,
          beat: this.state.appState.beat_frequency || 4
        }
      };

    // Always proceed with play - let the audio engine handle the actual audio state
    // Choose engine based on spatial audio settings
    const useSpatialAudio = this.state.appState.spatialAudio?.enabled && backendEngine.backendConnected;

    if (useSpatialAudio) {
      console.log('🎧 Using Backend Engine for 8D Spatial Audio');
      if (backendEngine.loadPattern && this.state.appState.currentPattern) {
        backendEngine.loadPattern(this.state.appState.currentPattern);
      }
      if (backendEngine.startBinauralBeat) {
        // Both engines now use consistent BinauralBeatConfig format
        // 🔥 BULLETPROOF: Extra safety on frequency access
        const config = {
          base_frequency: pattern.frequencies?.carrier || 140,
          beat_frequency: pattern.frequencies?.beat || 4,
          amplitude: this.state.appState.volume || 0.3,
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
      console.log('🎵 Using Frontend Engine for Basic Binaural Beats');
      if (audioEngine.loadPattern && this.state.appState.currentPattern) {
        audioEngine.loadPattern(this.state.appState.currentPattern);
      }
      if (audioEngine.startBinauralBeat) {
        // Both engines now use consistent BinauralBeatConfig format
        // 🔥 BULLETPROOF: Extra safety on frequency access
        const config = {
          base_frequency: pattern.frequencies?.carrier || 140,
          beat_frequency: pattern.frequencies?.beat || 4,
          amplitude: this.state.appState.volume || 0.3,
          waveform: 'sine' as const
        };
        audioEngine.startBinauralBeat(config);
      }
    }

    // ✅ FIXED: Convert PatternConfig → Pattern8D before setting for visualizer (only if real pattern)
    if (patterns8D && patterns8D.setActivePattern && this.state.appState.currentPattern) {
      const pattern8D = convertPatternConfigToPattern8D(this.state.appState.currentPattern);
      console.log('🎨 Converting pattern to Pattern8D for visualization on play:', pattern8D);
      patterns8D.setActivePattern(pattern8D);
    }

    this.updateAppState({ isPlaying: true });
    console.log('✅ Play completed successfully');
  }

  // Handle stop
  handleStop(audioEngine: AudioEngine, backendEngine: any, patterns8D: any) {
    console.log('🛑 HandleStop called');

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

    this.updateAppState({ isPlaying: false });
    console.log('✅ Stop completed successfully');
  }

  // Handle tab change
  handleTabChange(tabId: string) {
    this.updateAppState({ activeTab: tabId });
  }

  // Handle section close
  handleSectionClose(id: string) {
    console.log('🔴 Closing section:', id);  // Debug log
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
        console.log('🔌 Advanced Controls: Auto-connecting to backend engine...');
        try {
          backendEngine.connectBackend();
        } catch (error) {
          console.error('❌ Advanced Controls: Failed to auto-connect backend:', error);
        }
      } else if (willOpen && backendEngine?.websocketState?.connecting) {
        console.log('⏳ Advanced Controls: Backend connection already in progress, skipping auto-connect');
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