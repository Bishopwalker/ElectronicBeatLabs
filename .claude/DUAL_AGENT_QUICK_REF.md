# Dual-Agent Quick Reference
# Fast guide for using Claude + Codex workflow

**Purpose:** Quick commands and workflow for day-to-day use

---

## 🚀 Quick Start - The 3-Command Workflow

### 1. **Claude Creates Plan**
```bash
# After user gives task, Claude writes:
.claude/CURRENT_PLAN.md

# Include:
- Affected files
- Expected changes
- Testing strategy
```

### 2. **Invoke Codex Snapshot**
```javascript
mcp__codex__codex_execute({
  prompt: `Read .claude/CURRENT_PLAN.md.
  Take pristine snapshot of all affected files.
  Build/update RAG map.
  Store in CODEX_SNAPSHOT.json and CODEX_RAG_MAP.json.
  Signal readiness in CODEX_STATUS.md.

  Context files: .claude/RAG_CONTEXT.md
  Working dir: C:\\Users\\bisho\\IdeaProjects\\ebl`,
  timeout: 120000
})
```

### 3. **Claude Implements → Invoke Codex Enforcement**
```javascript
// After implementation complete:
mcp__codex__codex_execute({
  prompt: `Compare vs CODEX_SNAPSHOT.json.
  Enforce quality from CLAUDE.md, VALIDATION.md.
  Remove dead code, debug logs, unused imports.
  Update RAG map.
  Generate CODEX_REPORT.md with Russian Olympic Judge score.

  Context: .claude/CLAUDE.md, .claude/VALIDATION.md
  Working dir: C:\\Users\\bisho\\IdeaProjects\\ebl`,
  timeout: 180000
})
```

---

## 📋 Claude's Checklist

### Before Starting:
- [ ] Run /context-init
- [ ] Check TASK.md for priorities
- [ ] Read relevant context (CLAUDE.md, PLANNING.md)

### Creating Plan:
- [ ] List ALL affected files
- [ ] Describe expected changes
- [ ] Define testing strategy
- [ ] Set success criteria
- [ ] Save as .claude/CURRENT_PLAN.md

### During Implementation:
- [ ] Focus 100% on functionality
- [ ] Don't worry about cleanup
- [ ] Leave TODOs/debug logs as needed
- [ ] Write tests for new features
- [ ] Test live app works

### After Implementation:
- [ ] Update .claude/CLAUDE_STATUS.md
- [ ] Signal "Implementation Complete"
- [ ] Invoke Codex enforcement
- [ ] Wait for CODEX_REPORT.md

### After Enforcement:
- [ ] Review CODEX_REPORT.md
- [ ] Check Russian Olympic Judge score
- [ ] If score ≥9.0: Approve for commit
- [ ] If score <9.0: Address issues
- [ ] Update TASK.md with completion

---

## 🛡️ Codex's Responsibility

### What Codex WILL Do:
✅ Take pristine snapshots
✅ Build/update RAG maps
✅ Remove debug console.log/print
✅ Remove commented dead code
✅ Remove unused imports
✅ Add missing docstrings
✅ Fix type errors
✅ Validate functionality unchanged
✅ Score with Russian Olympic Judge standard

### What Codex WON'T Do:
❌ Implement new features
❌ Make creative decisions
❌ Change functionality
❌ Reduce existing features
❌ Break working code

---

## 📁 File Workflow

### `.claude/CURRENT_PLAN.md`
**Created by:** Claude
**When:** After user gives task
**Template:** `.claude/templates/CURRENT_PLAN_TEMPLATE.md`
**Contains:** Implementation plan, affected files, testing strategy

### `.claude/CODEX_SNAPSHOT.json`
**Created by:** Codex
**When:** After plan created
**Contains:** Pristine state of all affected files
**Used for:** Diff comparison during enforcement

### `.claude/CODEX_RAG_MAP.json`
**Created by:** Codex
**When:** After snapshot
**Contains:** Dependency graph, function call graph, type graph
**Used for:** Detecting dead code, maintaining consistency

### `.claude/CLAUDE_STATUS.md`
**Created by:** Claude
**When:** During/after implementation
**Contains:** Progress updates, completion signal

### `.claude/CODEX_STATUS.md`
**Created by:** Codex
**When:** After snapshot
**Contains:** Readiness signal, snapshot confirmation

### `.claude/CODEX_REPORT.md`
**Created by:** Codex
**When:** After enforcement
**Template:** `.claude/templates/CODEX_REPORT_TEMPLATE.md`
**Contains:** Cleanup summary, validation results, Russian Olympic Judge score

---

## 🎯 Success Criteria

### Minimum for "Pristine State":
- ✓ Russian Olympic Judge score ≥9.0/10
- ✓ All tests passing
- ✓ No dead code
- ✓ No unused imports
- ✓ No debug statements
- ✓ All functions documented
- ✓ Type safety complete
- ✓ Performance maintained

### If Score <9.0:
1. Read deductions in CODEX_REPORT.md
2. Address each issue
3. Re-run enforcement
4. Don't commit until ≥9.0

---

## 🏅 Russian Olympic Judge Scoring

| Score | Meaning | Action |
|-------|---------|--------|
| 10.0 | Perfect | Commit immediately 🎉 |
| 9.5-9.9 | Excellent | Minor review, then commit |
| 9.0-9.4 | Very good | Quick fixes, then commit |
| 8.0-8.9 | Good | Address issues before commit |
| 7.0-7.9 | Acceptable | Significant work needed |
| <7.0 | Needs work | Major issues, don't commit |

**Common Deductions:**
- -0.1: Single debug log
- -0.2: Multiple debug logs or unresolved TODO
- -0.5: Dead code or unused import
- -1.0: Missing docstrings/type hints
- -2.0: Security vulnerability
- -5.0: Functionality reduced/broken tests

---

## 🔧 Common Commands

### Check Codex Status
```bash
cat .claude/CODEX_STATUS.md
```

### Check Enforcement Results
```bash
cat .claude/CODEX_REPORT.md
```

### View Current Plan
```bash
cat .claude/CURRENT_PLAN.md
```

### View Templates
```bash
ls .claude/templates/
cat .claude/templates/CURRENT_PLAN_TEMPLATE.md
cat .claude/templates/CODEX_REPORT_TEMPLATE.md
```

### Clean Up After Task
```bash
# Archive completed task files
mkdir -p .claude/archive/$(date +%Y%m%d)
mv .claude/CURRENT_PLAN.md .claude/archive/$(date +%Y%m%d)/
mv .claude/CODEX_SNAPSHOT.json .claude/archive/$(date +%Y%m%d)/
mv .claude/CODEX_REPORT.md .claude/archive/$(date +%Y%m%d)/
```

---

## ⚠️ Common Issues & Solutions

### Issue: Codex snapshot fails
**Solution:**
1. Check CURRENT_PLAN.md exists and has affected files listed
2. Verify file paths are correct (absolute Windows paths)
3. Check file permissions
4. Re-run snapshot command

### Issue: Codex removes needed code
**Solution:**
1. Add comment explaining why code exists
2. Document in CURRENT_PLAN.md that it's intentional
3. Re-run enforcement
4. If persistent, review CODEX_REPORT.md deductions

### Issue: Low score (<9.0) but code seems fine
**Solution:**
1. Read deductions carefully in CODEX_REPORT.md
2. Check for missed debug logs, unused imports
3. Verify all docstrings present
4. Run tests to confirm functionality
5. Address listed issues

### Issue: RAG map outdated
**Solution:**
1. Delete .claude/CODEX_RAG_MAP.json
2. Re-run Codex snapshot to rebuild
3. Verify dependency graph makes sense

### Issue: Not sure if ready to commit
**Solution:**
1. Check Russian Olympic Judge score (must be ≥9.0)
2. Review validation checklist in CODEX_REPORT.md
3. Run live app test
4. If all ✅, commit with dual attribution

---

## 📊 Workflow State Machine

```
[User Task]
    ↓
[Claude: Create Plan] → CURRENT_PLAN.md
    ↓
[Invoke Codex Snapshot]
    ↓
[Codex: Snapshot + RAG Map] → CODEX_SNAPSHOT.json, CODEX_RAG_MAP.json, CODEX_STATUS.md
    ↓
[Claude: Implement Feature] → Modified files
    ↓
[Claude: Update Status] → CLAUDE_STATUS.md
    ↓
[Invoke Codex Enforcement]
    ↓
[Codex: Compare, Cleanup, Validate] → CODEX_REPORT.md
    ↓
[Score ≥9.0?]
    ├─ YES → [Both: Final Validation] → [Commit] → [Done! 🎉]
    └─ NO → [Claude: Fix Issues] → [Re-run Enforcement]
```

---

## 🎓 Example: Simple Feature

### Task: "Add dark mode toggle to settings"

### 1. Claude Creates Plan
```markdown
# Task: Add dark mode toggle to settings

## Affected Files:
- src/components/tabs/SettingsTab.tsx (add toggle)
- src/theme/muiTheme.ts (add dark theme)
- src/contexts/SettingsContext.tsx (add state)

## Expected Changes:
- Add dark mode state to SettingsContext
- Create dark theme variant in muiTheme
- Add toggle switch in SettingsTab
```

### 2. Invoke Codex Snapshot
```javascript
mcp__codex__codex_execute({ ... })
// Codex creates snapshot + RAG map
```

### 3. Claude Implements
```typescript
// Add dark mode state, theme, toggle
// Might leave debug logs, TODOs
console.log('Dark mode enabled:', darkMode); // Will be removed
// TODO: persist to localStorage? (Will be resolved)
```

### 4. Invoke Codex Enforcement
```javascript
mcp__codex__codex_execute({ ... })
// Codex removes logs, resolves TODOs, validates
```

### 5. Review Report
```markdown
# CODEX_REPORT.md

Score: 9.7/10 🏅

Deductions:
- -0.3: 2 debug logs removed, 1 TODO resolved

✅ PRISTINE STATE ACHIEVED
Ready for commit!
```

### 6. Commit
```bash
git add .
git commit -m "Add dark mode toggle to settings

✓ Dark mode state in SettingsContext
✓ Dark theme variant in muiTheme
✓ Toggle switch in SettingsTab
✓ All tests passing

Co-Authored-By: Claude
Co-Enforced-By: Codex"
```

---

## 💡 Pro Tips

### For Maximum Efficiency:
1. **Clear plans** - Better plans = better snapshots
2. **Trust Codex** - Don't self-censor during coding
3. **Test thoroughly** - Catch bugs before enforcement
4. **Review scores** - Learn from deductions
5. **Archive artifacts** - Keep history of enforcement reports

### For Best Quality:
1. **Aim for 9.5+** - Don't settle for 9.0
2. **Fix issues quickly** - Address deductions immediately
3. **Document intent** - Help Codex understand decisions
4. **Keep RAG current** - Rebuild periodically
5. **Celebrate wins** - Acknowledge pristine deliveries!

---

**See Also:**
- Full workflow: `.claude/AGENT_WORKFLOW.md`
- Commands: `.claude/commands/codex-snapshot.md`, `.claude/commands/codex-enforce.md`
- Templates: `.claude/templates/`

**Last Updated:** 2025-10-25
**Version:** 1.0
