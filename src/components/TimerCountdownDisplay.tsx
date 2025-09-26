// Timer Countdown Display Component
// Shows prominent countdown for active timer sessions

import React from 'react';
import { Box, Typography, Paper, LinearProgress, Chip } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface TimerCountdownDisplayProps {
  timerStatus: any | null;
  isVisible?: boolean;
}

const TimerCountdownDisplay: React.FC<TimerCountdownDisplayProps> = ({ 
  timerStatus, 
  isVisible = true 
}) => {
  if (!timerStatus?.session?.is_active || !isVisible) {
    return null;
  }

  const currentTransition = timerStatus.current_transition;
  const timeRemainingCurrent = timerStatus.time_remaining_current;
  const timeRemainingTotal = timerStatus.time_remaining_total;
  const preset = timerStatus.session.preset;
  
  const currentIndex = timerStatus.session.current_transition_index || 0;
  const totalTransitions = preset?.transitions_count || 1;
  
  // Format time as MM:SS
  const formatTime = (minutes: number): string => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage for current transition
  const transitionProgress = currentTransition ? 
    ((currentTransition.duration_minutes - timeRemainingCurrent) / currentTransition.duration_minutes) * 100 : 0;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        background: 'linear-gradient(45deg, rgba(255, 107, 0, 0.1), rgba(138, 43, 226, 0.1))',
        border: '2px solid',
        borderColor: '#ff6b00',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(255, 107, 0, 0.05), rgba(138, 43, 226, 0.05))',
          animation: 'pulse 3s ease-in-out infinite',
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimerIcon sx={{ color: '#ff6b00' }} />
            <Typography variant="h6" sx={{ color: '#ff6b00', fontWeight: 'bold' }}>
              {preset?.name || 'Timer Session'}
            </Typography>
          </Box>
          
          <Chip
            icon={<PlayArrowIcon />}
            label="ACTIVE"
            color="success"
            variant="filled"
            size="small"
            sx={{
              fontWeight: 'bold',
              animation: 'pulse 2s infinite',
              boxShadow: '0 0 8px rgba(0, 255, 0, 0.4)'
            }}
          />
        </Box>

        {/* Current Transition Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Transition {currentIndex + 1} of {totalTransitions}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
            {currentTransition?.description}
          </Typography>
          <Typography variant="caption" color="secondary">
            {currentTransition?.frequency_hz}Hz {currentTransition?.frequency_type} • 
            {currentTransition?.left_ear_hz}Hz / {currentTransition?.right_ear_hz}Hz
          </Typography>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, transitionProgress))}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: 'linear-gradient(45deg, #ff6b00, #8a2be2)'
              }
            }}
          />
        </Box>

        {/* Time Display */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ 
              fontFamily: 'monospace', 
              fontWeight: 'bold',
              color: '#ff6b00',
              textShadow: '0 0 10px rgba(255, 107, 0, 0.5)'
            }}>
              {formatTime(timeRemainingCurrent)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Current Step
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ 
              fontFamily: 'monospace',
              fontWeight: 'bold',
              color: '#8a2be2'
            }}>
              {formatTime(timeRemainingTotal)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Remaining
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default TimerCountdownDisplay;