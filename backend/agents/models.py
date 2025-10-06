"""
Data models for Audio Agent system
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class AudioSessionConfig(BaseModel):
    """Configuration for audio processing session."""
    sample_rate: int = Field(default=44100, description="Sample rate in Hz")
    bit_depth: int = Field(default=16, description="Bit depth for audio")
    channels: int = Field(default=2, description="Number of audio channels")
    buffer_size: int = Field(default=2048, description="Audio buffer size")
    latency: float = Field(default=0.01, description="Target latency in seconds")


class AudioEngineState(BaseModel):
    """Current state of the audio engine."""
    is_initialized: bool = False
    is_playing: bool = False
    current_session_id: Optional[str] = None
    sample_rate: int = 44100
    bit_depth: int = 16
    cpu_usage: float = 0.0
    memory_usage: float = 0.0
    active_generators: int = 0
    error_count: int = 0
    last_error: Optional[str] = None


class FrequencyPattern(BaseModel):
    """Frequency pattern for audio generation."""
    name: str
    base_frequency: float = Field(description="Base carrier frequency in Hz")
    beat_frequencies: List[float] = Field(description="Beat frequencies in Hz")
    description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    effectiveness_score: float = Field(default=0.8, ge=0.0, le=1.0)


class BinauralBeatConfig(BaseModel):
    """Configuration for binaural beat generation."""
    base_frequency: float = Field(default=200, description="Base frequency in Hz")
    beat_frequency: float = Field(default=10, description="Beat frequency in Hz")
    duration: float = Field(default=60, description="Duration in seconds")
    amplitude: float = Field(default=0.5, ge=0.0, le=1.0)
    fade_in: float = Field(default=2.0, description="Fade in duration in seconds")
    fade_out: float = Field(default=2.0, description="Fade out duration in seconds")
    wave_type: str = Field(default="sine", description="Wave type: sine, square, triangle")


class IsochronicToneConfig(BaseModel):
    """Configuration for isochronic tone generation."""
    frequency: float = Field(default=440, description="Tone frequency in Hz")
    pulse_rate: float = Field(default=10, description="Pulse rate in Hz")
    duration: float = Field(default=60, description="Duration in seconds")
    duty_cycle: float = Field(default=0.5, ge=0.0, le=1.0, description="Pulse duty cycle")
    amplitude: float = Field(default=0.5, ge=0.0, le=1.0)
    ramp_time: float = Field(default=0.01, description="Ramp time in seconds")


class EMFieldConfig(BaseModel):
    """Configuration for electromagnetic field audio generation."""
    field_strength: float = Field(default=1.0, ge=0.0, le=10.0)
    frequency_range: tuple[float, float] = Field(default=(20, 20000))
    modulation_frequency: float = Field(default=7.83, description="Schumann resonance")
    harmonics: List[float] = Field(default_factory=lambda: [14.3, 20.8, 27.3, 33.8])
    duration: float = Field(default=60)
    complexity: int = Field(default=5, ge=1, le=10, description="Complexity level")


class AudioAnalysis(BaseModel):
    """Analysis results for processed audio."""
    session_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    audio_type: str

    # Frequency analysis
    frequencies: Optional[List[float]] = None
    amplitudes: Optional[List[float]] = None
    dominant_frequency: Optional[float] = None
    beat_frequency: Optional[float] = None

    # EM field specific
    field_strength: Optional[float] = None

    # Isochronic specific
    pulse_rate: Optional[float] = None

    # Quality metrics
    duration: float
    quality_score: float = Field(ge=0.0, le=1.0)
    signal_to_noise_ratio: Optional[float] = None
    total_harmonic_distortion: Optional[float] = None

    # Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AudioStreamConfig(BaseModel):
    """Configuration for real-time audio streaming."""
    protocol: str = Field(default="websocket", description="Streaming protocol")
    chunk_size: int = Field(default=1024, description="Chunk size in samples")
    compression: Optional[str] = Field(default=None, description="Compression codec")
    encryption: bool = Field(default=False, description="Enable encryption")
    max_latency: float = Field(default=0.05, description="Maximum acceptable latency")


class AudioEffectChain(BaseModel):
    """Chain of audio effects to apply."""
    effects: List[Dict[str, Any]] = Field(default_factory=list)
    bypass: bool = False
    wet_dry_mix: float = Field(default=1.0, ge=0.0, le=1.0)


class SessionMetrics(BaseModel):
    """Metrics for an audio session."""
    session_id: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    total_samples_processed: int = 0
    average_cpu_usage: float = 0.0
    peak_cpu_usage: float = 0.0
    buffer_underruns: int = 0
    buffer_overruns: int = 0
    errors: List[str] = Field(default_factory=list)
    user_feedback_score: Optional[float] = None


class FrequencyBand(BaseModel):
    """Definition of a frequency band."""
    name: str
    min_frequency: float
    max_frequency: float
    description: Optional[str] = None
    color: Optional[str] = None  # For visualization


class BrainwaveState(BaseModel):
    """Brainwave state definition."""
    name: str = Field(description="State name (e.g., Alpha, Beta, Theta)")
    frequency_range: tuple[float, float]
    description: str
    associated_states: List[str] = Field(default_factory=list)
    recommended_duration: float = Field(default=900, description="Recommended session duration in seconds")


# Predefined brainwave states
BRAINWAVE_STATES = {
    "delta": BrainwaveState(
        name="Delta",
        frequency_range=(0.5, 4),
        description="Deep sleep, healing, regeneration",
        associated_states=["deep_sleep", "healing", "unconscious"],
        recommended_duration=2700
    ),
    "theta": BrainwaveState(
        name="Theta",
        frequency_range=(4, 8),
        description="Deep meditation, REM sleep, creativity",
        associated_states=["meditation", "rem_sleep", "creativity", "intuition"],
        recommended_duration=1800
    ),
    "alpha": BrainwaveState(
        name="Alpha",
        frequency_range=(8, 13),
        description="Relaxation, visualization, creativity",
        associated_states=["relaxation", "visualization", "light_meditation"],
        recommended_duration=1200
    ),
    "beta": BrainwaveState(
        name="Beta",
        frequency_range=(13, 30),
        description="Active thinking, focus, problem solving",
        associated_states=["focus", "alertness", "concentration", "cognition"],
        recommended_duration=900
    ),
    "gamma": BrainwaveState(
        name="Gamma",
        frequency_range=(30, 100),
        description="Higher consciousness, peak awareness",
        associated_states=["peak_performance", "transcendental", "insight"],
        recommended_duration=600
    )
}