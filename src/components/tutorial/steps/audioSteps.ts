/**
 * Audio Controls Tutorial Steps
 * EBL (Electromagnetic Beat Lab)
 *
 * Comprehensive scientific explanations for audio control features
 *
 * IMPORTANT: targetElement IDs must match actual DOM elements!
 * Current IDs in BinauralGeneratorMUI.tsx:
 * - #base-frequency-slider
 * - #beat-frequency-slider
 * - #waveform-selector
 * Current IDs in MainControlsMUI.tsx:
 * - #play-button
 * - #volume-control
 */

import { TooltipStep } from '../types';

export const audioSteps: TooltipStep[] = [
  {
    id: 'base-frequency',
    targetElement: '#base-frequency-slider',
    category: 'audio',
    title: 'Base (Carrier) Frequency',
    content: 'The foundational tone that carries the binaural beat. Set between 20-199 Hz for optimal brainwave entrainment.',
    scienceContent: `**The Physics of Sound Waves**

Sound travels as longitudinal compression waves through air at approximately 343 m/s (at 20°C). The carrier frequency determines the pitch you hear and is measured in Hertz (Hz) - cycles per second.

**Frequency Range Science:**
- **20-80 Hz (Sub-bass to Bass)**: Associated with deep relaxation, delta/theta brainwave states. These low frequencies create powerful resonance in the body and are felt as much as heard.
- **80-150 Hz (Lower Midrange)**: Alpha brainwave range. Promotes calm alertness, meditation, and light relaxation states.
- **150-199 Hz (Midrange)**: Beta brainwave territory. Supports focused attention, cognitive processing, and active awareness.

**Why These Frequencies Matter:**
The carrier should be in a range where your auditory system can clearly distinguish the beat frequency difference between left and right channels. Lower carriers (under 100 Hz) tend to produce more visceral, body-centered experiences, while higher carriers (100-199 Hz) create more cerebral, mind-centered effects.

**The Frequency Following Response (FFR):**
Your brain's electrical activity naturally synchronizes with rhythmic external stimuli through a phenomenon called entrainment. When exposed to a consistent frequency, cortical neurons begin firing at that same rate, shifting your brainwave state to match the stimulus.`,
    placement: 'right',
    order: 1
  },

  {
    id: 'beat-frequency',
    targetElement: '#beat-frequency-slider',
    category: 'audio',
    title: 'Beat Frequency (Binaural Beat)',
    content: 'The difference between left and right ear frequencies creates the binaural beat effect. This difference determines which brainwave state you\'re targeting.',
    scienceContent: `**The Binaural Beat Phenomenon**

Discovered by Heinrich Wilhelm Dove in 1839, binaural beats are auditory processing artifacts created when two slightly different frequencies are presented separately to each ear.

**How It Works:**
When your left ear receives 140 Hz and your right ear receives 150 Hz, your brain perceives a third "phantom" tone pulsing at 10 Hz (the difference). This 10 Hz beat doesn't exist in the external environment - it's created by your superior olivary complex in the brainstem as it processes the phase difference between the two signals.

**Brainwave State Targeting:**
- **Delta (0.5-4 Hz)**: Deep sleep, healing, unconscious processes
- **Theta (4-8 Hz)**: Deep meditation, REM sleep, creativity, subconscious access
- **Alpha (8-13 Hz)**: Relaxed alertness, light meditation, learning readiness
- **Beta (13-30 Hz)**: Active thinking, focus, problem-solving, normal waking consciousness
- **Gamma (30-100 Hz)**: High-level information processing, peak focus, transcendent states

**Research Foundation:**
Studies using EEG have demonstrated that binaural beats can induce changes in brainwave activity. A 2008 study published in Alternative Therapies in Health and Medicine found that beta-frequency (16 Hz and 24 Hz) binaural beats significantly improved mood and reduced anxiety.

**Optimal Beat Ranges:**
- **Focus/ADHD**: 12-15 Hz (SMR - Sensorimotor Rhythm)
- **Meditation**: 6-10 Hz (Theta-Alpha border)
- **Deep Focus**: 40 Hz (Gamma)
- **Relaxation**: 8-10 Hz (Alpha)`,
    placement: 'right',
    order: 2
  },

  {
    id: 'waveform-sine',
    targetElement: '#waveform-selector',
    category: 'audio',
    title: 'Waveform Types',
    content: 'Different waveform shapes produce different sonic characteristics and harmonic content, affecting how the binaural beat is perceived.',
    scienceContent: `**Waveform Acoustics & Harmonic Theory**

**Sine Wave (Pure Tone):**
- **Physics**: Mathematically described as y = A × sin(2πft), where A is amplitude, f is frequency, t is time
- **Harmonics**: Contains only the fundamental frequency - no overtones or harmonics
- **Perception**: Smooth, clean, mellow sound - like a tuning fork or flute
- **Best For**: Precision binaural beat work, meditation, when you want pure frequency entrainment without harmonic complexity
- **Why Use It**: The absence of harmonics means your brain processes only the target frequencies, making it ideal for specific brainwave targeting

**Square Wave (Digital Pulse):**
- **Physics**: Alternates instantly between +1 and -1 amplitude
- **Harmonics**: Contains all odd harmonics (3rd, 5th, 7th, etc.) with amplitude = 1/n (fundamental)
- **Perception**: Hollow, woody, clarinet-like sound with a sharp, digital character
- **Best For**: Alertness, attention, cutting through mental fog
- **Harmonic Formula**: f, 3f/3, 5f/5, 7f/7... (e.g., 100 Hz square wave contains 100, 300, 500, 700 Hz...)

**Triangle Wave (Smooth Harmonic):**
- **Physics**: Linear rise and fall between peak amplitudes
- **Harmonics**: Contains odd harmonics with amplitude = 1/n² (falls off faster than square wave)
- **Perception**: Softer than square wave, more complex than sine - flute-like quality
- **Best For**: Balanced entrainment with gentle harmonic enrichment

**Sawtooth Wave (Full Harmonic Spectrum):**
- **Physics**: Linear rise, instant drop (or vice versa)
- **Harmonics**: Contains ALL harmonics (both odd and even) with amplitude = 1/n
- **Perception**: Bright, buzzy, rich - similar to string instruments or brass
- **Best For**: Energizing sessions, when you want maximum harmonic stimulation
- **Spectral Richness**: Most complex waveform, creating the fullest sound

**Harmonic Impact on Entrainment:**
Harmonics create additional beating patterns at higher frequencies, potentially inducing multiple brainwave states simultaneously. This can create more complex consciousness effects but may reduce precision of single-state targeting.`,
    placement: 'right',
    order: 3
  },

  {
    id: 'volume-control',
    targetElement: '#volume-control',
    category: 'audio',
    title: 'Volume & Amplitude',
    content: 'Controls the loudness of the audio. For binaural beats to work, volume should be comfortable but clearly audible.',
    scienceContent: `**The Science of Sound Intensity**

**Decibel Scale (dB SPL):**
The decibel scale is logarithmic, not linear. Every +10 dB increase represents a 10x increase in sound pressure and roughly a 2x increase in perceived loudness.

**Reference Levels:**
- **0 dB**: Threshold of human hearing
- **30 dB**: Quiet library, whisper
- **60 dB**: Normal conversation
- **85 dB**: Heavy traffic, prolonged exposure causes hearing damage
- **120 dB**: Pain threshold, immediate damage risk

**Optimal Volume for Entrainment:**
Research suggests binaural beats work best at comfortable listening levels around 60-70 dB - loud enough to perceive clearly without straining, but not so loud as to be uncomfortable or fatiguing.

**Why Volume Matters:**
1. **Too Quiet**: Brain may not register the frequency difference consistently
2. **Too Loud**: Can cause listener fatigue, stress response (defeating the purpose), or hearing damage
3. **Just Right**: Allows sustained listening for 20-60 minutes without discomfort

**Amplitude Modulation & Entrainment:**
The amplitude (volume) of the beat can be modulated over time to enhance entrainment. Gradual volume changes prevent habituation - the brain's tendency to "tune out" constant stimuli.

**Equal-Loudness Contours (Fletcher-Munson Curves):**
Human hearing is most sensitive to frequencies between 2-5 kHz. Lower frequencies (like our 20-199 Hz range) require slightly higher amplitude to be perceived at the same loudness. This is why bass frequencies often need more power.

**Safe Listening Guidelines:**
- Limit sessions to 60 minutes or less at moderate volume
- If you experience discomfort, reduce volume or take a break
- Use the "arm's length rule": if someone at arm's length can't hear your audio, it's at a safe level for sustained listening`,
    placement: 'left',
    order: 4
  },

  {
    id: 'play-stop-controls',
    targetElement: '#play-button',
    category: 'audio',
    title: 'Transport Controls',
    content: 'Start, stop, and pause audio playback. Audio must be playing for binaural beats to affect your brainwave state.',
    scienceContent: `**Audio Engine Architecture**

**Web Audio API Pipeline:**
EBL uses the Web Audio API, a high-performance audio processing system that runs in a separate thread from the main browser UI, ensuring low-latency, glitch-free playback.

**Signal Flow:**
1. **OscillatorNode** (x2): Generates precise sine/square/triangle/sawtooth waveforms for left and right channels
2. **GainNode** (x2): Controls amplitude for each channel independently
3. **BiquadFilterNode**: Optional EQ and filtering
4. **StereoPannerNode**: Positions each frequency in stereo field
5. **AudioDestination**: Final output to headphones/speakers

**Sample Rate & Precision:**
- **48 kHz**: EBL's standard sample rate (48,000 samples per second)
- **Frequency Accuracy**: ±0.001 Hz precision for perfect binaural beat generation
- **Frame Rate**: 60 FPS WebSocket streaming (800 samples per frame)

**Why "Play" is Critical:**
Binaural beats require continuous, uninterrupted playback for entrainment to occur. The Frequency Following Response (FFR) takes 5-7 minutes to establish and can be disrupted by interruptions. For maximum effect:
- Allow at least 10-15 minutes of continuous listening
- Use headphones (required for true binaural effect)
- Minimize environmental interruptions

**Boost Mode (0-200% Volume):**
When enabled, boost mode allows volume levels up to 200% of standard range. This uses a GainNode with values >1.0, which can cause:
- **Clipping**: Waveforms exceeding ±1.0 amplitude get "clipped" (flattened), adding harmonic distortion
- **Harmonic Saturation**: Sometimes desired for a "warmer" or more intense sound
- **Risk**: Potential for speaker damage or hearing fatigue
- **Use Case**: Advanced users who want maximum intensity or to overcome noisy environments

**Buffer Management:**
EBL uses a ring buffer system (16-90 frame capacity) to ensure smooth playback even if network latency varies. This prevents audio dropouts and maintains entrainment consistency.`,
    placement: 'bottom',
    order: 5
  },

  {
    id: 'audio-engine-selector',
    targetElement: '#masterControls',
    category: 'audio',
    title: 'Audio Engine Selection',
    content: 'Choose between Frontend (browser-based) or Backend (server-streamed) audio generation. Backend provides higher quality and more complex processing.',
    scienceContent: `**Frontend vs. Backend Audio Architecture**

**Frontend Audio Engine:**
- **Technology**: Web Audio API, runs entirely in your browser
- **Processing**: OscillatorNodes generate waveforms locally using JavaScript
- **Latency**: 5-15ms (very low)
- **Pros**: Instant start, works offline, no server dependency, ultra-low latency
- **Cons**: Limited to basic waveforms, may strain older devices, no advanced DSP

**Backend Audio Engine:**
- **Technology**: FastAPI + PyAudio + WebSocket streaming
- **Processing**: Python-based DSP (Digital Signal Processing) on server, streams PCM audio at 48kHz
- **Latency**: 50-150ms (slightly higher due to network)
- **Pros**: Advanced algorithms (consciousness detection, quantum oracle integration), server-side processing power, complex modulation
- **Cons**: Requires network connection, slightly higher latency, server dependency

**When to Use Each:**

*Frontend Engine:*
- Quick sessions, basic binaural beats
- Offline use, travel, unstable internet
- Low-latency critical applications (gaming, real-time feedback)
- Mobile devices with limited data

*Backend Engine:*
- Advanced sessions with consciousness detection
- Quantum oracle integration for ARV/CRV
- Complex modulation patterns and algorithmic composition
- Research-grade precision and logging

**Technical Deep Dive - Backend Streaming:**

The backend uses **WebSocket** protocol for real-time bidirectional communication:
1. Client requests session with desired config (base_freq, beat_freq, waveform)
2. Server generates 800-sample chunks (16.67ms of audio at 48kHz)
3. Chunks encoded as 16-bit PCM, base64-encoded, sent via WebSocket
4. Frontend AudioWorklet decodes and buffers chunks in ring buffer
5. AudioWorklet feeds Web Audio API at precise timing

**Ring Buffer System:**
- **Purpose**: Absorbs network jitter and latency variations
- **Capacity**: 16-90 frames (267ms-1500ms of audio)
- **Underrun Protection**: If buffer empties, plays silence briefly rather than glitching
- **Overflow Protection**: If buffer overfills, discards oldest frames

**Bit Depth:**
- **Transmission**: 16-bit PCM (65,536 possible amplitude values)
- **Processing**: 32-bit float (billions of possible values)
- **Why Different**: 16-bit reduces network bandwidth by 50% while maintaining perceptual quality; 32-bit float in Web Audio prevents rounding errors during processing

This dual-precision approach optimizes both network efficiency and audio quality.`,
    placement: 'right',
    order: 6
  },

  {
    id: 'headphone-requirement',
    targetElement: '#binauralBeats',
    category: 'audio',
    title: 'Headphone Requirement',
    content: 'Binaural beats REQUIRE headphones to work. Each ear must receive a different frequency for your brain to create the beat.',
    scienceContent: `**Why Headphones Are Non-Negotiable**

**The Binaural Beat Mechanism:**
Binaural beats rely on dichotic presentation - delivering different auditory stimuli to each ear independently. This is impossible with speakers.

**Speaker Problem: Acoustic Cross-Talk**
When played through speakers:
- Left speaker's 140 Hz reaches BOTH ears
- Right speaker's 150 Hz reaches BOTH ears
- Both ears receive both frequencies mixed in air
- Result: Brain perceives 140 Hz + 150 Hz simultaneously, NOT a 10 Hz beat
- You hear two separate tones (possibly creating interference/beating in the air), but NO cortical entrainment

**Headphone Solution: Isolated Channels**
- Left ear receives ONLY 140 Hz
- Right ear receives ONLY 150 Hz
- Brain's superior olivary complex processes the phase difference
- Creates phantom 10 Hz beat in cortical processing
- Frequency Following Response (FFR) entrains brainwaves to 10 Hz

**Optimal Headphone Types:**

1. **Closed-Back Over-Ear (Best):**
   - Full isolation between channels
   - Excellent bass response (important for low carrier frequencies)
   - Comfortable for extended sessions
   - Examples: Sony MDR-7506, Audio-Technica ATH-M50x

2. **In-Ear Monitors (Good):**
   - Portable, good isolation
   - Varies by fit quality
   - Can be fatiguing over long sessions
   - Ensure proper seal for accurate bass

3. **Open-Back Headphones (Acceptable):**
   - Some cross-talk between channels
   - May reduce binaural beat clarity by 10-20%
   - More comfortable for long sessions
   - Use only if closed-back unavailable

4. **Earbuds (Minimal - Not Recommended):**
   - Poor seal, inconsistent bass response
   - Frequencies may leak between ears
   - Unreliable for precise entrainment

**Frequency Response Matters:**
Headphones should have flat response down to at least 50 Hz (ideally 20 Hz) to accurately reproduce low carrier frequencies. Many cheap earbuds roll off bass significantly, which can distort the binaural beat perception.

**The Superior Olivary Complex (SOC):**
This brainstem structure is responsible for binaural hearing and sound localization. The medial superior olive (MSO) specifically processes interaural time differences (ITD) - the microsecond delays between when sound reaches each ear. It's this ITD processing that creates the binaural beat percept when different frequencies are presented to each ear.

**Clinical Note:**
Individuals with hearing loss in one ear or significantly asymmetric hearing cannot experience binaural beats effectively, as the brain requires input from both ears to create the phantom beat.`,
    placement: 'top',
    order: 7
  }
];
