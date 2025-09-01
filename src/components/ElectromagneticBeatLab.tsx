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
`;

const Header = styled.header`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 1rem 2rem;
  display: flex;
  justify-content: between;
  align-items: center;
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
`;

const StatusBar = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.9rem;
`;

const MainInterface = styled.div`
  position: absolute;
  top: 80px;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: 320px 1fr 280px;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
  padding: 1rem;
  overflow: hidden;

  @media (max-width: 1200px) {
    grid-template-columns: 300px 1fr;
    grid-template-rows: auto 1fr auto;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr auto;
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
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 107, 0, 0.5) rgba(0, 0, 0, 0.3);
  
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

  @media (max-width: 768px) {
    grid-column: 1;
    grid-row: 1;
    max-height: 300px;
  }
`;

const CenterPanel = styled.div`
  grid-column: 2;
  grid-row: 1 / -1;
  position: relative;
  overflow: hidden;

  @media (max-width: 1200px) {
    grid-column: 2;
    grid-row: 1 / -1;
  }

  @media (max-width: 768px) {
    grid-column: 1;
    grid-row: 3;
  }
`;

const RightPanel = styled.div`
  grid-column: 3;
  grid-row: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 107, 0, 0.5) rgba(0, 0, 0, 0.3);
  
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

  @media (max-width: 1200px) {
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
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  z-index: 50;

  @media (max-width: 768px) {
    grid-column: 1;
    grid-row: 4;
    position: relative;
    bottom: auto;
    left: auto;
    right: auto;
  }
`;

const TabContent = styled.div`
  min-height: 400px;
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
`;

const ElectromagneticBeatLab: React.FC<ElectromagneticBeatLabProps> = ({
  initialPattern,
  autoStart = false,
  fullscreen = false
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

    const TabComponent = activeTabConfig.component;
    
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
            selected={appState.currentPattern || null}
            mode={appState.mode}
            onSelect={handlePatternSelect}
            onModeChange={handleModeChange}
          />

          <FrequencyDisplayMUI
            frequency={appState.frequency}
            beatFrequency={appState.frequency}
            onChange={handleFrequencyChange}
            rangeLabel={appState.currentPattern?.frequencies.range || 'alpha'}
          />

          <MainControlsMUI
            isPlaying={appState.isPlaying}
            volume={appState.volume}
            onPlay={handlePlay}
            onStop={handleStop}
            onVolumeChange={handleVolumeChange}
          />

          <BinauralTestMUI
            leftFrequency={audioEngine.audioState.leftFreq || 440}
            rightFrequency={audioEngine.audioState.rightFreq || 444}
            onLeftChange={(freq) => audioEngine.updateFrequency(freq, audioEngine.audioState.rightFreq)}
            onRightChange={(freq) => audioEngine.updateFrequency(audioEngine.audioState.leftFreq, freq)}
            onTest={() => handlePlay()}
            isPlaying={appState.isPlaying}
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
    </Container>
  );
};

export default ElectromagneticBeatLab;