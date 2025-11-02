#!/usr/bin/env python3
"""
Electromagnetic Beat Lab (EBL) - Audio Engine Demo
Standalone demo to test the enhanced audio engine functionality
"""

import asyncio
import numpy as np
import time
from core.audio_engine import AudioEngine
from modules.spatial_audio import SpatialAudioProcessor

async def demo_audio_engine():
    """Demonstrate the audio engine capabilities"""
    
    # Initialize audio engine and spatial processor
    audio_engine = AudioEngine(sample_rate=48000)
    spatial_processor = SpatialAudioProcessor(sample_rate=48000)
    audio_engine.set_spatial_processor(spatial_processor)

    # Test 1: Basic binaural beat generation
    
    settings = {
        "base_frequency": 144,
        "beat_frequency": 4,
        "amplitude": 0.5,
        "envelope_type": "constant"
    }
    
    session_id = audio_engine.start_session(settings)
    
    # Generate a few frames
    for i in range(3):
        frame_data = await audio_engine.generate_frame(session_id)
        frequencies = frame_data["frequencies"]
        metrics = frame_data["audio_metrics"]

        await asyncio.sleep(0.1)  # 100ms between frames
    
    audio_engine.stop_session(session_id)
    
    # Test 2: ADHD Protocol Testing
    
    protocols = ["focus", "calm", "deep_focus", "meditation"]
    for protocol_name in protocols:
        protocol = audio_engine.create_adhd_protocol(protocol_name)
    
    # Test 3: 8D Spatial Audio
    
    spatial_settings = {
        "base_frequency": 150,
        "beat_frequency": 8,
        "amplitude": 0.4,
        "spatial_enabled": True,
        "spatial_settings": {
            "movement_speed": 0.1,
            "spatial_intensity": 0.8,
            "reverb_enabled": True
        }
    }
    
    spatial_session = audio_engine.start_session(spatial_settings)
    
    # Generate frames with spatial processing
    for i in range(3):
        frame_data = await audio_engine.generate_frame(spatial_session)
        spatial_data = frame_data.get("spatial", {})

        await asyncio.sleep(0.1)
    
    audio_engine.stop_session(spatial_session)
    
    # Test 4: Frequency Validation
    
    test_settings = [
        {"base_frequency": 50000, "beat_frequency": -1, "amplitude": 2.0},
        {"base_frequency": 10, "beat_frequency": 0.05, "amplitude": -0.5},
        {"base_frequency": 440, "beat_frequency": 4, "amplitude": 0.5}
    ]
    
    for i, test_setting in enumerate(test_settings, 1):
        validated = audio_engine.validate_frequencies(test_setting)
    
    # Test 5: Session Metrics
    
    metrics_session = audio_engine.start_session({
        "base_frequency": 100,
        "beat_frequency": 10,
        "amplitude": 0.6
    })
    
    # Wait a bit to accumulate some metrics
    await asyncio.sleep(0.5)
    
    metrics = audio_engine.get_session_metrics(metrics_session)
    for key, value in metrics['audio_quality'].items():
    
    audio_engine.stop_session(metrics_session)

if __name__ == "__main__":
    asyncio.run(demo_audio_engine())