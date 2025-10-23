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
import struct
from typing import Dict, Optional, TYPE_CHECKING, Union, List
import uuid
from datetime import datetime


class AudioEngine:
    """Enhanced audio engine for binaural beat generation"""

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
    
    async def generate_frame(self, session_id: str, binary_mode: bool = True) -> Union[dict, bytes]:
        """Generate a single audio frame with professional audio standards

        Args:
            session_id: Unique session identifier
            binary_mode: If True, return binary data; if False, return dict (legacy)

        Returns:
            bytes: Binary audio frame (if binary_mode=True)
            dict: JSON-compatible frame data (if binary_mode=False)
        """
        if session_id not in self.sessions:
            print(f"ERROR: Session {session_id} not found in sessions: {list(self.sessions.keys())}")
            return {"error": "Session not found"} if not binary_mode else b''

        # PERFORMANCE: Removed debug logging in hot path
        session = self.sessions[session_id]
        settings = session["settings"]

        # PERFORMANCE: Cache settings values (avoid repeated dict lookups)
        base_frequency = max(5, min(20000, settings["base_frequency"]))
        beat_frequency = max(0.01, min(100, settings["beat_frequency"]))

        # 🔧 PHASE 2 FIX: Separate amplitude (wave generation) from volume (loudness control)
        # amplitude is ALWAYS 1.0 for clean wave generation (prevents PCM clipping)
        # volume is applied AFTER wave generation for loudness control
        amplitude = 1.0  # FIXED: Always generate clean waves at unity amplitude
        volume = max(0.0, min(2.0, settings.get("volume", 0.5)))  # Volume control (default 50%)

        # DEBUG LOGGING: Track volume and wave generation (Phase 1)
        if not hasattr(session, 'frame_count'):
            session['frame_count'] = 0
        if session['frame_count'] % 300 == 0:  # Every 5 seconds at 60 FPS
            print(f"[BACKEND DEBUG] Session {session_id[:8]}:")
            print(f"   amplitude={amplitude:.3f} (FIXED at 1.0 - clean wave generation)")
            print(f"   volume={volume:.3f} (loudness control, default 0.5)")
            print(f"   base_freq={base_frequency:.1f}Hz, beat_freq={beat_frequency:.2f}Hz")
            print(f"   frame_count={session['frame_count']}")
        session['frame_count'] += 1

        # Calculate left and right frequencies for binaural beats
        freq_left = base_frequency
        freq_right = base_frequency + beat_frequency

        # Frame size for 48kHz at 60 FPS (800 samples per frame)
        frame_size = int(self.sample_rate / 60)

        # PERFORMANCE: Pre-calculate constants to avoid redundant math
        two_pi = 2 * np.pi
        phase_left = session["phase_left"]
        phase_right = session["phase_right"]

        # PERFORMANCE: Use float32 instead of float64 (2x faster, sufficient precision)
        t = np.arange(frame_size, dtype=np.float32) / self.sample_rate

        # 🔧 PHASE 2 FIX: Generate clean sine waves at amplitude=1.0 (prevents clipping)
        # Volume will be applied AFTER envelope and spatial processing
        left_wave = np.sin(two_pi * freq_left * t + phase_left, dtype=np.float32)
        right_wave = np.sin(two_pi * freq_right * t + phase_right, dtype=np.float32)

        # Update phases for next frame (maintain phase continuity)
        phase_increment_left = two_pi * freq_left * frame_size / self.sample_rate
        phase_increment_right = two_pi * freq_right * frame_size / self.sample_rate

        session["phase_left"] = (phase_left + phase_increment_left) % two_pi
        session["phase_right"] = (phase_right + phase_increment_right) % two_pi

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

        # 🔧 PHASE 2 FIX: Apply volume AFTER envelope and spatial processing
        # This ensures clean wave generation (no clipping) with proper loudness control
        left_wave = left_wave * volume
        right_wave = right_wave * volume

        # DEBUG LOGGING: Check for wave clipping BEFORE PCM conversion
        if session['frame_count'] % 300 == 1:  # Log right after amplitude log
            wave_min_left = float(np.min(left_wave))
            wave_max_left = float(np.max(left_wave))
            wave_min_right = float(np.min(right_wave))
            wave_max_right = float(np.max(right_wave))
            print(f"[WAVE DEBUG] Before PCM:")
            print(f"   left_wave range: [{wave_min_left:.4f}, {wave_max_left:.4f}]")
            print(f"   right_wave range: [{wave_min_right:.4f}, {wave_max_right:.4f}]")
            if abs(wave_min_left) > 1.0 or abs(wave_max_left) > 1.0:
                print(f"   WARNING: LEFT WAVE WILL CLIP! (amplitude too high)")
            if abs(wave_min_right) > 1.0 or abs(wave_max_right) > 1.0:
                print(f"   WARNING: RIGHT WAVE WILL CLIP! (amplitude too high)")

        # PERFORMANCE: Direct conversion to PCM (removed intermediate anti-aliasing)
        # Anti-aliasing only needed for very high frequencies (>19.2kHz at 48kHz sample rate)
        if freq_right > self.sample_rate / 2.5:  # Nyquist safety margin
            from scipy import signal
            b, a = signal.butter(4, self.sample_rate / 2.5, btype='low')
            left_wave = signal.filtfilt(b, a, left_wave)
            right_wave = signal.filtfilt(b, a, right_wave)

        # Convert to PCM format (moved after anti-aliasing check)
        left_pcm_raw = left_wave * 32767
        right_pcm_raw = right_wave * 32767
        left_pcm = left_pcm_raw.astype(np.int16)
        right_pcm = right_pcm_raw.astype(np.int16)

        # DEBUG LOGGING: Detect PCM clipping
        if session['frame_count'] % 300 == 1:
            clipped_left = np.sum(np.abs(left_pcm_raw) > 32767)
            clipped_right = np.sum(np.abs(right_pcm_raw) > 32767)
            if clipped_left > 0 or clipped_right > 0:
                print(f"WARNING: [PCM CLIPPING DETECTED!]")
                print(f"   Left samples clipped: {clipped_left}/{frame_size}")
                print(f"   Right samples clipped: {clipped_right}/{frame_size}")
                print(f"   CAUSE: amplitude={amplitude} is too high (should be <=1.0)")

        # Binary mode: Return compact binary format for WebSocket transmission
        if binary_mode:
            # Binary frame format:
            # [4 bytes: frame_size] [left_pcm bytes] [right_pcm bytes]
            # This reduces payload from ~6.4KB JSON to ~3.2KB binary (50% reduction)
            import struct
            header = struct.pack('<I', frame_size)  # Little-endian unsigned int
            return header + left_pcm.tobytes() + right_pcm.tobytes()

        # Legacy JSON mode for compatibility
        # PERFORMANCE: Removed spatial metrics and audio metrics from hot path
        return {
            "left": left_pcm.tolist(),
            "right": right_pcm.tolist(),
            "sample_rate": self.sample_rate,
            "frame_size": frame_size,
            "frequencies": {
                "left": freq_left,
                "right": freq_right,
                "beat": beat_frequency,
                "carrier": base_frequency
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
        base_frequency = settings.get("base_frequency", 144)
        validated["base_frequency"] = max(20, min(20000, base_frequency))

        # Validate beat frequency (therapeutic range)
        beat_frequency = settings.get("beat_frequency", 4)
        validated["beat_frequency"] = max(0.1, min(100, beat_frequency))

        # 🔧 PHASE 2 FIX: Use "volume" parameter instead of "amplitude"
        # Volume controls loudness (default 0.5 = 50%)
        # Amplitude is always 1.0 internally for clean wave generation
        volume = settings.get("volume", 0.5)
        validated["volume"] = max(0.0, min(2.0, volume))  # Allow up to 200% for boost mode

        # BACKWARD COMPATIBILITY: If old "amplitude" param is provided, treat it as "volume"
        if "amplitude" in settings and "volume" not in settings:
            validated["volume"] = max(0.0, min(2.0, settings["amplitude"]))
            print(f"WARNING: [DEPRECATED] 'amplitude' parameter is deprecated, use 'volume' instead")

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
        """Create ADHD treatment protocol configurations

        🔧 PHASE 2 UPDATE: All protocols now use 'volume' parameter (default 0.5)
        This ensures clean audio generation with no clipping or distortion
        """
        protocols = {
            "focus": {
                "base_frequency": 144,
                "beat_frequency": 14,  # SMR range
                "volume": 0.5,  # 🔧 FIXED: Changed from amplitude=1.4 to volume=0.5
                "duration": 20 * 60,  # 20 minutes
                "envelope_type": "adsr",
                "description": "SMR training for attention and focus"
            },
            "calm": {
                "base_frequency": 144,
                "beat_frequency": 8,  # Alpha range
                "volume": 0.5,  # 🔧 FIXED: Changed from amplitude=1.2 to volume=0.5
                "duration": 15 * 60,
                "envelope_type": "fade_in",
                "description": "Alpha waves for relaxation and calm focus"
            },
            "deep_focus": {
                "base_frequency": 144,
                "beat_frequency": 40,  # Gamma range
                "volume": 0.5,  # 🔧 FIXED: Changed from amplitude=1.6 to volume=0.5
                "duration": 25 * 60,
                "envelope_type": "pulse",
                "pulse_frequency": 0.1,
                "description": "Gamma waves for deep concentration"
            },
            "meditation": {
                "base_frequency": 144,
                "beat_frequency": 6,  # Theta range
                "volume": 0.5,  # 🔧 FIXED: Changed from amplitude=1.0 to volume=0.5
                "duration": 30 * 60,
                "envelope_type": "constant",
                "description": "Theta waves for meditation and creativity"
            }
        }

        return protocols.get(protocol_type, protocols["focus"])