"""
Electromagnetic Field Simulator
Generates field patterns synchronized with binaural beats
"""

import numpy as np
from scipy import signal
from typing import Dict, Tuple, Optional
import asyncio

class FieldSimulator:
    def __init__(self):
        self.sessions: Dict[str, dict] = {}
        self.running = False
        self.grid_size = (64, 64)  # Field visualization grid
        
    def is_running(self) -> bool:
        return self.running
    
    def configure(self, session_id: str, settings: dict):
        """Configure field simulation for a session"""
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "settings": settings,
                "time": 0,
                "active": True
            }
        else:
            self.sessions[session_id]["settings"].update(settings)
        self.running = True
    
    def update_settings(self, session_id: str, settings: dict):
        """Update live settings"""
        if session_id in self.sessions:
            self.sessions[session_id]["settings"].update(settings)
    
    def stop_session(self, session_id: str):
        """Stop field simulation for a session"""
        if session_id in self.sessions:
            self.sessions[session_id]["active"] = False
            del self.sessions[session_id]
        if not self.sessions:
            self.running = False
    
    async def generate_frame(self, session_id: str) -> dict:
        """Generate electromagnetic field frame"""
        if session_id not in self.sessions:
            return {"error": "Session not found"}
        
        session = self.sessions[session_id]
        settings = session["settings"]
        
        # Get field parameters
        frequency = settings.get("beat_frequency", 4)
        intensity = settings.get("field_intensity", 1.0)
        pattern = settings.get("field_pattern", "toroidal")
        
        # Generate field based on pattern
        if pattern == "toroidal":
            field = self._generate_toroidal_field(session["time"], frequency, intensity)
        elif pattern == "spherical":
            field = self._generate_spherical_field(session["time"], frequency, intensity)
        elif pattern == "vortex":
            field = self._generate_vortex_field(session["time"], frequency, intensity)
        else:
            field = self._generate_wave_field(session["time"], frequency, intensity)
        
        # Update time
        session["time"] += 1/60  # 60 FPS
        
        # Calculate field metrics
        metrics = self._calculate_field_metrics(field)
        
        return {
            "field": field.tolist(),
            "grid_size": self.grid_size,
            "pattern": pattern,
            "metrics": metrics,
            "time": session["time"]
        }
    
    def _generate_toroidal_field(self, t: float, freq: float, intensity: float) -> np.ndarray:
        """Generate toroidal field pattern"""
        x = np.linspace(-np.pi, np.pi, self.grid_size[0])
        y = np.linspace(-np.pi, np.pi, self.grid_size[1])
        X, Y = np.meshgrid(x, y)
        
        # Toroidal coordinates
        R = np.sqrt(X**2 + Y**2)
        theta = np.arctan2(Y, X)
        
        # Time-varying toroidal field
        field = intensity * np.sin(R - freq * t) * np.cos(theta + freq * t / 2)
        
        # Add rotation
        rotation = np.sin(freq * t) * 0.5
        field = field * (1 + rotation * np.cos(2 * theta))
        
        return field
    
    def _generate_spherical_field(self, t: float, freq: float, intensity: float) -> np.ndarray:
        """Generate spherical harmonic field pattern"""
        x = np.linspace(-2, 2, self.grid_size[0])
        y = np.linspace(-2, 2, self.grid_size[1])
        X, Y = np.meshgrid(x, y)
        
        # Spherical coordinates
        R = np.sqrt(X**2 + Y**2)
        
        # Pulsating spherical field
        field = intensity * np.exp(-(R**2) / 2) * np.sin(freq * t)
        
        # Add harmonics
        field += 0.3 * intensity * np.exp(-(R**2) / 4) * np.sin(2 * freq * t)
        field += 0.1 * intensity * np.exp(-(R**2) / 8) * np.sin(3 * freq * t)
        
        return field
    
    def _generate_vortex_field(self, t: float, freq: float, intensity: float) -> np.ndarray:
        """Generate vortex/spiral field pattern"""
        x = np.linspace(-2, 2, self.grid_size[0])
        y = np.linspace(-2, 2, self.grid_size[1])
        X, Y = np.meshgrid(x, y)
        
        # Polar coordinates
        R = np.sqrt(X**2 + Y**2)
        theta = np.arctan2(Y, X)
        
        # Spiral vortex
        spiral = theta - R + freq * t
        field = intensity * np.sin(spiral) * np.exp(-R / 2)
        
        # Add rotation and pulsation
        field = field * (1 + 0.5 * np.sin(freq * t))
        
        return field
    
    def _generate_wave_field(self, t: float, freq: float, intensity: float) -> np.ndarray:
        """Generate standing wave field pattern"""
        x = np.linspace(-2, 2, self.grid_size[0])
        y = np.linspace(-2, 2, self.grid_size[1])
        X, Y = np.meshgrid(x, y)
        
        # Standing wave pattern
        wave_x = np.sin(np.pi * X) * np.cos(freq * t)
        wave_y = np.sin(np.pi * Y) * np.cos(freq * t + np.pi/4)
        
        field = intensity * (wave_x + wave_y) / 2
        
        # Add interference pattern
        interference = np.sin(X * Y + freq * t) * 0.3
        field += intensity * interference
        
        return field
    
    def _calculate_field_metrics(self, field: np.ndarray) -> dict:
        """Calculate field statistics and metrics"""
        return {
            "mean": float(np.mean(field)),
            "std": float(np.std(field)),
            "max": float(np.max(field)),
            "min": float(np.min(field)),
            "energy": float(np.sum(field**2)),
            "gradient_magnitude": float(np.mean(np.gradient(field)))
        }