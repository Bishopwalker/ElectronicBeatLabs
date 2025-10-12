// Electromagnetic Beat Lab - Advanced Timer Presets
// Real-world presets that utilize ALL the functionality from the comprehensive template

import type { ComprehensiveTimerPreset } from './comprehensiveTimerTemplate';

// ==================================================================
// ADVANCED HEALING PROTOCOL - 60 MINUTES
// ==================================================================

export const ADVANCED_HEALING_PROTOCOL: ComprehensiveTimerPreset = {
  // Basic info
  id: 'advanced-healing-protocol-60min',
  name: '💚 Advanced Healing Protocol - 60min',
  description: 'Complete cellular regeneration journey with 528Hz love frequency, toroidal field healing, and 8D spatial immersion',
  total_duration: 60,

  transitions_count: 5,
  tags: ['healing', 'regeneration', '528Hz', 'toroidal', '8D', 'advanced'],
  is_premium: true,
  available: true,
  
  // Enhanced features
  categories: ['healing', 'regeneration', 'wellness', 'meditation'],
  difficulty_level: 'advanced',
  target_states: ['cellular healing', 'energy balance', 'chakra alignment', 'DNA repair'],
  contraindications: ['pacemaker', 'recent surgery', 'active cancer treatment'],
  
  // Advanced transitions
  advanced_transitions: [
    {
      // Phase 1: Preparation & Grounding
      duration_minutes: 10,
      frequency_hz: 7.83,
      frequency_type: 'Alpha',
      left_ear_hz: 144,
      right_ear_hz: 151.83,
      description: '🌍 Phase 1: Schumann Resonance Grounding - Earth Connection',
      
      pattern_id: 'i' +
          'interference-balance',
      
      waveform: {
        start: 'sine',
        end: 'sine',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 10,
        sustain_level: 0.7,
        fade_out_seconds: 15
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.4,
        reverbAmount: 0.2,
        spatialWidth: 0.6,
        elevation: 0,
        azimuth: 0,
        movement_speed: 0.02,
        spatial_intensity: 0.4,
        reverberance: 0.3
      },
      
      pattern_8d: 'healing-circle-slow',
      
      electromagnetic_targets: {
        strength: 0.5,
        coherence: 0.7,
        resonance: 0.6,
        stability: 0.9
      },
      
      visualization_style: {
        color_scheme: 'earth-green',
        intensity: 0.5,
        animation_speed: 0.3,
        effects: ['gentle-pulse', 'grounding-roots', 'energy-foundation']
      }
    },
    
    {
      // Phase 2: Love Frequency Activation (528Hz)
      duration_minutes: 20,
      frequency_hz: 4, // 4Hz binaural beat with 144Hz base
      frequency_type: 'Theta',
      left_ear_hz: 144,
      right_ear_hz: 148,
      description: '💚 Phase 2: Love Frequency (528Hz + 4Hz) - DNA Repair & Heart Opening',
      
      pattern_id: 'toroidal-healing',
      
      waveform: {
        start: 'sine',
        end: 'triangle',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 30,
        sustain_level: 0.5,
        fade_out_seconds: 20
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.7,
        reverbAmount: 0.4,
        spatialWidth: 0.9,
        elevation: 0.2,
        azimuth: 0,
        movement_speed: 0.04,
        spatial_intensity: 0.7,
        reverberance: 0.5,
        room_scale: 1.2
      },
      
      pattern_8d: 'heart-torus-expansion',
      
      electromagnetic_targets: {
        strength: 0.8,
        coherence: 0.9,
        resonance: 0.8,
        stability: 0.8
      },
      
      visualization_style: {
        color_scheme: 'love-frequency-green',
        intensity: 0.8,
        animation_speed: 0.5,
        effects: ['heart-chakra-opening', 'dna-repair-spirals', 'love-field-expansion', 'cellular-regeneration']
      },
      
      transition_effects: {
        crossfade_duration: 45,
        harmonic_blending: true
      }
    },
    
    {
      // Phase 3: Deep Healing Theta (7.5Hz - Healing frequency)
      duration_minutes: 15,
      frequency_hz: 7.5,
      frequency_type: 'Theta',
      left_ear_hz: 142.5,
      right_ear_hz: 150,
      description: '🌟 Phase 3: Deep Healing Theta (7.5Hz) - Cellular Repair & Immune Boost',
      
      pattern_id: 'spiral-transformation',
      
      waveform: {
        start: 'triangle',
        end: 'sine',
        transition_type: 'oscillating'
      },
      
      volume_envelope: {
        fade_in_seconds: 20,
        sustain_level: 0.6,
        fade_out_seconds: 25
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 1.0,
        reverbAmount: 0.6,
        spatialWidth: 1.2,
        elevation: 0.4,
        azimuth: 0,
        movement_speed: 0.03,
        spatial_intensity: 0.9,
        reverberance: 0.7,
        room_scale: 1.5,
        hf_damping: 0.3
      },
      
      pattern_8d: 'healing-spiral-ascension',
      
      electromagnetic_targets: {
        strength: 0.9,
        coherence: 0.95,
        resonance: 0.9,
        stability: 0.85
      },
      
      visualization_style: {
        color_scheme: 'healing-spectrum',
        intensity: 0.9,
        animation_speed: 0.4,
        effects: ['immune-system-boost', 'cellular-harmony', 'energy-meridian-flow', 'healing-light-cascade']
      }
    },
    
    {
      // Phase 4: Gamma Healing Integration (40Hz)
      duration_minutes: 10,
      frequency_hz: 30,
      frequency_type: 'Gamma',
      left_ear_hz: 144,
      right_ear_hz: 174,
      description: '⚡ Phase 4: Gamma Integration (40Hz) - Neural Optimization & Healing Completion',
      
      pattern_id: 'toroidal-max-resonance',
      
      waveform: {
        start: 'sine',
        end: 'square',
        transition_type: 'stepped'
      },
      
      volume_envelope: {
        fade_in_seconds: 15,
        sustain_level: 0.7,
        fade_out_seconds: 20
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.8,
        reverbAmount: 0.3,
        spatialWidth: 1.0,
        elevation: 0.6,
        azimuth: 0,
        movement_speed: 0.08,
        spatial_intensity: 1.0,
        reverberance: 0.4
      },
      
      pattern_8d: 'gamma-healing-cross',
      
      electromagnetic_targets: {
        strength: 1.0,
        coherence: 0.98,
        resonance: 1.0,
        stability: 0.9
      },
      
      visualization_style: {
        color_scheme: 'gamma-healing-light',
        intensity: 1.0,
        animation_speed: 0.8,
        effects: ['neural-optimization', 'healing-completion', 'energy-integration', 'light-body-activation']
      }
    },
    
    {
      // Phase 5: Integration & Grounding
      duration_minutes: 5,
      frequency_hz: 8,
      frequency_type: 'Alpha',
      left_ear_hz: 144,
      right_ear_hz: 140,
      description: '🌱 Phase 5: Integration (8Hz) - Healing Stabilization',
      
      pattern_id: 'helix-dna-activation',
      
      waveform: {
        start: 'square',
        end: 'sine',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 10,
        sustain_level: 0.4,
        fade_out_seconds: 90
      },
      
      spatial_config: {
        enabled: true,
        hrtf: false,
        roomSize: 0.5,
        reverbAmount: 0.2,
        spatialWidth: 0.7,
        elevation: 0,
        azimuth: 0,
        movement_speed: 0.02,
        spatial_intensity: 0.4
      },
      
      pattern_8d: 'integration-stabilization',
      
      electromagnetic_targets: {
        strength: 0.6,
        coherence: 0.8,
        resonance: 0.7,
        stability: 1.0
      },
      
      visualization_style: {
        color_scheme: 'integration-completion',
        intensity: 0.6,
        animation_speed: 0.3,
        effects: ['healing-stabilization', 'energy-grounding', 'wellness-integration']
      }
    }
  ],
  
  // Pattern progression through the healing journey
  pattern_progression: [
    {
      start_time_minutes: 0,
      end_time_minutes: 10,
      pattern_config: {
        id: 'interference-balance-grounding',
        name: 'Earth Grounding Balance',
        type: 'interference',
        description: 'Schumann resonance grounding with balanced interference patterns',
        instructions: 'Relax and feel connection to Earth energy',
        benefits: ['Grounding', 'Energy balance', 'Foundation building'],
        frequencies: {
          carrier: 144,
          beat: 7.83,
          range: 'alpha'
        },
        duration: 10,
        electromagnetic: {
          fieldStrength: 0.5,
          resonanceFreq: 7.83,
          coherence: 0.7
        },
        visualization: {
          color: '#4CAF50',
          intensity: 0.5,
          pattern: 'interference-balance'
        }
      },
      transition_duration_seconds: 30,
      transition_type: 'crossfade'
    },
    {
      start_time_minutes: 10,
      end_time_minutes: 30,
      pattern_config: {
        id: 'toroidal-love-frequency',
        name: '528Hz Love Frequency Healing',
        type: 'toroidal',
        description: 'DNA repair and heart chakra activation with toroidal field',
        instructions: 'Focus on heart center, visualize green healing light',
        benefits: ['DNA repair', 'Heart opening', 'Love frequency activation', 'Cellular regeneration'],
        frequencies: {
          carrier: 144,
          beat: 4,
          range: 'theta'
        },
        duration: 20,
        electromagnetic: {
          fieldStrength: 0.8,
          resonanceFreq: 528,
          coherence: 0.9
        },
        visualization: {
          color: '#00FF88',
          intensity: 0.8,
          pattern: 'toroidal-healing'
        }
      },
      transition_duration_seconds: 45,
      transition_type: 'morph'
    },
    {
      start_time_minutes: 30,
      end_time_minutes: 45,
      pattern_config: {
        id: 'spiral-cellular-repair',
        name: 'Deep Cellular Transformation',
        type: 'spiral',
        description: 'Theta healing spiral for immune boost and cellular harmony',
        instructions: 'Allow deep healing to penetrate every cell',
        benefits: ['Cellular repair', 'Immune system boost', 'Energy meridian flow', 'Deep healing'],
        frequencies: {
          carrier: 142.5,
          beat: 7.5,
          range: 'theta'
        },
        duration: 15,
        electromagnetic: {
          fieldStrength: 0.9,
          resonanceFreq: 7.5,
          coherence: 0.95
        },
        visualization: {
          color: '#9C27B0',
          intensity: 0.9,
          pattern: 'spiral-transformation'
        }
      },
      transition_duration_seconds: 35,
      transition_type: 'morph'
    },
    {
      start_time_minutes: 45,
      end_time_minutes: 55,
      pattern_config: {
        id: 'toroidal-gamma-integration',
        name: 'Gamma Healing Integration',
        type: 'toroidal',
        description: 'Neural optimization and healing completion with gamma resonance',
        instructions: 'Feel the integration of all healing energies',
        benefits: ['Neural optimization', 'Healing completion', 'Light body activation', 'Energy integration'],
        frequencies: {
          carrier: 144,
          beat: 30,
          range: 'gamma'
        },
        duration: 10,
        electromagnetic: {
          fieldStrength: 1.0,
          resonanceFreq: 40,
          coherence: 0.98
        },
        visualization: {
          color: '#FFD700',
          intensity: 1.0,
          pattern: 'toroidal-max-resonance'
        }
      },
      transition_duration_seconds: 30,
      transition_type: 'crossfade'
    },
    {
      start_time_minutes: 55,
      end_time_minutes: 60,
      pattern_config: {
        id: 'helix-stabilization',
        name: 'DNA Helix Stabilization',
        type: 'helix',
        description: 'Final integration and healing stabilization with DNA helix pattern',
        instructions: 'Rest in complete healing and wellness',
        benefits: ['Healing stabilization', 'Energy grounding', 'Wellness integration', 'DNA harmony'],
        frequencies: {
          carrier: 144,
          beat: 8,
          range: 'alpha'
        },
        duration: 5,
        electromagnetic: {
          fieldStrength: 0.6,
          resonanceFreq: 8,
          coherence: 0.8
        },
        visualization: {
          color: '#00BCD4',
          intensity: 0.6,
          pattern: 'helix-dna-activation'
        }
      },
      transition_duration_seconds: 20,
      transition_type: 'crossfade'
    }
  ],
  
  // 8D Spatial configuration  
  spatial_8d_config: {
    enabled: true,
    movement_progression: [
      {
        start_time_minutes: 0,
        pattern_type: 'circular',
        speed: 0.02,
        radius: 30,
        elevation_range: [0, 0],
        direction: 'clockwise'
      },
      {
        start_time_minutes: 10,
        pattern_type: 'spiral',
        speed: 0.04,
        radius: 60,
        elevation_range: [-20, 20],
        direction: 'clockwise'
      },
      {
        start_time_minutes: 30,
        pattern_type: 'figure8',
        speed: 0.03,
        radius: 80,
        elevation_range: [-30, 30],
        direction: 'alternating'
      },
      {
        start_time_minutes: 45,
        pattern_type: 'infinity',
        speed: 0.08,
        radius: 100,
        elevation_range: [-45, 45],
        direction: 'counterclockwise'
      },
      {
        start_time_minutes: 55,
        pattern_type: 'circular',
        speed: 0.02,
        radius: 30,
        elevation_range: [0, 0],
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
      modulation_speed: 0.015
    }
  },

  // Electromagnetic field progression through healing journey
  electromagnetic_progression: [
    {
      timestamp_minutes: 0,
      field_config: {
        strength: 0.5,
        frequency: 7.83,
        phase: 0,
        coherence: 0.7,
        resonance: 0.6,
        state: 'ACTIVE',
        stability: 0.9
      },
      transition_duration_seconds: 30,
      resonance_targets: {
        brain_waves: 'alpha',
        chakra_alignment: 'root',
        healing_frequency: 7.83
      }
    },
    {
      timestamp_minutes: 10,
      field_config: {
        strength: 0.8,
        frequency: 528,
        phase: 90,
        coherence: 0.9,
        resonance: 0.8,
        state: 'RESONANT',
        stability: 0.8
      },
      transition_duration_seconds: 45,
      resonance_targets: {
        brain_waves: 'theta',
        chakra_alignment: 'heart',
        healing_frequency: 528
      }
    },
    {
      timestamp_minutes: 30,
      field_config: {
        strength: 0.9,
        frequency: 7.5,
        phase: 180,
        coherence: 0.95,
        resonance: 0.9,
        state: 'RESONANT',
        stability: 0.85
      },
      transition_duration_seconds: 35,
      resonance_targets: {
        brain_waves: 'theta',
        chakra_alignment: 'solar_plexus',
        healing_frequency: 7.5
      }
    },
    {
      timestamp_minutes: 45,
      field_config: {
        strength: 1.0,
        frequency: 40,
        phase: 270,
        coherence: 0.98,
        resonance: 1.0,
        state: 'CRITICAL',
        stability: 0.9
      },
      transition_duration_seconds: 30,
      resonance_targets: {
        brain_waves: 'gamma',
        chakra_alignment: 'crown',
        healing_frequency: 40
      }
    },
    {
      timestamp_minutes: 55,
      field_config: {
        strength: 0.6,
        frequency: 8,
        phase: 0,
        coherence: 0.8,
        resonance: 0.7,
        state: 'ACTIVE',
        stability: 1.0
      },
      transition_duration_seconds: 20,
      resonance_targets: {
        brain_waves: 'alpha',
        chakra_alignment: 'all_balanced',
        healing_frequency: 8
      }
    }
  ],

  // Visualization progression evolving through healing journey
  visualization_progression: [
    {
      timestamp_minutes: 0,
      settings: {
        starField: {
          density: 80,
          speed: 0.5,
          color: '#4CAF50',
          twinkle: true
        },
        spatial: {
          gridSize: 40,
          opacity: 0.3,
          color: '#4CAF50',
          animation: true
        },
        frequency: {
          bars: 32,
          sensitivity: 0.8,
          color: '#66BB6A',
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
      timestamp_minutes: 10,
      settings: {
        starField: {
          density: 120,
          speed: 1.0,
          color: '#00FF88',
          twinkle: true
        },
        spatial: {
          gridSize: 60,
          opacity: 0.5,
          color: '#00FF88',
          animation: true
        },
        frequency: {
          bars: 64,
          sensitivity: 1.2,
          color: '#00FF88',
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
      timestamp_minutes: 30,
      settings: {
        starField: {
          density: 150,
          speed: 1.5,
          color: '#9C27B0',
          twinkle: true
        },
        spatial: {
          gridSize: 80,
          opacity: 0.7,
          color: '#BA68C8',
          animation: true
        },
        frequency: {
          bars: 64,
          sensitivity: 1.5,
          color: '#E1BEE7',
          glow: true
        }
      },
      transition_duration_seconds: 35,
      special_effects: {
        particle_burst: true,
        color_cycling: true,
        mandala_overlay: true,
        fractal_zoom: true
      }
    },
    {
      timestamp_minutes: 45,
      settings: {
        starField: {
          density: 200,
          speed: 2.0,
          color: '#FFD700',
          twinkle: true
        },
        spatial: {
          gridSize: 100,
          opacity: 0.9,
          color: '#FDD835',
          animation: true
        },
        frequency: {
          bars: 128,
          sensitivity: 2.0,
          color: '#FFD700',
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
    },
    {
      timestamp_minutes: 55,
      settings: {
        starField: {
          density: 100,
          speed: 0.8,
          color: '#00BCD4',
          twinkle: true
        },
        spatial: {
          gridSize: 50,
          opacity: 0.4,
          color: '#80DEEA',
          animation: true
        },
        frequency: {
          bars: 32,
          sensitivity: 1.0,
          color: '#B2EBF2',
          glow: true
        }
      },
      transition_duration_seconds: 20,
      special_effects: {
        particle_burst: false,
        color_cycling: false,
        mandala_overlay: false,
        fractal_zoom: false
      }
    }
  ],

  // Pre-session preparation
  preparation: {
    duration_minutes: 5,
    instructions: [
      'Lie down comfortably and place hands over heart',
      'Set healing intention for specific area or general wellness',
      'Visualize golden healing light entering through crown chakra',
      'Take deep breaths and surrender to the healing process'
    ],
    breathing_pattern: {
      inhale_seconds: 4,
      hold_seconds: 4,
      exhale_seconds: 6,
      cycles: 8
    },
    affirmations: [
      'Every cell in my body vibrates with perfect health',
      'I am open to receiving divine healing energy',
      'My body knows how to heal itself completely'
    ]
  },
  
  // Post-session integration
  integration: {
    duration_minutes: 5,
    instructions: [
      'Place hands over any area that received healing focus',
      'Feel the subtle energy shifts in your body',
      'Drink plenty of water to support the healing process',
      'Rest for at least 10 minutes after this session'
    ],
    affirmations: [
      'Healing energy continues to work throughout my being',
      'I trust my body\'s natural healing wisdom',
      'I am grateful for this healing experience'
    ]
  }
};

// ==================================================================
// ADHD GAMMA FOCUS BLAST - 30 MINUTES
// ==================================================================

export const ADHD_GAMMA_FOCUS_BLAST: ComprehensiveTimerPreset = {
  // Basic info
  id: 'adhd-gamma-focus-blast-30min',
  name: '⚡ ADHD Gamma Focus Blast - 30min',
  description: 'High-intensity gamma wave protocol with 8D spatial stimulation designed specifically for ADHD focus enhancement',
  total_duration: 30,
  transitions_count: 4,
  tags: ['adhd', 'focus', 'gamma', 'concentration', 'productivity', '8D'],
  is_premium: true,
  available: true,
  
  // Enhanced features
  categories: ['adhd', 'focus', 'productivity', 'gamma'],
  difficulty_level: 'intermediate',
  target_states: ['laser focus', 'sustained attention', 'cognitive enhancement', 'mental clarity'],
  contraindications: ['epilepsy', 'seizure disorders', 'severe anxiety'],
  
  // ADHD-specific protocol
  adhd_protocol: {
    type: 'combined',
    gammaFreq: 40,
    intensity: 85,
    duration: 30,

    spatial_config: {
      enabled: true,
      hrtf: true,
      roomSize: 0.3,
      reverbAmount: 0.1,
      spatialWidth: 0.8,
      elevation: 0,
      azimuth: 0,
      movement_speed: 0.06,
      spatial_intensity: 0.8
    },
    adaptiveMode: true
  },
  
  // Advanced transitions
  advanced_transitions: [
    {
      // Phase 1: Beta Activation
      duration_minutes: 5,
      frequency_hz: 16,
      frequency_type: 'Beta',
      left_ear_hz: 144,
      right_ear_hz: 160,
      description: '🚀 Phase 1: Beta Activation (16Hz) - Mental Alertness Boost',
      
      pattern_id: 'vortex-focus-enhancement',
      
      waveform: {
        start: 'sine',
        end: 'square',
        transition_type: 'stepped'
      },
      
      volume_envelope: {
        fade_in_seconds: 15,
        sustain_level: 0.6,
        fade_out_seconds: 10
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.3,
        reverbAmount: 0.1,
        spatialWidth: 0.8,
        elevation: 0,
        azimuth: 0,
        movement_speed: 0.06,
        spatial_intensity: 0.8
      },
      
      pattern_8d: 'focus-enhancement-cross',
      
      electromagnetic_targets: {
        strength: 0.7,
        coherence: 0.8,
        resonance: 0.7,
        stability: 0.8
      },
      
      visualization_style: {
        color_scheme: 'beta-focus-blue',
        intensity: 0.7,
        animation_speed: 0.6,
        effects: ['attention-beam', 'cognitive-boost', 'focus-tunnel']
      }
    },
    
    {
      // Phase 2: High Beta Concentration
      duration_minutes: 8,
      frequency_hz: 20,
      frequency_type: 'Beta',
      left_ear_hz: 144,
      right_ear_hz: 164,
      description: '🎯 Phase 2: High Beta (20Hz) - Peak Concentration',
      
      pattern_id: 'toroidal-max-resonance',
      
      waveform: {
        start: 'square',
        end: 'triangle',
        transition_type: 'oscillating'
      },
      
      volume_envelope: {
        fade_in_seconds: 10,
        sustain_level: 0.7,
        fade_out_seconds: 15
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.4,
        reverbAmount: 0.15,
        spatialWidth: 1.0,
        elevation: 0.2,
        azimuth: 0,
        movement_speed: 0.08,
        spatial_intensity: 0.9
      },
      
      pattern_8d: 'concentration-sphere',
      
      electromagnetic_targets: {
        strength: 0.8,
        coherence: 0.85,
        resonance: 0.8,
        stability: 0.85
      },
      
      visualization_style: {
        color_scheme: 'high-beta-orange',
        intensity: 0.8,
        animation_speed: 0.8,
        effects: ['concentration-field', 'mental-sharpness', 'cognitive-enhancement']
      }
    },
    
    {
      // Phase 3: Gamma Hyperfocus 
      duration_minutes: 12,
      frequency_hz: 30,
      frequency_type: 'Gamma',
      left_ear_hz: 124,
      right_ear_hz: 164,
      description: '⚡ Phase 3: Gamma Hyperocus (40Hz) - Ultimate ADHD Focus',
      
      pattern_id: 'adhd-focus-gamma',
      
      waveform: {
        start: 'triangle',
        end: 'square',
        transition_type: 'stepped'
      },
      
      volume_envelope: {
        fade_in_seconds: 20,
        sustain_level: 0.8,
        fade_out_seconds: 20
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.2,
        reverbAmount: 0.05,
        spatialWidth: 1.2,
        elevation: 0.4,
        azimuth: 0,
        movement_speed: 0.1,
        spatial_intensity: 1.0
      },
      
      pattern_8d: 'adhd-gamma-matrix',
      
      electromagnetic_targets: {
        strength: 1.0,
        coherence: 0.9,
        resonance: 1.0,
        stability: 0.8
      },
      
      visualization_style: {
        color_scheme: 'gamma-hyperocus',
        intensity: 1.0,
        animation_speed: 1.0,
        effects: ['hyperocus-beam', 'gamma-burst', 'neural-optimization', 'adhd-enhancement']
      }
    },
    
    {
      // Phase 4: Sustained Focus Integration
      duration_minutes: 5,
      frequency_hz: 12,
      frequency_type: 'Alpha',
      left_ear_hz: 124,
      right_ear_hz: 136,
      description: '🧠 Phase 4: Sustained Focus (12Hz) - Calm Concentration',
      
      pattern_id: 'interference-balance',
      
      waveform: {
        start: 'square',
        end: 'sine',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 10,
        sustain_level: 0.5,
        fade_out_seconds: 60
      },
      
      spatial_config: {
        enabled: true,
        hrtf: false,
        roomSize: 0.5,
        reverbAmount: 0.2,
        spatialWidth: 0.8,
        elevation: 0,
        azimuth: 0,
        movement_speed: 0.04,
        spatial_intensity: 0.6
      },
      
      pattern_8d: 'sustained-focus-stabilization',
      
      electromagnetic_targets: {
        strength: 0.7,
        coherence: 0.85,
        resonance: 0.8,
        stability: 0.9
      },
      
      visualization_style: {
        color_scheme: 'calm-focus-green',
        intensity: 0.7,
        animation_speed: 0.4,
        effects: ['sustained-attention', 'calm-alertness', 'focus-maintenance']
      }
    }
  ],

  // Pattern progression optimized for ADHD focus enhancement
  pattern_progression: [
    {
      start_time_minutes: 0,
      end_time_minutes: 5,
      pattern_config: {
        id: 'vortex-beta-activation',
        name: 'Beta Wave Vortex Activation',
        type: 'vortex',
        description: 'Mental alertness boost with focused vortex energy',
        instructions: 'Sit upright, focus on a single point ahead',
        benefits: ['Mental alertness', 'Attention activation', 'Cognitive boost', 'Focus preparation'],
        frequencies: {
          carrier: 144,
          beat: 16,
          range: 'beta'
        },
        duration: 5,
        electromagnetic: {
          fieldStrength: 0.7,
          resonanceFreq: 16,
          coherence: 0.8
        },
        visualization: {
          color: '#2196F3',
          intensity: 0.7,
          pattern: 'vortex-focus-enhancement'
        },
        adhd: {
          protocol: 'beta-activation',
          duration: 5,
          intensity: 70
        }
      },
      transition_duration_seconds: 15,
      transition_type: 'crossfade'
    },
    {
      start_time_minutes: 5,
      end_time_minutes: 13,
      pattern_config: {
        id: 'toroidal-high-beta-concentration',
        name: 'High Beta Concentration Field',
        type: 'toroidal',
        description: 'Peak concentration with toroidal field resonance',
        instructions: 'Maintain unwavering focus on your task',
        benefits: ['Peak concentration', 'Mental sharpness', 'Sustained attention', 'Cognitive enhancement'],
        frequencies: {
          carrier: 144,
          beat: 20,
          range: 'beta'
        },
        duration: 8,
        electromagnetic: {
          fieldStrength: 0.8,
          resonanceFreq: 20,
          coherence: 0.85
        },
        visualization: {
          color: '#FF9800',
          intensity: 0.8,
          pattern: 'toroidal-max-resonance'
        },
        adhd: {
          protocol: 'high-beta-concentration',
          duration: 8,
          intensity: 80
        }
      },
      transition_duration_seconds: 20,
      transition_type: 'morph'
    },
    {
      start_time_minutes: 13,
      end_time_minutes: 25,
      pattern_config: {
        id: 'custom-gamma-hyperfocus',
        name: 'Gamma Hyperfocus Matrix',
        type: 'custom',
        description: 'Ultimate ADHD focus enhancement with gamma wave synchronization',
        instructions: 'Channel all attention into laser-focused work',
        benefits: ['Hyperfocus state', 'Gamma burst activation', 'Neural optimization', 'ADHD enhancement', 'Peak performance'],
        frequencies: {
          carrier: 124,
          beat: 30,
          range: 'gamma'
        },
        duration: 12,
        electromagnetic: {
          fieldStrength: 1.0,
          resonanceFreq: 40,
          coherence: 0.9
        },
        visualization: {
          color: '#E91E63',
          intensity: 1.0,
          pattern: 'adhd-focus-gamma'
        },
        adhd: {
          protocol: 'gamma-hyperfocus',
          duration: 12,
          intensity: 100
        }
      },
      transition_duration_seconds: 30,
      transition_type: 'morph'
    },
    {
      start_time_minutes: 25,
      end_time_minutes: 30,
      pattern_config: {
        id: 'interference-sustained-focus',
        name: 'Sustained Focus Integration',
        type: 'interference',
        description: 'Calm concentrated state for continued productivity',
        instructions: 'Settle into sustained focused work mode',
        benefits: ['Sustained attention', 'Calm alertness', 'Focus maintenance', 'Productive flow state'],
        frequencies: {
          carrier: 124,
          beat: 12,
          range: 'alpha'
        },
        duration: 5,
        electromagnetic: {
          fieldStrength: 0.7,
          resonanceFreq: 12,
          coherence: 0.85
        },
        visualization: {
          color: '#4CAF50',
          intensity: 0.7,
          pattern: 'interference-balance'
        },
        adhd: {
          protocol: 'sustained-focus',
          duration: 5,
          intensity: 70
        }
      },
      transition_duration_seconds: 15,
      transition_type: 'crossfade'
    }
  ],

  // 8D Spatial configuration optimized for ADHD
  spatial_8d_config: {
    enabled: true,
    movement_progression: [
      {
        start_time_minutes: 0,
        pattern_type: 'figure8',
        speed: 0.46,
        radius: 40,
        elevation_range: [6, 9],
        direction: 'alternating'
      },
      {
        start_time_minutes: 5,
        pattern_type: 'circular',
        speed: 0.08,
        radius: 50,
        elevation_range: [-15, 15],
        direction: 'clockwise'
      },
      {
        start_time_minutes: 13,
        pattern_type: 'infinity',
        speed: 0.1,
        radius: 60,
        elevation_range: [-30, 30],
        direction: 'counterclockwise'
      },
      {
        start_time_minutes: 25,
        pattern_type: 'circular',
        speed: 0.04,
        radius: 40,
        elevation_range: [33, 66],
        direction: 'clockwise'
      }
    ],
    hrtf_enabled: true,
    room_acoustics: {
      size: 'small',
      reverb: 0.1,
      absorption: 0.7
    },
    distance_modulation: {
      min_distance: 15,
      max_distance: 50,
      modulation_speed: 0.02
    }
  },

  // Electromagnetic field progression optimized for ADHD focus
  electromagnetic_progression: [
    {
      timestamp_minutes: 0,
      field_config: {
        strength: 0.7,
        frequency: 16,
        phase: 0,
        coherence: 0.8,
        resonance: 0.7,
        state: 'ACTIVE',
        stability: 0.8
      },
      transition_duration_seconds: 15,
      resonance_targets: {
        brain_waves: 'beta'
      }
    },
    {
      timestamp_minutes: 5,
      field_config: {
        strength: 0.8,
        frequency: 20,
        phase: 90,
        coherence: 0.85,
        resonance: 0.8,
        state: 'RESONANT',
        stability: 0.85
      },
      transition_duration_seconds: 20,
      resonance_targets: {
        brain_waves: 'beta'
      }
    },
    {
      timestamp_minutes: 13,
      field_config: {
        strength: 1.0,
        frequency: 40,
        phase: 180,
        coherence: 0.9,
        resonance: 1.0,
        state: 'CRITICAL',
        stability: 0.8
      },
      transition_duration_seconds: 30,
      resonance_targets: {
        brain_waves: 'gamma'
      }
    },
    {
      timestamp_minutes: 25,
      field_config: {
        strength: 0.7,
        frequency: 12,
        phase: 0,
        coherence: 0.85,
        resonance: 0.8,
        state: 'ACTIVE',
        stability: 0.9
      },
      transition_duration_seconds: 15,
      resonance_targets: {
        brain_waves: 'alpha'
      }
    }
  ],

  // Visualization progression evolving through ADHD focus session
  visualization_progression: [
    {
      timestamp_minutes: 0,
      settings: {
        starField: {
          density: 60,
          speed: 1.2,
          color: '#2196F3',
          twinkle: true
        },
        spatial: {
          gridSize: 30,
          opacity: 0.6,
          color: '#1976D2',
          animation: true
        },
        frequency: {
          bars: 32,
          sensitivity: 1.2,
          color: '#42A5F5',
          glow: true
        }
      },
      transition_duration_seconds: 15,
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
          speed: 1.5,
          color: '#FF9800',
          twinkle: true
        },
        spatial: {
          gridSize: 50,
          opacity: 0.7,
          color: '#F57C00',
          animation: true
        },
        frequency: {
          bars: 64,
          sensitivity: 1.5,
          color: '#FFB74D',
          glow: true
        }
      },
      transition_duration_seconds: 20,
      special_effects: {
        particle_burst: true,
        color_cycling: false,
        mandala_overlay: false,
        fractal_zoom: false
      }
    },
    {
      timestamp_minutes: 13,
      settings: {
        starField: {
          density: 150,
          speed: 2.0,
          color: '#E91E63',
          twinkle: true
        },
        spatial: {
          gridSize: 80,
          opacity: 0.9,
          color: '#C2185B',
          animation: true
        },
        frequency: {
          bars: 128,
          sensitivity: 2.0,
          color: '#F06292',
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
    },
    {
      timestamp_minutes: 25,
      settings: {
        starField: {
          density: 80,
          speed: 1.0,
          color: '#4CAF50',
          twinkle: true
        },
        spatial: {
          gridSize: 40,
          opacity: 0.5,
          color: '#388E3C',
          animation: true
        },
        frequency: {
          bars: 32,
          sensitivity: 1.0,
          color: '#66BB6A',
          glow: true
        }
      },
      transition_duration_seconds: 15,
      special_effects: {
        particle_burst: false,
        color_cycling: false,
        mandala_overlay: false,
        fractal_zoom: false
      }
    }
  ],

  // Pre-session preparation
  preparation: {
    duration_minutes: 2,
    instructions: [
      'Sit upright in a comfortable chair',
      'Clear your workspace of all distractions',
      'Set a specific focus goal for this session',
      'Take 3 energizing breaths to activate your mind'
    ],
    breathing_pattern: {
      inhale_seconds: 3,
      hold_seconds: 2,
      exhale_seconds: 3,
      cycles: 5
    },
    affirmations: [
      'My mind is sharp and focused',
      'I can concentrate deeply on any task',
      'My attention is laser-focused and sustained'
    ]
  },
  
  // Post-session integration
  integration: {
    duration_minutes: 2,
    instructions: [
      'Immediately begin your focused work task',
      'Maintain this heightened focus state',
      'Notice the enhanced clarity and concentration',
      'Use this optimal state for your most important work'
    ],
    affirmations: [
      'I maintain this focus throughout my work',
      'My concentration continues to improve',
      'I am in complete command of my attention'
    ]
  }
};

// ==================================================================
// IMPORT ALL PRESET COLLECTIONS
// ==================================================================

import { LUCID_DREAMING_PRESETS } from './lucidDreamingPreset';
import { TOROIDAL_LOW_FREQUENCY_PRESETS } from './toroidalLowFrequencyExamples';

// ==================================================================
// EXPORT ALL ADVANCED PRESETS
// ==================================================================

export const ADVANCED_TIMER_PRESETS: ComprehensiveTimerPreset[] = [
  // Core advanced presets
  ADVANCED_HEALING_PROTOCOL,
  ADHD_GAMMA_FOCUS_BLAST,
  
  // Lucid dreaming presets
  ...LUCID_DREAMING_PRESETS,
  
  // Toroidal low frequency + loop presets
  ...TOROIDAL_LOW_FREQUENCY_PRESETS
];

// ==================================================================
// PRESET TEMPLATES FOR DIFFERENT USE CASES
// ==================================================================

export const PRESET_CREATION_EXAMPLES = {
  // Template for creating a lucid dreaming preset
  LUCID_DREAMING_TEMPLATE: {
    duration: 45,
    primary_frequency: 6, // Theta
    spatial_enabled: true,
    key_phases: [
      'relaxation (alpha)',
      'transition (theta)', 
      'lucid induction (sustained theta)',
      'rem enhancement (theta + gamma bursts)',
      'gentle awakening (alpha)'
    ],
    special_features: [
      '6Hz sustained theta for lucid states',
      '40Hz gamma bursts for awareness',
      'Spiral 8D movement for dream navigation',
      'Theta-optimized electromagnetic field'
    ]
  },
  
  // Template for creativity sessions
  CREATIVITY_BOOST_TEMPLATE: {
    duration: 25,
    primary_frequency: 8, // Alpha-theta border
    spatial_enabled: true,
    key_phases: [
      'alpha relaxation (10Hz)',
      'creative alpha (8Hz)',
      'theta inspiration (6Hz)',
      'insight integration (10Hz)'
    ],
    special_features: [
      'Alpha-theta crossover for creativity',
      'Figure-8 spatial movement for brain hemisphere sync',
      'Creative vortex pattern visualization',
      'Inspiration-enhancing electromagnetic field'
    ]
  }
};