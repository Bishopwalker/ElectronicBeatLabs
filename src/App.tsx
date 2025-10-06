// Electromagnetic Beat Lab - Main App Component
// Entry point for the electromagnetic wave generator application

import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from './styles/GlobalStyles';
import ElectromagneticBeatLab from './components/ElectromagneticBeatLab';
import SimpleAuth from './components/SimpleAuth';
import TimerTab from './components/tabs/TimerTab';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { muiTheme } from './theme/muiTheme';
import { Box, Alert, Tabs, Tab, Typography } from '@mui/material';
import React from 'react';
import { WebSocketProvider } from './hooks/useWebsocketContext';
import { DEFAULT_BASE_FREQUENCY, DEFAULT_BEAT_FREQUENCY, DEFAULT_VOLUME } from './constants/audio.constants';

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
  const [activeTab, setActiveTab] = React.useState(0);
  const [showUsageAlert, setShowUsageAlert] = React.useState(true);

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
      {/* Optional usage indicator for anonymous users - moveable and closable */}
      {!user && usage && showUsageAlert && (
        <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1000 }}>
          <Alert
            severity="info"
            sx={{ fontSize: '0.8rem', cursor: 'move' }}
            onClose={() => setShowUsageAlert(false)}
          >
            Free usage: {Math.round(usage.remaining_minutes)} min left
          </Alert>
        </Box>
      )}
      
      {/* Show usage tracking demo for testing */}
      {/* <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1000 }}>
        <UsageTrackingExample />
      </Box> */}
      
      {/* Main app with tabs */}
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'rgba(0,0,0,0.8)' }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{ 
              '& .MuiTab-root': { 
                color: 'white',
                minWidth: 0,
                flex: 1,
                '&.Mui-selected': { color: '#ff6b00' }
              },
              '& .MuiTabs-indicator': { 
                backgroundColor: '#ff6b00' 
              },
              '& .MuiTabs-flexContainer': {
                justifyContent: 'stretch'
              }
            }}
          >
            <Tab label="Live Audio Generator" />
            <Tab label="Timer Presets" />
            <Tab label="New Visualizer Engine" />
          </Tabs>
        </Box>
        
        <Box sx={{ p: 0 }}>
          {activeTab === 0 && (
            <ElectromagneticBeatLab
              autoStart={false}
              fullscreen={true}
            />
          )}
          {activeTab === 1 && (
            <Box sx={{ p: 2, minHeight: 'calc(100vh - 64px)' }}>
              <TimerTab 
                appState={{
                  mode: 'AUTO',
                  currentPattern: null,
                  frequency: 4.0,
                  isPlaying: false,
                  volume: 0.3,
                  electromagnetic: {
                    strength: 0,
                    frequency: 0,
                    phase: 0,
                    coherence: 0,
                    resonance: 0,
                    state: 'INACTIVE',
                    stability: 0
                  },
                  patterns8D: [],
                  systemStatus: {
                    electromagnetic: {
                      strength: 0,
                      frequency: 0,
                      phase: 0,
                      coherence: 0,
                      resonance: 0,
                      state: 'INACTIVE',
                      stability: 0
                    },
                    audio: {
                      latency: 0,
                      sampleRate: 44100,
                      bufferSize: 512,
                      quality: 'HIGH'
                    },
                    performance: {
                      fps: 60,
                      cpuUsage: 0,
                      memoryUsage: 0
                    },
                    state: ''
                  },
                  visualizations: {
                    starField: {
                      density: 100,
                      speed: 1,
                      color: '#ffffff',
                      twinkle: true
                    },
                    spatial: {
                      gridSize: 50,
                      opacity: 0.3,
                      color: '#00ff88',
                      animation: true
                    },
                    frequency: {
                      bars: 64,
                      sensitivity: 1,
                      color: '#ff6b00',
                      glow: true
                    }
                  },
                  spatialAudio: {
                    enabled: true,
                    hrtf: false,
                    roomSize: 1,
                    reverbAmount: 0.2,
                    spatialWidth: 1,
                    elevation: 0,
                    azimuth: 0
                  },
                  youtube: {
                    videoId: '',
                    timestamp: 0,
                    syncMode: 'audio',
                    pythonScript: '',
                    enabled: false
                  },
                  adhd: null,
                  activeTab: 'timer'
                }}
                audioEngine={{
                  startBinauralBeat: (config: any) => console.log('Starting binaural beat:', config),
                  stopBinauralBeat: () => console.log('Stopping binaural beat'),
                  updateFrequency: (left: number, right: number) => console.log('Updating frequency:', left, right),
                  audioState: {
                    isPlaying: false,
                    leftFreq: DEFAULT_BASE_FREQUENCY,
                    rightFreq: DEFAULT_BASE_FREQUENCY + DEFAULT_BEAT_FREQUENCY,
                    beat_frequency: DEFAULT_BEAT_FREQUENCY,
                    volume: DEFAULT_VOLUME
                  }
                } as any}
                patterns8D={[]}
                onStateChange={() => {}}
              />
            </Box>
          )}
          {activeTab === 2 && (
            <Box sx={{ p: 1, minHeight: 'calc(100vh - 64px)' }}>
              <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', mt: 4 }}>
                Visualizer Test Component Removed - Under Maintenance
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <StyledThemeProvider theme={styledTheme}>
        <CssBaseline />
        <GlobalStyles />
        <AuthProvider>
          <WebSocketProvider>
            <AppContent />
          </WebSocketProvider>
        </AuthProvider>
      </StyledThemeProvider>
    </ThemeProvider>
  );
}

export default App;