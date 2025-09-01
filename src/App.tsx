// Electromagnetic Beat Lab - Main App Component
// Entry point for the electromagnetic wave generator application

import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from './styles/GlobalStyles';
import ElectromagneticBeatLab from './components/ElectromagneticBeatLab';
import SimpleAuth from './components/SimpleAuth';
import UsageTrackingExample from './components/UsageTrackingExample';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { muiTheme } from './theme/muiTheme';
import { Box, Alert } from '@mui/material';

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

// Main app content component
const AppContent = () => {
  const { user, canUseApp, requiresLogin, usage } = useAuth();

  // If anonymous usage limit reached, require login
  if (!user && requiresLogin) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          You've used your free 3 hours this month! 
          {usage && ` (${Math.round(usage.used_minutes)} minutes used)`}
        </Alert>
        <Alert severity="info" sx={{ mb: 2 }}>
          Login to continue with a fresh 3-hour limit, or upgrade to Premium for unlimited access!
        </Alert>
        <SimpleAuth />
      </Box>
    );
  }

  // If user is logged in but exhausted their limits
  if (user && !user.is_premium && !canUseApp()) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          You've reached your free usage limit for this month (3 hours).
          Upgrade to Premium for unlimited access!
        </Alert>
        <SimpleAuth />
      </Box>
    );
  }

  // Show the main app (anonymous or logged in users with remaining time)
  return (
    <>
      {/* Optional usage indicator for anonymous users */}
      {!user && usage && (
        <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
          <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
            Free usage: {Math.round(usage.remaining_minutes)} min left
          </Alert>
        </Box>
      )}
      
      {/* Show usage tracking demo for testing */}
      <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1000 }}>
        <UsageTrackingExample />
      </Box>
      
      <ElectromagneticBeatLab
        autoStart={false}
        fullscreen={true}
      />
    </>
  );
};

function App() {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <StyledThemeProvider theme={styledTheme}>
        <CssBaseline />
        <GlobalStyles />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </StyledThemeProvider>
    </MuiThemeProvider>
  );
}

export default App;
