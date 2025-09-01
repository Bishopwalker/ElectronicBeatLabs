import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { RenderResult } from '@testing-library/react';

interface MockAudioEngine {
  isPlaying: boolean;
  leftFreq: number;
  rightFreq: number;
  beatFreq: number;
  volume: number;
  waveform: string;
  startAudio: jest.Mock;
  stopAudio: jest.Mock;
  setVolume: jest.Mock;
  setFrequencies: jest.Mock;
  setWaveform: jest.Mock;
  error: string | null;
}

interface MockElectromagneticField {
  strength: number;
  frequency: number;
  coherence: number;
  resonance: number;
  state: string;
  stability: number;
  phase: number;
}

interface PatternData {
  id: string;
  name: string;
  description: string;
  frequency: number;
  leftFreq: number;
  rightFreq: number;
  duration: number;
  category: string;
  fadeIn: number;
  fadeOut: number;
}

export interface CustomWorld extends World {
  component?: RenderResult;
  mockAudioEngine?: MockAudioEngine;
  mockElectromagneticField?: MockElectromagneticField;
  selectedPattern?: PatternData;
  currentMode?: string;
  patternLibrary?: PatternData[];
  testData?: Record<string, unknown>;
}

export class CustomWorldConstructor extends World implements CustomWorld {
  component?: RenderResult;
  mockAudioEngine?: MockAudioEngine;
  mockElectromagneticField?: MockElectromagneticField;
  selectedPattern?: PatternData;
  currentMode?: string = 'AUTO';
  patternLibrary?: PatternData[];
  testData?: Record<string, unknown> = {};

  constructor(options: IWorldOptions) {
    super(options);
    
    // Initialize mock data and state
    this.initializeMocks();
  }

  private initializeMocks() {
    // Mock audio engine
    this.mockAudioEngine = {
      isPlaying: false,
      leftFreq: 440,
      rightFreq: 444,
      beatFreq: 4,
      volume: 0.5,
      waveform: 'sine',
      startAudio: jest.fn(),
      stopAudio: jest.fn(),
      setVolume: jest.fn(),
      setFrequencies: jest.fn(),
      setWaveform: jest.fn(),
      error: null
    };

    // Mock electromagnetic field
    this.mockElectromagneticField = {
      strength: 0,
      frequency: 0,
      coherence: 0,
      resonance: 0,
      state: 'INACTIVE',
      stability: 0,
      phase: 0
    };

    // Mock pattern library
    this.patternLibrary = [
      {
        id: 'focus',
        name: 'Focus Enhancement',
        description: 'Enhance concentration and mental clarity',
        frequency: 40,
        leftFreq: 40,
        rightFreq: 44,
        duration: 1800,
        category: 'focus',
        fadeIn: 30,
        fadeOut: 30
      },
      {
        id: 'relaxation',
        name: 'Deep Relaxation',
        description: 'Promote deep relaxation and stress relief',
        frequency: 6,
        leftFreq: 440,
        rightFreq: 446,
        duration: 2400,
        category: 'relaxation',
        fadeIn: 60,
        fadeOut: 60
      },
      {
        id: 'sleep',
        name: 'Deep Sleep',
        description: 'Prepare for deep, restorative sleep',
        frequency: 2,
        leftFreq: 440,
        rightFreq: 442,
        duration: 3600,
        category: 'sleep',
        fadeIn: 120,
        fadeOut: 120
      }
    ];

    // Setup global mocks
    this.setupGlobalMocks();
  }

  private setupGlobalMocks() {
    // Mock Web Audio API
    const mockOscillator = {
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      disconnect: jest.fn(),
      frequency: { 
        value: 0, 
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn()
      },
      type: 'sine'
    };

    const mockGainNode = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      gain: { 
        value: 1, 
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn()
      }
    };

    const mockAudioContext = {
      createOscillator: jest.fn(() => mockOscillator),
      createGain: jest.fn(() => mockGainNode),
      createStereoPanner: jest.fn(() => ({
        connect: jest.fn(),
        disconnect: jest.fn(),
        pan: { value: 0, setValueAtTime: jest.fn() }
      })),
      destination: {},
      currentTime: 0,
      state: 'running',
      suspend: jest.fn(),
      resume: jest.fn(),
      close: jest.fn()
    };

    // Mock AudioContext constructor
    (global as unknown as { AudioContext: jest.Mock }).AudioContext = jest.fn(() => mockAudioContext);
    (global as unknown as { webkitAudioContext: jest.Mock }).webkitAudioContext = jest.fn(() => mockAudioContext);

    // Mock WebSocket
    (global as unknown as { WebSocket: jest.Mock }).WebSocket = jest.fn().mockImplementation(() => ({
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      readyState: WebSocket.CONNECTING
    }));

    // Mock fetch for API calls
    (global as unknown as { fetch: jest.Mock }).fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    (global as unknown as { localStorage: typeof localStorageMock }).localStorage = localStorageMock;

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  }

  // Utility methods for test scenarios
  updateAudioEngine(updates: Partial<MockAudioEngine>) {
    this.mockAudioEngine = { ...this.mockAudioEngine, ...updates };
  }

  updateElectromagneticField(updates: Partial<MockElectromagneticField>) {
    this.mockElectromagneticField = { ...this.mockElectromagneticField, ...updates };
  }

  calculateBeatFrequency(): number {
    return Math.abs(this.mockAudioEngine.rightFreq - this.mockAudioEngine.leftFreq);
  }

  findPatternByName(name: string) {
    return this.patternLibrary?.find(pattern => pattern.name === name);
  }

  setTestData(key: string, value: unknown) {
    if (this.testData) {
      this.testData[key] = value;
    }
  }

  getTestData(key: string) {
    return this.testData[key];
  }

  cleanup() {
    jest.clearAllMocks();
    this.component?.unmount();
    this.selectedPattern = null;
    this.currentMode = 'AUTO';
    this.testData = {};
  }
}

setWorldConstructor(CustomWorldConstructor);