// Electromagnetic Beat Lab - Main App Component
// Entry point for the electromagnetic wave generator application

import {ThemeProvider as StyledThemeProvider} from 'styled-components';
import {ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from './styles/GlobalStyles';
import ElectromagneticBeatLab from './components/homePage/ElectromagneticBeatLab';
import SimpleAuth from './components/SimpleAuth';
import TimerTab from './components/tabs/TimerTab';
import {AuthProvider} from './contexts/AuthContext';
import {TimerProvider, useTimerContext} from './contexts/TimerContext';
import {AudioEngineProvider, useAudioEngineContext} from './contexts/AudioEngineContext';
import {useAuth} from './hooks/useAuth';
import {muiTheme} from './theme/muiTheme';
import {Alert, Box, Typography} from '@mui/material';
import React from 'react';
import {WebSocketProvider} from './hooks/useWebsocketContext';
import {DEFAULT_BASE_FREQUENCY, DEFAULT_BEAT_FREQUENCY} from './constants/audio.constants';
import {ErrorBoundary} from './components/ErrorBoundary';
import {DEFAULT_APP_STATE} from './components/config/ElectromagneticLabConfig';
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
  const { timerStatus, setTimerStatus, timerNavigationRef, timerControlRef } = useTimerContext();

  // Get hybrid audio engine from context
  const hybridEngine = useAudioEngineContext();
  
  // 🔥 CRITICAL FIX: ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURNS!
  // This prevents hook order violations (React Rules of Hooks)
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

      {/* Timer Active Info Overlay - Shows at top when timer is active */}
      {timerStatus?.session?.is_active && timerStatus?.current_transition && (
        <Box sx={{
          bgcolor: 'rgba(0,0,0,0.8)',
          border: '2px solid #ff6b00',
          borderRadius: 1,
          p: 2,
          mb: 2,
          mx: 2,
          mt: 2,
          boxShadow: '0 0 20px rgba(255, 107, 0, 0.4)',
          borderBottom: '3px solid rgba(255, 107, 0, 0.3)'
        }}>
          <Typography variant="h5" gutterBottom sx={{color: '#00ff88', fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'center'}}>
            🎧 TIMER ACTIVE: {timerStatus.current_transition.description}
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom sx={{ fontSize: '0.9rem', textAlign: 'center' }}>
            <Box component="span" sx={{color: '#ff6b00', fontWeight: 'bold', fontSize: '1rem'}}>
              {timerStatus.current_transition.frequency_hz}Hz
            </Box> •
            {timerStatus.current_transition.frequency_type} waves •
            <Box component="span" sx={{color: '#00bfff', fontWeight: 'bold'}}>
              {timerStatus.current_transition.left_ear_hz}Hz L / {timerStatus.current_transition.right_ear_hz}Hz R
            </Box>
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ffd700' }}>
              Current: {(timerStatus.time_remaining_current / 60).toFixed(0)}:{(timerStatus.time_remaining_current % 60).toString().padStart(2, '0')}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ffd700' }}>
              Total: {(timerStatus.time_remaining_total / 60).toFixed(0)}:{(timerStatus.time_remaining_total % 60).toString().padStart(2, '0')}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Main app with tabs */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        height: 'auto',
        overflowY: 'auto',
        bgcolor: 'background.default',
        pb: { xs: '3px', sm: '5px', md: '8px' }
      }}>

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
                appState={{ ...DEFAULT_APP_STATE, activeTab: 'timer' }}
                audioEngine={hybridEngine}
                patterns8D={[]}
                onStateChange={() => {}}
                onTimerStatusUpdate={(status) => setTimerStatus(status)}
                onSetTimerNavigation={(nav) => {
                  timerNavigationRef.current.jumpToTransition = nav.jumpToTransition;
                  timerNavigationRef.current.restartCurrentTransition = nav.restartCurrentTransition;
                }}
                onSetTimerControl={(control) => {
                  timerControlRef.current.stopTimer = control.stopTimer;
                  timerControlRef.current.pauseTimer = control.pauseTimer;
                  timerControlRef.current.resumeTimer = control.resumeTimer;
                  timerControlRef.current.restartTimer = control.restartTimer;
                }}
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
      <ErrorBoundary>
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
        </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;