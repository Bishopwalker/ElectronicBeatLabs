# Grid Toggle Implementation Snippets

Extracted from: `src/components/homePage/ElectromagneticBeatLab.tsx`

---

## IMPORTS (Lines 7-8)

```tsx
import GridViewIcon from '@mui/icons-material/GridView';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
```

Also needs these in the MUI imports (Line 6):
```tsx
import {Box, Button, ButtonGroup, Chip, Grid, IconButton, Paper, Typography} from '@mui/material';
```

---

## STATE DECLARATION (Line 93)

```tsx
// 🔥 NEW: Grid layout mode state (2x3 or 3x2)
const [gridMode, setGridMode] = useState<'2x3' | '3x2'>('2x3');
```

---

## TOGGLE BUTTON JSX (Lines 650-691)

Located in the Header Paper, within the titleStatusRow Box:

```tsx
{/* Grid Layout Toggle - Moved to header */}
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mx: 2 }}>
  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
    Layout:
  </Typography>
  <ButtonGroup variant="contained" size="small">
    <Button
      onClick={() => setGridMode('2x3')}
      variant={gridMode === '2x3' ? 'contained' : 'outlined'}
      startIcon={<GridViewIcon />}
      sx={{
        bgcolor: gridMode === '2x3' ? '#ff6b00' : 'transparent',
        color: gridMode === '2x3' ? 'white' : '#ff6b00',
        borderColor: '#ff6b00',
        fontSize: '0.7rem',
        padding: '4px 8px',
        '&:hover': {
          bgcolor: gridMode === '2x3' ? '#ff8533' : 'rgba(255, 107, 0, 0.1)'
        }
      }}
    >
      2×3
    </Button>
    <Button
      onClick={() => setGridMode('3x2')}
      variant={gridMode === '3x2' ? 'contained' : 'outlined'}
      startIcon={<ViewModuleIcon />}
      sx={{
        bgcolor: gridMode === '3x2' ? '#ff6b00' : 'transparent',
        color: gridMode === '3x2' ? 'white' : '#ff6b00',
        borderColor: '#ff6b00',
        fontSize: '0.7rem',
        padding: '4px 8px',
        '&:hover': {
          bgcolor: gridMode === '3x2' ? '#ff8533' : 'rgba(255, 107, 0, 0.1)'
        }
      }}
    >
      3×2
    </Button>
  </ButtonGroup>
</Box>
```

---

## LAYOUT CONDITIONAL LOGIC (Lines 736-1174)

The main layout switching logic:

```tsx
{/* Layout Container: Switches between 2x3 (three-row) and 3x2 (three-column) */}
{gridMode === '2x3' ? (
  /* Three-Row Layout (2x3): Row 1 + Row 2 + Row 3 (full-width Spatial) - CLASSIC LAYOUT */
  <Box sx={{
    display: 'grid',
    gridTemplateRows: 'auto auto 1fr',
    gap: { xs: 2, sm: 2, md: 2.5, lg: 3 },
    p: { xs: 1.5, sm: 2, md: 2, lg: 2.5 },
    width: '100%',
    maxWidth: '100vw',
    height: '100%',
    overflowY: 'auto'
  }}>
    {/* 2x3 layout content - lines 749-962 */}
  </Box>
) : (
  /* Three-Column Layout (3x2): Auto-fit grid - ALTERNATIVE LAYOUT */
  <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: { xs: 2, sm: 2, md: 2.5, lg: 3 },
    p: { xs: 1.5, sm: 2, md: 2, lg: 2.5 },
    width: '100%',
    height: '100%',
    overflowX: 'hidden',
    overflowY: 'auto'
  }}>
    {/* 3x2 layout content - lines 976-1173 */}
  </Box>
)}
```

---

## KEY DIFFERENCES BETWEEN LAYOUTS

### 2x3 Layout (Classic):
- **Row 1**: Timer Countdown (full width) + Auto-fit grid (Timer Presets, Patterns, Frequency Visualizer)
- **Row 2**: Auto-fit grid (Binaural Generator, Master Controls, Equalizer)
- **Row 3**: Spatial Visualizer (full width)
- Uses `gridTemplateRows: 'auto auto 1fr'`

### 3x2 Layout (Alternative):
- **Row 1**: Timer Countdown (full width)
- **Row 2**: Auto-fit grid with ALL components (Timer Presets, Patterns, Frequency Visualizer, Binaural Generator, Master Controls, Equalizer)
- **Row 3**: Spatial Visualizer (full width)
- Uses `flexDirection: 'column'`

Both layouts render the same components but arrange them differently.

---

## INTEGRATION NOTES

1. The toggle button is placed between the main title and the ElectromagneticStatus chips in the header
2. Uses ButtonGroup for a clean toggle appearance
3. Orange (#ff6b00) accent color matches the app theme
4. Both layouts preserve all functionality, just reorganize visual arrangement
5. The 2x3 layout separates controls into logical rows; 3x2 puts all controls in one auto-fit grid
