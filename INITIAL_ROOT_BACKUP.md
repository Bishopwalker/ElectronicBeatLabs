# Electromagnetic Beat Lab (EBL) - Complete Implementation Guide

## PROJECT OVERVIEW

**Electromagnetic Beat Lab** is a real-time binaural beats and electromagnetic field generation system designed for ADHD symptom management and cognitive enhancement. The system combines precise audio synthesis with synchronized field visualizations to create immersive therapeutic experiences.

### Core Mission
- Provide science-based binaural beat protocols for ADHD treatment
- Generate real-time electromagnetic field simulations synchronized with audio
- Deliver therapeutic audio through WebSocket streaming with 8D spatial processing
- Create an accessible, web-based platform for neurofeedback therapy

### Target Users
- Individuals with ADHD seeking non-pharmaceutical interventions
- Researchers studying brainwave entrainment effects
- Therapists incorporating binaural beats into treatment protocols
- Developers building neurofeedback applications

## TECHNICAL ARCHITECTURE

### Full Stack Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/TypeScript)              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Web Audio API │  │ Material-UI     │  │ WebGL/Three  │ │
│  │   Binaural Gen  │  │ Controls        │  │ Field Viz    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│           │                     │                   │       │
│           └─────────────────────┼───────────────────┘       │
│                                 │                           │
└─────────────────────────────────┼───────────────────────────┘
                                  │ WebSocket Connection
                                  │ (Real-time streaming)
┌─────────────────────────────────┼───────────────────────────┐
│                    BACKEND (FastAPI/Python)                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Audio Engine  │  │ Field Simulator │  │ ADHD Proto   │ │
│  │   NumPy/SciPy   │  │ SciPy/Patterns  │  │ Science Base │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Core Components
1. **Audio Engine (Python)**: 44.1kHz phase-continuous binaural beat generation
2. **Field Simulator (Python)**: Real-time EM field pattern calculation (toroidal, spherical, vortex)
3. **WebSocket Streamer**: 60 FPS audio/field data streaming with session management
4. **React Frontend**: Real-time visualization, controls, and protocol selection
5. **ADHD Protocol Engine**: Science-based frequency sequences for therapeutic outcomes

### Data Flow
```
User Input → Protocol Selection → Frequency Calculation → 
Audio Generation (Python) → Field Calculation (SciPy) → 
WebSocket Streaming → Real-time Visualization (React) → 
Therapeutic Audio Output (Web Audio API)
```

## SCIENTIFIC FOUNDATION

### Binaural Beats Research
**Primary mechanism**: When two slightly different frequencies are presented to each ear, the brain perceives a "beat" frequency equal to the difference. This beat frequency can potentially influence brainwave states through neural entrainment.

**Key Research Papers**:
- Oster, G. (1973). "Auditory beats in the brain" - Foundational research on binaural beats
- Padmanabhan et al. (2005). "A prospective, randomised, controlled study examining binaural beat audio and pre-operative anxiety"
- Chaieb et al. (2015). "Auditory beat stimulation and its effects on cognition and mood states"

### ADHD-Specific Applications
**SMR Training (12-15 Hz)**:
- Sensorimotor Rhythm training pioneered by Sterman & Lubar
- Shown to reduce hyperactivity and improve attention in ADHD
- Protocols typically require 20-30 minutes for therapeutic effect

**Theta Suppression (4-8 Hz)**:
- Excessive theta waves associated with ADHD symptoms
- Beta enhancement protocols (13-20 Hz) can suppress excess theta
- Research by Monastra et al. demonstrates efficacy

### Brainwave Frequency Bands
- **Delta (0.5-4 Hz)**: Deep sleep, regeneration, healing
- **Theta (4-8 Hz)**: Deep meditation, creativity, memory consolidation
- **Alpha (8-13 Hz)**: Relaxed awareness, flow states, stress reduction
- **SMR (12-15 Hz)**: Sensorimotor rhythm, attention, impulse control
- **Beta (13-30 Hz)**: Focus, concentration, cognitive performance
- **Gamma (30-100 Hz)**: Peak performance, cognitive binding, awareness

## IMPLEMENTATION SPECIFICATIONS

### Audio Engine Requirements
```python
# Core specifications for audio generation
SAMPLE_RATE = 44100  # CD quality
FRAME_SIZE = 1024    # 60 FPS streaming (44100/1024 ≈ 43 FPS)
CHANNELS = 2         # Stereo for binaural effect
BIT_DEPTH = 32       # Float32 for processing
FREQUENCY_RANGE = (20, 1000)    # Base frequency limits
BEAT_RANGE = (0.5, 100)         # Beat frequency limits
AMPLITUDE_RANGE = (0.0, 0.8)    # Safety limits
```

### WebSocket Protocol
```typescript
// Message format for real-time streaming
interface AudioFrame {
  type: "audio_frame";
  timestamp: number;
  left: Float32Array;   // Left channel audio data
  right: Float32Array;  // Right channel audio data
  sample_rate: number;
  frame_size: number;
}

interface FieldFrame {
  type: "field_frame";
  timestamp: number;
  pattern: string;      // "toroidal" | "spherical" | "vortex" | "wave"
  field_data: number[][]; // 64x64 field visualization grid
  intensity: number;
  frequency: number;
}

interface SessionControl {
  type: "session_control";
  action: "start" | "stop" | "update";
  settings: {
    base_frequency: number;
    beat_frequency: number;
    amplitude: number;
    field_pattern: string;
    protocol?: string;
  };
}
```

### ADHD Protocol Specifications
```python
# Multi-stage protocol example: SMR Training
SMR_TRAINING_PROTOCOL = {
    "name": "SMR Training",
    "description": "Sensorimotor Rhythm training for ADHD symptom management",
    "total_duration": 30,  # minutes
    "stages": [
        {
            "duration": 5,
            "base_frequency": 180,
            "beat_frequency": 12,
            "description": "Warm-up with low SMR"
        },
        {
            "duration": 20,
            "base_frequency": 200,
            "beat_frequency": 14,
            "description": "Core SMR training"
        },
        {
            "duration": 5,
            "base_frequency": 180,
            "beat_frequency": 10,
            "description": "Cool-down to alpha"
        }
    ],
    "field_pattern": "toroidal",
    "research_basis": "Sterman & Lubar SMR protocols"
}
```

## DOCUMENTATION & REFERENCES

### Primary Research Sources

**Binaural Beats & Brainwave Entrainment**:
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4428073/ - "Binaural beats to entrain the brain? A systematic review"
- https://www.frontiersin.org/articles/10.3389/fnhum.2013.00786/full - "Auditory Beat Stimulation and its Effects on Cognition and Mood States"
- https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0006027 - "Entrainment of perceptually relevant brain oscillations by non-invasive rhythmic stimulation"

**ADHD Neurofeedback Research**:
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2755331/ - "EEG and neurofeedback findings in ADHD"
- https://link.springer.com/article/10.1007/s10484-005-6382-1 - "Electroencephalographic biofeedback in the treatment of attention-deficit/hyperactivity disorder"
- https://www.tandfonline.com/doi/abs/10.1300/J184v09n04_04 - "Quantitative EEG and neurofeedback in children and adolescents with ADHD"

**Audio Processing & HRTF Research**:
- https://sound.media.mit.edu/resources/KEMAR.html - MIT KEMAR HRTF Database
- https://www.aes.org/e-lib/browse.cfm?elib=14611 - "Head-Related Transfer Functions and Virtual Auditory Displays"
- https://ccrma.stanford.edu/~jos/pasp/ - "Physical Audio Signal Processing" by Julius O. Smith III

### Technical Documentation

**Web Audio API**:
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API - MDN Web Audio API Reference
- https://www.w3.org/TR/webaudio/ - W3C Web Audio API Specification
- https://tonejs.github.io/ - Tone.js Library Documentation

**FastAPI & WebSocket Implementation**:
- https://fastapi.tiangolo.com/advanced/websockets/ - FastAPI WebSocket Documentation  
- https://websockets.readthedocs.io/ - Python WebSockets Library
- https://docs.python.org/3/library/asyncio.html - Python Asyncio Documentation

**GitLab CI/CD**:
- https://docs.gitlab.com/ci/ - GitLab CI/CD Documentation
- https://docs.gitlab.com/ci/yaml/ - GitLab CI/CD YAML Reference
- https://docs.gitlab.com/ci/pipelines/ - GitLab Pipelines Documentation
- https://docs.gitlab.com/ci/docker/ - GitLab Docker Integration

**Scientific Computing Libraries**:
- https://numpy.org/doc/stable/ - NumPy Documentation
- https://docs.scipy.org/doc/scipy/ - SciPy Documentation  
- https://matplotlib.org/stable/contents.html - Matplotlib Documentation

**Testing Frameworks**:
- https://jestjs.io/docs/getting-started - Jest Testing Framework
- https://jestjs.io/docs/tutorial-react - Jest React Testing Tutorial
- https://cucumber.io/docs/cucumber/ - Cucumber BDD Testing Framework

**React & Visualization**:
- https://threejs.org/docs/ - Three.js Documentation
- https://docs.pmnd.rs/react-three-fiber/getting-started/introduction - React Three Fiber
- https://mui.com/material-ui/getting-started/overview/ - Material-UI Documentation

### Research Institutions & Labs

**Neurofeedback Research Centers**:
- EEG Institute (Los Angeles) - http://www.eeginfo.com/
- Applied Neuroscience Inc. - https://www.appliedneuroscience.com/
- International Society for Neurofeedback Research - https://www.isnr.org/

**Academic Research Groups**:
- MIT Computer Science and Artificial Intelligence Laboratory - https://www.csail.mit.edu/
- Stanford CCRMA (Center for Computer Research in Music and Acoustics) - https://ccrma.stanford.edu/
- UCLA Neuroscience Research - https://www.neuroscience.ucla.edu/

### Open Source Projects & Libraries

**Audio Processing**:
- https://github.com/librosa/librosa - Python audio analysis library
- https://github.com/Tonejs/Tone.js - Web Audio framework
- https://github.com/goldfire/howler.js - JavaScript audio library

**Visualization**:
- https://github.com/pmndrs/react-three-fiber - React Three.js renderer
- https://github.com/pmndrs/drei - React Three.js helpers
- https://github.com/mrdoob/three.js - Three.js 3D library

**Scientific Computing**:
- https://github.com/numpy/numpy - NumPy numerical computing
- https://github.com/scipy/scipy - SciPy scientific computing
- https://github.com/matplotlib/matplotlib - Matplotlib plotting

## DEVELOPMENT GUIDELINES

### Phase 1: Core Audio Engine (Week 1)
1. **Audio Generation System**:
   - Implement phase-continuous sine wave generation
   - Add binaural beat calculation with precise frequency control
   - Create envelope systems for smooth transitions
   - Implement safety limiting and amplitude control

2. **WebSocket Streaming**:
   - Set up FastAPI WebSocket server with session management
   - Implement 60 FPS audio frame streaming
   - Add connection lifecycle management
   - Create error handling and reconnection logic

3. **Basic Testing**:
   - Unit tests for audio generation algorithms
   - WebSocket connection tests
   - Frequency accuracy validation
   - Performance benchmarking

### Phase 2: ADHD Protocols (Week 2)
1. **Protocol Engine**:
   - Implement multi-stage protocol system
   - Add automatic progression between stages
   - Create protocol validation and safety checks
   - Build protocol library with research-based sequences

2. **Scientific Accuracy**:
   - Validate frequency generation precision
   - Implement gradual transition algorithms
   - Add session timing and progress tracking
   - Create effectiveness measurement hooks

### Phase 3: Visualization System (Week 3)
1. **EM Field Simulation**:
   - Implement toroidal, spherical, and vortex patterns
   - Add real-time field calculation using SciPy
   - Create field synchronization with audio beats
   - Optimize for 60 FPS rendering performance

2. **React Integration**:
   - Build Three.js-based field visualizer
   - Add real-time WebSocket data consumption
   - Create interactive controls for all parameters
   - Implement preset system for common configurations

### Phase 4: Advanced Features (Week 4)
1. **8D Spatial Audio**:
   - Implement HRTF-based positioning
   - Add movement patterns (circle, figure-8, spiral)
   - Create distance and elevation processing
   - Add interaural time/level difference calculations

2. **User Experience**:
   - Build comprehensive control interface
   - Add session recording and playback
   - Create progress tracking and analytics
   - Implement user preference storage

## TESTING & VALIDATION

### Audio Accuracy Testing
```python
# Frequency precision validation
def test_frequency_accuracy():
    """Ensure generated frequencies match specification within 0.01 Hz"""
    engine = AudioEngine(sample_rate=44100)
    audio = engine.generate_binaural_beat(140, 4, duration=1.0)
    
    # FFT analysis to verify frequencies
    fft = np.fft.rfft(audio)
    freqs = np.fft.rfftfreq(len(audio), 1/44100)
    
    # Find peaks
    peaks = find_peaks(np.abs(fft), height=threshold)
    detected_freqs = freqs[peaks[0]]
    
    assert abs(detected_freqs[0] - 140) < 0.01
    assert abs(detected_freqs[1] - 144) < 0.01
```

### WebSocket Performance Testing
```python
# Stream timing validation
def test_websocket_timing():
    """Ensure 60 FPS streaming performance"""
    client = WebSocketTestClient()
    frame_times = []
    
    for i in range(300):  # 5 seconds at 60 FPS
        frame = client.receive_frame()
        frame_times.append(frame.timestamp)
    
    # Calculate actual FPS
    total_time = frame_times[-1] - frame_times[0]
    actual_fps = len(frame_times) / total_time
    
    assert 58 <= actual_fps <= 62  # Allow 2 FPS tolerance
```

### Protocol Validation
```python
# ADHD protocol timing verification
def test_smr_protocol_timing():
    """Validate SMR protocol follows exact timing specifications"""
    protocol = ADHDProtocols().get_protocol("smr_training")
    
    total_time = sum(stage["duration"] for stage in protocol["stages"])
    assert total_time == 30  # 30 minutes total
    
    # Verify stage transitions are smooth
    for i in range(len(protocol["stages"]) - 1):
        current_freq = protocol["stages"][i]["beat_frequency"]
        next_freq = protocol["stages"][i + 1]["beat_frequency"]
        
        # Maximum 4 Hz jump between stages
        assert abs(current_freq - next_freq) <= 4
```

## DEPLOYMENT CONFIGURATION

### Production Environment Setup
```bash
# Frontend deployment (Vite build)
npm run build
# Serves from dist/ directory

# Backend deployment (Docker recommended)
FROM python:3.11-slim
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Environment Variables
```bash
# Backend configuration
FASTAPI_PORT=8000
CORS_ORIGINS=https://yourdomain.com
WEBSOCKET_MAX_CONNECTIONS=100
AUDIO_CHUNK_SIZE=1024
FIELD_GRID_SIZE=64
DEBUG_LOGGING=false

# Frontend configuration
VITE_WEBSOCKET_URL=wss://yourdomain.com/ws
VITE_API_BASE_URL=https://yourdomain.com/api
VITE_ENABLE_ANALYTICS=true
```

### Performance Requirements
- **Latency**: < 50ms WebSocket round-trip
- **Throughput**: Support 100 concurrent sessions
- **Accuracy**: Frequency precision ± 0.01 Hz
- **Reliability**: 99.9% uptime for continuous sessions
- **Bandwidth**: ~200 KB/s per active session

## SUCCESS METRICS

### Technical Metrics
- Audio generation latency < 10ms
- WebSocket frame delivery 99.5% success rate
- Memory usage < 100MB per session
- CPU usage < 50% for 50 concurrent sessions

### Therapeutic Effectiveness
- Session completion rates > 80%
- User-reported symptom improvement
- EEG validation of brainwave entrainment
- Long-term usage patterns and retention

### User Experience
- Interface responsiveness < 100ms
- Zero audio artifacts or dropouts
- Intuitive protocol selection process
- Clear progress indication and feedback

## SECURITY & SAFETY CONSIDERATIONS

### Audio Safety
- Maximum amplitude limiting to prevent hearing damage
- Gradual volume transitions to prevent startle response
- Frequency validation to ensure therapeutic ranges
- Session duration limits to prevent overexposure

### Data Privacy
- No audio recording or storage without explicit consent
- Session data anonymization for analytics
- Secure WebSocket connections (WSS) in production
- GDPR-compliant user data handling

### Content Safety
- Research-backed protocol validation
- Clear disclaimers about medical limitations
- Age-appropriate content restrictions
- Professional consultation recommendations

---

*This document serves as the comprehensive implementation guide for the Electromagnetic Beat Lab project. All development should reference these specifications and follow the outlined architecture patterns for consistency and therapeutic effectiveness.*