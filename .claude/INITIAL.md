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