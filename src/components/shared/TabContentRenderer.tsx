// Tab Content Renderer - Handles rendering of different tab content
// Extracted from main component to reduce complexity

import React from 'react';
import type { AppState } from '../../types';
import { WAVE_PATTERNS, PATTERN_PRESETS } from '../../data/patterns';

// Tab Components
import FrequencyTab from '../tabs/FrequencyTab';
import PatternTab from '../tabs/PatternTab';
import TimerTab from '../tabs/TimerTab';
import VisualizationTab from '../tabs/VisualizationTab';
import ADHDTab from '../tabs/ADHDTab';
import YouTubeTab from '../tabs/YouTubeTab';
import SettingsTab from '../tabs/SettingsTab';
import GuideTab from '../tabs/GuideTab';

interface TabContentRendererProps {
  appState: AppState;
  audioEngine: any;
  backendEngine: any;
  patterns8D: any;
  onStateChange: (partialState: Partial<AppState>) => void;
  onPatternSelect: (patternId: string) => void;
  onFrequencyChange: (frequency: number) => void;
}

const TabContentRenderer: React.FC<TabContentRendererProps> = ({
  appState,
  audioEngine,
  backendEngine,
  patterns8D,
  onStateChange,
  onPatternSelect,
  onFrequencyChange
}) => {
  // Common props for most tabs
  const commonProps = {
    appState,
    audioEngine,
    patterns8D: patterns8D.patterns,
    onStateChange
  };
  
  // Special props for timer tab that needs backend engine for binaural beat generation
  const timerProps = {
    appState,
    audioEngine: backendEngine,
    patterns8D: patterns8D.patterns,
    onStateChange
  };
  
  // Special props for settings tab that needs backend engine for spatial audio
  const settingsProps = {
    appState,
    audioEngine: backendEngine, // Use backend engine for spatial audio
    patterns8D: patterns8D.patterns,
    onStateChange
  };

  switch (appState.activeTab) {
    case 'patterns':
      return (
        <PatternTab
          {...commonProps}
          patterns={WAVE_PATTERNS}
          presets={PATTERN_PRESETS}
          onPatternSelect={onPatternSelect}
        />
      );
    case 'frequency':
      return (
        <FrequencyTab
          {...commonProps}
          onFrequencyChange={onFrequencyChange}
        />
      );
    case 'timer':
      return <TimerTab {...timerProps} />;
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

export default TabContentRenderer;