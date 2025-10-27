# MCP Codex Server - EBL Project Integration

This directory contains the MCP (Model Context Protocol) server that integrates OpenAI Codex with Claude Code for this project.

## What This Does

This MCP server enables you to use both Claude Code and OpenAI Codex simultaneously on the EBL project, allowing:

- **Parallel Processing**: Split tasks between Claude and Codex
- **Multi-Perspective Analysis**: Get code reviews from both AI systems
- **Task Delegation**: Let Claude handle orchestration while delegating specific code generation to Codex
- **Super-Thinking**: Combine the strengths of both AI systems

## Files

- `server.js` - MCP server implementation
- `package.json` - Node.js configuration
- `node_modules/` - Dependencies (@modelcontextprotocol/sdk, zod)
- `README.md` - This file

## Configuration

The server is configured in the project root's `.mcp.json`:

```json
{
  "mcpServers": {
    "codex": {
      "command": "node",
      "args": ["claude/server.js"],
      "env": {}
    }
  }
}
```

## Available Tools

### 1. codex_execute
Execute arbitrary tasks via Codex.

**Example:**
```
"Use codex_execute to write a Python function for data validation"
```

### 2. codex_analyze
Analyze code using Codex.

**Example:**
```
"Use codex_analyze to review this React component for performance issues"
```

### 3. codex_generate
Generate code based on requirements.

**Example:**
```
"Use codex_generate to create a TypeScript interface for the User model"
```

### 4. codex_refactor
Refactor existing code.

**Example:**
```
"Use codex_refactor to improve this function's readability"
```

### 5. codex_debug
Debug code issues.

**Example:**
```
"Use codex_debug to find why this async function is hanging"
```

## Usage in EBL Project

### Frontend Development
```
"You handle the React component structure, use codex_generate
 to create the Redux actions and reducers"
```

### Backend Development
```
"Create the database schema yourself and use codex_generate
 for the API endpoints"
```

### Testing
```
"Write the integration tests and use codex_generate
 to create comprehensive unit tests"
```

### Code Review
```
"Review this PR and also use codex_analyze to check for
 security vulnerabilities"
```

## How It Works

```
┌──────────────────┐
│   You (User)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Claude Code     │ ← Orchestrates work
└────────┬─────────┘
         │ MCP Protocol
         ▼
┌──────────────────┐
│  MCP Server      │ ← This directory
│  (claude/)       │
└────────┬─────────┘
         │ CLI Exec
         ▼
┌──────────────────┐
│  OpenAI Codex    │ ← Delegated tasks
└──────────────────┘
```

## Requirements

- Node.js >= 16
- OpenAI Codex CLI authenticated (`codex auth`)
- Claude Code with MCP support

## Getting Started

1. **Dependencies are already installed** (`npm install` was run during setup)

2. **Restart Claude Code** to load the MCP server

3. **Start using Codex tools** in your Claude Code conversations:
   ```
   "Use codex_execute to help with this task"
   ```

## Project-Specific Examples

### Audio Processing (EBL)
```
"Analyze the audio engine code and use codex_analyze to suggest
 optimizations for real-time processing"
```

### Visualization Components
```
"You refactor the visualization component structure while using
 codex_generate to create the shader code"
```

### API Integration
```
"Use codex_generate to create TypeScript types for the backend API
 while I update the frontend service layer"
```

## Troubleshooting

### Server not connecting
- Ensure `.mcp.json` is in project root (`C:\Users\bisho\ideaprojects\ebl\.mcp.json`)
- Restart Claude Code
- Check paths in `.mcp.json`

### Codex commands failing
- Verify Codex is authenticated: `codex auth status`
- Check Codex is working: `codex exec "test"`

### Timeout errors
- Increase timeout in tool parameters
- Complex tasks may need > 60 seconds

## Maintenance

### Update Dependencies
```bash
cd C:\Users\bisho\ideaprojects\ebl\claude
npm update
```

### Test Server
```bash
cd C:\Users\bisho\ideaprojects\ebl\claude
node server.js
```

Should output: `MCP Codex Server running on stdio`

## Integration with EBL Project

This MCP server is specifically set up for the EBL project and:

- Uses relative paths (`claude/server.js`) for portability
- Can be committed to version control
- Shared with team members via `.mcp.json`
- Works within the EBL project directory

## More Information

For complete documentation, see:
- Global installation: `C:\Users\bisho\mcp-codex-server\README.md`
- Quick start guide: `C:\Users\bisho\mcp-codex-server\QUICKSTART.md`
- Integration guide: `C:\Users\bisho\mcp-codex-server\INTEGRATION-COMPLETE.md`

---

**Status**: ✅ Ready for use in EBL project
**Last Updated**: October 25, 2025
