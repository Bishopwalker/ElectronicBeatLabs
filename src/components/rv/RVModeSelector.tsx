/**
 * RV Mode Selector Component
 *
 * Toggle between Tournament and Practice modes for Remote Viewing sessions.
 * Shows tournament status badge and countdown when in tournament mode.
 */

import React from 'react';
import { Box, Button, Typography, Chip, Badge, keyframes } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';

// Pulsing animation for active status
const pulseAnimation = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(0, 255, 136, 0);
  }
`;

export type RVMode = 'tournament' | 'practice';
export type TournamentStatus = 'active' | 'waiting' | 'pending' | 'revealed';

interface RVModeSelectorProps {
  /** Current selected mode */
  mode: RVMode;
  /** Tournament status for visual indicator */
  tournamentStatus?: TournamentStatus;
  /** Callback when mode changes */
  onModeChange: (newMode: RVMode) => void;
  /** Whether mode selection is disabled (e.g., during active session) */
  disabled?: boolean;
  /** Seconds until tournament target reveal */
  secondsUntilReveal?: number;
}

/**
 * Format seconds as HH:MM:SS countdown string.
 */
const formatCountdown = (seconds: number): string => {
  if (seconds <= 0) return '00:00:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const RVModeSelector: React.FC<RVModeSelectorProps> = ({
  mode,
  tournamentStatus = 'waiting',
  onModeChange,
  disabled = false,
  secondsUntilReveal
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        justifyContent: 'center',
        alignItems: 'center',
        mb: 3
      }}
    >
      {/* Tournament Mode Button */}
      <Badge
        badgeContent={
          tournamentStatus === 'active' ? (
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#00ff88',
                animation: `${pulseAnimation} 2s ease-in-out infinite`
              }}
            />
          ) : null
        }
        invisible={tournamentStatus !== 'active'}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Button
          variant={mode === 'tournament' ? 'contained' : 'outlined'}
          onClick={() => onModeChange('tournament')}
          disabled={disabled}
          startIcon={<EmojiEventsIcon />}
          sx={{
            px: 3,
            py: 1.5,
            minWidth: 180,
            borderRadius: 2,
            borderColor: mode === 'tournament' ? '#8a2be2' : 'rgba(138, 43, 226, 0.5)',
            backgroundColor: mode === 'tournament' ? 'rgba(138, 43, 226, 0.2)' : 'transparent',
            color: mode === 'tournament' ? '#8a2be2' : 'rgba(138, 43, 226, 0.7)',
            '&:hover': {
              borderColor: '#8a2be2',
              backgroundColor: 'rgba(138, 43, 226, 0.15)'
            },
            '&.Mui-disabled': {
              opacity: 0.5
            }
          }}
        >
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="button" sx={{ display: 'block', fontWeight: 600 }}>
              Tournament
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', opacity: 0.8, fontSize: '0.65rem' }}>
              12-hour cycles
            </Typography>
          </Box>
        </Button>
      </Badge>

      {/* Practice Mode Button */}
      <Button
        variant={mode === 'practice' ? 'contained' : 'outlined'}
        onClick={() => onModeChange('practice')}
        disabled={disabled}
        startIcon={<SchoolIcon />}
        sx={{
          px: 3,
          py: 1.5,
          minWidth: 180,
          borderRadius: 2,
          borderColor: mode === 'practice' ? '#00ff88' : 'rgba(0, 255, 136, 0.5)',
          backgroundColor: mode === 'practice' ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
          color: mode === 'practice' ? '#00ff88' : 'rgba(0, 255, 136, 0.7)',
          '&:hover': {
            borderColor: '#00ff88',
            backgroundColor: 'rgba(0, 255, 136, 0.15)'
          },
          '&.Mui-disabled': {
            opacity: 0.5
          }
        }}
      >
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="button" sx={{ display: 'block', fontWeight: 600 }}>
            Practice
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.8, fontSize: '0.65rem' }}>
            Instant feedback
          </Typography>
        </Box>
      </Button>

      {/* Tournament Countdown Chip */}
      {mode === 'tournament' && secondsUntilReveal !== undefined && secondsUntilReveal > 0 && (
        <Chip
          label={`Reveal: ${formatCountdown(secondsUntilReveal)}`}
          size="small"
          sx={{
            backgroundColor: 'rgba(255, 20, 147, 0.15)',
            color: '#ff1493',
            border: '1px solid rgba(255, 20, 147, 0.4)',
            fontFamily: 'monospace',
            fontSize: '0.75rem'
          }}
        />
      )}
    </Box>
  );
};

export default RVModeSelector;
