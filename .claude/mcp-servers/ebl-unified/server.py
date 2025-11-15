#!/usr/bin/env python3
"""
EBL Unified MCP Server
Model-agnostic development assistant combining RAG, Memory, and multi-model support

Usage:
    python server.py

Environment:
    See .env.example for required environment variables
"""

import asyncio
import json
import logging
import os
import sys
from pathlib import Path
from typing import Any

# Setup Python path
server_dir = Path(__file__).parent
project_root = server_dir.parent.parent.parent  # Go up to project root
sys.path.insert(0, str(project_root))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Import MCP SDK
from mcp.server import Server
from mcp.types import Tool, TextContent

# Import our tools
from tools import rag_tools, memory_tools, model_tools

# Setup logging
logging.basicConfig(
    level=os.getenv('LOG_LEVEL', 'INFO'),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('ebl-unified')


# Initialize MCP server
app = Server("ebl-unified")


def load_config() -> dict:
    """Load configuration from config.json"""
    config_path = server_dir / "config.json"
    with open(config_path, 'r') as f:
        return json.load(f)


def initialize_services():
    """Initialize RAG, Memory, and Model services"""
    try:
        config = load_config()
        project_root_path = os.getenv('PROJECT_ROOT', str(project_root))

        # Initialize RAG
        logger.info("Initializing RAG system...")
        rag_tools.initialize_rag(project_root_path)

        # Initialize Memory
        logger.info("Initializing Memory service...")
        memory_tools.initialize_memory(project_root_path)

        # Initialize Models
        logger.info("Initializing Model manager...")
        model_tools.initialize_models(config['models'])

        logger.info("All services initialized successfully")

    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise


# Register Tools
@app.list_tools()
async def list_tools() -> list[Tool]:
    """List all available MCP tools"""
    return [
        # RAG Tools
        Tool(
            name="search_code",
            description="Search the codebase using hybrid semantic + keyword search",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"},
                    "n_results": {"type": "integer", "default": 5, "minimum": 1, "maximum": 20}
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="analyze_error",
            description="Analyze stack trace and find relevant code context",
            inputSchema={
                "type": "object",
                "properties": {
                    "stack_trace": {"type": "string", "description": "Stack trace to analyze"},
                    "context_query": {"type": "string", "description": "Optional context query"}
                },
                "required": ["stack_trace"]
            }
        ),
        Tool(
            name="get_code_stats",
            description="Get statistics about the indexed codebase",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        # Memory Tools
        Tool(
            name="save_memory",
            description="Save persistent memory for later retrieval",
            inputSchema={
                "type": "object",
                "properties": {
                    "session_id": {"type": "string"},
                    "content": {"type": "string"},
                    "memory_type": {"type": "string", "default": "session"},
                    "metadata": {"type": "object"}
                },
                "required": ["session_id", "content"]
            }
        ),
        Tool(
            name="search_memory",
            description="Search across all saved memories",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "session_id": {"type": "string"},
                    "memory_type": {"type": "string"},
                    "n_results": {"type": "integer", "default": 5}
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="get_session_memory",
            description="Retrieve all memories for a specific session",
            inputSchema={
                "type": "object",
                "properties": {
                    "session_id": {"type": "string"}
                },
                "required": ["session_id"]
            }
        ),
        Tool(
            name="enhance_query",
            description="Enhance a RAG query with session context",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "session_id": {"type": "string"}
                },
                "required": ["query", "session_id"]
            }
        ),
        # Model Tools
        Tool(
            name="execute_with_model",
            description="Execute a task using specified model (claude, codex, or custom)",
            inputSchema={
                "type": "object",
                "properties": {
                    "task": {"type": "string"},
                    "model_name": {"type": "string", "enum": ["claude", "codex", "custom"]},
                    "context": {"type": "object"}
                },
                "required": ["task"]
            }
        ),
        Tool(
            name="switch_model",
            description="Switch the default model",
            inputSchema={
                "type": "object",
                "properties": {
                    "model_name": {"type": "string", "enum": ["claude", "codex", "custom"]}
                },
                "required": ["model_name"]
            }
        ),
        Tool(
            name="get_model_status",
            description="Get status of all configured models",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: Any) -> list[TextContent]:
    """Handle tool calls"""
    try:
        # Route to appropriate tool
        if name == "search_code":
            result = await rag_tools.search_code(**arguments)
        elif name == "analyze_error":
            result = await rag_tools.analyze_error(**arguments)
        elif name == "get_code_stats":
            result = await rag_tools.get_code_stats()
        elif name == "save_memory":
            result = await memory_tools.save_memory(**arguments)
        elif name == "search_memory":
            result = await memory_tools.search_memory(**arguments)
        elif name == "get_session_memory":
            result = await memory_tools.get_session_memory(**arguments)
        elif name == "enhance_query":
            result = await memory_tools.enhance_query(**arguments)
        elif name == "execute_with_model":
            result = await model_tools.execute_with_model(**arguments)
        elif name == "switch_model":
            result = await model_tools.switch_model(**arguments)
        elif name == "get_model_status":
            result = await model_tools.get_model_status()
        else:
            return [TextContent(type="text", text=json.dumps({"error": f"Unknown tool: {name}"}))]

        return [TextContent(type="text", text=json.dumps(result, indent=2))]

    except Exception as e:
        logger.error(f"Error in tool {name}: {e}", exc_info=True)
        return [TextContent(type="text", text=json.dumps({
            "error": str(e),
            "tool": name
        }))]


async def main():
    """Main entry point"""
    logger.info("EBL Unified MCP Server starting...")

    # Initialize services
    initialize_services()

    # Run server with stdio transport
    from mcp.server.stdio import stdio_server

    async with stdio_server() as (read_stream, write_stream):
        logger.info("Server running on stdio")
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options()
        )


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {e}", exc_info=True)
        sys.exit(1)
