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
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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
  const activeCount = Object.values(activeStatus).filter(Boolean).length;
  const [spatialHintOpen, setSpatialHintOpen] = React.useState(false);

  const getStatusChip = (
    isActive: boolean,
    label: string,
    icon: React.ReactNode,
    engineType?: 'binaural' | 'backend' | 'spatial',
    clickable: boolean = false
  ) => {
    const chip = (
      <Chip
        icon={icon as React.ReactElement}
        label={label}
        color={isActive ? "success" : "default"}
        variant={isActive ? "filled" : "outlined"}
        size="small"
        onClick={clickable && onToggleEngine ? () => {
          // Intercept: Spatial requires Backend or Hybrid
          if (engineType === 'spatial' && !isActive) {
            const frontendOnly = !audioEngine?.backendConnected;
            if (frontendOnly) {
              setSpatialHintOpen(true);
              setTimeout(() => setSpatialHintOpen(false), 1800);
              return;
            }
          }
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

    if (engineType === 'spatial') {
      return (
        <Tooltip
          open={spatialHintOpen}
          placement="top"
          title={
            <Typography variant="caption">Spatial requires Backend or Hybrid mode.</Typography>
          }
        >
          {chip}
        </Tooltip>
      );
    }
    return chip;
  };

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

        {/* Engine Mode Toggle */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 0.5, color: '#ffd700', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            Engine Mode
            <Tooltip
              placement="right"
              title={
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="caption" display="block"><b>Frontend</b>: instant, lowest latency; great for focus sprints.</Typography>
                  <Typography variant="caption" display="block"><b>Hybrid</b>: instant start + spatial depth; balanced for deep work.</Typography>
                  <Typography variant="caption" display="block"><b>Backend</b>: richest spatial/DSP; immersive meditation sessions.</Typography>
                </Box>
              }
            >
              <InfoOutlinedIcon fontSize="inherit" sx={{ opacity: 0.8, cursor: 'help' }} />
            </Tooltip>
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'rgba(255,255,255,0.6)' }}>
            Default selection is Hybrid. Mode selection does not auto-start engines.
          </Typography>
          {(() => {
            const saved = (typeof window !== 'undefined' && window.localStorage) ? localStorage.getItem('ebl_engine_mode') as 'frontend'|'hybrid'|'backend'|null : null;
            const modeValue = (
              audioEngine?.backendConnected && activeStatus.binauralEngine
                ? 'hybrid'
                : audioEngine?.backendConnected
                  ? 'backend'
                  : activeStatus.binauralEngine
                    ? 'frontend'
                    : (saved || 'hybrid')
            );
            return (
              <ToggleButtonGroup
                size="small"
                exclusive
                color="primary"
                value={modeValue}
                onChange={(_, value) => {
                  if (!value || !onToggleEngine) return;
                  try { localStorage.setItem('ebl_engine_mode', value); } catch {}
                  if (value === 'frontend') {
                    onToggleEngine('backend', false);
                    onToggleEngine('spatial', false);
                    onToggleEngine('binaural', true);
                  } else if (value === 'backend') {
                    onToggleEngine('binaural', false);
                    onToggleEngine('backend', true);
                    onToggleEngine('spatial', true);
                  } else if (value === 'hybrid') {
                    onToggleEngine('binaural', true);
                    onToggleEngine('backend', true);
                    onToggleEngine('spatial', true);
                  }
                }}
                sx={{
                  '& .MuiToggleButton-root': {
                    color: 'rgba(255,255,255,0.85)',
                    px: 1,
                    py: 0.25,
                    minWidth: 'auto',
                    fontSize: '0.75rem',
                    lineHeight: 1.2
                  }
                }}
              >
                <ToggleButton value="frontend">Frontend</ToggleButton>
                <ToggleButton value="hybrid">Hybrid</ToggleButton>
                <ToggleButton value="backend">Backend</ToggleButton>
              </ToggleButtonGroup>
            );
          })()}
        </Box>

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