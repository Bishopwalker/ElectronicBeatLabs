// Electromagnetic Beat Lab - Timer Presets Master Index
// Central hub for all timer presets and functionality

// ==================================================================
// IMPORT ALL PRESET COLLECTIONS
// ==================================================================

import { ADVANCED_TIMER_PRESETS } from "./advancedTimerPresets";
import { BUILT_IN_PRESETS, getPresetTransitions } from "./timerPresets";
import type { TimerPreset, FrequencyTransition } from "../../types";

// ==================================================================
// TIMER TYPE DEFINITIONS
// ==================================================================

/**
 * Timer session information
 */
export interface TimerSession {
  presetId?: TimerPreset;
  startTime: number;
  currentPhase: number;
  isPaused: boolean;
  loopCount: number;
  session_id: string;
  preset?: TimerPreset;
  is_active?: boolean;
  current_transition_index?: number;
}

/**
 * Timer status for UI display and state management
 */
export interface TimerStatus {
  session?: TimerSession;
  current_transition: FrequencyTransition;
  next_transition: FrequencyTransition | null;
  time_remaining_current: number;
  time_remaining_total: number;
  isRunning: boolean;
  totalTime: number;
  progress: number;
}

/**
 * Local timer state for useTimerLogic hook
 */
export interface LocalTimer {
  startTime: number;
  currentStepIndex: number;
  transitions: FrequencyTransition[];
  isActive: boolean;
  isPaused: boolean;
  forceLoop?: boolean;
  session?: TimerSession;
  status?: TimerStatus;
}

/**
 * Timer control actions
 */
export type TimerAction = 'stop' | 'pause' | 'resume' | 'restart';

/**
 * Custom preset form data
 */
export interface CustomPresetForm {
  name: string;
  description: string;
  duration: number;
  tags: string[];
  transitions: FrequencyTransition[];
}

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
// USAGE STATISTICS AND RECOMMENDATIONS
// ==================================================================



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
// PRESET COLLECTIONS
// ==================================================================

export const ALL_TIMER_PRESETS: TimerPreset[] = [
  ...BUILT_IN_PRESETS,
  ...ADVANCED_TIMER_PRESETS
];

// ==================================================================
// PRESET FILTERING UTILITIES
// ==================================================================

export const getLoopEnabledPresets = (): TimerPreset[] => {
  return ALL_TIMER_PRESETS.filter(preset => preset.loop_enabled === true);
};

export const getToroidalPresets = (): TimerPreset[] => {
  return ALL_TIMER_PRESETS.filter(preset =>
    preset.id.includes('toroidal') || preset.pattern_id?.includes('toroidal')
  );
};

export const filterPresetsByTags = (tags: string[]): TimerPreset[] => {
  return ALL_TIMER_PRESETS.filter(preset =>
    tags.some(tag => preset.tags.includes(tag))
  );
};

// ==================================================================
// EXPORT SUMMARY
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

// ==================================================================
// EXPORT ALL TYPES AND FUNCTIONS
// ==================================================================
export type { TimerPreset, FrequencyTransition };
export { getPresetTransitions };

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
  difficulty_levels: ['beginner', 'intermediate', 'advanced', 'expert'],

};