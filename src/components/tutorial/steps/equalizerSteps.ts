/**
 * Equalizer Tutorial Steps
 * EBL (Electromagnetic Beat Lab)
 *
 * Scientific explanations for 10-band EQ and spatial audio effects
 */

import { TooltipStep } from '../types';

export const equalizerSteps: TooltipStep[] = [
  {
    id: 'equalizer-overview',
    targetElement: '#equalizer-panel',
    category: 'equalizer',
    title: '10-Band Graphic Equalizer',
    content: 'Shape your sound by boosting or cutting specific frequency ranges. Each band targets different sonic characteristics.',
    scienceContent: `**Equalization: The Science of Frequency Shaping**

**What is an Equalizer?**

An equalizer (EQ) is a bank of frequency-selective filters that allow independent adjustment of different frequency ranges. The term comes from its original use: to "equalize" frequency response across telephone lines.

**Filter Types:**

1. **Peaking Filter** (Most EQ bands):
   - Boost or cut a specific frequency range
   - Center frequency (f₀)
   - Gain (±15 dB typical)
   - Q factor (bandwidth control)

**Transfer Function:**
H(f) = (1 + (G-1)/(1 + Q²((f/f₀) - (f₀/f))²))

Where:
- H(f) = filter response at frequency f
- G = linear gain (10^(dB/20))
- Q = quality factor (higher Q = narrower band)
- f₀ = center frequency

2. **High-Pass Filter** (HPF):
   - Passes high frequencies, attenuates low
   - Used for rumble removal, bass cleanup

3. **Low-Pass Filter** (LPF):
   - Passes low frequencies, attenuates high
   - Used for harshness removal, smoothing

4. **Shelf Filters**:
   - High shelf: Boost/cut all frequencies above point
   - Low shelf: Boost/cut all frequencies below point
   - Gentler than HPF/LPF

**Q Factor (Bandwidth):**

Q = f₀ / Δf

Where Δf is bandwidth at -3dB points.

**Common Q values:**
- **Q = 0.7**: Broad, musical (affects ~2 octaves)
- **Q = 1.4**: Moderate (affects ~1 octave) - EBL default
- **Q = 5.0**: Narrow (affects ~1/3 octave)
- **Q = 20**: Very narrow, surgical (for removing specific noise)

**Higher Q:**
- More precise frequency targeting
- Can sound "unnatural" or "synthetic"
- Risk of ringing artifacts

**Lower Q:**
- More musical, natural sound
- Broader effect
- Less precise

**Why 10 Bands?**

Historical reasons and perceptual coverage:
- Covers 5 Hz to 20 kHz (nearly full human hearing range)
- Roughly one band per octave
- Balance between control and simplicity
- More bands = more control but more complex

**ISO Standard Frequencies:**
Professional audio often uses ISO octave/third-octave standard frequencies. EBL uses decade-spaced frequencies for broad coverage.

**Digital EQ Implementation:**

EBL uses **Biquad Filters** (Web Audio API BiquadFilterNode):

**Biquad = "Bi-Quadratic" IIR Filter:**

y[n] = (b₀x[n] + b₁x[n-1] + b₂x[n-2] - a₁y[n-1] - a₂y[n-2]) / a₀

Where:
- x[n] = input sample at time n
- y[n] = output sample
- b₀, b₁, b₂ = feedforward coefficients
- a₀, a₁, a₂ = feedback coefficients

**Advantages:**
- Computationally efficient (only 5 multiplies, 4 adds per sample)
- Very stable
- Can implement any 2nd-order filter type
- Built into Web Audio API (GPU-accelerated on some platforms)

**Phase Response:**

EQ filters not only change amplitude but also phase:
- **Minimum Phase**: Most digital EQs (including biquad)
  - Smallest possible group delay
  - Can introduce pre-ringing (rare audible issue)

- **Linear Phase**: FIR filters
  - Constant group delay (all frequencies delayed equally)
  - No phase distortion
  - Much higher CPU cost
  - Can introduce pre-ringing (more common than minimum phase)

EBL uses minimum phase (standard biquad) for efficiency.

**Signal Flow:**

Audio → Band 1 (32 Hz) → Band 2 (64 Hz) → ... → Band 10 (16 kHz) → Output

Filters process in series. Order matters slightly (different orders can accumulate rounding errors differently), but EBL uses standard low-to-high ordering.

**Headroom & Gain Staging:**

**Problem: Clipping**
If you boost multiple bands by +10 dB each, output can exceed 0 dBFS (digital maximum) → clipping.

**Solution: Output Gain Compensation**
EBL automatically reduces output gain to prevent clipping:

Output Gain = -0.5 × (Sum of positive EQ gains)

Example:
- Boost 64 Hz by +6 dB
- Boost 8 kHz by +4 dB
- Output reduction: -5 dB (prevents clipping)

**Alternative: Limiting**
Could use a limiter to prevent clipping, but this introduces distortion (compression). Gain reduction is cleaner.

**Perceptual Effects of EQ Bands:**

Understanding what each frequency range does to sound helps you use EQ effectively - and understand how it might affect binaural beat perception.`,
    placement: 'left',
    order: 1
  },

  {
    id: 'eq-band-32hz',
    targetElement: '#eq-band-32',
    category: 'equalizer',
    title: '32 Hz - Sub-Bass',
    content: 'The deepest bass frequencies - felt more than heard. Adds weight and power to low-frequency binaural beats.',
    scienceContent: `**Sub-Bass: The Foundation of Sound**

**Frequency Range:** 20-60 Hz

**Physical Characteristics:**

**Wavelength:**
λ = c / f

At 32 Hz in air (c ≈ 343 m/s):
λ = 343 / 32 = 10.7 meters (35 feet!)

This is why bass "goes through walls" - wavelength is larger than most room dimensions, so it diffracts around obstacles easily.

**Human Perception:**
- **Below 20 Hz**: Infrasound (generally inaudible, but can be felt)
- **20-60 Hz**: Sub-bass (heard AND felt - vibrotactile)
- **60-250 Hz**: Bass (clearly audible pitch)

**Threshold of Hearing:**
Sub-bass requires higher SPL (sound pressure level) to be audible:
- At 1 kHz: 0 dB SPL threshold
- At 32 Hz: ~60 dB SPL threshold (1 million times more pressure!)

**Physiology:**

**Hair Cells in Cochlea:**
- High-frequency: Base of cochlea (near oval window)
- Low-frequency: Apex of cochlea (far end of spiral)
- 32 Hz: Very near apex - fewer hair cells dedicated to sub-bass
- This is why bass resolution is lower than midrange

**Body Perception:**
Sub-bass activates:
- **Somatosensory system**: Vibration sensors in skin, muscles
- **Vestibular system**: Inner ear balance organs (can detect very low frequencies)
- **Proprioception**: Joint/muscle position sensors

You literally FEEL bass with your whole body, not just ears.

**Musical Context:**

**Instruments with 32 Hz content:**
- Kick drum fundamental: 50-100 Hz (32 Hz = sub-harmonic rumble)
- Bass guitar low E: 41 Hz (32 Hz = body resonance)
- Pipe organ lowest pedal notes: 16-32 Hz
- Synthesizer sub-bass: Often tuned to exactly 32 Hz for maximum impact

**Binaural Beat Context:**

**For carrier frequencies near 32 Hz:**
- Extremely low carriers (20-40 Hz) create very deep, visceral beats
- Can be difficult to localize spatially
- Strong body resonance - users may feel pulsing in chest, abdomen
- Associated with delta brainwave states (deep sleep, unconscious)

**Boosting 32 Hz:**
- **+3-6 dB**: Adds subtle warmth and depth
- **+10 dB**: Strong, powerful bass presence
- **+15 dB**: Overwhelming, may dominate other frequencies

**Cutting 32 Hz:**
- **-3-6 dB**: Cleans up muddy bass
- **-10 dB**: Reduces rumble, increases clarity
- **-15 dB**: Thin sound, may lose impact

**Room Acoustics:**

**Modal Resonances:**
Small rooms have resonant modes (standing waves) at:
f_n = (nc) / (2L)

Where:
- n = mode number (1, 2, 3...)
- c = speed of sound
- L = room dimension

Example room (10 meters long):
- 1st mode: 17.15 Hz
- 2nd mode: 34.3 Hz (close to 32 Hz!)

**Result:** 32 Hz may be exaggerated or nullified depending on listening position in room. This is why headphones are crucial for EBL - bypasses room acoustics entirely.

**Headphone Response:**

Most headphones struggle with deep bass:
- **Cheap earbuds**: Barely reproduce 32 Hz (maybe -20 dB down)
- **Consumer over-ear**: -6 to -12 dB at 32 Hz (acceptable)
- **Studio monitors**: -3 to -6 dB (good)
- **Planar/high-end**: Flat to 20 Hz (excellent)

Check your headphone frequency response specs - if they don't extend to 32 Hz, boosting this band won't help.

**Psychoacoustic Effects:**

**Infrasound (Below 20 Hz):**
Some studies suggest exposure to infrasound can cause:
- Anxiety, unease
- Vibration of eyeballs (visual distortions)
- Nausea in sensitive individuals

**32 Hz is above this range**, but very high levels could approach these effects in susceptible individuals.

**Low-Frequency Enhancement (Psychoacoustic Illusion):**
Boosting sub-bass can make entire mix seem "bigger" and more powerful, even though most energy is in higher frequencies. Brain interprets strong bass as "large sound source."

**Binaural Beat Entrainment:**

**Delta Waves (0.5-4 Hz):**
To create 2 Hz delta beat:
- Left: 32 Hz
- Right: 34 Hz
- Beat: 2 Hz (delta)

Boosting 32 Hz EQ band reinforces both carriers, making beat more prominent and potentially more effective.

**Technical Considerations:**

**Speaker Damage:**
Excessive sub-bass can damage speakers (especially small ones):
- Excursion limits: Woofer can only move so far before hitting stops
- Thermal limits: Voice coil can overheat
- **Recommendation**: Don't boost 32 Hz more than +6 dB on unknown playback systems

**Headphone Safety:**
Very high sub-bass levels can damage hearing:
- While less audible, still transferring energy to cochlea
- Prolonged high-level exposure can cause fatigue or damage
- Use moderation, especially if you feel discomfort

**Digital Headroom:**
Boosting low frequencies consumes headroom rapidly:
- Sub-bass often has high amplitude (even if quiet perceptually)
- Can cause clipping if not careful
- EBL's auto-gain compensation helps, but watch your levels

**When to Boost 32 Hz:**
- Deep meditation (delta/theta states)
- When using high-quality headphones with good bass extension
- If sound feels too thin or lacks body
- For visceral, body-centered experiences

**When to Cut 32 Hz:**
- Rumble or muddiness issues
- Using low-quality headphones (won't reproduce it anyway)
- In loud environments (sub-bass can be masked by ambient noise)
- If experiencing headphone distortion`,
    placement: 'right',
    order: 2
  },

  {
    id: 'eq-band-64hz',
    targetElement: '#eq-band-64',
    category: 'equalizer',
    title: '64 Hz - Low Bass',
    content: 'Core bass frequencies that provide warmth and depth. Many low carrier frequencies fall in this range.',
    scienceContent: `**Low Bass: The Warmth Frequencies**

**Frequency Range:** 60-100 Hz

**Musical Context:**

This is where many bass fundamentals live:
- **Bass guitar**: E1 (41 Hz) to E2 (82 Hz) - 64 Hz is in the middle
- **Kick drum**: Fundamental often 60-80 Hz
- **Male vocals**: Chest resonance around 80-120 Hz
- **Piano**: A1 (55 Hz), low notes of left hand

**Wavelength:**
At 64 Hz: λ = 343/64 = 5.36 meters (17.6 feet)

Still long enough to diffract around obstacles, but short enough for some directional perception.

**Perceptual Threshold:**
At 64 Hz, hearing threshold is about 35-40 dB SPL (still elevated compared to midrange, but much better than 32 Hz).

**Warmth vs. Muddiness:**

**The Balancing Act:**
- **Too little**: Thin, cold, lacking body
- **Just right**: Warm, full, present
- **Too much**: Muddy, boomy, unclear

64 Hz is in the "mud zone" - where sound can become unfocused if overdone.

**Binaural Beat Applications:**

**Common Carrier Frequencies:**
EBL defaults to carrier frequencies ≤199 Hz, many in the 60-140 Hz range:
- 64 Hz: Solid low carrier
- 70 Hz: Low theta target
- 80 Hz: Low alpha baseline

**Theta Beats (4-8 Hz):**
Example: 64 Hz carrier with 6 Hz beat:
- Left: 64 Hz
- Right: 70 Hz
- Beat: 6 Hz (theta - meditation, creativity)

Boosting 64 Hz band strengthens both carriers equally.

**Room Modes:**

**Standing Waves:**
In typical rooms, 64 Hz creates strong standing waves:

Example: 10m room
- 2nd mode: 34.3 Hz
- 3rd mode: 51.5 Hz
- 4th mode: 68.6 Hz ← Close to 64 Hz!

**Effect:** Depending on where you sit:
- Antinode (peak): 64 Hz amplified by +6 to +12 dB
- Node (null): 64 Hz attenuated by -20 dB or more

**Solution:** Use headphones (bypasses room entirely).

**Harmonic Content:**

If using square or sawtooth waveform at low frequency:

**Example: 64 Hz Square Wave**
- Fundamental: 64 Hz
- 3rd harmonic: 192 Hz (3 × 64)
- 5th harmonic: 320 Hz
- 7th harmonic: 448 Hz
- etc.

Boosting 64 Hz also boosts fundamental of these harmonics, creating richer tone.

**Physiology of Low Bass:**

**Cochlear Response:**
64 Hz activates hair cells in apical region of cochlea:
- Still relatively few cells compared to midrange
- Frequency discrimination: ~3-5 Hz (decent for this range)
- Loudness perception: Roughly linear (not compressed like midrange)

**Body Resonance:**
Human body has resonant frequencies:
- **Thorax (chest)**: 60-80 Hz - can feel pulsing in chest
- **Abdomen**: 40-60 Hz
- **Head**: 20-30 Hz
- **Eyeballs**: ~18 Hz

64 Hz near chest resonance - may enhance "heart-centered" feeling during meditation.

**Equalization Guidelines:**

**Boost 64 Hz When:**
- Sound is too thin or lacks warmth
- Using carrier frequencies in 60-100 Hz range
- Want stronger body sensation
- Theta/low alpha meditation (carrier in this range)
- **Amount**: +3 to +6 dB (musical), +6 to +12 dB (strong)

**Cut 64 Hz When:**
- Sound is muddy, boomy, or unclear
- Room has strong resonance at this frequency (listen for boominess)
- Overlapping with background noise (traffic, HVAC often has 60-120 Hz content)
- **Amount**: -3 to -6 dB (cleanup), -6 to -12 dB (aggressive thinning)

**Spectral Balance:**

**Relationship with Other Bands:**
- If boosting 64 Hz, may need to cut 125-250 Hz to avoid muddiness
- If cutting 64 Hz, may need to boost 32 Hz (sub-bass) or 125 Hz (low-mid) to maintain body
- Balance with 1-2 kHz (presence) - strong bass needs strong mids for clarity

**Fletcher-Munson (Equal Loudness Curves):**

At low listening levels, bass is perceived as quieter:
- At 80 dB SPL: 64 Hz and 1 kHz sound equally loud at same SPL
- At 40 dB SPL: 64 Hz needs +15 dB to sound as loud as 1 kHz

**Implication:** At quiet listening levels (nighttime meditation), boosting 64 Hz by +3-6 dB compensates for perceptual bass loss.

**Phase Issues:**

**Boosting bass can shift phase:**
- Biquad filters introduce phase shift (especially high Q, high gain)
- At 64 Hz, phase shift is relatively minor (maybe 30-60°)
- Only problematic if mixing with other bass sources (not common in EBL)

**Minimum phase:** Phase shift is proportional to frequency - lower frequencies less affected.

**Compression & Limiting:**

If sound is limited/compressed after EQ:
- Boosting 64 Hz increases RMS level
- Limiter may reduce overall level to compensate
- Net effect: Bass louder, everything else quieter
- EBL uses pre-emptive gain reduction instead

**Historical Note:**

**Bass Boost on Consumer Equipment:**
Cheap stereos often have "Bass Boost" button:
- Usually boosts 60-100 Hz by +6 to +12 dB
- Compensates for small speakers that can't reproduce bass
- Can sound boomy and distorted on good speakers

EBL's 64 Hz band gives you precise control instead of one-size-fits-all boost.`,
    placement: 'right',
    order: 3
  },

  {
    id: 'eq-band-125hz',
    targetElement: '#eq-band-125',
    category: 'equalizer',
    title: '125 Hz - Upper Bass',
    content: 'Upper bass range where many carrier frequencies reside. Adds fullness without muddiness when balanced correctly.',
    scienceContent: `**Upper Bass: The Carrier Frequency Sweet Spot**

**Frequency Range:** 100-200 Hz

**EBL Significance:**

This is THE most important EQ band for EBL binaural beats:
- **Carrier frequency range**: EBL defaults to 20-199 Hz
- **Most common carriers**: 100-150 Hz (alpha/low beta states)
- **Direct impact**: Boosting/cutting 125 Hz directly affects carrier loudness

**Example Carriers in This Band:**
- 100 Hz: Low alpha relaxation
- 110 Hz: Pure alpha (10 Hz beat to 120 Hz)
- 125 Hz: Common test frequency
- 140 Hz: EBL default carrier
- 150 Hz: Beta threshold

**Musical Context:**

**Instruments:**
- Male vocals: Fundamental frequencies often 100-150 Hz
- Snare drum: Body resonance around 120-140 Hz
- Guitar low E string: 82 Hz (125 Hz = 3rd partial)
- Bass guitar: Upper range fundamentals

**Fullness vs. Boxiness:**
- **Too little**: Thin, lacking body
- **Just right**: Full, warm, present
- **Too much**: Boxy, honky, nasal (especially 200-400 Hz overlap)

**Wavelength:**
At 125 Hz: λ = 343/125 = 2.74 meters (9 feet)

Getting short enough for some directional perception, though still mostly omnidirectional.

**Perceptual Threshold:**
At 125 Hz: ~15-20 dB SPL threshold (much better than sub-bass, approaching midrange sensitivity).

**Cochlear Processing:**

**Hair Cell Density:**
125 Hz processed by:
- Location: Middle-apical region of cochlea
- Density: Moderate (more cells than sub-bass, fewer than midrange)
- Frequency discrimination: ~2-3 Hz (good resolution)

**Critical Bands:**
At 125 Hz, critical bandwidth (perceptual frequency resolution) is about 30-40 Hz:
- Frequencies within critical band are perceived as "fused"
- Frequencies outside critical band are perceived as separate
- For binaural beats: 125 Hz and 135 Hz (10 Hz apart) are easily distinguished

**Binaural Beat Optimization:**

**Alpha Entrainment (8-13 Hz):**
Example: 125 Hz carrier, 10 Hz beat:
- Left: 125 Hz
- Right: 135 Hz
- Beat: 10 Hz (alpha - relaxed alertness)

**Effect of 125 Hz EQ:**
- **+6 dB**: Both carriers boosted equally → louder beat, more prominent entrainment
- **-6 dB**: Both carriers reduced → subtler beat, less prominent

**Adjacent Bands:**
If using 140 Hz carrier (EBL default):
- 125 Hz band affects lower edge of carrier
- Next band up (250 Hz) may not affect carrier at all (depending on Q)
- For 140 Hz carrier, 125 Hz band is critical

**Room Acoustics:**

**Modal Density:**
At 125 Hz, rooms have many overlapping modes:
- More complex response than low bass
- Still problematic, but less severe nulls/peaks
- Headphones still recommended for consistent response

**Isolation:**
125 Hz is at transition:
- Still passes through walls fairly easily
- But not as completely as sub-bass
- Better for privacy than 32-64 Hz

**Harmonic Implications:**

**Harmonics of Sub-Bass:**
If using 62.5 Hz fundamental (rare):
- 2nd harmonic: 125 Hz ← This band
- Boosting 125 Hz emphasizes this harmonic → brighter tone

**Subharmonics of Midrange:**
If using 250 Hz:
- 1/2 subharmonic: 125 Hz
- Some nonlinear systems can create subharmonics (especially overdriven speakers)

**Psychoacoustic Effects:**

**Warmth vs. Boxiness:**
- **100-150 Hz**: Warmth (pleasant, full)
- **150-250 Hz**: Boxiness (unpleasant if excessive, sounds like resonating box)
- **125 Hz is borderline**: Can add warmth OR boxiness depending on context

**Masking:**
125 Hz can mask neighboring frequencies:
- Strong 125 Hz signal can make 100 Hz or 150 Hz harder to hear
- Upward masking stronger than downward (easier to mask 150 Hz than 100 Hz)
- For binaural beats with carriers near 125 Hz, keep this band relatively flat unless intentionally adjusting prominence

**EQ Techniques:**

**Boost 125 Hz When:**
- Carriers in 100-150 Hz range need more presence
- Sound is too thin or bright
- Want warmer, fuller tone
- Alpha/low beta entrainment sessions
- **Amount**: +3-6 dB (moderate), +6-9 dB (strong)

**Cut 125 Hz When:**
- Sound is boxy or congested
- Carriers above 150 Hz (this band not needed)
- Overlapping with environmental noise (hum, traffic)
- Want cleaner, more defined sound
- **Amount**: -3-6 dB (cleanup), -6-12 dB (aggressive)

**Combo Moves:**

**Scoop (Cut 125 Hz, Boost 64 Hz and 250 Hz):**
- Creates "smiley face" EQ curve
- Popular in consumer audio (sounds impressive initially)
- Can lack focus and definition
- Not usually recommended for entrainment (altered spectral balance)

**Reverse Scoop (Boost 125 Hz, Cut 64 Hz and 250 Hz):**
- Emphasizes carrier range, reduces harmonics/sub-harmonics
- More focused, direct entrainment
- Can sound unnatural or "nasal"
- Use subtly (+3 dB boost, -3 dB cuts)

**Technical Considerations:**

**Filter Q at 125 Hz:**
EBL uses moderate Q (~1.4):
- Bandwidth: ~90 Hz (roughly 60-150 Hz affected)
- Enough to target carrier range
- Not so narrow as to sound unnatural

**Phase Response:**
At 125 Hz with ±6 dB boost/cut:
- Phase shift: ~45-90° (moderate)
- Audibility: Generally inaudible (ears relatively insensitive to phase at low frequencies)
- Binaural beat impact: Minimal (beat frequency determined by carrier frequency difference, not phase)

**Distortion:**
Boosting 125 Hz can reveal distortion:
- Headphone distortion (especially cheap drivers)
- Audio interface clipping
- DAC nonlinearity
- If you hear distortion after boosting, reduce boost or check signal chain

**Measurement & Analysis:**

**Spectrum Analyzer:**
Watch 125 Hz peak in FFT:
- Should see clear peak if carriers in this range
- Boosting 125 Hz band should raise peak by approximately EQ gain amount
- If peak doesn't move, filter may not be working or carrier is outside band

**A-Weighting:**
Standard audio measurement weighting (simulates human ear sensitivity):
- At 125 Hz: ~-16 dB weighting
- Meaning: 125 Hz sounds 16 dB quieter than 1 kHz at same SPL
- **Implication**: May need significant 125 Hz boost to achieve perceptual balance with higher frequencies

**Historical Context:**

**Telephone Bandwidth:**
Traditional phones transmitted 300-3400 Hz:
- 125 Hz completely missing!
- Male voices sounded thin (missing fundamental)
- Brain "filled in" missing fundamentals (phantom fundamental illusion)

EBL includes 125 Hz for full, rich entrainment experience.

**Vinyl Records:**
Low-frequency content (especially stereo bass) could cause groove spacing issues:
- Sometimes engineers cut bass below 150 Hz
- 125 Hz could be attenuated to prevent skipping
- Modern digital audio (EBL) has no such limitations - full bass response`,
    placement: 'right',
    order: 4
  },

  // Continue with remaining EQ bands...
  {
    id: 'spatial-effects',
    targetElement: '#spatial-effects-panel',
    category: 'equalizer',
    title: 'Spatial Effects (Reverb & Width)',
    content: 'Add space and dimension to your sound with reverberation and stereo width enhancement.',
    scienceContent: `**Spatial Audio Processing: Creating the Illusion of Space**

**Reverberation: The Sound of Space**

**What is Reverb?**
When sound is produced in a space, it reflects off walls, ceiling, floor, and objects, creating thousands of echoes that blend together:

**Reverb Components:**

1. **Direct Sound**: Original sound arriving at listener (0-20ms)
2. **Early Reflections**: First few echoes (20-80ms)
   - Provide cues about room size and geometry
   - Brain uses these to perceive space
3. **Late Reverb (Diffuse Field)**: Dense cloud of reflections (80ms-several seconds)
   - Smooth, continuous decay
   - Gives sense of space and ambience

**Physical Acoustics:**

**Reverberation Time (RT60):**
Time for sound to decay by 60 dB after source stops.

RT60 = (0.161 × V) / (A × α)

Where:
- V = room volume (m³)
- A = total surface area (m²)
- α = average absorption coefficient (0-1)

**Example Room Sizes:**
- Small room: RT60 = 0.3-0.5 seconds
- Living room: RT60 = 0.5-0.8 seconds
- Concert hall: RT60 = 1.5-2.5 seconds
- Cathedral: RT60 = 4-10 seconds

**Sabine's Formula** (above) assumes diffuse field - works for most rooms.

**Digital Reverb Algorithms:**

**1. Algorithmic Reverb:**
Uses networks of delays and filters to simulate reflections.

**Schroeder Reverb (Classic):**
- Parallel comb filters (simulate room modes)
- Series allpass filters (increase echo density)
- Computationally efficient
- Can sound metallic if parameters not tuned well

**Feedback Delay Network (FDN):**
- Multiple delay lines with feedback matrix
- More natural than Schroeder
- Used in many modern reverbs

**2. Convolution Reverb:**
Uses recorded impulse response (IR) of real space:
- Convolves input audio with IR
- Extremely realistic
- CPU-intensive (requires FFT)
- EBL likely uses algorithmic (lighter weight)

**3. Freeverb (EBL Likely Uses This):**
Open-source algorithm (Jezar at Dreampoint):
- 8 parallel comb filters
- 4 series allpass filters
- Simple but effective
- Very efficient

**Reverb Parameters:**

**Room Size:**
- Adjusts delay times in comb filters
- Larger room = longer delays = more spacious
- Too large can create "swimmy" effect

**Decay Time:**
- How long reverb takes to fade
- Controlled by feedback in comb filters
- Short decay: Tight, focused
- Long decay: Spacious, ethereal

**Damping:**
- High-frequency absorption (air and surfaces absorb highs more than lows)
- Low damping: Bright, reflective (tiles, glass)
- High damping: Dark, absorptive (carpet, curtains)
- Physically accurate damping follows frequency-dependent curve

**Dry/Wet Mix:**
- 0% wet: No reverb (dry sound only)
- 50% wet: Equal mix
- 100% wet: Only reverb (no direct sound)
- For EBL: 10-30% wet typical for subtle space

**Pre-Delay:**
Time between direct sound and first reflections:
- Short (0-10ms): Small room, close to walls
- Medium (10-30ms): Medium room
- Long (30-100ms): Large room, distant walls
- Creates separation between dry and wet signals

**Why Reverb for Binaural Beats?**

**Enhanced Spatiality:**
- Reverb creates sense of 3D space even in headphones
- Early reflections provide spatial cues
- Can enhance immersive feeling

**Smoothing & Blending:**
- Reverb "glues" left and right channels together
- Can make binaural beat feel more cohesive
- May reduce harshness of pure tones

**Masking Artifacts:**
- Can disguise subtle digital artifacts
- Smooths out waveform discontinuities

**Potential Downsides:**
- Can reduce clarity and precision of beat frequency
- May interfere with entrainment if excessive
- Use moderately (10-20% wet max recommended)

**Stereo Width: Making Sound "Wider"**

**Natural Stereo Width:**
In natural listening:
- Sounds can come from anywhere in 180° arc (front hemisphere)
- Headphone stereo: Limited to left ear, right ear, and phantom center
- Can feel narrow or "inside head"

**Width Enhancement Techniques:**

**1. Mid-Side Processing:**

Convert stereo (L/R) to mid-side (M/S):
- Mid (M) = (L + R) / 2 (mono sum)
- Side (S) = (L - R) / 2 (stereo difference)

Widen by boosting S:
- M = M (unchanged)
- S = S × Width (width factor >1)

Convert back to L/R:
- L = M + S
- R = M - S

**Width factor:**
- 1.0: Normal stereo
- 1.5: 50% wider
- 2.0: 100% wider (very wide)
- 0.0: Mono (no width)

**2. Haas Effect (Precedence Effect):**
Delay one channel by 5-30ms:
- Delays create sense of space
- Brain still localizes to first arrival
- Can make sound feel wider

**Risk:** If delay >30ms, can sound like distinct echo (not widening).

**3. Stereo Delay:**
Different delay times for L/R:
- Creates decorrelated signals
- Increases perceived width
- Can introduce slight "phase-y" quality

**4. Chorus/Ensemble:**
Slight pitch modulation + delay:
- Creates multiple "voices"
- Wider, richer sound
- Can detune binaural beat slightly (not ideal for EBL)

**EBL Width Implementation:**

Likely uses Mid-Side processing:
- Clean
- No pitch artifacts
- Adjustable width parameter (0-200%)
- Mono-compatible (collapses cleanly)

**Why Width for Binaural Beats?**

**Enhanced Spatial Separation:**
- Increases perceived distance between left/right channels
- Can make binaural beat more prominent (greater separation)
- Creates more immersive soundfield

**Externalization:**
- Wider stereo can move sound "outside head"
- Feels less claustrophobic
- More natural listening experience

**Cautions:**
- Excessive width can cause phase issues (some frequencies cancel when summed to mono)
- Can reduce low-frequency impact (bass is mostly mono in natural recordings)
- May create unnatural "disconnected" feeling if overused

**Recommended Settings:**

**Subtle Enhancement:**
- Reverb: 10-15% wet, small room, short decay (0.5-1.0s)
- Width: 110-130% (slight widening)
- Use: General binaural beat sessions, clean sound

**Immersive Experience:**
- Reverb: 20-30% wet, medium room, medium decay (1.5-2.5s)
- Width: 140-160% (significant widening)
- Use: Deep meditation, space-out sessions, ambient experiences

**Precision Entrainment:**
- Reverb: 0-5% wet (minimal)
- Width: 100-110% (minimal)
- Use: Clinical applications, specific frequency targeting, maximum clarity

**Advanced: Spatial Audio Beyond Stereo**

**Binaural Reverb:**
Reverb that preserves spatial cues:
- Uses HRTF-filtered early reflections
- Creates more realistic 3D space
- Significantly more CPU-intensive

**Ambisonics:**
Spherical harmonic encoding of soundfield:
- Can represent 360° sound (including above/below)
- Requires decoding for headphones (binaural renderer)
- Future possibility for EBL

**Cross-Talk Cancellation:**
Signal processing to simulate speakers from headphones:
- Adds opposite-side signal with phase inversion
- Cancels acoustic cross-talk (left speaker reaching right ear)
- Creates more speaker-like externalized experience
- Sensitive to head position

**Neuroscience of Spatial Hearing:**

**Brain Regions:**
- **Superior Olivary Complex**: ITD and ILD processing (brainstem)
- **Inferior Colliculus**: Integration of spatial cues (midbrain)
- **Auditory Cortex**: Higher-level spatial analysis
- **Parietal Cortex**: Audio-spatial mapping, localization

**Precedence Effect:**
First-arriving sound dominates localization:
- Direct sound determines perceived direction
- Reflections within 30-50ms are fused with direct sound
- Brain suppresses reverb from localization (prevents confusion)

**Reverberation & Consciousness:**

Large reverberant spaces (cathedrals, caves) associated with:
- Transcendent experiences
- Altered states of consciousness
- Enhanced emotional response to music/chant

Possible mechanisms:
- Prolonged sound creates sustained neural activation
- Spatial cues engage multiple brain regions
- Low-frequency buildup in large spaces (infrasound effects?)

Adding reverb to binaural beats may tap into these associations, enhancing meditative/transcendent experience.`,
    placement: 'bottom',
    order: 10
  },

  {
    id: 'modulation-effects',
    targetElement: '#modulation-panel',
    category: 'equalizer',
    title: 'Modulation (LFO, Tremolo, Vibrato)',
    content: 'Dynamic effects that add movement and variation to your sound over time.',
    scienceContent: `**Modulation: Adding Motion to Sound**

**What is Modulation?**

Modulation means changing a parameter over time according to a control signal (usually an LFO - Low Frequency Oscillator).

**Parameters that can be modulated:**
- **Amplitude** → Tremolo
- **Pitch** → Vibrato
- **Filter Cutoff** → Auto-wah
- **Pan** → Auto-pan
- **Phase** → Phaser
- **Ring Modulation** → Metallic timbres

**Low-Frequency Oscillator (LFO):**

An oscillator (like audio oscillators) but at sub-audio rates:
- Audio frequencies: 20 Hz - 20 kHz
- LFO frequencies: 0.1 Hz - 20 Hz (mostly 0.5-10 Hz)

**LFO Waveforms:**

1. **Sine**: Smooth, natural modulation
   - Use: Musical vibrato, gentle tremolo

2. **Square**: Abrupt switching between two states
   - Use: Rhythmic gating, choppy effects

3. **Triangle**: Linear rise and fall
   - Use: Similar to sine but with constant rate of change

4. **Sawtooth**: Ramp up or down, then reset
   - Use: Sweep effects, sequencer-like modulation

5. **Random** (Sample & Hold): Random values at each step
   - Use: Experimental, unpredictable variations

**Tremolo: Amplitude Modulation**

**Definition:**
Periodic variation of volume.

**Implementation:**
output = input × [1 + depth × LFO(t)]

Where:
- depth: Modulation depth (0-1)
- LFO(t): LFO waveform output (-1 to +1)

**Depth Parameter:**
- 0%: No tremolo (constant volume)
- 50%: Moderate tremolo
- 100%: Volume fully modulates from 0 to maximum

**Rate Parameter:**
Tremolo speed (LFO frequency):
- Slow: 0.5-2 Hz (gentle pulsing)
- Medium: 2-6 Hz (obvious tremolo)
- Fast: 6-15 Hz (rhythmic, can become perceivable pitch)

**Above ~15 Hz:**
Tremolo so fast it creates audible tone at modulation rate (ring modulation territory).

**Musical Context:**
- Guitar amps: Classic tremolo effect
- Electric piano (Rhodes): Built-in tremolo
- Vocals: Natural vibrato is actually amplitude + pitch modulation

**For Binaural Beats:**

**Enhancement:**
- Slow tremolo (0.5-2 Hz) adds gentle pulsing
- Can enhance binaural beat perception by adding amplitude variation
- May synchronize with beat frequency or use independent rate

**Synchronization:**
If tremolo rate = beat frequency:
- 10 Hz beat + 10 Hz tremolo → Reinforced pulsing
- Creates coherent, rhythmic experience
- May enhance entrainment (multimodal stimulation)

**Risks:**
- Too fast tremolo can be distracting
- May interfere with clean frequency perception
- Use subtly (depth 10-30%)

**Vibrato: Pitch Modulation**

**Definition:**
Periodic variation of pitch.

**Implementation:**
frequency(t) = f₀ × [1 + depth × LFO(t)]

Where:
- f₀: Base frequency (carrier)
- depth: Vibrato depth (typically 0-0.05 for 5% pitch variation)

**Depth in Cents:**
Musical pitch measured in cents (100 cents = 1 semitone):
- Narrow vibrato: ±5-10 cents
- Moderate vibrato: ±10-20 cents
- Wide vibrato: ±20-50 cents

**Rate:**
- Slow: 2-4 Hz (classical vibrato)
- Medium: 4-6 Hz (popular music vibrato)
- Fast: 6-8 Hz (nervous, exaggerated)

**Musical Context:**
- Singers: Natural vibrato 4-7 Hz, ±10-30 cents
- String instruments: Vibrato adds warmth, expression
- Synthesizers: Vibrato makes static tones more "alive"

**For Binaural Beats:**

**Caution Required:**
- Vibrato changes carrier frequency
- If carriers drift, beat frequency changes
- Example: 140 Hz with ±1 Hz vibrato becomes 139-141 Hz
- Paired with 150 Hz carrier → Beat becomes 9-11 Hz (not stable 10 Hz)

**Recommendation:**
- Use very narrow vibrato (±0.5 Hz max) if at all
- Or apply same vibrato to both channels (preserves beat frequency)
- Or avoid vibrato for precision entrainment

**Possible Use:**
- Artistic effect for ambient sessions
- Creating evolving, organic soundscapes
- Not recommended for clinical/precision applications

**Ring Modulation:**

**Definition:**
Multiplying two audio signals together.

output = carrier × modulator

**Mathematical Result:**
Creates sum and difference frequencies:
- If carrier = 140 Hz and modulator = 150 Hz
- Output = (140 + 150) Hz = 290 Hz AND (150 - 140) Hz = 10 Hz
- Note: 10 Hz is the beat frequency!

**Ring Modulation for Binaural Beats:**

This is theoretically what binaural beats are (but in auditory cortex, not in signal):
- Left ear: 140 Hz
- Right ear: 150 Hz
- Brain perceives: 10 Hz "beat" (difference frequency)

If you apply ring modulation externally:
- Physically creates 10 Hz and 290 Hz
- 10 Hz likely inaudible (below 20 Hz threshold if deeper frequencies)
- 290 Hz audible as a tone
- Result: Different than binaural beat (which doesn't create real 10 Hz in signal)

**Sonic Character:**
- Metallic, clangorous
- Inharmonic (sum/difference frequencies not harmonically related to originals)
- Used in sound design for bells, gongs, sci-fi effects

**Not Recommended for EBL:**
- Defeats purpose of binaural beats (creates real tones instead of perceptual beat)
- Harsh, unmusical sound
- May interfere with entrainment

**Phaser:**

**How It Works:**
- Splits signal into two paths
- One path goes through allpass filters (shift phase)
- Paths mixed back together
- Phase cancellation creates notches in frequency spectrum
- LFO modulates allpass filter frequencies → notches sweep

**Effect:**
- Whooshing, sweeping sound
- Jet plane taking off
- Psychedelic, swirly

**For Binaural Beats:**
- Can add movement and interest
- May obscure carrier frequencies if aggressive
- Use subtly for ambient effect

**Flanger:**

Similar to phaser but uses delay instead of allpass filters:
- Delay modulated by LFO
- Creates comb filtering (series of notches)
- More dramatic than phaser

**Chorus:**

Multiple slightly detuned copies of signal:
- Simulates ensemble of instruments
- Thickens, widens sound
- Can make binaural beat sound richer but may reduce clarity

**Auto-Pan:**

**How It Works:**
LFO modulates stereo pan position:
- Sound moves left-right-left-right

**For Binaural Beats:**
- Conflicts with binaural effect (needs separate L/R channels)
- Could be applied to reverb/ambience only (leave carriers static)
- Creates sense of movement

**Synchronized Modulation:**

**Beat-Locked LFO:**
LFO frequency = beat frequency:
- 10 Hz beat → 10 Hz tremolo
- Creates unified pulsing
- Reinforces rhythmic aspect of beat

**Harmonic Ratios:**
LFO at harmonic of beat:
- 10 Hz beat, 5 Hz tremolo (1:2 ratio)
- 10 Hz beat, 20 Hz tremolo (2:1 ratio)
- Creates polyrhythmic complexity

**Research Implications:**

**Multimodal Entrainment:**
Combining audio beat with amplitude modulation:
- May enhance entrainment (multiple cues to same rhythm)
- Light-sound machines use this principle
- Limited research on efficacy vs. binaural beat alone

**Neuroscience:**

**Rhythm Perception:**
- Modulation rates 1-10 Hz engage motor cortex (even without movement)
- Brain naturally entrains to rhythms in this range
- May explain why binaural beats work (rhythmic modulation cue)

**Cross-Modal Integration:**
- Rhythmic visual + auditory more effective than either alone
- EBL's visual patterns + modulated audio may create synergy

**Recommendations for EBL:**

**Subtle Enhancement (Recommended):**
- Tremolo: 0.5-2 Hz rate, 10-20% depth, sine wave
- Vibrato: Avoid or use <1 Hz with ±0.5 Hz depth
- Phaser: Light settings, slow rate
- Sync: Match tremolo to beat frequency for coherence

**Experimental:**
- Faster tremolo (matching beat frequency)
- Rhythmic gating (square wave LFO)
- Complex polyrhythms (multiple LFOs)

**Avoid:**
- Ring modulation (contradicts binaural principle)
- Heavy vibrato (destabilizes carrier frequencies)
- Aggressive flanging/phasing (obscures carriers)`,
    placement: 'bottom',
    order: 11
  }
];
