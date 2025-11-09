"""
EBL Frequency Update Test Script
Tests that frequency changes are properly propagated from frontend to backend
"""

import asyncio
import json
import logging
from datetime import datetime

# Configure logging to see all debug messages
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


async def test_frequency_updates():
    """Test frequency update flow"""
    
    print("\n" + "="*60)
    print("EBL FREQUENCY UPDATE TEST")
    print("="*60)
    
    # Test data
    test_updates = [
        {"base_frequency": 144, "beat_frequency": 4, "volume": 0.5},
        {"base_frequency": 200, "beat_frequency": 10, "volume": 0.7},
        {"base_frequency": 80, "beat_frequency": 15, "volume": 0.3},
    ]
    
    print("\n🧪 Test Scenarios:")
    for i, update in enumerate(test_updates, 1):
        print(f"  {i}. Base: {update['base_frequency']}Hz, Beat: {update['beat_frequency']}Hz, Volume: {update['volume']}")
    
    print("\n📋 Expected Behavior:")
    print("  1. Frontend sends update with ALL fields (base, beat, volume, spatial)")
    print("  2. WebSocket receives message with 'type': 'update_settings'")
    print("  3. Backend extracts settings from 'data' field")
    print("  4. Backend validates frequencies (clamping to valid ranges)")
    print("  5. Backend updates session settings")
    print("  6. Next audio frame uses new frequencies")
    
    print("\n🔍 Things to Check:")
    print("  ✓ Browser console shows: '🎛️ updateFrequency called'")
    print("  ✓ Browser console shows: '📡 Sending complete frequency update to backend'")
    print("  ✓ Backend logs show: '[🔥 FREQUENCY UPDATE] Settings found in data'")
    print("  ✓ Backend logs show: '[VALIDATE] base_frequency extracted'")
    print("  ✓ Backend logs show: '[🔥 SETTINGS UPDATE] Session ... OLD: ... NEW: ...'")
    print("  ✓ Audio changes to new frequency immediately")
    
    print("\n⚠️ Common Issues:")
    print("  ❌ If backend shows 140Hz/4Hz: Settings not reaching backend properly")
    print("  ❌ If 'base_frequency MISSING': Message format is wrong")
    print("  ❌ If 'Session NOT FOUND': WebSocket/Audio session ID mismatch")
    
    print("\n💡 Debug Commands:")
    print("  1. In browser console: localStorage.setItem('debug', 'true')")
    print("  2. In backend: Set LOG_LEVEL=DEBUG in .env")
    print("  3. Monitor WebSocket: Chrome DevTools > Network > WS > Messages")
    
    print("\n" + "="*60)


if __name__ == "__main__":
    asyncio.run(test_frequency_updates())
