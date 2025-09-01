import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { render, RenderResult } from '@testing-library/react';
import React from 'react';

export interface CustomWorld extends World {
  component?: RenderResult;
  mockAudioEngine?: any;
  mockElectromagneticField?: any;
  selectedPattern?: any;
  currentMode?: string;
  patternLibrary?: any[];
  testData?: any;
}

export class CustomWorldConstructor extends World implements CustomWorld {
  component?: RenderResult;
  mockAudioEngine?: any;
  mockElectromagneticField?: any;
  selectedPattern?: any;
  currentMode?: string = 'AUTO';
  patternLibrary?: any[];
  testData?: any = {};

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
    (global as any).AudioContext = jest.fn(() => mockAudioContext);
    (global as any).webkitAudioContext = jest.fn(() => mockAudioContext);

    // Mock WebSocket
    (global as any).WebSocket = jest.fn().mockImplementation(() => ({
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      readyState: WebSocket.CONNECTING
    }));

    // Mock fetch for API calls
    (global as any).fetch = jest.fn(() =>
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
    (global as any).localStorage = localStorageMock;

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
  updateAudioEngine(updates: Partial<any>) {
    this.mockAudioEngine = { ...this.mockAudioEngine, ...updates };
  }

  updateElectromagneticField(updates: Partial<any>) {
    this.mockElectromagneticField = { ...this.mockElectromagneticField, ...updates };
  }

  calculateBeatFrequency(): number {
    return Math.abs(this.mockAudioEngine.rightFreq - this.mockAudioEngine.leftFreq);
  }

  findPatternByName(name: string) {
    return this.patternLibrary?.find(pattern => pattern.name === name);
  }

  setTestData(key: string, value: any) {
    this.testData[key] = value;
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