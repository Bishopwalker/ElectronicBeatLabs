# Tutorial System Quick Reference

## Quick Setup (3 Steps)

```tsx
// 1. Wrap app with provider
<SettingsProvider>
  <TutorialProvider>
    <App />
  </TutorialProvider>
</SettingsProvider>

// 2. Add overlay + modal
<TutorialOverlay />
<TutorialStartupModal />

// 3. Wrap elements
<TutorialTooltip tooltipId="audio-01-play">
  <Button id="play-button">Play</Button>
</TutorialTooltip>
```

## Core Components

| Component | Purpose | Usage |
|-----------|---------|-------|
| `TutorialProvider` | State management | Wrap app root |
| `TutorialTooltip` | Interactive tooltip | Wrap UI elements |
| `TutorialOverlay` | Spotlight effect | Add to layout |
| `TutorialProgress` | Progress indicator | Settings/dashboard |
| `TutorialSettings` | Settings panel | Settings page |
| `TutorialStartupModal` | Welcome modal | Add to layout |

## Hook API

```tsx
const {
  // State
  isActive,                    // Tutorial active?
  currentStep,                 // Current step object
  completedSteps,             // Array of completed IDs
  isTutorialComplete,         // All steps done?

  // Navigation
  startTutorial(),            // Start from beginning
  nextStep(),                 // Advance to next
  previousStep(),             // Go back one
  skipToStep(id),            // Jump to specific step
  skipToCategory(category),  // Jump to category

  // Control
  stopTutorial(),            // Stop tutorial
  resetTutorial(),           // Clear all progress

  // Dismissal
  dismissTooltip(id),        // Hide tooltip permanently
  restoreTooltip(id),        // Restore dismissed tooltip

  // Settings
  toggleShowOnStartup(),     // Toggle startup modal
  toggleShowScience(),       // Toggle science default

  // Progress
  getCategoryProgress(cat),  // Get category progress
  getAllSteps(),             // Get all step definitions
} = useTutorial();
```

## Tutorial Categories

| Category | Icon | Color | Steps |
|----------|------|-------|-------|
| `audio` | 🎧 | Green (#00ff88) | 5 steps |
| `patterns` | 🎨 | Blue (#2196f3) | 3 steps |
| `spatial` | 🌀 | Purple (#9c27b0) | 3 steps |
| `timer` | ⏲️ | Orange (#ff9800) | 3 steps |
| `equalizer` | 📊 | Red (#f44336) | 3 steps |
| `visualization` | 👁️ | Cyan (#00bcd4) | 2 steps |
| `advanced` | ⚙️ | Gray (#607d8b) | 2 steps |

## Step IDs Reference

### Audio (5 steps)
- `audio-01-play` - Play button
- `audio-02-volume` - Volume slider
- `audio-03-frequency` - Base frequency
- `audio-04-beat` - Beat frequency
- `audio-05-waveform` - Waveform selector

### Patterns (3 steps)
- `patterns-01-selector` - Pattern dropdown
- `patterns-02-mode` - Mode selector
- `patterns-03-visualization` - 3D visualization

### Spatial (3 steps)
- `spatial-01-enable` - Enable toggle
- `spatial-02-pattern` - Pattern selector
- `spatial-03-speed` - Speed slider

### Timer (3 steps)
- `timer-01-presets` - Preset selector
- `timer-02-controls` - Start/pause/stop
- `timer-03-loop` - Loop toggle

### Equalizer (3 steps)
- `eq-01-enable` - Enable toggle
- `eq-02-bands` - Frequency bands
- `eq-03-presets` - Preset selector

### Visualization (2 steps)
- `viz-01-mode` - Mode selector
- `viz-02-analyzer` - Frequency analyzer

### Advanced (2 steps)
- `advanced-01-backend` - Backend connection
- `advanced-02-settings` - Advanced settings

## Element ID Requirements

Every wrapped element needs matching ID:

```tsx
// ✅ CORRECT
<TutorialTooltip tooltipId="audio-01-play">
  <Button id="play-button">Play</Button>
</TutorialTooltip>

// ❌ WRONG - Missing ID
<TutorialTooltip tooltipId="audio-01-play">
  <Button>Play</Button>
</TutorialTooltip>
```

## Component Props Cheat Sheet

### TutorialTooltip

```tsx
<TutorialTooltip
  tooltipId="step-id"       // Required
  placement="bottom"        // Optional: top|bottom|left|right|auto
  showScience={true}        // Optional: show science expanded
  forceShow={false}         // Optional: override dismissal
  disabled={false}          // Optional: disable tooltip
>
  <YourComponent id="..." />
</TutorialTooltip>
```

### TutorialProgress

```tsx
<TutorialProgress
  compact={false}           // Optional: compact mode
  showCategories={true}     // Optional: show categories
/>
```

### TutorialSettings

```tsx
<TutorialSettings
  embedded={true}           // Optional: remove Paper wrapper
/>
```

### TutorialStartupModal

```tsx
<TutorialStartupModal
  open={showModal}          // Optional: manual control
  onClose={handleClose}     // Optional: close callback
/>
```

## Common Patterns

### Start Tutorial Button

```tsx
function StartButton() {
  const { startTutorial } = useTutorial();
  return <Button onClick={startTutorial}>Help</Button>;
}
```

### Category Progress Display

```tsx
function AudioProgress() {
  const { getCategoryProgress } = useTutorial();
  const progress = getCategoryProgress('audio');

  return (
    <Typography>
      Audio: {progress.completed}/{progress.total} ({progress.percentage}%)
    </Typography>
  );
}
```

### Conditional Tutorial

```tsx
function ConditionalTutorial({ showTutorial, children }) {
  if (!showTutorial) return <>{children}</>;

  return (
    <TutorialTooltip tooltipId="step-id">
      {children}
    </TutorialTooltip>
  );
}
```

### Auto-Start Tutorial

```tsx
function AutoStartTutorial() {
  const { startTutorial, completedSteps } = useTutorial();

  useEffect(() => {
    if (completedSteps.length === 0) {
      startTutorial();
    }
  }, [completedSteps, startTutorial]);

  return null;
}
```

## State Persistence

Tutorial state automatically persists to localStorage:

```typescript
settings.tutorial = {
  hasSeenTutorial: boolean,      // Any steps completed?
  dontShowAgain: boolean,        // Hide startup modal?
  completedSections: string[]    // Completed step IDs
}
```

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Tooltip not showing | Add `id` to element |
| Wrong position | Check `placement` prop |
| Multiple tooltips | Check `forceShow` usage |
| No persistence | Wrap with `SettingsProvider` |
| Spotlight wrong | Verify element is visible |

## Testing Commands

```bash
# Run all tutorial tests
npm test -- tutorial

# Watch mode
npm test -- tutorial --watch

# Coverage
npm test -- tutorial --coverage
```

## File Structure

```
tutorial/
├── index.ts                   # Main export
├── types.ts                   # TypeScript types
├── tutorialSteps.ts          # Step definitions
├── TutorialContext.tsx       # Provider
├── TutorialTooltip.tsx       # Tooltip component
├── TutorialOverlay.tsx       # Spotlight
├── TutorialProgress.tsx      # Progress display
├── TutorialSettings.tsx      # Settings panel
├── TutorialStartupModal.tsx  # Welcome modal
├── README.md                 # Full documentation
├── INTEGRATION_GUIDE.md      # Integration steps
└── __tests__/                # Unit tests
```

## Import Shortcuts

```tsx
// All from one import
import {
  TutorialProvider,
  TutorialTooltip,
  TutorialOverlay,
  TutorialProgress,
  TutorialSettings,
  TutorialStartupModal,
  useTutorial
} from './components/tutorial';
```

## Adding New Steps (5 Lines)

```tsx
// In tutorialSteps.ts
{
  id: 'my-feature-01',
  category: 'advanced',
  title: 'My Feature',
  content: 'Description of feature',
  targetElement: '#my-feature-button',
  placement: 'bottom',
  order: 100
}
```

## Color Palette

```css
--tutorial-primary: #00ff88;     /* Green - active */
--tutorial-science: #2196f3;     /* Blue - science */
--tutorial-complete: #9c27b0;    /* Purple - done */
--tutorial-audio: #00ff88;       /* Audio category */
--tutorial-patterns: #2196f3;    /* Patterns category */
--tutorial-spatial: #9c27b0;     /* Spatial category */
--tutorial-timer: #ff9800;       /* Timer category */
--tutorial-eq: #f44336;          /* EQ category */
--tutorial-viz: #00bcd4;         /* Viz category */
--tutorial-advanced: #607d8b;    /* Advanced category */
```

## Analytics Integration (Optional)

```tsx
function AnalyticsTutorial() {
  const { currentStep, nextStep } = useTutorial();

  const handleNext = () => {
    // Track completion
    analytics.track('tutorial_step_completed', {
      stepId: currentStep?.id,
      category: currentStep?.category
    });
    nextStep();
  };

  return <Button onClick={handleNext}>Next</Button>;
}
```

## Keyboard Shortcuts (Future Enhancement)

```tsx
// Potential keyboard navigation
useKeyboardShortcuts({
  'h': () => startTutorial(),        // h = help
  'ArrowRight': () => nextStep(),    // → = next
  'ArrowLeft': () => previousStep(), // ← = previous
  'Escape': () => stopTutorial()     // ESC = exit
});
```

---

**Full docs**: See `README.md`
**Integration**: See `INTEGRATION_GUIDE.md`
**Types**: See `types.ts`
