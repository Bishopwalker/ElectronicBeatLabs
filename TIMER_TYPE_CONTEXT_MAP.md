# TIMER TYPE CONTEXT MAP
## Complete mapping of all timer-related types, definitions, and usage

---

## 📋 TYPE INVENTORY

### ✅ EXISTING TYPES (Properly Defined)

#### 1. **TimerPreset**
**Definition:** `src/types/index.ts:390-406`
```typescript
export interface TimerPreset {
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
  transitions?: FrequencyTransition;
}
```

**Usage:**
- ✅ `src/data/timer/timerPresets.ts:3` - BUILT_IN_PRESETS array
- ✅ `src/data/timer/index.ts:10` - Imported and used
- ✅ `src/components/TimerCountdownDisplay.tsx:8` - Import
- ✅ All timer-related components

---

#### 2. **FrequencyTransition**
**Definition:** `src/types/index.ts:408-417`
```typescript
export interface FrequencyTransition {
  duration_minutes: number;
  frequency_hz: number;
  frequency_type: string;
  left_ear_hz: number;
  right_ear_hz: number;
  description: string;
  pattern?: string;
  spatial_settings?: ActiveAudioStatus; // Should be SpatialAudioConfig
}
```

**Usage:**
- ✅ `src/hooks/useTimerLogic.ts:9` - Import
- ✅ `src/hooks/useTimerLogic.ts:271` - Array type
- ✅ Used in transition arrays throughout

---

#### 3. **ComprehensiveTimerPreset**
**Definition:** `src/data/timer/comprehensiveTimerTemplate.ts:18-66`
```typescript
export interface ComprehensiveTimerPreset extends TimerPreset {
  categories: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  target_states: string[];
  contraindications?: string[];
  loop_config?: {...};
  advanced_transitions: AdvancedFrequencyTransition[];
  pattern_progression: PatternProgression[];
  spatial_8d_config: Spatial8DConfig;
  electromagnetic_progression: ElectromagneticProgression[];
  // ... more fields
}
```

**Usage:**
- ✅ `src/data/timer/advancedTimerPresets.ts` - ADVANCED_HEALING_PROTOCOL, ADHD_GAMMA_FOCUS_BLAST
- ✅ `src/data/timer/lucidDreamingPreset.ts` - LUCID_DREAMING_MASTER
- ✅ `src/data/timer/toroidalLowFrequencyExamples.ts` - All toroidal presets

---

### ❌ MISSING TYPES (Being Imported But Not Defined)

#### 4. **TimerStatus** ❌
**Current Import Locations:**
- `src/hooks/useTimerLogic.ts:7` - `type TimerStatus`
- `src/components/TimerControls.tsx:27`
- `src/components/TimerCountdownDisplay.tsx:8`
- `src/components/tabs/TimerTab.tsx:14`
- `src/components/tabs/SettingsTab.tsx:8`
- `src/components/ElectromagneticBeatLab.tsx:32`
- `src/hooks/useCurrentPresetTracker.ts:3`

**ACTUAL STRUCTURE (from usage in useTimerLogic.ts:211-228):**
```typescript
// INFERRED STRUCTURE:
interface TimerStatus {
  session?: {
    presetId: TimerPreset | undefined;
    startTime: number;
    currentPhase: number;
    isPaused: boolean;
    loopCount: number;
    session_id: string;
    preset?: TimerPreset;  // Used in TimerControls.tsx:303
    is_active?: boolean;    // Used in TimerControls.tsx:282
    current_transition_index?: number; // Used in TimerCountdownDisplay.tsx:37
  };
  current_transition: FrequencyTransition;
  next_transition: FrequencyTransition | null;
  time_remaining_current: number;
  time_remaining_total: number;
  isRunning: boolean;
  totalTime: number;
  progress: number;
}
```

**Usage Pattern:**
- `useTimerLogic.ts:211` - Created and populated
- `useTimerLogic.ts:230` - Set in state
- `useTimerLogic.ts:234` - Passed to callback
- `TimerCountdownDisplay.tsx:22-26` - Read properties
- `TimerControls.tsx:303, 355-396` - Read session properties

---

#### 5. **LocalTimer** ❌
**Current Import Location:**
- `src/hooks/useTimerLogic.ts:8` - `type LocalTimer`

**ACTUAL STRUCTURE (from usage in useTimerLogic.ts:291-298):**
```typescript
// INFERRED STRUCTURE:
interface LocalTimer {
  startTime: number;
  currentTransitionIndex: number;
  transitions: FrequencyTransition[];
  isActive: boolean;
  isPaused: boolean;
  forceLoop?: boolean;  // Optional extension
  session?: {
    is_active?: boolean;
    is_paused?: boolean;
    preset?: TimerPreset;
  };
}
```

**Usage Pattern:**
- `useTimerLogic.ts:67` - State type
- `useTimerLogic.ts:180` - Object creation
- `useTimerLogic.ts:291` - Complete initialization
- `useTimerLogic.ts:175,196,200` - Property access

---

#### 6. **TimerSession** ❌
**Current Import Location:**
- `src/hooks/useTimerLogic.ts:10` - `type TimerSession`

**USAGE: NOT ACTUALLY USED STANDALONE**
- This type appears to be embedded within `TimerStatus.session` and `LocalTimer.session`
- Should be extracted as a shared type

**INFERRED STRUCTURE:**
```typescript
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
```

---

#### 7. **TimerAction** ❌
**Current Import Location:**
- `src/hooks/useTimerLogic.ts:11` - `type TimerAction`

**ACTUAL STRUCTURE (from usage in useTimerLogic.ts:356):**
```typescript
// INFERRED STRUCTURE:
type TimerAction = 'stop' | 'pause' | 'resume' | 'restart';
```

**Usage Pattern:**
- `useTimerLogic.ts:356` - Function parameter type
- `useTimerLogic.ts:362,373,376,381,383,398,400,403` - String literal checks

---

#### 8. **CustomPresetForm** ❌
**Current Import Locations:**
- `src/hooks/useTimerLogic.ts:12` - `type CustomPresetForm`
- `src/components/TimerControls.tsx:27`
- `src/components/timer/CustomPresetDialog.tsx:18`

**ACTUAL STRUCTURE (from usage in TimerControls.tsx:81-96 and useTimerLogic.ts:435):**
```typescript
// INFERRED STRUCTURE:
interface CustomPresetForm {
  name: string;
  description: string;
  duration: number;  // Total duration in minutes
  tags: string[];
  transitions: FrequencyTransition[];  // At least one transition required
}
```

**Usage Pattern:**
- `TimerControls.tsx:81` - State initialization
- `TimerControls.tsx:128-134` - Object creation from preset
- `CustomPresetDialog.tsx:24-25` - Props types
- `useTimerLogic.ts:435,479` - Function parameters

---

## 🔗 TYPE RELATIONSHIPS

```
TimerPreset (base interface)
  ├── Used by: BUILT_IN_PRESETS, ALL_TIMER_PRESETS
  └── Extended by: ComprehensiveTimerPreset
       └── Used by: ADVANCED_TIMER_PRESETS, LUCID_DREAMING_MASTER, etc.

FrequencyTransition (base interface)
  ├── Used by: TimerPreset.transitions
  ├── Used by: LocalTimer.transitions[]
  ├── Used by: TimerStatus.current_transition
  ├── Used by: CustomPresetForm.transitions[]
  └── Extended by: AdvancedFrequencyTransition

TimerSession (extracted interface)
  ├── Used by: TimerStatus.session
  └── Used by: LocalTimer.session

LocalTimer (state management)
  ├── Properties: startTime, currentTransitionIndex, transitions, isActive, isPaused
  └── Used in: useTimerLogic hook state

TimerStatus (component communication)
  ├── Properties: session, current_transition, next_transition, time_remaining_*, isRunning, totalTime, progress
  └── Passed to: TimerControls, TimerCountdownDisplay, TimerTab, SettingsTab, ElectromagneticBeatLab

CustomPresetForm (user input)
  ├── Properties: name, description, duration, tags, transitions
  └── Used in: CustomPresetDialog, TimerControls, useTimerLogic

TimerAction (control actions)
  └── Union type: 'stop' | 'pause' | 'resume' | 'restart'
```

---

## 📍 EXPORT LOCATION REQUIREMENTS

**All missing types MUST be exported from:** `src/data/timer/index.ts`

**Current imports expecting these types:**
```typescript
import {
  type TimerStatus,
  type LocalTimer,
  type TimerSession,
  type TimerAction,
  type CustomPresetForm
} from '../data/timer';
```

---

## ⚠️ CRITICAL ISSUES TO FIX

### Issue 1: Type Not Exported
- **Problem:** Types imported from `../data/timer` but not exported there
- **Files Affected:** All files importing these types
- **Solution:** Add type definitions and exports to `src/data/timer/index.ts`

### Issue 2: FrequencyTransition.spatial_settings Wrong Type
- **Problem:** `spatial_settings?: ActiveAudioStatus` should be `SpatialAudioConfig`
- **Location:** `src/types/index.ts:416`
- **Impact:** Type mismatch in transition data

### Issue 3: TimerSession Not Standalone
- **Problem:** Embedded in multiple places, not DRY
- **Solution:** Extract as shared interface

---

## ✅ ACTION PLAN

1. **Create type definitions in `src/data/timer/index.ts`**
   - Add TimerStatus interface
   - Add LocalTimer interface
   - Add TimerSession interface
   - Add TimerAction type
   - Add CustomPresetForm interface

2. **Export all types properly**
   ```typescript
   export type { TimerStatus, LocalTimer, TimerSession, TimerAction, CustomPresetForm };
   ```

3. **Fix FrequencyTransition.spatial_settings type**
   - Change from `ActiveAudioStatus` to `SpatialAudioConfig`

4. **Verify all imports resolve correctly**
   - Run TypeScript compiler
   - Check all usage locations

---

**STATUS:** Complete context map created ✅
**NEXT:** Define missing types based on inferred structures