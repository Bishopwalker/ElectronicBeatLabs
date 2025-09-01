import { renderHook, act } from '@testing-library/react';
import { useAudioEngine } from '../useAudioEngine';

// Mock Web Audio API
const mockOscillator = {
  connect: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  disconnect: jest.fn(),
  frequency: { 
    value: 0, 
    setValueAtTime: jest.fn(),
    linearRampToValueAtTime: jest.fn()
  },
  type: 'sine' as OscillatorType
};

const mockGainNode = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  gain: { 
    value: 1, 
    setValueAtTime: jest.fn()
  }
};

const mockStereoPanner = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  pan: { value: 0, setValueAtTime: jest.fn() }
};

const mockAudioContext = {
  createOscillator: jest.fn(() => mockOscillator),
  createGain: jest.fn(() => mockGainNode),
  createStereoPanner: jest.fn(() => mockStereoPanner),
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

describe('useAudioEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('initializes with default state', () => {
    const { result } = renderHook(() => useAudioEngine());

    expect(result.current.audioState.isPlaying).toBe(false);
    expect(result.current.audioState.volume).toBe(0.3);
    expect(result.current.audioState.leftFreq).toBe(440);
    expect(result.current.audioState.rightFreq).toBe(444);
    expect(result.current.electromagnetic.state).toBe('INACTIVE');
    expect(result.current.isSupported).toBe(true);
  });

  test('starts binaural beat with config', async () => {
    const { result } = renderHook(() => useAudioEngine());

    const config = {
      leftFreq: 200,
      rightFreq: 240,
      beatFreq: 40,
      amplitude: 0.5,
      waveform: 'sine' as const
    };

    await act(async () => {
      await result.current.startBinauralBeat(config);
    });

    expect(result.current.audioState.isPlaying).toBe(true);
    expect(result.current.audioState.leftFreq).toBe(200);
    expect(result.current.audioState.rightFreq).toBe(240);
    expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2);
    expect(mockAudioContext.createGain).toHaveBeenCalledTimes(2);
  });

  test('stops binaural beat', async () => {
    const { result } = renderHook(() => useAudioEngine());

    const config = {
      leftFreq: 200,
      rightFreq: 240,
      beatFreq: 40,
      amplitude: 0.5,
      waveform: 'sine' as const
    };

    await act(async () => {
      await result.current.startBinauralBeat(config);
    });

    act(() => {
      result.current.stopBinauralBeat();
    });

    expect(result.current.audioState.isPlaying).toBe(false);
    expect(result.current.electromagnetic.state).toBe('INACTIVE');
  });

  test('updates frequency', async () => {
    const { result } = renderHook(() => useAudioEngine());

    const config = {
      leftFreq: 200,
      rightFreq: 240,
      beatFreq: 40,
      amplitude: 0.5,
      waveform: 'sine' as const
    };

    await act(async () => {
      await result.current.startBinauralBeat(config);
    });

    act(() => {
      result.current.updateFrequency(300, 340);
    });

    expect(result.current.audioState.leftFreq).toBe(300);
    expect(result.current.audioState.rightFreq).toBe(340);
    expect(result.current.audioState.beatFreq).toBe(40);
  });

  test('updates volume', async () => {
    const { result } = renderHook(() => useAudioEngine());

    const config = {
      leftFreq: 200,
      rightFreq: 240,
      beatFreq: 40,
      amplitude: 0.5,
      waveform: 'sine' as const
    };

    await act(async () => {
      await result.current.startBinauralBeat(config);
    });

    act(() => {
      result.current.updateVolume(0.8);
    });

    expect(result.current.audioState.volume).toBe(0.8);
  });

  test('generates test tones', async () => {
    const { result } = renderHook(() => useAudioEngine());

    await act(async () => {
      result.current.generateTestTones(440, 444, 1000);
    });

    expect(result.current.audioState.isPlaying).toBe(true);
    expect(result.current.audioState.leftFreq).toBe(440);
    expect(result.current.audioState.rightFreq).toBe(444);

    // Fast forward time to trigger auto-stop
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.audioState.isPlaying).toBe(false);
  });

  test('creates gamma protocol', async () => {
    const { result } = renderHook(() => useAudioEngine());

    await act(async () => {
      result.current.createGammaProtocol(40, 1000);
    });

    expect(result.current.audioState.isPlaying).toBe(true);
    expect(result.current.audioState.beatFreq).toBe(40);
  });
});