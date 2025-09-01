# Electromagnetic Beat Lab (EBL)

A Python + React + TypeScript application for generating binaural beats and electromagnetic field simulations.

## 📚 Documentation Structure

**Quick Start for Developers:**
1. **[.claude/INDEX.md](.claude/INDEX.md)** - Navigation guide (START HERE)
2. **[.claude/CLAUDE.md](.claude/CLAUDE.md)** - Development standards & rules
3. **[.claude/INITIAL.md](.claude/INITIAL.md)** - Technical specifications & protocols
4. **[PLANNING.md](PLANNING.md)** - Architecture & development workflow
5. **[TASK.md](TASK.md)** - Current sprint work & task tracking

**AI Assistant Context:**
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