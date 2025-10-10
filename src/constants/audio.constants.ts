/**
 * Audio Constants - Single Source of Truth
 * All default audio values should be defined here and imported elsewhere
 */

// Default frequencies (Hz)
export const DEFAULT_BASE_FREQUENCY = 140;
export const DEFAULT_BEAT_FREQUENCY = 4;
export const DEFAULT_LEFT_FREQUENCY = 140;
export const DEFAULT_RIGHT_FREQUENCY = 144; // base + beat

// Default audio settings
// Volume/amplitude consolidated to single value (30%)
export const DEFAULT_VOLUME = 0.8;
export const DEFAULT_AMPLITUDE =  DEFAULT_VOLUME;
export const DEFAULT_WAVEFORM = 'sine' as const;
export const DEFAULT_MAX_VOLUME = 200;
// Sample rates and frame rates
export const SAMPLE_RATE = 48000;
export const FRAME_RATE = 60;
export const SAMPLES_PER_FRAME = SAMPLE_RATE / FRAME_RATE; // 800

// Frequency limits
export const MIN_BASE_FREQUENCY = 20;
export const MAX_BASE_FREQUENCY = 2000; // Per project requirements: all defaults ≤ 199Hz
export const MIN_BEAT_FREQUENCY = 0.01;
export const MAX_BEAT_FREQUENCY = 100;

// Spatial audio defaults
export const DEFAULT_SPATIAL_CONFIG = {
  enabled: false,
  mode: '3d' as const,
  positioning: 'headphones' as const,
  roomSize: 'small' as const
};

// Timer defaults
export const DEFAULT_TIMER_DURATION = 600; // 10 minutes in seconds
export const DEFAULT_TIMER_PRESET = 'focus';

// Buffer settings
export const MIN_BUFFER_FRAMES = 16;
export const MAX_BUFFER_FRAMES = 90;
export const DEFAULT_BUFFER_FRAMES = 32;