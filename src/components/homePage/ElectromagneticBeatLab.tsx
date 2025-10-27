// Electromagnetic Beat Lab - Main Component (Refactored & Modular)
// Advanced binaural beats generator with electromagnetic field visualization
// Now properly separated into modular components under 500 lines

import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { Box, Chip, Grid, IconButton, Paper, Typography } from '@mui/material';
import type { ElectromagneticBeatLabProps } from '../../types';

// Constants
import { DEFAULT_BASE_FREQUENCY, DEFAULT_BEAT_FREQUENCY, DEFAULT_VOLUME } from '../../constants/audio.constants';

// Centralized Audio Controls
import { startBinauralAudio, stopBinauralAudio } from '../../utils/audioControls';

// Hooks and Data
import { useHybridAudioEngine, useBinauralVisualization } from '../../hooks';
import { useElectromagneticLabState } from '../../hooks/useElectromagneticLabState';
import { useCurrentPresetTracker } from '../../hooks/useCurrentPresetTracker';
import { WAVE_PATTERNS } from '../../data/patterns';
// Configuration and Styles
import { TAB_CONFIG, SECTION_DATA } from '../config/ElectromagneticLabConfig';
import { ElectromagneticLabStyles } from '../styles/ElectromagneticLabStyles';

// Components
import StarField from '../StarField';
import SpatialVisualizer from '../SpatialVisualizer';
import PatternSelectorMUI from '../PatternSelectorMUI';
import ElectromagneticStatus from '../ElectromagneticStatus';
import MainControlsMUI from '../MainControlsMUI';
import ControlTabs from '../ControlTabs';
import BinauralGeneratorMUI from '../BinauralGeneratorMUI';
import QuickStart from '../QuickStart';
import TimerTab from '../tabs/TimerTab';

import { formatTime } from '../../helpers/timer/timerUtils';
import type {  TimerStatus} from '../../data/timer';

// Extracted Components
import CollapsibleSection from '../shared/CollapsibleSection';
import TabContentRenderer from '../shared/TabContentRenderer';
import SystemStatusChips from '../shared/SystemStatusChips';
import TimerCountdownDisplay from '../TimerCountdownDisplay';
import EqualizerMUI from '../EqualizerMUI';
import { FrequencyVisualizer } from '../FrequencyVisualizer';

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
  } = useElectromagneticLabState(initialPattern , autoStart);

  // SINGLE AUDIO ENGINE: Hybrid engine manages both frontend + backend internally
  // This ensures ONE audio context, ONE WebSocket connection, seamless failover
  const hybridEngine = useHybridAudioEngine();

  // LEGACY COMPONENT REFERENCES: Extract internal engines for components that need them
  // These are NOT new instances - they're the SAME engines hybrid uses internally
  const backendEngine = hybridEngine.backendEngine;
  const frontendEngine = hybridEngine.frontendEngine;

  // CRITICAL: Active engine is ALWAYS the hybrid engine (manages both internally)
  // It provides audioContext and analyserNode from frontend engine for visualizations
  // while managing backend connection and crossfading automatically
  const activeAudioEngine = hybridEngine;

  // Session ID tracking from hybrid engine's backend connection
  const sessionId = hybridEngine.backendSessionId;

  // Timer status for preset tracking
  const [timerStatus, setTimerStatus] = useState<TimerStatus | undefined>(undefined);

  // Timer navigation callback ref
  const timerNavigationRef = useRef<{
    jumpToTransition: (direction: 'next' | 'previous') => void;
    restartCurrentTransition: () => void;
  }>({
    jumpToTransition: () => console.warn('Timer navigation not initialized'),
    restartCurrentTransition: () => console.warn('Timer navigation not initialized')
  });

  // Timer control callback ref for controlling timer (stop, pause, resume, restart)
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

  // Current preset tracking
  const { currentPreset } = useCurrentPresetTracker({
    timerStatus,
    activePattern: appState.currentPattern?.id,
    audioState: backendEngine.audioState
  });

  // 🔥 NEW: Initialize audio context on first user interaction
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Boost mode state (enables 0-200% volume range)
  const [boostMode, setBoostMode] = useState(false);

  useEffect(() => {
    const initAudioOnInteraction = async () => {
      if (!audioInitialized && !hybridEngine.audioContext) {
        console.log('👆 User interaction detected, initializing audio...');
        try {
          await hybridEngine.initializeAudio();
          setAudioInitialized(true);
          console.log('✅ Audio initialized on user interaction');
        } catch (error) {
          console.log('⚠️ Audio initialization failed, will retry:', error);
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
  }, [audioInitialized, hybridEngine]);
  // 🔥 PERFORMANCE FIX: Memoize audio config to prevent wasteful recalculation
  // This replaces the scattered constant creation throughout the component
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
  // NOTE: Electromagnetic state updates removed from useEffect to prevent infinite loops
  // Updates are now handled by the sync effect below which has proper value-based dependencies

  // CRITICAL: Sync electromagnetic field frequency with audio engine's actual frequency
  // This ensures both FrequencyVisualizer and SpatialVisualizer display the same data
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
    // This syncs SpatialVisualizer animations with real audio
    // Guard prevents infinite loop by checking if value actually changed
    if (frequencies.beat !== appState.electromagnetic.frequency) {
      console.log('🔄 Syncing electromagnetic field with audio frequency:', frequencies.beat);
      updateAppState({
        electromagnetic: {
          ...appState.electromagnetic,
          frequency: frequencies?.beat || DEFAULT_BEAT_FREQUENCY
        }
        // 🔥 REMOVED: base_frequency, beat_frequency - these live in hybridEngine.audioState
      });
    }
  }, [
    // Only depend on the actual VALUES, not the objects
    activeAudioEngine.audioState.config?.base_frequency,
    activeAudioEngine.audioState.config?.beat_frequency,
    activeAudioEngine.audioState.leftFreq,
    activeAudioEngine.audioState.beat_frequency,
    appState.electromagnetic.frequency // Only the frequency value, not the whole object!
    // updateAppState removed - already guarded with if condition above
  ]);

  // NOTE: Auto-pattern matching REMOVED - was causing infinite loops with timer
  // Patterns must be manually selected from the Patterns section
  // Timer manages its own frequency transitions without pattern interference

  // Force re-render when backend connection state changes
  useEffect(() => {
    console.log('🔄 Backend connection state changed:', backendEngine.backendConnected);
  }, [backendEngine.backendConnected, backendEngine.sessionId]);

  // Auto-enable spatial audio ONCE when backend connects AND audio is playing
  // 🔥 CRITICAL FIX: Only auto-enable when audio is actually playing!
  const hasAutoEnabledRef = useRef(false);
  useEffect(() => {
    const isAudioPlaying = hybridEngine.audioState.isPlaying;
    
    // Only run this once when backend first connects AND audio is playing
    if (backendEngine.backendConnected && backendEngine.sessionId && !hasAutoEnabledRef.current && isAudioPlaying) {
      console.log('✅ Backend connected AND audio playing! Auto-enabling required audio systems...');
      hasAutoEnabledRef.current = true;

      // Auto-enable spatial audio when backend connects during playback
      if (!appState.spatialAudio?.enabled) {
        console.log('🎧 Auto-enabling spatial audio for active backend connection...');
        updateAppState({
          spatialAudio: {
            ...appState.spatialAudio,
            enabled: true
          }
        });
      }

      console.log('🎯 All required audio systems enabled for backend operation');
    } else if (backendEngine.backendConnected && backendEngine.sessionId && !isAudioPlaying) {
      console.log('⏸️ Backend connected but audio NOT playing - skipping auto-enable');
    }

    // Reset the flag when backend disconnects or audio stops
    if (!backendEngine.backendConnected || !isAudioPlaying) {
      hasAutoEnabledRef.current = false;
    }
  }, [backendEngine.backendConnected, backendEngine.sessionId, hybridEngine.audioState.isPlaying, appState.spatialAudio?.enabled, updateAppState]);

  // NOTE: FrequencyVisualizer auto-open/close REMOVED - stays in Advanced Controls tab for more space
  // User can manually open/close it as needed

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
    // Reason: Map beat frequency to electromagnetic field strength (0-1 range)
    // Delta (0.5-4Hz): High strength for deep relaxation
    // Theta (4-8Hz): Medium-high strength for creativity
    // Alpha (8-13Hz): Medium strength for relaxed focus
    // Beta (13-30Hz): Lower strength for active focus
    if (beatFreq <= 4) return 0.333; // Delta - Low field
    if (beatFreq <= 8) return 0.444; // Theta - medium field
    if (beatFreq <= 13) return 0.666; // Alpha - medium field
    if (beatFreq <= 30) return 0.777; // Beta - moderate field
    return 0.999; // Delta - very strong field very strong field
  };

  const electromagneticStrength = calculateElectromagneticStrength(audioConfig.beatFreq);
  const electromagneticState = audioConfig.beatFreq > 0 ?
      (audioConfig.beatFreq <= 4 ? 'DEEP RESONANCE' :
          audioConfig.beatFreq <= 8 ? 'CREATIVE FLOW' :
              audioConfig.beatFreq <= 13 ? 'FOCUSED CALM' :
                  audioConfig.beatFreq <= 30 ? 'ACTIVE FOCUS' : 'HIGH ALERT') : 'INACTIVE';

  // Simple one-time backend connection attempt on startup
  // 🔥 FIX: Add connection attempt guard to prevent React StrictMode double-mounting issues
  const connectionAttemptedRef = React.useRef(false);
  useEffect(() => {
    if (!backendEngine.backendConnected && backendEngine.connectBackend && !connectionAttemptedRef.current) {
      console.log('🔌 One-time backend connection attempt on startup...');
      connectionAttemptedRef.current = true;
      backendEngine.connectBackend().catch((error) => {
        console.log('⚠️ Backend connection failed (expected if backend not running):', error.message);
        // Reset flag on error so user can retry
        connectionAttemptedRef.current = false;
      });
    }
  }, []); // Empty dependency array - only run once on mount (but React StrictMode will double-call)

  // Bound handler functions with context
  // 🔥 FIXED: Stable closure with proper dependencies
  const handlePatternSelectBound = useCallback((patternId: string) => {
    const patternsInterface = {
      setActivePattern: (pattern: { name: any; }) => {
        console.log('🎨 Setting active pattern for visualizer:', pattern.name);
        updateAppState({ currentPattern: pattern });
      },
      clearActivePattern: () => {
        console.log('🎨 Clearing active pattern from visualizer');
        updateAppState({ currentPattern: null });
      }
    };
    handlePatternSelect(patternId, hybridEngine, patternsInterface);
  }, [handlePatternSelect, hybridEngine, updateAppState]); // 🔥 FIXED: Proper dependencies

  const handleModeChangeBound = useCallback((mode: any) => {
    handleModeChange(mode, activeAudioEngine);
  }, [handleModeChange, activeAudioEngine]);

  const handleFrequencyChangeBound = useCallback((frequency: number) => {
    handleFrequencyChange(frequency, activeAudioEngine);
  }, [handleFrequencyChange, activeAudioEngine]);

  const handleVolumeChangeBound = useCallback((volume: number) => {
    handleVolumeChange(volume, activeAudioEngine);
  }, [handleVolumeChange, activeAudioEngine]);

  const handlePlayBound = useCallback(async () => {
    // 🔥 FIXED: Use memoized audioConfig instead of recreating
    console.log('🎵 Play with bulletproof config:', audioConfig);
    
    const success = await startBinauralAudio(hybridEngine, {
      base_frequency: audioConfig.baseFreq,
      beat_frequency: audioConfig.beatFreq,
      volume: audioConfig.volume,
      waveform: 'sine'
    });

    // Audio state updated by hybrid engine automatically
    console.log(success ? '✅ Audio started' : '❌ Audio start failed');
  }, [hybridEngine, audioConfig]);

  const handleStop = useCallback(async () => {
    console.log('🛑 App: Stop button clicked');
    console.log('🛑 App: Hybrid audioState BEFORE:', hybridEngine.audioState);

    try {
      // Use centralized audio control utility with timer control
      const success = await stopBinauralAudio(
        hybridEngine,
        timerStatus?.session?.is_active ? timerControlRef.current : undefined
      );

      if (success) {
        console.log('✅ Audio stopped successfully');
        
        // 🔥 CRITICAL FIX: Force state update to ensure UI reflects stopped state
        updateAppState(prev => ({
          ...prev,
          electromagnetic: {
            ...prev.electromagnetic,
            state: 'INACTIVE' as const,
            strength: 0
          }
        }));
        
        console.log('🛑 App: Hybrid audioState AFTER:', hybridEngine.audioState);
      } else {
        console.error('❌ Audio stop failed');
      }
    } catch (error) {
      console.error('❌ Error stopping audio:', error);
    }
  }, [hybridEngine, timerStatus, updateAppState]);

  const handleToggleAdvancedControls = useCallback(() => {
    toggleAdvancedControls(backendEngine);
  }, [toggleAdvancedControls, backendEngine]);

  // Handle engine toggle changes
  const handleEngineToggle = useCallback(async (engineType: 'binaural' | 'backend' | 'spatial' | 'frontend', enabled: boolean) => {
    console.log(`🔄 Engine Toggle: ${engineType} -> ${enabled}`);

    try {
      switch (engineType) {
        case 'binaural':
        case 'frontend':
          // FRONTEND ENGINE - explicit fallback only
          if (enabled) {
            console.log('▶️ Starting frontend binaural engine (explicit fallback)...');
            // First stop backend if it's running
            if (backendEngine.backendConnected) {
              console.log('⏹️ Stopping backend to switch to frontend...');
              await backendEngine.stopBackendSession();
              if (backendEngine.disconnectBackend) {
                await backendEngine.disconnectBackend();
              }
            }
            // Start frontend engine WITHOUT setting a pattern
            // 🔥 FIXED: Use memoized audioConfig
            console.log('🎵 Frontend start with bulletproof config:', audioConfig);
            
            await frontendEngine.startBinauralBeat({
              base_frequency: audioConfig.baseFreq,
              beat_frequency: audioConfig.beatFreq,
              volume: audioConfig.volume,
              waveform: 'sine'
            });
            // Audio state updated by hybrid engine automatically - no updateAppState needed
          } else {
            console.log('⏹️ Stopping frontend binaural engine...');
           frontendEngine.stopBinauralBeat();
            // Audio state updated by hybrid engine automatically - no updateAppState needed
          }
          break;

        case 'backend':
          // BACKEND ENGINE - this is the main binaural engine
          if (enabled) {
            // First stop frontend if it's running
            if (frontendEngine.audioState.isPlaying) {
              console.log('⏹️ Stopping frontend to switch to backend...');
              frontendEngine.stopBinauralBeat();
            }
            // Connect to backend and start session
            if (!backendEngine.backendConnected && backendEngine.connectBackend) {
              console.log('🔌 Connecting to backend (main binaural engine)...');
              await backendEngine.connectBackend();

              // Auto-start backend session with default binaural config
              console.log('🎧 Starting backend binaural session...');
              // 🔥 FIXED: Use memoized audioConfig
              console.log('🎵 Backend start with bulletproof config:', audioConfig);
              
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
              console.log('⏹️ Stopping backend binaural engine...');
              await backendEngine.stopBackendSession();
              if (backendEngine.disconnectBackend) {
                await backendEngine.disconnectBackend();
              }
            }
          }
          break;

        case 'spatial':
          // Update spatial audio settings in app state
          console.log('🎧 Toggling spatial audio:', enabled);
          updateAppState({
            spatialAudio: {
              ...appState.spatialAudio,
              enabled: enabled
            }
          });

          // If enabling spatial audio but backend isn't connected, auto-connect
          if (enabled && !backendEngine.backendConnected && backendEngine.connectBackend) {
            console.log('🔌 Auto-connecting backend for spatial audio...');
            await backendEngine.connectBackend();
          }
          break;
      }
    } catch (error) {
      console.error(`❌ Error toggling ${engineType} engine:`, error);
    }
  }, [frontendEngine, backendEngine, appState, updateAppState, audioConfig]);

  // Get section data for restore functionality
  const getSectionData = (id: string) => {
    return SECTION_DATA[id as keyof typeof SECTION_DATA] || { title: 'Unknown', icon: '❓' };
  };

  // 🔥 FIXED: Create proper state for FrequencyVisualizer with audio engine reference
  // This ensures visualizer works with normal patterns and beats, not just timer presets
  const frequencyVisualizerState = useMemo(() => {
    // Get frequency values from hybrid engine (the ACTUAL playing frequencies)
    const baseFreq = hybridEngine.audioState.config?.base_frequency || DEFAULT_BASE_FREQUENCY;
    const beatFreq = hybridEngine.audioState.config?.beat_frequency || DEFAULT_BEAT_FREQUENCY;
    const isPlaying = hybridEngine.audioState?.isPlaying;

    return {
      // 🔥 Audio engine reference - FrequencyVisualizer accesses state.audio.audioState.isPlaying
      audio: hybridEngine,

      // 🔥 Direct audio properties for FrequencyVisualizer fallback paths
      isPlaying,
      base_frequency: baseFreq,
      beat_frequency: beatFreq,

      // 🔥 Config object for compatibility
      config: {
        base_frequency: baseFreq,
        beat_frequency: beatFreq,
      },

      // 🔥 AppState properties (spread safely)
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


            {/* DEBUG: Show timer status */}
            {timerStatus && (
              <Box sx={{ mb: 1, p: 0.5, bgcolor: 'rgba(255,0,0,0.1)', fontSize: '0.7rem' }}>
                Timer Status: {timerStatus?.session?.is_active ? 'ACTIVE' : 'INACTIVE'} |
                Has Session: {timerStatus?.session ? 'YES' : 'NO'} |
                Has Transition: {timerStatus?.current_transition ? 'YES' : 'NO'}
              </Box>
            )}
          </Box>

          <Box sx={ElectromagneticLabStyles.tabContent}>
            <TabContentRenderer
              appState={appState}
              audioEngine={activeAudioEngine}
              backendEngine={backendEngine}
              frontendEngine={frontendEngine}
              patterns8D={appState.patterns8D} // ✅ FIXED: Use converted Pattern8D[] from appState
              onStateChange={updateAppState}
              onPatternSelect={handlePatternSelectBound}
              onFrequencyChange={handleFrequencyChangeBound}
            />
          </Box>
        </Paper>
      )}

      {/* Header */}
      <Paper elevation={0} sx={ElectromagneticLabStyles.headerPaper}>
        <Box sx={ElectromagneticLabStyles.titleStatusRow}>
          <Box sx={{ flex: 1 }}>
            {/* TIMER REPLACES MAIN TITLE when active */}
            {timerStatus?.session?.is_active && timerStatus?.current_transition ? (
              <Box sx={{
                bgcolor: 'rgba(0,0,0,0.5)',
                border: '2px solid #ff6b00',
                borderRadius: 1,
                p: 2,
                maxWidth: '700px',
                boxShadow: '0 0 15px rgba(255, 107, 0, 0.3)'
              }}>{/* Frequency Analyzer */}
                {visualizationData && (
                    <Paper
                        elevation={0}
                        sx={{
                          p: 0.75,
                          background: 'rgba(255, 107, 0, 0.05)',
                          border: '1px solid rgba(255, 107, 0, 0.3)',
                        }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        📊 Real-time Frequency Analysis
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid size={4}>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                            SNR
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#ff6b00', fontWeight: 600 }}>
                            {visualizationData.signalQuality.snr.toFixed(1)} dB
                          </Typography>
                        </Grid>
                        <Grid size={4}>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                            Clarity
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#ff6b00', fontWeight: 600 }}>
                            {(visualizationData.signalQuality.clarity * 100).toFixed(0)}%
                          </Typography>
                        </Grid>
                        <Grid size={4}>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                            Quality
                          </Typography>
                          <Chip
                              label={stats.dataQuality.toUpperCase()}
                              size="small"
                              sx={{
                                fontSize: '0.55rem',
                                height: '16px',
                                backgroundColor:
                                    stats.dataQuality === 'excellent' ? 'rgba(76, 175, 80, 0.2)' :
                                        stats.dataQuality === 'good' ? 'rgba(255, 193, 7, 0.2)' :
                                            stats.dataQuality === 'fair' ? 'rgba(255, 152, 0, 0.2)' :
                                                'rgba(244, 67, 54, 0.2)',
                                color:
                                    stats.dataQuality === 'excellent' ? '#4caf50' :
                                        stats.dataQuality === 'good' ? '#ffc107' :
                                            stats.dataQuality === 'fair' ? '#ff9800' :
                                                '#f44336',
                              }}
                          />
                        </Grid>
                      </Grid>
                      {visualizationData.peakFrequencies.length > 0 && (
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                              Detected Peaks: {visualizationData.peakFrequencies.slice(0, 2).map(p => `${p.frequency.toFixed(1)}Hz`).join(', ')}
                            </Typography>
                          </Box>
                      )}
                    </Paper>
                )}
                <Typography variant="h4" sx={ElectromagneticLabStyles.mainTitle}>
                  Bishop's Electromagnetic Beat Lab
                </Typography>
                <Typography variant="h5" gutterBottom sx={{color: '#00ff88', fontSize: '1.2rem', fontWeight: 'bold'}}>
                  🎧 TIMER ACTIVE: {timerStatus.current_transition.description}
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom sx={{ fontSize: '0.9rem' }}>
                  <Box component="span" sx={{color: '#ff6b00', fontWeight: 'bold', fontSize: '1rem'}}>
                    {timerStatus.current_transition.frequency_hz}Hz
                  </Box> •
                  {timerStatus.current_transition.frequency_type} waves •
                  <Box component="span" sx={{color: '#00bfff', fontWeight: 'bold'}}>
                    {timerStatus.current_transition.left_ear_hz}Hz L / {timerStatus.current_transition.right_ear_hz}Hz R
                  </Box>
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ffd700' }}>
                    Current: {formatTime(timerStatus.time_remaining_current)}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ffd700' }}>
                    Total: {formatTime(timerStatus.time_remaining_total)}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="h4" sx={ElectromagneticLabStyles.mainTitle}>
                Bishop's Electromagnetic Beat Lab
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center', fontSize: '0.75rem' }}>
            <ElectromagneticStatus
              field={appState.electromagnetic}
              status={appState.systemStatus}
            />
          </Box>
        </Box>


        {/* Compact Status Overview - Show when Master Controls is closed */}
        {closedSections.includes('masterControls') && (
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
              audioEngine={activeAudioEngine}
              patterns8D={appState.patterns8D} //
              onStateChange={updateAppState}
              onToggleEngine={handleEngineToggle}
            />
          </Box>
        )}
      </Paper>

      {/* Timer Countdown Display - Positioned above layout */}
      {timerStatus && (
        <Box sx={{
          p: { xs: '10px', sm: '15px', md: '20px' },
          pt: 3,
          pb: 3
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
          />
        </Box>
      )}

      {/* Dynamic Grid Layout - Tight, fills all space */}
      <Grid container spacing={{ xs: 1, sm: 1.5, md: 2, lg: 2 }} sx={{
        p: { xs: '4px', sm: '6px', md: '6px', lg: '6px' },
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        overflowY: 'auto',
        m: 0,
        // Tighter grid - no minimum heights, just content-based
        '& > .MuiGrid-item': {
          display: 'flex',
          flexDirection: 'column'
        }
      }}>
        {/* ROW 1: Equalizer, Master Controls, Patterns */}
        {/* Patterns - SAME HEIGHT, Internal Scroll */}
        {!closedSections.includes('patternID') && (
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }} sx={{
              display: 'flex',
              maxHeight: { xs: '400px', sm: '380px', md: '550px', lg: '775px' },
              minHeight: { xs: '400px', sm: '380px', md: '550px', lg: '650px' }
            }}>
              <CollapsibleSection id="patternID" title="Patterns" icon="🌀" defaultOpen={true} onClose={handleSectionClose}>
                <PatternSelectorMUI
                    patterns={WAVE_PATTERNS}
                    selected={appState.currentPattern?.id || null}
                    mode={appState.mode}
                    onSelect={handlePatternSelectBound}
                    onModeChange={handleModeChangeBound}
                    activePattern={appState.currentPattern?.id || null}
                />
              </CollapsibleSection>
            </Grid>
        )}
        {/* Frequency Visualizer - SAME HEIGHT */}
        {!closedSections.includes('frequencyVisualizer') && (
            <Grid item size={{ xs: 12, sm: 12, md: 8, lg: 6, xl: 6 }} sx={{
              display: 'flex',
              overflowY: 'auto',
              maxHeight: { xs: '500px', sm: '450px', md: 'fit-content', lg: 'fit-content' }
            }}>
              <CollapsibleSection id="frequencyVisualizer" title="Frequency Visualizer" icon="📊" defaultOpen={true} onClose={handleSectionClose}>
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
            </Grid>
        )}

        {/* Binaural Beat Generator - SAME HEIGHT, Internal Scroll */}
        {!closedSections.includes('binauralBeats') && (
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }} sx={{
              display: 'flex',
              maxHeight: { xs: '500px', sm: '450px', md: 'fit-content', lg: 'fit-content' }
            }}>
              <CollapsibleSection id="binauralBeats" title="Binaural Beat Generator" icon="🎧" defaultOpen={true} onClose={handleSectionClose}>
                <Box sx={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
                  <BinauralGeneratorMUI
                      base_frequency={audioConfig.baseFreq}
                      beat_frequency={audioConfig.beatFreq}
                      waveform={activeAudioEngine?.audioState?.waveform || 'sine'}
                      isPlaying={hybridEngine.audioState.isPlaying}
                      volume={audioConfig.volume}
                      appState={appState}
                      onFrequencyChange={(base_frequency, beat_frequency) => {
                        console.log('🎛️ Parent received frequency change - base_frequency:', base_frequency, 'beat_frequency:', beat_frequency);

                        // Handle both backend and frontend engines
                        if (activeAudioEngine.updateSettings) {
                          // Backend engine - use new pattern
                          activeAudioEngine.updateSettings({
                            base_frequency: base_frequency,
                            beat_frequency: beat_frequency
                          });
                        } else if (activeAudioEngine.updateFrequency) {
                          // Frontend engine - convert to old pattern
                          const leftFreq = base_frequency; // left = base
                          const rightFreq = base_frequency + beat_frequency; // right = base + beat
                          console.log('🎛️ Converting to frontend format - left:', leftFreq, 'right:', rightFreq);
                          activeAudioEngine.updateFrequency(leftFreq, rightFreq);
                        }
                      }}
                      onWaveformChange={(waveform) => {
                        console.log('🎵 Waveform changed to:', waveform);
                        if (activeAudioEngine.updateWaveform) {
                          activeAudioEngine.updateWaveform(waveform);
                        }
                      }}
                      onVolumeChange={(volume) => {
                        console.log('🎚️ Volume change received in parent:', volume);
                        hybridEngine.updateVolume(volume);
                      }}
                      onPlay={() => {
                        console.log('▶️ Play button clicked - starting audio with hybridEngine');
                        const config = {
                          base_frequency: audioConfig.baseFreq,
                          beat_frequency: audioConfig.beatFreq,
                          volume: audioConfig.volume,
                          waveform: (activeAudioEngine?.audioState?.waveform || 'sine') as 'sine' | 'square' | 'triangle' | 'sawtooth'
                        };
                        hybridEngine.startBinauralBeat(config);
                      }}
                      onStop={() => {
                        console.log('⏹️ Stop button clicked - stopping audio with hybridEngine');
                        hybridEngine.stopBinauralBeat();
                      }}
                      currentPreset={currentPreset}
                  />

                </Box>
              </CollapsibleSection>
            </Grid>
        )}
        {/* Timer & Sessions - Wider for better usability */}
        {!closedSections.includes('timerPanel') && (
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }} sx={{
              display: 'flex',
              maxHeight: { xs: '500px', sm: '450px', md: '550px', lg: '550px' }
            }}>
              <CollapsibleSection id="timerPanel" title="Timer & Sessions" icon="⏰" defaultOpen={true} onClose={handleSectionClose}>
                <Box sx={{ height: 'fit-content', minHeight: '100%', maxHeight: '500px', overflowY: 'auto', width: '500px', overflowX: 'hidden' }}>
                  <TimerTab
                      appState={appState}
                      audioEngine={hybridEngine}
                      patterns8D={appState.patterns8D} // ✅ FIXED: Use converted Pattern8D[] from appState
                      patterns8DEngine={{
                        setActivePattern: (pattern) => {
                          console.log('🎨 Setting active pattern for visualizer:', pattern.name);
                          updateAppState({ currentPattern: pattern });
                        },
                        clearActivePattern: () => {
                          console.log('🎨 Clearing active pattern from visualizer');
                          updateAppState({ currentPattern: null });
                        }
                      }}
                      onStateChange={updateAppState}
                      onTimerStatusUpdate={setTimerStatus}
                      onTransitionNavigation={timerNavigationRef.current}
                      onTimerControl={timerControlRef.current}
                  />
                </Box>
              </CollapsibleSection>
            </Grid>
        )}
        {/* Equalizer - SAME HEIGHT */}
        {!closedSections.includes('equalizer') && (
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }} sx={{ 
            display: 'flex',
            flex: '1 1 2',

          }}>
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
 </Grid>
 )}

        {/* Master Controls - SAME HEIGHT */}
        {!closedSections.includes('masterControls') && (
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }} sx={{
            display: 'flex',
            maxHeight: { xs: '400px', sm: '380px', md: '350px', lg: '350px' }
          }}>
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
                  // 🔥 FIXED: Use memoized audioConfig
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
 </Grid>
 )}

        {/* ROW 2: Binaural Beat Generator, Timer Sessions, Spatial Visualizer */}


        {/* Spatial Visualizer - Same width as Frequency Visualizer */}
        {!closedSections.includes('visualizeID') && (
          <Grid item size={{ xs: 12, sm: 12, md: 8, lg: 6, xl: 6 }} sx={{
            display: 'flex',
            minWidth: { xs: '25%', sm: '25%', md: '25%', lg: '25%' },
            maxHeight: { xs: '500px', sm: '500px', md: '450px', lg: '550px' }
          }}>
            <CollapsibleSection
              id="visualizeID"
              title="Visualization"
              icon="🎨"
              defaultOpen={false}
              onClose={handleSectionClose}
              onFullscreen={(id) => {
                console.log('📺 Fullscreen requested for:', id);
                // TODO: Implement fullscreen logic
              }}
            >
              <Box sx={{ position: 'relative', height: '100%' }}>
                <Paper elevation={3} sx={ElectromagneticLabStyles.visualizationPaper}>
                  <SpatialVisualizer
                    pattern={
                      // 🔥 FIXED: Find matching Pattern8D from pre-generated patterns8D array
                      appState.currentPattern
                        ? appState.patterns8D.find(p => p.id === appState.currentPattern?.id) || appState.patterns8D[0]
                        : appState.patterns8D[0] // Default to first pattern
                    }
                    electromagnetic={appState.electromagnetic}
                    size={300}
                    audioContext={activeAudioEngine.audioContext}
                    analyserNode={activeAudioEngine.analyserNode}
                    isPlaying={hybridEngine.audioState.isPlaying}
                  />
                </Paper>
              </Box>
            </CollapsibleSection>
 </Grid>
 )}




 </Grid>

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