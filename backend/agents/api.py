"""
FastAPI routes for the Audio Agent system.
"""

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import json
import logging
import time

from .audio_agent import AudioAgent
from .models import AudioSessionConfig, AudioAnalysis
from .examples_integration import get_examples_integrator
from .state_manager import get_audio_agent_state_manager, AgentStatus

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/agents/audio", tags=["audio-agent"])

# Global audio agent instance
audio_agent: Optional[AudioAgent] = None

class AudioRequest(BaseModel):
    type: str  # binaural, isochronic, em_field, analysis
    config: Dict[str, Any]
    session_id: Optional[str] = None

class AudioResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

# Audio agent initialized in main.py startup event

@router.get("/status")
async def get_status():
    """Get audio agent status."""
    if not audio_agent:
        raise HTTPException(status_code=503, detail="Audio agent not initialized")

    return {
        "status": "running" if audio_agent.engine_state.is_initialized else "stopped",
        "engine_state": audio_agent.engine_state.dict(),
        "active_sessions": len(audio_agent.active_sessions),
        "available_patterns": len(audio_agent.frequency_cache)
    }

@router.post("/generate", response_model=AudioResponse)
async def generate_audio(request: AudioRequest):
    """Generate audio based on request parameters."""
    if not audio_agent:
        raise HTTPException(status_code=503, detail="Audio agent not initialized")

    state_manager = get_audio_agent_state_manager()
    session_id = request.session_id or f"api-session-{int(time.time())}"

    try:
        # Create or get session state
        session_state = await state_manager.get_session_state(session_id)
        if not session_state:
            session_state = await state_manager.create_session(session_id)

        # Update agent status to generating
        await state_manager.set_agent_status(session_id, AgentStatus.GENERATING)

        # Update audio configuration in state
        config_updates = {
            'type': request.type,
            'base_frequency': request.config.get('base_frequency', 200),
            'beat_frequency': request.config.get('beat_frequency', 10),
            'amplitude': request.config.get('amplitude', 0.5),
            'duration': request.config.get('duration', 60)
        }
        await state_manager.update_audio_config(session_id, config_updates)

        # Process audio request
        analysis = await audio_agent.process_audio_request({
            "type": request.type,
            "config": request.config,
            "session_id": session_id
        })

        # Update metrics with analysis results
        metrics_updates = {
            'quality_score': analysis.quality_score,
            'current_frequency_left': getattr(analysis, 'dominant_frequency', 0) - (getattr(analysis, 'beat_frequency', 0) / 2),
            'current_frequency_right': getattr(analysis, 'dominant_frequency', 0) + (getattr(analysis, 'beat_frequency', 0) / 2),
            'actual_beat_frequency': getattr(analysis, 'beat_frequency', 0),
            'is_playing': True
        }
        await state_manager.update_audio_metrics(session_id, metrics_updates)

        # Update agent status to idle
        await state_manager.set_agent_status(session_id, AgentStatus.IDLE)

        return AudioResponse(
            success=True,
            data=analysis.dict()
        )

    except Exception as e:
        logger.error(f"Error generating audio: {e}")
        await state_manager.set_agent_status(session_id, AgentStatus.ERROR, str(e))
        return AudioResponse(
            success=False,
            error=str(e)
        )

@router.get("/patterns")
async def get_patterns():
    """Get available frequency patterns."""
    integrator = get_examples_integrator()
    return {
        "frequency_presets": integrator.get_frequency_presets(),
        "binaural_patterns": integrator.get_binaural_patterns(),
        "em_field_patterns": integrator.get_em_field_patterns(),
        "adhd_protocols": integrator.get_adhd_protocol_patterns()
    }

@router.get("/examples")
async def get_examples():
    """Get all integrated example patterns."""
    integrator = get_examples_integrator()
    return integrator.get_all_patterns()

@router.post("/optimize/{target}")
async def optimize_pattern(target: str):
    """Optimize frequency pattern for specific target."""
    if not audio_agent:
        raise HTTPException(status_code=503, detail="Audio agent not initialized")

    try:
        optimized = await audio_agent.optimize_patterns(target)
        return {
            "success": True,
            "optimized_pattern": optimized.dict()
        }
    except Exception as e:
        logger.error(f"Error optimizing pattern: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions")
async def get_active_sessions():
    """Get active audio processing sessions."""
    if not audio_agent:
        raise HTTPException(status_code=503, detail="Audio agent not initialized")

    # Get both Audio Agent sessions and state manager sessions
    agent_sessions = await audio_agent.get_active_sessions()
    state_manager = get_audio_agent_state_manager()
    state_sessions = await state_manager.get_all_sessions_state()

    return {
        "agent_sessions": agent_sessions,
        "state_sessions": state_sessions,
        "total_sessions": len(agent_sessions) + len(state_sessions)
    }

@router.get("/state/{session_id}")
async def get_session_state(session_id: str):
    """Get complete state for a specific session."""
    state_manager = get_audio_agent_state_manager()
    session_state = await state_manager.get_session_state(session_id)

    if not session_state:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": session_id,
        "is_connected": session_state.is_connected,
        "is_initialized": session_state.is_initialized,
        "agent_status": session_state.agent_status.value,
        "error_message": session_state.error_message,
        "audio_config": {
            "type": session_state.audio_config.type,
            "base_frequency": session_state.audio_config.base_frequency,
            "beat_frequency": session_state.audio_config.beat_frequency,
            "amplitude": session_state.audio_config.amplitude,
            "duration": session_state.audio_config.duration,
            "sample_rate": session_state.audio_config.sample_rate
        },
        "audio_metrics": {
            "is_playing": session_state.audio_metrics.is_playing,
            "current_frequency_left": session_state.audio_metrics.current_frequency_left,
            "current_frequency_right": session_state.audio_metrics.current_frequency_right,
            "actual_beat_frequency": session_state.audio_metrics.actual_beat_frequency,
            "quality_score": session_state.audio_metrics.quality_score,
            "buffer_health": session_state.audio_metrics.buffer_health.value,
            "buffer_ms": session_state.audio_metrics.buffer_ms,
            "underruns": session_state.audio_metrics.underruns
        },
        "engine_state": {
            "active_generators": session_state.engine_state.active_generators,
            "cpu_usage": session_state.engine_state.cpu_usage,
            "memory_usage": session_state.engine_state.memory_usage,
            "stream_rate": session_state.engine_state.stream_rate,
            "chunk_size": session_state.engine_state.chunk_size,
            "error_count": session_state.engine_state.error_count
        },
        "last_update": session_state.last_update
    }

@router.websocket("/stream")
async def websocket_audio_stream(websocket: WebSocket):
    """WebSocket endpoint for real-time audio streaming with state management."""
    await websocket.accept()

    if not audio_agent:
        await websocket.send_text(json.dumps({
            "error": "Audio agent not initialized"
        }))
        await websocket.close()
        return

    state_manager = get_audio_agent_state_manager()
    session_id = f"ws-session-{int(time.time())}-{id(websocket)}"

    try:
        # Create session with WebSocket connection
        session_state = await state_manager.create_session(session_id, websocket)

        # Send initial state
        await websocket.send_text(json.dumps({
            "type": "session_created",
            "session_id": session_id,
            "initialized": True,
            "timestamp": time.time()
        }))

        logger.info(f"Audio Agent WebSocket connected: {session_id}")

        while True:
            # Receive streaming request
            data = await websocket.receive_text()
            request_data = json.loads(data)

            message_type = request_data.get("type")

            if message_type == "generate_audio":
                # Handle audio generation request
                config = request_data.get("data", {}).get("config", {})

                await state_manager.set_agent_status(session_id, AgentStatus.GENERATING)

                # Update configuration
                config_updates = {
                    'type': config.get('type', 'binaural'),
                    'base_frequency': config.get('base_frequency', 200),
                    'beat_frequency': config.get('beat_frequency', 10),
                    'amplitude': config.get('amplitude', 0.5),
                    'duration': config.get('duration', 60)
                }
                await state_manager.update_audio_config(session_id, config_updates)

                # Process with Audio Agent
                try:
                    analysis = await audio_agent.process_audio_request({
                        "type": config.get('type', 'binaural'),
                        "config": config,
                        "session_id": session_id
                    })

                    # Update metrics
                    metrics_updates = {
                        'quality_score': analysis.quality_score,
                        'is_playing': True,
                        'current_frequency_left': getattr(analysis, 'dominant_frequency', 0) - (getattr(analysis, 'beat_frequency', 0) / 2),
                        'current_frequency_right': getattr(analysis, 'dominant_frequency', 0) + (getattr(analysis, 'beat_frequency', 0) / 2),
                        'actual_beat_frequency': getattr(analysis, 'beat_frequency', 0)
                    }
                    await state_manager.update_audio_metrics(session_id, metrics_updates)

                    await state_manager.set_agent_status(session_id, AgentStatus.STREAMING)

                except Exception as e:
                    await state_manager.set_agent_status(session_id, AgentStatus.ERROR, str(e))

            elif message_type == "stop_audio":
                # Handle stop request
                await state_manager.set_agent_status(session_id, AgentStatus.IDLE)
                metrics_updates = {'is_playing': False}
                await state_manager.update_audio_metrics(session_id, metrics_updates)

            elif message_type == "update_config":
                # Handle configuration update
                config_updates = request_data.get("data", {})
                await state_manager.update_audio_config(session_id, config_updates)

            elif message_type == "get_state":
                # Send current state
                session_state = await state_manager.get_session_state(session_id)
                if session_state:
                    await websocket.send_text(json.dumps({
                        "type": "state_response",
                        "data": {
                            "agent_status": session_state.agent_status.value,
                            "audio_config": session_state.audio_config.__dict__,
                            "audio_metrics": session_state.audio_metrics.__dict__,
                            "engine_state": session_state.engine_state.__dict__
                        },
                        "timestamp": time.time()
                    }))

    except WebSocketDisconnect:
        logger.info(f"Audio Agent WebSocket disconnected: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error for session {session_id}: {e}")
    finally:
        # Cleanup session
        await state_manager.remove_session(session_id)

# Health check for the agent
@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "agent_initialized": audio_agent is not None,
        "timestamp": "2024-01-01T00:00:00Z"
    }