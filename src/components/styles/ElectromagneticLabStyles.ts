// Electromagnetic Beat Lab Styles - Theme and styling configuration
// Extracted from main component for better organization

import type { SxProps, Theme } from '@mui/material/styles';

export const ElectromagneticLabStyles = {
  // Main container styles
  mainContainer: {
    width: '100vw',
    minHeight: '100vh',
    height: 'auto',
    overflowX: 'hidden',
    overflowY: 'auto',
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    position: 'relative',
  } as SxProps<Theme>,

  // Dark screen toggle button
  darkScreenButton: (darkScreen: boolean) => ({
    position: 'fixed',
    top: 16,
    right: 80,
    zIndex: 200,
    bgcolor: darkScreen ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.7)',
    color: darkScreen ? '#00ff88' : 'white',
    backdropFilter: 'blur(10px)',
    '&:hover': {
      bgcolor: darkScreen ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.8)',
    },
    border: `1px solid ${darkScreen ? '#00ff88' : 'rgba(255, 255, 255, 0.2)'}`,
  }) as SxProps<Theme>,

  // Advanced controls toggle button
  advancedControlsButton: {
    position: 'fixed',
    top: 16,
    right: 16,
    zIndex: 200,
    bgcolor: '#ff6b00',
    color: 'white',
    backdropFilter: 'blur(10px)',
    fontSize: '1.5rem',
    width: 48,
    height: 48,
    border: '2px solid white',
    boxShadow: '0 0 10px rgba(255, 107, 0, 0.5)',
    '&:hover': {
      bgcolor: '#ff8533',
      boxShadow: '0 0 20px rgba(255, 107, 0, 0.8)',
    },
  } as SxProps<Theme>,

  // Advanced controls menu overlay
  advancedControlsMenu: {
    position: 'fixed',
    top: 0,
    right: 0,
    zIndex: 150,
    height: '100vh',
    width: {
      xs: '100vw',
      sm: '100vw',
      md: '60vw',
      lg: '45vw',
      xl: '35vw',
      xxl: '25vw'
    },
    maxWidth: {
      xs: '100vw',
      sm: '100vw',
      md: '700px',
    },
    minWidth: {
      xs: '320px',
      sm: '400px',
      md: '500px'
    },
    bgcolor: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(20px)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  } as SxProps<Theme>,

  // Menu header
  menuHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 2,
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  } as SxProps<Theme>,

  // Tab content area - FIXED: No default scroll, height constrained
  tabContent: {
    flex: 1,
    overflowY: 'hidden',  // Default: no scroll (overridden per tab)
    p: 2,
    backgroundColor: 'rgba(30, 60, 90, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'calc(100vh - 180px)',  // Constrain to viewport minus header/tabs
    height: '100%'
  } as SxProps<Theme>,

  // Header paper
  headerPaper: {
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    p: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    backdropFilter: 'blur(10px)',
    bgcolor: 'rgba(0, 0, 0, 0.2)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    flexShrink: 0
  } as SxProps<Theme>,

  // Title and status row
  titleStatusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
    flexDirection: {
      xs: 'column',
      sm: 'column',
      md: 'row'
    },
    gap: {
      xs: 1,
      md: 0
    }
  } as SxProps<Theme>,

  // Main title - 1/3 smaller and centered
  mainTitle: {
    fontWeight: 700,
    m: 0,
    fontSize: {
      xs: '1rem',      // was 1.5rem → ~33% smaller
      sm: '1.3rem',    // was 2rem → ~33% smaller
      md: '1.7rem',    // was 2.5rem → ~33% smaller
      lg: '2rem'       // was 3rem → ~33% smaller
    },
    textAlign: 'center'  // Always centered
  } as SxProps<Theme>,

  // Header Frequency Visualizer - positioned top right under theme buttons
  headerFrequencyVisualizer: {
    position: 'absolute',
    top: 100,  // Moved down from 60 to avoid overlapping system status
    right: 16,
    width: {
      xs: 'calc(100vw - 32px)',
      sm: '400px',
      md: '450px',
      lg: '500px'
    },
    maxWidth: '35%',
    zIndex: 99,
    bgcolor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: 2,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    p: 1,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
  } as SxProps<Theme>,

  // Compact status overview
  compactStatusOverview: {
    display: 'flex',
    alignItems: 'center',
    gap: {
      xs: 1,
      sm: 1.5,
      md: 2
    },
    px: {
      xs: 1,
      sm: 1.5,
      md: 2
    },
    py: 1,
    background: 'rgba(138, 43, 226, 0.1)',
    borderRadius: 2,
    border: '1px solid rgba(138, 43, 226, 0.3)',
    flexWrap: 'wrap',
    flexDirection: {
      xs: 'column',
      sm: 'row'
    }
  } as SxProps<Theme>,

  // System status chips container
  systemStatusChips: {
    display: 'flex',
    alignItems: 'center',
    gap: {
      xs: 0.5,
      sm: 0.75,
      md: 1
    },
    ml: {
      xs: 0,
      sm: 2
    },
    flexWrap: 'wrap',
    justifyContent: {
      xs: 'center',
      sm: 'flex-start'
    }
  } as SxProps<Theme>,

  // Status chip styles
  statusChip: (isActive: boolean) => ({
    fontSize: '0.7rem',
    backgroundColor: isActive ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
    borderColor: isActive ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 255, 255, 0.3)'
  }) as SxProps<Theme>,

  // 🔥 FIXED: No horizontal scroll, proper vertical only
  mainLayoutContainer: (closedSections: string[]) => ({
    flex: '1 1',
    p: {
      xs: '5px',
      sm: '8px',
      md: '10px'
    },
    display: 'grid',  // ✅ Grid for equal heights
    gridTemplateColumns: {
      xs: '1fr',                // Mobile: 1 column
      sm: '1fr',                // Small: 1 column
      md: 'repeat(2, 1fr)',     // Medium/Tablet: 2 columns
      lg: 'repeat(3, 1fr)',     // Large: 3 columns
      xl: 'repeat(4, 1fr)',     // XL: 4 columns
    },
    gridAutoRows: 'minmax(400px, auto)',  // ✅ Base row height
    gap: {
      xs: '8px',
      sm: '10px',
      md: '12px'
    },
    width: '100%',
    maxWidth: '100%',
    overflowX: 'hidden',  // ✅ NO horizontal scroll
    overflowY: 'visible',
    alignItems: 'stretch'  // ✅ Stretch to fill height
  }) as SxProps<Theme>,

  // 🔥 FIXED: Standard panel - all content visible,no scroll INSIDE
  panelFlex: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '400px',  // ✅ Smaller min height
    maxHeight: '600px',  // ✅ Max height cap
    height: '100%',
    overflow: 'hidden',  // ✅ Outer container never scrolls
    '& > div': {  // CollapsibleSection
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  } as SxProps<Theme>,

  // 🔥 FIXED: Wide panel - spans 2 columns, same height
  widePanelFlex: {
    display: 'flex',
    flexDirection: 'column',
    gridColumn: {
      xs: '1',           // Mobile: full width
      sm: '1',           // Small: full width
      md: 'span 2',
      lg: 'span 3'        // Medium+: span 2 columns
    },
    minHeight: '400px',  // ✅ Same as standard
    maxHeight: '600px',  // ✅ Same as standard
    height: '100%',
    overflow: 'hidden',  // ✅ Outer container never scrolls
    '& > div': {  // CollapsibleSection
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  } as SxProps<Theme>,

  // 🔥 NEW: Double height panel for Pattern Selector - DOUBLE the height with scroll
  doubleHeightPanelFlex: {
    display: 'flex',
    flexDirection: 'column',
    gridRow: 'span 2',  // ✅ Spans 2 rows (double height)
    minHeight: '600px',  // ✅ Double the standard height
    maxHeight: 'none',   // ✅ No max height limit
    height: '100%',
    overflowY: 'auto',
    '& > div': {  // CollapsibleSection
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto'  // ✅ Allow scrolling inside
    }
  } as SxProps<Theme>,

  // 🔥 NEW: Half panel - 50% width for Visualization & Timer side-by-side
  halfPanelFlex: {
    display: 'flex',
    flexDirection: 'column',
    gridColumn: {
      xs: '1',           // Mobile: full width
      sm: '1',           // Small: full width
      md: 'span 1',      // Medium: 1 column (50% of 2)
      lg: 'span 1.5',    // Large: 1.5 columns (50% of 3)
      xl: 'span 2'       // XL: 2 columns (50% of 4)
    },
    minHeight: '400px',
    maxHeight: '600px',
    height: '100%',
    overflow: 'hidden',
    '& > div': {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  } as SxProps<Theme>,

  // Equalizer panel flex - ORIGINAL (vertical layout)
  equalizerPanelFlex: {
    flex: '2 1 auto',
    minWidth: {
      xs: '25vw',
      sm: '50VW',
      md: '40vw',
      lg: '30%'
    },
    maxWidth: {
      xs: '100%',
      md: '300px',
      lg: '400px'
    },
    height: '30vh',
    minHeight: 'fit-content',
    display: 'flex',
    flexDirection: 'column'
  } as SxProps<Theme>,

  // 🔥 FIXED: Equalizer - full width, same height as others
  equalizerPanelFlexHorizontal: {
    display: 'flex',
    flex: '2 1',
    flexDirection: 'column',
    gridColumn: '3 / -1',  // ✅ SPAN: full width
    minHeight: '400px',    // ✅ Same as other panels
    maxHeight: '600px',    // ✅ Same as other panels  
    height: '90%',
    overflow: 'hidden',    // ✅ Outer never scrolls
    mb: 2,
    '& > div': {  // CollapsibleSection
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  } as SxProps<Theme>,

  // Visualization paper
  visualizationPaper: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
    background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.95) 100%)'
  } as SxProps<Theme>,

  // Dark screen overlay
  darkScreenOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    zIndex: 150,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(5px)',
  } as SxProps<Theme>,

  // Restore tabs container
  restoreTabsContainer: {
    position: 'fixed',
    bottom: {
      xs: 8,
      sm: 10,
      md: 10
    },
    right: {
      xs: 8,
      sm: 10,
      md: 10
    },
    zIndex: 1000,
    maxWidth: {
      xs: 'calc(100vw - 16px)',
      sm: 400,
      md: 300
    }
  } as SxProps<Theme>,

  // Restore tabs paper
  restoreTabsPaper: {
    p: 1,
    bgcolor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(10px)'
  } as SxProps<Theme>,

  // Restore tabs chip container
  restoreTabsChips: {
    display: 'flex',
    gap: '5px',
    flexWrap: 'wrap'
  } as SxProps<Theme>
};