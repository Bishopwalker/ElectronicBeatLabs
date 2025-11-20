"""
Core audio and field simulation modules for Electromagnetic Beat Lab

This package contains the core audio engine, field simulator, and frame buffer
that power the real-time binaural beat generation and electromagnetic field visualization.
"""

from core.audio_engine import AudioEngine
from core.field_simulator import FieldSimulator
from core.frame_buffer import FrameBuffer

__all__ = [
    'AudioEngine',
    'FieldSimulator',
    'FrameBuffer'
]
