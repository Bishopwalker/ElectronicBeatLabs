// Dynamic Electromagnetic Field Hook
// Replaces hardcoded pattern values with real-time audio analysis

import { useEffect, useState } from 'react';
import { useAudioAnalysis } from './useAudioAnalysis';
import { calculateElectromagneticField } from '../utils/electromagneticCalculator';
import type { ElectromagneticField } from '../types';

interface UseDynamicElectromagneticFieldProps {
  beatFrequency: number;
  isPlaying: boolean;
  audioContext?: AudioContext | null;
  analyserNode?: AnalyserNode | null;
  updateRate?: number;
}

/**
 * Hook that provides real-time electromagnetic field data based on actual audio analysis
 * Replaces hardcoded pattern values with dynamic calculations
 *
 * @example
 * ```tsx
 * const { electromagnetic, analysisData } = useDynamicElectromagneticField({
 *   beatFrequency: 10,
 *   isPlaying: true,
 *   audioContext: myAudioContext,
 *   analyserNode: myAnalyser
 * });
 * ```
 */
export const useDynamicElectromagneticField = ({
  beatFrequency,
  isPlaying,
  audioContext,
  analyserNode,
  updateRate = 60
}: UseDynamicElectromagneticFieldProps) => {
  // Get real-time audio analysis data
  const { analysisData, stats, isAnalyzing } = useAudioAnalysis({
    updateRate,
    enabled: isPlaying,
    audioContext: audioContext ?? undefined,
    analyserNode: analyserNode ?? undefined
  });

  // Calculate electromagnetic field from audio analysis
  const [electromagnetic, setElectromagnetic] = useState<ElectromagneticField>({
    strength: 0,
    frequency: 0,
    phase: 0,
    coherence: 0,
    resonance: 0,
    state: 'INACTIVE',
    stability: 0
  });

  // Update electromagnetic field when analysis data changes
  useEffect(() => {
    const field = calculateElectromagneticField(
      analysisData,
      beatFrequency,
      isPlaying
    );

    setElectromagnetic(field);
  }, [analysisData, beatFrequency, isPlaying]);

  return {
    electromagnetic,
    analysisData,
    stats,
    isAnalyzing
  };
};

export default useDynamicElectromagneticField;
