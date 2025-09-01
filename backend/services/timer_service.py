"""
Timer service for managing frequency transitions and scheduled sessions.

Handles timer preset management, session tracking, and automated frequency transitions.
"""

import asyncio
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from fastapi import HTTPException
import json
import logging

from ..schemas.timer_schemas import (
    TimerPreset, TimerSession, FrequencyTransition, TimerStatusResponse,
    FREE_PRESETS, PREMIUM_PRESETS, FrequencyType
)

logger = logging.getLogger(__name__)


class TimerService:
    """
    Service for managing timer sessions and frequency transitions.
    """
    
    def __init__(self):
        """Initialize timer service with presets and active sessions."""
        self.active_sessions: Dict[str, TimerSession] = {}
        self.session_tasks: Dict[str, asyncio.Task] = {}
        self.presets: Dict[str, TimerPreset] = {}
        self._initialize_presets()
    
    def _initialize_presets(self) -> None:
        """Initialize default presets."""
        # Add free presets
        for i, preset in enumerate(FREE_PRESETS):
            preset_id = f"free_{i+1}"
            self.presets[preset_id] = preset
        
        # Add premium presets
        for i, preset in enumerate(PREMIUM_PRESETS):
            preset_id = f"premium_{i+1}"
            self.presets[preset_id] = preset
        
        logger.info(f"Initialized {len(self.presets)} timer presets")
    
    def get_available_presets(self, is_subscriber: bool = False) -> List[Dict]:
        """
        Get available presets based on subscription status.
        
        Args:
            is_subscriber: Whether user has active subscription
            
        Returns:
            List of available presets with subscription info
        """
        available_presets = []
        
        for preset_id, preset in self.presets.items():
            preset_data = {
                "id": preset_id,
                "name": preset.name,
                "description": preset.description,
                "total_duration": preset.calculate_total_duration(),
                "transitions_count": len(preset.transitions),
                "tags": preset.tags,
                "is_premium": preset.is_premium,
                "available": not preset.is_premium or is_subscriber
            }
            
            # Add upgrade message for non-subscribers viewing premium content
            if preset.is_premium and not is_subscriber:
                preset_data["upgrade_message"] = (
                    f"🔒 Unlock '{preset.name}' and 3+ more advanced presets with Premium! "
                    f"Get unlimited custom timers, extended sessions, and exclusive protocols."
                )
            
            available_presets.append(preset_data)
        
        return available_presets
    
    def create_custom_preset(
        self, 
        preset: TimerPreset, 
        user_id: str, 
        is_subscriber: bool = False
    ) -> str:
        """
        Create custom timer preset.
        
        Args:
            preset: Timer preset data
            user_id: User creating the preset
            is_subscriber: Whether user has subscription
            
        Returns:
            Created preset ID
            
        Raises:
            HTTPException: If user doesn't have permission
        """
        # Check subscription limits
        user_presets = [p for pid, p in self.presets.items() if pid.startswith(f"user_{user_id}")]
        
        if not is_subscriber and len(user_presets) >= 2:
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "Free users limited to 2 custom presets",
                    "upgrade_message": (
                        "🚀 Upgrade to Premium for unlimited custom presets! "
                        "Create up to 50 personalized timer sequences with advanced features."
                    )
                }
            )
        
        if is_subscriber and len(user_presets) >= 50:
            raise HTTPException(
                status_code=403,
                detail="Maximum 50 custom presets reached"
            )
        
        # Validate transition count for free users
        if not is_subscriber and len(preset.transitions) > 3:
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "Free users limited to 3 transitions per preset",
                    "upgrade_message": (
                        "✨ Premium users get up to 10 transitions per preset! "
                        "Create complex multi-stage sessions for advanced protocols."
                    )
                }
            )
        
        # Create preset ID and store
        preset_id = f"user_{user_id}_{uuid.uuid4().hex[:8]}"
        preset.total_duration = preset.calculate_total_duration()
        self.presets[preset_id] = preset
        
        logger.info(f"Created custom preset {preset_id} for user {user_id}")
        return preset_id
    
    async def start_timer_session(
        self, 
        preset_id: str, 
        user_id: str,
        is_subscriber: bool = False
    ) -> Tuple[str, TimerStatusResponse]:
        """
        Start new timer session.
        
        Args:
            preset_id: ID of preset to use
            user_id: User starting the session
            is_subscriber: Whether user has subscription
            
        Returns:
            Tuple of (session_id, status_response)
            
        Raises:
            HTTPException: If preset not found or not accessible
        """
        # Validate preset access
        if preset_id not in self.presets:
            raise HTTPException(status_code=404, detail="Preset not found")
        
        preset = self.presets[preset_id]
        
        if preset.is_premium and not is_subscriber:
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "Premium preset requires subscription",
                    "upgrade_message": (
                        f"🔒 '{preset.name}' is a Premium preset! "
                        f"Upgrade now for access to all advanced protocols and unlimited usage."
                    )
                }
            )
        
        # Stop any existing session for this user
        existing_session = next(
            (s for s in self.active_sessions.values() if s.user_id == user_id), 
            None
        )
        if existing_session:
            await self.stop_timer_session(existing_session.session_id)
        
        # Create new session
        session_id = str(uuid.uuid4())
        session = TimerSession(
            session_id=session_id,
            preset_id=preset_id,
            user_id=user_id,
            start_time=datetime.utcnow().isoformat(),
            current_transition_index=0,
            elapsed_minutes=0,
            is_active=True,
            is_paused=False
        )
        
        self.active_sessions[session_id] = session
        
        # Start session task
        task = asyncio.create_task(self._run_timer_session(session_id))
        self.session_tasks[session_id] = task
        
        status = self.get_session_status(session_id)
        
        logger.info(f"Started timer session {session_id} for user {user_id} with preset {preset_id}")
        return session_id, status
    
    async def _run_timer_session(self, session_id: str) -> None:
        """
        Run timer session with automatic transitions.
        
        Args:
            session_id: Session to run
        """
        try:
            session = self.active_sessions[session_id]
            preset = self.presets[session.preset_id]
            
            while session.is_active and session.current_transition_index < len(preset.transitions):
                current_transition = preset.transitions[session.current_transition_index]
                
                # Run transition for specified duration
                transition_start = datetime.utcnow()
                duration_seconds = current_transition.duration_minutes * 60
                
                logger.info(
                    f"Session {session_id}: Starting transition {session.current_transition_index + 1}"
                    f" - {current_transition.frequency_type.value} {current_transition.frequency_hz}Hz "
                    f"for {current_transition.duration_minutes} minutes"
                )
                
                while session.is_active and not session.is_paused:
                    elapsed = (datetime.utcnow() - transition_start).total_seconds()
                    
                    if elapsed >= duration_seconds:
                        break
                    
                    # Update elapsed time
                    session.elapsed_minutes = int(elapsed / 60)
                    
                    # Wait 1 second before next check
                    await asyncio.sleep(1)
                
                # Move to next transition if session still active
                if session.is_active:
                    session.current_transition_index += 1
                    session.elapsed_minutes = 0
            
            # Session completed
            if session.is_active:
                logger.info(f"Timer session {session_id} completed successfully")
                session.is_active = False
                
        except Exception as e:
            logger.error(f"Error in timer session {session_id}: {e}")
            if session_id in self.active_sessions:
                self.active_sessions[session_id].is_active = False
        finally:
            # Clean up
            if session_id in self.session_tasks:
                del self.session_tasks[session_id]
    
    async def pause_timer_session(self, session_id: str) -> TimerStatusResponse:
        """Pause timer session."""
        if session_id not in self.active_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = self.active_sessions[session_id]
        session.is_paused = True
        
        logger.info(f"Paused timer session {session_id}")
        return self.get_session_status(session_id)
    
    async def resume_timer_session(self, session_id: str) -> TimerStatusResponse:
        """Resume paused timer session."""
        if session_id not in self.active_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = self.active_sessions[session_id]
        session.is_paused = False
        
        logger.info(f"Resumed timer session {session_id}")
        return self.get_session_status(session_id)
    
    async def stop_timer_session(self, session_id: str) -> None:
        """Stop timer session."""
        if session_id in self.active_sessions:
            self.active_sessions[session_id].is_active = False
            del self.active_sessions[session_id]
        
        if session_id in self.session_tasks:
            task = self.session_tasks[session_id]
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
            del self.session_tasks[session_id]
        
        logger.info(f"Stopped timer session {session_id}")
    
    def get_session_status(self, session_id: str) -> TimerStatusResponse:
        """
        Get current session status.
        
        Args:
            session_id: Session to check
            
        Returns:
            Current session status
            
        Raises:
            HTTPException: If session not found
        """
        if session_id not in self.active_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = self.active_sessions[session_id]
        preset = self.presets[session.preset_id]
        
        # Current transition
        current_transition = None
        next_transition = None
        time_remaining_current = 0
        
        if session.current_transition_index < len(preset.transitions):
            current_transition = preset.transitions[session.current_transition_index]
            time_remaining_current = current_transition.duration_minutes - session.elapsed_minutes
            
            # Next transition
            next_index = session.current_transition_index + 1
            if next_index < len(preset.transitions):
                next_transition = preset.transitions[next_index]
        
        # Total time remaining
        time_remaining_total = time_remaining_current
        for i in range(session.current_transition_index + 1, len(preset.transitions)):
            time_remaining_total += preset.transitions[i].duration_minutes
        
        return TimerStatusResponse(
            session=session,
            current_transition=current_transition,
            next_transition=next_transition,
            time_remaining_current=max(0, time_remaining_current),
            time_remaining_total=max(0, time_remaining_total),
            subscription_required=preset.is_premium
        )
    
    def get_user_active_session(self, user_id: str) -> Optional[TimerStatusResponse]:
        """Get user's active session if any."""
        for session_id, session in self.active_sessions.items():
            if session.user_id == user_id and session.is_active:
                return self.get_session_status(session_id)
        return None


# Global timer service instance
timer_service = TimerService()