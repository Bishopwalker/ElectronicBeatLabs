// Electromagnetic Beat Lab - Main Component (Refactored & Modular)
// Advanced binaural beats generator with electromagnetic field visualization
// Now properly separated into modular components under 500 lines

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Box, Chip, IconButton, Paper, Typography } from '@mui/material';
import type { ElectromagneticBeatLabProps } from '../../types';

// Constants
import { DEFAULT_BASE_FREQUENCY, DEFAULT_BEAT_FREQUENCY, DEFAULT_VOLUME } from '../../constants/audio.constants';

// Centralized Audio Controls
import { startBinauralAudio, stopBinauralAudio } from '../../utils/audioControls';

// Hooks and Data
import { useHybridAudioEngine } from '../../hooks';
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
import DraggableFrequencyVisualizer from '../DraggableFrequencyVisualizer';
import { formatTime } from '../../helpers/timer/timerUtils';
import type {  TimerStatus} from '../../data/timer';

// Extracted Components
import CollapsibleSection from '../shared/CollapsibleSection';
import TabContentRenderer from '../shared/TabContentRenderer';
import SystemStatusChips from '../shared/SystemStatusChips';
import TimerCountdownDisplay from '../TimerCountdownDisplay';
import EqualizerMUI from '../EqualizerMUI';

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

  // Timer control callback ref for stopping timer
  const timerControlRef = useRef<{
    stopTimer: () => void;
  }>({
    stopTimer: () => console.warn('Timer control not initialized')
  });

  // Current preset tracking
  const { currentPreset } = useCurrentPresetTracker({
    timerStatus,
    activePattern: appState.currentPattern?.id,
    audioState: backendEngine.audioState
  });

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
          base: activeAudioEngine.audioState.config.base_frequency,
          beat: activeAudioEngine.audioState.config.beat_frequency
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
          frequency: frequencies.beat
        },
        base_frequency: frequencies.base,
        beat_frequency: frequencies.beat
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

  // Auto-enable spatial audio ONCE when backend connects
  const hasAutoEnabledRef = useRef(false);
  useEffect(() => {
    // Only run this once when backend first connects
    if (backendEngine.backendConnected && backendEngine.sessionId && !hasAutoEnabledRef.current) {
      console.log('✅ Backend connected! Auto-enabling required audio systems...');
      hasAutoEnabledRef.current = true;

      // Auto-enable spatial audio when backend connects
      if (!appState.spatialAudio?.enabled) {
        console.log('🎧 Auto-enabling spatial audio for backend connection...');
        updateAppState({
          spatialAudio: {
            ...appState.spatialAudio,
            enabled: true
          }
        });
      }

      console.log('🎯 All required audio systems enabled for backend operation');
    }

    // Reset the flag when backend disconnects
    if (!backendEngine.backendConnected) {
      hasAutoEnabledRef.current = false;
    }
  }, [backendEngine.backendConnected, backendEngine.sessionId, updateAppState]);

  // Simple one-time backend connection attempt on startup
  useEffect(() => {
    if (!backendEngine.backendConnected && backendEngine.connectBackend) {
      console.log('🔌 One-time backend connection attempt on startup...');
      backendEngine.connectBackend().catch((error) => {
        console.log('⚠️ Backend connection failed (expected if backend not running):', error.message);
      });
    }
  }, []); // Empty dependency array - only run once on mount

  // Bound handler functions with context
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
    handlePatternSelect(patternId, activeAudioEngine, patternsInterface);
  }, [handlePatternSelect, activeAudioEngine, updateAppState]);

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
    // Use centralized audio control utility
    const success = await startBinauralAudio(hybridEngine, {
      base_frequency: appState.base_frequency,
      beat_frequency: appState.beat_frequency,
      amplitude: appState.volume,
      waveform: 'sine'
    });

    // Update app state if successful
    if (success) {
      updateAppState({ isPlaying: true });
    }
  }, [hybridEngine, appState.base_frequency, appState.beat_frequency, appState.volume, updateAppState]);

  const handleStop = useCallback(async () => {
    // Use centralized audio control utility with timer control
    const success = await stopBinauralAudio(
      hybridEngine,
      timerStatus?.session?.is_active ? timerControlRef.current : undefined
    );

    // Update app state if successful
    if (success) {
      updateAppState({ isPlaying: false });
    }
  }, [hybridEngine, updateAppState, timerStatus]);

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
            await frontendEngine.startBinauralBeat({
              base_frequency: appState.frequency || DEFAULT_BASE_FREQUENCY,
              beat_frequency: appState.beat_frequency || DEFAULT_BEAT_FREQUENCY,
              amplitude: appState.volume || DEFAULT_VOLUME,
              waveform: 'sine'
            });
            // Update app state to mark as playing but DON'T set currentPattern
            updateAppState({
              isPlaying: true
            });
          } else {
            console.log('⏹️ Stopping frontend binaural engine...');
           frontendEngine.stopBinauralBeat();
            // Update app state
            updateAppState({
              isPlaying: false
            });
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
              const defaultConfig = {
                base_frequency: appState.base_frequency || DEFAULT_BASE_FREQUENCY,
                beat_frequency: appState.beat_frequency || DEFAULT_BEAT_FREQUENCY,
                amplitude: appState.volume || DEFAULT_VOLUME,
                waveform: 'sine' as const,
                spatial_enabled: appState.spatialAudio?.enabled || false,
                frequency: appState?.frequency  || null
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
  }, [frontendEngine, backendEngine, appState, updateAppState]);

  // Get section data for restore functionality
  const getSectionData = (id: string) => {
    return SECTION_DATA[id as keyof typeof SECTION_DATA] || { title: 'Unknown', icon: '❓' };
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
              patterns8D={WAVE_PATTERNS}
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
              }}>
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

       
200
        {/* Compact Status Overview - Show when Master Controls is closed */}
        {closedSections.includes('masterControls') && (
          <Box sx={ElectromagneticLabStyles.compactStatusOverview}>
            <MainControlsMUI
              isPlaying={appState.isPlaying}
              volume={appState.volume}
              onPlay={handlePlayBound}
              onStop={handleStop}
              onVolumeChange={handleVolumeChangeBound}
              compact={true}
            />

            <SystemStatusChips
              appState={appState}
              audioEngine={activeAudioEngine}
              patterns8D={WAVE_PATTERNS}
              onStateChange={updateAppState}
              onToggleEngine={handleEngineToggle}
            />
          </Box>
        )}
      </Paper>

      {/* Timer Countdown Display - Positioned above layout */}
      {timerStatus && (
        <Box sx={{
          p: { xs: '5px', sm: '8px', md: '10px' },
          pt: 0
        }}>
          <TimerCountdownDisplay
            timerStatus={timerStatus}
            isVisible={true}
            appState={appState}
            onJumpToTransition={timerNavigationRef.current.jumpToTransition}
            onRestartTransition={timerNavigationRef.current.restartCurrentTransition}
            audioContext={activeAudioEngine.audioContext}
            analyserNode={activeAudioEngine.analyserNode}
          />
        </Box>
      )}

      {/* Dynamic Flex Layout */}
      <Box sx={ElectromagneticLabStyles.mainLayoutContainer(closedSections)}>
        {/* Equalizer - Placed FIRST for visibility */}
        {!closedSections.includes('equalizer') && (
           <Box sx={ElectromagneticLabStyles.equalizerPanelFlexHorizontal}>
            <CollapsibleSection id="equalizer" title="Equalizer" icon="🎚️" defaultOpen={true} onClose={handleSectionClose}>
              <EqualizerMUI
                audioContext={activeAudioEngine.audioContext || null}
                analyserNode={activeAudioEngine.analyserNode || null}
                isPlaying={appState.isPlaying}
                onEqualizerChange={(inputNode, outputNode) => {
                  if (activeAudioEngine.setEqualizerNodes) {
                    activeAudioEngine.setEqualizerNodes(inputNode, outputNode);
                  }
                }}
              />
            </CollapsibleSection>
          </Box>
        )}

        {/* Master Controls */}
        {!closedSections.includes('masterControls') && (
          <Box sx={ElectromagneticLabStyles.panelFlex}>
            <CollapsibleSection id="masterControls" title="Master Controls" icon="🎛️" defaultOpen={true} onClose={handleSectionClose}>
              <QuickStart
                activeStatus={{
                  binauralEngine: frontendEngine.audioState.isPlaying,
                  backendEngine: backendEngine.audioState.isPlaying,
                  spatialAudio: backendEngine.backendConnected,
                  patterns: !!appState.currentPattern,
                  testTones: false
                }}
                frequencies={(() => {
                  // Handle both backend (config) and frontend (direct) formats
                  if (activeAudioEngine.audioState.config) {
                    // Backend engine with config
                    const base_frequency = activeAudioEngine.audioState.config.base_frequency;
                    const beat_frequency = activeAudioEngine.audioState.config.beat_frequency;
                    return {
                      left:(base_frequency),
                      right:(base_frequency + beat_frequency),
                      beat: beat_frequency
                    };
                  } else {
                    // Frontend engine with direct values
                    return {
                      left: activeAudioEngine.audioState.leftFreq || DEFAULT_BASE_FREQUENCY,
                      right: activeAudioEngine.audioState.rightFreq || (DEFAULT_BASE_FREQUENCY + DEFAULT_BEAT_FREQUENCY),
                      beat: activeAudioEngine.audioState.beat_frequency || DEFAULT_BEAT_FREQUENCY
                    };
                  }
                })()}
                volume={appState.volume}
                audioEngine={backendEngine}
                onToggleEngine={handleEngineToggle}
                appState={appState}
              />
            </CollapsibleSection>
          </Box>
        )}

        {/* Patterns */}
        {!closedSections.includes('patternID') && (
          <Box sx={ElectromagneticLabStyles.panelFlex}>
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
          </Box>
        )}

        {/* Binaural Beat Generator */}
        {!closedSections.includes('binauralBeats') && (
          <Box sx={ElectromagneticLabStyles.widePanelFlex}>
            <CollapsibleSection id="binauralBeats" title="Binaural Beat Generator" icon="🎧" defaultOpen={true} onClose={handleSectionClose}>
              <Box sx={{ height: 'auto', overflow: 'visible' }}>
                <BinauralGeneratorMUI
                  base_frequency={
                    activeAudioEngine.audioState.config?.base_frequency ||
                    activeAudioEngine.audioState.leftFreq ||
                    DEFAULT_BASE_FREQUENCY
                  }
                  beat_frequency={
                    activeAudioEngine.audioState.config?.beat_frequency ||
                    activeAudioEngine.audioState.beat_frequency ||
                    DEFAULT_BEAT_FREQUENCY
                  }
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
                  currentPreset={currentPreset}
                />
                <Box sx={{ mt: 1, maxHeight: '250px', overflowY: 'auto' }}>
                  <MainControlsMUI
                    isPlaying={appState.isPlaying}
                    volume={appState.volume}
                    onPlay={handlePlayBound}
                    onStop={handleStop}
                    onVolumeChange={handleVolumeChangeBound}
                  />
                </Box>
              </Box>
            </CollapsibleSection>
          </Box>
        )}

        {/* Visualization */}
        {!closedSections.includes('visualizeID') && (
          <Box sx={ElectromagneticLabStyles.widePanelFlex}>
            <CollapsibleSection id="visualizeID" title="Visualization" icon="🎨" defaultOpen={true} onClose={handleSectionClose}>
              <Box sx={{ position: 'relative', height: '100%', minHeight: '250px' }}>
                <Paper elevation={3} sx={ElectromagneticLabStyles.visualizationPaper}>
                  {appState.currentPattern && (
                    <SpatialVisualizer
                      pattern={appState.currentPattern}
                      electromagnetic={appState.electromagnetic}
                      size={300}
                    />
                  )}
                </Paper>
              </Box>
            </CollapsibleSection>
          </Box>
        )}

        {/* Timer & Sessions */}
        {!closedSections.includes('timerPanel') && (
          <Box sx={ElectromagneticLabStyles.widePanelFlex}>
            <CollapsibleSection id="timerPanel" title="Timer & Sessions" icon="⏰" defaultOpen={true} onClose={handleSectionClose}>
              <Box sx={{ height: 'auto', minHeight: '300px', maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }}>
                <TimerTab
                  appState={appState}
                  audioEngine={hybridEngine}
                  patterns8D={WAVE_PATTERNS}
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