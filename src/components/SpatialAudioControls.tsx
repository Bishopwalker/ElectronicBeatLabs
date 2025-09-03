// Spatial Audio Controls Component
// 8D audio effects and spatial positioning controls

import React from 'react';
import { 
  Box, 
  Typography, 
  Slider, 
  Switch, 
  FormControlLabel, 
  Button, 
  Paper 
} from '@mui/material';

interface SpatialAudioControlsProps {
  settings: {
    enabled: boolean;
    movement_speed: number;
    spatial_intensity: number;
    reverb_enabled: boolean;
    reverberance?: number;
    room_scale?: number;
    hf_damping?: number;
  };
  onChange: (settings: {
    enabled: boolean;
    movement_speed: number;
    spatial_intensity: number;
    reverb_enabled: boolean;
    reverberance?: number;
    room_scale?: number;
    hf_damping?: number;
  }) => void;
}


const SpatialAudioControls: React.FC<SpatialAudioControlsProps> = ({
  settings,
  onChange
}) => {
  const handleToggle = (key: string) => {
    onChange({
      ...settings,
      [key]: !settings[key as keyof typeof settings]
    });
  };

  const handleSliderChange = (key: string, value: number) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  const applyPreset = (preset: string) => {
    const presets = {
      off: {
        enabled: false,
        movement_speed: 0,
        spatial_intensity: 0,
        reverb_enabled: false
      },
      subtle: {
        enabled: true,
        movement_speed: 0.04,
        spatial_intensity: 0.3,
        reverb_enabled: true,
        reverberance: 0.3,
        room_scale: 0.6
      },
      standard: {
        enabled: true,
        movement_speed: 0.08,
        spatial_intensity: 0.85,
        reverb_enabled: true,
        reverberance: 0.5,
        room_scale: 1.0
      },
      intense: {
        enabled: true,
        movement_speed: 0.15,
        spatial_intensity: 1.0,
        reverb_enabled: true,
        reverberance: 0.7,
        room_scale: 1.5
      }
    };

    onChange({
      ...settings,
      ...presets[preset as keyof typeof presets]
    });
  };

  return (
    <Paper
      sx={{
        p: 0.5,
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 2,
        border: '1px solid rgba(255, 107, 0, 0.2)',
        maxHeight: 250,
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      <Typography
        variant="h6"
        component="h3"
        sx={{
          color: '#ff6b00',
          mb: 0.5,
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}
      >
        🎧 Spatial Audio (8D Effects)
      </Typography>

      <Box sx={{ mb: 0.5 }}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.enabled}
              onChange={() => handleToggle('enabled')}
              sx={{
                '& .MuiSwitch-track': {
                  background: settings.enabled 
                    ? 'linear-gradient(45deg, #ff6b00, #8a2be2)' 
                    : '#333',
                  opacity: 1
                },
                '& .MuiSwitch-thumb': {
                  backgroundColor: '#fff'
                }
              }}
            />
          }
          label={
            <Typography sx={{ color: '#e0e0e0', fontSize: '0.8rem', fontWeight: 500 }}>
              Enable 8D Audio
            </Typography>
          }
        />
      </Box>

      {settings.enabled && (
        <>
          <Box sx={{ mb: 0.5 }}>
            <Typography sx={{ color: '#e0e0e0', fontSize: '0.8rem', mb: 0.25, fontWeight: 500 }}>
              Movement Speed: <Box component="span" sx={{ color: '#00ff88', fontWeight: 600, fontFamily: 'Courier New, monospace', fontSize: '0.9rem' }}>{settings.movement_speed.toFixed(2)} Hz</Box>
            </Typography>
            <Slider
              min={0.01}
              max={0.5}
              step={0.01}
              value={settings.movement_speed}
              onChange={(_, value) => handleSliderChange('movement_speed', value as number)}
              sx={{
                color: '#ff6b00',
                '& .MuiSlider-thumb': {
                  background: 'linear-gradient(45deg, #ff6b00, #00ff88)',
                  border: '2px solid #fff',
                  boxShadow: '0 0 10px rgba(255, 107, 0, 0.5)',
                  '&:hover': {
                    boxShadow: '0 0 15px rgba(255, 107, 0, 0.7)'
                  }
                },
                '& .MuiSlider-track': {
                  background: 'linear-gradient(90deg, rgba(255, 107, 0, 0.3), rgba(0, 255, 136, 0.3))'
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 0.5 }}>
            <Typography sx={{ color: '#e0e0e0', fontSize: '0.8rem', mb: 0.25, fontWeight: 500 }}>
              Spatial Intensity: <Box component="span" sx={{ color: '#00ff88', fontWeight: 600, fontFamily: 'Courier New, monospace', fontSize: '0.9rem' }}>{(settings.spatial_intensity * 100).toFixed(0)}%</Box>
            </Typography>
            <Slider
              min={0.1}
              max={1.0}
              step={0.05}
              value={settings.spatial_intensity}
              onChange={(_, value) => handleSliderChange('spatial_intensity', value as number)}
              sx={{
                color: '#ff6b00',
                '& .MuiSlider-thumb': {
                  background: 'linear-gradient(45deg, #ff6b00, #00ff88)',
                  border: '2px solid #fff',
                  boxShadow: '0 0 10px rgba(255, 107, 0, 0.5)'
                },
                '& .MuiSlider-track': {
                  background: 'linear-gradient(90deg, rgba(255, 107, 0, 0.3), rgba(0, 255, 136, 0.3))'
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 0.5 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.reverb_enabled}
                  onChange={() => handleToggle('reverb_enabled')}
                  sx={{
                    '& .MuiSwitch-track': {
                      background: settings.reverb_enabled 
                        ? 'linear-gradient(45deg, #ff6b00, #8a2be2)' 
                        : '#333',
                      opacity: 1
                    },
                    '& .MuiSwitch-thumb': {
                      backgroundColor: '#fff'
                    }
                  }}
                />
              }
              label={
                <Typography sx={{ color: '#e0e0e0', fontSize: '0.8rem', fontWeight: 500 }}>
                  Reverb Effect
                </Typography>
              }
            />
          </Box>

          {settings.reverb_enabled && (
            <>
              <Box sx={{ mb: 0.5 }}>
                <Typography sx={{ color: '#e0e0e0', fontSize: '0.8rem', mb: 0.25, fontWeight: 500 }}>
                  Reverberance: <Box component="span" sx={{ color: '#00ff88', fontWeight: 600, fontFamily: 'Courier New, monospace', fontSize: '0.9rem' }}>{((settings.reverberance || 0.5) * 100).toFixed(0)}%</Box>
                </Typography>
                <Slider
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={settings.reverberance || 0.5}
                  onChange={(_, value) => handleSliderChange('reverberance', value as number)}
                  sx={{
                    color: '#ff6b00',
                    '& .MuiSlider-thumb': {
                      background: 'linear-gradient(45deg, #ff6b00, #00ff88)',
                      border: '2px solid #fff'
                    },
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(90deg, rgba(255, 107, 0, 0.3), rgba(0, 255, 136, 0.3))'
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 0.5 }}>
                <Typography sx={{ color: '#e0e0e0', fontSize: '0.8rem', mb: 0.25, fontWeight: 500 }}>
                  Room Scale: <Box component="span" sx={{ color: '#00ff88', fontWeight: 600, fontFamily: 'Courier New, monospace', fontSize: '0.9rem' }}>{((settings.room_scale || 1.0) * 100).toFixed(0)}%</Box>
                </Typography>
                <Slider
                  min={0.3}
                  max={2.0}
                  step={0.1}
                  value={settings.room_scale || 1.0}
                  onChange={(_, value) => handleSliderChange('room_scale', value as number)}
                  sx={{
                    color: '#ff6b00',
                    '& .MuiSlider-thumb': {
                      background: 'linear-gradient(45deg, #ff6b00, #00ff88)',
                      border: '2px solid #fff'
                    },
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(90deg, rgba(255, 107, 0, 0.3), rgba(0, 255, 136, 0.3))'
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 0.5 }}>
                <Typography sx={{ color: '#e0e0e0', fontSize: '0.8rem', mb: 0.25, fontWeight: 500 }}>
                  HF Damping: <Box component="span" sx={{ color: '#00ff88', fontWeight: 600, fontFamily: 'Courier New, monospace', fontSize: '0.9rem' }}>{((settings.hf_damping || 0.5) * 100).toFixed(0)}%</Box>
                </Typography>
                <Slider
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={settings.hf_damping || 0.5}
                  onChange={(_, value) => handleSliderChange('hf_damping', value as number)}
                  sx={{
                    color: '#ff6b00',
                    '& .MuiSlider-thumb': {
                      background: 'linear-gradient(45deg, #ff6b00, #00ff88)',
                      border: '2px solid #fff'
                    },
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(90deg, rgba(255, 107, 0, 0.3), rgba(0, 255, 136, 0.3))'
                    }
                  }}
                />
              </Box>
            </>
          )}

          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
            <Button
              onClick={() => applyPreset('off')}
              size="small"
              sx={{
                fontSize: '0.8rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 107, 0, 0.3)',
                color: '#e0e0e0',
                '&:hover': {
                  background: 'rgba(255, 107, 0, 0.1)',
                  borderColor: 'rgba(255, 107, 0, 0.6)',
                  color: '#ff6b00'
                }
              }}
            >
              Off
            </Button>
            <Button
              onClick={() => applyPreset('subtle')}
              size="small"
              sx={{
                fontSize: '0.8rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 107, 0, 0.3)',
                color: '#e0e0e0',
                '&:hover': {
                  background: 'rgba(255, 107, 0, 0.1)',
                  borderColor: 'rgba(255, 107, 0, 0.6)',
                  color: '#ff6b00'
                }
              }}
            >
              Subtle
            </Button>
            <Button
              onClick={() => applyPreset('standard')}
              size="small"
              sx={{
                fontSize: '0.8rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 107, 0, 0.3)',
                color: '#e0e0e0',
                '&:hover': {
                  background: 'rgba(255, 107, 0, 0.1)',
                  borderColor: 'rgba(255, 107, 0, 0.6)',
                  color: '#ff6b00'
                }
              }}
            >
              Standard 8D
            </Button>
            <Button
              onClick={() => applyPreset('intense')}
              size="small"
              sx={{
                fontSize: '0.8rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 107, 0, 0.3)',
                color: '#e0e0e0',
                '&:hover': {
                  background: 'rgba(255, 107, 0, 0.1)',
                  borderColor: 'rgba(255, 107, 0, 0.6)',
                  color: '#ff6b00'
                }
              }}
            >
              Intense
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default SpatialAudioControls;