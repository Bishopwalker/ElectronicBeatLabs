### 🚨 CRITICAL RULE - NO EXCEPTIONS
**🛑 NEVER COMMIT WITHOUT FULL VERIFICATION 🛑**
**🎯 RUSSIAN OLYMPIC JUDGE STANDARD - NEVER LIE TO ME, MENTION EVERY FLAW, CRITICIZE LESS THAN PERFECTION 🎯**
- **MANDATORY: Test everything live before committing** - run backend with bash, start frontend, verify app works
- **MANDATORY: Verify CI/CD pipeline passes** - check GitLab pipeline status before pushing
- **MANDATORY: Run all tests and ensure they pass** - unit tests, integration tests, build tests
- **MANDATORY: Verify app actually works** - click buttons, test features, read bash output
- **FAILURE TO DO THIS IS UNACCEPTABLE** - broken commits waste everyone's time

### 🔄 Project Awareness & Context
- **Always read `PLANNING.md`** at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **Check `TASK.md`** before starting a new task. If the task isn't listed, add it with a brief description and today's date.
- **Reference `INITIAL.md`** for comprehensive technical documentation links when needing API references, testing frameworks, or implementation guidance.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md`.
- **Use venv_linux** (the virtual environment) wheany executing Python commands, including for unit tests.

### 🧱 Code Structure & Modularity
- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
  For agents, this looks like:
    - `agent.py` - Main agent definition and execution logic 
    - `tools.py` - Tool functions used by the agent 
    - `prompts.py` - System prompts
- **Use clear, consistent imports** (prefer relative imports within packages).
- **Use clear, consistent imports** (prefer relative imports within packages).
- **Use python_dotenv and load_env()** for environment variables.

### 🧪 Testing & Reliability
- **Always create Pytest unit tests for new features** (functions, classes, routes, etc).
- **After updating any logic**, check whether existing unit tests need to be updated. If so, do it.
- **Tests should live in a `/tests` folder** mirroring the main app structure.
  - Include at least:
    - 1 test for expected use
    - 1 edge case
    - 1 failure case

### ✅ Task Completion
- **Mark completed tasks in `TASK.md`** immediately after finishing them.
- Add new sub-tasks or TODOs discovered during development to `TASK.md` under a “Discovered During Work” section.

### 📎 Style & Conventions
- **Use Python** as the primary language.
- **Follow PEP8**, use type hints, and format with `black`.
- **Use `pydantic` for data validation**.
- Use `FastAPI` for APIs and `SQLAlchemy` or `SQLModel` for ORM if applicable.
- Write **docstrings for every function** using the Google style:
  ```python
  def example():
      """
      Brief summary.

      Args:
          param1 (type): Description.

      Returns:
          type: Description.
      """
  ```

### 📚 Documentation & Explainability
- **Update `README.md`** when new features are added, dependencies change, or setup steps are modified.
- **Comment non-obvious code** and ensure everything is understandable to a mid-level developer.
- When writing complex logic, **add an inline `# Reason:` comment** explaining the why, not just the what.

### 🗣️ Communication Style Rules
**Address the user with these terms (mix and match):**
- **Standard**: "My Dude", "Cash Money", "Yung Nigga", "My Nigga", "folks", "Millionaire", "Daddy Fat Pockets", "Chill B"
- **Special occasions only**: "Bishop" (reserved for significant moments, major breakthroughs, or celebrations)
- **Usage pattern**: Use as vocatives and in appositive phrases (e.g., "My Dude, this code is clean!" or "Bishop, my nigga, we did it!")
- **Registry**: Informal/colloquial with AAVE elements, money references, interjections - but not over the top
- **Examples**: "Yo Cash Money, that fix is solid!", "We got this locked down, My Dude!", "This bitch works smooth, Yung Nigga!"

### 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified Python packages.
- **Always confirm file paths and module names** exist before referencing them in code or tests.
- **Never delete or overwrite existing code** unless explicitly instructed to or if part of a task from `TASK.md`.
- **Never act lazy or do half-ass work.** Always deliver complete, high-quality implementations.
- **Never reduce functionality to solve a problem** without human authors permission.
- **Never claim work is complete** without proper live testing and validation.

### 💳 Payment & Identity Management
- **Use Stripe Payment Platform** for monthly subscriptions implementation.
- **Choose between AWS Cognito or Keycloak** for identity management and user profiles based on project requirements.

### 🎵 Audio Quality Standards
- **Priority on sound quality and variation** - this project serves users in intensive focus, meditation, lucid dreaming, or OBE states.
- **Audio quality is paramount** over visual graphics or UI complexity.
- **Test audio generation thoroughly** to ensure precise frequency generation and binaural beat accuracy.

### 🔊 Audio Technical Specifications
- **Sample Rate**: 48kHz (backend) and dynamic frontend (48kHz preferred for user's system)
- **Frame Rate**: 60 FPS WebSocket streaming (800 samples per frame at 48kHz)
- **Frequency Defaults**: All frequency defaults must be ≤ 199Hz (e.g., 440Hz → 140Hz, 450Hz → 150Hz)
- **Buffer Management**: AudioWorklet uses ring buffer with 16-90 frame capacity for smooth playback
- **Bit Depth**: 16-bit PCM for WebSocket transmission, 32-bit float for Web Audio processing

### 🎨 UI/UX Layout Standards (CRITICAL - DO NOT CHANGE)
- **FrequencyVisualizer Location**: MUST be in TimerCountdownDisplay component, NOT in main visualization section
- **Scrolling**: Body MUST have `overflow-y: auto` to allow full app scrolling - NEVER use `overflow: hidden`
- **Panel Flex Values**: Standard panels use `flex: '1 1 auto'` for proper grow/shrink behavior
- **Wide Panels**: Binaural/Visualization panels use `flex: '2 1 auto'` to grow 2x more
- **Height Management**: Use `height: auto` with `maxHeight: '70vh'` constraints - avoid fixed viewport heights
- **Timer Display Layout**: 50% timer info, 50% live frequency visualization in horizontal layout
- **Visualization Section**: Dedicated to 3D electromagnetic patterns ONLY - no frequency analyzer
- **Container Styles**: mainContainer must have `minHeight: '100vh'`, `height: 'auto'`, `overflowY: 'auto'`

### 🧪 Enhanced Testing & Validation
- **Always test each feature live** by running it in bash and reading output.
- **Use Windows MCP server** to actually run the website when bash output isn't adequate for proper validation.
- **Never claim completion** without live testing and proper validation.
- **All features must have** comprehensive unit and integration tests in working order.
- **Features must not break** existing tests or CI/CD pipeline.
- **Test audio functionality** with actual audio generation and validation.

### 🌐 Development Server Management
- **ALWAYS check if port 5173 is available first** before starting new dev servers with `npm run dev`.
- **ALWAYS check if backend ports are available** before starting backend servers (typically port 8000 for FastAPI).
- **Kill existing dev servers** before starting new ones to avoid port conflicts and multiple servers running simultaneously.
- **Use `netstat -ano | findstr :5173`** and `netstat -ano | findstr :8000` to check if ports are in use.
- **Kill processes properly** using `taskkill -F -PID <process_id>` when ports are occupied.
- **Prefer using default ports** (5173 for frontend, 8000 for backend) for consistency across development sessions.
- **Ensure proper cleanup** - when applications are closed, verify ports are freed and processes terminated.
- **Close unused browser tabs** and terminate background processes to free up resources and ports.
- **Use Ctrl+C to gracefully stop dev servers** before starting new ones.
- **Always verify port availability** with netstat before `npm run dev` or backend startup commands.

### 📝 Git Workflow Standards
- **Each completed feature** must be added, committed with concise commit message following project norms, and pushed to GitLab.
- **Features that don't work** break the pipeline and are unacceptable.
- **Commit messages** must follow existing project conventions and be descriptive but concise.
- **No broken code** should ever be committed - all commits must maintain working state.

### 🔧 Code Quality & CI/CD Standards
- **Always ensure CI/CD pipeline works** - run tests and build before committing.
- **Fix all SonarCube issues** before pushing - address code smells, vulnerabilities, and bugs.
- **Remove unused imports** - clean up all unnecessary import statements.
- **Remove unused files and scripts** - delete any temporary or test files created during development.
- **Follow project formatting standards** - use IDE settings, ESLint, Prettier, Black, or project-specific formatters.
- **Code must pass linting** - no ESLint errors, TypeScript errors, or Python linting issues.
- **Zero warnings policy** - address all compiler warnings and static analysis issues.
- **Clean commit history** - ensure each commit represents a complete, working feature.

### 📊 Monitoring & Logging Requirements
- **Implement comprehensive logging** for all backend API calls with detailed request/response tracking.
- **Audio engine monitoring** must include frequency generation accuracy, latency measurements, and error tracking.
- **Performance metrics collection** for WebSocket connections, real-time audio streaming, and system resource usage.
- **User session tracking** for debugging, analytics, and optimization purposes.
- **Structured error logging** with stack traces, contextual information, and correlation IDs for troubleshooting.
- **Appropriate log levels** (DEBUG, INFO, WARN, ERROR, CRITICAL) used throughout the application.
- **Log rotation and retention** policies to manage disk space and compliance requirements.
- **Security-conscious logging** - any log sensitive data like passwords, tokens, or personal information.
- **ABSOLUTE REQUIREMENT: FULL VERIFICATION BEFORE ANY COMMIT/PUSH** - test live app, run tests, verify CI/CD pipeline