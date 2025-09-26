# Context Initialization Automation
# Auto-executes mandatory context reading workflow

## Mandatory Context Files (Execute in Order)
1. .claude/INDEX.md - Navigation guide
2. .claude/CLAUDE.md - Development standards
3. .claude/INITIAL.md - Technical specifications
4. PLANNING.md - Architecture & workflow
5. TASK.md - Current sprint work

## Auto-Execution Commands
```bash
# Read all mandatory context files in proper order
echo "=== CONTEXT INITIALIZATION ==="
echo "Reading mandatory context files..."

echo "1/5: INDEX.md (Navigation Guide)"
cat .claude/INDEX.md

echo "2/5: CLAUDE.md (Development Standards)"
cat .claude/CLAUDE.md

echo "3/5: INITIAL.md (Technical Specifications)"
cat .claude/INITIAL.md

echo "4/5: PLANNING.md (Architecture)"
cat PLANNING.md

echo "5/5: TASK.md (Current Tasks)"
cat TASK.md

echo "=== CONTEXT LOADED - READY FOR WORK ==="
```

## Usage
- Execute at start of every conversation
- Required before any development work
- Ensures proper context foundation
- Prevents time waste from missing context

## Validation Checklist
- [ ] All 5 files read successfully
- [ ] Current task status understood
- [ ] Development standards internalized
- [ ] Architecture patterns clear
- [ ] Technical specs referenced
