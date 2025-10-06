"""
Audio Agent State Management System.
Handles synchronized state between frontend and backend for the Audio Agent.
"""

import asyncio
import json
import logging
import time
from typing import Dict, Any, Optional, Set
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum

logger = logging.getLogger(__name__)


class AgentStatus(Enum):
    IDLE = "idle"
    GENERATING = "generating"
    STREAMING = "streaming"
    ERROR = "error"


class BufferHealth(Enum):
    GOOD = "good"
    WARNING = "warning"
    CRITICAL = "critical"


@dataclass
class AudioConfiguration:
    """Audio generation configuration."""
    type: str = "binaural"  # binaural, isochronic, em_field
    base_frequency: float = 200.0
    beat_frequency: float = 10.0
    amplitude: float = 0.5
    duration: float = 60.0
    sample_rate: int = 44100


@dataclass
class AudioMetrics:
    """Real-time audio metrics."""
    is_playing: bool = False
    current_frequency_left: float = 0.0
    current_frequency_right: float = 0.0
    actual_beat_frequency: float = 0.0
    quality_score: float = 0.0
    buffer_health: BufferHealth = BufferHealth.GOOD
    buffer_ms: float = 0.0
    underruns: int = 0
    last_update: float = 0.0


@dataclass
class EngineState:
    """Audio engine performance state."""
    active_generators: int = 0
    cpu_usage: float = 0.0
    memory_usage: float = 0.0
    stream_rate: int = 30
    chunk_size: int = 1024
    error_count: int = 0
    last_error: Optional[str] = None


@dataclass
class AudioAgentState:
    """Complete Audio Agent state."""
    # Connection info
    session_id: str = ""
    is_connected: bool = False
    is_initialized: bool = False
    last_update: float = 0.0

    # Status
    agent_status: AgentStatus = AgentStatus.IDLE
    error_message: Optional[str] = None

    # Configuration
    audio_config: AudioConfiguration = None

    # Real-time metrics
    audio_metrics: AudioMetrics = None

    # Engine performance
    engine_state: EngineState = None

    def __post_init__(self):
        if self.audio_config is None:
            self.audio_config = AudioConfiguration()
        if self.audio_metrics is None:
            self.audio_metrics = AudioMetrics()
        if self.engine_state is None:
            self.engine_state = EngineState()


class AudioAgentStateManager:
    """
    Manages synchronized state between frontend and backend for Audio Agent.
    """

    def __init__(self):
        self.states: Dict[str, AudioAgentState] = {}
        self.websocket_connections: Dict[str, Any] = {}  # session_id -> websocket
        self.state_update_callbacks: Set[callable] = set()
        self.metrics_update_interval = 1.0  # Update metrics every second

    async def create_session(self, session_id: str, websocket: Optional[Any] = None) -> AudioAgentState:
        """
        Create a new Audio Agent session with initial state.

        Args:
            session_id: Unique session identifier
            websocket: Optional WebSocket connection

        Returns:
            Initialized AudioAgentState
        """
        try:
            state = AudioAgentState(
                session_id=session_id,
                is_connected=websocket is not None,
                is_initialized=True,
                last_update=time.time()
            )

            self.states[session_id] = state

            if websocket:
                self.websocket_connections[session_id] = websocket
                await self._send_state_update(session_id, 'session_created', {
                    'session_id': session_id,
                    'initialized': True
                })

            logger.info(f"Created Audio Agent session: {session_id}")
            return state

        except Exception as e:
            logger.error(f"Error creating session {session_id}: {e}")
            raise

    async def get_session_state(self, session_id: str) -> Optional[AudioAgentState]:
        """Get current state for a session."""
        return self.states.get(session_id)

    async def update_audio_config(self, session_id: str, config: Dict[str, Any]) -> bool:
        """
        Update audio configuration for a session.

        Args:
            session_id: Session identifier
            config: Configuration updates

        Returns:
            True if successful
        """
        try:
            if session_id not in self.states:
                logger.warning(f"Session {session_id} not found")
                return False

            state = self.states[session_id]

            # Update configuration
            for key, value in config.items():
                if hasattr(state.audio_config, key):
                    setattr(state.audio_config, key, value)

            state.last_update = time.time()

            # Notify frontend of configuration change
            await self._send_state_update(session_id, 'config_updated', {
                'config': asdict(state.audio_config)
            })

            logger.info(f"Updated audio config for session {session_id}: {config}")
            return True

        except Exception as e:
            logger.error(f"Error updating config for session {session_id}: {e}")
            return False

    async def update_audio_metrics(self, session_id: str, metrics: Dict[str, Any]) -> bool:
        """
        Update real-time audio metrics for a session.

        Args:
            session_id: Session identifier
            metrics: Metrics to update

        Returns:
            True if successful
        """
        try:
            if session_id not in self.states:
                return False

            state = self.states[session_id]

            # Update metrics
            for key, value in metrics.items():
                if hasattr(state.audio_metrics, key):
                    setattr(state.audio_metrics, key, value)

            # Determine buffer health
            if state.audio_metrics.buffer_ms < 50:
                state.audio_metrics.buffer_health = BufferHealth.CRITICAL
            elif state.audio_metrics.buffer_ms < 100:
                state.audio_metrics.buffer_health = BufferHealth.WARNING
            else:
                state.audio_metrics.buffer_health = BufferHealth.GOOD

            state.audio_metrics.last_update = time.time()
            state.last_update = time.time()

            # Send metrics update to frontend
            await self._send_state_update(session_id, 'audio_metrics', {
                'is_playing': state.audio_metrics.is_playing,
                'buffer_health': state.audio_metrics.buffer_health.value,
                'buffer_ms': state.audio_metrics.buffer_ms,
                'underruns': state.audio_metrics.underruns,
                'quality_score': state.audio_metrics.quality_score,
                'current_frequency_left': state.audio_metrics.current_frequency_left,
                'current_frequency_right': state.audio_metrics.current_frequency_right,
                'actual_beat_frequency': state.audio_metrics.actual_beat_frequency
            })

            return True

        except Exception as e:
            logger.error(f"Error updating metrics for session {session_id}: {e}")
            return False

    async def update_engine_state(self, session_id: str, engine_data: Dict[str, Any]) -> bool:
        """
        Update engine performance state for a session.

        Args:
            session_id: Session identifier
            engine_data: Engine state data

        Returns:
            True if successful
        """
        try:
            if session_id not in self.states:
                return False

            state = self.states[session_id]

            # Update engine state
            for key, value in engine_data.items():
                if hasattr(state.engine_state, key):
                    setattr(state.engine_state, key, value)

            state.last_update = time.time()

            # Send engine state update
            await self._send_state_update(session_id, 'engine_state', {
                'active_generators': state.engine_state.active_generators,
                'cpu_usage': state.engine_state.cpu_usage,
                'memory_usage': state.engine_state.memory_usage,
                'stream_rate': state.engine_state.stream_rate,
                'chunk_size': state.engine_state.chunk_size,
                'error_count': state.engine_state.error_count
            })

            return True

        except Exception as e:
            logger.error(f"Error updating engine state for session {session_id}: {e}")
            return False

    async def set_agent_status(self, session_id: str, status: AgentStatus, error_message: Optional[str] = None) -> bool:
        """
        Set the agent status for a session.

        Args:
            session_id: Session identifier
            status: New agent status
            error_message: Optional error message

        Returns:
            True if successful
        """
        try:
            if session_id not in self.states:
                return False

            state = self.states[session_id]
            state.agent_status = status
            state.error_message = error_message
            state.last_update = time.time()

            # Notify frontend of status change
            await self._send_state_update(session_id, 'agent_status', {
                'status': status.value,
                'error': error_message,
                'timestamp': state.last_update
            })

            if status == AgentStatus.GENERATING:
                await self._send_state_update(session_id, 'generation_started', {})
            elif status == AgentStatus.IDLE:
                await self._send_state_update(session_id, 'generation_completed', {})

            logger.info(f"Updated agent status for session {session_id}: {status.value}")
            return True

        except Exception as e:
            logger.error(f"Error setting agent status for session {session_id}: {e}")
            return False

    async def remove_session(self, session_id: str) -> bool:
        """
        Remove a session and clean up resources.

        Args:
            session_id: Session identifier

        Returns:
            True if successful
        """
        try:
            if session_id in self.states:
                del self.states[session_id]

            if session_id in self.websocket_connections:
                del self.websocket_connections[session_id]

            logger.info(f"Removed Audio Agent session: {session_id}")
            return True

        except Exception as e:
            logger.error(f"Error removing session {session_id}: {e}")
            return False

    async def get_all_sessions_state(self) -> Dict[str, Dict[str, Any]]:
        """
        Get state summary for all active sessions.

        Returns:
            Dictionary with session state summaries
        """
        try:
            summary = {}

            for session_id, state in self.states.items():
                summary[session_id] = {
                    'session_id': session_id,
                    'is_connected': state.is_connected,
                    'agent_status': state.agent_status.value,
                    'is_playing': state.audio_metrics.is_playing,
                    'buffer_health': state.audio_metrics.buffer_health.value,
                    'last_update': state.last_update,
                    'config': {
                        'type': state.audio_config.type,
                        'base_frequency': state.audio_config.base_frequency,
                        'beat_frequency': state.audio_config.beat_frequency
                    }
                }

            return summary

        except Exception as e:
            logger.error(f"Error getting all sessions state: {e}")
            return {}

    async def _send_state_update(self, session_id: str, message_type: str, data: Dict[str, Any]):
        """
        Send state update to WebSocket client.

        Args:
            session_id: Session identifier
            message_type: Type of update message
            data: Update data
        """
        try:
            if session_id in self.websocket_connections:
                websocket = self.websocket_connections[session_id]

                message = {
                    'type': message_type,
                    'session_id': session_id,
                    'timestamp': time.time(),
                    'data': data
                }

                # Send via WebSocket if available
                if hasattr(websocket, 'send'):
                    await websocket.send(json.dumps(message))
                elif hasattr(websocket, 'send_json'):
                    await websocket.send_json(message)

        except Exception as e:
            logger.error(f"Error sending state update to session {session_id}: {e}")

    def add_state_update_callback(self, callback: callable):
        """Add a callback for state updates."""
        self.state_update_callbacks.add(callback)

    def remove_state_update_callback(self, callback: callable):
        """Remove a state update callback."""
        self.state_update_callbacks.discard(callback)


# Global state manager instance
audio_agent_state_manager = AudioAgentStateManager()

def get_audio_agent_state_manager() -> AudioAgentStateManager:
    """Get the global Audio Agent state manager."""
    return audio_agent_state_manager