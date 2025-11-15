// Electromagnetic Beat Lab Styles - Theme and styling configuration
// Extracted from main component for better organization

import type {SxProps, Theme} from '@mui/material/styles';

export const ElectromagneticLabStyles = {
  // Main container styles - GRID: Header 15vh, Content 85vh
  mainContainer: {
    width: '100vw',
    height: '100vh',
    overflowX: 'hidden',
    overflowY: 'auto',
    display: 'grid',
    gridTemplateRows: '15vh 85vh'
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
    overflowX: 'hidden',
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

  // Tab content area
  tabContent: {
    flex: 1,
    overflowY: 'auto',
    p: 2,
    backgroundColor: 'rgba(30, 60, 90, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'calc(100vh - 180px)',
    height: '100%'
  } as SxProps<Theme>,

  // Header paper
  headerPaper: {
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    p: { xs: 1.5, sm: 2, md: 2.5 },
    display: 'flex',
    flexDirection: 'column',
    gap: { xs: 1, sm: 1.5 },
    backdropFilter: 'blur(10px)',
    bgcolor: 'rgba(0, 0, 0, 0.95)',
    borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    flexShrink: 0
  } as SxProps<Theme>,

  // Title and status row
  titleStatusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    bgcolor: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    flexShrink: 1,
    p: 1,
    flexWrap: 'wrap',
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

  // Main title
  mainTitle: {
    fontWeight: 700,
    m: 0,
    fontSize: {
      xs: '1rem',
      sm: '1.3rem',
      md: '1.7rem',
      lg: '2rem'
    },
     textAlign: 'center'
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
    py: 1.5,
    background: 'rgba(138, 43, 226, 0.3)',
    backdropFilter: 'blur(10px)',
    borderRadius: 2,
    border: '8px solid rgba(138, 43, 226, 0.6)',
    boxShadow: '0 4px 12px rgba(138, 43, 226, 0.4)',
    flexWrap: 'wrap',
    flexDirection: {
      xs: 'column',
      sm: 'row'
    },
    mt: 1
  } as SxProps<Theme>,

  // System status chips container
  systemStatusChips: {
    display: 'flex',
    position:'sticky',
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

  // CUSTOM CSS GRID LAYOUT - Supports fractional sizing
  // Grid uses 6 columns (allows 1x, 1.5x, 2x sizing) and 4 rows (allows 1x, 1.5x, 2x height)
  customGridLayout: {
    display: 'grid',
    gridTemplateColumns: {
      xss: 'repeat(1,auto)',
      sm: 'repeat(6, 1fr)',
      md: 'repeat(10, 1fr)',
      lg: 'repeat(10, 1fr)',
      xl: '1fr, 2fr, 1fr',
      xxl:'1fr, 2fr, 1fr',
    }, // 6 columns for fractional sizing
    gridTemplateRows: {
        xs: 'repeat(4, 1fr)',
        sm: 'repeat(4, 1fr)',
        md: 'auto 1fr',
        lg: 'auto',
        xl: '1fr, 2fr, 1fr',
        xxl: '1fr, 2fr, 1fr',
    }, // 4 rows for fractional sizing
    gap: 2,
    width: '100%',
    height: '100%',
    p: 2,
    overflowX: 'hidden',
    overflowY: 'auto',
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0
  } as SxProps<Theme>,

  // Standard panel (1x1) - takes 2 columns, 1 row
  panelFlex: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    gridColumn: 'span 2',
    gridRow: 'span 1',
    overflowX: 'hidden',
    overflowY: 'auto',
    '& > div': {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      overflowY: 'auto'
    }
  } as SxProps<Theme>,

  // Double wide panel (2x1) - takes 4 columns, 1 row
  widePanelFlex: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    gridColumn: 'span 4',
    gridRow: 'span 1',
    overflowX: 'hidden',
    overflowY: 'auto',
    '& > div': {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      overflowY: 'auto'
    }
  } as SxProps<Theme>,

  // Double height panel (1x2) - takes 2 columns, 2 rows
  doubleHeightPanelFlex: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    gridColumn: 'span 2',
    gridRow: 'span 2',
    overflowX: 'hidden',
    overflowY: 'auto',
    '& > div': {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      overflowY: 'auto'
    }
  } as SxProps<Theme>,

  // 1.5x panel (1.5 width, 1.5 height) - takes 3 columns, 1.5 rows
  onePointFivePanelFlex: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    gridColumn: 'span 3',
    gridRow: 'span 1.5',
    overflowX: 'hidden',
    overflowY: 'auto',
    '& > div': {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      overflowY: 'auto'
    }
  } as SxProps<Theme>,

  // Half panel
  halfPanelFlex: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    gridColumn: 'span 1',
    gridRow: 'span 1',
    overflowX: 'hidden',
    overflowY: 'auto',
    '& > div': {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      overflowY: 'auto'
    }
  } as SxProps<Theme>,

  // Equalizer panel
  equalizerPanelFlex: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflowX: 'hidden',
    overflowY: 'auto'
  } as SxProps<Theme>,
//Timer Display
  timerDisplay:{
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    height: '75vh',
    gridColumn: 'span 4',
    gridRow: 'span 2',
    overflowX: 'hidden',
    overflowY: 'auto',
    '& > div': {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      overflowY: 'auto'
    }
  } as SxProps<Theme>,
  // Equalizer horizontal
  equalizerPanelFlexHorizontal: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    gridColumn: 'span 4',
    gridRow: 'span 1',
    overflowX: 'hidden',
    overflowY: 'auto',
    '& > div': {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      overflowY: 'auto'
    }
  } as SxProps<Theme>,

  // Visualization paper
  visualizationPaper: {
    width: '100%',
    height: '100%',
    minHeight: 0,
    p: 2,
    bgcolor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: 3,
    overflowX: 'hidden',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    position: 'relative',
    '&:hover': {
      bgcolor: 'rgba(0, 0, 0, 0.9)',
    },
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
    backdropFilter: 'blur(5px)'
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
  } as SxProps<Theme>,

  // Component-specific color styles
  timerCountdownStyle: {
    background: 'linear-gradient(45deg, rgba(255, 107, 0, 0.1), rgba(138, 43, 226, 0.1))',
    border: '1px solid #ff6b00',
    boxShadow: '0 4px 20px rgba(255, 107, 0, 0.3)'
  } as SxProps<Theme>,

  timerPresetsStyle: {
    background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.1), rgba(0, 188, 212, 0.1))',
    border: '1px solid #2196f3',
    boxShadow: '0 4px 20px rgba(33, 150, 243, 0.3)'
  } as SxProps<Theme>,

  patternsStyle: {
    background: 'linear-gradient(45deg, rgba(156, 39, 176, 0.1), rgba(233, 30, 99, 0.1))',
    border: '1px solid #9c27b0',
    boxShadow: '0 4px 20px rgba(156, 39, 176, 0.3)'
  } as SxProps<Theme>,

  frequencyVisualizerStyle: {
    background: 'linear-gradient(45deg, rgba(0, 255, 136, 0.1), rgba(0, 188, 212, 0.1))',
    border: '1px solid #00ff88',
    boxShadow: '0 4px 20px rgba(0, 255, 136, 0.3)'
  } as SxProps<Theme>,

  binauralBeatsStyle: {
    background: 'linear-gradient(45deg, rgba(255, 107, 0, 0.1), rgba(244, 67, 54, 0.1))',
    border: '1px solid #ff6b00',
    boxShadow: '0 4px 20px rgba(255, 107, 0, 0.3)'
  } as SxProps<Theme>,

  masterControlsStyle: {
    background: 'linear-gradient(45deg, rgba(0, 150, 136, 0.1), rgba(0, 188, 212, 0.1))',
    border: '1px solid #009688',
    boxShadow: '0 4px 20px rgba(0, 150, 136, 0.3)'
  } as SxProps<Theme>,

  equalizerStyle: {
    background: 'linear-gradient(45deg, rgba(103, 58, 183, 0.1), rgba(63, 81, 181, 0.1))',
    border: '1px solid #673ab7',
    boxShadow: '0 4px 20px rgba(103, 58, 183, 0.3)'
  } as SxProps<Theme>,

  spatialVisualizerStyle: {
    background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.1) 0%, rgba(138, 43, 226, 0.1) 50%, rgba(0, 255, 136, 0.1) 100%)',
    border: '1px solid',
    borderImage: 'linear-gradient(135deg, #ff6b00 0%, #8a2be2 50%, #00ff88 100%) 1',
    boxShadow: '0 4px 20px rgba(138, 43, 226, 0.3)'
  } as SxProps<Theme>,

  // Auto-fit grid row for dynamic component layout
  autoFitGridRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: { xs: 1, sm: 1.5, md: 2, lg: 2 },
    width: '100%',
    minHeight: 0,
    '& > *': {
      minWidth: 0,
      minHeight: 0
    }
  } as SxProps<Theme>
};