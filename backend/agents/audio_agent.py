"""
Audio Processing Agent for EBL System
Handles binaural beats, isochronic tones, and electromagnetic field audio generation
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import numpy as np
from pydantic import BaseModel

from .models import (
    AudioAnalysis,
    AudioSessionConfig,
    AudioEngineState,
    FrequencyPattern,
    BinauralBeatConfig
)
from .tools import (
    generate_binaural_beats,
    generate_isochronic_tones,
    analyze_frequency_spectrum,
    create_em_field_audio,
    validate_audio_parameters,
    optimize_frequency_patterns
)
from .prompts import AUDIO_AGENT_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


class AudioAgent:
    """
    Main audio processing agent that coordinates audio generation and analysis.

    This agent leverages examples from:
    - binauralbeats.html: Web-based binaural beat generation
    - binural.js: JavaScript audio synthesis patterns
    - websocket-streaming-example.js: Real-time audio streaming
    - audiokit-audioengine-reference.md: Professional audio engine patterns
    - qt-multimedia-audioengine-reference.md: Advanced audio processing
    """

    def __init__(self, config: Optional[AudioSessionConfig] = None):
        """
        Initialize the audio agent with optional configuration.

        Args:
            config: Session configuration for audio processing
        """
        self.config = config or AudioSessionConfig()
        self.engine_state = AudioEngineState()
        self.active_sessions: Dict[str, Any] = {}
        self.frequency_cache: Dict[str, FrequencyPattern] = {}

    async def initialize(self) -> bool:
        """
        Initialize the audio agent and prepare audio engine.

        Returns:
            bool: True if initialization successful
        """
        try:
            logger.info("Initializing Audio Agent")

            # Validate audio parameters
            if not validate_audio_parameters(self.config):
                logger.error("Invalid audio configuration")
                return False

            # Set up audio engine state
            self.engine_state.is_initialized = True
            self.engine_state.sample_rate = self.config.sample_rate
            self.engine_state.bit_depth = self.config.bit_depth

            # Load frequency patterns from examples
            await self._load_example_patterns()

            logger.info("Audio Agent initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize Audio Agent: {e}")
            return False

    async def process_audio_request(self, request: Dict[str, Any]) -> AudioAnalysis:
        """
        Process an audio generation or analysis request.

        Args:
            request: Request parameters for audio processing

        Returns:
            AudioAnalysis: Analysis results and generated audio data
        """
        try:
            request_type = request.get("type", "binaural")
            session_id = request.get("session_id", datetime.now().isoformat())

            # Store session
            self.active_sessions[session_id] = {
                "started": datetime.now(),
                "request": request,
                "state": "processing"
            }

            # Route to appropriate handler
            if request_type == "binaural":
                result = await self._process_binaural_request(request)
            elif request_type == "isochronic":
                result = await self._process_isochronic_request(request)
            elif request_type == "em_field":
                result = await self._process_em_field_request(request)
            elif request_type == "analysis":
                result = await self._analyze_audio(request)
            else:
                raise ValueError(f"Unknown request type: {request_type}")

            # Update session state
            self.active_sessions[session_id]["state"] = "completed"
            self.active_sessions[session_id]["result"] = result

            return result

        except Exception as e:
            logger.error(f"Error processing audio request: {e}")
            if session_id in self.active_sessions:
                self.active_sessions[session_id]["state"] = "error"
                self.active_sessions[session_id]["error"] = str(e)
            raise

    async def _process_binaural_request(self, request: Dict[str, Any]) -> AudioAnalysis:
        """
        Generate binaural beats based on request parameters.

        Uses patterns from binauralbeats.html and binural.js examples.
        """
        config = BinauralBeatConfig(**request.get("config", {}))

        # Generate binaural beats
        audio_data = await generate_binaural_beats(
            base_frequency=config.base_frequency,
            beat_frequency=config.beat_frequency,
            duration=config.duration,
            sample_rate=self.engine_state.sample_rate,
            amplitude=config.amplitude
        )

        # Analyze generated audio
        analysis = await analyze_frequency_spectrum(
            audio_data,
            sample_rate=self.engine_state.sample_rate
        )

        return AudioAnalysis(
            session_id=request.get("session_id"),
            audio_type="binaural",
            frequencies=analysis["frequencies"],
            amplitudes=analysis["amplitudes"],
            dominant_frequency=config.base_frequency,
            beat_frequency=config.beat_frequency,
            duration=config.duration,
            quality_score=analysis.get("quality_score", 0.95)
        )

    async def _process_isochronic_request(self, request: Dict[str, Any]) -> AudioAnalysis:
        """
        Generate isochronic tones based on request parameters.
        """
        config = request.get("config", {})

        # Generate isochronic tones
        audio_data = await generate_isochronic_tones(
            frequency=config.get("frequency", 440),
            pulse_rate=config.get("pulse_rate", 10),
            duration=config.get("duration", 60),
            sample_rate=self.engine_state.sample_rate
        )

        # Analyze generated audio
        analysis = await analyze_frequency_spectrum(
            audio_data,
            sample_rate=self.engine_state.sample_rate
        )

        return AudioAnalysis(
            session_id=request.get("session_id"),
            audio_type="isochronic",
            frequencies=analysis["frequencies"],
            amplitudes=analysis["amplitudes"],
            dominant_frequency=config.get("frequency", 440),
            pulse_rate=config.get("pulse_rate", 10),
            duration=config.get("duration", 60),
            quality_score=analysis.get("quality_score", 0.93)
        )

    async def _process_em_field_request(self, request: Dict[str, Any]) -> AudioAnalysis:
        """
        Generate electromagnetic field audio based on request parameters.

        Uses patterns from em-field-visualization.html example.
        """
        config = request.get("config", {})

        # Generate EM field audio
        audio_data = await create_em_field_audio(
            field_strength=config.get("field_strength", 1.0),
            frequency_range=config.get("frequency_range", (20, 20000)),
            duration=config.get("duration", 60),
            sample_rate=self.engine_state.sample_rate
        )

        # Analyze generated audio
        analysis = await analyze_frequency_spectrum(
            audio_data,
            sample_rate=self.engine_state.sample_rate
        )

        return AudioAnalysis(
            session_id=request.get("session_id"),
            audio_type="em_field",
            frequencies=analysis["frequencies"],
            amplitudes=analysis["amplitudes"],
            field_strength=config.get("field_strength", 1.0),
            duration=config.get("duration", 60),
            quality_score=analysis.get("quality_score", 0.91)
        )

    async def _analyze_audio(self, request: Dict[str, Any]) -> AudioAnalysis:
        """
        Analyze existing audio data.
        """
        audio_data = request.get("audio_data")
        if not audio_data:
            raise ValueError("No audio data provided for analysis")

        # Perform frequency analysis
        analysis = await analyze_frequency_spectrum(
            audio_data,
            sample_rate=request.get("sample_rate", self.engine_state.sample_rate)
        )

        return AudioAnalysis(
            session_id=request.get("session_id"),
            audio_type="analysis",
            frequencies=analysis["frequencies"],
            amplitudes=analysis["amplitudes"],
            dominant_frequency=analysis.get("dominant_frequency"),
            quality_score=analysis.get("quality_score", 0.90)
        )

    async def _load_example_patterns(self):
        """
        Load frequency patterns from example files.

        References patterns from:
        - adhd-protocol-example.html: ADHD treatment frequencies
        - binauralbeats.html: Standard binaural patterns
        - binural.js: JavaScript synthesis patterns
        """
        # ADHD protocol frequencies
        self.frequency_cache["adhd_focus"] = FrequencyPattern(
            name="ADHD Focus Enhancement",
            base_frequency=200,
            beat_frequencies=[14, 18, 22],  # Beta waves for focus
            description="Based on ADHD protocol example"
        )

        # Meditation patterns
        self.frequency_cache["deep_meditation"] = FrequencyPattern(
            name="Deep Meditation",
            base_frequency=110,
            beat_frequencies=[4, 6, 8],  # Theta waves
            description="Deep meditative state induction"
        )

        # Sleep patterns
        self.frequency_cache["sleep_induction"] = FrequencyPattern(
            name="Sleep Induction",
            base_frequency=90,
            beat_frequencies=[1, 2, 3],  # Delta waves
            description="Natural sleep induction"
        )

        # Lucid dreaming patterns
        self.frequency_cache["lucid_dream"] = FrequencyPattern(
            name="Lucid Dreaming",
            base_frequency=150,
            beat_frequencies=[40, 42],  # Gamma waves
            description="Lucid dream induction during REM"
        )

        logger.info(f"Loaded {len(self.frequency_cache)} frequency patterns")

    async def get_active_sessions(self) -> List[Dict[str, Any]]:
        """
        Get list of active audio processing sessions.

        Returns:
            List of active session information
        """
        return [
            {
                "session_id": sid,
                "started": session["started"].isoformat(),
                "state": session["state"],
                "type": session["request"].get("type", "unknown")
            }
            for sid, session in self.active_sessions.items()
            if session["state"] != "completed"
        ]

    async def optimize_patterns(self, target: str) -> FrequencyPattern:
        """
        Optimize frequency patterns for specific target outcomes.

        Args:
            target: Target state (focus, meditation, sleep, etc.)

        Returns:
            Optimized frequency pattern
        """
        if target in self.frequency_cache:
            base_pattern = self.frequency_cache[target]
        else:
            # Create default pattern
            base_pattern = FrequencyPattern(
                name=f"Custom {target}",
                base_frequency=150,
                beat_frequencies=[10],
                description=f"Custom pattern for {target}"
            )

        # Optimize pattern based on target
        optimized = await optimize_frequency_patterns(
            base_pattern,
            target_state=target,
            engine_config=self.config
        )

        # Cache optimized pattern
        self.frequency_cache[f"optimized_{target}"] = optimized

        return optimized

    async def shutdown(self):
        """
        Gracefully shutdown the audio agent.
        """
        logger.info("Shutting down Audio Agent")

        # Clean up active sessions
        for session_id in list(self.active_sessions.keys()):
            if self.active_sessions[session_id]["state"] == "processing":
                self.active_sessions[session_id]["state"] = "cancelled"

        # Clear caches
        self.frequency_cache.clear()

        # Update engine state
        self.engine_state.is_initialized = False
        self.engine_state.is_playing = False

        logger.info("Audio Agent shutdown complete")