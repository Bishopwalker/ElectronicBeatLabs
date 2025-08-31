// Electromagnetic Beat Lab - Frequency Display Component (Material UI)
// Real-time frequency display with precision controls

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import type { FrequencyDisplayProps } from '../types/index';

const FrequencyDisplayMUI: React.FC<FrequencyDisplayProps> = ({
  frequency,
  beatFrequency,
  onChange,
  rangeLabel
}) => {
  const handleChange = (_: Event, value: number | number[]) => {
    onChange(value as number);
  };

  const getFrequencyColor = (freq: number) => {
    if (freq < 4) return '#8a2be2'; // Delta
    if (freq < 8) return '#00bfff'; // Theta
    if (freq < 13) return '#00ff88'; // Alpha
    if (freq < 30) return '#ffd700'; // Beta
    return '#ff6b00'; // Gamma
  };

  return (
    <Card sx={{ 
      maxHeight: 280,
      overflow: 'auto',
      background: 'rgba(0, 255, 136, 0.05)',
      borderColor: 'rgba(0, 255, 136, 0.3)',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'linear-gradient(45deg, #00ff88, #ff6b00)',
        borderRadius: '4px',
      },
    }}>
      <CardContent sx={{ p: 1.5 }}>
        <Typography variant="h4" align="center" color="success" gutterBottom>
          Frequency Control
        </Typography>
        
        <Stack spacing={2}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 2, 
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              textAlign: 'center'
            }}
          >
            <Typography 
              variant="h2" 
              sx={{ 
                fontFamily: 'monospace',
                fontWeight: 700,
                color: getFrequencyColor(beatFrequency),
                textShadow: `0 0 20px ${getFrequencyColor(beatFrequency)}66`,
                fontSize: '1.8rem',
              }}
            >
              {frequency.toFixed(1)} Hz
            </Typography>
            <Typography 
              variant="h5" 
              color="primary"
              sx={{ fontFamily: 'monospace', mt: 1 }}
            >
              Beat: {beatFrequency.toFixed(1)} Hz
            </Typography>
          </Paper>
          
          {rangeLabel && (
            <Chip
              label={rangeLabel}
              size="small"
              sx={{ 
                alignSelf: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            />
          )}
          
          <Box>
            <Slider
              value={frequency}
              onChange={handleChange}
              min={0.5}
              max={40}
              step={0.1}
              valueLabelDisplay="auto"
              marks={[
                { value: 1, label: 'δ' },
                { value: 4, label: 'θ' },
                { value: 8, label: 'α' },
                { value: 13, label: 'β' },
                { value: 30, label: 'γ' },
              ]}
              sx={{
                '& .MuiSlider-track': {
                  background: 'linear-gradient(90deg, #8a2be2, #00bfff, #00ff88, #ffd700, #ff6b00)',
                },
                '& .MuiSlider-thumb': {
                  background: 'linear-gradient(45deg, #00ff88, #ff6b00)',
                  border: '2px solid #fff',
                  '&:hover': {
                    boxShadow: '0 0 15px rgba(0, 255, 136, 0.7)',
                  },
                },
                '& .MuiSlider-mark': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
                '& .MuiSlider-markLabel': {
                  fontSize: '0.7rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />
          </Box>
          
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
            <Chip label="Delta 0.5-4 Hz" size="small" sx={{ fontSize: '0.7rem' }} />
            <Chip label="Theta 4-8 Hz" size="small" sx={{ fontSize: '0.7rem' }} />
            <Chip label="Alpha 8-13 Hz" size="small" sx={{ fontSize: '0.7rem' }} />
            <Chip label="Beta 13-30 Hz" size="small" sx={{ fontSize: '0.7rem' }} />
            <Chip label="Gamma 30+ Hz" size="small" sx={{ fontSize: '0.7rem' }} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FrequencyDisplayMUI;