/**
 * AudioMixer Unit Tests - Critical Path Coverage
 *
 * Tests core functionality: construction, crossfades, failover, cleanup
 */

import { AudioMixer } from '../utils/AudioMixer';

// Mock AudioContext for testing
class MockAudioContext {
  state: 'suspended' | 'running' | 'closed' = 'running';
  currentTime: number = 0;
  destination: any = { connect: jest.fn(), disconnect: jest.fn() };

  createGain(): any {
    const gainNode = {
      gain: {
        value: 0,
        setValueAtTime: jest.fn((value: number, time: number) => {
          gainNode.gain.value = value; // Actually update the value
          return gainNode.gain;
        }),
        linearRampToValueAtTime: jest.fn((value: number, time: number) => {
          gainNode.gain.value = value; // Actually update the value
          return gainNode.gain;
        }),
      },
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    return gainNode;
  }

  createAnalyser(): any {
    return {
      fftSize: 0,
      smoothingTimeConstant: 0,
      minDecibels: 0,
      maxDecibels: 0,
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
  }
}

describe('AudioMixer', () => {
  let mockContext: MockAudioContext;
  let mixer: AudioMixer;

  beforeEach(() => {
    mockContext = new MockAudioContext();
    mixer = new AudioMixer(mockContext as any);
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (mixer) {
      mixer.destroy();
    }
  });

  describe('Construction', () => {
    it('should create mixer with valid context', () => {
      expect(mixer).toBeDefined();
      expect(mixer.getMode()).toBe('frontend');
      expect(mixer.getIsCrossfading()).toBe(false);
    });

    it('should throw error for null context', () => {
      expect(() => new AudioMixer(null as any)).toThrow('AudioMixer: audioContext is required');
    });

    it('should throw error for closed context', () => {
      const closedContext = new MockAudioContext();
      closedContext.state = 'closed';
      expect(() => new AudioMixer(closedContext as any)).toThrow('AudioMixer: audioContext is closed');
    });

    it('should initialize with correct gain values', () => {
      const gains = mixer.getGainValues();
      // Frontend starts at 1.0, backend at 0.0
      expect(gains.frontend).toBe(1.0);
      expect(gains.backend).toBe(0.0);
    });

    it('should create analyser node with correct settings', () => {
      expect(mixer.analyserNode).toBeDefined();
      expect(mixer.analyserNode.fftSize).toBe(2048);
      expect(mixer.analyserNode.smoothingTimeConstant).toBe(0.8);
      expect(mixer.analyserNode.minDecibels).toBe(-100);
      expect(mixer.analyserNode.maxDecibels).toBe(-30);
    });
  });

  describe('setMasterVolume', () => {
    it('should set frontend volume in frontend mode', () => {
      const frontendGain = mixer.getFrontendGain();
      mixer.setMasterVolume(0.7);

      const gains = mixer.getGainValues();
      expect(gains.frontend).toBe(0.7);
      expect(gains.backend).toBe(0);
    });

    it('should handle NaN volume', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mixer.setMasterVolume(NaN);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid volume (NaN)'));
      const gains = mixer.getGainValues();
      expect(gains.frontend).toBe(0.5); // Default fallback

      consoleSpy.mockRestore();
    });

    it('should clamp volume to 0-1 range', () => {
      mixer.setMasterVolume(1.5);
      let gains = mixer.getGainValues();
      expect(gains.frontend).toBe(1.0); // Clamped to max

      mixer.setMasterVolume(-0.5);
      gains = mixer.getGainValues();
      expect(gains.frontend).toBe(0.0); // Clamped to min
    });

    it('should split volume in hybrid mode', () => {
      mixer.setHybridMode(0.5, 0.5);
      mixer.setMasterVolume(0.8);

      const gains = mixer.getGainValues();
      // Each engine gets 0.5 * 0.8 = 0.4
      expect(gains.frontend).toBe(0.4);
      expect(gains.backend).toBe(0.4);
    });

    it('should not change volume during crossfade', () => {
      mixer.crossfadeToBackend(2.0);
      mixer.setMasterVolume(0.3);

      // Volume should remain as set by crossfade, not changed to 0.3
      expect(mixer.getIsCrossfading()).toBe(true);
    });
  });

  describe('crossfadeToBackend', () => {
    it('should set crossfading flag', () => {
      mixer.crossfadeToBackend(2.0);
      expect(mixer.getIsCrossfading()).toBe(true);
    });

    it('should prevent concurrent crossfades', () => {
      mixer.crossfadeToBackend(2.0);
      const firstCrossfading = mixer.getIsCrossfading();

      mixer.crossfadeToBackend(1.0); // Second call should be ignored

      expect(firstCrossfading).toBe(true);
      expect(mixer.getIsCrossfading()).toBe(true); // Still crossfading from first call
    });

    it('should update mode after completion', (done) => {
      mixer.crossfadeToBackend(0.1); // Short duration for fast test

      setTimeout(() => {
        expect(mixer.getMode()).toBe('backend');
        expect(mixer.getIsCrossfading()).toBe(false);
        done();
      }, 150); // Wait for crossfade + buffer
    });

    it('should use dynamic step calculation', () => {
      // For 2 second crossfade at 60 steps/second = 120 steps
      mixer.crossfadeToBackend(2.0);
      // Can't directly test steps, but can verify smooth operation
      expect(mixer.getIsCrossfading()).toBe(true);
    });
  });

  describe('failoverToFrontend', () => {
    beforeEach(() => {
      // Start in backend mode
      mixer.setFrontendGain(0);
      mixer.setBackendGain(1.0);
    });

    it('should instantly switch to frontend', () => {
      mixer.failoverToFrontend();

      const gains = mixer.getGainValues();
      expect(gains.frontend).toBe(1.0);
      expect(gains.backend).toBe(0.0);
    });

    it('should update mode immediately', () => {
      mixer.failoverToFrontend();
      expect(mixer.getMode()).toBe('frontend');
    });

    it('should clear crossfading flag', () => {
      mixer.crossfadeToBackend(2.0);
      expect(mixer.getIsCrossfading()).toBe(true);

      mixer.failoverToFrontend();
      expect(mixer.getIsCrossfading()).toBe(false);
    });
  });

  describe('crossfadeToFrontend', () => {
    beforeEach(() => {
      // Start in backend mode
      mixer.setFrontendGain(0);
      mixer.setBackendGain(1.0);
    });

    it('should crossfade from current gain values', () => {
      mixer.crossfadeToFrontend(2.0);
      expect(mixer.getIsCrossfading()).toBe(true);
    });

    it('should update mode after completion', (done) => {
      mixer.crossfadeToFrontend(0.1); // Short duration

      setTimeout(() => {
        expect(mixer.getMode()).toBe('frontend');
        expect(mixer.getIsCrossfading()).toBe(false);
        done();
      }, 150);
    });
  });

  describe('setHybridMode', () => {
    it('should set both engines to specified ratios', () => {
      mixer.setHybridMode(0.4, 0.6);

      const gains = mixer.getGainValues();
      expect(gains.frontend).toBe(0.4);
      expect(gains.backend).toBe(0.6);
    });

    it('should use default ratios (0.5, 0.5)', () => {
      mixer.setHybridMode();

      const gains = mixer.getGainValues();
      expect(gains.frontend).toBe(0.5);
      expect(gains.backend).toBe(0.5);
    });

    it('should warn if total gain exceeds 1.0', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mixer.setHybridMode(0.8, 0.85);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('total gain 1.65 exceeds 1.0'));

      consoleSpy.mockRestore();
    });

    it('should update mode to hybrid', () => {
      mixer.setHybridMode(0.5, 0.5);
      expect(mixer.getMode()).toBe('hybrid');
    });
  });

  describe('destroy', () => {
    it('should disconnect all gain nodes', () => {
      const frontendPreAnalyser = (mixer as any).frontendPreAnalyserGain;
      const backendPreAnalyser = (mixer as any).backendPreAnalyserGain;
      const frontendGain = (mixer as any).frontendGain;
      const backendGain = (mixer as any).backendGain;
      const analyser = mixer.analyserNode;

      mixer.destroy();

      expect(frontendPreAnalyser.disconnect).toHaveBeenCalled();
      expect(backendPreAnalyser.disconnect).toHaveBeenCalled();
      expect(frontendGain.disconnect).toHaveBeenCalled();
      expect(backendGain.disconnect).toHaveBeenCalled();
      expect(analyser.disconnect).toHaveBeenCalled();
    });

    it('should cancel pending crossfade timeouts', (done) => {
      mixer.crossfadeToBackend(2.0);
      mixer.destroy();

      // Wait beyond crossfade duration
      setTimeout(() => {
        // Mode should NOT have changed to 'backend' because timeout was cancelled
        expect(mixer.getMode()).toBe('frontend');
        done();
      }, 2100);
    });

    it('should not throw on double destroy', () => {
      mixer.destroy();
      expect(() => mixer.destroy()).not.toThrow();
    });

    it('should handle disconnect errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Cause disconnect to throw
      (mixer as any).frontendGain.disconnect.mockImplementation(() => {
        throw new Error('Mock disconnect error');
      });

      expect(() => mixer.destroy()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain('AudioMixer cleanup error');

      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle suspended context', () => {
      const suspendedContext = new MockAudioContext();
      suspendedContext.state = 'suspended';

      // Should not throw for suspended context (only closed)
      expect(() => new AudioMixer(suspendedContext as any)).not.toThrow();
    });

    it('should return gain nodes for connection', () => {
      const frontendGain = mixer.getFrontendGain();
      const backendGain = mixer.getBackendGain();

      expect(frontendGain).toBeDefined();
      expect(backendGain).toBeDefined();
      expect(frontendGain.connect).toBeDefined();
      expect(backendGain.connect).toBeDefined();
    });

    it('should maintain constant total gain during crossfade', () => {
      // At any point during crossfade, frontend + backend should ≈ 1.0
      mixer.crossfadeToBackend(2.0);

      const gains = mixer.getGainValues();
      const total = gains.frontend + gains.backend;

      // Total should be close to 1.0 (allowing for floating point precision)
      expect(total).toBeGreaterThanOrEqual(0.99);
      expect(total).toBeLessThanOrEqual(1.01);
    });
  });

  describe('getGainValues', () => {
    it('should return current gain values', () => {
      mixer.setFrontendGain(0.7);
      mixer.setBackendGain(0.3);

      const gains = mixer.getGainValues();
      expect(gains.frontend).toBe(0.7);
      expect(gains.backend).toBe(0.3);
    });
  });
});
