// Electromagnetic Beat Lab - Binaural Test Component (Material UI)
// Test individual left/right frequencies

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Stack,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAudioEngine } from '../hooks/useAudioEngine';
import type { BinauralTestProps } from '../types';

const BinauralGeneratorMUI: React.FC<BinauralTestProps> = ({
  leftFreq,
  rightFreq,
  onFrequencyChange
}) => {
  // Local state for typing - allows smooth input
  const [leftInput, setLeftInput] = useState(leftFreq.toString());
  const [rightInput, setRightInput] = useState(rightFreq.toString());
  
  const audioEngine = useAudioEngine();

  // Update local state when props change (from external sources)
  useEffect(() => {
    setLeftInput(leftFreq.toString());
  }, [leftFreq]);

  useEffect(() => {
    setRightInput(rightFreq.toString());
  }, [rightFreq]);

  const handleLeftChange = (value: string) => {
    console.log('🎛️ Left Hz input changed:', value);
    setLeftInput(value);
    
    const leftNum = parseFloat(value);
    const rightNum = rightFreq;
    
    if (!isNaN(leftNum)) {
      console.log('🎛️ Calling onFrequencyChange:', leftNum, rightNum);
      onFrequencyChange(leftNum, rightNum);
    }
  };

  const handleRightChange = (value: string) => {
    console.log('🎛️ Right Hz input changed:', value);
    setRightInput(value);
    
    const leftNum = leftFreq;
    const rightNum = parseFloat(value);
    
    if (!isNaN(rightNum)) {
      console.log('🎛️ Calling onFrequencyChange:', leftNum, rightNum);
      onFrequencyChange(leftNum, rightNum);
    }
  };

    const handleTest = () => {
        if (audioEngine.audioState.isPlaying) {
            // Stop audio
            audioEngine.stopBinauralBeat();
        } else {
            // Use current prop values (which come from parent state)
            const leftValue = leftFreq;
            const rightValue = rightFreq;
            
            console.log('🎛️ Starting binaural beat:', leftValue, 'Hz /', rightValue, 'Hz');
            
            // Start audio with current frequencies
            const config = {
                leftFreq: leftValue,
                rightFreq: rightValue,
                beatFreq: Math.abs(rightValue - leftValue),
                amplitude: 0.5,
                waveform: 'sine' as const
            };
            audioEngine.startBinauralBeat(config);
        }
    };
  // Calculate beat frequency directly from props
  const beatFrequency = Math.abs(rightFreq - leftFreq);

  const handleReset = () => {
    const defaultLeft = 440;
    const defaultRight = 444;
    setLeftInput(defaultLeft.toString());
    setRightInput(defaultRight.toString());
    onFrequencyChange(defaultLeft, defaultRight);
  };

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
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} mb={0.5}>
          <HeadphonesIcon color="info" />
          <Typography variant="subtitle1" align="center" color="info">
            Binaural Beat Generator
          </Typography>
        </Stack>
        
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
          
          <Stack direction="row" spacing={0.5}>
            <Button
              variant="contained"
              color={audioEngine.audioState.isPlaying ? "error" : "info"}
              onClick={handleTest}
              startIcon={audioEngine.audioState.isPlaying ? <StopIcon /> : <PlayArrowIcon />}
              fullWidth
              size="small"
              sx={{
                background: audioEngine.audioState.isPlaying
                  ? 'linear-gradient(45deg, #ff0066, #ff6b00)'
                  : 'linear-gradient(45deg, #00bfff, #8a2be2)',
                '&:hover': {
                  background: audioEngine.audioState.isPlaying
                    ? 'linear-gradient(45deg, #ff3388, #ff8533)'
                    : 'linear-gradient(45deg, #33ccff, #9944d9)',
                }
              }}
            >
                {audioEngine.audioState.isPlaying ? 'Stop' : 'Play'}
            </Button>
            
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
                label={audioEngine.audioState.isPlaying ? "Playing..." : "Ready"}
                color={audioEngine.audioState.isPlaying ? "success" : "default"}
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