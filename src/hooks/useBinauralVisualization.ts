// Unified Binaural Beat Visualization Hook
// Combines audio generation and visualization using existing types
// Single source of truth for all binaural visualization needs

import {useCallback, useEffect, useRef, useState} from 'react';
import type {BinauralBeatConfig, FrontendAudioEngineState} from '../types';
import {useBackendAudioEngine} from "./useBackendAudioEngine.ts";
import {useAudioEngine} from "./useAudioEngine.ts";

// Visualization data interface using existing patterns
interface VisualizationData {
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

interface VisualizationConfig {
  updateRate: number; // FPS for visualization updates (default: 60)
  enabled: boolean;
  showSpectrum: boolean;
  showPeaks: boolean;
  showAmplitudes: boolean;
}

interface VisualizationStats {
  totalUpdates: number;
  averageFps: number;
  lastUpdateTime: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export const useBinauralVisualization = (config: Partial<VisualizationConfig> = {}) => {
  const defaultConfig: VisualizationConfig = {
    updateRate: 60,
    enabled: true,
    showSpectrum: true,
    showPeaks: true,
    showAmplitudes: true,
    ...config
  };

  // State management using existing audio types
  const [audioState, setAudioState] = useState<FrontendAudioEngineState >({
    isPlaying: false,
    amplitude: 0.3,
    leftFreq: 440,
    rightFreq: 444,
    beat_frequency: 4,
    waveform: 'sine',
    gainL: null,
    gainR: null,
    oscillatorL: null,
    oscillatorR: null,
    context: null
  });

  const [visualizationData, setVisualizationData] = useState<VisualizationData | null>(null);
  const [stats, setStats] = useState<VisualizationStats>({
    totalUpdates: 0,
    averageFps: 0,
    lastUpdateTime: 0,
    dataQuality: 'poor'
  });

  // Audio nodes and analysis
  const analyser = useRef<AnalyserNode | null>(null);
  const merger = useRef<ChannelMergerNode | null>(null);
  const masterGain = useRef<GainNode | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);

  // Visualization timing
  const animationFrame = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const startTime = useRef<number>(Date.now());

  // Initialize audio context
  const initializeAudioContext = useCallback(async (): Promise<AudioContext | null> => {
    try {
      if (!audioState.context) {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioState(prev => ({ ...prev, context }));

        if (context.state === 'suspended') {
          await context.resume();
        }

        return context;
      }

      if (audioState.context.state === 'suspended') {
        await audioState.context.resume();
      }

      return audioState.context;
    } catch (error) {
      console.error('❌ BinauralVisualization: Failed to initialize audio context:', error);
      return null;
    }
  }, [audioState.context]);

  // Create analyser node
  const createAnalyser = useCallback((context: AudioContext) => {
    const analyserNode = context.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserNode.smoothingTimeConstant = 0.8;
    analyserNode.minDecibels = -90;
    analyserNode.maxDecibels = -10;

    const bufferLength = analyserNode.frequencyBinCount;
    dataArray.current = new Uint8Array(bufferLength);

    console.log('✅ BinauralVisualization: AnalyserNode created with', bufferLength, 'frequency bins');
    return analyserNode;
  }, []);

  // Enhanced peak detection
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
  const calculateSignalQuality = useCallback((data: VisualizationData): {
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

  // Detect peak frequencies
  const detectPeakFrequencies = useCallback((): { frequency: number; amplitude: number }[] => {
    if (!dataArray.current || !audioState.context || !analyser.current) return [];

    const peaks: { frequency: number; amplitude: number }[] = [];
    const minPeakHeight = 50;
    const sampleRate = audioState.context.sampleRate;
    const binFrequency = (sampleRate / 2) / analyser.current.frequencyBinCount;

    for (let i = 1; i < dataArray.current.length - 1; i++) {
      const current = dataArray.current[i];
      const prev = dataArray.current[i - 1];
      const next = dataArray.current[i + 1];

      if (current > minPeakHeight && current > prev && current > next) {
        const frequency = i * binFrequency;
        peaks.push({ frequency: Math.round(frequency * 10) / 10, amplitude: current });
      }
    }

    return peaks.sort((a, b) => b.amplitude - a.amplitude).slice(0, 10);
  }, [audioState.context]);

  // Get visualization data
  const getVisualizationData = useCallback((): VisualizationData | null => {
    if (!analyser.current || !dataArray.current || !audioState.context) return null;

    analyser.current.getByteFrequencyData(dataArray.current);
    const spectrumData = Array.from(dataArray.current);
    const peakFrequencies = detectPeakFrequencies();

    // Get actual amplitudes at target frequencies
    const binFrequency = (audioState.context.sampleRate / 2) / analyser.current.frequencyBinCount;
    const leftBin = Math.round(audioState.leftFreq / binFrequency);
    const rightBin = Math.round(audioState.rightFreq / binFrequency);

    const rawData: VisualizationData = {
      spectrumData,
      peakFrequencies,
      currentBeatFreq: audioState.beat_frequency,
      amplitudes: {
        left: dataArray.current[leftBin] || 0,
        right: dataArray.current[rightBin] || 0
      },
      targetFrequencies: {
        left: audioState.leftFreq,
        right: audioState.rightFreq
      },
      actualDetectedFrequencies: { left: null, right: null },
      signalQuality: { snr: 0, clarity: 0 },
      timestamp: Date.now()
    };

    // Enhance with detected frequencies and quality metrics
    rawData.actualDetectedFrequencies = findActualPlayedFrequencies(
        spectrumData,
        audioState.leftFreq,
        audioState.rightFreq,
        audioState.context.sampleRate
    );
    rawData.signalQuality = calculateSignalQuality(rawData);

    return rawData;
  }, [audioState, detectPeakFrequencies, findActualPlayedFrequencies, calculateSignalQuality]);

  // Main visualization update loop
  const updateVisualization = useCallback(() => {
    if (!defaultConfig.enabled) return;

    const now = performance.now();
    const deltaTime = now - lastUpdateTime.current;
    const targetFrameTime = 1000 / defaultConfig.updateRate;

    // Throttle updates to target frame rate
    if (deltaTime < targetFrameTime) {
      animationFrame.current = requestAnimationFrame(updateVisualization);
      return;
    }

    const data = getVisualizationData();
    if (data) {
      setVisualizationData(data);

      // Update performance stats
      frameCount.current++;
      const totalTime = (now - startTime.current) / 1000;
      const currentFps = frameCount.current / totalTime;

      // Determine data quality
      const quality = data.signalQuality.snr > 20 ? 'excellent' :
                     data.signalQuality.snr > 15 ? 'good' :
                     data.signalQuality.snr > 10 ? 'fair' : 'poor';

      setStats({
        totalUpdates: frameCount.current,
        averageFps: Math.round(currentFps * 10) / 10,
        lastUpdateTime: now,
        dataQuality: quality
      });
    }

    lastUpdateTime.current = now;
    animationFrame.current = requestAnimationFrame(updateVisualization);
  }, [defaultConfig.enabled, defaultConfig.updateRate, getVisualizationData]);

  // Start/stop visualization
  const startVisualization = useCallback(() => {
    if (!animationFrame.current) {
      startTime.current = Date.now();
      frameCount.current = 0;
      lastUpdateTime.current = 0;
      animationFrame.current = requestAnimationFrame(updateVisualization);
      console.log('✅ BinauralVisualization: Started at', defaultConfig.updateRate, 'FPS');
    }
  }, [updateVisualization, defaultConfig.updateRate]);

  const stopVisualization = useCallback(() => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
      console.log('✅ BinauralVisualization: Stopped');
    }
  }, []);

  // Create binaural beats using BinauralBeatConfig
  const createBinauralBeats = useCallback(async (config: BinauralBeatConfig): Promise<boolean> => {
    const context = await initializeAudioContext();
    if (!context) return false;

    try {
      // Stop any existing audio

      setAudioState(prev => ({
        ...prev,
        isPlaying: false
      }));

      // Create analyser if needed
      if (!analyser.current) {
        analyser.current = createAnalyser(context);
      }

      // Create audio nodes
      const oscillatorL = context.createOscillator();
      const oscillatorR = context.createOscillator();
      const gainL = context.createGain();
      const gainR = context.createGain();
      const channelMerger = context.createChannelMerger(2);
      const masterGainNode = context.createGain();

      // Calculate frequencies using BinauralBeatConfig standard
      const leftFreq = config.baseFrequency;
      const rightFreq = config.baseFrequency + config.beat_frequency;

      // Configure oscillators
      oscillatorL.frequency.setValueAtTime(leftFreq, context.currentTime);
      oscillatorR.frequency.setValueAtTime(rightFreq, context.currentTime);
      oscillatorL.type = config.waveform;
      oscillatorR.type = config.waveform;

      // Configure gains
      gainL.gain.setValueAtTime(config.amplitude, context.currentTime);
      gainR.gain.setValueAtTime(config.amplitude, context.currentTime);
      masterGainNode.gain.setValueAtTime(1.0, context.currentTime);

      // Connect audio graph
      oscillatorL.connect(gainL);
      oscillatorR.connect(gainR);
      gainL.connect(channelMerger, 0, 0);
      gainR.connect(channelMerger, 0, 1);
      channelMerger.connect(masterGainNode);
      masterGainNode.connect(analyser.current);
      analyser.current.connect(context.destination);

      // Start oscillators
      oscillatorL.start();
      oscillatorR.start();

      // Update state
      setAudioState(prev => ({
        ...prev,
        isPlaying: true,
        amplitude: config.amplitude,
        leftFreq,
        rightFreq,
        beat_frequency: config.beat_frequency,
        waveform: config.waveform,
        gainL,
        gainR,
        oscillatorL,
        oscillatorR,
        context
      }));

      // Store references
      merger.current = channelMerger;
      masterGain.current = masterGainNode;

      console.log('✅ BinauralVisualization: Created binaural beats -',
                  'Left:', leftFreq, 'Hz, Right:', rightFreq, 'Hz, Beat:', config.beat_frequency, 'Hz');

      // Start visualization
      startVisualization();

      return true;
    } catch (error) {
      console.error('❌ BinauralVisualization: Failed to create binaural beats:', error);
      return false;
    }
  }, [initializeAudioContext, createAnalyser, startVisualization]);

  // // Stop binaural beats
  // const stopBinauralBeats = useCallback(() => {
  //   try {
  //     // Stop oscillators
  //     if (audioState.oscillatorL) {
  //       audioState.oscillatorL.stop();
  //       audioState.oscillatorL.disconnect();
  //     }
  //     if (audioState.oscillatorR) {
  //       audioState.oscillatorR.stop();
  //       audioState.oscillatorR.disconnect();
  //     }
  //
  //     // Disconnect gains
  //     if (audioState.gainL) audioState.gainL.disconnect();
  //     if (audioState.gainR) audioState.gainR.disconnect();
  //     if (merger.current) merger.current.disconnect();
  //     if (masterGain.current) masterGain.current.disconnect();
  //
  //     // Reset state
  //     setAudioState(prev => ({
  //       ...prev,
  //       isPlaying: false,
  //       gainL: null,
  //       gainR: null,
  //       oscillatorL: null,
  //       oscillatorR: null
  //     }));
  //
  //     // Stop visualization
  //     stopVisualization();
  //
  //     console.log('✅ BinauralVisualization: Stopped and cleaned up');
  //   } catch (error) {
  //     console.error('❌ BinauralVisualization: Error during cleanup:', error);
  //   }
  // }, [ stopVisualization]);

  // Update frequencies using BinauralBeatConfig pattern
  const updateFrequencies = useCallback((base_frequency: number, beat_frequency: number) => {
    if (audioState.oscillatorL && audioState.oscillatorR && audioState.context) {
      const leftFreq = base_frequency;
      const rightFreq = base_frequency + beat_frequency;
      const currentTime = audioState.context.currentTime;

      audioState.oscillatorL.frequency.setValueAtTime(leftFreq, currentTime);
      audioState.oscillatorR.frequency.setValueAtTime(rightFreq, currentTime);

      setAudioState(prev => ({
        ...prev,
        leftFreq,
        rightFreq,
        beat_frequency
      }));

      console.log('🔄 BinauralVisualization: Frequencies updated -',
                  'Base:', base_frequency, 'Hz, Beat:', beat_frequency, 'Hz');
    }
  }, [audioState]);

  // Update amplitude
  const updateAmplitude = useCallback((amplitude: number) => {
    if (audioState.gainL && audioState.gainR && audioState.context) {
      const currentTime = audioState.context.currentTime;

      audioState.gainL.gain.setValueAtTime(amplitude, currentTime);
      audioState.gainR.gain.setValueAtTime(amplitude, currentTime);

      setAudioState(prev => ({
        ...prev,
        amplitude
      }));
    }
  }, [audioState]);

  // // Cleanup on unmount
  // useEffect(() => {
  //   return () => {
  //     stopBinauralBeats();
  //   };
  
   // }, [stopBinauralBeats]);

  // Auto-start visualization when enabled
  useEffect(() => {
    if (defaultConfig.enabled && audioState.isPlaying) {
      startVisualization();
    } else {
      stopVisualization();
    }

    return stopVisualization;
  }, [defaultConfig.enabled, audioState.isPlaying, startVisualization, stopVisualization]);

  return {
    // Audio state using existing types
    audioState,

    // Visualization data and stats
    visualizationData,
    stats,

    // Audio control methods using BinauralBeatConfig
    createBinauralBeats,
    stopBinauralBeats,
    updateFrequencies,
    updateAmplitude,

    // Visualization control
    startVisualization,
    stopVisualization,
    getVisualizationData,

    // Status
    isPlaying: audioState.isPlaying,
    isVisualizationRunning: animationFrame.current !== null,
    isSupported: !!(window.AudioContext || (window as any).webkitAudioContext)
  };
};