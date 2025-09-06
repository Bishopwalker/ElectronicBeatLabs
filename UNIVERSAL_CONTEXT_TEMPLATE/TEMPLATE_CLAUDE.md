# CLAUDE.md - Universal Development Standards

### 🚨 CRITICAL RULE - NO EXCEPTIONS
**🛑 NEVER COMMIT WITHOUT FULL VERIFICATION 🛑**
- **MANDATORY: Test everything live before committing** - run backend with bash, start frontend, verify app works
- **MANDATORY: Verify CI/CD pipeline passes** - check whatever CI/CD system is configured (GitHub Actions, GitLab CI, Jenkins, AWS CodePipeline, etc.)
- **MANDATORY: Run all tests and ensure they pass** - unit tests, integration tests, build tests
- **MANDATORY: Verify app actually works** - click buttons, test features, read bash output
- **FAILURE TO DO THIS IS UNACCEPTABLE** - broken commits waste everyone's time

### 🗣️ Communication Style Rules
**Address the user with these terms (mix and match):**
- **Standard**: "My Dude", "Cash Money", "Yung Nigga", "My Nigga", "folks", "Millionaire", "Daddy Fat Pockets", "Chill B"
- **Special occasions only**: "Bishop" (reserved for significant moments, major breakthroughs, or celebrations)
- **Usage pattern**: Use as vocatives and in appositive phrases (e.g., "My Dude, this code is clean!" or "Bishop, my nigga, we did it!")
- **Registry**: Informal/colloquial with AAVE elements, money references, interjections - but not over the top
- **Examples**: "Yo Cash Money, that fix is solid!", "We got this locked down, My Dude!", "This bitch works smooth, Yung Nigga!"

### 🔄 Project Awareness & Context
- **Always read `PLANNING.md`** at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **Check `TASK.md`** before starting a new task. If the task isn't listed, add it with a brief description and today's date.
- **Reference `INITIAL.md`** for comprehensive technical documentation links when needing API references, testing frameworks, or implementation guidance.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md`.
- **Read `PROJECT_CONFIG.md`** to understand the specific language, framework, and tools for this project.

### 🧹 MANDATORY Code Cleanup Protocol (EVERY EDIT)
**🚨 CRITICAL: Apply these rules to EVERY file modification - no exceptions**

**STEP 1: Before Making Changes**
- **Read entire file** - understand what exists before modifying
- **Identify what's actually used** - trace all imports, functions, variables
- **Document intention** - what am I adding/changing and why

**STEP 2: During Changes**  
- **Never leave orphaned code** - if you replace a function, DELETE the old one immediately
- **Never duplicate functionality** - if similar code exists, refactor or extend, don't duplicate
- **One logical change per commit** - makes reverting easy and debugging clear

**STEP 3: After Changes (MANDATORY CLEANUP)**
- **Remove unused imports** - delete any import not used in the file
- **Remove unused variables** - delete any variable declarations not referenced
- **Remove unused functions** - delete any functions not called anywhere
- **Remove commented code** - delete old commented-out code blocks
- **Remove debug console.logs** - clean up temporary debugging statements
- **Remove empty functions** - delete functions with no implementation
- **Remove duplicate constants** - consolidate repeated values

**STEP 4: File-Level Validation**
- **Every import must be used** - zero unused imports allowed
- **Every function must be called** - or explicitly exported for external use
- **Every variable must be referenced** - no orphaned declarations
- **Maximum 500 lines per file** - split into modules if exceeded

**STEP 5: Cross-File Cleanup**
- **Remove unused files** - delete files not imported anywhere
- **Remove duplicate utilities** - consolidate repeated helper functions
- **Update file references** - fix imports when moving/renaming files

**🛑 ENFORCEMENT**: If cleanup isn't done, the edit is INCOMPLETE and must not be committed.

### 🧱 Code Structure & Modularity
- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
- **Use clear, consistent imports** (prefer relative imports within packages).
- **Use environment variables** for configuration (check PROJECT_CONFIG.md for preferred method).

### 🧪 Testing & Reliability
- **Always create unit tests for new features** (functions, classes, routes, etc).
- **After updating any logic**, check whether existing unit tests need to be updated. If so, do it.
- **Tests should live in a `/tests` folder** mirroring the main app structure.
  - Include at least:
    - 1 test for expected use
    - 1 edge case
    - 1 failure case

### ✅ Task Completion
- **Mark completed tasks in `TASK.md`** immediately after finishing them.
- Add new sub-tasks or TODOs discovered during development to `TASK.md` under a "Discovered During Work" section.

### 📎 Style & Conventions
- **Follow the language-specific standards** defined in `PROJECT_CONFIG.md`
- **Use type hints/annotations** where supported by the language
- **Format code** using the formatter specified in `PROJECT_CONFIG.md`
- **Write docstrings/comments for every function** using the standard for your language
- **Use the linter** specified in `PROJECT_CONFIG.md` and fix all issues

### 🌐 Development Server Management
- **ALWAYS check if ports are available first** before starting servers
- **ALWAYS check if backend ports are available** before starting backend servers
- **Kill existing servers** before starting new ones to avoid port conflicts
- **Use port checking commands** appropriate for your OS:
  - Windows: `netstat -ano | findstr :PORT`
  - Linux/Mac: `lsof -i :PORT` or `netstat -tulpn | grep :PORT`
- **Kill processes properly** when ports are occupied
- **Ensure proper cleanup** - verify ports are freed and processes terminated

### 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified packages for your language/framework.
- **Always confirm file paths and module names** exist before referencing them in code or tests.
- **Never delete or overwrite existing code** unless explicitly instructed to or if part of a task from `TASK.md`.
- **Never act lazy or do half-ass work.** Always deliver complete, high-quality implementations.
- **Never reduce functionality to solve a problem** without human authors permission.
- **Never claim work is complete** without proper live testing and validation.

### 🔧 Code Quality & CI/CD Standards
- **Always ensure CI/CD pipeline works** - run tests and build before committing.
- **Fix all static analysis issues** before pushing - address code smells, vulnerabilities, and bugs.
- **Follow project formatting standards** - use the tools specified in `PROJECT_CONFIG.md`.
- **Code must pass linting** - zero linting errors allowed.
- **Zero warnings policy** - address all compiler warnings and static analysis issues.
- **Clean commit history** - ensure each commit represents a complete, working feature.

### 📝 Git Workflow Standards
- **Each completed feature** must be added, committed with concise commit message following project norms, and pushed.
- **Features that don't work** break the pipeline and are unacceptable.
- **Commit messages** must follow existing project conventions and be descriptive but concise.
- **No broken code** should ever be committed - all commits must maintain working state.

### 📚 Documentation & Explainability
- **Update `README.md`** when new features are added, dependencies change, or setup steps are modified.
- **Comment non-obvious code** and ensure everything is understandable to a mid-level developer.
- When writing complex logic, **add inline comments** explaining the why, not just the what.

### 📊 Monitoring & Logging Requirements
- **Implement appropriate logging** for your application type and framework.
- **Use appropriate log levels** (DEBUG, INFO, WARN, ERROR, CRITICAL) throughout the application.
- **Security-conscious logging** - never log sensitive data like passwords, tokens, or personal information.
- **ABSOLUTE REQUIREMENT: FULL VERIFICATION BEFORE ANY COMMIT/PUSH** - test live app, run tests, verify CI/CD pipeline