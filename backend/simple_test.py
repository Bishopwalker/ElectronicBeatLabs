"""
Simple test script for Audio Agent - no emoji issues.
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agents.audio_agent import AudioAgent
from agents.models import AudioSessionConfig

async def simple_test():
    print("EBL Audio Agent Simple Test")
    print("-" * 40)

    try:
        # Initialize agent
        print("1. Initializing agent...")
        config = AudioSessionConfig()
        agent = AudioAgent(config)
        success = await agent.initialize()

        if success:
            print("   SUCCESS: Agent initialized")
        else:
            print("   FAILED: Agent initialization failed")
            return

        # Test binaural generation
        print("2. Testing binaural beats...")
        request = {
            "type": "binaural",
            "session_id": "test-1",
            "config": {
                "base_frequency": 200,
                "beat_frequency": 10,
                "duration": 2,
                "amplitude": 0.5
            }
        }

        result = await agent.process_audio_request(request)
        print(f"   SUCCESS: Generated binaural beats")
        print(f"   Base Freq: {result.dominant_frequency} Hz")
        print(f"   Beat Freq: {result.beat_frequency} Hz")
        print(f"   Quality: {result.quality_score:.2f}")

        # Cleanup
        await agent.shutdown()
        print("3. Agent shutdown complete")

        print("-" * 40)
        print("AUDIO AGENT TEST COMPLETE - ALL SYSTEMS GO!")

    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(simple_test())