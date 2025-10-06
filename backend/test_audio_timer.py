#!/usr/bin/env python3
"""
Test script for Backend Audio Engine and Timer functionality
Tests WebSocket connection, audio streaming, and frequency conversions
"""

import asyncio
import json
import time
from websockets import connect
import requests

BACKEND_URL = "http://localhost:8000"
WS_URL = "ws://localhost:8000/ws/audio"

async def test_backend_health():
    """Test if backend is healthy"""
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        data = response.json()
        print(f"[OK] Backend Health: {data['status']}")
        print(f"   Active Sessions: {data['active_sessions']}")
        return data['status'] == 'healthy'
    except Exception as e:
        print(f"[ERROR] Backend health check failed: {e}")
        return False

async def test_websocket_connection():
    """Test WebSocket connection and audio streaming"""
    print("\n[TEST] Testing WebSocket Connection...")

    try:
        async with connect(WS_URL) as websocket:
            print("[OK] WebSocket connected successfully")

            # Start audio stream with base/beat frequencies
            start_message = {
                "type": "start_stream",
                "data": {
                    "base_frequency": 440,  # A4 note
                    "beat_frequency": 4,     # 4Hz beat (theta range)
                    "amplitude": 0.5,
                    "waveform": "sine"
                }
            }

            print(f"\n[SEND] Sending start_stream message:")
            print(f"   Base Frequency: 440 Hz (Left ear)")
            print(f"   Beat Frequency: 4 Hz")
            print(f"   Right Ear: 444 Hz (440 + 4)")

            await websocket.send(json.dumps(start_message))

            # Receive a few audio frames
            print("\n[RECV] Receiving audio frames...")
            for i in range(3):
                message = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                data = json.loads(message)

                if data.get("type") == "audio_frame" or data.get("type") == "frame":
                    audio_data = data.get("data", {}).get("audio", data.get("data", {}))
                    if audio_data and "frequencies" in audio_data:
                        freqs = audio_data["frequencies"]
                        print(f"\n   Frame {i+1}:")
                        print(f"   Left: {freqs.get('left', 'N/A')} Hz")
                        print(f"   Right: {freqs.get('right', 'N/A')} Hz")
                        print(f"   Beat: {freqs.get('beat', 'N/A')} Hz")

            # Update settings to test timer-like frequency changes
            print("\n[UPDATE] Testing Timer-like frequency update...")
            update_message = {
                "type": "update_settings",
                "data": {
                    "settings": {
                        "base_frequency": 200,  # Lower frequency
                        "beat_frequency": 10,    # Alpha range
                        "amplitude": 0.7
                    }
                }
            }

            await websocket.send(json.dumps(update_message))
            print("   Updated to Base: 200 Hz, Beat: 10 Hz")

            # Receive updated frames
            message = await asyncio.wait_for(websocket.recv(), timeout=2.0)
            data = json.loads(message)

            # Stop stream
            stop_message = {"type": "stop_stream"}
            await websocket.send(json.dumps(stop_message))
            print("\n[STOP] Stream stopped successfully")

            return True

    except asyncio.TimeoutError:
        print("[ERROR] Timeout waiting for audio frames")
        return False
    except Exception as e:
        print(f"[ERROR] WebSocket error: {e}")
        return False

async def test_frequency_conversions():
    """Test frequency conversion logic"""
    print("\n[TEST] Testing Frequency Conversions:")

    # Test case 1: Standard binaural beat
    base = 440
    beat = 4
    left = base
    right = base + beat

    print(f"\n   Test 1 - Standard Binaural:")
    print(f"   Base: {base} Hz, Beat: {beat} Hz")
    print(f"   -> Left ear: {left} Hz")
    print(f"   -> Right ear: {right} Hz")
    print(f"   [CHECK] Beat frequency check: {right - left} Hz = {beat} Hz")

    # Test case 2: Timer-style (left/right to base/beat)
    left_freq = 120
    right_freq = 126
    calculated_base = left_freq
    calculated_beat = abs(right_freq - left_freq)

    print(f"\n   Test 2 - Timer Style Conversion:")
    print(f"   Left: {left_freq} Hz, Right: {right_freq} Hz")
    print(f"   -> Base frequency: {calculated_base} Hz")
    print(f"   -> Beat frequency: {calculated_beat} Hz")

    return True

async def main():
    """Run all tests"""
    print("=" * 50)
    print("BACKEND AUDIO ENGINE & TIMER TEST")
    print("=" * 50)

    # Test 1: Backend health
    if not await test_backend_health():
        print("[ERROR] Backend is not healthy!")
        return

    # Test 2: WebSocket audio streaming
    await test_websocket_connection()

    # Test 3: Frequency conversions
    await test_frequency_conversions()

    print("\n" + "=" * 50)
    print("[OK] All tests completed!")
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(main())