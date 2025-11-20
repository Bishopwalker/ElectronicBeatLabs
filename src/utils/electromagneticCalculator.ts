// Electromagnetic Field Calculator - Dynamic values from audio analysis
// Calculates real-time electromagnetic field properties based on actual audio output

import type { AudioAnalysisData } from '../hooks/useAudioAnalysis';
import type { ElectromagneticField } from '../types';

/**
 * Calculate electromagnetic field strength from audio spectrum
 * Higher amplitude = stronger field
 */
export const calculateFieldStrength = (spectrumData: number[]): number => {
  if (!spectrumData || spectrumData.length === 0) return 0;

  // Calculate RMS (Root Mean Square) of spectrum for field strength
  const sumSquares = spectrumData.reduce((sum, value) => sum + (value / 255) ** 2, 0);
  const rms = Math.sqrt(sumSquares / spectrumData.length);

  // Normalize to 0-1 range with slight boost for visibility
  return Math.min(rms * 1.5, 1.0);
};

/**
 * Calculate electromagnetic coherence from signal quality
 * Higher SNR and clarity = better coherence
 */
export const calculateCoherence = (analysisData: AudioAnalysisData | null): number => {
  if (!analysisData) return 0;

  const { signalQuality } = analysisData;

  // Coherence based on signal-to-noise ratio and clarity
  const snrFactor = Math.min(signalQuality.snr / 100, 1.0); // Normalize SNR
  const clarityFactor = signalQuality.clarity;

  // Weighted average (60% clarity, 40% SNR)
  return (clarityFactor * 0.6 + snrFactor * 0.4);
};

/**
 * Calculate resonance frequency from peak frequencies
 * Dominant frequency becomes the resonance frequency
 */
export const calculateResonanceFreq = (analysisData: AudioAnalysisData | null, beatFrequency: number): number => {
  if (!analysisData || !analysisData.peakFrequencies.length) {
    return beatFrequency; // Fallback to beat frequency
  }

  // Get the strongest peak frequency
  const dominantPeak = analysisData.peakFrequencies[0];

  // If peak is in binaural range (< 100 Hz), use it
  // Otherwise use the beat frequency
  return dominantPeak.frequency < 100 ? dominantPeak.frequency : beatFrequency;
};

/**
 * Calculate field stability from signal consistency
 * Measures how stable the signal is over time
 */
export const calculateStability = (spectrumData: number[]): number => {
  if (!spectrumData || spectrumData.length === 0) return 0;

  // Calculate standard deviation (lower = more stable)
  const mean = spectrumData.reduce((sum, val) => sum + val, 0) / spectrumData.length;
  const variance = spectrumData.reduce((sum, val) => sum + (val - mean) ** 2, 0) / spectrumData.length;
  const stdDev = Math.sqrt(variance);

  // Normalize: high stability = low std dev
  // Map std dev (0-255 range) to stability (1-0 range)
  const normalizedStdDev = stdDev / 255;
  return Math.max(0, 1 - normalizedStdDev);
};

/**
 * Determine electromagnetic state from beat frequency
 * Maps frequency ranges to descriptive states
 */
export const calculateElectromagneticState = (beatFrequency: number, isPlaying: boolean): ElectromagneticField['state'] => {
  if (!isPlaying) return 'INACTIVE';

  // Delta (0.5-4 Hz)
  if (beatFrequency <= 4) return 'CHARGING';

  // Theta (4-8 Hz)
  if (beatFrequency <= 8) return 'ACTIVE';

  // Alpha (8-13 Hz)
  if (beatFrequency <= 13) return 'RESONANT';

  // Beta (13-30 Hz)
  if (beatFrequency <= 30) return 'CRITICAL';

  // Gamma (30+ Hz)
  return 'RESONANT';
};

/**
 * Main function: Calculate complete electromagnetic field from audio analysis
 * This replaces all hardcoded values with real-time audio data
 */
export const calculateElectromagneticField = (
  analysisData: AudioAnalysisData | null,
  beatFrequency: number,
  isPlaying: boolean
): ElectromagneticField => {
  // If no audio or not playing, return inactive state
  if (!analysisData || !isPlaying) {
    return {
      strength: 0,
      frequency: 0,
      phase: 0,
      coherence: 0,
      resonance: 0,
      state: 'INACTIVE',
      stability: 0
    };
  }

  // Calculate all properties from real audio data
  const strength = calculateFieldStrength(analysisData.spectrumData);
  const coherence = calculateCoherence(analysisData);
  const resonanceFreq = calculateResonanceFreq(analysisData, beatFrequency);
  const stability = calculateStability(analysisData.spectrumData);
  const state = calculateElectromagneticState(beatFrequency, isPlaying);

  // Resonance is the product of strength and coherence
  const resonance = strength * coherence;

  // Phase calculated from timestamp (smooth cycling 0-2π)
  const phase = (analysisData.timestamp % 2000) / 2000 * (2 * Math.PI);

  return {
    strength,
    frequency: resonanceFreq,
    phase,
    coherence,
    resonance,
    state,
    stability
  };
};

/**
 * Get electromagnetic field description for UI display
 */
export const getElectromagneticDescription = (field: ElectromagneticField): string => {
  if (field.state === 'INACTIVE') {
    return 'No electromagnetic field detected';
  }

  const qualityLevel = field.coherence > 0.8 ? 'Excellent' :
                       field.coherence > 0.6 ? 'Good' :
                       field.coherence > 0.4 ? 'Fair' : 'Poor';

  const strengthLevel = field.strength > 0.8 ? 'Strong' :
                        field.strength > 0.6 ? 'Moderate' :
                        field.strength > 0.4 ? 'Weak' : 'Very Weak';

  return `${strengthLevel} field (${qualityLevel} coherence) - ${field.state}`;
};

export default {
  calculateFieldStrength,
  calculateCoherence,
  calculateResonanceFreq,
  calculateStability,
  calculateElectromagneticState,
  calculateElectromagneticField,
  getElectromagneticDescription
};
