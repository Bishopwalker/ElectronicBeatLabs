// Electromagnetic Beat Lab - Lucid Dreaming Master Preset
// Advanced 5-phase lucid dreaming protocol with optimized brainwave progression

import type { ComprehensiveTimerPreset, AdvancedFrequencyTransition } from './comprehensiveTimerTemplate';

// ==================================================================
// LUCID DREAMING MASTER PROTOCOL - 62 MINUTES
// ==================================================================

export const LUCID_DREAMING_MASTER: ComprehensiveTimerPreset = {
  // Basic info
  id: 'lucid-dreaming-master-62min',
  name: '✨ Lucid Dreaming Master - 62min',
  description: 'Advanced 5-phase lucid dreaming protocol: Beta cooldown → Theta gateway → Delta sleep → Gamma activation → Toroidal lucidity',
  total_duration: 62,
  transitions_count: 5,
  tags: ['lucid', 'dreaming', 'consciousness', 'rem', 'gamma', 'toroidal', 'expert'],
  is_premium: true,
  available: true,
  
  // Enhanced features
  categories: ['lucid dreaming', 'consciousness', 'sleep', 'rem', 'advanced'],
  difficulty_level: 'expert',
  target_states: ['lucid awareness', 'conscious dreaming', 'rem enhancement', 'dream control'],
  contraindications: ['sleep disorders', 'epilepsy', 'severe anxiety', 'heart conditions'],
  
  // Loop configuration for extended REM cycles
  loop_config: {
    enabled: true,
    type: 'count',
    count: 3, // Loop 3 times for multiple REM cycles
    loop_scope: 'specific_phases',
    specific_phases: [3, 4], // Loop phases 4 & 5 (Pre-Lucid + Peak Lucidity)
    fade_between_loops: true,
    loop_transition_seconds: 30
  },
  
  // Advanced frequency transitions
  advanced_transitions: [
    {
      // Phase 1: Cool Down Period - Beta Relaxation
      duration_minutes: 2,
      frequency_hz: 13,
      frequency_type: 'Beta',
      left_ear_hz: 80,
      right_ear_hz: 93,
      description: '😌 Phase 1: Cool Down (13Hz Beta) - Waking State Relaxation',
      
      pattern_id: 'spiral-transformation',
      
      waveform: {
        start: 'sine',
        end: 'sine',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 3,
        sustain_level: 0.7,
        fade_out_seconds: 2
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.6,
        reverbAmount: 0.3,
        spatialWidth: 0.8,
        elevation: 0.1,
        azimuth: 0,
        movement_speed: 0.03,
        spatial_intensity: 0.6,
        reverberance: 0.4
      },
      
      pattern_8d: 'spiral-descent-grounding',
      
      electromagnetic_targets: {
        strength: 0.4,
        coherence: 0.6,
        resonance: 0.5,
        stability: 0.8
      },
      
      visualization_style: {
        color_scheme: 'beta-cooldown-blue',
        intensity: 0.5,
        animation_speed: 0.4,
        effects: ['gentle-descent', 'mind-quieting', 'relaxation-spiral']
      },
      
      transition_effects: {
        crossfade_duration: 13,
        harmonic_blending: true
      }
    },
    
    {
      // Phase 2: Pre-Sleep Period - Theta Gateway
      duration_minutes: 10,
      frequency_hz: 6,
      frequency_type: 'Theta',
      left_ear_hz: 58,
      right_ear_hz: 64,
      description: '🧬 Phase 2: Pre-Sleep Theta (6Hz) - DNA Helix Gateway',
      
      pattern_id: 'helix-dna-activation',
      
      waveform: {
        start: 'sine',
        end: 'sine',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 45,
        sustain_level: 0.3,
        fade_out_seconds: 30
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.8,
        reverbAmount: 0.5,
        spatialWidth: 1.0,
        elevation: 0.2,
        azimuth: 0,
        movement_speed: 0.45,
        spatial_intensity: 0.7,
        reverberance: 0.6,
        room_scale: 1.3
      },
      
      pattern_8d: 'dna-helix-rotation',
      
      electromagnetic_targets: {
        strength: 0.6,
        coherence: 0.8,
        resonance: 0.7,
        stability: 0.85
      },
      
      visualization_style: {
        color_scheme: 'theta-gateway-violet',
        intensity: 0.7,
        animation_speed: 0.3,
        effects: ['dna-activation', 'cellular-alignment', 'theta-portal', 'sleep-preparation']
      },
      
      transition_effects: {
        crossfade_duration: 60,
        harmonic_blending: true
      }
    },
    
    {
      // Phase 3: Deep Sleep - Ultra-Low Delta Standing Wave
      duration_minutes: 30,
      frequency_hz: 0.3,
      frequency_type: 'Delta',
      left_ear_hz: 50,
      right_ear_hz: 50.3,
      description: '💤 Phase 3: Deep Delta Sleep (0.3Hz) - Standing Wave Rest',
      
      pattern_id: 'standing-wave-meditation',
      
      waveform: {
        start: 'sine',
        end: 'sine',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 60,
        sustain_level: 0.2,
        fade_out_seconds: 45
      },
      
      spatial_config: {
        enabled: true,
        hrtf: false,
        roomSize: 1.0,
        reverbAmount: 0.7,
        spatialWidth: 1.2,
        elevation: 0,
        azimuth: 0,
        movement_speed: 0.01,
        spatial_intensity: 0.4,
        reverberance: 0.8,
        room_scale: 2.0,
        hf_damping: 0.6
      },
      
      pattern_8d: 'minimal-spiral-deep-rest',
      
      electromagnetic_targets: {
        strength: 0.3,
        coherence: 0.9,
        resonance: 0.4,
        stability: 0.95
      },
      
      visualization_style: {
        color_scheme: 'deep-delta-indigo',
        intensity: 0.3,
        animation_speed: 0.1,
        effects: ['standing-wave-field', 'deep-rest-void', 'delta-stability', 'sleep-depths']
      },
      
      transition_effects: {
        crossfade_duration: 30,
        harmonic_blending: true
      }
    },
    
    {
      // Phase 4: Pre-Lucid Activation - Gamma Vortex
      duration_minutes: 7,
      frequency_hz: 25,
      frequency_type: 'Gamma',
      left_ear_hz: 40,
      right_ear_hz: 65,
      description: '⚡ Phase 4: Pre-Lucid Gamma (25Hz) - Consciousness Activation Vortex',
      
      pattern_id: 'vortex-focus-enhancement',
      
      waveform: {
        start: 'sine',
        end: 'sine',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 20,
        sustain_level: 0.6,
        fade_out_seconds: 15
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.5,
        reverbAmount: 0.2,
        spatialWidth: 1.1,
        elevation: 0.4,
        azimuth: 0,
        movement_speed: 0.08,
        spatial_intensity: 0.9,
        reverberance: 0.3
      },
      
      pattern_8d: 'consciousness-activation-vortex',
      
      electromagnetic_targets: {
        strength: 0.8,
        coherence: 0.7,
        resonance: 0.8,
        stability: 0.75
      },
      
      visualization_style: {
        color_scheme: 'gamma-activation-gold',
        intensity: 0.8,
        animation_speed: 0.7,
        effects: ['consciousness-vortex', 'gamma-awakening', 'awareness-spiral', 'lucid-preparation']
      },
      
      transition_effects: {
        crossfade_duration: 25,
        harmonic_blending: true
      }
    },
    
    {
      // Phase 5: Peak Lucidity - Maximum Resonance Toroidal
      duration_minutes: 5,
      frequency_hz: 40,
      frequency_type: 'Gamma',
      left_ear_hz: 85,
      right_ear_hz: 125,
      description: '🌟 Phase 5: Peak Lucidity (40Hz) - Maximum Resonance Toroidal Mastery',
      
      pattern_id: 'toroidal-max-resonance',
      
      waveform: {
        start: 'sine',
        end: 'sine',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 15,
        sustain_level: 0.7,
        fade_out_seconds: 60
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.3,
        reverbAmount: 0.1,
        spatialWidth: 1.3,
        elevation: 0.5,
        azimuth: 0,
        movement_speed: 0.1,
        spatial_intensity: 1.0,
        reverberance: 0.2
      },
      
      pattern_8d: 'toroidal-lucidity-mastery',
      
      electromagnetic_targets: {
        strength: 1.0,
        coherence: 0.95,
        resonance: 1.0,
        stability: 0.85
      },
      
      visualization_style: {
        color_scheme: 'toroidal-lucidity-white-gold',
        intensity: 1.0,
        animation_speed: 0.8,
        effects: ['maximum-resonance', 'toroidal-mastery', 'lucid-consciousness', 'dream-control', 'gamma-burst']
      },
      
      transition_effects: {
        crossfade_duration: 20,
        harmonic_blending: true
      }
    }
  ],
  
  // Pattern progression through lucid dreaming journey
  pattern_progression: [
    {
      start_time_minutes: 0,
      end_time_minutes: 2,
      pattern_config: {
        id: 'spiral-cooldown-descent',
        name: 'Spiral Cooldown Descent',
        type: 'spiral',
        description: 'Beta cooldown with gentle spiral descent',
        instructions: 'Let your mind begin to quiet and relax',
        benefits: ['Mental quieting', 'Relaxation initiation', 'Mind-body alignment'],
        frequencies: {
          carrier: 80,
          beat: 13,
          range: 'beta'
        },
        duration: 2,
        electromagnetic: {
          fieldStrength: 0.4,
          resonanceFreq: 13,
          coherence: 0.6
        },
        visualization: {
          color: '#4169e1',
          intensity: 0.5,
          pattern: 'spiral-transformation'
        }
      },
      transition_duration_seconds: 13,
      transition_type: 'crossfade'
    },
    {
      start_time_minutes: 2,
      end_time_minutes: 12,
      pattern_config: {
        id: 'helix-theta-gateway',
        name: 'DNA Helix Theta Gateway',
        type: 'helix',
        description: 'Theta gateway with DNA helix activation for dream preparation',
        instructions: 'Allow consciousness to drift toward the dream threshold',
        benefits: ['Dream state preparation', 'Cellular alignment', 'Theta activation', 'Sleep gateway'],
        frequencies: {
          carrier: 58,
          beat: 6,
          range: 'theta'
        },
        duration: 10,
        electromagnetic: {
          fieldStrength: 0.6,
          resonanceFreq: 6,
          coherence: 0.8
        },
        visualization: {
          color: '#9370db',
          intensity: 0.7,
          pattern: 'helix-dna-activation'
        }
      },
      transition_duration_seconds: 60,
      transition_type: 'morph'
    },
    {
      start_time_minutes: 12,
      end_time_minutes: 42,
      pattern_config: {
        id: 'standing-wave-deep-delta',
        name: 'Standing Wave Deep Delta Sleep',
        type: 'standing',
        description: 'Ultra-low delta with standing wave for deep restorative sleep',
        instructions: 'Surrender completely into deep sleep state',
        benefits: ['Deep sleep', 'Delta rest', 'Restorative healing', 'Sleep depths'],
        frequencies: {
          carrier: 50,
          beat: 0.3,
          range: 'delta'
        },
        duration: 30,
        electromagnetic: {
          fieldStrength: 0.3,
          resonanceFreq: 0.3,
          coherence: 0.9
        },
        visualization: {
          color: '#191970',
          intensity: 0.3,
          pattern: 'standing-wave-meditation'
        }
      },
      transition_duration_seconds: 90,
      transition_type: 'crossfade'
    },
    {
      start_time_minutes: 42,
      end_time_minutes: 57,
      pattern_config: {
        id: 'vortex-gamma-activation',
        name: 'Gamma Consciousness Vortex',
        type: 'vortex',
        description: 'Gamma vortex for consciousness activation and lucid awareness',
        instructions: 'Become aware within the dream state',
        benefits: ['Consciousness activation', 'Lucid awareness', 'Gamma awakening', 'Dream control preparation'],
        frequencies: {
          carrier: 40,
          beat: 25,
          range: 'gamma'
        },
        duration: 7,
        electromagnetic: {
          fieldStrength: 0.8,
          resonanceFreq: 25,
          coherence: 0.7
        },
        visualization: {
          color: '#ffd700',
          intensity: 0.8,
          pattern: 'vortex-focus-enhancement'
        }
      },
      transition_duration_seconds: 25,
      transition_type: 'instant'
    },
    {
      start_time_minutes: 57,
      end_time_minutes: 62,
      pattern_config: {
        id: 'toroidal-peak-lucidity',
        name: 'Toroidal Peak Lucidity Mastery',
        type: 'toroidal',
        description: 'Maximum resonance toroidal field for peak lucid consciousness',
        instructions: 'Master complete control of your dream experience',
        benefits: ['Peak lucidity', 'Dream mastery', 'Conscious dreaming', 'Maximum resonance', 'Toroidal control'],
        frequencies: {
          carrier: 85,
          beat: 40,
          range: 'gamma'
        },
        duration: 5,
        electromagnetic: {
          fieldStrength: 1.0,
          resonanceFreq: 40,
          coherence: 0.95
        },
        visualization: {
          color: '#ffffff',
          intensity: 1.0,
          pattern: 'toroidal-max-resonance'
        }
      },
      transition_duration_seconds: 20,
      transition_type: 'morph'
    }
  ],
  
  // 8D Spatial configuration optimized for lucid dreaming
  spatial_8d_config: {
    enabled: true,
    movement_progression: [
      {
        start_time_minutes: 0,
        pattern_type: 'spiral',
        speed: 0.03,
        radius: 80,
        elevation_range: [10, -10],
        direction: 'clockwise'
      },
      {
        start_time_minutes: 10,
        pattern_type: 'custom', // DNA helix rotation
        speed: 0.025,
        radius: 60,
        elevation_range: [-20, 20],
        direction: 'alternating'
      },
      {
        start_time_minutes: 20,
        pattern_type: 'spiral',
        speed: 0.01,
        radius: 40,
        elevation_range: [0, 0],
        direction: 'clockwise'
      },
      {
        start_time_minutes: 50,
        pattern_type: 'figure8',
        speed: 0.08,
        radius: 70,
        elevation_range: [-30, 30],
        direction: 'alternating'
      },
      {
        start_time_minutes: 57,
        pattern_type: 'circular',
        speed: 0.1,
        radius: 50,
        elevation_range: [-45, 45],
        direction: 'counterclockwise'
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
      max_distance: 100,
      modulation_speed: 0.005
    }
  },
  
  // Electromagnetic progression optimized for lucid states
  electromagnetic_progression: [
    {
      timestamp_minutes: 0,
      field_config: {
        strength: 0.4,
        frequency: 13,
        phase: 0,
        coherence: 0.6,
        resonance: 0.5,
        state: 'ACTIVE',
        stability: 0.8
      },
      transition_duration_seconds: 30,
      resonance_targets: {
        brain_waves: 'beta'
      }
    },
    {
      timestamp_minutes: 10,
      field_config: {
        strength: 0.6,
        frequency: 6,
        phase: 90,
        coherence: 0.8,
        resonance: 0.7,
        state: 'ACTIVE',
        stability: 0.85
      },
      transition_duration_seconds: 60,
      resonance_targets: {
        brain_waves: 'theta',
        healing_frequency: 6
      }
    },
    {
      timestamp_minutes: 20,
      field_config: {
        strength: 0.3,
        frequency: 0.3,
        phase: 180,
        coherence: 0.9,
        resonance: 0.4,
        state: 'ACTIVE',
        stability: 0.95
      },
      transition_duration_seconds: 90,
      resonance_targets: {
        brain_waves: 'delta'
      }
    },
    {
      timestamp_minutes: 50,
      field_config: {
        strength: 0.8,
        frequency: 25,
        phase: 270,
        coherence: 0.7,
        resonance: 0.8,
        state: 'RESONANT',
        stability: 0.75
      },
      transition_duration_seconds: 25,
      resonance_targets: {
        brain_waves: 'gamma'
      }
    },
    {
      timestamp_minutes: 57,
      field_config: {
        strength: 1.0,
        frequency: 40,
        phase: 360,
        coherence: 0.95,
        resonance: 1.0,
        state: 'CRITICAL',
        stability: 0.85
      },
      transition_duration_seconds: 20,
      resonance_targets: {
        brain_waves: 'gamma',
        healing_frequency: 40
      }
    }
  ],
  
  // Visualization progression
  visualization_progression: [
    {
      timestamp_minutes: 0,
      settings: {
        starField: {
          density: 80,
          speed: 0.5,
          color: '#4169e1',
          twinkle: true
        },
        spatial: {
          gridSize: 40,
          opacity: 0.3,
          color: '#4169e1',
          animation: true
        },
        frequency: {
          bars: 32,
          sensitivity: 0.8,
          color: '#4169e1',
          glow: true
        }
      },
      transition_duration_seconds: 30,
      special_effects: {
        color_cycling: false,
        particle_burst: false
      }
    },
    {
      timestamp_minutes: 10,
      settings: {
        starField: {
          density: 100,
          speed: 0.3,
          color: '#9370db',
          twinkle: true
        },
        spatial: {
          gridSize: 60,
          opacity: 0.4,
          color: '#9370db',
          animation: true
        },
        frequency: {
          bars: 64,
          sensitivity: 1.0,
          color: '#9370db',
          glow: true
        }
      },
      transition_duration_seconds: 60,
      special_effects: {
        mandala_overlay: true,
        color_cycling: true
      }
    },
    {
      timestamp_minutes: 20,
      settings: {
        starField: {
          density: 50,
          speed: 0.1,
          color: '#191970',
          twinkle: false
        },
        spatial: {
          gridSize: 80,
          opacity: 0.2,
          color: '#191970',
          animation: false
        },
        frequency: {
          bars: 16,
          sensitivity: 0.3,
          color: '#191970',
          glow: false
        }
      },
      transition_duration_seconds: 90
    },
    {
      timestamp_minutes: 50,
      settings: {
        starField: {
          density: 120,
          speed: 1.0,
          color: '#ffd700',
          twinkle: true
        },
        spatial: {
          gridSize: 50,
          opacity: 0.6,
          color: '#ffd700',
          animation: true
        },
        frequency: {
          bars: 128,
          sensitivity: 1.2,
          color: '#ffd700',
          glow: true
        }
      },
      transition_duration_seconds: 25,
      special_effects: {
        particle_burst: true,
        fractal_zoom: true
      }
    },
    {
      timestamp_minutes: 57,
      settings: {
        starField: {
          density: 200,
          speed: 1.5,
          color: '#ffffff',
          twinkle: true
        },
        spatial: {
          gridSize: 30,
          opacity: 0.8,
          color: '#ffffff',
          animation: true
        },
        frequency: {
          bars: 256,
          sensitivity: 1.5,
          color: '#ffffff',
          glow: true
        }
      },
      transition_duration_seconds: 20,
      special_effects: {
        particle_burst: true,
        color_cycling: true,
        mandala_overlay: true,
        fractal_zoom: true
      }
    }
  ],
  
  // Pre-session preparation for lucid dreaming
  preparation: {
    duration_minutes: 10,
    instructions: [
      'Lie down in complete darkness with comfortable temperature',
      'Set clear intention: "I will become conscious in my dreams"',
      'Practice reality checks: look at your hands, check the time twice',
      'Visualize becoming lucid in a dream scenario',
      'Relax completely while maintaining awareness of the session beginning',
      'Place hands in comfortable position and close eyes',
      'Begin slow, deep breathing to prepare for the journey'
    ],
    breathing_pattern: {
      inhale_seconds: 4,
      hold_seconds: 7,
      exhale_seconds: 8,
      cycles: 10
    },
    visualization_guide: [
      'See yourself becoming aware in a dream',
      'Imagine your hands becoming visible in the dream state',
      'Visualize controlling and directing your dream experience',
      'Feel the sensation of conscious awareness during sleep'
    ],
    affirmations: [
      'I easily become conscious in my dreams',
      'I remember my dreams clearly and vividly',
      'I have complete control over my dream experiences',
      'Lucid dreaming comes naturally to me'
    ]
  },
  
  // Post-session integration
  integration: {
    duration_minutes: 10,
    instructions: [
      'Remain still with eyes closed for 2-3 minutes',
      'Slowly begin to move fingers and toes',
      'Keep a dream journal next to your bed',
      'Write down any dreams or experiences immediately',
      'Practice reality checks throughout the day',
      'Set intention for lucid dreams in upcoming sleep cycles',
      'Note any increased dream recall or awareness'
    ],
    breathing_pattern: {
      inhale_seconds: 3,
      hold_seconds: 3,
      exhale_seconds: 5,
      cycles: 5
    },
    affirmations: [
      'I carry this lucid awareness into all my dreams',
      'My dream recall improves with each practice session',
      'I am a master of conscious dreaming'
    ]
  },
  
  // YouTube integration (optional guided meditation)
  youtube_integration: {
    sync_mode: 'none',
    volume_mix: 0.0,
    guided_segments: [
      {
        timestamp_minutes: 0,
        instruction: 'Beginning lucid dream induction - settle into relaxation',
        duration_seconds: 30
      },
      {
        timestamp_minutes: 10,
        instruction: 'Entering theta gateway - allow consciousness to drift',
        duration_seconds: 30
      },
      {
        timestamp_minutes: 20,
        instruction: 'Deep delta phase - let go completely into sleep',
        duration_seconds: 30
      },
      {
        timestamp_minutes: 50,
        instruction: 'Gamma activation beginning - maintain subtle awareness',
        duration_seconds: 30
      },
      {
        timestamp_minutes: 57,
        instruction: 'Peak lucidity phase - become fully conscious in dreams',
        duration_seconds: 30
      }
    ]
  }
};

// Export for use in timer system
export const LUCID_DREAMING_PRESETS = [LUCID_DREAMING_MASTER];