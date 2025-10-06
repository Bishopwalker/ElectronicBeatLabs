// Electromagnetic Beat Lab Configuration - Constants and settings
// Extracted from main component for better organization

import type { AppState } from '../../types';
import { DEFAULT_BASE_FREQUENCY, DEFAULT_BEAT_FREQUENCY, DEFAULT_VOLUME } from '../../constants/audio.constants';

// Default app state configuration
export const DEFAULT_APP_STATE: AppState = {
  mode: 'AUTO',
  currentPattern: null,
  frequency: DEFAULT_BEAT_FREQUENCY,
  base_frequency: DEFAULT_BASE_FREQUENCY,
  beat_frequency: DEFAULT_BEAT_FREQUENCY,
  isPlaying: false,
  volume: DEFAULT_VOLUME,
  electromagnetic: {
    strength: 0,
    frequency: 0,
    phase: 0,
    coherence: 0,
    resonance: 0,
    state: 'INACTIVE',
    stability: 0
  },
  patterns8D: [],
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
  { id: 'patterns', label: 'Patterns', icon: '🌀', enabled: true },
  { id: 'frequency', label: 'Frequency', icon: '📊', enabled: true },
  { id: 'timer', label: 'Timer', icon: '⏰', enabled: true },
  { id: 'visualization', label: 'Visual', icon: '🎨', enabled: true },
  { id: 'adhd', label: 'ADHD', icon: '⚡', enabled: true },
  { id: 'youtube', label: 'YouTube', icon: '📺', enabled: true },
  { id: 'guide', label: 'Guide', icon: '📖', enabled: true },
  { id: 'settings', label: 'Settings', icon: '⚙️', enabled: true }
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
  'masterControls': { title: 'Master Controls', icon: '🎛️' },
  'equalizer': { title: 'Equalizer', icon: '🎚️' },
  'binauralBeats': { title: 'Binaural Beat Generator', icon: '🎧' },
  'timerPanel': { title: 'Timer & Sessions', icon: '⏰' }
};

// Default closed sections (Master Controls closed to show compact view)
export const DEFAULT_CLOSED_SECTIONS = ['masterControls'];