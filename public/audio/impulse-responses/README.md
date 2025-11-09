# Impulse Response Files

This directory should contain impulse response (IR) audio files for convolution reverb.

## Required Files

- `small-room.wav` - Small room impulse response for 8D spatial processing

## Where to Get IR Files

1. **Free IR Libraries**:
   - [OpenAIR](https://www.openair.hosted.york.ac.uk/) - Free impulse responses
   - [Voxengo](https://www.voxengo.com/impulses/) - Free impulse responses
   - [EchoThief](http://www.echothief.com/) - Real-world space IRs

2. **Generate Your Own**:
   - Use a sine sweep or balloon pop in a real room
   - Record with high-quality microphones
   - Process with audio software like Audacity

## File Format Requirements

- **Format**: WAV (uncompressed)
- **Sample Rate**: 48000 Hz (to match AudioContext)
- **Bit Depth**: 16 or 24 bit
- **Channels**: Stereo (2 channels)
- **Duration**: 0.5 - 2 seconds typically

## Fallback

If no impulse response file is found, the True8DSpatialEngine will automatically generate a synthetic impulse response using algorithmic reverb.

## Adding Your Own IR

1. Download or create a WAV file
2. Name it `small-room.wav`
3. Place it in this directory
4. The spatial engine will automatically load it

## Sample Generation Script

```javascript
// Generate a simple IR if you need one quickly
// Run this in browser console with Web Audio API

const context = new AudioContext({ sampleRate: 48000 });
const length = context.sampleRate * 0.8; // 0.8 second
const impulse = context.createBuffer(2, length, context.sampleRate);

for (let channel = 0; channel < 2; channel++) {
  const channelData = impulse.getChannelData(channel);
  for (let i = 0; i < length; i++) {
    // Exponential decay with early reflections
    const decay = Math.pow(1 - i / length, 2);
    channelData[i] = (Math.random() * 2 - 1) * decay * 0.3;
  }
}

// Convert to WAV and download
// (Would need additional code to actually save as WAV file)
```
