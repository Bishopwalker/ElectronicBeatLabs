"""
Integration layer for audio examples from .claude/examples directory.

This module provides direct access to example implementations and patterns
from the following files:
- binauralbeats.html
- binural.js
- websocket-streaming-example.js
- em-field-visualization.html
- audiokit-audioengine-reference.md
- qt-multimedia-audioengine-reference.md
- qt-multimedia-audioinput-reference.md
- adhd-protocol-example.html
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

# Path to examples directory
EXAMPLES_DIR = Path(r"C:\Users\bisho\IdeaProjects\ebl\.claude\examples")

class ExamplesIntegrator:
    """
    Integration layer for audio processing examples.
    """

    def __init__(self):
        self.examples_cache: Dict[str, str] = {}
        self.patterns_cache: Dict[str, Any] = {}
        self._load_examples()

    def _load_examples(self):
        """Load and cache example files."""
        try:
            if not EXAMPLES_DIR.exists():
                logger.warning(f"Examples directory not found: {EXAMPLES_DIR}")
                return

            # Load audio-related example files
            audio_files = [
                "binauralbeats.html",
                "binural.js",
                "websocket-streaming-example.js",
                "em-field-visualization.html",
                "adhd-protocol-example.html",
                "audiokit-audioengine-reference.md",
                "qt-multimedia-audioengine-reference.md",
                "qt-multimedia-audioinput-reference.md"
            ]

            for filename in audio_files:
                file_path = EXAMPLES_DIR / filename
                if file_path.exists():
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            self.examples_cache[filename] = f.read()
                        logger.info(f"Loaded example: {filename}")
                    except Exception as e:
                        logger.error(f"Failed to load {filename}: {e}")
                else:
                    logger.warning(f"Example file not found: {filename}")

        except Exception as e:
            logger.error(f"Error loading examples: {e}")

    def get_binaural_patterns(self) -> Dict[str, Any]:
        """
        Extract binaural beat patterns from binauralbeats.html and binural.js.

        Returns:
            Dictionary containing binaural beat implementation patterns
        """
        patterns = {
            "javascript_implementation": {
                "description": "Web Audio API patterns from binauralbeats.html",
                "key_concepts": [
                    "AudioContext creation and management",
                    "OscillatorNode for sine wave generation",
                    "GainNode for amplitude control",
                    "StereoPannerNode for left/right channel separation",
                    "Smooth parameter transitions using setTargetAtTime"
                ],
                "frequency_calculation": "leftFreq = baseFreq - (beatFreq/2), rightFreq = baseFreq + (beatFreq/2)",
                "best_practices": [
                    "Always resume AudioContext after user interaction",
                    "Use exponential ramps for smooth transitions",
                    "Implement proper cleanup to prevent memory leaks",
                    "Add fade-in/fade-out to prevent clicking"
                ]
            },
            "mathematical_model": {
                "description": "Core algorithms from binural.js",
                "beat_frequency_formula": "beatFreq = |leftFreq - rightFreq|",
                "amplitude_modulation": "resultingAmplitude = sin(2π * beatFreq * t)",
                "phase_relationships": "Maintain 0° phase difference between channels",
                "frequency_ranges": {
                    "delta": "0.5-4 Hz beats for deep sleep",
                    "theta": "4-8 Hz beats for meditation",
                    "alpha": "8-13 Hz beats for relaxation",
                    "beta": "13-30 Hz beats for focus",
                    "gamma": "30-100 Hz beats for peak awareness"
                }
            },
            "implementation_code": self.examples_cache.get("binural.js", ""),
            "html_reference": self.examples_cache.get("binauralbeats.html", "")
        }

        return patterns

    def get_streaming_patterns(self) -> Dict[str, Any]:
        """
        Extract real-time streaming patterns from websocket-streaming-example.js.

        Returns:
            Dictionary containing WebSocket streaming implementation patterns
        """
        patterns = {
            "websocket_implementation": {
                "description": "Real-time audio streaming via WebSockets",
                "key_concepts": [
                    "Binary WebSocket frames for audio data",
                    "Chunked audio transmission",
                    "Real-time buffer management",
                    "Client-server synchronization",
                    "Adaptive quality control"
                ],
                "buffer_strategy": {
                    "chunk_size": "1024-4096 samples per chunk",
                    "buffer_depth": "3-5 chunks for smooth playback",
                    "underrun_handling": "Repeat last chunk or insert silence",
                    "latency_target": "<50ms end-to-end"
                },
                "data_format": {
                    "encoding": "Float32Array for high quality",
                    "compression": "Optional FLAC/OGG for bandwidth savings",
                    "metadata": "Sample rate, channels, timestamp in header"
                }
            },
            "synchronization": {
                "description": "Multi-client audio synchronization",
                "timing_mechanism": "Server-side master clock",
                "drift_correction": "Periodic timestamp synchronization",
                "jitter_buffer": "Adaptive buffering for network variations"
            },
            "implementation_code": self.examples_cache.get("websocket-streaming-example.js", "")
        }

        return patterns

    def get_em_field_patterns(self) -> Dict[str, Any]:
        """
        Extract EM field audio patterns from em-field-visualization.html.

        Returns:
            Dictionary containing electromagnetic field audio implementation
        """
        patterns = {
            "schumann_resonance": {
                "description": "Earth's electromagnetic field representation",
                "fundamental_frequency": 7.83,  # Hz
                "harmonics": [14.3, 20.8, 27.3, 33.8, 45.1],  # Hz
                "daily_variation": "±0.5 Hz due to lightning activity",
                "seasonal_variation": "±0.2 Hz due to atmospheric changes"
            },
            "field_simulation": {
                "description": "Audio representation of EM field characteristics",
                "base_implementation": [
                    "Low-frequency carrier modulation",
                    "Pink noise for field fluctuations",
                    "Harmonic series based on Schumann resonances",
                    "Field strength mapped to amplitude"
                ],
                "modulation_techniques": [
                    "Amplitude modulation for field strength",
                    "Frequency modulation for field variations",
                    "Phase modulation for field direction",
                    "Ring modulation for complex interactions"
                ]
            },
            "audio_mapping": {
                "description": "Converting EM field data to audible frequencies",
                "frequency_scaling": "Multiply by 50-100 to reach audible range",
                "amplitude_mapping": "Log scale for field strength perception",
                "harmonic_content": "Preserve natural harmonic relationships"
            },
            "implementation_code": self.examples_cache.get("em-field-visualization.html", "")
        }

        return patterns

    def get_adhd_protocol_patterns(self) -> Dict[str, Any]:
        """
        Extract ADHD treatment patterns from adhd-protocol-example.html.

        Returns:
            Dictionary containing ADHD-specific audio protocols
        """
        patterns = {
            "focus_enhancement": {
                "description": "Beta wave entrainment for attention improvement",
                "target_frequencies": {
                    "low_beta": "12-15 Hz for relaxed focus",
                    "mid_beta": "15-20 Hz for active concentration",
                    "high_beta": "20-30 Hz for intense focus"
                },
                "session_structure": {
                    "warmup": "5 min alpha waves (8-12 Hz)",
                    "main_session": "20-30 min beta waves",
                    "cooldown": "5 min alpha waves"
                },
                "progression_protocol": [
                    "Week 1-2: 12-15 Hz for adaptation",
                    "Week 3-4: 15-18 Hz for building focus",
                    "Week 5+: 18-22 Hz for sustained attention"
                ]
            },
            "cognitive_load_balancing": {
                "description": "Managing mental workload through audio",
                "techniques": [
                    "Alternating beta frequencies",
                    "Binaural beat ramping",
                    "Isochronic tone pulsing",
                    "Background pink noise"
                ],
                "adaptation_markers": [
                    "Reduced fidgeting",
                    "Improved task completion",
                    "Longer attention spans",
                    "Better impulse control"
                ]
            },
            "implementation_code": self.examples_cache.get("adhd-protocol-example.html", "")
        }

        return patterns

    def get_professional_audio_patterns(self) -> Dict[str, Any]:
        """
        Extract professional audio patterns from audiokit and qt-multimedia references.

        Returns:
            Dictionary containing professional audio engine implementation patterns
        """
        patterns = {
            "audiokit_patterns": {
                "description": "iOS AudioKit framework patterns",
                "key_concepts": [
                    "AKOscillator for precise frequency generation",
                    "AKMixer for multi-channel mixing",
                    "AKReverb for spatial audio effects",
                    "AKSequencer for timed audio events",
                    "AKAudioEngine for low-latency processing"
                ],
                "best_practices": [
                    "Use AKSettings for global audio configuration",
                    "Implement proper audio session management",
                    "Handle interruptions gracefully",
                    "Optimize for battery life"
                ],
                "performance_tips": [
                    "Pre-allocate audio buffers",
                    "Use hardware-accelerated processing",
                    "Minimize allocations in audio callbacks",
                    "Profile with Instruments"
                ]
            },
            "qt_multimedia_patterns": {
                "description": "Cross-platform Qt multimedia framework",
                "audio_engine": [
                    "QAudioOutput for playback",
                    "QAudioInput for recording",
                    "QMediaPlayer for file playback",
                    "QSoundEffect for low-latency sounds"
                ],
                "threading_model": [
                    "Audio processing on dedicated thread",
                    "UI updates via signal/slot mechanism",
                    "Lock-free data structures for real-time",
                    "Buffer management in producer-consumer pattern"
                ],
                "platform_optimization": [
                    "ASIO drivers on Windows",
                    "Core Audio on macOS",
                    "ALSA/PulseAudio on Linux",
                    "Hardware abstraction layer"
                ]
            },
            "audiokit_reference": self.examples_cache.get("audiokit-audioengine-reference.md", ""),
            "qt_engine_reference": self.examples_cache.get("qt-multimedia-audioengine-reference.md", ""),
            "qt_input_reference": self.examples_cache.get("qt-multimedia-audioinput-reference.md", "")
        }

        return patterns

    def get_all_patterns(self) -> Dict[str, Any]:
        """
        Get comprehensive patterns from all audio examples.

        Returns:
            Dictionary containing all integrated audio patterns
        """
        return {
            "binaural_beats": self.get_binaural_patterns(),
            "streaming": self.get_streaming_patterns(),
            "em_field": self.get_em_field_patterns(),
            "adhd_protocol": self.get_adhd_protocol_patterns(),
            "professional_audio": self.get_professional_audio_patterns(),
            "loaded_files": list(self.examples_cache.keys()),
            "integration_timestamp": "2024-01-01T00:00:00Z"
        }

    def extract_code_snippets(self, file_type: str) -> List[str]:
        """
        Extract code snippets from example files.

        Args:
            file_type: Type of code to extract (js, html, python, etc.)

        Returns:
            List of extracted code snippets
        """
        snippets = []

        for filename, content in self.examples_cache.items():
            if file_type.lower() in filename.lower():
                # Extract code blocks based on file type
                if filename.endswith('.js'):
                    # Extract JavaScript functions
                    lines = content.split('\n')
                    current_function = []
                    in_function = False

                    for line in lines:
                        if 'function' in line or '=>' in line:
                            in_function = True
                            current_function = [line]
                        elif in_function:
                            current_function.append(line)
                            if '}' in line and len(current_function) > 1:
                                snippets.append('\n'.join(current_function))
                                current_function = []
                                in_function = False

                elif filename.endswith('.html'):
                    # Extract script blocks
                    script_start = content.find('<script>')
                    while script_start != -1:
                        script_end = content.find('</script>', script_start)
                        if script_end != -1:
                            script_content = content[script_start+8:script_end]
                            snippets.append(script_content.strip())
                            script_start = content.find('<script>', script_end)
                        else:
                            break

        return snippets

    def get_frequency_presets(self) -> Dict[str, Dict[str, Any]]:
        """
        Extract frequency presets from all examples.

        Returns:
            Dictionary of frequency presets for different purposes
        """
        presets = {
            "meditation_deep": {
                "base_frequency": 110,
                "beat_frequencies": [4, 6, 8],
                "brainwave_target": "theta",
                "description": "Deep meditative state",
                "duration": 1800,  # 30 minutes
                "source": "General meditation practices"
            },
            "focus_adhd": {
                "base_frequency": 200,
                "beat_frequencies": [14, 18, 22],
                "brainwave_target": "beta",
                "description": "ADHD focus enhancement",
                "duration": 1800,
                "source": "adhd-protocol-example.html"
            },
            "sleep_induction": {
                "base_frequency": 90,
                "beat_frequencies": [1, 2, 3],
                "brainwave_target": "delta",
                "description": "Natural sleep induction",
                "duration": 3600,  # 60 minutes
                "source": "Sleep research"
            },
            "lucid_dreaming": {
                "base_frequency": 150,
                "beat_frequencies": [40, 42],
                "brainwave_target": "gamma",
                "description": "Lucid dream induction",
                "duration": 900,  # 15 minutes
                "source": "Lucid dreaming research"
            },
            "schumann_resonance": {
                "base_frequency": 392,  # G4 * 50 (7.84 Hz * 50)
                "beat_frequencies": [7.83],
                "brainwave_target": "earth_frequency",
                "description": "Earth's electromagnetic field",
                "duration": 2700,  # 45 minutes
                "source": "em-field-visualization.html"
            }
        }

        return presets

# Global instance
examples_integrator = ExamplesIntegrator()

def get_examples_integrator() -> ExamplesIntegrator:
    """Get the global examples integrator instance."""
    return examples_integrator