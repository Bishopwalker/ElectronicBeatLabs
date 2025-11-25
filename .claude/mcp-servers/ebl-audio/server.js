#!/usr/bin/env node

/**
 * EBL Audio Engine MCP Server
 *
 * Controls the EBL binaural beat audio engine:
 * - Start/stop audio sessions
 * - Configure frequencies and protocols
 * - Monitor audio quality metrics
 * - Apply ADHD treatment protocols
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

// EBL Backend API endpoint
const BACKEND_URL = process.env.EBL_BACKEND_URL || "http://localhost:8000";

/**
 * Make HTTP request to EBL backend
 */
async function apiRequest(endpoint, method = "GET", body = null) {
  try {
    const fetch = (await import("node-fetch")).default;
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BACKEND_URL}${endpoint}`, options);
    const data = await response.json();

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Execute curl command for API calls (fallback)
 */
async function curlRequest(endpoint, method = "GET", body = null) {
  try {
    let command = `curl -s -X ${method} "${BACKEND_URL}${endpoint}"`;
    if (body) {
      command += ` -H "Content-Type: application/json" -d '${JSON.stringify(body)}'`;
    }

    const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
    return { success: true, data: JSON.parse(stdout) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

const server = new Server(
  {
    name: "ebl-audio-engine",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Schema definitions
const startSessionSchema = z.object({
  base_frequency: z.number().min(20).max(20000).describe("Base/carrier frequency in Hz (default: 140)"),
  beat_frequency: z.number().min(0.1).max(100).describe("Binaural beat frequency in Hz (default: 10)"),
  volume: z.number().min(0).max(1).optional().describe("Volume level 0-1 (default: 0.5)"),
  protocol: z.string().optional().describe("ADHD protocol: focus, calm, deep_focus, meditation"),
});

const updateFrequencySchema = z.object({
  session_id: z.string().describe("Active session ID"),
  base_frequency: z.number().min(20).max(20000).optional(),
  beat_frequency: z.number().min(0.1).max(100).optional(),
  volume: z.number().min(0).max(1).optional(),
});

const protocolSchema = z.object({
  protocol_type: z.string().describe("Protocol type: focus, calm, deep_focus, meditation"),
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "audio_check_backend",
        description: "Check if EBL backend is running and healthy. Use this before starting audio sessions.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "audio_start_session",
        description: "Start a new binaural beat audio session with specified frequencies. Returns session_id for control.",
        inputSchema: {
          type: "object",
          properties: {
            base_frequency: {
              type: "number",
              description: "Base/carrier frequency in Hz (20-20000, default: 140)",
            },
            beat_frequency: {
              type: "number",
              description: "Binaural beat frequency in Hz (0.1-100, default: 10)",
            },
            volume: {
              type: "number",
              description: "Volume level 0-1 (default: 0.5)",
            },
            protocol: {
              type: "string",
              description: "ADHD protocol: focus, calm, deep_focus, meditation",
            },
          },
          required: ["base_frequency", "beat_frequency"],
        },
      },
      {
        name: "audio_stop_session",
        description: "Stop an active audio session by session_id.",
        inputSchema: {
          type: "object",
          properties: {
            session_id: {
              type: "string",
              description: "Session ID to stop",
            },
          },
          required: ["session_id"],
        },
      },
      {
        name: "audio_update_frequency",
        description: "Update frequencies or volume on an active session in real-time.",
        inputSchema: {
          type: "object",
          properties: {
            session_id: {
              type: "string",
              description: "Active session ID",
            },
            base_frequency: {
              type: "number",
              description: "New base frequency in Hz",
            },
            beat_frequency: {
              type: "number",
              description: "New beat frequency in Hz",
            },
            volume: {
              type: "number",
              description: "New volume level 0-1",
            },
          },
          required: ["session_id"],
        },
      },
      {
        name: "audio_get_protocols",
        description: "Get available ADHD treatment protocols with their frequency configurations.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "audio_apply_protocol",
        description: "Apply a predefined ADHD protocol to configure optimal frequencies.",
        inputSchema: {
          type: "object",
          properties: {
            protocol_type: {
              type: "string",
              description: "Protocol: focus (14Hz SMR), calm (8Hz Alpha), deep_focus (40Hz Gamma), meditation (6Hz Theta)",
            },
          },
          required: ["protocol_type"],
        },
      },
      {
        name: "audio_get_metrics",
        description: "Get session performance metrics: latency, quality, active sessions.",
        inputSchema: {
          type: "object",
          properties: {
            session_id: {
              type: "string",
              description: "Optional session ID for specific metrics",
            },
          },
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
      case "audio_check_backend": {
        result = await curlRequest("/health");
        break;
      }

      case "audio_start_session": {
        const settings = startSessionSchema.parse(args);
        result = await curlRequest("/api/audio/session/start", "POST", settings);
        break;
      }

      case "audio_stop_session": {
        const { session_id } = args;
        result = await curlRequest(`/api/audio/session/${session_id}/stop`, "POST");
        break;
      }

      case "audio_update_frequency": {
        const { session_id, ...settings } = updateFrequencySchema.parse(args);
        result = await curlRequest(`/api/audio/session/${session_id}/update`, "POST", settings);
        break;
      }

      case "audio_get_protocols": {
        // Return hardcoded protocols matching audio_engine.py
        result = {
          success: true,
          data: {
            protocols: {
              focus: {
                base_frequency: 140,
                beat_frequency: 14,
                volume: 0.5,
                duration: 1200,
                description: "SMR training (12-15Hz) for attention and focus"
              },
              calm: {
                base_frequency: 144,
                beat_frequency: 8,
                volume: 0.5,
                duration: 900,
                description: "Alpha waves (8-13Hz) for relaxation and calm focus"
              },
              deep_focus: {
                base_frequency: 144,
                beat_frequency: 40,
                volume: 0.5,
                duration: 1500,
                description: "Gamma waves (30-100Hz) for deep concentration"
              },
              meditation: {
                base_frequency: 144,
                beat_frequency: 6,
                volume: 0.5,
                duration: 1800,
                description: "Theta waves (4-8Hz) for meditation and creativity"
              }
            }
          }
        };
        break;
      }

      case "audio_apply_protocol": {
        const { protocol_type } = protocolSchema.parse(args);
        result = await curlRequest(`/api/audio/protocol/${protocol_type}`, "GET");
        break;
      }

      case "audio_get_metrics": {
        const { session_id } = args || {};
        const endpoint = session_id
          ? `/api/audio/session/${session_id}/metrics`
          : "/api/audio/metrics";
        result = await curlRequest(endpoint);
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
