/**
 * Tutorial Steps Definition
 *
 * Comprehensive list of all tutorial steps for the EBL application.
 * Organized by category with progressive difficulty.
 *
 * IMPORTANT: targetElement IDs must match actual DOM elements!
 * Check components for id="xxx" attributes before adding steps.
 */

import { TooltipStep } from './types';

/**
 * All tutorial steps organized by category
 */
export const TUTORIAL_STEPS: TooltipStep[] = [
  // ============================================
  // WELCOME - Introduction to EBL
  // ============================================
  {
    id: 'welcome-01-intro',
    category: 'welcome',
    title: 'Welcome to Electromagnetic Beat Lab! 🎧',
    content: 'EBL combines binaural beats, brainwave entrainment, and quantum-inspired remote viewing tools. This tutorial will guide you through all the features.',
    scienceContent: 'EBL is built on research into brainwave entrainment (using binaural beats to influence brain states) and cognitive enhancement techniques. The app includes tools for focus, meditation, ADHD support, and consciousness exploration.',
    targetElement: '#masterControls',
    placement: 'bottom',
    order: 1
  },

  // ============================================
  // AUDIO CATEGORY - Basic audio controls
  // ============================================
  {
    id: 'audio-01-play',
    category: 'audio',
    title: 'Start Your Session',
    content: 'Click the PLAY button to begin generating binaural beats. The audio will start immediately - make sure you\'re wearing headphones!',
    scienceContent: 'Binaural beats work by presenting two slightly different frequencies to each ear. Your brain perceives a third "phantom" beat at the difference between the two frequencies (e.g., 140Hz and 144Hz creates a 4Hz beat). This frequency-following response can influence brainwave states.',
    targetElement: '#play-button',
    placement: 'bottom',
    order: 2
  },
  {
    id: 'audio-02-volume',
    category: 'audio',
    title: 'Adjust Volume',
    content: 'Control the output volume. For best results, use comfortable listening levels (40-60%) with headphones. Too loud can be fatiguing.',
    scienceContent: 'Binaural beats work best at moderate volume levels. Too quiet and the brain may not detect the beat; too loud can cause discomfort and reduce effectiveness. Research suggests optimal effectiveness around 60dB.',
    targetElement: '#volume-control',
    placement: 'left',
    order: 3
  },
  {
    id: 'audio-03-base-frequency',
    category: 'audio',
    title: 'Base (Carrier) Frequency',
    content: 'Adjust the carrier frequency (default 140Hz). This is the foundational tone heard by both ears. Lower frequencies feel more visceral; higher frequencies are more cerebral.',
    scienceContent: 'The carrier frequency provides the base tone. While the binaural beat frequency affects brainwave entrainment, the carrier frequency can influence the overall listening experience. Research suggests carriers between 100-500Hz work best for most people.',
    targetElement: '#base-frequency-slider',
    placement: 'top',
    order: 4
  },
  {
    id: 'audio-04-beat-frequency',
    category: 'audio',
    title: 'Beat Frequency (Target Brainwave)',
    content: 'The beat frequency determines your target brainwave state:\n• Delta (0.5-4Hz): Deep sleep\n• Theta (4-8Hz): Meditation\n• Alpha (8-14Hz): Relaxation\n• Beta (14-30Hz): Focus\n• Gamma (30-100Hz): Peak awareness',
    scienceContent: 'Different beat frequencies entrain different brainwave states. The frequency following response (FFR) causes your neural oscillations to synchronize with the beat frequency. For ADHD, 12-15Hz (SMR) is commonly used; for meditation, 6-10Hz is typical.',
    targetElement: '#beat-frequency-slider',
    placement: 'top',
    order: 5
  },
  {
    id: 'audio-05-waveform',
    category: 'audio',
    title: 'Waveform Selection',
    content: 'Choose between sine (smoothest), square (brighter), triangle (balanced), or sawtooth (richest). Sine waves are recommended for most uses.',
    scienceContent: 'Different waveforms contain different harmonic content. Sine waves have no harmonics (pure tone), while square/sawtooth contain multiple harmonics that can create more complex brainwave responses.',
    targetElement: '#waveform-selector',
    placement: 'right',
    order: 6
  },

  // ============================================
  // PATTERNS CATEGORY - Pattern presets
  // ============================================
  {
    id: 'patterns-01-selector',
    category: 'patterns',
    title: 'Pattern Presets',
    content: 'Choose from pre-configured frequency patterns optimized for different states: meditation, focus, creativity, healing, sleep, and ADHD support.',
    scienceContent: 'Each pattern combines specific frequencies, durations, and electromagnetic field configurations based on research into brainwave entrainment and consciousness states. Patterns often include frequency progressions that guide you through multiple states.',
    targetElement: '#pattern-selector',
    placement: 'bottom',
    order: 7
  },
  {
    id: 'patterns-02-mode',
    category: 'patterns',
    title: 'Pattern Mode',
    content: 'AUTO mode follows pattern frequencies automatically. MANUAL lets you override with your own settings. CUSTOM creates your own sequences.',
    targetElement: '#pattern-mode-selector',
    placement: 'right',
    order: 8
  },

  // ============================================
  // TIMER CATEGORY - Session timing
  // ============================================
  {
    id: 'timer-01-panel',
    category: 'timer',
    title: 'Timer Presets',
    content: 'Load pre-configured timed sessions with automatic frequency transitions. Perfect for meditation, ADHD protocols, and sleep induction.',
    scienceContent: 'Timer presets use progressive frequency transitions to guide your brain through different states. For example, a sleep session might start at 10Hz (Alpha) and gradually shift to 2Hz (Delta) over 30 minutes.',
    targetElement: '#timerPanel',
    placement: 'bottom',
    order: 9
  },
  {
    id: 'timer-02-countdown',
    category: 'timer',
    title: 'Timer Countdown Display',
    content: 'When a timer is active, this displays the current phase, time remaining, and frequency transitions. You can pause, skip phases, or restart sessions.',
    targetElement: '#timerCountdown',
    placement: 'top',
    order: 10
  },

  // ============================================
  // EQUALIZER CATEGORY - Audio shaping
  // ============================================
  {
    id: 'eq-01-section',
    category: 'equalizer',
    title: 'Equalizer & Effects',
    content: 'Toggle the equalizer to shape the frequency spectrum and add spatial effects. Fine-tune audio to your preference or enhance the therapeutic experience.',
    scienceContent: 'Equalizers use biquad filters to selectively amplify or attenuate frequency ranges. Spatial effects (8D audio) add movement and depth to the sound field, potentially enhancing entrainment by engaging spatial processing areas.',
    targetElement: '#equalizer',
    placement: 'top',
    order: 11
  },
  {
    id: 'eq-02-bands',
    category: 'equalizer',
    title: 'Frequency Bands',
    content: 'Adjust individual frequency bands to boost or cut specific ranges. Use presets for headphones, speakers, or bass boost.',
    targetElement: '#eq-bands',
    placement: 'left',
    order: 12
  },

  // ============================================
  // VISUALIZATION CATEGORY - Visual feedback
  // ============================================
  {
    id: 'viz-01-frequency',
    category: 'visualization',
    title: 'Frequency Analyzer',
    content: 'Real-time frequency spectrum analysis showing current audio output. Watch the live frequency content and verify your binaural beat is generating correctly.',
    scienceContent: 'The FFT (Fast Fourier Transform) analysis breaks down the audio signal into its component frequencies. You should see peaks at your carrier frequency and carrier+beat frequency when playing.',
    targetElement: '#frequencyVisualizer',
    placement: 'top',
    order: 13
  },
  {
    id: 'viz-02-spatial',
    category: 'visualization',
    title: '3D Spatial Visualizer',
    content: 'Visual representation of the electromagnetic field patterns. Watch the toroidal, vortex, or spiral patterns change with audio and pattern settings.',
    scienceContent: 'The visualization shows different electromagnetic field topologies. Toroidal fields are found throughout nature (Earth\'s magnetosphere, human heart field) and may represent optimal energy distribution patterns.',
    targetElement: '#spatialVisualizer',
    placement: 'top',
    order: 14
  },

  // ============================================
  // REMOTE VIEWING CATEGORY - Consciousness exploration
  // ============================================
  {
    id: 'rv-01-intro',
    category: 'remote-viewing',
    title: 'Remote Viewing Practice 👁️',
    content: 'Welcome to the Remote Viewing section! This is where you can practice quantum number prediction and associative remote viewing (ARV).',
    scienceContent: 'Remote Viewing is a consciousness research protocol developed at Stanford Research Institute in the 1970s. ARV (Associative Remote Viewing) uses blind targets to predict outcomes. While scientifically controversial, it has a documented research history.',
    targetElement: '#remoteViewing',
    placement: 'bottom',
    order: 15
  },
  {
    id: 'rv-02-quantum-number',
    category: 'remote-viewing',
    title: 'Quantum Number Prediction',
    content: 'Practice predicting numbers generated by quantum random processes. Choose ODD or EVEN, then focus your intention before the reveal.',
    scienceContent: 'The quantum random number generator uses true quantum randomness (not pseudo-random). Some consciousness researchers theorize that focused intention might influence or anticipate quantum collapse outcomes.',
    targetElement: '#remoteViewing',
    placement: 'right',
    order: 16
  },
  {
    id: 'rv-03-image-prediction',
    category: 'remote-viewing',
    title: 'Image Prediction (ARV)',
    content: 'In image mode, you\'ll be shown 4 images and asked to identify which one is the "target" - the one selected by quantum randomness. Use your intuition!',
    scienceContent: 'Associative Remote Viewing pairs targets with outcomes. In practice, an analyst describes impressions without knowing what images represent which outcome. Here, you\'re doing simplified direct prediction.',
    targetElement: '#remoteViewing',
    placement: 'right',
    order: 17
  },
  {
    id: 'rv-04-tracking',
    category: 'remote-viewing',
    title: 'Score Tracking',
    content: 'Your prediction accuracy is tracked over time. Track your hit rate, streak, and history. Chance is 50% for numbers and 25% for images.',
    scienceContent: 'Statistical significance in RV research typically requires hundreds of trials. A hit rate significantly above chance (>55% for binary, >30% for 4-choice) over many trials would be considered anomalous.',
    targetElement: '#remoteViewing',
    placement: 'bottom',
    order: 18
  },

  // ============================================
  // MASTER CONTROLS - Global control
  // ============================================
  {
    id: 'master-01-controls',
    category: 'master',
    title: 'Master Controls & Quick Start',
    content: 'Quick access to main functions: engine status, backend connection, pattern activation, and test tones. Shows current frequency settings.',
    targetElement: '#masterControls',
    placement: 'left',
    order: 19
  },

  // ============================================
  // BINAURAL GENERATOR - Detailed controls
  // ============================================
  {
    id: 'binaural-01-generator',
    category: 'binaural',
    title: 'Binaural Beat Generator',
    content: 'This panel provides detailed control over your binaural beat generation - frequencies, waveform, and real-time adjustments.',
    targetElement: '#binauralBeats',
    placement: 'top',
    order: 20
  },

  // ============================================
  // ADVANCED CATEGORY - Advanced features
  // ============================================
  {
    id: 'advanced-01-engine',
    category: 'advanced',
    title: 'Audio Engine Selection',
    content: 'Toggle between Frontend (browser-based, instant) and Backend (server-powered, precision) audio engines. Backend provides higher quality processing.',
    scienceContent: 'The backend engine uses NumPy and SciPy for high-precision audio generation at 48kHz with 32-bit float processing. The frontend uses Web Audio API for instant, offline-capable generation.',
    targetElement: '#masterControls',
    placement: 'left',
    order: 21,
    optional: true
  },

  // ============================================
  // CONCLUSION
  // ============================================
  {
    id: 'conclusion-01-tips',
    category: 'conclusion',
    title: 'Tips for Best Results 🎯',
    content: '• Use quality headphones (required for binaural beats)\n• Find a quiet environment\n• Sessions of 15-30 minutes work best\n• Be consistent - daily practice improves results\n• Try different frequencies to find what works for you',
    scienceContent: 'Research suggests that consistent practice over 2-4 weeks shows the most benefit. Individual responses to frequencies vary, so experimentation is encouraged. Keeping a journal of sessions can help identify what works best for you.',
    targetElement: '#masterControls',
    placement: 'bottom',
    order: 22
  }
];

/**
 * Get steps by category
 */
export function getStepsByCategory(category: string): TooltipStep[] {
  return TUTORIAL_STEPS.filter(step => step.category === category).sort((a, b) => a.order - b.order);
}

/**
 * Get step by ID
 */
export function getStepById(id: string): TooltipStep | undefined {
  return TUTORIAL_STEPS.find(step => step.id === id);
}

/**
 * Get all categories
 */
export function getAllCategories(): string[] {
  return Array.from(new Set(TUTORIAL_STEPS.map(step => step.category)));
}

/**
 * Get next step in sequence
 */
export function getNextStep(currentStepId: string): TooltipStep | null {
  const currentIndex = TUTORIAL_STEPS.findIndex(step => step.id === currentStepId);
  if (currentIndex === -1 || currentIndex === TUTORIAL_STEPS.length - 1) {
    return null;
  }
  return TUTORIAL_STEPS[currentIndex + 1];
}

/**
 * Get previous step in sequence
 */
export function getPreviousStep(currentStepId: string): TooltipStep | null {
  const currentIndex = TUTORIAL_STEPS.findIndex(step => step.id === currentStepId);
  if (currentIndex <= 0) {
    return null;
  }
  return TUTORIAL_STEPS[currentIndex - 1];
}
