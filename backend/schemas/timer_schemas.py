"""
Timer and frequency transition schemas for the Electromagnetic Beat Lab.

Defines data structures for timed frequency transitions and preset management.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class FrequencyType(str, Enum):
    """Brainwave frequency types."""
    DELTA = "delta"      # 0.5-4 Hz - Deep sleep
    THETA = "theta"      # 4-8 Hz - REM sleep, meditation
    ALPHA = "alpha"      # 8-12 Hz - Relaxed awareness
    BETA = "beta"        # 12-30 Hz - Normal waking consciousness
    GAMMA = "gamma"      # 25-100 Hz - High-level cognitive processing


class FrequencyTransition(BaseModel):
    """
    Represents a single frequency transition in a timer sequence.
    
    Args:
        duration_minutes: Duration in minutes for this frequency
        frequency_hz: Target frequency in Hz
        frequency_type: Type of brainwave frequency
        left_ear_hz: Left ear frequency (for binaural beats)
        right_ear_hz: Right ear frequency (for binaural beats)
        description: Optional description of this phase
    """
    duration_minutes: int = Field(gt=0, le=480, description="Duration in minutes (max 8 hours)")
    frequency_hz: float = Field(gt=0.1, le=100, description="Primary frequency in Hz")
    frequency_type: FrequencyType
    left_ear_hz: float = Field(gt=20, le=20000, description="Left ear frequency")
    right_ear_hz: float = Field(gt=20, le=20000, description="Right ear frequency")
    description: Optional[str] = Field(None, max_length=200, description="Phase description")


class TimerPreset(BaseModel):
    """
    Timer preset with multiple frequency transitions.
    
    Args:
        name: Preset name
        description: Preset description
        transitions: List of frequency transitions
        total_duration: Total duration in minutes (calculated)
        is_premium: Whether this preset requires subscription
        tags: Optional tags for categorization
    """
    name: str = Field(max_length=100, description="Preset name")
    description: str = Field(max_length=500, description="Preset description")
    transitions: List[FrequencyTransition] = Field(min_items=1, max_items=10)
    total_duration: Optional[int] = Field(None, description="Total duration (auto-calculated)")
    is_premium: bool = Field(default=False, description="Requires subscription")
    tags: List[str] = Field(default_factory=list, description="Categorization tags")
    
    def calculate_total_duration(self) -> int:
        """Calculate total duration from all transitions."""
        return sum(transition.duration_minutes for transition in self.transitions)


class CreatePresetRequest(BaseModel):
    """Request to create a new timer preset."""
    preset: TimerPreset


class TimerSession(BaseModel):
    """
    Active timer session tracking.
    
    Args:
        session_id: Unique session identifier
        preset_id: ID of the preset being used
        user_id: User running the session
        start_time: Session start timestamp
        current_transition_index: Current transition index
        elapsed_minutes: Minutes elapsed in current transition
        is_active: Whether session is currently running
        is_paused: Whether session is paused
    """
    session_id: str
    preset_id: Optional[str] = None
    user_id: str
    start_time: str  # ISO timestamp
    current_transition_index: int = Field(default=0, ge=0)
    elapsed_minutes: int = Field(default=0, ge=0)
    is_active: bool = Field(default=True)
    is_paused: bool = Field(default=False)


class TimerControlRequest(BaseModel):
    """Request to control timer session."""
    action: str = Field(pattern="^(start|pause|resume|stop|next|previous)$")
    session_id: Optional[str] = None
    preset_id: Optional[str] = None


class TimerStatusResponse(BaseModel):
    """Timer session status response."""
    session: Optional[TimerSession]
    current_transition: Optional[FrequencyTransition]
    next_transition: Optional[FrequencyTransition]
    time_remaining_current: int  # Minutes remaining in current transition
    time_remaining_total: int    # Minutes remaining in entire session
    subscription_required: bool = Field(default=False)
    upgrade_message: Optional[str] = None


# Pre-defined free presets
FREE_PRESETS = [
    TimerPreset(
        name="Deep Sleep Starter",
        description="30min theta (6Hz) → 20min delta (2Hz) for natural sleep progression",
        transitions=[
            FrequencyTransition(
                duration_minutes=30,
                frequency_hz=6.0,
                frequency_type=FrequencyType.THETA,
                left_ear_hz=200,
                right_ear_hz=206,
                description="Relaxation and sleep preparation"
            ),
            FrequencyTransition(
                duration_minutes=20,
                frequency_hz=2.0,
                frequency_type=FrequencyType.DELTA,
                left_ear_hz=200,
                right_ear_hz=202,
                description="Deep sleep induction"
            )
        ],
        is_premium=False,
        tags=["sleep", "meditation", "beginner"]
    ),
    TimerPreset(
        name="Focus Boost",
        description="25min alpha (10Hz) → 15min beta (15Hz) for enhanced concentration",
        transitions=[
            FrequencyTransition(
                duration_minutes=25,
                frequency_hz=10.0,
                frequency_type=FrequencyType.ALPHA,
                left_ear_hz=200,
                right_ear_hz=210,
                description="Relaxed awareness"
            ),
            FrequencyTransition(
                duration_minutes=15,
                frequency_hz=15.0,
                frequency_type=FrequencyType.BETA,
                left_ear_hz=200,
                right_ear_hz=215,
                description="Active concentration"
            )
        ],
        is_premium=False,
        tags=["focus", "productivity", "work"]
    )
]

# Premium preset examples
PREMIUM_PRESETS = [
    TimerPreset(
        name="Lucid Dream Protocol",
        description="Advanced 4-stage lucid dreaming sequence with gamma bursts",
        transitions=[
            FrequencyTransition(
                duration_minutes=20,
                frequency_hz=10.0,
                frequency_type=FrequencyType.ALPHA,
                left_ear_hz=200,
                right_ear_hz=210,
                description="Initial relaxation"
            ),
            FrequencyTransition(
                duration_minutes=30,
                frequency_hz=6.0,
                frequency_type=FrequencyType.THETA,
                left_ear_hz=200,
                right_ear_hz=206,
                description="Dream state entry"
            ),
            FrequencyTransition(
                duration_minutes=5,
                frequency_hz=40.0,
                frequency_type=FrequencyType.GAMMA,
                left_ear_hz=200,
                right_ear_hz=240,
                description="Lucidity trigger"
            ),
            FrequencyTransition(
                duration_minutes=45,
                frequency_hz=6.0,
                frequency_type=FrequencyType.THETA,
                left_ear_hz=200,
                right_ear_hz=206,
                description="Extended lucid window"
            )
        ],
        is_premium=True,
        tags=["lucid-dreaming", "advanced", "consciousness"]
    )
]