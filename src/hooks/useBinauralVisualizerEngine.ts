import { useState, useCallback, useRef, useEffect } from 'react';

interface FrequencyVisualizationData {
  spectrumData: number[];
  peakFrequencies: { frequency: number; amplitude: number }[];
  currentBeatFreq: number;
  amplitudes: {
    left: number;
    right: number;
  };
  timestamp: number;
}

interface BinauralConfig {
  leftFreq: number;
  rightFreq: number;
  amplitude: number;
  waveform: 'sine' | 'square' | 'sawtooth' | 'triangle';
}

interface VisualizerEngineState {
  isPlaying: boolean;
  leftFreq: number;
  rightFreq: number;
  beatFreq: number;
  amplitude: number;
  waveform: 'sine' | 'square' | 'sawtooth' | 'triangle';
}

export const useBinauralVisualizerEngine = () => {
  const [state, setState] = useState<VisualizerEngineState>({
    isPlaying: false,
    leftFreq: 440,
    rightFreq: 444,
    beatFreq: 4,
    amplitude: 0.3,
    waveform: 'sine'
  });

  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const leftOscillator = useRef<OscillatorNode | null>(null);
  const rightOscillator = useRef<OscillatorNode | null>(null);
  const leftGain = useRef<GainNode | null>(null);
  const rightGain = useRef<GainNode | null>(null);
  const merger = useRef<ChannelMergerNode | null>(null);
  const masterGain = useRef<GainNode | null>(null);
  
  const dataArray = useRef<Uint8Array | null>(null);
  const animationFrame = useRef<number | null>(null);

  const initializeAudioContext = useCallback(async (): Promise<boolean> => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }

      return true;
    } catch (error) {
      console.error('❌ BinauralVisualizerEngine: Failed to initialize audio context:', error);
      return false;
    }
  }, []);

  const createAnalyser = useCallback(() => {
    if (!audioContext.current) return null;

    const analyserNode = audioContext.current.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserNode.smoothingTimeConstant = 0.8;
    analyserNode.minDecibels = -90;
    analyserNode.maxDecibels = -10;
    
    const bufferLength = analyserNode.frequencyBinCount;
    dataArray.current = new Uint8Array(bufferLength);
    
    console.log('✅ BinauralVisualizerEngine: AnalyserNode created with', bufferLength, 'frequency bins');
    return analyserNode;
  }, []);

  const createBinauralBeats = useCallback(async (config: BinauralConfig) => {
    if (!audioContext.current) {
      const initialized = await initializeAudioContext();
      if (!initialized) return false;
    }

    try {
      stopBinauralBeats();

      if (!analyser.current) {
        analyser.current = createAnalyser();
        if (!analyser.current) return false;
      }

      leftOscillator.current = audioContext.current!.createOscillator();
      rightOscillator.current = audioContext.current!.createOscillator();
      leftGain.current = audioContext.current!.createGain();
      rightGain.current = audioContext.current!.createGain();
      merger.current = audioContext.current!.createChannelMerger(2);
      masterGain.current = audioContext.current!.createGain();

      leftOscillator.current.frequency.setValueAtTime(config.leftFreq, audioContext.current!.currentTime);
      rightOscillator.current.frequency.setValueAtTime(config.rightFreq, audioContext.current!.currentTime);
      
      leftOscillator.current.type = config.waveform;
      rightOscillator.current.type = config.waveform;

      leftGain.current.gain.setValueAtTime(config.amplitude, audioContext.current!.currentTime);
      rightGain.current.gain.setValueAtTime(config.amplitude, audioContext.current!.currentTime);
      masterGain.current.gain.setValueAtTime(1.0, audioContext.current!.currentTime);

      leftOscillator.current.connect(leftGain.current);
      rightOscillator.current.connect(rightGain.current);
      
      leftGain.current.connect(merger.current, 0, 0);
      rightGain.current.connect(merger.current, 0, 1);
      
      merger.current.connect(masterGain.current);
      masterGain.current.connect(analyser.current);
      analyser.current.connect(audioContext.current!.destination);

      leftOscillator.current.start();
      rightOscillator.current.start();

      setState(prev => ({
        ...prev,
        isPlaying: true,
        leftFreq: config.leftFreq,
        rightFreq: config.rightFreq,
        beatFreq: Math.abs(config.rightFreq - config.leftFreq),
        amplitude: config.amplitude,
        waveform: config.waveform
      }));

      console.log('✅ BinauralVisualizerEngine: Binaural beats started -', 
                  'Left:', config.leftFreq, 'Hz, Right:', config.rightFreq, 'Hz, Beat:', 
                  Math.abs(config.rightFreq - config.leftFreq), 'Hz');

      return true;
    } catch (error) {
      console.error('❌ BinauralVisualizerEngine: Failed to create binaural beats:', error);
      return false;
    }
  }, [initializeAudioContext, createAnalyser]);

  const stopBinauralBeats = useCallback(() => {
    try {
      if (leftOscillator.current) {
        leftOscillator.current.stop();
        leftOscillator.current.disconnect();
        leftOscillator.current = null;
      }
      
      if (rightOscillator.current) {
        rightOscillator.current.stop();
        rightOscillator.current.disconnect();
        rightOscillator.current = null;
      }

      if (leftGain.current) {
        leftGain.current.disconnect();
        leftGain.current = null;
      }
      
      if (rightGain.current) {
        rightGain.current.disconnect();
        rightGain.current = null;
      }
      
      if (merger.current) {
        merger.current.disconnect();
        merger.current = null;
      }
      
      if (masterGain.current) {
        masterGain.current.disconnect();
        masterGain.current = null;
      }

      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }

      setState(prev => ({
        ...prev,
        isPlaying: false
      }));

      console.log('✅ BinauralVisualizerEngine: Binaural beats stopped and cleaned up');
    } catch (error) {
      console.error('❌ BinauralVisualizerEngine: Error during cleanup:', error);
    }
  }, []);

  const getFrequencyBin = useCallback((frequency: number): number => {
    if (!audioContext.current || !analyser.current) return 0;
    return Math.round(frequency * analyser.current.frequencyBinCount / (audioContext.current.sampleRate / 2));
  }, []);

  const detectPeakFrequencies = useCallback((): { frequency: number; amplitude: number }[] => {
    if (!dataArray.current || !audioContext.current || !analyser.current) return [];

    const peaks: { frequency: number; amplitude: number }[] = [];
    const minPeakHeight = 50;
    const sampleRate = audioContext.current.sampleRate;
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
  }, []);

  const getVisualizationData = useCallback((): FrequencyVisualizationData | null => {
    if (!analyser.current || !dataArray.current) return null;

    analyser.current.getByteFrequencyData(dataArray.current);

    const leftBin = getFrequencyBin(state.leftFreq);
    const rightBin = getFrequencyBin(state.rightFreq);

    return {
      spectrumData: Array.from(dataArray.current),
      peakFrequencies: detectPeakFrequencies(),
      currentBeatFreq: state.beatFreq,
      amplitudes: {
        left: dataArray.current[leftBin],
        right: dataArray.current[rightBin]
      },
      timestamp: Date.now()
    };
  }, [state.leftFreq, state.rightFreq, state.beatFreq, getFrequencyBin, detectPeakFrequencies]);

  const updateFrequencies = useCallback((leftFreq: number, rightFreq: number) => {
    if (leftOscillator.current && rightOscillator.current && audioContext.current) {
      const currentTime = audioContext.current.currentTime;
      
      leftOscillator.current.frequency.setValueAtTime(leftFreq, currentTime);
      rightOscillator.current.frequency.setValueAtTime(rightFreq, currentTime);
      
      setState(prev => ({
        ...prev,
        leftFreq,
        rightFreq,
        beatFreq: Math.abs(rightFreq - leftFreq)
      }));

      console.log('🔄 BinauralVisualizerEngine: Frequencies updated -', 
                  'Left:', leftFreq, 'Hz, Right:', rightFreq, 'Hz, Beat:', 
                  Math.abs(rightFreq - leftFreq), 'Hz');
    }
  }, []);

  const transitionFrequencies = useCallback((
    targetLeftFreq: number, 
    targetRightFreq: number, 
    transitionDuration: number = 2.0
  ) => {
    if (!leftOscillator.current || !rightOscillator.current || !audioContext.current) return;

    const currentTime = audioContext.current.currentTime;
    const endTime = currentTime + transitionDuration;

    // Smooth exponential ramp to new frequencies
    leftOscillator.current.frequency.exponentialRampToValueAtTime(targetLeftFreq, endTime);
    rightOscillator.current.frequency.exponentialRampToValueAtTime(targetRightFreq, endTime);

    setState(prev => ({
      ...prev,
      leftFreq: targetLeftFreq,
      rightFreq: targetRightFreq,
      beatFreq: Math.abs(targetRightFreq - targetLeftFreq)
    }));

    console.log('🌊 BinauralVisualizerEngine: Smooth transition started -', 
                'Left:', state.leftFreq, '→', targetLeftFreq, 'Hz,',
                'Right:', state.rightFreq, '→', targetRightFreq, 'Hz,',
                'Duration:', transitionDuration, 'seconds');
  }, [state.leftFreq, state.rightFreq]);

  const updateAmplitude = useCallback((amplitude: number) => {
    if (leftGain.current && rightGain.current && audioContext.current) {
      const currentTime = audioContext.current.currentTime;
      
      leftGain.current.gain.setValueAtTime(amplitude, currentTime);
      rightGain.current.gain.setValueAtTime(amplitude, currentTime);
      
      setState(prev => ({
        ...prev,
        amplitude
      }));
    }
  }, []);

  useEffect(() => {
    return () => {
      stopBinauralBeats();
    };
  }, [stopBinauralBeats]);

  return {
    state,
    createBinauralBeats,
    stopBinauralBeats,
    updateFrequencies,
    transitionFrequencies,
    updateAmplitude,
    getVisualizationData,
    isSupported: !!(window.AudioContext || (window as any).webkitAudioContext)
  };
};