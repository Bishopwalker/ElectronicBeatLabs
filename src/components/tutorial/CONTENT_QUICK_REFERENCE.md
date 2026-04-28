# Tutorial Content Quick Reference

## For Developers: How to Use the Tutorial Steps

### Import Steps

```typescript
// Import all steps
import { allTutorialSteps, tutorialSteps } from './steps';

// Import by category
import { audioSteps, patternSteps, visualizationSteps } from './steps';

// Import utilities
import { getStepById, getStepsByCategory } from './steps';
```

### Access Step Content

```typescript
// Get specific step by ID
const step = getStepById('base-frequency');

console.log(step?.title);           // "Base (Carrier) Frequency"
console.log(step?.content);         // Brief explanation
console.log(step?.scienceContent);  // Detailed scientific explanation
console.log(step?.targetElement);   // '#binaural-base-frequency'
console.log(step?.placement);       // 'right'
console.log(step?.category);        // 'audio'
```

### Use in Components

```typescript
import { TutorialTooltip } from './components/tutorial';
import { getStepById } from './components/tutorial/steps';

function FrequencyControl() {
  const step = getStepById('base-frequency');

  return (
    <TutorialTooltip
      tooltipId="base-frequency"
      title={step?.title}
      content={step?.content}
      scienceContent={step?.scienceContent}
      placement={step?.placement}
    >
      <Slider id="binaural-base-frequency" />
    </TutorialTooltip>
  );
}
```

## Available Tutorial Steps

### Audio Controls (7 steps)

| ID | Title | Target Element |
|----|-------|----------------|
| `base-frequency` | Base (Carrier) Frequency | `#binaural-base-frequency` |
| `beat-frequency` | Beat Frequency (Binaural Beat) | `#binaural-beat-frequency` |
| `waveform-sine` | Waveform Types | `#waveform-selector` |
| `volume-control` | Volume & Amplitude | `#volume-slider` |
| `play-stop-controls` | Transport Controls | `#audio-transport-controls` |
| `audio-engine-selector` | Audio Engine Selection | `#audio-engine-toggle` |
| `headphone-requirement` | Headphone Requirement | `#headphone-warning` |

### Pattern System (6 steps)

| ID | Title | Target Element |
|----|-------|----------------|
| `pattern-mode-selector` | Pattern Modes | `#pattern-mode-selector` |
| `toroidal-pattern` | Toroidal Pattern | `#pattern-toroidal` |
| `vortex-pattern` | Vortex Pattern | `#pattern-vortex` |
| `spiral-pattern` | Spiral Pattern | `#pattern-spiral` |
| `helix-pattern` | Helix Pattern (Double Helix) | `#pattern-helix` |
| `8d-audio-pattern` | 8D Audio (Spatial Audio) | `#pattern-8d-audio` |

### Visualization (3 steps)

| ID | Title | Target Element |
|----|-------|----------------|
| `3d-spatial-visualizer` | 3D Spatial Visualizer | `#spatial-visualizer-container` |
| `frequency-visualizer` | Frequency Analyzer | `#frequency-analyzer` |
| `real-time-audio-analysis` | Real-Time Audio Analysis | `#audio-analysis-panel` |

### Equalizer & Effects (6 steps)

| ID | Title | Target Element |
|----|-------|----------------|
| `equalizer-overview` | 10-Band Graphic Equalizer | `#equalizer-panel` |
| `eq-band-32hz` | 32 Hz - Sub-Bass | `#eq-band-32` |
| `eq-band-64hz` | 64 Hz - Low Bass | `#eq-band-64` |
| `eq-band-125hz` | 125 Hz - Upper Bass | `#eq-band-125` |
| `spatial-effects` | Spatial Effects (Reverb & Width) | `#spatial-effects-panel` |
| `modulation-effects` | Modulation (LFO, Tremolo, Vibrato) | `#modulation-panel` |

### Timer System (3 steps)

| ID | Title | Target Element |
|----|-------|----------------|
| `timer-presets` | Session Presets | `#timer-preset-selector` |
| `custom-timer` | Custom Timer Builder | `#custom-timer-builder` |
| `loop-control` | Session Looping | `#loop-toggle` |

### Advanced Features (4 steps)

| ID | Title | Target Element |
|----|-------|----------------|
| `adhd-protocols` | ADHD Treatment Protocols | `#adhd-protocol-selector` |
| `quantum-oracle` | Quantum Oracle | `#quantum-oracle-panel` |
| `remote-viewing` | Remote Viewing (RV) | `#rv-panel` |
| `crv-protocol` | CRV (Controlled Remote Viewing) | `#crv-protocol-panel` |

## Content Statistics

| Category | Steps | Approx. Words |
|----------|-------|---------------|
| Audio | 7 | 8,000 |
| Patterns | 6 | 10,000 |
| Visualization | 3 | 8,000 |
| Equalizer | 6 | 12,000 |
| Timer | 3 | 8,000 |
| Advanced | 4 | 14,000 |
| **TOTAL** | **29** | **~60,000** |

## Scientific Topics Covered

### Physics
- Sound wave propagation and wavelength
- Electromagnetic field theory (Maxwell's equations)
- Quantum mechanics (Copenhagen interpretation, uncertainty principle)
- Acoustics and room modes
- Reverberation physics (Sabine's formula)

### Mathematics
- Fourier Transform (DFT, FFT algorithms)
- Golden Ratio and Fibonacci sequence
- Logarithmic and Archimedean spirals
- Parametric equations for 3D patterns
- Biquad filter transfer functions
- Vector-Based Amplitude Panning (VBAP)

### Neuroscience
- Brainwave states (delta, theta, alpha, beta, gamma)
- Frequency Following Response (FFR)
- Brainwave entrainment mechanisms
- ADHD neurophysiology (theta/beta ratio)
- Neurofeedback and neuroplasticity
- Superior olivary complex (binaural processing)

### Computer Science
- Web Audio API architecture
- Digital Signal Processing (DSP)
- GPU-accelerated graphics (WebGL, GLSL shaders)
- FFT complexity analysis (O(N log N))
- WebSocket streaming protocols
- Ring buffer management

### Psychology & Consciousness
- Psychoacoustics (Fletcher-Munson curves)
- Remote viewing protocols and research
- Quantum consciousness theories
- Meditation and altered states
- Parapsychology research (pro and con perspectives)

## Research Citations (Sample)

### Binaural Beats & Entrainment
- Oster, G. (1973). "Auditory beats in the brain." *Scientific American*.
- Lane, J. et al. (1998). "Binaural auditory beats affect vigilance." *Physiology & Behavior*.
- Wahbeh, H. et al. (2007). "Binaural beat technology in humans." *Alternative Therapies*.

### ADHD & Neurofeedback
- Lubar, J.F. (1991). EEG diagnostics and biofeedback for ADHD.
- Arns, M. et al. (2009). "Efficacy of neurofeedback treatment in ADHD: Meta-analysis."
- Cortese et al. (2016). European ADHD Guidelines.

### Remote Viewing
- Targ, R. & Puthoff, H. (1974). "Information transmission under sensory shielding." *Nature*.
- Utts, J. (1996). "Assessment of evidence for psychic functioning." *Journal of Scientific Exploration*.

### Psychoacoustics
- Fletcher, H. & Munson, W. (1933). "Loudness, its definition, measurement and calculation."
- Moore, B.C.J. (2012). "An Introduction to the Psychology of Hearing."

### Digital Signal Processing
- Oppenheim, A.V. & Schafer, R.W. (2009). "Discrete-Time Signal Processing."
- Cooley & Tukey (1965). FFT algorithm development.

## Content Features

### Dual-Layer Education
Each step includes:
- **`content`**: Brief 1-2 sentence summary (quick understanding)
- **`scienceContent`**: Comprehensive explanation (PhD-level depth, accessibly presented)

### Scientific Rigor
- All claims backed by research or clearly labeled as theoretical
- Mathematical formulas with context and explanation
- No pseudoscience presented as fact
- Balanced perspectives on controversial topics

### Practical Guidance
- When to use features
- How to use effectively
- Safety considerations
- Troubleshooting tips

## Adding Your Own Steps

### Step Template

```typescript
{
  id: 'category-feature-name',
  targetElement: '#element-id',
  category: 'audio' | 'patterns' | 'visualization' | 'equalizer' | 'timer' | 'advanced',
  title: 'Feature Name',
  content: 'Brief 1-2 sentence explanation of what this feature does.',
  scienceContent: `
**Detailed Scientific Explanation**

Include:
- Technical details
- Scientific background
- Mathematical formulas
- Research citations
- Practical applications
- Safety considerations
  `,
  placement: 'top' | 'bottom' | 'left' | 'right' | 'auto',
  order: 1 // Numeric order within category
}
```

### Best Practices

1. **ID Naming**: Use format `category-feature-name` (kebab-case)
2. **Target Element**: Must match actual element ID in UI (CSS selector)
3. **Content Length**:
   - `content`: 1-2 sentences (50-100 words)
   - `scienceContent`: Comprehensive (500-2000+ words)
4. **Placement**: Choose based on UI layout to avoid covering important elements
5. **Order**: Use consistent numbering within categories

### Example Addition

```typescript
// In audioSteps.ts
{
  id: 'bass-boost',
  targetElement: '#bass-boost-toggle',
  category: 'audio',
  title: 'Bass Boost',
  content: 'Enhances low frequencies (20-200 Hz) by +6dB for richer, deeper sound.',
  scienceContent: `
**Bass Boost: Low-Frequency Enhancement**

Bass boost applies a shelving filter to frequencies below 200 Hz:

**Transfer Function:**
H(f) = 1 + G × (1 / (1 + (f/f_c)²))

Where:
- G = Gain factor (linear, e.g., 2.0 for +6dB)
- f_c = Corner frequency (200 Hz)
- f = Frequency being processed

**Why Bass Boost?**

Human hearing is less sensitive to low frequencies:
- At 50 Hz, threshold ~60 dB SPL
- At 1 kHz, threshold ~0 dB SPL

Bass boost compensates for this at quiet listening levels.

**Use Cases:**
- Nighttime listening (compensate for reduced volume)
- Small speakers/headphones (natural bass rolloff)
- Deep meditation sessions (emphasize low carriers)

**Caution:**
- Can cause clipping if signal already near max
- May sound "muddy" if overdone
- Not recommended for gamma (high) frequencies
  `,
  placement: 'right',
  order: 8
}
```

## Integration Checklist

When adding tutorial content to UI:

- [ ] Element has unique `id` attribute
- [ ] ID matches `targetElement` in step definition
- [ ] Element wrapped in `<TutorialTooltip>`
- [ ] `tooltipId` prop matches step `id`
- [ ] Placement chosen to avoid UI overlap
- [ ] Content tested in both brief and expanded modes
- [ ] Scientific content accuracy verified
- [ ] Citations checked
- [ ] Mobile responsiveness tested

## Troubleshooting

### Tooltip Not Appearing
1. ✅ Check element has `id` attribute
2. ✅ Verify `tooltipId` matches step `id` exactly
3. ✅ Ensure tutorial system is active
4. ✅ Check step not in `dismissedTooltips` array
5. ✅ Verify step exists in `allTutorialSteps`

### Content Not Displaying
1. ✅ Check `content` and `scienceContent` fields populated
2. ✅ Verify no syntax errors in markdown/formatting
3. ✅ Check browser console for errors
4. ✅ Test with simple text first, then add formatting

### Placement Issues
1. ✅ Try different placement values ('auto', 'top', 'bottom', 'left', 'right')
2. ✅ Check parent container doesn't have `overflow: hidden`
3. ✅ Verify z-index not being overridden
4. ✅ Test on different screen sizes

## Contact & Support

For questions about tutorial content:
- Content issues: Check scientific citations and update accordingly
- Technical issues: Verify TypeScript types match system
- UX issues: Test with users and refine based on feedback

---

**Last Updated**: November 27, 2025
**Maintained By**: Content Agent (Agent 2)
**Project**: Electromagnetic Beat Lab (EBL)
