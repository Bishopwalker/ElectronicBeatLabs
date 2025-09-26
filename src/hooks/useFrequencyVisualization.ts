import { useState, useCallback, useRef, useEffect } from 'react';

interface VisualizationConfig {
  updateRate: number; // FPS for visualization updates (default: 60)
  enabled: boolean;
  showSpectrum: boolean;
  showPeaks: boolean;
  showAmplitudes: boolean;
}

interface FrequencyVisualizationData {
  spectrumData: number[];
  peakFrequencies: { frequency: number; amplitude: number }[];
  currentBeatFreq: number;
  amplitudes: {
    left: number;
    right: number;
  };
  targetFrequencies: {
    left: number;
    right: number;
  };
  actualDetectedFrequencies: {
    left: number | null;
    right: number | null;
  };
  signalQuality: {
    snr: number; // Signal-to-noise ratio
    clarity: number; // How clear the binaural beat is
  };
  timestamp: number;
}

interface VisualizationStats {
  totalUpdates: number;
  averageFps: number;
  lastUpdateTime: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export const useFrequencyVisualization = (
  getVisualizationData: (() => FrequencyVisualizationData | null) | null,
  config: Partial<VisualizationConfig> = {}
) => {
  const defaultConfig: VisualizationConfig = {
    updateRate: 60,
    enabled: true,
    showSpectrum: true,
    showPeaks: true,
    showAmplitudes: true,
    ...config
  };

  const [visualizationData, setVisualizationData] = useState<FrequencyVisualizationData | null>(null);
  const [stats, setStats] = useState<VisualizationStats>({
    totalUpdates: 0,
    averageFps: 0,
    lastUpdateTime: 0,
    dataQuality: 'poor'
  });

  const animationFrame = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const startTime = useRef<number>(Date.now());

  // Enhanced peak detection with better accuracy
  const findActualPlayedFrequencies = useCallback((
    spectrumData: number[], 
    targetLeft: number, 
    targetRight: number,
    sampleRate: number = 44100,
    fftSize: number = 2048
  ): { left: number | null; right: number | null } => {
    
    const binFrequency = (sampleRate / 2) / (fftSize / 2);
    const searchRange = 5; // Search within ±5 Hz of target
    
    const findNearbyPeak = (targetFreq: number): number | null => {
      const targetBin = Math.round(targetFreq / binFrequency);
      const searchBins = Math.round(searchRange / binFrequency);
      
      let maxAmplitude = 0;
      let peakBin = -1;
      
      for (let i = Math.max(0, targetBin - searchBins); 
           i <= Math.min(spectrumData.length - 1, targetBin + searchBins); 
           i++) {
        if (spectrumData[i] > maxAmplitude) {
          maxAmplitude = spectrumData[i];
          peakBin = i;
        }
      }
      
      // Only return if amplitude is significant (above noise floor)
      if (maxAmplitude > 30) {
        return Math.round(peakBin * binFrequency * 10) / 10;
      }
      
      return null;
    };

    return {
      left: findNearbyPeak(targetLeft),
      right: findNearbyPeak(targetRight)
    };
  }, []);

  // Calculate signal quality metrics
  const calculateSignalQuality = useCallback((data: FrequencyVisualizationData): {
    snr: number;
    clarity: number;
  } => {
    const { spectrumData, amplitudes } = data;
    
    // Calculate noise floor (average of low-amplitude bins)
    const noiseFloor = spectrumData
      .filter(amplitude => amplitude < 20)
      .reduce((sum, amp) => sum + amp, 0) / spectrumData.length;
    
    // Signal strength is the average of left and right amplitudes
    const signalStrength = (amplitudes.left + amplitudes.right) / 2;
    
    // SNR calculation
    const snr = signalStrength > 0 ? 20 * Math.log10(signalStrength / (noiseFloor || 1)) : 0;
    
    // Clarity based on how distinct the binaural peaks are
    const peakAmplitudes = data.peakFrequencies.slice(0, 2).map(p => p.amplitude);
    const clarity = peakAmplitudes.length === 2 ? 
      Math.min(100, (peakAmplitudes[0] + peakAmplitudes[1]) / 2) / 100 : 0;
    
    return {
      snr: Math.round(snr * 10) / 10,
      clarity: Math.round(clarity * 100) / 100
    };
  }, []);

  // Main update loop
  const updateVisualization = useCallback(() => {
    if (!defaultConfig.enabled || !getVisualizationData) return;

    const now = performance.now();
    const deltaTime = now - lastUpdateTime.current;
    const targetFrameTime = 1000 / defaultConfig.updateRate;

    // Throttle updates to target frame rate
    if (deltaTime < targetFrameTime) {
      animationFrame.current = requestAnimationFrame(updateVisualization);
      return;
    }

    const rawData = getVisualizationData();
    if (!rawData) {
      animationFrame.current = requestAnimationFrame(updateVisualization);
      return;
    }

    // Enhance the data with actual detected frequencies
    const actualFrequencies = findActualPlayedFrequencies(
      rawData.spectrumData,
      rawData.amplitudes.left > 0 ? 
        rawData.spectrumData.indexOf(Math.max(...rawData.spectrumData.slice(0, 100))) * (44100 / 2048) : 0,
      rawData.amplitudes.right > 0 ? 
        rawData.spectrumData.indexOf(Math.max(...rawData.spectrumData.slice(0, 100))) * (44100 / 2048) : 0
    );

    const enhancedData: FrequencyVisualizationData = {
      ...rawData,
      targetFrequencies: {
        left: rawData.amplitudes.left,
        right: rawData.amplitudes.right
      },
      actualDetectedFrequencies: actualFrequencies,
      signalQuality: calculateSignalQuality(rawData)
    };

    setVisualizationData(enhancedData);

    // Update performance stats
    frameCount.current++;
    const totalTime = (now - startTime.current) / 1000;
    const currentFps = frameCount.current / totalTime;

    // Determine data quality
    const quality = enhancedData.signalQuality.snr > 20 ? 'excellent' :
                   enhancedData.signalQuality.snr > 15 ? 'good' :
                   enhancedData.signalQuality.snr > 10 ? 'fair' : 'poor';

    setStats({
      totalUpdates: frameCount.current,
      averageFps: Math.round(currentFps * 10) / 10,
      lastUpdateTime: now,
      dataQuality: quality
    });

    lastUpdateTime.current = now;
    animationFrame.current = requestAnimationFrame(updateVisualization);
  }, [defaultConfig.enabled, defaultConfig.updateRate, getVisualizationData, 
      findActualPlayedFrequencies, calculateSignalQuality]);

  // Start/stop visualization
  const startVisualization = useCallback(() => {
    if (!animationFrame.current) {
      startTime.current = Date.now();
      frameCount.current = 0;
      lastUpdateTime.current = 0;
      animationFrame.current = requestAnimationFrame(updateVisualization);
      console.log('✅ FrequencyVisualization: Started at', defaultConfig.updateRate, 'FPS');
    }
  }, [updateVisualization, defaultConfig.updateRate]);

  const stopVisualization = useCallback(() => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
      console.log('✅ FrequencyVisualization: Stopped');
    }
  }, []);

  // Auto-start when data source becomes available
  useEffect(() => {
    if (defaultConfig.enabled && getVisualizationData) {
      startVisualization();
    } else {
      stopVisualization();
    }

    return stopVisualization;
  }, [defaultConfig.enabled, getVisualizationData, startVisualization, stopVisualization]);

  return {
    visualizationData,
    stats,
    startVisualization,
    stopVisualization,
    isRunning: animationFrame.current !== null
  };
};