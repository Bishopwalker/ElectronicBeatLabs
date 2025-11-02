# Audio-Reactive 8D Patterns Guide

## 🎨 Overview

The Electromagnetic Beat Lab now features **18 unique 8D pattern geometries** with **real-time audio-reactive modulation**. Each pattern dynamically responds to live frequency analyzer data, creating immersive visual experiences that sync with your audio.

---

## 🔥 New 8D Pattern Geometries

### Original Patterns (8)
1. **Toroidal** - Donut-shaped energy field for maximum resonance
2. **Vortex** - Spinning energy spiral for focus enhancement
3. **Spiral** - Expanding spiral for transformation
4. **Helix** - DNA double-helix for genetic resonance
5. **Wave** - Sine wave oscillation
6. **Interference** - Crossing waves for harmonic balance
7. **Standing** - Stationary wave nodes for deep meditation
8. **Custom** - User-defined patterns

### New Advanced Geometries (10)
9. **Lissajous** - 3D parametric curves for brain hemisphere synchronization
10. **Möbius** - Single-sided twisted loop for non-dual awareness
11. **Rose** - Seven-petal sacred geometry pattern
12. **Trefoil** - Mathematical knot weaving complexity into unity
13. **Lorenz** - Strange attractor butterfly for chaos navigation
14. **Spherical** - Quantum orbital harmonics
15. **Infinity** - Figure-8 lemniscate for eternal flow
16. **Star** - Twelve-pointed polyhedron for cosmic activation
17. **Conical** - Expanding helix for consciousness ascension
18. **Mandala** - Layered sacred geometry for meditation

---

## 🎵 Audio-Reactive Features

### Frequency Band Analysis

The system analyzes audio in real-time across 5 frequency bands:

| Band | Range | Effect |
|------|-------|--------|
| **Bass** | 20-250 Hz | Enlarges patterns, adds wave deformations |
| **Low-Mid** | 250-500 Hz | Hue shift toward yellow/green |
| **Mid** | 500-2000 Hz | Increases speed, adds rotation |
| **High-Mid** | 2000-4000 Hz | Hue shift toward purple |
| **Treble** | 4000-20000 Hz | High-frequency ripples, speed boost |

### Modulation Types

#### 1. **Scale Modulation** (0-2)
- Bass frequencies make patterns larger
- Treble frequencies make them more compact
- Creates breathing effect with music

#### 2. **Speed Modulation** (0-3)
- Mid and treble increase animation speed
- Bass slows down for deep grooves
- Syncs pattern movement to tempo

#### 3. **Color Modulation** (0-360°)
- Each frequency band shifts hue differently
- Bass → Red/Orange
- Mid → Cyan/Blue
- Treble → Pink/Purple
- Creates rainbow spectrum effects

#### 4. **Morph Modulation** (0-1)
- Bass creates wave-like deformations
- Mid frequencies add 3D rotation
- Treble adds high-frequency ripples
- Pattern shape dynamically morphs

#### 5. **Intensity Modulation** (0-1)
- Overall audio energy boosts glow/brightness
- Electromagnetic field amplitude increases
- Creates pulsing effect with beats

---

## 🎚️ Modulation Presets

Pre-configured profiles for different use cases:

### **Subtle** (Meditation/Focus)
```typescript
{
  scaleModulation: 0.3,
  speedModulation: 0.5,
  colorModulation: 0.2,
  morphModulation: 0.2,
  intensityModulation: 0.3
}
```

### **Moderate** (General Listening)
```typescript
{
  scaleModulation: 0.7,
  speedModulation: 1.0,
  colorModulation: 0.5,
  morphModulation: 0.5,
  intensityModulation: 0.6
}
```

### **Intense** (High Energy)
```typescript
{
  scaleModulation: 1.5,
  speedModulation: 2.0,
  colorModulation: 0.8,
  morphModulation: 0.8,
  intensityModulation: 1.0
}
```

### **Extreme** (Visual Spectacle)
```typescript
{
  scaleModulation: 2.0,
  speedModulation: 3.0,
  colorModulation: 1.0,
  morphModulation: 1.0,
  intensityModulation: 1.0
}
```

### **Bass Only** (Low-Frequency Focus)
```typescript
{
  scaleModulation: 2.0,
  speedModulation: 0.2,
  colorModulation: 0.3,
  morphModulation: 1.5,
  intensityModulation: 0.8
}
```

### **Treble Only** (High-Frequency Focus)
```typescript
{
  scaleModulation: 0.3,
  speedModulation: 3.0,
  colorModulation: 1.0,
  morphModulation: 0.5,
  intensityModulation: 1.0
}
```

---

## 💻 Usage

### Basic Pattern Selection

```typescript
import { WAVE_PATTERNS } from './data/patterns';
import { convertPatternConfigToPattern8D } from './utils/patternGeometry';

// Select a pattern
const pattern = WAVE_PATTERNS.find(p => p.type === 'lissajous');

// Convert to 8D geometry
const pattern8D = convertPatternConfigToPattern8D(pattern);
```

### Apply Audio Reactivity

```typescript
import { applyAudioReactiveModulation, AUDIO_REACTIVE_PRESETS } from './utils/audioReactivePatterns';

// Get frequency data from audio analyzer
const frequencyData = analyzerNode.getByteFrequencyData();

// Apply audio-reactive modulation
const reactivePattern = applyAudioReactiveModulation(
  pattern8D,
  frequencyData,
  AUDIO_REACTIVE_PRESETS.moderate,
  performance.now()
);

// Use reactivePattern in visualization
<SpatialVisualizer pattern={reactivePattern} />
```

### Custom Modulation

```typescript
const customModulation = {
  scaleModulation: 1.0,    // Moderate size response
  speedModulation: 2.5,    // High speed response
  colorModulation: 0.4,    // Subtle color shift
  morphModulation: 0.6,    // Moderate shape morph
  intensityModulation: 0.8 // Strong glow effect
};

const reactivePattern = applyAudioReactiveModulation(
  pattern8D,
  frequencyData,
  customModulation
);
```

---

## 🔬 Pattern-Specific Recommendations

### For Meditation
- **Pattern:** Mandala, Standing Wave, Toroidal
- **Modulation:** Subtle preset
- **Frequency Range:** Delta (0.5-4 Hz) or Theta (4-8 Hz)

### For Focus/ADHD
- **Pattern:** Vortex, Spherical, Lissajous
- **Modulation:** Moderate preset
- **Frequency Range:** Beta (13-30 Hz) or Gamma (30-100 Hz)

### For Creativity
- **Pattern:** Lorenz, Rose, Infinity
- **Modulation:** Intense preset
- **Frequency Range:** Alpha (8-13 Hz)

### For Energy/Activation
- **Pattern:** Star, Conical, Trefoil
- **Modulation:** Extreme preset
- **Frequency Range:** Gamma (30-100 Hz)

### For Healing
- **Pattern:** Toroidal, Helix, Möbius
- **Modulation:** Subtle preset
- **Frequency Range:** Theta (4-8 Hz) or Schumann (7.83 Hz)

---

## 🎯 Technical Details

### Pattern Geometry Generation

Each pattern type has a dedicated generator function:

```typescript
generateLissajousPath(config, pointCount = 120)
generateMobiusPath(config, pointCount = 150)
generateRosePath(config, pointCount = 200)
generateTrefoilPath(config, pointCount = 150)
generateLorenzPath(config, pointCount = 500)
generateSphericalHarmonicsPath(config, pointCount = 200)
generateInfinityPath(config, pointCount = 100)
generateStarPolyhedronPath(config, pointCount = 60)
generateConicalHelixPath(config, pointCount = 120)
generateMandalaPath(config, pointCount = 180)
```

### Performance Optimization

- **Point Count:** Varies by complexity (60-500 points)
- **Update Rate:** ~60 FPS modulation updates
- **Render Rate:** ~15 FPS canvas rendering (optimized for eyes-closed use)
- **Memory:** Minimal - patterns reuse geometry with modulation overlays

### 3D Projection

All patterns use simple perspective projection:

```typescript
const scale = 1 / (1 + z * 0.001);
const projX = x * scale;
const projY = y * scale;
```

---

## 📊 Pattern Catalog

### Complete Pattern List

| ID | Name | Type | Beat Freq | Range | Benefits |
|----|------|------|-----------|-------|----------|
| `toroidal-max-resonance` | Maximum Resonance Toroid | toroidal | 30 Hz | Gamma | Max coherence, healing |
| `toroidal-healing` | Healing Toroidal Field | toroidal | 7.83 Hz | Theta | Regeneration, immune boost |
| `vortex-focus-enhancement` | Focus Enhancement Vortex | vortex | 12 Hz | Alpha | Focus, mental clarity |
| `vortex-creativity` | Creative Vortex Flow | vortex | 8 Hz | Alpha | Creativity, innovation |
| `spiral-transformation` | Transformation Spiral | spiral | 6 Hz | Theta | Personal growth |
| `helix-dna-activation` | DNA Activation Helix | helix | 2.675 Hz | Delta | DNA repair, longevity |
| `interference-balance` | Harmonic Balance Pattern | interference | 10 Hz | Alpha | Balance, stability |
| `standing-wave-meditation` | Deep Meditation Standing Wave | standing | 4 Hz | Theta | Deep meditation |
| `lissajous-harmony` | Lissajous Harmonic Sync | lissajous | 10 Hz | Alpha | Brain sync |
| `mobius-infinity` | Möbius Infinite Loop | mobius | 7.83 Hz | Theta | Non-dual awareness |
| `rose-sacred-geometry` | Sacred Rose Geometry | rose | 13 Hz | Beta | Sacred geometry |
| `trefoil-unity` | Trefoil Unity Knot | trefoil | 15 Hz | Beta | Unity, complexity |
| `lorenz-chaos` | Lorenz Chaotic Awakening | lorenz | 25 Hz | Beta | Chaos navigation |
| `spherical-quantum` | Quantum Spherical Harmonics | spherical | 40 Hz | Gamma | Quantum consciousness |
| `infinity-eternal` | Eternal Infinity Flow | infinity | 8 Hz | Alpha | Eternal flow |
| `star-cosmic` | Cosmic Star Activation | star | 11 Hz | Alpha | Cosmic activation |
| `conical-ascension` | Ascension Conical Helix | conical | 16 Hz | Beta | Ascension |
| `mandala-sacred` | Sacred Mandala Meditation | mandala | 5 Hz | Theta | Sacred meditation |

---

## 🚀 Future Enhancements

- [ ] FFT-based spectral analysis for more precise frequency detection
- [ ] Beat detection for rhythm-synced animations
- [ ] Machine learning for automatic modulation optimization
- [ ] VR/WebXR support for immersive 8D experiences
- [ ] Pattern sequencing and transitions
- [ ] Save/load custom modulation profiles
- [ ] MIDI controller integration
- [ ] Multi-pattern layering
- [ ] Particle system integration
- [ ] Audio waveform integration into geometry

---

## 📝 Notes

- **Browser Compatibility:** Requires Web Audio API and Canvas 2D
- **Recommended Hardware:** GPU-accelerated browser, decent CPU
- **Best Experience:** Use with binaural beats or music with clear frequency content
- **Safety:** Start with subtle modulation, increase gradually
- **Eyes-Closed:** Optimized for 15 FPS to reduce eye strain during meditation

---

## 🎵 Example Integration

```typescript
import { useEffect, useState } from 'react';
import {
  applyAudioReactiveModulation,
  AUDIO_REACTIVE_PRESETS
} from './utils/audioReactivePatterns';
import { WAVE_PATTERNS } from './data/patterns';
import { convertPatternConfigToPattern8D } from './utils/patternGeometry';

const AudioReactiveVisualization = () => {
  const [reactivePattern, setReactivePattern] = useState(null);
  const [analyzerNode, setAnalyzerNode] = useState(null);

  useEffect(() => {
    // Setup audio analyzer
    const audioContext = new AudioContext();
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;

    // Connect audio source to analyzer
    // ... audio source setup ...

    setAnalyzerNode(analyzer);
  }, []);

  useEffect(() => {
    if (!analyzerNode) return;

    const updatePattern = () => {
      const frequencyData = new Uint8Array(analyzerNode.frequencyBinCount);
      analyzerNode.getByteFrequencyData(frequencyData);

      // Select pattern
      const basePattern = convertPatternConfigToPattern8D(
        WAVE_PATTERNS.find(p => p.type === 'lissajous')
      );

      // Apply audio reactivity
      const modulated = applyAudioReactiveModulation(
        basePattern,
        frequencyData,
        AUDIO_REACTIVE_PRESETS.moderate,
        performance.now()
      );

      setReactivePattern(modulated);
      requestAnimationFrame(updatePattern);
    };

    updatePattern();
  }, [analyzerNode]);

  return <SpatialVisualizer pattern={reactivePattern} />;
};
```

---

**Designed for consciousness exploration, meditation, and immersive audio-visual experiences** 🧘‍♂️✨🎵