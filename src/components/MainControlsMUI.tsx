// Electromagnetic Beat Lab - Main Controls Component (Material UI)
// Primary playback and volume controls

import React, {useCallback, useState, useEffect} from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    FormControlLabel,
    Stack,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import BoltIcon from '@mui/icons-material/Bolt';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import type {MainControlsProps} from '../types';

interface ExtendedMainControlsProps extends MainControlsProps {
  compact?: boolean;
  onReset?: ()=>void;
}

const MainControlsMUI: React.FC<ExtendedMainControlsProps> = ({
  isPlaying,
  volume,
  onPlay,
  onStop,
  onVolumeChange,
  boostMode = false,
  onBoostModeToggle,
  onReset,
  compact = false
}) => {
  const maxVolume = boostMode ? 2.0 : 1.0;  // 200% in boost mode, 100% normal

  // Local state for volume input to allow typing
  const [volumeInput, setVolumeInput] = useState(Math.round((volume / maxVolume) * 100).toString());

  // Sync local state when volume prop changes (from external sources)
  useEffect(() => {
    setVolumeInput(Math.round((volume / maxVolume) * 100).toString());
  }, [volume, maxVolume]);

        const handleVolumeInputChange = useCallback((
            event: React.ChangeEvent<HTMLInputElement>
        ) => {
            setVolumeInput(event.target.value);
        }, []);

        const handleVolumeCommit = useCallback(() => {
            const value = parseFloat(volumeInput);
            if (!isNaN(value)) {
                const clampedValue = Math.max(0, Math.min(value / 100 * maxVolume, maxVolume));
                onVolumeChange(clampedValue);
                setVolumeInput(Math.round((clampedValue / maxVolume) * 100).toString());
            } else {
                // Reset to current volume if invalid
                setVolumeInput(Math.round((volume / maxVolume) * 100).toString());
            }
        }, [volumeInput, maxVolume, onVolumeChange, volume]);

  const handleBoostToggle = (checked: boolean) => {
    if (onBoostModeToggle) {
      onBoostModeToggle(checked);
    onVolumeChange(maxVolume);
      // If turning OFF boost mode and volume > 1.0, clamp it to 1.0
      if (!checked && volume > 1.0) {
        onVolumeChange(1.0);
      }
    }
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
        {/* Play/Stop/Reset buttons */}
        <Stack direction="row" spacing={1}>
          <Button
            id="play-button"
            variant="contained"
            color="primary"
            onClick={onPlay}
            startIcon={<PlayArrowIcon />}
            size="small"
            sx={{
              minWidth: '70px',
              background: 'linear-gradient(45deg, #00ff88, #8a2be2)',
              '&:hover': {
                background: 'linear-gradient(45deg, #33ffaa, #9944d9)',
              }
            }}
          >
            Play
          </Button>

          <Button
            id="stop-button"
            variant="contained"
            color="error"
            onClick={onStop}
            startIcon={<StopIcon />}
            size="small"
            sx={{
              minWidth: '70px',
              background: 'linear-gradient(45deg, #ff0066, #ff6b00)',
              '&:hover': {
                background: 'linear-gradient(45deg, #ff3388, #ff8533)',
              }
            }}
          >
            Stop
          </Button>

          {onReset && (
            <Button
              variant="outlined"
              color="warning"
              onClick={onReset}
              startIcon={<RestartAltIcon />}
              size="small"
              sx={{
                minWidth: '70px',
                borderColor: 'rgba(255, 193, 7, 0.5)',
                color: '#ffc107',
                '&:hover': {
                  borderColor: '#ffc107',
                  background: 'rgba(255, 193, 7, 0.1)',
                }
              }}
            >
              Reset
            </Button>
          )}
        </Stack>
        
        {/* Volume control */}
        <Box id="volume-control" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VolumeUpIcon color="secondary" fontSize="small" />
          <TextField
            type="number"
            value={volumeInput}
            onChange={handleVolumeInputChange}
            onBlur={handleVolumeCommit}
            onKeyDown={(e) => e.key === 'Enter' && handleVolumeCommit()}
            size="small"
            inputProps={{
              min: 0,
              max: 100,
              step: 1,
            }}
            sx={{
              width: '80px',
              '& .MuiInputBase-input': {
                color: boostMode ? '#ff6b00' : '#8a2be2',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                textAlign: 'center',
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: boostMode ? 'rgba(255, 107, 0, 0.5)' : 'rgba(138, 43, 226, 0.5)',
                },
                '&:hover fieldset': {
                  borderColor: boostMode ? '#ff6b00' : '#8a2be2',
                },
                '&.Mui-focused fieldset': {
                  borderColor: boostMode ? '#ff6b00' : '#8a2be2',
                },
              },
            }}
          />
          <Typography
            variant="caption"
            color={boostMode ? "error" : "secondary"}
            sx={{ fontFamily: 'monospace' }}
          >
            %
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
    <Card id="masterControls" sx={{
      minHeight: 'fit-content',
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
      <CardContent sx={{ p: .5 }}>
        <Typography variant="h4" align="center" color="secondary" gutterBottom>
          Master Controls
        </Typography>
        
        <Stack spacing={2} alignItems="center">
          {/* Play, Stop, and Reset Buttons */}
          <Stack direction="row" spacing={1} sx={{ width: '100%', maxWidth: 300 }}>
            <Button
              id="play-button"
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
              id="stop-button-full"
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

            {onReset && (
              <Button
                variant="outlined"
                color="warning"
                onClick={onReset}
                startIcon={<RestartAltIcon />}
                sx={{
                  py: 1,
                  minWidth: '100px',
                  borderColor: 'rgba(255, 193, 7, 0.5)',
                  color: '#ffc107',
                  '&:hover': {
                    borderColor: '#ffc107',
                    background: 'rgba(255, 193, 7, 0.1)',
                  }
                }}
              >
                Reset
              </Button>
            )}
          </Stack>
          
          <Box id="volume-control" sx={{ width: '100%' }}>
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
                      onChange={(e) => handleBoostToggle(e.target.checked)}
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 1 }}>
              <TextField
                type="number"
                value={volumeInput}
                onChange={handleVolumeInputChange}
                onBlur={handleVolumeCommit}
                onKeyDown={(e) => e.key === 'Enter' && handleVolumeCommit()}
                size="medium"
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 1,
                }}
                sx={{
                  width: '120px',
                  '& .MuiInputBase-input': {
                    color: boostMode ? '#ff6b00' : '#8a2be2',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    textAlign: 'center',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: boostMode ? 'rgba(255, 107, 0, 0.5)' : 'rgba(138, 43, 226, 0.5)',
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: boostMode ? '#ff6b00' : '#8a2be2',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: boostMode ? '#ff6b00' : '#8a2be2',
                    },
                  },
                }}
              />
              <Typography
                variant="h6"
                color={boostMode ? "error" : "secondary"}
                sx={{ fontFamily: 'monospace' }}
              >
                %
                {boostMode && volume > 1.0 && (
                  <Typography component="span" variant="caption" color="error" sx={{ ml: 1 }}>
                    BOOST
                  </Typography>
                )}
              </Typography>
            </Box>
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