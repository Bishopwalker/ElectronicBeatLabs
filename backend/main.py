"""
Electromagnetic Beat Lab - FastAPI Backend
Main application entry point
"""

import asyncio
import time
from datetime import datetime
from typing import Dict, List
import psutil
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from core.audio_engine import AudioEngine
from core.field_simulator import FieldSimulator
# Import simplified database and auth
from database.database import init_db
from modules.binaural import BinauralBeatGenerator
from modules.spatial_audio import SpatialAudioProcessor
from protocols.adhd_protocols import ADHDProtocols
from routes.audio_websocket import router as audio_router
from routes.simple_routes import router as simple_router
from routes.timer import router as timer_router
from utils.logger import setup_logger, RequestLogger, AudioLogger
from utils.metrics import MetricsCollector, get_metrics, CONTENT_TYPE_LATEST

# Setup logging
logger = setup_logger(name="ebl.main", level="DEBUG", env="development")
request_logger = RequestLogger(logger)
audio_logger = AudioLogger(logger)

app = FastAPI(
    title="Electromagnetic Beat Lab",
    description="Real-time binaural beats and EM field generation with authentication and subscription management",
    version="2.0.0"
)

# Include simplified auth and subscription routes
app.include_router(simple_router, prefix="/api")
app.include_router(timer_router, prefix="/api")
app.include_router(audio_router, prefix="/api")

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """
    Initialize database and perform startup tasks
    """
    logger.info("Starting up Electromagnetic Beat Lab backend...")
    
    # Initialize database tables
    init_db()
    logger.info("Database initialized successfully")
    
    # Log startup completion
    logger.info("Backend startup completed successfully")

# Middleware for request logging and metrics
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log request start
    logger.debug(f"Incoming request: {request.method} {request.url.path}")
    
    response = await call_next(request)
    
    # Calculate duration
    duration = time.time() - start_time
    
    # Log request completion
    request_logger.log_request({
        'method': request.method,
        'path': request.url.path,
        'status': response.status_code
    }, duration)
    
    # Track metrics
    MetricsCollector.track_request(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code,
        duration=duration
    )
    
    return response

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize core components
audio_engine = AudioEngine()
field_simulator = FieldSimulator()
binaural_generator = BinauralBeatGenerator()
spatial_audio = SpatialAudioProcessor()
adhd_protocols = ADHDProtocols()

# Connect spatial processor to audio engine
audio_engine.set_spatial_processor(spatial_audio)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.sessions: Dict[str, dict] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.sessions[session_id] = {
            "websocket": websocket,
            "start_time": datetime.now(),
            "settings": {}
        }
        
        # Log connection and update metrics
        logger.info(f"WebSocket connected - Session: {session_id}")
        MetricsCollector.track_websocket_connection(True)
        MetricsCollector.track_session(True)

    def disconnect(self, websocket: WebSocket, session_id: str):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if session_id in self.sessions:
            session_start = self.sessions[session_id]["start_time"]
            duration = (datetime.now() - session_start).total_seconds()
            del self.sessions[session_id]
            
            # Log disconnection and update metrics
            logger.info(f"WebSocket disconnected - Session: {session_id}, Duration: {duration:.1f}s")
            MetricsCollector.track_websocket_connection(False)
            MetricsCollector.track_session(False)

    async def send_data(self, websocket: WebSocket, data: dict):
        try:
            await websocket.send_json(data)
            MetricsCollector.track_websocket_message("sent", data.get("type", "unknown"))
        except Exception as e:
            logger.error(f"Failed to send WebSocket message: {e}")
            MetricsCollector.track_error("websocket_send", "connection_manager")

    async def broadcast(self, data: dict):
        for connection in self.active_connections:
            await connection.send_json(data)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {
        "message": "Electromagnetic Beat Lab API",
        "status": "online",
        "endpoints": {
            "websocket": "/ws/{session_id}",
            "protocols": "/api/protocols",
            "presets": "/api/presets",
            "spatial": "/api/spatial",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    # Update system metrics
    cpu_percent = psutil.cpu_percent()
    memory = psutil.virtual_memory()
    MetricsCollector.update_system_metrics(cpu_percent, memory.used / 1024 / 1024)
    
    logger.debug(f"Health check - CPU: {cpu_percent}%, Memory: {memory.percent}%")
    
    return {
        "status": "healthy",
        "audio_engine": audio_engine.is_running(),
        "field_simulator": field_simulator.is_running(),
        "active_sessions": len(manager.active_connections),
        "system": {
            "cpu_percent": cpu_percent,
            "memory_percent": memory.percent,
            "memory_used_mb": memory.used / 1024 / 1024
        }
    }

@app.get("/api/protocols")
async def get_protocols():
    """Get available ADHD treatment protocols"""
    return {
        "protocols": adhd_protocols.get_all_protocols(),
        "categories": ["focus", "relaxation", "meditation", "sleep"]
    }

@app.get("/api/presets")
async def get_presets():
    """Get available binaural beat presets"""
    return {
        "presets": binaural_generator.get_presets(),
        "frequency_ranges": {
            "delta": "0.5-4 Hz",
            "theta": "4-8 Hz", 
            "alpha": "8-13 Hz",
            "beta": "13-30 Hz",
            "gamma": "30-100 Hz"
        }
    }

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    logger.debug("Metrics requested")
    return Response(content=get_metrics(), media_type=CONTENT_TYPE_LATEST)

@app.get("/api/spatial")
async def get_spatial_options():
    """Get available spatial audio effects"""
    return {
        "effects": {
            "8d_audio": {
                "name": "8D Audio",
                "description": "Circular panning with reverb for immersive experience",
                "parameters": {
                    "movement_speed": {"min": 0.01, "max": 1.0, "default": 0.08},
                    "spatial_intensity": {"min": 0.1, "max": 1.0, "default": 0.85},
                    "reverb_enabled": {"type": "boolean", "default": True}
                }
            },
            "field_spatial": {
                "name": "EM Field Spatialization",
                "description": "Audio positioning based on electromagnetic field data",
                "parameters": {
                    "field_intensity": {"min": 0.1, "max": 2.0, "default": 1.0}
                }
            }
        }
    }

@app.post("/api/session/start")
async def start_session(settings: dict):
    """Start a new binaural beat session"""
    try:
        session_id = audio_engine.start_session(settings)
        return {
            "session_id": session_id,
            "status": "started",
            "settings": settings
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/api/session/{session_id}/stop")
async def stop_session(session_id: str):
    """Stop an active session"""
    try:
        audio_engine.stop_session(session_id)
        return {"status": "stopped", "session_id": session_id}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time audio and field streaming"""
    await manager.connect(websocket, session_id)
    
    try:
        while True:
            # Receive control messages from client
            data = await websocket.receive_json()
            
            if data["type"] == "start_stream":
                # Start audio and field generation
                settings = data.get("settings", {})
                
                # Configure generators
                audio_engine.configure(session_id, settings)
                field_simulator.configure(session_id, settings)
                
                # Start streaming loop
                asyncio.create_task(
                    stream_data(websocket, session_id, settings)
                )
                
            elif data["type"] == "update_settings":
                # Update live settings
                settings = data.get("settings", {})
                audio_engine.update_settings(session_id, settings)
                field_simulator.update_settings(session_id, settings)
                
            elif data["type"] == "stop_stream":
                # Stop streaming
                audio_engine.stop_session(session_id)
                field_simulator.stop_session(session_id)
                break
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
        audio_engine.stop_session(session_id)
        field_simulator.stop_session(session_id)

async def stream_data(websocket: WebSocket, session_id: str, settings: dict):
    """Stream audio and field data to client"""
    try:
        while session_id in manager.sessions:
            # Generate audio frame
            audio_data = await audio_engine.generate_frame(session_id)
            
            # Generate field data
            field_data = await field_simulator.generate_frame(session_id)
            
            # Combine and send
            frame_data = {
                "type": "frame",
                "timestamp": datetime.now().isoformat(),
                "audio": audio_data,
                "field": field_data,
                "metrics": {
                    "frequency_left": settings.get("frequency_left", 440),
                    "frequency_right": settings.get("frequency_right", 444),
                    "beat_frequency": settings.get("beat_frequency", 4),
                    "amplitude": settings.get("amplitude", 0.5)
                }
            }
            
            await manager.send_data(websocket, frame_data)
            
            # Stream at 60 FPS for smooth visualization
            await asyncio.sleep(1/60)
            
    except Exception as e:
        print(f"Streaming error for session {session_id}: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)