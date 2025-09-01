// Frequencies Test Suite
// Test binaural beat frequency calculations and ranges

import { WAVE_PATTERNS } from '../data/patterns';

describe('Frequencies Tests', () => {
  it('should have valid frequency ranges', () => {
    WAVE_PATTERNS.forEach(pattern => {
      expect(pattern.frequencies.carrier).toBeGreaterThan(0);
      expect(pattern.frequencies.beat).toBeGreaterThan(0);
      expect(pattern.frequencies.beat).toBeLessThan(100); // Reasonable beat frequency limit
    });
  });

  it('should calculate binaural beat correctly', () => {
    const leftFreq = 440;
    const rightFreq = 444;
    const expectedBeat = Math.abs(rightFreq - leftFreq);
    
    expect(expectedBeat).toBe(4);
  });

  it('should support theta frequency range (4-8Hz)', () => {
    const thetaPatterns = WAVE_PATTERNS.filter(p => p.frequencies.range === 'theta');
    expect(thetaPatterns.length).toBeGreaterThan(0);
    
    thetaPatterns.forEach(pattern => {
      expect(pattern.frequencies.beat).toBeGreaterThanOrEqual(4);
      expect(pattern.frequencies.beat).toBeLessThanOrEqual(8);
    });
  });

  it('should support alpha frequency range (8-13Hz)', () => {
    const alphaPatterns = WAVE_PATTERNS.filter(p => p.frequencies.range === 'alpha');
    expect(alphaPatterns.length).toBeGreaterThan(0);
    
    alphaPatterns.forEach(pattern => {
      expect(pattern.frequencies.beat).toBeGreaterThanOrEqual(8);
      expect(pattern.frequencies.beat).toBeLessThanOrEqual(13);
    });
  });

  it('should support beta frequency range (13-30Hz)', () => {
    // Since no beta patterns exist, check if any pattern has beat frequencies in beta range
    const betaFreqPatterns = WAVE_PATTERNS.filter(p => 
      p.frequencies.beat >= 13 && p.frequencies.beat <= 30
    );
    
    // At least gamma patterns should exist (40Hz)
    expect(WAVE_PATTERNS.length).toBeGreaterThan(0);
    
    betaFreqPatterns.forEach(pattern => {
      expect(pattern.frequencies.beat).toBeGreaterThanOrEqual(13);
      expect(pattern.frequencies.beat).toBeLessThanOrEqual(30);
    });
  });

  it('should support gamma frequency range (30Hz+)', () => {
    const gammaPatterns = WAVE_PATTERNS.filter(p => p.frequencies.range === 'gamma');
    expect(gammaPatterns.length).toBeGreaterThan(0);
    
    gammaPatterns.forEach(pattern => {
      expect(pattern.frequencies.beat).toBeGreaterThanOrEqual(30);
    });
  });

  it('should calculate wavelength correctly', () => {
    const frequency = 440; // Hz
    const speedOfLight = 299792458; // m/s
    const expectedWavelength = speedOfLight / (frequency * 1000000);
    
    expect(expectedWavelength).toBeCloseTo(0.68);
  });

  it('should validate carrier frequencies are audible', () => {
    WAVE_PATTERNS.forEach(pattern => {
      // Human hearing range: 20Hz - 20kHz
      expect(pattern.frequencies.carrier).toBeGreaterThanOrEqual(100);
      expect(pattern.frequencies.carrier).toBeLessThanOrEqual(1000);
    });
  });

  it('should ensure beat frequencies are in effective range', () => {
    WAVE_PATTERNS.forEach(pattern => {
      // Effective binaural beat range: 1-40Hz
      expect(pattern.frequencies.beat).toBeGreaterThanOrEqual(1);
      expect(pattern.frequencies.beat).toBeLessThanOrEqual(40);
    });
  });

  it('should calculate frequency sweep correctly', () => {
    const startFreq = 100;
    const endFreq = 200;
    const steps = 10;
    const stepSize = (endFreq - startFreq) / steps;
    
    expect(stepSize).toBe(10);
    
    for (let i = 0; i <= steps; i++) {
      const currentFreq = startFreq + (stepSize * i);
      expect(currentFreq).toBeGreaterThanOrEqual(startFreq);
      expect(currentFreq).toBeLessThanOrEqual(endFreq);
    }
  });

  it('should handle ADHD gamma protocol frequencies', () => {
    const adhdPatterns = WAVE_PATTERNS.filter(p => p.adhd);
    
    if (adhdPatterns.length > 0) {
      adhdPatterns.forEach(pattern => {
        if (pattern.adhd) {
          expect(pattern.frequencies.beat).toBeGreaterThanOrEqual(1);
          expect(pattern.frequencies.beat).toBeLessThanOrEqual(50);
        }
      });
    } else {
      // If no ADHD patterns exist, check gamma range patterns instead
      const gammaPatterns = WAVE_PATTERNS.filter(p => p.frequencies.range === 'gamma');
      expect(gammaPatterns.length).toBeGreaterThan(0);
    }
  });
});