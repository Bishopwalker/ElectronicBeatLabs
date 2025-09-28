// Electromagnetic Beat Lab - Binaural Test Component (Material UI)
// Test individual left/right frequencies

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  Stack,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import RefreshIcon from '@mui/icons-material/Refresh';
import { calculateLeftFreq, calculateRightFreq, calculateBeatFrequency } from '../types/audio.types';

interface BinauralGeneratorProps {
  baseFrequency: number;
  beatFrequency: number;
  onFrequencyChange: (baseFreq: number, beatFreq: number) => void;
  currentPreset?: {
    name?: string;
    description?: string;
    isActive?: boolean;
    source?: 'timer' | 'pattern' | 'manual';
  };
}

const BinauralGeneratorMUI: React.FC<BinauralGeneratorProps> = ({
  baseFrequency,
  beatFrequency,
  onFrequencyChange,
  currentPreset
}) => {
  // Calculate display frequencies from base + beat
  const leftFreq = calculateLeftFreq(baseFrequency);
  const rightFreq = calculateRightFreq(baseFrequency, beatFrequency);

  // Local state for typing - allows smooth input
  const [leftInput, setLeftInput] = useState(leftFreq.toString());
  const [rightInput, setRightInput] = useState(rightFreq.toString());
  
  // Remove independent audio engine - parent handles all audio

  // Update local state when baseFreq/beatFreq changes
  useEffect(() => {
    const newLeftFreq = calculateLeftFreq(baseFrequency);
    console.log('🎛️ BinauralGenerator: Base frequency changed, left freq:', newLeftFreq);
    setLeftInput(newLeftFreq.toString());
  }, [baseFrequency]);

  useEffect(() => {
    const newRightFreq = calculateRightFreq(baseFrequency, beatFrequency);
    console.log('🎛️ BinauralGenerator: Beat frequency changed, right freq:', newRightFreq);
    setRightInput(newRightFreq.toString());
  }, [baseFrequency, beatFrequency]);

  const handleLeftChange = (value: string) => {
    console.log('🎛️ Left Hz input changed:', value);
    setLeftInput(value);

    const leftNum = parseFloat(value);
    if (!isNaN(leftNum)) {
      // Convert left freq back to baseFreq, keep current beatFreq
      const newBaseFreq = leftNum; // left = base
      console.log('🎛️ Calling onFrequencyChange with baseFreq:', newBaseFreq, 'beatFreq:', beatFrequency);
      onFrequencyChange(newBaseFreq, beatFrequency);
    }
  };

  const handleRightChange = (value: string) => {
    console.log('🎛️ Right Hz input changed:', value);
    setRightInput(value);

    const rightNum = parseFloat(value);
    if (!isNaN(rightNum)) {
      // Convert right freq to beatFreq: beat = right - left (right - base)
      const newBeatFreq = calculateBeatFrequency(leftFreq, rightNum);
      console.log('🎛️ Calling onFrequencyChange with baseFreq:', baseFrequency, 'beatFreq:', newBeatFreq);
      onFrequencyChange(baseFrequency, newBeatFreq);
    }
  };

  // Beat frequency comes from props, display frequencies calculated above

  const handleReset = () => {
    const defaultBaseFreq = 140;
    const defaultBeatFreq = 4;
    const newLeftFreq = calculateLeftFreq(defaultBaseFreq);
    const newRightFreq = calculateRightFreq(defaultBaseFreq, defaultBeatFreq);
    setLeftInput(newLeftFreq.toString());
    setRightInput(newRightFreq.toString());
    onFrequencyChange(defaultBaseFreq, defaultBeatFreq);
  };

  // @ts-ignore
  return (
    <Card sx={{ 
      maxHeight: 300,
      overflow: 'auto',
      background: 'rgba(0, 191, 255, 0.05)',
      borderColor: 'rgba(0, 191, 255, 0.3)',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'linear-gradient(45deg, #00bfff, #8a2be2)',
        borderRadius: '4px',
      },
    }}>
      <CardContent sx={{ p: 0.75 }}>
        <Stack   direction="row" alignItems="center" justifyContent="center" spacing={0.5} mb={0.5}>
          <HeadphonesIcon color="info" />
          <Typography variant="subtitle1" align="center" color="info">
            Binaural Beat Generator
          </Typography>
        </Stack>

        {/* Current Preset Display */}
        {currentPreset && currentPreset.name && (
          <Paper
            elevation={0}
            sx={{
              p: 0.75,
              mb: 1,
              textAlign: 'center',
              background: currentPreset.source === 'timer' 
                ? 'rgba(255, 107, 0, 0.1)' 
                : currentPreset.source === 'pattern'
                ? 'rgba(138, 43, 226, 0.1)'
                : 'rgba(0, 191, 255, 0.1)',
              border: `1px solid ${currentPreset.source === 'timer' 
                ? 'rgba(255, 107, 0, 0.3)' 
                : currentPreset.source === 'pattern'
                ? 'rgba(138, 43, 226, 0.3)'
                : 'rgba(0, 191, 255, 0.3)'}`,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
              <Chip 
                label={currentPreset.source === 'timer' ? '⏰' : currentPreset.source === 'pattern' ? '🌀' : '🎛️'}
                size="small"
                sx={{ 
                  fontSize: '0.7rem',
                  height: '20px',
                  background: 'transparent',
                  border: 'none'
                }}
              />
              <Typography variant="caption" color="text.primary" sx={{ fontWeight: 600 }}>
                {currentPreset.name}
              </Typography>
              {currentPreset.isActive && (
                <Chip 
                  label="ACTIVE"
                  size="small"
                  color="success"
                  sx={{ 
                    fontSize: '0.6rem',
                    height: '18px',
                    fontWeight: 700
                  }}
                />
              )}
            </Stack>
            {currentPreset.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  mt: 0.25,
                  fontSize: '0.7rem',
                  fontStyle: 'italic'
                }}
              >
                {currentPreset.description}
              </Typography>
            )}
          </Paper>
        )}
        
        <Stack spacing={0.75}>
          <Stack direction="row" spacing={0.5}>
            <Box flex={1}>
              <Paper
                elevation={0}
                sx={{
                  p: 0.5,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Typography variant="caption" align="center" display="block" gutterBottom>
                  LEFT EAR
                </Typography>
                <TextField
                  type="text"
                  value={leftInput}
                  onChange={(e) => handleLeftChange(e.target.value)}
                  size="small"
                  fullWidth
                  inputProps={{ 
                    style: { textAlign: 'center', fontFamily: 'monospace' }
                  }}
                  sx={{
                    '& input': {
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }
                  }}
                />
                <Typography 
                  variant="caption" 
                  align="center" 
                  display="block" 
                  sx={{ mt: 0.5, color: 'text.secondary' }}
                >
                  Hz
                </Typography>
              </Paper>
            </Box>
            
            <Box flex={1}>
              <Paper
                elevation={0}
                sx={{
                  p: 0.5,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Typography variant="caption" align="center" display="block" gutterBottom>
                  RIGHT EAR
                </Typography>
                <TextField
                  type="text"
                  value={rightInput}
                  onChange={(e) => handleRightChange(e.target.value)}
                  size="small"
                  fullWidth
                  inputProps={{ 
                    style: { textAlign: 'center', fontFamily: 'monospace' }
                  }}
                  sx={{
                    '& input': {
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }
                  }}
                />
                <Typography 
                  variant="caption" 
                  align="center" 
                  display="block" 
                  sx={{ mt: 0.5, color: 'text.secondary' }}
                >
                  Hz
                </Typography>
              </Paper>
            </Box>
          </Stack>
          
          <Paper
            elevation={0}
            sx={{
              p: 1,
              textAlign: 'center',
              background: 'rgba(0, 191, 255, 0.1)',
              border: '1px solid rgba(0, 191, 255, 0.3)',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Binaural Beat Frequency
            </Typography>
            <Typography 
              variant="h6" 
              color="info"
              sx={{ fontFamily: 'monospace', fontWeight: 700 }}
            >
              {beatFrequency.toFixed(1)} Hz
            </Typography>
          </Paper>
          
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <IconButton 
              onClick={handleReset}
              color="default"
              size="small"
              sx={{ 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.05)',
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Stack>
          
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <Chip label="20Hz - 20kHz Range" size="small" sx={{ fontSize: '0.65rem' }} />
            <Chip
                label="Frequency Display"
                color="primary"
              size="small"
              sx={{ fontSize: '0.65rem' }}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default BinauralGeneratorMUI;