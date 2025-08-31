// Electromagnetic Beat Lab - Material UI Theme
import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff6b00',
      light: '#ff8533',
      dark: '#cc5500',
    },
    secondary: {
      main: '#8a2be2',
      light: '#9944d9',
      dark: '#6b22b2',
    },
    success: {
      main: '#00ff88',
      light: '#33ff99',
      dark: '#00cc66',
    },
    warning: {
      main: '#ffd700',
      light: '#ffe833',
      dark: '#ccaa00',
    },
    info: {
      main: '#00bfff',
      light: '#33ccff',
      dark: '#0099cc',
    },
    background: {
      default: '#0a0a0a',
      paper: 'rgba(255, 255, 255, 0.02)',
    },
    text: {
      primary: '#e0e0e0',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.2rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '0.9rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.8rem',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.5px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(255, 107, 0, 0.3)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #ff6b00, #8a2be2)',
          '&:hover': {
            background: 'linear-gradient(45deg, #ff8533, #9944d9)',
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          '& .MuiSlider-track': {
            background: 'linear-gradient(90deg, #ff6b00, #8a2be2)',
          },
          '& .MuiSlider-thumb': {
            background: 'linear-gradient(45deg, #ff6b00, #8a2be2)',
            border: '2px solid #ffffff',
            '&:hover': {
              boxShadow: '0 0 15px rgba(255, 107, 0, 0.7)',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: '#ff6b00',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ff6b00',
              boxShadow: '0 0 0 2px rgba(255, 107, 0, 0.2)',
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#ff6b00',
          height: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.5px',
          '&.Mui-selected': {
            color: '#ff6b00',
          },
        },
      },
    },
  },
});

export default muiTheme;