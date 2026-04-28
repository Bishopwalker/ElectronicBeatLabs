/**
 * Visualization Tutorial Steps
 * EBL (Electromagnetic Beat Lab)
 *
 * Scientific explanations for real-time audio visualization systems
 */

import { TooltipStep } from '../types';

export const visualizationSteps: TooltipStep[] = [
  {
    id: '3d-spatial-visualizer',
    targetElement: '#spatial-visualizer-container',
    category: 'visualization',
    title: '3D Spatial Visualizer',
    content: 'Real-time electromagnetic field simulation showing your current pattern in 3D space using WebGL rendering.',
    scienceContent: `**WebGL & GPU-Accelerated Graphics**

**WebGL (Web Graphics Library):**
- Based on OpenGL ES 2.0 standard
- Runs on GPU (Graphics Processing Unit) for parallel processing
- Can render millions of vertices per frame at 60 FPS
- Uses shader programs (GLSL) for custom visual effects

**Rendering Pipeline:**

1. **Vertex Shader**: Processes each point in 3D space
   - Applies transformations (rotation, translation, scale)
   - Calculates lighting per vertex
   - Projects 3D coordinates to 2D screen space

2. **Fragment Shader** (Pixel Shader): Colors each pixel
   - Calculates final color based on lighting, textures
   - Applies visual effects (glow, transparency, etc.)
   - Runs millions of times per frame (once per pixel)

**EBL Visualization Architecture:**

**Three.js Framework:**
- High-level abstraction over raw WebGL
- Scene graph management (objects, cameras, lights)
- Built-in geometries, materials, and utilities
- Handles cross-browser compatibility

**Electromagnetic Field Simulation:**

The visualization isn't just pretty graphics - it's a physics simulation based on Maxwell's equations:

**Field Strength Calculation:**
E(r,t) = E₀ × f(r) × sin(ωt + φ)

Where:
- E(r,t) = Electric field at position r, time t
- E₀ = Peak field strength
- f(r) = Spatial distribution function (depends on pattern)
- ω = Angular frequency (2πf)
- φ = Phase offset

**Particle System:**
Each visible particle represents a "field line" or "energy point":
- Position updated based on field equations
- Color mapped to field intensity (magnitude)
- Velocity follows field gradient (∇E)
- Turbulence adds natural variation

**Color Mapping (Data Visualization):**

**Frequency → Color:**
- Delta (0.5-4 Hz): Deep blue/purple (low energy, rest)
- Theta (4-8 Hz): Blue/cyan (meditation, creativity)
- Alpha (8-13 Hz): Green/yellow (relaxed alertness)
- Beta (13-30 Hz): Orange/yellow (active thinking)
- Gamma (30-100 Hz): Red/white (high energy, peak states)

Based on perceptual color theory:
- Cool colors (blue) = calming, introspective
- Warm colors (red/orange) = energizing, external focus

**Intensity → Brightness:**
Field intensity mapped to HSL (Hue, Saturation, Lightness):
- Stronger field → Brighter, more saturated
- Weaker field → Dimmer, less saturated
- Allows instant visual feedback on audio strength

**Real-Time Synchronization:**

**Audio Analysis → Visual Update:**
1. Audio AnalyserNode provides frequency/time domain data (60 FPS)
2. Data converted to electromagnetic field parameters
3. Particle system updated based on new field state
4. Three.js renders new frame
5. Cycle repeats every 16.67ms (60 Hz)

**Latency Management:**
- Target: <16ms total latency (audio to visual)
- Achieved through:
  - GPU parallel processing
  - Efficient data structures (typed arrays)
  - Minimal DOM manipulation
  - RequestAnimationFrame synchronization

**Pattern-Specific Visualizations:**

**Toroidal:**
- Particle flow follows torus surface
- Uses parametric torus equations
- Creates visible "donut" of energy
- Flow direction shows field circulation

**Vortex:**
- Spiral inward/outward motion
- Logarithmic spiral paths
- Rotation speed tied to beat frequency
- Color intensity peaks at vortex eye

**Helix:**
- Two counter-rotating spirals
- Vertical ascent/descent
- Crossing points show beat reinforcement
- DNA-like double helix structure

**Wave:**
- Sinusoidal oscillation through space
- Demonstrates wave interference
- Standing wave patterns when frequencies align
- Nodes (zero amplitude) and antinodes (maximum) clearly visible

**Scientific Accuracy vs. Artistic License:**

While inspired by real electromagnetic theory, the visualization takes artistic liberties:
- **Simplified Physics**: Real EM waves are invisible and abstract
- **Exaggerated Effects**: Field strength amplified for visual impact
- **Composite Representation**: Combines E-field, B-field, and energy density into one visual
- **Aesthetic Choices**: Colors, shapes chosen for beauty and clarity, not strict physics accuracy

**Performance Optimization:**

**Level-of-Detail (LOD):**
- Fewer particles on slower devices
- Simplified shaders for integrated GPUs
- Automatic quality adjustment based on frame rate

**Culling:**
- Frustum culling: Don't render off-screen objects
- Occlusion culling: Don't render objects behind others
- Distance culling: Simplify distant objects

**Memory Management:**
- Object pooling (reuse particles instead of creating/destroying)
- Texture atlases (combine multiple images into one)
- Geometry instancing (reuse same mesh for multiple objects)

**Neuroscience of Visual Feedback:**

**Why Visualization Enhances Entrainment:**

1. **Multimodal Integration**: Brain integrates audio + visual → stronger effect
2. **Focus Anchor**: Moving visuals provide meditative focus point
3. **State Confirmation**: Seeing the pattern reinforces your mental state
4. **Engagement**: Prevents mind wandering, maintains attention

**Brain Regions Activated:**
- **Visual Cortex (V1-V5)**: Processing motion, color, form
- **Parietal Cortex**: Spatial awareness, 3D perception
- **Superior Colliculus**: Coordinates audio-visual integration
- **Prefrontal Cortex**: Attention, interpretation of patterns

**Flicker Fusion & Frame Rate:**

**Critical Flicker Frequency (CFF):**
- ~60 Hz for most people (varies 50-90 Hz)
- Below CFF: Perceive flicker (annoying, can trigger seizures in susceptible individuals)
- Above CFF: Smooth motion

**Why 60 FPS:**
- Just above typical CFF
- Matches most display refresh rates (60 Hz)
- Provides smooth, flicker-free animation
- Higher frame rates (120+ Hz) offer minimal perceptual benefit for this application

**Advanced: Electromagnetic Field Theory**

**Maxwell's Equations** (governs all classical EM phenomena):

1. **Gauss's Law**: ∇·E = ρ/ε₀ (electric field divergence)
2. **Gauss's Law for Magnetism**: ∇·B = 0 (no magnetic monopoles)
3. **Faraday's Law**: ∇×E = -∂B/∂t (changing B creates E)
4. **Ampère-Maxwell Law**: ∇×B = μ₀J + μ₀ε₀∂E/∂t (current and changing E create B)

The visualization approximates these by:
- Calculating field vectors at each particle position
- Updating vectors based on time-varying frequency
- Rendering field lines as particle trails

**Vector Field Visualization:**
- **Field Lines**: Tangent to field vector at every point
- **Density**: Closer lines = stronger field
- **Direction**: Arrows show field direction
- **Color Gradient**: Shows field magnitude

**Research Applications:**

Scientists use similar visualizations to:
- Study plasma physics (fusion research)
- Understand solar wind interactions with Earth's magnetosphere
- Model electromagnetic interference in electronics
- Visualize antenna radiation patterns
- Teach electromagnetic concepts to students

EBL brings this same visualization technology to consciousness exploration.`,
    placement: 'left',
    order: 1
  },

  {
    id: 'frequency-visualizer',
    targetElement: '#frequency-analyzer',
    category: 'visualization',
    title: 'Frequency Analyzer',
    content: 'Real-time spectrum analysis showing the actual frequencies present in your audio using Fast Fourier Transform (FFT).',
    scienceContent: `**Fast Fourier Transform: The Mathematical Foundation**

**What is Fourier Analysis?**

French mathematician Joseph Fourier (1822) proved that any periodic signal can be represented as a sum of sine and cosine waves:

f(t) = a₀ + Σ[aₙcos(nωt) + bₙsin(nωt)]

**Fourier's Insight:**
A complex waveform (like a musical note or binaural beat) is just the sum of many simple sine waves at different:
- Frequencies (n × fundamental frequency)
- Amplitudes (aₙ, bₙ coefficients)
- Phases (time shifts)

**Time Domain vs. Frequency Domain:**

- **Time Domain**: Amplitude vs. Time (what you see on oscilloscope)
  - Shows how signal changes moment to moment
  - Hard to identify individual frequencies

- **Frequency Domain**: Amplitude vs. Frequency (what FFT shows)
  - Shows which frequencies are present and how strong
  - Easy to identify pitch, harmonics, noise

**FFT: The Fast Algorithm**

**Discrete Fourier Transform (DFT):**
Converts N samples from time domain to frequency domain:

X[k] = Σ(n=0 to N-1) x[n] × e^(-j2πkn/N)

Where:
- x[n] = time-domain samples (audio data)
- X[k] = frequency-domain bins (what we display)
- j = √(-1) (imaginary unit)
- k = frequency bin index

**Computational Complexity:**
- **DFT**: O(N²) operations - very slow for large N
- **FFT** (Cooley-Tukey algorithm): O(N log N) - much faster!
  - Example: For N=1024 samples
  - DFT: 1,048,576 operations
  - FFT: 10,240 operations (100× faster!)

**How EBL Uses FFT:**

**Web Audio AnalyserNode:**
```javascript
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048; // Must be power of 2
const bufferLength = analyser.frequencyBinCount; // fftSize / 2 = 1024
const dataArray = new Uint8Array(bufferLength);
analyser.getByteFrequencyData(dataArray); // Populates array with FFT results
```

**FFT Size Selection:**

| FFT Size | Frequency Bins | Frequency Resolution | Time Resolution |
|----------|----------------|---------------------|-----------------|
| 512 | 256 | 93.75 Hz | 10.67 ms |
| 1024 | 512 | 46.88 Hz | 21.33 ms |
| 2048 | 1024 | 23.44 Hz | 42.67 ms |
| 4096 | 2048 | 11.72 Hz | 85.33 ms |

(At 48 kHz sample rate)

**Frequency Resolution = Sample Rate / FFT Size**

**Time-Frequency Tradeoff:**
- Larger FFT → Better frequency resolution, worse time resolution
- Smaller FFT → Better time resolution, worse frequency resolution
- Can't have both simultaneously (Heisenberg uncertainty principle for signals!)

**EBL's Choice: 2048**
- Good frequency resolution (~23 Hz) to distinguish beat frequency
- Good time resolution (~43 ms) for responsive visuals
- Reasonable computational load

**Frequency Bin Calculation:**

Each bin represents a frequency range:

Bin Frequency = (Bin Index × Sample Rate) / FFT Size

Example at 48 kHz, FFT size 2048:
- Bin 0: 0 Hz (DC component - average signal level)
- Bin 1: 23.44 Hz
- Bin 10: 234.4 Hz
- Bin 100: 2344 Hz

**Nyquist Frequency:**
Maximum frequency that can be represented:
- Nyquist = Sample Rate / 2
- At 48 kHz: Nyquist = 24 kHz
- Why: Need at least 2 samples per cycle to represent a frequency (Nyquist-Shannon theorem)

**What You're Seeing:**

**Carrier Frequencies:**
Two peaks at your left and right ear frequencies:
- Left ear: 140 Hz → Bin 6 (140/23.44 ≈ 6)
- Right ear: 150 Hz → Bin 6.4 (150/23.44 ≈ 6.4)

**Beat Frequency:**
Does NOT appear as a separate peak!
- The 10 Hz beat is a perceptual artifact, not a real frequency in the signal
- You might see amplitude modulation (peaks pulsing at 10 Hz)
- Or very subtle energy at 10 Hz from non-linearities in audio system

**Harmonics:**
Depending on waveform, you'll see additional peaks:
- Sine: Only fundamental (clean single peaks)
- Square: Odd harmonics at 3×, 5×, 7× fundamental
- Sawtooth: All harmonics at 2×, 3×, 4×, 5× fundamental

**Windowing & Spectral Leakage:**

**Problem: Discontinuities**
FFT assumes signal repeats infinitely. If audio segment doesn't start/end at same point, creates artifacts.

**Solution: Window Functions**
Multiply signal by smooth function that tapers to zero at edges:

**Common Windows:**
1. **Rectangular**: No windowing (good frequency resolution, bad spectral leakage)
2. **Hanning** (Hann): Smooth taper, general purpose
3. **Hamming**: Similar to Hann, slightly better for speech
4. **Blackman**: Very smooth, best spectral leakage reduction, wider main lobe

EBL uses Hanning window (Web Audio API default).

**Logarithmic vs. Linear Frequency Scale:**

**Linear Scale:**
- Equal spacing: 100 Hz, 200 Hz, 300 Hz, 400 Hz...
- How FFT naturally outputs data
- Low frequencies compressed, high frequencies spread out

**Logarithmic Scale:**
- Equal perceptual spacing (each octave same width)
- Matches human hearing (we perceive pitch logarithmically)
- Better for music/audio visualization

**Octave Definition:**
Doubling frequency = one octave higher
- A4: 440 Hz
- A5: 880 Hz (one octave up)
- A3: 220 Hz (one octave down)

**Decibel Scale (dB):**

Amplitude often shown in decibels:

dB = 20 × log₁₀(Amplitude / Reference)

Why logarithmic?
- Human hearing responds logarithmically to intensity
- Wide dynamic range (human hearing: 120+ dB range)
- 6 dB ≈ doubling amplitude
- 20 dB = 10× amplitude

**Color Mapping:**

Frequency amplitude → Visual representation:

**Heat Map Colors:**
- Black/Dark Blue: Silent (0 dB)
- Blue: Quiet (-60 to -40 dB)
- Green: Moderate (-40 to -20 dB)
- Yellow: Loud (-20 to -6 dB)
- Red: Very Loud (-6 to 0 dB)
- White: Clipping (>0 dB - signal distortion)

**Bar Height/Color:**
- Height: Amplitude in dB or linear scale
- Color: Can indicate frequency (low=blue, high=red) or amplitude (same as heat map)

**Smoothing & Temporal Averaging:**

Raw FFT data is noisy and jumps around. EBL applies smoothing:

**Exponential Moving Average:**
smoothed[n] = α × current[n] + (1-α) × smoothed[n-1]

Where α (smoothing factor) ranges 0-1:
- α = 0: No update (frozen display)
- α = 0.3: Slow, smooth response
- α = 0.8: Fast, responsive, but jumpy
- α = 1.0: No smoothing (raw FFT)

EBL typically uses α ≈ 0.8 for responsive but not jittery display.

**Peak Detection & Frequency Tracking:**

Algorithms can automatically detect:
1. **Fundamental Frequency**: Strongest peak (your carrier frequency)
2. **Harmonics**: Peaks at integer multiples of fundamental
3. **Beat Frequency**: Amplitude modulation rate (requires autocorrelation or time-domain analysis)

**Applications of FFT Beyond Visualization:**

1. **Audio Compression** (MP3, AAC): Remove frequencies you can't hear
2. **Speech Recognition**: Identify phonemes by their frequency signatures
3. **Music Analysis**: Chord detection, key finding, tempo estimation
4. **Noise Reduction**: Identify and remove specific frequency noise
5. **Equalization**: Boost/cut specific frequencies
6. **Telecommunications**: Modulate data onto different frequency carriers (OFDM)
7. **Medical Imaging**: MRI uses FFT to convert raw data to images
8. **Astronomy**: Analyze periodic signals from pulsars, exoplanets

**Limitations & Artifacts:**

1. **Frequency Resolution**: Limited by FFT size (can't distinguish frequencies closer than ~23 Hz in EBL)
2. **Temporal Smearing**: Each FFT bin is average over entire window (~43 ms)
3. **Spectral Leakage**: Energy from strong tone "leaks" into adjacent bins
4. **Harmonic Confusion**: Can mistake harmonic for fundamental
5. **Amplitude Estimation**: FFT amplitude depends on window function, not always accurate

**Advanced: Spectrogram (Time-Frequency Analysis):**

A spectrogram stacks FFT results over time:
- X-axis: Time
- Y-axis: Frequency
- Color: Amplitude

Creates a "heat map" showing how frequency content evolves - often used in speech analysis, birdsong research, and music production.

EBL's frequency visualizer is essentially a real-time, single-column spectrogram.`,
    placement: 'right',
    order: 2
  },

  {
    id: 'real-time-audio-analysis',
    targetElement: '#audio-analysis-panel',
    category: 'visualization',
    title: 'Real-Time Audio Analysis',
    content: 'Continuous monitoring of audio characteristics including RMS level, peak amplitude, frequency stability, and harmonic content.',
    scienceContent: `**Digital Signal Processing (DSP) Metrics**

**RMS (Root Mean Square) Level:**

Mathematical definition:
RMS = √(1/N × Σx[n]²)

Where:
- x[n] = amplitude samples
- N = number of samples
- Σ = sum over all samples

**Physical Meaning:**
RMS represents the effective "power" of a signal - the DC voltage that would deliver the same power to a resistor.

**Why RMS > Peak?**
- Peak amplitude: Maximum instantaneous value
- RMS: Average power over time
- For sine wave: RMS = Peak / √2 ≈ 0.707 × Peak

**Example:**
- Sine wave: Peak = 1.0, RMS = 0.707
- Square wave: Peak = 1.0, RMS = 1.0 (constant power)
- Triangle wave: Peak = 1.0, RMS = 0.577

**Crest Factor:**
Crest Factor = Peak / RMS

Indicates "peakiness" of waveform:
- Sine: CF = 1.414 (√2)
- Square: CF = 1.0
- Music: CF = 4-10 (very dynamic)
- Speech: CF = 3-5

**Peak Amplitude:**

**Sample-Accurate Peak Detection:**
```javascript
let peak = 0;
for (let i = 0; i < buffer.length; i++) {
  const abs = Math.abs(buffer[i]);
  if (abs > peak) peak = abs;
}
```

**Clipping Detection:**
If peak ≥ 1.0 (or ≥ 0 dBFS), signal is clipping:
- Waveform is being "cut off" at maximum
- Introduces harmonic distortion
- Sounds harsh, distorted
- Can damage speakers if sustained

**True Peak vs. Sample Peak:**
Digital peak detection can miss inter-sample peaks (between samples). True peak detection oversamples 4× to catch these - not typically necessary for EBL.

**Frequency Stability Analysis:**

**Variance Measurement:**
σ² = 1/N × Σ(f[n] - f̄)²

Where:
- f[n] = detected frequency at time n
- f̄ = mean frequency
- σ² = variance (larger = more instability)

**Standard Deviation:**
σ = √(σ²)

Typical values for EBL:
- Excellent stability: σ < 0.1 Hz
- Good stability: σ < 0.5 Hz
- Acceptable: σ < 1.0 Hz
- Poor: σ > 2.0 Hz (may indicate frequency drift or detection errors)

**Why Stability Matters:**
- Binaural beat effectiveness requires consistent frequencies
- Drift of >1 Hz can shift brainwave target (10 Hz → 11 Hz changes alpha to low beta)
- Indicates quality of audio generation/streaming

**Phase Coherence:**

**Phase Definition:**
Phase describes position within a waveform cycle:
- 0° = start of cycle
- 90° = peak (for sine)
- 180° = middle (crossing zero downward)
- 270° = trough
- 360° = back to start

**Phase Difference (Between Left/Right):**
Δφ = φ_right - φ_left

For binaural beat:
- Phase difference creates the beating pattern
- Rate of phase cycling = beat frequency
- If 150 Hz gains 10 cycles per second on 140 Hz → 10 Hz beat

**Coherence Measure:**
Coherence = |⟨e^(jΔφ)⟩|

Where ⟨⟩ denotes time average.

Values:
- 1.0 = Perfectly coherent (fixed phase relationship)
- 0.0 = Completely incoherent (random phase)

High coherence (>0.95) indicates clean binaural beat generation.

**Harmonic Analysis:**

**Harmonic Series:**
Fundamental (f₀) and integer multiples:
- 1st harmonic: f₀ (fundamental)
- 2nd harmonic: 2f₀
- 3rd harmonic: 3f₀
- etc.

**Total Harmonic Distortion (THD):**

THD = √(V₂² + V₃² + V₄² + ...) / V₁

Where V₁ is fundamental amplitude, V₂, V₃... are harmonic amplitudes.

**THD Percentage:**
- <1%: Excellent (hi-fi audio)
- 1-3%: Good (acceptable for most audio)
- 3-10%: Moderate (audible distortion)
- >10%: Poor (significant distortion)

**Expected THD by Waveform:**
- **Sine**: 0% (pure tone, no harmonics)
- **Square**: ~48% (strong odd harmonics)
- **Triangle**: ~12% (weaker odd harmonics)
- **Sawtooth**: ~18% (all harmonics)

Higher THD isn't necessarily bad - it's intentional for square/triangle/sawtooth waves.

**Spectral Centroid:**

"Center of mass" of frequency spectrum:

Centroid = Σ(f[k] × Mag[k]) / Σ(Mag[k])

Where:
- f[k] = frequency of bin k
- Mag[k] = magnitude of bin k

**Interpretation:**
- Lower centroid: Darker, bassier sound
- Higher centroid: Brighter, harsher sound
- Tracks overall "brightness" of audio

**For binaural beats:**
- Sine wave: Centroid ≈ carrier frequency (very precise)
- Square wave: Centroid higher (harmonics add brightness)

**Zero-Crossing Rate (ZCR):**

Number of times signal crosses zero amplitude per second.

**Relationship to Frequency:**
For simple tones:
ZCR ≈ 2 × Frequency

(Crosses zero twice per cycle)

**Uses:**
- Crude frequency estimation
- Voicing detection (speech vs. silence)
- Onset detection (when sound starts)

**Limitations:**
- Fails for complex signals
- Affected by noise
- EBL uses FFT instead for accurate frequency measurement

**Dynamic Range:**

Range between loudest and quietest parts:

Dynamic Range = Peak Level - Noise Floor (in dB)

**Typical Values:**
- Binaural beat (EBL): 60-90 dB (moderate to high)
- Classical music: 70-100 dB (very wide)
- Pop music: 20-40 dB (heavily compressed)
- 16-bit audio: Theoretical max 96 dB
- 24-bit audio: Theoretical max 144 dB

**Signal-to-Noise Ratio (SNR):**

SNR = Signal Power / Noise Power (in dB)

**Calculation:**
SNR = 20 × log₁₀(Signal_RMS / Noise_RMS)

**Typical Values:**
- >90 dB: Excellent (high-end audio interfaces)
- 70-90 dB: Good (consumer audio)
- 50-70 dB: Acceptable (noisy but usable)
- <50 dB: Poor (significant noise)

**Latency Monitoring:**

**Audio Latency Sources:**

1. **Input Latency**: ADC (analog-to-digital conversion) + buffering
2. **Processing Latency**: DSP algorithms, effects
3. **Output Latency**: Buffering + DAC (digital-to-analog conversion)
4. **Total Latency**: Sum of all stages

**Acceptable Latencies:**
- <10ms: Excellent (real-time monitoring, live performance)
- 10-30ms: Good (recording, casual listening)
- 30-50ms: Acceptable (minor delay noticeable)
- >50ms: Poor (echo effect, audio-visual desync)

**EBL Targets:**
- Frontend engine: 5-15ms
- Backend engine: 50-150ms (includes network latency)

**Buffer Size Tradeoff:**
- Smaller buffer: Lower latency, higher CPU load, more dropouts
- Larger buffer: Higher latency, lower CPU load, smoother playback

EBL uses moderate buffer (16-90 frames) balancing latency and stability.

**Consciousness Detection Metrics:**

**Variance as Proxy for Mental State:**

Research suggests:
- Low variance: Deep meditation, stable focus
- High variance: Mind wandering, distraction, transition states

**EBL monitors:**
1. Frequency variance (how consistent is detected frequency?)
2. Amplitude variance (how stable is volume?)
3. Interaction patterns (mouse/keyboard activity)
4. Physiological proxies (if external sensors connected)

**Algorithm:**
If variance exceeds threshold → System adapts:
- May change pattern
- May adjust frequencies
- May provide feedback

**Limitations:**
- Can't directly measure brain activity (would need EEG)
- Proxies are indirect indicators
- Individual variation is high

**Real-Time Display Updates:**

**Refresh Rate:**
EBL updates analysis metrics at 60 Hz (every ~16.67ms):

1. AnalyserNode provides new FFT data
2. Calculate RMS, peak, frequency, THD
3. Update display values
4. Render new visualization frame
5. Repeat

**Smoothing:**
Rapid updates can appear jittery. Apply exponential smoothing:

display_value = α × new_value + (1-α) × previous_value

Where α ≈ 0.1-0.3 for smooth but responsive display.

**Performance Optimization:**

**Typed Arrays:**
Use Float32Array, Uint8Array instead of regular JavaScript arrays:
- 2-10× faster
- Less memory
- Better cache performance

**Minimal DOM Updates:**
Update text/graphics only when values change significantly:
- Reduces browser rendering load
- Prevents visual jitter
- Improves frame rate

**Web Workers:**
Offload heavy DSP calculations to background thread:
- Main thread stays responsive
- Can use more CPU without blocking UI
- Requires careful data transfer (serialization overhead)

EBL uses combination of these for optimal performance.`,
    placement: 'bottom',
    order: 3
  }
];
