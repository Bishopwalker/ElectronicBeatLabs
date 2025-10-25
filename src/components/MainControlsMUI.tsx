// Electromagnetic Beat Lab - Main Controls Component (Material UI)
// Primary playback and volume controls

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Slider,
  Stack,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import BoltIcon from '@mui/icons-material/Bolt';
import type { MainControlsProps } from '../types';


interface ExtendedMainControlsProps extends MainControlsProps {
  compact?: boolean;
}

const MainControlsMUI: React.FC<ExtendedMainControlsProps> = ({
  isPlaying,
  volume,
  onPlay,
  onStop,
  onVolumeChange,
  boostMode = false,
  onBoostModeToggle,
  compact = false
}) => {
  const maxVolume = boostMode ? 2.0 : 1.0;  // 200% in boost mode, 100% normal

  const handleVolumeChange = (_: Event, value: number | number[]) => {
    const numValue = value as number;
    const safeValue = isNaN(numValue) ? 0.5 : Math.max(0, Math.min(maxVolume, numValue));
    console.log('🎚️ MainControlsMUI volume change:', { raw: numValue, safe: safeValue, boostMode, maxVolume });
    onVolumeChange(safeValue);
  };

  // Compact horizontal layout for header
  if (compact) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1,
        background: 'rgba(138, 43, 226, 0.1)',
        borderRadius: 2,
        border: '1px solid rgba(138, 43, 226, 0.3)',
      }}>
        {/* Play/Stop buttons */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={onPlay}
            startIcon={<PlayArrowIcon />}
            size="small"
            sx={{ 
              minWidth: '80px',
              background: 'linear-gradient(45deg, #00ff88, #8a2be2)',
              '&:hover': {
                background: 'linear-gradient(45deg, #33ffaa, #9944d9)',
              }
            }}
          >
            Play
          </Button>
          
          <Button
            variant="contained"
            color="error"
            onClick={onStop}
            startIcon={<StopIcon />}
            size="small"
            sx={{ 
              minWidth: '80px',
              background: 'linear-gradient(45deg, #ff0066, #ff6b00)',
              '&:hover': {
                background: 'linear-gradient(45deg, #ff3388, #ff8533)',
              }
            }}
          >
            Stop
          </Button>
        </Stack>
        
        {/* Volume control */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
          <VolumeUpIcon color="secondary" fontSize="small" />
          <Slider
            value={isNaN(volume) ? 0.5 : volume}
            onChange={handleVolumeChange}
            min={0}
            max={maxVolume}
            step={0.01}
            size="small"
            sx={{
              minWidth: '120px',
              '& .MuiSlider-track': {
                background: boostMode
                  ? 'linear-gradient(90deg, #ff6b00, #ff0066)'  // Red gradient for boost
                  : 'linear-gradient(90deg, #8a2be2, #ff6b00)',  // Normal gradient
              },
              '& .MuiSlider-thumb': {
                background: boostMode
                  ? 'linear-gradient(45deg, #ff6b00, #ff0066)'
                  : 'linear-gradient(45deg, #8a2be2, #ff6b00)',
                border: '2px solid #fff',
                '&:hover': {
                  boxShadow: boostMode
                    ? '0 0 15px rgba(255, 107, 0, 0.7)'
                    : '0 0 15px rgba(138, 43, 226, 0.7)',
                },
              },
            }}
          />
          <Typography
            variant="caption"
            color={boostMode ? "error" : "secondary"}
            sx={{ fontFamily: 'monospace', minWidth: '35px' }}
          >
            {Math.round((volume / maxVolume) * 100)}%
          </Typography>
        </Box>
        
        {/* Status chip */}
        <Chip
          label={isPlaying ? 'Active' : 'Ready'}
          color={isPlaying ? "success" : "default"}
          size="small"
          sx={{ 
            fontSize: '0.7rem',
            background: isPlaying 
              ? 'rgba(0, 255, 136, 0.1)' 
              : 'rgba(255, 255, 255, 0.05)',
            borderColor: isPlaying 
              ? 'rgba(0, 255, 136, 0.3)' 
              : 'rgba(255, 255, 255, 0.1)',
          }}
        />
      </Box>
    );
  }

  // Full layout for expanded view
  return (
    <Card sx={{ 
      minHeight: 'fit-content',
height: '100%',
        maxHeight: '40vh',
      borderRadius: 4,
      background: 'rgba(138, 43, 226, 0.05)',
      borderColor: 'rgba(138, 43, 226, 0.3)',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'linear-gradient(45deg, #8a2be2, #ff6b00)',
        borderRadius: '4px',
      },
    }}>
      <CardContent height={'30vh'} sx={{ p: .5 }}>
        <Typography variant="h4" align="center" color="secondary" gutterBottom>
          Master Controls
        </Typography>
        
        <Stack spacing={2} alignItems="center">
          {/* Play and Stop Buttons - Separate buttons */}
          <Stack direction="row" spacing={1} sx={{ width: '100%', maxWidth: 250 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={onPlay}
              startIcon={<PlayArrowIcon />}
              fullWidth
              sx={{ 
                py: 1,
                background: 'linear-gradient(45deg, #00ff88, #8a2be2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #33ffaa, #9944d9)',
                }
              }}
            >
              Play
            </Button>
            
            <Button
              variant="contained"
              color="error"
              onClick={onStop}
              startIcon={<StopIcon />}
              fullWidth
              sx={{ 
                py: 1,
                background: 'linear-gradient(45deg, #ff0066, #ff6b00)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #ff3388, #ff8533)',
                }
              }}
            >
              Stop
            </Button>
          </Stack>
          
          <Box sx={{ width: '100%' }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1} justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <VolumeUpIcon color="secondary" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Master Volume
                </Typography>
              </Stack>
              {onBoostModeToggle && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={boostMode}
                      onChange={(e) => onBoostModeToggle(e.target.checked)}
                      size="small"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#ff6b00',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#ff0066',
                        },
                      }}
                    />
                  }
                  label={
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <BoltIcon fontSize="small" color={boostMode ? "error" : "disabled"} />
                      <Typography variant="caption" color={boostMode ? "error" : "text.secondary"}>
                        Boost
                      </Typography>
                    </Stack>
                  }
                  sx={{ margin: 0 }}
                />
              )}
            </Stack>
            <Slider
              value={isNaN(volume) ? 0.5 : volume}
              onChange={handleVolumeChange}
              min={0}
              max={maxVolume}
              step={0.01}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${Math.round((value / maxVolume) * 100)}%`}
              sx={{
                '& .MuiSlider-track': {
                  background: boostMode
                    ? 'linear-gradient(90deg, #ff6b00, #ff0066)'
                    : 'linear-gradient(90deg, #8a2be2, #ff6b00)',
                },
                '& .MuiSlider-thumb': {
                  background: boostMode
                    ? 'linear-gradient(45deg, #ff6b00, #ff0066)'
                    : 'linear-gradient(45deg, #8a2be2, #ff6b00)',
                  border: '2px solid #fff',
                  '&:hover': {
                    boxShadow: boostMode
                      ? '0 0 15px rgba(255, 107, 0, 0.7)'
                      : '0 0 15px rgba(138, 43, 226, 0.7)',
                  },
                },
              }}
            />
            <Typography
              variant="h6"
              align="center"
              color={boostMode ? "error" : "secondary"}
              sx={{ fontFamily: 'monospace', mt: 0.5 }}
            >
              {Math.round((volume / maxVolume) * 100)}%
              {boostMode && volume > 1.0 && (
                <Typography component="span" variant="caption" color="error" sx={{ ml: 1 }}>
                  BOOST
                </Typography>
              )}
            </Typography>
          </Box>
          
          <Chip
            label={isPlaying 
              ? 'Electromagnetic field active' 
              : 'Ready to generate'
            }
            color={isPlaying ? "success" : "default"}
            size="small"
            sx={{ 
              fontSize: '0.75rem',
              background: isPlaying 
                ? 'rgba(0, 255, 136, 0.1)' 
                : 'rgba(255, 255, 255, 0.05)',
              borderColor: isPlaying 
                ? 'rgba(0, 255, 136, 0.3)' 
                : 'rgba(255, 255, 255, 0.1)',
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MainControlsMUI;