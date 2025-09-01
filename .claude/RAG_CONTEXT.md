# RAG_CONTEXT.md
# Retrieval-Augmented Generation Context Guide

**Purpose:** Optimize code discovery and context retrieval for AI assistants working on the EBL project.

## 🗂️ Code Organization Map

### Frontend Structure
```
src/
├── components/              # React UI Components
│   ├── audio/              # Audio-specific components
│   │   ├── AudioEngine.tsx      # Main audio processing component
│   │   ├── BinauralTest.tsx     # Binaural beat testing interface
│   │   └── SimpleAudioTest.tsx  # Basic audio functionality tests
│   ├── controls/           # User interface controls
│   │   ├── MainControls.tsx     # Primary app controls
│   │   ├── TimerControls.tsx    # Session timing controls
│   │   └── PatternSelector.tsx  # Frequency pattern selection
│   ├── tabs/               # Tabbed interface components
│   │   ├── FrequencyTab.tsx     # Manual frequency control
│   │   ├── PatternTab.tsx       # Preset pattern selection
│   │   ├── SettingsTab.tsx      # Application settings
│   │   └── VisualizationTab.tsx # Audio visualization
│   └── visualization/      # 3D and visual components
│       ├── SpatialVisualizer.tsx    # 3D audio visualization
│       ├── StarField.tsx           # Background visual effects
│       └── WaveGuidePanel.tsx      # Wave visualization
├── hooks/                  # Custom React Hooks
│   ├── useAudioEngine.ts        # Core audio processing logic
│   ├── useBackendAPI.ts         # API communication
│   ├── useWebSocket.ts          # WebSocket connection management
│   └── useAuth.ts               # Authentication handling
├── contexts/               # React Context Providers
│   ├── AuthContext.tsx          # Authentication state
│   └── audio.ts                 # Audio engine context
├── types/                  # TypeScript Definitions
│   └── index.ts                 # All type exports
├── utils/                  # Utility Functions
└── constants/              # Application Constants
```

### Backend Structure
```
backend/
├── routers/                # FastAPI Route Handlers
│   ├── audio.py                # Audio processing endpoints
│   ├── auth.py                 # Authentication routes
│   ├── patterns.py             # Pattern management
│   └── websocket.py            # WebSocket endpoints
├── services/               # Business Logic Layer
│   ├── audio_service.py        # Audio generation logic
│   ├── pattern_service.py      # Pattern processing
│   └── auth_service.py         # Authentication logic
├── models/                 # Data Models
│   ├── audio_models.py         # Audio-related data models
│   ├── user_models.py          # User/auth models
│   └── pattern_models.py       # Pattern data models
├── utils/                  # Backend Utilities
│   ├── frequency_utils.py      # Frequency calculation helpers
│   ├── websocket_manager.py    # WebSocket connection management
│   └── audio_utils.py          # Audio processing utilities
└── tests/                  # Backend Test Suite
    ├── test_audio.py           # Audio service tests
    ├── test_patterns.py        # Pattern tests
    └── test_websocket.py       # WebSocket tests
```

## 🔍 Pattern-Based Code Discovery

### **Audio Engine Related Code**
```bash
# Core audio processing
src/hooks/useAudioEngine.ts           # Frontend audio hook
backend/services/audio_service.py     # Backend audio generation
backend/utils/audio_utils.py          # Audio utility functions

# Audio components
src/components/audio/AudioEngine.tsx  # Main audio component
src/components/audio/BinauralTest.tsx # Binaural testing interface

# Audio types and interfaces
src/types/index.ts                    # Look for AudioConfig, AudioState
backend/models/audio_models.py        # Backend audio data models
```

### **WebSocket Communication**
```bash
# WebSocket implementation
src/hooks/useWebSocket.ts             # Frontend WebSocket hook
backend/routers/websocket.py          # Backend WebSocket routes
backend/utils/websocket_manager.py    # Connection management

# WebSocket message types
src/types/index.ts                    # WebSocketMessage interfaces
backend/models/                       # Message data models
```

### **Pattern & Frequency Management**
```bash
# Pattern selection
src/components/controls/PatternSelector.tsx    # Pattern UI
src/components/tabs/PatternTab.tsx           # Pattern management tab
src/data/patterns.ts                         # Pattern definitions

# Backend pattern logic
backend/services/pattern_service.py         # Pattern processing
backend/routers/patterns.py                # Pattern API routes
backend/models/pattern_models.py            # Pattern data models

# Frequency calculations
backend/utils/frequency_utils.py            # Frequency math
src/utils/                                  # Frontend frequency helpers
```

### **Authentication & User Management**
```bash
# Frontend auth
src/hooks/useAuth.ts                  # Authentication hook
src/contexts/AuthContext.tsx          # Auth context provider
src/components/auth/SimpleAuth.tsx    # Auth UI component

# Backend auth
backend/services/auth_service.py      # Auth business logic
backend/routers/auth.py              # Auth API endpoints
backend/models/user_models.py        # User data models
```

### **Testing Infrastructure**
```bash
# Frontend tests
**/*.test.ts                         # Jest unit tests
**/*.spec.ts                         # Component tests
tests/e2e/                          # End-to-end tests

# Backend tests
backend/tests/test_*.py              # Pytest test files
backend/pytest.ini                  # Pytest configuration
```

## 🎯 Common Issue Resolution Patterns

### **TypeScript Interface Issues**
```typescript
// Always check these files first:
src/types/index.ts                   // Main type definitions
src/components/**/types.ts           // Component-specific types

// Common patterns:
export interface AudioConfig {
  frequency: number;
  amplitude: number;
  // ...
}

// Look for missing exports:
export type { AudioConfig, PatternMode, WebSocketMessage };
```

### **API Route Problems**
```python
# Check router registration in:
backend/main.py                      # Main FastAPI app

# Router includes should look like:
app.include_router(audio.router, prefix="/api/audio", tags=["audio"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# Check individual routes in:
backend/routers/*.py                 # Individual route files
```

### **WebSocket Connection Issues**
```python
# WebSocket manager:
backend/utils/websocket_manager.py   # Connection lifecycle

# Common patterns:
class WebSocketManager:
    def connect(self, websocket: WebSocket, client_id: str)
    def disconnect(self, client_id: str)
    def send_personal_message(self, message: str, client_id: str)
```

### **Audio Processing Bugs**
```python
# Backend audio generation:
backend/services/audio_service.py    # Core audio logic
backend/utils/frequency_utils.py     # Math calculations

# Frontend audio handling:
src/hooks/useAudioEngine.ts          # Audio context management

# Common patterns to check:
- Sample rate consistency (44100 Hz)
- Phase continuity between frequency changes
- Buffer management and cleanup
- AudioContext state (suspended/running)
```

## 📚 External Reference Integration

### **Web Audio API**
When working with audio code, reference:
- **MDN Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Key interfaces**: AudioContext, GainNode, OscillatorNode, AudioBuffer
- **Implementation files**: `src/hooks/useAudioEngine.ts`

### **FastAPI WebSocket**
For WebSocket-related work:
- **FastAPI WebSocket docs**: https://fastapi.tiangolo.com/advanced/websockets/
- **Implementation files**: `backend/routers/websocket.py`, `backend/utils/websocket_manager.py`

### **React + TypeScript Patterns**
For component development:
- **React TypeScript Cheatsheet**: https://react-typescript-cheatsheet.netlify.app/
- **MUI Component API**: https://mui.com/material-ui/api/
- **Implementation files**: `src/components/`, `src/hooks/`

## 🔧 Development Tool Integration

### **IDE Integration**
```json
// .vscode/settings.json patterns to look for:
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "python.defaultInterpreterPath": "./backend/.venv/bin/python"
}
```

### **Build Tool Configuration**
```javascript
// vite.config.ts - Frontend build config
// tsconfig.json - TypeScript configuration
// backend/requirements.txt - Python dependencies
```

### **Testing Configuration**
```javascript
// jest.config.js - Frontend test config
// backend/pytest.ini - Backend test config
```

## 🎪 Context Retrieval Strategies

### **Bottom-Up Discovery** (Start with specific code)
1. Find the specific file/function having issues
2. Trace imports/exports to related files
3. Check type definitions in `src/types/index.ts`
4. Review test files for usage examples

### **Top-Down Discovery** (Start with architecture)
1. Review `.claude/INITIAL.md` for technical requirements
2. Check `PLANNING.md` for architecture decisions
3. Navigate to relevant code sections
4. Examine implementation details

### **Feature-Based Discovery** (Start with user functionality)
1. Identify which tab/component handles the feature
2. Follow component hierarchy to find implementation
3. Trace data flow from UI → hooks → API → backend
4. Check for related tests and documentation

### **Error-Driven Discovery** (Start with error messages)
1. Parse error message for file/line references
2. Check TypeScript compiler output for type issues
3. Review console logs for runtime problems
4. Search codebase for error message patterns

---

**🎯 Quick Reference Commands**

```bash
# Find all audio-related files:
find . -name "*.ts*" -o -name "*.py" | grep -i audio

# Search for specific patterns:
grep -r "AudioContext" src/
grep -r "WebSocket" backend/

# Find type definitions:
grep -r "interface.*Config" src/types/
grep -r "class.*Model" backend/models/
```

**Context Health Indicators:**
- ✅ All imports resolve correctly
- ✅ TypeScript compilation succeeds  
- ✅ Tests can find and execute code
- ✅ Runtime errors provide clear file paths