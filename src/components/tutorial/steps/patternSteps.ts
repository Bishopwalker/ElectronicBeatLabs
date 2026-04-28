/**
 * Pattern System Tutorial Steps
 * EBL (Electromagnetic Beat Lab)
 *
 * Scientific explanations for electromagnetic pattern generation
 */

import { TooltipStep } from '../types';

export const patternSteps: TooltipStep[] = [
  {
    id: 'pattern-mode-selector',
    targetElement: '#pattern-mode-selector',
    category: 'patterns',
    title: 'Pattern Modes',
    content: 'Control how electromagnetic patterns are generated and applied to your audio. Each mode offers different levels of automation and control.',
    scienceContent: `**Pattern Generation Algorithms**

**AUTO Mode (Algorithmic Intelligence):**
- **How It Works**: AI analyzes your current beat frequency and automatically selects optimal pattern based on brainwave target
- **Algorithm**: Uses frequency-to-pattern mapping based on research into consciousness states
  - Delta/Theta (0.5-8 Hz) → Toroidal (containment, deep states)
  - Alpha (8-13 Hz) → Spiral (expansion, meditative flow)
  - Beta (13-30 Hz) → Helix (structured complexity, active thinking)
  - Gamma (30-100 Hz) → Vortex (high-energy spiral, peak states)
- **Benefits**: Optimal pattern selection without manual intervention, seamless transitions
- **Use Case**: General sessions, beginners, when you want the system to optimize automatically

**MANUAL Mode (Direct Control):**
- **How It Works**: You explicitly select which pattern to use from the library
- **Benefits**: Complete creative control, ability to experiment with non-standard combinations
- **Use Case**: Advanced users, experimental sessions, when you have specific pattern preferences
- **Pattern Persistence**: Your selected pattern remains active until you change it

**OFF Mode (Pattern Disabled):**
- **How It Works**: Disables pattern modulation entirely - pure binaural beat only
- **Audio Impact**: Frequencies remain constant, no spatial modulation, no electromagnetic field simulation
- **Benefits**: Minimal CPU usage, simplest entrainment, baseline testing
- **Use Case**: When you want pure frequency entrainment without spatial complexity, performance-limited devices

**CUSTOM Mode (User-Created Patterns):**
- **How It Works**: Load user-defined patterns with custom parameters (frequency maps, spatial coordinates, timing)
- **Creation**: Define your own electromagnetic field equations, spatial paths, modulation curves
- **Advanced Math**: Can specify custom Lissajous curves, parametric equations, or even import 3D paths
- **Use Case**: Researchers, advanced practitioners, specific therapeutic protocols

**SYNC Mode (Audio-Synchronized):**
- **How It Works**: Pattern evolution synchronizes with real-time audio analysis
- **Technology**: Fast Fourier Transform (FFT) analyzes frequency spectrum, pattern responds to amplitude peaks
- **Visual Feedback**: Pattern intensity, rotation speed, and field strength modulate with your audio
- **Use Case**: Interactive sessions, music integration, consciousness-responsive feedback
- **Latency**: <10ms response time for near-instantaneous visual-audio coupling

**FLOW Mode (Consciousness-Adaptive):**
- **How It Works**: Uses consciousness detection algorithms to sense your mental state and adapt patterns in real-time
- **Technology**: Analyzes audio input patterns, EEG data (if available), interaction timing, and behavioral signals
- **Adaptation**: If system detects you're not entraining (measured by audio variance), it automatically adjusts pattern parameters
- **Research Basis**: Based on neurofeedback principles - providing real-time feedback enhances entrainment effectiveness
- **Use Case**: Advanced meditation, neurofeedback training, optimal state attainment

**Mathematical Foundation:**
Patterns are generated using parametric equations in 3D space:
- x(t) = f₁(t, θ, φ)
- y(t) = f₂(t, θ, φ)
- z(t) = f₃(t, θ, φ)

Where t is time, θ is phase angle, φ is secondary phase. Different pattern types use different functions (sinusoidal for spirals, toroidal coordinates for toroids, etc.)`,
    placement: 'right',
    order: 1
  },

  {
    id: 'toroidal-pattern',
    targetElement: '#pattern-toroidal',
    category: 'patterns',
    title: 'Toroidal Pattern',
    content: 'A donut-shaped energy field that represents self-sustaining electromagnetic flow. Found throughout nature from atoms to galaxies.',
    scienceContent: `**The Toroidal Field: Nature's Fundamental Pattern**

**Mathematical Definition:**
A torus is defined by two radii:
- **Major radius (R)**: Distance from center of tube to center of torus
- **Minor radius (r)**: Radius of the tube itself

Parametric equations:
- x = (R + r⋅cos(v))⋅cos(u)
- y = (R + r⋅cos(v))⋅sin(u)
- z = r⋅sin(v)

Where u, v are parameters ranging from 0 to 2π.

**Electromagnetic Theory:**
The toroidal field is a fundamental structure in electromagnetism:

1. **Self-Sustaining Flow**: Energy flows in through one pole, circulates around the surface, and flows out the opposite pole - creating a self-contained, stable field
2. **Zero External Field**: At large distances, a perfect toroid produces no external magnetic field (all field lines are contained), making it energetically efficient
3. **Plasma Confinement**: Used in tokamak fusion reactors to contain superheated plasma using magnetic fields

**Biological Manifestations:**

- **Human Heart**: Electromagnetic field produced by heart is toroidal, extending 6-8 feet from body
- **DNA**: Double helix creates micro-toroidal fields at molecular level
- **Cells**: Mitochondria and cell membranes exhibit toroidal energy flows
- **Brain**: Neural networks form toroidal activation patterns during specific consciousness states

**Cosmological Scale:**

- **Earth's Magnetosphere**: Toroidal field protecting planet from solar radiation
- **Van Allen Belts**: Radiation belts in toroidal configuration around Earth
- **Galaxies**: Supermassive black holes generate toroidal accretion disks
- **Universe**: Some cosmologists theorize universe itself has toroidal topology

**Consciousness Research:**

Studies in heart coherence (HeartMath Institute) show that toroidal heart field patterns correlate with:
- Increased emotional regulation
- Enhanced intuition
- Greater social coherence
- Reduced stress markers

**Why Use Toroidal Pattern:**
- **Grounding & Centering**: Creates sense of containment and stability
- **Energy Conservation**: Efficient, self-sustaining - doesn't deplete you
- **Deep States**: Optimal for meditation, delta/theta entrainment
- **Healing Frequencies**: Traditional healing modalities often work with toroidal field concepts
- **Coherence Building**: Helps synchronize heart-brain coherence

**Spatial Audio Implementation:**
In EBL, the toroidal pattern modulates audio in 3D space following the toroidal flow:
- Sound appears to circle around your head
- Intensity peaks as "energy" passes through poles (above and below)
- Creates immersive, enveloping sensation
- Bass frequencies emphasize field containment
- Treble frequencies trace surface flow lines

**Resonance Characteristics:**
Toroidal resonators have specific eigenfrequencies based on their geometry. In audio, this creates natural harmonic reinforcement at multiples of the fundamental frequency, enhancing entrainment effectiveness.`,
    placement: 'bottom',
    order: 2
  },

  {
    id: 'vortex-pattern',
    targetElement: '#pattern-vortex',
    category: 'patterns',
    title: 'Vortex Pattern',
    content: 'A spiraling energy vortex that pulls consciousness inward or expands it outward. Based on vortex mathematics and sacred geometry.',
    scienceContent: `**Vortex Mathematics & Fluid Dynamics**

**The Golden Ratio Spiral:**
Vortex patterns often follow the golden ratio (φ = 1.618...):

Polar equation: r = a⋅e^(bθ)

Where:
- r = distance from origin
- θ = angle (radians)
- a = initial radius
- b = growth factor (ln(φ)/π ≈ 0.306 for golden spiral)

**Fibonacci Sequence Connection:**
Each term is the sum of the previous two: 1, 1, 2, 3, 5, 8, 13, 21, 34...
As sequence approaches infinity, ratio between consecutive terms approaches φ.

**Fluid Dynamics:**
Vortices are fundamental to fluid behavior:

1. **Vorticity (ω)**: Measure of local spinning motion
   - ω = ∇ × v (curl of velocity field)

2. **Conservation**: In ideal fluids, circulation is conserved (Kelvin's theorem)

3. **Energy Cascade**: Vortices transfer energy from large to small scales (turbulence)

**Natural Vortex Phenomena:**

- **Tornadoes & Hurricanes**: Atmospheric vortices transferring energy
- **Ocean Whirlpools**: Marine vortices (Maelstrom, Saltstraumen)
- **Galaxy Spirals**: Gravitational vortices containing billions of stars
- **DNA Helix**: Molecular vortex structure
- **Shell Spirals**: Nautilus, snail shells grow in logarithmic spirals
- **Pinecones & Sunflowers**: Seeds arrange in counter-rotating Fibonacci spirals
- **Water Draining**: Coriolis effect creates vortices (though not as strong as commonly believed for sinks)

**Vortex Mathematics (Rodin/Powell):**
Controversial but intriguing mathematical system proposing that numbers 1-9 form vortex-based patterns revealing hidden relationships:
- Doubling sequence: 1→2→4→8→7→5→1 (skips 3, 6, 9)
- 3-6-9 form separate vortex
- Proposed applications in energy generation (unproven)

**Consciousness & Vortex Energy:**

Ancient traditions describe chakras as vortices:
- Spinning energy wheels along spine
- Each rotating at specific frequency
- When aligned, create coherent energy flow

Modern research (Dr. Valerie Hunt, UCLA) measured electromagnetic frequencies at chakra locations:
- Root: 0-100 Hz
- Sacral: 100-200 Hz
- Solar Plexus: 200-300 Hz
- Heart: 300-400 Hz
- Throat: 400-500 Hz
- Third Eye: 500-700 Hz
- Crown: 700-1000 Hz

**Why Use Vortex Pattern:**
- **High Energy States**: Gamma frequencies (40+ Hz) pair well with vortex
- **Focus & Concentration**: Vortex creates sense of being pulled into center point
- **Kundalini Activation**: Yogic traditions describe kundalini as upward spiral
- **Creativity**: Spiral thinking, non-linear problem solving
- **Transcendent States**: Vortex can create sense of being drawn beyond normal awareness

**Spatial Audio Implementation:**
Audio spirals around listener in accelerating or decelerating pattern:
- **Inward Spiral**: Sound gets closer and higher in pitch (Doppler effect simulation)
- **Outward Spiral**: Sound recedes and lowers in pitch
- **Rotation Speed**: Tied to beat frequency (10 Hz beat = 10 rotations per second)
- **Pitch Modulation**: Optional Doppler shift enhancement
- **Intensity Gradient**: Sound louder at vortex "eye" or edges (configurable)

**Physics of Vortex Resonance:**
Helmholtz resonator theory applies to vortex structures - they have natural resonant frequencies based on:
- Vortex diameter
- Rotation speed
- Medium properties (air density, temperature)

When driving frequency matches resonant frequency, vortex intensifies (constructive resonance).`,
    placement: 'bottom',
    order: 3
  },

  {
    id: 'spiral-pattern',
    targetElement: '#pattern-spiral',
    category: 'patterns',
    title: 'Spiral Pattern',
    content: 'A mathematical spiral representing growth, expansion, and evolution. Traces Fibonacci sequence and logarithmic spirals found throughout nature.',
    scienceContent: `**The Mathematics of Spirals**

**Types of Spirals:**

1. **Archimedean Spiral (Arithmetic):**
   - r = a + bθ
   - Constant spacing between turns
   - Found in: Watch springs, paper rolls
   - Growth: Linear

2. **Logarithmic Spiral (Geometric):**
   - r = a⋅e^(bθ)
   - Spacing increases exponentially
   - Found in: Nautilus shells, galaxies, hurricanes
   - Growth: Exponential
   - Self-similar: Looks the same at any scale

3. **Fermat's Spiral (Parabolic):**
   - r² = a²θ
   - Found in: Sunflower seed heads
   - Efficient packing in circular domains

4. **Hyperbolic Spiral:**
   - r = a/θ
   - Approaches origin asymptotically
   - Found in: Certain orbital mechanics

**The Golden Spiral (Most Important):**
Special case of logarithmic spiral where growth factor equals golden ratio φ = 1.618...

**Why φ is Special:**
- φ² = φ + 1 (only number with this property)
- 1/φ = φ - 1 (reciprocal relation)
- Limit of Fibonacci ratios: lim(F_{n+1}/F_n) = φ

**Fibonacci Sequence in Nature:**

| Object | Fibonacci Pattern |
|--------|------------------|
| Sunflower Seeds | 21 and 34 spirals (consecutive Fibonacci numbers) |
| Pinecone Scales | 8 and 13 spirals |
| Pineapple Sections | 5, 8, 13 spirals |
| Nautilus Chambers | Growth by φ each rotation |
| Galaxy Arms | Logarithmic spiral structure |
| Hurricane Pattern | Logarithmic spiral from Coriolis |
| DNA Helix | 21 Å width, 34 Å period (Fibonacci!) |

**Why Nature Loves Spirals:**

1. **Efficient Packing**: Fibonacci spirals maximize seed packing in circular area (sunflowers)
2. **Structural Strength**: Spiral arrangement distributes stress evenly
3. **Growth Optimization**: Allows continuous growth without geometry changes
4. **Energy Minimization**: Logarithmic spirals are paths of least resistance in many systems

**Physics of Spiral Motion:**

**Angular Momentum Conservation:**
As object spirals inward, it must spin faster (like figure skater pulling in arms):
- L = mrv (angular momentum)
- r decreases → v increases (if L conserved)

**Spiral Galaxies:**
- Density wave theory: Arms are not material objects but waves of compression
- Stars don't spiral inward; density wave rotates around galaxy
- Pattern speed ≠ orbital speed of stars

**Mathematics of Expansion:**

The logarithmic spiral has unique property: the angle between radius vector and tangent is constant. This is why it's called "equiangular spiral."

tan(α) = 1/b

Where α is the constant angle and b is growth rate parameter.

**Consciousness & Spiral Patterns:**

**EEG Spiral Patterns:**
Research shows certain meditative states produce spiral-like patterns in brain activity:
- Standing wave patterns in cortex
- Phase synchronization spirals
- Traveling waves during sleep spindles

**Hypnotic Spirals:**
Rotating spirals can induce trance states through:
- Optokinetic reflex (involuntary eye tracking)
- Vestibular stimulation (balance/orientation)
- Cognitive overload (brain focuses on pattern, relaxes other activity)

**Why Use Spiral Pattern:**
- **Meditation**: Gradual deepening, expansion of awareness
- **Hypnosis**: Inward spiral aids trance induction
- **Creativity**: Spiral thinking, exploring ideas in expanding circles
- **Learning**: Progressive complexity, building on foundation
- **Healing**: Spiral movement in therapeutic dance/movement

**Spatial Audio Implementation:**
- Sound spirals outward from center
- Pitch can rise slightly (Shepard tone effect possible)
- Each revolution can increase in distance/volume
- Timing follows Fibonacci ratios for natural feel
- Can reverse (inward spiral) for different effect

**Harmonic Series & Spirals:**
Musical harmonics follow similar patterns to spirals - each harmonic is integer multiple of fundamental:
- f, 2f, 3f, 4f, 5f, 6f...
- Plotted on logarithmic scale, appears as evenly-spaced points (like spiral turns)
- This connection may explain why spiral patterns feel "musical" or harmonious`,
    placement: 'bottom',
    order: 4
  },

  {
    id: 'helix-pattern',
    targetElement: '#pattern-helix',
    category: 'patterns',
    title: 'Helix Pattern (Double Helix)',
    content: 'The iconic DNA double helix structure. Represents information encoding, life, and complex structured thinking.',
    scienceContent: `**The Geometry of the Helix**

**Mathematical Definition:**
A helix is a 3D curve that rises while rotating around an axis.

Parametric equations:
- x(t) = r⋅cos(t)
- y(t) = r⋅sin(t)
- z(t) = c⋅t

Where:
- r = radius
- c = vertical rise per radian (pitch)
- t = parameter (0 to 2π for one complete turn)

**Double Helix:**
Two helices intertwined with constant offset:
- Helix 1: (r⋅cos(t), r⋅sin(t), c⋅t)
- Helix 2: (r⋅cos(t+π), r⋅sin(t+π), c⋅t)

180° offset creates the classic double helix structure.

**DNA: The Blueprint of Life**

**Physical Structure:**
- **Diameter**: 2 nanometers (nm)
- **Rise per base pair**: 0.34 nm
- **Base pairs per turn**: 10.4-10.5
- **Helix pitch**: 3.4-3.6 nm per turn
- **Total length**: ~2 meters in every human cell (packaged incredibly tightly)

**Chemical Bonds:**
- **Hydrogen bonds**: Hold base pairs together (A-T: 2 bonds, G-C: 3 bonds)
- **Phosphodiester bonds**: Connect sugar-phosphate backbone
- **Stability**: Double helix is remarkably stable yet can "unzip" for replication

**Information Encoding:**
- 4 bases: Adenine (A), Thymine (T), Guanine (G), Cytosine (C)
- ~3 billion base pairs in human genome
- Information density: ~1.5-2 petabytes per gram of DNA
- Most efficient information storage known

**Vibrational Frequencies:**
Research by Carlo Ventura and others suggests DNA responds to specific frequencies:
- **528 Hz**: Claimed to repair DNA (scientific debate ongoing)
- **Electromagnetic Sensitivity**: DNA acts as fractal antenna (shown by Martin Blank, Columbia)
- **Acoustic Resonance**: DNA bases have specific vibrational modes in THz range

**Helix Patterns in Nature:**

| Structure | Type | Function |
|-----------|------|----------|
| DNA/RNA | Double/Single Helix | Genetic information |
| Proteins (α-helix) | Single helix | Structural stability |
| Collagen | Triple helix | Connective tissue strength |
| Vines/Tendrils | Climbing helices | Structural support |
| Horns/Tusks | Growth spirals | Defense/display |
| Snail Shells | Helical spiral | Mobile shelter |
| Cochlea (Ear) | Fluid-filled helix | Sound frequency detection |

**The Golden Helix Theory:**

Some researchers propose DNA follows golden ratio proportions:
- Minor groove width to major groove width ≈ φ
- Base pair ratios in certain sequences approximate Fibonacci
- Controversial but intriguing connection to sacred geometry

**Electromagnetic Properties of DNA:**

**Fractal Antenna Theory:**
DNA's helical structure makes it an efficient antenna for EM radiation:
- Responds to frequencies matching its physical resonances
- Can absorb and re-emit EM energy
- Possibly influenced by external electromagnetic fields (including audio-frequency EM from nerves)

**Soliton Waves:**
Some theories (Fröhlich condensation) propose:
- DNA conducts coherent energy waves (solitons)
- These waves might carry information beyond genetic code
- Quantum effects possibly relevant at molecular scale

**Consciousness & Helix Patterns:**

**Structured Thinking:**
The helix represents:
- Linear progression with periodic cycling (like learning/memory)
- Two intertwined but complementary aspects (like left/right brain)
- Information storage and retrieval

**Brainwave Patterns:**
During complex cognitive tasks:
- EEG shows traveling wave patterns (helical propagation through cortex)
- Phase relationships between brain regions can form helical patterns in phase space
- Working memory may use helical temporal coding

**Why Use Helix Pattern:**
- **Study/Learning**: Structured information processing
- **Healing Intention**: DNA/cellular regeneration focus
- **Integration**: Combining opposing or complementary ideas
- **Beta States**: Helix suits active, complex thinking (13-30 Hz)
- **Genetic Activation**: Theoretical resonance with DNA structure

**Spatial Audio Implementation:**
- Dual sound sources spiral upward in counter-rotation
- Left ear and right ear follow separate helices (creates true binaural spiral)
- Vertical rise simulates "ascension" or "elevation" of consciousness
- Pitch can modulate with height (rising tone)
- Crossing points (where helices intersect perceptually) create beat reinforcement
- Can be reversed (downward helix) for grounding

**Harmonic Relationships:**
The helix pattern naturally creates harmonic reinforcement:
- As audio sources rotate, they periodically align (constructive interference)
- Then separate (partial destructive interference)
- Creates periodic modulation at rotation frequency
- If rotation frequency matches beat frequency, powerful synchronization occurs

**Advanced: Quadruple Helix**
Some research suggests DNA can form quadruplex structures (G-quadruplex):
- Four DNA strands instead of two
- Found in telomeres and gene promoter regions
- Possibly involved in gene regulation
- Could inspire even more complex audio patterns`,
    placement: 'bottom',
    order: 5
  },

  {
    id: '8d-audio-pattern',
    targetElement: '#pattern-8d-audio',
    category: 'patterns',
    title: '8D Audio (Spatial Audio)',
    content: 'Three-dimensional audio positioning that creates the illusion of sound moving around and through your head in 8 directional axes.',
    scienceContent: `**The Science of 3D Audio Perception**

**Human Spatial Hearing:**

We localize sound using three primary cues:

1. **Interaural Time Difference (ITD):**
   - Sound reaches one ear before the other
   - Maximum difference: ~700 microseconds (μs)
   - Most effective for low frequencies (<1500 Hz)
   - Processed by medial superior olive (MSO) in brainstem

2. **Interaural Level Difference (ILD):**
   - Sound is louder in one ear due to head shadowing
   - Most effective for high frequencies (>1500 Hz)
   - Processed by lateral superior olive (LSO)
   - Frequency-dependent (head acts as low-pass filter)

3. **Head-Related Transfer Function (HRTF):**
   - Frequency-dependent filtering by outer ear (pinna)
   - Creates spectral cues for vertical localization and front/back discrimination
   - Unique to each individual (ear shape varies)
   - Enables us to distinguish "above" from "below" and "front" from "back"

**The "8D" Terminology:**

"8D Audio" is actually a marketing term for advanced spatial audio. True dimensions:
- 3 spatial dimensions (X, Y, Z)
- 1 time dimension
= 4D spacetime

"8D" likely refers to 8 principal directions:
- Front, Back, Left, Right (horizontal plane - 4 axes)
- Front-Left, Front-Right, Back-Left, Back-Right (diagonals - 4 axes)
= 8 directional axes

**How 8D Audio Works:**

1. **Panning**: Adjusting volume balance between left/right ears
2. **HRTF Filtering**: Applying frequency-dependent filters that mimic natural ear response
3. **Reverb/Reflection**: Adding early reflections and room acoustics
4. **Doppler Effect**: Changing pitch slightly as "source" moves toward/away
5. **Distance Cues**: Volume attenuation and high-frequency rolloff for distant sounds

**Mathematical Implementation:**

**Basic Panning (Constant Power):**
- Left Gain: cos(θ/2)
- Right Gain: sin(θ/2)

Where θ ranges from 0° (left) to 90° (right)

**Vector-Based Amplitude Panning (VBAP):**
For 3D positioning using multiple "virtual speakers":
- Calculate gain vectors for source position
- Apply to stereo or multi-channel output
- Creates coherent spatial image

**HRTF Convolution:**
- Measure or model HRTF for each direction
- Convolve audio with appropriate HRTF filter
- Results in frequency response matching that direction
- Very computationally expensive (uses FFT)

**EBL's Simplified Approach:**
Uses algorithmic approximation:
- Stereo panning for left/right
- Gentle EQ for front/back distinction
- Volume/reverb for up/down and distance
- Computationally efficient, perceptually convincing

**The Cone of Confusion:**

Spatial hearing has ambiguity:
- Sounds on a cone around head-ear axis are hard to distinguish
- Front vs. back confusion common (both have similar ITD/ILD)
- Head movement helps resolve ambiguity (motion parallax)
- This is why we naturally turn our heads toward sounds

**Spatial Audio Formats:**

1. **Binaural**: Two-channel (stereo) with HRTF processing - requires headphones
2. **Ambisonics**: Spherical harmonics encoding - can be decoded for any speaker setup
3. **Object-Based**: Individual audio objects with 3D position metadata (Dolby Atmos)
4. **Channel-Based**: Fixed speaker positions (5.1, 7.1 surround)

EBL uses binaural approach for headphone listening.

**Psychoacoustic Effects:**

**Precedence Effect (Haas Effect):**
- First sound arrival dominates localization
- Reflections within 30-50ms are fused with direct sound
- Used to create sense of room size

**Cocktail Party Effect:**
- Ability to focus on one sound source in complex environment
- Spatial separation improves speech intelligibility by 6-10 dB
- 8D audio can enhance focus by placing "target" in distinct location

**Why Use 8D Audio Pattern:**

**Enhanced Entrainment:**
- Movement prevents habituation (brain doesn't "tune out")
- Engages spatial processing networks in cortex
- Creates more immersive experience
- Can guide attention through space

**Therapeutic Applications:**
- **EMDR Therapy**: Uses bilateral stimulation (sound moving left-right)
- **Vestibular Stimulation**: Spatial audio can stimulate balance systems
- **Attention Training**: Following moving sound improves focus
- **Dissociation/Trance**: Moving audio can facilitate altered states

**Brain Regions Activated:**
- **Superior Temporal Gyrus**: Sound localization
- **Inferior Colliculus**: Integrates ITD/ILD cues
- **Cerebellum**: Predicts sound movement
- **Parietal Cortex**: Spatial attention and mapping

**EBL Implementation Details:**

**8 Motion Patterns:**
1. **Circular Horizontal**: Clockwise/counterclockwise around head
2. **Figure-8 Horizontal**: Infinity symbol pattern
3. **Vertical Circle**: Over-head to under-head (front-to-back arc)
4. **Spiral Ascent**: Rising corkscrew pattern
5. **Toroidal Flow**: Following toroid surface
6. **Random Walk**: Unpredictable spatial path (prevents adaptation)
7. **Pendulum**: Swinging left-right with varying intensity
8. **Custom Path**: User-defined 3D trajectory

**Synchronization Options:**
- **Beat Frequency Sync**: Rotation speed matches beat frequency (10 Hz beat = 10 rotations/sec)
- **Independent**: Spatial movement at fixed rate regardless of beat
- **Harmonic Ratio**: Movement at integer ratio to beat (2:1, 3:1, etc.)

**Advanced: Doppler Effect Simulation:**

When enabled, adds pitch shift based on apparent velocity:

Observed Frequency = Source Frequency × (c / (c ± v))

Where:
- c = speed of sound (343 m/s)
- v = velocity of source
- + when moving away, - when approaching

Creates even more realistic spatial movement, though can be distracting for pure entrainment.

**Limitations & Considerations:**

1. **Individual HRTF Variation**: Generic HRTF may not match your ears perfectly
2. **Headphone Frequency Response**: Must be relatively flat for accurate spatial cues
3. **Processing Load**: Complex 3D audio requires more CPU than simple stereo
4. **Vestibular Sensitivity**: Some users may feel dizzy with aggressive spatial movement
5. **Entrainment vs. Distraction**: Too much movement may distract from entrainment - balance needed

**Research Findings:**

Studies on spatial audio and brainwave entrainment:
- Spatial movement increases engagement and reduces habituation (Västfjäll, 2003)
- Bilateral auditory stimulation can facilitate eye movement desensitization (EMDR efficacy)
- 3D audio activates more brain regions than stereo, potentially enhancing neuroplasticity
- Spatial patterns can guide attention and meditation focus (Bood et al., 2014)`,
    placement: 'bottom',
    order: 6
  }
];
