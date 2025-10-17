// Electromagnetic Beat Lab - Main App Component
// Entry point for the electromagnetic wave generator application

import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from './styles/GlobalStyles';
import ElectromagneticBeatLab from './components/homePage/ElectromagneticBeatLab';
import SimpleAuth from './components/SimpleAuth';
import TimerTab from './components/tabs/TimerTab';
import TimerCountdownDisplay from './components/TimerCountdownDisplay';
import { AuthProvider } from './contexts/AuthContext';
import { TimerProvider, useTimerContext } from './contexts/TimerContext';
import { AudioEngineProvider, useAudioEngineContext } from './contexts/AudioEngineContext';
import { useAuth } from './hooks/useAuth';
import { muiTheme } from './theme/muiTheme';
import { Box, Alert, Tabs, Tab, Typography } from '@mui/material';
import React from 'react';
import { WebSocketProvider } from './hooks/useWebsocketContext';
import { DEFAULT_BASE_FREQUENCY, DEFAULT_BEAT_FREQUENCY, DEFAULT_VOLUME } from './constants/audio.constants';
import { ErrorBoundary } from './components/ErrorBoundary';

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

// Main app content component (with contexts available)
const AppContent = () => {
  const { user, canUseApp, requiresLogin, usage } = useAuth();
  const [activeTab, setActiveTab] = React.useState(0);
  const [showUsageAlert, setShowUsageAlert] = React.useState(true);

  // Get timer state from context
  const { timerStatus, timerNavigationRef, timerControlRef } = useTimerContext();

  // Get hybrid audio engine from context
  const hybridEngine = useAudioEngineContext();
  
  // 🔥 CRITICAL FIX: Handle hot reload gracefully (context may be null during remount)
  if (!hybridEngine) {
    console.log('⏳ Waiting for AudioEngineProvider to initialize (hot reload)...');
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        color: 'white'
      }}>
        <Typography>Initializing audio engine...</Typography>
      </Box>
    );
  }

  // CRITICAL: Extract the actual app state for TimerCountdownDisplay
  // This ensures the visualizer has the current frequency data
  const [appState, setAppState] = React.useState({
    frequency: DEFAULT_BASE_FREQUENCY,
    beat_frequency: DEFAULT_BEAT_FREQUENCY,
    isPlaying: false,
    electromagnetic: {
      strength: 0,
      frequency: 0,
      phase: 0,
      coherence: 0,
      resonance: 0,
      state: 'INACTIVE' as const,
      stability: 0
    }
  });

  // Sync app state with audio engine
  React.useEffect(() => {
    const getActualFrequencies = () => {
      if (hybridEngine.audioState.config) {
        return {
          base: hybridEngine.audioState.config.base_frequency,
          beat: hybridEngine.audioState.config.beat_frequency
        };
      } else {
        return {
          base: hybridEngine.audioState.leftFreq || DEFAULT_BASE_FREQUENCY,
          beat: hybridEngine.audioState.beat_frequency || DEFAULT_BEAT_FREQUENCY
        };
      }
    };

    const frequencies = getActualFrequencies();
    setAppState(prev => ({
      ...prev,
      frequency: frequencies.base,
      beat_frequency: frequencies.beat,
      isPlaying: hybridEngine.audioState.isPlaying
    }));
  }, [
    hybridEngine.audioState.config?.base_frequency,
    hybridEngine.audioState.config?.beat_frequency,
    hybridEngine.audioState.leftFreq,
    hybridEngine.audioState.beat_frequency,
    hybridEngine.audioState.isPlaying
  ]);

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
    <ErrorBoundary>
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
      
      {/* Main app with tabs */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}>
        <Box sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'rgba(0,0,0,0.8)',
          flexShrink: 0
        }}>
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

        {/* CRITICAL: Timer Countdown Display - Rendered ABOVE tabs so it shows everywhere */}
        {timerStatus && (
          <Box sx={{
            p: { xs: '3px', sm: '5px', md: '8px' },  // ✅ REDUCED: was 5/8/10, now 3/5/8
            bgcolor: 'rgba(0,0,0,0.5)',
            borderBottom: '1px solid rgba(255, 107, 0, 0.2)'
          }}>
            <TimerCountdownDisplay
              timerStatus={timerStatus}
              isVisible={true}
              appState={appState as any}
              onJumpToTransition={timerNavigationRef.current.jumpToTransition}
              onRestartTransition={timerNavigationRef.current.restartCurrentTransition}
              audioContext={hybridEngine.audioContext}
              analyserNode={hybridEngine.analyserNode}
              hybridEngine={hybridEngine}
            />
          </Box>
        )}

        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          position: 'relative',
          height: 'auto'
        }}>
          {activeTab === 0 && (
            <ElectromagneticBeatLab
              autoStart={false}
              fullscreen={true}
            />
          )}
          {activeTab === 1 && (
            <Box sx={{ p: 2, pb: 4, height: 'auto', overflow: 'visible' }}>
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
                audioEngine={hybridEngine}
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
    </ErrorBoundary>
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
            {/* CRITICAL: AudioEngineProvider must wrap everything that needs the hybrid engine */}
            <AudioEngineProvider>
              {/* CRITICAL: TimerProvider must wrap everything that needs timer state */}
              <TimerProvider>
                <AppContent />
              </TimerProvider>
            </AudioEngineProvider>
          </WebSocketProvider>
        </AuthProvider>
      </StyledThemeProvider>
    </ThemeProvider>
  );
}

export default App;
