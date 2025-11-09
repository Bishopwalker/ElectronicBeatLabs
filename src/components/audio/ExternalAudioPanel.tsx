/**
 * ExternalAudioPanel.tsx
 * 
 * React component for controlling external audio capture and 8D spatial processing
 * in the EBL application.
 */

import React from 'react';
import {
  Paper,
  Typography,
  Button,
  Stack,
  Slider,
  FormControlLabel,
  Switch,
  Alert,
  Box,
  Chip,
  Divider,
  Tooltip,
  IconButton,
  Collapse
} from '@mui/material';
import {
  YouTube,
  Mic,
  Stop,
  VolumeUp,
  Speed,
  Waves,
  ThreeDRotation,
  ExpandMore,
  ExpandLess,
  GraphicEq,
  SurroundSound,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useExternalAudioMixer } from '../../hooks/useExternalAudioMixer';

interface ExternalAudioPanelProps {
  audioContext: AudioContext | null;
  analyserNode: AnalyserNode | null;
  masterGainNode: GainNode | null;
}

export const ExternalAudioPanel: React.FC<ExternalAudioPanelProps> = ({
  audioContext,
  analyserNode,
  masterGainNode
}) => {
  const [expanded, setExpanded] = React.useState(true);
  
  const {
    // State
    isCapturing,
    captureSource,
    is8DActive,
    spatialSpeed,
    spatialRadius,
    reverbMix,
    externalVolume,
    binauralVolume,
    error,
    
    // Actions
    startTabCapture,
    startMicrophoneCapture,
    stopCapture,
    toggle8D,
    
    // Controls
    setExternalVolume,
    setBinauralVolume,
    setSpatialSpeed,
    setReverbMix
  } = useExternalAudioMixer({
    audioContext,
    analyserNode,
    masterGainNode
  });
  
  const handleVolumeChange = (_: Event, value: number | number[]) => {
    setExternalVolume(value as number);
  };
  
  const handleBinauralVolumeChange = (_: Event, value: number | number[]) => {
    setBinauralVolume(value as number);
  };
  
  const handleSpeedChange = (_: Event, value: number | number[]) => {
    setSpatialSpeed(value as number);
  };
  
  const handleReverbChange = (_: Event, value: number | number[]) => {
    setReverbMix(value as number);
  };
  
  const getSourceIcon = () => {
    switch (captureSource) {
      case 'tab':
        return <YouTube />;
      case 'microphone':
        return <Mic />;
      default:
        return null;
    }
  };
  
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <SurroundSound />
          <Typography variant="h6" fontWeight="bold">
            External Audio Mixer
          </Typography>
          {isCapturing && (
            <Chip
              label={captureSource}
              icon={getSourceIcon()}
              size="small"
              color="success"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        <IconButton
          onClick={() => setExpanded(!expanded)}
          size="small"
          sx={{ color: 'white' }}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <Stack spacing={3}>
          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              icon={<ErrorIcon />}
              onClose={() => {}}
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}
          
          {/* Capture Buttons */}
          <Stack direction="row" spacing={2}>
            <Tooltip title="Capture audio from YouTube, Spotify, or any browser tab">
              <Button
                variant="contained"
                onClick={isCapturing ? stopCapture : startTabCapture}
                startIcon={isCapturing ? <Stop /> : <YouTube />}
                fullWidth
                sx={{
                  bgcolor: isCapturing ? '#f44336' : '#ff6b6b',
                  '&:hover': {
                    bgcolor: isCapturing ? '#d32f2f' : '#ff5252'
                  }
                }}
              >
                {isCapturing && captureSource === 'tab'
                  ? 'Stop Tab Capture'
                  : 'Capture Tab Audio'}
              </Button>
            </Tooltip>
            
            <Tooltip title="Capture audio from your microphone">
              <Button
                variant="contained"
                onClick={isCapturing ? stopCapture : startMicrophoneCapture}
                startIcon={isCapturing ? <Stop /> : <Mic />}
                fullWidth
                sx={{
                  bgcolor: isCapturing ? '#f44336' : '#4fc3f7',
                  '&:hover': {
                    bgcolor: isCapturing ? '#d32f2f' : '#29b6f6'
                  }
                }}
              >
                {isCapturing && captureSource === 'microphone'
                  ? 'Stop Mic Capture'
                  : 'Capture Microphone'}
              </Button>
            </Tooltip>
          </Stack>
          
          {/* Status Alert */}
          {isCapturing && (
            <Alert
              severity="success"
              icon={<GraphicEq />}
              sx={{
                bgcolor: 'rgba(76, 175, 80, 0.1)',
                color: 'white',
                '& .MuiAlert-icon': { color: 'white' }
              }}
            >
              Capturing {captureSource} audio - Play something in {
                captureSource === 'tab' ? 'another tab' : 'your microphone'
              }!
            </Alert>
          )}
          
          <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
          
          {/* 8D Spatial Control */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={is8DActive}
                  onChange={toggle8D}
                  disabled={!isCapturing}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#00ff88'
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      bgcolor: '#00ff88'
                    }
                  }}
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <ThreeDRotation />
                  <Typography>8D Spatial Processing</Typography>
                  {is8DActive && (
                    <Chip
                      label="ACTIVE"
                      size="small"
                      sx={{
                        bgcolor: '#00ff88',
                        color: 'black',
                        fontWeight: 'bold',
                        animation: 'pulse 2s infinite'
                      }}
                    />
                  )}
                </Box>
              }
            />
          </Box>
          
          {/* 8D Controls (shown when active) */}
          <Collapse in={is8DActive && isCapturing}>
            <Stack spacing={2} sx={{ pl: 2 }}>
              {/* Rotation Speed */}
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Speed fontSize="small" />
                  <Typography variant="body2">
                    Rotation Speed: {spatialSpeed.toFixed(1)}x
                  </Typography>
                </Box>
                <Slider
                  value={spatialSpeed}
                  onChange={handleSpeedChange}
                  min={0.1}
                  max={5}
                  step={0.1}
                  marks={[
                    { value: 0.5, label: '0.5x' },
                    { value: 1, label: '1x' },
                    { value: 2, label: '2x' },
                    { value: 3, label: '3x' },
                    { value: 5, label: '5x' }
                  ]}
                  sx={{
                    '& .MuiSlider-thumb': {
                      bgcolor: '#00ff88'
                    },
                    '& .MuiSlider-track': {
                      bgcolor: '#00ff88'
                    }
                  }}
                />
              </Box>
              
              {/* Reverb Mix */}
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Waves fontSize="small" />
                  <Typography variant="body2">
                    Reverb Mix: {Math.round(reverbMix * 100)}%
                  </Typography>
                </Box>
                <Slider
                  value={reverbMix}
                  onChange={handleReverbChange}
                  min={0}
                  max={1}
                  step={0.01}
                  marks={[
                    { value: 0, label: 'Dry' },
                    { value: 0.5, label: '50%' },
                    { value: 1, label: 'Wet' }
                  ]}
                  sx={{
                    '& .MuiSlider-thumb': {
                      bgcolor: '#00ff88'
                    },
                    '& .MuiSlider-track': {
                      bgcolor: '#00ff88'
                    }
                  }}
                />
              </Box>
            </Stack>
          </Collapse>
          
          <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
          
          {/* Volume Controls */}
          <Stack spacing={2}>
            {/* External Volume */}
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <VolumeUp fontSize="small" />
                <Typography variant="body2">
                  External Audio: {Math.round(externalVolume * 100)}%
                </Typography>
              </Box>
              <Slider
                value={externalVolume}
                onChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.01}
                disabled={!isCapturing}
                sx={{
                  '& .MuiSlider-thumb': {
                    bgcolor: '#ff6b6b'
                  },
                  '& .MuiSlider-track': {
                    bgcolor: '#ff6b6b'
                  }
                }}
              />
            </Box>
            
            {/* Binaural Volume */}
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <GraphicEq fontSize="small" />
                <Typography variant="body2">
                  Binaural Beats: {Math.round(binauralVolume * 100)}%
                </Typography>
              </Box>
              <Slider
                value={binauralVolume}
                onChange={handleBinauralVolumeChange}
                min={0}
                max={1}
                step={0.01}
                sx={{
                  '& .MuiSlider-thumb': {
                    bgcolor: '#764ba2'
                  },
                  '& .MuiSlider-track': {
                    bgcolor: '#764ba2'
                  }
                }}
              />
            </Box>
          </Stack>
        </Stack>
      </Collapse>
      
      {/* Add CSS animation for pulse effect */}
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>
    </Paper>
  );
};
