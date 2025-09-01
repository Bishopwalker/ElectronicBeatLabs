// Electromagnetic Beat Lab - Main App Component
// Entry point for the electromagnetic wave generator application

import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from './styles/GlobalStyles';
import ElectromagneticBeatLab from './components/ElectromagneticBeatLab';
import { muiTheme } from './theme/muiTheme';

// Styled Components theme configuration
const styledTheme = {
  colors: {
    primary: '#ff6b00',
    secondary: '#00ff88',
    accent: '#8a2be2',
    background: '#000000',
    surface: 'rgba(255, 255, 255, 0.05)',
    text: '#ffffff'
  },
  fonts: {
    main: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    mono: 'Courier New, monospace'
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px'
  }
};

function App() {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <StyledThemeProvider theme={styledTheme}>
        <CssBaseline />
        <GlobalStyles />
        <ElectromagneticBeatLab
          autoStart={false}
          fullscreen={true}
        />
      </StyledThemeProvider>
    </MuiThemeProvider>
  );
}

export default App;
