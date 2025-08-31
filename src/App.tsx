// Electromagnetic Beat Lab - Main App Component
// Entry point for the electromagnetic wave generator application

import React from 'react';
import { ThemeProvider } from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';
import ElectromagneticBeatLab from './components/ElectromagneticBeatLab';

// Theme configuration
const theme = {
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
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <ElectromagneticBeatLab
        autoStart={false}
        fullscreen={true}
      />
    </ThemeProvider>
  );
}

export default App;
