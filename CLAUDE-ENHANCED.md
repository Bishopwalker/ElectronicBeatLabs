# CLAUDE.md - Electromagnetic Beat Lab Implementation Guide

This file provides comprehensive, domain-specific guidance for implementing the 8D Electromagnetic Lucid Dream Laboratory.

## 🎯 Project Overview

Building a real-time binaural beat generator with 8D spatial audio processing, electromagnetic field visualization, and WebSocket streaming between React frontend and Python backend.

## 🏗️ Architecture

```
Frontend (React/TypeScript)          Backend (FastAPI/Python)
├── Web Audio API                    ├── PyAudio engine
├── Binaural oscillators             ├── NumPy signal generation
├── HRTF spatial processing          ├── SciPy DSP filters
├── 3D orb visualization             ├── Electromagnetic simulation
├── WebSocket client                 ├── WebSocket server
└── Real-time controls               └── Audio streaming
           ↕                                    ↕
        WebSocket Protocol (Binary + JSON)
```

## 📦 Required Dependencies

### Frontend
```json
{
  "dependencies": {
    "@react-three/fiber": "^8.0.0",    // 3D visualization
    "@react-three/drei": "^9.0.0",      // 3D helpers
    "socket.io-client": "^4.5.0",       // WebSocket client
    "wavesurfer.js": "^7.0.0",          // Audio waveform viz
    "tone": "^14.7.77"                  // Advanced Web Audio
  }
}
```

### Backend
```txt
# requirements.txt
fastapi==0.104.0
uvicorn[standard]==0.24.0
websockets==12.0
pyaudio==0.2.13
numpy==1.24.3
scipy==1.11.3
pydantic==2.4.2
python-multipart==0.0.6
aiofiles==23.2.1
```

## 🎵 Core Audio Implementation

### 1. Binaural Beat Generation (Python Backend)

```python
# backend/audio/binaural_generator.py
import numpy as np
import pyaudio
from typing import Tuple

class BinauralBeatGenerator:
    """Generate binaural beats with precise frequency control."""
    
    SAMPLE_RATE = 44100  # CD quality
    CHUNK_SIZE = 1024     # Buffer size for streaming
    CHANNELS = 2          # Stereo for L/R ear difference
    
    def __init__(self):
        self.p = pyaudio.PyAudio()
        self.stream = None
        self.base_frequency = 440.0
        self.beat_frequency = 5.0
        
    def generate_chunk(self, duration: float = 0.023) -> np.ndarray:
        """Generate a chunk of binaural audio.
        
        Args:
            duration: Chunk duration in seconds (1024/44100 ≈ 0.023)
            
        Returns:
            Stereo audio array with binaural beat
        """
        samples = int(self.SAMPLE_RATE * duration)
        t = np.linspace(0, duration, samples, False)
        
        # Left ear: base frequency
        left = np.sin(2 * np.pi * self.base_frequency * t)
        
        # Right ear: base + beat frequency  
        right = np.sin(2 * np.pi * (self.base_frequency + self.beat_frequency) * t)
        
        # Combine into stereo signal
        stereo = np.column_stack((left, right))
        
        # Convert to int16 for PyAudio
        return (stereo * 32767).astype(np.int16)
```

### 2. 8D Spatial Audio Processing

```python
# backend/audio/spatial_processor.py
import numpy as np
from scipy import signal
from typing import Literal

PatternType = Literal["circle", "figure8", "spiral", "vortex", "pendulum"]

class SpatialAudioProcessor:
    """Apply HRTF-based 8D movement patterns to audio."""
    
    def __init__(self):
        self.azimuth = 0.0      # Horizontal angle
        self.elevation = 0.0    # Vertical angle
        self.distance = 1.0     # Distance from head
        self.pattern = "circle"
        self.speed = 1.0
        
    def apply_hrtf(self, audio: np.ndarray, position: Tuple[float, float, float]) -> np.ndarray:
        """Apply Head-Related Transfer Function for 3D positioning.
        
        Args:
            audio: Stereo audio signal
            position: (azimuth, elevation, distance) in degrees and meters
            
        Returns:
            Spatially processed audio
        """
        azimuth, elevation, distance = position
        
        # Calculate interaural time difference (ITD)
        head_radius = 0.0875  # meters
        speed_of_sound = 343  # m/s
        itd = (head_radius * np.sin(np.radians(azimuth))) / speed_of_sound
        
        # Calculate interaural level difference (ILD)
        ild_db = 20 * np.sin(np.radians(azimuth))  # Simplified model
        
        # Apply ITD as sample delay
        delay_samples = int(abs(itd) * self.SAMPLE_RATE)
        
        if azimuth > 0:  # Sound on right
            # Delay left channel
            audio[:, 0] = np.roll(audio[:, 0], delay_samples)
            # Reduce left channel volume (ILD)
            audio[:, 0] *= 10 ** (-abs(ild_db) / 20)
        else:  # Sound on left
            # Delay right channel
            audio[:, 1] = np.roll(audio[:, 1], delay_samples)
            # Reduce right channel volume
            audio[:, 1] *= 10 ** (-abs(ild_db) / 20)
            
        # Apply distance attenuation
        audio *= 1.0 / max(distance, 0.1)
        
        return audio
    
    def calculate_pattern_position(self, time: float) -> Tuple[float, float, float]:
        """Calculate 3D position based on movement pattern.
        
        Args:
            time: Current time in seconds
            
        Returns:
            (azimuth, elevation, distance) position
        """
        t = time * self.speed
        
        if self.pattern == "circle":
            azimuth = 360 * (t % 1)
            elevation = 0
            distance = 1.0
            
        elif self.pattern == "figure8":
            azimuth = 180 * np.sin(2 * np.pi * t)
            elevation = 90 * np.sin(4 * np.pi * t)
            distance = 1.0
            
        elif self.pattern == "spiral":
            # Golden ratio spiral
            phi = 1.618033988749
            azimuth = 360 * (t * phi % 1)
            elevation = 90 * np.sin(2 * np.pi * t)
            distance = 0.5 + 1.5 * (t % 1)
            
        elif self.pattern == "vortex":
            # Toroidal vortex pattern
            azimuth = 360 * (t % 1)
            elevation = 90 * np.sin(8 * np.pi * t)
            distance = 1.0 + 0.5 * np.sin(4 * np.pi * t)
            
        elif self.pattern == "pendulum":
            azimuth = 90 * np.sin(2 * np.pi * t)
            elevation = 0
            distance = 1.0
            
        return (azimuth, elevation, distance)
```

### 3. WebSocket Streaming Protocol

```python
# backend/websocket/audio_stream.py
from fastapi import WebSocket
import asyncio
import json
import base64

class AudioStreamManager:
    """Manage WebSocket connections for audio streaming."""
    
    def __init__(self, generator: BinauralBeatGenerator, processor: SpatialAudioProcessor):
        self.generator = generator
        self.processor = processor
        self.connections = set()
        
    async def connect(self, websocket: WebSocket):
        """Handle new WebSocket connection."""
        await websocket.accept()
        self.connections.add(websocket)
        
        try:
            await self.handle_messages(websocket)
        finally:
            self.connections.remove(websocket)
            
    async def handle_messages(self, websocket: WebSocket):
        """Process incoming control messages."""
        streaming_task = None
        
        try:
            while True:
                message = await websocket.receive_json()
                
                if message["type"] == "start_stream":
                    streaming_task = asyncio.create_task(
                        self.stream_audio(websocket)
                    )
                    
                elif message["type"] == "update_frequency":
                    self.generator.base_frequency = message["base"]
                    self.generator.beat_frequency = message["beat"]
                    
                elif message["type"] == "update_pattern":
                    self.processor.pattern = message["pattern"]
                    self.processor.speed = message["speed"]
                    
                elif message["type"] == "stop_stream":
                    if streaming_task:
                        streaming_task.cancel()
                        
        except Exception as e:
            print(f"WebSocket error: {e}")
            
    async def stream_audio(self, websocket: WebSocket):
        """Stream audio chunks to client."""
        time = 0.0
        
        while True:
            # Generate binaural beat chunk
            audio_chunk = self.generator.generate_chunk()
            
            # Apply spatial processing
            position = self.processor.calculate_pattern_position(time)
            spatial_audio = self.processor.apply_hrtf(audio_chunk, position)
            
            # Encode and send
            audio_bytes = spatial_audio.tobytes()
            audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
            
            await websocket.send_json({
                "type": "audio_chunk",
                "data": audio_b64,
                "position": {
                    "azimuth": position[0],
                    "elevation": position[1],
                    "distance": position[2]
                },
                "timestamp": time
            })
            
            time += 0.023  # Chunk duration
            await asyncio.sleep(0.02)  # ~50Hz update rate
```

## 🎨 Frontend Audio Implementation

### 1. Web Audio Context Setup

```typescript
// src/audio/AudioEngine.ts
export class AudioEngine {
  private context: AudioContext;
  private leftOscillator: OscillatorNode;
  private rightOscillator: OscillatorNode;
  private merger: ChannelMergerNode;
  private convolver: ConvolverNode;
  
  constructor() {
    this.context = new AudioContext({ sampleRate: 44100 });
    this.setupBinauralOscillators();
    this.setupSpatialProcessing();
  }
  
  private setupBinauralOscillators(): void {
    // Create oscillators for each ear
    this.leftOscillator = this.context.createOscillator();
    this.rightOscillator = this.context.createOscillator();
    
    // Create channel merger for stereo output
    this.merger = this.context.createChannelMerger(2);
    
    // Connect left oscillator to left channel
    this.leftOscillator.connect(this.merger, 0, 0);
    
    // Connect right oscillator to right channel
    this.rightOscillator.connect(this.merger, 0, 1);
  }
  
  private setupSpatialProcessing(): void {
    // Load HRTF impulse response
    this.convolver = this.context.createConvolver();
    
    // Connect merger to convolver for spatial processing
    this.merger.connect(this.convolver);
    this.convolver.connect(this.context.destination);
  }
  
  public setBinauralFrequencies(base: number, beat: number): void {
    this.leftOscillator.frequency.value = base;
    this.rightOscillator.frequency.value = base + beat;
  }
}
```

### 2. WebSocket Audio Streaming Client

```typescript
// src/services/AudioStreamClient.ts
import { io, Socket } from 'socket.io-client';

export class AudioStreamClient {
  private socket: Socket;
  private audioContext: AudioContext;
  private audioQueue: Float32Array[] = [];
  
  constructor(serverUrl: string) {
    this.audioContext = new AudioContext();
    this.socket = io(serverUrl);
    this.setupSocketHandlers();
  }
  
  private setupSocketHandlers(): void {
    this.socket.on('audio_chunk', (data: any) => {
      // Decode base64 audio data
      const audioBytes = atob(data.data);
      const audioArray = new Int16Array(
        audioBytes.split('').map(c => c.charCodeAt(0))
      );
      
      // Convert Int16 to Float32 for Web Audio
      const float32Array = new Float32Array(audioArray.length);
      for (let i = 0; i < audioArray.length; i++) {
        float32Array[i] = audioArray[i] / 32768.0;
      }
      
      // Add to playback queue
      this.audioQueue.push(float32Array);
      this.processAudioQueue();
    });
  }
  
  private async processAudioQueue(): Promise<void> {
    if (this.audioQueue.length === 0) return;
    
    const audioData = this.audioQueue.shift()!;
    const buffer = this.audioContext.createBuffer(
      2, // stereo
      audioData.length / 2,
      44100
    );
    
    // Split interleaved stereo data
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    for (let i = 0; i < leftChannel.length; i++) {
      leftChannel[i] = audioData[i * 2];
      rightChannel[i] = audioData[i * 2 + 1];
    }
    
    // Play buffer
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start();
  }
}
```

## 🧬 Electromagnetic Field Visualization

```python
# backend/electromagnetic/field_simulator.py
import numpy as np
from typing import Tuple

class ElectromagneticFieldSimulator:
    """Simulate toroidal electromagnetic fields synchronized with audio patterns."""
    
    def calculate_toroidal_field(
        self, 
        frequency: float, 
        pattern: str, 
        time: float
    ) -> np.ndarray:
        """Calculate electromagnetic field intensity matrix.
        
        Args:
            frequency: Current binaural beat frequency
            pattern: Current movement pattern
            time: Current time
            
        Returns:
            2D field intensity matrix for visualization
        """
        # Create coordinate grid
        x = np.linspace(-2, 2, 100)
        y = np.linspace(-2, 2, 100)
        X, Y = np.meshgrid(x, y)
        
        # Toroidal field equations
        R = np.sqrt(X**2 + Y**2)
        theta = np.arctan2(Y, X)
        
        # Field intensity based on pattern
        if pattern == "vortex":
            # Maximum toroidal intensity
            field = np.exp(-R**2) * np.cos(4 * theta - frequency * time)
            field *= np.sin(frequency * time / 10)  # Pulsation
            
        elif pattern == "spiral":
            # Golden ratio spiral field
            phi = 1.618033988749
            field = np.exp(-R**2) * np.cos(theta - phi * R - frequency * time)
            
        else:
            # Standard rotating field
            field = np.exp(-R**2) * np.cos(theta - frequency * time)
            
        # Normalize to 0-100% intensity
        field = 100 * (field - field.min()) / (field.max() - field.min())
        
        return field
```

## 📡 FastAPI WebSocket Endpoints

```python
# backend/main.py
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Electromagnetic Beat Lab API")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize audio components
generator = BinauralBeatGenerator()
processor = SpatialAudioProcessor()
stream_manager = AudioStreamManager(generator, processor)
field_simulator = ElectromagneticFieldSimulator()

@app.websocket("/ws/audio")
async def audio_stream_endpoint(websocket: WebSocket):
    """WebSocket endpoint for audio streaming."""
    await stream_manager.connect(websocket)

@app.get("/api/frequencies/{brainwave}")
async def get_optimal_frequency(brainwave: str):
    """Get optimal frequency for target brainwave state."""
    frequencies = {
        "gamma": {"base": 440, "beat": 40, "pattern": "vortex"},
        "beta": {"base": 256, "beat": 20, "pattern": "figure8"},
        "alpha": {"base": 220, "beat": 10, "pattern": "circle"},
        "theta": {"base": 174, "beat": 6, "pattern": "spiral"},
        "delta": {"base": 136, "beat": 2, "pattern": "pendulum"}
    }
    return frequencies.get(brainwave, frequencies["alpha"])

@app.get("/api/electromagnetic/field")
async def get_field_data(frequency: float, pattern: str, time: float):
    """Get current electromagnetic field visualization data."""
    field = field_simulator.calculate_toroidal_field(frequency, pattern, time)
    return {"field": field.tolist(), "max_intensity": float(field.max())}
```

## 🔧 Development Workflow

### Initial Setup
```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
npm install
```

### Running Development Servers
```bash
# Terminal 1: Start backend
uvicorn backend.main:app --reload --port 8000

# Terminal 2: Start frontend
npm run dev
```

### Testing Audio Generation
```python
# test_audio.py
import asyncio
from backend.audio.binaural_generator import BinauralBeatGenerator

async def test_binaural():
    generator = BinauralBeatGenerator()
    generator.base_frequency = 440  # A4
    generator.beat_frequency = 40   # Gamma
    
    for i in range(100):
        chunk = generator.generate_chunk()
        print(f"Generated chunk {i}: {chunk.shape}")
        await asyncio.sleep(0.023)

asyncio.run(test_binaural())
```

## 📊 Performance Optimizations

### Audio Buffer Management
- Maintain 3-5 chunks in buffer for smooth playback
- Use Web Workers for audio processing in frontend
- Implement adaptive bitrate based on network conditions

### WebSocket Optimization
- Binary frames for audio data (more efficient than base64)
- JSON for control messages only
- Implement heartbeat/keepalive mechanism

### Memory Management
- Reuse audio buffers instead of creating new ones
- Implement circular buffer for streaming
- Clean up oscillators and audio nodes when not in use

## 🐛 Common Issues and Solutions

### Issue: Audio crackling/popping
**Solution**: Increase buffer size or implement crossfading between chunks

### Issue: WebSocket connection drops
**Solution**: Implement reconnection logic with exponential backoff

### Issue: High CPU usage
**Solution**: Move audio processing to Web Workers or reduce sample rate

### Issue: Synchronization drift
**Solution**: Use timestamp-based synchronization, not frame counting

## 🧪 Testing Strategies

### Audio Quality Tests
```python
# Test frequency accuracy
def test_frequency_accuracy():
    generator = BinauralBeatGenerator()
    generator.base_frequency = 440
    chunk = generator.generate_chunk()
    
    # FFT to verify frequency
    fft = np.fft.fft(chunk[:, 0])
    freqs = np.fft.fftfreq(len(chunk), 1/44100)
    peak_freq = freqs[np.argmax(np.abs(fft))]
    
    assert abs(peak_freq - 440) < 1  # Within 1Hz accuracy
```

### WebSocket Stream Tests
```python
# Test streaming latency
async def test_stream_latency():
    start_time = time.time()
    chunks_received = 0
    
    async with websockets.connect("ws://localhost:8000/ws/audio") as ws:
        await ws.send(json.dumps({"type": "start_stream"}))
        
        while chunks_received < 100:
            msg = await ws.recv()
            chunks_received += 1
            
    elapsed = time.time() - start_time
    latency = elapsed / chunks_received
    
    assert latency < 0.050  # Under 50ms per chunk
```

## 🚀 Production Deployment

### Docker Configuration
```dockerfile
# Dockerfile
FROM python:3.11-slim

# Install system dependencies for PyAudio
RUN apt-get update && apt-get install -y \
    portaudio19-dev \
    python3-pyaudio \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables
```env
# .env
AUDIO_SAMPLE_RATE=44100
AUDIO_CHUNK_SIZE=1024
WS_MAX_CONNECTIONS=100
CORS_ORIGINS=["https://your-domain.com"]
```

## 📚 References

- [Web Audio API Specification](https://www.w3.org/TR/webaudio/)
- [HRTF Database](http://sound.media.mit.edu/resources/KEMAR.html)
- [PyAudio Documentation](https://people.csail.mit.edu/hubert/pyaudio/docs/)
- [Binaural Beat Research](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4428073/)

---

This document provides the domain-specific implementation details required for the Electromagnetic Beat Lab. Update as patterns emerge during development.