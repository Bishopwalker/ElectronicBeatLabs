# Task: [Brief description of the user's request]

**Created:** [YYYY-MM-DD HH:MM:SS]
**Priority:** High / Medium / Low
**Estimated Complexity:** Simple / Medium / Complex
**Estimated Time:** [X hours/days]

---

## User Request

> [Original user request verbatim or paraphrased clearly]

## Objective

[Clear statement of what needs to be accomplished]

---

## Affected Files

### Existing Files to Modify:
- `path/to/file1.ts` - [What changes]
- `path/to/file2.py` - [What changes]
- `path/to/file3.tsx` - [What changes]

### New Files to Create:
- `path/to/newfile.ts` - [Purpose]
- `path/to/utility.py` - [Purpose]

### Files to Delete (if any):
- `path/to/oldfile.ts` - [Reason for deletion]

---

## Expected Changes

### 1. [Component/Module Name]
**File:** `path/to/file.ts`

**Changes:**
- Add: [Feature/function/type description]
- Modify: [Existing function - what changes]
- Remove: [What gets removed and why]

**Example:**
```typescript
// Before
function oldFunction() { ... }

// After
function newFunction(param: Type) { ... }
```

### 2. [Another Component/Module]
**File:** `path/to/another.py`

**Changes:**
- [Description of changes]

---

## Implementation Steps

1. **[Step 1 Name]**
   - Action: [What to do]
   - Files: [Which files]
   - Reason: [Why this step]

2. **[Step 2 Name]**
   - Action: [What to do]
   - Files: [Which files]
   - Reason: [Why this step]

3. **[Step 3 Name]**
   - Action: [What to do]
   - Files: [Which files]
   - Reason: [Why this step]

---

## Testing Strategy

### Unit Tests
- [ ] Test [specific functionality]
  - File: `path/to/test.spec.ts`
  - Coverage: [What scenarios]

- [ ] Test [another functionality]
  - File: `path/to/another.test.py`
  - Coverage: [What scenarios]

### Integration Tests
- [ ] Test [end-to-end scenario]
- [ ] Test [API integration]

### Live App Testing
- [ ] Manual test: [Specific user flow]
- [ ] Audio quality: [Frequency accuracy, latency]
- [ ] Performance: [Bundle size, memory usage]

---

## Success Criteria

**Functional:**
- [ ] [Criterion 1: e.g., Feature X works as expected]
- [ ] [Criterion 2: e.g., No regression in existing features]
- [ ] [Criterion 3: e.g., Audio quality maintained]

**Technical:**
- [ ] All tests passing (unit + integration)
- [ ] TypeScript compilation successful
- [ ] Linting passes
- [ ] Code follows CLAUDE.md standards
- [ ] Performance metrics met

**Quality:**
- [ ] Code documented (Google-style docstrings)
- [ ] Type safety maintained
- [ ] No security vulnerabilities introduced
- [ ] RAG map can be updated cleanly

---

## Dependencies & Considerations

**External Dependencies:**
- [New npm/pip packages needed]
- [API/service dependencies]

**Breaking Changes:**
- [Any breaking changes to APIs]
- [Migration steps if needed]

**Performance Impact:**
- [Expected performance changes]
- [Bundle size impact]

**Security Considerations:**
- [Auth/permissions needed]
- [Data validation required]

---

## Potential Challenges

1. **[Challenge 1]**
   - Risk: [What could go wrong]
   - Mitigation: [How to handle it]

2. **[Challenge 2]**
   - Risk: [What could go wrong]
   - Mitigation: [How to handle it]

---

## Notes for Codex (Enforcer)

**Watch for:**
- [Specific patterns that might need cleanup]
- [Common mistakes in this type of change]
- [Performance implications]

**Pay attention to:**
- [Critical functionality that must not break]
- [Type definitions that must stay consistent]
- [Dependencies that must stay clean]

---

## Status Tracking

**Planning Phase:**
- [x] Requirements understood
- [x] Affected files identified
- [x] Implementation strategy defined
- [ ] Codex snapshot complete → **Waiting for Codex**

**Implementation Phase:**
- [ ] Started: [timestamp]
- [ ] Completed: [timestamp]
- [ ] Status: Not Started / In Progress / Complete

**Enforcement Phase:**
- [ ] Codex enforcement complete
- [ ] Score: [X/10]
- [ ] Status: Pending / Pristine / Needs Work

---

**Last Updated:** [YYYY-MM-DD HH:MM:SS]
**Created By:** Claude (Builder Agent)
**Status:** Ready for Codex Snapshot