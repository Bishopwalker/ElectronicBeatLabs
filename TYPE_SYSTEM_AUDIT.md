# TYPE SYSTEM AUDIT - Electromagnetic Beat Lab
**Created:** 2025-10-16
**Status:** 🚨 CRITICAL - Multiple Redundant Type Systems Detected
**Priority:** P0 - Foundation for all future work

---

## 🔴 EXECUTIVE SUMMARY - THE CHAOS

### The Problem
You currently have **THREE DIFFERENT TYPE SYSTEMS** competing for authority:
1. `src/types/index.ts` - Legacy comprehensive system (~568 lines)
2. `src/types/audio.types.ts` - Attempted audio consolidation (~134 lines)
3. `src/types/clean.types.ts` - New "clean" system (~214 lines)

### The Impact
- **Frequency Confusion**: 3 different models (leftFreq/rightFreq, base/beat, left_ear_hz/right_ear_hz)
- **AudioContext Chaos**: 5+ different places creating/managing AudioContext instances
- **Type Mismatches**: Components using incompatible interfaces
- **Conversion Hell**: Constants conversions between frequency models scattered everywhere

---

## 📊 SECTION 1: AUDIOENGINE TYPES MAPPING

### 1.1 Frontend Audio Engine Types

#### **Location**: `src/types/index.ts`
```typescript
interface FrontendAudioEngine {
  audioState: FrontendAudioEngineState;
  electromagnetic: ElectromagneticField;

  // Methods
  startBinauralBeat: (config: BinauralBeatConfig) => Promise<void>;
  stopBinauralBeat: () => void;
  updateFrequency: (left: number, right: number) => void;  // ⚠️ LEFT/RIGHT MODEL
  updateVolume: (volume: number) => void;
  updateWaveform: (waveForm: WaveForm) => void;
  loadPattern: (pattern: PatternConfig) => void;
  generateTestTones: (leftFreq: number, rightFreq: number, duration?: number) => void;
  frequencySweep: (startFreq: number, endFreq: number, duration: number) => void;
  createGammaProtocol: (protocol: ADHDProtocol) => void;
  initializeAudio: () => Promise<AudioContext | null>;
  setAudioState?: (updater: (prev: FrontendAudioEngineState) => FrontendAudioEngineState) => void;

  // Status
  isSupported: boolean;
  backendConnected: false;  // Always false
  sessionId: null;  // Always null
  websocketState: WebSocketState;
}
```

#### **State Type**: `FrontendAudioEngineState` (audio.types.ts:76-88)
```typescript
interface FrontendAudioEngineState {
  isPlaying: boolean;
  amplitude: number;  // ⚠️ NOT "volume"
  leftFreq: number;   // ⚠️ LEFT/RIGHT MODEL
  rightFreq: number;  // ⚠️ LEFT/RIGHT MODEL
  beat_frequency: number;
  waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';

  // Web Audio API Nodes (nullable)
  gainL: GainNode | null;
  gainR: GainNode | null;
  oscillatorL: OscillatorNode | null;
  oscillatorR: OscillatorNode | null;
  context: AudioContext | null;  // ⚠️ MANAGED INTERNALLY
}
```

#### **Implementation Hook**: `useAudioEngine.ts`
- **AudioContext Management**: `audioContextRef.current` (persistent ref)
- **Analyser Management**: `analyserNodeRef.current` (persistent ref)
- **External Mixer Support**: `externalOutputNodeRef`, `externalAnalyserRef`
- **Routing**: Can route through AudioMixer or standalone to destination

#### **REDUNDANT TYPE** (clean.types.ts:36-49)
```typescript
// ⚠️ DUPLICATE - Different structure, same purpose
interface FrontendEngine {
  isPlaying: boolean;
  audioConfig: AudioConfig;  // Different from FrontendAudioEngineState!
  spatialConfig: SpatialConfig;

  start: (config: AudioConfig) => Promise<void>;
  stop: () => void;
  updateFrequency: (base: number, beat: number) => void;  // ⚠️ BASE/BEAT MODEL (inconsistent!)
  updateVolume: (volume: number) => void;
  updateWaveform: (waveform: AudioConfig['waveform']) => void;
  isSupported: boolean;
}
```

**🚨 ISSUE**: Two completely different interfaces for the same concept!

---

### 1.2 Backend Audio Engine Types

#### **Location**: `src/types/index.ts`
```typescript
interface AudioEngine {
  audioState: BackendAudioEngineState;  // ⚠️ Different from FrontendAudioEngineState
  electromagnetic: ElectromagneticField;

  // Methods (same as FrontendAudioEngine but with backend-specific additions)
  startBinauralBeat: (config: BinauralBeatConfig) => Promise<void>;
  stopBinauralBeat: () => void;
  updateFrequency: (left: number, right: number) => void;  // ⚠️ SIGNATURE MISMATCH WITH BACKEND!
  updateVolume: (volume: number) => void;
  updateWaveform: (waveForm: WaveForm) => void;
  loadPattern: (pattern: PatternConfig) => void;
  generateTestTones: (leftFreq: number, rightFreq: number, duration?: number) => void;
  frequencySweep: (startFreq: number, endFreq: number, duration: number) => void;
  createGammaProtocol: (protocol: ADHDProtocol) => void;

  // Backend-specific
  backendConnected?: boolean;
  sessionId?: string | null;
  websocketState?: WebSocketState;
  updateSpatialSettings?: (settings: SpatialAudioConfig) => void;
  connectBackend?: () => Promise<void>;
  disconnectBackend?: () => Promise<void>;
  startBackendSession?: (config?: BinauralBeatConfig & {
    spatial_enabled?: boolean,
    spatial_settings?: Record<string, unknown>
  }) => Promise<void>;
  stopBackendSession?: () => Promise<void>;
  updateSettings?: (settings: Record<string, unknown>) => void;  // ⚠️ GENERIC!

  isSupported: boolean;
}
```

#### **State Type**: `BackendAudioEngineState` (audio.types.ts:59-70)
```typescript
interface BackendAudioEngineState {
  isPlaying: boolean;
  config: BinauralBeatConfig | null;  // ⚠️ Nested config object
  sessionId: string | null;
  webSocket?: boolean;
  connected: boolean;
  error: string | null;

  // ⚠️ COMPUTED PROPERTIES (calculated from config)
  leftFreq?: number;   // Left ear = base_frequency
  rightFreq?: number;  // Right ear = base_frequency + beat_frequency
  beat_frequency?: number;  // Beat frequency from config
}
```

**🚨 KEY ISSUE**: `updateFrequency(left, right)` signature but backend actually uses `updateSettings({ base_frequency, beat_frequency })`!

#### **Implementation Hook**: `useBackendAudioEngine.ts`
- **AudioContext Management**: `audioContext.current` (ref) - WAITS for external nodes!
- **AudioWorklet**: `audioWorkletNode.current` (processes backend frames)
- **Gain Node**: `gainNode.current` (volume control)
- **Analyser**: `analyserNode.current` (visualization)
- **External Mixer Support**: `externalOutputNodeRef`, `externalAnalyserRef`
- **WebSocket**: Uses `useWebSocketContext()` for frame streaming

#### **ACTUAL API** (useBackendAudioEngine.ts:979-997)
```typescript
// ⚠️ REALITY: Backend uses base/beat model
const updateFrequency = useCallback((base_frequency: number, beat_frequency: number) => {
  updateSettings({
    base_frequency: base_frequency,
    beat_frequency: beat_frequency
  });

  setAudioState(prev => ({
    ...prev,
    config: {
      ...prev.config!,
      base_frequency: base_frequency,
      beat_frequency: beat_frequency
    },
    // Computed properties for UI compatibility
    leftFreq: base_frequency,
    rightFreq: base_frequency + beat_frequency,
    beat_frequency: beat_frequency
  }));
}, [updateSettings]);
```

#### **REDUNDANT TYPE** (clean.types.ts:54-70)
```typescript
// ⚠️ DUPLICATE - Different structure
interface BackendEngine {
  isPlaying: boolean;
  connected: boolean;
  sessionId: string | null;
  audioConfig: AudioConfig;  // Different from BackendAudioEngineState!
  spatialConfig: SpatialConfig;

  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  start: (config: AudioConfig) => Promise<void>;
  stop: () => void;
  updateFrequency: (base: number, beat: number) => void;  // Correct signature
  updateVolume: (volume: number) => void;
  updateSpatialSettings: (spatial: SpatialConfig) => void;
}
```

---

### 1.3 Hybrid Audio Engine Types

#### **Union Type**: `AnyAudioEngine` (types/index.ts:128)
```typescript
export type AnyAudioEngine = AudioEngine | FrontendAudioEngine;
```

**🚨 ISSUE**: This union doesn't help because the interfaces have incompatible methods!

#### **Implementation Hook**: `useHybridAudioEngine.ts`
- **Combines**: `useAudioEngine()` + `useBackendAudioEngine()`
- **AudioMixer**: Creates `AudioMixer` to blend both engines
- **Crossfading**: Automatic crossfade from frontend → backend when backend connects
- **Failover**: Instant failover backend → frontend on disconnect

#### **Return Type** (useHybridAudioEngine.ts:516-562)
```typescript
return {
  // Unified state (COMPUTED from both engines)
  audioState: {
    isPlaying: frontendEngine?.audioState?.isPlaying || backendEngine?.audioState?.isPlaying,
    amplitude: frontendEngine?.audioState?.amplitude || backendEngine?.audioState?.config?.amplitude,
    leftFreq: baseFreq,  // Computed
    rightFreq: baseFreq + beatFreq,  // Computed
    beat_frequency: beatFreq,
    waveform: frontendEngine?.audioState?.waveform || 'sine',
    config: { base_frequency, beat_frequency, amplitude, waveform }
  },
  electromagnetic: /* ... */,

  // Methods
  startBinauralBeat,
  stopBinauralBeat,
  updateFrequency,  // Syncs BOTH engines (left/right → both formats)
  updateSettings,   // Syncs BOTH engines (base/beat → both formats)
  updateVolume,
  updateWaveform,
  updateSpatialSettings,
  /* ... */,

  // Audio pipeline
  audioContext: frontendEngine?.audioContext || null,
  analyserNode: mixerRef.current ? mixerRef.current.analyserNode : frontendEngine?.analyserNode,

  // Engine status
  currentEngine: 'frontend' | 'backend' | 'hybrid',
  isInitialized: boolean,
  backendConnected: boolean,
  backendSessionId: string | null,

  // Mixer control
  mixer: AudioMixer | null,

  // EXPOSED INTERNAL ENGINES (for compatibility)
  frontendEngine: FrontendAudioEngine,  // ⚠️ Can be undefined on first render!
  backendEngine: AudioEngine  // ⚠️ Can be undefined on first render!
};
```

**🚨 KEY ISSUES**:
1. Return type is ad-hoc, not a defined interface
2. `frontendEngine`/`backendEngine` can be undefined (race condition)
3. `audioState` is computed from two incompatible structures
4. Has both `updateFrequency(left, right)` AND `updateSettings({ base, beat })`

---

### 1.4 AudioMixer Utility

#### **Location**: `src/utils/AudioMixer.ts`
```typescript
class AudioMixer {
  private context: AudioContext;  // ⚠️ SHARES context with frontend engine
  private frontendGain: GainNode;
  private backendGain: GainNode;
  private masterGain: GainNode;
  public analyserNode: AnalyserNode;  // ⚠️ SHARED by both engines!

  constructor(audioContext: AudioContext) {
    this.context = audioContext;

    // Create gain nodes
    this.frontendGain = audioContext.createGain();
    this.backendGain = audioContext.createGain();
    this.masterGain = audioContext.createGain();

    // Create shared analyser
    this.analyserNode = audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.8;

    // Route: frontendGain ─┐
    //                       ├─→ masterGain → analyser → destination
    // Route: backendGain  ─┘
    this.frontendGain.connect(this.masterGain);
    this.backendGain.connect(this.masterGain);
    this.masterGain.connect(this.analyserNode);
    this.analyserNode.connect(this.context.destination);
  }

  // Crossfading
  crossfadeToBackend(duration: number): void;
  failoverToFrontend(): void;  // Instant switch

  // Volume control
  setMasterVolume(volume: number): void;
  setFrontendVolume(volume: number): void;
  setBackendVolume(volume: number): void;

  // Getters for engine routing
  getFrontendGain(): GainNode;
  getBackendGain(): GainNode;

  destroy(): void;
}
```

**🚨 CRITICAL DESIGN**:
- Mixer MUST be created BEFORE any audio starts
- Both engines MUST use the SAME AudioContext (from frontend engine)
- Analyser is SHARED (solves visualization consistency)
- External nodes pattern allows late binding

---

## 📊 SECTION 2: AUDIO CONFIGURATION TYPES

### 2.1 The Master Config (audio.types.ts:8-29)

```typescript
/**
 * MASTER AUDIO CONFIGURATION
 * This is the ONLY BinauralBeatConfig in the entire app
 * All components must use this or convert to it
 */
interface BinauralBeatConfig {
  // Core frequencies
  base_frequency: number;      // Carrier/base frequency (Hz) - the base tone
  beat_frequency: number;      // Beat frequency (Hz) - the difference creating binaural effect

  // Audio properties
  amplitude: number;          // Volume 0-1 (NOT "volume", always "amplitude")
  waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';

  // Optional spatial audio
  spatial?: {
    enabled: boolean;
    mode: 'binaural' | 'stereo' | '3d';
    positioning: 'headphones' | 'speakers';
    roomSize: 'small' | 'medium' | 'large';
  };

  // Optional metadata
  presetName?: string;
  duration?: number;  // in seconds
  rampTime?: number;  // fade in/out time
}
```

**🎯 INTENT**: This should be the ONE TRUE CONFIG. But is it?

---

### 2.2 The Clean Alternative (clean.types.ts:12-17)

```typescript
/**
 * Standard audio configuration used everywhere
 */
interface AudioConfig {
  base_frequency: number;    // Left ear frequency (Hz)  ⚠️ WRONG COMMENT!
  beat_frequency: number;    // Beat frequency (Hz)
  amplitude: number;        // Volume 0-1
  waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
}
```

**🚨 ISSUE**: Comment says "Left ear frequency" for `base_frequency` but that's incorrect! Base frequency is the carrier, not the left ear!

---

### 2.3 Backend API Format (audio.types.ts:34-45)

```typescript
/**
 * BACKEND API FORMAT - Snake case for Python backend
 */
interface BackendAudioConfig {
  base_frequency: number;
  beat_frequency: number;
  amplitude: number;
  waveform: string;
  spatial_enabled?: boolean;
  spatial_settings?: {
    mode: string;
    positioning: string;
    room_size: string;
  };
}
```

**✅ CORRECT**: This matches Python backend schema

---

## 📊 SECTION 3: FREQUENCY MODELS - THE ROOT CHAOS

### 3.1 Three Competing Models

#### **Model A: Left/Right (Frontend Engine, Legacy)**
```typescript
// Used by: FrontendAudioEngineState, legacy components
leftFreq: number;   // e.g., 140 Hz
rightFreq: number;  // e.g., 144 Hz

// Calculation
beat_frequency = Math.abs(rightFreq - leftFreq);  // 4 Hz
```

#### **Model B: Base/Beat (Backend Engine, Standard)**
```typescript
// Used by: BinauralBeatConfig, BackendAudioEngineState
base_frequency: number;   // e.g., 140 Hz (carrier frequency)
beat_frequency: number;   // e.g., 4 Hz (binaural beat)

// Calculation
leftFreq = base_frequency;                     // 140 Hz
rightFreq = base_frequency + beat_frequency;   // 144 Hz
```

#### **Model C: Timer Transition (Different Again!)**
```typescript
// Used by: FrequencyTransition, timer presets
left_ear_hz: number;      // e.g., 140 Hz
right_ear_hz: number;     // e.g., 144 Hz
frequency_hz: number;     // e.g., 4 Hz (beat frequency)
frequency_type: FrequencyType;  // delta/theta/alpha/beta/gamma
```

**🚨 THE PROBLEM**: Constant conversions everywhere, easy to mix up, no single source of truth!

---

### 3.2 Conversion Functions (scattered across codebase)

#### **In Hybrid Engine** (useHybridAudioEngine.ts:283-304)
```typescript
const updateFrequency = useCallback((leftFreq: number, rightFreq: number) => {
  const beatFreq = Math.abs(rightFreq - leftFreq);
  const baseFreq = Math.min(leftFreq, rightFreq);

  console.log('🎛️ Hybrid Engine: Syncing frequency to BOTH engines');

  // Update FRONTEND engine (left/right format)
  if (frontendEngine?.updateFrequency) {
    frontendEngine.updateFrequency(leftFreq, rightFreq);
  }

  // Update BACKEND engine (base/beat format)
  if (backendEngine?.updateFrequency) {
    backendEngine.updateFrequency(baseFreq, beatFreq);  // ⚠️ CONVERSION!
  }
}, [frontendEngine, backendEngine]);
```

#### **In Backend Engine** (useBackendAudioEngine.ts:979-997)
```typescript
const updateFrequency = useCallback((base_frequency: number, beat_frequency: number) => {
  updateSettings({
    base_frequency: base_frequency,
    beat_frequency: beat_frequency
  });

  setAudioState(prev => ({
    ...prev,
    config: { base_frequency, beat_frequency },
    // Computed for UI compatibility
    leftFreq: base_frequency,                      // ⚠️ CONVERSION!
    rightFreq: base_frequency + beat_frequency,    // ⚠️ CONVERSION!
    beat_frequency: beat_frequency
  }));
}, [updateSettings]);
```

#### **In Timer Logic** (useTimerLogic.ts:254-272)
```typescript
// Update frequencies based on engine type
if ((audioEngine as any).updateSettings) {
  // Backend engine - use base/beat model
  console.log('🎛️ Timer: Updating backend engine');
  (audioEngine as any).updateSettings({
    base_frequency: currentTransition.left_ear_hz,       // ⚠️ WRONG! Should be base, not left!
    beat_frequency: currentTransition.frequency_hz
  });
} else if (audioEngine.updateFrequency) {
  // Frontend engine - use left/right model
  console.log('🎛️ Timer: Updating frontend engine');
  audioEngine.updateFrequency(
    currentTransition.left_ear_hz,
    currentTransition.right_ear_hz
  );
}
```

**🚨 BUG FOUND**: Timer sends `left_ear_hz` as `base_frequency` to backend! This is incorrect if `left_ear_hz` is actually the LEFT ear (should be the lower of the two frequencies).

---

### 3.3 Commented-Out Conversion Functions (audio.types.ts:118-134)

```typescript
// ⚠️ COMMENTED OUT - Why?
/**
 * FREQUENCY CALCULATION FUNCTIONS FOR UI DISPLAY ONLY
 * Binaural beats formula: Right = Left + Beat
 * - Left ear: base_frequency (carrier)
 * - Right ear: base_frequency + beat_frequency
 * - Beat: difference perceived by brain
 */
//export const calculateLeftFreq = (base_frequency: number): number => base_frequency;
//export const calculateRightFreq = (base_frequency: number, beat_frequency: number): number => base_frequency + beat_frequency;

/**
 * Calculate beat frequency from left and right
 */
//export const calculateBeatFrequency = (leftFreq: number, rightFreq: number): number => {
//    return Math.abs(leftFreq - rightFreq);
//};
```

**🚨 ISSUE**: These helper functions were commented out! Should be EXPORTED and used everywhere!

---

### 3.4 Clean Types Conversion (clean.types.ts:188-197)

```typescript
/**
 * Calculate right frequency from base and beat
 */
export const calculateRightFreq = (base_frequency: number, beat_frequency: number): number => {
  return base_frequency + beat_frequency;
};

/**
 * Calculate beat frequency from left and right
 */
export const calculateBeatFreq = (leftFreq: number, rightFreq: number): number => {
  return Math.abs(rightFreq - leftFreq);
};
```

**✅ GOOD**: But in a different file (clean.types.ts) that's not being used consistently!

---

## 📊 SECTION 4: TIMER & SESSION TYPES

### 4.1 Frontend Timer Types (types/index.ts:260-313)

```typescript
/**
 * Timer session information
 */
interface TimerSession {
  presetId?: TimerPreset;
  startTime: number;
  currentPhase: number;
  isPaused: boolean;
  loopCount: number;
  session_id: string;
  preset?: TimerPreset;
  is_active?: boolean;
  current_transition_index?: number;
}

/**
 * Timer status for UI display and state management
 */
interface TimerStatus {
  session?: TimerSession;
  current_transition?: FrequencyTransition;
  next_transition?: FrequencyTransition | null;
  time_remaining_current?: number;
  time_remaining_total?: number;
  isRunning: boolean;
  totalTime: number;
  progress: number;

  // WebSocket compatibility fields (⚠️ Lots of optionals)
  currentTime?: number;
  isPaused?: boolean;
  transitionIndex?: number;
  totalTransitions?: number;
  leftFreq?: number;
  rightFreq?: number;
  beat_frequency?: number;
  action?: string;
  preset?: string;
  firstTransition?: FrequencyTransition;
}

/**
 * Local timer state for useTimerLogic hook
 */
interface LocalTimer {
  startTime: number;
  currentTransitionIndex: number;
  currentStepIndex?: number; // Legacy support
  transitions: FrequencyTransition[];
  isActive: boolean;
  isPaused: boolean;
  forceLoop?: boolean;
  session?: TimerSession;
  status?: TimerStatus;
}

/**
 * Timer control actions
 */
type TimerAction = 'stop' | 'pause' | 'resume' | 'restart';
```

**🚨 ISSUES**:
1. `TimerSession.presetId` is typed as `TimerPreset` (should be `string`!)
2. `TimerStatus` has too many optional fields (poor type safety)
3. `LocalTimer` has circular references (`session` → `TimerSession` → `preset` → ...)

---

### 4.2 Backend Timer Schemas (backend/schemas/timer_schemas.py)

```python
class FrequencyType(str, Enum):
    DELTA = "delta"      # 0.5-4 Hz
    THETA = "theta"      # 4-8 Hz
    ALPHA = "alpha"      # 8-12 Hz
    BETA = "beta"        # 12-30 Hz
    GAMMA = "gamma"      # 25-100 Hz

class FrequencyTransition(BaseModel):
    duration_minutes: int = Field(gt=0, le=480)
    frequency_hz: float = Field(gt=0.1, le=100)
    frequency_type: FrequencyType
    left_ear_hz: float = Field(gt=20, le=20000)
    right_ear_hz: float = Field(gt=20, le=20000)
    description: Optional[str] = Field(None, max_length=200)

class TimerSession(BaseModel):
    session_id: str
    preset_id: Optional[str] = None
    user_id: str
    start_time: str  # ISO timestamp
    current_transition_index: int = Field(default=0, ge=0)
    elapsed_minutes: int = Field(default=0, ge=0)
    is_active: bool = Field(default=True)
    is_paused: bool = Field(default=False)

class TimerStatusResponse(BaseModel):
    session: Optional[TimerSession]
    current_transition: Optional[FrequencyTransition]
    next_transition: Optional[FrequencyTransition]
    time_remaining_current: int  # Minutes
    time_remaining_total: int    # Minutes
    subscription_required: bool = Field(default=False)
    upgrade_message: Optional[str] = None
```

**✅ CORRECT**: Pydantic schemas are well-defined with validation

**🚨 MISMATCH**: Frontend `TimerStatus` has different shape from backend `TimerStatusResponse`!

---

### 4.3 Frontend FrequencyTransition (types/index.ts:516-525)

```typescript
interface FrequencyTransition {
  duration_minutes: number;
  frequency_hz: number;
  frequency_type: string;  // ⚠️ Should be FrequencyRange type!
  left_ear_hz: number;
  right_ear_hz: number;
  description: string;
  pattern?: string;
  spatial_settings?: ActiveAudioStatus; // ⚠️ Wrong type! Should be SpatialAudioConfig
}
```

**🚨 ISSUES**:
1. `frequency_type` is `string` (should be typed enum)
2. `spatial_settings` has wrong type annotation
3. Missing validation (backend has Field constraints)

---

### 4.4 Timer Preset Types

#### **Frontend** (types/index.ts:496-514)
```typescript
interface TimerPreset {
  id: string;
  name: string;
  description: string;
  total_duration: number; // in minutes
  transitions_count: number;
  tags: string[];
  is_premium?: boolean;
  available?: boolean;
  loop_enabled?: boolean;
  loop_count?: number; // 0 for infinite
  loop_phase?: string;
  loop_transitions?: number[];
  pattern_id?: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  transitions?: FrequencyTransition; // ⚠️ Should be FrequencyTransition[]!
  spatial_config?: SpatialAudioConfig;
  status?: TimerStatus;
}
```

**🚨 BUG**: `transitions?: FrequencyTransition` should be `FrequencyTransition[]` (array)!

#### **Backend** (timer_schemas.py:41-62)
```python
class TimerPreset(BaseModel):
    name: str = Field(max_length=100)
    description: str = Field(max_length=500)
    transitions: List[FrequencyTransition] = Field(min_items=1, max_items=10)
    total_duration: Optional[int] = None  # Auto-calculated
    is_premium: bool = Field(default=False)
    tags: List[str] = Field(default_factory=list)

    def calculate_total_duration(self) -> int:
        return sum(transition.duration_minutes for transition in self.transitions)
```

**🚨 MISMATCH**: Frontend has many more optional fields than backend!

---

## 📊 SECTION 5: AUDIOCONTEXT & NODE MANAGEMENT

### 5.1 AudioContext Ownership Matrix

| **Component/Hook** | **AudioContext Source** | **Ownership** | **Lifetime** | **Shared?** |
|---|---|---|---|---|
| `useAudioEngine` | `audioContextRef.current` | Creates & owns | Component lifetime | ❌ No (but can be) |
| `useBackendAudioEngine` | `audioContext.current` | Waits for external | Lazy init | ✅ Yes (from mixer) |
| `useHybridAudioEngine` | Frontend engine's context | Uses frontend's | Same as frontend | ✅ Yes |
| `AudioMixer` | Constructor parameter | Uses external | Same as parameter | ✅ Yes |
| `AudioContextProvider` | Creates in provider | Owns | App lifetime | ⚠️ Not used? |

**🚨 THE PROBLEM**: Multiple potential sources, unclear lifecycle, race conditions!

---

### 5.2 AudioContext Creation Patterns

#### **Pattern A: Frontend Engine** (useAudioEngine.ts:65-128)
```typescript
const initializeAudio = useCallback(async (): Promise<AudioContext | null> => {
  // Return existing context if running
  if (audioContextRef.current && audioContextRef.current.state === 'running') {
    return audioContextRef.current;
  }

  // Resume if suspended
  if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
    await audioContextRef.current.resume();
    return audioContextRef.current;
  }

  // Create new context
  const context = new (window.AudioContext || window.webkitAudioContext)();
  await context.resume();

  audioContextRef.current = context;  // ⚠️ STORED IN REF
  setAudioState(prev => ({ ...prev, context }));  // ⚠️ ALSO IN STATE

  return context;
}, []);
```

**✅ GOOD**: Persistent, reusable, handles suspended state

**🚨 ISSUE**: Stored in BOTH ref AND state (redundant)

---

#### **Pattern B: Backend Engine** (useBackendAudioEngine.ts:110-154)
```typescript
const initializeAudio = useCallback(async (): Promise<AudioContext | null> => {
  // CRITICAL FIX: Check for external context first (from AudioMixer)
  if (externalOutputNodeRef.current) {
    const externalContext = externalOutputNodeRef.current.context as AudioContext;
    if (externalContext && externalContext.state !== 'closed') {
      console.log('🎵 Backend Engine: Reusing AudioContext from external mixer');
      audioContext.current = externalContext;

      if (externalContext.state === 'suspended') {
        await externalContext.resume();
      }

      return externalContext;
    }
  }

  // Check if we already have a context
  if (!audioContext.current) {
    console.warn('⚠️ Backend Engine: No AudioContext available - waiting for external nodes');
    return null;  // ⚠️ WAITS for external!
  }

  if (audioContext.current.state === 'suspended') {
    await audioContext.current.resume();
  }

  return audioContext.current;
}, []);
```

**✅ GOOD**: Waits for external context from mixer (prevents multiple contexts)

**🚨 ISSUE**: Can return `null` if external nodes not set (caller must handle)

---

#### **Pattern C: Hybrid Engine** (useHybridAudioEngine.ts:56-115)
```typescript
const initializeMixer = useCallback(async () => {
  if (mixerRef.current) {
    return mixerRef.current;
  }

  // CRITICAL: Ensure audio context exists FIRST
  let context = frontendEngine.audioContext;
  if (!context) {
    context = await frontendEngine.initializeAudio();  // ⚠️ Delegates to frontend
  }

  if (!context) {
    throw new Error('Failed to create audio context');
  }

  // Create mixer with verified context
  mixerRef.current = new AudioMixer(context);  // ⚠️ Shares frontend's context

  // Connect BOTH engines to mixer
  frontendEngine.setExternalNodes(
    mixerRef.current.getFrontendGain(),
    mixerRef.current.analyserNode
  );

  backendEngine.setExternalNodes(
    mixerRef.current.getBackendGain(),
    mixerRef.current.analyserNode
  );

  setIsInitialized(true);
  return mixerRef.current;
}, [frontendEngine, backendEngine]);
```

**✅ EXCELLENT**: Single source of truth (frontend's context), shared via mixer

**🚨 TIMING**: Must be called BEFORE any audio starts (user gesture required)

---

### 5.3 Analyser Node Management

| **Component** | **Analyser Source** | **Ownership** | **Shared?** | **Purpose** |
|---|---|---|---|---|
| `useAudioEngine` | `analyserNodeRef.current` | Creates | ❌ Initially no | Standalone visualization |
| `useAudioEngine` (mixer mode) | `externalAnalyserRef.current` | Uses external | ✅ Yes | Mixer visualization |
| `useBackendAudioEngine` | `analyserNode.current` | Creates | ❌ Initially no | Standalone visualization |
| `useBackendAudioEngine` (mixer mode) | `externalAnalyserRef.current` | Uses external | ✅ Yes | Mixer visualization |
| `AudioMixer` | `this.analyserNode` | Creates & owns | ✅ Yes | Shared visualization |

**✅ SOLUTION**: AudioMixer creates ONE analyser, both engines connect to it

**🚨 ISSUE**: Before mixer init, engines have their own analysers (inconsistent visualization)

---

### 5.4 Node Connection Patterns

#### **Standalone Frontend** (useAudioEngine.ts:272-352)
```typescript
// Audio chain:
oscL → gainL ─┐
              ├─→ merger → analyser → destination
oscR → gainR ─┘

// With equalizer:
oscL → gainL ─┐
              ├─→ merger → eqInput → eqOutput → analyser → destination
oscR → gainR ─┘
```

#### **Frontend + Mixer** (useAudioEngine.ts:297-323)
```typescript
// Audio chain:
oscL → gainL ─┐
              ├─→ merger → [equalizer?] → mixerFrontendGain → mixerMaster → mixerAnalyser → destination
oscR → gainR ─┘
```

#### **Backend + Mixer** (useBackendAudioEngine.ts:276-296)
```typescript
// Audio chain:
AudioWorklet (processes frames) → mixerBackendGain → mixerMaster → mixerAnalyser → destination
```

**✅ CONSISTENT**: All audio flows through shared analyser in mixer mode

---

## 📊 SECTION 6: PATTERN & PRESET TYPES

### 6.1 PatternConfig (types/index.ts:39-67)

```typescript
interface PatternConfig {
  id: string;
  name: string;
  type: WavePattern;  // 'toroidal' | 'vortex' | 'spiral' | etc.
  description: string;
  instructions: string;
  benefits: string[];

  frequencies: {
    carrier: number;  // ⚠️ Different name for "base_frequency"
    beat: number;     // Beat frequency
    range: FrequencyRange;  // 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma'
  };

  duration: number; // in minutes

  electromagnetic: {
    fieldStrength: number;
    resonanceFreq: number;
    coherence: number;
  };

  visualization: {
    color: string;
    intensity: number;
    pattern: string;
  };

  adhd?: {
    protocol: string;
    duration: number;
    intensity: number;
  };
}
```

**🚨 ISSUE**: `frequencies.carrier` should align with `base_frequency` naming!

---

### 6.2 PatternPreset (types/index.ts:224-232)

```typescript
interface PatternPreset {
  id: string;
  name: string;
  category: 'meditation' | 'focus' | 'creativity' | 'healing' | 'adhd' | 'custom';
  pattern: PatternConfig;
  electromagnetic: ElectromagneticField;
  saved: boolean;
  rating: number;
}
```

**✅ GOOD**: Clean structure for saved patterns

---

### 6.3 Clean Types Pattern (clean.types.ts:79-87)

```typescript
/**
 * Pattern definition - simple and clear
 */
interface Pattern {
  id: string;
  name: string;
  description: string;
  audio: AudioConfig;  // ⚠️ Uses AudioConfig (not BinauralBeatConfig)
  spatial: SpatialConfig;
  duration: number; // minutes
  category: 'meditation' | 'focus' | 'creativity' | 'healing' | 'adhd';
}
```

**🚨 REDUNDANCY**: Yet another pattern type with different structure!

---

## 📊 SECTION 7: SPATIAL AUDIO TYPES

### 7.1 SpatialAudioConfig (types/index.ts + audio.types.ts:97-111)

```typescript
interface SpatialAudioConfig {
  enabled: boolean;
  hrtf: boolean;
  roomSize: number;
  reverbAmount: number;
  spatialWidth: number;
  elevation: number;
  azimuth: number;
  movement_speed?: number;
  spatial_intensity?: number;
  reverb_enabled?: boolean;
  reverberance?: number;
  room_scale?: number;
  hf_damping?: number;
}
```

**🚨 ISSUE**: Mix of required and optional fields, inconsistent naming (`roomSize` vs `room_scale`)

---

### 7.2 SpatialConfig (clean.types.ts:22-27)

```typescript
/**
 * Spatial audio settings
 */
interface SpatialConfig {
  enabled: boolean;
  mode: 'binaural' | 'stereo' | '3d';
  positioning: 'headphones' | 'speakers';
  roomSize: 'small' | 'medium' | 'large';  // ⚠️ Different from SpatialAudioConfig!
}
```

**🚨 REDUNDANCY**: Simpler version with categorical room size (better?)

---

## 📊 SECTION 8: EQUALIZER TYPES

### 8.1 EqualizerBand (types/index.ts:552-559)

```typescript
/**
 * Equalizer band configuration
 */
interface EqualizerBand {
  id: string;
  frequency: number; // Center frequency in Hz
  gain: number; // Gain in dB (-40 to +40)
  Q: number; // Quality factor (0.1 to 10)
  type: BiquadFilterType;  // ⚠️ Web Audio API type
  label: string;
}
```

**✅ GOOD**: Matches Web Audio API BiquadFilterNode

---

### 8.2 EqualizerState (types/index.ts:564-568)

```typescript
/**
 * Equalizer state for UI and audio processing
 */
interface EqualizerState {
  enabled: boolean;
  bands: EqualizerBand[];
  preset: string;
}
```

**✅ GOOD**: Simple and clear

---

## 🔴 SECTION 9: REDUNDANCIES & INCONSISTENCIES

### 9.1 Type File Redundancy Matrix

| **Type** | **index.ts** | **audio.types.ts** | **clean.types.ts** | **Status** |
|---|---|---|---|---|
| Audio Config | BinauralBeatConfig (✅) | BinauralBeatConfig (✅) | AudioConfig (🚨) | REDUNDANT |
| Frontend Engine | FrontendAudioEngine (✅) | FrontendAudioEngineState (✅) | FrontendEngine (🚨) | REDUNDANT |
| Backend Engine | AudioEngine (✅) | BackendAudioEngineState (✅) | BackendEngine (🚨) | REDUNDANT |
| Spatial Config | SpatialAudioConfig (✅) | SpatialAudioConfig (✅) | SpatialConfig (🚨) | REDUNDANT |
| Pattern | PatternConfig (✅) | - | Pattern (🚨) | REDUNDANT |
| Frequency Range | FrequencyRange (✅) | - | - | ✅ UNIQUE |
| Timer Types | ✅ Complete | - | TimerTabProps (🚨) | Partial redundancy |

---

### 9.2 Naming Inconsistencies

| **Concept** | **Name A** | **Name B** | **Name C** | **Recommendation** |
|---|---|---|---|---|
| Volume | `amplitude` | `volume` | - | **Use `amplitude`** (scientific) |
| Base frequency | `base_frequency` | `carrier` | `leftFreq` | **Use `base_frequency`** |
| Beat frequency | `beat_frequency` | `beat` | `frequency_hz` | **Use `beat_frequency`** |
| Room size | `roomSize: number` | `room_size: string` | `roomSize: 'small'\|'medium'\|'large'` | **Use categorical enum** |
| Preset ID | `id: string` | `preset_id: string` | `presetId: string` | **Use `id`** (within preset context) |

---

### 9.3 Structural Issues

#### **Issue 1: Computed Properties Pollution**
```typescript
// BackendAudioEngineState has BOTH config AND computed properties
interface BackendAudioEngineState {
  config: BinauralBeatConfig | null;  // Source of truth

  // ⚠️ These are COMPUTED from config - should be getters, not state!
  leftFreq?: number;
  rightFreq?: number;
  beat_frequency?: number;
}
```

**🚨 PROBLEM**: Duplication leads to staleness, inconsistency

**✅ SOLUTION**: Remove computed properties, use getters/functions

---

#### **Issue 2: Optional Field Overload**
```typescript
// TimerStatus has 16 optional fields!
interface TimerStatus {
  session?: TimerSession;
  current_transition?: FrequencyTransition;
  next_transition?: FrequencyTransition | null;
  time_remaining_current?: number;
  // ... 12 more optional fields
}
```

**🚨 PROBLEM**: Poor type safety, unclear which fields are actually present

**✅ SOLUTION**: Split into multiple focused types (WebSocketTimerStatus, UITimerStatus, etc.)

---

#### **Issue 3: Type Annotation Errors**
```typescript
// TimerPreset.transitions is singular, should be array!
interface TimerPreset {
  transitions?: FrequencyTransition;  // ⚠️ WRONG!
}

// FrequencyTransition.spatial_settings has wrong type
interface FrequencyTransition {
  spatial_settings?: ActiveAudioStatus; // ⚠️ Should be SpatialAudioConfig!
}

// TimerSession.presetId is typed as TimerPreset object!
interface TimerSession {
  presetId?: TimerPreset;  // ⚠️ Should be string!
}
```

**🚨 PROBLEM**: Runtime errors waiting to happen!

---

## 🎯 SECTION 10: RECOMMENDED ARCHITECTURE

### 10.1 Single Source of Truth Principle

```
                    ┌─────────────────────────────┐
                    │   src/types/audio.types.ts  │
                    │   (SINGLE SOURCE OF TRUTH)  │
                    └─────────────────────────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
        ┌───────▼────────┐  ┌────▼─────┐  ┌───────▼────────┐
        │ Audio Config   │  │ Engines  │  │ State Types    │
        │ ──────────     │  │ ───────  │  │ ──────────     │
        │ BinauralBeat   │  │ Frontend │  │ AudioState     │
        │ Config         │  │ Backend  │  │ AnalyserState  │
        └────────────────┘  │ Hybrid   │  │ ContextState   │
                            └──────────┘  └────────────────┘
```

### 10.2 Proposed Type Structure

```typescript
// ============================================
// FILE: src/types/audio.types.ts
// SINGLE SOURCE OF TRUTH FOR ALL AUDIO TYPES
// ============================================

// ────────────────────────────────────────────
// CORE AUDIO CONFIGURATION
// ────────────────────────────────────────────

/**
 * Master audio configuration - ONLY config format
 * All components MUST use this
 */
export interface BinauralBeatConfig {
  base_frequency: number;   // Carrier frequency (Hz)
  beat_frequency: number;   // Binaural beat (Hz)
  amplitude: number;        // Volume 0-1
  waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
  spatial?: SpatialAudioConfig;
  metadata?: {
    presetName?: string;
    duration?: number;
    rampTime?: number;
  };
}

/**
 * Spatial audio configuration
 */
export interface SpatialAudioConfig {
  enabled: boolean;
  mode: 'binaural' | 'stereo' | '3d';
  positioning: 'headphones' | 'speakers';
  roomSize: 'small' | 'medium' | 'large';  // Categorical
  reverb?: {
    enabled: boolean;
    amount: number;      // 0-1
    damping: number;     // 0-1
  };
  movement?: {
    speed: number;       // 0-1
    intensity: number;   // 0-1
  };
}

// ────────────────────────────────────────────
// AUDIO ENGINE INTERFACES
// ────────────────────────────────────────────

/**
 * Core audio engine interface (base for all engines)
 */
export interface AudioEngineBase {
  // Audio control
  startBinauralBeat: (config: BinauralBeatConfig) => Promise<void>;
  stopBinauralBeat: () => Promise<void>;
  updateConfig: (config: Partial<BinauralBeatConfig>) => void;

  // State
  isPlaying: boolean;
  currentConfig: BinauralBeatConfig | null;

  // Capabilities
  isSupported: boolean;
}

/**
 * Frontend engine (Web Audio API)
 */
export interface FrontendAudioEngine extends AudioEngineBase {
  type: 'frontend';
  audioContext: AudioContext | null;
  analyserNode: AnalyserNode | null;

  // Frontend-specific
  initializeAudio: () => Promise<AudioContext | null>;
  setExternalNodes: (outputGain: GainNode | null, analyser: AnalyserNode | null) => void;
}

/**
 * Backend engine (WebSocket + AudioWorklet)
 */
export interface BackendAudioEngine extends AudioEngineBase {
  type: 'backend';
  audioContext: AudioContext | null;
  analyserNode: AnalyserNode | null;

  // Backend-specific
  connected: boolean;
  sessionId: string | null;
  connectBackend: () => Promise<void>;
  disconnectBackend: () => Promise<void>;
  setExternalNodes: (outputGain: GainNode | null, analyser: AnalyserNode | null) => void;
}

/**
 * Hybrid engine (combines frontend + backend)
 */
export interface HybridAudioEngine extends AudioEngineBase {
  type: 'hybrid';
  audioContext: AudioContext | null;
  analyserNode: AnalyserNode | null;

  // Hybrid-specific
  currentEngine: 'frontend' | 'backend' | 'hybrid';
  backendConnected: boolean;
  backendSessionId: string | null;

  // Engine access (for advanced use)
  frontendEngine: FrontendAudioEngine;
  backendEngine: BackendAudioEngine;
  mixer: AudioMixer | null;
}

/**
 * Union type for any audio engine
 */
export type AnyAudioEngine = FrontendAudioEngine | BackendAudioEngine | HybridAudioEngine;

// ────────────────────────────────────────────
// FREQUENCY UTILITIES
// ────────────────────────────────────────────

/**
 * Convert base/beat to left/right frequencies
 */
export function toLeftRight(config: BinauralBeatConfig): { leftFreq: number; rightFreq: number } {
  return {
    leftFreq: config.base_frequency,
    rightFreq: config.base_frequency + config.beat_frequency
  };
}

/**
 * Convert left/right to base/beat frequencies
 */
export function toBaseBeat(leftFreq: number, rightFreq: number): { base_frequency: number; beat_frequency: number } {
  return {
    base_frequency: Math.min(leftFreq, rightFreq),
    beat_frequency: Math.abs(rightFreq - leftFreq)
  };
}

/**
 * Validate audio configuration
 */
export function validateConfig(config: Partial<BinauralBeatConfig>): BinauralBeatConfig {
  return {
    base_frequency: clamp(config.base_frequency ?? 140, 20, 20000),
    beat_frequency: clamp(config.beat_frequency ?? 4, 0.1, 100),
    amplitude: clamp(config.amplitude ?? 0.3, 0, 1),
    waveform: config.waveform ?? 'sine',
    spatial: config.spatial,
    metadata: config.metadata
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
```

### 10.3 Migration Strategy

#### **Phase 1: Consolidate Types** (1 day)
1. Delete `src/types/clean.types.ts` (not used)
2. Move all audio types to `src/types/audio.types.ts`
3. Re-export from `src/types/index.ts` for compatibility
4. Add conversion utilities (`toLeftRight`, `toBaseBeat`)

#### **Phase 2: Update Engines** (2 days)
1. Update `useAudioEngine` to implement `FrontendAudioEngine`
2. Update `useBackendAudioEngine` to implement `BackendAudioEngine`
3. Update `useHybridAudioEngine` to implement `HybridAudioEngine`
4. Remove computed properties from state (use functions instead)

#### **Phase 3: Fix Timer Types** (1 day)
1. Fix `TimerPreset.transitions` type (should be array)
2. Fix `TimerSession.presetId` type (should be string)
3. Split `TimerStatus` into focused types
4. Update `useTimerLogic` to use correct conversions

#### **Phase 4: AudioContext Unification** (1 day)
1. Ensure all engines use AudioMixer's shared context
2. Remove redundant AudioContext creation
3. Add lifecycle management (suspend/resume/close)
4. Document AudioContext ownership clearly

#### **Phase 5: Testing & Validation** (2 days)
1. Run full test suite
2. Manual testing of all audio modes
3. Verify frequency calculations are correct
4. Test WebSocket streaming with backend
5. Validate visualizations work correctly

**TOTAL ESTIMATED TIME**: 7 days

---

## 🎯 SECTION 11: CRITICAL FIXES NEEDED NOW

### Priority 1: Type Bugs (Breaking)
1. **`TimerPreset.transitions`** - Change from `FrequencyTransition` to `FrequencyTransition[]`
2. **`TimerSession.presetId`** - Change from `TimerPreset` to `string`
3. **`FrequencyTransition.spatial_settings`** - Change from `ActiveAudioStatus` to `SpatialAudioConfig`

### Priority 2: Conversion Errors (Bugs)
1. **Timer → Backend frequency** - Fix `useTimerLogic` line 263: Don't send `left_ear_hz` as `base_frequency`
2. **Hybrid Engine conversions** - Add proper `toBaseBeat()` conversion in updateFrequency

### Priority 3: Redundancy Removal (Technical Debt)
1. **Delete `clean.types.ts`** - Not used, causes confusion
2. **Remove computed properties** from `BackendAudioEngineState`
3. **Consolidate spatial types** - Pick one: `SpatialAudioConfig` or `SpatialConfig`

### Priority 4: Documentation (Clarity)
1. **Document AudioContext lifecycle** - Who creates, who owns, when to share
2. **Document frequency models** - When to use left/right vs base/beat
3. **Document type migration** - How to update components to new types

---

## 📋 APPENDIX: Quick Reference

### Frequency Model Cheat Sheet

```typescript
// Model 1: Base/Beat (STANDARD - use this!)
const config: BinauralBeatConfig = {
  base_frequency: 140,  // Carrier (left ear)
  beat_frequency: 4     // Binaural beat
};
// Result: Left=140Hz, Right=144Hz, Beat=4Hz

// Model 2: Left/Right (LEGACY - convert to base/beat)
const leftFreq = 140;
const rightFreq = 144;
const config = toBaseBeat(leftFreq, rightFreq);
// Result: base=140, beat=4

// Model 3: Timer (CONVERT to base/beat)
const transition: FrequencyTransition = {
  left_ear_hz: 140,
  right_ear_hz: 144,
  frequency_hz: 4
};
const config = {
  base_frequency: Math.min(transition.left_ear_hz, transition.right_ear_hz),
  beat_frequency: transition.frequency_hz
};
```

### AudioContext Lifecycle

```typescript
// 1. Created by frontend engine on first user interaction
const frontendEngine = useAudioEngine();
await frontendEngine.initializeAudio();  // Creates AudioContext

// 2. Shared via AudioMixer
const mixer = new AudioMixer(frontendEngine.audioContext!);

// 3. Both engines use same context
frontendEngine.setExternalNodes(mixer.getFrontendGain(), mixer.analyserNode);
backendEngine.setExternalNodes(mixer.getBackendGain(), mixer.analyserNode);

// 4. Visualizations use mixer's analyser
<FrequencyVisualizer
  audioContext={frontendEngine.audioContext}
  analyserNode={mixer.analyserNode}
/>
```

---

**END OF AUDIT**
**Next Steps**: Review with team, prioritize fixes, execute migration plan