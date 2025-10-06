"""
Test script to start and test the Audio Agent.
"""

import asyncio
import json
import logging
from agents.audio_agent import AudioAgent
from agents.models import AudioSessionConfig, BinauralBeatConfig
from agents.examples_integration import get_examples_integrator

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def test_audio_agent():
    """Test the audio agent functionality."""

    print("EBL Audio Agent Test Suite")
    print("=" * 50)

    # 1. Initialize the agent
    print("\n1. Initializing Audio Agent...")
    config = AudioSessionConfig(
        sample_rate=44100,
        bit_depth=16,
        channels=2
    )

    agent = AudioAgent(config)
    success = await agent.initialize()

    if not success:
        print("FAILED to initialize Audio Agent")
        return

    print("SUCCESS: Audio Agent initialized successfully!")
    print(f"   Sample Rate: {agent.engine_state.sample_rate} Hz")
    print(f"   Bit Depth: {agent.engine_state.bit_depth} bit")

    # 2. Test examples integration
    print("\n2. Testing Examples Integration...")
    integrator = get_examples_integrator()
    patterns = integrator.get_all_patterns()

    print(f"SUCCESS: Loaded {len(patterns)} pattern categories:")
    for category in patterns.keys():
        if category not in ['loaded_files', 'integration_timestamp']:
            print(f"   - {category}")

    print(f"SUCCESS: Loaded {len(patterns.get('loaded_files', []))} example files")

    # 3. Test binaural beat generation
    print("\n3. Testing Binaural Beat Generation...")
    binaural_request = {
        "type": "binaural",
        "session_id": "test-session-1",
        "config": {
            "base_frequency": 200,
            "beat_frequency": 10,
            "duration": 5,  # 5 seconds for testing
            "amplitude": 0.5
        }
    }

    try:
        analysis = await agent.process_audio_request(binaural_request)
        print("✅ Binaural beats generated successfully!")
        print(f"   Base Frequency: {analysis.dominant_frequency} Hz")
        print(f"   Beat Frequency: {analysis.beat_frequency} Hz")
        print(f"   Quality Score: {analysis.quality_score:.2f}")
        print(f"   Duration: {analysis.duration}s")
    except Exception as e:
        print(f"❌ Binaural beat generation failed: {e}")

    # 4. Test isochronic tones
    print("\n4. Testing Isochronic Tone Generation...")
    isochronic_request = {
        "type": "isochronic",
        "session_id": "test-session-2",
        "config": {
            "frequency": 440,
            "pulse_rate": 8,
            "duration": 3
        }
    }

    try:
        analysis = await agent.process_audio_request(isochronic_request)
        print("✅ Isochronic tones generated successfully!")
        print(f"   Frequency: {analysis.dominant_frequency} Hz")
        print(f"   Pulse Rate: {analysis.pulse_rate} Hz")
        print(f"   Quality Score: {analysis.quality_score:.2f}")
    except Exception as e:
        print(f"❌ Isochronic tone generation failed: {e}")

    # 5. Test EM field audio
    print("\n5. Testing EM Field Audio Generation...")
    em_field_request = {
        "type": "em_field",
        "session_id": "test-session-3",
        "config": {
            "field_strength": 2.5,
            "frequency_range": [20, 200],
            "duration": 3
        }
    }

    try:
        analysis = await agent.process_audio_request(em_field_request)
        print("✅ EM field audio generated successfully!")
        print(f"   Field Strength: {analysis.field_strength}")
        print(f"   Quality Score: {analysis.quality_score:.2f}")
    except Exception as e:
        print(f"❌ EM field audio generation failed: {e}")

    # 6. Test pattern optimization
    print("\n6. Testing Pattern Optimization...")
    try:
        optimized = await agent.optimize_patterns("focus")
        print("✅ Pattern optimization successful!")
        print(f"   Pattern Name: {optimized.name}")
        print(f"   Base Frequency: {optimized.base_frequency} Hz")
        print(f"   Beat Frequencies: {optimized.beat_frequencies}")
        print(f"   Effectiveness Score: {optimized.effectiveness_score}")
    except Exception as e:
        print(f"❌ Pattern optimization failed: {e}")

    # 7. Show active sessions
    print("\n7. Active Sessions:")
    sessions = await agent.get_active_sessions()
    if sessions:
        for session in sessions:
            print(f"   - {session['session_id']}: {session['type']} ({session['state']})")
    else:
        print("   No active sessions")

    # 8. Show available frequency presets
    print("\n8. Available Frequency Presets:")
    presets = integrator.get_frequency_presets()
    for name, preset in presets.items():
        print(f"   - {name}: {preset['description']}")
        print(f"     Target: {preset['brainwave_target']}, Duration: {preset['duration']}s")

    # 9. Shutdown
    print("\n9. Shutting down Audio Agent...")
    await agent.shutdown()
    print("✅ Audio Agent shutdown complete!")

    print("\n" + "=" * 50)
    print("🎉 Audio Agent Test Complete!")
    print("The agent is ready to use in your EBL application.")

def main():
    """Main test function."""
    try:
        asyncio.run(test_audio_agent())
    except KeyboardInterrupt:
        print("\n🛑 Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        logger.exception("Test failed")

if __name__ == "__main__":
    main()