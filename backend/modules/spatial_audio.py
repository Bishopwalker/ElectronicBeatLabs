

import numpy as np
from scipy import signal
from typing import Dict, Tuple, Optional


class SpatialAudioProcessor:
    def __init__(self, sample_rate: int = 48000):
        self.sample_rate = sample_rate
        self.sessions: Dict[str, dict] = {}
        
    def configure_session(self, session_id: str, settings: dict):
        """Configure spatial audio for a session"""
        self.sessions[session_id] = {
            "settings": settings,
            "pan_phase": 0,
            "movement_speed": settings.get("movement_speed", 0.08),
            "spatial_intensity": settings.get("spatial_intensity", 0.85),
            "reverb_enabled": settings.get("reverb_enabled", True)
        }
    
    def apply_8d_effect(self, audio_left: np.ndarray, audio_right: np.ndarray, 
                       session_id: str) -> Tuple[np.ndarray, np.ndarray]:
        """Apply 8D spatial audio effect to stereo audio"""
        if session_id not in self.sessions:
            return audio_left, audio_right
        
        session = self.sessions[session_id]
        movement_speed = session["movement_speed"]
        intensity = session["spatial_intensity"]
        
        # Generate panning values using sine wave (circular movement)
        frame_size = len(audio_left)
        time_axis = np.arange(frame_size) / self.sample_rate
        
        # Calculate pan values with phase continuity
        pan_values = np.sin(2 * np.pi * movement_speed * time_axis + session["pan_phase"])
        
        # Update phase for next frame
        session["pan_phase"] += 2 * np.pi * movement_speed * frame_size / self.sample_rate
        session["pan_phase"] = session["pan_phase"] % (2 * np.pi)
        
        # Apply auto-panning with specified intensity
        # CRITICAL: Maintain binaural separation - left freq stays left, right freq stays right
        # Only apply spatial movement without cross-channel bleeding
        left_gain = 0.5 + (pan_values * intensity * 0.5)  # Range: 0.5 ± intensity*0.5
        right_gain = 0.5 - (pan_values * intensity * 0.5) # Inverse for spatial movement
        
        left_processed = audio_left * np.clip(left_gain, 0.1, 1.0)
        right_processed = audio_right * np.clip(right_gain, 0.1, 1.0)
        
        # Apply reverb if enabled
        if session["reverb_enabled"]:
            left_processed, right_processed = self._apply_reverb(
                left_processed, right_processed, session["settings"]
            )
        
        # Apply spatial positioning (HRTF simulation)
        left_processed, right_processed = self._apply_hrtf_positioning(
            left_processed, right_processed, pan_values
        )
        
        return left_processed, right_processed
    
    def _apply_reverb(self, left: np.ndarray, right: np.ndarray, 
                     settings: dict) -> Tuple[np.ndarray, np.ndarray]:
        """Apply reverb effect for spatial depth"""
        # Reverb parameters from AudioAlter preset
        reverberance = settings.get("reverberance", 0.5)
        room_scale = settings.get("room_scale", 1.0)
        hf_damping = settings.get("hf_damping", 0.5)
        
        # Simple reverb using comb filters
        delay_samples = int(0.03 * self.sample_rate)  # 30ms delay
        feedback = reverberance * 0.7
        
        # Create reverb impulse response
        impulse_length = int(0.2 * self.sample_rate * room_scale)
        impulse = np.zeros(impulse_length)
        impulse[0] = 1.0
        
        # Add multiple delayed and decaying copies
        for i in range(1, 8):
            delay = int(delay_samples * (i * 0.7))
            if delay < impulse_length:
                impulse[delay] = feedback ** i
        
        # Apply HF damping (simple low-pass)
        if hf_damping > 0:
            b, a = signal.butter(2, 0.3, btype='low')
            impulse = signal.lfilter(b, a, impulse)
        
        # Convolve with reverb impulse
        left_reverb = signal.convolve(left, impulse, mode='same')
        right_reverb = signal.convolve(right, impulse, mode='same')
        
        # Mix dry and wet signals
        wet_gain = 0.3
        left_out = left * (1 - wet_gain) + left_reverb * wet_gain
        right_out = right * (1 - wet_gain) + right_reverb * wet_gain
        
        return left_out, right_out
    
    def _apply_hrtf_positioning(self, left: np.ndarray, right: np.ndarray, 
                              pan_values: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Apply simplified HRTF for spatial positioning"""
        # Simple HRTF simulation based on panning position
        # In real implementation, this would use proper HRTF datasets
        
        # Calculate elevation angle from pan values
        elevation = pan_values * 0.2  # Small elevation changes
        
        # Apply frequency-dependent delays (simplified ITD)
        delay_samples = (pan_values * 0.5e-3 * self.sample_rate).astype(int)
        
        # Create delayed versions
        left_delayed = np.zeros_like(left)
        right_delayed = np.zeros_like(right)
        
        for i, delay in enumerate(delay_samples):
            if i + abs(delay) < len(left):
                if delay > 0:  # Right ear delayed
                    left_delayed[i] = left[i]
                    right_delayed[i] = right[i - delay] if i >= delay else 0
                elif delay < 0:  # Left ear delayed
                    left_delayed[i] = left[i + delay] if i + delay >= 0 else 0
                    right_delayed[i] = right[i]
                else:
                    left_delayed[i] = left[i]
                    right_delayed[i] = right[i]
        
        # Apply elevation-based filtering (simplified)
        if np.any(elevation != 0):
            # Simple high-frequency boost for elevation
            b, a = signal.butter(2, 0.7, btype='high')
            elevation_factor = np.abs(elevation).mean()
            if elevation_factor > 0.1:
                left_delayed += signal.lfilter(b, a, left_delayed) * elevation_factor * 0.2
                right_delayed += signal.lfilter(b, a, right_delayed) * elevation_factor * 0.2
        
        return left_delayed, right_delayed
    
    def create_field_spatialization(self, field_data: np.ndarray, 
                                   audio_left: np.ndarray, audio_right: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Convert EM field data to spatial audio positioning"""
        # Map field intensity to spatial parameters
        field_mean = np.mean(field_data)
        field_std = np.std(field_data)
        
        # Use field characteristics to modulate spatial effect
        movement_rate = 0.08 + (field_std * 0.1)  # Field variation affects movement speed
        intensity = 0.5 + (abs(field_mean) * 0.3)  # Field strength affects spatial intensity
        
        # Generate time-varying spatial parameters based on field
        frame_size = len(audio_left)
        t = np.arange(frame_size) / self.sample_rate
        
        # Map field data to spatial coordinates (simplified)
        if len(field_data.flatten()) >= frame_size:
            field_1d = field_data.flatten()[:frame_size]
        else:
            field_1d = np.resize(field_data.flatten(), frame_size)
        
        # Use field values as spatial positioning
        spatial_x = np.tanh(field_1d)  # Normalize to [-1, 1]
        spatial_y = np.sin(2 * np.pi * movement_rate * t)  # Circular movement
        
        # Apply spatial positioning
        pan_effect = spatial_x * intensity
        left_spatialized = audio_left * (1 - pan_effect * 0.5)
        right_spatialized = audio_right * (1 + pan_effect * 0.5)
        
        # Add elevation effect based on field gradient
        elevation_effect = np.gradient(field_1d) * 0.3
        
        # Simple elevation simulation with filtering
        if np.any(elevation_effect != 0):
            b, a = signal.butter(2, 0.8, btype='high')
            elevation_audio = signal.lfilter(b, a, (left_spatialized + right_spatialized) / 2)
            
            left_spatialized += elevation_audio * elevation_effect * 0.2
            right_spatialized += elevation_audio * elevation_effect * 0.2
        
        return left_spatialized, right_spatialized
    
    def get_spatial_metrics(self, session_id: str) -> dict:
        """Get current spatial audio metrics"""
        if session_id not in self.sessions:
            return {}
        
        session = self.sessions[session_id]
        
        return {
            "movement_speed": session["movement_speed"],
            "spatial_intensity": session["spatial_intensity"],
            "pan_phase": session["pan_phase"],
            "reverb_enabled": session["reverb_enabled"],
            "effect_type": "8D_circular_panning"
        }