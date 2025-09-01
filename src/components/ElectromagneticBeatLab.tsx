// Electromagnetic Beat Lab - Main Component
// Advanced binaural beats generator with electromagnetic field visualization

import React, {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import type {AppState, ElectromagneticBeatLabProps, PatternMode} from '../types/index';

import {useAudioEngine} from '../hooks/useAudioEngine';
import {use8DPatterns} from '../hooks/use8DPatterns';
import {PATTERN_PRESETS, WAVE_PATTERNS} from '../data/patterns';

import StarField from './StarField';
import SpatialVisualizer from './SpatialVisualizer';
import FrequencyDisplayMUI from './FrequencyDisplayMUI';
import PatternSelectorMUI from './PatternSelectorMUI';
import ElectromagneticStatus from './ElectromagneticStatus';
import WaveGuidePanelMUI from './WaveGuidePanelMUI';
import MainControlsMUI from './MainControlsMUI';
import ControlTabs from './ControlTabs';
import BinauralTestMUI from './BinauralTestMUI';
import SimpleAudioTest from './SimpleAudioTest';

// Tab Components
import FrequencyTab from './tabs/FrequencyTab';
import PatternTab from './tabs/PatternTab';
import VisualizationTab from './tabs/VisualizationTab';
import ADHDTab from './tabs/ADHDTab';
import YouTubeTab from './tabs/YouTubeTab';
import SettingsTab from './tabs/SettingsTab';
import GuideTab from './tabs/GuideTab';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: transparent;
  box-sizing: border-box;
  
  /* Prevent zoom issues */
  * {
    box-sizing: border-box;
  }
`;

const Header = styled.header`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0.25rem 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 40px;
  
  /* Handle zoom levels */
  @media (max-zoom: 200%) {
    padding: 0.2rem 0.4rem;
    min-height: 35px;
  }
  
  @media (max-zoom: 300%) {
    padding: 0.1rem 0.3rem;
    min-height: 30px;
    font-size: 0.9rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  
  /* Handle zoom levels */
  @media (max-zoom: 200%) {
    font-size: 1.6rem;
  }
  
  @media (max-zoom: 300%) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const StatusBar = styled.div`
  display: flex;
  gap: 0.25rem;
  align-items: center;
  font-size: 0.75rem;
`;

const MainInterface = styled.div`
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: minmax(280px, 25%) 1fr minmax(260px, 25%);
  grid-template-rows: auto 1fr auto;
  gap: 0.5rem;
  padding: 0.5rem;
  overflow: hidden;

  /* Handle zoom and small screens */
  @media (max-width: 1200px), (max-zoom: 150%) {
    grid-template-columns: minmax(250px, 30%) 1fr;
    grid-template-rows: auto 1fr auto;
  }

  @media (max-width: 768px), (max-zoom: 200%) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr auto;
    gap: 0.25rem;
    padding: 0.25rem;
  }
`;

const LeftPanel = styled.div`
  grid-column: 1;
  grid-row: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0; /* Allow shrinking */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 107, 0, 0.5) rgba(0, 0, 0, 0.3);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #ff6b00, #8a2be2);
    border-radius: 3px;
    box-shadow: 0 0 5px rgba(255, 107, 0, 0.5);
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(45deg, #ff8533, #9944d9);
  }

  @media (max-width: 768px), (max-zoom: 200%) {
    grid-column: 1;
    grid-row: 1;
    max-height: 40vh;
  }
`;

const CenterPanel = styled.div`
  grid-column: 2;
  grid-row: 1 / -1;
  position: relative;
  overflow: hidden;
  min-width: 0; /* Allow shrinking */
  min-height: 300px;

  @media (max-width: 1200px), (max-zoom: 150%) {
    grid-column: 2;
    grid-row: 1 / -1;
  }

  @media (max-width: 768px), (max-zoom: 200%) {
    grid-column: 1;
    grid-row: 3;
    min-height: 250px;
  }
`;

const RightPanel = styled.div`
  grid-column: 3;
  grid-row: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0; /* Allow shrinking */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 107, 0, 0.5) rgba(0, 0, 0, 0.3);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #ff6b00, #8a2be2);
    border-radius: 3px;
    box-shadow: 0 0 5px rgba(255, 107, 0, 0.5);
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(45deg, #ff8533, #9944d9);
  }

  @media (max-width: 1200px), (max-zoom: 150%) {
    display: none;
  }
`;

const VisualizationContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: radial-gradient(circle at center, 
    rgba(0, 0, 0, 0.8) 0%, 
    rgba(0, 0, 0, 0.95) 100%
  );
`;

const ControlsContainer = styled.div`
  position: absolute;
  bottom: 0.25rem;
  left: 0.25rem;
  right: 0.25rem;
  z-index: 50;

  @media (max-width: 768px), (max-zoom: 200%) {
    grid-column: 1;
    grid-row: 4;
    position: relative;
    bottom: auto;
    left: auto;
    right: auto;
  }
`;

const TabContent = styled.div`
  min-height: 300px;
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 107, 0, 0.5) rgba(0, 0, 0, 0.3);
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #ff6b00, #8a2be2);
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(255, 107, 0, 0.5);
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(45deg, #ff8533, #9944d9);
    box-shadow: 0 0 15px rgba(255, 107, 0, 0.7);
  }

  /* Handle extreme zoom levels */
  @media (max-zoom: 300%) {
    min-height: 200px;
    max-height: 400px;
    font-size: 0.8rem;
  }
`;

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

  // Hooks
  const audioEngine = useAudioEngine();
  const patterns8D = use8DPatterns();

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
      audioEngine.stopBinauralBeat();
      patterns8D.stopAnimation();
    }
  }, [audioEngine, patterns8D]);

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
  }, [audioEngine, patterns8D, appState.currentPattern, appState.isPlaying]);

  const handleStop = useCallback(() => {
    audioEngine.stopBinauralBeat();
    patterns8D.stopAnimation();
  }, [audioEngine, patterns8D]);

  // Handle tab change
  const handleTabChange = useCallback((tabId: string) => {
    setAppState(prev => ({ ...prev, activeTab: tabId }));
  }, []);

  // Tab configuration
  const tabs = [
    { id: 'patterns', label: 'Patterns', icon: '🌀', component: PatternTab, enabled: true },
    { id: 'frequency', label: 'Frequency', icon: '📊', component: FrequencyTab, enabled: true },
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
    
    const commonProps = {
      appState,
      audioEngine,
      patterns8D,
      onStateChange: setAppState
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
    <Container>
      {/* Background Star Field */}
      <StarField {...appState.visualizations.starField} />

      {/* Header */}
      <Header>
        <Title>Electromagnetic Beat Lab</Title>
        <StatusBar>
          <ElectromagneticStatus 
            field={appState.electromagnetic}
            status={appState.systemStatus}
          />
        </StatusBar>
      </Header>

      {/* Main Interface */}
      <MainInterface>
        {/* Left Panel - Controls and Pattern Selection */}
        <LeftPanel>
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
        </LeftPanel>

        {/* Center Panel - Main Visualization */}
        <CenterPanel>
          <VisualizationContainer>
            {patterns8D.activePattern && (
              <SpatialVisualizer
                pattern={patterns8D.activePattern}
                electromagnetic={appState.electromagnetic}
                size={400}
              />
            )}
          </VisualizationContainer>
          
          <ControlsContainer>
            <div className="glass-panel">
              <ControlTabs
                tabs={tabs}
                activeTab={appState.activeTab}
                onTabChange={handleTabChange}
              />
              
              <TabContent>
                {renderTabContent()}
              </TabContent>
            </div>
          </ControlsContainer>
        </CenterPanel>

        {/* Right Panel - Wave Guide and Advanced Controls */}
        <RightPanel>
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
        </RightPanel>
      </MainInterface>
      
      {/* Simple Audio Test - for debugging */}
      <SimpleAudioTest />
    </Container>
  );
};

export default ElectromagneticBeatLab;