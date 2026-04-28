# Tutorial System Documentation

Comprehensive interactive tutorial system for the Electromagnetic Beat Lab (EBL) application.

## Overview

The tutorial system provides:
- **Interactive Tooltips**: Context-aware tooltips with navigation controls
- **Progress Tracking**: Track completion by category and overall
- **Science Content**: Expandable scientific explanations for each feature
- **Dismissal Management**: Individually dismiss and restore tooltips
- **Settings Integration**: Persistent state via useSettingsContext
- **Startup Modal**: Welcome message for first-time users
- **Spotlight Effect**: Visual focus on current tutorial element

## Architecture

```
tutorial/
├── types.ts                    # TypeScript type definitions
├── tutorialSteps.ts           # All tutorial steps data
├── TutorialContext.tsx        # State management provider
├── TutorialTooltip.tsx        # Smart tooltip component
├── TutorialOverlay.tsx        # Spotlight effect
├── TutorialProgress.tsx       # Progress indicator
├── TutorialSettings.tsx       # Settings panel
├── TutorialStartupModal.tsx   # First-time user modal
├── index.ts                   # Main export
└── __tests__/                 # Unit tests
```

## Installation & Setup

### 1. Wrap App with Provider

Add the `TutorialProvider` to your app's root, inside the `SettingsProvider`:

```tsx
import { SettingsProvider } from './hooks/useSettingsContext';
import { TutorialProvider } from './components/tutorial';

function App() {
  return (
    <SettingsProvider>
      <TutorialProvider>
        {/* Your app components */}
      </TutorialProvider>
    </SettingsProvider>
  );
}
```

### 2. Add Tutorial Overlay & Startup Modal

Add these components to your main layout:

```tsx
import { TutorialOverlay, TutorialStartupModal } from './components/tutorial';

function MainLayout() {
  return (
    <>
      {/* Your main content */}
      <TutorialOverlay />
      <TutorialStartupModal />
    </>
  );
}
```

### 3. Wrap Interactive Elements

Wrap any UI elements you want to include in the tutorial:

```tsx
import { TutorialTooltip } from './components/tutorial';

function PlayButton() {
  return (
    <TutorialTooltip tooltipId="audio-01-play">
      <Button id="play-button" onClick={handlePlay}>
        Play
      </Button>
    </TutorialTooltip>
  );
}
```

**IMPORTANT**: The wrapped element must have an `id` attribute that matches the `targetElement` in the tutorial step definition.

## Component Usage

### TutorialTooltip

Smart tooltip wrapper with tutorial functionality.

```tsx
<TutorialTooltip
  tooltipId="audio-01-play"        // Required: matches step ID
  placement="bottom"               // Optional: tooltip position
  showScience={true}               // Optional: show science by default
  forceShow={false}                // Optional: show even if dismissed
  disabled={false}                 // Optional: disable tooltip
>
  <Button id="play-button">Play</Button>
</TutorialTooltip>
```

**Props**:
- `tooltipId` (string): Unique ID matching a tutorial step
- `placement` ('top' | 'bottom' | 'left' | 'right' | 'auto'): Tooltip position
- `showScience` (boolean): Show science section expanded by default
- `forceShow` (boolean): Show tooltip even if dismissed
- `disabled` (boolean): Disable tooltip entirely

### TutorialProgress

Progress indicator with category breakdown.

```tsx
<TutorialProgress
  compact={false}          // Compact mode (less detail)
  showCategories={true}    // Show category breakdown
/>
```

### TutorialSettings

Settings panel for tutorial preferences.

```tsx
<TutorialSettings
  embedded={true}  // Embedded in settings panel (no Paper wrapper)
/>
```

### TutorialOverlay

Spotlight effect component (auto-managed, no props needed).

```tsx
<TutorialOverlay />
```

### TutorialStartupModal

First-time user welcome modal (auto-managed).

```tsx
<TutorialStartupModal />

// Or with manual control:
<TutorialStartupModal
  open={showModal}
  onClose={handleClose}
/>
```

## Hook Usage

### useTutorial

Access tutorial state and controls from any component:

```tsx
import { useTutorial } from './components/tutorial';

function MyComponent() {
  const {
    // State
    isActive,
    currentStep,
    completedSteps,
    dismissedTooltips,
    showOnStartup,
    showScienceByDefault,
    isTutorialComplete,

    // Navigation
    startTutorial,
    nextStep,
    previousStep,
    skipToStep,
    skipToCategory,

    // Dismissal & Settings
    dismissTooltip,
    restoreTooltip,
    toggleShowOnStartup,
    toggleShowScience,

    // Reset
    resetTutorial,
    stopTutorial,

    // Progress
    getCategoryProgress,

    // Access
    getAllSteps,
    getStepsByCategory
  } = useTutorial();

  // Example: Start tutorial on button click
  const handleStartTutorial = () => {
    startTutorial();
  };

  // Example: Get audio category progress
  const audioProgress = getCategoryProgress('audio');
  console.log(`Audio: ${audioProgress.completed}/${audioProgress.total}`);

  return (
    <Button onClick={handleStartTutorial}>
      Start Tutorial
    </Button>
  );
}
```

## Adding New Tutorial Steps

### 1. Define the Step

Add a new step to `tutorialSteps.ts`:

```tsx
{
  id: 'my-feature-01-intro',
  category: 'advanced',
  title: 'My New Feature',
  content: 'This is how to use the new feature...',
  scienceContent: 'The scientific explanation...',
  targetElement: '#my-feature-button',
  placement: 'bottom',
  order: 100,
  optional: false
}
```

**Required Fields**:
- `id`: Unique identifier (convention: `category-number-name`)
- `category`: One of: audio, patterns, spatial, timer, equalizer, visualization, advanced
- `title`: Step title shown in tooltip
- `content`: Main explanation text
- `targetElement`: CSS selector for element to highlight (must match element's `id`)
- `placement`: Tooltip position
- `order`: Sort order (used for navigation)

**Optional Fields**:
- `scienceContent`: Extended scientific explanation
- `optional`: If true, not required for completion

### 2. Wrap the UI Element

Wrap the corresponding UI element with `TutorialTooltip`:

```tsx
<TutorialTooltip tooltipId="my-feature-01-intro">
  <Button id="my-feature-button">
    My Feature
  </Button>
</TutorialTooltip>
```

### 3. Test the Step

1. Start the tutorial
2. Navigate to your new step
3. Verify the tooltip appears correctly
4. Check the science section expands/collapses
5. Test dismissal and restoration

## Categories

The tutorial is organized into 7 categories:

| Category | Icon | Color | Description |
|----------|------|-------|-------------|
| **audio** | Headphones | #00ff88 (green) | Basic audio controls, frequencies, waveforms |
| **patterns** | Palette | #2196f3 (blue) | Pattern presets and modes |
| **spatial** | 3D Rotation | #9c27b0 (purple) | 8D spatial audio features |
| **timer** | Timer | #ff9800 (orange) | Session timing and presets |
| **equalizer** | Equalizer | #f44336 (red) | Audio EQ controls |
| **visualization** | Visibility | #00bcd4 (cyan) | Visual feedback modes |
| **advanced** | Settings | #607d8b (gray) | Advanced features |

## State Persistence

Tutorial state is automatically persisted to localStorage via `useSettingsContext`:

```tsx
settings.tutorial = {
  hasSeenTutorial: boolean,      // True if any steps completed
  dontShowAgain: boolean,        // True if user disabled startup modal
  completedSections: string[]    // Array of completed step IDs
}
```

State is:
- **Loaded** on app mount
- **Saved** whenever state changes
- **Merged** with defaults for new settings

## Styling & Theming

### Color Scheme

- **Primary**: `#00ff88` (green) - active tooltips, progress
- **Science**: `#2196f3` (blue) - science sections
- **Complete**: `#9c27b0` (purple) - completed steps, achievements

### Customization

All components use MUI's `sx` prop for styling. Override styles by wrapping components:

```tsx
<Box sx={{ '& .MuiTooltip-tooltip': { bgcolor: 'red' } }}>
  <TutorialTooltip tooltipId="audio-01-play">
    <Button>Play</Button>
  </TutorialTooltip>
</Box>
```

### Dark Mode

All components are dark-theme compatible and respect MUI theme settings.

## Best Practices

### 1. Element IDs

Always add `id` attributes to elements wrapped in `TutorialTooltip`:

```tsx
// ✅ GOOD
<TutorialTooltip tooltipId="audio-01-play">
  <Button id="play-button">Play</Button>
</TutorialTooltip>

// ❌ BAD (tooltip won't find target)
<TutorialTooltip tooltipId="audio-01-play">
  <Button>Play</Button>
</TutorialTooltip>
```

### 2. Step Ordering

Use consistent numbering for step order:

```tsx
// Audio category: 1-10
{ id: 'audio-01-play', order: 1 }
{ id: 'audio-02-volume', order: 2 }

// Patterns category: 11-20
{ id: 'patterns-01-selector', order: 11 }
{ id: 'patterns-02-mode', order: 12 }
```

### 3. Content Writing

- **Title**: Short, action-oriented (e.g., "Adjust Volume")
- **Content**: Clear, concise explanation of the feature
- **Science**: Detailed scientific background (optional but recommended)

### 4. Placement

Choose tooltip placement to avoid covering important UI:

- `'bottom'`: For top navigation/controls
- `'top'`: For bottom controls/footer
- `'left'`: For right-side panels
- `'right'`: For left-side panels
- `'auto'`: Let MUI choose (default)

## Troubleshooting

### Tooltip Not Appearing

1. Check element has correct `id` attribute
2. Verify `tooltipId` matches step `id` exactly
3. Ensure tutorial is active (`isActive: true`)
4. Check tooltip not dismissed (`dismissedTooltips` array)
5. Verify step exists in `TUTORIAL_STEPS`

### Spotlight Not Positioning Correctly

1. Ensure target element is rendered and visible
2. Check element has proper layout (not `display: none`)
3. Verify CSS selector in `targetElement` is correct
4. Try adding padding to spotlight with overlay props

### State Not Persisting

1. Check `SettingsProvider` is wrapping `TutorialProvider`
2. Verify localStorage is enabled in browser
3. Check browser console for localStorage errors
4. Clear localStorage and test fresh state

## Examples

### Complete Integration Example

```tsx
import React from 'react';
import { Button, Box } from '@mui/material';
import {
  TutorialProvider,
  TutorialTooltip,
  TutorialOverlay,
  TutorialStartupModal,
  TutorialProgress,
  useTutorial
} from './components/tutorial';
import { SettingsProvider } from './hooks/useSettingsContext';

function App() {
  return (
    <SettingsProvider>
      <TutorialProvider>
        <MainApp />
        <TutorialOverlay />
        <TutorialStartupModal />
      </TutorialProvider>
    </SettingsProvider>
  );
}

function MainApp() {
  const { startTutorial } = useTutorial();

  return (
    <Box>
      <TutorialProgress compact />

      <TutorialTooltip tooltipId="audio-01-play">
        <Button id="play-button">Play</Button>
      </TutorialTooltip>

      <TutorialTooltip tooltipId="audio-02-volume">
        <Slider id="volume-control" />
      </TutorialTooltip>

      <Button onClick={startTutorial}>
        Start Tutorial
      </Button>
    </Box>
  );
}
```

### Custom Tutorial Flow

```tsx
function CustomTutorialFlow() {
  const {
    currentStep,
    skipToCategory,
    getCategoryProgress
  } = useTutorial();

  const audioProgress = getCategoryProgress('audio');

  return (
    <Box>
      <Typography>
        Current: {currentStep?.title || 'None'}
      </Typography>

      <Typography>
        Audio Progress: {audioProgress.percentage}%
      </Typography>

      <Button onClick={() => skipToCategory('spatial')}>
        Jump to Spatial Audio
      </Button>
    </Box>
  );
}
```

## API Reference

See `types.ts` for complete TypeScript definitions of all interfaces and types.

## Testing

Run unit tests:

```bash
npm test -- tutorial
```

Tests cover:
- Context initialization and state management
- Navigation (next, previous, skip)
- Dismissal and restoration
- Progress tracking
- Settings persistence
- Error handling

## License

Part of the Electromagnetic Beat Lab project.
