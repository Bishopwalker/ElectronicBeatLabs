"""
Electromagnetic Beat Lab (EBL) - SIMPLIFIED Audio WebSocket Routes
Real-time binaural beat streaming with 8D spatial audio - NO BULLSHIT VERSION

KEEPS: Audio engine, 8D effects, 60 FPS streaming
CUTS: Session mapping complexity, unnecessary abstractions
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import logging
from typing import Dict
from datetime import datetime

from core.audio_engine import AudioEngine
from modules.spatial_audio import SpatialAudioProcessor

logger = logging.getLogger(__name__)
router = APIRouter()

# Global instances - simple and direct
audio_engine = AudioEngine(sample_rate=48000)
spatial_processor = SpatialAudioProcessor(sample_rate=48000)
audio_engine.set_spatial_processor(spatial_processor)

# Simple connection tracking - NO session mapping bullshit
active_connections: Dict[str, WebSocket] = {}

async def stream_audio_frames(websocket: WebSocket, session_id: str):
    """Stream audio frames at precise 60 FPS - CORE FUNCTIONALITY"""
    target_fps = 60
    frame_duration = 1.0 / target_fps  # 16.666ms target

    start_time = asyncio.get_event_loop().time()
    frame_count = 0

    try:
        while session_id in active_connections:
            frame_start = asyncio.get_event_loop().time()

            # Generate frame using the WORKING audio engine
            frame = await audio_engine.generate_frame(session_id)

            if frame and "error" not in frame:
                # Send frame - simple and direct
                await websocket.send_json({
                    "type": "frame",
                    "data": {"audio": frame},  # Match frontend expectation
                    "timestamp": frame_start,
                    "frame_count": frame_count
                })

            # Precise 60 FPS timing (KEEP - this works)
            frame_count +=  1
            next_frame_time = start_time + (frame_count * frame_duration)
            current_time = asyncio.get_event_loop().time()
            sleep_time = next_frame_time - current_time

            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
            elif sleep_time < -0.002:  # 2ms drift warning
                logger.warning(f"Frame timing drift: {sleep_time*1000:.1f}ms")

    except Exception as e:
        logger.error(f"Audio streaming error for session {session_id}: {e}")

@router.websocket("/ws/audio/{session_id}")
async def websocket_audio_endpoint(websocket: WebSocket, session_id: str):
    """SIMPLIFIED WebSocket endpoint - NO OVERCOMPLICATED BULLSHIT"""
    logger.info(f"🔌 WebSocket connection: {session_id}")

    await websocket.accept()
    active_connections[session_id] = websocket

    audio_task = None

    try:
        # Handle incoming messages - SIMPLIFIED
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
                message = json.loads(data)
                audio_task = await handle_message(message, session_id, websocket, audio_task)

            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"Message error: {e}")
                break

    except WebSocketDisconnect:
        logger.info(f"Client {session_id} disconnected")
    finally:
        # Cleanup - simple and direct
        if audio_task and not audio_task.done():
            audio_task.cancel()

        if session_id in active_connections:
            del active_connections[session_id]

        # Stop audio session - NO session mapping needed
        audio_engine.stop_session(session_id)
        logger.info(f"🛑 Cleaned up session: {session_id}")

async def handle_message(message: dict, session_id: str, websocket: WebSocket, audio_task=None):
    """SIMPLIFIED message handling - cut the fat"""
    message_type = message.get("type")

    try:
        if message_type in ["start_session", "start_stream"]:
            # Get settings from message
            settings = message.get("data", {}).get("settings", {}) if message.get("data") else message.get("settings", {})

            # Validate settings using WORKING audio engine
            validated_settings = audio_engine.validate_frequencies(settings)

            # Configure session directly - NO session ID mapping needed
            audio_engine.configure(session_id, validated_settings)

            logger.info(f"🎵 Session configured: {session_id} with {validated_settings}")

            # Start streaming task
            if not audio_task or audio_task.done():
                audio_task = asyncio.create_task(stream_audio_frames(websocket, session_id))
                logger.info(f"▶️ Started streaming for {session_id}")

            # Confirm session started
            await websocket.send_text(json.dumps({
                "type": "session_started",
                "session_id": session_id,
                "settings": validated_settings
            }))

        elif message_type in ["stop_session", "stop_stream"]:
            # Stop streaming
            if audio_task and not audio_task.done():
                audio_task.cancel()
                audio_task = None

            # Stop audio engine session
            audio_engine.stop_session(session_id)

            await websocket.send_text(json.dumps({
                "type": "session_stopped",
                "session_id": session_id
            }))

        elif message_type == "update_settings":
            # Update settings - direct and simple
            settings = message.get("settings", {})
            validated_settings = audio_engine.validate_frequencies(settings)
            audio_engine.update_settings(session_id, validated_settings)

            await websocket.send_text(json.dumps({
                "type": "settings_updated",
                "settings": validated_settings
            }))

        elif message_type == "enable_spatial":
            # Enable 8D spatial audio - KEEP this working feature
            spatial_settings = message.get("spatial_settings", {})
            spatial_processor.configure_session(session_id, spatial_settings)

            audio_engine.update_settings(session_id, {
                "spatial_enabled": True,
                "spatial_settings": spatial_settings
            })

            await websocket.send_text(json.dumps({
                "type": "spatial_enabled",
                "settings": spatial_settings
            }))

        elif message_type == "disable_spatial":
            # Disable spatial audio
            audio_engine.update_settings(session_id, {"spatial_enabled": False})

            await websocket.send_text(json.dumps({
                "type": "spatial_disabled"
            }))

        elif message_type == "load_protocol":
            # Load ADHD protocol
            protocol_type = message.get("protocol", "focus")
            protocol_config = audio_engine.create_adhd_protocol(protocol_type)

            # Configure session with protocol
            audio_engine.configure(session_id, protocol_config)

            # Start streaming if not already running
            if not audio_task or audio_task.done():
                audio_task = asyncio.create_task(stream_audio_frames(websocket, session_id))

            await websocket.send_text(json.dumps({
                "type": "protocol_loaded",
                "protocol": protocol_type,
                "config": protocol_config,
                "session_id": session_id
            }))

        elif message_type == "get_metrics":
            # Get session metrics
            metrics = audio_engine.get_session_metrics(session_id)
            await websocket.send_text(json.dumps({
                "type": "metrics",
                "data": metrics
            }))

        elif message_type == "configure":
            # Configure session settings
            settings = message.get("settings", {})
            validated_settings = audio_engine.validate_frequencies(settings)
            audio_engine.configure(session_id, validated_settings)

            await websocket.send_text(json.dumps({
                "type": "configured",
                "settings": validated_settings
            }))

        else:
            logger.warning(f"Unknown message type: {message_type}")

    except Exception as e:
        logger.error(f"Error handling {message_type}: {e}")
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": str(e)
        }))

    return audio_task

# Keep the status endpoints - they're useful
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