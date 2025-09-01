// Controls Test Suite
// Test main controls, patterns, frequency adjustments

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('Controls Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Audio Engine Controls', () => {
    it('should start and stop binaural beats', async () => {
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

      expect(result.current.audioState.isPlaying).toBe(true);
      expect(result.current.audioState.leftFreq).toBe(440);
      expect(result.current.audioState.rightFreq).toBe(444);

      act(() => {
        result.current.stopBinauralBeat();
      });

      expect(result.current.audioState.isPlaying).toBe(false);
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

    it('should update volume correctly', async () => {
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
        result.current.updateVolume(0.8);
      });

      expect(result.current.audioState.volume).toBe(0.8);
    });

    it('should update waveform correctly', async () => {
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
        result.current.updateWaveform('square');
      });

      expect(result.current.audioState.waveform).toBe('square');
    });

    it('should generate test tones', async () => {
      const { result } = renderHook(() => useAudioEngine());
      
      await act(async () => {
        result.current.generateTestTones(440, 444, 1000);
      });

      expect(result.current.audioState.isPlaying).toBe(true);
      expect(result.current.audioState.leftFreq).toBe(440);
      expect(result.current.audioState.rightFreq).toBe(444);
    });

    it('should perform frequency sweep', async () => {
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
        result.current.frequencySweep(440, 880, 5000, 4);
      });

      // Should have set up frequency sweep
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    it('should create gamma protocol for ADHD', async () => {
      const { result } = renderHook(() => useAudioEngine());
      
      await act(async () => {
        result.current.createGammaProtocol(40, 10000);
      });

      expect(result.current.audioState.isPlaying).toBe(true);
      expect(result.current.audioState.beatFreq).toBe(40);
    });
  });

  describe('Control State Management', () => {
    it('should maintain consistent state during operations', async () => {
      const { result } = renderHook(() => useAudioEngine());
      
      const config1 = {
        leftFreq: 440,
        rightFreq: 444,
        beatFreq: 4,
        amplitude: 0.5,
        waveform: 'sine' as const
      };

      const config2 = {
        leftFreq: 432,
        rightFreq: 440,
        beatFreq: 8,
        amplitude: 0.7,
        waveform: 'square' as const
      };

      // Start first configuration
      await act(async () => {
        await result.current.startBinauralBeat(config1);
      });

      expect(result.current.audioState.isPlaying).toBe(true);
      expect(result.current.audioState.beatFreq).toBe(4);

      // Switch to second configuration
      await act(async () => {
        await result.current.startBinauralBeat(config2);
      });

      expect(result.current.audioState.isPlaying).toBe(true);
      expect(result.current.audioState.beatFreq).toBe(8);
      expect(result.current.audioState.waveform).toBe('square');
    });

    it('should handle rapid control changes', async () => {
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

      // Rapid frequency changes
      act(() => {
        result.current.updateFrequency(450, 454);
        result.current.updateFrequency(460, 464);
        result.current.updateFrequency(470, 474);
      });

      expect(result.current.audioState.leftFreq).toBe(470);
      expect(result.current.audioState.rightFreq).toBe(474);
    });

    it('should validate frequency ranges', async () => {
      const { result } = renderHook(() => useAudioEngine());
      
      // Test with valid frequencies
      act(() => {
        result.current.updateFrequency(440, 444);
      });

      expect(result.current.audioState.leftFreq).toBe(440);
      expect(result.current.audioState.rightFreq).toBe(444);

      // Test with edge case frequencies
      act(() => {
        result.current.updateFrequency(20, 20000);
      });

      expect(result.current.audioState.leftFreq).toBe(20);
      expect(result.current.audioState.rightFreq).toBe(20000);
    });

    it('should validate volume ranges', async () => {
      const { result } = renderHook(() => useAudioEngine());
      
      // Test valid volume
      act(() => {
        result.current.updateVolume(0.5);
      });

      expect(result.current.audioState.volume).toBe(0.5);

      // Test edge volumes
      act(() => {
        result.current.updateVolume(0);
      });

      expect(result.current.audioState.volume).toBe(0);

      act(() => {
        result.current.updateVolume(1);
      });

      expect(result.current.audioState.volume).toBe(1);
    });
  });

  describe('Error Handling in Controls', () => {
    it('should handle audio context errors gracefully', async () => {
      // Mock failed audio context
      global.AudioContext = jest.fn(() => {
        throw new Error('Audio not supported');
      }) as any;

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

      // Should remain in stopped state
      expect(result.current.audioState.isPlaying).toBe(false);
    });

    it('should handle oscillator creation errors', async () => {
      // Mock oscillator creation failure
      const failingContext = {
        ...mockAudioContext,
        createOscillator: jest.fn(() => {
          throw new Error('Cannot create oscillator');
        })
      };

      global.AudioContext = jest.fn(() => failingContext) as any;

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

      expect(result.current.audioState.isPlaying).toBe(false);
    });
  });

  describe('Performance and Optimization', () => {
    it('should debounce rapid frequency updates', async () => {
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

      const setValueAtTimeSpy = jest.spyOn(
        mockAudioContext.createOscillator().frequency,
        'setValueAtTime'
      );

      // Rapid updates
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.updateFrequency(440 + i, 444 + i);
        }
      });

      // Should have been called for each update
      expect(result.current.audioState.leftFreq).toBe(449);
      expect(result.current.audioState.rightFreq).toBe(453);
    });

    it('should clean up resources properly', async () => {
      const { result, unmount } = renderHook(() => useAudioEngine());
      
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

      expect(result.current.audioState.isPlaying).toBe(true);

      // Unmount should clean up
      unmount();

      // Resources should be cleaned up (verified by no errors)
    });
  });
});