// Electromagnetic Beat Lab - Main Component (Updated with Grid Layout)
// Advanced binaural beats generator with electromagnetic field visualization
// Implements sticky header, collapsible timer, and 2x3/3x2 grid layout

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Box, Button, ButtonGroup, Chip, Grid, IconButton, Paper, Typography} from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import type {ElectromagneticBeatLabProps, PatternConfig} from '../../types';

// Constants
import {DEFAULT_BASE_FREQUENCY, DEFAULT_BEAT_FREQUENCY, DEFAULT_VOLUME} from '../../constants/audio.constants';

// Centralized Audio Controls
import {startBinauralAudio, stopBinauralAudio} from '../../utils/audioControls';

// Hooks and Data
import {
  useBinauralVisualization,
  useCurrentPresetTracker,
  useElectromagneticLabState,
  useHybridAudioEngine
} from '../../hooks';
import {WAVE_PATTERNS} from '../../data/patterns';
// Configuration and Styles
import {SECTION_DATA, TAB_CONFIG} from '../config/ElectromagneticLabConfig';
import {ElectromagneticLabStyles} from '../styles/ElectromagneticLabStyles';

// Components
import StarField from '../StarField';
import SpatialVisualizer from '../SpatialVisualizer';
import PatternSelectorMUI from '../PatternSelectorMUI';
import ElectromagneticStatus from '../ElectromagneticStatus';
import MainControlsMUI from '../MainControlsMUI';
import ControlTabs from '../shared/ControlTabs';
import BinauralGeneratorMUI from '../BinauralGeneratorMUI';
import QuickStart from '../QuickStart';
import TimerTab from '../tabs/TimerTab';

import {formatTime} from '../../helpers/timer/timerUtils';
import type {TimerStatus} from '../../data/timer';

// Extracted Components
import CollapsibleSection from '../shared/CollapsibleSection';
import TabContentRenderer from '../shared/TabContentRenderer';
import SystemStatusChips from '../shared/SystemStatusChips';
import TimerCountdownDisplay from '../TimerCountdownDisplay';
import EqualizerMUI from '../EqualizerMUI';
import {FrequencyVisualizer} from '../FrequencyVisualizer';

const ElectromagneticBeatLab: React.FC<ElectromagneticBeatLabProps> = ({
  initialPattern,
  autoStart = false
}) => {
  // Use custom hook for all state management
  const {
    closedSections,
    advancedControlsOpen,
    darkScreen,
    appState,
    handlePatternSelect,
    handleModeChange,
    handleFrequencyChange,
    handleVolumeChange,
    handlePlay,
    handleTabChange,
    handleSectionClose,
    handleSectionRestore,
    toggleAdvancedControls,
    toggleDarkScreen,
    updateAppState,
    updateElectromagneticState
  } = useElectromagneticLabState(initialPattern?.id , autoStart);

  // SINGLE AUDIO ENGINE: Hybrid engine manages both frontend + backend internally
  const hybridEngine = useHybridAudioEngine();

  // LEGACY COMPONENT REFERENCES: Extract internal engines for components that need them
  const backendEngine = hybridEngine.backendEngine;
  const frontendEngine = hybridEngine.frontendEngine;

  const activeAudioEngine = hybridEngine;

  // Session ID tracking from hybrid engine's backend connection
  const sessionId = hybridEngine.backendSessionId;

  // Timer status for preset tracking
  const [timerStatus, setTimerStatus] = useState<TimerStatus | undefined>(undefined);

  // 🔥 NEW: Grid layout mode state (2x3 or 3x2)
  const [gridMode, setGridMode] = useState<'2x3' | '3x2'>('2x3');

  // 🔥 CRITICAL FIX: Use refs for timer callbacks to prevent infinite re-render loops
  const timerNavigationRef = useRef<{
    jumpToTransition: (direction: 'next' | 'previous') => void;
    restartCurrentTransition: () => void;
  }>({
    jumpToTransition: () => console.warn('Timer navigation not initialized'),
    restartCurrentTransition: () => console.warn('Timer navigation not initialized')
  });

  const timerControlRef = useRef<{
    stopTimer: () => void;
    pauseTimer: () => void;
    resumeTimer: () => void;
    restartTimer: () => void;
  }>({
    stopTimer: () => console.warn('Timer control not initialized'),
    pauseTimer: () => console.warn('Timer control not initialized'),
    resumeTimer: () => console.warn('Timer control not initialized'),
    restartTimer: () => console.warn('Timer control not initialized')
  });

  // Setter functions for child components to update refs
  const setTimerNavigation = useCallback((nav: typeof timerNavigationRef.current) => {
    timerNavigationRef.current = nav;
  }, []);

  const setTimerControl = useCallback((ctrl: typeof timerControlRef.current) => {
    timerControlRef.current = ctrl;
  }, []);

  // Current preset tracking
  const { currentPreset } = useCurrentPresetTracker({
    timerStatus,
    activePattern: appState.currentPattern || undefined,
    audioState: frontendEngine.audioState
  });

  // 🔥 NEW: Initialize audio context on first user interaction
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Boost mode state (enables 0-200% volume range)
  const [boostMode, setBoostMode] = useState(false);

  // 🔥 ENHANCED: Scroll detection for sticky header with smooth transitions
  const [isScrolled, setIsScrolled] = useState(false);
  const contentAreaRef = useRef<HTMLDivElement>(null);

  // Track scroll position for sticky header
  useEffect(() => {
    const contentArea = contentAreaRef.current;
    if (!contentArea) return;

    const handleScroll = () => {
      // Show compact MainControls when scrolled down more than 50px
      setIsScrolled(contentArea.scrollTop > 50);
    };

    contentArea.addEventListener('scroll', handleScroll);
    return () => contentArea.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const initAudioOnInteraction = async () => {
      if (!audioInitialized && !hybridEngine.audioContext) {
        try {
          await hybridEngine.initializeAudio();
          setAudioInitialized(true);
        } catch (error) {
          console.error('Failed to initialize audio:', error);
        }
      }
    };

    // Listen for first user interaction
    const handleInteraction = () => {
      initAudioOnInteraction();
      // Remove listeners after first interaction
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    if (!audioInitialized) {
      document.addEventListener('click', handleInteraction, { once: true });
      document.addEventListener('keydown', handleInteraction, { once: true });
    }

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [audioInitialized, hybridEngine.audioContext, hybridEngine.initializeAudio]);

  // 🔥 PERFORMANCE FIX: Memoize audio config to prevent wasteful recalculation
  const audioConfig = useMemo(() => {
    const audioState = hybridEngine?.audioState;
    const config = audioState?.config;
    
    return {
      baseFreq: config?.base_frequency || audioState?.leftFreq || DEFAULT_BASE_FREQUENCY,
      beatFreq: config?.beat_frequency || audioState?.beat_frequency || DEFAULT_BEAT_FREQUENCY,
      volume: audioState?.volume || config?.volume || DEFAULT_VOLUME,
      spatialEnabled: appState?.spatialAudio?.enabled || false
    };
  }, [
    hybridEngine?.audioState?.config?.base_frequency,
    hybridEngine?.audioState?.config?.beat_frequency,
    hybridEngine?.audioState?.config?.volume,
    hybridEngine?.audioState?.leftFreq,
    hybridEngine?.audioState?.beat_frequency,
    hybridEngine?.audioState?.volume,
    appState?.spatialAudio?.enabled
  ]);

  // CRITICAL: Sync electromagnetic field frequency with audio engine's actual frequency
  useEffect(() => {
    const getActualFrequencies = () => {
      // Get current frequencies from active audio engine
      if (activeAudioEngine.audioState.config) {
        // Backend engine format
        return {
          base: activeAudioEngine.audioState.config.base_frequency || DEFAULT_BASE_FREQUENCY,
          beat: activeAudioEngine.audioState.config.beat_frequency || DEFAULT_BEAT_FREQUENCY
        };
      } else {
        // Frontend engine format
        return {
          base: activeAudioEngine.audioState.leftFreq || DEFAULT_BASE_FREQUENCY,
          beat: activeAudioEngine.audioState.beat_frequency || DEFAULT_BEAT_FREQUENCY
        };
      }
    };

    const frequencies = getActualFrequencies();

    // Update electromagnetic field with actual beat frequency from audio engine
    // Guard prevents infinite loop by checking if value actually changed
    if (frequencies.beat !== appState.electromagnetic.frequency) {
      updateAppState({
        electromagnetic: {
          ...appState.electromagnetic,
          frequency: frequencies?.beat || DEFAULT_BEAT_FREQUENCY
        }
      });
    }
  }, [
    // Only depend on the actual VALUES, not the objects
    activeAudioEngine.audioState.config?.base_frequency,
    activeAudioEngine.audioState.config?.beat_frequency,
    activeAudioEngine.audioState.leftFreq,
    activeAudioEngine.audioState.beat_frequency,
    appState.electromagnetic.frequency
  ]);

  // Force re-render when backend connection state changes
  useEffect(() => {
  }, [backendEngine.backendConnected, backendEngine.sessionId]);

  // Auto-enable spatial audio ONCE when backend connects AND audio is playing
  const hasAutoEnabledRef = useRef(false);
  useEffect(() => {
    const isAudioPlaying = hybridEngine.audioState.isPlaying;

    // Only run this once when backend first connects AND audio is playing
    if (backendEngine.backendConnected && backendEngine.sessionId && !hasAutoEnabledRef.current && isAudioPlaying) {
      hasAutoEnabledRef.current = true;

      // Auto-enable spatial audio when backend connects during playback
      if (!appState.spatialAudio?.enabled) {
        updateAppState({
          spatialAudio: {
            ...appState.spatialAudio,
            enabled: true
          }
        });
      }
    }

    // Reset the flag when backend disconnects or audio stops
    if (!backendEngine.backendConnected || !isAudioPlaying) {
      hasAutoEnabledRef.current = false;
    }
  }, [backendEngine.backendConnected, backendEngine.sessionId, hybridEngine.audioState.isPlaying, appState.spatialAudio?.enabled]);

  // Binaural visualization hook for frequency and electromagnetic analysis
  const { visualizationData, stats, isPlaying } = useBinauralVisualization({
    updateRate: 50,
    enabled: true,
    showSpectrum: true,
    showPeaks: true,
    showAmplitudes: true
  });

  // Calculate electromagnetic field strength from beat frequency
  const calculateElectromagneticStrength = (beatFreq: number): number => {
    if (beatFreq <= 4) return 0.333; // Delta - Low field
    if (beatFreq <= 8) return 0.444; // Theta - medium field
    if (beatFreq <= 13) return 0.666; // Alpha - medium field
    if (beatFreq <= 30) return 0.777; // Beta - moderate field
    return 0.999; // Gamma - very strong field
  };

  const electromagneticStrength = calculateElectromagneticStrength(audioConfig.beatFreq);
  const electromagneticState = audioConfig.beatFreq > 0 ?
      (audioConfig.beatFreq <= 4 ? 'DEEP RESONANCE' :
          audioConfig.beatFreq <= 8 ? 'CREATIVE FLOW' :
              audioConfig.beatFreq <= 13 ? 'FOCUSED CALM' :
                  audioConfig.beatFreq <= 30 ? 'ACTIVE FOCUS' : 'HIGH ALERT') : 'INACTIVE';

  // 🔥 FIXED: Smart backend connection with retry logic and duplicate prevention
  const connectionAttemptedRef = useRef(false);
  useEffect(() => {
    const autoConnect = (import.meta as any).env?.VITE_BACKEND_AUTOCONNECT !== 'false';
    
    // Prevent duplicate connection attempts
    if (connectionAttemptedRef.current) {
      console.log('🚫 Backend connection already attempted, skipping duplicate');
      return;
    }
    
    if (autoConnect && !backendEngine.backendConnected && backendEngine.connectBackend) {
      connectionAttemptedRef.current = true; // Mark as attempted BEFORE async call
      console.log('🔌 Attempting backend connection with retry logic...');
      
      // Retry logic: wait for backend to be ready
      const attemptConnection = async (attempt = 1, maxAttempts = 5) => {
        try {
          console.log(`⏳ Connection attempt ${attempt}/${maxAttempts}...`);
          await backendEngine.connectBackend();
          console.log('✅ Backend connected successfully!');
        } catch (error) {
          console.log(`❌ Connection attempt ${attempt} failed:`, error);
          
          if (attempt < maxAttempts) {
            const delayMs = Math.min(2000 * attempt, 10000); // Exponential backoff, max 10s
            console.log(`⏰ Waiting ${delayMs}ms before retry ${attempt + 1}...`);
            setTimeout(() => attemptConnection(attempt + 1, maxAttempts), delayMs);
          } else {
            console.log('❌ Max connection attempts reached. User can manually retry via status chip.');
            connectionAttemptedRef.current = false; // Allow manual retry later
          }
        }
      };
      
      attemptConnection();
    }
  }, []); // Empty deps - only run once on mount

  // Bound handler functions with context
  const handlePatternSelectBound = useCallback((patternId: string) => {
    const patternsInterface = {
      setActivePattern: (pattern: PatternConfig) => {
        updateAppState({ currentPattern: pattern });
      },
      clearActivePattern: () => {
        updateAppState({ currentPattern: null });
      }
    };
    handlePatternSelect(patternId, hybridEngine as any, patternsInterface as any);
  }, [handlePatternSelect, hybridEngine, updateAppState]);

  const handleModeChangeBound = useCallback((mode: any) => {
    handleModeChange(mode, activeAudioEngine as any);
  }, [handleModeChange, activeAudioEngine]);

  const handleFrequencyChangeBound = useCallback((base_frequency: number, beat_frequency: number) => {
    handleFrequencyChange(base_frequency, beat_frequency, activeAudioEngine as any);
  }, [handleFrequencyChange, activeAudioEngine]);

  const handleVolumeChangeBound = useCallback((volume: number) => {
    handleVolumeChange(volume, activeAudioEngine as any);
  }, [handleVolumeChange, activeAudioEngine]);

  const handlePlayBound = useCallback(async () => {
    const success = await startBinauralAudio(hybridEngine, {
      base_frequency: audioConfig.baseFreq,
      beat_frequency: audioConfig.beatFreq,
      volume: audioConfig.volume,
      waveform: 'sine',
    });

    // Audio state updated by hybrid engine automatically
  }, [hybridEngine, audioConfig]);

  const handleStop = useCallback(async () => {
    try {
      // Use centralized audio control utility with timer control
      const success = await stopBinauralAudio(
        hybridEngine,
        timerStatus?.session?.is_active ? timerControlRef.current : undefined
      );

      if (success) {
        // Force state update to ensure UI reflects stopped state
        updateAppState({
          electromagnetic: {
            ...appState.electromagnetic,
            state: 'INACTIVE' as const,
            strength: 0
          }
        });
      }
    } catch (error) {
      console.error('Failed to stop audio:', error);
    }
  }, [hybridEngine, timerStatus, updateAppState, appState.electromagnetic]);

  const handleToggleAdvancedControls = useCallback(() => {
    toggleAdvancedControls();
  }, [toggleAdvancedControls]);

  // Handle engine toggle changes
  const handleEngineToggle = useCallback(async (engineType: 'binaural' | 'backend' | 'spatial' | 'frontend', enabled: boolean) => {
    try {
      switch (engineType) {
        case 'binaural':
        case 'frontend':
          // FRONTEND ENGINE - explicit fallback only
          if (enabled) {
            // First stop backend if it's running
            if (backendEngine.backendConnected) {
              await backendEngine.stopBackendSession();
              if (backendEngine.disconnectBackend) {
                await backendEngine.disconnectBackend();
              }
            }
            // Start frontend engine
            await frontendEngine.startBinauralBeat({
              base_frequency: audioConfig.baseFreq,
              beat_frequency: audioConfig.beatFreq,
              volume: audioConfig.volume,
              waveform: 'sine'
            });
          } else {
           frontendEngine.stopBinauralBeat();
          }
          break;

        case 'backend':
          // BACKEND ENGINE - this is the main binaural engine
          if (enabled) {
            // First stop frontend if it's running
            if (frontendEngine.audioState.isPlaying) {
              frontendEngine.stopBinauralBeat();
            }
            // Connect to backend and start session
            if (!backendEngine.backendConnected && backendEngine.connectBackend) {
              await backendEngine.connectBackend();
              
              const defaultConfig = {
                base_frequency: audioConfig.baseFreq,
                beat_frequency: audioConfig.beatFreq,
                volume: audioConfig.volume,
                waveform: appState.config.waveform,
                spatial_enabled: audioConfig.spatialEnabled,
                frequency: audioConfig.baseFreq
              };
              await backendEngine.startBackendSession(defaultConfig);
            }
          } else {
            // Stop backend session and disconnect
            if (backendEngine.backendConnected) {
              await backendEngine.stopBackendSession();
              if (backendEngine.disconnectBackend) {
                await backendEngine.disconnectBackend();
              }
            }
          }
          break;

        case 'spatial':
          // Update spatial audio settings in app state
          updateAppState({
            spatialAudio: {
              ...appState.spatialAudio,
              enabled: enabled
            }
          });

          // If enabling spatial audio but backend isn't connected, auto-connect
          if (enabled && !backendEngine.backendConnected && backendEngine.connectBackend) {
            await backendEngine.connectBackend();
          }
          break;
      }
    } catch (error) {
      console.error('Failed to toggle engine:', error);
    }
  }, [frontendEngine, backendEngine, appState, updateAppState, audioConfig]);

  // Get section data for restore functionality
  const getSectionData = (id: string) => {
    return SECTION_DATA[id as keyof typeof SECTION_DATA] || { title: 'Unknown', icon: '❓' };
  };

  // Create proper state for FrequencyVisualizer with audio engine reference
  const frequencyVisualizerState = useMemo(() => {
    // Get frequency values from hybrid engine (the ACTUAL playing frequencies)
    const baseFreq = hybridEngine.audioState.config?.base_frequency || DEFAULT_BASE_FREQUENCY;
    const beatFreq = hybridEngine.audioState.config?.beat_frequency || DEFAULT_BEAT_FREQUENCY;
    const isPlaying = hybridEngine.audioState?.isPlaying;

    return {
      // Audio engine reference - FrequencyVisualizer accesses state.audio.audioState.isPlaying
      audio: hybridEngine,

      // Direct audio properties for FrequencyVisualizer fallback paths
      isPlaying,
      base_frequency: baseFreq,
      beat_frequency: beatFreq,

      // Config object for compatibility
      config: {
        base_frequency: baseFreq,
        beat_frequency: beatFreq,
      },

      // AppState properties (spread safely)
      mode: appState.mode,
      currentPattern: appState.currentPattern,
      patterns8D: appState.patterns8D,
      electromagnetic: appState.electromagnetic,
      systemStatus: appState.systemStatus,
      visualizations: appState.visualizations,
      spatialAudio: appState.spatialAudio,
      youtube: appState.youtube,
      frequency: appState.frequency,
      adhd: appState.adhd,
      frequencyRange: appState.frequencyRange,
      waveGuide: appState.waveGuide,
      activeTab: appState.activeTab
    };
  }, [
    hybridEngine.audioState.isPlaying,
    hybridEngine.audioState.config,
    appState.mode,
    appState.currentPattern,
    appState.patterns8D,
    appState.electromagnetic,
    appState.systemStatus,
    appState.visualizations,
    appState.spatialAudio,
    appState.youtube,
    appState.frequency,
    appState.adhd,
    appState.frequencyRange,
    appState.waveGuide,
    appState.activeTab
  ]);

  // Get grid items for the current grid mode
  const getGridItems = () => {
    const items = [];
    
    // Timer Presets
    if (!closedSections.includes('timerPanel')) {
      items.push(
        <Box key="timerPanel" sx={{ minHeight: 0, overflow: 'hidden', height: '100%' }}>
          <CollapsibleSection compact={true} id="timerPanel" title="Timer Presets" icon="⌚" defaultOpen={true} onClose={handleSectionClose}>
            <Box sx={{ overflow: 'visible' }}>
              <TimerTab
                appState={appState}
                audioEngine={hybridEngine as any}
                patterns8D={appState.patterns8D}
                patterns8DEngine={{
                  setActivePattern: (pattern) => updateAppState({ currentPattern: pattern }),
                  clearActivePattern: () => updateAppState({ currentPattern: null })
                }}
                onStateChange={updateAppState}
                onTimerStatusUpdate={setTimerStatus}
                onTransitionNavigation={timerNavigationRef.current}
                onTimerControl={timerControlRef.current}
                onSetTimerNavigation={setTimerNavigation}
                onSetTimerControl={setTimerControl}
              />
            </Box>
          </CollapsibleSection>
        </Box>
      );
    }

    // Patterns
    if (!closedSections.includes('patternID')) {
      items.push(
        <Box key="patternID" sx={{ minHeight: 0, overflow: 'hidden', height: '100%' }}>
          <CollapsibleSection compact={true} id="patternID" title="Patterns" icon="🌀" defaultOpen={true} onClose={handleSectionClose}>
            <PatternSelectorMUI
              patterns={WAVE_PATTERNS}
              selected={appState.currentPattern?.id || null}
              mode={appState.mode}
              onSelect={handlePatternSelectBound}
              onModeChange={handleModeChangeBound}
              activePattern={appState.currentPattern?.id || null}
            />
          </CollapsibleSection>
        </Box>
      );
    }

    // Frequency Visualizer
    if (!closedSections.includes('frequencyVisualizer')) {
      items.push(
        <Box key="frequencyVisualizer" sx={{ minHeight: 0, overflow: 'hidden', height: '100%' }}>
          <CollapsibleSection compact={true} id="frequencyVisualizer" title="Frequency Visualizer" icon="📊" defaultOpen={true} onClose={handleSectionClose}>
            <FrequencyVisualizer
              state={frequencyVisualizerState}
              audioContext={activeAudioEngine.audioContext}
              analyserNode={activeAudioEngine.analyserNode}
              title="Binaural Beat Frequency Visualizer"
              showSpectrum={true}
              showFrequencies={true}
              showMetrics={true}
            />
          </CollapsibleSection>
        </Box>
      );
    }

    // Binaural Beat Generator
    if (!closedSections.includes('binauralBeats')) {
      items.push(
        <Box key="binauralBeats" sx={{ minHeight: 0, overflow: 'hidden', height: '100%' }}>
          <CollapsibleSection id="binauralBeats" title="Binaural Beat Generator" icon="🎧" defaultOpen={true} onClose={handleSectionClose}>
            <Box sx={{ overflow: 'visible' }}>
              <BinauralGeneratorMUI
                base_frequency={audioConfig.baseFreq}
                beat_frequency={audioConfig.beatFreq}
                waveform={activeAudioEngine?.audioState?.waveform || 'sine'}
                isPlaying={hybridEngine.audioState.isPlaying}
                volume={audioConfig.volume}
                appState={appState}
                onFrequencyChange={(base_frequency, beat_frequency) => {
                  if (activeAudioEngine.updateSettings) {
                    activeAudioEngine.updateSettings({ base_frequency, beat_frequency });
                  } else if (activeAudioEngine.updateFrequency) {
                    const leftFreq = base_frequency;
                    const rightFreq = base_frequency + beat_frequency;
                    activeAudioEngine.updateFrequency(leftFreq, rightFreq);
                  }
                }}
                onWaveformChange={(waveform) => {
                  if (activeAudioEngine.updateWaveform) {
                    activeAudioEngine.updateWaveform(waveform);
                  }
                }}
                onVolumeChange={(volume) => {
                  hybridEngine.updateVolume(volume);
                }}
                onPlay={() => {
                  const config = {
                    base_frequency: audioConfig.baseFreq,
                    beat_frequency: audioConfig.beatFreq,
                    volume: audioConfig.volume,
                    waveform: (activeAudioEngine?.audioState?.waveform || 'sine') as 'sine' | 'square' | 'triangle' | 'sawtooth'
                  };
                  hybridEngine.startBinauralBeat(config);
                }}
                onStop={() => {
                  hybridEngine.stopBinauralBeat();
                }}
                currentPreset={currentPreset}
              />
            </Box>
          </CollapsibleSection>
        </Box>
      );
    }

    // Master Controls
    if (!closedSections.includes('masterControls')) {
      items.push(
        <Box key="masterControls" sx={{ minHeight: 0, overflow: 'hidden', height: '100%' }}>
          <CollapsibleSection id="masterControls" title="Master Controls" icon="🎛️" defaultOpen={true} onClose={handleSectionClose}>
            <QuickStart
              activeStatus={{
                binauralEngine: frontendEngine.audioState.isPlaying,
                backendEngine: backendEngine.audioState.isPlaying,
                spatialAudio: backendEngine.backendConnected,
                patterns: !!appState.currentPattern,
                testTones: false
              }}
              frequencies={{
                left: audioConfig.baseFreq,
                right: audioConfig.baseFreq + audioConfig.beatFreq,
                beat: audioConfig.beatFreq
              }}
              volume={hybridEngine.audioState.volume || DEFAULT_VOLUME}
              audioEngine={backendEngine}
              onToggleEngine={handleEngineToggle}
              appState={appState}
            />
          </CollapsibleSection>
        </Box>
      );
    }

    // Equalizer
    if (!closedSections.includes('equalizer')) {
      items.push(
        <Box key="equalizer" sx={{ minHeight: 0, overflow: 'hidden', height: '100%' }}>
          <CollapsibleSection id="equalizer" title="Equalizer" icon="🎚️" defaultOpen={true} onClose={handleSectionClose}>
            <EqualizerMUI
              audioContext={activeAudioEngine.audioContext || null}
              analyserNode={activeAudioEngine.analyserNode || null}
              isPlaying={hybridEngine.audioState.isPlaying}
              onEqualizerChange={(inputNode, outputNode) => {
                activeAudioEngine?.setEqualizerNodes(inputNode, outputNode);
              }}
            />
          </CollapsibleSection>
        </Box>
      );
    }

    return items;
  };

  return (
    <Box sx={ElectromagneticLabStyles.mainContainer}>
      {/* Background Star Field */}
      <StarField {...appState.visualizations.starField} />

      {/* Dark Screen Toggle Button */}
      <IconButton
        onClick={toggleDarkScreen}
        sx={ElectromagneticLabStyles.darkScreenButton(darkScreen)}
      >
        {darkScreen ? '🌞' : '🌙'}
      </IconButton>

      {/* Advanced Controls Menu Toggle Button */}
      <IconButton
        onClick={handleToggleAdvancedControls}
        sx={ElectromagneticLabStyles.advancedControlsButton}
      >
        ⚙️
      </IconButton>

      {/* Advanced Controls Menu Overlay */}
      {advancedControlsOpen && (
        <Paper elevation={8} sx={ElectromagneticLabStyles.advancedControlsMenu}>
          <Box sx={ElectromagneticLabStyles.menuHeader}>
            <Typography variant="h6" sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
              ⚙️ Advanced Controls
            </Typography>
            <IconButton onClick={handleToggleAdvancedControls} sx={{ color: 'white' }}>
              ✕
            </IconButton>
          </Box>

          <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <ControlTabs
              tabs={TAB_CONFIG.filter(tab => !['timer'].includes(tab.id))}
              activeTab={appState.activeTab}
              onTabChange={handleTabChange}
            />
          </Box>

          <Box sx={ElectromagneticLabStyles.tabContent}>
            <TabContentRenderer
              appState={appState}
              audioEngine={activeAudioEngine as any}
              backendEngine={backendEngine}
              frontendEngine={frontendEngine}
              patterns8D={appState.patterns8D}
              onStateChange={updateAppState}
              onPatternSelect={handlePatternSelectBound}
              onFrequencyChange={handleFrequencyChangeBound}
            />
          </Box>
        </Paper>
      )}

      {/* Header - Sticky with smooth transitions */}
      <Paper elevation={0} sx={{ 
        ...ElectromagneticLabStyles.headerPaper, 
        mb: { xs: 2, sm: 2.5, md: 3 },
        transition: 'all 0.3s ease',
        minHeight: isScrolled ? '60px' : '100px'
      }}>
        <Box sx={ElectromagneticLabStyles.titleStatusRow}>
          {/* Main Title Container - Hidden when scrolled */}
          <Box sx={{ 
            flex: '1 0',
            transition: 'all 0.3s ease',
            opacity: isScrolled ? 0 : 1,
            visibility: isScrolled ? 'hidden' : 'visible',
            height: isScrolled ? 0 : 'auto',
            overflow: 'hidden'
          }}>
            {/* Main Title (shown when not scrolled and no timer active) */}
            {!timerStatus?.session?.is_active && (
              <Typography variant="h4" sx={ElectromagneticLabStyles.mainTitle}>
                Bishop's Electromagnetic Beat Lab
              </Typography>
            )}
            
            {/* Timer Info replaces title when timer active */}
            {timerStatus?.session?.is_active && timerStatus?.current_transition && (
              <Box sx={{
                bgcolor: 'rgba(0,0,0,0.5)',
                border: '2px solid #ff6b00',
                borderRadius: 1,
                p: 1.5,
                maxWidth: '700px'
              }}>
                <Typography variant="h6" sx={{ color: '#00ff88', fontWeight: 'bold' }}>
                  🎧 TIMER ACTIVE: {timerStatus.current_transition.description}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {timerStatus.current_transition.frequency_hz}Hz • 
                  {timerStatus.current_transition.frequency_type} waves • 
                  {timerStatus.current_transition.left_ear_hz}Hz L / {timerStatus.current_transition.right_ear_hz}Hz R
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#ffd700', fontWeight: 'bold' }}>
                    Current: {formatTime(timerStatus.time_remaining_current)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ffd700', fontWeight: 'bold' }}>
                    Total: {formatTime(timerStatus.time_remaining_total)}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center', fontSize: '0.75rem' }}>
            <ElectromagneticStatus
              field={appState.electromagnetic}
              status={appState.systemStatus}
            />
          </Box>
        </Box>

        {/* Master Controls - Shows when scrolled (replaces title) */}
        {isScrolled && (
          <Box sx={ElectromagneticLabStyles.compactStatusOverview}>
            <MainControlsMUI
              isPlaying={hybridEngine.audioState.isPlaying}
              volume={hybridEngine.audioState.volume || DEFAULT_VOLUME}
              onPlay={handlePlayBound}
              onStop={handleStop}
              onVolumeChange={handleVolumeChangeBound}
              boostMode={boostMode}
              onBoostModeToggle={setBoostMode}
              compact={true}
            />

            <SystemStatusChips
              appState={appState}
              audioEngine={activeAudioEngine as any}
              patterns8D={appState.patterns8D}
              onStateChange={updateAppState}
              onToggleEngine={handleEngineToggle}
            />
          </Box>
        )}
      </Paper>

      {/* Content Area - Scrollable with proper grid layout */}
      <Box ref={contentAreaRef} sx={{ 
        p: { xs: 1, sm: 1.5, md: 2 }, 
        gridRow: 2, 
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden', // 🔥 CONFIRMED: Hidden to prevent horizontal scroll
        overflowY: 'auto', 
        pt: 2 
      }}>
        {/* Grid Mode Toggle */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 2,
          gap: 1,
          alignItems: 'center'
        }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>
            Grid Layout:
          </Typography>
          <ButtonGroup variant="contained" size="small">
            <Button 
              onClick={() => setGridMode('2x3')}
              variant={gridMode === '2x3' ? 'contained' : 'outlined'}
              startIcon={<GridViewIcon />}
            >
              2×3
            </Button>
            <Button 
              onClick={() => setGridMode('3x2')}
              variant={gridMode === '3x2' ? 'contained' : 'outlined'}
              startIcon={<ViewModuleIcon />}
            >
              3×2
            </Button>
          </ButtonGroup>
        </Box>

        {/* Timer Section - Collapsible Timer Display */}
        {timerStatus && !closedSections.includes('timerDisplay') && (
          <Box sx={{ 
            position: 'relative', 
            mb: 2
          }}>
            <TimerCountdownDisplay
              timerStatus={timerStatus}
              isVisible={true}
              appState={appState}
              onJumpToTransition={timerNavigationRef.current.jumpToTransition}
              onRestartTransition={timerNavigationRef.current.restartCurrentTransition}
              onPauseTimer={timerControlRef.current.pauseTimer}
              onResumeTimer={timerControlRef.current.resumeTimer}
              onRepeatSession={timerControlRef.current.restartTimer}
              audioContext={activeAudioEngine.audioContext}
              analyserNode={activeAudioEngine.analyserNode}
              hybridEngine={hybridEngine}
              onClose={() => handleSectionClose('timerDisplay')}
            />
          </Box>
        )}

        {/* Grid Layout: 2x3 or 3x2 configuration */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: gridMode === '2x3' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gridTemplateRows: gridMode === '2x3' ? 'repeat(3, minmax(200px, 1fr))' : 'repeat(2, minmax(250px, 1fr))',
          gap: { xs: 1, sm: 1.5, md: 2 },
          width: '100%',
          flex: 1,
          overflowX: 'hidden', // 🔥 CONFIRMED: No horizontal scrollbar
          '& > div': {
            minHeight: 0,
            overflow: 'hidden'
          }
        }}>
          {getGridItems()}
        </Box>

        {/* Spatial Visualizer - Full Width Below Grid */}
        {!closedSections.includes('spatialVisualizer') && (
          <Box sx={{ mt: 2, width: '100%' }}>
            <CollapsibleSection id="spatialVisualizer" title="3D Spatial Visualizer" icon="🌀" defaultOpen={true} onClose={handleSectionClose}>
              <SpatialVisualizer
                pattern={appState.currentPattern || WAVE_PATTERNS.find((pattern) => pattern.id === 'default')}
                electromagnetic={appState.electromagnetic}
                size={400}
                audioContext={activeAudioEngine.audioContext}
                analyserNode={activeAudioEngine.analyserNode}
                isPlaying={hybridEngine.audioState.isPlaying}
              />
            </CollapsibleSection>
          </Box>
        )}
      </Box>

      {/* Dark Screen Overlay */}
      {darkScreen && (
        <Box sx={ElectromagneticLabStyles.darkScreenOverlay} onClick={toggleDarkScreen}>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.3)',
              fontStyle: 'italic',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            Click anywhere to exit dark screen
          </Typography>
        </Box>
      )}

      {/* Restore Tabs for Closed Sections */}
      {closedSections.length > 0 && (
        <Box sx={ElectromagneticLabStyles.restoreTabsContainer}>
          <Paper elevation={2} sx={ElectromagneticLabStyles.restoreTabsPaper}>
            <Typography variant="body2" sx={{ mb: 1, color: '#888' }}>Closed sections:</Typography>
            <Box sx={ElectromagneticLabStyles.restoreTabsChips}>
              {closedSections.map(sectionId => {
                const sectionData = getSectionData(sectionId);
                return (
                  <Chip
                    key={sectionId}
                    label={`${sectionData.icon} ${sectionData.title}`}
                    onClick={() => handleSectionRestore(sectionId)}
                    size="small"
                    sx={{ cursor: 'pointer', bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                  />
                );
              })}
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default ElectromagneticBeatLab;
