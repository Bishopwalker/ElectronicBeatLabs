// Electromagnetic Beat Lab - Settings Tab Component

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
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
  const handleSpatialSettingsChange = (spatialSettings: {
    enabled: boolean;
    movement_speed: number;
    spatial_intensity: number;
    reverb_enabled: boolean;
    reverberance?: number;
    room_scale?: number;
    hf_damping?: number;
  }) => {
    // Update spatial audio settings in app state
    onStateChange({
      spatialAudio: {
        ...appState.spatialAudio,
        ...spatialSettings
      }
    });

    // Update backend settings if connected
    if (audioEngine.updateSpatialSettings) {
      const fullSpatialConfig = {
        ...appState.spatialAudio,
        ...spatialSettings
      };
      audioEngine.updateSpatialSettings(fullSpatialConfig);
    }
  };

  /*
  const handleSystemSettingChange = (key: string, value: any) => {
    onStateChange({
      systemSettings: {
        ...appState.systemSettings,
        [key]: value
      }
    });
  };
  */

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
        {audioEngine.backendConnected ? (
          <Typography sx={{ color: '#00ff88' }}>
            ✅ Connected to backend (Session: {audioEngine.sessionId?.slice(-8)})
          </Typography>
        ) : (
          <Typography sx={{ color: '#ff6b00' }}>
            ⚠️ Using local audio engine
          </Typography>
        )}
        
        {audioEngine.websocketState && (
          <Typography sx={{ mt: 0.5, fontSize: '0.9rem', color: '#e0e0e0' }}>
            WebSocket: {audioEngine.websocketState.connected ? 'Connected' : 
                      audioEngine.websocketState.connecting ? 'Connecting...' : 'Disconnected'}
            {audioEngine.websocketState.error && (
              <Typography component="div" sx={{ color: '#ff4444', mt: 0.25 }}>
                Error: {audioEngine.websocketState.error}
              </Typography>
            )}
          </Typography>
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
          <Typography component="div">Sample Rate: {audioEngine.audioState?.context?.sampleRate || 44100} Hz</Typography>
          <Typography component="div">Audio Context State: {audioEngine.audioState?.context?.state || 'Not initialized'}</Typography>
          <Typography component="div">Web Audio Support: {audioEngine.isSupported ? '✅ Supported' : '❌ Not supported'}</Typography>
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