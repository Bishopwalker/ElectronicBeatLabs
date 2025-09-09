// Electromagnetic Beat Lab - Main Component (Refactored & Modular)
// Advanced binaural beats generator with electromagnetic field visualization
// Now properly separated into modular components under 500 lines

import React, { useCallback, useEffect, useState } from 'react';
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
import QuickStart from './QuickStart';
import TimerTab from './tabs/TimerTab';
import TimerCountdownDisplay from './TimerCountdownDisplay';
import { FrequencyVisualizer } from './FrequencyVisualizer';

// Extracted Components
import CollapsibleSection from './shared/CollapsibleSection';
import TabContentRenderer from './shared/TabContentRenderer';
import SystemStatusChips from './shared/SystemStatusChips';

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
  
  // Smart audio engine selector - use backend if connected, fallback to frontend
  const activeAudioEngine = backendEngine.backendConnected ? backendEngine : frontendEngine;

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

  // Auto-connect to backend on startup
  useEffect(() => {
    console.log('🔧 Audio engine selected:', backendEngine.backendConnected ? 'Backend' : 'Frontend');
    backendEngine.connectBackend().then(()=>console.log("on"));
    if (!backendEngine.backendConnected && backendEngine.connectBackend) {
      console.log('🔌 Auto-connecting to backend on startup...');
      backendEngine.connectBackend().catch((error) => {
        console.log('⚠️ Backend auto-connect failed (this is expected if backend is not running):', error.message);
      });
    }
  }, []);


  // Bound handler functions with context
  const handlePatternSelectBound = useCallback((patternId: string) => {
    const patternsInterface = {
      setActivePattern: (pattern: { name: never; }) => {
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
          </Box>

          <Box sx={ElectromagneticLabStyles.tabContent}>
            <TabContentRenderer
              appState={appState}
              audioEngine={audioEngine}
              backendEngine={backendEngine}
              patterns8D={patterns8D}
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
          <Typography variant="h4" sx={ElectromagneticLabStyles.mainTitle}>
            Bishop's Electromagnetic Beat Lab
          </Typography>
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
              audioEngine={frontendEngine}
              backendEngine={backendEngine}
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
                frequencies={{
                  left: activeAudioEngine.audioState.leftFreq,
                  right: activeAudioEngine.audioState.rightFreq,
                  beat: activeAudioEngine.audioState.beatFreq
                }}
                volume={activeAudioEngine.audioState.volume}
                audioEngine={activeAudioEngine}
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
                  leftFreq={activeAudioEngine.audioState.leftFreq || 440}
                  rightFreq={activeAudioEngine.audioState.rightFreq || 444}
                  onFrequencyChange={(left, right) => {
                    console.log('🎛️ Parent received frequency change:', left, right);
                    activeAudioEngine.updateFrequency(left, right);
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