"""
Binaural Beat Generator
Provides presets and configurations for different brainwave states
"""

from typing import Dict, List

class BinauralBeatGenerator:
    def __init__(self):
        self.presets = self._initialize_presets()
    
    def _initialize_presets(self) -> Dict[str, dict]:
        """Initialize binaural beat presets for different states"""
        return {
            "deep_sleep": {
                "name": "Deep Sleep",
                "base_frequency": 100,
                "beat_frequency": 2,
                "description": "Delta waves for deep, restorative sleep",
                "category": "sleep",
                "duration_minutes": 30
            },
            "meditation": {
                "name": "Meditation",
                "base_frequency": 150,
                "beat_frequency": 6,
                "description": "Theta waves for deep meditation",
                "category": "relaxation",
                "duration_minutes": 20
            },
            "relaxation": {
                "name": "Relaxation",
                "base_frequency": 144,
                "beat_frequency": 10,
                "description": "Alpha waves for calm relaxation",
                "category": "relaxation",
                "duration_minutes": 15
            },
            "focus": {
                "name": "Focus",
                "base_frequency": 150,
                "beat_frequency": 18,
                "description": "Beta waves for concentration and focus",
                "category": "focus",
                "duration_minutes": 25
            },
            "high_focus": {
                "name": "High Focus",
                "base_frequency": 100,
                "beat_frequency": 40,
                "description": "Gamma waves for peak performance",
                "category": "focus",
                "duration_minutes": 20
            },
            "adhd_focus": {
                "name": "ADHD Focus",
                "base_frequency": 144,
                "beat_frequency": 14,
                "description": "SMR waves for ADHD symptom management",
                "category": "therapeutic",
                "duration_minutes": 30
            },
            "creativity": {
                "name": "Creativity",
                "base_frequency": 180,
                "beat_frequency": 8,
                "description": "Alpha-Theta border for creative flow",
                "category": "creativity",
                "duration_minutes": 20
            },
            "energy_boost": {
                "name": "Energy Boost",
                "base_frequency": 180,
                "beat_frequency": 25,
                "description": "High beta for energy and alertness",
                "category": "energy",
                "duration_minutes": 10
            },
            "anxiety_relief": {
                "name": "Anxiety Relief",
                "base_frequency": 160,
                "beat_frequency": 8.5,
                "description": "Low alpha for anxiety reduction",
                "category": "therapeutic",
                "duration_minutes": 20
            },
            "memory_enhancement": {
                "name": "Memory Enhancement",
                "base_frequency": 160,
                "beat_frequency": 12,
                "description": "Alpha-beta transition for memory consolidation",
                "category": "cognitive",
                "duration_minutes": 15
            }
        }
    
    def get_presets(self) -> Dict[str, dict]:
        """Get all available presets"""
        return self.presets
    
    def get_preset(self, preset_name: str) -> dict:
        """Get a specific preset by name"""
        return self.presets.get(preset_name, {})
    
    def get_presets_by_category(self, category: str) -> List[dict]:
        """Get all presets in a specific category"""
        return [
            preset for preset in self.presets.values()
            if preset.get("category") == category
        ]
    
    def create_custom_preset(self, base_freq: float, beat_freq: float, 
                           name: str = "Custom") -> dict:
        """Create a custom binaural beat configuration"""
        # Determine brainwave category based on beat frequency
        if beat_freq < 4:
            category = "delta"
            description = "Delta waves"
        elif beat_freq < 8:
            category = "theta"
            description = "Theta waves"
        elif beat_freq < 13:
            category = "alpha"
            description = "Alpha waves"
        elif beat_freq < 30:
            category = "beta"
            description = "Beta waves"
        else:
            category = "gamma"
            description = "Gamma waves"
        
        return {
            "name": name,
            "base_frequency": base_freq,
            "beat_frequency": beat_freq,
            "description": f"{description} ({beat_freq} Hz)",
            "category": "custom",
            "duration_minutes": 20
        }
    
    def validate_frequencies(self, base_freq: float, beat_freq: float) -> bool:
        """Validate frequency parameters"""
        # Base frequency should be in audible range
        if base_freq < 20 or base_freq > 1000:
            return False
        
        # Beat frequency should be in brainwave range
        if beat_freq < 0.5 or beat_freq > 100:
            return False
        
        # Frequencies should be reasonable for binaural beats
        if beat_freq > base_freq / 2:
            return False
        
        return True