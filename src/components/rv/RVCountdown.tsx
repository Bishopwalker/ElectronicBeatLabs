/**
 * RV Countdown Component
 *
 * Display countdown timers for tournament phases:
 * - Countdown to entanglement (3:33 mark when target materializes)
 * - Countdown to reveal (12-hour mark when results become available)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, LinearProgress, keyframes } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Pulse animation for critical urgency
const pulseAnimation = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
`;

// Glow animation
const glowAnimation = keyframes`
  0%, 100% {
    text-shadow: 0 0 20px rgba(138, 43, 226, 0.5);
  }
  50% {
    text-shadow: 0 0 30px rgba(138, 43, 226, 0.8);
  }
`;

export type CountdownPhase = 'entanglement' | 'reveal';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

interface RVCountdownProps {
  /** Target timestamp (ISO format) */
  targetTime: string;
  /** Callback when countdown reaches zero */
  onCountdownComplete?: () => void;
  /** Countdown phase type */
  phase?: CountdownPhase;
  /** Show progress bar indicator */
  showProgress?: boolean;
  /** Compact mode for smaller display */
  compact?: boolean;
  /** Total duration in seconds (for progress calculation) */
  totalDuration?: number;
}

/**
 * Determine urgency level based on seconds remaining.
 */
const getUrgencyLevel = (seconds: number): UrgencyLevel => {
  if (seconds <= 3600) return 'critical';  // < 1 hour
  if (seconds <= 10800) return 'high';     // < 3 hours
  if (seconds <= 21600) return 'medium';   // < 6 hours
  return 'low';
};

/**
 * Get color based on urgency level.
 */
const getUrgencyColor = (urgency: UrgencyLevel): string => {
  switch (urgency) {
    case 'critical': return '#ff1493';
    case 'high': return '#ff6b00';
    case 'medium': return '#ffaa00';
    default: return '#8a2be2';
  }
};

/**
 * Format seconds as HH:MM:SS.
 */
const formatCountdown = (seconds: number): string => {
  if (seconds <= 0) return '00:00:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const RVCountdown: React.FC<RVCountdownProps> = ({
  targetTime,
  onCountdownComplete,
  phase = 'reveal',
  showProgress = false,
  compact = false,
  totalDuration
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  // Calculate seconds remaining
  const calculateRemaining = useCallback((): number => {
    const target = new Date(targetTime).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((target - now) / 1000));
  }, [targetTime]);

  // Update countdown every second
  useEffect(() => {
    const updateCountdown = () => {
      const remaining = calculateRemaining();
      setSecondsRemaining(remaining);

      if (remaining <= 0 && !isComplete) {
        setIsComplete(true);
        onCountdownComplete?.();
      }
    };

    // Initial update
    updateCountdown();

    // Set interval
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [calculateRemaining, isComplete, onCountdownComplete]);

  const urgency = getUrgencyLevel(secondsRemaining);
  const urgencyColor = getUrgencyColor(urgency);

  // Calculate progress percentage
  const progressPercent = totalDuration
    ? Math.min(100, Math.max(0, ((totalDuration - secondsRemaining) / totalDuration) * 100))
    : 0;

  if (isComplete) {
    return (
      <Box
        sx={{
          p: compact ? 1.5 : 2,
          background: 'rgba(0, 255, 136, 0.1)',
          border: '1px solid rgba(0, 255, 136, 0.4)',
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        <Typography
          variant={compact ? 'body1' : 'h5'}
          sx={{
            color: '#00ff88',
            fontWeight: 600,
            fontFamily: 'monospace'
          }}
        >
          {phase === 'entanglement' ? 'TARGET MATERIALIZED' : 'RESULTS AVAILABLE'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: compact ? 1.5 : 2,
        background: 'rgba(138, 43, 226, 0.1)',
        border: `1px solid ${urgencyColor}40`,
        borderRadius: 2,
        textAlign: 'center'
      }}
    >
      {/* Phase Label */}
      <Typography
        variant="caption"
        sx={{
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          mb: 1
        }}
      >
        <AccessTimeIcon sx={{ fontSize: 14 }} />
        {phase === 'entanglement' ? 'Target Materializes In' : 'Results Reveal In'}
      </Typography>

      {/* Countdown Display */}
      <Typography
        variant={compact ? 'h5' : 'h3'}
        sx={{
          fontWeight: 700,
          fontFamily: '"Courier New", Courier, monospace',
          letterSpacing: '0.1em',
          color: urgencyColor,
          animation: urgency === 'critical'
            ? `${pulseAnimation} 1s ease-in-out infinite, ${glowAnimation} 2s ease-in-out infinite`
            : `${glowAnimation} 4s ease-in-out infinite`
        }}
      >
        {formatCountdown(secondsRemaining)}
      </Typography>

      {/* Progress Bar */}
      {showProgress && totalDuration && (
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{
            mt: 2,
            height: 6,
            borderRadius: 3,
            backgroundColor: 'rgba(138, 43, 226, 0.2)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              background: urgency === 'critical'
                ? 'linear-gradient(90deg, #ff1493, #ff6b00)'
                : urgency === 'high'
                ? 'linear-gradient(90deg, #ff6b00, #ffaa00)'
                : 'linear-gradient(90deg, #8a2be2, #00ff88)'
            }
          }}
        />
      )}

      {/* Urgency Indicator */}
      {urgency === 'critical' && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 1,
            color: '#ff1493',
            fontWeight: 500
          }}
        >
          Final hour - submit your prediction now!
        </Typography>
      )}
    </Box>
  );
};

export default RVCountdown;
