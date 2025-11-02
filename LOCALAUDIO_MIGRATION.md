# LocalAudio Migration Guide

## 🎯 Goal
Replace all fragmented audio state (`BackendAudioEngineState`, `FrontendAudioEngineState`, `AudioEngine`) with a **single source of truth**: `LocalAudio`.

## 📋 Current State (BEFORE)

### Old Pattern (Multiple Hooks)
```typescript
// ElectromagneticBeatLab.tsx - BEFORE
const backendEngine = useBackendAudioEngine();
const frontendEngine = useAudioEngine(skipFrontendInit);
const activeAudioEngine = sessionId ? backendEngine : frontendEngine;

// Props drilling nightmare
<MainControls
  isPlaying={activeAudioEngine.audioState.isPlaying}
  volume={activeAudioEngine.audioState.amplitude}
  // ... 10 more props
/>
```

### Problems
❌ Multiple hooks for audio
❌ Manual engine switching logic
❌ Duplicated state everywhere
❌ Props drilling hell
❌ No single source of truth

## ✅ New Pattern (LocalAudio)

### Step 1: Use LocalAudio Hook
```typescript
// ElectromagneticBeatLab.tsx - AFTER
import { useLocalAudio } from '../hooks/useLocalAudio';

const ElectromagneticBeatLab: React.FC<ElectromagneticBeatLabProps> = ({
  initialPattern,
  autoStart = false
}) => {
  // ✅ ONE hook for ALL audio
  const {
    audio,           // Complete audio state
    start,
    stop,
    updateFrequency,
    updateVolume,
    switchEngine,
    electromagnetic  // Already included!
  } = useLocalAudio({
    autoConnect: true,
    preferredEngine: 'backend' // or 'frontend' or 'auto'
  });

  // That's it! No more manual engine management
```

### Step 2: Pass LocalAudio to Components
```typescript
// Simple prop passing - ONE object contains EVERYTHING
<MainControls localAudio={audio} />
<FrequencyDisplay localAudio={audio} />
<PatternSelector localAudio={audio} />
<TimerTab localAudio={audio} />
```

### Step 3: Update Components to Use LocalAudio
```typescript
// MainControls.tsx - BEFORE
interface MainControlsProps {
  isPlaying: boolean;
  volume: number;
  onPlay: () => void;
  onStop: () => void;
  onVolumeChange: (volume: number) => void;
  // ... 10 more props
}

// MainControls.tsx - AFTER
import type { LocalAudio } from '../types';

interface MainControlsProps {
  localAudio: LocalAudio;
}

const MainControls: React.FC<MainControlsProps> = ({ localAudio }) => {
  return (
    <>
      <Button onClick={localAudio.actions.start}>
        {localAudio.playback.isPlaying ? 'Stop' : 'Play'}
      </Button>

      <Slider
        value={localAudio.config.amplitude}
        onChange={(_, v) => localAudio.actions.updateVolume(v as number)}
      />

      {/* Engine info readily available */}
      <Chip label={localAudio.type} /> {/* 'frontend' | 'backend' | 'hybrid' */}

      {/* Switch engines with one call */}
      <Button onClick={() => localAudio.actions.switchEngine('backend')}>
        Use Backend
      </Button>
    </>
  );
};
```

## 🔄 Migration Checklist

### Phase 1: Core Hook ✅
- [x] Create `useLocalAudio` hook
- [x] Implement frontend engine support
- [x] Implement backend engine support
- [x] Add auto-switching logic
- [x] Add WebSocket integration

### Phase 2: Component Migration
- [ ] Update `ElectromagneticBeatLab.tsx`
- [ ] Update `MainControlsMUI.tsx`
- [ ] Update `FrequencyDisplay.tsx`
- [ ] Update `PatternSelector.tsx`
- [ ] Update `TimerTab.tsx`
- [ ] Update `SettingsTab.tsx`
- [ ] Update `QuickStart.tsx`
- [ ] Update `BinauralGeneratorMUI.tsx`

### Phase 3: Cleanup
- [ ] Remove `useBackendAudioEngine`
- [ ] Remove `useAudioEngine`
- [ ] Remove old audio types from `audio.types.ts`
- [ ] Update exports in `types/index.ts`

## 📖 API Reference

### LocalAudio Structure
```typescript
interface LocalAudio {
  // Identification
  id: string;
  type: 'frontend' | 'backend' | 'hybrid';
  name: string;

  // Configuration
  config: AudioConfig;
  spatial: SpatialConfig;

  // Engine State
  engine: {
    frontend: { isActive, context, oscillators, ... };
    backend: { isActive, isConnected, sessionId, ... };
    hybrid: { enabled, primary, fallback, ... };
  };

  // Playback
  playback: {
    state: 'idle' | 'playing' | 'paused' | ...;
    isPlaying: boolean;
    startTime: number | null;
    buffer: { size, health, latency, ... };
  };

  // Pattern & Timer
  pattern: { current, queue, history, ... };
  timer: { isActive, duration, elapsed, ... };

  // Visualization
  visualization: {
    enabled: boolean;
    electromagnetic: ElectromagneticField;
    three: { camera, rotation, zoom };
  };

  // Metrics
  metrics: {
    frequencyAccuracy: number;
    signalQuality: number;
    performance: { cpu, memory, fps, ... };
  };

  // Actions
  actions: {
    start: (config?) => Promise<void>;
    stop: () => void;
    updateFrequency: (base, beat) => void;
    updateVolume: (volume) => void;
    switchEngine: (engine) => Promise<void>;
    loadPattern: (pattern) => void;
    // ... and more
  };
}
```

### useLocalAudio Options
```typescript
interface UseLocalAudioOptions {
  initialConfig?: Partial<AudioConfig>;
  autoConnect?: boolean;              // Auto-connect backend on mount
  preferredEngine?: 'frontend' | 'backend' | 'auto';
}
```

### Quick Actions
```typescript
const { audio, start, stop, switchEngine } = useLocalAudio();

// Start with default config
await start();

// Start with custom config
await start({
  baseFrequency: 144,
  beat_frequency: 4,
  amplitude: 0.7
});

// Switch engines seamlessly
await switchEngine('backend');

// Stop everything
stop();
```

## 🔥 Benefits

### Before (Old Way)
```typescript
// 3 separate hooks
const backend = useBackendAudioEngine();
const frontend = useAudioEngine();
const em = useElectromagneticField();

// Manual engine logic
const engine = backend.sessionId ? backend : frontend;

// Props drilling
<Component
  isPlaying={engine.audioState.isPlaying}
  frequency={engine.audioState.baseFrequency}
  electromagnetic={em}
  volume={engine.audioState.amplitude}
  // ... 20 more props
/>
```

### After (LocalAudio Way)
```typescript
// ONE hook
const { audio } = useLocalAudio({ preferredEngine: 'backend' });

// ONE prop
<Component localAudio={audio} />
```

**Results:**
- ✅ 3 hooks → 1 hook
- ✅ 20+ props → 1 prop
- ✅ Manual logic → Automatic
- ✅ Scattered state → Single source of truth
- ✅ Hard to maintain → Easy to maintain

## 🚀 Next Steps

1. **Backup current code** (already on git)
2. **Start with one component** (e.g., MainControls)
3. **Test thoroughly**
4. **Migrate remaining components**
5. **Remove old code**

---

*Let's consolidate this audio state once and for all, My Dude!* 🎯