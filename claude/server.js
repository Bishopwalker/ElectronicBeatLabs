#!/usr/bin/env node

/**
 * MCP Server for OpenAI Codex Integration
 *
 * This server enables Claude Code to delegate tasks to OpenAI Codex,
 * allowing parallel processing and "super thinking" capabilities.
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

// Path to Codex CLI
const CODEX_PATH = "C:\\Users\\bisho\\.npm-global\\codex.cmd";

/**
 * Execute a command via Codex CLI
 */
async function executeCodex(prompt, options = {}) {
  try {
    const { timeout = 60000 } = options;

    // Escape the prompt for Windows command line
    const escapedPrompt = prompt.replace(/"/g, '\\"');

    // Execute codex with the prompt
    // Note: --skip-git-repo-check allows execution from any directory
    const command = `"${CODEX_PATH}" exec --skip-git-repo-check "${escapedPrompt}"`;

    const { stdout, stderr } = await execAsync(command, {
      timeout,
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
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
      output: null,
      error: error.message,
    };
  }
}

/**
 * Create and configure the MCP server
 */
const server = new Server(
  {
    name: "enforcer-dual-agent-coding-assistant",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Tool: codex_execute
 * Execute arbitrary tasks via Codex
 */
const codexExecuteSchema = z.object({
  prompt: z.string().describe("The prompt/task to execute via Codex"),
  timeout: z.number().optional().describe("Timeout in milliseconds (default: 60000)"),
});

/**
 * Tool: codex_analyze
 * Analyze code or files
 */
const codexAnalyzeSchema = z.object({
  code: z.string().describe("The code to analyze"),
  question: z.string().describe("Specific question or analysis to perform"),
  timeout: z.number().optional(),
});

/**
 * Tool: codex_generate
 * Generate code based on requirements
 */
const codexGenerateSchema = z.object({
  requirements: z.string().describe("Description of what code to generate"),
  language: z.string().optional().describe("Programming language (e.g., 'python', 'javascript')"),
  timeout: z.number().optional(),
});

/**
 * Tool: codex_refactor
 * Refactor existing code
 */
const codexRefactorSchema = z.object({
  code: z.string().describe("The code to refactor"),
  instructions: z.string().describe("How to refactor the code"),
  timeout: z.number().optional(),
});

/**
 * Tool: codex_debug
 * Debug issues in code
 */
const codexDebugSchema = z.object({
  code: z.string().describe("The code with issues"),
  problem: z.string().describe("Description of the problem or error"),
  timeout: z.number().optional(),
});

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "codex_execute",
        description: "Execute arbitrary tasks or prompts via OpenAI Codex. Use this for general-purpose delegation of tasks to Codex.",
        inputSchema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "The prompt/task to execute via Codex",
            },
            timeout: {
              type: "number",
              description: "Timeout in milliseconds (default: 60000)",
            },
          },
          required: ["prompt"],
        },
      },
      {
        name: "codex_analyze",
        description: "Analyze code or files using Codex. Delegate code analysis tasks to get insights, find issues, or understand code structure.",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "The code to analyze",
            },
            question: {
              type: "string",
              description: "Specific question or analysis to perform",
            },
            timeout: {
              type: "number",
              description: "Timeout in milliseconds",
            },
          },
          required: ["code", "question"],
        },
      },
      {
        name: "codex_generate",
        description: "Generate code based on requirements using Codex. Delegate code generation tasks for functions, classes, or entire modules.",
        inputSchema: {
          type: "object",
          properties: {
            requirements: {
              type: "string",
              description: "Description of what code to generate",
            },
            language: {
              type: "string",
              description: "Programming language (e.g., 'python', 'javascript')",
            },
            timeout: {
              type: "number",
              description: "Timeout in milliseconds",
            },
          },
          required: ["requirements"],
        },
      },
      {
        name: "codex_refactor",
        description: "Refactor existing code using Codex. Delegate code refactoring tasks to improve code quality, structure, or performance.",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "The code to refactor",
            },
            instructions: {
              type: "string",
              description: "How to refactor the code",
            },
            timeout: {
              type: "number",
              description: "Timeout in milliseconds",
            },
          },
          required: ["code", "instructions"],
        },
      },
      {
        name: "codex_debug",
        description: "Debug issues in code using Codex. Delegate debugging tasks to identify and fix bugs or errors.",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "The code with issues",
            },
            problem: {
              type: "string",
              description: "Description of the problem or error",
            },
            timeout: {
              type: "number",
              description: "Timeout in milliseconds",
            },
          },
          required: ["code", "problem"],
        },
      },
    ],
  };
});

/**
 * Handle tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case "codex_execute": {
        const { prompt, timeout } = codexExecuteSchema.parse(args);
        result = await executeCodex(prompt, { timeout });
        break;
      }

      case "codex_analyze": {
        const { code, question, timeout } = codexAnalyzeSchema.parse(args);
        const prompt = `Analyze the following code and answer this question: ${question}\n\nCode:\n${code}`;
        result = await executeCodex(prompt, { timeout });
        break;
      }

      case "codex_generate": {
        const { requirements, language, timeout } = codexGenerateSchema.parse(args);
        const langSpec = language ? ` in ${language}` : "";
        const prompt = `Generate code${langSpec} that meets these requirements:\n${requirements}`;
        result = await executeCodex(prompt, { timeout });
        break;
      }

      case "codex_refactor": {
        const { code, instructions, timeout } = codexRefactorSchema.parse(args);
        const prompt = `Refactor the following code according to these instructions: ${instructions}\n\nCode:\n${code}`;
        result = await executeCodex(prompt, { timeout });
        break;
      }

      case "codex_debug": {
        const { code, problem, timeout } = codexDebugSchema.parse(args);
        const prompt = `Debug this code. Problem: ${problem}\n\nCode:\n${code}`;
        result = await executeCodex(prompt, { timeout });
        break;
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    // Format the response
    const response = {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };

    return response;
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

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

}

main().catch((error) => {
  process.exit(1);
});
