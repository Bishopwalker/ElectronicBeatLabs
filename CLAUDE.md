# CLAUDE.md
# Electromagnetic Beat Lab - Quick Start

This file provides quick guidance for Claude Code. **For detailed architecture and implementation instructions, see `ai-context/` folder.**
## NEVER'S
- **Never** assume missing context. Ask questions if uncertain.
- **Never** hallucinate libraries or functions. Only use known, verified Python packages.
- **Never** remove functionality to solve a problem without the authors permission
## Tech Stack
- **Frontend**: Vite + React + TypeScript
- **Backend**: FastAPI + NumPy + SciPy + PyAudio
- **Communication**: WebSocket (audio streaming) + REST (control)

## Development Commands

### Frontend
```bash
npm run dev        # Start React dev server
npm run build      # Production build
```

### Backend
```bash
uvicorn backend.main:app --reload --port 8000  # Start Python server
pip install -r requirements.txt                # Install dependencies
```

### Full Stack
```bash
npm run dev:all    # Start both frontend and backend
```

## Project Structure
```
├── src/                  # React/TypeScript frontend
├── backend/              # Python/FastAPI backend
├── ai-context/           # ⚡ DETAILED INSTRUCTIONS HERE
│   ├── architecture.md   # Full architecture documentation
│   ├── backend.md        # Python implementation details
│   ├── frontend.md       # React component details
│   └── protocols.md      # Audio/EM protocols
└── claude.md            # This file (quick reference)
```

## Key Concepts
- **Binaural Beats**: Python generates precise frequencies via NumPy
- **Electromagnetic Fields**: SciPy calculates field simulations
- **Real-time Streaming**: WebSocket delivers audio/field data to React
- **ADHD Protocols**: Scientific frequency patterns in Python backend

## Where to Find Details

📁 **Check `ai-context/` folder for:**
- Complete architecture diagrams
- API endpoint specifications
- Component hierarchies
- Pattern implementation guides
- State management patterns
- WebSocket message protocols
- Testing strategies

## Quick Architecture Overview

**Frontend** → WebSocket → **Backend**
- React UI sends frequency/pattern commands
- Python generates audio + EM field data
- WebSocket streams data back to React
- React visualizes in real-time

---
**⚠️ Always reference `ai-context/` folder for detailed implementation guidance**