import type { TimerPreset, FrequencyTransition } from './types';

export const BUILT_IN_PRESETS: TimerPreset[] = [
  {
    id: 'test-quick-1min',
    name: '🧪 Quick Test - 1min',
    description: 'Fast 3-transition test (20s each) for development',
    total_duration: 1,
    transitions_count: 3,
    tags: ['test', 'development', 'quick'],
    is_premium: false,
    available: true,
    
    // Loop configuration for testing
    loop_enabled: false,
    loop_count: 1,
    loop_phase: 'full'
  },
  {
    id: 'focus-30min',
    name: 'Focus Session - 30min',
    description: '🧠 Automated frequency progression: 15Hz→20Hz→12Hz (Beta focus→High beta→Alpha cooldown)',
    total_duration: 30,
    transitions_count: 3,
    tags: ['focus', 'beta', 'productivity'],
    is_premium: false,
    available: true,
    
    // Focus session - loop maintenance phase
    loop_enabled: true,
    loop_count: 0, // Infinite
    loop_phase: 'specific_transitions',
    loop_transitions: [1] // Loop the high beta concentration phase
  },
  {
    id: 'meditation-20min',
    name: 'Meditation - 20min',
    description: '🧘 Automated frequency progression: 10Hz→6Hz (Alpha relaxation→Theta meditation)',
    total_duration: 20,
    transitions_count: 2,
    tags: ['meditation', 'alpha', 'theta'],
    is_premium: false,
    available: true,
    
    // Meditation - full session loop for extended practice
    loop_enabled: true,
    loop_count: 0, // Infinite
    loop_phase: 'full'
  },
  {
    id: 'sleep-60min',
    name: 'Sleep Induction - 60min',
    description: '😴 Automated frequency progression: 8Hz→4Hz→2Hz→1Hz (Alpha→Theta→Delta→Deep Delta)',
    total_duration: 60,
    transitions_count: 4,
    tags: ['sleep', 'delta', 'relaxation'],
    is_premium: true,
    available: true,
    
    // Sleep - loop deep delta phases for extended rest
    loop_enabled: true,
    loop_count: 0, // Infinite
    loop_phase: 'specific_transitions',
    loop_transitions: [2, 3] // Loop the delta sleep phases
  },
  {
    id: 'lucid-dream-45min',
    name: 'Lucid Dreaming - 45min',
    description: '✨ Automated frequency progression: 6Hz sustained (Theta lucid state)',
    total_duration: 45,
    transitions_count: 1,
    tags: ['lucid', 'theta', 'rem'],
    is_premium: true,
    available: true,
    
    // Lucid dreaming - loop for multiple REM cycles
    loop_enabled: true,
    loop_count: 3, // 3 REM cycles
    loop_phase: 'full'
  },
  {
    id: 'custom-complex-obe-protocol-95min',
    name: '🌀 Complex OBE Protocol - 95min',
    description: '⚡ Multi-stage journey: Gamma→Theta→Beta→Delta with DNA healing, 8D spatial patterns, Loop enabled',
    total_duration: 95,
    transitions_count: 4,
    tags: ['gamma', 'theta', 'beta', 'delta', 'dna-healing', 'obe', 'custom'],
    is_premium: true,
    available: true,
    
    // Complex OBE protocol - loop entire session for extended practice
    loop_enabled: true,
    loop_count: 0, // Infinite
    loop_phase: 'full'
  }
];

// Import advanced preset collections for transition support
import { ADVANCED_HEALING_PROTOCOL, ADHD_GAMMA_FOCUS_BLAST } from './advancedTimerPresets';
import { LUCID_DREAMING_MASTER } from './lucidDreamingPreset';
import { DELTA_HEALING_TOROIDAL, THETA_CREATIVITY_TOROIDAL, ALPHA_FOCUS_TOROIDAL } from './toroidalLowFrequencyExamples';

export const getPresetTransitions = (presetId: string): FrequencyTransition[] => {
  switch (presetId) {
    case 'test-quick-1min':
      return [
        {
          duration_minutes: 0.33,
          frequency_hz: 10,
          frequency_type: 'Alpha',
          left_ear_hz: 440,
          right_ear_hz: 450,
          description: '🧪 Alpha test (20s)'
        },
        {
          duration_minutes: 0.33,
          frequency_hz: 6,
          frequency_type: 'Theta',
          left_ear_hz: 440,
          right_ear_hz: 446,
          description: '🧪 Theta test (20s)'
        },
        {
          duration_minutes: 0.34,
          frequency_hz: 15,
          frequency_type: 'Beta',
          left_ear_hz: 440,
          right_ear_hz: 455,
          description: '🧪 Beta test (20s)'
        }
      ];
    
    case 'focus-30min':
      return [
        {
          duration_minutes: 10,
          frequency_hz: 15,
          frequency_type: 'Beta',
          left_ear_hz: 440,
          right_ear_hz: 455,
          description: '🧠 Stage 1: Beta Focus (15Hz) - Mental activation & alertness'
        },
        {
          duration_minutes: 15,
          frequency_hz: 20,
          frequency_type: 'Beta',
          left_ear_hz: 440,
          right_ear_hz: 460,
          description: '⚡ Stage 2: High Beta (20Hz) - Peak concentration & problem solving'
        },
        {
          duration_minutes: 5,
          frequency_hz: 12,
          frequency_type: 'Alpha',
          left_ear_hz: 440,
          right_ear_hz: 452,
          description: '😌 Stage 3: Alpha Cooldown (12Hz) - Calm focus & integration'
        }
      ];
    
    case 'meditation-20min':
      return [
        {
          duration_minutes: 10,
          frequency_hz: 10,
          frequency_type: 'Alpha',
          left_ear_hz: 440,
          right_ear_hz: 450,
          description: '🧘 Stage 1: Alpha Relaxation (10Hz) - Calm awareness & preparation'
        },
        {
          duration_minutes: 10,
          frequency_hz: 6,
          frequency_type: 'Theta',
          left_ear_hz: 440,
          right_ear_hz: 446,
          description: '✨ Stage 2: Theta Meditation (6Hz) - Deep introspection & insight'
        }
      ];
    
    case 'sleep-60min':
      return [
        {
          duration_minutes: 15,
          frequency_hz: 8,
          frequency_type: 'Alpha',
          left_ear_hz: 440,
          right_ear_hz: 448,
          description: '😌 Stage 1: Alpha relaxation (8Hz) - Initial calm down'
        },
        {
          duration_minutes: 15,
          frequency_hz: 4,
          frequency_type: 'Theta',
          left_ear_hz: 440,
          right_ear_hz: 444,
          description: '😴 Stage 2: Theta drowsiness (4Hz) - Pre-sleep transition'
        },
        {
          duration_minutes: 20,
          frequency_hz: 2,
          frequency_type: 'Delta',
          left_ear_hz: 440,
          right_ear_hz: 442,
          description: '💤 Stage 3: Delta sleep (2Hz) - Deep restorative sleep'
        },
        {
          duration_minutes: 10,
          frequency_hz: 1,
          frequency_type: 'Delta',
          left_ear_hz: 440,
          right_ear_hz: 441,
          description: '🛌 Stage 4: Ultra-Delta (1Hz) - Deepest sleep state'
        }
      ];
    
    case 'lucid-dream-45min':
      return [
        {
          duration_minutes: 45,
          frequency_hz: 6,
          frequency_type: 'Theta',
          left_ear_hz: 440,
          right_ear_hz: 446,
          description: 'Theta lucid dreaming'
        }
      ];
    
    // Advanced Healing Protocol transitions
    case 'advanced-healing-protocol-60min':
      return ADVANCED_HEALING_PROTOCOL.advanced_transitions.map(t => ({
        duration_minutes: t.duration_minutes,
        frequency_hz: t.frequency_hz,
        frequency_type: t.frequency_type,
        left_ear_hz: t.left_ear_hz,
        right_ear_hz: t.right_ear_hz,
        description: t.description,
        pattern: t.pattern_id,
        spatial_settings: t.spatial_config
      }));
    
    // ADHD Gamma Focus Blast transitions
    case 'adhd-gamma-focus-blast-30min':
      return ADHD_GAMMA_FOCUS_BLAST.advanced_transitions.map(t => ({
        duration_minutes: t.duration_minutes,
        frequency_hz: t.frequency_hz,
        frequency_type: t.frequency_type,
        left_ear_hz: t.left_ear_hz,
        right_ear_hz: t.right_ear_hz,
        description: t.description,
        pattern: t.pattern_id,
        spatial_settings: t.spatial_config
      }));
    
    // Lucid Dreaming Master transitions
    case 'lucid-dreaming-master-62min':
      return LUCID_DREAMING_MASTER.advanced_transitions.map(t => ({
        duration_minutes: t.duration_minutes,
        frequency_hz: t.frequency_hz,
        frequency_type: t.frequency_type,
        left_ear_hz: t.left_ear_hz,
        right_ear_hz: t.right_ear_hz,
        description: t.description,
        pattern: t.pattern_id,
        spatial_settings: t.spatial_config
      }));
    
    // Toroidal Low Frequency presets
    case 'delta-healing-toroidal-45min-loop':
      return DELTA_HEALING_TOROIDAL.advanced_transitions.map(t => ({
        duration_minutes: t.duration_minutes,
        frequency_hz: t.frequency_hz,
        frequency_type: t.frequency_type,
        left_ear_hz: t.left_ear_hz,
        right_ear_hz: t.right_ear_hz,
        description: t.description,
        pattern: t.pattern_id,
        spatial_settings: t.spatial_config
      }));
    
    case 'theta-creativity-toroidal-30min-3loop':
      return THETA_CREATIVITY_TOROIDAL.advanced_transitions.map(t => ({
        duration_minutes: t.duration_minutes,
        frequency_hz: t.frequency_hz,
        frequency_type: t.frequency_type,
        left_ear_hz: t.left_ear_hz,
        right_ear_hz: t.right_ear_hz,
        description: t.description,
        pattern: t.pattern_id,
        spatial_settings: t.spatial_config
      }));
    
    case 'alpha-focus-toroidal-25min-maintenance':
      return ALPHA_FOCUS_TOROIDAL.advanced_transitions.map(t => ({
        duration_minutes: t.duration_minutes,
        frequency_hz: t.frequency_hz,
        frequency_type: t.frequency_type,
        left_ear_hz: t.left_ear_hz,
        right_ear_hz: t.right_ear_hz,
        description: t.description,
        pattern: t.pattern_id,
        spatial_settings: t.spatial_config
      }));
    
    case 'custom-complex-obe-protocol-95min':
      return [
        {
          duration_minutes: 25,
          frequency_hz: 40,
          frequency_type: 'Gamma',
          left_ear_hz: 95,
          right_ear_hz: 135,
          description: '⚡ Stage 1: Gamma Maximum Resonance (40Hz) - Toroidal pattern, 8D spatial heavy',
          pattern: 'toroidal-max-resonance',
          spatial_settings: {
            enabled: true,
            hrtf: true,
            roomSize: 0.9,
            reverbAmount: 0.8,
            spatialWidth: 0.9,
            elevation: 0.5,
            azimuth: 0,
            movement_speed: 0.8,
            spatial_intensity: 0.8,
            reverberance: 0.7,
            room_scale: 0.9,
            hf_damping: 0.3,
            pattern: '8d-heavy'
          }
        },
        {
          duration_minutes: 25,
          frequency_hz: 134.5,
          frequency_type: 'Theta',
          left_ear_hz: 133,
          right_ear_hz: 136,
          description: '🌀 Stage 2: Theta Vortex Flow (134.5Hz avg) - Vortex pattern, 8D spatial medium',
          pattern: 'vortex-focus-enhancement',
          spatial_settings: {
            enabled: true,
            hrtf: true,
            roomSize: 0.7,
            reverbAmount: 0.6,
            spatialWidth: 0.7,
            elevation: 0.4,
            azimuth: 0.2,
            movement_speed: 0.6,
            spatial_intensity: 0.6,
            reverberance: 0.5,
            room_scale: 0.7,
            hf_damping: 0.4,
            pattern: '8d-medium'
          }
        },
        {
          duration_minutes: 5,
          frequency_hz: 20,
          frequency_type: 'Beta',
          left_ear_hz: 440,
          right_ear_hz: 460,
          description: '🌀 Stage 3: Beta Pre-Lucid + Transformation (20Hz) - Spiral pattern for consciousness shift',
          pattern: 'spiral-transformation',
          spatial_settings: {
            enabled: true,
            hrtf: true,
            roomSize: 0.5,
            reverbAmount: 0.4,
            spatialWidth: 0.5,
            elevation: 0.3,
            azimuth: 0.1,
            movement_speed: 0.4,
            spatial_intensity: 0.7,
            reverberance: 0.6,
            room_scale: 0.8,
            hf_damping: 0.2,
            pattern: 'dna-healing'
          }
        },
        {
          duration_minutes: 20,
          frequency_hz: 133.05,
          frequency_type: 'Delta',
          left_ear_hz: 133,
          right_ear_hz: 133.1,
          description: '💤 Stage 4: Delta DNA Restoration (133.05Hz) - Deep healing, 8D spatial heavy',
          pattern: 'helix-dna-activation',
          spatial_settings: {
            enabled: true,
            hrtf: true,
            roomSize: 0.9,
            reverbAmount: 0.9,
            spatialWidth: 0.9,
            elevation: 0.6,
            azimuth: 0,
            movement_speed: 0.2,
            spatial_intensity: 0.9,
            reverberance: 0.8,
            room_scale: 1.0,
            hf_damping: 0.1,
            pattern: '8d-heavy'
          }
        }
      ];
    
    default:
      return [
        {
          duration_minutes: 10,
          frequency_hz: 10,
          frequency_type: 'Alpha',
          left_ear_hz: 440,
          right_ear_hz: 450,
          description: 'Default session'
        }
      ];
  }
};