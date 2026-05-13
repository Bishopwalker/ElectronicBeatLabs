#!/usr/bin/env python3
"""
Electromagnetic Beat Lab - Development Startup Script
Starts the FastAPI backend with enhanced logging for development
"""

import uvicorn
import os
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def main():
    """Start the development server with enhanced logging"""
    
    # Set environment for development
    os.environ['EBL_ENV'] = 'development'

    # Start uvicorn with development settings
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8080,  # Reason: ports 8000-8002 taken by USPS ICDA / Docker on this machine
        reload=True,
        reload_dirs=[str(backend_dir)],
        log_level="debug",
        access_log=True,
        loop="asyncio",
        # Enable auto-reload for development
        reload_includes=["*.py", "*.yml", "*.yaml", "*.json"],
        # Uvicorn logging configuration
        log_config={
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(asctime)s | %(levelname)-8s | uvicorn | %(message)s",
                    "datefmt": "%H:%M:%S"
                },
            },
            "handlers": {
                "default": {
                    "formatter": "default",
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                },
            },
            "root": {
                "level": "INFO",
                "handlers": ["default"],
            },
        }
    )

if __name__ == "__main__":
    main()