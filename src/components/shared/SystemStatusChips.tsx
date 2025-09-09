// System Status Chips - Displays all system status indicators
// Extracted from main component to reduce clutter

import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import type { AppState } from '../../types';
import { ElectromagneticLabStyles } from '../styles/ElectromagneticLabStyles';

interface SystemStatusChipsProps {
  appState: AppState;
  audioEngine: any;
  backendEngine: any;
}

const SystemStatusChips: React.FC<SystemStatusChipsProps> = ({
  appState,
  audioEngine,
  backendEngine
}) => {
  return (
    <Box sx={ElectromagneticLabStyles.systemStatusChips}>
      <Typography variant="caption" color="text.secondary">
        Systems:
      </Typography>
      
      {/* Audio Engines */}
      <Chip
        label={audioEngine.audioState.isPlaying ? "🎵 Frontend ACTIVE" : "🎵 Frontend Ready"}
        size="small"
        color={audioEngine.audioState.isPlaying ? "success" : "default"}
        variant={audioEngine.audioState.isPlaying ? "filled" : "outlined"}
        sx={{
          ...ElectromagneticLabStyles.statusChip(audioEngine.audioState.isPlaying),
          ...(audioEngine.audioState.isPlaying && {
            fontWeight: 'bold',
            boxShadow: '0 0 8px rgba(0, 255, 0, 0.4)'
          })
        }}
      />
      
      <Chip
        label={backendEngine.backendConnected ? "🔗 Backend CONNECTED" : "⚠️ Backend DISCONNECTED"}
        size="small"
        color={backendEngine.backendConnected ? "success" : "error"}
        variant="filled"
        sx={{
          ...ElectromagneticLabStyles.statusChip(backendEngine.backendConnected),
          ...(backendEngine.backendConnected ? {
            background: 'linear-gradient(45deg, #00ff00, #00dd00) !important',
            fontWeight: 'bold',
            boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
            animation: 'pulse 2s infinite'
          } : {
            background: 'linear-gradient(45deg, #ff0000, #dd0000) !important',
            fontWeight: 'bold',
            boxShadow: '0 0 10px rgba(255, 0, 0, 0.5)'
          })
        }}
      />
      
      {/* Patterns */}
      <Chip
        label={`🌀 Patterns ${appState.currentPattern ? `(${appState.currentPattern.name})` : ''}`}
        size="small"
        color={appState.currentPattern ? "success" : "default"}
        variant={appState.currentPattern ? "filled" : "outlined"}
        sx={ElectromagneticLabStyles.statusChip(!!appState.currentPattern)}
      />
      
      {/* Spatial Audio */}
      <Chip
        label="🎧 8D Spatial"
        size="small"
        color={(appState.spatialAudio?.enabled && backendEngine.backendConnected) ? "success" : "default"}
        variant={(appState.spatialAudio?.enabled && backendEngine.backendConnected) ? "filled" : "outlined"}
        sx={ElectromagneticLabStyles.statusChip(appState.spatialAudio?.enabled && backendEngine.backendConnected)}
      />
      
      {/* Timer */}
      <Chip
        label="⏰ Timer"
        size="small"
        color={appState.activeTab === 'timer' ? "success" : "default"}
        variant={appState.activeTab === 'timer' ? "filled" : "outlined"}
        sx={ElectromagneticLabStyles.statusChip(appState.activeTab === 'timer')}
      />
      
      {/* ADHD Protocol */}
      <Chip
        label={`⚡ ADHD ${appState.adhd ? `(${appState.adhd.mode})` : ''}`}
        size="small"
        color={appState.adhd ? "success" : "default"}
        variant={appState.adhd ? "filled" : "outlined"}
        sx={ElectromagneticLabStyles.statusChip(!!appState.adhd)}
      />
      
      {/* YouTube Sync */}
      <Chip
        label="📺 YouTube"
        size="small"
        color={(appState.youtube?.enabled && appState.youtube.videoId) ? "success" : "default"}
        variant={(appState.youtube?.enabled && appState.youtube.videoId) ? "filled" : "outlined"}
        sx={ElectromagneticLabStyles.statusChip(appState.youtube?.enabled && !!appState.youtube.videoId)}
      />
      
      {/* Frequency Tab */}
      <Chip
        label="📊 Frequency"
        size="small"
        color={appState.activeTab === 'frequency' ? "success" : "default"}
        variant={appState.activeTab === 'frequency' ? "filled" : "outlined"}
        sx={ElectromagneticLabStyles.statusChip(appState.activeTab === 'frequency')}
      />
      
      {/* Visualizations */}
      <Chip
        label="🎨 Visualizations"
        size="small"
        color={appState.activeTab === 'visualizations' ? "success" : "default"}
        variant={appState.activeTab === 'visualizations' ? "filled" : "outlined"}
        sx={ElectromagneticLabStyles.statusChip(appState.activeTab === 'visualizations')}
      />
      
      {/* Settings */}
      <Chip
        label="⚙️ Settings"
        size="small"
        color={appState.activeTab === 'settings' ? "success" : "default"}
        variant={appState.activeTab === 'settings' ? "filled" : "outlined"}
        sx={ElectromagneticLabStyles.statusChip(appState.activeTab === 'settings')}
      />
    </Box>
  );
};

export default SystemStatusChips;