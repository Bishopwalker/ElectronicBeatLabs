#!/usr/bin/env node

/**
 * EBL Deployment MCP Server
 *
 * Handles EBL deployment operations:
 * - Docker image builds (frontend/backend)
 * - ECR push operations
 * - ECS service updates
 * - Deployment status checks
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import { z } from "zod";

const execAsync = promisify(exec);

// Configuration
const PROJECT_ROOT = process.env.EBL_PROJECT_ROOT || "C:\\Users\\bisho\\IdeaProjects\\ebl";
const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const AWS_ACCOUNT = process.env.AWS_ACCOUNT || "498251986918";
const ECR_REGISTRY = `${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com`;

/**
 * Execute shell command with output streaming
 */
async function runCommand(command, options = {}) {
  const { timeout = 300000, cwd = PROJECT_ROOT } = options;

  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout,
      maxBuffer: 1024 * 1024 * 50, // 50MB buffer for Docker builds
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
    };
  }
}

const server = new Server(
  {
    name: "ebl-deployment",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Schema definitions
const buildImageSchema = z.object({
  service: z.enum(["frontend", "backend", "both"]).describe("Which service to build"),
  tag: z.string().optional().describe("Image tag (default: latest)"),
  no_cache: z.boolean().optional().describe("Build without cache"),
});

const pushImageSchema = z.object({
  service: z.enum(["frontend", "backend", "both"]).describe("Which service to push"),
  tag: z.string().optional().describe("Image tag (default: latest)"),
});

const deploySchema = z.object({
  service: z.enum(["frontend", "backend", "both"]).describe("Which service to deploy"),
  environment: z.enum(["staging", "production"]).optional().describe("Target environment"),
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "deploy_check_docker",
        description: "Check Docker daemon status and list EBL images.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "deploy_build_image",
        description: "Build Docker image for EBL frontend and/or backend services.",
        inputSchema: {
          type: "object",
          properties: {
            service: {
              type: "string",
              enum: ["frontend", "backend", "both"],
              description: "Which service to build",
            },
            tag: {
              type: "string",
              description: "Image tag (default: latest)",
            },
            no_cache: {
              type: "boolean",
              description: "Build without Docker cache",
            },
          },
          required: ["service"],
        },
      },
      {
        name: "deploy_ecr_login",
        description: "Authenticate Docker with AWS ECR registry.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "deploy_push_image",
        description: "Push EBL Docker images to AWS ECR.",
        inputSchema: {
          type: "object",
          properties: {
            service: {
              type: "string",
              enum: ["frontend", "backend", "both"],
              description: "Which service to push",
            },
            tag: {
              type: "string",
              description: "Image tag (default: latest)",
            },
          },
          required: ["service"],
        },
      },
      {
        name: "deploy_compose_up",
        description: "Start EBL services using docker-compose for local testing.",
        inputSchema: {
          type: "object",
          properties: {
            detached: {
              type: "boolean",
              description: "Run in detached mode (default: true)",
            },
            build: {
              type: "boolean",
              description: "Build images before starting",
            },
          },
          required: [],
        },
      },
      {
        name: "deploy_compose_down",
        description: "Stop and remove EBL docker-compose services.",
        inputSchema: {
          type: "object",
          properties: {
            remove_volumes: {
              type: "boolean",
              description: "Also remove volumes",
            },
            remove_orphans: {
              type: "boolean",
              description: "Remove orphan containers",
            },
          },
          required: [],
        },
      },
      {
        name: "deploy_status",
        description: "Check deployment status - running containers, health, ports.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "deploy_logs",
        description: "Get logs from EBL containers.",
        inputSchema: {
          type: "object",
          properties: {
            service: {
              type: "string",
              enum: ["frontend", "backend"],
              description: "Which service logs to fetch",
            },
            lines: {
              type: "number",
              description: "Number of log lines (default: 50)",
            },
          },
          required: ["service"],
        },
      },
      {
        name: "deploy_cleanup",
        description: "Clean up unused Docker resources (images, containers, volumes).",
        inputSchema: {
          type: "object",
          properties: {
            all: {
              type: "boolean",
              description: "Remove all unused resources (aggressive)",
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
      case "deploy_check_docker": {
        const dockerInfo = await runCommand("docker info --format '{{.ServerVersion}}'");
        const images = await runCommand("docker images --filter 'reference=ebl-*' --format '{{.Repository}}:{{.Tag}} {{.Size}} {{.CreatedSince}}'");
        const containers = await runCommand("docker ps --filter 'name=ebl' --format '{{.Names}} {{.Status}} {{.Ports}}'");

        result = {
          success: true,
          data: {
            docker_version: dockerInfo.output?.trim(),
            ebl_images: images.output?.split("\n").filter(Boolean),
            running_containers: containers.output?.split("\n").filter(Boolean),
          }
        };
        break;
      }

      case "deploy_build_image": {
        const { service, tag = "latest", no_cache = false } = buildImageSchema.parse(args);
        const cacheFlag = no_cache ? "--no-cache" : "";
        const results = {};

        if (service === "frontend" || service === "both") {
          const cmd = `docker build ${cacheFlag} -t ebl-frontend:${tag} -f Dockerfile.frontend .`;
          results.frontend = await runCommand(cmd, { timeout: 600000 });
        }

        if (service === "backend" || service === "both") {
          const cmd = `docker build ${cacheFlag} -t ebl-backend:${tag} -f Dockerfile.backend .`;
          results.backend = await runCommand(cmd, { timeout: 600000 });
        }

        result = { success: true, data: results };
        break;
      }

      case "deploy_ecr_login": {
        const cmd = `aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}`;
        result = await runCommand(cmd);
        break;
      }

      case "deploy_push_image": {
        const { service, tag = "latest" } = pushImageSchema.parse(args);
        const results = {};

        if (service === "frontend" || service === "both") {
          // Tag and push frontend
          await runCommand(`docker tag ebl-frontend:${tag} ${ECR_REGISTRY}/ebl-frontend:${tag}`);
          results.frontend = await runCommand(`docker push ${ECR_REGISTRY}/ebl-frontend:${tag}`, { timeout: 600000 });
        }

        if (service === "backend" || service === "both") {
          // Tag and push backend
          await runCommand(`docker tag ebl-backend:${tag} ${ECR_REGISTRY}/ebl-backend:${tag}`);
          results.backend = await runCommand(`docker push ${ECR_REGISTRY}/ebl-backend:${tag}`, { timeout: 600000 });
        }

        result = { success: true, data: results };
        break;
      }

      case "deploy_compose_up": {
        const { detached = true, build = false } = args || {};
        const flags = [];
        if (detached) flags.push("-d");
        if (build) flags.push("--build");

        const cmd = `docker-compose up ${flags.join(" ")}`;
        result = await runCommand(cmd, { timeout: 300000 });
        break;
      }

      case "deploy_compose_down": {
        const { remove_volumes = false, remove_orphans = true } = args || {};
        const flags = [];
        if (remove_volumes) flags.push("-v");
        if (remove_orphans) flags.push("--remove-orphans");

        const cmd = `docker-compose down ${flags.join(" ")}`;
        result = await runCommand(cmd);
        break;
      }

      case "deploy_status": {
        const containers = await runCommand("docker ps --filter 'name=ebl' --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'");
        const health = await runCommand("curl -s http://localhost:8000/health || echo 'Backend not responding'");
        const frontendHealth = await runCommand("curl -s -o /dev/null -w '%{http_code}' http://localhost || echo 'Frontend not responding'");

        result = {
          success: true,
          data: {
            containers: containers.output,
            backend_health: health.output,
            frontend_status: frontendHealth.output,
          }
        };
        break;
      }

      case "deploy_logs": {
        const { service, lines = 50 } = args;
        const containerName = service === "frontend" ? "ebl-frontend" : "ebl-backend";
        const cmd = `docker logs --tail ${lines} ${containerName}`;
        result = await runCommand(cmd);
        break;
      }

      case "deploy_cleanup": {
        const { all = false } = args || {};
        const results = {};

        // Remove stopped containers
        results.containers = await runCommand("docker container prune -f");

        // Remove dangling images
        results.images = await runCommand("docker image prune -f");

        if (all) {
          // More aggressive cleanup
          results.system = await runCommand("docker system prune -f");
        }

        result = { success: true, data: results };
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
