// Electromagnetic Beat Lab - Equalizer Hook
// Professional multi-band audio equalization using Web Audio BiquadFilterNode

import { useState, useCallback, useRef, useEffect } from 'react';

export interface EqualizerBand {
  id: string;
  frequency: number; // Center frequency in Hz
  gain: number; // Gain in dB (-40 to +40)
  Q: number; // Quality factor (0.1 to 10)
  type: BiquadFilterType;
  label: string;
}

export interface EqualizerState {
  enabled: boolean;
  bands: EqualizerBand[];
  preset: string;
}

// Default 10-band equalizer configuration
const DEFAULT_BANDS: EqualizerBand[] = [
  { id: 'band1', frequency: 32, gain: 0, Q: 1.0, type: 'peaking', label: '32 Hz' },
  { id: 'band2', frequency: 64, gain: 0, Q: 1.0, type: 'peaking', label: '64 Hz' },
  { id: 'band3', frequency: 125, gain: 0, Q: 1.0, type: 'peaking', label: '125 Hz' },
  { id: 'band4', frequency: 250, gain: 0, Q: 1.0, type: 'peaking', label: '250 Hz' },
  { id: 'band5', frequency: 500, gain: 0, Q: 1.0, type: 'peaking', label: '500 Hz' },
  { id: 'band6', frequency: 1000, gain: 0, Q: 1.0, type: 'peaking', label: '1 kHz' },
  { id: 'band7', frequency: 2000, gain: 0, Q: 1.0, type: 'peaking', label: '2 kHz' },
  { id: 'band8', frequency: 4000, gain: 0, Q: 1.0, type: 'peaking', label: '4 kHz' },
  { id: 'band9', frequency: 8000, gain: 0, Q: 1.0, type: 'peaking', label: '8 kHz' },
  { id: 'band10', frequency: 16000, gain: 0, Q: 1.0, type: 'peaking', label: '16 kHz' },
];

// Equalizer presets
export const EQ_PRESETS = {
  flat: {
    name: 'Flat',
    description: 'No equalization',
    gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  bassBoost: {
    name: 'Bass Boost',
    description: 'Enhanced low frequencies',
    gains: [8, 6, 4, 2, 0, 0, 0, 0, 0, 0]
  },
  trebleBoost: {
    name: 'Treble Boost',
    description: 'Enhanced high frequencies',
    gains: [0, 0, 0, 0, 0, 2, 4, 6, 8, 10]
  },
  vocal: {
    name: 'Vocal',
    description: 'Enhanced vocal clarity',
    gains: [-2, -2, 0, 2, 4, 4, 2, 0, -2, -2]
  },
  meditation: {
    name: 'Meditation',
    description: 'Smooth, warm sound for meditation',
    gains: [4, 3, 2, 1, 0, -1, -2, -3, -4, -5]
  },
  focus: {
    name: 'Focus',
    description: 'Clear, balanced sound for concentration',
    gains: [-2, -1, 0, 1, 2, 2, 1, 0, -1, -2]
  },
  deepSleep: {
    name: 'Deep Sleep',
    description: 'Ultra-low frequencies for deep relaxation',
    gains: [12, 10, 6, 2, -2, -4, -6, -8, -10, -12]
  },
  binauralEnhance: {
    name: 'Binaural Enhance',
    description: 'Optimized for binaural beat perception',
    gains: [4, 6, 8, 6, 4, 2, 0, -2, -4, -6]
  }
};

export const useEqualizer = (audioContext: AudioContext | null) => {
  const [equalizerState, setEqualizerState] = useState<EqualizerState>({
    enabled: true,  // Changed to true - enable by default
    bands: DEFAULT_BANDS,
    preset: 'flat'
  });

  // Store filter nodes for each band
  const filterNodesRef = useRef<BiquadFilterNode[]>([]);

  // Store the input/output nodes for audio graph connection
  const inputNodeRef = useRef<GainNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);

  // Initialize equalizer filter chain
  const initializeEqualizer = useCallback(() => {
    if (!audioContext) {
      console.warn('⚠️ Cannot initialize equalizer: AudioContext not available');
      return null;
    }

    console.log('🎚️ Initializing equalizer with', DEFAULT_BANDS.length, 'bands');

    // Create input/output gain nodes for connecting to audio graph
    const inputNode = audioContext.createGain();
    const outputNode = audioContext.createGain();

    inputNode.gain.setValueAtTime(1, audioContext.currentTime);
    outputNode.gain.setValueAtTime(1, audioContext.currentTime);

    // Create filter nodes for each band
    const filters: BiquadFilterNode[] = [];

    DEFAULT_BANDS.forEach((band, index) => {
      const filter = audioContext.createBiquadFilter();
      filter.type = band.type;
      filter.frequency.setValueAtTime(band.frequency, audioContext.currentTime);
      filter.Q.setValueAtTime(band.Q, audioContext.currentTime);
      filter.gain.setValueAtTime(band.gain, audioContext.currentTime);

      filters.push(filter);

      // Connect filters in series
      if (index === 0) {
        inputNode.connect(filter);
      } else {
        filters[index - 1].connect(filter);
      }
    });

    // Connect last filter to output
    if (filters.length > 0) {
      filters[filters.length - 1].connect(outputNode);
    } else {
      inputNode.connect(outputNode);
    }

    // Store references
    filterNodesRef.current = filters;
    inputNodeRef.current = inputNode;
    outputNodeRef.current = outputNode;

    console.log('✅ Equalizer initialized successfully');

    return {
      input: inputNode,
      output: outputNode,
      filters: filters
    };
  }, [audioContext]);

  // Update a specific band's gain
  const updateBandGain = useCallback((bandId: string, gain: number) => {
    if (!audioContext) return;

    // Clamp gain between -40 and +40 dB
    const clampedGain = Math.max(-40, Math.min(40, gain));

    setEqualizerState(prev => ({
      ...prev,
      bands: prev.bands.map(band =>
        band.id === bandId ? { ...band, gain: clampedGain } : band
      ),
      preset: 'custom' // Mark as custom when manually adjusted
    }));

    // Update the corresponding filter node
    const bandIndex = DEFAULT_BANDS.findIndex(b => b.id === bandId);
    if (bandIndex !== -1 && filterNodesRef.current[bandIndex]) {
      const filter = filterNodesRef.current[bandIndex];
      filter.gain.setValueAtTime(clampedGain, audioContext.currentTime);
      console.log(`🎚️ Updated ${DEFAULT_BANDS[bandIndex].label} to ${clampedGain.toFixed(1)} dB`);
    }
  }, [audioContext]);

  // Load a preset
  const loadPreset = useCallback((presetName: keyof typeof EQ_PRESETS) => {
    if (!audioContext) return;

    const preset = EQ_PRESETS[presetName];
    if (!preset) {
      console.warn('⚠️ Unknown preset:', presetName);
      return;
    }

    console.log('🎚️ Loading preset:', preset.name);

    // Update state with preset gains
    setEqualizerState(prev => ({
      ...prev,
      bands: prev.bands.map((band, index) => ({
        ...band,
        gain: preset.gains[index] || 0
      })),
      preset: presetName
    }));

    // Update filter nodes
    preset.gains.forEach((gain, index) => {
      if (filterNodesRef.current[index]) {
        filterNodesRef.current[index].gain.setValueAtTime(
          gain,
          audioContext.currentTime
        );
      }
    });

    console.log('✅ Preset loaded:', preset.name);
  }, [audioContext]);

  // Reset all bands to 0 dB
  const resetEqualizer = useCallback(() => {
    loadPreset('flat');
  }, [loadPreset]);

  // Toggle equalizer on/off
  const toggleEqualizer = useCallback((enabled: boolean) => {
    setEqualizerState(prev => ({ ...prev, enabled }));
    console.log('🎚️ Equalizer', enabled ? 'enabled' : 'disabled');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Disconnect all filter nodes
      filterNodesRef.current.forEach(filter => {
        filter.disconnect();
      });

      if (inputNodeRef.current) {
        inputNodeRef.current.disconnect();
      }

      if (outputNodeRef.current) {
        outputNodeRef.current.disconnect();
      }

      console.log('🎚️ Equalizer cleaned up');
    };
  }, []);

  return {
    equalizerState,
    initializeEqualizer,
    updateBandGain,
    loadPreset,
    resetEqualizer,
    toggleEqualizer,
    // Expose nodes for audio graph connection
    inputNode: inputNodeRef.current,
    outputNode: outputNodeRef.current,
    filterNodes: filterNodesRef.current
  };
};
