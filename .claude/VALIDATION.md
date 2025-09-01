# VALIDATION.md
# Development Validation Checklists

**Purpose:** Ensure consistent quality and prevent common issues before committing code.

## 📋 Pre-Development Checklist

### Environment Setup
- [ ] Latest code pulled from repository (`git pull origin main`)
- [ ] Development environment running (`npm run dev:all`)
- [ ] All dependencies installed (`npm install` + `pip install -r backend/requirements.txt`)
- [ ] Environment variables configured (check `.env.example`)
- [ ] Database running and accessible

### Context Preparation  
- [ ] Read `.claude/CLAUDE.md` development standards completely
- [ ] Checked `TASK.md` for current sprint work and priorities
- [ ] Verified task assignment and requirements
- [ ] Reviewed relevant technical specifications in `.claude/INITIAL.md`
- [ ] Confirmed architecture patterns in `PLANNING.md`

### Baseline Verification
- [ ] All existing tests passing (`npm run test:ci` + `python -m pytest backend/`)
- [ ] TypeScript compilation successful (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Backend runs without errors (`uvicorn backend.main:app --reload`)
- [ ] Frontend builds successfully (`npm run build`)

## 🧪 Pre-Commit Checklist

### Code Quality
- [ ] **TypeScript strict mode compliant** - no `@ts-ignore` without justification
- [ ] **ESLint/Prettier formatting applied** - run `npm run lint:fix`
- [ ] **Python code formatted** - run `black backend/` and `isort backend/`
- [ ] **No console.log/print statements** in production code (use proper logging)
- [ ] **Unused imports removed** - clean up import statements
- [ ] **Dead code removed** - no commented-out code blocks

### Testing Requirements
- [ ] **Unit tests written** for new functions/classes
- [ ] **Integration tests updated** if API changes made
- [ ] **All tests passing locally**:
  - [ ] Frontend: `npm run test:ci` 
  - [ ] Backend: `python -m pytest backend/`
  - [ ] E2E: `npm run test:e2e` (if applicable)
- [ ] **Test coverage maintained** - check coverage reports
- [ ] **Audio functionality tested** - verify frequency generation accuracy

### Security & Performance
- [ ] **No secrets committed** - check for API keys, tokens, passwords
- [ ] **Environment variables used** for configuration
- [ ] **SQL injection prevention** - use parameterized queries
- [ ] **XSS prevention** - sanitize user inputs
- [ ] **Performance tested** - no significant regression in audio latency
- [ ] **Memory leaks checked** - especially WebSocket connections

### Documentation
- [ ] **Code comments added** for complex logic
- [ ] **TypeScript interfaces updated** if data structures changed
- [ ] **API documentation updated** if endpoints modified
- [ ] **README updated** if setup/usage instructions changed
- [ ] **TASK.md updated** with progress and discoveries

## 🔍 Audio-Specific Validation

### Frequency Generation
- [ ] **Frequency accuracy verified** - ±0.1Hz precision maintained
- [ ] **Phase continuity tested** - no audio pops between pattern changes
- [ ] **Binaural beat functionality** - left/right channel separation correct
- [ ] **Sample rate consistency** - 44.1kHz throughout pipeline
- [ ] **Amplitude control working** - volume adjustments applied properly

### WebSocket Audio Streaming
- [ ] **Connection stability tested** - handles network interruptions
- [ ] **Buffer management verified** - no audio dropouts or stutters
- [ ] **Latency measured** - <50ms end-to-end target met
- [ ] **Memory usage monitored** - no excessive buffer accumulation
- [ ] **Reconnection logic tested** - automatic recovery from disconnects

### Protocol Implementation
- [ ] **Scientific accuracy verified** - protocols match research specifications
- [ ] **Frequency ranges correct**:
  - [ ] Delta: 1-4 Hz
  - [ ] Theta: 4-8 Hz  
  - [ ] Alpha: 8-12 Hz
  - [ ] SMR: 12-15 Hz
  - [ ] Beta: 15-30 Hz
  - [ ] Gamma: 30-100 Hz

## 🚀 Pre-Deployment Checklist

### Build Verification
- [ ] **Production build successful** - `npm run build` completes without errors
- [ ] **Docker build working** - `docker build -t ebl-app .` succeeds
- [ ] **Environment variables set** - production config ready
- [ ] **Database migrations applied** - schema up to date
- [ ] **Static assets optimized** - images compressed, bundles minimized

### CI/CD Pipeline
- [ ] **GitLab CI pipeline passing** - all stages green
- [ ] **SonarCube quality gates passed** - no critical issues
- [ ] **Security scans clean** - no vulnerabilities detected
- [ ] **Performance tests passed** - no regression in key metrics
- [ ] **Deploy configuration validated** - AWS/infrastructure settings correct

### Monitoring & Rollback
- [ ] **Health check endpoints working** - `/health` returns 200
- [ ] **Logging configured** - appropriate log levels set
- [ ] **Monitoring alerts set** - CloudWatch/error tracking active
- [ ] **Rollback procedure tested** - can revert to previous version
- [ ] **Database backup verified** - recent backup available

## ❌ Common Issues Prevention

### TypeScript Issues
- **Missing interface exports** - ensure types are exported from `src/types/index.ts`
- **Circular dependency errors** - check import structure, use forward declarations
- **Any types used** - replace with proper interfaces
- **Missing null checks** - handle undefined/null values properly

### Audio Issues  
- **AudioContext creation timing** - create on user interaction
- **WebSocket binary data handling** - ensure proper buffer conversion
- **Cross-browser compatibility** - test on Chrome, Firefox, Safari
- **Mobile device limitations** - handle iOS Safari restrictions

### Backend Issues
- **FastAPI route conflicts** - check router registration order
- **Async/await misuse** - proper async handling in Python
- **Database connection leaks** - close connections properly
- **CORS configuration** - ensure frontend can access API

### CI/CD Issues
- **Build dependency version conflicts** - lock dependency versions
- **Test environment differences** - consistent Node.js/Python versions
- **Artifact generation failures** - check build paths and permissions
- **Deploy credential issues** - validate AWS/deployment credentials

## 🎯 Quality Metrics Targets

### Code Coverage
- **Backend**: ≥80% line coverage
- **Frontend**: ≥70% line coverage  
- **Critical paths**: 100% coverage (audio generation, WebSocket handling)

### Performance
- **Bundle size**: <2MB gzipped
- **API response time**: <100ms average
- **Audio latency**: <50ms end-to-end
- **Memory usage**: <500MB backend, <200MB frontend

### Reliability
- **Test success rate**: >95% over 10 runs
- **Build success rate**: >98% in CI/CD pipeline
- **Deployment success**: 100% with rollback capability

---

**⚠️ Validation Failures**

If any validation item fails:
1. **Stop development** - do not proceed until resolved
2. **Fix the issue** - address root cause, not symptoms  
3. **Re-run validation** - ensure full checklist passes
4. **Document learnings** - update this checklist if needed

**Emergency Override:** Only skip validation items with explicit approval and documented justification.