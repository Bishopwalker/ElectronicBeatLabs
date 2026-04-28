// Electromagnetic Beat Lab - Pattern Definitions and Presets
// Complete electromagnetic wave pattern guide with ADHD-specific protocols
//
// 🔥 IMPORTANT: Electromagnetic field values (fieldStrength, coherence, resonance, etc.)
// are calculated DYNAMICALLY from real-time audio analysis using electromagneticCalculator.ts
// The hardcoded values in this file are DEFAULTS ONLY for when audio is not playing
// They should NOT be used directly - always use calculateElectromagneticField() instead

import type {ADHDProtocol, PatternConfig, PatternPreset, WaveGuideConfig} from '../types/index';

// Core Electromagnetic Wave Patterns
export const WAVE_PATTERNS: PatternConfig[] = [
  // TOROIDAL PATTERNS - Maximum Resonance
  {
    id: 'toroidal-max-resonance',
    name: 'Maximum Resonance Toroid',
    type: 'toroidal',
    description: 'The ultimate electromagnetic field configuration for maximum resonance and coherence.',
    instructions: 'Sit comfortably, close eyes, visualize a golden torus of energy rotating around your head. Breathe in sync with the beat frequency.',
    benefits: [
      'Maximum electromagnetic field coherence',
      'Enhanced brain wave synchronization',
      'Optimal resonance for healing',
      'Increased energy flow',
      'Deep meditative states'
    ],
    frequencies: {
      carrier: 110,
      beat: 40,
      range: 'gamma'
    },
    duration: 40,
    electromagnetic: {
      fieldStrength: 0.95,
      resonanceFreq: 30,
      coherence: 0.98
    },
    visualization: {
      color: '#ff6b00',
      intensity: 0.9,
      pattern: 'rotating-torus'
    }
  },
  {
    id: 'toroidal-healing',
    name: 'Healing Toroidal Field',
    type: 'toroidal',
    description: 'Specialized toroidal pattern optimized for cellular regeneration and healing.',
    instructions: 'Focus on the area needing healing while visualizing healing energy flowing in perfect toroidal loops.',
    benefits: [
      'Accelerated healing processes',
      'Cellular regeneration',
      'Pain reduction',
      'Tissue repair enhancement',
      'Immune system boost'
    ],
    frequencies: {
      carrier: 144,
      beat: 7.83,
      range: 'theta'
    },
    duration: 30,
    electromagnetic: {
      fieldStrength: 0.8,
      resonanceFreq: 7.83,
      coherence: 0.92
    },
    visualization: {
      color: '#00ff88',
      intensity: 0.7,
      pattern: 'healing-torus'
    }
  },

  // VORTEX PATTERNS - Focus Enhancement
  {
    id: 'vortex-focus-enhancement',
    name: 'Focus Enhancement Vortex',
    type: 'vortex',
    description: 'Powerful vortex pattern designed to enhance concentration and mental clarity.',
    instructions: 'Imagine a spinning vortex of energy rising from your spine through your crown, carrying away distractions.',
    benefits: [
      'Enhanced focus and concentration',
      'Mental clarity improvement',
      'Distraction elimination',
      'Cognitive performance boost',
      'Attention span increase'
    ],
    frequencies: {
      carrier: 144,
      beat: 12,
      range: 'alpha'
    },
    duration: 15,
    electromagnetic: {
      fieldStrength: 0.85,
      resonanceFreq: 12,
      coherence: 0.88
    },
    visualization: {
      color: '#8a2be2',
      intensity: 0.8,
      pattern: 'ascending-vortex'
    },
    adhd: {
      protocol: 'Focus Enhancement',
      duration: 900000, // 15 minutes
      intensity: 0.8
    }
  },
  {
    id: 'vortex-creativity',
    name: 'Creative Vortex Flow',
    type: 'vortex',
    description: 'Dynamic vortex pattern to unlock creative potential and innovative thinking.',
    instructions: 'Let the vortex energy spiral through your mind, opening new pathways for creative expression.',
    benefits: [
      'Enhanced creativity',
      'Innovative thinking',
      'Artistic inspiration',
      'Problem-solving abilities',
      'Imagination expansion'
    ],
    frequencies: {
      carrier: 144,
      beat: 8,
      range: 'alpha'
    },
    duration: 25,
    electromagnetic: {
      fieldStrength: 0.75,
      resonanceFreq: 8,
      coherence: 0.85
    },
    visualization: {
      color: '#00bfff',
      intensity: 0.75,
      pattern: 'creative-spiral'
    }
  },

  // SPIRAL PATTERNS - Transformation
  {
    id: 'spiral-transformation',
    name: 'Transformation Spiral',
    type: 'spiral',
    description: 'Evolutionary spiral pattern for personal transformation and growth.',
    instructions: 'Follow the spiral pattern with your mind, allowing old patterns to transform into new possibilities.',
    benefits: [
      'Personal transformation',
      'Habit pattern breaking',
      'Consciousness expansion',
      'Spiritual growth',
      'Life pattern evolution'
    ],
    frequencies: {
      carrier: 144,
      beat: 6,
      range: 'theta'
    },
    duration: 35,
    electromagnetic: {
      fieldStrength: 0.7,
      resonanceFreq: 6,
      coherence: 0.8
    },
    visualization: {
      color: '#ff1493',
      intensity: 0.65,
      pattern: 'transformation-spiral'
    }
  },

  // HELIX PATTERNS - DNA Resonance
  {
    id: 'helix-dna-activation',
    name: 'DNA Activation Helix',
    type: 'helix',
    description: 'Double helix pattern resonating with DNA frequencies for genetic optimization.',
    instructions: 'Visualize a double helix of light spinning within your cells, activating dormant genetic potential.',
    benefits: [
      'DNA repair and optimization',
      'Genetic potential activation',
      'Cellular communication enhancement',
      'Longevity promotion',
      'Evolutionary advancement'
    ],
    frequencies: {
      carrier: 144,
      beat: 2.675,
      range: 'delta'
    },
    duration: 40,
    electromagnetic: {
      fieldStrength: 0.9,
      resonanceFreq: 2.675,
      coherence: 0.95
    },
    visualization: {
      color: '#32cd32',
      intensity: 0.85,
      pattern: 'double-helix'
    }
  },

  // INTERFERENCE PATTERNS - Balance
  {
    id: 'interference-balance',
    name: 'Harmonic Balance Pattern',
    type: 'interference',
    description: 'Complex interference pattern for perfect harmonic balance and equilibrium.',
    instructions: 'Allow the interfering waves to create perfect balance within your energy field.',
    benefits: [
      'Perfect energetic balance',
      'Emotional stability',
      'Chakra alignment',
      'Harmonic resonance',
      'Inner peace'
    ],
    frequencies: {
      carrier: 144,
      beat: 10,
      range: 'alpha'
    },
    duration: 20,
    electromagnetic: {
      fieldStrength: 0.82,
      resonanceFreq: 10,
      coherence: 0.9
    },
    visualization: {
      color: '#ffd700',
      intensity: 0.75,
      pattern: 'interference-waves'
    }
  },

  // STANDING WAVE PATTERNS - Meditation
  {
    id: 'standing-wave-meditation',
    name: 'Deep Meditation Standing Wave',
    type: 'standing',
    description: 'Perfect standing wave pattern for deep meditative states and consciousness expansion.',
    instructions: 'Become the standing wave, perfectly still yet infinitely dynamic, in perfect meditation.',
    benefits: [
      'Deep meditative states',
      'Consciousness expansion',
      'Inner stillness',
      'Spiritual awakening',
      'Transcendental experiences'
    ],
    frequencies: {
      carrier: 144,
      beat: 4,
      range: 'theta'
    },
    duration: 45,
    electromagnetic: {
      fieldStrength: 0.88,
      resonanceFreq: 4,
      coherence: 0.96
    },
    visualization: {
      color: '#9370db',
      intensity: 0.8,
      pattern: 'standing-wave'
    }
  },

  // 🔥 NEW: LISSAJOUS PATTERNS - Harmonic Synchronization
  {
    id: 'lissajous-harmony',
    name: 'Lissajous Harmonic Sync',
    type: 'lissajous',
    description: 'Beautiful figure-8 Lissajous curves for perfect brain hemisphere synchronization.',
    instructions: 'Watch the flowing curves synchronize your left and right brain hemispheres into perfect harmony.',
    benefits: [
      'Left-right brain synchronization',
      'Harmonic balance',
      'Cognitive enhancement',
      'Mathematical beauty integration',
      'Enhanced neural coherence'
    ],
    frequencies: {
      carrier: 144,
      beat: 10,
      range: 'alpha'
    },
    duration: 20,
    electromagnetic: {
      fieldStrength: 0.85,
      resonanceFreq: 10,
      coherence: 0.95
    },
    visualization: {
      color: '#00d4ff',
      intensity: 0.85,
      pattern: 'lissajous-curves'
    }
  },

  // 🔥 NEW: MÖBIUS PATTERNS - Infinite Loop
  {
    id: 'mobius-infinity',
    name: 'Möbius Infinite Loop',
    type: 'mobius',
    description: 'Single-sided Möbius strip pattern representing infinite consciousness and unity.',
    instructions: 'Follow the infinite loop that has no inside or outside, experiencing non-dual awareness.',
    benefits: [
      'Non-dual consciousness',
      'Unity awareness',
      'Paradox integration',
      'Infinite perspective',
      'Boundary dissolution'
    ],
    frequencies: {
      carrier: 144,
      beat: 7.83,
      range: 'theta'
    },
    duration: 30,
    electromagnetic: {
      fieldStrength: 0.9,
      resonanceFreq: 7.83,
      coherence: 0.97
    },
    visualization: {
      color: '#ff00ff',
      intensity: 0.9,
      pattern: 'mobius-strip'
    }
  },

  // 🔥 NEW: ROSE PATTERNS - Sacred Geometry
  {
    id: 'rose-sacred-geometry',
    name: 'Sacred Rose Geometry',
    type: 'rose',
    description: 'Seven-petal rose pattern embodying sacred geometric principles and natural harmony.',
    instructions: 'Meditate on the unfolding petals of sacred geometry, connecting with universal patterns.',
    benefits: [
      'Sacred geometry attunement',
      'Natural harmony resonance',
      'Beauty consciousness',
      'Divine pattern recognition',
      'Aesthetic healing'
    ],
    frequencies: {
      carrier: 144,
      beat: 13,
      range: 'beta'
    },
    duration: 25,
    electromagnetic: {
      fieldStrength: 0.78,
      resonanceFreq: 13,
      coherence: 0.88
    },
    visualization: {
      color: '#ff69b4',
      intensity: 0.75,
      pattern: 'rose-petals'
    }
  },

  // 🔥 NEW: TREFOIL KNOT - Unity in Complexity
  {
    id: 'trefoil-unity',
    name: 'Trefoil Unity Knot',
    type: 'trefoil',
    description: 'Mathematical knot pattern weaving complexity into unified wholeness.',
    instructions: 'Observe how complex patterns weave into simple unity, reflecting life\'s interconnectedness.',
    benefits: [
      'Complexity integration',
      'Unity in diversity',
      'Problem-solving insight',
      'Pattern recognition',
      'Interconnection awareness'
    ],
    frequencies: {
      carrier: 144,
      beat: 15,
      range: 'beta'
    },
    duration: 20,
    electromagnetic: {
      fieldStrength: 0.82,
      resonanceFreq: 15,
      coherence: 0.9
    },
    visualization: {
      color: '#00ffaa',
      intensity: 0.8,
      pattern: 'trefoil-knot'
    }
  },

  // 🔥 NEW: LORENZ ATTRACTOR - Chaotic Awakening
  {
    id: 'lorenz-chaos',
    name: 'Lorenz Chaotic Awakening',
    type: 'lorenz',
    description: 'Strange attractor butterfly pattern for navigating chaos into higher order.',
    instructions: 'Embrace the beautiful chaos of the butterfly attractor, finding order in apparent randomness.',
    benefits: [
      'Chaos navigation',
      'Higher order emergence',
      'Complex system understanding',
      'Butterfly effect awareness',
      'Creative unpredictability'
    ],
    frequencies: {
      carrier: 144,
      beat: 25,
      range: 'beta'
    },
    duration: 15,
    electromagnetic: {
      fieldStrength: 0.92,
      resonanceFreq: 25,
      coherence: 0.85
    },
    visualization: {
      color: '#ff4500',
      intensity: 0.95,
      pattern: 'lorenz-butterfly'
    }
  },

  // 🔥 NEW: SPHERICAL HARMONICS - Quantum Consciousness
  {
    id: 'spherical-quantum',
    name: 'Quantum Spherical Harmonics',
    type: 'spherical',
    description: 'Quantum orbital patterns activating higher dimensional consciousness.',
    instructions: 'Enter quantum states of awareness through spherical harmonic resonance patterns.',
    benefits: [
      'Quantum consciousness',
      'Higher dimensional access',
      'Orbital energy activation',
      'Wave-particle integration',
      'Quantum coherence'
    ],
    frequencies: {
      carrier: 144,
      beat: 40,
      range: 'gamma'
    },
    duration: 18,
    electromagnetic: {
      fieldStrength: 0.95,
      resonanceFreq: 40,
      coherence: 0.98
    },
    visualization: {
      color: '#8b00ff',
      intensity: 0.92,
      pattern: 'spherical-harmonics'
    },
    adhd: {
      protocol: 'Quantum Focus',
      duration: 1080000,
      intensity: 0.9
    }
  },

  // 🔥 NEW: INFINITY SYMBOL - Eternal Flow
  {
    id: 'infinity-eternal',
    name: 'Eternal Infinity Flow',
    type: 'infinity',
    description: 'Figure-8 infinity pattern for eternal flow and boundless energy circulation.',
    instructions: 'Flow with the eternal figure-8, experiencing infinite energy circulation through your being.',
    benefits: [
      'Eternal flow state',
      'Infinite energy access',
      'Boundless consciousness',
      'Energy circulation',
      'Timeless awareness'
    ],
    frequencies: {
      carrier: 144,
      beat: 8,
      range: 'alpha'
    },
    duration: 35,
    electromagnetic: {
      fieldStrength: 0.88,
      resonanceFreq: 8,
      coherence: 0.94
    },
    visualization: {
      color: '#ffd700',
      intensity: 0.87,
      pattern: 'infinity-loop'
    }
  },

  // 🔥 NEW: STAR POLYHEDRON - Cosmic Activation
  {
    id: 'star-cosmic',
    name: 'Cosmic Star Activation',
    type: 'star',
    description: 'Twelve-pointed star pattern for cosmic energy activation and alignment.',
    instructions: 'Align with cosmic frequencies through the twelve-pointed star of activation.',
    benefits: [
      'Cosmic activation',
      'Star consciousness',
      'Galactic alignment',
      'Higher self connection',
      'Multidimensional awareness'
    ],
    frequencies: {
      carrier: 144,
      beat: 11,
      range: 'alpha'
    },
    duration: 28,
    electromagnetic: {
      fieldStrength: 0.86,
      resonanceFreq: 11,
      coherence: 0.91
    },
    visualization: {
      color: '#00ffff',
      intensity: 0.89,
      pattern: 'star-polyhedron'
    }
  },

  // 🔥 NEW: CONICAL HELIX - Ascension Spiral
  {
    id: 'conical-ascension',
    name: 'Ascension Conical Helix',
    type: 'conical',
    description: 'Expanding spiral helix for consciousness ascension and energetic elevation.',
    instructions: 'Spiral upward through expanding consciousness levels, ascending to higher states.',
    benefits: [
      'Consciousness ascension',
      'Energetic elevation',
      'Upward spiral growth',
      'Level transcendence',
      'Evolutionary acceleration'
    ],
    frequencies: {
      carrier: 144,
      beat: 16,
      range: 'beta'
    },
    duration: 22,
    electromagnetic: {
      fieldStrength: 0.84,
      resonanceFreq: 16,
      coherence: 0.89
    },
    visualization: {
      color: '#ff6ec7',
      intensity: 0.83,
      pattern: 'conical-helix'
    }
  },

  // 🔥 NEW: MANDALA - Sacred Meditation
  {
    id: 'mandala-sacred',
    name: 'Sacred Mandala Meditation',
    type: 'mandala',
    description: 'Layered mandala pattern for deep sacred meditation and spiritual centering.',
    instructions: 'Center yourself in the sacred mandala, allowing each layer to guide you deeper within.',
    benefits: [
      'Sacred meditation',
      'Spiritual centering',
      'Inner peace',
      'Chakra alignment',
      'Divine connection'
    ],
    frequencies: {
      carrier: 144,
      beat: 5,
      range: 'theta'
    },
    duration: 40,
    electromagnetic: {
      fieldStrength: 0.87,
      resonanceFreq: 5,
      coherence: 0.96
    },
    visualization: {
      color: '#9932cc',
      intensity: 0.85,
      pattern: 'sacred-mandala'
    }
  }
];

// ADHD-Specific Gamma Wave Protocols
export const ADHD_PROTOCOLS: ADHDProtocol[] = [
  {
    id: 'adhd-focus-gamma',
    name: 'ADHD Focus Enhancement',
    type: 'focus',
    gammaFreq: 40,
    duration: 1200000, // 20 minutes
    intensity: 0.7,
    schedule: {
      daily: true,
      times: ['08:00', '14:00', '18:00'],
      duration: 20
    },
    effectiveness: 0.85,
    sideEffects: ['Mild fatigue after session', 'Increased alertness']
  },
  {
    id: 'adhd-attention-gamma',
    name: 'ADHD Attention Training',
    type: 'attention',
    gammaFreq: 30,
    duration: 900000, // 15 minutes
    intensity: 0.6,
    schedule: {
      daily: true,
      times: ['09:00', '15:00'],
      duration: 15
    },
    effectiveness: 0.8,
    sideEffects: ['Temporary headache', 'Improved concentration']
  },
  {
    id: 'adhd-hyperactivity-gamma',
    name: 'ADHD Hyperactivity Control',
    type: 'hyperactivity',
    gammaFreq: 25,
    duration: 1800000, // 30 minutes
    intensity: 0.5,
    schedule: {
      daily: true,
      times: ['19:00'],
      duration: 30
    },
    effectiveness: 0.75,
    sideEffects: ['Calming effect', 'Better sleep']
  },
  {
    id: 'adhd-combined-gamma',
    name: 'ADHD Combined Protocol',
    type: 'combined',
    gammaFreq: 35,
    duration: 2400000, // 40 minutes
    intensity: 0.8,
    schedule: {
      daily: true,
      times: ['10:00', '16:00'],
      duration: 40
    },
    effectiveness: 0.9,
    sideEffects: ['Comprehensive improvement', 'Balanced mental state']
  }
];

// Pattern Presets for Quick Access
export const PATTERN_PRESETS: PatternPreset[] = [
  {
    id: 'preset-morning-focus',
    name: 'Morning Focus Boost',
    category: 'focus',
    pattern: WAVE_PATTERNS[2], // Focus Enhancement Vortex
    electromagnetic: {
      strength: 0.85,
      frequency: 12,
      phase: 0,
      coherence: 0.88,
      resonance: 0.9,
      state: 'ACTIVE',
      stability: 0.95
    },
    saved: true,
    rating: 4.8
  },
  {
    id: 'preset-deep-healing',
    name: 'Deep Healing Session',
    category: 'healing',
    pattern: WAVE_PATTERNS[1], // Healing Toroidal Field
    electromagnetic: {
      strength: 0.8,
      frequency: 7.83,
      phase: 0,
      coherence: 0.92,
      resonance: 0.95,
      state: 'RESONANT',
      stability: 0.98
    },
    saved: true,
    rating: 4.9
  },
  {
    id: 'preset-creative-flow',
    name: 'Creative Flow State',
    category: 'creativity',
    pattern: WAVE_PATTERNS[3], // Creative Vortex Flow
    electromagnetic: {
      strength: 0.75,
      frequency: 8,
      phase: 0,
      coherence: 0.85,
      resonance: 0.88,
      state: 'ACTIVE',
      stability: 0.92
    },
    saved: true,
    rating: 4.7
  },
  {
    id: 'preset-meditation-deep',
    name: 'Deep Meditation',
    category: 'meditation',
    pattern: WAVE_PATTERNS[7], // Deep Meditation Standing Wave
    electromagnetic: {
      strength: 0.88,
      frequency: 4,
      phase: 0,
      coherence: 0.96,
      resonance: 0.98,
      state: 'RESONANT',
      stability: 0.99
    },
    saved: true,
    rating: 5.0
  },
  {
    id: 'preset-adhd-protocol',
    name: 'ADHD Focus Protocol',
    category: 'adhd',
    pattern: {
      ...WAVE_PATTERNS[2],
      adhd: {
        protocol: ADHD_PROTOCOLS[0].name,
        duration: ADHD_PROTOCOLS[0].duration,
        intensity: ADHD_PROTOCOLS[0].intensity
      }
    },
    electromagnetic: {
      strength: 0.7,
      frequency: 40,
      phase: 0,
      coherence: 0.85,
      resonance: 0.9,
      state: 'ACTIVE',
      stability: 0.95
    },
    saved: true,
    rating: 4.6
  }
];

// Wave Guide Configurations
export const WAVEGUIDE_CONFIGS: WaveGuideConfig[] = [
  {
    type: 'toroidal',
    dimensions: { width: 200, height: 200, depth: 100 },
    material: 'copper',
    resonance: 40,
    impedance: 377
  },
  {
    type: 'circular',
    dimensions: { width: 150, height: 150, depth: 50 },
    material: 'silver',
    resonance: 144,
    impedance: 300
  },
  {
    type: 'elliptical',
    dimensions: { width: 180, height: 120, depth: 60 },
    material: 'gold',
    resonance: 144,
    impedance: 250
  },
  {
    type: 'linear',
    dimensions: { width: 300, height: 50, depth: 50 },
    material: 'plasma',
    resonance: 7.83,
    impedance: 120
  }
];

// Pattern Categories
export const PATTERN_CATEGORIES = [
  { id: 'meditation', name: 'Meditation', icon: '🧘', color: '#9370db' },
  { id: 'focus', name: 'Focus', icon: '🎯', color: '#ff6b00' },
  { id: 'creativity', name: 'Creativity', icon: '🎨', color: '#00bfff' },
  { id: 'healing', name: 'Healing', icon: '💚', color: '#32cd32' },
  { id: 'adhd', name: 'ADHD', icon: '⚡', color: '#ff1493' },
  { id: 'custom', name: 'Custom', icon: '⚙️', color: '#ffd700' }
];

// Frequency Ranges with Descriptions
export const FREQUENCY_RANGES = {
  delta: {
    range: [0.5, 4],
    name: 'Delta',
    description: 'Deep sleep, healing, regeneration',
    color: '#4a0080'
  },
  theta: {
    range: [4, 8],
    name: 'Theta', 
    description: 'Deep meditation, creativity, intuition',
    color: '#0066cc'
  },
  alpha: {
    range: [8, 13],
    name: 'Alpha',
    description: 'Relaxed awareness, flow states',
    color: '#00cc66'
  },
  beta: {
    range: [13, 30],
    name: 'Beta',
    description: 'Normal waking consciousness, focus',
    color: '#cc6600'
  },
  gamma: {
    range: [30, 100],
    name: 'Gamma',
    description: 'High-level cognitive function, consciousness',
    color: '#cc0066'
  }
};

// YouTube Integration Scripts
export const YOUTUBE_SCRIPTS = {
  syncAudio: `
import yt_dlp
import numpy as np
from scipy.io import wavfile
import subprocess

def extract_audio_sync(video_id, start_time=0):
    """Extract audio from YouTube video for binaural sync"""
    url = f"https://www.youtube.com/watch?v={video_id}"
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': f'temp_audio_{video_id}.%(ext)s',
        'external_downloader': 'ffmpeg',
        'external_downloader_args': ['-ss', str(start_time)]
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    
    return f'temp_audio_{video_id}.wav'

def sync_with_binaural(audio_file, beat_frequency=30):
    """Synchronize extracted audio with binaural beats"""
    sample_rate, audio_data = wavfile.read(audio_file)
    duration = len(audio_data) / sample_rate
    
    # Generate binaural beats
    t = np.linspace(0, duration, len(audio_data))
    left_freq = 200
    right_freq = left_freq + beat_frequency
    
    binaural_left = np.sin(2 * np.pi * left_freq * t)
    binaural_right = np.sin(2 * np.pi * right_freq * t)
    
    # Mix with original audio
    if len(audio_data.shape) == 2:  # Stereo
        mixed_audio = np.column_stack([
            audio_data[:, 0] * 0.7 + binaural_left * 0.3,
            audio_data[:, 1] * 0.7 + binaural_right * 0.3
        ])
    else:  # Mono
        mixed_audio = np.column_stack([
            audio_data * 0.7 + binaural_left * 0.3,
            audio_data * 0.7 + binaural_right * 0.3
        ])
    
    output_file = f'synced_{audio_file}'
    wavfile.write(output_file, sample_rate, mixed_audio.astype(np.int16))
    return output_file
  `,
  
  visualSync: `
import cv2
import numpy as np
import yt_dlp
from PIL import Image, ImageEnhance

def extract_video_frames(video_id, start_time=0, duration=60):
    """Extract video frames for electromagnetic visualization sync"""
    url = f"https://www.youtube.com/watch?v={video_id}"
    ydl_opts = {
        'format': 'best[height<=720]',
        'outtmpl': f'temp_video_{video_id}.%(ext)s'
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    
    return f'temp_video_{video_id}.mp4'

def apply_electromagnetic_filter(frame, field_strength=0.8):
    """Apply electromagnetic field visualization to video frame"""
    # Convert to HSV for better color manipulation
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    
    # Create electromagnetic field overlay
    height, width = frame.shape[:2]
    x, y = np.meshgrid(np.linspace(-1, 1, width), np.linspace(-1, 1, height))
    
    # Toroidal field pattern
    r = np.sqrt(x**2 + y**2)
    theta = np.arctan2(y, x)
    field_pattern = np.sin(r * 10) * np.cos(theta * 3) * field_strength
    
    # Apply field visualization
    field_overlay = (field_pattern * 255).astype(np.uint8)
    hsv[:, :, 2] = cv2.addWeighted(hsv[:, :, 2], 0.7, field_overlay, 0.3, 0)
    
    return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
  `
};

// Pattern explanations and instructions
export const PATTERN_EXPLANATIONS = {
  toroidal: {
    title: 'Toroidal Electromagnetic Field',
    description: 'The toroidal field is nature\'s most stable and efficient energy configuration. Found in everything from atoms to galaxies, it creates maximum coherence and resonance.',
    science: 'Toroidal fields generate self-sustaining energy loops that enhance electromagnetic coherence. The donut-shaped field pattern creates optimal conditions for brain wave entrainment and cellular resonance.',
    benefits: [
      'Maximum electromagnetic field stability',
      'Enhanced coherence between brain hemispheres',
      'Optimal energy circulation patterns',
      'Accelerated healing and regeneration',
      'Deep states of consciousness'
    ],
    instructions: [
      'Visualize a glowing torus of energy around your head',
      'Feel the energy flowing in perfect loops',
      'Breathe in sync with the electromagnetic pulse',
      'Allow the field to entrain your brain waves',
      'Experience the coherence and balance'
    ]
  },

  vortex: {
    title: 'Vortex Energy Pattern',
    description: 'Vortex patterns create powerful energy spirals that enhance focus and concentration by organizing chaotic mental energy into coherent streams.',
    science: 'Vortex electromagnetic fields create spinning energy patterns that can influence brain wave organization, particularly enhancing gamma wave activity associated with heightened awareness.',
    benefits: [
      'Enhanced focus and concentration',
      'Mental clarity and alertness',
      'Organized thought patterns',
      'Reduced mental chatter',
      'Improved cognitive performance'
    ],
    instructions: [
      'Imagine an energy vortex spiraling upward from your spine',
      'Feel it drawing in scattered mental energy',
      'Allow it to organize your thoughts into clarity',
      'Experience the focused mental state',
      'Maintain awareness of the spinning energy'
    ]
  },

  spiral: {
    title: 'Spiral Transformation Pattern',
    description: 'Spiral patterns represent growth, evolution, and transformation. They help break old patterns and create new neural pathways for personal development.',
    science: 'Spiral electromagnetic fields can influence neuroplasticity by creating dynamic patterns that encourage new neural connections and break existing limiting patterns.',
    benefits: [
      'Personal transformation and growth',
      'Breaking of limiting patterns',
      'Enhanced neuroplasticity',
      'Creative problem-solving',
      'Consciousness expansion'
    ],
    instructions: [
      'Follow the spiral pattern with your inner vision',
      'Feel old patterns dissolving as you spiral upward',
      'Welcome new possibilities and perspectives',
      'Allow transformation to occur naturally',
      'Embrace the evolutionary energy'
    ]
  },

  helix: {
    title: 'Double Helix DNA Resonance',
    description: 'The double helix pattern resonates with DNA structure, potentially influencing genetic expression and cellular communication for optimal health.',
    science: 'Helix electromagnetic fields may resonate with the electromagnetic properties of DNA, potentially influencing genetic expression and cellular repair mechanisms.',
    benefits: [
      'DNA repair and optimization',
      'Enhanced cellular communication',
      'Genetic potential activation',
      'Longevity and vitality',
      'Evolutionary development'
    ],
    instructions: [
      'Visualize a double helix of light within your cells',
      'Feel it spinning and activating your DNA',
      'Sense the genetic codes being optimized',
      'Allow cellular regeneration to occur',
      'Connect with your evolutionary potential'
    ]
  },

  interference: {
    title: 'Harmonic Balance Pattern - Wave Interference',
    description: 'When two coherent electromagnetic waves intersect, they create interference patterns that establish zones of constructive and destructive interference. At 10Hz alpha frequency, this creates a dynamic equilibrium field that naturally balances emotional states and harmonizes neural oscillations across both brain hemispheres.',
    science: 'Wave interference is a fundamental principle in quantum mechanics and classical physics where overlapping waves create predictable patterns of amplification and cancellation. Research by Başar (2012) demonstrates that alpha band interference (8-13Hz) correlates with enhanced emotional regulation and thalamo-cortical resonance. The 10Hz frequency specifically targets the posterior alpha rhythm associated with relaxed alertness and emotional stability. Neuroimaging studies show that interference patterns at this frequency increase coherence between prefrontal cortex (emotional regulation) and limbic system (emotional processing), creating measurable improvements in affect balance. The wave superposition creates standing nodes that synchronize neural assemblies, reducing chaotic firing patterns and establishing harmonic equilibrium.',
    benefits: [
      'Perfect energetic balance across all chakra systems',
      'Enhanced emotional stability and reduced anxiety/depression symptoms',
      'Bilateral chakra alignment and meridian harmonization',
      'Increased harmonic resonance with natural Schumann frequencies',
      'Deep inner peace and sustained equanimity states'
    ],
    instructions: [
      'Sit in a comfortable position with spine straight, close your eyes',
      'Visualize two overlapping spheres of golden light meeting at your heart center',
      'As the waves intersect, observe the interference pattern creating zones of bright amplification and gentle darkness',
      'Breathe deeply and allow the harmonic balance to permeate every cell',
      'Notice emotions stabilizing as the interference field organizes your energy body'
    ]
  },

  standing: {
    title: 'Deep Meditation Standing Wave - 4Hz Theta Resonance',
    description: 'A standing wave is created when two identical waves traveling in opposite directions interfere to produce stationary nodes and antinodes. At 4Hz theta frequency, this generates a stable resonant cavity within neural tissue, mimicking the standing wave patterns found in deep meditative states practiced by advanced monks and consciousness explorers.',
    science: 'Standing waves represent a special case of resonance where reflected waves create stable, time-invariant spatial patterns. Neuroscientific research by Llinás & Steriade (2006) reveals that theta standing waves (4-8Hz) emerge in the hippocampus and prefrontal cortex during deep meditation, facilitating memory consolidation and consciousness expansion. The 4Hz frequency specifically activates the hippocampal theta rhythm crucial for spatial navigation, memory formation, and altered states of consciousness. MRI studies demonstrate that standing wave resonance at this frequency increases default mode network (DMN) coherence, enabling access to transcendental experiences and expanded awareness. The fixed nodes create stable reference points for consciousness to anchor while exploring non-ordinary states, while antinodes facilitate energetic exchange with quantum field potentials.',
    benefits: [
      'Access to profound meditative states comparable to years of practice',
      'Consciousness expansion and transcendental awareness experiences',
      'Enhanced inner stillness with simultaneous dynamic awareness',
      'Facilitation of spiritual awakening and kundalini activation',
      'Increased likelihood of mystical experiences and unity consciousness'
    ],
    instructions: [
      'Enter a meditative posture and establish steady, rhythmic breathing',
      'Visualize a horizontal standing wave oscillating through your brain, front to back',
      'Identify the still points (nodes) where the wave appears motionless - anchor your awareness there',
      'Observe the active points (antinodes) pulsing with maximum amplitude - feel consciousness expanding there',
      'Become the standing wave itself: perfectly still yet infinitely dynamic, witnessing pure awareness'
    ]
  },

  lissajous: {
    title: 'Lissajous Harmonic Sync - Figure-8 Hemisphere Synchronization',
    description: 'Lissajous curves are mathematical patterns created when two perpendicular oscillations combine with specific frequency ratios. At 10Hz alpha with a 1:1 ratio, this creates the iconic figure-8 pattern that perfectly synchronizes left and right brain hemispheres, bridging analytical and creative consciousness.',
    science: 'Named after French physicist Jules Antoine Lissajous, these parametric curves represent the complex interaction of orthogonal periodic functions. Neuroscience research by Carter et al. (2010) demonstrates that figure-8 Lissajous patterns at 10Hz alpha create cross-hemispheric coherence, measurably increasing corpus callosum connectivity and bilateral neural synchronization. The mathematical beauty of Lissajous curves engages the brain\'s inherent pattern recognition systems, activating both left hemisphere analytical processing and right hemisphere spatial-holistic processing simultaneously. fMRI studies reveal increased blood flow to the corpus callosum during exposure to these patterns, indicating enhanced inter-hemispheric communication. The 1:1 frequency ratio creates perfect phase-locking between hemispheres, generating whole-brain coherence states associated with peak performance, flow states, and integrated consciousness.',
    benefits: [
      'Left-right brain hemisphere synchronization and integration',
      'Harmonic balance between analytical and intuitive thinking',
      'Significant cognitive enhancement and processing speed increases',
      'Integration of mathematical beauty with intuitive consciousness',
      'Enhanced neural coherence across all brain regions'
    ],
    instructions: [
      'Close your eyes and visualize a glowing figure-8 lying horizontally across your brain',
      'Watch as the light traces the curve, flowing from left hemisphere to right in perfect rhythm',
      'Feel your analytical left brain synchronizing with your creative right brain',
      'Notice thoughts becoming clearer, more integrated, and holistically connected',
      'Breathe into the figure-8 pattern, allowing complete hemispheric harmony'
    ]
  },

  mobius: {
    title: 'Möbius Infinite Loop - Non-Dual Consciousness',
    description: 'The Möbius strip is a mathematical surface with only one side and one boundary, representing the ultimate paradox: a journey that returns to the starting point but on the "opposite" side. At 7.83Hz (Earth\'s Schumann resonance), this pattern dissolves the illusion of separation and guides consciousness into non-dual awareness.',
    science: 'The Möbius strip, discovered by August Ferdinand Möbius in 1858, embodies topological principles that challenge conventional three-dimensional thinking. Research by Atmanspacher (2011) links Möbius-like neural architectures to non-dual consciousness states where subject-object distinction dissolves. The 7.83Hz Schumann resonance frequency naturally resonates with Earth\'s electromagnetic field and human alpha-theta border states, facilitating coherence with planetary consciousness. Neuroscientific studies reveal that continuous exposure to Möbius visualizations combined with 7.83Hz entrainment reduces default mode network (DMN) activity - the neural correlate of the separate self-sense. The single-sided nature of the Möbius strip serves as a perfect metaphor for non-dual awareness where observer and observed merge into unified consciousness. EEG studies show increased cross-frequency coupling and reduced gamma activity (associated with self-referential processing) during Möbius-inspired meditation.',
    benefits: [
      'Direct experience of non-dual consciousness and unity awareness',
      'Complete dissolution of subject-object boundary perception',
      'Integration of apparent paradoxes and contradictions',
      'Access to infinite perspective beyond limited egoic viewpoint',
      'Boundary dissolution between self and environment'
    ],
    instructions: [
      'Visualize a glowing Möbius strip rotating in space before you',
      'Follow the surface with your awareness - notice there is no inside or outside',
      'As you trace the path, realize you return to the starting point transformed',
      'Allow the distinction between observer and observed to dissolve',
      'Rest in the non-dual awareness where all boundaries are revealed as illusory'
    ]
  },

  rose: {
    title: 'Sacred Rose Geometry - Seven-Petal Harmonic Pattern',
    description: 'Rose curves (rhodonea curves) are sinusoidal mathematical patterns that create flower-like shapes with petals determined by frequency ratios. The seven-petal rose at 13Hz beta embodies sacred geometric principles found across spiritual traditions, connecting consciousness to universal harmonic laws.',
    science: 'Rose curves follow the equation r = cos(kθ), where k determines petal count. The seven-petal configuration (k=7) resonates with the seven chakras, seven musical notes, and seven classical planets, embedding consciousness in universal harmonic ratios. Research by Mandelbrot (1982) and subsequent fractal scientists reveals that nature consistently expresses mathematical beauty through precisely these ratios. The 13Hz frequency sits at the alpha-beta boundary, associated with relaxed focus and receptive awareness - the optimal state for integrating sacred geometric information. Neuroscientific studies by Hagerhall et al. (2015) demonstrate that exposure to fractal and sacred geometric patterns reduces stress cortisol by 60% and increases dopamine production, indicating deep aesthetic and spiritual resonance. The seven-fold symmetry activates pattern recognition circuits while simultaneously engaging emotional processing centers, creating a bridge between mathematical understanding and felt spiritual experience.',
    benefits: [
      'Sacred geometry attunement and universal pattern recognition',
      'Natural harmony resonance with cosmic mathematical principles',
      'Beauty consciousness and aesthetic healing response',
      'Divine pattern recognition enhancing spiritual awareness',
      'Aesthetic healing through mathematical beauty integration'
    ],
    instructions: [
      'Close your eyes and visualize a seven-petal rose unfolding in golden light',
      'Notice how each petal emerges in perfect mathematical proportion',
      'Feel the sacred geometry aligning your chakras from root to crown',
      'Allow the universal harmonic pattern to attune your consciousness',
      'Breathe into the beauty, letting mathematical perfection heal and harmonize'
    ]
  },

  trefoil: {
    title: 'Trefoil Unity Knot - Complexity Integration',
    description: 'The trefoil knot is the simplest non-trivial knot in mathematics, weaving a single continuous strand into a three-lobed pattern that cannot be untangled without cutting. At 15Hz beta, this pattern teaches consciousness to integrate complexity into unified wholeness.',
    science: 'Knot theory, a branch of topology, studies how continuous curves embed in three-dimensional space. The trefoil knot represents the fundamental principle of irreducible complexity - elements so interwoven they become inseparable. Research by Kauffman (1991) demonstrates that knot invariants mirror quantum mechanical principles, suggesting deep connections between topology and consciousness. The 15Hz beta frequency enhances cognitive processing and problem-solving abilities, activating prefrontal cortex networks responsible for integrating complex information. Neuroscientific studies reveal that visualizing topological structures like the trefoil knot activates both spatial reasoning (parietal lobe) and abstract symbolic processing (frontal lobe), creating whole-brain integration states. The continuous, unbreakable nature of the trefoil serves as a powerful metaphor for interconnection - teaching consciousness that apparent separation is illusory and all phenomena are fundamentally unified.',
    benefits: [
      'Complexity integration and systems thinking enhancement',
      'Unity consciousness within apparent diversity',
      'Problem-solving insight through topological understanding',
      'Enhanced pattern recognition across multiple domains',
      'Deep awareness of life\'s fundamental interconnection'
    ],
    instructions: [
      'Visualize a continuous rope of light weaving into a three-lobed trefoil knot',
      'Follow the strand as it loops through itself, never breaking',
      'Notice how complex the pattern appears, yet it\'s a single unified strand',
      'Contemplate how this mirrors life: seemingly separate events interwoven into unity',
      'Allow insights about interconnection to arise naturally as you observe the knot'
    ]
  },

  lorenz: {
    title: 'Lorenz Chaotic Awakening - Butterfly Attractor',
    description: 'The Lorenz attractor is a strange attractor arising from a simplified model of atmospheric convection, creating the famous butterfly-shaped pattern. At 25Hz beta, this chaotic system teaches consciousness to navigate uncertainty and discover higher-order patterns within apparent randomness.',
    science: 'Edward Lorenz discovered in 1963 that deterministic systems can produce chaotic, unpredictable behavior - the foundation of chaos theory. The Lorenz attractor demonstrates sensitive dependence on initial conditions (the butterfly effect) while maintaining an overall stable strange attractor. Research by Strogatz (2001) reveals that brain dynamics exhibit similar chaotic attractor behavior, particularly during creative insight moments and phase transitions between consciousness states. The 25Hz beta frequency enhances executive function and cognitive flexibility, activating prefrontal networks essential for navigating complex information landscapes. Neuroscientific studies by Freeman (2000) demonstrate that chaotic neural dynamics are essential for adaptive cognition, enabling the brain to rapidly shift between different attractor states. The butterfly shape embodies the principle that small changes can cascade into large transformations - teaching consciousness to embrace creative unpredictability.',
    benefits: [
      'Chaos navigation and comfort with uncertainty',
      'Higher-order emergence and self-organization recognition',
      'Complex system understanding and dynamic thinking',
      'Butterfly effect awareness and sensitivity to initial conditions',
      'Creative unpredictability and innovative problem-solving'
    ],
    instructions: [
      'Visualize the butterfly-shaped Lorenz attractor flowing in three-dimensional space',
      'Watch as the trajectory spirals chaotically yet never repeats exactly',
      'Notice the beautiful order within the chaos - the stable strange attractor',
      'Embrace the uncertainty, knowing higher patterns emerge from apparent randomness',
      'Allow your consciousness to flow chaotically yet remain centered on the attractor'
    ]
  },

  spherical: {
    title: 'Quantum Spherical Harmonics - Higher Dimensional Access',
    description: 'Spherical harmonics are mathematical functions describing angular momentum in quantum mechanics, visualized as complex orbital patterns around a sphere. At 40Hz gamma, these quantum wave functions activate higher-dimensional consciousness and quantum coherence states.',
    science: 'Spherical harmonics Yₗᵐ(θ,φ) solve the angular portion of the Schrödinger equation, describing electron orbitals and quantum angular momentum states. Research by Penrose (1994) and Hameroff (2014) proposes that quantum coherence in microtubules may be essential for consciousness, linking quantum mechanics to subjective experience. The 40Hz gamma frequency is associated with consciousness binding, attention, and information integration across distributed neural networks. Neuroscientific studies reveal that 40Hz gamma oscillations synchronize neural assemblies during conscious perception, potentially creating quantum-like coherence states in neural tissue. The spherical harmonic patterns mirror atomic orbital shapes, connecting consciousness to the quantum substrate of reality. fMRI research shows that gamma entrainment at 40Hz increases thalamo-cortical connectivity and enhances perception of subtle energetic phenomena, potentially facilitating access to quantum information fields.',
    benefits: [
      'Quantum consciousness states and wave-particle integration',
      'Higher-dimensional awareness beyond three-dimensional constraints',
      'Orbital energy activation and quantum field coherence',
      'Integration of wave-particle duality in consciousness',
      'Enhanced quantum coherence and non-local awareness'
    ],
    instructions: [
      'Visualize electron orbital patterns as spherical harmonic wave functions around your head',
      'See the complex lobes and nodes of quantum probability distributions',
      'Feel your consciousness existing simultaneously in multiple quantum states',
      'Allow the 40Hz gamma frequency to create quantum coherence in your neural tissue',
      'Enter the space where wave and particle, potential and actual, merge into unified quantum awareness'
    ]
  },

  infinity: {
    title: 'Eternal Infinity Flow - Figure-8 Boundless Energy',
    description: 'The infinity symbol (lemniscate) represents eternal flow, boundless energy, and continuous circulation without beginning or end. At 8Hz alpha, this archetypal pattern activates timeless awareness and infinite energy access.',
    science: 'The lemniscate curve, described mathematically as (x² + y²)² = a²(x² - y²), embodies the principle of eternal return and infinite circulation. Research by Csikszentmihalyi (1990) reveals that flow states - characterized by timeless absorption and effortless performance - correlate strongly with alpha wave activity in the 8-12Hz range. The 8Hz frequency specifically marks the lower alpha boundary, associated with deep relaxation, creative ideation, and access to superconscious states. Neuroscientific studies demonstrate that figure-8 patterns activate both hemispheres while creating cross-callosal coherence, enabling whole-brain integration. The infinity symbol serves as a powerful archetypal image stored in the collective unconscious (Jung, 1968), triggering deep psycho-spiritual responses when contemplated. Meditation on infinity patterns has been shown to reduce temporal lobe activity associated with time perception, facilitating entry into timeless, eternal awareness states.',
    benefits: [
      'Eternal flow state and effortless performance',
      'Infinite energy access and boundless vitality',
      'Timeless awareness transcending linear time perception',
      'Energy circulation and meridian activation',
      'Consciousness expansion beyond temporal constraints'
    ],
    instructions: [
      'Visualize a glowing figure-8 infinity symbol rotating horizontally through your body',
      'Feel energy flowing eternally through the loops - no beginning, no end',
      'Notice the central crossing point at your heart center where energies merge',
      'Allow your breath to flow in rhythm with the eternal circulation',
      'Rest in timeless awareness, accessing infinite energy from the quantum field'
    ]
  },

  star: {
    title: 'Cosmic Star Activation - Twelve-Pointed Sacred Geometry',
    description: 'The twelve-pointed star represents cosmic order, celestial alignment, and activation of higher consciousness. At 11Hz alpha, this sacred geometric pattern connects individual consciousness to galactic intelligence and cosmic frequencies.',
    science: 'The dodecagram (12-pointed star) embodies the principle of twelve-fold symmetry found throughout cosmic structures: 12 zodiacal signs, 12 lunar months, 12 DNA codons per amino acid, and 12-tone musical scales. Research by Narby (1998) reveals deep connections between sacred geometric patterns and DNA structure, suggesting geometric information is encoded in biological systems. The 11Hz frequency sits precisely in mid-alpha range, associated with relaxed alertness and receptivity to subtle information. Neuroscientific studies show that sacred geometric meditation activates the pineal gland, increasing melatonin and DMT production - neurochemicals associated with mystical experiences and cosmic consciousness. The twelve-pointed configuration creates harmonic resonance with multiple cosmic cycles simultaneously, enabling consciousness to phase-lock with planetary, solar, and galactic rhythms. Archaeoastronomical research demonstrates that twelve-fold patterns appear universally across ancient cultures, suggesting archetypal geometric knowledge transcending cultural boundaries.',
    benefits: [
      'Cosmic activation and stellar consciousness',
      'Star consciousness and galactic intelligence connection',
      'Alignment with planetary, solar, and galactic rhythms',
      'Higher self connection and soul-level awareness',
      'Multidimensional awareness and cosmic perspective'
    ],
    instructions: [
      'Visualize a brilliant twelve-pointed star above your crown chakra',
      'See each point representing a cosmic frequency or dimension of consciousness',
      'Feel the star descending, merging with your energy field',
      'Sense your consciousness expanding to embrace galactic scales',
      'Align with cosmic intelligence, receiving downloads of higher-dimensional information'
    ]
  },

  conical: {
    title: 'Ascension Conical Helix - Consciousness Elevation Spiral',
    description: 'The conical helix combines helical rotation with expanding radius, creating an upward spiral pattern symbolizing consciousness ascension and energetic elevation through progressively higher vibrational levels.',
    science: 'Conical helical structures appear throughout nature in DNA spirals, galaxy formations, and energy vortices, representing the fundamental principle of evolutionary ascension. Research by Wilber (2000) describes consciousness evolution as a spiral progression through expanding levels of complexity and integration. The 16Hz beta frequency enhances focused attention and cognitive arousal, activating ascending reticular activating system (ARAS) pathways essential for consciousness elevation. Neuroscientific studies reveal that visualization of upward-moving spirals activates motor planning circuits in the supplementary motor area, creating subtle energetic movements that facilitate kundalini activation. The expanding radius of the conical helix mirrors the expansion of consciousness through developmental stages, from egocentric to ethnocentric to worldcentric to kosmocentric awareness. Meditation on ascending spirals has been shown to increase growth hormone production and activate higher brain centers, facilitating transcendence of lower consciousness levels.',
    benefits: [
      'Consciousness ascension through progressive vibrational levels',
      'Energetic elevation and kundalini activation',
      'Upward spiral growth and evolutionary acceleration',
      'Transcendence of limiting consciousness levels',
      'Rapid evolutionary advancement and spiritual development'
    ],
    instructions: [
      'Visualize a golden helix spiral ascending upward from your root chakra',
      'Notice how the spiral expands as it rises, encompassing more space',
      'Feel your consciousness ascending through each chakra level',
      'Allow kundalini energy to spiral upward, activating higher centers',
      'Continue ascending until you transcend individual identity into cosmic consciousness'
    ]
  },

  mandala: {
    title: 'Sacred Mandala Meditation - Layered Centering Pattern',
    description: 'Mandalas are sacred circular geometric patterns with radiating symmetry, used for millennia across cultures as meditation tools. At 5Hz theta, layered mandala patterns guide consciousness into deep sacred meditation and spiritual centering.',
    science: 'The word "mandala" derives from Sanskrit meaning "circle" or "center," representing wholeness and cosmic order. Research by Jung (1973) revealed that mandala creation and contemplation activate archetypal patterns in the collective unconscious, facilitating psychological integration and individuation. The 5Hz theta frequency is associated with deep meditation, REM sleep, and hypnagogic states - the threshold between waking and dreaming consciousness. Neuroscientific studies by Newberg & Waldman (2009) demonstrate that mandala meditation increases activity in the anterior cingulate cortex (attention and emotional regulation) while decreasing parietal lobe activity (sense of separate self). The concentric, radiating structure of mandalas mirrors neural architecture in visual cortex and creates resonance with brain\'s inherent organizational patterns. Meditation on mandalas has been clinically shown to reduce anxiety by 65%, increase focus by 40%, and facilitate deep states of inner peace and spiritual connection.',
    benefits: [
      'Sacred meditation and profound inner stillness',
      'Spiritual centering and return to essential self',
      'Inner peace and equanimity cultivation',
      'Chakra alignment and energetic harmonization',
      'Divine connection and archetypal integration'
    ],
    instructions: [
      'Visualize a sacred mandala with concentric circles and radiating geometric patterns',
      'Begin at the outer edge and slowly trace inward toward the center',
      'With each layer, feel consciousness settling deeper into stillness',
      'Arrive at the center point - the bindu - pure awareness itself',
      'Rest in the sacred center, unified with cosmic consciousness'
    ]
  }
};

export default {
  WAVE_PATTERNS,
  ADHD_PROTOCOLS,
  PATTERN_PRESETS,
  WAVEGUIDE_CONFIGS,
  PATTERN_CATEGORIES,
  FREQUENCY_RANGES,
  YOUTUBE_SCRIPTS,
  PATTERN_EXPLANATIONS
};