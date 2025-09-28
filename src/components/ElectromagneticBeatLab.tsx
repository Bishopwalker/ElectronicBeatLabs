// Electromagnetic Beat Lab - Main Component (Refactored & Modular)
// Advanced binaural beats generator with electromagnetic field visualization
// Now properly separated into modular components under 500 lines

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Box, Chip, IconButton, Paper, Typography } from '@mui/material';
import type { ElectromagneticBeatLabProps } from '../types';

// Hooks and Data
import { useBackendAudioEngine } from '../hooks/useBackendAudioEngine';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useElectromagneticLabState } from '../hooks/useElectromagneticLabState';
import { useCurrentPresetTracker } from '../hooks/useCurrentPresetTracker';
import { WAVE_PATTERNS } from '../data/patterns';
// Configuration and Styles
import { TAB_CONFIG, SECTION_DATA } from './config/ElectromagneticLabConfig';
import { ElectromagneticLabStyles } from './styles/ElectromagneticLabStyles';

// Components
import StarField from './StarField';
import SpatialVisualizer from './SpatialVisualizer';
import PatternSelectorMUI from './PatternSelectorMUI';
import ElectromagneticStatus from './ElectromagneticStatus';
import MainControlsMUI from './MainControlsMUI';
import ControlTabs from './ControlTabs';
import BinauralGeneratorMUI from './BinauralGeneratorMUI';
import { calculateLeftFreq, calculateRightFreq } from '../types';
import QuickStart from './QuickStart';
import TimerTab from './tabs/TimerTab';
import { FrequencyVisualizer } from './FrequencyVisualizer';
import { formatTime } from '../helpers/timer/timerUtils';

// Extracted Components
import CollapsibleSection from './shared/CollapsibleSection';
import TabContentRenderer from './shared/TabContentRenderer';
import SystemStatusChips from './shared/SystemStatusChips';
import TimerCountdownDisplay from "./TimerCountdownDisplay.tsx";

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
  } = useElectromagneticLabState(initialPattern, autoStart);

  // Hybrid audio engines: Backend for advanced features, Frontend for fallback
  const backendEngine = useBackendAudioEngine();
  const frontendEngine = useAudioEngine();
  const [sessionId, setSessionId] = useState<string | null>(
    backendEngine.sessionId
  );

  // Smart audio engine selector - use backend if connected, fallback to frontend
  const activeAudioEngine = sessionId ? backendEngine : frontendEngine;

  // Timer status for preset tracking
  const [timerStatus, setTimerStatus] = useState<any>(null);

  // Current preset tracking
  const { currentPreset } = useCurrentPresetTracker({
    timerStatus,
    activePattern: appState.currentPattern?.id,
    audioState: backendEngine.audioState
  });

  // Handle electromagnetic state updates
  useEffect(() => {
    updateElectromagneticState(activeAudioEngine);
  }, [activeAudioEngine, updateElectromagneticState]);

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
  }, [backendEngine.backendConnected, backendEngine.sessionId, appState.spatialAudio?.enabled, updateAppState]);

  // Simple one-time backend connection attempt on startup
  useEffect(() => {
    if (!backendEngine.backendConnected && backendEngine.connectBackend) {
      console.log('🔌 One-time backend connection attempt on startup...');
      backendEngine.connectBackend().catch((error) => {
        console.log('⚠️ Backend connection failed (expected if backend not running):', error.message);
      });
    }
  }, []); // Empty dependency array - only run once on mount

  // Update sessionId when backend state changes
  useEffect(() => {
    setSessionId(backendEngine.sessionId);
  }, [backendEngine.sessionId, backendEngine.backendConnected]);


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

  const handlePlayBound = useCallback(() => {
    // Use the active audio engine (backend if connected, otherwise frontend fallback)
    handlePlay(activeAudioEngine, backendEngine, activeAudioEngine);
  }, [handlePlay, activeAudioEngine, backendEngine]);

  const handleStop = useCallback(async () => {
    console.log('🛑 Master Stop: Stopping all audio engines');
    try {
      // Always try to stop both engines regardless of state
      console.log('🛑 Stopping backend engine...');
      await backendEngine.stopBackendSession();
      
      console.log('🛑 Stopping frontend engine...');
      await frontendEngine.stopBinauralBeat();
      
      // Also clear any patterns
      updateAppState({ 
        isPlaying: false,
        currentPattern: null
      });
      
      console.log('✅ Master Stop: All engines stopped successfully');
    } catch (error) {
      console.error('❌ Error during master stop:', error);
    }
  }, [backendEngine, frontendEngine, updateAppState]);

  const handleToggleAdvancedControls = useCallback(() => {
    toggleAdvancedControls(backendEngine);
  }, [toggleAdvancedControls, backendEngine]);

  // Handle engine toggle changes
  const handleEngineToggle = useCallback(async (engineType: 'binaural' | 'backend' | 'spatial', enabled: boolean) => {
    console.log(`🔄 Engine Toggle: ${engineType} -> ${enabled}`);

    try {
      switch (engineType) {
        case 'binaural':
          // FRONTEND ENGINE - explicit fallback only
          if (enabled) {
            console.log('▶️ Starting frontend binaural engine (explicit fallback)...');
            await frontendEngine.startBinauralBeat({
              leftFreq: appState.frequency || 144,
              rightFreq: (appState.frequency || 144) + 4,
              amplitude: appState.volume || 0.3,
              waveform: 'sine'
            });
          } else {
            console.log('⏹️ Stopping frontend binaural engine...');
            await frontendEngine.stopBinauralBeat();
          }
          break;

        case 'backend':
          // BACKEND ENGINE - this is the main binaural engine
          if (enabled) {
            // Connect to backend and start session
            if (!backendEngine.backendConnected && backendEngine.connectBackend) {
              console.log('🔌 Connecting to backend (main binaural engine)...');
              await backendEngine.connectBackend();

              // Auto-start backend session with default binaural config
              console.log('🎧 Starting backend binaural session...');
              const defaultConfig = {
                baseFrequency: appState.frequency || 144,
                beatFrequency: 4,
                amplitude: appState.volume || 0.3,
                waveform: 'sine' as const,
                spatial_enabled: appState.spatialAudio?.enabled || false
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

            {/* Timer Status Display - Under tabs, same level as title */}
            {timerStatus && timerStatus.session && timerStatus.current_transition && (
              <Box sx={{
                mt: 1,
                mb: 1,
                bgcolor: 'rgba(0,0,0,0.3)',
                border: '1px solid #ff6b00',
                borderRadius: 1,
                p: 1.5,
                maxWidth: '600px'
              }}>
                <Typography variant="subtitle2" gutterBottom sx={{color: '#00ff88', fontSize: '0.9rem'}}>
                  🎧 ACTIVE: {timerStatus.current_transition.description}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom sx={{ fontSize: '0.8rem' }}>
                  <Box component="span" sx={{color: '#ff6b00', fontWeight: 'bold'}}>
                    {timerStatus.current_transition.frequency_hz}Hz
                  </Box> •
                  {timerStatus.current_transition.frequency_type} waves •
                  <Box component="span" sx={{color: '#00bfff'}}>
                    {timerStatus.current_transition.left_ear_hz}Hz L
                    / {timerStatus.current_transition.right_ear_hz}Hz R
                  </Box>
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                    Current: {formatTime(timerStatus.time_remaining_current)}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                    Total: {formatTime(timerStatus.time_remaining_total)}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          <Box sx={ElectromagneticLabStyles.tabContent}>
            <TabContentRenderer
              appState={appState}
              audioEngine={activeAudioEngine}
              backendEngine={backendEngine}
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
            <Typography
              variant={timerStatus?.session?.is_active ? "h5" : "h4"}
              sx={{
                ...ElectromagneticLabStyles.mainTitle,
                fontSize: timerStatus?.session?.is_active ? '1.5rem' : '2rem'
              }}
            >
              Bishop's Electromagnetic Beat Lab
            </Typography>
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
              isPlaying={appState.isPlaying}
              volume={appState.volume}
              onPlay={handlePlayBound}
              onStop={handleStop}
              onVolumeChange={handleVolumeChangeBound}
              compact={true}
            />
            
            <SystemStatusChips
              appState={appState}
              audioEngine={backendEngine}
              patterns8D={WAVE_PATTERNS}
              onStateChange={updateAppState}
              onToggleEngine={handleEngineToggle}
            />
          </Box>
        )}
      </Paper>

      {/* Timer Countdown Display - Always visible when timer is active */}
      <TimerCountdownDisplay 
        timerStatus={timerStatus}
        isVisible={true}
      />

      {/* Dynamic Flex Layout */}
      <Box sx={ElectromagneticLabStyles.mainLayoutContainer(closedSections)}>
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
                    const baseFreq = activeAudioEngine.audioState.config.baseFrequency || 144;
                    const beatFreq = activeAudioEngine.audioState.config.beatFrequency || 4;
                    return {
                      left: calculateLeftFreq(baseFreq),
                      right: calculateRightFreq(baseFreq, beatFreq),
                      beat: beatFreq
                    };
                  } else {
                    // Frontend engine with direct values
                    return {
                      left: activeAudioEngine.audioState.leftFreq || 144,
                      right: activeAudioEngine.audioState.rightFreq || 148,
                      beat: activeAudioEngine.audioState.beatFreq || 4
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
                  baseFrequency={
                    activeAudioEngine.audioState.config?.baseFrequency ||
                    activeAudioEngine.audioState.leftFreq ||
                    144
                  }
                  beatFrequency={
                    activeAudioEngine.audioState.config?.beatFrequency ||
                    activeAudioEngine.audioState.beatFreq ||
                    4
                  }
                  onFrequencyChange={(baseFreq, beatFreq) => {
                    console.log('🎛️ Parent received frequency change - baseFreq:', baseFreq, 'beatFreq:', beatFreq);

                    // Handle both backend and frontend engines
                    if (activeAudioEngine.updateSettings) {
                      // Backend engine - use new pattern
                      activeAudioEngine.updateSettings({
                        baseFrequency: baseFreq,
                        beatFrequency: beatFreq
                      });
                    } else if (activeAudioEngine.updateFrequency) {
                      // Frontend engine - convert to old pattern
                      const leftFreq = baseFreq; // left = base
                      const rightFreq = baseFreq + beatFreq; // right = base + beat
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
                  
                  {/* Real-time Frequency Analyzer */}
                  {appState.isPlaying && (
                    <Box sx={{ mt: 2 }}>
                      <FrequencyVisualizer
                        getVisualizationData={activeAudioEngine.getVisualizationData || null}
                        title="Real-time Frequency Analysis"
                        height={200}
                        width={600}
                      />
                    </Box>
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
              <Box sx={{ maxHeight: '500px', minHeight: '300px', overflowY: 'auto' }}>
                <TimerTab
                  appState={appState}
                  audioEngine={backendEngine.backendConnected ? backendEngine : frontendEngine}
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