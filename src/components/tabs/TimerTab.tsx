// Electromagnetic Beat Lab - Timer Tab Component
import React from 'react';
import { Box, Typography } from '@mui/material';
import TimerControls from '../TimerControls';
import type { AppState, AudioEngine, Pattern8D } from '../../types';

interface TimerTabProps {
  appState: AppState;
  audioEngine: AudioEngine;
  patterns8D: Pattern8D[];
  onStateChange: (state: Partial<AppState>) => void;
}

const TimerTab: React.FC<TimerTabProps> = () => {
  return (
    <Box
      sx={{
        py: 1,
        maxWidth: 1200,
        mx: 'auto'
      }}
    >
      <Typography
        variant="h6"
        component="h4"
        sx={{
          fontSize: '1.2rem',
          color: '#ff6b00',
          mb: 1,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        Frequency Timer Sessions
      </Typography>
      <Typography
        sx={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.9rem',
          lineHeight: 1.6,
          mb: 2,
          textAlign: 'center',
          maxWidth: 800,
          mx: 'auto'
        }}
      >
        Schedule automated frequency transitions for extended sessions. 
        Perfect for sleep induction, meditation progressions, and lucid dreaming protocols.
      </Typography>
      <TimerControls />
    </Box>
  );
};

export default TimerTab;