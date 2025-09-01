# PLANNING.md
# Electromagnetic Beat Lab - Project Architecture & Planning

## Project Architecture

### Frontend Stack
- **Framework**: React 18 + TypeScript 5.0+
- **UI Library**: Material-UI (MUI) v5
- **Build Tool**: Vite 4.x
- **State Management**: React Context + Hooks
- **Real-time**: WebSocket client for audio streaming
- **Audio Processing**: Web Audio API + AudioWorklet
- **Visualization**: React Three Fiber (R3F) + Three.js

### Backend Stack
- **Framework**: FastAPI 0.100+
- **Language**: Python 3.11+
- **Audio Processing**: NumPy + SciPy + PyAudio
- **WebSocket**: FastAPI WebSocket support
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: Keycloak or AWS Cognito
- **Payments**: Stripe Payment Platform

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitLab CI/CD Pipeline
- **Cloud Provider**: AWS (S3, ECS, CloudFront, ECR)
- **Monitoring**: CloudWatch + Application logs
- **Security**: HTTPS, JWT tokens, environment secrets

## Development Workflow

### 1. Pre-Development Setup
1. Read `.claude/CLAUDE.md` for development standards
2. Check `TASK.md` for current sprint work
3. Reference `.claude/INITIAL.md` for technical specifications
4. Use `.claude/INFRASTRUCTURE.md` for environment setup

### 2. Feature Development Process
```bash
# 1. Start development environment
npm run dev:all    # Starts both frontend and backend

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Development cycle
npm run test:watch  # Run tests in watch mode
npm run build      # Verify build works
npm run lint       # Check code quality

# 4. Before commit
python -m pytest backend/  # Run backend tests
npm run test:ci            # Run frontend tests
npm run typecheck         # TypeScript validation
```

### 3. Testing Strategy
- **Unit Tests**: Jest (frontend) + Pytest (backend)
- **Integration Tests**: Full-stack API + WebSocket testing
- **E2E Tests**: Cucumber.js for user scenarios
- **Performance Tests**: Audio latency + frequency accuracy
- **Coverage Requirements**: >80% backend, >70% frontend

## Naming Conventions

### Files & Directories
- **Components**: PascalCase (`AudioEngine.tsx`, `PatternSelectorMUI.tsx`)
- **Utilities**: camelCase (`calculateFrequency.ts`, `audioUtils.ts`)
- **Constants**: UPPER_SNAKE_CASE (`SAMPLE_RATE`, `MAX_FREQUENCY`)
- **Types/Interfaces**: PascalCase (`AudioConfig`, `PatternMode`)
- **Test Files**: `*.test.ts` or `*.spec.ts`

### Code Structure
```
src/
├── components/           # React components
│   ├── audio/           # Audio-specific components
│   ├── controls/        # Control components
│   └── visualization/   # Three.js visualizations
├── hooks/               # Custom React hooks
├── contexts/            # React contexts
├── types/               # TypeScript definitions
├── utils/               # Utility functions
└── constants/           # Application constants

backend/
├── routers/             # FastAPI route handlers
├── services/            # Business logic
├── models/              # Data models
├── utils/               # Backend utilities
└── tests/               # Backend tests
```

## Key Architectural Decisions

### 1. Real-Time Audio Streaming
- **WebSocket Protocol**: Binary frames for audio data
- **Sample Rate**: 44.1kHz standard, configurable
- **Buffer Management**: Circular buffers for smooth playback
- **Latency Target**: <50ms end-to-end

### 2. Frequency Generation
- **Precision**: NumPy-based generation for mathematical accuracy
- **Phase Continuity**: Maintained across pattern changes
- **Binaural Beats**: Separate left/right channel frequency control
- **Pattern Support**: Delta, Theta, Alpha, SMR, Beta, Gamma protocols

### 3. State Management
- **Frontend**: React Context for global state, local state for components
- **Backend**: In-memory session state, database for persistence
- **Sync**: WebSocket messages for real-time state synchronization

### 4. Error Handling
- **Frontend**: Error boundaries + toast notifications
- **Backend**: Structured exception handling + logging
- **WebSocket**: Automatic reconnection with exponential backoff
- **Audio**: Graceful degradation on device/browser limitations

## Performance Requirements

### Audio Quality Standards
- **Frequency Accuracy**: ±0.1Hz precision
- **THD (Total Harmonic Distortion)**: <0.01%
- **Signal-to-Noise Ratio**: >90dB
- **Phase Accuracy**: ±1° for binaural beats

### System Performance
- **Frontend Bundle**: <2MB gzipped
- **Backend Response**: <100ms for API calls
- **WebSocket Latency**: <50ms audio frame delivery
- **Memory Usage**: <500MB backend, <200MB frontend

## Security & Compliance

### Data Protection
- **Audio Data**: Streamed only, no server-side storage
- **User Sessions**: JWT tokens with 24-hour expiration
- **Personal Data**: GDPR-compliant collection and processing
- **Payment Data**: PCI-compliant via Stripe

### Access Control
- **Authentication**: Required for premium features
- **Authorization**: Role-based access (free/premium/admin)
- **API Security**: Rate limiting + input validation
- **Infrastructure**: VPC, security groups, encrypted storage

## Deployment Strategy

### Environments
- **Development**: Local Docker Compose
- **Staging**: AWS ECS + S3 (auto-deploy from develop branch)
- **Production**: AWS ECS + S3 + CloudFront (manual deploy from main)

### Release Process
1. Feature development in feature branches
2. Merge to develop → automatic staging deployment
3. QA testing in staging environment
4. Merge to main → manual production deployment
5. Post-deployment monitoring and rollback capability

---

**Reference Files:**
- Technical Specifications: `.claude/INITIAL.md`
- Development Standards: `.claude/CLAUDE.md`
- Infrastructure Setup: `.claude/INFRASTRUCTURE.md`
- Current Tasks: `TASK.md`