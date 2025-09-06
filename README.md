# 🎧 Electromagnetic Beat Lab (EBL)

**Advanced binaural beats generator with 8D spatial audio and electromagnetic field visualization**

A cutting-edge audio application combining binaural beat generation, 8D spatial audio effects, and electromagnetic field simulations for enhanced focus, meditation, and altered states of consciousness.

## 📚 Documentation Structure

**Quick Start for Developers:**
1. **[.claude/INDEX.md](.claude/INDEX.md)** - Navigation guide (START HERE)
2. **[.claude/CLAUDE.md](.claude/CLAUDE.md)** - Development standards & rules
3. **[.claude/INITIAL.md](.claude/INITIAL.md)** - Technical specifications & protocols
4. **[PLANNING.md](PLANNING.md)** - Architecture & development workflow
5. **[TASK.md](TASK.md)** - Current sprint work & task tracking

**Development Context:**
- **[.claude/VALIDATION.md](.claude/VALIDATION.md)** - Quality checklists
- **[.claude/RAG_CONTEXT.md](.claude/RAG_CONTEXT.md)** - Code discovery patterns
- **[.claude/INFRASTRUCTURE.md](.claude/INFRASTRUCTURE.md)** - Environment & deployment

## Tech Stack

- **Frontend**: Vite + React + TypeScript + Material-UI
- **Backend**: FastAPI + NumPy + SciPy + PyAudio  
- **Communication**: WebSocket (audio streaming) + REST (control)
- **Authentication**: Keycloak or AWS Cognito
- **Payments**: Stripe Payment Platform
- **Deployment**: AWS (ECS, S3, CloudFront) + Docker

## 🎧 Audio Engine Architecture

EBL uses a **dual-engine architecture** for optimal performance and reliability:

### **Frontend Audio Engine** (`useAudioEngine`)
- **Technology**: Web Audio API (browser-native)
- **Purpose**: Instant, local binaural beat generation
- **Capabilities**: 
  - Sine wave generation with precise frequency control
  - Real-time frequency/volume adjustments
  - Zero network latency
- **Use Cases**: Quick sessions, offline usage, fallback when backend unavailable

### **Backend Audio Engine** (`useBackendAudioEngine`)  
- **Technology**: Python + NumPy/SciPy + Custom DSP
- **Purpose**: Advanced spatial audio processing and electromagnetic field integration
- **Capabilities**:
  - **8D Spatial Audio**: HRTF processing, binaural panning, reverb
  - **Electromagnetic Integration**: Converts EM field data to spatial positioning
  - **Research-Grade DSP**: Professional audio algorithms impossible in browsers
  - **Real-time Streaming**: WebSocket-based audio frame delivery
- **Use Cases**: Advanced sessions, spatial effects, electromagnetic field synchronization

### **Why Both Engines?**

1. **Performance**: Frontend = instant response, Backend = powerful processing
2. **Reliability**: Frontend works offline, Backend adds advanced features  
3. **User Experience**: Quick start (frontend) → Enhanced features (backend)
4. **Scalability**: Distribute processing load between client and server

### **Engine Selection Logic**
- **Basic binaural beats** → Frontend Engine (instant)
- **8D spatial audio** → Backend Engine (advanced)
- **Electromagnetic patterns** → Backend Engine (field integration)
- **Fallback scenarios** → Frontend Engine (always available)

## Installation

### Prerequisites
- Node.js 18+
- Python 3.8+
- Git

### Setup

1. Clone the repository:
```bash
git clone https://gitlab.com/bishop8-group/bbl.git
cd bbl
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
pip install -r requirements.txt
```

## Development

### Frontend
```bash
npm run dev        # Start React dev server
npm run build      # Production build
```

### Backend
```bash
uvicorn backend.main:app --reload --port 8000  # Start Python server
```

### Full Stack
```bash
npm run dev:all    # Start both frontend and backend
```

## Project Structure
```
├── src/                  # React/TypeScript frontend
├── backend/              # Python/FastAPI backend
├── ai-context/           # Architecture documentation
│   ├── architecture.md   # Full architecture documentation
│   ├── backend.md        # Python implementation details
│   ├── frontend.md       # React component details
│   └── protocols.md      # Audio/EM protocols
└── claude.md            # AI assistant guidance
```

## Key Features

- **Binaural Beats**: Generate precise frequencies for brainwave entrainment
- **Electromagnetic Fields**: Calculate and visualize EM field simulations
- **Real-time Streaming**: WebSocket-based audio and field data streaming
- **ADHD Protocols**: Scientific frequency patterns for focus enhancement

## Contributing

Please read the documentation in the `ai-context/` folder for detailed implementation guidelines and architecture patterns.

## License

Proprietary - All rights reserved