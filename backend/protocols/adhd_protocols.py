"""
ADHD Treatment Protocols
Science-based frequency patterns for ADHD symptom management
"""

from typing import Dict, List

class ADHDProtocols:
    def __init__(self):
        self.protocols = self._initialize_protocols()
    
    def _initialize_protocols(self) -> Dict[str, dict]:
        """Initialize ADHD-specific treatment protocols"""
        return {
            "smr_training": {
                "name": "SMR Training",
                "description": "Sensorimotor Rhythm training for focus and impulse control",
                "stages": [
                    {
                        "duration_minutes": 5,
                        "base_frequency": 180,
                        "beat_frequency": 12,
                        "description": "Warm-up with low SMR"
                    },
                    {
                        "duration_minutes": 20,
                        "base_frequency": 144,
                        "beat_frequency": 14,
                        "description": "Core SMR training"
                    },
                    {
                        "duration_minutes": 5,
                        "base_frequency": 180,
                        "beat_frequency": 10,
                        "description": "Cool-down to alpha"
                    }
                ],
                "total_duration": 30,
                "effectiveness": "High for attention and hyperactivity"
            },
            
            "theta_suppression": {
                "name": "Theta Suppression",
                "description": "Reduce excessive theta waves common in ADHD",
                "stages": [
                    {
                        "duration_minutes": 10,
                        "base_frequency": 160,
                        "beat_frequency": 15,
                        "description": "Beta enhancement"
                    },
                    {
                        "duration_minutes": 15,
                        "base_frequency": 150,
                        "beat_frequency": 18,
                        "description": "Sustained beta focus"
                    },
                    {
                        "duration_minutes": 5,
                        "base_frequency": 144,
                        "beat_frequency": 12,
                        "description": "SMR stabilization"
                    }
                ],
                "total_duration": 30,
                "effectiveness": "Good for reducing daydreaming and inattention"
            },
            
            "executive_function": {
                "name": "Executive Function Enhancement",
                "description": "Improve planning, organization, and working memory",
                "stages": [
                    {
                        "duration_minutes": 5,
                        "base_frequency": 144,
                        "beat_frequency": 10,
                        "description": "Alpha baseline"
                    },
                    {
                        "duration_minutes": 10,
                        "base_frequency": 180,
                        "beat_frequency": 20,
                        "description": "Beta activation"
                    },
                    {
                        "duration_minutes": 10,
                        "base_frequency": 100,
                        "beat_frequency": 40,
                        "description": "Gamma for cognitive processing"
                    },
                    {
                        "duration_minutes": 5,
                        "base_frequency": 160,
                        "beat_frequency": 14,
                        "description": "SMR integration"
                    }
                ],
                "total_duration": 30,
                "effectiveness": "Excellent for task management and memory"
            },
            
            "calm_focus": {
                "name": "Calm Focus Protocol",
                "description": "Reduce hyperactivity while maintaining alertness",
                "stages": [
                    {
                        "duration_minutes": 8,
                        "base_frequency": 160,
                        "beat_frequency": 8,
                        "description": "Deep alpha relaxation"
                    },
                    {
                        "duration_minutes": 14,
                        "base_frequency": 144,
                        "beat_frequency": 12,
                        "description": "SMR for calm alertness"
                    },
                    {
                        "duration_minutes": 8,
                        "base_frequency": 180,
                        "beat_frequency": 10,
                        "description": "Alpha maintenance"
                    }
                ],
                "total_duration": 30,
                "effectiveness": "Good for hyperactive-impulsive type"
            },
            
            "morning_activation": {
                "name": "Morning Activation",
                "description": "Quick protocol for morning focus and energy",
                "stages": [
                    {
                        "duration_minutes": 3,
                        "base_frequency": 180,
                        "beat_frequency": 10,
                        "description": "Gentle wake-up"
                    },
                    {
                        "duration_minutes": 7,
                        "base_frequency": 150,
                        "beat_frequency": 18,
                        "description": "Beta activation"
                    },
                    {
                        "duration_minutes": 5,
                        "base_frequency": 180,
                        "beat_frequency": 25,
                        "description": "High beta energy"
                    }
                ],
                "total_duration": 15,
                "effectiveness": "Excellent for morning routine"
            },
            
            "homework_helper": {
                "name": "Homework Helper",
                "description": "Sustained focus for study sessions",
                "stages": [
                    {
                        "duration_minutes": 5,
                        "base_frequency": 144,
                        "beat_frequency": 12,
                        "description": "SMR preparation"
                    },
                    {
                        "duration_minutes": 40,
                        "base_frequency": 160,
                        "beat_frequency": 14,
                        "description": "Sustained SMR focus"
                    },
                    {
                        "duration_minutes": 5,
                        "base_frequency": 180,
                        "beat_frequency": 10,
                        "description": "Gentle transition"
                    }
                ],
                "total_duration": 50,
                "effectiveness": "Ideal for extended concentration"
            },
            
            "emotional_regulation": {
                "name": "Emotional Regulation",
                "description": "Manage emotional dysregulation common in ADHD",
                "stages": [
                    {
                        "duration_minutes": 10,
                        "base_frequency": 160,
                        "beat_frequency": 8,
                        "description": "Alpha calming"
                    },
                    {
                        "duration_minutes": 10,
                        "base_frequency": 180,
                        "beat_frequency": 10,
                        "description": "Alpha-SMR bridge"
                    },
                    {
                        "duration_minutes": 10,
                        "base_frequency": 144,
                        "beat_frequency": 12,
                        "description": "SMR stabilization"
                    }
                ],
                "total_duration": 30,
                "effectiveness": "Good for mood stability and impulse control"
            }
        }
    
    def get_all_protocols(self) -> Dict[str, dict]:
        """Get all available ADHD protocols"""
        return self.protocols
    
    def get_protocol(self, protocol_name: str) -> dict:
        """Get a specific protocol by name"""
        return self.protocols.get(protocol_name, {})
    
    def get_protocols_by_duration(self, max_minutes: int) -> List[dict]:
        """Get protocols that fit within a time limit"""
        return [
            protocol for protocol in self.protocols.values()
            if protocol.get("total_duration", 0) <= max_minutes
        ]
    
    def get_protocol_stage(self, protocol_name: str, elapsed_minutes: float) -> dict:
        """Get the current stage of a protocol based on elapsed time"""
        protocol = self.protocols.get(protocol_name)
        if not protocol:
            return {}
        
        stages = protocol.get("stages", [])
        time_sum = 0
        
        for stage in stages:
            time_sum += stage["duration_minutes"]
            if elapsed_minutes < time_sum:
                return stage
        
        # Return last stage if beyond total duration
        return stages[-1] if stages else {}