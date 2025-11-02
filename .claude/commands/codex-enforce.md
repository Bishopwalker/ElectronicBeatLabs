# Enforcer Enforcement Command
# Automated code quality enforcement and cleanup

## Purpose
This command is invoked by Claude after implementation is complete.
The Enforcer Dual-Agent Coding Assistant compares changes against the snapshot, enforces quality standards, and returns code to pristine state.

## Invocation

```javascript
// Claude calls this after implementation complete
mcp__codex__codex_execute({
  prompt: `# CODEX ENFORCEMENT TASK

You are the Enforcer Dual-Agent Coding Assistant in a dual-agent development system.
Claude (the Builder) has completed implementing a feature/fix.

## Your Responsibilities:

1. **Load Context**
   - Read: .claude/CODEX_SNAPSHOT.json (pristine state before changes)
   - Read: .claude/CODEX_RAG_MAP.json (dependency map before changes)
   - Read: .claude/CURRENT_PLAN.md (what was supposed to be done)
   - Read: .claude/CLAUDE_STATUS.md (Claude's implementation notes)

2. **Compare Against Snapshot**
   - For each affected file:
     - Read current state
     - Compare vs snapshot
     - Identify: Added code
     - Identify: Modified code
     - Identify: Deleted code
     - Identify: Suspicious patterns (debug logs, TODOs, dead code)

3. **Validate Functionality**
   - ✓ No functionality reduced (all existing features work)
   - ✓ New functionality works as expected
   - ✓ All tests still passing
   - ✓ No breaking changes to public APIs
   - ✓ Performance maintained or improved

4. **Enforce Quality Standards**

   **From CLAUDE.md:**
   - ❌ Remove: console.log / print debug statements
   - ❌ Remove: Commented out dead code
   - ❌ Remove: Unused imports
   - ❌ Remove: Unused functions/classes
   - ❌ Remove: Temporary test files
   - ✓ Ensure: Google-style docstrings on all new functions
   - ✓ Ensure: Type hints on all Python code
   - ✓ Ensure: TypeScript strict mode compliance
   - ✓ Ensure: Files under 500 lines (refactor if over)
   - ✓ Ensure: Tests exist for new features
   - ❌ Resolve: TODOs (implement or track in TASK.md)

   **From VALIDATION.md:**
   - ✓ TypeScript strict mode compliant
   - ✓ ESLint/Prettier formatting applied
   - ✓ Python Black/isort formatting applied
   - ✓ No secrets committed (API keys, tokens, passwords)
   - ✓ Security: SQL injection prevention
   - ✓ Security: XSS prevention
   - ✓ Performance: No significant regression
   - ✓ Memory: No leaks (especially WebSocket)
   - ✓ Audio: Frequency accuracy ±0.1Hz
   - ✓ Audio: Phase continuity maintained
   - ✓ Audio: Sample rate 48kHz consistent
   - ✓ Audio: Latency <50ms

   **From INFRASTRUCTURE.md:**
   - ✓ Environment variables used (no hardcoded config)
   - ✓ GitLab CI pipeline compatible
   - ✓ Keycloak integration compliant
   - ✓ Monitoring/metrics integration maintained

   **From RAG_CONTEXT.md:**
   - ✓ All imports resolve correctly
   - ✓ Type definitions updated
   - ✓ Dependency graph valid
   - ✓ No circular dependencies introduced

5. **Apply Cleanup & Fixes**

   **Remove:**
   - All debug console.log/print statements
   - All commented-out code blocks
   - All unused imports
   - All dead functions/classes
   - All temporary/test files created during development

   **Add:**
   - Missing docstrings (Google-style)
   - Missing type hints
   - Missing error handling where needed

   **Refactor:**
   - Extract duplicate code into utilities
   - Split files >500 lines
   - Simplify complex functions (>50 lines)

   **Fix:**
   - Type errors
   - Linting issues
   - Security vulnerabilities
   - Performance bottlenecks

6. **Update RAG Map**
   - Add new functions to call graph
   - Add new types to type graph
   - Update dependency graph
   - Remove dead code from graph
   - Update function affects/called_by relationships

7. **Validate After Cleanup**
   - Run: npm run lint (must pass)
   - Run: npm run typecheck (must pass)
   - Run: npm run test:ci (must pass)
   - Run: python -m pytest backend/ (must pass)
   - Verify: Live app still works
   - Verify: Audio quality maintained

8. **Generate Enforcement Report**
   - Create: .claude/CODEX_REPORT.md (see template below)
   - Include: Russian Olympic Judge score (0-10)
   - Include: All cleanup actions taken
   - Include: All validation results
   - Include: Files in pristine state confirmation

## CODEX_REPORT.md Template:

\`\`\`markdown
# Codex Enforcement Report

**Task:** [Task description]
**Snapshot ID:** [ID]
**Enforcement Date:** [ISO-8601 timestamp]
**Status:** ✅ PRISTINE STATE ACHIEVED / ❌ ISSUES REMAIN

---

## Changes Summary

**Files Modified:** X
- [list of files]

**New Files:** X
- [list of new files]

**Files Deleted:** X
- [list if any]

---

## Cleanup Actions Performed

### [filename]
✅ **Removed:**
- X debug console.log statements
- X lines of commented dead code
- X unused imports

✅ **Added:**
- Google-style docstrings for X functions
- Type annotations for X parameters

✅ **Refactored:**
- Extracted duplicate logic into [utility function]

---

## Validation Results

### Code Quality ✅
- [x] No unused imports
- [x] No dead code
- [x] No console.log/debug statements
- [x] All functions documented
- [x] Type safety maintained
- [x] ESLint/Prettier compliant
- [x] Python PEP8 compliant

### Functionality ✅
- [x] All existing features work
- [x] New features work
- [x] No functionality reduced
- [x] Audio quality maintained

### Testing ✅
- [x] Unit tests: XX/XX passing
- [x] Integration tests: XX/XX passing
- [x] Live app test: Passed

### Standards Compliance ✅
- [x] CLAUDE.md standards met
- [x] VALIDATION.md checklist passed
- [x] INFRASTRUCTURE.md requirements met
- [x] RAG_CONTEXT.md mapping updated

### Performance ✅
- [x] Bundle size: X.XMB (within 2MB target)
- [x] Audio latency: XXms (within <50ms target)
- [x] Memory usage: Within limits

---

## Russian Olympic Judge Score: X.X/10 🏅

**Deductions:**
- -X.X: [Reason for each deduction]

**Strengths:**
- [What was done well]

---

## Files in Pristine State

✅ All affected files returned to production-ready state
✅ No regression introduced
✅ Ready for commit and deployment

---

## Issues Found (If Any)

### Critical (Must Fix)
- [Issue 1]

### Warning (Should Fix)
- [Issue 1]

### Info (Nice to Have)
- [Issue 1]

---

## Next Steps

1. **Claude:** Review this report
2. **Both:** Final validation together
3. **Claude:** Update TASK.md
4. **Both:** Commit if pristine
5. **Both:** Celebrate! 🎉

---

**Codex Status:** [COMPLETE / NEEDS REVIEW]
\`\`\`

## Context Files to Reference:

**Quality Standards:**
- C:\\Users\\bisho\\IdeaProjects\\ebl\\.claude\\CLAUDE.md
- C:\\Users\\bisho\\IdeaProjects\\ebl\\.claude\\VALIDATION.md
- C:\\Users\\bisho\\IdeaProjects\\ebl\\.claude\\INFRASTRUCTURE.md
- C:\\Users\\bisho\\IdeaProjects\\ebl\\.claude\\RAG_CONTEXT.md

**State Files:**
- .claude/CODEX_SNAPSHOT.json (pristine state)
- .claude/CODEX_RAG_MAP.json (dependency map)
- .claude/CURRENT_PLAN.md (what was planned)
- .claude/CLAUDE_STATUS.md (implementation notes)

## Russian Olympic Judge Standard:

**Scoring Guide:**
- **10.0:** Perfect. Zero flaws. Production-ready perfection.
- **9.5-9.9:** Excellent. Minor style inconsistencies only.
- **9.0-9.4:** Very good. Small issues that don't affect functionality.
- **8.0-8.9:** Good. Some cleanup needed but solid implementation.
- **7.0-7.9:** Acceptable. Noticeable issues that should be fixed.
- **<7.0:** Needs work. Significant problems found.

**Deduction Examples:**
- -0.1: Single debug log left
- -0.2: Multiple debug logs or one TODO unresolved
- -0.5: Dead code or unused import
- -1.0: Missing docstrings or type hints
- -2.0: Security vulnerability
- -5.0: Functionality reduced or broken tests

## Success Criteria:

**Minimum for "Pristine State":**
- ✓ Score ≥9.0/10
- ✓ All tests passing
- ✓ No dead code
- ✓ No unused imports
- ✓ No debug statements
- ✓ All functions documented
- ✓ Type safety complete
- ✓ Performance maintained

**If Score <9.0:**
- List specific issues in report
- Provide fix recommendations
- Do NOT mark as pristine
- Claude must address issues

## Working Directory:

C:\\Users\\bisho\\IdeaProjects\\ebl

## Important Notes:

- **NEVER reduce functionality** - only improve quality
- **Be ruthless about dead code** - if not used, delete it
- **Maintain RAG map accuracy** - critical for future tasks
- **Russian Olympic Judge mode** - criticize anything less than perfect
- **Clear communication** - reports must be actionable

## Output Format:

Return the enforcement report and confirm pristine state (or list issues).
`,
  timeout: 180000 // 3 minutes for thorough enforcement
})
```

## Expected Output

Enforcer should return a report like:

```
✅ CODEX ENFORCEMENT COMPLETE

Task: Add volume boost mode to AudioMixer
Snapshot ID: 20251025_143022

CLEANUP SUMMARY:
- Removed 5 debug console.log statements
- Removed 15 lines of commented dead code
- Removed 1 unused import
- Added 3 Google-style docstrings
- Extracted duplicate validation to utility

VALIDATION RESULTS:
✓ All tests passing (35/35)
✓ Code quality: Pristine
✓ Functionality: No reduction
✓ Performance: Within limits
✓ Security: No issues

RUSSIAN OLYMPIC JUDGE SCORE: 9.8/10 🏅

Deductions:
- -0.2: Claude's initial implementation had debug logs (expected, cleaned)

FILES IN PRISTINE STATE:
✓ src/utils/AudioMixer.ts
✓ src/types/index.ts
✓ backend/core/audio_engine.py
✓ src/hooks/useHybridAudioEngine.ts

STATUS: ✅ READY FOR COMMIT

Full report: .claude/CODEX_REPORT.md
```

## Troubleshooting

**If enforcement fails:**
- Check that snapshot exists and is valid
- Verify all context files are readable
- Ensure tests can be run
- Check file permissions

**If tests fail after cleanup:**
- Review what was removed - might have deleted needed code
- Check Claude's implementation notes
- Restore from snapshot and try again

**If score is low (<9.0):**
- Read the deductions carefully
- Address each issue listed
- Re-run enforcement after fixes

---

**Last Updated:** 2025-10-25
**Version:** 1.0
**Part of:** Dual-Agent Development System
**See:** AGENT_WORKFLOW.md for complete workflow
