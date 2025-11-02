// Electromagnetic Beat Lab Configuration - Constants and settings
// Extracted from main component for better organization

import type { AppState } from '../../types';
import { DEFAULT_BASE_FREQUENCY, DEFAULT_BEAT_FREQUENCY, DEFAULT_VOLUME, DEFAULT_WAVEFORM } from '../../constants/audio.constants';
import { WAVE_PATTERNS, WAVEGUIDE_CONFIGS } from '../../data/patterns';
import { convertAllPatternsToPattern8D } from '../../utils/patternGeometry';

// Default app state configuration
// CLEAN: Audio state removed - lives in HybridAudioEngine.audioState
// CLEAN: Timer state removed - lives in useTimerLogic.timerState
export const DEFAULT_APP_STATE: AppState = {
  mode: 'AUTO',
  currentPattern: null,
  // Audio config lives here (engines read from centralized AudioState too)
  config: {
    base_frequency: DEFAULT_BASE_FREQUENCY,
    beat_frequency: DEFAULT_BEAT_FREQUENCY,
    volume: DEFAULT_VOLUME,
    waveform: DEFAULT_WAVEFORM as 'sine'
  },
  // REMOVED: base_frequency, beat_frequency, isPlaying, volume → HybridEngine.audioState
  electromagnetic: {
    strength: 0,
    frequency: 0,
    phase: 0,
    coherence: 0,
    resonance: 0,
    state: 'INACTIVE',
    stability: 0
  },
  patterns8D: convertAllPatternsToPattern8D(WAVE_PATTERNS), // FIXED: Convert PatternConfig[] → Pattern8D[] with 3D paths
  systemStatus: {
    electromagnetic: {
      strength: 0,
      frequency: 0,
      phase: 0,
      coherence: 0,
      resonance: 0,
      state: 'INACTIVE',
      stability: 0
    },
    audio: {
      latency: 0,
      sampleRate: 44100,
      bufferSize: 512,
      quality: 'HIGH'
    },
    performance: {
      fps: 60,
      cpuUsage: 0,
      memoryUsage: 0
    },
    state: ''
  },
  visualizations: {
    starField: {
      density: 100,
      speed: 1,
      color: '#ffffff',
      twinkle: true
    },
    spatial: {
      gridSize: 50,
      opacity: 0.3,
      color: '#00ff88',
      animation: true
    },
    frequency: {
      bars: 64,
      sensitivity: 1,
      color: '#ff6b00',
      glow: true
    }
  },
  // Frequency analysis defaults
  frequency: {
    current: DEFAULT_BEAT_FREQUENCY,
    target: DEFAULT_BEAT_FREQUENCY,
    variance: 0,
    stability: 1,
    harmonics: [],
    resonancePoints: []
  },
  // Defaults for range and waveguide
  frequencyRange: 'alpha',
  waveGuide: WAVEGUIDE_CONFIGS[0],
  spatialAudio: {
    enabled: true,
    hrtf: false,
    roomSize: 1,
    reverbAmount: 0.2,
    spatialWidth: 1,
    elevation: 0,
    azimuth: 0
  },
  youtube: {
    videoId: '',
    timestamp: 0,
    syncMode: 'audio',
    pythonScript: '',
    enabled: false
  },
  adhd: null,
  activeTab: 'patterns'
};

// Tab configuration
export const TAB_CONFIG = [
  { id: 'patterns', label: 'Patterns', icon: 'Patterns', enabled: true },
  { id: 'frequency', label: 'Frequency', icon: 'Frequency', enabled: true },
  { id: 'timer', label: 'Timer', icon: 'Timer', enabled: true },
  { id: 'visualization', label: 'Visual', icon: 'Visual', enabled: true },
  { id: 'adhd', label: 'ADHD', icon: 'ADHD', enabled: true },
  { id: 'youtube', label: 'YouTube', icon: 'YouTube', enabled: true },
  { id: 'guide', label: 'Guide', icon: 'Guide', enabled: true },
  { id: 'settings', label: 'Settings', icon: 'Settings', enabled: true }
];

// Section data for restore functionality
export const SECTION_DATA = {
  'patterns': { title: 'Patterns', icon: '🌀' },
  'waveguide': { title: 'Wave Guide', icon: '📡' },
  'adhd': { title: 'ADHD Protocol', icon: '⚡' },
  'freqID': { title: 'Frequency Display', icon: '📊' },
  'visualizeID': { title: 'Visualization', icon: '🎨' },
  'waveGuideID': { title: 'Wave Guide', icon: '📡' },
  'adhdID': { title: 'ADHD Protocol', icon: '⚡' },
  'patternID': { title: 'Patterns', icon: '🌀' },
  'timerDisplay': { title: 'Timer Display', icon: '⏱️' },
  'masterControls': { title: 'Master Controls', icon: '🎛️' },
  'equalizer': { title: 'Equalizer', icon: '🎚️' },
  'binauralBeats': { title: 'Binaural Beat Generator', icon: '🎧' },
  'timerPanel': { title: 'Timer & Sessions', icon: '⏰' },
  'frequencyVisualizer': { title: 'Frequency Visualizer', icon: '📊' }
};

// Default closed sections (Master Controls and FrequencyVisualizer closed initially)
export const DEFAULT_CLOSED_SECTIONS: string[] = ['masterControls', 'equalizer'];