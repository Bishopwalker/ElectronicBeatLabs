# Electromagnetic Beat Lab - Examples & Documentation

This directory contains comprehensive examples and documentation for implementing the Electromagnetic Beat Lab (EBL) system. These examples provide working implementations of key components and serve as reference for development.

## 📁 File Overview

### HTML Examples
- **`binauralbeats.html`** - Enhanced binaural beat generator with professional UI, ADHD presets, and real-time visualization
- **`adhd-protocol-example.html`** - Complete SMR training protocol demo with multi-stage progression and research background
- **`em-field-visualization.html`** - Interactive electromagnetic field visualization with multiple patterns and synchronization controls

### JavaScript Examples
- **`binural.js`** - Core Web Audio API implementation for binaural beat generation
- **`websocket-streaming-example.js`** - Complete WebSocket client for real-time audio/field streaming with performance monitoring

## 🎵 Binaural Beats Example (`binauralbeats.html`)

### Features
- Professional gradient UI with glassmorphism effects
- Real-time frequency display and brainwave categorization
- 6 scientific presets (Delta through Gamma ranges)
- Visual waveform animation synchronized with beat frequency
- Volume controls and safety limits
- Comprehensive usage instructions and brainwave guide

### Key Components
```javascript
// Core binaural beat generation
function start() {
    oscillator1 = context.createOscillator();
    oscillator2 = context.createOscillator();
    oscillator1.frequency.value = leftFreq;
    oscillator2.frequency.value = rightFreq;
    // Stereo separation for binaural effect
}
```

### Usage
1. Open `binauralbeats.html` in a modern web browser
2. Put on headphones (essential for binaural effect)
3. Select a preset or adjust frequencies manually
4. Click "Start Session" and adjust volume as needed

## 🧠 ADHD Protocol Example (`adhd-protocol-example.html`)

### Features
- Complete SMR Training protocol implementation
- Multi-stage progression (Warm-up → Core Training → Cool-down)
- Real-time session timer and progress tracking
- Research-backed frequency sequences
- Visual stage indicators and parameter display
- Expected benefits documentation

### Protocol Specifications
```javascript
const SMR_PROTOCOL = {
    totalDuration: 30 * 60, // 30 minutes
    stages: [
        { duration: 5*60, base_frequency: 180, beat_frequency: 12 }, // Warm-up
        { duration: 20*60, base_frequency: 200, beat_frequency: 14 }, // Core
        { duration: 5*60, base_frequency: 180, beat_frequency: 10 }   // Cool-down
    ]
};
```

### Research Background
- Based on Sterman & Lubar SMR protocols from the 1970s
- Clinical studies show 60-80% improvement rates in ADHD symptoms
- Recommended usage: Daily sessions for 8-12 weeks
- Target frequency: 12-15 Hz (Sensorimotor Rhythm band)

## ⚡ EM Field Visualization (`em-field-visualization.html`)

### Features
- 4 field patterns: Toroidal, Spherical, Vortex, Standing Wave
- Real-time field calculation and rendering at 60 FPS
- Interactive parameter controls (frequency, intensity, speed)
- Audio synchronization mode
- Field metrics (energy density, coherence)
- Pattern descriptions with therapeutic context

### Field Patterns

#### Toroidal Field
- **Use Case**: Enhanced focus and mental clarity
- **Calculation**: Rotating torus with beat frequency modulation
- **Effect**: Stable, enclosed field for centering and concentration

#### Spherical Harmonic
- **Use Case**: Deep meditation and expanded awareness
- **Calculation**: Pulsating spherical waves with harmonics
- **Effect**: Concentric waves for enhanced entrainment

#### Vortex Spiral
- **Use Case**: Breaking through mental blocks
- **Calculation**: Dynamic spiral with radial decay
- **Effect**: Inward-drawing pattern for intense focus

#### Standing Wave
- **Use Case**: Cognitive processing and memory consolidation
- **Calculation**: Interference patterns with complex geometry
- **Effect**: Multi-region brain stimulation

## 🌐 WebSocket Streaming (`websocket-streaming-example.js`)

### Features
- Complete WebSocket client implementation
- Real-time audio and field data streaming at 60 FPS
- Automatic reconnection with exponential backoff
- Performance monitoring (FPS, latency, frame counts)
- Audio context management for Web Audio API
- Field visualization callback system

### Usage Example
```javascript
// Initialize client
const client = new EBLWebSocketClient('ws://localhost:8000');

// Connect and start streaming
await client.connect();
client.startStream({
    base_frequency: 200,
    beat_frequency: 14,
    field_pattern: 'toroidal',
    amplitude: 0.5
});

// Register field visualization callback
client.onFieldUpdate((fieldData) => {
    renderFieldVisualization(fieldData);
});
```

### Performance Specifications
- **Target FPS**: 60 frames per second
- **Latency**: < 50ms WebSocket round-trip
- **Audio Format**: 32-bit float PCM, 44.1kHz stereo
- **Field Resolution**: 64x64 grid
- **Reconnection**: Up to 5 attempts with exponential backoff

## 🔧 Integration Guide

### Frontend Integration
1. **Include Scripts**: Add the JavaScript files to your HTML page
2. **Initialize Audio Context**: Handle Chrome's autoplay policy
3. **Set Up WebSocket**: Connect to backend server
4. **Handle User Interactions**: Ensure user gesture for audio

```html
<script src="binural.js"></script>
<script src="websocket-streaming-example.js"></script>
<script>
    // Initialize after user interaction
    document.addEventListener('click', async () => {
        const client = new EBLWebSocketClient();
        await client.connect();
        client.startStream({ beat_frequency: 14 });
    }, { once: true });
</script>
```

### Backend Requirements
- **FastAPI Server**: Running on port 8000
- **WebSocket Endpoint**: `/ws/{session_id}`
- **CORS Configuration**: Allow localhost origins
- **Audio Generation**: NumPy-based synthesis at 44.1kHz
- **Field Simulation**: SciPy-based pattern calculation

## 🧪 Testing & Validation

### Audio Testing
```javascript
// Frequency accuracy validation
function validateFrequencies(leftFreq, rightFreq, expectedBeat) {
    const actualBeat = Math.abs(rightFreq - leftFreq);
    const tolerance = 0.01; // 0.01 Hz tolerance
    return Math.abs(actualBeat - expectedBeat) < tolerance;
}
```

### WebSocket Testing
```javascript
// Connection health monitoring
setInterval(() => {
    const stats = client.getStats();
    console.log(`Performance: ${stats.fps.toFixed(1)} FPS, ${stats.latency}ms latency`);
}, 5000);
```

## 📱 Browser Compatibility

### Supported Browsers
- **Chrome 66+**: Full Web Audio API and WebSocket support
- **Firefox 60+**: Complete compatibility
- **Safari 14+**: iOS and macOS support
- **Edge 79+**: Chromium-based versions

### Required Features
- Web Audio API (AudioContext, OscillatorNode)
- WebSocket with binary message support
- Canvas 2D for field visualization
- ES6+ JavaScript features

## 🚨 Safety & Best Practices

### Audio Safety
- **Maximum Volume**: Limited to 80% to prevent hearing damage
- **Gradual Transitions**: Smooth frequency changes prevent startle response
- **Session Limits**: Recommended maximum 60 minutes per session
- **Headphone Requirement**: Essential for proper binaural effect

### Performance Optimization
- **Frame Rate Monitoring**: Target 60 FPS with performance fallback
- **Memory Management**: Proper cleanup of audio contexts and WebSocket connections
- **Error Handling**: Graceful degradation when features unavailable
- **Battery Consideration**: Pause streaming when page hidden

## 📊 ADHD Research Context

### Clinical Validation
- **SMR Training**: 70+ published studies since 1970s
- **Improvement Rates**: 60-80% of participants show significant improvement
- **Session Requirements**: Typically 40+ sessions for lasting effects
- **Age Range**: Effective from children (6+) to adults

### Frequency Specifications
- **SMR Band**: 12-15 Hz for attention and impulse control
- **Alpha Training**: 8-12 Hz for relaxation and anxiety reduction
- **Beta Enhancement**: 15-20 Hz for cognitive performance
- **Theta Suppression**: Reduce 4-8 Hz activity in ADHD

### Treatment Protocols
1. **Initial Assessment**: Baseline EEG if available
2. **Protocol Selection**: Based on primary symptoms
3. **Session Scheduling**: 2-3 times per week recommended
4. **Progress Monitoring**: Track symptom improvements
5. **Maintenance**: Periodic sessions after initial training

## 🔗 Related Resources

### Scientific References
- [Sterman & Lubar SMR Research](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2755331/)
- [Binaural Beat Meta-Analysis](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4428073/)
- [ADHD Neurofeedback Guidelines](https://isnr.net/guidelines)

### Technical Documentation
- [Web Audio API Specification](https://www.w3.org/TR/webaudio/)
- [WebSocket Protocol RFC](https://tools.ietf.org/html/rfc6455)
- [FastAPI WebSocket Documentation](https://fastapi.tiangolo.com/advanced/websockets/)

## 🚀 Next Steps

### Development Priorities
1. **Backend Integration**: Connect examples to Python FastAPI server
2. **Mobile Optimization**: Touch-friendly controls and responsive design
3. **Session Recording**: Save and replay therapy sessions
4. **Progress Tracking**: Long-term usage analytics and improvement metrics
5. **Advanced Protocols**: Additional research-based frequency sequences

### Enhancement Ideas
- **EEG Integration**: Real-time brainwave monitoring
- **Machine Learning**: Personalized protocol optimization
- **Group Sessions**: Multi-user synchronized experiences
- **Clinical Dashboard**: Therapist monitoring and adjustment tools

---

*These examples provide a complete foundation for implementing the Electromagnetic Beat Lab system. They demonstrate best practices for audio generation, field visualization, and real-time streaming while maintaining scientific accuracy and therapeutic effectiveness.*