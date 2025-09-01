# CLAUDE.md
# Electromagnetic Beat Lab - Quick Start

This file provides quick guidance for Claude Code. **For detailed architecture and implementation instructions, see `.claude/` folder.**
## NEVER'S
- **Never** assume missing context. Ask questions if uncertain.
- **Never** hallucinate libraries or functions. Only use known, verified Python packages.
- **Never** remove functionality to solve a problem without the authors permission
- **Never** act lazy or do half-ass work. Always deliver complete, high-quality implementations.
- **Never** reduce functionality to solve a problem without human authors permission.
- **Never** claim work is complete without proper testing and validation.
## Tech Stack
- **Frontend**: Vite + React + TypeScript
- **Backend**: FastAPI + NumPy + SciPy + PyAudio
- **Communication**: WebSocket (audio streaming) + REST (control)
- **Payments**: Stripe Payment Platform (monthly subscriptions)
- **Identity Management**: Cognito or Keycloak (agent's choice for user profiles and authentication)

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
├── .claude/              # ⚡ DETAILED INSTRUCTIONS HERE
│   └── CLAUDE.md         # Detailed development guidelines
└── CLAUDE.md             # This file (quick reference)
```

## Key Concepts
- **Binaural Beats**: Python generates precise frequencies via NumPy
- **Electromagnetic Fields**: SciPy calculates field simulations
- **Real-time Streaming**: WebSocket delivers audio/field data to React
- **ADHD Protocols**: Scientific frequency patterns in Python backend
- **Audio Quality Priority**: This project serves users in intensive focus, meditation, lucid dreaming, or OBE states - sound quality and variation are paramount, not graphics

## Testing & Validation Requirements
- **Always test each feature live** by running it in bash and reading output
- **Use Windows MCP server** to actually run the website when bash output isn't adequate
- **Never claim completion** without live testing and validation
- **All features must have** unit and integration tests in working order
- **Features must not break** existing tests or pipeline

## Git Workflow Standards
- **Each completed feature** must be added, committed with concise commit message following project norms, and pushed to GitLab
- **Features that don't work** break the pipeline and are unacceptable
- **Commit messages** must follow existing project conventions

## Monitoring & Logging Requirements
- **Detailed logging** must be implemented for all backend API calls with request/response tracking
- **Audio engine monitoring** with frequency generation accuracy, latency measurements, and error tracking
- **Performance metrics** for WebSocket connections and real-time audio streaming
- **User session tracking** for debugging and optimization purposes
- **Error logging** with stack traces and contextual information for troubleshooting
- **Log levels** (DEBUG, INFO, WARN, ERROR) appropriately used throughout the application

## Where to Find Details

📁 **Check `.claude/` folder for:**
- Detailed development guidelines
- Code structure and modularity rules
- Testing and reliability standards
- Style and conventions
- Task completion requirements

## Quick Architecture Overview

**Frontend** → WebSocket → **Backend**
- React UI sends frequency/pattern commands
- Python generates audio + EM field data
- WebSocket streams data back to React
- React visualizes in real-time

---
**⚠️ Always reference `.claude/` folder for detailed implementation guidance**