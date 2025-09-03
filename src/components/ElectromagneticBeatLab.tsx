// Electromagnetic Beat Lab - Main Component
// Advanced binaural beats generator with electromagnetic field visualization

import React, {useCallback, useEffect, useState} from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import type {AppState, ElectromagneticBeatLabProps, PatternMode} from '../types/index';

import {useMasterAudioControl} from '../hooks/useMasterAudioControl';
import {PATTERN_PRESETS, WAVE_PATTERNS} from '../data/patterns';

import StarField from './StarField';
import SpatialVisualizer from './SpatialVisualizer';
import FrequencyDisplayMUI from './FrequencyDisplayMUI';
import PatternSelectorMUI from './PatternSelectorMUI';
import ElectromagneticStatus from './ElectromagneticStatus';
import WaveGuidePanelMUI from './WaveGuidePanelMUI';
import MainControlsMUI from './MainControlsMUI';
import ControlTabs from './ControlTabs';
import MasterStopControl from './MasterStopControl';
import BinauralTestMUI   from "./BinauralTestMUI.tsx";
// Tab Components
import FrequencyTab from './tabs/FrequencyTab';
import PatternTab from './tabs/PatternTab';
import TimerTab from './tabs/TimerTab';
import VisualizationTab from './tabs/VisualizationTab';
import ADHDTab from './tabs/ADHDTab';
import YouTubeTab from './tabs/YouTubeTab';
import SettingsTab from './tabs/SettingsTab';
import GuideTab from './tabs/GuideTab';












const ElectromagneticBeatLab: React.FC<ElectromagneticBeatLabProps> = ({
  initialPattern,
  autoStart = false
}) => {
  // State management
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
      }
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
  const audioEngine = masterAudio.engines.audioEngine;
  const patterns8D = masterAudio.engines.patternsEngine;

  // Initialize with pattern
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
      // Default to first pattern
      const defaultPattern = WAVE_PATTERNS[0];
      setAppState(prev => ({ ...prev, currentPattern: defaultPattern }));
    }
  }, [initialPattern, autoStart, audioEngine]);

  // Update electromagnetic state
  useEffect(() => {
    setAppState(prev => ({
      ...prev,
      electromagnetic: audioEngine.electromagnetic,
      isPlaying: audioEngine.audioState.isPlaying,
      volume: audioEngine.audioState.volume,
      frequency: audioEngine.audioState.beatFreq
    }));
  }, [audioEngine.electromagnetic, audioEngine.audioState]);

  // Handle pattern selection
  const handlePatternSelect = useCallback((patternId: string) => {
    const pattern = WAVE_PATTERNS.find(p => p.id === patternId);
    if (pattern) {
      setAppState(prev => ({ ...prev, currentPattern: pattern }));
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
        return <SettingsTab {...commonProps} />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background Star Field */}
      <StarField {...appState.visualizations.starField} />

      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          p: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(10px)',
          bgcolor: 'rgba(0, 0, 0, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          minHeight: 40
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, m: 0 }}>
          Bishop's Electromagnetic Beat Lab
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center', fontSize: '0.75rem' }}>
          <ElectromagneticStatus 
            field={appState.electromagnetic}
            status={appState.systemStatus}
          />
        </Box>
      </Paper>

      {/* Main Interface */}
      <Grid
        container
        sx={{
          position: 'realitive',
          top: '40px',
          left: 0,
          right: 0,
          bottom: 0,
          p: 1,
          overflow: 'hidden'
        }}
        spacing={1}
      >
        {/* Left Panel - Controls and Pattern Selection */}
        <Grid item xs={12} md={3} lg={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%', overflow: 'auto' }}>
          <MasterStopControl
            activeStatus={masterAudio.activeStatus}
            onMasterStop={masterAudio.masterStop}
            onMasterStart={masterAudio.quickStart}
            frequencies={masterAudio.frequencies}
            volume={masterAudio.volume}
          />

          <PatternSelectorMUI
            patterns={WAVE_PATTERNS}
            selected={appState.currentPattern?.id || null}
            mode={appState.mode}
            onSelect={handlePatternSelect}
            onModeChange={handleModeChange}
          />

          <FrequencyDisplayMUI
            frequency={appState.frequency}
            beatFreq={appState.frequency}
            target={appState.currentPattern?.frequencies.carrier || 440}
            range={appState.currentPattern?.frequencies.range || 'alpha'}
            onChange={handleFrequencyChange}
          />

          <MainControlsMUI
            isPlaying={appState.isPlaying}
            volume={appState.volume}
            onPlay={handlePlay}
            onStop={handleStop}
            onVolumeChange={handleVolumeChange}
          />

          <BinauralTestMUI
            leftFreq={audioEngine.audioState.leftFreq || 440}
            rightFreq={audioEngine.audioState.rightFreq || 444}
            onFrequencyChange={(left, right) => audioEngine.updateFrequency(left, right)}
          />
          </Box>
        </Grid>

        {/* Center Panel - Main Visualization */}
        <Grid item xs={12} md={6} lg={6}>
          <Box sx={{ position: 'relative', height: '100%', minHeight: 300 }}>
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
                  size={400}
                />
              )}
            </Paper>
            
            <Box
              sx={{
                position: 'absolute',
                bottom: 1,
                left: 1,
                right: 1,
                zIndex: 50
              }}
            >
              <Paper elevation={4} sx={{ p: 2, backdropFilter: 'blur(10px)', bgcolor: 'rgba(0, 0, 0, 0.8)' }}>
                <ControlTabs
                  tabs={tabs}
                  activeTab={appState.activeTab}
                  onTabChange={handleTabChange}
                />
                
                <Box
                  sx={{
                    minHeight: 300,
                    maxHeight: 600,
                    overflowY: 'auto',
                    pr: 1,
                    mt: 2
                  }}
                >
                  {renderTabContent()}
                </Box>
              </Paper>
            </Box>
          </Box>
        </Grid>

        {/* Right Panel - Wave Guide and Advanced Controls */}
        <Grid item xs={12} md={3} lg={3} sx={{ display: { xs: 'none', lg: 'block' } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%', overflow: 'auto' }}>
            <WaveGuidePanelMUI
              config={{
                type: 'toroidal',
                dimensions: { width: 200, height: 200, depth: 100 },
                material: 'copper',
                resonance: appState.frequency,
                impedance: 377
              }}
              onChange={(config) => {
                // Handle wave guide configuration change
                console.log('Wave guide config changed:', config);
              }}
            />
          </Box>
        </Grid>
      </Grid>
      
      {/* All audio controls now consolidated in MasterStopControl above */}
    </Box>
  );
};

export default ElectromagneticBeatLab;