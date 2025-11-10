"""
WebSocket-Only FastAPI Application for ECS Fargate
This handles only WebSocket audio streaming (long-running connections)
REST API endpoints are handled by Lambda functions
"""

import asyncio
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routes.audio_websocket import router as audio_router
from utils.logger import setup_logger, RequestLogger
from utils.metrics import MetricsCollector, get_metrics, CONTENT_TYPE_LATEST

# Setup logging
logger = setup_logger(name="ebl.websocket", level="INFO", env="production")
request_logger = RequestLogger(logger)

app = FastAPI(
    title="Electromagnetic Beat Lab - WebSocket Service",
    description="Real-time audio streaming via WebSocket (ECS Fargate)",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Include only WebSocket audio router
app.include_router(audio_router)

@app.on_event("startup")
async def startup_event():
    """Initialize WebSocket service"""
    logger.info("Starting WebSocket service on ECS Fargate...")
    logger.info("WebSocket endpoint: /ws/audio")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Request logging middleware"""
    start_time = time.time()
    logger.debug(f"Incoming request: {request.method} {request.url.path}")

    response = await call_next(request)
    duration = time.time() - start_time

    request_logger.log_request({
        'method': request.method,
        'path': request.url.path,
        'status': response.status_code
    }, duration)

    MetricsCollector.track_request(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code,
        duration=duration
    )

    return response

@app.get("/health")
async def health_check():
    """Health check endpoint for ECS health checks"""
    return {
        "status": "healthy",
        "service": "websocket",
        "timestamp": time.time()
    }

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return get_metrics()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
