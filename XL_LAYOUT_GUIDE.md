# EBL XL Screen Layout Guide

## 🖥️ XL Screen Layout (1536px+)

### Grid Configuration
- **4 Columns** total
- **2 Rows** visible initially
- Auto rows for overflow content

### Component Sizes

#### Standard Panel (1 column × 1 row)
- Width: 25% of screen (1/4)
- Height: 400-600px
- Examples: Master Controls, Equalizer, Timer

#### Wide Panel (2 columns × 1 row)
- Width: 50% of screen (2/4)
- Height: 400-600px
- Examples: FrequencyVisualizer, Spatial Visualizer

#### Double Height Panel (1 column × 2 rows)
- Width: 25% of screen (1/4)
- Height: ~820px (spans 2 rows)
- Examples: Pattern Selector, Binaural Generator

## Visual Layout

### XL Screen (4 columns × 2 rows)

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   Pattern    │   Master     │ FrequencyViz │ FrequencyViz │  Row 1
│   Selector   │   Controls   │  (2 columns) │  (2 columns) │
│  (2 rows)    ├──────────────┼──────────────┴──────────────┤
│              │   Equalizer  │  Spatial Visualizer          │  Row 2
│              │              │      (2 columns)             │
├──────────────┼──────────────┼──────────────┬──────────────┤
│  Binaural    │    Timer     │              │              │  Row 3
│  Generator   │    Panel     │  (overflow)  │  (overflow)  │
│  (2 rows)    │              │              │              │
│              │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘

Legend:
🟠 Orange - Controls (Master, Quick Start)
🟣 Purple - Audio (Binaural, Equalizer)  
🟢 Cyan - Visualizers (Frequency, Spatial)
🔵 Blue - Timer/Patterns (Timer, Pattern Selector)
```

## Component Breakdown

### Row 1
| Column 1 | Column 2 | Column 3-4 |
|----------|----------|------------|
| Pattern Selector (2 rows tall) | Master Controls | FrequencyVisualizer (2 cols wide) |

### Row 2
| Column 1 | Column 2 | Column 3-4 |
|----------|----------|------------|
| *(Pattern continues)* | Equalizer | Spatial Visualizer (2 cols wide) |

### Row 3 (if needed)
| Column 1 | Column 2 | Column 3 | Column 4 |
|----------|----------|----------|----------|
| Binaural Generator (2 rows tall) | Timer Panel | *(overflow)* | *(overflow)* |

## Responsive Breakpoints

### XL (1536px+) - 4 columns
- Standard: 1 column (25%)
- Wide: 2 columns (50%)
- Double height: 2 rows

### LG (1200-1536px) - 3 columns
- Standard: 1 column (33%)
- Wide: 2 columns (66%)
- Double height: 2 rows

### MD (900-1200px) - 2 columns
- Standard: 1 column (50%)
- Wide: 2 columns (100%)
- Double height: 2 rows

### SM/XS (<900px) - 1 column
- All: full width
- Vertical stacking

## Panel Style Mapping

| Component | Style Used | Width | Height |
|-----------|------------|-------|--------|
| Master Controls | `panelFlex` | 1 col | 1 row |
| Pattern Selector | `doubleHeightPanelFlex` | 1 col | 2 rows |
| Binaural Generator | `doubleHeightPanelFlex` | 1 col | 2 rows |
| Equalizer | `equalizerPanelFlexHorizontal` | 2 col | 1 row |
| FrequencyVisualizer | `widePanelFlex` | 2 col | 1 row |
| Spatial Visualizer | `widePanelFlex` | 2 col | 1 row |
| Timer Panel | `widePanelFlex` | 2 col | 1 row |

## Color Scheme

Each component has a distinct color border and glow:

| Component | Color | Theme |
|-----------|-------|-------|
| Master Controls | 🟠 Orange | `#ff6b00` |
| Pattern Selector | 🔵 Blue | `#00bfff` |
| Binaural Generator | 🟣 Purple | `#8a2be2` |
| Equalizer | 🟣 Purple | `#8a2be2` |
| FrequencyVisualizer | 🟢 Cyan | `#00ff88` |
| Spatial Visualizer | 🟢 Cyan | `#00ff88` |
| Timer Panel | 🔵 Blue | `#00bfff` |

---

**Last Updated:** 2025-10-18
**Layout Type:** CSS Grid
**Grid Gap:** 12px
