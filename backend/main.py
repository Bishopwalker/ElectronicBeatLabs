"""
Electromagnetic Beat Lab - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import json
from typing import Dict, List
from datetime import datetime

from core.audio_engine import AudioEngine
from core.field_simulator import FieldSimulator
from modules.binaural import BinauralBeatGenerator
from protocols.adhd_protocols import ADHDProtocols

app = FastAPI(
    title="Electromagnetic Beat Lab",
    description="Real-time binaural beats and EM field generation",
    version="1.0.0"
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize core components
audio_engine = AudioEngine()
field_simulator = FieldSimulator()
binaural_generator = BinauralBeatGenerator()
adhd_protocols = ADHDProtocols()

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

    def disconnect(self, websocket: WebSocket, session_id: str):
        self.active_connections.remove(websocket)
        if session_id in self.sessions:
            del self.sessions[session_id]

    async def send_data(self, websocket: WebSocket, data: dict):
        await websocket.send_json(data)

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
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "audio_engine": audio_engine.is_running(),
        "field_simulator": field_simulator.is_running(),
        "active_sessions": len(manager.active_connections)
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