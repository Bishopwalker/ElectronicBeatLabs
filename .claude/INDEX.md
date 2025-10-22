# INDEX.md
# Context Navigation Guide

**📍 Start Here First**

This index provides the optimal reading order and navigation paths for AI assistants working on the Electromagnetic Beat Lab (EBL) project.

## 🚨 URGENT - CHECK FOR SESSION CONTEXT FIRST

**BEFORE reading anything else, check for urgent session context:**
- `URGENT_READ_FIRST.md` - Critical info from previous session (if exists)
- `SESSION_*.md` - Detailed session context files (if any exist)

**If these files exist, READ THEM FIRST before proceeding!**

---

## 🚀 Quick Start (Essential Reading)

### 1. **Automated Context Initialization** 
```bash
# Run this command first to auto-load all context
.claude/commands/init-context.sh
```

### 2. **Manual Context Reading Order**
```
0. URGENT_READ_FIRST.md - Check this FIRST (if exists)
1. INDEX.md (this file) ← YOU ARE HERE
2. CLAUDE.md - Development rules & standards
3. INITIAL.md - Project specifications & protocols
4. ../PLANNING.md - Architecture & workflow
5. ../TASK.md - Current sprint work
```

### 3. **For Specific Task Types**

#### 🔧 **New Feature Development**
```
INITIAL.md → PLANNING.md → ../TASK.md → relevant code files
```

#### 🐛 **Bug Fixes**
```
CLAUDE.md → ../TASK.md → test files → source code
```

#### 🏗️ **Infrastructure Changes**
```
INFRASTRUCTURE.md → .gitlab-ci.yml → deployment files
```

#### 🧪 **Testing & Quality**
```
CLAUDE.md → VALIDATION.md → ../backend/pytest.ini → test files
```

#### 🔄 **Continuing Previous Session**
```
URGENT_READ_FIRST.md → SESSION_*.md → TASK.md → proceed with work
```

## 📁 Context Hierarchy (Authority Order)

### **CRITICAL** (Check First - Session Continuity)
- `.claude/URGENT_READ_FIRST.md` - Critical context from previous session
- `.claude/SESSION_*.md` - Detailed session context and troubleshooting

### **PRIMARY** (Always Authoritative)
- `.claude/CLAUDE.md` - Development standards, testing requirements, Git workflow
- `.claude/INITIAL.md` - Technical specifications, frequency protocols, examples
- `.claude/INFRASTRUCTURE.md` - Environment setup, deployment configuration

### **SECONDARY** (Project Management)
- `../PLANNING.md` - Architecture decisions, naming conventions, workflows
- `../TASK.md` - Current sprint work, completed tasks, known issues
- `VALIDATION.md` - Quality checklists and validation requirements

### **REFERENCE** (Supporting Documentation)
- `CONTEXT_ENGINEERING.md` - Meta-documentation about context practices
- `KEYCLOAK_SETUP.md` - Authentication system setup
- `PIPELINE.md` - CI/CD pipeline documentation
- `RAG_CONTEXT.md` - Retrieval patterns and code location guides
- `DOCKER_MCP_SETUP.md` - Docker MCP server configuration
- `SETUP_COMPLETE.md` - Setup completion checklist

### **AUTOMATION** (Commands & Templates)
- `commands/*.md` - Automation scripts and workflows
- `PRPs/*.md` - Process templates and procedures

## 🎯 Task-Specific Navigation

### **Audio Engine Work**
1. `INITIAL.md` - Frequency protocols and scientific requirements
2. `../src/hooks/useAudioEngine.ts` - Current implementation
3. `../backend/services/audio_service.py` - Backend audio processing
4. `../TASK.md` - Audio-related current tasks

### **Frontend Components**
1. `CLAUDE.md` - Component standards and naming conventions
2. `PLANNING.md` - Frontend architecture and MUI patterns
3. `../src/components/` - Component implementations
4. `../src/types/` - TypeScript interfaces

### **Backend API Development**
1. `CLAUDE.md` - Python standards and testing requirements  
2. `INITIAL.md` - API specifications and WebSocket protocols
3. `../backend/routers/` - FastAPI route implementations
4. `../backend/tests/` - Backend test suite

### **Deployment & Infrastructure**
1. `INFRASTRUCTURE.md` - Complete deployment guide
2. `.gitlab-ci.yml` - Pipeline configuration
3. `.gitlab-ci-deploy.yml` - Deployment jobs
4. `../docker-compose.yml` - Local development setup

### **MCP Server Configuration & Troubleshooting**
1. `URGENT_READ_FIRST.md` - Latest session status (if exists)
2. `SESSION_*.md` - Detailed troubleshooting context
3. `DOCKER_MCP_SETUP.md` - Complete Docker MCP guide
4. `SETUP_COMPLETE.md` - Setup verification checklist
5. `../claude-code-mcp-config.json` - Claude Code MCP template

## 🔍 Quick Reference Lookup

### **Find Code Patterns**
- **React Components**: `../src/components/*.tsx`
- **Custom Hooks**: `../src/hooks/use*.ts`
- **API Routes**: `../backend/routers/*.py`
- **Type Definitions**: `../src/types/index.ts`
- **Test Files**: `../tests/` or `../**/*.test.ts`

### **Common Issues & Solutions**
- **TypeScript Errors**: Check `../src/types/index.ts` for interface definitions
- **API Route Issues**: Verify `../backend/main.py` router inclusion
- **WebSocket Problems**: Reference `../backend/websocket_manager.py`
- **Audio Issues**: Check `../src/hooks/useAudioEngine.ts` and audio protocols in `INITIAL.md`
- **Build Failures**: Review `.gitlab-ci.yml` and `INFRASTRUCTURE.md`
- **MCP Server Issues**: Check `URGENT_READ_FIRST.md` and session context files

### **External Documentation Links**
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **FastAPI WebSocket**: https://fastapi.tiangolo.com/advanced/websockets/
- **React + TypeScript**: https://react-typescript-cheatsheet.netlify.app/
- **Material-UI**: https://mui.com/material-ui/getting-started/
- **GitLab CI/CD**: https://docs.gitlab.com/ci/

## ⚠️ Important Notes

### **File Authority**
- `.claude/` directory files are **authoritative**
- Root directory may contain backup or symlinked versions
- When in doubt, use the `.claude/` version

### **Session Continuity**
- **ALWAYS check for URGENT_READ_FIRST.md** when starting a new session
- **Read SESSION_*.md files** for context from previous troubleshooting
- **Update session context files** when making significant infrastructure changes
- **User may be waiting for actions** mentioned in session context (e.g., restart required)

### **Context Validation**
Before starting work, ensure:
- [ ] Check for URGENT_READ_FIRST.md
- [ ] Read any SESSION_*.md context files
- [ ] Latest code pulled from repository
- [ ] Development environment running (`npm run dev:all`)
- [ ] All tests passing locally
- [ ] Current task status checked in `../TASK.md`

### **Emergency Context Recovery**
If you lose context or get confused:
1. **Check URGENT_READ_FIRST.md** for immediate context
2. **Re-read this INDEX.md file**
3. **Check `../TASK.md` for current work status**
4. **Review `CLAUDE.md` for development standards**
5. **Read SESSION_*.md for recent troubleshooting**
6. **Ask for clarification rather than making assumptions**

---

**📋 Context Health Status**
- ✅ Primary files present and up-to-date
- ✅ Navigation paths established  
- ✅ Task tracking system active
- ✅ Validation processes defined
- ✅ Session continuity system implemented

**Last Updated:** 2025-10-21
**Context Version:** 2.1
