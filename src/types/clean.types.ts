// ============================================
// CLEAN TYPE SYSTEM - ONE TYPE PER PURPOSE
// ============================================

// ============================================
// CORE AUDIO TYPES
// ============================================

/**
 * Standard audio configuration used everywhere
 */
export interface AudioConfig {
  base_frequency: number;    // Left ear frequency (Hz)
  beat_frequency: number;    // Beat frequency (Hz)
  amplitude: number;        // Volume 0-1
  waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
}

/**
 * Spatial audio settings
 */
export interface SpatialConfig {
  enabled: boolean;
  mode: 'binaural' | 'stereo' | '3d';
  positioning: 'headphones' | 'speakers';
  roomSize: 'small' | 'medium' | 'large';
}

// ============================================
// ENGINE TYPES - ONE FOR EACH ENGINE
// ============================================

/**
 * Frontend Engine (Web Audio API)
 */
export interface FrontendEngine {
  // State
  isPlaying: boolean;
  audioConfig: AudioConfig;
  spatialConfig: SpatialConfig;

  // Methods
  start: (config: AudioConfig) => Promise<void>;
  stop: () => void;
  updateFrequency: (base: number, beat: number) => void;
  updateVolume: (volume: number) => void;
  updateWaveform: (waveform: AudioConfig['waveform']) => void;
  isSupported: boolean;
}

/**
 * Backend Engine (WebSocket + Backend)
 */
export interface BackendEngine {
  // State
  isPlaying: boolean;
  connected: boolean;
  sessionId: string | null;
  audioConfig: AudioConfig;
  spatialConfig: SpatialConfig;

  // Methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  start: (config: AudioConfig) => Promise<void>;
  stop: () => void;
  updateFrequency: (base: number, beat: number) => void;
  updateVolume: (volume: number) => void;
  updateSpatialSettings: (spatial: SpatialConfig) => void;
}

// ============================================
// PATTERN TYPES - ONE SIMPLE TYPE
// ============================================

/**
 * Pattern definition - simple and clear
 */
export interface Pattern {
  id: string;
  name: string;
  description: string;
  audio: AudioConfig;
  spatial: SpatialConfig;
  duration: number; // minutes
  category: 'meditation' | 'focus' | 'creativity' | 'healing' | 'adhd';
}

// ============================================
// TAB TYPES - ONE FOR EACH TAB
// ============================================

/**
 * Settings Tab
 */
export interface SettingsTabProps {
  audioConfig: AudioConfig;
  spatialConfig: SpatialConfig;
  onAudioChange: (config: AudioConfig) => void;
  onSpatialChange: (config: SpatialConfig) => void;
}

/**
 * Patterns Tab
 */
export interface PatternsTabProps {
  patterns: Pattern[];
  selectedPattern: Pattern | null;
  onPatternSelect: (pattern: Pattern) => void;
  onPatternStart: (pattern: Pattern) => void;
}

/**
 * Visualizer Tab
 */
export interface VisualizerTabProps {
  audioConfig: AudioConfig;
  isPlaying: boolean;
  visualizationData: VisualizationData | null;
}

/**
 * Timer Tab
 */
export interface TimerTabProps {
  duration: number; // minutes
  isRunning: boolean;
  timeRemaining: number; // seconds
  pattern: Pattern | null;
  onStart: (duration: number, pattern?: Pattern) => void;
  onStop: () => void;
  onPause: () => void;
}

// ============================================
// SUPPORTING TYPES - MINIMAL
// ============================================

/**
 * Visualization data from audio analysis
 */
export interface VisualizationData {
  spectrumData: number[];
  peakFrequencies: { frequency: number; amplitude: number }[];
  leftAmplitude: number;
  rightAmplitude: number;
  beat_frequency: number;
  signalQuality: number; // 0-1
}

/**
 * Electromagnetic field state (for UI effects)
 */
export interface ElectromagneticField {
  strength: number;     // 0-1
  frequency: number;    // Hz
  state: 'INACTIVE' | 'CHARGING' | 'ACTIVE' | 'RESONANT' | 'CRITICAL';
  stability: number;    // 0-1
}

/**
 * System status for monitoring
 */
export interface SystemStatus {
  frontend: {
    engine: 'none' | 'frontend' | 'backend';
    isPlaying: boolean;
    audioLatency: number; // ms
  };
  backend: {
    connected: boolean;
    sessionId: string | null;
    audioLatency: number; // ms
  };
  performance: {
    fps: number;
    cpuUsage: number;
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calculate right frequency from base and beat
 */
export const calculateRightFreq = (base_frequency: number, beat_frequency: number): number => {
  return base_frequency + beat_frequency;
};

/**
 * Calculate beat frequency from left and right
 */
export const calculateBeatFreq = (leftFreq: number, rightFreq: number): number => {
  return Math.abs(rightFreq - leftFreq);
};

/**
 * Validate audio configuration
 */
export const validateAudioConfig = (config: Partial<AudioConfig>): {
  base_frequency: number;
  beat_frequency: number;
  amplitude: number;
  waveform: "sine" | "square" | "triangle" | "sawtooth"
} => {
  return {
    base_frequency: Math.max(20, Math.min(20000, config.base_frequency || 144)),
    beat_frequency: Math.max(0.1, Math.min(100, config.beat_frequency || 4)),
    amplitude: Math.max(0, Math.min(1, config.amplitude || 0.3)),
    waveform: config.waveform || 'sine'
  };
};