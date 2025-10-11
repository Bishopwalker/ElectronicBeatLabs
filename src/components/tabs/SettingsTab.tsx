// Electromagnetic Beat Lab - Settings Tab Component

import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
// import SpatialAudioControls from '../SpatialAudioControls'; // REMOVED - component deleted
import type { AppState, AudioEngine, Pattern8D } from '../../types';
import TimerCountdownDisplay from "../TimerCountdownDisplay.tsx";
import type {TimerStatus} from "../../data/timer";

interface SettingsTabProps {
  timerStatus: TimerStatus;
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
        console.log('🎵 SettingsTab: Attempting to initialize audio context...');
        try {
          const context = await audioContextEngine.initializeAudio();
          if (context) {
            console.log('✅ SettingsTab: Audio context initialized successfully');
            setAudioContextState(context.state);
          }
        } catch (error) {
          console.error('❌ SettingsTab: Failed to initialize audio context:', error);
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
    console.log('🔄 Manually reconnecting WebSocket...');
    if (connectionEngine?.connectBackend && connectionEngine?.disconnectBackend) {
      // Disconnect first, then reconnect
      connectionEngine.disconnectBackend();
      setTimeout(() => {
        connectionEngine.connectBackend();
      }, 1000);
    } else {
      console.warn('⚠️ No backend connection methods available');
    }
  };

  // Handler for AudioContext resume
  const handleAudioContextResume = async () => {
    console.log('▶️ Resuming AudioContext...');
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
        console.error('Failed to resume AudioContext:', error);
      }
    }
  };

  // Handler for AudioContext reset
  const handleAudioContextReset = async () => {
    console.log('🔄 Resetting AudioContext...');
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
      console.error('Failed to reset AudioContext:', error);
    }
  };

  // Handler for AudioContext initialization (user gesture)
  const handleAudioContextInit = async () => {
    console.log('🎵 Manually initializing AudioContext...');
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
          console.log('✅ Audio context initialized with user gesture:', context.state);
        }
      }
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
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
      {/* Spatial Audio Controls - TEMPORARILY DISABLED (component deleted during cleanup)
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
      */}

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
          <Typography component="div">Beat Frequency: {appState.frequency?.toFixed(2) || '0.00'} Hz</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default SettingsTab;