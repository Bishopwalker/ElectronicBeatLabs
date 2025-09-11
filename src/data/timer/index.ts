// Electromagnetic Beat Lab - Timer Presets Master Index
// Central hub for all timer presets and functionality

// ==================================================================
// IMPORT ALL PRESET COLLECTIONS
// ==================================================================

// Basic built-in presets
export { 
  BUILT_IN_PRESETS, 
  getPresetTransitions 
} from './timerPresets';

// Advanced comprehensive presets
export { 
  ADVANCED_TIMER_PRESETS,
  PRESET_CREATION_EXAMPLES,
  ADVANCED_HEALING_PROTOCOL,
  ADHD_GAMMA_FOCUS_BLAST
} from './advancedTimerPresets';

// Lucid dreaming specialist presets
export { 
  LUCID_DREAMING_PRESETS,
  LUCID_DREAMING_MASTER 
} from './lucidDreamingPreset';

// Toroidal low-frequency + loop examples
export { 
  TOROIDAL_LOW_FREQUENCY_PRESETS,
  DELTA_HEALING_TOROIDAL,
  THETA_CREATIVITY_TOROIDAL,
  ALPHA_FOCUS_TOROIDAL,
  TOROIDAL_FREQUENCY_EXAMPLES,
  LOOP_CONFIGURATION_EXAMPLES
} from './toroidalLowFrequencyExamples';

// Comprehensive template system
export { 
  ULTIMATE_CONSCIOUSNESS_EXPANSION_TEMPLATE,
  AVAILABLE_FEATURES,
  PRESET_TEMPLATES,
  type ComprehensiveTimerPreset,
  type AdvancedFrequencyTransition,
  type PatternProgression,
    type PatternConfig,
  type Spatial8DConfig,
  type ElectromagneticProgression,
  type VisualizationProgression,
  type YouTubeIntegration,
  type SessionActivity
} from './comprehensiveTimerTemplate';

// Core types - imported from main types folder
export { 
  type TimerPreset,
  type FrequencyTransition
} from '../../types';

// Additional timer-specific types that may need to be defined
export interface TimerSession {
  presetId: string;
  startTime: number;
  currentPhase: number;
  isPaused: boolean;
  loopCount?: number;
  session_id?: string; // Added for websocket integration
}

export interface TimerStatus {
  isRunning: boolean;
  isPaused: boolean;
  currentTime: number;
  totalTime: number;
  progress: number;
  session?: TimerSession;
}

export interface LocalTimer {
  id: string;
  preset: TimerPreset;
  status: TimerStatus;
  session?: TimerSession;
  // Direct properties used by useTimerLogic
  startTime: number;
  currentTransitionIndex: number;
  transitions: FrequencyTransition[];
  isActive: boolean;
  isPaused: boolean;
  forceLoop?: boolean;
}

export interface CustomPresetForm {
  name: string;
  description: string;
  duration: number;
  transitions: FrequencyTransition[];
  tags: string[];
}

export type TimerAction = 
  | 'start' 
  | 'pause' 
  | 'resume' 
  | 'stop' 
  | 'reset' 
  | 'restart'
  | 'next_phase' 
  | 'previous_phase';

// ==================================================================
// MASTER PRESET COLLECTIONS
// ==================================================================

import { BUILT_IN_PRESETS } from './timerPresets';
import { ADVANCED_TIMER_PRESETS } from './advancedTimerPresets';

// All presets combined for easy access
export const ALL_TIMER_PRESETS = [
  ...BUILT_IN_PRESETS,
  ...ADVANCED_TIMER_PRESETS
];

// ==================================================================
// PRESET CATEGORIES FOR UI ORGANIZATION
// ==================================================================

export const PRESET_CATEGORIES = {
  BASIC: {
    name: 'Basic Sessions',
    description: 'Simple, effective presets for everyday use',
    presets: ['test-quick-1min', 'focus-30min', 'meditation-20min'],
    icon: '🌟',
    difficulty: 'beginner'
  },
  
  SLEEP: {
    name: 'Sleep & Dreams',
    description: 'Advanced sleep induction and lucid dreaming protocols',
    presets: ['sleep-60min', 'lucid-dream-45min', 'lucid-dreaming-master-62min'],
    icon: '😴',
    difficulty: 'intermediate'
  },
  
  HEALING: {
    name: 'Healing & Wellness',
    description: 'Therapeutic frequencies for cellular regeneration and healing',
    presets: ['advanced-healing-protocol-60min', 'delta-healing-toroidal-45min-loop'],
    icon: '💚',
    difficulty: 'advanced'
  },
  
  FOCUS: {
    name: 'Focus & Productivity',
    description: 'High-performance cognitive enhancement for work and study',
    presets: ['adhd-gamma-focus-blast-30min', 'alpha-focus-toroidal-25min-maintenance'],
    icon: '🎯',
    difficulty: 'intermediate'
  },
  
  CREATIVITY: {
    name: 'Creativity & Flow',
    description: 'Inspiration and artistic enhancement protocols',
    presets: ['theta-creativity-toroidal-30min-3loop'],
    icon: '🎨',
    difficulty: 'beginner'
  },
  
  CONSCIOUSNESS: {
    name: 'Consciousness Expansion',
    description: 'Advanced spiritual and consciousness development',
    presets: ['ultimate-consciousness-expansion-90min'],
    icon: '🌌',
    difficulty: 'expert'
  }
};

// ==================================================================
// PRESET SEARCH AND FILTERING
// ==================================================================

export const searchPresets = (query: string, presets = ALL_TIMER_PRESETS) => {
  const searchTerm = query.toLowerCase();
  return presets.filter(preset => 
    preset.name.toLowerCase().includes(searchTerm) ||
    preset.description.toLowerCase().includes(searchTerm) ||
    preset.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
  );
};

export const filterPresetsByDifficulty = (difficulty: string, presets = ALL_TIMER_PRESETS) => {
  return presets.filter(preset => {
    // For basic presets, assume beginner level
    if (!('difficulty_level' in preset)) return difficulty === 'beginner';
    return (preset as any).difficulty_level === difficulty;
  });
};

export const filterPresetsByDuration = (minMinutes: number, maxMinutes: number, presets = ALL_TIMER_PRESETS) => {
  return presets.filter(preset => 
    preset.total_duration >= minMinutes && preset.total_duration <= maxMinutes
  );
};

export const filterPresetsByTags = (tags: string[], presets = ALL_TIMER_PRESETS) => {
  return presets.filter(preset =>
    tags.some(tag => preset.tags.includes(tag))
  );
};

export const getPresetsByCategory = (categoryKey: string) => {
  const category = PRESET_CATEGORIES[categoryKey as keyof typeof PRESET_CATEGORIES];
  if (!category) return [];
  
  return ALL_TIMER_PRESETS.filter(preset => 
    category.presets.includes(preset.id)
  );
};

// ==================================================================
// LOOP FUNCTIONALITY HELPERS
// ==================================================================

export const getLoopEnabledPresets = (presets = ALL_TIMER_PRESETS) => {
  return presets.filter(preset => preset.loop_enabled === true);
};

export const getInfiniteLoopPresets = (presets = ALL_TIMER_PRESETS) => {
  return presets.filter(preset => 
    preset.loop_enabled === true && preset.loop_count === 0
  );
};

export const getCountLoopPresets = (presets = ALL_TIMER_PRESETS) => {
  return presets.filter(preset => 
    preset.loop_enabled === true && preset.loop_count && preset.loop_count > 0
  );
};

// export const getPresetsTransitions=(presets= ALL_TIMER_PRESETS)=>{
//   return presets.map(presets => presets.id
//   );
// };
// ==================================================================
// FREQUENCY ANALYSIS HELPERS  
// ==================================================================

export const getPresetsByFrequencyRange = (minHz: number, maxHz: number) => {
  return ALL_TIMER_PRESETS.filter(preset => {
    const transitions = getPresetTransitions(preset.id);
    return transitions.some(transition => 
      transition.frequency_hz >= minHz && transition.frequency_hz <= maxHz
    );
  });
};

export const getDeltaPresets = () => getPresetsByFrequencyRange(0.5, 4);
export const getThetaPresets = () => getPresetsByFrequencyRange(4, 8);
export const getAlphaPresets = () => getPresetsByFrequencyRange(8, 12);
export const getBetaPresets = () => getPresetsByFrequencyRange(12, 30);
export const getGammaPresets = () => getPresetsByFrequencyRange(30, 100);

// ==================================================================
// TOROIDAL PATTERN HELPERS
// ==================================================================

export const getToroidalPresets = (presets = ALL_TIMER_PRESETS) => {
  return presets.filter(preset => 
    preset.name.toLowerCase().includes('toroidal') ||
    preset.description.toLowerCase().includes('toroidal') ||
    preset.tags.includes('toroidal')
  );
};

export const getMaximumResonancePresets = (presets = ALL_TIMER_PRESETS) => {
  return presets.filter(preset => 
    preset.name.toLowerCase().includes('maximum resonance') ||
    preset.description.toLowerCase().includes('maximum resonance')
  );
};

// ==================================================================
// USAGE STATISTICS AND RECOMMENDATIONS
// ==================================================================

export const PRESET_STATS = {
  total_presets: ALL_TIMER_PRESETS.length,
  basic_presets: BUILT_IN_PRESETS.length,
  advanced_presets: ADVANCED_TIMER_PRESETS.length,
  loop_enabled_presets: getLoopEnabledPresets().length,
  toroidal_presets: getToroidalPresets().length,
  healing_presets: filterPresetsByTags(['healing']).length,
  focus_presets: filterPresetsByTags(['focus']).length,
  meditation_presets: filterPresetsByTags(['meditation']).length
};

export const BEGINNER_RECOMMENDATIONS = [
  'test-quick-1min',
  'meditation-20min', 
  'focus-30min',
  'theta-creativity-toroidal-30min-3loop'
];

export const ADVANCED_RECOMMENDATIONS = [
  'lucid-dreaming-master-62min',
  'advanced-healing-protocol-60min',
  'adhd-gamma-focus-blast-30min',
  'delta-healing-toroidal-45min-loop'
];

export const EXPERT_RECOMMENDATIONS = [
  'ultimate-consciousness-expansion-90min'
];

// ==================================================================
// PRESET VALIDATION
// ==================================================================

export const validatePreset = (preset: TimerPreset): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!preset.id) errors.push('Preset ID is required');
  if (!preset.name) errors.push('Preset name is required');
  if (preset.total_duration <= 0) errors.push('Total duration must be positive');
  if (preset.transitions_count <= 0) errors.push('Transitions count must be positive');
  if (!preset.tags || preset.tags.length === 0) errors.push('At least one tag is required');
  
  // Validate loop configuration
  if (preset.loop_enabled) {
    if (preset.loop_count !== undefined && preset.loop_count < 0) {
      errors.push('Loop count cannot be negative (use 0 for infinite)');
    }
    if (!preset.loop_phase) {
      errors.push('Loop phase must be specified when loop is enabled');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// ==================================================================
// EXPORT SUMMARY
// ==================================================================

export const TIMER_SYSTEM_INFO = {
  version: '1.0.0',
  features: [
    'Basic timer presets for everyday use',
    'Advanced comprehensive presets with full functionality',
    'Lucid dreaming specialist protocols', 
    'Toroidal patterns at all frequency ranges',
    'Loop functionality (infinite, count, maintenance)',
    '8D spatial audio integration',
    'Electromagnetic field progression',
    'Dynamic visualization control',
    'Pre/post session activities',
    'ADHD-specific protocols',
    'Healing and wellness programs'
  ],
  total_presets: PRESET_STATS.total_presets,
  categories: Object.keys(PRESET_CATEGORIES).length,
  difficulty_levels: ['beginner', 'intermediate', 'advanced', 'expert']
};