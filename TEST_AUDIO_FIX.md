# Audio Engine Fix Test Guide

## 🔧 FIXES APPLIED

### 1. **AudioMixer Volume Fix** ✅
- Changed frontend gain from 0.5 (50%) to 0.8 (80%)
- Changed backend gain from 0.5 (50%) to 0.8 (80%) 
- Fixed crossfade curves to use 0.8 instead of 0.5
- **Result**: Frontend and backend engines now play at normal listening level

### 2. **Backend Audio Processor Buffer Fix** ✅  
- Optimized buffer thresholds to prevent beeping/humming
- Reduced recovery frames from 60 to 30 for faster restart
- Ensured complete silence (0 not 0.0) when not playing
- **Result**: Eliminated beeping/humming from buffer underruns

### 3. **Frequency Visualizer Integration** ⚠️
- The hybrid engine properly provides audioContext and analyserNode
- TimerCountdownDisplay now uses real audio state from hybrid engine
- **Needs Testing**: Verify visualizers work with both engines

## 🧪 TEST STEPS

### Test 1: Frontend Engine Volume
1. Open the app
2. Use Quick Start to enable "Binaural Engine"
3. Set volume to 50%
4. Play a 440Hz tone
5. **Expected**: Normal listening level, not too quiet or loud

### Test 2: Backend Engine Smooth Playback
1. Enable "Backend Engine" in Quick Start
2. Start playing with default settings
3. Listen for 30 seconds
4. **Expected**: Smooth audio, no beeping or humming

### Test 3: Engine Crossfade
1. Start with Frontend Engine playing
2. Enable Backend Engine
3. **Expected**: Smooth 2-second crossfade between engines
4. No volume jump or dropout

### Test 4: Frequency Visualizer
1. Play audio with either engine
2. Check the Frequency Visualizer
3. **Expected**: Animated waveform matching the beat frequency
4. Spectrum display should show activity

### Test 5: Spatial Pattern Visualizer  
1. Enable Backend Engine
2. Select a pattern from Patterns section
3. **Expected**: 3D visualization should animate with the pattern

## 🚨 REMAINING ISSUES TO FIX

1. **Hybrid Engine Analyser Node**: May need to ensure analyserNode is properly passed from AudioMixer to visualizers
2. **WebSocket Session Errors**: Need to handle "Session not found" errors gracefully
3. **Pattern Synchronization**: Patterns8D might not be syncing with backend engine

## 📝 NOTES

- The dual-engine architecture uses AudioMixer to blend between frontend (Web Audio) and backend (WebSocket) engines
- Frontend engine: Instant response, basic binaural beats
- Backend engine: Advanced DSP, spatial audio, complex patterns
- Hybrid engine manages both and provides seamless failover

## 🎯 SUCCESS CRITERIA

✅ No loud/quiet volume issues
✅ No beeping or humming sounds  
✅ Smooth crossfade between engines
✅ Frequency visualizer shows correct waveforms
✅ Spatial visualizer animates with patterns

## 🔄 IF ISSUES PERSIST

1. Check browser console for errors
2. Verify backend is running: `http://localhost:8000/health`
3. Clear browser cache and reload
4. Check audio context state in DevTools
5. Monitor WebSocket messages in Network tab
