"""
Test suite for the enhanced audio engine
"""

import pytest
import asyncio
import numpy as np
from core.audio_engine import AudioEngine
from modules.spatial_audio import SpatialAudioProcessor

class TestAudioEngine:
    """Test cases for the AudioEngine class"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.audio_engine = AudioEngine(sample_rate=44100)
        self.spatial_processor = SpatialAudioProcessor(sample_rate=44100)
        self.audio_engine.set_spatial_processor(self.spatial_processor)
    
    def test_audio_engine_initialization(self):
        """Test audio engine initializes correctly"""
        assert self.audio_engine.sample_rate == 44100
        assert self.audio_engine.sessions == {}
        assert not self.audio_engine.running
        assert self.audio_engine.spatial_processor is not None
    
    def test_start_session(self):
        """Test starting an audio session"""
        settings = {
            "base_frequency": 200,
            "beat_frequency": 4,
            "amplitude": 0.5
        }
        
        session_id = self.audio_engine.start_session(settings)
        
        assert session_id is not None
        assert len(session_id) > 0
        assert session_id in self.audio_engine.sessions
        assert self.audio_engine.running
        
        session = self.audio_engine.sessions[session_id]
        assert session["settings"] == settings
        assert session["active"] is True
        assert "start_time" in session
        assert session["phase_left"] == 0
        assert session["phase_right"] == 0
    
    def test_stop_session(self):
        """Test stopping an audio session"""
        settings = {"base_frequency": 200, "beat_frequency": 4}
        session_id = self.audio_engine.start_session(settings)
        
        # Session should be running
        assert self.audio_engine.running
        assert session_id in self.audio_engine.sessions
        
        # Stop the session
        self.audio_engine.stop_session(session_id)
        
        # Session should be stopped
        assert session_id not in self.audio_engine.sessions
        assert not self.audio_engine.running
    
    def test_validate_frequencies(self):
        """Test frequency validation"""
        # Test normal frequencies
        settings = {
            "base_frequency": 200,
            "beat_frequency": 4,
            "amplitude": 0.5
        }
        validated = self.audio_engine.validate_frequencies(settings)
        assert validated["base_frequency"] == 200
        assert validated["beat_frequency"] == 4
        assert validated["amplitude"] == 0.5
        
        # Test out of range frequencies
        settings = {
            "base_frequency": 50000,  # Too high
            "beat_frequency": -1,     # Too low
            "amplitude": 2.0          # Too high
        }
        validated = self.audio_engine.validate_frequencies(settings)
        assert validated["base_frequency"] <= 20000
        assert validated["beat_frequency"] >= 0.1
        assert validated["amplitude"] <= 1.0
        
        # Test very low frequencies
        settings = {
            "base_frequency": 10,     # Too low
            "beat_frequency": 0.05    # Too low
        }
        validated = self.audio_engine.validate_frequencies(settings)
        assert validated["base_frequency"] >= 20
        assert validated["beat_frequency"] >= 0.1
    
    @pytest.mark.asyncio
    async def test_generate_frame(self):
        """Test audio frame generation"""
        settings = {
            "base_frequency": 200,
            "beat_frequency": 4,
            "amplitude": 0.5
        }
        
        session_id = self.audio_engine.start_session(settings)
        frame_data = await self.audio_engine.generate_frame(session_id)
        
        # Check frame structure
        assert "left" in frame_data
        assert "right" in frame_data
        assert "sample_rate" in frame_data
        assert "frame_size" in frame_data
        assert "frequencies" in frame_data
        assert "audio_metrics" in frame_data
        
        # Check data types and sizes
        assert isinstance(frame_data["left"], list)
        assert isinstance(frame_data["right"], list)
        assert len(frame_data["left"]) == len(frame_data["right"])
        assert frame_data["sample_rate"] == 44100
        
        # Check frequency data
        frequencies = frame_data["frequencies"]
        assert frequencies["left"] == 200
        assert frequencies["right"] == 204  # 200 + 4
        assert frequencies["beat"] == 4
        
        # Check audio metrics
        metrics = frame_data["audio_metrics"]
        assert "rms_left" in metrics
        assert "rms_right" in metrics
        assert "peak_left" in metrics
        assert "peak_right" in metrics
        assert metrics["rms_left"] > 0
        assert metrics["rms_right"] > 0
    
    @pytest.mark.asyncio
    async def test_generate_frame_with_spatial(self):
        """Test audio frame generation with spatial audio"""
        settings = {
            "base_frequency": 200,
            "beat_frequency": 4,
            "amplitude": 0.5,
            "spatial_enabled": True,
            "spatial_settings": {
                "movement_speed": 0.1,
                "spatial_intensity": 0.8,
                "reverb_enabled": True
            }
        }
        
        session_id = self.audio_engine.start_session(settings)
        frame_data = await self.audio_engine.generate_frame(session_id)
        
        # Should have spatial metrics
        assert "spatial" in frame_data
        spatial_metrics = frame_data["spatial"]
        assert "movement_speed" in spatial_metrics
        assert "spatial_intensity" in spatial_metrics
        assert spatial_metrics["effect_type"] == "8D_circular_panning"
    
    def test_create_adhd_protocol(self):
        """Test ADHD protocol creation"""
        # Test focus protocol
        focus = self.audio_engine.create_adhd_protocol("focus")
        assert focus["base_frequency"] == 200
        assert focus["beat_frequency"] == 14  # SMR range
        assert focus["description"] == "SMR training for attention and focus"
        
        # Test meditation protocol
        meditation = self.audio_engine.create_adhd_protocol("meditation")
        assert meditation["base_frequency"] == 80
        assert meditation["beat_frequency"] == 6  # Theta range
        assert meditation["description"] == "Theta waves for meditation and creativity"
        
        # Test unknown protocol (should return focus)
        unknown = self.audio_engine.create_adhd_protocol("unknown")
        assert unknown == focus
    
    def test_get_session_metrics(self):
        """Test session metrics collection"""
        settings = {"base_frequency": 200, "beat_frequency": 4}
        session_id = self.audio_engine.start_session(settings)
        
        metrics = self.audio_engine.get_session_metrics(session_id)
        
        assert "session_id" in metrics
        assert "active" in metrics
        assert "start_time" in metrics
        assert "duration_seconds" in metrics
        assert "current_settings" in metrics
        assert "phases" in metrics
        assert "audio_quality" in metrics
        
        assert metrics["session_id"] == session_id
        assert metrics["active"] is True
        assert metrics["audio_quality"]["sample_rate"] == 44100
    
    @pytest.mark.asyncio
    async def test_phase_continuity(self):
        """Test that phases are continuous between frames"""
        settings = {
            "base_frequency": 200,
            "beat_frequency": 4,
            "amplitude": 0.5
        }
        
        session_id = self.audio_engine.start_session(settings)
        
        # Generate first frame
        frame1 = await self.audio_engine.generate_frame(session_id)
        phase_left_1 = frame1["audio_metrics"]["phase_left"]
        phase_right_1 = frame1["audio_metrics"]["phase_right"]
        
        # Generate second frame
        frame2 = await self.audio_engine.generate_frame(session_id)
        phase_left_2 = frame2["audio_metrics"]["phase_left"]
        phase_right_2 = frame2["audio_metrics"]["phase_right"]
        
        # Phases should have advanced
        assert phase_left_2 != phase_left_1
        assert phase_right_2 != phase_right_1
        
        # Phases should be within reasonable range
        assert 0 <= phase_left_2 <= 2 * np.pi
        assert 0 <= phase_right_2 <= 2 * np.pi

class TestSpatialAudioProcessor:
    """Test cases for the SpatialAudioProcessor class"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.spatial_processor = SpatialAudioProcessor(sample_rate=44100)
    
    def test_spatial_processor_initialization(self):
        """Test spatial processor initializes correctly"""
        assert self.spatial_processor.sample_rate == 44100
        assert self.spatial_processor.sessions == {}
    
    def test_configure_session(self):
        """Test spatial session configuration"""
        session_id = "test_session"
        settings = {
            "movement_speed": 0.1,
            "spatial_intensity": 0.9,
            "reverb_enabled": False
        }
        
        self.spatial_processor.configure_session(session_id, settings)
        
        assert session_id in self.spatial_processor.sessions
        session = self.spatial_processor.sessions[session_id]
        assert session["settings"] == settings
        assert session["movement_speed"] == 0.1
        assert session["spatial_intensity"] == 0.9
        assert session["reverb_enabled"] is False
    
    def test_apply_8d_effect(self):
        """Test 8D spatial audio effect application"""
        session_id = "test_session"
        settings = {
            "movement_speed": 0.08,
            "spatial_intensity": 0.85,
            "reverb_enabled": True
        }
        
        self.spatial_processor.configure_session(session_id, settings)
        
        # Create test audio data
        frame_size = 735  # 44100 / 60
        audio_left = np.sin(2 * np.pi * 200 * np.arange(frame_size) / 44100)
        audio_right = np.sin(2 * np.pi * 204 * np.arange(frame_size) / 44100)
        
        # Apply spatial effect
        left_processed, right_processed = self.spatial_processor.apply_8d_effect(
            audio_left, audio_right, session_id
        )
        
        # Check that audio was processed
        assert len(left_processed) == len(audio_left)
        assert len(right_processed) == len(audio_right)
        assert not np.array_equal(left_processed, audio_left)  # Should be modified
        assert not np.array_equal(right_processed, audio_right)  # Should be modified
    
    def test_get_spatial_metrics(self):
        """Test spatial metrics retrieval"""
        session_id = "test_session"
        settings = {
            "movement_speed": 0.08,
            "spatial_intensity": 0.85,
            "reverb_enabled": True
        }
        
        self.spatial_processor.configure_session(session_id, settings)
        metrics = self.spatial_processor.get_spatial_metrics(session_id)
        
        assert "movement_speed" in metrics
        assert "spatial_intensity" in metrics
        assert "reverb_enabled" in metrics
        assert "effect_type" in metrics
        assert metrics["movement_speed"] == 0.08
        assert metrics["spatial_intensity"] == 0.85
        assert metrics["effect_type"] == "8D_circular_panning"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])