// Electromagnetic Beat Lab - Comprehensive Timer Preset Template
// Template that showcases ALL available functionality for creating powerful presets

import type { 
  PatternConfig,
  SpatialAudioConfig,
  ElectromagneticField,
  VisualizationSettings,
  ADHDProtocol,
  TimerPreset,
  FrequencyTransition
} from '../../types';

// ==================================================================
// COMPREHENSIVE TIMER PRESET INTERFACE
// ==================================================================

export interface ComprehensiveTimerPreset extends TimerPreset {
  // Enhanced timer features
  categories: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  target_states: string[];
  contraindications?: string[];
  
  // Advanced loop configuration
  loop_config?: {
    enabled: boolean;
    type: 'infinite' | 'count' | 'duration';
    count?: number; // For 'count' type
    duration_hours?: number; // For 'duration' type
    loop_scope: 'full_preset' | 'specific_phases' | 'maintenance_phase';
    specific_phases?: number[]; // Phase indices to loop
    fade_between_loops?: boolean;
    loop_transition_seconds?: number;
  };
  
  // Advanced frequency transitions with full configuration
  advanced_transitions: AdvancedFrequencyTransition[];
  
  // Pattern progression through session
  pattern_progression: PatternProgression[];
  
  // 8D spatial movement configuration
  spatial_8d_config: Spatial8DConfig;
  
  // Electromagnetic field control
  electromagnetic_progression: ElectromagneticProgression[];
  
  // Visual settings that evolve during session
  visualization_progression: VisualizationProgression[];
  
  // ADHD-specific protocols if applicable
  adhd_protocol?: ADHDProtocol;
  
  // YouTube integration for guided sessions
  youtube_integration?: YouTubeIntegration;
  
  // Pre and post session activities
  preparation?: SessionActivity;
  integration?: SessionActivity;
}

// ==================================================================
// ENHANCED FREQUENCY TRANSITION
// ==================================================================

export interface AdvancedFrequencyTransition extends FrequencyTransition {
  // Pattern to use during this transition
  pattern_id: string;
  
  // Waveform progression
  waveform: {
    start: 'sine' | 'square' | 'triangle' | 'sawtooth';
    end: 'sine' | 'square' | 'triangle' | 'sawtooth';
    transition_type: 'smooth' | 'stepped' | 'oscillating';
  };
  
  // Volume envelope
  volume_envelope: {
    fade_in_seconds: number;
    sustain_level: number;
    fade_out_seconds: number;
  };
  
  // Spatial audio settings
  spatial_config: SpatialAudioConfig;
  
  // 8D pattern movement
  pattern_8d: string; // Pattern8D ID
  
  // Electromagnetic field targets
  electromagnetic_targets: {
    strength: number;
    coherence: number;
    resonance: number;
    stability: number;
  };
  
  // Visualization style
  visualization_style: {
    color_scheme: string;
    intensity: number;
    animation_speed: number;
    effects: string[];
  };
  
  // Transition effects
  transition_effects?: {
    sweep_duration?: number;
    crossfade_duration?: number;
    harmonic_blending?: boolean;
  };
}

// ==================================================================
// PATTERN PROGRESSION
// ==================================================================

export interface PatternProgression {
  start_time_minutes: number;
  end_time_minutes: number;
  pattern_config: PatternConfig;
  transition_duration_seconds: number;
  transition_type: 'instant' | 'crossfade' | 'morph';
}

// ==================================================================
// SPATIAL 8D CONFIGURATION
// ==================================================================

export interface Spatial8DConfig {
  enabled: boolean;
  
  // Movement patterns throughout session
  movement_progression: {
    start_time_minutes: number;
    pattern_type: 'circular' | 'figure8' | 'spiral' | 'infinity' | 'custom';
    speed: number;
    radius: number;
    elevation_range: [number, number];
    direction: 'clockwise' | 'counterclockwise' | 'alternating';
  }[];
  
  // Spatial audio enhancement
  hrtf_enabled: boolean;
  room_acoustics: {
    size: 'small' | 'medium' | 'large' | 'cathedral';
    reverb: number;
    absorption: number;
  };
  
  // Distance modulation
  distance_modulation: {
    min_distance: number;
    max_distance: number;
    modulation_speed: number;
  };
}

// ==================================================================
// ELECTROMAGNETIC PROGRESSION
// ==================================================================

export interface ElectromagneticProgression {
  timestamp_minutes: number;
  field_config: ElectromagneticField;
  transition_duration_seconds: number;
  resonance_targets: {
    brain_waves: 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';
    chakra_alignment?: string;
    healing_frequency?: number;
  };
}

// ==================================================================
// VISUALIZATION PROGRESSION
// ==================================================================

export interface VisualizationProgression {
  timestamp_minutes: number;
  settings: VisualizationSettings;
  transition_duration_seconds: number;
  special_effects?: {
    particle_burst?: boolean;
    color_cycling?: boolean;
    mandala_overlay?: boolean;
    fractal_zoom?: boolean;
  };
}

// ==================================================================
// YOUTUBE INTEGRATION
// ==================================================================

export interface YouTubeIntegration {
  video_id?: string;
  start_timestamp?: number;
  sync_mode: 'audio' | 'visual' | 'both' | 'none';
  volume_mix: number; // 0-1, how much YouTube vs binaural
  guided_segments?: {
    timestamp_minutes: number;
    instruction: string;
    duration_seconds: number;
  }[];
}

// ==================================================================
// SESSION ACTIVITIES
// ==================================================================

export interface SessionActivity {
  duration_minutes: number;
  instructions: string[];
  breathing_pattern?: {
    inhale_seconds: number;
    hold_seconds: number;
    exhale_seconds: number;
    cycles: number;
  };
  visualization_guide?: string[];
  affirmations?: string[];
}

// ==================================================================
// EXAMPLE COMPREHENSIVE PRESET TEMPLATE
// ==================================================================

export const ULTIMATE_CONSCIOUSNESS_EXPANSION_TEMPLATE: ComprehensiveTimerPreset = {
  // Basic timer info
  id: 'ultimate-consciousness-expansion-90min',
  name: '🌌 Ultimate Consciousness Expansion - 90min',
  description: 'Complete journey through all brainwave states with full 8D spatial audio, electromagnetic field progression, and visual synchronization',
  total_duration: 90,
  transitions_count: 7,
  tags: ['consciousness', 'spiritual', 'advanced', '8D', 'electromagnetic', 'complete'],
  is_premium: true,
  available: true,
  
  // Enhanced features
  categories: ['meditation', 'consciousness', 'spiritual', 'healing', 'transformation'],
  difficulty_level: 'expert',
  target_states: ['expanded consciousness', 'deep meditation', 'spiritual insight', 'energy healing', 'chakra alignment'],
  contraindications: ['epilepsy', 'heart conditions', 'recent surgery', 'pregnancy'],
  
  // Advanced frequency transitions
  advanced_transitions: [
    {
      // Phase 1: Grounding & Preparation
      duration_minutes: 10,
      frequency_hz: 7.83, // Schumann Resonance
      frequency_type: 'Alpha',
      left_ear_hz: 110,
      right_ear_hz: 117.83,
      description: '🌍 Phase 1: Earth Grounding (Schumann Resonance 7.83Hz)',
      
      pattern_id: 'toroidal-max-resonance',
      
      waveform: {
        start: 'sine',
        end: 'sine',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 30,
        sustain_level: 0.3,
        fade_out_seconds: 10
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.3,
        reverbAmount: 0.1,
        spatialWidth: 0.5,
        elevation: 0,
        azimuth: 0,
        movement_speed: 0.02,
        spatial_intensity: 0.3
      },
      
      pattern_8d: 'gentle-circle',
      
      electromagnetic_targets: {
        strength: 0.4,
        coherence: 0.6,
        resonance: 0.5,
        stability: 0.8
      },
      
      visualization_style: {
        color_scheme: 'earth-tones',
        intensity: 0.4,
        animation_speed: 0.3,
        effects: ['gentle-pulse', 'grounding-field']
      }
    },
    
    {
      // Phase 2: Alpha Activation
      duration_minutes: 15,
      frequency_hz: 10,
      frequency_type: 'Alpha',
      left_ear_hz: 120,
      right_ear_hz: 130,
      description: '🧘 Phase 2: Alpha Activation (10Hz) - Relaxed Awareness',
      
      pattern_id: 'vortex-focus-enhancement',
      
      waveform: {
        start: 'sine',
        end: 'sine',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 15,
        sustain_level: 0.4,
        fade_out_seconds: 15
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.5,
        reverbAmount: 0.2,
        spatialWidth: 0.7,
        elevation: 0,
        azimuth: 0,
        movement_speed: 0.04,
        spatial_intensity: 0.5
      },
      
      pattern_8d: 'expanding-spiral',
      
      electromagnetic_targets: {
        strength: 0.6,
        coherence: 0.7,
        resonance: 0.6,
        stability: 0.8
      },
      
      visualization_style: {
        color_scheme: 'alpha-gold',
        intensity: 0.6,
        animation_speed: 0.5,
        effects: ['wave-patterns', 'golden-spirals']
      },
      
      transition_effects: {
        crossfade_duration: 30,
        harmonic_blending: true
      }
    },
    
    {
      // Phase 3: Theta Gateway
      duration_minutes: 20,
      frequency_hz: 6,
      frequency_type: 'Theta',
      left_ear_hz: 432,
      right_ear_hz: 438,
      description: '✨ Phase 3: Theta Gateway (6Hz) - Intuitive Insight',
      
      pattern_id: 'spiral-transformation',
      
      waveform: {
        start: 'sine',
        end: 'triangle',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 20,
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
        movement_speed: 0.06,
        spatial_intensity: 0.7,
        reverberance: 0.6
      },
      
      pattern_8d: 'theta-infinity',
      
      electromagnetic_targets: {
        strength: 0.8,
        coherence: 0.8,
        resonance: 0.7,
        stability: 0.7
      },
      
      visualization_style: {
        color_scheme: 'theta-violet',
        intensity: 0.8,
        animation_speed: 0.6,
        effects: ['mandala-rotation', 'sacred-geometry', 'chakra-alignment']
      }
    },
    
    {
      // Phase 4: Deep Theta Immersion
      duration_minutes: 15,
      frequency_hz: 4,
      frequency_type: 'Theta',
      left_ear_hz: 120,
      right_ear_hz: 116,
      description: '🕳️ Phase 4: Deep Theta (4Hz) - Profound States',
      
      pattern_id: 'standing-wave-meditation',
      
      waveform: {
        start: 'triangle',
        end: 'sine',
        transition_type: 'oscillating'
      },
      
      volume_envelope: {
        fade_in_seconds: 30,
        sustain_level: 0.6,
        fade_out_seconds: 30
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 1.0,
        reverbAmount: 0.6,
        spatialWidth: 1.0,
        elevation: 0.3,
        azimuth: 0,
        movement_speed: 0.03,
        spatial_intensity: 0.9,
        room_scale: 1.5
      },
      
      pattern_8d: 'deep-meditation-sphere',
      
      electromagnetic_targets: {
        strength: 0.9,
        coherence: 0.9,
        resonance: 0.8,
        stability: 0.9
      },
      
      visualization_style: {
        color_scheme: 'deep-indigo',
        intensity: 0.9,
        animation_speed: 0.2,
        effects: ['void-space', 'consciousness-fractals', 'unity-field']
      }
    },
    
    {
      // Phase 5: Gamma Awakening
      duration_minutes: 10,
      frequency_hz: 40,
      frequency_type: 'Gamma',
      left_ear_hz: 432,
      right_ear_hz: 472,
      description: '⚡ Phase 5: Gamma Awakening (40Hz) - Higher Consciousness',
      
      pattern_id: 'toroidal-max-resonance',
      
      waveform: {
        start: 'sine',
        end: 'square',
        transition_type: 'stepped'
      },
      
      volume_envelope: {
        fade_in_seconds: 20,
        sustain_level: 0.7,
        fade_out_seconds: 20
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.8,
        reverbAmount: 0.3,
        spatialWidth: 1.2,
        elevation: 0.5,
        azimuth: 0,
        movement_speed: 0.08,
        spatial_intensity: 1.0
      },
      
      pattern_8d: 'gamma-activation-cross',
      
      electromagnetic_targets: {
        strength: 1.0,
        coherence: 0.95,
        resonance: 1.0,
        stability: 0.85
      },
      
      visualization_style: {
        color_scheme: 'gamma-white-gold',
        intensity: 1.0,
        animation_speed: 1.0,
        effects: ['lightning-bursts', 'crown-activation', 'light-body']
      }
    },
    
    {
      // Phase 6: Integration Alpha
      duration_minutes: 15,
      frequency_hz: 8,
      frequency_type: 'Alpha',
      left_ear_hz: 432,
      right_ear_hz: 440,
      description: '🔄 Phase 6: Integration (8Hz) - Wisdom Integration',
      
      pattern_id: 'helix-dna-activation',
      
      waveform: {
        start: 'square',
        end: 'sine',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 15,
        sustain_level: 0.4,
        fade_out_seconds: 20
      },
      
      spatial_config: {
        enabled: true,
        hrtf: true,
        roomSize: 0.6,
        reverbAmount: 0.2,
        spatialWidth: 0.8,
        elevation: 0.1,
        azimuth: 0,
        movement_speed: 0.04,
        spatial_intensity: 0.6
      },
      
      pattern_8d: 'integration-helix',
      
      electromagnetic_targets: {
        strength: 0.7,
        coherence: 0.8,
        resonance: 0.7,
        stability: 0.9
      },
      
      visualization_style: {
        color_scheme: 'integration-rainbow',
        intensity: 0.7,
        animation_speed: 0.4,
        effects: ['dna-spirals', 'cellular-harmony', 'energy-weaving']
      }
    },
    
    {
      // Phase 7: Grounding Return
      duration_minutes: 5,
      frequency_hz: 7.83, // Back to Schumann
      frequency_type: 'Alpha',
      left_ear_hz: 120,
      right_ear_hz: 127.83,
      description: '🌍 Phase 7: Grounding Return (7.83Hz) - Earth Connection',
      
      pattern_id: 'interference-balance',
      
      waveform: {
        start: 'sine',
        end: 'sine',
        transition_type: 'smooth'
      },
      
      volume_envelope: {
        fade_in_seconds: 5,
        sustain_level: 0.3,
        fade_out_seconds: 60
      },
      
      spatial_config: {
        enabled: true,
        hrtf: false,
        roomSize: 0.3,
        reverbAmount: 0.1,
        spatialWidth: 0.5,
        elevation: 0,
        azimuth: 0,
        movement_speed: 0.02,
        spatial_intensity: 0.3
      },
      
      pattern_8d: 'grounding-return',
      
      electromagnetic_targets: {
        strength: 0.4,
        coherence: 0.7,
        resonance: 0.5,
        stability: 1.0
      },
      
      visualization_style: {
        color_scheme: 'earth-completion',
        intensity: 0.4,
        animation_speed: 0.2,
        effects: ['roots-deep', 'integration-complete']
      }
    }
  ],
  
  // Pattern progression (simplified for template)
  pattern_progression: [
    {
      start_time_minutes: 0,
      end_time_minutes: 10,
      pattern_config: {} as PatternConfig, // Would reference actual pattern
      transition_duration_seconds: 30,
      transition_type: 'crossfade'
    }
    // ... more pattern progressions
  ],
  
  // 8D Spatial configuration
  spatial_8d_config: {
    enabled: true,
    movement_progression: [
      {
        start_time_minutes: 0,
        pattern_type: 'circular',
        speed: 0.02,
        radius: 50,
        elevation_range: [0, 0],
        direction: 'clockwise'
      },
      {
        start_time_minutes: 25,
        pattern_type: 'spiral',
        speed: 0.04,
        radius: 100,
        elevation_range: [-30, 30],
        direction: 'alternating'
      },
      {
        start_time_minutes: 45,
        pattern_type: 'infinity',
        speed: 0.06,
        radius: 150,
        elevation_range: [-45, 45],
        direction: 'counterclockwise'
      },
      {
        start_time_minutes: 70,
        pattern_type: 'circular',
        speed: 0.02,
        radius: 50,
        elevation_range: [0, 0],
        direction: 'clockwise'
      }
    ],
    hrtf_enabled: true,
    room_acoustics: {
      size: 'cathedral',
      reverb: 0.4,
      absorption: 0.2
    },
    distance_modulation: {
      min_distance: 10,
      max_distance: 100,
      modulation_speed: 0.01
    }
  },
  
  // Electromagnetic progression (simplified)
  electromagnetic_progression: [
    {
      timestamp_minutes: 0,
      field_config: {
        strength: 0.4,
        frequency: 7.83,
        phase: 0,
        coherence: 0.6,
        resonance: 0.5,
        state: 'ACTIVE',
        stability: 0.8
      },
      transition_duration_seconds: 30,
      resonance_targets: {
        brain_waves: 'alpha',
        chakra_alignment: 'root'
      }
    }
    // ... more electromagnetic progressions
  ],
  
  // Visualization progression (simplified)
  visualization_progression: [
    {
      timestamp_minutes: 0,
      settings: {
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
      transition_duration_seconds: 30
    }
    // ... more visualization progressions
  ],
  
  // Pre-session preparation
  preparation: {
    duration_minutes: 5,
    instructions: [
      'Find a comfortable position lying down or sitting upright',
      'Close your eyes and take 3 deep, cleansing breaths',
      'Set your intention for this consciousness expansion journey',
      'Allow yourself to completely surrender to the experience'
    ],
    breathing_pattern: {
      inhale_seconds: 4,
      hold_seconds: 4,
      exhale_seconds: 6,
      cycles: 5
    },
    affirmations: [
      'I am open to expanded consciousness',
      'I trust in the wisdom of my higher self',
      'I am safe and protected during this journey'
    ]
  },
  
  // Post-session integration
  integration: {
    duration_minutes: 10,
    instructions: [
      'Slowly wiggle your fingers and toes',
      'Take several deep breaths to ground yourself',
      'Sit with any insights or experiences that arose',
      'Drink water to help integrate the energy shifts',
      'Journal any visions, thoughts, or feelings'
    ],
    breathing_pattern: {
      inhale_seconds: 3,
      hold_seconds: 2,
      exhale_seconds: 4,
      cycles: 10
    },
    affirmations: [
      'I integrate this experience with wisdom and grace',
      'I carry this expanded awareness into my daily life',
      'I am grateful for this journey of consciousness'
    ]
  }
};

// ==================================================================
// PRESET CATEGORY TEMPLATES
// ==================================================================

export const PRESET_TEMPLATES = {
  BEGINNER_MEDITATION: 'Simple meditation with basic alpha/theta progression',
  ADVANCED_HEALING: 'Complex healing journey with full electromagnetic field control',
  ADHD_FOCUS: 'Gamma-wave enhanced focus protocol with spatial audio',
  LUCID_DREAMING: 'Theta-dominant pattern for lucid dream induction',
  CREATIVITY_BOOST: 'Alpha/theta mix with creative visualization patterns',
  DEEP_SLEEP: 'Delta progression for restorative sleep',
  CONSCIOUSNESS_EXPANSION: 'Full-spectrum brainwave journey with 8D immersion'
};

export const AVAILABLE_FEATURES = {
  PATTERNS: [
    'toroidal-max-resonance',
    'toroidal-healing', 
    'vortex-focus-enhancement',
    'vortex-creativity',
    'spiral-transformation',
    'helix-dna-activation',
    'interference-balance',
    'standing-wave-meditation'
  ],
  SPATIAL_8D: [
    'circular',
    'figure8', 
    'spiral',
    'infinity',
    'custom'
  ],
  WAVEFORMS: ['sine', 'square', 'triangle', 'sawtooth'],
  BRAINWAVE_STATES: ['delta', 'theta', 'alpha', 'beta', 'gamma'],
  VISUALIZATION_EFFECTS: [
    'gentle-pulse',
    'grounding-field',
    'wave-patterns',
    'golden-spirals',
    'mandala-rotation',
    'sacred-geometry',
    'chakra-alignment',
    'void-space',
    'consciousness-fractals',
    'unity-field',
    'lightning-bursts',
    'crown-activation',
    'light-body',
    'dna-spirals',
    'cellular-harmony',
    'energy-weaving',
    'roots-deep',
    'integration-complete'
  ]
};
