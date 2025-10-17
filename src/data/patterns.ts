// Electromagnetic Beat Lab - Pattern Definitions and Presets
// Complete electromagnetic wave pattern guide with ADHD-specific protocols

import type { 
  PatternConfig, 
  ADHDProtocol, 
  PatternPreset,
  WaveGuideConfig 
} from '../types/index';

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
      carrier: 144,
      beat: 30,
      range: 'gamma'
    },
    duration: 20,
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