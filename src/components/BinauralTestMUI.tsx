// Electromagnetic Beat Lab - Binaural Test Component (Material UI)
// Test individual left/right frequencies

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { BinauralTestProps } from '../types/index';

const BinauralTestMUI: React.FC<BinauralTestProps> = ({
  leftFrequency,
  rightFrequency,
  onLeftChange,
  onRightChange,
  onTest,
  isPlaying
}) => {
  const [localLeft, setLocalLeft] = useState(leftFrequency.toString());
  const [localRight, setLocalRight] = useState(rightFrequency.toString());

  const handleLeftChange = (value: string) => {
    setLocalLeft(value);
    const freq = parseFloat(value);
    if (!isNaN(freq) && freq >= 20 && freq <= 20000) {
      onLeftChange(freq);
    }
  };

  const handleRightChange = (value: string) => {
    setLocalRight(value);
    const freq = parseFloat(value);
    if (!isNaN(freq) && freq >= 20 && freq <= 20000) {
      onRightChange(freq);
    }
  };

  const beatFrequency = Math.abs(leftFrequency - rightFrequency);

  const handleReset = () => {
    const defaultLeft = 440;
    const defaultRight = 444;
    setLocalLeft(defaultLeft.toString());
    setLocalRight(defaultRight.toString());
    onLeftChange(defaultLeft);
    onRightChange(defaultRight);
  };

  return (
    <Card sx={{ 
      maxHeight: 250,
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
      <CardContent sx={{ p: 1.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} mb={1}>
          <HeadphonesIcon color="info" />
          <Typography variant="h4" align="center" color="info">
            Binaural Test
          </Typography>
        </Stack>
        
        <Stack spacing={2}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 1,
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
                      fontSize: '1rem',
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
            </Grid>
            
            <Grid item xs={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 1,
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
                      fontSize: '1rem',
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
            </Grid>
          </Grid>
          
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
              variant="h5" 
              color="info"
              sx={{ fontFamily: 'monospace', fontWeight: 700 }}
            >
              {beatFrequency.toFixed(1)} Hz
            </Typography>
          </Paper>
          
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color={isPlaying ? "error" : "info"}
              onClick={onTest}
              startIcon={isPlaying ? <StopIcon /> : <PlayArrowIcon />}
              fullWidth
              size="small"
              sx={{
                background: isPlaying 
                  ? 'linear-gradient(45deg, #ff0066, #ff6b00)'
                  : 'linear-gradient(45deg, #00bfff, #8a2be2)',
                '&:hover': {
                  background: isPlaying
                    ? 'linear-gradient(45deg, #ff3388, #ff8533)'
                    : 'linear-gradient(45deg, #33ccff, #9944d9)',
                }
              }}
            >
              {isPlaying ? 'Stop Test' : 'Test'}
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
              label={isPlaying ? "Testing..." : "Ready"} 
              color={isPlaying ? "success" : "default"}
              size="small" 
              sx={{ fontSize: '0.65rem' }}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default BinauralTestMUI;