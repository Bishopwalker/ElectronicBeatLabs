# Session Context: EBL Audio Engine Debug - October 26, 2025

## SESSION OVERVIEW
**Duration:** ~45 minutes
**Focus:** Debugging audio engine crashes and volume spikes
**Result:** Fixed 5 critical bugs, 1 issue remains (audio cutoff)

## BUGS FIXED ✅

### 1. smoothingTimeConstant IndexSizeError
**File:** `src/hooks/useAudioEngine.ts:301`
**Bug:** `analyserNodeRef.current.smoothingTimeConstant = Date.now() * 0.8;`
- Date.now() returns ~1,761,532,000,000 (milliseconds since 1970)
- Multiplied by 0.8 = ~1.4 trillion
- smoothingTimeConstant must be between 0 and 1
**Fix:** Changed to `0.8`
**Impact:** Eliminated IndexSizeError crashes

### 2. AudioMixer Backend Volume Spike
**File:** `src/utils/AudioMixer.ts:33`
**Bug:** Both engines started at 50% volume
```javascript
this.frontendGain.gain.value = 0.5;
this.backendGain.gain.value = 0.5;  // Should be 0!
```
**Fix:** Backend now starts muted (0.0)
**Impact:** No more volume doubling when backend connects

### 3. AudioMixer Undefined Mode
**File:** `src/utils/AudioMixer.ts:21`
**Bug:** `private currentMode: 'hybrid'|'frontend' | 'backend';` (undefined)
**Fix:** Initialize to `'frontend'`
**Impact:** Volume calculations now work correctly

### 4. Multiple If Conditions Executing
**File:** `src/utils/AudioMixer.ts:119-132`
**Bug:** Three separate if statements all executed
**Fix:** Changed to if-else if-else if chain
**Impact:** Only one volume calculation runs

### 5. Wrong Mode After Crossfade
**File:** `src/utils/AudioMixer.ts:193`
**Bug:** Set to 'hybrid' after crossfade to backend
**Fix:** Correctly sets to 'backend'
**Impact:** Proper volume management after crossfade

## REMAINING ISSUE ❌

### Audio Cutoff Problem
**User Report:** "cutting off sound again"
**Symptoms:**
- Audio plays initially
- Cuts off at unknown time
- Possible clicking/popping before cutoff

**Console Evidence:**
```
[Violation] 'message' handler took 605ms
[Violation] 'message' handler took 412ms
```

**Likely Causes:**
1. Buffer underruns in AudioWorklet
2. WebSocket processing blocking main thread
3. Sample rate mismatch (48kHz vs 44.1kHz)

## TECHNICAL ANALYSIS

### WebSocket Performance Issue
- Messages taking 400-600ms to process
- Should be <16ms for 60 FPS
- Blocking causes buffer starvation

### Buffer Configuration (Current)
```javascript
// backend-audio-processor.js
this.minBufferSize = frameSamples * 40;    // ~667ms
this.targetBufferSize = frameSamples * 60;  // ~1000ms
this.maxBufferSize = frameSamples * 180;    // ~3000ms
```

### Recommended Fix
Increase buffers to handle slow processing:
```javascript
this.minBufferSize = frameSamples * 80;     // ~1333ms
this.targetBufferSize = frameSamples * 120; // ~2000ms
this.maxBufferSize = frameSamples * 300;    // ~5000ms
```

## USER INTERACTION LOG

### Initial Report
"3 sets of LOGS. USER IMPRESSION: There is first an amplification of frequency once the backend kicks in. Then after a minute you get popping and clicking and what sounds like a mixing of frequencies"

### Problems Described
1. Volume amplification (FIXED)
2. Clicking/popping after 1 minute (ONGOING)
3. Frequency mixing in same channel (NEEDS INVESTIGATION)
4. Audio cutting off (CURRENT ISSUE)

## FILES MODIFIED

1. **src/hooks/useAudioEngine.ts**
   - Line 301: Fixed smoothingTimeConstant

2. **src/utils/AudioMixer.ts**
   - Line 21: Initialize currentMode
   - Line 33: Backend starts muted
   - Lines 127-131: Fixed if-else chain
   - Line 193: Correct mode after crossfade

## NEXT STEPS FOR DEBUGGING

### 1. Immediate Diagnostics
```javascript
// Run in browser console when audio cuts
console.log({
  audioState: window.hybridEngine?.audioState,
  bufferHealth: "Check AudioWorklet logs",
  wsConnected: window.hybridEngine?.backendConnected,
  mixerGains: window.hybridEngine?.mixer?.getGainValues()
});
```

### 2. Check AudioWorklet Buffer
Look for these logs:
- "⚠️ UNDERRUN #X! Buffer below threshold"
- "Buffer: X/Y samples"
- "📊 Status: Buffer=Xms"

### 3. Files to Investigate
- `public/backend-audio-processor.js` - Buffer management
- `src/hooks/useBackendAudioEngine.ts` - WebSocket handling
- `backend/services/audio_service.py` - Frame generation

## PROJECT STATE
- **Frontend:** http://localhost:5173 (running)
- **Backend:** http://localhost:8000 (running)
- **Both servers confirmed active via netstat**
- **User needs to refresh browser after fixes**

## COMMUNICATION NOTES
- User prefers Gordon Ramsay style (brutal honesty)
- Standard terms: My Dude, Cash Money, Yung Nigga, Millionaire
- Special term "Bishop" for breakthroughs
- User claims inexperience but has complex app
- Expects "Russian Olympic Judge Standard" quality

---

**END OF SESSION** - Audio cutoff issue pending resolution