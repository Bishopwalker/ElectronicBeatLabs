// Electromagnetic Beat Lab - Settings Tab Component

import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import SpatialAudioControls from '../SpatialAudioControls';
import type { AppState, AudioEngine, Pattern8D } from '../../types';

interface SettingsTabProps {
  appState: AppState;
  audioEngine: AudioEngine;
  patterns8D: Pattern8D[];
  onStateChange: (state: Partial<AppState>) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  appState,
  audioEngine,
  onStateChange
}) => {
  // Local state to track audio context and connection states
  const [audioContextState, setAudioContextState] = useState(
    audioEngine.audioState?.context?.state || 'closed'
  );
  const [backendConnected, setBackendConnected] = useState(
    audioEngine.backendConnected || false
  );
  const [websocketState, setWebsocketState] = useState({
    connected: audioEngine.websocketState?.connected || false,
    connecting: audioEngine.websocketState?.connecting || false,
    error: audioEngine.websocketState?.error || null
  });

  // Monitor audio context state changes
  useEffect(() => {
    const checkAudioContext = () => {
      const newState = audioEngine.audioState?.context?.state || 'closed';
      if (newState !== audioContextState) {
        setAudioContextState(newState);
      }
    };

    // Check immediately and set up interval
    checkAudioContext();
    const intervalId = setInterval(checkAudioContext, 10000);

    return () => clearInterval(intervalId);
  }, [audioEngine.audioState?.context, audioContextState]);

  // Monitor backend connection state
  useEffect(() => {
    const checkConnectionState = () => {
      setBackendConnected(audioEngine.backendConnected || false);
      setWebsocketState({
        connected: audioEngine.websocketState?.connected || false,
        connecting: audioEngine.websocketState?.connecting || false,
        error: audioEngine.websocketState?.error || null
      });
    };

    // Check immediately and set up interval
    checkConnectionState();
    const intervalId = setInterval(checkConnectionState, 1000);

    return () => clearInterval(intervalId);
  }, [audioEngine.backendConnected, audioEngine.websocketState?.connected || undefined]);
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
    if (audioEngine.updateSpatialSettings && audioEngine.backendConnected) {
      audioEngine.updateSpatialSettings(fullSpatialConfig);
    }
  };

  // Handler for WebSocket reconnection
  const handleWebSocketReconnect = () => {
    console.log('🔄 Manually reconnecting WebSocket...');
    if (audioEngine.connectBackend && audioEngine.disconnectBackend) {
      // Disconnect first, then reconnect
      audioEngine.disconnectBackend();
      setTimeout(() => {
        audioEngine.connectBackend();
      }, 1000);
    } else {
      console.warn('⚠️ No backend connection methods available');
    }
  };

  // Handler for AudioContext resume
  const handleAudioContextResume = async () => {
    console.log('▶️ Resuming AudioContext...');
    if (audioEngine.audioState?.context) {
      try {
        await audioEngine.audioState.context.resume();
        // Force a state update to trigger UI re-render
        onStateChange({ 
          audioContextState: audioEngine.audioState.context.state,
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
      if (audioEngine.resetAudioContext) {
        await audioEngine.resetAudioContext();
      } else if (audioEngine.initializeAudio) {
        await audioEngine.initializeAudio();
      }
      // Force state update after reset
      onStateChange({ 
        audioContextState: audioEngine.audioState?.context?.state || 'closed',
        lastUpdate: Date.now()
      });
    } catch (error) {
      console.error('Failed to reset AudioContext:', error);
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
          💡 8D Spatial Audio requires Backend Engine (Python DSP) • Basic binaural beats use Frontend Engine (Web Audio)
        </Typography>
        <SpatialAudioControls
          settings={{
            enabled: appState.spatialAudio?.enabled || false,
            movement_speed: appState.spatialAudio?.movement_speed || 0.08,
            spatial_intensity: appState.spatialAudio?.spatial_intensity || 0.85,
            reverb_enabled: appState.spatialAudio?.reverb_enabled || true,
            reverberance: appState.spatialAudio?.reverberance || 0.5,
            room_scale: appState.spatialAudio?.room_scale || 1.0,
            hf_damping: appState.spatialAudio?.hf_damping || 0.5
          }}
          onChange={handleSpatialSettingsChange}
          backendConnected={backendConnected}
        />
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
              ✅ Connected to backend (Session: {audioEngine.sessionId?.slice(-8)})
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
                audioEngine.disconnectBackend?.();
              } else {
                audioEngine.connectBackend?.();
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
            Sample Rate: {audioEngine.audioState?.context?.sampleRate || 44100} Hz
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
          <Typography component="div" sx={{ mb: 1 }}>
            Web Audio Support: {audioEngine.isSupported ? '✅ Supported' : '❌ Not supported'}
          </Typography>
          
          {/* AudioContext Control Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
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