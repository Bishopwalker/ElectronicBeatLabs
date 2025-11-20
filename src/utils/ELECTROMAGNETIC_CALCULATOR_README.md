# Electromagnetic Field Calculator

## Overview

The electromagnetic field calculator replaces hardcoded pattern values with real-time audio analysis data. Instead of using static values from `patterns.ts`, components should use `calculateElectromagneticField()` to get dynamic values based on actual audio output.

## Problem it Solves

**Before (BAD):**
```typescript
// ❌ Hardcoded values that don't reflect actual audio
const electromagnetic = {
  fieldStrength: 0.95,  // Static value
  coherence: 0.98,      // Never changes
  resonanceFreq: 30     // Doesn't match actual audio
};
```

**After (GOOD):**
```typescript
// ✅ Dynamic values from real audio analysis
const { electromagnetic } = useDynamicElectromagneticField({
  beatFrequency: 10,
  isPlaying: true,
  audioContext: myAudioContext,
  analyserNode: myAnalyser
});

// Now electromagnetic.strength, coherence, etc. reflect actual audio!
```

## Usage

### Option 1: Using the Hook (Recommended for Components)

```typescript
import { useDynamicElectromagneticField } from '../hooks';

function MyComponent() {
  const audioContext = useAudioContext();
  const analyserNode = useAnalyserNode();

  const { electromagnetic, analysisData, stats } = useDynamicElectromagneticField({
    beatFrequency: 10,  // Current beat frequency
    isPlaying: true,    // Is audio currently playing?
    audioContext,       // Pass your AudioContext
    analyserNode,       // Pass your AnalyserNode
    updateRate: 60      // Update frequency (FPS)
  });

  return (
    <div>
      <p>Field Strength: {electromagnetic.strength.toFixed(2)}</p>
      <p>Coherence: {electromagnetic.coherence.toFixed(2)}</p>
      <p>State: {electromagnetic.state}</p>
    </div>
  );
}
```

### Option 2: Using the Calculator Directly

```typescript
import { calculateElectromagneticField } from '../utils/electromagneticCalculator';
import { useAudioAnalysis } from '../hooks';

function MyComponent() {
  const { analysisData } = useAudioAnalysis({
    audioContext: myAudioContext,
    analyserNode: myAnalyser
  });

  const electromagnetic = calculateElectromagneticField(
    analysisData,
    beatFrequency,
    isPlaying
  );

  // Use electromagnetic.strength, coherence, etc.
}
```

## Integration with Patterns

When using patterns from `patterns.ts`, override their hardcoded electromagnetic values:

```typescript
import { WAVE_PATTERNS } from '../data/patterns';
import { useDynamicElectromagneticField } from '../hooks';

function PatternVisualizer() {
  const pattern = WAVE_PATTERNS[0]; // Get pattern

  // Override hardcoded values with real-time analysis
  const { electromagnetic } = useDynamicElectromagneticField({
    beatFrequency: pattern.frequencies.beat,
    isPlaying: true,
    audioContext,
    analyserNode
  });

  // Use dynamic electromagnetic instead of pattern.electromagnetic
  return (
    <SpatialVisualizer
      pattern={pattern}
      electromagnetic={electromagnetic}  // 🔥 Dynamic values!
    />
  );
}
```

## How It Works

The calculator uses multiple audio analysis metrics:

1. **Field Strength**: Calculated from RMS (Root Mean Square) of the audio spectrum
   - Higher amplitudes = stronger field
   - Range: 0.0 to 1.0

2. **Coherence**: Based on signal-to-noise ratio (SNR) and clarity
   - Higher SNR + better clarity = better coherence
   - Range: 0.0 to 1.0

3. **Resonance Frequency**: Extracted from dominant peak in spectrum
   - Falls back to beat frequency if no clear peak
   - Range: 0-100 Hz (binaural range)

4. **Stability**: Inverse of standard deviation
   - Lower variance = more stable field
   - Range: 0.0 to 1.0

5. **State**: Determined by beat frequency range
   - INACTIVE: Not playing
   - CHARGING: Delta (0-4 Hz)
   - ACTIVE: Theta (4-8 Hz)
   - RESONANT: Alpha (8-13 Hz) or Gamma (30+ Hz)
   - CRITICAL: Beta (13-30 Hz)

## API Reference

### `calculateElectromagneticField()`

```typescript
function calculateElectromagneticField(
  analysisData: AudioAnalysisData | null,
  beatFrequency: number,
  isPlaying: boolean
): ElectromagneticField
```

**Parameters:**
- `analysisData`: Audio spectrum and peaks from `useAudioAnalysis`
- `beatFrequency`: Current binaural beat frequency
- `isPlaying`: Whether audio is currently playing

**Returns:** `ElectromagneticField` object with:
- `strength`: Field intensity (0-1)
- `frequency`: Resonance frequency (Hz)
- `phase`: Current phase angle (0-2π)
- `coherence`: Signal coherence (0-1)
- `resonance`: Product of strength × coherence (0-1)
- `state`: Field state ('INACTIVE' | 'CHARGING' | 'ACTIVE' | 'RESONANT' | 'CRITICAL')
- `stability`: Signal stability (0-1)

### `useDynamicElectromagneticField()`

```typescript
function useDynamicElectromagneticField(props: {
  beatFrequency: number;
  isPlaying: boolean;
  audioContext?: AudioContext | null;
  analyserNode?: AnalyserNode | null;
  updateRate?: number;
}): {
  electromagnetic: ElectromagneticField;
  analysisData: AudioAnalysisData | null;
  stats: AudioAnalysisStats;
  isAnalyzing: boolean;
}
```

**Parameters:**
- `beatFrequency`: Current beat frequency
- `isPlaying`: Audio playback state
- `audioContext`: Web Audio API context (optional)
- `analyserNode`: Web Audio API analyser (optional)
- `updateRate`: Analysis update rate in FPS (default: 60)

**Returns:**
- `electromagnetic`: Dynamic field data
- `analysisData`: Raw audio analysis
- `stats`: Analysis performance stats
- `isAnalyzing`: Whether analysis is active

## Migration Guide

### Before (Using Hardcoded Values)

```typescript
// ❌ OLD WAY - Static pattern values
const pattern = WAVE_PATTERNS[0];

<SpatialVisualizer
  pattern={pattern}
  electromagnetic={pattern.electromagnetic}  // Hardcoded!
/>
```

### After (Using Dynamic Analysis)

```typescript
// ✅ NEW WAY - Dynamic audio analysis
const pattern = WAVE_PATTERNS[0];
const { electromagnetic } = useDynamicElectromagneticField({
  beatFrequency: pattern.frequencies.beat,
  isPlaying: hybridEngine.audioState.isPlaying,
  audioContext: hybridEngine.audioContext,
  analyserNode: hybridEngine.analyserNode
});

<SpatialVisualizer
  pattern={pattern}
  electromagnetic={electromagnetic}  // Real-time values!
/>
```

## Benefits

- ✅ **Real-time accuracy**: Field values match actual audio output
- ✅ **Dynamic visualization**: Visualizers respond to actual sound
- ✅ **Better user experience**: Users see what they hear
- ✅ **Scientific validity**: Values based on actual measurements
- ✅ **No maintenance**: No need to tune hardcoded values

## Testing

To verify the calculator is working:

1. Start audio playback
2. Check console logs for field values
3. Verify values change with audio intensity
4. Confirm state changes with frequency ranges

```typescript
const { electromagnetic } = useDynamicElectromagneticField({
  beatFrequency: 10,
  isPlaying: true,
  audioContext,
  analyserNode
});

console.log('🔬 Electromagnetic Field:', {
  strength: electromagnetic.strength,
  coherence: electromagnetic.coherence,
  state: electromagnetic.state
});
```

## Troubleshooting

**Problem**: All values are 0
- **Solution**: Check that audio is playing and AudioContext/AnalyserNode are connected

**Problem**: Values don't change
- **Solution**: Verify analyserNode is receiving audio data (check `fftSize` and `frequencyBinCount`)

**Problem**: Coherence always low
- **Solution**: Increase audio volume or check signal-to-noise ratio calculation

## Future Improvements

- [ ] Add exponential smoothing for less jittery values
- [ ] Implement frequency-band-specific field calculations
- [ ] Add machine learning for pattern recognition
- [ ] Create presets based on analyzed patterns
- [ ] Add calibration mode for optimal field detection

## Related Files

- **Hook**: `src/hooks/useDynamicElectromagneticField.ts`
- **Calculator**: `src/utils/electromagneticCalculator.ts`
- **Audio Analysis**: `src/hooks/useAudioAnalysis.ts`
- **Patterns**: `src/data/patterns.ts`
- **Types**: `src/types/index.ts`
