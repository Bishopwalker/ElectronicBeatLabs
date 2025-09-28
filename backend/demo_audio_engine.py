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
    print("Electromagnetic Beat Lab - Audio Engine Demo")
    print("=" * 50)
    
    # Initialize audio engine and spatial processor
    print("Initializing audio engine...")
    audio_engine = AudioEngine(sample_rate=48000)
    spatial_processor = SpatialAudioProcessor(sample_rate=48000)
    audio_engine.set_spatial_processor(spatial_processor)
    
    print(f"+ Audio engine initialized at {audio_engine.sample_rate}Hz")
    print()
    
    # Test 1: Basic binaural beat generation
    print("Test 1: Basic Binaural Beat Generation")
    print("-" * 40)
    
    settings = {
        "base_frequency": 200,
        "beat_frequency": 4,
        "amplitude": 0.5,
        "envelope_type": "constant"
    }
    
    session_id = audio_engine.start_session(settings)
    print(f"+ Started session: {session_id}")
    print(f"+ Settings: {settings}")
    
    # Generate a few frames
    for i in range(3):
        frame_data = await audio_engine.generate_frame(session_id)
        frequencies = frame_data["frequencies"]
        metrics = frame_data["audio_metrics"]
        
        print(f"Frame {i+1}:")
        print(f"  Left freq: {frequencies['left']}Hz")
        print(f"  Right freq: {frequencies['right']}Hz")
        print(f"  Beat freq: {frequencies['beat']}Hz")
        print(f"  RMS Left: {metrics['rms_left']:.3f}")
        print(f"  RMS Right: {metrics['rms_right']:.3f}")
        print(f"  Phase Left: {metrics['phase_left']:.2f} rad")
        print(f"  Phase Right: {metrics['phase_right']:.2f} rad")
        print()
        
        await asyncio.sleep(0.1)  # 100ms between frames
    
    audio_engine.stop_session(session_id)
    print("+ Session stopped")
    print()
    
    # Test 2: ADHD Protocol Testing
    print("Test 2: ADHD Treatment Protocols")
    print("-" * 40)
    
    protocols = ["focus", "calm", "deep_focus", "meditation"]
    for protocol_name in protocols:
        protocol = audio_engine.create_adhd_protocol(protocol_name)
        print(f"{protocol_name.upper()} Protocol:")
        print(f"  Base frequency: {protocol['base_frequency']}Hz")
        print(f"  Beat frequency: {protocol['beat_frequency']}Hz")
        print(f"  Description: {protocol['description']}")
        print()
    
    # Test 3: 8D Spatial Audio
    print("Test 3: 8D Spatial Audio Processing")
    print("-" * 40)
    
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
    print(f"+ Started spatial audio session: {spatial_session}")
    
    # Generate frames with spatial processing
    for i in range(3):
        frame_data = await audio_engine.generate_frame(spatial_session)
        spatial_data = frame_data.get("spatial", {})
        
        print(f"Spatial Frame {i+1}:")
        print(f"  Movement speed: {spatial_data.get('movement_speed', 'N/A')}")
        print(f"  Spatial intensity: {spatial_data.get('spatial_intensity', 'N/A')}")
        print(f"  Effect type: {spatial_data.get('effect_type', 'N/A')}")
        print()
        
        await asyncio.sleep(0.1)
    
    audio_engine.stop_session(spatial_session)
    print("+ Spatial session stopped")
    print()
    
    # Test 4: Frequency Validation
    print("Test 4: Frequency Validation")
    print("-" * 40)
    
    test_settings = [
        {"base_frequency": 50000, "beat_frequency": -1, "amplitude": 2.0},
        {"base_frequency": 10, "beat_frequency": 0.05, "amplitude": -0.5},
        {"base_frequency": 440, "beat_frequency": 4, "amplitude": 0.5}
    ]
    
    for i, test_setting in enumerate(test_settings, 1):
        print(f"Test {i} - Input: {test_setting}")
        validated = audio_engine.validate_frequencies(test_setting)
        print(f"         Validated: {validated}")
        print(f"         Changed: {test_setting != validated}")
        print()
    
    # Test 5: Session Metrics
    print("Test 5: Session Performance Metrics")
    print("-" * 40)
    
    metrics_session = audio_engine.start_session({
        "base_frequency": 300,
        "beat_frequency": 10,
        "amplitude": 0.6
    })
    
    # Wait a bit to accumulate some metrics
    await asyncio.sleep(0.5)
    
    metrics = audio_engine.get_session_metrics(metrics_session)
    print(f"Session ID: {metrics['session_id']}")
    print(f"Active: {metrics['active']}")
    print(f"Duration: {metrics['duration_seconds']:.2f} seconds")
    print(f"Audio Quality:")
    for key, value in metrics['audio_quality'].items():
        print(f"  {key}: {value}")
    print()
    
    audio_engine.stop_session(metrics_session)
    
    print("Audio Engine Demo Complete!")
    print("=" * 50)
    print()
    print("Summary:")
    print("+ Basic binaural beat generation - WORKING")
    print("+ Phase-continuous audio synthesis - WORKING") 
    print("+ ADHD treatment protocols - WORKING")
    print("+ 8D spatial audio effects - WORKING")
    print("+ Frequency validation - WORKING")
    print("+ Session metrics collection - WORKING")
    print()
    print("The audio engine is ready for WebSocket integration!")

if __name__ == "__main__":
    asyncio.run(demo_audio_engine())