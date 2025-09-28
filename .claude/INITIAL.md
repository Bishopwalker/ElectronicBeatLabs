# Electromagnetic Beat Lab (EBL) - Initial Project Specification

## FEATURE:

**Electromagnetic Beat Lab** - A real-time binaural beats and electromagnetic field generation system for ADHD symptom management and cognitive enhancement.

### Core Functionality:
- **Binaural Beat Generation**: Precise frequency synthesis using Web Audio API and Python NumPy
- **Electromagnetic Field Simulation**: Real-time field pattern visualization synchronized with audio
- **ADHD Treatment Protocols**: Science-based frequency sequences for focus, attention, and emotional regulation
- **WebSocket Streaming**: Real-time audio/field data streaming between React frontend and FastAPI backend
- **8D Audio Processing**: Spatial audio patterns for immersive therapeutic experience

### Architecture:
- **Frontend**: React + TypeScript + Material-UI with real-time visualizations
- **Backend**: FastAPI + NumPy + SciPy for audio generation and field simulation
- **Communication**: WebSocket for streaming, REST API for control
- **Audio Engine**: 44.1kHz sample rate with phase-continuous generation
- **Field Simulator**: Multiple pattern types (toroidal, spherical, vortex, wave)

## EXAMPLES:

### 1. Qt Multimedia Audio Engine Reference (`examples/qt-multimedia-audioengine-reference.md`)
- Professional audio processing patterns and buffer management
- Spatial audio positioning and multi-channel processing
- Performance optimization techniques for real-time audio
- **Application**: Guides implementation of Web Audio API and Python audio engine

### 2. Qt Multimedia Audio Input Reference (`examples/qt-multimedia-audioinput-reference.md`)
- Real-time audio input capture and device management
- Audio level monitoring and visualization techniques
- Cross-platform microphone access patterns
- **Application**: Audio feedback monitoring, voice control, and binaural beat validation

### 3. AudioKit AudioEngine Reference (`examples/audiokit-audioengine-reference.md`)
- Professional node-based audio graph architecture
- Real-time DSP operations and parameter automation
- Cross-platform audio engine management
- **Application**: Modular audio processing design, zero-latency performance patterns

### 4. Basic Binaural Beat Generator (`examples/binauralbeats.html`)
- Web Audio API implementation with dual oscillators
- Left/right channel separation for binaural effect
- Real-time frequency control
- **Enhancement Needed**: Add preset buttons, visualization, save/load functionality

### 5. ADHD Protocol Examples
- **SMR Training**: 12-14 Hz for attention and impulse control
- **Theta Suppression**: Beta enhancement to reduce daydreaming
- **Executive Function**: Multi-stage protocols with gamma bursts
- **Morning Activation**: Quick 15-minute energy boost sequence

### 6. EM Field Visualization Examples
- **Toroidal Field**: Rotating torus patterns synchronized with beat frequency
- **Spherical Harmonic**: Pulsating spherical waves with multiple harmonics
- **Vortex Pattern**: Spiral field formations for deep focus states
- **Standing Wave**: Interference patterns for cognitive enhancement

### 7. WebSocket Streaming Examples
- Real-time audio frame streaming at 60 FPS
- Field data synchronization with audio
- Session management with unique IDs
- Live parameter updates during sessions

### 8. React Component Examples
- `SpatialVisualizer`: 3D field visualization with WebGL
- `FrequencyDisplay`: Real-time spectrum analysis
- `PatternSelector`: ADHD protocol selection interface
- `MainControls`: Start/stop, volume, frequency adjustment

## DOCUMENTATION:

### Scientific References:
- **Binaural Beats Research**: Heinrich Wilhelm Dove (1839), Oster (1973)
- **ADHD Neurofeedback**: SMR training protocols by Sterman & Lubar
- **Brainwave Entrainment**: Monroe Institute frequency protocols
- **Electromagnetic Field Effects**: Schumann resonance research

### Technical Documentation:
- **Web Audio API**: MDN documentation for oscillator nodes, gain control
c- **AudioWorklet**: Modern replacement for deprecated ScriptProcessorNode (see below)
- **FastAPI**: Async WebSocket implementation patterns
- **NumPy**: Audio signal generation and DSP operations
- **SciPy**: Field simulation using wave equations
- **React**: Real-time data visualization with Canvas/WebGL

### Protocol References:
- **Delta (0.5-4 Hz)**: Deep sleep, regeneration
- **Theta (4-8 Hz)**: Meditation, creativity, memory consolidation  
- **Alpha (8-13 Hz)**: Relaxed awareness, flow states
- **SMR (12-15 Hz)**: Sensorimotor rhythm for ADHD management
- **Beta (13-30 Hz)**: Focus, concentration, cognitive performance
- **Gamma (30-100 Hz)**: Peak performance, cognitive binding

## OTHER CONSIDERATIONS:

### Critical Implementation Details:

1. **Phase Continuity**: Audio generation must maintain phase between frames to prevent clicks/pops
2. **Sample Rate Consistency**: 44.1kHz throughout entire audio pipeline
3. **WebSocket Buffer Management**: Handle network latency and buffer underruns gracefully
4. **CORS Configuration**: Enable localhost origins for development
5. **Error Handling**: Graceful degradation when Web Audio API unavailable

### ADHD-Specific Requirements:

1. **Session Duration Control**: Protocols range from 15-50 minutes with automatic progression
2. **Gradual Transitions**: Smooth frequency changes to prevent jarring shifts
3. **Safety Limits**: Maximum amplitude limits, frequency bounds validation
4. **Progress Tracking**: Session history and effectiveness metrics
5. **Accessibility**: Clear UI controls, keyboard navigation support

### Performance Optimizations:

1. **Audio Threading**: Use AudioWorklet for main thread isolation
2. **Field Calculation**: Pre-compute static patterns, interpolate dynamic changes
3. **WebSocket Compression**: Compress JSON payloads for field data
4. **React Optimization**: Memoization for expensive visualizations
5. **Memory Management**: Cleanup audio contexts, prevent memory leaks

### Common AI Assistant Mistakes to Avoid:

1. **Don't assume PyAudio works**: Often has installation issues, prefer web-based audio
2. **Phase alignment is critical**: Binaural beats require precise phase relationships
3. **WebSocket lifecycle management**: Properly handle disconnections and reconnections
4. **Audio context creation**: Must be user-initiated due to browser autoplay policies
5. **Float32Array usage**: Web Audio API requires specific array types for audio data
6. **ADHD protocol timing**: Don't abbreviate the duration - therapeutic effect requires full sessions
7. **Field visualization performance**: Use requestAnimationFrame, not setInterval
8. **Frequency validation**: Ensure frequencies are within human audible range and safe limits

### Development Gotchas:

1. **Windows line endings**: Git will convert LF to CRLF automatically
2. **Python 3.13 compatibility**: Some packages may not have wheels yet
3. **CORS in development**: Frontend/backend on different ports needs proper CORS setup
4. **WebSocket connection limits**: Browser limits concurrent connections
5. **Audio latency**: Buffer sizes affect both latency and stability
6. **React strict mode**: Effects run twice in development, handle audio cleanup properly
7. **NEVER WRITE** **Completed by:** Claude or Anthorpic or anything that isn't fucking the author of the project..
8. **NEVER FORGET**: Check project for nay mentions of authored by Claude or Anthropic AI or anything close, only author is author!!!!!!!!!

## AUDIOWORKLET IMPLEMENTATION PATTERNS

### Modern Audio Processing with AudioWorklet

**⚠️ CRITICAL**: `ScriptProcessorNode` is deprecated. Use `AudioWorklet` for real-time audio processing.

### Basic AudioWorklet Setup Pattern

```javascript
// 1. Create AudioWorkletProcessor (separate file: audio-processor.js)
class BinauralProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.leftFreq = options.processorOptions?.leftFreq || 140;
    this.rightFreq = options.processorOptions?.rightFreq || 144;
    this.amplitude = options.processorOptions?.amplitude || 0.5;
    this.phase = { left: 0, right: 0 };
    this.sampleRate = 44100; // Will be set correctly by browser
  }

  static get parameterDescriptors() {
    return [
      { name: 'leftFreq', defaultValue: 140, minValue: 20, maxValue: 20000 },
      { name: 'rightFreq', defaultValue: 144, minValue: 20, maxValue: 20000 },
      { name: 'amplitude', defaultValue: 0.5, minValue: 0, maxValue: 1 }
    ];
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const leftChannel = output[0];
    const rightChannel = output[1];
    
    // Get parameter values (can change per block)
    const leftFreq = parameters.leftFreq;
    const rightFreq = parameters.rightFreq;
    const amplitude = parameters.amplitude;
    
    for (let i = 0; i < leftChannel.length; i++) {
      // Use parameter array or constant value
      const currentLeftFreq = leftFreq.length > 1 ? leftFreq[i] : leftFreq[0];
      const currentRightFreq = rightFreq.length > 1 ? rightFreq[i] : rightFreq[0];
      const currentAmplitude = amplitude.length > 1 ? amplitude[i] : amplitude[0];
      
      // Generate binaural audio
      leftChannel[i] = Math.sin(this.phase.left) * currentAmplitude;
      rightChannel[i] = Math.sin(this.phase.right) * currentAmplitude;
      
      // Update phase (maintain phase continuity)
      this.phase.left += (2 * Math.PI * currentLeftFreq) / this.sampleRate;
      this.phase.right += (2 * Math.PI * currentRightFreq) / this.sampleRate;
      
      // Prevent phase drift
      if (this.phase.left > 2 * Math.PI) this.phase.left -= 2 * Math.PI;
      if (this.phase.right > 2 * Math.PI) this.phase.right -= 2 * Math.PI;
    }
    
    return true; // Keep processor alive
  }
}

registerProcessor('binaural-processor', BinauralProcessor);

// 2. Load and use AudioWorklet (main thread)
async function initializeAudioWorklet(audioContext) {
  try {
    // Load the processor
    await audioContext.audioWorklet.addModule('/audio-processor.js');
    
    // Create AudioWorkletNode
    const binauralNode = new AudioWorkletNode(audioContext, 'binaural-processor', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2], // Stereo output
      processorOptions: {
        leftFreq: 130,
        rightFreq: 144,
        amplitude: 0.5
      }
    });
    
    // Connect to audio graph
    binauralNode.connect(audioContext.destination);
    
    // Real-time parameter updates
    binauralNode.parameters.get('leftFreq').setValueAtTime(140, audioContext.currentTime);
    binauralNode.parameters.get('rightFreq').setValueAtTime(144, audioContext.currentTime);
    
    return binauralNode;
  } catch (error) {
    console.error('Failed to initialize AudioWorklet:', error);
    throw error;
  }
}
```

### Message Passing Between Threads

```javascript
// In AudioWorkletProcessor
class MessageProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = (event) => {
      if (event.data.type === 'updateFrequencies') {
        this.leftFreq = event.data.leftFreq;
        this.rightFreq = event.data.rightFreq;
      }
    };
  }
  
  process(inputs, outputs, parameters) {
    // Send data back to main thread
    this.port.postMessage({
      type: 'audioMetrics',
      data: { 
        currentPhase: this.phase,
        processedSamples: outputs[0][0].length 
      }
    });
    return true;
  }
}

// In main thread
const workletNode = new AudioWorkletNode(audioContext, 'message-processor');
workletNode.port.onmessage = (event) => {
  if (event.data.type === 'audioMetrics') {
    console.log('Audio metrics:', event.data.data);
  }
};

// Send message to processor
workletNode.port.postMessage({
  type: 'updateFrequencies',
  leftFreq: 140,
  rightFreq: 144
});
```

### Backend Audio Frame Processing with AudioWorklet

```javascript
// For processing backend-generated audio frames
class BackendFrameProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.audioBuffer = { left: new Float32Array(4096), right: new Float32Array(4096) };
    this.bufferIndex = 0;
    
    this.port.onmessage = (event) => {
      if (event.data.type === 'audioFrame') {
        // Receive audio frame from backend
        this.audioBuffer.left = new Float32Array(event.data.left);
        this.audioBuffer.right = new Float32Array(event.data.right);
        this.bufferIndex = 0;
      }
    };
  }
  
  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const leftChannel = output[0];
    const rightChannel = output[1];
    
    for (let i = 0; i < leftChannel.length; i++) {
      if (this.bufferIndex < this.audioBuffer.left.length) {
        leftChannel[i] = this.audioBuffer.left[this.bufferIndex];
        rightChannel[i] = this.audioBuffer.right[this.bufferIndex];
        this.bufferIndex++;
      } else {
        // Fill with silence when buffer exhausted
        leftChannel[i] = 0;
        rightChannel[i] = 0;
      }
    }
    
    return true;
  }
}
```

### Migration from ScriptProcessorNode

**OLD (Deprecated)**:
```javascript
const scriptProcessor = audioContext.createScriptProcessor(4096, 0, 2);
scriptProcessor.onaudioprocess = (event) => {
  // Process audio on main thread (BAD - blocks UI)
};
```

**NEW (AudioWorklet)**:
```javascript
await audioContext.audioWorklet.addModule('processor.js');
const workletNode = new AudioWorkletNode(audioContext, 'my-processor');
// Processing happens on dedicated audio thread (GOOD)
```

### Performance Best Practices

1. **Keep processor logic minimal** - Heavy computation should be pre-calculated
2. **Use parameter automation** instead of message passing for frequent updates
3. **Batch message passing** - Don't send messages every frame
4. **Proper buffer management** - Avoid memory allocations in process() method
5. **Phase continuity** - Maintain phase across audio blocks for smooth playback

### Error Handling and Fallbacks

```javascript
async function createModernAudioEngine(audioContext) {
  try {
    // Try AudioWorklet first
    await audioContext.audioWorklet.addModule('processor.js');
    return new AudioWorkletNode(audioContext, 'my-processor');
  } catch (error) {
    console.warn('AudioWorklet not supported, falling back to Web Audio nodes');
    // Fallback to oscillator nodes for basic functionality
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.connect(gain);
    return { oscillator, gain };
  }
}
```

### EBL-Specific AudioWorklet Considerations

1. **Binaural Beat Precision**: Maintain exact frequency relationships for therapeutic effectiveness
2. **Phase Continuity**: Critical for preventing audio artifacts during frequency transitions  
3. **WebSocket Integration**: Use message passing to receive backend-generated audio frames
4. **Parameter Automation**: Smooth frequency changes during ADHD protocol progressions
5. **Spatial Audio**: Implement panning and reverb within AudioWorklet for 8D audio effects
6. **Performance Monitoring**: Track processing latency and buffer underruns

### Browser Support and Security

- **Requires HTTPS** - AudioWorklet only works in secure contexts
- **Module loading** - Processor files must be served from same origin
- **Browser support** - All modern browsers since 2021
- **Fallback strategy** - Always provide Web Audio API fallback for older browsers