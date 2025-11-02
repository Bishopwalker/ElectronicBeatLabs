// Electromagnetic Beat Lab - Settings Tab Component

import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, Slider, Switch, FormControlLabel } from '@mui/material';
// import SpatialAudioControls from '../SpatialAudioControls'; // REMOVED - component deleted
import type { AppState, AudioEngine, Pattern8D } from '../../types';
import TimerCountdownDisplay from "../TimerCountdownDisplay.tsx";
import type {TimerStatus} from "../../data/timer";

interface SettingsTabProps {
  timerStatus?: TimerStatus;
  appState: AppState;
  audioEngine: AudioEngine;
  patterns8D: Pattern8D[];
  onStateChange: (state: Partial<AppState>) => void;
  backendEngine?: any; // Backend audio engine for WebSocket state
  frontendEngine?: any; // Frontend audio engine for audio context state
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  appState,
   onStateChange,
  backendEngine,
  frontendEngine,
 }) => {
  // Use specific engines for their purposes
  const audioContextEngine = frontendEngine; // Always use frontend for audio context
  const connectionEngine = backendEngine;     // Always use backend for connection status

  // Local state to track audio context and connection states
  const [audioContextState, setAudioContextState] = useState(
    audioContextEngine?.audioState?.context?.state || 'closed'
  );

  const [backendConnected, setBackendConnected] = useState(
    connectionEngine?.backendConnected || false
  );
  const [websocketState, setWebsocketState] = useState({
    connected: connectionEngine?.websocketState?.connected || false,
    connecting: connectionEngine?.websocketState?.connecting || false,
    error: connectionEngine?.websocketState?.error || null
  });

  // Monitor audio context state changes
  useEffect(() => {
    const checkAudioContext = () => {
      const newState = audioContextEngine?.audioState?.context?.state || 'closed';
      if (newState !== audioContextState) {
        setAudioContextState(newState);
      }
    };

    // Check immediately and set up interval
    checkAudioContext();
    const intervalId = setInterval(checkAudioContext, 1000);

    return () => clearInterval(intervalId);
  }, [audioContextEngine?.audioState?.context, audioContextState]);

  // Monitor backend connection state
  useEffect(() => {
    const checkConnectionState = () => {
      const newBackendConnected = connectionEngine?.backendConnected || false;
      const newWebsocketState = {
        connected: connectionEngine?.websocketState?.connected || false,
        connecting: connectionEngine?.websocketState?.connecting || false,
        error: connectionEngine?.websocketState?.error || null
      };

      setBackendConnected(newBackendConnected);
      setWebsocketState(newWebsocketState);
    };

    // Check immediately and set up interval
    checkConnectionState();
    const intervalId = setInterval(checkConnectionState, 1000);
    return () => clearInterval(intervalId);
  }, [connectionEngine?.backendConnected, connectionEngine?.websocketState, backendConnected]);

  // Initialize audio context if it's closed/undefined and we have a frontend engine
  useEffect(() => {
    const tryInitializeAudioContext = async () => {
      if (audioContextState === 'closed' && audioContextEngine?.initializeAudio) {
        try {
          const context = await audioContextEngine.initializeAudio();
          if (context) {
            setAudioContextState(context.state);
          }
        } catch (error) {
        }
      }
    };

    // Only try once when component mounts
    if ( audioContextState === 'closed') {
       tryInitializeAudioContext();
    }
  }, [ audioContextState.connected == 'closed']); // Empty deps - only run on mount

  const handleSpatialSettingsChange = (spatialSettings: {
    enabled: boolean;
    movement_speed: number;
    spatial_intensity: number;
    reverb_enabled: boolean;
    reverberance?: number;
    room_scale?: number;
    hf_damping?: number;
  }) => {
    // Create full spatial config
    const fullSpatialConfig = {
      ...appState.spatialAudio,
      ...spatialSettings
    };
    
    // Update spatial audio settings in app state
    onStateChange({
      spatialAudio: fullSpatialConfig,
      lastUpdate: Date.now() // Force UI update
    });

    // Update backend settings if connected
    if (connectionEngine?.updateSpatialSettings && connectionEngine?.backendConnected) {
      connectionEngine.updateSpatialSettings(fullSpatialConfig);
    }
  };

  // Handler for WebSocket reconnection
  const handleWebSocketReconnect = () => {
    if (connectionEngine?.connectBackend && connectionEngine?.disconnectBackend) {
      // Disconnect first, then reconnect
      connectionEngine.disconnectBackend();
      setTimeout(() => {
        connectionEngine.connectBackend();
      }, 1000);
    } else {
    }
  };

  // Handler for AudioContext resume
  const handleAudioContextResume = async () => {
    if (audioContextEngine?.audioState?.context) {
      try {
        await audioContextEngine.audioState.context.resume();
        setAudioContextState(audioContextEngine.audioState.context.state);
        // Force a state update to trigger UI re-render
        onStateChange({
          audioContextState: audioContextEngine.audioState.context.state,
          // Add timestamp to force update
          lastUpdate: Date.now()
        });
      } catch (error) {
      }
    }
  };

  // Handler for AudioContext reset
  const handleAudioContextReset = async () => {
    try {
      if (audioContextEngine?.resetAudioContext) {
        await audioContextEngine.resetAudioContext();
      } else if (audioContextEngine?.initializeAudio) {
        const context = await audioContextEngine.initializeAudio();
        if (context) {
          // For frontend engine, we need to update the audio state directly
          if (audioContextEngine.setAudioState) {
            audioContextEngine.setAudioState((prev: any) => ({
              ...prev,
              context
            }));
          }
          setAudioContextState(context.state);
        }
      }
      // Force state update after reset
      onStateChange({
        audioContextState: audioContextEngine?.audioState?.context?.state || 'closed',
        lastUpdate: Date.now()
      });
    } catch (error) {
    }
  };

  // Handler for AudioContext initialization (user gesture)
  const handleAudioContextInit = async () => {
    try {
      if (audioContextEngine?.initializeAudio) {
        const context = await audioContextEngine.initializeAudio();
        if (context) {
          // For frontend engine, we need to update the audio state directly
          if (audioContextEngine.setAudioState) {
            audioContextEngine.setAudioState((prev: any) => ({
              ...prev,
              context
            }));
          }
          setAudioContextState(context.state);
        }
      }
    } catch (error) {
    }
  };

  return (
    <Box
      sx={{
        py: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
       <Paper
        sx={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 3,
          p: 1,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: '#00ff88',
            mb: 1,
            fontSize: '0.8rem',
            fontStyle: 'italic'
          }}
        >
          💡 8D Spatial Audio settings moved to Advanced Controls
        </Typography>
      </Paper>
  
      <Paper
        sx={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 3,
          p: 1,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Typography
          variant="h6"
          component="h4"
          sx={{
            color: '#ffd700',
            mb: 1,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          ⚡ Backend Connection
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          {backendConnected ? (
            <Typography sx={{ color: '#00ff88' }}>
              ✅ Connected to backend (Session: {connectionEngine?.sessionId?.slice(-8)})
            </Typography>
          ) : (
            <Typography sx={{ color: '#ff6b00' }}>
              ⚠️ Using local audio engine
            </Typography>
          )}
          
          <Button
            variant={backendConnected ? "outlined" : "contained"}
            color={backendConnected ? "error" : "success"}
            size="small"
            onClick={() => {
              if (backendConnected) {
                connectionEngine?.disconnectBackend?.();
              } else {
                connectionEngine?.connectBackend?.();
              }
            }}
            sx={{ ml: 1 }}
          >
            {backendConnected ? 'Disconnect' : 'Connect Backend'}
          </Button>
        </Box>
        
        {websocketState && (
          <Box sx={{ mt: 0.5 }}>
            <Typography sx={{ fontSize: '0.9rem', color: '#e0e0e0' }}>
              WebSocket: {websocketState.connected ? '🟢 Connected' : 
                        websocketState.connecting ? '🟡 Connecting...' : '🔴 Disconnected'}
            </Typography>
            {websocketState.error && (
              <Typography component="div" sx={{ color: '#ff4444', mt: 0.25, fontSize: '0.85rem' }}>
                Error: {websocketState.error}
              </Typography>
            )}
            {!websocketState.connected && !websocketState.connecting && (
              <Button
                variant="outlined"
                color="warning"
                size="small"
                onClick={handleWebSocketReconnect}
                sx={{ mt: 0.5, fontSize: '0.75rem', py: 0.25 }}
              >
                🔄 Reconnect WebSocket
              </Button>
            )}
          </Box>
        )}
      </Paper>

      {/* Spatial Audio Controls Section - only show when backend is connected */}
      {backendConnected && (
        <Paper
          sx={{
            background: 'rgba(0, 191, 255, 0.05)',
            borderRadius: 3,
            p: 2,
            border: '1px solid rgba(0, 191, 255, 0.3)'
          }}
        >
          <Typography
            variant="h6"
            component="h4"
            sx={{
              color: '#00bfff',
              mb: 2,
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            🎧 8D Spatial Audio Settings
          </Typography>

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={appState.spatialAudio?.enabled || false}
                  onChange={(e) => handleSpatialSettingsChange({
                    ...appState.spatialAudio,
                    enabled: e.target.checked,
                    movement_speed: appState.spatialAudio?.movement_speed || 1.0,
                    spatial_intensity: appState.spatialAudio?.spatial_intensity || 0.5,
                    reverb_enabled: appState.spatialAudio?.reverb_enabled || false
                  })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#00bfff'
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      bgcolor: '#00bfff'
                    }
                  }}
                />
              }
              label={
                <Typography sx={{ color: '#e0e0e0', fontSize: '0.9rem' }}>
                  Enable Spatial Audio {appState.spatialAudio?.enabled ? '🟢' : '🔴'}
                </Typography>
              }
            />
          </Box>

          {appState.spatialAudio?.enabled && (
            <>
              {/* Movement Speed */}
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ color: '#e0e0e0', fontSize: '0.85rem', mb: 0.5 }}>
                  Movement Speed: {(appState.spatialAudio?.movement_speed || 1.0).toFixed(2)}x
                </Typography>
                <Slider
                  value={appState.spatialAudio?.movement_speed || 1.0}
                  onChange={(_, value) => handleSpatialSettingsChange({
                    ...appState.spatialAudio,
                    enabled: true,
                    movement_speed: value as number,
                    spatial_intensity: appState.spatialAudio?.spatial_intensity || 0.5,
                    reverb_enabled: appState.spatialAudio?.reverb_enabled || false
                  })}
                  min={0.1}
                  max={5.0}
                  step={0.1}
                  sx={{
                    color: '#00bfff',
                    '& .MuiSlider-thumb': {
                      bgcolor: '#00bfff'
                    }
                  }}
                />
              </Box>

              {/* Spatial Intensity */}
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ color: '#e0e0e0', fontSize: '0.85rem', mb: 0.5 }}>
                  Spatial Intensity: {((appState.spatialAudio?.spatial_intensity || 0.5) * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={appState.spatialAudio?.spatial_intensity || 0.5}
                  onChange={(_, value) => handleSpatialSettingsChange({
                    ...appState.spatialAudio,
                    enabled: true,
                    movement_speed: appState.spatialAudio?.movement_speed || 1.0,
                    spatial_intensity: value as number,
                    reverb_enabled: appState.spatialAudio?.reverb_enabled || false
                  })}
                  min={0}
                  max={1}
                  step={0.05}
                  sx={{
                    color: '#00bfff',
                    '& .MuiSlider-thumb': {
                      bgcolor: '#00bfff'
                    }
                  }}
                />
              </Box>

              {/* Reverb Toggle */}
              <Box sx={{ mb: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={appState.spatialAudio?.reverb_enabled || false}
                      onChange={(e) => handleSpatialSettingsChange({
                        ...appState.spatialAudio,
                        enabled: true,
                        movement_speed: appState.spatialAudio?.movement_speed || 1.0,
                        spatial_intensity: appState.spatialAudio?.spatial_intensity || 0.5,
                        reverb_enabled: e.target.checked
                      })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#00bfff'
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          bgcolor: '#00bfff'
                        }
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: '#e0e0e0', fontSize: '0.85rem' }}>
                      Enable Reverb {appState.spatialAudio?.reverb_enabled ? '🎵' : '🔇'}
                    </Typography>
                  }
                />
              </Box>
            </>
          )}
        </Paper>
      )}

      <Paper
        sx={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 3,
          p: 1,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}

      >

        <Typography
          variant="h6"
          component="h4"
          sx={{
            color: '#ffd700',
            mb: 1,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          🔧 Audio Settings
        </Typography>
        <Box sx={{ color: '#e0e0e0', fontSize: '0.9rem' }}>
          <Typography component="div" sx={{ mb: 0.5 }}>
            Sample Rate: {audioContextEngine?.audioState?.context?.sampleRate || 44100} Hz
          </Typography>
          <Typography component="div" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            Audio Context State:
            <Box component="span" sx={{
              fontWeight: 600,
              color: audioContextState === 'running' ? '#00ff88' :
                     audioContextState === 'suspended' ? '#ff6b00' : '#ff4444'
            }}>
              {audioContextState === 'running' ? '🟢 Running' :
               audioContextState === 'suspended' ? '🟡 Suspended' :
               audioContextState === 'closed' ? '🔴 Closed' : '⚫ Not initialized'}
            </Box>
          </Typography>
          <Typography component="div" sx={{ mb: 0.5 }}>
            Active Engine: {backendConnected ? '🔗 Backend (Python DSP)' : '⚡ Frontend (Web Audio)'}
          </Typography>
          <Typography component="div" sx={{ mb: 1 }}>
            Web Audio Support: {audioContextEngine?.isSupported ? '✅ Supported' : '❌ Not supported'}
          </Typography>
            {/* Electromagnetic Field Analyzer */}
            <Paper
                elevation={0}
                sx={{
                    p: 0.75,
                    background: 'rgba(0, 255, 136, 0.05)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                }}
            >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    ⚡ Electromagnetic Field Analysis
                </Typography>
                <Grid container spacing={1}>
                    <Grid size={6}>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                            Field Strength
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={electromagneticStrength * 100}
                            sx={{
                                height: 8,
                                borderRadius: 1,
                                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#00ff88'
                                }
                            }}
                        />
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#00ff88', fontWeight: 600 }}>
                            {(electromagneticStrength * 100).toFixed(2)}%
                        </Typography>
                    </Grid>

                    <Grid size={6}>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                            State
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#00ff88', fontWeight: 700 }}>
                            {electromagneticState}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Stack direction="row" spacing={0.5} justifyContent="center">
                <IconButton
                    onClick={handleReset}
                    color="default"
                    size="small"
                    sx={{
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        '&:hover': {
                            background: 'rgba(255, 255, 255, 0.05)',
                        }
                    }}
                >
                    <RefreshIcon />
                </IconButton>
            </Stack>

            <Stack direction="row" spacing={0.5} justifyContent="center">
                <Chip label={`Viz: ${stats.averageFps} FPS`} size="small" sx={{ fontSize: '0.65rem' }} />
                <Chip
                    label={isVisualizing ? 'ANALYZING' : 'READY'}
                    color={isVisualizing ? 'success' : 'default'}
                    size="small"
                    sx={{ fontSize: '0.65rem' }}
                />
            </Stack>
          {/* AudioContext Control Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            {audioContextState === 'closed' && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleAudioContextInit}
                sx={{ fontSize: '0.75rem', py: 0.25 }}
              >
                🎵 Initialize Audio Context
              </Button>
            )}
            {audioContextState === 'suspended' && (
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleAudioContextResume}
                sx={{ fontSize: '0.75rem', py: 0.25 }}
              >
                ▶️ Resume Audio
              </Button>
            )}
            {audioContextState && audioContextState !== 'closed' && (
              <Button
                variant="outlined"
                color="warning"
                size="small"
                onClick={handleAudioContextReset}
                sx={{ fontSize: '0.75rem', py: 0.25 }}
              >
                🔄 Reset Audio Context
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Paper
        sx={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 3,
          p: 1,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Typography
          variant="h6"
          component="h4"
          sx={{
            color: '#ffd700',
            mb: 1,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          📊 Performance
        </Typography>
        <Box sx={{ color: '#e0e0e0', fontSize: '0.9rem' }}>
          <Typography component="div">Electromagnetic State: {appState.electromagnetic?.state || 'INACTIVE'}</Typography>
          <Typography component="div">Field Strength: {((appState.electromagnetic?.strength || 0) * 100).toFixed(1)}%</Typography>
          <Typography component="div">Coherence: {((appState.electromagnetic?.coherence || 0) * 100).toFixed(1)}%</Typography>
          <Typography component="div">Beat Frequency: {(appState.frequency?.current ?? 0).toFixed(2)} Hz</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default SettingsTab;