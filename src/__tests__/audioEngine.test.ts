// Audio Engine Critical Test
// Test core binaural beat functionality

import { renderHook, act } from '@testing-library/react';
import { useAudioEngine } from '../hooks/useAudioEngine';

// Mock Web Audio API
const mockAudioContext = {
  state: 'running',
  currentTime: 0,
  createOscillator: jest.fn(() => ({
    type: 'sine',
    frequency: { setValueAtTime: jest.fn() },
    connect: jest.fn().mockReturnThis(),
    start: jest.fn(),
    stop: jest.fn(),
    disconnect: jest.fn(),
    addEventListener: jest.fn()
  })),
  createGain: jest.fn(() => ({
    gain: { setValueAtTime: jest.fn() },
    connect: jest.fn().mockReturnThis()
  })),
  createStereoPanner: jest.fn(() => ({
    pan: { setValueAtTime: jest.fn() },
    connect: jest.fn().mockReturnThis()
  })),
  destination: {},
  resume: jest.fn().mockResolvedValue(undefined),
  close: jest.fn()
};

global.AudioContext = jest.fn(() => mockAudioContext) as any;
(global as any).webkitAudioContext = global.AudioContext;

describe('useAudioEngine - Critical Audio Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAudioEngine());
    
    expect(result.current.audioState.isPlaying).toBe(false);
    expect(result.current.audioState.volume).toBe(0.3);
    expect(result.current.audioState.beatFreq).toBe(4);
    expect(result.current.electromagnetic.state).toBe('INACTIVE');
  });

  it('should start binaural beat correctly', async () => {
    const { result } = renderHook(() => useAudioEngine());
    
    const config = {
      leftFreq: 440,
      rightFreq: 444,
      beatFreq: 4,
      amplitude: 0.5,
      waveform: 'sine' as const
    };

    await act(async () => {
      await result.current.startBinauralBeat(config);
    });

    expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2);
    expect(mockAudioContext.createGain).toHaveBeenCalledTimes(2);
    expect(mockAudioContext.createStereoPanner).toHaveBeenCalledTimes(2);
    expect(result.current.audioState.isPlaying).toBe(true);
    expect(result.current.audioState.leftFreq).toBe(440);
    expect(result.current.audioState.rightFreq).toBe(444);
  });

  it('should stop binaural beat correctly', async () => {
    const { result } = renderHook(() => useAudioEngine());
    
    // Start first
    const config = {
      leftFreq: 440,
      rightFreq: 444,
      beatFreq: 4,
      amplitude: 0.5,
      waveform: 'sine' as const
    };

    await act(async () => {
      await result.current.startBinauralBeat(config);
    });

    // Then stop
    act(() => {
      result.current.stopBinauralBeat();
    });

    expect(result.current.audioState.isPlaying).toBe(false);
    expect(result.current.electromagnetic.state).toBe('INACTIVE');
  });

  it('should update frequency correctly', async () => {
    const { result } = renderHook(() => useAudioEngine());
    
    const config = {
      leftFreq: 440,
      rightFreq: 444,
      beatFreq: 4,
      amplitude: 0.5,
      waveform: 'sine' as const
    };

    await act(async () => {
      await result.current.startBinauralBeat(config);
    });

    act(() => {
      result.current.updateFrequency(432, 440);
    });

    expect(result.current.audioState.leftFreq).toBe(432);
    expect(result.current.audioState.rightFreq).toBe(440);
    expect(result.current.audioState.beatFreq).toBe(8);
  });

  it('should calculate electromagnetic field correctly', async () => {
    const { result } = renderHook(() => useAudioEngine());
    
    const config = {
      leftFreq: 440,
      rightFreq: 444,
      beatFreq: 4,
      amplitude: 0.5,
      waveform: 'sine' as const
    };

    await act(async () => {
      await result.current.startBinauralBeat(config);
    });

    // Wait for field calculation
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(result.current.electromagnetic.frequency).toBe(4);
    expect(result.current.electromagnetic.state).not.toBe('INACTIVE');
  });

  it('should handle volume changes', async () => {
    const { result } = renderHook(() => useAudioEngine());
    
    const config = {
      leftFreq: 440,
      rightFreq: 444,
      beatFreq: 4,
      amplitude: 0.5,
      waveform: 'sine' as const
    };

    await act(async () => {
      await result.current.startBinauralBeat(config);
    });

    act(() => {
      result.current.updateVolume(0.7);
    });

    expect(result.current.audioState.volume).toBe(0.7);
  });

  it('should load pattern correctly', async () => {
    const { result } = renderHook(() => useAudioEngine());
    
    const pattern = {
      id: 'test',
      name: 'Test Pattern',
      type: 'toroidal' as const,
      description: 'Test',
      instructions: 'Test',
      benefits: ['test'],
      frequencies: {
        carrier: 440,
        beat: 4,
        range: 'theta' as const
      },
      duration: 10,
      electromagnetic: {
        fieldStrength: 0.5,
        resonanceFreq: 4,
        coherence: 0.8
      },
      visualization: {
        color: '#00ff88',
        intensity: 0.8,
        pattern: 'spiral'
      }
    };

    await act(async () => {
      await result.current.loadPattern(pattern);
    });

    expect(result.current.audioState.isPlaying).toBe(true);
    expect(result.current.audioState.leftFreq).toBe(440);
    expect(result.current.audioState.rightFreq).toBe(444);
  });
});