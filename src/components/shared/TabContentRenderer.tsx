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
import QuantumOracleTab from '../tabs/QuantumOracleTab';
import RVSessionsTab from '../tabs/RVSessionsTab';
import CRVProtocolTab from '../tabs/CRVProtocolTab';
import ARVPredictionsTab from '../tabs/ARVPredictionsTab';
import YouTubeTab from '../tabs/YouTubeTab';
import SettingsTab from '../tabs/SettingsTab';
import GuideTab from '../tabs/GuideTab';

interface TabContentRendererProps {
  appState: AppState;
  audioEngine: any;
  backendEngine: any;
  frontendEngine?: any;
  patterns8D: any;
  onStateChange: (partialState: Partial<AppState>) => void;
  onPatternSelect: (patternId: string) => void;
  onFrequencyChange: (base_frequency: number, beat_frequency?: number) => void;
}

const TabContentRenderer: React.FC<TabContentRendererProps> = ({
  appState,
  audioEngine,
  backendEngine,
  frontendEngine,
  patterns8D,
  onStateChange,
  onPatternSelect,
  onFrequencyChange
}) => {
  // Common props for ALL tabs - include both engines so tabs know what's running
  const commonProps = {
    appState,
    audioEngine,  // Active audio engine (might be frontend or backend)
    backendEngine,  // Backend engine reference
    frontendEngine: frontendEngine || audioEngine,  // Frontend engine reference
    patterns8D: patterns8D.patterns,
    onStateChange,
    // Helper flags so tabs know what's running
    isBackendActive: backendEngine?.backendConnected || false,
    isFrontendActive: !backendEngine?.backendConnected || false
  };

  // Timer tab uses backend engine primarily
  const timerProps = {
    ...commonProps,
    audioEngine: backendEngine  // Override with backend for timer
  };

  // Settings tab gets both engines properly
  const settingsProps = {
    ...commonProps,
    // Keep audioEngine as active audio engine for compatibility
    // But pass specific engine refs for connection monitoring
    backendEngine,
    frontendEngine
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
    case 'quantum':
      return <QuantumOracleTab />;
    case 'rv':
      return <RVSessionsTab />;
    case 'crv':
      return <CRVProtocolTab />;
    case 'arv':
      return <ARVPredictionsTab />;
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
