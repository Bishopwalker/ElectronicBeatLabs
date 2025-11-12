// Audio Analysis Hook - ANALYSIS ONLY, NO GENERATION
// Analyzes existing audio from the browser's audio output
// Does NOT create or control audio playback

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

// Visualization data interface
export interface AudioAnalysisData {
  spectrumData: number[];
  peakFrequencies: { frequency: number; amplitude: number }[];
  signalQuality: {
    snr: number; // Signal-to-noise ratio
    clarity: number; // How clear the signal is
  };
  timestamp: number;
}

export interface AudioAnalysisStats {
  totalUpdates: number;
  averageFps: number;
  lastUpdateTime: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface AudioAnalysisConfig {
  updateRate: number; // FPS for analysis updates (default: 20)
  enabled: boolean;
  audioContext?: AudioContext; // External AudioContext to analyze
  analyserNode?: AnalyserNode; // External AnalyserNode to use
}

/**
 * Hook for analyzing existing audio playback (READ-ONLY)
 * Does NOT generate or control audio
 * Only analyzes what's already playing through the browser
 *
 * @param config - Configuration options
 * @param config.audioContext - Optional external AudioContext (uses existing audio instead of creating new)
 * @param config.analyserNode - Optional external AnalyserNode (connects to existing audio graph)
 */
export const useAudioAnalysis = (config: Partial<AudioAnalysisConfig> = {}) => {
  // 🔥 CRITICAL FIX: Store external nodes in refs to prevent infinite loop
  // Don't memoize object references - they change every render!
  const externalAnalyserRef = useRef<AnalyserNode | null>(null);
  const externalContextRef = useRef<AudioContext | null>(null);

  // Update refs when external nodes change
  useEffect(() => {
    if (config.analyserNode) {
      externalAnalyserRef.current = config.analyserNode;
    }
    if (config.audioContext) {
      externalContextRef.current = config.audioContext;
    }
  }, [config.analyserNode, config.audioContext]);

  // 🔥 FIXED: Memoize ONLY primitive values, not object references
  const defaultConfig: AudioAnalysisConfig = useMemo(() => ({
    updateRate: config.updateRate ?? 60,
    enabled: config.enabled ?? true,
    audioContext: externalContextRef.current ?? undefined,
    analyserNode: externalAnalyserRef.current ?? undefined
  }), [config.updateRate, config.enabled]); // 🔥 ONLY primitives in deps!

  const [analysisData, setAnalysisData] = useState<AudioAnalysisData | null>(null);
  const [stats, setStats] = useState<AudioAnalysisStats>({
    totalUpdates: 0,
    averageFps: 0,
    lastUpdateTime: 0,
    dataQuality: 'poor'
  });

  // Audio analysis nodes (READ-ONLY)
  const analyser = useRef<AnalyserNode | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const totalUpdatesRef = useRef<number>(0); // 🔥 FIXED: Use ref to prevent infinite loop

  // Analyze audio spectrum
  const analyzeAudio = useCallback(() => {
    if (!analyser.current || !dataArray.current || !defaultConfig.enabled) {
      return null;
    }

    // Get frequency data
    analyser.current.getByteFrequencyData(dataArray.current);

    // Find peak frequencies
    const peakFrequencies: { frequency: number; amplitude: number }[] = [];
    const fftSize = analyser.current.fftSize;
    const sampleRate = audioContext.current?.sampleRate || 48000;
    const binWidth = sampleRate / fftSize;

    // Find top 5 peaks
    const peaks = Array.from(dataArray.current)
      .map((amplitude, index) => ({
        frequency: index * binWidth,
        amplitude: amplitude / 255
      }))
      .filter(p => p.amplitude > 0.1)
      .sort((a, b) => b.amplitude - a.amplitude)
      .slice(0, 5);

    peakFrequencies.push(...peaks);

    // Calculate signal quality
    const avgAmplitude = dataArray.current.reduce((sum, val) => sum + val, 0) / dataArray.current.length;
    const maxAmplitude = Math.max(...Array.from(dataArray.current));
    const snr = maxAmplitude > 0 ? 20 * Math.log10(maxAmplitude / (avgAmplitude + 0.001)) : 0;
    const clarity = avgAmplitude / 255;

    const newData: AudioAnalysisData = {
      spectrumData: Array.from(dataArray.current),
      peakFrequencies,
      signalQuality: {
        snr,
        clarity
      },
      timestamp: Date.now()
    };

    setAnalysisData(newData);

    // Update stats
    const now = Date.now();
    frameCount.current++;
    const elapsed = now - lastFrameTime.current;

    if (elapsed >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / elapsed);
      const quality: AudioAnalysisStats['dataQuality'] =
        snr > 40 ? 'excellent' :
        snr > 25 ? 'good' :
        snr > 10 ? 'fair' : 'poor';

      totalUpdatesRef.current += frameCount.current; // 🔥 FIXED: Update ref instead of state dependency

      setStats({
        totalUpdates: totalUpdatesRef.current,
        averageFps: fps,
        lastUpdateTime: now,
        dataQuality: quality
      });

      frameCount.current = 0;
      lastFrameTime.current = now;
    }

    return newData;
  }, [defaultConfig.enabled]); // 🔥 FIXED: Removed stats.totalUpdates from dependencies

  // Animation loop for analysis
  useEffect(() => {
    if (!defaultConfig.enabled) {
      return;
    }

    // 🔥 CRITICAL FIX: Use refs instead of config props to prevent infinite loop
    // Use external analyser if provided
    if (externalAnalyserRef.current) {
      analyser.current = externalAnalyserRef.current;
      audioContext.current = externalContextRef.current || null;

      const bufferLength = analyser.current.frequencyBinCount;
      dataArray.current = new Uint8Array(bufferLength);
    }

    if (!analyser.current) {
      return;
    }

    const targetInterval = 1000 / defaultConfig.updateRate;
    let lastUpdateTime = 0;

    const animate = (timestamp: number) => {
      if (!defaultConfig.enabled) {
        return;
      }

      const elapsed = timestamp - lastUpdateTime;
      if (elapsed >= targetInterval) {
        analyzeAudio();
        lastUpdateTime = timestamp;
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    lastFrameTime.current = Date.now();
    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [defaultConfig.enabled, defaultConfig.updateRate, analyzeAudio]); // 🔥 FIXED: Removed config props!

  return {
    analysisData,
    stats,
    isAnalyzing: defaultConfig.enabled && !!analyser.current
  };
};