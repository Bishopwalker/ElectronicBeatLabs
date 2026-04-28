/**
 * Timer System Tutorial Steps
 * EBL (Electromagnetic Beat Lab)
 *
 * Scientific explanations for session timing and frequency transitions
 */

import { TooltipStep } from '../types';

export const timerSteps: TooltipStep[] = [
  {
    id: 'timer-presets',
    targetElement: '#timer-preset-selector',
    category: 'timer',
    title: 'Session Presets',
    content: 'Pre-configured frequency transition sequences designed for specific brainwave states and therapeutic goals.',
    scienceContent: `**Session Design: The Science of Frequency Transitions**

**Why Time-Based Transitions?**

**Brainwave Entrainment Takes Time:**
Research shows it takes 5-7 minutes for brainwave activity to stabilize at a new frequency after binaural beat introduction (Oster, 1973; Wahbeh et al., 2007).

**Phases of Entrainment:**

1. **Initial Exposure** (0-2 minutes):
   - Brain begins to register frequency difference
   - Neural oscillators start to phase-lock
   - Minimal EEG changes

2. **Transition Period** (2-5 minutes):
   - EEG shows increasing power at target frequency
   - Subjective awareness may not yet reflect state
   - Neural networks reorganizing

3. **Stabilization** (5-10 minutes):
   - EEG shows dominant activity at target frequency
   - Subjective experience matches intended state
   - Maximum entrainment effectiveness

4. **Sustained State** (10+ minutes):
   - Maintained entrainment
   - Deepening of state
   - Therapeutic benefits accumulate

**Implication:** Each frequency stage should last at least 7-10 minutes for effective entrainment.

**Session Architecture:**

**Common Structures:**

1. **Single-Stage:**
   - One frequency throughout
   - Example: 20 minutes of 10 Hz (alpha)
   - Use: Simple meditation, maintenance practice

2. **Descending (Relaxation):**
   - Start higher, gradually lower
   - Example: Beta (15 Hz) → Alpha (10 Hz) → Theta (6 Hz)
   - Use: Stress relief, sleep preparation, deep meditation

3. **Ascending (Activation):**
   - Start lower, gradually higher
   - Example: Theta (6 Hz) → Alpha (10 Hz) → Beta (15 Hz)
   - Use: Morning wakeup, energy boost, focus enhancement

4. **Peak (Dive & Return):**
   - Start moderate, go deep, return to moderate
   - Example: Alpha (10 Hz) → Theta (5 Hz) → Alpha (10 Hz)
   - Use: Meditation journey, emotional processing, creativity

5. **U-Shape (Energy Boost):**
   - Start high, go low, return high
   - Example: Beta (16 Hz) → Alpha (10 Hz) → Beta (16 Hz)
   - Use: Power nap, cognitive refresh, afternoon slump

**Frequency Ramping vs. Abrupt Changes:**

**Abrupt Change:**
- Immediate switch: 10 Hz → 6 Hz
- Brain takes 5-7 minutes to re-entrain
- Can feel jarring or disorienting
- Risk of losing entrainment

**Gradual Ramp:**
- Smooth transition: 10 Hz → 9 Hz → 8 Hz → 7 Hz → 6 Hz (each step 1-2 minutes)
- Brain follows more easily
- Feels natural and smooth
- Maintains entrainment throughout

**Optimal Ramp Rate:**
Research suggests 0.5-1 Hz per minute is comfortable:
- 10 Hz to 6 Hz = 4 Hz change
- At 1 Hz/min: 4 minute transition
- At 0.5 Hz/min: 8 minute transition

EBL presets use ramped transitions for smooth state changes.

**Brainwave State Presets:**

**Delta (0.5-4 Hz) - Deep Sleep:**
- **Purpose**: Sleep induction, healing, unconscious access
- **Typical Session**: 30-60 minutes
- **Carrier**: 20-60 Hz recommended (low enough to not disturb)
- **Example**: 2 Hz beat for deep delta
  - Left: 40 Hz, Right: 42 Hz → 2 Hz beat
- **Timing**: Best before bed or during rest periods
- **Effects**: Reduced cortisol, enhanced immune function, tissue repair
- **Research**: Delta activity associated with growth hormone release, deep restorative sleep

**Theta (4-8 Hz) - Deep Meditation:**
- **Purpose**: Meditation, creativity, subconscious exploration, REM sleep
- **Typical Session**: 20-40 minutes
- **Carrier**: 60-120 Hz (warm, grounding range)
- **Example**: 6 Hz beat for theta
  - Left: 100 Hz, Right: 106 Hz → 6 Hz beat
- **Timing**: Meditation sessions, creative work, before sleep
- **Effects**: Enhanced creativity, emotional release, memory consolidation
- **Research**: Theta associated with hypnagogic imagery, insight, integration of subconscious material (Schacter, 1977)

**Alpha (8-13 Hz) - Relaxed Alertness:**
- **Purpose**: Light meditation, stress reduction, learning readiness, flow states
- **Typical Session**: 15-30 minutes
- **Carrier**: 100-150 Hz (clear, present range)
- **Example**: 10 Hz beat for alpha
  - Left: 140 Hz, Right: 150 Hz → 10 Hz beat (EBL default)
- **Timing**: Pre-work focus, study sessions, relaxation breaks
- **Effects**: Reduced anxiety, improved learning, relaxed awareness
- **Research**: Alpha power increases with eyes closed, meditation, relaxation. Associated with default mode network (DMN) activity (Knyazev, 2012)

**Beta (13-30 Hz) - Active Thinking:**
- **Purpose**: Focus, concentration, active problem-solving, alertness
- **Typical Session**: 15-45 minutes
- **Carrier**: 120-180 Hz (bright, active range)
- **Example**: 15 Hz beat for low beta (SMR)
  - Left: 140 Hz, Right: 155 Hz → 15 Hz beat
- **Timing**: Work sessions, study, tasks requiring concentration
- **Effects**: Enhanced focus, cognitive performance, alertness
- **Research**: Beta associated with active cognitive processing. SMR (12-15 Hz) specifically linked to attention and focus in ADHD research (Lubar, 1997)

**Gamma (30-100 Hz) - Peak Performance:**
- **Purpose**: High-level cognition, peak focus, transcendent states, sensory binding
- **Typical Session**: 10-20 minutes (intense)
- **Carrier**: 140-180 Hz (gamma beat is high)
- **Example**: 40 Hz beat for gamma
  - Left: 140 Hz, Right: 180 Hz → 40 Hz beat
- **Timing**: Short bursts for peak performance, spiritual practice
- **Effects**: Enhanced perception, cognitive integration, possible transcendent experiences
- **Research**: 40 Hz gamma associated with consciousness, attention, memory binding. Increased in experienced meditators (Lutz et al., 2004). May have therapeutic benefits for Alzheimer's (40 Hz light/sound stimulation)

**Preset Examples:**

**Deep Relaxation (30 minutes):**
- 0-5 min: 12 Hz (high alpha) - Initial relaxation
- 5-12 min: 10 Hz → 8 Hz ramp (alpha to alpha-theta border)
- 12-22 min: 6 Hz (theta) - Deep meditative state
- 22-28 min: 8 Hz → 10 Hz ramp (return to alpha)
- 28-30 min: 10 Hz (alpha) - Gentle return to awareness

**Focus Enhancement (40 minutes):**
- 0-5 min: 10 Hz (alpha) - Relaxed baseline
- 5-15 min: 10 Hz → 14 Hz ramp (alpha to beta)
- 15-30 min: 14 Hz (SMR/low beta) - Sustained focus
- 30-38 min: 14 Hz → 10 Hz ramp (return to alpha)
- 38-40 min: 10 Hz (alpha) - Smooth exit

**Sleep Induction (45 minutes):**
- 0-5 min: 10 Hz (alpha) - Wind down
- 5-15 min: 10 Hz → 6 Hz ramp (alpha to theta)
- 15-30 min: 6 Hz (theta) - Drowsy state
- 30-42 min: 6 Hz → 2 Hz ramp (theta to delta)
- 42-45 min: 2 Hz (delta) - Deep sleep (usually asleep by now)

**Creativity Boost (25 minutes):**
- 0-5 min: 10 Hz (alpha) - Relaxed readiness
- 5-8 min: 10 Hz → 6 Hz ramp (descend to theta)
- 8-18 min: 6 Hz (theta) - Creative insight state
- 18-23 min: 6 Hz → 10 Hz ramp (return to alpha)
- 23-25 min: 10 Hz (alpha) - Integrate insights

**Neuroscience of Transitions:**

**Resonance vs. Forcing:**
- **Resonance**: Gently encouraging brain toward target state
- **Forcing**: Attempting rapid state change (less effective)

Brain resists rapid changes (homeostasis). Gradual transitions work with natural brain rhythms.

**Ultradian Rhythms:**
Brain naturally cycles through states in ~90-120 minute cycles:
- Similar to sleep cycles (REM/Non-REM)
- Occurs during waking too (BRAC - Basic Rest-Activity Cycle)
- Sessions 20-40 minutes align with natural transition points

**Phase Locking:**
Neural oscillators synchronize to binaural beat:
- Requires sustained exposure (5-10 min minimum)
- Stronger locking with longer exposure
- Can persist briefly after sound stops (aftereffect)

**Safety Considerations:**

**Avoid Very Long Sessions:**
- >60 minutes continuous use: Risk of fatigue, diminishing returns
- Take breaks every 45-60 minutes
- Hydrate, move, rest eyes

**Avoid Extreme State Changes:**
- Don't go Beta → Delta rapidly (jarring)
- Use transitional states (Beta → Alpha → Theta → Delta)

**Individual Variation:**
- Baseline brainwave patterns vary widely
- Response to entrainment varies
- Some people entrain faster/slower
- Adjust session lengths based on personal experience

**Contraindications:**
- Seizure disorders: Avoid without medical clearance (rhythmic stimulation can trigger seizures in susceptible individuals)
- Psychiatric conditions: Consult healthcare provider
- Pacemakers/implanted devices: No known issues but consult doctor to be safe

**Timing Best Practices:**

**Consistency:**
- Regular practice (daily/several times per week) more effective than sporadic use
- Brain learns to entrain faster with practice
- Build habits around sessions (same time of day)

**Environment:**
- Quiet, comfortable space
- Won't be interrupted
- Dim lighting for relaxation sessions
- Bright lighting for focus/alertness sessions (visual cues affect state)

**Intention:**
- Clear goal for session enhances effectiveness
- Mental set matters (expectation and intention)
- Combine with breath work, visualization, or other practices

**Integration:**
- After session, take 2-5 minutes to return to normal awareness
- Don't immediately jump into demanding tasks after deep states
- Journal insights or experiences

**Research Foundation:**

**Key Studies:**

1. **Lane et al. (1998)**: "Binaural Auditory Beats Affect Vigilance Performance and Mood"
   - Beta frequency beats improved attention and mood
   - Supports use for focus enhancement

2. **Wahbeh et al. (2007)**: "Binaural Beat Technology in Humans: A Pilot Study"
   - Theta beats increased theta brainwave activity (EEG confirmation)
   - Reduced anxiety
   - Validates mechanism

3. **Oster (1973)**: "Auditory Beats in the Brain" (Scientific American)
   - Classic paper establishing binaural beat phenomenon
   - Neurophysiological basis

4. **Padmanabhan et al. (2005)**: "A Prospective, Randomized, Controlled Study"
   - Delta frequency beats improved sleep quality in ADHD
   - Clinical application demonstrated

**Limitations:**
- Many studies have small sample sizes
- Placebo/expectation effects not always controlled
- Individual variation high
- Optimal parameters still being researched

**Bottom Line:**
Evidence supports binaural beats can influence brainwave activity and subjective state, but effects vary individually. Well-designed sessions with appropriate timing and transitions maximize effectiveness.`,
    placement: 'right',
    order: 1
  },

  {
    id: 'custom-timer',
    targetElement: '#custom-timer-builder',
    category: 'timer',
    title: 'Custom Timer Builder',
    content: 'Design your own frequency transition sequences tailored to your specific needs and preferences.',
    scienceContent: `**Building Effective Custom Sessions**

**Principles of Session Design:**

**1. Goal Clarity:**
Define what you want to achieve:
- Relaxation and stress relief?
- Enhanced focus and productivity?
- Creative insight and problem-solving?
- Sleep preparation?
- Emotional processing?
- Spiritual/transcendent experience?

Different goals require different frequency targets and session structures.

**2. Duration Planning:**

**Minimum Effective Duration:**
- 10-15 minutes: Minimal entrainment effect
- 20-30 minutes: Good for single-state sessions
- 30-45 minutes: Allows multi-stage journey
- 45-60 minutes: Deep, transformative sessions
- >60 minutes: Diminishing returns, fatigue risk

**Attention Span:**
- Beginners: 15-20 minutes max (attention wanders)
- Intermediate: 30-40 minutes comfortable
- Advanced: 60+ minutes possible

Start shorter and gradually extend as you build practice.

**3. Frequency Selection:**

**Target Brainwave State:**
- Delta (0.5-4 Hz): Deep rest, unconscious
- Theta (4-8 Hz): Deep meditation, subconscious
- Alpha (8-13 Hz): Light meditation, relaxation
- Beta (13-30 Hz): Focus, active thinking
- Gamma (30-100 Hz): Peak states, high cognition

**Carrier Frequency:**
Lower carriers (60-120 Hz) feel:
- Warmer, more grounding
- Body-centered
- Good for relaxation

Higher carriers (120-199 Hz) feel:
- Brighter, more cerebral
- Mind-centered
- Good for focus

**4. Transition Design:**

**Ramp Rate:**
Change frequency gradually:
- Slow ramp: 0.5 Hz per minute (smooth, gentle)
- Medium ramp: 1 Hz per minute (comfortable)
- Fast ramp: 2 Hz per minute (noticeable, can be jarring)

**Plateau Duration:**
Stay at target frequency long enough:
- Minimum: 7-10 minutes (allows entrainment)
- Optimal: 10-20 minutes (deep entrainment)
- Extended: 20-40 minutes (very deep, may be too long for beginners)

**5. Session Arc:**

**Entry:**
- Start at comfortable baseline (usually alpha, 8-12 Hz)
- Don't start at extreme (delta or high gamma)
- Allow 2-5 minutes at entry frequency

**Journey:**
- Descend to deeper states OR ascend to more active states
- Can have multiple plateaus
- Transitions should feel natural

**Exit:**
- Return to comfortable baseline
- Don't end in deep state (delta/theta) unless for sleep
- Allow 2-5 minutes for re-orientation

**Example Custom Sessions:**

**Power Nap (20 minutes):**
- 0-3 min: 10 Hz (alpha) - Wind down
- 3-5 min: 10→8 Hz - Transition
- 5-15 min: 6 Hz (theta) - Light sleep/deep rest
- 15-18 min: 6→10 Hz - Wake up
- 18-20 min: 12 Hz (high alpha) - Alert and refreshed

**Creativity Session (35 minutes):**
- 0-5 min: 10 Hz (alpha) - Relax and open
- 5-8 min: 10→7 Hz - Descend
- 8-20 min: 7 Hz (theta) - Creative insight zone
- 20-23 min: 7→10 Hz - Return
- 23-35 min: 10 Hz (alpha) - Integrate and capture ideas

**Morning Wake-Up (15 minutes):**
- 0-3 min: 8 Hz (low alpha) - Gentle start
- 3-6 min: 8→12 Hz - Wake up
- 6-12 min: 14 Hz (SMR/low beta) - Alert focus
- 12-15 min: 14 Hz sustained - Ready for day

**Pre-Sleep (40 minutes):**
- 0-5 min: 12 Hz (high alpha) - Release day
- 5-10 min: 12→8 Hz - Relax
- 10-20 min: 6 Hz (theta) - Drowsy
- 20-35 min: 6→2 Hz - Deep descent
- 35-40 min: 2 Hz (delta) - Sleep onset

**Anxiety Relief (25 minutes):**
- 0-5 min: 14 Hz (beta) - Meet anxious state where it is
- 5-10 min: 14→10 Hz - Gradual calming
- 10-20 min: 10 Hz (alpha) - Relaxed, calm
- 20-23 min: 10→8 Hz - Deepen
- 23-25 min: 8 Hz (low alpha/high theta border) - Peaceful

**Peak Performance (30 minutes):**
- 0-5 min: 10 Hz (alpha) - Centered baseline
- 5-10 min: 10→14 Hz - Activate
- 10-15 min: 14→20 Hz - High beta
- 15-25 min: 40 Hz (gamma) - Peak state
- 25-28 min: 40→14 Hz - Descend
- 28-30 min: 14 Hz (beta) - Ready for action

**Advanced Techniques:**

**Oscillation:**
Alternate between two states:
- Example: 10 Hz for 10 min, 6 Hz for 10 min, repeat
- Creates cycling experience
- Can access benefits of both states
- May prevent habituation

**Plateau Stacking:**
Multiple short plateaus instead of one long one:
- Example: 12 Hz (5 min) → 10 Hz (5 min) → 8 Hz (5 min) → 6 Hz (5 min)
- Explores range of states
- More dynamic than single-state
- Good for exploration sessions

**Frequency Hopping:**
Rapid state changes (advanced users only):
- Example: 10 Hz (3 min) → 20 Hz (3 min) → 5 Hz (3 min) → 15 Hz (3 min)
- Very stimulating, can be disorienting
- Trains brain flexibility
- Not for relaxation

**Harmonic Series:**
Use beat frequencies that are harmonically related:
- Example: 10 Hz → 5 Hz → 2.5 Hz (each half the previous)
- Or: 5 Hz → 10 Hz → 20 Hz (each double)
- Creates sense of coherence and progression
- May have resonance effects

**Session Personalization:**

**Track Your Response:**
Keep session journal:
- How did you feel during/after?
- Did you achieve your goal?
- What frequency felt best?
- How long until you felt entrainment?

**Adjust Based on Experience:**
- If session too long → Shorten
- If didn't reach state → Increase plateau duration
- If transitions jarring → Slower ramps
- If boring/ineffective → Try different frequencies

**Individual Baselines:**
Your natural brainwave patterns affect response:
- High-beta dominant people may need longer to reach alpha/theta
- Alpha-dominant people entrain quickly to alpha, may overshoot to theta
- Experiment to find what works for you

**Contextual Factors:**

**Time of Day:**
- Morning: Beta/gamma more accessible, delta difficult
- Afternoon: Alpha/theta easier, good for power nap
- Evening: Theta/delta natural, good for relaxation
- Late night: Delta for sleep

**Physical State:**
- Tired: Harder to reach beta/gamma, easy to hit theta/delta
- Alert: Easy beta/gamma, harder deep states
- Match session to current state or use to shift state

**Environment:**
- Quiet: Deeper states accessible
- Noisy: May need higher volume or active states only
- Comfortable: Enhances relaxation sessions
- Upright posture: Better for focus sessions
- Reclined: Better for meditation/sleep sessions

**Safety in Custom Sessions:**

**Avoid Extremes:**
- Don't start or end in delta (unless for sleep)
- Don't jump from delta to high beta (too jarring)
- Don't spend >30 min in single extreme state

**Listen to Body:**
- Discomfort, headache, dizziness → Stop session
- Adjust intensity, duration, or frequency
- Not all frequencies suit everyone

**Respect Contraindications:**
- Seizure disorders: Consult doctor, avoid or use caution
- Mental health conditions: Start conservatively
- Pregnancy: No known issues but consult doctor

**Technical Considerations:**

**Transition Algorithms:**

**Linear Ramp:**
frequency(t) = f_start + (f_end - f_start) × (t / duration)

Simple, constant rate of change.

**Exponential Ramp:**
frequency(t) = f_start × (f_end / f_start)^(t / duration)

More musical (constant ratio change), but can be too fast at ends.

**S-Curve (Sigmoid) Ramp:**
Slow at start/end, fast in middle:
- Feels most natural
- Avoids abrupt changes
- EBL likely uses this

**Preset Metadata:**

When saving custom presets, include:
- Name
- Description
- Intended goal/use case
- Duration
- Difficulty level (beginner/intermediate/advanced)
- Tags (sleep, focus, meditation, etc.)

**Sharing & Community:**

Custom presets could be shared with community:
- User ratings
- Comments on effectiveness
- Variations and remixes
- Research and refinement

**Iteration & Refinement:**

Session design is iterative:
1. Create initial session based on theory
2. Test on yourself
3. Note what works/doesn't
4. Adjust parameters
5. Re-test
6. Refine until optimal

Don't expect perfection on first try. Great sessions evolve through experimentation.`,
    placement: 'right',
    order: 2
  },

  {
    id: 'loop-control',
    targetElement: '#loop-toggle',
    category: 'timer',
    title: 'Session Looping',
    content: 'Repeat sessions indefinitely for extended practice, background ambience, or overnight use.',
    scienceContent: `**Session Looping: Extended Entrainment**

**What is Looping?**

Looping automatically restarts a session when it completes:
- Session plays to end
- Immediately starts again from beginning
- Continues until manually stopped
- Useful for extended sessions (>60 minutes)

**Why Loop Instead of Single Long Session?**

**1. State Cycling:**
Some goals benefit from cycling:
- Relaxation → Deep Rest → Relaxation (repeat)
- Allows periodic "surfacing" to lighter state
- Prevents getting "stuck" too deep
- Maintains engagement over long duration

**2. Practical Limits:**
Very long single sessions (>90 min) challenging:
- Attention wanders
- Physical discomfort (need to move)
- Bathroom breaks needed
- Looping allows natural break points

**3. Sleep Applications:**
Overnight use:
- Session designed for sleep onset (30-60 min)
- Loops to maintain delta frequencies through night
- Can promote deeper, more restorative sleep
- May enhance dream recall or lucid dreaming

**Looping Strategies:**

**Full Loop (Standard):**
- Entire session repeats exactly
- Simple, predictable
- Use: When session arc is self-contained

**Partial Loop:**
- Only loop certain sections (advanced feature)
- Example: Play intro once, loop middle section, play outro once
- Use: Long middle plateau with defined entry/exit

**Seamless Loop:**
- Session ends at same frequency it starts
- No jarring transition at loop point
- Example: 10 Hz → 6 Hz → 10 Hz (start/end both 10 Hz)
- Creates smooth, continuous experience

**Gapped Loop:**
- Brief silence between loops (5-30 seconds)
- Provides moment to re-orient
- Can prevent deep "trance lock"
- Use: When you want option to stop between loops

**Applications of Looping:**

**1. Meditation Marathon:**
- 20-30 min session looped 2-4 times
- Total: 40-120 minutes meditation
- Deeper states than possible in single short session
- Natural break points if need to stop early

**2. Work Focus:**
- 45 min focus session (beta frequencies)
- Loops throughout work session (2-4 hours)
- Take breaks between loops (pomodoro-like)
- Maintains concentration without continuous entrainment

**3. Sleep Through Night:**
- 60 min sleep induction session
- Loops overnight (6-8 hours)
- May promote:
  - Deeper sleep (more delta)
  - Reduced awakenings
  - Enhanced dream vividness (theta phases)
  - Feeling more rested upon waking

**4. Background Ambience:**
- Gentle alpha session (10-12 Hz)
- Loops in background during studying, reading, relaxing
- Maintains calm, focused state
- Not for active entrainment, just pleasant ambience

**5. Overnight Healing/Regeneration:**
- Delta-focused session (1-3 Hz)
- Loops overnight
- Theory: Deep delta enhances:
  - Growth hormone release
  - Immune function
  - Tissue repair
  - Memory consolidation
- Limited research but promising anecdotal reports

**Neuroscience of Extended Entrainment:**

**Entrainment Buildup:**
- Longer exposure → Stronger entrainment
- Up to a point (~30-60 min)
- Beyond that, diminishing returns OR deepening (individual variation)

**Homeostatic Sleep Pressure:**
Extended delta entrainment (looping overnight):
- May reduce sleep pressure (feel less tired)
- OR may enhance sleep efficiency (more restorative per hour)
- Individual and context-dependent

**Neural Plasticity:**
Repeated entrainment sessions (daily practice with looping):
- May enhance brain's ability to access states
- Could lead to:
  - Easier meditation access
  - Better focus control
  - Improved sleep quality
  - Long-term resilience to stress
- Requires consistent practice over weeks/months

**Safety Considerations:**

**Prolonged Exposure:**
- Generally safe for most people
- Stay hydrated
- Take breaks (even if just pausing, not stopping)
- Don't use looping to avoid sleep for dangerous activities (driving, operating machinery)

**Habituation:**
Extended looping (>2 hours continuous) may cause:
- Reduced effectiveness (brain adapts)
- Fatigue or mental fog
- Headache in some individuals

**Recommendation:**
- Limit continuous use to 2-3 hours
- Take 15-30 min breaks between extended sessions
- If using overnight, that's fine (you're asleep, different mechanism)

**Sleep Disruption Potential:**
While delta beats may enhance sleep:
- Some people find ANY audio disturbing to sleep
- Headphones may be uncomfortable overnight
- Partner may be disturbed by sound
- Test on naps before overnight use

**Loop Count vs. Infinite:**

**Finite Loop Count:**
- Set number of repetitions (e.g., 3 loops)
- Automatically stops after set count
- Use: When you want extended but bounded session

**Infinite Loop:**
- Loops until manually stopped
- Use: Background, overnight, or when duration uncertain

**Practical Considerations:**

**Overnight Use:**

**Volume:**
- Very low volume sufficient (brain still entrains)
- Just barely audible
- Prevents hearing fatigue, discomfort

**Headphones:**
- Comfort critical for overnight use
- Over-ear may be uncomfortable side-sleeping
- Sleep headphones (flat speakers in headband) better option
- Or pillow speakers (though true binaural effect reduced)

**Battery/Power:**
- Ensure device won't die mid-session
- Plug in or use device with long battery life

**Alarm:**
- Set separate alarm (don't rely on session ending to wake you)
- Session should complement alarm, not replace it

**Extended Meditation:**

**Posture:**
- Sitting meditation >60 min: Discomfort likely
- May need to adjust posture between loops
- Or use reclined position for extended sessions

**Hydration & Bathroom:**
- Have water nearby
- Plan for breaks (pause between loops if needed)

**Mental Fatigue:**
- Extended focus sessions (beta) can be exhausting
- Use alpha or theta loops instead for gentler extended practice

**Work/Study Background:**

**Active vs. Passive:**
- Passive: Low volume, barely noticeable (alpha, 8-12 Hz)
- Active: Noticeable, engaging (beta, 14-20 Hz)
- Looping passive more sustainable long-term

**Task Compatibility:**
- Complex cognitive work: May interfere if too prominent
- Repetitive tasks: Can enhance by reducing boredom
- Creative work: Theta loops may boost creativity

**Loop Transition Smoothing:**

**Crossfade:**
Advanced feature - fade out end of loop while fading in beginning:
- Prevents abrupt restart
- Creates truly seamless experience
- EBL could implement this (0.5-2 second crossfade)

**Phase Matching:**
Ensure frequency phase aligns at loop point:
- Prevents "click" or discontinuity
- Requires careful session design
- EBL audio engine should handle this automatically

**User Control:**

**Easy Exit:**
Looping sessions should allow:
- Pause at any time
- Stop completely
- Skip to end of current loop (finish cleanly)

**Progress Indication:**
Show which loop iteration you're on:
- "Loop 2 of ∞"
- "Loop 3/5"
- Helps user track time

**Research & Anecdotes:**

**Limited Formal Research:**
Most binaural beat studies use single sessions (20-60 min):
- Less data on extended (>2 hour) or overnight use
- Anecdotal reports generally positive

**Sleep Studies:**
Some research on overnight auditory stimulation:
- Pink noise: May enhance deep sleep (Zhou et al., 2012)
- 40 Hz stimulation: Investigated for Alzheimer's (gamma entrainment)
- Delta beats: Limited formal studies but promising

**Meditation Retreats:**
Extended meditation (8+ hours/day, multi-day retreats):
- Profound effects reported
- Structural brain changes seen (cortical thickening, increased gray matter)
- Looped binaural beats could support similar extended practice at home

**Recommendations:**

**Beginners:**
- Start with non-looping sessions
- Build familiarity with states
- Gradually extend duration
- Add looping once comfortable

**Intermediate:**
- Use looping for 1-2 hour meditation sessions
- Experiment with overnight (test first on naps)
- Pay attention to how you feel

**Advanced:**
- Design custom loop-optimized sessions
- Experiment with partial loops, complex architectures
- Combine with other practices (breathwork, visualization)
- Track long-term effects

**Bottom Line:**
Looping extends the usefulness of sessions beyond single-play duration. Useful for sleep, extended meditation, and background ambience. Generally safe with common-sense precautions. Individual experimentation needed to find what works for you.`,
    placement: 'right',
    order: 3
  }
];
