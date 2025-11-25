#!/usr/bin/env node

/**
 * EBL CI/CD Pipeline MCP Server
 *
 * Manages EBL CI/CD operations:
 * - Run tests (frontend/backend)
 * - Lint and type checking
 * - GitLab pipeline triggers
 * - Code quality checks
 * - Build verification
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";

const execAsync = promisify(exec);

// Configuration
const PROJECT_ROOT = process.env.EBL_PROJECT_ROOT || "C:\\Users\\bisho\\IdeaProjects\\ebl";
const BACKEND_VENV = `${PROJECT_ROOT}\\backend\\venv\\Scripts`;

/**
 * Execute shell command
 */
async function runCommand(command, options = {}) {
  const { timeout = 300000, cwd = PROJECT_ROOT } = options;

  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout,
      maxBuffer: 1024 * 1024 * 20, // 20MB buffer
      cwd,
      windowsHide: true,
    });

    return {
      success: true,
      output: stdout,
      error: stderr || null,
    };
  } catch (error) {
    return {
      success: false,
      output: error.stdout || null,
      error: error.message,
      exitCode: error.code,
    };
  }
}

const server = new Server(
  {
    name: "ebl-pipeline",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Schema definitions
const testSchema = z.object({
  scope: z.enum(["all", "frontend", "backend", "unit", "integration"]).optional(),
  coverage: z.boolean().optional(),
  verbose: z.boolean().optional(),
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "pipeline_run_tests",
        description: "Run EBL test suites - frontend (Jest), backend (Pytest), or all.",
        inputSchema: {
          type: "object",
          properties: {
            scope: {
              type: "string",
              enum: ["all", "frontend", "backend", "unit", "integration"],
              description: "Test scope (default: all)",
            },
            coverage: {
              type: "boolean",
              description: "Generate coverage report",
            },
            verbose: {
              type: "boolean",
              description: "Verbose output",
            },
          },
          required: [],
        },
      },
      {
        name: "pipeline_lint",
        description: "Run linting checks - ESLint for frontend, flake8/black for backend.",
        inputSchema: {
          type: "object",
          properties: {
            fix: {
              type: "boolean",
              description: "Auto-fix issues where possible",
            },
            scope: {
              type: "string",
              enum: ["all", "frontend", "backend"],
              description: "Which codebase to lint",
            },
          },
          required: [],
        },
      },
      {
        name: "pipeline_typecheck",
        description: "Run TypeScript type checking on frontend code.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "pipeline_build",
        description: "Build EBL frontend and/or backend for production.",
        inputSchema: {
          type: "object",
          properties: {
            scope: {
              type: "string",
              enum: ["all", "frontend", "backend"],
              description: "What to build",
            },
          },
          required: [],
        },
      },
      {
        name: "pipeline_verify",
        description: "Run full CI verification - lint, typecheck, test, build (mirrors GitLab CI).",
        inputSchema: {
          type: "object",
          properties: {
            skip_tests: {
              type: "boolean",
              description: "Skip test execution (faster verify)",
            },
          },
          required: [],
        },
      },
      {
        name: "pipeline_git_status",
        description: "Get git status, current branch, and recent commits.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "pipeline_security_check",
        description: "Run security checks - npm audit, pip safety check.",
        inputSchema: {
          type: "object",
          properties: {
            fix: {
              type: "boolean",
              description: "Attempt to fix vulnerabilities",
            },
          },
          required: [],
        },
      },
      {
        name: "pipeline_check_ports",
        description: "Check if required ports (5173, 8000) are available.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "pipeline_start_dev",
        description: "Start development servers (frontend + backend).",
        inputSchema: {
          type: "object",
          properties: {
            frontend_only: {
              type: "boolean",
              description: "Only start frontend",
            },
            backend_only: {
              type: "boolean",
              description: "Only start backend",
            },
          },
          required: [],
        },
      },
      {
        name: "pipeline_stop_dev",
        description: "Stop running development servers.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case "pipeline_run_tests": {
        const { scope = "all", coverage = false, verbose = false } = args || {};
        const results = {};

        if (scope === "all" || scope === "frontend" || scope === "unit") {
          const coverageFlag = coverage ? "--coverage" : "";
          const verboseFlag = verbose ? "--verbose" : "";
          results.frontend = await runCommand(
            `npm test -- ${coverageFlag} ${verboseFlag}`.trim(),
            { timeout: 300000 }
          );
        }

        if (scope === "all" || scope === "backend" || scope === "unit") {
          const coverageFlag = coverage ? "--cov=backend --cov-report=html" : "";
          const verboseFlag = verbose ? "-v" : "";
          results.backend = await runCommand(
            `${BACKEND_VENV}\\python.exe -m pytest backend/tests ${coverageFlag} ${verboseFlag}`.trim(),
            { timeout: 300000 }
          );
        }

        result = { success: true, data: results };
        break;
      }

      case "pipeline_lint": {
        const { fix = false, scope = "all" } = args || {};
        const results = {};

        if (scope === "all" || scope === "frontend") {
          const fixFlag = fix ? "--fix" : "";
          results.eslint = await runCommand(`npx eslint src ${fixFlag}`);
        }

        if (scope === "all" || scope === "backend") {
          results.flake8 = await runCommand(`${BACKEND_VENV}\\python.exe -m flake8 backend --max-line-length=120`);
          if (fix) {
            results.black = await runCommand(`${BACKEND_VENV}\\python.exe -m black backend`);
          }
        }

        result = { success: true, data: results };
        break;
      }

      case "pipeline_typecheck": {
        result = await runCommand("npx tsc --noEmit", { timeout: 120000 });
        break;
      }

      case "pipeline_build": {
        const { scope = "all" } = args || {};
        const results = {};

        if (scope === "all" || scope === "frontend") {
          results.frontend = await runCommand("npm run build", { timeout: 300000 });
        }

        if (scope === "all" || scope === "backend") {
          // Backend doesn't need build, but verify imports
          results.backend = await runCommand(
            `${BACKEND_VENV}\\python.exe -c "from backend.main import app; print('Backend OK')"`,
            { timeout: 60000 }
          );
        }

        result = { success: true, data: results };
        break;
      }

      case "pipeline_verify": {
        const { skip_tests = false } = args || {};
        const results = {
          steps: [],
          passed: true,
        };

        // Step 1: Lint
        results.steps.push({ name: "lint", status: "running" });
        const lintResult = await runCommand("npm run lint 2>&1 || echo 'Lint completed with issues'");
        results.steps[results.steps.length - 1].status = lintResult.success ? "passed" : "warning";
        results.steps[results.steps.length - 1].output = lintResult.output?.substring(0, 500);

        // Step 2: TypeScript
        results.steps.push({ name: "typecheck", status: "running" });
        const tsResult = await runCommand("npx tsc --noEmit");
        results.steps[results.steps.length - 1].status = tsResult.success ? "passed" : "failed";
        if (!tsResult.success) results.passed = false;

        // Step 3: Tests (if not skipped)
        if (!skip_tests) {
          results.steps.push({ name: "test", status: "running" });
          const testResult = await runCommand("npm test -- --passWithNoTests", { timeout: 300000 });
          results.steps[results.steps.length - 1].status = testResult.success ? "passed" : "failed";
          if (!testResult.success) results.passed = false;
        }

        // Step 4: Build
        results.steps.push({ name: "build", status: "running" });
        const buildResult = await runCommand("npm run build", { timeout: 300000 });
        results.steps[results.steps.length - 1].status = buildResult.success ? "passed" : "failed";
        if (!buildResult.success) results.passed = false;

        result = { success: results.passed, data: results };
        break;
      }

      case "pipeline_git_status": {
        const status = await runCommand("git status --short");
        const branch = await runCommand("git branch --show-current");
        const commits = await runCommand("git log --oneline -10");
        const remotes = await runCommand("git remote -v");

        result = {
          success: true,
          data: {
            branch: branch.output?.trim(),
            status: status.output,
            recent_commits: commits.output,
            remotes: remotes.output,
          }
        };
        break;
      }

      case "pipeline_security_check": {
        const { fix = false } = args || {};
        const results = {};

        // npm audit
        const auditCmd = fix ? "npm audit fix" : "npm audit";
        results.npm_audit = await runCommand(auditCmd);

        // Python safety check (if installed)
        results.pip_audit = await runCommand(
          `${BACKEND_VENV}\\python.exe -m pip_audit 2>&1 || echo 'pip-audit not installed'`
        );

        result = { success: true, data: results };
        break;
      }

      case "pipeline_check_ports": {
        const port5173 = await runCommand('netstat -ano | findstr ":5173"');
        const port8000 = await runCommand('netstat -ano | findstr ":8000"');

        result = {
          success: true,
          data: {
            port_5173: port5173.output ? "IN USE" : "AVAILABLE",
            port_5173_processes: port5173.output?.trim() || "None",
            port_8000: port8000.output ? "IN USE" : "AVAILABLE",
            port_8000_processes: port8000.output?.trim() || "None",
          }
        };
        break;
      }

      case "pipeline_start_dev": {
        const { frontend_only = false, backend_only = false } = args || {};
        const results = {};

        if (!backend_only) {
          // Start frontend in background
          results.frontend = await runCommand("start /B npm run dev", { timeout: 10000 });
        }

        if (!frontend_only) {
          // Start backend in background
          results.backend = await runCommand(
            `start /B ${BACKEND_VENV}\\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000`,
            { cwd: `${PROJECT_ROOT}\\backend`, timeout: 10000 }
          );
        }

        result = {
          success: true,
          data: {
            message: "Development servers starting...",
            frontend: frontend_only ? "skipped" : "http://localhost:5173",
            backend: backend_only ? "skipped" : "http://localhost:8000",
            ...results
          }
        };
        break;
      }

      case "pipeline_stop_dev": {
        // Kill Node and Python processes for dev servers
        const nodeKill = await runCommand('taskkill /F /IM node.exe 2>&1 || echo "No node processes"');
        const pythonKill = await runCommand('taskkill /F /IM python.exe 2>&1 || echo "No python processes"');

        result = {
          success: true,
          data: {
            node: nodeKill.output,
            python: pythonKill.output,
          }
        };
        break;
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error.message,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  process.exit(1);
});
