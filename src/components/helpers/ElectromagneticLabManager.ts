// Electromagnetic Beat Lab Manager - State and Logic Helper
// Separates complex state management and business logic from UI component

import type { AppState, ElectromagneticBeatLabProps, PatternMode } from '../../types';
import { WAVE_PATTERNS } from '../../data/patterns';

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
    return {
      ...currentElectromagnetic,
      frequency: currentAudioState.beatFreq || this.state.appState.frequency || 4,
      strength: currentAudioState.isPlaying ? Math.min(1, (currentAudioState.volume || 0.5) * 2) : 0,
      resonance: currentAudioState.isPlaying ? 0.7 + (currentAudioState.beatFreq || 4) / 40 * 0.3 : 0,
      coherence: currentAudioState.isPlaying ? 0.8 : 0,
      stability: currentAudioState.isPlaying ? 0.9 : 0
    };
  }

  // Create immediate electromagnetic field for visualizer responsiveness
  createImmediateElectromagnetic(frequency: number, isPlaying: boolean, volume: number) {
    return {
      strength: isPlaying ? Math.min(1, (volume || 0.5) * 2) : 0.3,
      frequency: frequency,
      phase: 0,
      coherence: 0.8,
      resonance: 0.7 + frequency / 40 * 0.3,
      state: isPlaying ? 'ACTIVE' : 'STANDBY' as const,
      stability: 0.9
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
      
      // Set active pattern for visualization (if patterns8D is our new interface)
      if (patterns8D && patterns8D.setActivePattern) {
        patterns8D.setActivePattern(pattern);
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
    
    if (this.state.appState.currentPattern) {
      const leftFreq = this.state.appState.currentPattern.frequencies.carrier;
      const rightFreq = leftFreq + frequency;
      audioEngine.updateFrequency(leftFreq, rightFreq);
    }
  }

  // Handle volume change
  handleVolumeChange(volume: number, audioEngine: any) {
    this.updateAppState({ volume });
    audioEngine.updateVolume(volume);
  }

  // Handle play
  handlePlay(audioEngine: any, backendEngine: any, patterns8D: any) {
    console.log('🎛️ HandlePlay called - Current Pattern:', this.state.appState.currentPattern?.name, 'Is Playing:', this.state.appState.isPlaying);
    
    // Always proceed with play - let the audio engine handle the actual audio state
    if (this.state.appState.currentPattern) {
      // Choose engine based on spatial audio settings
      const useSpatialAudio = this.state.appState.spatialAudio?.enabled && backendEngine.backendConnected;
      
      if (useSpatialAudio) {
        console.log('🎧 Using Backend Engine for 8D Spatial Audio');
        if (backendEngine.loadPattern) {
          backendEngine.loadPattern(this.state.appState.currentPattern);
        }
        if (backendEngine.startBinauralBeat) {
          const config = {
            leftFreq: this.state.appState.currentPattern.frequencies.carrier,
            rightFreq: this.state.appState.currentPattern.frequencies.carrier + this.state.appState.currentPattern.frequencies.beat,
            beatFreq: this.state.appState.currentPattern.frequencies.beat,
            amplitude: this.state.appState.volume || 0.3,
            waveform: 'sine' as const
          };
          backendEngine.startBinauralBeat(config);
        }
      } else {
        console.log('🎵 Using Frontend Engine for Basic Binaural Beats');
        if (audioEngine.loadPattern) {
          audioEngine.loadPattern(this.state.appState.currentPattern);
        }
        if (audioEngine.startBinauralBeat) {
          const config = {
            leftFreq: this.state.appState.currentPattern.frequencies.carrier,
            rightFreq: this.state.appState.currentPattern.frequencies.carrier + this.state.appState.currentPattern.frequencies.beat,
            beatFreq: this.state.appState.currentPattern.frequencies.beat,
            amplitude: this.state.appState.volume || 0.3,
            waveform: 'sine' as const
          };
          audioEngine.startBinauralBeat(config);
        }
      }
      
      // Set pattern for visualizer
      if (patterns8D && patterns8D.setActivePattern) {
        patterns8D.setActivePattern(this.state.appState.currentPattern);
      }
      
      this.updateAppState({ isPlaying: true });
      console.log('✅ Play completed successfully');
    } else {
      console.log('❌ No pattern selected - please select a pattern first');
    }
  }

  // Handle stop
  handleStop(audioEngine: any, backendEngine: any, patterns8D: any) {
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
      
      // Auto-connect backend when opening advanced controls
      if (willOpen && backendEngine && !backendEngine.backendConnected) {
        console.log('🔌 Advanced Controls: Auto-connecting to backend engine...');
        try {
          backendEngine.connectBackend();
        } catch (error) {
          console.error('❌ Advanced Controls: Failed to auto-connect backend:', error);
        }
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