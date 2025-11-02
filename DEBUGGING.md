# Audio Playback Debugging Guide (IntelliJ IDEA)

**Last Updated:** 2025-10-25

This guide explains how to debug the Electromagnetic Beat Lab audio playback system step-by-step using IntelliJ IDEA.

---

## 🎯 Quick Start - Debug Audio Playback

### 1. Start Development Server with Debugging

```bash
# Terminal 1: Start backend
npm run dev:backend

# Terminal 2: Start frontend with source maps enabled
npm run dev
```

### 2. Enable JavaScript Debugging in IntelliJ

1. **Open Run Configuration:**
   - `Run` → `Edit Configurations...`
   - Click `+` → `JavaScript Debug`

2. **Configure:**
   - **Name:** `Debug EBL Frontend`
   - **URL:** `http://localhost:5173`
   - **Browser:** Chrome (recommended for best debugging)
   - **Ensure JavaScript debugger:** Checked

3. **Save and Run:**
   - Click `Debug` (Shift+F9)
   - IntelliJ will open Chrome with debugging enabled

---

## 🔍 Setting Breakpoints for Audio Playback

### Key Files to Debug

| File | Purpose | Key Functions |
|------|---------|---------------|
| `src/hooks/useHybridAudioEngine.ts` | Main audio control | `startBinauralBeat`, `stopBinauralBeat`, `updateFrequency` |
| `src/hooks/useAudioEngine.ts` | Frontend audio engine | `initializeAudio`, `startBinauralBeat`, `createOscillator` |
| `src/hooks/useBackendAudioEngine.ts` | Backend audio engine | `startBackendSession`, `initializeAudioWorklet` |
| `src/utils/AudioMixer.ts` | Audio mixing/crossfading | `crossfadeToBackend`, `failoverToFrontend` |

### Setting Breakpoints

**Method 1: Click in Gutter**
- Click in the left margin next to line numbers
- Red dot appears = breakpoint set

**Method 2: Keyboard Shortcut**
- Place cursor on line
- Press `Ctrl+F8` (Windows/Linux) or `Cmd+F8` (Mac)

**Method 3: Conditional Breakpoints**
- Right-click on breakpoint dot
- Add condition (e.g., `config.base_frequency > 200`)
- Breakpoint only triggers when condition is true

---

## 📋 Step-by-Step Debugging Workflow

### Scenario 1: Debug Timer Start Audio Playback

**Goal:** Understand the full flow from clicking "Start Timer" to audio playing.

1. **Set Breakpoints:**
   ```typescript
   // useHybridAudioEngine.ts:151 - Start of startBinauralBeat
   const startBinauralBeat = useCallback(async (config: BinauralBeatConfig) => {
     debugger; // <- Set breakpoint here

   // useAudioEngine.ts:214 - Frontend engine starts
   const startBinauralBeat = useCallback(async (config: BinauralBeatConfig) => {
     debugger; // <- Set breakpoint here

   // AudioMixer.ts:157 - Crossfade begins
   crossfadeToBackend(duration: number = 2.0): void {
     debugger; // <- Set breakpoint here
   ```

2. **Start Debugging:**
   - Click "Start Timer" in the app
   - IntelliJ pauses at first breakpoint

3. **Inspect Variables:**
   - **Variables Panel** (bottom) shows all local variables
   - Hover over any variable to see its value
   - Expand objects to see properties

4. **Step Through Code:**
   - **F8** (Step Over) - Execute current line, move to next
   - **F7** (Step Into) - Enter function calls
   - **Shift+F8** (Step Out) - Exit current function
   - **F9** (Resume) - Continue to next breakpoint

5. **Watch Expressions:**
   - Right-click variable → "Add to Watches"
   - Monitor values as you step through code

---

### Scenario 2: Debug AudioContext Creation

**Goal:** Verify only ONE AudioContext is created (not duplicates).

1. **Set Breakpoint:**
   ```typescript
   // useAudioEngine.ts:105 - Where AudioContext is created
   console.log('🎵 Creating new persistent audio context...');
   debugger; // <- Set breakpoint here
   ```

2. **Start Timer:**
   - Watch console for "Creating new persistent audio context..."
   - Should only trigger ONCE
   - If triggers twice, check call stack to see why

3. **Inspect Call Stack:**
   - **Call Stack Panel** shows function call chain
   - Trace back to see where duplicate call originated

4. **Verify Safeguards:**
   - Check `audioContextRef.current` (should be null first time)
   - Check `initializingRef.current` (should be false)
   - Step through safeguard logic

---

### Scenario 3: Debug Crossfade Issues

**Goal:** Verify smooth crossfade from frontend → backend.

1. **Set Breakpoints:**
   ```typescript
   // AudioMixer.ts:157 - Start of crossfade
   crossfadeToBackend(duration: number = 2.0): void {
     debugger; // <- Set breakpoint here
   ```

2. **Inspect State:**
   - Check `this.frontendGain.gain.value` (should be 0.5)
   - Check `this.backendGain.gain.value` (should be 0.0)
   - Verify `this.audioContext.currentTime`

3. **Step Through Crossfade:**
   - Watch gain values change over time
   - Verify equal-power curve calculations
   - Check final values after crossfade

---

## 🛠️ Using the Audio Debugger Utility

The global `window.__audioDebugger` provides powerful debugging tools.

### Console Commands

```javascript
// Enable/disable logging
window.__audioDebugger.setEnabled(true);

// Capture current audio state
window.__audioDebugger.captureState(
  audioContext,
  oscillatorL,
  oscillatorR,
  gainL,
  gainR,
  analyser,
  mixer
);

// View recent logs
window.__audioDebugger.getLogHistory(50); // Last 50 logs

// View state history
window.__audioDebugger.getStateHistory(10); // Last 10 snapshots

// Export all debug data to JSON file
window.__audioDebugger.exportDebugData();

// Clear history
window.__audioDebugger.clearHistory();
```

### Example: Debug Session

```javascript
// 1. Open browser console (F12)
// 2. Enable debugger
window.__audioDebugger.setEnabled(true);

// 3. Start timer (audio plays)

// 4. Capture state
const state = window.__audioDebugger.getStateHistory(1)[0];
console.log('Current audio state:', state);

// 5. Export to file for analysis
window.__audioDebugger.exportDebugData();
// Downloads: audio-debug-1234567890.json
```

---

## 🔧 Common Debugging Scenarios

### Issue: No Audio Playing

**Debug Steps:**
1. Set breakpoint in `useAudioEngine.ts:startBinauralBeat`
2. Verify `audioContext.state === 'running'`
3. Check `oscillatorL` and `oscillatorR` are created
4. Verify `gainL.gain.value > 0`
5. Check browser console for errors

**Common Causes:**
- AudioContext suspended (requires user gesture)
- Volume set to 0
- Oscillators not started
- Audio graph not connected

---

### Issue: Duplicate AudioContext Created

**Debug Steps:**
1. Set breakpoint in `useAudioEngine.ts:105` (new AudioContext)
2. Check call stack to see caller
3. Verify `audioContextRef.current === null` (should be true first time)
4. Look for duplicate `useEffect` calls

**Fixed in v1.0:** UseEffect dependencies now stable (`!!frontendEngine.audioContext`)

---

### Issue: Crossfade Not Smooth

**Debug Steps:**
1. Set breakpoint in `AudioMixer.ts:crossfadeToBackend`
2. Inspect gain values before crossfade
3. Step through `exponentialRampToValueAtTime` calls
4. Check `duration` parameter (should be ~2 seconds)
5. Verify both engines are playing

**Tip:** Use `window.__audioDebugger.analyzeFrequencyData(analyser)` to check actual audio output

---

## 📊 Reading Debug Logs

### Log Format

```
[2025-10-25T22:15:49.578Z] [HYBRID_START] Starting binaural beat
   ├─ base_frequency: 144 Hz
   ├─ beat_frequency: 20 Hz
   ├─ volume: 0.5
   └─ waveform: sine
```

### Key Log Categories

| Category | Purpose | Files |
|----------|---------|-------|
| `HYBRID_START` | Hybrid engine starting audio | `useHybridAudioEngine.ts` |
| `SAFEGUARD` | Duplicate prevention logs | `useAudioEngine.ts` |
| `STATE` | Audio state snapshots | `audioDebugger.ts` |
| `DECISION` | Control flow decisions | All hooks |
| `ANALYSIS` | Frequency analysis | `audioDebugger.ts` |

---

## 🎓 Advanced Debugging Techniques

### 1. Network Tab Debugging (WebSocket)

1. Open DevTools → Network tab
2. Filter: `WS` (WebSocket)
3. Click WebSocket connection
4. View **Messages** tab
5. Monitor audio frames streaming

### 2. Performance Profiling

1. Open DevTools → Performance tab
2. Click Record
3. Start timer (play audio)
4. Stop recording after 5 seconds
5. Analyze:
   - Frame drops
   - Long tasks
   - Memory usage

### 3. Memory Leak Detection

1. Open DevTools → Memory tab
2. Take heap snapshot BEFORE starting audio
3. Start audio
4. Take heap snapshot AFTER starting audio
5. Compare snapshots
6. Look for retained AudioContext objects

---

## 📚 Reference Links

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [IntelliJ JavaScript Debugging](https://www.jetbrains.com/help/idea/debugging-javascript-in-chrome.html)
- [AudioWorklet Guide](https://developer.chrome.com/blog/audio-worklet/)

---

## 🚨 Troubleshooting

### Breakpoints Not Hitting

**Solution:**
- Verify source maps enabled (check `vite.config.ts`)
- Reload page with DevTools open
- Check file path matches (Windows vs Unix paths)
- Try setting breakpoint in running debugger

### Variables Show `<unavailable>`

**Solution:**
- Variable may be optimized away
- Use `console.log` as fallback
- Check source maps are loaded
- Try different browser (Chrome recommended)

### IntelliJ Can't Connect

**Solution:**
- Ensure dev server running (`npm run dev`)
- Check port 5173 is accessible
- Disable firewall temporarily
- Try `localhost` instead of `127.0.0.1`

---

**Questions?** Check [TASK.md](./TASK.md) for known issues or add new ones!