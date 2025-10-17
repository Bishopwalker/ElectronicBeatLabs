# 🔧 EMERGENCY DIAGNOSTIC GUIDE

## Issue: No patterns, no websocket, no audio context

### CRITICAL FIX APPLIED

**Problem Found:** Import order error in PatternSelectorMUI.tsx - `WAVE_PATTERNS` was used before it was imported, causing a cascade failure.

**Fixes Applied:**
1. ✅ Moved `WAVE_PATTERNS` import to top of file
2. ✅ Removed duplicate import
3. ✅ Added error handling to PatternPreview
4. ✅ **DISABLED pattern previews by default** (set `ENABLE_PATTERN_PREVIEWS = false`)

---

## Quick Test Steps

```bash
cd C:\Users\bisho\IdeaProjects\ebl

# Check if ports are clear
netstat -ano | findstr ":5173 :8000"

# If anything shows, kill those processes
taskkill /F /PID <process_id>

# Start dev servers
npm run dev:all
```

---

## What to Check in Browser Console

Open http://localhost:5173 and press F12 to open console.

### Expected Logs (Working):
```
✅ HybridAudioEngine initialized
✅ Backend connecting...
✅ Pattern Selector loaded
✅ Audio context created
```

### Problem Indicators:
```
❌ ReferenceError: WAVE_PATTERNS is not defined
❌ Cannot read property 'find' of undefined
❌ convertPatternConfigToPattern8D is not a function
❌ Failed to compile
```

---

## If Still Broken - Emergency Rollback

### Option 1: Disable New Features
Already done - previews are disabled with `ENABLE_PATTERN_PREVIEWS = false`

### Option 2: Check TypeScript Compilation
```bash
npm run typecheck
```

### Option 3: Check for Import Errors
Look for these in console:
- "Module not found"
- "Cannot find module"
- "Unexpected token"

---

## Files Changed (For Rollback Reference)

**Can Be Safely Reverted:**
1. `src/components/PatternSelectorMUI.tsx` - Pattern preview feature
2. `src/__tests__/patternGeometry.test.ts` - Test file (won't affect runtime)

**Critical - DO NOT REVERT:**
1. `src/utils/patternGeometry.ts` - Core geometry generator (needed!)
2. `src/types/index.ts` - Added currentPattern8D (needed!)
3. `src/components/helpers/ElectromagneticLabManager.ts` - Pattern selection logic (needed!)

**Safe to Keep:**
1. `src/components/SpatialVisualizer.tsx` - Just added logging
2. `src/components/homePage/ElectromagneticBeatLab.tsx` - Uses currentPattern8D

---

## Manual Verification Checklist

### 1. Check Pattern Selector Renders
- [ ] Pattern list visible?
- [ ] Can click on patterns?
- [ ] No console errors?

### 2. Check Audio Context
- [ ] Open browser console
- [ ] Type: `window.AudioContext`
- [ ] Should NOT be `undefined`

### 3. Check WebSocket
- [ ] Network tab in DevTools
- [ ] Look for `ws://localhost:8000` connection
- [ ] Should show "WebSocket" type

### 4. Check Pattern Data
```javascript
// Type in console:
import { WAVE_PATTERNS } from './data/patterns.js';
console.log(WAVE_PATTERNS.length); // Should show 8 or similar
```

---

## If Audio Context Missing

**Possible Causes:**
1. Browser autoplay policy blocking
2. Audio engine not initializing
3. Import error breaking initialization

**Fix:**
1. Click anywhere on page first (user gesture required)
2. Check browser console for errors
3. Try clicking "Play" button in Master Controls

---

## If WebSocket Not Connecting

**Possible Causes:**
1. Backend not running
2. Port 8000 occupied
3. CORS issue

**Fix:**
```bash
# Check backend is running
netstat -ano | findstr ":8000"

# If not running, start backend separately
cd backend
python -m uvicorn main:app --reload --port 8000
```

---

## If Patterns Not Showing

**Check Console For:**
```javascript
// Should see:
console.log(WAVE_PATTERNS); // Array of patterns

// Should NOT see:
ReferenceError: WAVE_PATTERNS is not defined
```

**If undefined:**
- Import error in PatternSelectorMUI
- Already fixed - restart dev server

---

## Nuclear Option: Clean Restart

```bash
# Stop all dev servers (Ctrl+C)

# Clear node modules (if needed)
rm -rf node_modules package-lock.json
npm install

# Clear browser cache
# In browser: Ctrl+Shift+Delete → Clear cache

# Restart fresh
npm run dev:all
```

---

## Success Indicators

You'll know it's working when you see:

Console:
```
✅ HybridAudioEngine initialized
✅ Pattern Selector loaded  
🎨 Pattern selected: [name] - Generating 3D geometry...
✅ Pattern Geometry Generated
```

UI:
- [ ] Pattern list populated
- [ ] Can select patterns
- [ ] Master Controls visible
- [ ] No red errors in console

---

## Still Broken? Report These

1. **Screenshot of browser console errors**
2. **Output of `npm run typecheck`**
3. **Output of `netstat -ano | findstr ":5173 :8000"`**
4. **Any error messages from terminal where `npm run dev:all` is running**

---

## Quick Enable Previews (Once Working)

In `src/components/PatternSelectorMUI.tsx`:
```typescript
// Change from:
const ENABLE_PATTERN_PREVIEWS = false;

// To:
const ENABLE_PATTERN_PREVIEWS = true;
```

Save file, refresh browser.
