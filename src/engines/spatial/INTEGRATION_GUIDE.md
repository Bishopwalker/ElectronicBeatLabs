/**
 * INTEGRATION_GUIDE.md
 * 
 * How to integrate the External Audio Mixer with 8D Spatial Processing
 * into your existing EBL hybrid audio engine
 */

# External Audio Mixer Integration Guide

## Overview
This guide shows how to integrate the new External Audio Mixer with 8D Spatial Processing into your existing EBL application.

## Quick Start

### 1. Import the Component
```typescript
// In your main ElectromagneticBeatLab.tsx or wherever you want to add it
import { ExternalAudioPanel } from '../audio/ExternalAudioPanel';
```

### 2. Add to Your Layout
```tsx
// In your component's JSX, add the panel where you want it to appear
// Pass the audio context and analyser from your useHybridAudioEngine hook

<Grid item xs={12} sm={12} md={6}>
  <ExternalAudioPanel
    audioContext={audioEngineState.context}
    analyserNode={audioEngineState.analyserNode}
    masterGainNode={audioEngineState.masterGainNode}
  />
</Grid>
```

### 3. Update Your Hybrid Audio Engine (if needed)
The external audio mixer uses its own mixer node that connects to your analyser.
Make sure your hybrid audio engine exposes:
- `audioContext`: The main AudioContext
- `analyserNode`: For visualization
- `masterGainNode`: For overall volume control

## Full Integration Example

```tsx
// ElectromagneticBeatLab.tsx
import React from 'react';
import { Grid } from '@mui/material';
import { useHybridAudioEngine } from '../../hooks/useHybridAudioEngine';
import { ExternalAudioPanel } from '../audio/ExternalAudioPanel';
import { FrequencyVisualizer } from '../FrequencyVisualizer';

export const ElectromagneticBeatLab: React.FC = () => {
  // Your existing hybrid audio engine
  const {
    state: audioEngineState,
    initializeEngine,
    startBinauralBeat,
    stopBinauralBeat
  } = useHybridAudioEngine();
  
  // Initialize on mount
  React.useEffect(() => {
    initializeEngine();
  }, []);
  
  return (
    <Grid container spacing={3}>
      {/* Your existing components */}
      <Grid item xs={12}>
        <PatternSelector onPatternSelect={handlePatternSelect} />
      </Grid>
      
      {/* NEW: External Audio Mixer Panel */}
      <Grid item xs={12} md={6}>
        <ExternalAudioPanel
          audioContext={audioEngineState.context}
          analyserNode={audioEngineState.analyserNode}
          masterGainNode={audioEngineState.masterGainNode}
        />
      </Grid>
      
      {/* Your existing visualizer will now show mixed audio! */}
      <Grid item xs={12} md={6}>
        <FrequencyVisualizer
          audioContext={audioEngineState.context}
          analyserNode={audioEngineState.analyserNode}
          isPlaying={audioEngineState.isPlaying}
        />
      </Grid>
    </Grid>
  );
};
```

## Audio Routing Architecture

```
BEFORE (Current):
Binaural Beats → Analyser → Master → Speakers
                     ↑
              (Visualizer sees this)

AFTER (With External Audio):
YouTube/Tab Audio → External Gain → [Optional: 8D Spatial] ↘
                                                              Mixer → Analyser → Master → Speakers
Binaural Beats → Binaural Gain ────────────────────────────↗           ↑
                                                                  (Visualizer sees everything!)
```

## Features You Get

1. **Tab Audio Capture**: Capture audio from YouTube, Spotify, or any browser tab
2. **Microphone Capture**: Mix your voice with binaural beats
3. **8D Spatial Processing**: 
   - HRTF-based 3D positioning
   - Adjustable rotation speed (0.1x - 5x)
   - Reverb mix control
   - Automatic filter modulation
4. **Independent Volume Control**: Separate sliders for external and binaural audio
5. **Real-time Visualization**: Your existing visualizer will show the mixed output

## How Users Will Use It

1. **Study with YouTube + Binaural Beats**:
   - Start a binaural beat pattern (e.g., "Focus" at 40Hz)
   - Click "Capture Tab Audio"
   - Select the YouTube tab playing lo-fi study music
   - Enable "8D Spatial Processing" for immersive experience
   - Adjust volumes to preference

2. **Meditation with Nature Sounds**:
   - Start a theta wave pattern (4-8Hz)
   - Capture a tab playing rain sounds
   - Set external volume to 60%, binaural to 40%
   - Enjoy deep meditation

3. **ADHD Focus Session**:
   - Start SMR protocol (12-15Hz)
   - Capture white noise or brown noise from another tab
   - Enable 8D with slow rotation (0.5x speed)
   - Work with enhanced focus

## Troubleshooting

### Audio Not Capturing?
- Make sure the tab is actually playing audio
- Check browser permissions for screen/audio sharing
- Try refreshing and granting permissions again

### No 8D Effect?
- Ensure "8D Spatial Processing" switch is ON
- Increase rotation speed if too subtle
- Check that external audio is actually being captured

### Performance Issues?
- 8D processing is CPU-intensive
- Try disabling if experiencing lag
- Reduce visualizer update rate if needed

## Browser Compatibility

- **Chrome/Edge**: Full support ✅
- **Firefox**: Tab audio capture may be limited
- **Safari**: Limited support for getDisplayMedia

## The Cash Money Implementation Details

The implementation uses:
- **Single AudioContext**: No multiple contexts, everything routes through your existing one
- **HRTF Panning**: Real 3D audio using head-related transfer functions
- **Serial Processing**: Audio flows through effects in sequence, not parallel
- **Proper Cleanup**: All streams and nodes are properly disposed

This is BISHOP-level audio engineering, My Dude! 🎧🔥
