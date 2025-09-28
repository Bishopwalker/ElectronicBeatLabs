"""
Electromagnetic Beat Lab (EBL) - Enhanced Audio Engine
Professional binaural beat generation with 8D spatial audio
Based on AudioKit and Qt Multimedia patterns

Handles real-time audio synthesis and streaming with:
- Phase-continuous binaural beat generation
- 8D spatial audio effects
- ADHD treatment protocols
- Professional audio quality standards
"""

import numpy as np
import asyncio
from typing import Dict, Optional, TYPE_CHECKING, Union, List
import uuid
from datetime import datetime

if TYPE_CHECKING:
    from modules.spatial_audio import SpatialAudioProcessor

class AudioEngine:
    def __init__(self, sample_rate: int = 48000):
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
        """Generate a single audio frame with professional audio standards"""
        if session_id not in self.sessions:
            return {"error": "Session not found"}
        
        session = self.sessions[session_id]
        settings = session["settings"]
        
        # Get frequency parameters with validation
        base_freq = max(20, min(20000, settings.get("base_frequency", 140)))
        beat_freq = max(0.1, min(100, settings.get("beat_frequency", 4)))
        amplitude = max(0.0, min(1.0, settings.get("amplitude", 0.5)))
        
        # Calculate left and right frequencies for binaural beats
        freq_left = base_freq
        freq_right = base_freq + beat_freq
        
        # Frame size for 48kHz at 60 FPS (800 samples per frame)
        frame_size = int(self.sample_rate / 60)
        
        # Generate time array for precise phase calculation
        t = np.arange(frame_size, dtype=np.float64) / self.sample_rate
        
        # Generate sine waves with phase continuity (critical for binaural beats)
        left_wave = amplitude * np.sin(2 * np.pi * freq_left * t + session["phase_left"])
        right_wave = amplitude * np.sin(2 * np.pi * freq_right * t + session["phase_right"])
        
        # Update phases for next frame (maintain phase continuity)
        phase_increment_left = 2 * np.pi * freq_left * frame_size / self.sample_rate
        phase_increment_right = 2 * np.pi * freq_right * frame_size / self.sample_rate
        
        session["phase_left"] = (session["phase_left"] + phase_increment_left) % (2 * np.pi)
        session["phase_right"] = (session["phase_right"] + phase_increment_right) % (2 * np.pi)
        
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
        
        # Apply anti-aliasing filter if needed
        if freq_right > self.sample_rate / 2.5:  # Nyquist safety margin
            from scipy import signal
            b, a = signal.butter(4, self.sample_rate / 2.5, btype='low')
            left_wave = signal.filtfilt(b, a, left_wave)
            right_wave = signal.filtfilt(b, a, right_wave)
        
        return {
            "left": left_pcm.tolist(),
            "right": right_pcm.tolist(),
            "sample_rate": self.sample_rate,
            "frame_size": frame_size,
            "frequencies": {
                "left": freq_left,
                "right": freq_right,
                "beat": beat_freq,
                "carrier": base_freq
            },
            "spatial": spatial_metrics,
            "audio_metrics": {
                "rms_left": float(np.sqrt(np.mean(left_wave ** 2))),
                "rms_right": float(np.sqrt(np.mean(right_wave ** 2))),
                "peak_left": float(np.max(np.abs(left_wave))),
                "peak_right": float(np.max(np.abs(right_wave))),
                "phase_left": float(session["phase_left"]),
                "phase_right": float(session["phase_right"])
            },
            "timestamp": datetime.now().isoformat()
        }
    
    def _create_envelope(self, frame_size: int, settings: dict) -> np.ndarray:
        """Create amplitude envelope for smooth transitions"""
        envelope_type = settings.get("envelope_type", "constant")
        
        if envelope_type == "constant":
            return np.ones(frame_size)
        elif envelope_type == "fade_in":
            # Logarithmic fade for more natural perception
            linear = np.linspace(0, 1, frame_size)
            return linear ** 2  # Squared for logarithmic perception
        elif envelope_type == "fade_out":
            linear = np.linspace(1, 0, frame_size)
            return linear ** 2
        elif envelope_type == "pulse":
            frequency = settings.get("pulse_frequency", 1)
            t = np.arange(frame_size) / self.sample_rate
            return 0.5 * (1 + np.sin(2 * np.pi * frequency * t))
        elif envelope_type == "adsr":
            # ADSR envelope for professional audio
            attack = int(settings.get("attack_time", 0.1) * self.sample_rate)
            decay = int(settings.get("decay_time", 0.1) * self.sample_rate)
            sustain_level = settings.get("sustain_level", 0.8)
            release = int(settings.get("release_time", 0.5) * self.sample_rate)
            
            envelope = np.ones(frame_size) * sustain_level
            
            # Attack phase
            if frame_size > attack:
                envelope[:attack] = np.linspace(0, 1, attack) ** 2
            
            # Decay phase
            if frame_size > attack + decay:
                decay_end = min(attack + decay, frame_size)
                envelope[attack:decay_end] = np.linspace(1, sustain_level, decay_end - attack)
            
            return envelope
        else:
            return np.ones(frame_size)
    
    def validate_frequencies(self, settings: dict) -> dict:
        """Validate and sanitize frequency settings"""
        validated = settings.copy()
        
        # Validate base frequency (human audible range)
        base_freq = settings.get("base_frequency", 144)
        validated["base_frequency"] = max(20, min(20000, base_freq))
        
        # Validate beat frequency (therapeutic range)
        beat_freq = settings.get("beat_frequency", 4)
        validated["beat_frequency"] = max(0.1, min(100, beat_freq))
        
        # Validate amplitude (prevent clipping)
        amplitude = settings.get("amplitude", 0.5)
        validated["amplitude"] = max(0.0, min(1.0, amplitude))
        
        # Ensure frequencies don't exceed Nyquist limit
        max_freq = validated["base_frequency"] + validated["beat_frequency"]
        if max_freq > self.sample_rate / 2:
            # Reduce base frequency to stay within limits
            validated["base_frequency"] = (self.sample_rate / 2) - validated["beat_frequency"] - 100
        
        return validated
    
    def get_session_metrics(self, session_id: str) -> dict:
        """Get comprehensive session performance metrics"""
        if session_id not in self.sessions:
            return {"error": "Session not found"}
        
        session = self.sessions[session_id]
        settings = session["settings"]
        
        return {
            "session_id": session_id,
            "active": session["active"],
            "start_time": session["start_time"].isoformat(),
            "duration_seconds": (datetime.now() - session["start_time"]).total_seconds(),
            "current_settings": settings,
            "phases": {
                "left": session["phase_left"],
                "right": session["phase_right"]
            },
            "audio_quality": {
                "sample_rate": self.sample_rate,
                "bit_depth": 16,
                "channels": 2,
                "frame_rate": 60
            }
        }
    
    def create_adhd_protocol(self, protocol_type: str) -> dict:
        """Create ADHD treatment protocol configurations"""
        protocols = {
            "focus": {
                "base_frequency": 144,
                "beat_frequency": 14,  # SMR range
                "amplitude": 0.6,
                "duration": 20 * 60,  # 20 minutes
                "envelope_type": "adsr",
                "description": "SMR training for attention and focus"
            },
            "calm": {
                "base_frequency": 144,
                "beat_frequency": 8,  # Alpha range
                "amplitude": 0.4,
                "duration": 15 * 60,
                "envelope_type": "fade_in",
                "description": "Alpha waves for relaxation and calm focus"
            },
            "deep_focus": {
                "base_frequency": 144,
                "beat_frequency": 40,  # Gamma range
                "amplitude": 0.7,
                "duration": 25 * 60,
                "envelope_type": "pulse",
                "pulse_frequency": 0.1,
                "description": "Gamma waves for deep concentration"
            },
            "meditation": {
                "base_frequency": 144,
                "beat_frequency": 6,  # Theta range
                "amplitude": 0.3,
                "duration": 30 * 60,
                "envelope_type": "constant",
                "description": "Theta waves for meditation and creativity"
            }
        }
        
        return protocols.get(protocol_type, protocols["focus"])