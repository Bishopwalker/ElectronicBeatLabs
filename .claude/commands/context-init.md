# Initialize Project Context

Read and understand the project context by systematically going through key documentation and configuration files.

## Step 1: Read Core Documentation Files

1. Read the main CLAUDE.md file at the project root to understand project instructions
2. Read the .claude/CLAUDE.md file for detailed development standards and rules
3. Read the .claude/INITIAL.md file for technical specifications and API references
4. Read the PLANNING.md file to understand project architecture and goals
5. Read the TASK.md file to see current sprint planning and tasks

## Step 2: Understand Project Structure

Use `tree -d -L 2` to get directory structure, then examine:
- src/ folder structure for frontend components and hooks
- backend/ folder structure for API and processing modules
- Key configuration files (package.json, requirements.txt, tsconfig.json)

## Step 3: Check Current State

1. Run `git status` to see current working branch and changes
2. Run `git log --oneline -10` to see recent commits
3. Check if development servers are running with:
   - `netstat -ano | findstr :5173` (frontend)
   - `netstat -ano | findstr :8000` (backend)

## Step 4: Identify Key Technologies

Based on configuration files, identify:
- Frontend: React, TypeScript, Vite, Material-UI
- Backend: FastAPI, Python, WebSocket, Audio processing
- Database: SQLite/PostgreSQL with SQLAlchemy
- Real-time: WebSocket for audio streaming
- Testing: Jest, Pytest, Cucumber

## Step 5: Summarize Context

After reading all files, provide a comprehensive summary including:

### Project Overview
- **Name**: Electromagnetic Beat Laboratory (EBL)
- **Purpose**: Advanced binaural beat and 8D spatial audio application
- **Architecture**: Dual audio engine system (frontend Web Audio API + backend NumPy/SciPy)

### Key Features
- Binaural beat generation with precise frequency control
- 8D spatial audio with electromagnetic field integration
- Real-time WebSocket audio streaming
- Timer and preset management system
- AI audio agent for personalized experiences

### Development Standards
- Mandatory full verification before commits
- Modular code structure (<500 lines per file)
- Comprehensive testing requirements
- Specific communication style rules
- Windows-specific development considerations

### Current Task Status
- Active branch and recent changes
- Running services and port availability
- Any pending tasks from TASK.md

### Critical Rules
- Never commit without live testing
- Always check port availability before starting servers
- Use venv_linux for Python commands
- Follow audio quality standards (±0.1Hz accuracy)
- Maintain >80% backend and >70% frontend test coverage

This systematic context initialization ensures complete understanding of the project before making any changes.