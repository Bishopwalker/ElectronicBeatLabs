"""
Electromagnetic Beat Lab (EBL) - Audio WebSocket Routes
Real-time binaural beat streaming with 8D spatial audio
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import logging
from typing import Dict, Set
from datetime import datetime

from core.audio_engine import AudioEngine
from modules.spatial_audio import SpatialAudioProcessor

logger = logging.getLogger(__name__)

router = APIRouter()

# Global instances
audio_engine = AudioEngine(sample_rate=48000)
spatial_processor = SpatialAudioProcessor(sample_rate=48000)
audio_engine.set_spatial_processor(spatial_processor)

# Track active connections
active_connections: Dict[str, WebSocket] = {}
active_sessions: Set[str] = set()
# Track WebSocket session ID to audio engine session ID mapping
websocket_to_audio_session: Dict[str, str] = {}

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        active_sessions.add(session_id)
        logger.info(f"WebSocket connected: {session_id}")
    
    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        if session_id in active_sessions:
            active_sessions.remove(session_id)
        # Stop audio session using correct audio engine session ID
        if session_id in websocket_to_audio_session:
            audio_engine_session_id = websocket_to_audio_session[session_id]
            audio_engine.stop_session(audio_engine_session_id)
            del websocket_to_audio_session[session_id]
        logger.info(f"WebSocket disconnected: {session_id}")
    
    async def send_personal_message(self, message: dict, session_id: str):
        websocket = self.active_connections.get(session_id)
        if websocket:
            await websocket.send_text(json.dumps(message))
    
    async def send_control_message(self, message_type: str, data: dict, session_id: str):
        websocket = self.active_connections.get(session_id)
        if websocket:
            await websocket.send_text(json.dumps({
                "type": message_type,
                "data": data,
                "timestamp": asyncio.get_event_loop().time()
            }))

manager = ConnectionManager()

async def stream_audio_frames(websocket: WebSocket, session_id: str):
    """Stream audio frames to client at 60 FPS"""
    frame_duration = 1.0 / 60  # 60 FPS

    try:
        while True:
            # Generate audio frame
            frame = await audio_engine.generate_frame(session_id)

            if frame:
                # Send frame to client
                await websocket.send_json({
                    "type": "frame",
                    "data": frame,
                    "timestamp": asyncio.get_event_loop().time()
                })

            # Wait for next frame time
            await asyncio.sleep(frame_duration)

    except Exception as e:
        logger.error(f"Audio streaming error for session {session_id}: {e}")

@router.websocket("/ws/audio/{session_id}")
async def websocket_audio_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time audio streaming"""
    logger.info(f"🔌 WebSocket connection attempt for session: {session_id}")
    await manager.connect(websocket, session_id)
    logger.info(f"✅ WebSocket connected successfully for session: {session_id}")

    audio_task = None  # Track audio streaming task

    try:
        # Handle incoming messages
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
                message = json.loads(data)

                # Pass audio_task reference to handler
                audio_task = await handle_websocket_message(message, session_id, websocket, audio_task)
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                break

    except WebSocketDisconnect:
        logger.info(f"Client {session_id} disconnected")
    except Exception as e:
        logger.error(f"WebSocket error for {session_id}: {e}")
    finally:
        # Cancel audio streaming if still running
        if audio_task and not audio_task.done():
            audio_task.cancel()
            logger.info(f"🛑 Cancelled audio streaming for {session_id}")
        manager.disconnect(session_id)

async def send_frequency_transition(session_id: str, transition_data: dict):
    """Send frequency transition command to frontend"""
    await manager.send_personal_message({
        "type": "frequency_transition",
        "data": transition_data
    }, session_id)

async def handle_websocket_message(message: dict, session_id: str, websocket: WebSocket = None, audio_task=None):
    """Handle incoming WebSocket messages"""
    message_type = message.get("type")
    
    try:
        if message_type == "start_session" or message_type == "start_stream":
            # Start audio session
            settings = message.get("data", {}).get("settings", {}) if message.get("data") else message.get("settings", {})
            validated_settings = audio_engine.validate_frequencies(settings)
            audio_engine_session_id = audio_engine.start_session(validated_settings)
            
            # Store the mapping between WebSocket session ID and audio engine session ID
            websocket_to_audio_session[session_id] = audio_engine_session_id
            logger.info(f"🎵 Audio session started: WebSocket={session_id}, AudioEngine={audio_engine_session_id}")
            logger.info(f"🗂️ Current session mappings: {websocket_to_audio_session}")
            logger.info(f"🔧 AudioEngine active sessions: {list(audio_engine.sessions.keys())}")
            
            # Start audio streaming task
            if websocket:
                audio_task = asyncio.create_task(stream_audio_frames(websocket, audio_engine_session_id))
                logger.info(f"🎵 Started audio streaming task for session {audio_engine_session_id}")

            await manager.send_personal_message({
                "type": "session_started",
                "session_id": audio_engine_session_id,
                "settings": validated_settings
            }, session_id)
        
        elif message_type == "stop_session" or message_type == "stop_stream":
            # Stop audio session using correct audio engine session ID
            if session_id in websocket_to_audio_session:
                audio_engine_session_id = websocket_to_audio_session[session_id]
                audio_engine.stop_session(audio_engine_session_id)
                del websocket_to_audio_session[session_id]
            await manager.send_personal_message({
                "type": "session_stopped",
                "session_id": session_id
            }, session_id)
        
        elif message_type == "update_settings":
            # Update session settings
            settings = message.get("settings", {})
            validated_settings = audio_engine.validate_frequencies(settings)
            audio_engine.update_settings(session_id, validated_settings)
            
            await manager.send_personal_message({
                "type": "settings_updated",
                "settings": validated_settings
            }, session_id)
        
        elif message_type == "load_protocol":
            # Load ADHD protocol
            protocol_type = message.get("protocol", "focus")
            protocol_config = audio_engine.create_adhd_protocol(protocol_type)
            
            # Start session with protocol
            session_id_returned = audio_engine.start_session(protocol_config)
            
            await manager.send_personal_message({
                "type": "protocol_loaded",
                "protocol": protocol_type,
                "config": protocol_config,
                "session_id": session_id_returned
            }, session_id)
        
        elif message_type == "get_metrics":
            # Get session metrics
            metrics = audio_engine.get_session_metrics(session_id)
            await manager.send_personal_message({
                "type": "metrics",
                "data": metrics
            }, session_id)
        
        elif message_type == "enable_spatial":
            # Enable 8D spatial audio
            spatial_settings = message.get("spatial_settings", {})
            spatial_processor.configure_session(session_id, spatial_settings)
            
            # Update session to enable spatial audio
            audio_engine.update_settings(session_id, {
                "spatial_enabled": True,
                "spatial_settings": spatial_settings
            })
            
            await manager.send_personal_message({
                "type": "spatial_enabled",
                "settings": spatial_settings
            }, session_id)
        
        elif message_type == "disable_spatial":
            # Disable 8D spatial audio
            audio_engine.update_settings(session_id, {"spatial_enabled": False})
            
            await manager.send_personal_message({
                "type": "spatial_disabled"
            }, session_id)
        
        else:
            logger.warning(f"Unknown message type: {message_type}")

    except Exception as e:
        logger.error(f"Error handling message {message_type}: {e}")
        await manager.send_personal_message({
            "type": "error",
            "message": str(e)
        }, session_id)

    return audio_task  # Return the audio task (may be None)

@router.get("/audio/protocols")
async def get_available_protocols():
    """Get available ADHD treatment protocols"""
    protocols = {
        "focus": audio_engine.create_adhd_protocol("focus"),
        "calm": audio_engine.create_adhd_protocol("calm"),
        "deep_focus": audio_engine.create_adhd_protocol("deep_focus"),
        "meditation": audio_engine.create_adhd_protocol("meditation")
    }
    return {"protocols": protocols}

@router.get("/audio/status")
async def get_audio_status():
    """Get current audio engine status"""
    return {
        "engine_running": audio_engine.is_running(),
        "active_sessions": len(audio_engine.sessions),
        "sample_rate": audio_engine.sample_rate,
        "active_connections": len(active_connections),
        "timestamp": datetime.now().isoformat()
    }

@router.post("/audio/validate")
async def validate_audio_settings(settings: dict):
    """Validate audio settings"""
    validated = audio_engine.validate_frequencies(settings)
    return {
        "original": settings,
        "validated": validated,
        "changes_made": settings != validated
    }