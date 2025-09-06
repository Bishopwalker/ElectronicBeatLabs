// Electromagnetic Beat Lab - Main Component
// Advanced binaural beats generator with electromagnetic field visualization

import React, {useCallback, useEffect, useState, useMemo, useRef} from 'react';
import {Box, Card, CardContent, Chip, Collapse, IconButton, Paper, Typography} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import type {AppState, ElectromagneticBeatLabProps, PatternMode} from '../types';

import {useMasterAudioControl} from '../hooks/useMasterAudioControl';
import {PATTERN_PRESETS, WAVE_PATTERNS} from '../data/patterns';

import StarField from './StarField';
import SpatialVisualizer from './SpatialVisualizer';
import PatternSelectorMUI from './PatternSelectorMUI';
import ElectromagneticStatus from './ElectromagneticStatus';
import MainControlsMUI from './MainControlsMUI';
import ControlTabs from './ControlTabs';
 import BinauralGeneratorMUI from "./BinauralGeneratorMUI.tsx";
// Tab Components
import FrequencyTab from './tabs/FrequencyTab';
import PatternTab from './tabs/PatternTab';
import TimerTab from './tabs/TimerTab';
import VisualizationTab from './tabs/VisualizationTab';
import ADHDTab from './tabs/ADHDTab';
import YouTubeTab from './tabs/YouTubeTab';
import SettingsTab from './tabs/SettingsTab';
import GuideTab from './tabs/GuideTab';
import MasterStopControl from "./MasterStopControl.tsx";


// Collapsible Section Component with close/restore functionality
interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onClose?: (id: string) => void;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  id,
  title, 
  icon, 
  children, 
  defaultOpen = false,
  onClose 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const handleSectionClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose) onClose(id);
  };
  
  return (
    <Card elevation={2} sx={{ mb: '10px', bgcolor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)' }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 1,
          cursor: 'pointer',
          borderBottom: isOpen ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon} {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={handleSectionClose} sx={{ color: '#ff4444' }}>
            ✕
          </IconButton>
          <IconButton size="small">
            {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>
      <Collapse in={isOpen}>
        <CardContent sx={{ p: '10px !important' }}>
          {children}
        </CardContent>
      </Collapse>
    </Card>
  );
};

const ElectromagneticBeatLab: React.FC<ElectromagneticBeatLabProps> = ({
  initialPattern,
  autoStart = false
                                                                       }) => {
  // State management
  const [closedSections, setClosedSections] = useState<string[]>([]);
  const [appState, setAppState] = useState<AppState>({
    mode: 'AUTO',
    currentPattern: null,
    frequency: 4.0,
    isPlaying: false,
    volume: 0.3,
    electromagnetic: {
      strength: 0,
      frequency: 0,
      phase: 0,
      coherence: 0,
      resonance: 0,
      state: 'INACTIVE',
      stability: 0
    },
    patterns8D: [],
    systemStatus: {
      electromagnetic: {
        strength: 0,
        frequency: 0,
        phase: 0,
        coherence: 0,
        resonance: 0,
        state: 'INACTIVE',
        stability: 0
      },
      audio: {
        latency: 0,
        sampleRate: 44100,
        bufferSize: 512,
        quality: 'HIGH'
      },
      performance: {
        fps: 60,
        cpuUsage: 0,
        memoryUsage: 0
      },
      state: ''
    },
    visualizations: {
      starField: {
        density: 100,
        speed: 1,
        color: '#ffffff',
        twinkle: true
      },
      spatial: {
        gridSize: 50,
        opacity: 0.3,
        color: '#00ff88',
        animation: true
      },
      frequency: {
        bars: 64,
        sensitivity: 1,
        color: '#ff6b00',
        glow: true
      }
    },
    spatialAudio: {
      enabled: true,
      hrtf: false,
      roomSize: 1,
      reverbAmount: 0.2,
      spatialWidth: 1,
      elevation: 0,
      azimuth: 0
    },
    youtube: {
      videoId: '',
      timestamp: 0,
      syncMode: 'audio',
      pythonScript: '',
      enabled: false
    },
    adhd: null,
    activeTab: 'patterns'
  });

  // Master audio control - consolidates all audio systems
  const masterAudio = useMasterAudioControl();
  
  // DUAL AUDIO ENGINE ARCHITECTURE:
  // - Frontend Engine (audioEngine): Web Audio API for instant binaural beats
  // - Backend Engine (backendEngine): Python DSP for 8D spatial audio & EM field integration
  // See README.md "Audio Engine Architecture" section for full details
  const audioEngine = useMemo(() => masterAudio.engines.audioEngine, [masterAudio.engines.audioEngine]);
  const backendEngine = useMemo(() => masterAudio.engines.backendEngine, [masterAudio.engines.backendEngine]);
  const patterns8D = useMemo(() => masterAudio.engines.patternsEngine, [masterAudio.engines.patternsEngine]);

  // Initialize with pattern (only on mount)
  useEffect(() => {
    if (initialPattern) {
      const pattern = WAVE_PATTERNS.find(p => p.id === initialPattern);
      if (pattern) {
        setAppState(prev => ({ ...prev, currentPattern: pattern }));
        if (autoStart) {
          audioEngine.loadPattern(pattern);
        }
      }
    } else {
      // Default to first pattern only if no pattern is set
      if (!appState.currentPattern) {
        const defaultPattern = WAVE_PATTERNS[0];
        setAppState(prev => ({ ...prev, currentPattern: defaultPattern }));
      }
    }
  }, []); // Only run on mount

  // Update electromagnetic state with refs to prevent infinite loops
  const lastElectromagneticRef = useRef(audioEngine.electromagnetic);
  const lastAudioStateRef = useRef(audioEngine.audioState);

  useEffect(() => {
    const currentElectromagnetic = audioEngine.electromagnetic;
    const currentAudioState = audioEngine.audioState;
    
    if (
      currentElectromagnetic !== lastElectromagneticRef.current ||
      currentAudioState !== lastAudioStateRef.current ||
      currentAudioState.isPlaying !== lastAudioStateRef.current?.isPlaying ||
      currentAudioState.volume !== lastAudioStateRef.current?.volume ||
      currentAudioState.beatFreq !== lastAudioStateRef.current?.beatFreq
    ) {
      lastElectromagneticRef.current = currentElectromagnetic;
      lastAudioStateRef.current = currentAudioState;
      
      setAppState(prev => ({
        ...prev,
        electromagnetic: currentElectromagnetic,
        isPlaying: currentAudioState.isPlaying,
        volume: currentAudioState.volume,
        frequency: currentAudioState.beatFreq
      }));
    }
  }, [audioEngine]);

  // Handle pattern selection
  const handlePatternSelect = useCallback((patternId: string) => {
    const pattern = WAVE_PATTERNS.find(p => p.id === patternId);
    if (pattern) {
      setAppState(prev => ({ 
        ...prev, 
        currentPattern: pattern,
        frequency: pattern.frequencies.beat
      }));
      audioEngine.loadPattern(pattern);
      
      // Update 8D pattern
      const pattern8D = patterns8D.getPatternById(pattern.type + '-visualization');
      if (pattern8D) {
        patterns8D.setActivePattern(pattern8D);
        patterns8D.startAnimation(pattern8D);
      }
    }
  }, [audioEngine, patterns8D]);

  // Handle mode change
  const handleModeChange = useCallback((mode: PatternMode) => {
    setAppState(prev => ({ ...prev, mode }));
    
    if (mode === 'OFF') {
      masterAudio.masterStop();
    }
  }, [masterAudio]);

  // Handle frequency change
  const handleFrequencyChange = useCallback((frequency: number) => {
    setAppState(prev => ({ ...prev, frequency }));
    
    if (appState.currentPattern) {
      const leftFreq = appState.currentPattern.frequencies.carrier;
      const rightFreq = leftFreq + frequency;
      audioEngine.updateFrequency(leftFreq, rightFreq);
    }
  }, [audioEngine, appState.currentPattern]);

  // Handle volume change
  const handleVolumeChange = useCallback((volume: number) => {
    setAppState(prev => ({ ...prev, volume }));
    audioEngine.updateVolume(volume);
  }, [audioEngine]);

  // Handle play/stop
  const handlePlay = useCallback(() => {
    if (appState.currentPattern && !appState.isPlaying) {
      audioEngine.loadPattern(appState.currentPattern);
      
      const pattern8D = patterns8D.getPatternById(appState.currentPattern.type + '-visualization');
      if (pattern8D) {
        patterns8D.startAnimation(pattern8D);
      }
    }
  }, [masterAudio, appState.currentPattern, appState.isPlaying]);

  const handleStop = useCallback(() => {
    masterAudio.masterStop();
  }, [masterAudio]);

  // Handle tab change
  const handleTabChange = useCallback((tabId: string) => {
    setAppState(prev => ({ ...prev, activeTab: tabId }));
  }, []);

  const handleSectionClose = useCallback((id: string) => {
    setClosedSections(prev => [...prev, id]);
  }, []);

  const handleSectionRestore = useCallback((id: string) => {
    setClosedSections(prev => prev.filter(sectionId => sectionId !== id));
  }, []);

  // Get section data for restore functionality
  const getSectionData = (id: string) => {
    const sections = {
      'patterns': { title: 'Patterns', icon: '🌀' },
      'waveguide': { title: 'Wave Guide', icon: '📡' },
      'adhd': { title: 'ADHD Protocol', icon: '⚡' },
      'freqID': { title: 'Frequency Display', icon: '📊' },
      'visualizeID': { title: 'Visualization', icon: '🎨' },
      'advanceControlsID': { title: 'Advanced Controls', icon: '⚙️' },
      'waveGuideID': { title: 'Wave Guide', icon: '📡' },
      'adhdID': { title: 'ADHD Protocol', icon: '⚡' },
      'patternID': { title: 'Patterns', icon: '🌀' }
    };
    // @ts-expect-error cause i'm not making n object just 4 this
    return sections[id] || { title: 'Unknown', icon: '❓' };
  };
  // Tab configuration
  const tabs = [
    { id: 'patterns', label: 'Patterns', icon: '🌀', component: PatternTab, enabled: true },
    { id: 'frequency', label: 'Frequency', icon: '📊', component: FrequencyTab, enabled: true },
    { id: 'timer', label: 'Timer', icon: '⏰', component: TimerTab, enabled: true },
    { id: 'visualization', label: 'Visual', icon: '🎨', component: VisualizationTab, enabled: true },
    { id: 'adhd', label: 'ADHD', icon: '⚡', component: ADHDTab, enabled: true },
    { id: 'youtube', label: 'YouTube', icon: '📺', component: YouTubeTab, enabled: true },
    { id: 'guide', label: 'Guide', icon: '📖', component: GuideTab, enabled: true },
    { id: 'settings', label: 'Settings', icon: '⚙️', component: SettingsTab, enabled: true }
  ];

  // Render active tab content
  const renderTabContent = () => {
    const activeTabConfig = tabs.find(tab => tab.id === appState.activeTab);
    if (!activeTabConfig) return null;
    
    const handleStateChange = (partialState: Partial<AppState>) => {
      setAppState(prevState => ({
        ...prevState,
        ...partialState
      }));
    };

    const commonProps = {
      appState,
      audioEngine,
      patterns8D: patterns8D.patterns,
      onStateChange: handleStateChange
    };
    
    // Special props for settings tab that needs backend engine for spatial audio
    const settingsProps = {
      appState,
      audioEngine: backendEngine, // Use backend engine for spatial audio
      patterns8D: patterns8D.patterns,
      onStateChange: handleStateChange
    };

    switch (appState.activeTab) {
      case 'patterns':
        return (
          <PatternTab
            {...commonProps}
            patterns={WAVE_PATTERNS}
            presets={PATTERN_PRESETS}
            onPatternSelect={handlePatternSelect}
          />
        );
      case 'frequency':
        return (
          <FrequencyTab
            {...commonProps}
            onFrequencyChange={handleFrequencyChange}
          />
        );
      case 'timer':
        return <TimerTab {...commonProps} />;
      case 'visualization':
        return <VisualizationTab {...commonProps} />;
      case 'adhd':
        return <ADHDTab {...commonProps} />;
      case 'youtube':
        return <YouTubeTab {...commonProps} />;
      case 'guide':
        return <GuideTab {...commonProps} />;
      case 'settings':
        return <SettingsTab {...settingsProps} />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Background Star Field */}
      <StarField {...appState.visualizations.starField} />

      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          p: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          backdropFilter: 'blur(10px)',
          bgcolor: 'rgba(0, 0, 0, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          minHeight: 40,
          flexShrink: 0
        }}
      >
        <Typography variant="h4"   sx={{fontWeight:700, m: 0 }}>
          Bishop's Electromagnetic Beat Lab
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center', fontSize: '0.75rem' }}>
          <ElectromagneticStatus 
            field={appState.electromagnetic}
            status={appState.systemStatus}
          />
        </Box>
      </Paper>

      {/* Dynamic Flex Layout - Components expand when others are minimized */}
      <Box sx={{ 
        flex: 1, 
        p: '10px', 
        display: 'flex', 
        gap: '10px', 
        height: 'calc(100vh - 60px)',
        flexWrap: 'wrap',
        minHeight: 0
      }}>
        {/* Master Controls */}
        {!closedSections.includes('masterControls') && (
          <Box sx={{ 
            flex: '1 1 350px',
            minWidth: '300px',
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CollapsibleSection id="masterControls" title="Master Controls" icon="🎛️" defaultOpen={true} onClose={handleSectionClose}>
              <MasterStopControl
                activeStatus={masterAudio.activeStatus}
                onMasterStop={masterAudio.masterStop}
                onMasterStart={masterAudio.quickStart}
                frequencies={masterAudio.frequencies}
                volume={masterAudio.volume}
                audioEngine={backendEngine}
              />
              <Box sx={{ mt: 1 }}>
                <MainControlsMUI
                  isPlaying={appState.isPlaying}
                  volume={appState.volume}
                  onPlay={handlePlay}
                  onStop={handleStop}
                  onVolumeChange={handleVolumeChange}
                />
              </Box>
            </CollapsibleSection>
          </Box>
        )}

        {/* Patterns */}
        {!closedSections.includes('patternID') && (
          <Box sx={{ 
            flex: '1 1 350px',
            minWidth: '300px',
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CollapsibleSection id="patternID" title="Patterns" icon="🌀" defaultOpen={true} onClose={handleSectionClose}>
              <PatternSelectorMUI
                patterns={WAVE_PATTERNS}
                selected={appState.currentPattern?.id || null}
                mode={appState.mode}
                onSelect={handlePatternSelect}
                onModeChange={handleModeChange}
              />
            </CollapsibleSection>
          </Box>
        )}

        {/* Binaural Beat Generator */}
        {!closedSections.includes('binauralBeats') && (
          <Box sx={{ 
            flex: '1 1 400px',
            minWidth: '350px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CollapsibleSection id="binauralBeats" title="Binaural Beat Generator" icon="🎧" defaultOpen={true} onClose={handleSectionClose}>
              <Box sx={{ height: 'auto', overflow: 'visible' }}>
                <BinauralGeneratorMUI
                  leftFreq={audioEngine.audioState.leftFreq || 440}
                  rightFreq={audioEngine.audioState.rightFreq || 444}
                  onFrequencyChange={(left, right) => {
                    console.log('🎛️ Parent received frequency change:', left, right);
                    audioEngine.updateFrequency(left, right);
                  }}
                />
              </Box>
            </CollapsibleSection>
          </Box>
        )}

        {/* Visualization */}
        {!closedSections.includes('visualizeID') && (
          <Box sx={{ 
            flex: '1 1 400px',
            minWidth: '350px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CollapsibleSection id="visualizeID" title="Visualization" icon="🎨" defaultOpen={true} onClose={handleSectionClose}>
              <Box sx={{ position: 'relative', height: '250px' }}>
                <Paper
                  elevation={3}
                  sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 3,
                    overflow: 'hidden',
                    background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.95) 100%)'
                  }}
                >
                  {patterns8D.activePattern && (
                    <SpatialVisualizer
                      pattern={patterns8D.activePattern}
                      electromagnetic={appState.electromagnetic}
                      size={300}
                    />
                  )}
                </Paper>
              </Box>
            </CollapsibleSection>
          </Box>
        )}

        {/* Advanced Controls */}
        {!closedSections.includes('advanceControlsID') && (
          <Box sx={{ 
            flex: '1 1 400px',
            minWidth: '350px',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 0,
            alignSelf: 'flex-start',
            zIndex: 10
          }}>
            <CollapsibleSection id="advanceControlsID" title="Advanced Controls" icon="⚙️" defaultOpen={false} onClose={handleSectionClose}>
              <ControlTabs
                tabs={tabs.filter(tab => !['timer'].includes(tab.id))}
                activeTab={appState.activeTab}
                onTabChange={handleTabChange}
              />
              <Box sx={{ height: '200px', overflowY: 'auto', pr: 1, mt: 2 }}>
                {renderTabContent()}
              </Box>
            </CollapsibleSection>
          </Box>
        )}

        {/* Timer & Sessions */}
        {!closedSections.includes('timerPanel') && (
          <Box sx={{ 
            flex: '1 1 400px',
            minWidth: '350px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CollapsibleSection id="timerPanel" title="Timer & Sessions" icon="⏰" defaultOpen={true} onClose={handleSectionClose}>
              <Box sx={{ height: '300px', overflowY: 'auto' }}>
                <TimerTab
                  appState={appState}
                  audioEngine={audioEngine}
                  patterns8D={patterns8D.patterns}
                  onStateChange={(partialState) => setAppState(prev => ({ ...prev, ...partialState }))}
                />
              </Box>
            </CollapsibleSection>
          </Box>
        )}
      </Box>

        {/* Restore Tabs for Closed Sections - Fixed Position */}
        {closedSections.length > 0 && (
          <Box sx={{ 
            position: 'fixed', 
            bottom: 10, 
            right: 10, 
            zIndex: 1000,
            maxWidth: 300
          }}>
            <Paper elevation={2} sx={{ p: 1, bgcolor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)' }}>
              <Typography variant="body2" sx={{ mb: 1, color: '#888' }}>Closed sections:</Typography>
              <Box sx={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
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