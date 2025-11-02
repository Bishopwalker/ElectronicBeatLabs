# Dual-Agent Development System
# Claude (Builder) + Codex (Enforcer) Architecture

**Version:** 1.0
**Created:** 2025-10-25
**Purpose:** Enable Claude to focus 100% on solving problems while Codex ensures 100% code quality

---

## 🎯 Core Philosophy

**Problem:** AI agents often get distracted by cleanup tasks while coding, reducing focus on actual problem-solving.

**Solution:** Split responsibilities between two specialized agents:
- **Claude** = Creative problem-solver (no cleanup burden)
- **Codex** = Quality enforcer (no implementation burden)

**Result:** Pristine code delivery with maximum efficiency.

---

## 🤖 Agent Roles & Responsibilities

### **CLAUDE - The Builder** 🔨

**Primary Focus:** Solve the user's task with 100% energy

**Responsibilities:**
- Analyze user requirements
- Create implementation plans
- Write code to solve problems
- Implement new features
- Fix bugs and issues
- Focus on functionality ONLY

**NOT Responsible For:**
- Cleaning up dead code
- Removing unused imports
- Optimizing type definitions
- Deleting old files
- Code style enforcement
- Quality assurance validation

**Mindset:** "Make it work, Codex will make it clean"

---

### **CODEX - The Enforcer** 🛡️

**Primary Focus:** Ensure code quality and pristine state with 100% energy

**Responsibilities:**
- Take pristine state snapshots
- Maintain RAG dependency mapping
- Remove dead code and unused functions
- Clean up unused imports and types
- Enforce DevOps/DevSecOps/QA standards
- Validate no functionality reduction
- Debug issues introduced by changes
- Return code to acceptable working state
- Enforce Russian Olympic Judge standard

**NOT Responsible For:**
- Implementing new features
- Writing initial code
- Solving user problems
- Creative decision-making

**Mindset:** "Claude builds it, I perfect it"

---

## 🔄 The 6-Phase Workflow

### **Phase 1: Initialization** (Both Agents)

**Execution:** Start of every new task/conversation

**Claude Actions:**
```bash
# 1. Run context initialization
/context-init

# 2. Read primary context files
- .claude/CLAUDE.md (development standards)
- .claude/INITIAL.md (technical specifications)
- PLANNING.md (architecture patterns)
- TASK.md (current work status)

# 3. Load previous conversation context
# 4. Activate memory systems
```

**Codex Actions:**
```bash
# 1. Run context initialization
/context-init

# 2. Read enforcement context files
- .claude/RAG_CONTEXT.md (code organization map)
- .claude/INFRASTRUCTURE.md (DevOps requirements)
- .claude/VALIDATION.md (quality checklists)
- .claude/CLAUDE.md (quality standards)

# 3. Load previous conversation context
# 4. Activate memory systems
# 5. Load existing RAG map if available
```

**Completion Criteria:**
- ✓ Both agents have full context
- ✓ Both understand current codebase state
- ✓ Both know quality standards
- ✓ Ready to proceed with task

---

### **Phase 2: Planning** (Claude)

**Trigger:** User provides task/feature request

**Claude Actions:**
1. Analyze the user's requirements
2. Break down into implementation steps
3. Identify all affected files
4. Document expected changes
5. Create implementation strategy
6. Write plan to `.claude/CURRENT_PLAN.md`

**Plan Format:**
```markdown
# Task: [User's request description]

**Created:** 2025-10-25
**Priority:** High/Medium/Low
**Estimated Complexity:** Simple/Medium/Complex

## Affected Files:
- src/utils/AudioMixer.ts (modify existing)
- src/types/index.ts (add new types)
- backend/core/audio_engine.py (update logic)
- src/hooks/useHybridAudioEngine.ts (integrate new feature)

## New Files (if any):
- src/utils/VolumeBoost.ts (new utility)

## Expected Changes:

### 1. AudioMixer.ts
- Add `boostMode` parameter to constructor
- Implement `setBoostMode(enabled: boolean)` method
- Modify `setMasterVolume()` to support 0-200% range when boosted

### 2. types/index.ts
- Add `BoostMode` type
- Update `AudioMixer` interface

### 3. audio_engine.py
- Update volume validation to allow 0-2.0 range
- Add boost mode parameter to settings

## Implementation Steps:
1. Update TypeScript types for boost mode
2. Modify AudioMixer class logic
3. Update backend validation
4. Test with live audio

## Testing Strategy:
- Unit tests for volume boost logic
- Live audio test at 150% volume
- Verify no clipping/distortion

## Success Criteria:
- [ ] Volume can range 0-200% when boost enabled
- [ ] Audio quality maintained (no clipping)
- [ ] All tests pass
- [ ] Live app works correctly

---
**Status:** Ready for Codex snapshot
```

**Completion Criteria:**
- ✓ Complete implementation plan documented
- ✓ All affected files identified
- ✓ Testing strategy defined
- ✓ Success criteria clear
- ✓ `.claude/CURRENT_PLAN.md` created

---

### **Phase 3: Snapshot & RAG Mapping** (Codex)

**Trigger:** Claude completes CURRENT_PLAN.md

**Codex Actions:**

#### **3.1: Read the Plan**
```typescript
// Codex reads CURRENT_PLAN.md
const plan = await readFile('.claude/CURRENT_PLAN.md');
const affectedFiles = extractAffectedFiles(plan);
const newFiles = extractNewFiles(plan);
```

#### **3.2: Take Pristine Snapshot**
```json
{
  "snapshot_id": "20251025_143022",
  "task": "Add volume boost mode to AudioMixer",
  "timestamp": "2025-10-25T14:30:22Z",
  "files": {
    "src/utils/AudioMixer.ts": {
      "path": "src/utils/AudioMixer.ts",
      "hash": "a1b2c3d4",
      "size": 8547,
      "lines": 303,
      "content": "[full file content]",
      "metadata": {
        "imports": [
          "AudioContext from Web Audio API"
        ],
        "exports": [
          "AudioMixer class"
        ],
        "functions": [
          "constructor",
          "getFrontendGain",
          "getBackendGain",
          "setMasterVolume",
          "crossfadeToBackend",
          "failoverToFrontend"
        ],
        "types_used": [
          "AudioContext",
          "GainNode",
          "AnalyserNode"
        ]
      }
    }
  }
}
```

#### **3.3: Build/Update RAG Map**
```json
{
  "rag_map_version": "1.0",
  "generated": "2025-10-25T14:30:25Z",
  "task_context": "Add volume boost mode",

  "dependency_graph": {
    "src/utils/AudioMixer.ts": {
      "imports_from": [],
      "imported_by": [
        "src/hooks/useHybridAudioEngine.ts",
        "src/engines/BackendAudioEngine.ts"
      ],
      "exports": ["AudioMixer"],
      "functions": {
        "setMasterVolume": {
          "called_by": [
            "useHybridAudioEngine.ts:updateVolume()",
            "MainControlsMUI.tsx:handleVolumeChange()"
          ],
          "parameters": ["volume: number"],
          "return_type": "void",
          "affects": ["frontendGain", "backendGain"]
        }
      }
    },

    "src/types/index.ts": {
      "exports": [
        "AudioMixer interface (ln 89-115)",
        "WaveForm type (ln 32)",
        "AudioEngine interface (ln 89-115)"
      ],
      "type_dependencies": {
        "AudioMixer": ["WaveForm", "AudioContext"]
      }
    }
  },

  "function_call_graph": {
    "setMasterVolume": {
      "file": "src/utils/AudioMixer.ts",
      "line": 102,
      "calls": [
        "frontendGain.gain.setValueAtTime()",
        "backendGain.gain.setValueAtTime()"
      ],
      "called_by": [
        "useHybridAudioEngine:updateVolume",
        "MainControlsMUI:handleVolumeChange"
      ]
    }
  },

  "type_graph": {
    "AudioEngine": {
      "file": "src/types/index.ts",
      "line": 89,
      "used_by": [
        "src/hooks/useAudioEngine.ts",
        "src/hooks/useHybridAudioEngine.ts",
        "src/components/MainControlsMUI.tsx"
      ],
      "properties": [
        "audioState: BackendAudioEngineState",
        "updateVolume: (volume: number) => void",
        "backendConnected?: boolean"
      ]
    }
  },

  "dead_code_candidates": [],
  "unused_imports": [],
  "orphaned_types": []
}
```

#### **3.4: Store Artifacts**
```bash
# Save snapshot
.claude/CODEX_SNAPSHOT.json

# Save RAG map
.claude/CODEX_RAG_MAP.json
```

#### **3.5: Communicate Readiness**
```markdown
# .claude/CODEX_STATUS.md

**Status:** READY FOR EXECUTION
**Snapshot ID:** 20251025_143022
**Files Tracked:** 4
**RAG Map Version:** 1.0
**Pristine State:** Confirmed

**Message to Claude:**
Snapshot complete. All affected files mapped and stored.
Dependency graph updated. Ready for your implementation.
Proceed when ready! 🎯
```

**Completion Criteria:**
- ✓ All affected files snapshotted
- ✓ RAG dependency map created/updated
- ✓ Pristine state stored
- ✓ Ready signal sent to Claude

---

### **Phase 4: Execution** (Claude)

**Trigger:** Codex signals "READY FOR EXECUTION"

**Claude Mindset:**
> "Focus 100% on making it work. Codex will handle the cleanup."

**Implementation Freedom:**
- Write code however works best
- Leave TODO comments if needed
- Don't worry about perfect imports
- Temporary debug logs are fine
- Extra types for experimentation OK
- Focus on FUNCTIONALITY ONLY

**Example Implementation:**
```typescript
// AudioMixer.ts
// Claude's implementation (might be "messy" but functional)

export class AudioMixer {
  private audioContext: AudioContext;
  private frontendGain: GainNode;
  private backendGain: GainNode;
  public analyserNode: AnalyserNode;

  // NEW: Boost mode support
  private boostMode: boolean = false;  // TODO: make this configurable

  constructor(audioContext: AudioContext, options?: { boostMode?: boolean }) {
    this.audioContext = audioContext;
    this.boostMode = options?.boostMode ?? false;  // Extra logging here
    console.log('AudioMixer init with boost:', this.boostMode);

    // ... existing code ...
  }

  // NEW: Enable/disable boost mode
  setBoostMode(enabled: boolean): void {
    console.log('Setting boost mode:', enabled);  // Debug log (Codex will clean)
    this.boostMode = enabled;
    // TODO: add event emitter for UI updates? (Claude's thought process)
  }

  setMasterVolume(volume: number): void {
    // NEW: Support 0-200% range when boosted
    const maxVolume = this.boostMode ? 2.0 : 1.0;
    const safeVolume = Math.max(0, Math.min(maxVolume, volume));

    console.log(`[DEBUG] setMasterVolume: input=${volume}, safe=${safeVolume}, boost=${this.boostMode}`);

    const now = this.audioContext.currentTime;

    // ... existing volume logic ...

    console.log(`Volume set to ${safeVolume.toFixed(2)}`);  // More debug logs
  }

  // OLD unused function - Claude forgot to remove
  // oldVolumeMethod() { ... }  // Codex will detect and remove this
}
```

**What Claude Leaves Behind (Intentionally):**
- Debug console.log statements
- TODO comments
- Extra experimental types
- Old commented code (might reference later)
- Unused imports from testing
- Temporary helper functions

**What Claude Focuses On:**
- ✓ Feature works correctly
- ✓ Tests pass
- ✓ Audio quality maintained
- ✓ No functionality lost

**Completion Signal:**
```markdown
# .claude/CLAUDE_STATUS.md

**Status:** IMPLEMENTATION COMPLETE
**Task:** Add volume boost mode
**Files Modified:** 4
**New Files:** 0
**Tests:** All passing ✓
**Live Test:** Verified ✓

**Message to Codex:**
Implementation complete! Boost mode works perfectly.
Audio tested at 150% volume - no clipping.
Ready for your enforcement pass! 🧹
```

**Completion Criteria:**
- ✓ Feature implemented and working
- ✓ All tests passing
- ✓ Live app tested
- ✓ Functionality verified
- ✓ Status update for Codex

---

### **Phase 5: Enforcement** (Codex)

**Trigger:** Claude signals "IMPLEMENTATION COMPLETE"

**Codex Mindset:**
> "Claude built it, now I perfect it. Russian Olympic Judge mode activated."

#### **5.1: Compare Against Snapshot**
```typescript
const snapshot = await readFile('.claude/CODEX_SNAPSHOT.json');
const currentState = await readAffectedFiles();
const diff = compareStates(snapshot, currentState);

// Analysis results:
{
  "changes": {
    "src/utils/AudioMixer.ts": {
      "added": [
        "boostMode property",
        "setBoostMode() method",
        "constructor options parameter"
      ],
      "modified": [
        "setMasterVolume() - added boost logic"
      ],
      "removed": [],
      "suspicious": [
        "5 console.log statements (should be removed)",
        "Commented out oldVolumeMethod() (dead code)",
        "TODO comment on line 23 (resolve or document)"
      ]
    }
  }
}
```

#### **5.2: Validate Changes**

**Functionality Check:**
```bash
✓ No functionality reduced
✓ All existing features still work
✓ New feature works as expected
✓ Tests passing (existing + new)
```

**Quality Analysis:**
```bash
ISSUES FOUND:

src/utils/AudioMixer.ts:
  - 5 debug console.log statements (lines 24, 48, 103, 127, 140)
  - Unused commented code: oldVolumeMethod() (lines 210-225)
  - TODO comment without issue reference (line 23)
  - Import from 'types/index' not used (line 2)

src/types/index.ts:
  - No issues found ✓

backend/core/audio_engine.py:
  - Duplicate volume validation logic (lines 283-290, 335-342)
  - Can be extracted to helper function

src/hooks/useHybridAudioEngine.ts:
  - No issues found ✓
```

#### **5.3: Enforce Quality Standards**

**Russian Olympic Judge Checklist:**

**From CLAUDE.md:**
- ❌ Debug console.log found (5 instances) → REMOVE
- ❌ Dead code found (oldVolumeMethod) → REMOVE
- ❌ Unused import found → REMOVE
- ✓ Code follows PEP8/TypeScript standards
- ✓ Type hints present
- ✓ Google-style docstrings
- ✓ File under 500 lines (303 lines ✓)
- ✓ Tests exist for new features
- ❌ TODO without tracking → RESOLVE OR DOCUMENT

**From VALIDATION.md:**
- ✓ TypeScript strict mode compliant
- ✓ ESLint/Prettier formatting applied
- ✓ Security checks pass (no secrets)
- ✓ Audio quality validated (48kHz, <50ms latency)
- ✓ All tests passing
- ✓ Performance metrics met

**From INFRASTRUCTURE.md:**
- ✓ Environment variables properly used
- ✓ GitLab CI pipeline compatible
- ✓ No infrastructure breaking changes

**From RAG_CONTEXT.md:**
- ✓ Imports resolve correctly
- ✓ Type definitions updated
- ❌ RAG map needs update for new methods

#### **5.4: Apply Fixes**

**Cleanup Actions:**
```typescript
// BEFORE (Claude's implementation)
export class AudioMixer {
  private boostMode: boolean = false;  // TODO: make this configurable

  constructor(audioContext: AudioContext, options?: { boostMode?: boolean }) {
    console.log('AudioMixer init with boost:', this.boostMode);
    // ...
  }

  setBoostMode(enabled: boolean): void {
    console.log('Setting boost mode:', enabled);
    this.boostMode = enabled;
    // TODO: add event emitter for UI updates?
  }

  setMasterVolume(volume: number): void {
    console.log(`[DEBUG] setMasterVolume: input=${volume}`);
    // ... logic ...
    console.log(`Volume set to ${safeVolume.toFixed(2)}`);
  }

  // OLD unused function
  // oldVolumeMethod() { ... }
}

// AFTER (Codex cleanup)
export class AudioMixer {
  private boostMode: boolean = false;

  /**
   * Create AudioMixer instance with optional boost mode support
   *
   * Args:
   *     audioContext: Web Audio API context
   *     options: Configuration options (boostMode: enable 0-200% volume range)
   */
  constructor(audioContext: AudioContext, options?: { boostMode?: boolean }) {
    this.audioContext = audioContext;
    this.boostMode = options?.boostMode ?? false;

    // ... existing initialization ...
  }

  /**
   * Enable or disable volume boost mode
   * When enabled, volume can range 0-200% instead of 0-100%
   *
   * Args:
   *     enabled: True to enable boost mode
   */
  setBoostMode(enabled: boolean): void {
    this.boostMode = enabled;
  }

  /**
   * Update master volume for both audio engines
   * Supports 0-200% range when boost mode is enabled
   *
   * Args:
   *     volume: Volume level (0-1.0 normal, 0-2.0 with boost)
   */
  setMasterVolume(volume: number): void {
    const maxVolume = this.boostMode ? 2.0 : 1.0;
    const safeVolume = Math.max(0, Math.min(maxVolume, volume));
    const now = this.audioContext.currentTime;

    // ... existing volume logic (cleaned) ...
  }
}
```

**Changes Made:**
1. ✅ Removed 5 debug console.log statements
2. ✅ Removed commented dead code (oldVolumeMethod)
3. ✅ Removed unused import
4. ✅ Added Google-style docstrings to new methods
5. ✅ Resolved TODOs (implemented or documented in TASK.md)
6. ✅ Updated RAG map with new function relationships

#### **5.5: Update RAG Map**
```json
{
  "dependency_graph": {
    "src/utils/AudioMixer.ts": {
      "functions": {
        "setMasterVolume": {
          "modified": true,
          "change_summary": "Added boost mode support (0-200% range)",
          "affects": ["frontendGain", "backendGain", "boostMode"]
        },
        "setBoostMode": {
          "added": true,
          "parameters": ["enabled: boolean"],
          "affects": ["boostMode"],
          "called_by": [
            "MainControlsMUI.tsx:handleBoostToggle()"
          ]
        }
      }
    }
  }
}
```

#### **5.6: Validation Tests**
```bash
# Run all validation checks
npm run lint ✓
npm run typecheck ✓
npm run test:ci ✓
python -m pytest backend/ ✓

# Live app test
npm run dev:all
# Manual test: Enable boost, set volume 150%, verify no clipping ✓

# CI/CD compatibility
git diff | Check for breaking changes ✓
```

#### **5.7: Generate Enforcement Report**
```markdown
# .claude/CODEX_REPORT.md

**Enforcement Complete**
**Task:** Add volume boost mode to AudioMixer
**Snapshot ID:** 20251025_143022
**Enforcement Date:** 2025-10-25 14:45:00
**Status:** ✅ PRISTINE STATE ACHIEVED

---

## Changes Summary

**Files Modified:** 4
- src/utils/AudioMixer.ts
- src/types/index.ts
- backend/core/audio_engine.py
- src/hooks/useHybridAudioEngine.ts

**New Files:** 0

**Files Deleted:** 0

---

## Cleanup Actions Performed

### src/utils/AudioMixer.ts
✅ **Removed:**
- 5 debug console.log statements (lines 24, 48, 103, 127, 140)
- Commented dead code: oldVolumeMethod() (lines 210-225)
- Unused import: `import { OldType } from 'types/old'`

✅ **Added:**
- Google-style docstrings for new methods (setBoostMode, updated constructor)
- Proper type annotations

✅ **Refactored:**
- None needed - Claude's implementation was clean

### backend/core/audio_engine.py
✅ **Removed:**
- Duplicate volume validation logic

✅ **Added:**
- Helper function `_validate_volume_range()` for DRY principle

### RAG Map Updates
✅ **Updated dependency graph:**
- Added setBoostMode() to function call graph
- Updated setMasterVolume() affects list
- Documented new type BoostMode dependencies

---

## Validation Results

### Code Quality ✅
- [x] No unused imports
- [x] No dead code
- [x] No console.log/debug statements in production code
- [x] All functions documented
- [x] Type safety maintained
- [x] ESLint/Prettier compliant
- [x] Python PEP8 compliant

### Functionality ✅
- [x] All existing features work
- [x] New boost mode feature works
- [x] No functionality reduced
- [x] Audio quality maintained (48kHz, <50ms latency)
- [x] Volume range 0-200% when boosted
- [x] No audio clipping/distortion at 150% volume

### Testing ✅
- [x] All unit tests passing (23/23)
- [x] Integration tests passing (12/12)
- [x] Live app test passed
- [x] Audio quality test passed

### Standards Compliance ✅
- [x] CLAUDE.md standards met
- [x] VALIDATION.md checklist passed
- [x] INFRASTRUCTURE.md requirements met
- [x] RAG_CONTEXT.md mapping updated

### Performance ✅
- [x] Bundle size: 1.8MB (within 2MB target)
- [x] Audio latency: 42ms (within <50ms target)
- [x] Memory usage: 380MB backend, 145MB frontend (within limits)

---

## Russian Olympic Judge Score: 9.8/10 🏅

**Deductions:**
- -0.2: Claude's initial implementation had debug logs (expected, cleaned)

**Strengths:**
- Functionality perfectly implemented
- Clean code after enforcement
- All tests passing
- Performance maintained
- Documentation complete

---

## Files in Pristine State

✅ All affected files returned to production-ready state
✅ No regression introduced
✅ Ready for commit and deployment

---

## Next Steps

1. **Claude:** Review enforcement report
2. **Both:** Final validation together
3. **Claude:** Update TASK.md with completion
4. **Both:** Commit changes
5. **Both:** Celebrate! 🎉

---

**Codex Status:** ENFORCEMENT COMPLETE - Code pristine and ready for commit
```

**Completion Criteria:**
- ✓ All cleanup performed
- ✓ All quality checks passed
- ✓ RAG map updated
- ✓ Pristine state achieved
- ✓ Enforcement report generated

---

### **Phase 6: Final Validation** (Both Agents)

**Trigger:** Codex completes enforcement report

**Joint Validation:**

**Claude Actions:**
1. Read CODEX_REPORT.md
2. Review cleanup actions
3. Verify functionality still works
4. Run live app test
5. Confirm no issues

**Codex Actions:**
1. Run final quality gate checks
2. Verify CI/CD pipeline compatibility
3. Check for any last-minute issues
4. Confirm pristine state

**Final Checklist:**
```markdown
## Pre-Commit Final Validation

- [ ] Claude: Live app tested and works ✓
- [ ] Claude: All features functional ✓
- [ ] Codex: All quality checks passed ✓
- [ ] Codex: No dead code remaining ✓
- [ ] Codex: RAG map updated ✓
- [ ] Both: Tests passing ✓
- [ ] Both: No secrets committed ✓
- [ ] Both: Performance metrics met ✓
- [ ] Both: Ready to commit ✓
```

**Commit Process:**
```bash
# Claude updates task tracking
echo "✅ Volume boost mode implemented" >> TASK.md

# Both agree on commit
git add .
git commit -m "$(cat <<'EOF'
Add volume boost mode to AudioMixer

- Support 0-200% volume range when boost enabled
- Add setBoostMode() method
- Update backend validation
- Maintain audio quality (no clipping)
- All tests passing

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
Co-Enforced-By: Codex <noreply@openai.com>
EOF
)"
```

**Completion Criteria:**
- ✓ Both agents approve changes
- ✓ All validation passed
- ✓ Committed to repository
- ✓ TASK.md updated

---

## 📁 Workflow Files & Templates

### `.claude/CURRENT_PLAN.md`
**Purpose:** Claude's implementation plan
**Created by:** Claude
**Read by:** Codex
**Lifecycle:** Created at Phase 2, archived after Phase 6

**Template:**
```markdown
# Task: [Description]

**Priority:** High/Medium/Low
**Complexity:** Simple/Medium/Complex

## Affected Files:
- [file paths]

## New Files:
- [new file paths if any]

## Expected Changes:
[Detailed breakdown]

## Testing Strategy:
[How to verify]

## Success Criteria:
- [ ] Criteria 1
- [ ] Criteria 2
```

---

### `.claude/CODEX_SNAPSHOT.json`
**Purpose:** Pristine state before changes
**Created by:** Codex
**Used by:** Codex (enforcement)
**Lifecycle:** Created at Phase 3, deleted after Phase 6

**Format:**
```json
{
  "snapshot_id": "string",
  "timestamp": "ISO-8601",
  "files": {
    "path": {
      "content": "string",
      "hash": "string",
      "metadata": {...}
    }
  }
}
```

---

### `.claude/CODEX_RAG_MAP.json`
**Purpose:** Dependency and relationship mapping
**Created by:** Codex
**Updated by:** Codex
**Lifecycle:** Persistent across tasks

**Format:**
```json
{
  "dependency_graph": {...},
  "function_call_graph": {...},
  "type_graph": {...},
  "dead_code_candidates": [],
  "unused_imports": []
}
```

---

### `.claude/CODEX_REPORT.md`
**Purpose:** Enforcement results and cleanup summary
**Created by:** Codex
**Read by:** Claude + User
**Lifecycle:** Created at Phase 5, archived after review

**Template:**
```markdown
# Enforcement Complete

**Task:** [Task name]
**Status:** ✅/❌

## Cleanup Actions:
- [Actions taken]

## Validation Results:
- [Quality checks]

## Russian Olympic Judge Score: X/10

## Next Steps:
- [What's next]
```

---

### `.claude/CLAUDE_STATUS.md`
**Purpose:** Claude's progress updates
**Created by:** Claude
**Read by:** Codex
**Lifecycle:** Updated during Phase 4

**Template:**
```markdown
# Implementation Status

**Status:** In Progress / Complete
**Files Modified:** X
**Tests:** Passing/Failing

**Message to Codex:**
[Status update]
```

---

### `.claude/CODEX_STATUS.md`
**Purpose:** Codex readiness signals
**Created by:** Codex
**Read by:** Claude
**Lifecycle:** Updated during Phase 3

**Template:**
```markdown
# Codex Status

**Status:** READY / BUSY / COMPLETE
**Snapshot ID:** [ID]
**RAG Map:** Updated

**Message to Claude:**
[Status message]
```

---

## 🚀 Quick Reference Commands

### Starting a New Task
```bash
# 1. Both agents initialize
/context-init

# 2. Claude creates plan
# Creates .claude/CURRENT_PLAN.md

# 3. Invoke Codex snapshot
mcp__codex__codex_execute({
  prompt: `Read .claude/CURRENT_PLAN.md
  Take pristine snapshot of all affected files
  Build/update RAG dependency map
  Store in CODEX_SNAPSHOT.json and CODEX_RAG_MAP.json
  Signal readiness in CODEX_STATUS.md`
})

# 4. Claude implements
# [Do the coding]

# 5. Invoke Codex enforcement
mcp__codex__codex_execute({
  prompt: `Compare current state vs CODEX_SNAPSHOT.json
  Enforce all quality standards from CLAUDE.md, VALIDATION.md, INFRASTRUCTURE.md
  Remove dead code, unused imports, debug statements
  Update RAG map
  Generate CODEX_REPORT.md with Russian Olympic Judge scoring`
})

# 6. Final validation
# Both agents review and commit
```

---

## 💡 Best Practices

### For Claude (Builder)
1. **Trust the process** - Don't worry about cleanup during coding
2. **Focus on functionality** - Make it work first
3. **Leave breadcrumbs** - TODOs and comments help Codex understand intent
4. **Test thoroughly** - Functionality is your domain
5. **Document decisions** - Help Codex understand why, not just what

### For Codex (Enforcer)
1. **Never reduce functionality** - Only improve quality
2. **Be ruthless about dead code** - If it's not used, delete it
3. **Maintain the RAG map** - Keep dependency graph current
4. **Russian Olympic Judge mode** - Criticize anything less than perfect
5. **Communicate clearly** - Reports should be actionable

### For Both
1. **Clear handoffs** - Use status files to coordinate
2. **Validate together** - Final checks require both agents
3. **Learn from patterns** - Improve workflow based on what works
4. **Celebrate wins** - Acknowledge successful pristine deliveries

---

## 🔧 Troubleshooting

### Claude can't focus on implementation
**Symptom:** Claude keeps worrying about code quality
**Solution:** Remind Claude that Codex handles ALL cleanup

### Codex removes needed code
**Symptom:** Codex deletes something Claude intentionally added
**Solution:** Claude should add comment explaining why code exists

### Unclear handoff between phases
**Symptom:** Not sure when to switch phases
**Solution:** Check status files (CLAUDE_STATUS.md, CODEX_STATUS.md)

### RAG map outdated
**Symptom:** Codex misses dependencies
**Solution:** Rebuild RAG map from scratch periodically

### Quality standards conflict
**Symptom:** CLAUDE.md says one thing, VALIDATION.md says another
**Solution:** CLAUDE.md is authoritative, update VALIDATION.md

---

## 📊 Success Metrics

### Workflow Efficiency
- **Time to implementation:** Should be FASTER (Claude not distracted)
- **Code quality:** Should be HIGHER (Codex enforces everything)
- **Bug introduction rate:** Should be LOWER (dual validation)
- **Technical debt:** Should be ZERO (Codex cleans everything)

### Agent Performance
- **Claude focus:** 100% on problem-solving
- **Codex thoroughness:** 100% quality enforcement
- **Handoff clarity:** Clear status communication
- **Final state:** Always pristine

---

## 🎓 Training Examples

### Example 1: Simple Feature Addition
[See Phase 4-5 examples above - Volume Boost Mode]

### Example 2: Bug Fix
```
Task: Fix WebSocket reconnection bug

Phase 2 (Claude Plan):
- Identify reconnection logic in useWebsocket.ts
- Add exponential backoff
- Test with network interruption

Phase 3 (Codex Snapshot):
- Snapshot useWebsocket.ts
- Map WebSocket dependencies

Phase 4 (Claude Implementation):
- Add backoff logic
- Test reconnection
- Leave debug logs

Phase 5 (Codex Enforcement):
- Remove debug logs
- Validate no infinite loops
- Check error handling
- Update RAG map
```

### Example 3: Refactoring
```
Task: Extract duplicate audio validation logic

Phase 2 (Claude Plan):
- Find duplicate validation code
- Create shared utility function
- Update all call sites

Phase 3 (Codex Snapshot):
- Snapshot all files with validation logic
- Map function call graph

Phase 4 (Claude Implementation):
- Create validateAudioSettings() utility
- Replace duplicates
- Might leave old code commented

Phase 5 (Codex Enforcement):
- Remove commented old code
- Verify all call sites updated
- Check for missed duplicates
- Update RAG map with new utility
```

---

## 🔄 Workflow Evolution

### Version 1.0 (Current)
- Manual invocation of Codex via mcp__ tools
- Status files for coordination
- JSON snapshots and RAG maps

### Future Enhancements (Potential)
- Automated Codex invocation after Claude signals complete
- Real-time RAG map visualization
- Interactive enforcement reports
- Machine learning from cleanup patterns
- Automated quality gate integration with GitLab CI

---

## 📚 Related Documentation

- **CLAUDE.md** - Development standards and rules
- **VALIDATION.md** - Quality checklists
- **INFRASTRUCTURE.md** - DevOps requirements
- **RAG_CONTEXT.md** - Code organization patterns
- **PLANNING.md** - Architecture patterns
- **TASK.md** - Current work tracking

---

**Last Updated:** 2025-10-25
**Version:** 1.0
**Maintained By:** bishop8-group development team
**Questions:** See INDEX.md for navigation help