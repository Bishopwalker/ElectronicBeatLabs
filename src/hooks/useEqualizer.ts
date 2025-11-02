// Electromagnetic Beat Lab - Enhanced Equalizer Hook
// Professional multi-band audio equalization with advanced features
// ENHANCED: Added waveform, modulation, spatial effects, and per-band amplification

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  EqualizerBand,
  EqualizerState,
  EnhancedEqualizerState,
  EnhancedEqualizerBand,
  ModulatorConfig,
  FrequencyVector,
  AmplifierBandConfig,
  SpatialEffectMode,
  WaveForm
} from '../types';

// Default modulator configuration
const DEFAULT_MODULATOR: ModulatorConfig = {
  enabled: false,
  type: 'none',
  rate: 1.0, // 1 Hz
  depth: 0.5, // 50% modulation depth
  waveform: 'sine',
  sync: false
};

// Default frequency vector (3D spatial positioning)
const DEFAULT_FREQUENCY_VECTOR: FrequencyVector = {
  enabled: false,
  position: { x: 0, y: 0, z: 0 },
  pan: 0, // Center
  phase: 0, // No phase offset
  spread: 1.0 // Full width
};

// Default amplifier configuration
const DEFAULT_AMPLIFIER: AmplifierBandConfig = {
  enabled: false,
  gain: 1.0, // Unity gain
  saturation: 0, // No saturation
  width: 1.0, // Normal width
  compress: false,
  threshold: -24, // -24 dB threshold
  ratio: 4 // 4:1 ratio
};

// Equalizer presets - shorter names for compact UI
export const EQ_PRESETS = {
  flat: {
    name: 'Flat',
    description: 'No equalization',
    gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  bassBoost: {
    name: 'Bass',
    description: 'Enhanced low frequencies',
    gains: [8, 6, 4, 2, 0, 0, 0, 0, 0, 0]
  },
  trebleBoost: {
    name: 'Treble',
    description: 'Enhanced high frequencies',
    gains: [0, 0, 0, 0, 0, 2, 4, 6, 8, 10]
  },
  vocal: {
    name: 'Vocal',
    description: 'Enhanced vocal clarity',
    gains: [-2, -2, 0, 2, 4, 4, 2, 0, -2, -2]
  },
  meditation: {
    name: 'Meditate',
    description: 'Smooth, warm sound for meditation',
    gains: [4, 3, 2, 1, 0, -1, -2, -3, -4, -5]
  },
  focus: {
    name: 'Focus',
    description: 'Clear, balanced sound for concentration',
    gains: [-2, -1, 0, 1, 2, 2, 1, 0, -1, -2]
  },
  deepSleep: {
    name: 'Sleep',
    description: 'Ultra-low frequencies for deep relaxation',
    gains: [12, 10, 6, 2, -2, -4, -6, -8, -10, -12]
  },
  binauralEnhance: {
    name: 'Binaural',
    description: 'Optimized for binaural beat perception',
    gains: [4, 6, 8, 6, 4, 2, 0, -2, -4, -6]
  }
};

export const useEqualizer = (audioContext: AudioContext | null) => {

// Default 10-band equalizer configuration - more compact labels
  const DEFAULT_BANDS: EqualizerBand[] = [
    { id: 'band1', frequency: 32, gain: 0, Q: 1.0, type: 'peaking', label: '32Hz' },
    { id: 'band2', frequency: 64, gain: 0, Q: 1.0, type: 'peaking', label: '64Hz' },
    { id: 'band3', frequency: 125, gain: 0, Q: 1.0, type: 'peaking', label: '125Hz' },
    { id: 'band4', frequency: 250, gain: 0, Q: 1.0, type: 'peaking', label: '250Hz' },
    { id: 'band5', frequency: 500, gain: 0, Q: 1.0, type: 'peaking', label: '500Hz' },
    { id: 'band6', frequency: 1000, gain: 0, Q: 1.0, type: 'peaking', label: '1k' },
    { id: 'band7', frequency: 2000, gain: 0, Q: 1.0, type: 'peaking', label: '2k' },
    { id: 'band8', frequency: 4000, gain: 0, Q: 1.0, type: 'peaking', label: '4k' },
    { id: 'band9', frequency: 8000, gain: 0, Q: 1.0, type: 'peaking', label: '8k' },
    { id: 'band10', frequency: 16000, gain: 0, Q: 1.0, type: 'peaking', label: '16k' },
  ];

  const [equalizerState, setEqualizerState] = useState<EnhancedEqualizerState>({
    enabled: true,  // Enable by default
    bands: DEFAULT_BANDS.map(band => ({
      ...band,
      vector: { ...DEFAULT_FREQUENCY_VECTOR },
      amplifier: { ...DEFAULT_AMPLIFIER }
    })),
    preset: 'flat',
    waveform: 'sine',
    modulator: { ...DEFAULT_MODULATOR },
    spatialEffect: 'none',
    spatialIntensity: 0.5
  });

  // Store filter nodes for each band
  const filterNodesRef = useRef<BiquadFilterNode[]>([]);

  // Store the input/output nodes for audio graph connection
  const inputNodeRef = useRef<GainNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);

  // Track initialization state
  const isInitializedRef = useRef(false);

  // Enhanced audio nodes for new features
  const lfoOscillatorRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const modulatorGainRef = useRef<GainNode | null>(null);
  const pannerNodesRef = useRef<StereoPannerNode[]>([]);
  const waveshaperNodesRef = useRef<WaveShaperNode[]>([]);
  const compressorNodesRef = useRef<DynamicsCompressorNode[]>([]);
  const widthGainsRef = useRef<{ left: GainNode; right: GainNode }[]>([]);

  // Initialize equalizer filter chain
  const initializeEqualizer = useCallback(() => {
    if (!audioContext) {
      return null;
    }

    // Check if already initialized
    if (isInitializedRef.current && inputNodeRef.current && outputNodeRef.current) {
      return {
        input: inputNodeRef.current,
        output: outputNodeRef.current,
        filters: filterNodesRef.current
      };
    }

    try {
      // Create input/output gain nodes for connecting to audio graph
      const inputNode = audioContext.createGain();
      const outputNode = audioContext.createGain();

      inputNode.gain.setValueAtTime(1, audioContext.currentTime);
      outputNode.gain.setValueAtTime(1, audioContext.currentTime);

      // Create filter nodes for each band
      const filters: BiquadFilterNode[] = [];
      let previousNode: AudioNode = inputNode;

      equalizerState.bands.forEach((band, index) => {
        const filter = audioContext.createBiquadFilter();
        filter.type = band.type;
        filter.frequency.setValueAtTime(band.frequency, audioContext.currentTime);
        filter.Q.setValueAtTime(band.Q, audioContext.currentTime);
        filter.gain.setValueAtTime(band.gain, audioContext.currentTime);

        // Connect in series
        previousNode.connect(filter);
        previousNode = filter;
        filters.push(filter);

      });

      // Connect last filter to output
      previousNode.connect(outputNode);

      // Store references
      filterNodesRef.current = filters;
      inputNodeRef.current = inputNode;
      outputNodeRef.current = outputNode;
      isInitializedRef.current = true;

      return {
        input: inputNode,
        output: outputNode,
        filters: filters
      };
    } catch (error) {
      return null;
    }
  }, [audioContext, equalizerState.bands]);

  // Update a specific band's gain
  const updateBandGain = useCallback((bandId: string, gain: number) => {
    if (!audioContext) {
      return;
    }

    // Clamp gain between -40 and +40 dB
    const clampedGain = Math.max(-40, Math.min(40, gain));

    // Update state
    setEqualizerState(prev => ({
      ...prev,
      bands: prev.bands.map(band =>
        band.id === bandId ? { ...band, gain: clampedGain } : band
      ),
      preset: 'custom' // Mark as custom when manually adjusted
    }));

    // Update the corresponding filter node if it exists
    const bandIndex = equalizerState.bands.findIndex(b => b.id === bandId);
    if (bandIndex !== -1 && filterNodesRef.current[bandIndex]) {
      try {
        const filter = filterNodesRef.current[bandIndex];
        filter.gain.setValueAtTime(clampedGain, audioContext.currentTime);
      } catch (error) {
      }
    }
  }, [audioContext, equalizerState.bands]);

  // Load a preset
  const loadPreset = useCallback((presetName: keyof typeof EQ_PRESETS) => {
    if (!audioContext) {
      return;
    }

    const preset = EQ_PRESETS[presetName];
    if (!preset) {
      return;
    }

    // Update state with preset gains
    setEqualizerState(prev => ({
      ...prev,
      bands: prev.bands.map((band, index) => ({
        ...band,
        gain: preset.gains[index] || 0
      })),
      preset: presetName,
      enabled: true // Enable equalizer when loading preset
    }));

    // Update filter nodes if they exist
    if (filterNodesRef.current.length > 0) {
      preset.gains.forEach((gain, index) => {
        if (filterNodesRef.current[index]) {
          try {
            filterNodesRef.current[index].gain.setValueAtTime(
              gain,
              audioContext.currentTime
            );
          } catch (error) {
          }
        }
      });
    } else {
    }
  }, [audioContext]);

  // Reset all bands to 0 dB
  const resetEqualizer = useCallback(() => {
    loadPreset('flat');
  }, [loadPreset]);

  // Toggle equalizer on/off
  const toggleEqualizer = useCallback((enabled: boolean) => {
    setEqualizerState(prev => ({ ...prev, enabled }));
    
    // If enabling and not initialized, initialize now
    if (enabled && !isInitializedRef.current) {
      initializeEqualizer();
    }
  }, [initializeEqualizer]);

  // Auto-initialize when audio context becomes available
  useEffect(() => {
    if (audioContext && equalizerState.enabled && !isInitializedRef.current) {
      initializeEqualizer();
    }
  }, [audioContext, equalizerState.enabled, initializeEqualizer]);

  // Apply current state to filters when they're created
  useEffect(() => {
    if (audioContext && filterNodesRef.current.length > 0) {
      equalizerState.bands.forEach((band, index) => {
        if (filterNodesRef.current[index]) {
          try {
            filterNodesRef.current[index].gain.setValueAtTime(
              band.gain,
              audioContext.currentTime
            );
          } catch (error) {
          }
        }
      });
    }
  }, [audioContext, equalizerState.bands]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Disconnect all filter nodes
      filterNodesRef.current.forEach(filter => {
        try {
          filter.disconnect();
        } catch (error) {
          // Ignore disconnect errors on cleanup
        }
      });

      if (inputNodeRef.current) {
        try {
          inputNodeRef.current.disconnect();
        } catch (error) {
          // Ignore disconnect errors on cleanup
        }
      }

      if (outputNodeRef.current) {
        try {
          outputNodeRef.current.disconnect();
        } catch (error) {
          // Ignore disconnect errors on cleanup
        }
      }

      isInitializedRef.current = false;
    };
  }, []);

  // ============================================
  // ENHANCED FEATURES - New Control Methods
  // ============================================

  /**
   * Update oscillator waveform type
   */
  const updateWaveform = useCallback((waveform: WaveForm) => {
    setEqualizerState(prev => ({ ...prev, waveform }));
  }, []);

  /**
   * Update modulator settings
   */
  const updateModulator = useCallback((modulator: Partial<ModulatorConfig>) => {
    setEqualizerState(prev => ({
      ...prev,
      modulator: { ...prev.modulator, ...modulator }
    }));

    // If LFO is enabled and audio context exists, create/update LFO
    if (audioContext && modulator.enabled && !lfoOscillatorRef.current) {
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();

      lfo.type = equalizerState.modulator.waveform;
      lfo.frequency.setValueAtTime(equalizerState.modulator.rate, audioContext.currentTime);
      lfoGain.gain.setValueAtTime(equalizerState.modulator.depth, audioContext.currentTime);

      lfo.connect(lfoGain);
      lfo.start();

      lfoOscillatorRef.current = lfo;
      lfoGainRef.current = lfoGain;

    } else if (lfoOscillatorRef.current && audioContext) {
      // Update existing LFO
      if (modulator.rate !== undefined) {
        lfoOscillatorRef.current.frequency.setValueAtTime(modulator.rate, audioContext.currentTime);
      }
      if (modulator.depth !== undefined && lfoGainRef.current) {
        lfoGainRef.current.gain.setValueAtTime(modulator.depth, audioContext.currentTime);
      }
    }

  }, [audioContext, equalizerState.modulator]);

  /**
   * Update spatial effect mode
   */
  const updateSpatialEffect = useCallback((spatialEffect: SpatialEffectMode, intensity?: number) => {
    setEqualizerState(prev => ({
      ...prev,
      spatialEffect,
      spatialIntensity: intensity !== undefined ? intensity : prev.spatialIntensity
    }));
  }, []);

  /**
   * Update frequency vector (3D spatial positioning) for a band
   */
  const updateBandVector = useCallback((bandId: string, vector: Partial<FrequencyVector>) => {
    setEqualizerState(prev => ({
      ...prev,
      bands: prev.bands.map(band =>
        band.id === bandId && band.vector
          ? { ...band, vector: { ...band.vector, ...vector } }
          : band
      )
    }));

    // Update panner node if it exists
    const bandIndex = equalizerState.bands.findIndex(b => b.id === bandId);
    if (bandIndex !== -1 && pannerNodesRef.current[bandIndex] && audioContext) {
      if (vector.pan !== undefined) {
        pannerNodesRef.current[bandIndex].pan.setValueAtTime(vector.pan, audioContext.currentTime);
      }
    }

  }, [audioContext, equalizerState.bands]);

  /**
   * Update amplifier settings for a band
   */
  const updateBandAmplifier = useCallback((bandId: string, amplifier: Partial<AmplifierBandConfig>) => {
    setEqualizerState(prev => ({
      ...prev,
      bands: prev.bands.map(band =>
        band.id === bandId && band.amplifier
          ? { ...band, amplifier: { ...band.amplifier, ...amplifier } }
          : band
      )
    }));

    // Update audio nodes if they exist
    const bandIndex = equalizerState.bands.findIndex(b => b.id === bandId);
    if (bandIndex !== -1 && audioContext) {
      // Update compressor if it exists
      if (compressorNodesRef.current[bandIndex]) {
        const comp = compressorNodesRef.current[bandIndex];
        if (amplifier.threshold !== undefined) {
          comp.threshold.setValueAtTime(amplifier.threshold, audioContext.currentTime);
        }
        if (amplifier.ratio !== undefined) {
          comp.ratio.setValueAtTime(amplifier.ratio, audioContext.currentTime);
        }
      }
    }

  }, [audioContext, equalizerState.bands]);

  return {
    equalizerState,
    initializeEqualizer,
    updateBandGain,
    loadPreset,
    resetEqualizer,
    toggleEqualizer,
    // Enhanced features
    updateWaveform,
    updateModulator,
    updateSpatialEffect,
    updateBandVector,
    updateBandAmplifier,
    // Expose nodes for audio graph connection
    inputNode: inputNodeRef.current,
    outputNode: outputNodeRef.current,
    filterNodes: filterNodesRef.current
  };
};