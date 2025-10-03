// Electromagnetic Beat Lab Styles - Theme and styling configuration
// Extracted from main component for better organization

import type { SxProps, Theme } from '@mui/material/styles';

export const ElectromagneticLabStyles = {
  // Main container styles
  mainContainer: {
    width: '100vw',
    height: '100vh',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column'
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
    overflow: 'hidden'
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
    backgroundColor: 'rgba(30, 60, 90, 0.1)'
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

  // Main layout container
  mainLayoutContainer: (closedSections: string[]) => ({
    flex: 1,
    p: {
      xs: '5px',
      sm: '8px',
      md: '10px'
    },
    display: 'flex',
    gap: {
      xs: '5px',
      sm: '8px',
      md: '10px'
    },
    height: closedSections.includes('masterControls') 
      ? {
          xs: 'calc(100vh - 120px)',
          sm: 'calc(100vh - 100px)',
          md: 'calc(100vh - 80px)'
        }
      : {
          xs: 'calc(100vh - 80px)',
          sm: 'calc(100vh - 60px)',
          md: 'calc(100vh - 40px)'
        },
    minHeight: 0,
    flexDirection: {
      xs: 'column',
      sm: 'column',
      md: 'row',
      lg: 'row'
    },
    flexWrap: {
      md: 'nowrap',
      lg: 'wrap',
      xl: 'nowrap'
    },
    overflowX: {
      xs: 'visible',
      md: 'auto'
    },
    overflowY: {
      xs: 'auto',
      md: 'visible'
    }
  }) as SxProps<Theme>,

  // Panel flex styles
  panelFlex: {
    flex: {
      xs: '1 1 auto',
      sm: '1 1 auto',
      md: '1 1 280px',
      lg: '1 1 320px',
      xl: '0 1 350px'
    },
    minWidth: {
      xs: '280px',
      sm: '300px',
      md: '280px',
      lg: '320px'
    },
    maxWidth: {
      xs: '100%',
      md: '400px'
    },
    height: {
      xs: 'auto',
      md: '100%'
    },
    display: 'flex',
    flexDirection: 'column'
  } as SxProps<Theme>,

  // Wide panel flex (for binaural and visualization)
  widePanelFlex: {
    flex: {
      xs: '1 1 auto',
      sm: '1 1 auto',
      md: '1 1 320px',
      lg: '1 1 360px',
      xl: '0 1 400px'
    },
    minWidth: {
      xs: '280px',
      sm: '320px',
      md: '320px',
      lg: '360px'
    },
    maxWidth: {
      xs: '100%',
      md: '450px'
    },
    height: {
      xs: 'auto',
      md: '100%'
    },
    display: 'flex',
    flexDirection: 'column'
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