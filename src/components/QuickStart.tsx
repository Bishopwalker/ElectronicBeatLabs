// Quick Start Control - Backend Connection and System Status
// Shows active audio systems and provides backend connection control

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SpatialAudioIcon from '@mui/icons-material/SpatialAudio';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import RadioIcon from '@mui/icons-material/Radio';
import type {QuickStartProps} from "../types";
import TimerControls from './TimerControls';

const QuickStart: React.FC<QuickStartProps> = ({
  activeStatus,
  frequencies,
  volume,
  audioEngine,
  onToggleEngine,
  appState
}) => {
  const isAnyActive = Object.values(activeStatus).some(Boolean);
  const activeCount = Object.values(activeStatus).filter(Boolean);

  const getStatusChip = (
    isActive: boolean,
    label: string,
    icon: React.ReactNode,
    engineType?: 'binaural' | 'backend' | 'spatial',
    clickable: boolean = false
  ) => (
    <Chip
      icon={icon as React.ReactElement}
      label={label}
      color={isActive ? "success" : "default"}
      variant={isActive ? "filled" : "outlined"}
      size="small"
      onClick={clickable && onToggleEngine ? () => {
        console.log(`🔄 Toggling ${engineType} engine:`, !isActive);
        onToggleEngine(engineType!, !isActive);
      } : undefined}
      sx={{
        minWidth: 100,
        '& .MuiChip-icon': {
          color: isActive ? 'inherit' : 'rgba(255,255,255,0.5)'
        },
        ...(clickable && {
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: isActive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            transform: 'scale(1.02)',
          },
          transition: 'all 0.2s ease-in-out'
        })
      }}
    />
  );

  return (
    <Card  sx={{
      width: '15vw',
      background: 'rgba(138, 43, 226, 0.08)',
      borderColor: isAnyActive ? 'rgba(255, 102, 0, 0.5)' : 'rgba(138, 43, 226, 0.3)',
      border: isAnyActive ? '2px solid' : '1px solid',
      boxShadow: isAnyActive ? '0 0 20px rgba(255, 102, 0, 0.3)' : 'none',
    }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: '#ffd700', fontWeight: 'bold' }}>
          🚀 System Status
        </Typography>

        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Status Overview */}
        {isAnyActive && (
          <Alert
            severity="info"
            sx={{
              mb: 2,
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              '& .MuiAlert-icon': {
                color: '#00ff88'
              }
            }}
          >
            <Typography variant="body2">
              <strong>{activeCount} audio system{activeCount > 1 ? 's' : ''} currently active</strong>
              {frequencies && (
                <>
                  <br />
                  Frequencies: {frequencies.left}Hz ← → {frequencies.right}Hz (Beat: {frequencies.beat}Hz)
                </>
              )}
              <br />
              Volume: {Math.round((isNaN(volume) ? 0.3 : volume) * 100)}%
            </Typography>
          </Alert>
        )}

        {/* Frontend Audio Control */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, color: '#ffd700' }}>
            🎵 Frontend Audio
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button
              variant={activeStatus.binauralEngine ? "outlined" : "contained"}
              color={activeStatus.binauralEngine ? "error" : "primary"}
              size="small"
              onClick={() => onToggleEngine?.('binaural', !activeStatus.binauralEngine)}
              sx={{
                minWidth: 140,
                fontSize: '0.85rem',
                fontWeight: 'bold',
                mb: 0.5
              }}
            >
              {activeStatus.binauralEngine ? '🎵 Stop Frontend' : '🎵 Start Frontend'}
            </Button>
          </Box>
        </Box>

        {/* Backend Connection Control */}
        {audioEngine && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, color: '#ffd700' }}>
              🔌 Backend Connection
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Button
                variant={audioEngine.backendConnected ? "outlined" : "contained"}
                color={audioEngine.backendConnected ? "error" : "success"}
                size="small"
                onClick={() => {
                  if (audioEngine.backendConnected) {
                    audioEngine.disconnectBackend?.();
                  } else {
                    audioEngine.connectBackend?.();
                  }
                }}
                sx={{
                  minWidth: 140,
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  mb: 0.5
                }}
              >
                {audioEngine.backendConnected ? '🔌 Disconnect Backend' : '🔌 Connect Backend'}
              </Button>

              {/* Active Engine Indicator */}
              <Typography
                variant="caption"
                sx={{
                  color: audioEngine.backendConnected && audioEngine.sessionId ? '#00ff88' : '#ff6b00',
                  fontWeight: 'bold',
                  fontSize: '0.7rem'
                }}
              >
                {audioEngine.backendConnected && audioEngine.sessionId
                  ? '🎧 8D Spatial Engine Active'
                  : '🎵 Web Audio Engine Active'
                }
              </Typography>
            </Box>
          </Box>
        )}

        {/* Audio Systems Status */}
        <Typography variant="subtitle1" sx={{ mb: 1, color: '#ffd700' }}>
          Audio Systems Status
        </Typography>

        <Stack spacing={1}>
          {getStatusChip(
            activeStatus.binauralEngine,
            "Frontend Audio",
            <RadioIcon />,
            'binaural',
            true
          )}

          {getStatusChip(
            audioEngine?.backendConnected || false,
            "Backend Engine",
            <SpatialAudioIcon />,
            'backend',
            true
          )}

          {getStatusChip(
            appState?.spatialAudio?.enabled || false,
            "Spatial Audio",
            <GraphicEqIcon />,
            'spatial',
            true
          )}

          {getStatusChip(
            activeStatus.patterns,
            "Pattern System",
            <VolumeUpIcon />
          )}

          {getStatusChip(
            activeStatus.testTones,
            "Test Tones",
            <PlayArrowIcon />
          )}
        </Stack>

        {!isAnyActive && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ✅ All audio systems are stopped
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickStart;