# Electromagnetic Beat Lab - Complete Preset Options Guide

## 🎯 Overview
This guide explains every available option when creating comprehensive presets for the Electromagnetic Beat Lab, based on the lucid dreaming master preset implementation.

---

## 🔧 Basic Preset Structure

### **Required Fields**
```typescript
{
  id: string,                    // Unique identifier (e.g., 'custom-focus-30min')
  name: string,                  // Display name (e.g., '⚡ Focus Blast - 30min')
  description: string,           // Detailed description with phase breakdown
  total_duration: number,        // Total minutes (sum of all transitions)
  transitions_count: number,     // Number of frequency transitions
  tags: string[],               // Tags for categorization ['focus', 'gamma', 'productivity']
  is_premium: boolean,          // Premium feature flag
  available: boolean            // Availability flag
}
```

---

## 🧠 Enhanced Features

### **Categories & Targeting**
```typescript
{
  categories: string[],                    // ['healing', 'focus', 'meditation', 'sleep']
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert',
  target_states: string[],                 // ['laser focus', 'deep healing', 'lucid awareness']
  contraindications: string[]              // ['epilepsy', 'heart conditions', 'pregnancy']
}
```

### **Loop Configuration**
```typescript
loop_config: {
  enabled: boolean,                        // Enable looping functionality
  type: 'count' | 'infinite',            // Loop type
  count: number,                          // Number of loops (0 = infinite)
  loop_scope: 'full' | 'specific_phases', // What to loop
  specific_phases: number[],              // Which phase indices to loop [3, 4]
  fade_between_loops: boolean,            // Smooth transitions between loops
  loop_transition_seconds: number         // Transition duration (30-60 seconds)
}
```

---

## 🎵 Advanced Frequency Transitions

### **Core Frequency Settings**
```typescript
{
  duration_minutes: number,               // Phase duration (0.33 for 20s, 10 for 10min)
  frequency_hz: number,                   // Binaural beat frequency (0.3-100Hz)
  frequency_type: 'Delta' | 'Theta' | 'Alpha' | 'Beta' | 'Gamma',
  left_ear_hz: number,                    // Left channel base frequency (110-528Hz)
  right_ear_hz: number,                   // Right channel frequency (creates binaural beat)
  description: string                     // Phase description with emoji and purpose
}
```

### **Pattern Assignment**
```typescript
pattern_id: string                       // Electromagnetic pattern type
```

**Available Patterns:**
- `'spiral-transformation'` - Gradual state transitions, gentle descent
- `'helix-dna-activation'` - Cellular healing, DNA repair frequencies
- `'vortex-focus-enhancement'` - Concentrated attention, cognitive boost
- `'toroidal-max-resonance'` - Maximum field strength, peak states
- `'interference-balance'` - Stable maintenance, sustained states
- `'standing-wave-meditation'` - Deep rest, sleep optimization
- `'consciousness-activation-vortex'` - Awareness awakening
- `'toroidal-lucidity-mastery'` - Dream control, lucid awareness
- `'adhd-focus-gamma'` - ADHD-specific focus enhancement

### **Waveform Progression**
```typescript
waveform: {
  start: 'sine' | 'triangle' | 'square' | 'sawtooth',    // Starting waveform
  end: 'sine' | 'triangle' | 'square' | 'sawtooth',      // Ending waveform
  transition_type: 'smooth' | 'stepped' | 'oscillating'   // How to transition
}
```

**Waveform Effects:**
- **Sine**: Pure, smooth, relaxing - best for meditation/sleep
- **Triangle**: Gentle harmonics - good for healing frequencies
- **Square**: Sharp, intense - used for focus/activation states
- **Sawtooth**: Rich harmonics - complex consciousness states

### **Volume Envelope**
```typescript
volume_envelope: {
  fade_in_seconds: number,                // Gradual introduction (10-90 seconds)
  sustain_level: number,                  // Target volume (0.2-0.7 for safety)
  fade_out_seconds: number                // Transition out (15-90 seconds)
}
```

---

## 🌐 8D Spatial Audio Configuration

### **Spatial Settings**
```typescript
spatial_config: {
  enabled: boolean,                       // Enable 3D positioning
  hrtf: boolean,                          // Head-Related Transfer Function (realistic 3D)
  roomSize: number,                       // Virtual room size (0.2-2.0)
  reverbAmount: number,                   // Echo/reverb (0.0-1.0)
  spatialWidth: number,                   // Stereo width (0.5-1.5)
  elevation: number,                      // Vertical position (-0.5 to +0.6)
  azimuth: number,                        // Horizontal angle (0-360 degrees)
  movement_speed: number,                 // Movement speed (0.005-0.1)
  spatial_intensity: number,              // 3D effect strength (0.0-1.0)
  reverberance: number,                   // Reverb character (0.0-1.0)
  room_scale: number,                     // Room scaling (0.5-3.0)
  hf_damping: number                      // High frequency damping (0.0-1.0)
}
```

**Spatial Guidelines:**
- **Focus States**: Small room (0.2-0.4), fast movement (0.06-0.1), high intensity (0.8-1.0)
- **Meditation**: Medium room (0.7-0.8), slow movement (0.02-0.03), moderate intensity (0.6-0.7)
- **Sleep States**: Large room (1.0-2.0), minimal movement (0.005-0.01), low intensity (0.2-0.4)

### **8D Movement Patterns**
```typescript
pattern_8d: string                       // Movement pattern type
```

**Available 8D Patterns:**
- `'spiral-descent-grounding'` - Downward spiral for relaxation
- `'dna-helix-rotation'` - Double helix pattern for healing
- `'consciousness-activation-vortex'` - Upward vortex for awakening
- `'toroidal-lucidity-mastery'` - Torus pattern for advanced states
- `'healing-circle-slow'` - Gentle circular healing movement
- `'heart-torus-expansion'` - Heart-centered expansion pattern
- `'minimal-spiral-deep-rest'` - Barely perceptible movement for sleep
- `'gamma-healing-cross'` - Cross pattern for neural optimization

---

## ⚡ Electromagnetic Field Targets

### **Field Configuration**
```typescript
electromagnetic_targets: {
  strength: number,                       // Field intensity (0.0-1.0)
  coherence: number,                      // Field stability/clarity (0.0-1.0)
  resonance: number,                      // Harmonic matching (0.0-1.0)
  stability: number                       // Consistency over time (0.0-1.0)
}
```

**Field Guidelines by State:**
- **Relaxation**: Low strength (0.3-0.5), high coherence (0.8-0.9), high stability (0.9-1.0)
- **Focus**: High strength (0.7-1.0), moderate coherence (0.7-0.8), good stability (0.8-0.9)
- **Healing**: Moderate strength (0.6-0.8), very high coherence (0.9-0.98), maximum stability (0.95-1.0)
- **Peak States**: Maximum strength (1.0), high coherence (0.95), good stability (0.85-0.9)

---

## 🎨 Visualization Styles

### **Visual Configuration**
```typescript
visualization_style: {
  color_scheme: string,                   // Predefined color palette
  intensity: number,                      // Visual brightness (0.0-1.0)
  animation_speed: number,                // Animation rate (0.1-1.0)
  effects: string[]                       // Array of visual effects
}
```

**Color Schemes:**
- `'beta-cooldown-blue'` - Calming blue tones
- `'theta-gateway-violet'` - Purple/violet mystical colors
- `'deep-delta-indigo'` - Deep indigo for sleep states
- `'gamma-activation-gold'` - Golden energizing colors
- `'toroidal-lucidity-white-gold'` - White-gold for peak states
- `'love-frequency-green'` - Heart chakra healing green
- `'healing-spectrum'` - Full spectrum healing colors

**Visual Effects:**
- `'gentle-descent'`, `'mind-quieting'`, `'relaxation-spiral'` - Calming effects
- `'dna-activation'`, `'cellular-alignment'` - Healing effects
- `'consciousness-vortex'`, `'gamma-awakening'` - Activation effects
- `'maximum-resonance'`, `'toroidal-mastery'` - Peak state effects
- `'standing-wave-field'`, `'deep-rest-void'` - Sleep/rest effects

### **Transition Effects**
```typescript
transition_effects: {
  crossfade_duration: number,             // Blend time between phases (20-90 seconds)
  harmonic_blending: boolean              // Smooth frequency transitions
}
```

---

## 🔄 Pattern Progressions

### **Movement Progression**
```typescript
spatial_8d_config: {
  enabled: boolean,
  movement_progression: [
    {
      start_time_minutes: number,         // When this pattern begins
      pattern_type: 'circular' | 'spiral' | 'figure8' | 'infinity' | 'custom',
      speed: number,                      // Movement speed (0.01-0.1)
      radius: number,                     // Movement radius (20-100)
      elevation_range: [number, number],  // Vertical range [-45, +45]
      direction: 'clockwise' | 'counterclockwise' | 'alternating'
    }
  ],
  hrtf_enabled: boolean,
  room_acoustics: {
    size: 'small' | 'medium' | 'large',
    reverb: number,                       // Reverb amount (0.0-1.0)
    absorption: number                    // Sound absorption (0.0-1.0)
  },
  distance_modulation: {
    min_distance: number,                 // Closest approach (10-30)
    max_distance: number,                 // Farthest distance (50-150)
    modulation_speed: number              // Distance change rate (0.005-0.02)
  }
}
```

### **Electromagnetic Progression**
```typescript
electromagnetic_progression: [
  {
    timestamp_minutes: number,            // When this field config activates
    field_config: {
      strength: number,                   // Field strength at this time
      frequency: number,                  // Dominant frequency
      phase: number,                      // Phase angle (0-360)
      coherence: number,                  // Field coherence
      resonance: number,                  // Resonance level
      state: 'ACTIVE' | 'RESONANT' | 'CRITICAL', // Field state
      stability: number                   // Stability level
    },
    transition_duration_seconds: number,  // Time to reach this config
    resonance_targets: {
      brain_waves: string,                // Target brainwave type
      healing_frequency?: number          // Optional healing frequency
    }
  }
]
```

### **Visualization Progression**
```typescript
visualization_progression: [
  {
    timestamp_minutes: number,            // When visuals change
    settings: {
      starField: {
        density: number,                  // Star count (20-300)
        speed: number,                    // Movement speed (0.1-2.0)
        color: string,                    // Hex color code
        twinkle: boolean                  // Twinkling effect
      },
      spatial: {
        gridSize: number,                 // Grid resolution (16-256)
        opacity: number,                  // Grid visibility (0.0-1.0)
        color: string,                    // Grid color
        animation: boolean                // Animated grid
      },
      frequency: {
        bars: number,                     // Spectrum bars (16-512)
        sensitivity: number,              // Response sensitivity (0.3-2.0)
        color: string,                    // Spectrum color
        glow: boolean                     // Glow effect
      }
    },
    transition_duration_seconds: number,
    special_effects: {
      color_cycling?: boolean,            // Color rotation
      particle_burst?: boolean,           // Particle explosions
      mandala_overlay?: boolean,          // Sacred geometry
      fractal_zoom?: boolean              // Fractal patterns
    }
  }
]
```

---

## 📝 Session Activities

### **Pre-Session Preparation**
```typescript
preparation: {
  duration_minutes: number,               // Prep time (2-15 minutes)
  instructions: string[],                 // Step-by-step guidance
  breathing_pattern: {
    inhale_seconds: number,               // Breath in duration (3-7)
    hold_seconds: number,                 // Hold duration (0-7)
    exhale_seconds: number,               // Breath out duration (3-10)
    cycles: number                        // Number of breath cycles (5-15)
  },
  visualization_guide?: string[],         // Optional visualization steps
  affirmations: string[]                  // Positive affirmations
}
```

### **Post-Session Integration**
```typescript
integration: {
  duration_minutes: number,               // Integration time (2-15 minutes)
  instructions: string[],                 // Post-session steps
  breathing_pattern: {
    inhale_seconds: number,
    hold_seconds: number,
    exhale_seconds: number,
    cycles: number
  },
  affirmations: string[]                  // Integration affirmations
}
```

### **YouTube Integration** (Optional)
```typescript
youtube_integration: {
  sync_mode: 'none' | 'background' | 'synchronized',
  volume_mix: number,                     // YouTube volume level (0.0-1.0)
  guided_segments: [
    {
      timestamp_minutes: number,          // When guidance occurs
      instruction: string,                // Guidance text
      duration_seconds: number            // How long guidance plays
    }
  ]
}
```

---

## 🧬 Specialized Protocol Examples

### **ADHD Enhancement Protocol**
```typescript
adhd_protocol: {
  type: 'combined' | 'pure_gamma' | 'smr_training',
  gammaFreq: number,                      // Primary gamma frequency (25-80Hz)
  intensity: number,                      // Protocol intensity (60-100)
  duration: number,                       // Session duration
  spatialEnabled: boolean,                // Use 8D audio
  adaptiveMode: boolean                   // Adaptive frequency adjustment
}
```

### **Healing Frequencies**
- **528Hz (Love Frequency)**: DNA repair, heart chakra opening
- **432Hz (Earth Frequency)**: Grounding, natural resonance
- **7.83Hz (Schumann)**: Earth's natural frequency, grounding
- **7.5Hz (Healing Theta)**: Cellular repair, immune system boost
- **40Hz (Gamma)**: Neural optimization, consciousness binding

### **Sleep Optimization**
- **Ultra-low Delta (0.3-1Hz)**: Deepest sleep states
- **Standing Wave Patterns**: Minimal movement for rest
- **Progressive Room Expansion**: Increasingly spacious audio environment
- **Volume Fade-outs**: 60-90 second fade-outs for smooth sleep transition

---

## ⚠️ Safety Guidelines

### **Volume Limits**
- **Maximum Sustain**: 0.7 (70% volume)
- **Recommended Range**: 0.2-0.6 for most sessions
- **Sleep Sessions**: 0.2-0.4 maximum
- **Focus Sessions**: 0.4-0.7 range

### **Frequency Safety**
- **Delta**: 0.5-4Hz (safe for sleep)
- **Theta**: 4-8Hz (meditation, creativity)
- **Alpha**: 8-13Hz (relaxation, flow states)
- **Beta**: 13-30Hz (focus, concentration)
- **Gamma**: 30-100Hz (peak performance, short duration only)

### **Contraindications**
Always include appropriate warnings:
- **Epilepsy/Seizure Disorders**: Avoid gamma and high-intensity sessions
- **Heart Conditions**: Avoid high-intensity electromagnetic simulation
- **Pregnancy**: Avoid experimental frequencies, stick to gentle alpha/theta
- **Mental Health**: Consult healthcare provider for therapeutic applications

---

## 💡 Best Practices

### **Preset Design Philosophy**
1. **Progressive Build-up**: Start gentle, build to peak, integrate smoothly
2. **Scientific Accuracy**: Use established brainwave research frequencies
3. **Safety First**: Always include contraindications and safe volume levels
4. **User Experience**: Clear descriptions, intuitive progression, proper fade-ins/outs
5. **Purpose-Driven**: Each phase should have clear therapeutic or performance goals

### **Testing Your Presets**
1. **Start with Short Versions**: Test 1-5 minute versions first
2. **Monitor Volume Levels**: Ensure comfortable listening at all phases
3. **Check Transitions**: Smooth crossfades between all phases
4. **Validate Frequencies**: Ensure binaural beat calculations are correct
5. **User Feedback**: Test with target audience for effectiveness

---

*This guide covers all available options in the Electromagnetic Beat Lab preset system. Use these parameters to create scientifically-grounded, therapeutically effective binaural beat sessions.*