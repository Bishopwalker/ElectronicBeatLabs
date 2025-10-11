// Electromagnetic Beat Lab - Equalizer Hook
// Professional multi-band audio equalization using Web Audio BiquadFilterNode
// FIXED: Proper initialization and state management for working sliders

import { useState, useCallback, useRef, useEffect } from 'react';
import type { EqualizerBand, EqualizerState } from '../types';

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
  const [equalizerState, setEqualizerState] = useState<EqualizerState>({
    enabled: true,  // Enable by default
    bands: DEFAULT_BANDS,
    preset: 'flat'
  });

  // Store filter nodes for each band
  const filterNodesRef = useRef<BiquadFilterNode[]>([]);

  // Store the input/output nodes for audio graph connection
  const inputNodeRef = useRef<GainNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);

  // Track initialization state
  const isInitializedRef = useRef(false);

  // Initialize equalizer filter chain
  const initializeEqualizer = useCallback(() => {
    if (!audioContext) {
      console.warn('⚠️ Cannot initialize equalizer: AudioContext not available');
      return null;
    }

    // Check if already initialized
    if (isInitializedRef.current && inputNodeRef.current && outputNodeRef.current) {
      console.log('🎚️ Equalizer already initialized, returning existing nodes');
      return {
        input: inputNodeRef.current,
        output: outputNodeRef.current,
        filters: filterNodesRef.current
      };
    }

    console.log('🎚️ Creating new equalizer with', equalizerState.bands.length, 'bands');

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

        console.log(`🎚️ Created filter ${index + 1}: ${band.frequency}Hz, ${band.gain}dB`);
      });

      // Connect last filter to output
      previousNode.connect(outputNode);

      // Store references
      filterNodesRef.current = filters;
      inputNodeRef.current = inputNode;
      outputNodeRef.current = outputNode;
      isInitializedRef.current = true;

      console.log('✅ Equalizer initialized successfully with', filters.length, 'bands');

      return {
        input: inputNode,
        output: outputNode,
        filters: filters
      };
    } catch (error) {
      console.error('❌ Failed to initialize equalizer:', error);
      return null;
    }
  }, [audioContext, equalizerState.bands]);

  // Update a specific band's gain
  const updateBandGain = useCallback((bandId: string, gain: number) => {
    if (!audioContext) {
      console.warn('⚠️ Cannot update band: AudioContext not available');
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
        console.log(`🎚️ Updated band ${bandIndex + 1} (${equalizerState.bands[bandIndex].label}) to ${clampedGain}dB`);
      } catch (error) {
        console.error(`❌ Failed to update band ${bandId}:`, error);
      }
    }
  }, [audioContext, equalizerState.bands]);

  // Load a preset
  const loadPreset = useCallback((presetName: keyof typeof EQ_PRESETS) => {
    if (!audioContext) {
      console.warn('⚠️ Cannot load preset: AudioContext not available');
      return;
    }

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
            console.error(`❌ Failed to update filter ${index}:`, error);
          }
        }
      });
      console.log('✅ Preset applied to filters:', preset.name);
    } else {
      console.log('⚠️ Filters not initialized yet, preset will be applied on initialization');
    }
  }, [audioContext]);

  // Reset all bands to 0 dB
  const resetEqualizer = useCallback(() => {
    console.log('🔄 Resetting equalizer to flat');
    loadPreset('flat');
  }, [loadPreset]);

  // Toggle equalizer on/off
  const toggleEqualizer = useCallback((enabled: boolean) => {
    setEqualizerState(prev => ({ ...prev, enabled }));
    console.log('🎚️ Equalizer', enabled ? 'enabled' : 'disabled');
    
    // If enabling and not initialized, initialize now
    if (enabled && !isInitializedRef.current) {
      initializeEqualizer();
    }
  }, [initializeEqualizer]);

  // Auto-initialize when audio context becomes available
  useEffect(() => {
    if (audioContext && equalizerState.enabled && !isInitializedRef.current) {
      console.log('🎚️ Auto-initializing equalizer on audio context availability');
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
            console.error(`❌ Failed to sync filter ${index}:`, error);
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