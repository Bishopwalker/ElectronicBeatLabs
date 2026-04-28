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
from core.frame_buffer import FrameBuffer
from modules.spatial_audio import SpatialAudioProcessor

logger = logging.getLogger(__name__)

router = APIRouter()

# Global instances - Use 48kHz to match user's system
audio_engine = AudioEngine(sample_rate=48000)
spatial_processor = SpatialAudioProcessor(sample_rate=48000)
audio_engine.set_spatial_processor(spatial_processor)

# Track active connections
active_connections: Dict[str, WebSocket] = {}
active_sessions: Set[str] = set()
# Track WebSocket session ID to audio engine session ID mapping
websocket_to_audio_session: Dict[str, str] = {}
# Track frame buffers for each session (NEW: for zero-lag frame delivery)
session_frame_buffers: Dict[str, FrameBuffer] = {}

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
            # 🔥 NEW: Stop and cleanup frame buffer
            if audio_engine_session_id in session_frame_buffers:
                buffer = session_frame_buffers[audio_engine_session_id]
                asyncio.create_task(buffer.stop())
                del session_frame_buffers[audio_engine_session_id]
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

async def stream_audio_frames(websocket: WebSocket, session_id: str, use_binary: bool = True):
    """Stream audio frames to client at precise 60 FPS with zero lag

    Args:
        websocket: WebSocket connection
        session_id: Unique session identifier (audio engine session ID)
        use_binary: If True, use binary WebSocket frames (50% smaller, faster)
    """
    logger.info(f"🎥 STREAM START: Beginning audio stream for session {session_id[:8]}... (binary={use_binary})")
    target_fps = 60
    frame_duration = 1.0 / target_fps  # 16.666ms target

    # 🔥 NEW: Get or create frame buffer for this session
    if session_id not in session_frame_buffers:
        frame_buffer = FrameBuffer(
            audio_engine,
            session_id,
            target_buffer_size=180  # 🔥 FIXED: 3 seconds (was 120) - matches frontend expectations
        )
        session_frame_buffers[session_id] = frame_buffer
        await frame_buffer.start()
        logger.info(f"🎬 FrameBuffer created and started for session {session_id[:8]}...")
    else:
        frame_buffer = session_frame_buffers[session_id]

    # Use time.perf_counter() for better precision than event loop time
    import time
    start_time = time.perf_counter()
    frame_count = 0
    next_frame_time = start_time

    # Performance tracking
    transmission_times = []

    try:
        while True:
            frame_start = time.perf_counter()

            # 🔥 NEW: Get pre-generated frame from buffer (instant, non-blocking!)
            frame = frame_buffer.get_frame()

            if frame:
                # Send frame to client
                if use_binary:
                    # Binary transmission: ~3.2KB vs ~6.4KB JSON (50% smaller)
                    await websocket.send_bytes(frame)
                else:
                    # Legacy JSON transmission (not used, frame_buffer only generates binary)
                    logger.warning("JSON mode not supported with FrameBuffer, using binary mode")
                    await websocket.send_bytes(frame)

                transmission_end = time.perf_counter()
                transmission_time = (transmission_end - frame_start) * 1000  # ms
                transmission_times.append(transmission_time)

                # Log performance every 5 seconds
                if frame_count % 300 == 0 and frame_count > 0:
                    avg_tx = sum(transmission_times[-300:]) / min(len(transmission_times), 300)
                    buffer_status = frame_buffer.get_buffer_status()
                    logger.info(
                        f"📊 Stream Stats [{session_id[:8]}]: "
                        f"Frame={frame_count}, "
                        f"TxTime={avg_tx:.2f}ms, "
                        f"Buffer={buffer_status['buffer_size']}/{buffer_status['target_size']} "
                        f"({buffer_status['buffer_percent']:.0f}%)"
                    )

            frame_count += 1
            next_frame_time = start_time + (frame_count * frame_duration)

            # Calculate precise sleep time to maintain 60 FPS
            current_time = time.perf_counter()
            sleep_time = next_frame_time - current_time

            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
            elif sleep_time < -0.003:  # If more than 3ms behind, log warning
                avg_tx = sum(transmission_times[-10:]) / min(len(transmission_times), 10)
                logger.warning(
                    f"Frame timing drift: {sleep_time*1000:.1f}ms behind "
                    f"(tx={avg_tx:.1f}ms)"
                )

    except asyncio.CancelledError:
        logger.info(f"🛑 STREAM CANCELLED: Audio stream cancelled for session {session_id[:8]}...")
        raise
    except Exception as e:
        logger.error(f"❌ STREAM ERROR: Audio streaming error for session {session_id[:8]}...: {e}", exc_info=True)

@router.websocket("/ws/audio/{session_id}")
async def websocket_audio_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time audio streaming
    
    🔥 FIX: Frequencies come from WebSocket messages, NOT URL params!
    """
    logger.info(f"🔌 WebSocket connection attempt for session: {session_id}")
    await manager.connect(websocket, session_id)
    logger.info(f" WebSocket connected successfully for session: {session_id}")

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
            except json.JSONDecodeError as e:
                # Frontend sent malformed JSON (e.g., ping) - skip it and continue
                logger.warning(f"Received malformed JSON (possibly ping): {e}")
                continue
            except RuntimeError as e:
                # 🔥 FIX: Catch disconnect RuntimeError to prevent infinite loop
                if "disconnect message has been received" in str(e):
                    logger.info(f"WebSocket disconnect detected for {session_id}, exiting receive loop")
                    break  # Exit loop cleanly when client disconnects
                else:
                    logger.error(f"Runtime error processing message: {e}", exc_info=True)
                    continue
            except Exception as e:
                logger.error(f"Error processing message: {e}", exc_info=True)
                continue  # Continue for other errors to maintain connection

    except WebSocketDisconnect:
        logger.info(f"Client {session_id} disconnected")
    except Exception as e:
        logger.error(f"WebSocket error for {session_id}: {e}")
    finally:
        # Cancel audio streaming if still running
        if audio_task and not audio_task.done():
            audio_task.cancel()
            logger.info(f"Cancelled audio streaming for {session_id}")
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
    logger.info(f" RECEIVED MESSAGE: type={message_type}, session={session_id}")
    logger.info(f" MESSAGE DATA: {message}")

    try:
        if message_type == "start_session" or message_type == "start_stream":
            # Start audio session
            # CRITICAL FIX: Frontend sends data directly in 'data' key, not nested in 'data.settings'
            # Accept both formats for compatibility:
            # Format 1: {"data": {"base_frequency": 144, ...}}  ← New format
            # Format 2: {"data": {"settings": {"base_frequency": 144, ...}}}  ← Old format
            # Format 3: {"settings": {"base_frequency": 144, ...}}  ← Alternative format

            # 🔥 DEBUG: Log the entire incoming message
            logger.info(f"[WEBSOCKET DEBUG] Full message received: {message}")

            message_data = message.get("data", {})
            logger.info(f"[WEBSOCKET DEBUG] Extracted message_data: {message_data}")

            # 🔥 CRITICAL FIX: Properly extract settings from any format
            if isinstance(message_data, dict):
                if "settings" in message_data:
                    # Old nested format: {"data": {"settings": {...}}}
                    settings = message_data["settings"]
                    logger.info(f"[WEBSOCKET DEBUG] Using nested format settings from message_data['settings']")
                elif "base_frequency" in message_data or "beat_frequency" in message_data:
                    # New direct format: {"data": {"base_frequency": 144, ...}}
                    settings = message_data
                    logger.info(f"[WEBSOCKET DEBUG] Using direct format settings from message_data")
                else:
                    # Fallback to root-level settings or empty dict
                    settings = message.get("settings", {})
                    logger.info(f"[WEBSOCKET DEBUG] Using fallback format settings from message['settings']")
            else:
                # Fallback for non-dict data
                settings = message.get("settings", {})
                logger.info(f"[WEBSOCKET DEBUG] Data is not a dict, using fallback settings")
            
            # 🔥 ENSURE DEFAULTS: If frequency params are missing, add defaults
            if "base_frequency" not in settings:
                settings["base_frequency"] = 140
                logger.warning(f"[WEBSOCKET DEBUG] base_frequency missing, using default: 140")
            if "beat_frequency" not in settings:
                settings["beat_frequency"] = 4
                logger.warning(f"[WEBSOCKET DEBUG] beat_frequency missing, using default: 4")

            logger.info(f"[FREQUENCY SYNC] RAW settings extracted: {settings}")
            validated_settings = audio_engine.validate_frequencies(settings)
            logger.info(f"[FREQUENCY SYNC] VALIDATED settings after validation: {validated_settings}")
            audio_engine_session_id = audio_engine.start_session(validated_settings)

            # Store the mapping between WebSocket session ID and audio engine session ID
            websocket_to_audio_session[session_id] = audio_engine_session_id
            logger.info(f" Audio session started: WebSocket={session_id}, AudioEngine={audio_engine_session_id}")
            logger.info(f"🗂 Current session mappings: {websocket_to_audio_session}")
            logger.info(f" AudioEngine active sessions: {list(audio_engine.sessions.keys())}")

            # Start audio streaming task with binary mode enabled
            if websocket:
                # Cancel existing task if running
                if audio_task and not audio_task.done():
                    audio_task.cancel()
                    logger.info(f" Cancelled previous audio streaming task")

                # Use binary transmission by default (50% payload reduction)
                use_binary = settings.get("use_binary", True)
                audio_task = asyncio.create_task(stream_audio_frames(websocket, audio_engine_session_id, use_binary=use_binary))
                logger.info(f"🎵 Started audio streaming task for session {audio_engine_session_id} (binary={use_binary})")

            await manager.send_personal_message({
                "type": "session_started",
                "session_id": audio_engine_session_id,
                "settings": validated_settings
            }, session_id)
        
        elif message_type == "stop_session" or message_type == "stop_stream":
            # Stop audio session using correct audio engine session ID
            if session_id in websocket_to_audio_session:
                audio_engine_session_id = websocket_to_audio_session[session_id]

                # 🔥 FIX: Cancel audio streaming task BEFORE stopping the session
                # This prevents "Session not found" errors from generate_frame
                if audio_task and not audio_task.done():
                    audio_task.cancel()
                    logger.info(f"🛑 Cancelled audio streaming task for session {audio_engine_session_id[:8]}...")
                    try:
                        await audio_task
                    except asyncio.CancelledError:
                        pass  # Expected when cancelling
                    audio_task = None

                # 🔥 FIX: Stop and cleanup frame buffer BEFORE stopping engine session
                if audio_engine_session_id in session_frame_buffers:
                    buffer = session_frame_buffers[audio_engine_session_id]
                    await buffer.stop()
                    del session_frame_buffers[audio_engine_session_id]
                    logger.info(f"🧹 Cleaned up frame buffer for session {audio_engine_session_id[:8]}...")

                # Now safe to stop the audio engine session
                audio_engine.stop_session(audio_engine_session_id)
                del websocket_to_audio_session[session_id]
                logger.info(f"✅ Session {audio_engine_session_id[:8]}... fully stopped and cleaned up")
            await manager.send_personal_message({
                "type": "session_stopped",
                "session_id": session_id
            }, session_id)
        
        elif message_type == "update_settings":
            # Update session settings
            # 🔥 FIX: Handle both direct and nested settings formats
            message_data = message.get("data", {})
            if isinstance(message_data, dict) and ("base_frequency" in message_data or "beat_frequency" in message_data):
                # Settings are in data directly
                settings = message_data
                logger.info(f"[🔥 FREQUENCY UPDATE] Settings found in 'data': {settings}")
            elif "settings" in message:
                # Settings at root level
                settings = message["settings"]
                logger.info(f"[🔥 FREQUENCY UPDATE] Settings found at root: {settings}")
            else:
                # Default empty settings
                settings = {}
                logger.warning(f"[🔥 FREQUENCY UPDATE] No settings found in message: {message}")
            
            logger.info(f"[UPDATE_SETTINGS] Extracted settings: {settings}")
            validated_settings = audio_engine.validate_frequencies(settings)

            # Use audio engine session ID if mapped
            target_session_id = websocket_to_audio_session.get(session_id, session_id)
            audio_engine.update_settings(target_session_id, validated_settings)

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
            target_session_id = websocket_to_audio_session.get(session_id, session_id)
            metrics = audio_engine.get_session_metrics(target_session_id)
            await manager.send_personal_message({
                "type": "metrics",
                "data": metrics
            }, session_id)
        
        elif message_type == "enable_spatial":
            # Enable 8D spatial audio
            spatial_settings = message.get("spatial_settings", {})
            target_session_id = websocket_to_audio_session.get(session_id, session_id)

            spatial_processor.configure_session(target_session_id, spatial_settings)

            # Update session to enable spatial audio
            audio_engine.update_settings(target_session_id, {
                "spatial_enabled": True,
                "spatial_settings": spatial_settings
            })

            await manager.send_personal_message({
                "type": "spatial_enabled",
                "settings": spatial_settings
            }, session_id)
        
        elif message_type == "disable_spatial":
            # Disable 8D spatial audio
            target_session_id = websocket_to_audio_session.get(session_id, session_id)
            audio_engine.update_settings(target_session_id, {"spatial_enabled": False})

            await manager.send_personal_message({
                "type": "spatial_disabled"
            }, session_id)

        elif message_type == "configure":
            # Configure session settings
            settings = message.get("settings", {})
            validated_settings = audio_engine.validate_frequencies(settings)

            # Use audio engine session ID if mapped
            target_session_id = websocket_to_audio_session.get(session_id, session_id)
            audio_engine.configure(target_session_id, validated_settings)

            await manager.send_personal_message({
                "type": "configured",
                "settings": validated_settings
            }, session_id)

        elif message_type == "timer_update":
            # Timer updates from frontend - just acknowledge, no action needed
            logger.debug(f"Timer update received for session {session_id}")
            # Optionally send acknowledgment
            # await manager.send_personal_message({"type": "timer_ack"}, session_id)

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