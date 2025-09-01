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
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import type { MainControlsProps } from '../types/index';

const MainControlsMUI: React.FC<MainControlsProps> = ({
  isPlaying,
  volume,
  onPlay,
  onStop,
  onVolumeChange
}) => {
  const handleVolumeChange = (_: Event, value: number | number[]) => {
    onVolumeChange(value as number);
  };

  return (
    <Card sx={{ 
      maxHeight: 250,
      overflow: 'auto',
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
      <CardContent sx={{ p: 1.5 }}>
        <Typography variant="h4" align="center" color="secondary" gutterBottom>
          Master Controls
        </Typography>
        
        <Stack spacing={2} alignItems="center">
          <Button
            variant="contained"
            color={isPlaying ? "error" : "primary"}
            onClick={isPlaying ? onStop : onPlay}
            startIcon={isPlaying ? <StopIcon /> : <PlayArrowIcon />}
            fullWidth
            sx={{ 
              maxWidth: 200,
              py: 1,
              background: isPlaying 
                ? 'linear-gradient(45deg, #ff0066, #ff6b00)'
                : 'linear-gradient(45deg, #ff6b00, #8a2be2)',
              '&:hover': {
                background: isPlaying
                  ? 'linear-gradient(45deg, #ff3388, #ff8533)'
                  : 'linear-gradient(45deg, #ff8533, #9944d9)',
              }
            }}
          >
            {isPlaying ? 'Stop' : 'Play'}
          </Button>
          
          <Box sx={{ width: '100%' }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <VolumeUpIcon color="secondary" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Master Volume
              </Typography>
            </Stack>
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
              sx={{
                '& .MuiSlider-track': {
                  background: 'linear-gradient(90deg, #8a2be2, #ff6b00)',
                },
                '& .MuiSlider-thumb': {
                  background: 'linear-gradient(45deg, #8a2be2, #ff6b00)',
                  border: '2px solid #fff',
                  '&:hover': {
                    boxShadow: '0 0 15px rgba(138, 43, 226, 0.7)',
                  },
                },
              }}
            />
            <Typography 
              variant="h6" 
              align="center" 
              color="secondary"
              sx={{ fontFamily: 'monospace', mt: 0.5 }}
            >
              {Math.round(volume * 100)}%
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