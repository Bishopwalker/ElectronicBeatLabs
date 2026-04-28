# Tutorial System Integration Guide

Step-by-step guide for integrating the tutorial system into the EBL application.

## Quick Start Checklist

- [ ] Add TutorialProvider to app root
- [ ] Add TutorialOverlay and TutorialStartupModal components
- [ ] Wrap UI elements with TutorialTooltip
- [ ] Add element IDs matching tutorial step selectors
- [ ] Test tutorial flow
- [ ] Add TutorialProgress to settings/dashboard
- [ ] Add TutorialSettings to settings panel

## Step 1: Update App Root

**File**: `src/main.tsx` or `src/App.tsx`

```tsx
import { SettingsProvider } from './hooks/useSettingsContext';
import { TutorialProvider } from './components/tutorial';

function App() {
  return (
    <SettingsProvider>
      <TutorialProvider>
        <Router>
          <Routes>
            {/* Your routes */}
          </Routes>
        </Router>
      </TutorialProvider>
    </SettingsProvider>
  );
}
```

## Step 2: Add Overlay and Modal

**File**: `src/components/homePage/ElectromagneticBeatLab.tsx`

Add these imports:

```tsx
import { TutorialOverlay, TutorialStartupModal } from '../tutorial';
```

Add components at the end of your main component return:

```tsx
export function ElectromagneticBeatLab() {
  // ... existing code ...

  return (
    <Box>
      {/* Existing app content */}

      {/* Tutorial System - Add at end */}
      <TutorialOverlay />
      <TutorialStartupModal />
    </Box>
  );
}
```

## Step 3: Wrap Interactive Elements

### Audio Controls

**File**: `src/components/MainControls.tsx` (or wherever play button lives)

```tsx
import { TutorialTooltip } from '../tutorial';

export function MainControls({ onPlay, onStop, volume, onVolumeChange }: MainControlsProps) {
  return (
    <Box>
      {/* Play Button */}
      <TutorialTooltip tooltipId="audio-01-play">
        <IconButton
          id="play-button"  // ⭐ Add this ID
          onClick={onPlay}
        >
          <PlayArrowIcon />
        </IconButton>
      </TutorialTooltip>

      {/* Volume Control */}
      <TutorialTooltip tooltipId="audio-02-volume">
        <Slider
          id="volume-control"  // ⭐ Add this ID
          value={volume}
          onChange={(e, val) => onVolumeChange(val as number)}
        />
      </TutorialTooltip>
    </Box>
  );
}
```

### Frequency Controls

**File**: Component with frequency sliders

```tsx
import { TutorialTooltip } from '../tutorial';

export function FrequencyControls() {
  return (
    <Box>
      {/* Base Frequency */}
      <TutorialTooltip tooltipId="audio-03-frequency">
        <Slider
          id="base-frequency-slider"  // ⭐ Add this ID
          value={baseFrequency}
          onChange={handleBaseFrequencyChange}
          min={20}
          max={200}
        />
      </TutorialTooltip>

      {/* Beat Frequency */}
      <TutorialTooltip tooltipId="audio-04-beat">
        <Slider
          id="beat-frequency-slider"  // ⭐ Add this ID
          value={beatFrequency}
          onChange={handleBeatFrequencyChange}
          min={0.5}
          max={100}
        />
      </TutorialTooltip>

      {/* Waveform Selector */}
      <TutorialTooltip tooltipId="audio-05-waveform">
        <Select
          id="waveform-selector"  // ⭐ Add this ID
          value={waveform}
          onChange={handleWaveformChange}
        >
          <MenuItem value="sine">Sine</MenuItem>
          <MenuItem value="square">Square</MenuItem>
          <MenuItem value="triangle">Triangle</MenuItem>
          <MenuItem value="sawtooth">Sawtooth</MenuItem>
        </Select>
      </TutorialTooltip>
    </Box>
  );
}
```

### Pattern Controls

**File**: Component with pattern selector

```tsx
import { TutorialTooltip } from '../tutorial';

export function PatternControls() {
  return (
    <Box>
      {/* Pattern Selector */}
      <TutorialTooltip tooltipId="patterns-01-selector">
        <Select
          id="pattern-selector"  // ⭐ Add this ID
          value={selectedPattern}
          onChange={handlePatternChange}
        >
          {patterns.map(pattern => (
            <MenuItem key={pattern.id} value={pattern.id}>
              {pattern.name}
            </MenuItem>
          ))}
        </Select>
      </TutorialTooltip>

      {/* Pattern Mode */}
      <TutorialTooltip tooltipId="patterns-02-mode">
        <ToggleButtonGroup
          id="pattern-mode-selector"  // ⭐ Add this ID
          value={mode}
          onChange={handleModeChange}
        >
          <ToggleButton value="AUTO">Auto</ToggleButton>
          <ToggleButton value="MANUAL">Manual</ToggleButton>
          <ToggleButton value="CUSTOM">Custom</ToggleButton>
        </ToggleButtonGroup>
      </TutorialTooltip>
    </Box>
  );
}
```

### Spatial Audio Controls

**File**: Component with spatial audio settings

```tsx
import { TutorialTooltip } from '../tutorial';

export function SpatialAudioControls() {
  return (
    <Box>
      {/* Spatial Enable Toggle */}
      <TutorialTooltip tooltipId="spatial-01-enable">
        <Switch
          id="spatial-enable-toggle"  // ⭐ Add this ID
          checked={spatialEnabled}
          onChange={handleSpatialToggle}
        />
      </TutorialTooltip>

      {/* Spatial Pattern */}
      <TutorialTooltip tooltipId="spatial-02-pattern">
        <Select
          id="spatial-pattern-selector"  // ⭐ Add this ID
          value={spatialPattern}
          onChange={handlePatternChange}
        >
          <MenuItem value="circular">Circular</MenuItem>
          <MenuItem value="figure8">Figure-8</MenuItem>
          <MenuItem value="spiral">Spiral</MenuItem>
          <MenuItem value="random">Random</MenuItem>
        </Select>
      </TutorialTooltip>

      {/* Spatial Speed */}
      <TutorialTooltip tooltipId="spatial-03-speed">
        <Slider
          id="spatial-speed-slider"  // ⭐ Add this ID
          value={spatialSpeed}
          onChange={handleSpeedChange}
          min={0.1}
          max={5.0}
        />
      </TutorialTooltip>
    </Box>
  );
}
```

### Timer Controls

**File**: Component with timer controls

```tsx
import { TutorialTooltip } from '../tutorial';

export function TimerControls() {
  return (
    <Box>
      {/* Timer Presets */}
      <TutorialTooltip tooltipId="timer-01-presets">
        <Select
          id="timer-preset-selector"  // ⭐ Add this ID
          value={selectedPreset}
          onChange={handlePresetChange}
        >
          {presets.map(preset => (
            <MenuItem key={preset.id} value={preset.id}>
              {preset.name}
            </MenuItem>
          ))}
        </Select>
      </TutorialTooltip>

      {/* Timer Controls */}
      <TutorialTooltip tooltipId="timer-02-controls">
        <ButtonGroup id="timer-controls">  {/* ⭐ Add this ID */}
          <Button onClick={handleStart}>Start</Button>
          <Button onClick={handlePause}>Pause</Button>
          <Button onClick={handleStop}>Stop</Button>
        </ButtonGroup>
      </TutorialTooltip>

      {/* Loop Toggle */}
      <TutorialTooltip tooltipId="timer-03-loop">
        <Switch
          id="timer-loop-toggle"  // ⭐ Add this ID
          checked={loopEnabled}
          onChange={handleLoopToggle}
        />
      </TutorialTooltip>
    </Box>
  );
}
```

### Equalizer Controls

**File**: Component with EQ controls

```tsx
import { TutorialTooltip } from '../tutorial';

export function EqualizerControls() {
  return (
    <Box>
      {/* EQ Enable */}
      <TutorialTooltip tooltipId="eq-01-enable">
        <Switch
          id="eq-enable-toggle"  // ⭐ Add this ID
          checked={eqEnabled}
          onChange={handleEqToggle}
        />
      </TutorialTooltip>

      {/* EQ Bands */}
      <TutorialTooltip tooltipId="eq-02-bands">
        <Box id="eq-bands">  {/* ⭐ Add this ID */}
          {bands.map(band => (
            <Slider key={band.id} {...band} />
          ))}
        </Box>
      </TutorialTooltip>

      {/* EQ Presets */}
      <TutorialTooltip tooltipId="eq-03-presets">
        <Select
          id="eq-preset-selector"  // ⭐ Add this ID
          value={selectedPreset}
          onChange={handlePresetChange}
        >
          <MenuItem value="flat">Flat</MenuItem>
          <MenuItem value="bass-boost">Bass Boost</MenuItem>
          <MenuItem value="clarity">Clarity</MenuItem>
        </Select>
      </TutorialTooltip>
    </Box>
  );
}
```

### Visualization Controls

**File**: Component with visualization settings

```tsx
import { TutorialTooltip } from '../tutorial';

export function VisualizationControls() {
  return (
    <Box>
      {/* Visualization Mode */}
      <TutorialTooltip tooltipId="viz-01-mode">
        <Select
          id="visualization-mode-selector"  // ⭐ Add this ID
          value={vizMode}
          onChange={handleModeChange}
        >
          <MenuItem value="toroidal">Toroidal</MenuItem>
          <MenuItem value="vortex">Vortex</MenuItem>
          <MenuItem value="spiral">Spiral</MenuItem>
        </Select>
      </TutorialTooltip>

      {/* Frequency Analyzer */}
      <TutorialTooltip tooltipId="viz-02-analyzer">
        <Box id="frequency-analyzer">  {/* ⭐ Add this ID */}
          <FrequencyAnalyzerComponent />
        </Box>
      </TutorialTooltip>
    </Box>
  );
}
```

### Visualization Display

**File**: Main visualization component

```tsx
import { TutorialTooltip } from '../tutorial';

export function PatternVisualization() {
  return (
    <TutorialTooltip tooltipId="patterns-03-visualization">
      <Box id="pattern-visualization">  {/* ⭐ Add this ID */}
        <Canvas>
          {/* 3D visualization */}
        </Canvas>
      </Box>
    </TutorialTooltip>
  );
}
```

### Advanced Features

**File**: Settings or advanced controls

```tsx
import { TutorialTooltip } from '../tutorial';

export function AdvancedControls() {
  return (
    <Box>
      {/* Backend Connection */}
      <TutorialTooltip tooltipId="advanced-01-backend">
        <Button
          id="backend-connect-button"  // ⭐ Add this ID
          onClick={handleBackendConnect}
        >
          Connect Backend
        </Button>
      </TutorialTooltip>

      {/* Advanced Settings */}
      <TutorialTooltip tooltipId="advanced-02-settings">
        <IconButton
          id="advanced-settings-button"  // ⭐ Add this ID
          onClick={handleOpenSettings}
        >
          <SettingsIcon />
        </IconButton>
      </TutorialTooltip>
    </Box>
  );
}
```

## Step 4: Add Progress Display

**File**: Settings panel or dashboard

```tsx
import { TutorialProgress } from '../tutorial';

export function SettingsDashboard() {
  return (
    <Box>
      <Typography variant="h6">Settings</Typography>

      {/* Add Tutorial Progress */}
      <TutorialProgress
        compact={false}
        showCategories={true}
      />

      {/* Other settings */}
    </Box>
  );
}
```

## Step 5: Add Settings Panel

**File**: Settings component

```tsx
import { TutorialSettings } from '../tutorial';

export function Settings() {
  return (
    <Box>
      <Typography variant="h5">Application Settings</Typography>

      {/* Tutorial Settings Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Tutorial
        </Typography>
        <TutorialSettings embedded />
      </Box>

      {/* Other settings sections */}
    </Box>
  );
}
```

## Step 6: Add Manual Tutorial Trigger

**File**: Header, toolbar, or help menu

```tsx
import { useTutorial } from '../tutorial';
import { HelpOutline as HelpIcon } from '@mui/icons-material';

export function AppHeader() {
  const { startTutorial } = useTutorial();

  return (
    <AppBar>
      <Toolbar>
        {/* Other toolbar items */}

        <IconButton
          onClick={startTutorial}
          sx={{ color: '#00ff88' }}
        >
          <HelpIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
```

## Step 7: Test Integration

### Testing Checklist

1. **Startup Modal**
   - [ ] Modal appears on first visit
   - [ ] "Start Tutorial" button works
   - [ ] "Skip for now" button works
   - [ ] "Don't show again" checkbox persists

2. **Tutorial Flow**
   - [ ] Tutorial starts with first step
   - [ ] Tooltips appear in correct positions
   - [ ] "Next" button advances to next step
   - [ ] "Previous" button goes back
   - [ ] Spotlight highlights correct elements

3. **Navigation**
   - [ ] Can skip to categories
   - [ ] Can skip to specific steps
   - [ ] Can stop tutorial mid-flow
   - [ ] Progress persists across page reloads

4. **Science Content**
   - [ ] Science sections expand/collapse
   - [ ] Science toggle in settings works
   - [ ] Content is readable and formatted

5. **Dismissal**
   - [ ] Can dismiss individual tooltips
   - [ ] Dismissed tooltips stay dismissed
   - [ ] Can restore dismissed tooltips
   - [ ] Dismissal persists across sessions

6. **Progress**
   - [ ] Overall progress updates correctly
   - [ ] Category progress is accurate
   - [ ] Completion detection works
   - [ ] Progress indicator shows current step

7. **Settings**
   - [ ] Show on startup toggle works
   - [ ] Show science toggle works
   - [ ] Reset tutorial clears all progress
   - [ ] Dismissed tooltips list is accurate

## Common Issues & Solutions

### Tooltip Not Appearing

**Problem**: Tooltip doesn't show when tutorial is active.

**Solutions**:
1. Check element has matching `id` attribute
2. Verify `tooltipId` matches step ID exactly
3. Ensure element is rendered (not in collapsed section)
4. Check tooltip not dismissed

### Spotlight Positioning Wrong

**Problem**: Spotlight doesn't highlight element correctly.

**Solutions**:
1. Ensure element has stable layout (not dynamically positioned)
2. Use `id` instead of class for `targetElement`
3. Check element is visible (not `display: none`)
4. Add small delay before showing tooltip

### State Not Persisting

**Problem**: Tutorial progress resets on refresh.

**Solutions**:
1. Verify `SettingsProvider` wraps `TutorialProvider`
2. Check localStorage is enabled
3. Clear localStorage and test fresh
4. Check browser console for errors

### Multiple Tooltips Showing

**Problem**: More than one tooltip visible at once.

**Solutions**:
1. Only use `forceShow` when necessary
2. Check no duplicate `tooltipId` values
3. Verify tutorial flow logic is correct

## Advanced Customization

### Custom Tutorial Step

Add your own step category:

```tsx
// In tutorialSteps.ts
export const TUTORIAL_STEPS: TooltipStep[] = [
  // ... existing steps ...
  {
    id: 'custom-feature-01',
    category: 'custom', // New category
    title: 'My Custom Feature',
    content: 'This is a custom tutorial step',
    targetElement: '#custom-feature',
    placement: 'top',
    order: 100
  }
];
```

### Programmatic Tutorial Control

```tsx
function CustomTutorialFlow() {
  const { skipToStep, nextStep, completedSteps } = useTutorial();

  useEffect(() => {
    // Auto-start tutorial on specific condition
    if (someCondition && completedSteps.length === 0) {
      skipToStep('audio-01-play');
    }
  }, [someCondition, completedSteps, skipToStep]);

  // Custom navigation
  const handleCustomNext = () => {
    // Add analytics
    trackEvent('tutorial_step_completed', { step: currentStep?.id });
    // Continue tutorial
    nextStep();
  };

  return (
    <Button onClick={handleCustomNext}>
      Custom Next
    </Button>
  );
}
```

### Conditional Tutorial Steps

Show steps based on feature availability:

```tsx
function ConditionalTooltip({ featureEnabled, children }: Props) {
  if (!featureEnabled) {
    return <>{children}</>;
  }

  return (
    <TutorialTooltip tooltipId="feature-step">
      {children}
    </TutorialTooltip>
  );
}
```

## Next Steps

1. Complete all element ID assignments
2. Test tutorial flow end-to-end
3. Add analytics tracking (optional)
4. Customize colors/styling for brand
5. Add more tutorial steps as features grow
6. Collect user feedback on tutorial effectiveness

## Support

For issues or questions:
- Check README.md for full documentation
- Review types.ts for API reference
- Run tests: `npm test -- tutorial`
- Check browser console for errors
