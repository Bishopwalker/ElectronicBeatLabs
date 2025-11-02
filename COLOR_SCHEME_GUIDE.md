# EBL Component Color Scheme Guide

## 🎨 Visual Identity System

Each component category has its own color theme for better visual distinction and user experience.

### Color Categories

#### 🎛️ CONTROLS (Orange Theme)
**Color:** `#ff6b00` (EBL Primary Orange)
- **Components:** Master Controls, Quick Start
- **Border:** 2px solid orange
- **Background:** `rgba(255, 107, 0, 0.08)` - Light orange tint
- **Glow:** `rgba(255, 107, 0, 0.3)` - Orange glow on hover
- **Purpose:** Action/control components that manage system state

#### 🎧 AUDIO GENERATORS (Purple Theme)
**Color:** `#8a2be2` (BlueViolet/Purple)
- **Components:** Binaural Beat Generator, Equalizer
- **Border:** 2px solid purple
- **Background:** `rgba(138, 43, 226, 0.08)` - Light purple tint
- **Glow:** `rgba(138, 43, 226, 0.3)` - Purple glow on hover
- **Purpose:** Components that generate or process audio

#### 🎨 VISUALIZERS (Cyan/Green Theme)
**Color:** `#00ff88` (EBL Secondary Cyan)
- **Components:** Frequency Visualizer, Spatial Visualizer
- **Border:** 2px solid cyan
- **Background:** `rgba(0, 255, 136, 0.06)` - Light cyan tint
- **Glow:** `rgba(0, 255, 136, 0.3)` - Cyan glow on hover
- **Purpose:** Components that display visual representations

#### ⏰ TIMER/PATTERNS (Blue Theme)
**Color:** `#00bfff` (Deep Sky Blue)
- **Components:** Timer Panel, Pattern Selector
- **Border:** 2px solid blue
- **Background:** `rgba(0, 191, 255, 0.06)` - Light blue tint
- **Glow:** `rgba(0, 191, 255, 0.3)` - Blue glow on hover
- **Purpose:** Time-based and pattern selection components

#### 🔧 DEFAULT (White/Gray Theme)
**Color:** `rgba(255, 255, 255, 0.3)` (Semi-transparent white)
- **Components:** Any unclassified component
- **Border:** 2px solid white/gray
- **Background:** `rgba(255, 255, 255, 0.05)` - Very light gray tint
- **Glow:** `rgba(255, 255, 255, 0.2)` - White glow on hover
- **Purpose:** Fallback for new or uncategorized components

## Visual Effects

### Border
- **Width:** 2px (stronger than previous 1px)
- **Style:** Solid
- **Color:** Category-specific from above

### Background
- **Base:** Black with category-specific color tint
- **Opacity:** 0.05-0.08 (subtle but visible)
- **Effect:** Slightly lighter than main background
- **Header:** Darker with gradient `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)`

### Glow Effect
- **Default:** `0 0 15px [color-glow], 0 4px 12px rgba(0,0,0,0.5)`
- **Hover:** `0 0 25px [color-glow], 0 6px 16px rgba(0,0,0,0.6)`
- **Animation:** `transition: all 0.3s ease`
- **Hover Transform:** `translateY(-2px)` - subtle lift effect

## Component ID Mapping

| Component ID | Category | Color Theme |
|-------------|----------|-------------|
| `masterControls` | Controls | 🟠 Orange |
| `quickStart` | Controls | 🟠 Orange |
| `binauralBeats` | Audio | 🟣 Purple |
| `equalizer` | Audio | 🟣 Purple |
| `frequencyVisualizer` | Visualizer | 🟢 Cyan |
| `visualizeID` | Visualizer | 🟢 Cyan |
| `timerPanel` | Timer | 🔵 Blue |
| `patternID` | Patterns | 🔵 Blue |

## Implementation

Colors are defined in `src/components/shared/CollapsibleSection.tsx`:

```typescript
const COMPONENT_COLORS: Record<string, { border: string; bg: string; glow: string }> = {
  masterControls: {
    border: '#ff6b00',
    bg: 'rgba(255, 107, 0, 0.08)',
    glow: 'rgba(255, 107, 0, 0.3)'
  },
  // ... more mappings
};
```

## Adding New Components

To add a new component with custom colors:

1. Identify the component ID (the `id` prop passed to `CollapsibleSection`)
2. Choose the appropriate category or create a new one
3. Add entry to `COMPONENT_COLORS` mapping
4. Use consistent opacity levels:
   - Background: 0.05-0.08
   - Glow: 0.3
   - Border: Full opacity

## Design Philosophy

- **Visual Hierarchy:** Colors help users identify component types at a glance
- **Subtle but Distinct:** Low opacity backgrounds don't overwhelm, but borders/glows are clear
- **Consistent Theme:** All colors derived from EBL's existing palette
- **Accessibility:** High contrast borders ensure visibility
- **Interactive Feedback:** Hover effects provide clear interactivity cues

---

**Last Updated:** 2025-10-18