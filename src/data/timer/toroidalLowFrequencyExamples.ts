// Electromagnetic Beat Lab - Toroidal Pattern at Low Frequencies + Loop Examples
// Demonstrates Maximum Resonance Toroidal pattern at various frequencies with loop functionality

import type { ComprehensiveTimerPreset } from './comprehensiveTimerTemplate';

// ==================================================================
// DELTA HEALING TOROIDAL - 45 MINUTES WITH INFINITE LOOP
// ==================================================================

export const DELTA_HEALING_TOROIDAL: ComprehensiveTimerPreset = {
  // Basic info
  id: 'delta-healing-toroidal-45min-loop',
  name: '🌿 Delta Healing Toroidal - 45min + Loop',
  description: 'Maximum Resonance Toroidal pattern at 2Hz Delta frequency for deep healing with infinite loop option',
  total_duration: 45,
  transitions_count: 3,
  tags: ['healing', 'delta', 'toroidal', 'loop', 'regeneration'],
  is_premium: true,
  available: true,
  
  // Loop configuration - infinite healing sessions
  loop_enabled: true,
  loop_count: 0, // 0 = infinite
  loop_phase: 'full',
  
  categories: ['healing', 'meditation', 'sleep', 'regeneration'],
  difficulty_level: 'intermediate',
  target_states: ['deep healing', 'cellular regeneration', 'delta consciousness', 'energy restoration'],
  contraindications: ['heart conditions', 'pacemaker', 'active medical treatment'],
  
  // Enhanced loop configuration
  loop_config: {
    enabled: true,
    type: 'infinite',
    loop_scope: 'full_preset',
    fade_between_loops: true,
    loop_transition_seconds: 60
  },
  
  // Advanced frequency transitions
  advanced_transitions: [
    {
      // Phase 1: Alpha Preparation
      duration_minutes: 10,
      frequency_hz: 8,
      frequency_type: 'Alpha',
      left_ear_hz: 144,
      right_ear_hz: 150,
      description: '🧘 Phase 1: Alpha Preparation (8Hz) - Toroidal Field Activation',
      
      pattern_id: 'toroidal-max-resonance',
      
      waveform: {
        start: 'sine',
        end: 'sine',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 60,
        sustain_level: 0.4,
        fade_out_seconds: 30
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.6,
        reverbAmount: 0.3,
        spatialWidth: 0.8,
        elevation: 0,
        azimuth: 0,
        movement_speed: 0.02,
        spatial_intensity: 0.5
      },
      
      pattern_8d: 'alpha-toroidal-prep',
      
      electromagnetic_targets: {
        strength: 0.6,
        coherence: 0.7,
        resonance: 0.6,
        stability: 0.8
      },
      
      visualization_style: {
        color_scheme: 'alpha-toroidal-gold',
        intensity: 0.6,
        animation_speed: 0.4,
        effects: ['toroidal-field', 'gentle-healing-glow', 'alpha-preparation']
      }
    },
    
    {
      // Phase 2: Theta Gateway
      duration_minutes: 15,
      frequency_hz: 4,
      frequency_type: 'Theta',
      left_ear_hz: 144,
      right_ear_hz: 148,
      description: '✨ Phase 2: Theta Gateway (4Hz) - Maximum Resonance Toroidal Healing',
      
      pattern_id: 'toroidal-max-resonance',
      
      waveform: {
        start: 'sine',
        end: 'sine',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 45,
        sustain_level: 0.5,
        fade_out_seconds: 30
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.8,
        reverbAmount: 0.5,
        spatialWidth: 1.0,
        elevation: 0.1,
        azimuth: 0,
        movement_speed: 0.03,
        spatial_intensity: 0.7,
        reverberance: 0.6
      },
      
      pattern_8d: 'theta-toroidal-healing',
      
      electromagnetic_targets: {
        strength: 0.8,
        coherence: 0.9,
        resonance: 0.8,
        stability: 0.9
      },
      
      visualization_style: {
        color_scheme: 'theta-toroidal-emerald',
        intensity: 0.8,
        animation_speed: 0.3,
        effects: ['maximum-toroidal-resonance', 'theta-healing-field', 'cellular-regeneration', 'energy-flow']
      }
    },
    
    {
      // Phase 3: Deep Delta Healing - MAXIMUM RESONANCE TOROIDAL AT 2Hz!
      duration_minutes: 20,
      frequency_hz: 2,
      frequency_type: 'Delta',
      left_ear_hz: 144,
      right_ear_hz: 146,
      description: '💎 Phase 3: Deep Delta (2Hz) - MAXIMUM RESONANCE TOROIDAL - Ultimate Healing',
      
      pattern_id: 'toroidal-max-resonance', // ✅ TOROIDAL AT LOW FREQUENCY!
      
      waveform: {
        start: 'sine',
        end: 'sine',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 60,
        sustain_level: 0.6,
        fade_out_seconds: 90
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 1.0,
        reverbAmount: 0.7,
        spatialWidth: 1.2,
        elevation: 0.2,
        azimuth: 0,
        movement_speed: 0.015, // Very slow for delta
        spatial_intensity: 0.9,
        reverberance: 0.8,
        room_scale: 1.5
      },
      
      pattern_8d: 'delta-toroidal-mastery',
      
      electromagnetic_targets: {
        strength: 1.0, // MAXIMUM field strength at 2Hz
        coherence: 0.95,
        resonance: 1.0,
        stability: 0.95
      },
      
      visualization_style: {
        color_scheme: 'delta-toroidal-deep-emerald',
        intensity: 1.0,
        animation_speed: 0.2,
        effects: [
          'maximum-toroidal-resonance', 
          'delta-healing-mastery', 
          'cellular-regeneration-peak',
          'energy-restoration-complete',
          'dna-repair-activation'
        ]
      }
    }
  ],
  
  // Pattern progression
  pattern_progression: [
    {
      start_time_minutes: 0,
      end_time_minutes: 10,
      pattern_config: {
        id: 'toroidal-alpha-healing-prep',
        name: 'Alpha Toroidal Healing Preparation',
        type: 'toroidal',
        description: 'Maximum Resonance Toroidal pattern at 8Hz Alpha for healing field activation',
        instructions: 'Relax deeply and visualize golden toroidal field activating around your body',
        benefits: ['Healing field activation', 'Alpha relaxation', 'Energy preparation', 'Toroidal resonance initiation'],
        frequencies: {
          carrier: 144,
          beat: 8,
          range: 'alpha'
        },
        duration: 10,
        electromagnetic: {
          fieldStrength: 0.6,
          resonanceFreq: 8,
          coherence: 0.7
        },
        visualization: {
          color: '#FFD700',
          intensity: 0.6,
          pattern: 'toroidal-activation'
        }
      },
      transition_duration_seconds: 60,
      transition_type: 'crossfade'
    },
    {
      start_time_minutes: 10,
      end_time_minutes: 25,
      pattern_config: {
        id: 'toroidal-theta-healing-gateway',
        name: 'Theta Toroidal Healing Gateway',
        type: 'toroidal',
        description: 'Maximum Resonance Toroidal at 4Hz Theta for deep healing and cellular regeneration',
        instructions: 'Enter deep meditative state as toroidal healing field intensifies',
        benefits: ['Deep healing activation', 'Theta consciousness', 'Cellular regeneration', 'Maximum toroidal resonance'],
        frequencies: {
          carrier: 144,
          beat: 4,
          range: 'theta'
        },
        duration: 15,
        electromagnetic: {
          fieldStrength: 0.8,
          resonanceFreq: 4,
          coherence: 0.9
        },
        visualization: {
          color: '#50C878',
          intensity: 0.8,
          pattern: 'toroidal-healing-flow'
        }
      },
      transition_duration_seconds: 45,
      transition_type: 'smooth'
    },
    {
      start_time_minutes: 25,
      end_time_minutes: 45,
      pattern_config: {
        id: 'toroidal-delta-healing-mastery',
        name: 'Deep Delta Toroidal Healing Mastery',
        type: 'toroidal',
        description: 'Maximum Resonance Toroidal at 2Hz Delta - ultimate healing frequency with maximum field strength',
        instructions: 'Surrender to the deepest healing state as toroidal field reaches maximum power',
        benefits: ['Ultimate healing mastery', 'Deep delta consciousness', 'DNA repair activation', 'Complete energy restoration', 'Maximum toroidal resonance'],
        frequencies: {
          carrier: 144,
          beat: 2,
          range: 'delta'
        },
        duration: 20,
        electromagnetic: {
          fieldStrength: 1.0,
          resonanceFreq: 2,
          coherence: 0.95
        },
        visualization: {
          color: '#1B4D3E',
          intensity: 1.0,
          pattern: 'toroidal-healing-peak'
        }
      },
      transition_duration_seconds: 60,
      transition_type: 'smooth'
    }
  ],
  
  // 8D Spatial configuration for healing
  spatial_8d_config: {
    enabled: true,
    movement_progression: [
      {
        start_time_minutes: 0,
        pattern_type: 'circular',
        speed: 0.02,
        radius: 60,
        elevation_range: [0, 0],
        direction: 'clockwise'
      },
      {
        start_time_minutes: 10,
        pattern_type: 'spiral',
        speed: 0.03,
        radius: 80,
        elevation_range: [-15, 15],
        direction: 'clockwise'
      },
      {
        start_time_minutes: 25,
        pattern_type: 'circular',
        speed: 0.015,
        radius: 100,
        elevation_range: [-20, 20],
        direction: 'counterclockwise'
      }
    ],
    hrtf_enabled: true,
    room_acoustics: {
      size: 'large',
      reverb: 0.6,
      absorption: 0.2
    },
    distance_modulation: {
      min_distance: 30,
      max_distance: 120,
      modulation_speed: 0.01
    }
  },

  electromagnetic_progression: [
    {
      timestamp_minutes: 0,
      field_config: {
        strength: 0.6,
        frequency: 8,
        phase: 0,
        coherence: 0.7,
        resonance: 0.6,
        state: 'CHARGING',
        stability: 0.8
      },
      transition_duration_seconds: 60,
      resonance_targets: {
        brain_waves: 'alpha',
        healing_frequency: 8
      }
    },
    {
      timestamp_minutes: 10,
      field_config: {
        strength: 0.8,
        frequency: 4,
        phase: 90,
        coherence: 0.9,
        resonance: 0.8,
        state: 'ACTIVE',
        stability: 0.9
      },
      transition_duration_seconds: 45,
      resonance_targets: {
        brain_waves: 'theta',
        healing_frequency: 4
      }
    },
    {
      timestamp_minutes: 25,
      field_config: {
        strength: 1.0,
        frequency: 2,
        phase: 180,
        coherence: 0.95,
        resonance: 1.0,
        state: 'RESONANT',
        stability: 0.95
      },
      transition_duration_seconds: 60,
      resonance_targets: {
        brain_waves: 'delta',
        healing_frequency: 2
      }
    }
  ],
  visualization_progression: [
    {
      timestamp_minutes: 0,
      settings: {
        starField: {
          density: 80,
          speed: 0.5,
          color: '#FFD700',
          twinkle: true
        },
        spatial: {
          gridSize: 40,
          opacity: 0.3,
          color: '#FFD700',
          animation: true
        },
        frequency: {
          bars: 32,
          sensitivity: 0.8,
          color: '#FDD835',
          glow: true
        }
      },
      transition_duration_seconds: 60,
      special_effects: {
        particle_burst: false,
        color_cycling: false,
        mandala_overlay: false,
        fractal_zoom: false
      }
    },
    {
      timestamp_minutes: 10,
      settings: {
        starField: {
          density: 120,
          speed: 0.8,
          color: '#50C878',
          twinkle: true
        },
        spatial: {
          gridSize: 60,
          opacity: 0.5,
          color: '#50C878',
          animation: true
        },
        frequency: {
          bars: 64,
          sensitivity: 1.2,
          color: '#66CDAA',
          glow: true
        }
      },
      transition_duration_seconds: 45,
      special_effects: {
        particle_burst: true,
        color_cycling: true,
        mandala_overlay: true,
        fractal_zoom: false
      }
    },
    {
      timestamp_minutes: 25,
      settings: {
        starField: {
          density: 150,
          speed: 1.0,
          color: '#1B4D3E',
          twinkle: true
        },
        spatial: {
          gridSize: 80,
          opacity: 0.7,
          color: '#1B4D3E',
          animation: true
        },
        frequency: {
          bars: 128,
          sensitivity: 1.5,
          color: '#228B22',
          glow: true
        }
      },
      transition_duration_seconds: 60,
      special_effects: {
        particle_burst: true,
        color_cycling: true,
        mandala_overlay: true,
        fractal_zoom: true
      }
    }
  ],

  preparation: {
    duration_minutes: 5,
    instructions: [
      'Lie down comfortably in a quiet space',
      'Set healing intention for your body and energy field',
      'Visualize a golden toroidal field around your body',
      'Allow the Maximum Resonance Toroidal pattern to activate healing'
    ],
    breathing_pattern: {
      inhale_seconds: 4,
      hold_seconds: 4,
      exhale_seconds: 6,
      cycles: 8
    },
    affirmations: [
      'Every cell in my body vibrates with perfect health',
      'The toroidal field restores my optimal energy',
      'I am completely healed and restored'
    ]
  },
  
  integration: {
    duration_minutes: 5,
    instructions: [
      'Feel the healing energy integrated throughout your being',
      'Notice the subtle energy shifts in your body',
      'Set intention for continued healing throughout the day',
      'When looped, allow the session to continue for extended healing'
    ],
    affirmations: [
      'Healing energy continues to work throughout my being',
      'I am restored to perfect health and vitality'
    ]
  }
};

// ==================================================================
// THETA CREATIVITY TOROIDAL - 30 MINUTES WITH 3-LOOP COUNT
// ==================================================================

export const THETA_CREATIVITY_TOROIDAL: ComprehensiveTimerPreset = {
  // Basic info
  id: 'theta-creativity-toroidal-30min-3loop',
  name: '🎨 Theta Creativity Toroidal - 30min × 3',
  description: 'Maximum Resonance Toroidal at 6Hz Theta for enhanced creativity - loops 3 times for sustained creative flow',
  total_duration: 30,
  transitions_count: 2,
  tags: ['creativity', 'theta', 'toroidal', 'inspiration', '3-loop'],
  is_premium: true,
  available: true,
  
  // Loop configuration - 3 cycles for creativity sessions
  loop_enabled: true,
  loop_count: 3,
  loop_phase: 'full',
  
  categories: ['creativity', 'inspiration', 'theta', 'artistic'],
  difficulty_level: 'beginner',
  target_states: ['creative flow', 'artistic inspiration', 'theta consciousness', 'innovative thinking'],
  
  // Enhanced loop configuration
  loop_config: {
    enabled: true,
    type: 'count',
    count: 3,
    loop_scope: 'full_preset',
    fade_between_loops: true,
    loop_transition_seconds: 45
  },
  
  // Advanced frequency transitions
  advanced_transitions: [
    {
      // Phase 1: Alpha Creative Preparation
      duration_minutes: 10,
      frequency_hz: 10,
      frequency_type: 'Alpha',
      left_ear_hz: 144,
      right_ear_hz: 150,
      description: '🌟 Phase 1: Alpha Creativity (10Hz) - Toroidal Field Inspiration',
      
      pattern_id: 'toroidal-max-resonance',
      
      waveform: {
        start: 'sine',
        end: 'sine',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 45,
        sustain_level: 0.5,
        fade_out_seconds: 20
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.5,
        reverbAmount: 0.3,
        spatialWidth: 0.9,
        elevation: 0.1,
        azimuth: 0,
        movement_speed: 0.04,
        spatial_intensity: 0.6
      },
      
      pattern_8d: 'alpha-creative-toroidal',
      
      electromagnetic_targets: {
        strength: 0.7,
        coherence: 0.8,
        resonance: 0.7,
        stability: 0.8
      },
      
      visualization_style: {
        color_scheme: 'alpha-creative-orange',
        intensity: 0.7,
        animation_speed: 0.5,
        effects: ['creative-toroidal-field', 'inspiration-flow', 'artistic-activation']
      }
    },
    
    {
      // Phase 2: Theta Creative Flow - MAXIMUM RESONANCE TOROIDAL AT 6Hz!
      duration_minutes: 20,
      frequency_hz: 6,
      frequency_type: 'Theta',
      left_ear_hz: 144,
      right_ear_hz: 148,
      description: '🎨 Phase 2: Theta Creative Flow (6Hz) - MAXIMUM RESONANCE TOROIDAL - Pure Inspiration',
      
      pattern_id: 'toroidal-max-resonance', // ✅ TOROIDAL AT THETA FREQUENCY!
      
      waveform: {
        start: 'sine',
        end: 'triangle',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 30,
        sustain_level: 0.6,
        fade_out_seconds: 60
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.7,
        reverbAmount: 0.4,
        spatialWidth: 1.1,
        elevation: 0.2,
        azimuth: 0,
        movement_speed: 0.05,
        spatial_intensity: 0.8,
        reverberance: 0.5
      },
      
      pattern_8d: 'theta-creative-toroidal-mastery',
      
      electromagnetic_targets: {
        strength: 0.9, // High field strength for creativity
        coherence: 0.85,
        resonance: 0.9,
        stability: 0.8
      },
      
      visualization_style: {
        color_scheme: 'theta-creative-spectrum',
        intensity: 0.9,
        animation_speed: 0.6,
        effects: [
          'maximum-toroidal-resonance',
          'theta-creative-mastery',
          'inspiration-cascade',
          'artistic-vision-enhancement',
          'innovative-thinking-boost'
        ]
      }
    }
  ],

  pattern_progression: [
    {
      start_time_minutes: 0,
      end_time_minutes: 10,
      pattern_config: {
        id: 'toroidal-alpha-creative-prep',
        name: 'Alpha Creative Toroidal Activation',
        type: 'toroidal',
        description: 'Maximum Resonance Toroidal at 10Hz Alpha for creative field activation and inspiration',
        instructions: 'Open your mind to creative possibilities as the toroidal field activates',
        benefits: ['Creative activation', 'Alpha inspiration', 'Artistic readiness', 'Toroidal resonance preparation'],
        frequencies: {
          carrier: 144,
          beat: 10,
          range: 'alpha'
        },
        duration: 10,
        electromagnetic: {
          fieldStrength: 0.7,
          resonanceFreq: 10,
          coherence: 0.8
        },
        visualization: {
          color: '#FF8C00',
          intensity: 0.7,
          pattern: 'toroidal-creative-activation'
        }
      },
      transition_duration_seconds: 45,
      transition_type: 'smooth'
    },
    {
      start_time_minutes: 10,
      end_time_minutes: 30,
      pattern_config: {
        id: 'toroidal-theta-creative-mastery',
        name: 'Theta Creative Toroidal Flow',
        type: 'toroidal',
        description: 'Maximum Resonance Toroidal at 6Hz Theta - pure creative inspiration and artistic vision',
        instructions: 'Flow with unlimited creative inspiration as the toroidal field reaches peak resonance',
        benefits: ['Pure creative flow', 'Theta artistic mastery', 'Innovative thinking', 'Inspiration cascade', 'Maximum toroidal resonance'],
        frequencies: {
          carrier: 144,
          beat: 6,
          range: 'theta'
        },
        duration: 20,
        electromagnetic: {
          fieldStrength: 0.9,
          resonanceFreq: 6,
          coherence: 0.85
        },
        visualization: {
          color: '#9400D3',
          intensity: 0.9,
          pattern: 'toroidal-creative-peak'
        }
      },
      transition_duration_seconds: 30,
      transition_type: 'smooth'
    }
  ],
  spatial_8d_config: {
    enabled: true,
    movement_progression: [
      {
        start_time_minutes: 0,
        pattern_type: 'figure8',
        speed: 0.04,
        radius: 70,
        elevation_range: [-10, 10],
        direction: 'alternating'
      },
      {
        start_time_minutes: 10,
        pattern_type: 'spiral',
        speed: 0.05,
        radius: 90,
        elevation_range: [-25, 25],
        direction: 'clockwise'
      }
    ],
    hrtf_enabled: true,
    room_acoustics: {
      size: 'medium',
      reverb: 0.4,
      absorption: 0.3
    },
    distance_modulation: {
      min_distance: 20,
      max_distance: 80,
      modulation_speed: 0.02
    }
  },

  electromagnetic_progression: [
    {
      timestamp_minutes: 0,
      field_config: {
        strength: 0.7,
        frequency: 10,
        phase: 0,
        coherence: 0.8,
        resonance: 0.7,
        state: 'CHARGING',
        stability: 0.8
      },
      transition_duration_seconds: 45,
      resonance_targets: {
        brain_waves: 'alpha',
        healing_frequency: 10
      }
    },
    {
      timestamp_minutes: 10,
      field_config: {
        strength: 0.9,
        frequency: 6,
        phase: 90,
        coherence: 0.85,
        resonance: 0.9,
        state: 'ACTIVE',
        stability: 0.8
      },
      transition_duration_seconds: 30,
      resonance_targets: {
        brain_waves: 'theta',
        healing_frequency: 6
      }
    }
  ],
  visualization_progression: [
    {
      timestamp_minutes: 0,
      settings: {
        starField: {
          density: 90,
          speed: 1.0,
          color: '#FF8C00',
          twinkle: true
        },
        spatial: {
          gridSize: 50,
          opacity: 0.4,
          color: '#FFA500',
          animation: true
        },
        frequency: {
          bars: 48,
          sensitivity: 1.0,
          color: '#FFB74D',
          glow: true
        }
      },
      transition_duration_seconds: 45,
      special_effects: {
        particle_burst: false,
        color_cycling: true,
        mandala_overlay: false,
        fractal_zoom: false
      }
    },
    {
      timestamp_minutes: 10,
      settings: {
        starField: {
          density: 140,
          speed: 1.5,
          color: '#9400D3',
          twinkle: true
        },
        spatial: {
          gridSize: 70,
          opacity: 0.6,
          color: '#BA68C8',
          animation: true
        },
        frequency: {
          bars: 96,
          sensitivity: 1.5,
          color: '#E1BEE7',
          glow: true
        }
      },
      transition_duration_seconds: 30,
      special_effects: {
        particle_burst: true,
        color_cycling: true,
        mandala_overlay: true,
        fractal_zoom: true
      }
    }
  ],

  preparation: {
    duration_minutes: 3,
    instructions: [
      'Sit comfortably with creative materials nearby',
      'Set intention for creative breakthrough and inspiration',
      'Visualize a vibrant toroidal field of creative energy',
      'Open your mind to receive artistic insights'
    ],
    breathing_pattern: {
      inhale_seconds: 3,
      hold_seconds: 3,
      exhale_seconds: 4,
      cycles: 6
    },
    affirmations: [
      'I am a channel for unlimited creativity',
      'Inspiration flows through me effortlessly',
      'The toroidal field amplifies my creative genius'
    ]
  },
  
  integration: {
    duration_minutes: 3,
    instructions: [
      'Immediately begin your creative work while in flow state',
      'Trust the creative insights that emerged',
      'Use the loop function to maintain extended creative sessions',
      'Each loop deepens your creative connection'
    ],
    affirmations: [
      'My creativity continues to expand with each session',
      'I express my unique artistic vision with confidence'
    ]
  }
};

// ==================================================================
// ALPHA FOCUS TOROIDAL - 25 MINUTES WITH MAINTENANCE LOOP
// ==================================================================

export const ALPHA_FOCUS_TOROIDAL: ComprehensiveTimerPreset = {
  // Basic info
  id: 'alpha-focus-toroidal-25min-maintenance',
  name: '🎯 Alpha Focus Toroidal - 25min + Maintenance Loop',
  description: 'Maximum Resonance Toroidal at 10Hz Alpha for sustained focus with maintenance phase loop',
  total_duration: 25,
  transitions_count: 2,
  tags: ['focus', 'alpha', 'toroidal', 'productivity', 'maintenance-loop'],
  is_premium: false,
  available: true,
  
  // Loop configuration - maintenance phase looping
  loop_enabled: true,
  loop_count: 0, // Infinite
  loop_phase: 'specific_transitions',
  loop_transitions: [1], // Loop only the main focus phase
  
  categories: ['focus', 'productivity', 'alpha', 'concentration'],
  difficulty_level: 'beginner',
  target_states: ['sustained focus', 'alpha flow', 'productive concentration', 'mental clarity'],
  
  // Enhanced loop configuration
  loop_config: {
    enabled: true,
    type: 'infinite',
    loop_scope: 'maintenance_phase',
    specific_phases: [1], // Loop the main focus phase (phase 2)
    fade_between_loops: false, // No fade for focus maintenance
    loop_transition_seconds: 10
  },
  
  // Advanced frequency transitions
  advanced_transitions: [
    {
      // Phase 1: Focus Preparation
      duration_minutes: 5,
      frequency_hz: 12,
      frequency_type: 'Alpha',
      left_ear_hz: 144,
      right_ear_hz: 150,
      description: '🚀 Phase 1: Focus Activation (12Hz) - Toroidal Field Preparation',
      
      pattern_id: 'toroidal-max-resonance',
      
      waveform: {
        start: 'sine',
        end: 'sine',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 30,
        sustain_level: 0.5,
        fade_out_seconds: 10
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.3,
        reverbAmount: 0.1,
        spatialWidth: 0.7,
        elevation: 0,
        azimuth: 0,
        movement_speed: 0.04,
        spatial_intensity: 0.6
      },
      
      pattern_8d: 'focus-prep-toroidal',
      
      electromagnetic_targets: {
        strength: 0.7,
        coherence: 0.8,
        resonance: 0.7,
        stability: 0.9
      },
      
      visualization_style: {
        color_scheme: 'focus-prep-blue',
        intensity: 0.7,
        animation_speed: 0.5,
        effects: ['focus-toroidal-activation', 'mental-clarity-boost', 'concentration-field']
      }
    },
    
    {
      // Phase 2: Sustained Alpha Focus - MAXIMUM RESONANCE TOROIDAL AT 10Hz! (MAINTENANCE LOOP)
      duration_minutes: 20,
      frequency_hz: 10,
      frequency_type: 'Alpha',
      left_ear_hz: 144,
      right_ear_hz: 150,
      description: '🎯 Phase 2: Sustained Focus (10Hz) - MAXIMUM RESONANCE TOROIDAL - Loops for Extended Work',
      
      pattern_id: 'toroidal-max-resonance', // ✅ TOROIDAL AT ALPHA FREQUENCY WITH LOOP!
      
      waveform: {
        start: 'sine',
        end: 'sine',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 15,
        sustain_level: 0.6,
        fade_out_seconds: 15 // Short fade for seamless looping
      },
      
      spatial_config: {
        enabled: true,
        hrtf: false, // Disable HRTF for focus - less processing distraction
        roomSize: 0.2,
        reverbAmount: 0.05,
        spatialWidth: 0.6,
        elevation: 0,
        azimuth: 0,
        movement_speed: 0.03,
        spatial_intensity: 0.5
      },
      
      pattern_8d: 'sustained-focus-toroidal',
      
      electromagnetic_targets: {
        strength: 0.8,
        coherence: 0.9, // High coherence for sustained focus
        resonance: 0.8,
        stability: 0.95 // Maximum stability for focus maintenance
      },
      
      visualization_style: {
        color_scheme: 'sustained-focus-gold',
        intensity: 0.8,
        animation_speed: 0.4,
        effects: [
          'maximum-toroidal-resonance',
          'sustained-focus-field',
          'productivity-enhancement',
          'mental-clarity-peak',
          'concentration-mastery'
        ]
      }
    }
  ],

  pattern_progression: [
    {
      start_time_minutes: 0,
      end_time_minutes: 5,
      pattern_config: {
        id: 'toroidal-focus-activation',
        name: 'Focus Toroidal Activation',
        type: 'toroidal',
        description: 'Maximum Resonance Toroidal at 12Hz Alpha for focus field activation and mental clarity',
        instructions: 'Clear your mind and prepare for sustained focus as the toroidal field activates',
        benefits: ['Focus activation', 'Mental clarity', 'Concentration preparation', 'Toroidal resonance initiation'],
        frequencies: {
          carrier: 144,
          beat: 12,
          range: 'alpha'
        },
        duration: 5,
        electromagnetic: {
          fieldStrength: 0.7,
          resonanceFreq: 12,
          coherence: 0.8
        },
        visualization: {
          color: '#4169E1',
          intensity: 0.7,
          pattern: 'toroidal-focus-activation'
        }
      },
      transition_duration_seconds: 30,
      transition_type: 'smooth'
    },
    {
      start_time_minutes: 5,
      end_time_minutes: 25,
      pattern_config: {
        id: 'toroidal-sustained-focus-mastery',
        name: 'Sustained Focus Toroidal Mastery',
        type: 'toroidal',
        description: 'Maximum Resonance Toroidal at 10Hz Alpha - sustained deep focus with maintenance loop support',
        instructions: 'Enter peak focus state with maximum concentration as the toroidal field maintains optimal resonance',
        benefits: ['Sustained deep focus', 'Productivity enhancement', 'Mental clarity peak', 'Concentration mastery', 'Maximum toroidal resonance'],
        frequencies: {
          carrier: 144,
          beat: 10,
          range: 'alpha'
        },
        duration: 20,
        electromagnetic: {
          fieldStrength: 0.8,
          resonanceFreq: 10,
          coherence: 0.9
        },
        visualization: {
          color: '#FFD700',
          intensity: 0.8,
          pattern: 'toroidal-focus-peak'
        }
      },
      transition_duration_seconds: 15,
      transition_type: 'smooth'
    }
  ],
  spatial_8d_config: {
    enabled: true,
    movement_progression: [
      {
        start_time_minutes: 0,
        pattern_type: 'circular',
        speed: 0.04,
        radius: 50,
        elevation_range: [0, 0],
        direction: 'clockwise'
      },
      {
        start_time_minutes: 5,
        pattern_type: 'circular',
        speed: 0.03,
        radius: 40,
        elevation_range: [0, 0],
        direction: 'clockwise'
      }
    ],
    hrtf_enabled: false, // Better for focus work
    room_acoustics: {
      size: 'small',
      reverb: 0.1,
      absorption: 0.8
    },
    distance_modulation: {
      min_distance: 15,
      max_distance: 40,
      modulation_speed: 0.01
    }
  },

  electromagnetic_progression: [
    {
      timestamp_minutes: 0,
      field_config: {
        strength: 0.7,
        frequency: 12,
        phase: 0,
        coherence: 0.8,
        resonance: 0.7,
        state: 'CHARGING',
        stability: 0.9
      },
      transition_duration_seconds: 30,
      resonance_targets: {
        brain_waves: 'alpha',
        healing_frequency: 12
      }
    },
    {
      timestamp_minutes: 5,
      field_config: {
        strength: 0.8,
        frequency: 10,
        phase: 90,
        coherence: 0.9,
        resonance: 0.8,
        state: 'ACTIVE',
        stability: 0.95
      },
      transition_duration_seconds: 15,
      resonance_targets: {
        brain_waves: 'alpha',
        healing_frequency: 10
      }
    }
  ],
  visualization_progression: [
    {
      timestamp_minutes: 0,
      settings: {
        starField: {
          density: 70,
          speed: 0.8,
          color: '#4169E1',
          twinkle: true
        },
        spatial: {
          gridSize: 35,
          opacity: 0.4,
          color: '#4169E1',
          animation: true
        },
        frequency: {
          bars: 32,
          sensitivity: 0.9,
          color: '#5C85D6',
          glow: true
        }
      },
      transition_duration_seconds: 30,
      special_effects: {
        particle_burst: false,
        color_cycling: false,
        mandala_overlay: false,
        fractal_zoom: false
      }
    },
    {
      timestamp_minutes: 5,
      settings: {
        starField: {
          density: 100,
          speed: 1.0,
          color: '#FFD700',
          twinkle: true
        },
        spatial: {
          gridSize: 45,
          opacity: 0.5,
          color: '#FFD700',
          animation: true
        },
        frequency: {
          bars: 48,
          sensitivity: 1.2,
          color: '#FDD835',
          glow: true
        }
      },
      transition_duration_seconds: 15,
      special_effects: {
        particle_burst: true,
        color_cycling: false,
        mandala_overlay: false,
        fractal_zoom: false
      }
    }
  ],

  preparation: {
    duration_minutes: 2,
    instructions: [
      'Clear your workspace and eliminate distractions',
      'Set specific focus goal for this work session',
      'Visualize a golden toroidal field enhancing your concentration',
      'Prepare to enter sustained focus state'
    ],
    affirmations: [
      'My mind is clear and focused',
      'I maintain deep concentration effortlessly',
      'The toroidal field amplifies my mental clarity'
    ]
  },
  
  integration: {
    duration_minutes: 1,
    instructions: [
      'Begin focused work immediately while in optimal state',
      'Allow the maintenance loop to sustain your concentration',
      'Work as long as needed with continuous toroidal support',
      'End the loop when your focused work is complete'
    ],
    affirmations: [
      'I maintain laser focus throughout my work',
      'My productivity is enhanced by toroidal resonance'
    ]
  }
};

// ==================================================================
// EXPORT ALL TOROIDAL LOW FREQUENCY + LOOP EXAMPLES
// ==================================================================

export const TOROIDAL_LOW_FREQUENCY_PRESETS = [
  DELTA_HEALING_TOROIDAL,
  THETA_CREATIVITY_TOROIDAL,
  ALPHA_FOCUS_TOROIDAL
];

// ==================================================================
// USAGE EXAMPLES AND DOCUMENTATION
// ==================================================================

export const TOROIDAL_FREQUENCY_EXAMPLES = {
  'Delta (0.5-4Hz)': {
    description: 'Maximum Resonance Toroidal at delta frequencies for deep healing, sleep, and regeneration',
    use_cases: ['Deep healing sessions', 'Cellular regeneration', 'Sleep enhancement', 'Energy restoration'],
    electromagnetic_settings: { strength: 0.8-1.0, coherence: 0.9-0.95, stability: 0.9-0.95 }
  },
  
  'Theta (4-8Hz)': {
    description: 'Maximum Resonance Toroidal at theta frequencies for creativity, meditation, and insight',
    use_cases: ['Creative breakthrough', 'Meditation', 'Intuitive insights', 'Problem solving'],
    electromagnetic_settings: { strength: 0.7-0.9, coherence: 0.8-0.9, stability: 0.8-0.9 }
  },
  
  'Alpha (8-12Hz)': {
    description: 'Maximum Resonance Toroidal at alpha frequencies for focus, learning, and relaxed awareness',
    use_cases: ['Focused work', 'Learning', 'Relaxed concentration', 'Flow states'],
    electromagnetic_settings: { strength: 0.6-0.8, coherence: 0.8-0.9, stability: 0.9-0.95 }
  },
  
  'Beta (12-30Hz)': {
    description: 'Maximum Resonance Toroidal at beta frequencies for active thinking and problem solving',
    use_cases: ['Active thinking', 'Problem solving', 'Analytical work', 'Decision making'],
    electromagnetic_settings: { strength: 0.5-0.7, coherence: 0.7-0.8, stability: 0.8-0.9 }
  },
  
  'Gamma (30-100Hz)': {
    description: 'Maximum Resonance Toroidal at gamma frequencies for peak consciousness and binding',
    use_cases: ['Peak awareness', 'Consciousness expansion', 'Lucid dreaming', 'Mystical states'],
    electromagnetic_settings: { strength: 0.8-1.0, coherence: 0.9-0.95, stability: 0.8-0.9 }
  }
};

export const LOOP_CONFIGURATION_EXAMPLES = {
  'Infinite Loop': {
    description: 'Loops forever until manually stopped - perfect for extended sessions',
    config: { enabled: true, type: 'infinite', loop_scope: 'full_preset' },
    use_cases: ['Healing sessions', 'Meditation retreats', 'Extended focus work', 'Sleep enhancement']
  },
  
  'Count Loop (3x)': {
    description: 'Loops a specific number of times - great for structured sessions',
    config: { enabled: true, type: 'count', count: 3, loop_scope: 'full_preset' },
    use_cases: ['Creative sessions', 'Learning blocks', 'Therapy sessions', 'Skill practice']
  },
  
  'Maintenance Loop': {
    description: 'Loops only the main phase for sustained effect',
    config: { enabled: true, type: 'infinite', loop_scope: 'specific_phases', specific_phases: [1] },
    use_cases: ['Extended focus work', 'Sustained creativity', 'Long meditation', 'Therapeutic states']
  },
  
  'Duration Loop (2 hours)': {
    description: 'Loops for a specific time duration',
    config: { enabled: true, type: 'duration', duration_hours: 2, loop_scope: 'full_preset' },
    use_cases: ['Sleep cycles', 'Work blocks', 'Study sessions', 'Healing periods']
  }
};