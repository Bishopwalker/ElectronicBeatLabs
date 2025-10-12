// Electromagnetic Beat Lab - Complex OBE Protocol (Out-of-Body Experience)
// Multi-stage journey through Gamma→Theta→Beta→Delta with DNA healing and 8D spatial patterns

import type { ComprehensiveTimerPreset } from './comprehensiveTimerTemplate';

// ==================================================================
// COMPLEX OBE PROTOCOL - 75 MINUTES WITH INFINITE LOOP
// ==================================================================

export const COMPLEX_OBE_PROTOCOL: ComprehensiveTimerPreset = {
  // Basic info
  id: 'complex-obe-protocol-75min-loop',
  name: '🌀 Complex OBE Protocol - 75min + Loop',
  description: 'Multi-stage consciousness journey: Gamma Maximum Resonance → Theta Vortex → Beta Transformation → Delta DNA Healing with 8D spatial patterns and infinite loop option',
  total_duration: 75,
  transitions_count: 4,
  tags: ['obe', 'astral', 'gamma', 'theta', 'beta', 'delta', 'dna-healing', '8d-spatial', 'consciousness-expansion'],
  is_premium: true,
  available: true,

  // Loop configuration - infinite OBE practice sessions
  loop_enabled: true,
  loop_count: 0, // 0 = infinite
  loop_phase: 'full',

  categories: ['obe', 'astral-projection', 'consciousness', 'advanced', 'dna-healing'],
  difficulty_level: 'expert',
  target_states: ['out-of-body experience', 'astral projection', 'consciousness expansion', 'dna activation', 'gamma consciousness'],
  contraindications: ['epilepsy', 'seizure disorders', 'severe mental health conditions', 'heart conditions'],

  // Enhanced loop configuration
  loop_config: {
    enabled: true,
    type: 'infinite',
    loop_scope: 'full_preset',
    fade_between_loops: true,
    loop_transition_seconds: 90
  },

  // Advanced frequency transitions
  advanced_transitions: [
    {
      // Phase 1: Gamma Maximum Resonance
      duration_minutes: 25,
      frequency_hz: 40,
      frequency_type: 'Gamma',
      left_ear_hz: 95,
      right_ear_hz: 135,
      description: '⚡ Stage 1: Gamma Maximum Resonance (40Hz) - Consciousness Expansion with Toroidal Field',

      pattern_id: 'toroidal-max-resonance',

      waveform: {
        start: 'sine',
        end: 'triangle',
        transition_type: 'smooth'
      },

      volume_envelope: {
        fade_in_seconds: 120,
        sustain_level: 0.6,
        fade_out_seconds: 45
      },

      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.9,
        reverbAmount: 0.8,
        spatialWidth: 0.9,
        elevation: 0.5,
        azimuth: 0,
        movement_speed: 0.08,
        spatial_intensity: 0.8,
        reverberance: 0.7,
        room_scale: 0.9,
        hf_damping: 0.3
      },

      pattern_8d: '8d-heavy-toroidal',

      electromagnetic_targets: {
        strength: 0.9,
        coherence: 0.9,
        resonance: 0.9,
        stability: 0.8
      },

      visualization_style: {
        color_scheme: 'gamma-toroidal-violet',
        intensity: 0.9,
        animation_speed: 0.8,
        effects: ['maximum-toroidal-resonance', 'gamma-consciousness-expansion', 'obe-preparation', '8d-heavy-spatial']
      }
    },

    {
      // Phase 2: Theta Vortex Flow
      duration_minutes: 25,
      frequency_hz: 30,
      frequency_type: 'Theta',
      left_ear_hz: 133,
      right_ear_hz: 163,
      description: '🌀 Stage 2: Theta Vortex Flow (30Hz) - Deep Consciousness Gateway with Vortex Pattern',

      pattern_id: 'vortex-focus-enhancement',

      waveform: {
        start: 'triangle',
        end: 'sine',
        transition_type: 'smooth'
      },

      volume_envelope: {
        fade_in_seconds: 60,
        sustain_level: 0.65,
        fade_out_seconds: 30
      },

      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.7,
        reverbAmount: 0.6,
        spatialWidth: 0.7,
        elevation: 0.4,
        azimuth: 0.2,
        movement_speed: 0.06,
        spatial_intensity: 0.6,
        reverberance: 0.5,
        room_scale: 0.7,
        hf_damping: 0.4
      },

      pattern_8d: '8d-medium-vortex',

      electromagnetic_targets: {
        strength: 0.8,
        coherence: 0.85,
        resonance: 0.8,
        stability: 0.85
      },

      visualization_style: {
        color_scheme: 'theta-vortex-aqua',
        intensity: 0.8,
        animation_speed: 0.6,
        effects: ['vortex-consciousness-flow', 'theta-gateway-opening', 'obe-deepening', '8d-medium-spatial']
      }
    },

    {
      // Phase 3: Beta Transformation
      duration_minutes: 5,
      frequency_hz: 20,
      frequency_type: 'Beta',
      left_ear_hz: 114,
      right_ear_hz: 134,
      description: '🔄 Stage 3: Beta Transformation (20Hz) - Consciousness Shift with Spiral Pattern',

      pattern_id: 'spiral-transformation',

      waveform: {
        start: 'sine',
        end: 'sine',
        transition_type: 'smooth'
      },

      volume_envelope: {
        fade_in_seconds: 30,
        sustain_level: 0.7,
        fade_out_seconds: 20
      },

      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.5,
        reverbAmount: 0.4,
        spatialWidth: 0.5,
        elevation: 0.3,
        azimuth: 0.1,
        movement_speed: 0.04,
        spatial_intensity: 0.7,
        reverberance: 0.6,
        room_scale: 0.8,
        hf_damping: 0.2
      },

      pattern_8d: 'spiral-consciousness-shift',

      electromagnetic_targets: {
        strength: 0.75,
        coherence: 0.8,
        resonance: 0.75,
        stability: 0.8
      },

      visualization_style: {
        color_scheme: 'beta-transformation-gold',
        intensity: 0.7,
        animation_speed: 0.4,
        effects: ['spiral-transformation', 'consciousness-shift', 'obe-transition', 'dna-preparation']
      }
    },

    {
      // Phase 4: Delta DNA Restoration
      duration_minutes: 20,
      frequency_hz: 0.1,
      frequency_type: 'Delta',
      left_ear_hz: 133,
      right_ear_hz: 133.1,
      description: '💎 Stage 4: Delta DNA Restoration (0.1Hz) - Deep Healing with Helix Pattern',

      pattern_id: 'helix-dna-activation',

      waveform: {
        start: 'sine',
        end: 'sine',
        transition_type: 'smooth'
      },

      volume_envelope: {
        fade_in_seconds: 45,
        sustain_level: 0.7,
        fade_out_seconds: 120
      },

      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.9,
        reverbAmount: 0.9,
        spatialWidth: 0.9,
        elevation: 0.6,
        azimuth: 0,
        movement_speed: 0.02,
        spatial_intensity: 0.9,
        reverberance: 0.8,
        room_scale: 1.0,
        hf_damping: 0.1
      },

      pattern_8d: '8d-heavy-helix-dna',

      electromagnetic_targets: {
        strength: 1.0,
        coherence: 0.95,
        resonance: 1.0,
        stability: 0.95
      },

      visualization_style: {
        color_scheme: 'delta-dna-emerald',
        intensity: 1.0,
        animation_speed: 0.2,
        effects: [
          'helix-dna-activation',
          'delta-deep-healing',
          'cellular-regeneration-peak',
          'obe-completion',
          '8d-heavy-spatial',
          'dna-repair-mastery'
        ]
      }
    }
  ],

  // Pattern progression
  pattern_progression: [
    {
      start_time_minutes: 0,
      end_time_minutes: 25,
      pattern_config: {
        id: 'gamma-toroidal-obe-activation',
        name: 'Gamma Toroidal OBE Activation',
        type: 'toroidal',
        description: 'Maximum Resonance Toroidal at 40Hz Gamma for consciousness expansion and OBE preparation',
        instructions: 'Visualize your consciousness expanding beyond physical boundaries as the toroidal field activates',
        benefits: ['Consciousness expansion', 'Gamma activation', 'OBE preparation', 'Maximum toroidal resonance', '8D spatial immersion'],
        frequencies: {
          carrier: 115,
          beat: 40,
          range: 'gamma'
        },
        duration: 25,
        electromagnetic: {
          fieldStrength: 0.9,
          resonanceFreq: 40,
          coherence: 0.9
        },
        visualization: {
          color: '#9400D3',
          intensity: 0.9,
          pattern: 'toroidal-consciousness-expansion'
        }
      },
      transition_duration_seconds: 120,
      transition_type: 'smooth'
    },
    {
      start_time_minutes: 25,
      end_time_minutes: 50,
      pattern_config: {
        id: 'theta-vortex-obe-gateway',
        name: 'Theta Vortex OBE Gateway',
        type: 'vortex',
        description: 'Vortex pattern at 30Hz Theta for deep consciousness gateway and OBE deepening',
        instructions: 'Allow your consciousness to flow through the vortex gateway into deeper states',
        benefits: ['Deep consciousness access', 'Theta gateway opening', 'OBE deepening', 'Vortex consciousness flow'],
        frequencies: {
          carrier: 148,
          beat: 30,
          range: 'gamma'
        },
        duration: 25,
        electromagnetic: {
          fieldStrength: 0.8,
          resonanceFreq: 30,
          coherence: 0.85
        },
        visualization: {
          color: '#00CED1',
          intensity: 0.8,
          pattern: 'vortex-consciousness-flow'
        }
      },
      transition_duration_seconds: 60,
      transition_type: 'smooth'
    },
    {
      start_time_minutes: 50,
      end_time_minutes: 55,
      pattern_config: {
        id: 'beta-spiral-transformation',
        name: 'Beta Spiral Consciousness Transformation',
        type: 'spiral',
        description: 'Spiral transformation at 20Hz Beta for consciousness shift and OBE transition',
        instructions: 'Feel your consciousness spiraling through dimensional boundaries',
        benefits: ['Consciousness transformation', 'Beta shift', 'OBE transition', 'DNA preparation', 'Spiral pattern mastery'],
        frequencies: {
          carrier: 124,
          beat: 20,
          range: 'beta'
        },
        duration: 5,
        electromagnetic: {
          fieldStrength: 0.75,
          resonanceFreq: 20,
          coherence: 0.8
        },
        visualization: {
          color: '#FFD700',
          intensity: 0.7,
          pattern: 'spiral-transformation'
        }
      },
      transition_duration_seconds: 30,
      transition_type: 'smooth'
    },
    {
      start_time_minutes: 55,
      end_time_minutes: 75,
      pattern_config: {
        id: 'delta-helix-dna-mastery',
        name: 'Delta Helix DNA Restoration Mastery',
        type: 'helix',
        description: 'Helix DNA pattern at 0.1Hz Delta for ultimate healing and OBE completion',
        instructions: 'Experience deep DNA healing and cellular restoration as your consciousness integrates the OBE journey',
        benefits: ['DNA activation', 'Deep delta healing', 'Cellular regeneration peak', 'OBE integration', 'Helix pattern mastery'],
        frequencies: {
          carrier: 133.05,
          beat: 0.1,
          range: 'delta'
        },
        duration: 20,
        electromagnetic: {
          fieldStrength: 1.0,
          resonanceFreq: 0.1,
          coherence: 0.95
        },
        visualization: {
          color: '#228B22',
          intensity: 1.0,
          pattern: 'helix-dna-peak'
        }
      },
      transition_duration_seconds: 120,
      transition_type: 'smooth'
    }
  ],

  // 8D Spatial configuration for OBE
  spatial_8d_config: {
    enabled: true,
    movement_progression: [
      {
        start_time_minutes: 0,
        pattern_type: 'spiral',
        speed: 0.08,
        radius: 100,
        elevation_range: [-30, 30],
        direction: 'clockwise'
      },
      {
        start_time_minutes: 25,
        pattern_type: 'figure8',
        speed: 0.06,
        radius: 90,
        elevation_range: [-25, 25],
        direction: 'alternating'
      },
      {
        start_time_minutes: 50,
        pattern_type: 'spiral',
        speed: 0.04,
        radius: 70,
        elevation_range: [-20, 20],
        direction: 'counterclockwise'
      },
      {
        start_time_minutes: 55,
        pattern_type: 'circular',
        speed: 0.02,
        radius: 120,
        elevation_range: [-35, 35],
        direction: 'clockwise'
      }
    ],
    hrtf_enabled: true,
    room_acoustics: {
      size: 'large',
      reverb: 0.8,
      absorption: 0.1
    },
    distance_modulation: {
      min_distance: 40,
      max_distance: 150,
      modulation_speed: 0.015
    }
  },

  electromagnetic_progression: [
    {
      start_time_minutes: 0,
      end_time_minutes: 25,
      field_state: 'ACTIVE',
      strength: 0.9,
      coherence: 0.9,
      resonance: 0.9,
      stability: 0.8,
      transition_type: 'exponential'
    },
    {
      start_time_minutes: 25,
      end_time_minutes: 50,
      field_state: 'RESONANT',
      strength: 0.8,
      coherence: 0.85,
      resonance: 0.8,
      stability: 0.85,
      transition_type: 'smooth'
    },
    {
      start_time_minutes: 50,
      end_time_minutes: 55,
      field_state: 'ACTIVE',
      strength: 0.75,
      coherence: 0.8,
      resonance: 0.75,
      stability: 0.8,
      transition_type: 'smooth'
    },
    {
      start_time_minutes: 55,
      end_time_minutes: 75,
      field_state: 'CRITICAL',
      strength: 1.0,
      coherence: 0.95,
      resonance: 1.0,
      stability: 0.95,
      transition_type: 'smooth'
    }
  ],

  visualization_progression: [
    {
      start_time_minutes: 0,
      end_time_minutes: 25,
      color_scheme: 'gamma-toroidal-violet',
      intensity: 0.9,
      animation_speed: 0.8,
      effects: ['maximum-toroidal-resonance', 'gamma-consciousness-expansion', 'obe-preparation', '8d-heavy-spatial'],
      particle_density: 0.9,
      glow_radius: 80
    },
    {
      start_time_minutes: 25,
      end_time_minutes: 50,
      color_scheme: 'theta-vortex-aqua',
      intensity: 0.8,
      animation_speed: 0.6,
      effects: ['vortex-consciousness-flow', 'theta-gateway-opening', 'obe-deepening', '8d-medium-spatial'],
      particle_density: 0.8,
      glow_radius: 70
    },
    {
      start_time_minutes: 50,
      end_time_minutes: 55,
      color_scheme: 'beta-transformation-gold',
      intensity: 0.7,
      animation_speed: 0.4,
      effects: ['spiral-transformation', 'consciousness-shift', 'obe-transition', 'dna-preparation'],
      particle_density: 0.7,
      glow_radius: 60
    },
    {
      start_time_minutes: 55,
      end_time_minutes: 75,
      color_scheme: 'delta-dna-emerald',
      intensity: 1.0,
      animation_speed: 0.2,
      effects: ['helix-dna-activation', 'delta-deep-healing', 'cellular-regeneration-peak', 'obe-completion', '8d-heavy-spatial', 'dna-repair-mastery'],
      particle_density: 1.0,
      glow_radius: 90
    }
  ],

  preparation: {
    duration_minutes: 10,
    instructions: [
      'Lie down in a comfortable position where you will not be disturbed',
      'Set clear intention for out-of-body experience and consciousness exploration',
      'Visualize protective golden light surrounding your physical body',
      'Relax deeply and prepare for a profound consciousness journey',
      'Know that you are safe and can return to your body at any time',
      'Release all fear and embrace the adventure ahead'
    ],
    breathing_pattern: {
      inhale_seconds: 4,
      hold_seconds: 7,
      exhale_seconds: 8,
      cycles: 10
    },
    affirmations: [
      'I am safe to explore beyond my physical body',
      'My consciousness expands freely and returns easily',
      'I am protected and guided throughout this journey',
      'I am ready for profound consciousness expansion',
      'My DNA activates and heals through this experience'
    ]
  },

  integration: {
    duration_minutes: 10,
    instructions: [
      'Slowly become aware of your physical body and breathing',
      'Move fingers and toes gently before opening eyes',
      'Journal your experience immediately while fresh in memory',
      'Ground yourself by touching the earth or drinking water',
      'Honor the experience and insights received',
      'Use loop function for extended OBE practice sessions',
      'Rest and integrate before returning to normal activities'
    ],
    affirmations: [
      'I integrate this consciousness expansion fully and safely',
      'I remember and understand my OBE experience',
      'I am grounded, centered, and fully present in my body',
      'This experience serves my highest growth and evolution'
    ]
  }
};

// ==================================================================
// EXPORT
// ==================================================================

export const COMPLEX_OBE_PRESETS = [
  COMPLEX_OBE_PROTOCOL
];
