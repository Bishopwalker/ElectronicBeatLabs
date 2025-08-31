"""
Audio Engine for binaural beat generation
Handles real-time audio synthesis and streaming
"""

import numpy as np
import asyncio
from typing import Dict, Optional, TYPE_CHECKING
import uuid
from datetime import datetime

if TYPE_CHECKING:
    from modules.spatial_audio import SpatialAudioProcessor

class AudioEngine:
    def __init__(self, sample_rate: int = 44100):
        self.sample_rate = sample_rate
        self.sessions: Dict[str, dict] = {}
        self.running = False
        self.spatial_processor: Optional['SpatialAudioProcessor'] = None
        
    def is_running(self) -> bool:
        return self.running
    
    def set_spatial_processor(self, spatial_processor: 'SpatialAudioProcessor'):
        """Set the spatial audio processor"""
        self.spatial_processor = spatial_processor
    
    def start_session(self, settings: dict) -> str:
        """Start a new audio generation session"""
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "settings": settings,
            "start_time": datetime.now(),
            "phase_left": 0,
            "phase_right": 0,
            "active": True
        }
        self.running = True
        return session_id
    
    def stop_session(self, session_id: str):
        """Stop an active session"""
        if session_id in self.sessions:
            self.sessions[session_id]["active"] = False
            del self.sessions[session_id]
        if not self.sessions:
            self.running = False
    
    def configure(self, session_id: str, settings: dict):
        """Configure session settings"""
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "settings": settings,
                "phase_left": 0,
                "phase_right": 0,
                "active": True
            }
        else:
            self.sessions[session_id]["settings"].update(settings)
    
    def update_settings(self, session_id: str, settings: dict):
        """Update live settings for a session"""
        if session_id in self.sessions:
            self.sessions[session_id]["settings"].update(settings)
    
    async def generate_frame(self, session_id: str) -> dict:
        """Generate a single audio frame"""
        if session_id not in self.sessions:
            return {"error": "Session not found"}
        
        session = self.sessions[session_id]
        settings = session["settings"]
        
        # Get frequency parameters
        base_freq = settings.get("base_frequency", 200)
        beat_freq = settings.get("beat_frequency", 4)
        amplitude = settings.get("amplitude", 0.5)
        
        # Calculate left and right frequencies
        freq_left = base_freq
        freq_right = base_freq + beat_freq
        
        # Frame size (1/60 second for 60 FPS streaming)
        frame_size = int(self.sample_rate / 60)
        
        # Generate time array
        t = np.arange(frame_size) / self.sample_rate
        
        # Generate sine waves with phase continuity
        left_wave = amplitude * np.sin(2 * np.pi * freq_left * t + session["phase_left"])
        right_wave = amplitude * np.sin(2 * np.pi * freq_right * t + session["phase_right"])
        
        # Update phases for next frame
        session["phase_left"] += 2 * np.pi * freq_left * frame_size / self.sample_rate
        session["phase_right"] += 2 * np.pi * freq_right * frame_size / self.sample_rate
        
        # Keep phases in reasonable range
        session["phase_left"] = session["phase_left"] % (2 * np.pi)
        session["phase_right"] = session["phase_right"] % (2 * np.pi)
        
        # Apply envelope if specified
        if settings.get("envelope", False):
            envelope = self._create_envelope(frame_size, settings)
            left_wave *= envelope
            right_wave *= envelope
        
        # Apply spatial audio effects if enabled
        if (self.spatial_processor and 
            settings.get("spatial_enabled", False)):
            
            # Configure spatial processor if needed
            if settings.get("spatial_settings"):
                self.spatial_processor.configure_session(session_id, settings["spatial_settings"])
            
            # Apply 8D spatial effects
            left_wave, right_wave = self.spatial_processor.apply_8d_effect(
                left_wave, right_wave, session_id
            )
        
        # Convert to PCM format
        left_pcm = (left_wave * 32767).astype(np.int16)
        right_pcm = (right_wave * 32767).astype(np.int16)
        
        # Get spatial metrics if available
        spatial_metrics = {}
        if self.spatial_processor:
            spatial_metrics = self.spatial_processor.get_spatial_metrics(session_id)
        
        return {
            "left": left_pcm.tolist(),
            "right": right_pcm.tolist(),
            "sample_rate": self.sample_rate,
            "frame_size": frame_size,
            "frequencies": {
                "left": freq_left,
                "right": freq_right,
                "beat": beat_freq
            },
            "spatial": spatial_metrics
        }
    
    def _create_envelope(self, frame_size: int, settings: dict) -> np.ndarray:
        """Create amplitude envelope for smooth transitions"""
        envelope_type = settings.get("envelope_type", "constant")
        
        if envelope_type == "constant":
            return np.ones(frame_size)
        elif envelope_type == "fade_in":
            return np.linspace(0, 1, frame_size)
        elif envelope_type == "fade_out":
            return np.linspace(1, 0, frame_size)
        elif envelope_type == "pulse":
            frequency = settings.get("pulse_frequency", 1)
            t = np.arange(frame_size) / self.sample_rate
            return 0.5 * (1 + np.sin(2 * np.pi * frequency * t))
        else:
            return np.ones(frame_size)