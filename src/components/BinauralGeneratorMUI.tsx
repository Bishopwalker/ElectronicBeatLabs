// Electromagnetic Beat Lab - Binaural Test Component (Material UI)
// Test individual left/right frequencies

import React, { useState } from 'react';
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
  const [localLeft, setLocalLeft] = useState(leftFreq.toString());
  const [localRight, setLocalRight] = useState(rightFreq.toString());
 // const [isPlaying, setIsPlaying] = useState(false);

    const audioEngine = useAudioEngine();

  const handleLeftChange = (value: string) => {
    setLocalLeft(value);
    const freq = parseFloat(value);
    if (!isNaN(freq) && freq >= 20 && freq <= 20000) {
      onFrequencyChange(freq, parseFloat(localRight));
      
      // Update live audio if playing
      if (audioEngine.audioState.isPlaying) {
        audioEngine.updateFrequency(freq, parseFloat(localRight));
      }
    }
  };

  const handleRightChange = (value: string) => {
    setLocalRight(value);
    const freq = parseFloat(value);
    if (!isNaN(freq) && freq >= 20 && freq <= 20000) {
      onFrequencyChange(parseFloat(localLeft), freq);
      
      // Update live audio if playing
      if (audioEngine.audioState.isPlaying) {
        audioEngine.updateFrequency(parseFloat(localLeft), freq);
      }
    }
  };

    const handleTest = () => {
        if (audioEngine.audioState.isPlaying) {
            // Stop audio
            audioEngine.stopBinauralBeat();
        } else {
            // Start audio with current frequencies
            const config = {
                leftFreq: parseFloat(localLeft),
                rightFreq: parseFloat(localRight),
                beatFreq: Math.abs(parseFloat(localRight) - parseFloat(localLeft)),
                amplitude: 0.5,
                waveform: 'sine' as const
            };
            audioEngine.startBinauralBeat(config);
        }
    };
  const beatFrequency = Math.abs(audioEngine.audioState.rightFreq - audioEngine.audioState.leftFreq);

  const handleReset = () => {
    const defaultLeft = 440;
    const defaultRight = 444;
    setLocalLeft(defaultLeft.toString());
    setLocalRight(defaultRight.toString());
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
                  type="number"
                  value={localLeft}
                  onChange={(e) => handleLeftChange(e.target.value)}
                  size="small"
                  fullWidth
                  inputProps={{ 
                    min: 20, 
                    max: 20000,
                    step: 0.1,
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
                  type="number"
                  value={localRight}
                  onChange={(e) => handleRightChange(e.target.value)}
                  size="small"
                  fullWidth
                  inputProps={{ 
                    min: 20, 
                    max: 20000,
                    step: 0.1,
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