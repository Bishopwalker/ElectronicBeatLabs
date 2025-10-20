// Electromagnetic Beat Lab Styles - Theme and styling configuration
// Extracted from main component for better organization

import type { SxProps, Theme } from '@mui/material/styles';

export const ElectromagneticLabStyles = {
  // Main container styles - GRID: Header 15vh, Content 85vh
  mainContainer: {
    width: '100vw',
    height: '100vh',
     overflow: 'hidden',
    display: 'grid',

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

  // Tab content area
  tabContent: {
    flex: 1,
    overflowY: 'hidden',
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
    p: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
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
    flexShrink: 0,
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

  // MAIN LAYOUT GRID - 3 columns, 2 rows (each 42.5vh), fills 85vh
  mainLayoutContainer: (closedSections: string[]) => ({
    p: 1,
    display: 'grid',

    gap: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    '& > div': {
      transition: 'all 0.2s ease-in-out',
      opacity: closedSections.includes('all') ? 0 : 1,
      transform: closedSections.includes('all') ? 'scale(0.9)' : 'scale(1)',
      '&:hover': {
        opacity: 1,
        transform: 'scale(1)',
      }
    }
  }) as SxProps<Theme>,

  // Standard panel
  panelFlex: {
    display: 'grid',
    flexDirection: 'column',
    overflow: 'hidden',
    '& > div': {
      height: '100%',
      display: 'grid',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  } as SxProps<Theme>,

  // Wide panel
  widePanelFlex: {
    display: 'grid',
    flexDirection: 'column',
    gridColumn: 'span 2',
    overflow: 'hidden',
    '& > div': {
      height: '100%',
      display: 'grid',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  } as SxProps<Theme>,

  // Double height panel
  doubleHeightPanelFlex: {
    display: 'grid',
    flexDirection: 'column',
    gridRow: 'span 2',
    overflow: 'hidden',
    '& > div': {
      height: '100%',
      display: 'grid',
      flexDirection: 'column',
      overflowY: 'auto'
    }
  } as SxProps<Theme>,

  // Half panel
  halfPanelFlex: {
    display: 'grid',
    flexDirection: 'column',
    overflow: 'hidden',
    '& > div': {
      height: '100%',
      display: 'grid',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  } as SxProps<Theme>,

  // Equalizer panel
  equalizerPanelFlex: {
    display: 'grid',
     overflowX: 'hidden',
    overflowY:'auto'
  } as SxProps<Theme>,

  // Equalizer horizontal
  equalizerPanelFlexHorizontal: {
    display: 'grid',
      overflowX: 'hidden',
      overflowY:'auto',
    gridColumn:{
      height: '100%',
      display: 'grid',
      flexDirection: 'column',
      overflowX: 'hidden',
      overflowY:'auto'
    },
    '& > div': {
      height: '100%',
      display: 'grid',
      flexDirection: 'column',
      overflowX: 'hidden',
      overflowY:'auto'
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