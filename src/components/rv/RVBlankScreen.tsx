/**
 * RV Blank Screen Component
 *
 * Pure black fullscreen display for Remote Viewing target numbers.
 * Shows ONLY the 8-digit target number - no distractions.
 *
 * The number displayed is "entangled" with a target image/location.
 * User focuses on this number to perceive the target through RV.
 *
 * Controls:
 * - H or Space: Toggle number visibility (for meditation between views)
 * - Escape: Exit blank screen mode
 * - Enter: Submit impressions (when ready)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Fade, keyframes } from '@mui/material';

// Subtle glow animation for the number
const subtleGlow = keyframes`
  0%, 100% {
    text-shadow: 0 0 30px rgba(0, 255, 136, 0.4), 0 0 60px rgba(0, 255, 136, 0.2);
  }
  50% {
    text-shadow: 0 0 40px rgba(0, 255, 136, 0.6), 0 0 80px rgba(0, 255, 136, 0.3);
  }
`;

// Number materialize animation
const numberAppear = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8);
    filter: blur(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
`;

// Fade out animation for hiding
const numberFade = keyframes`
  0% { opacity: 1; }
  100% { opacity: 0; }
`;

interface RVBlankScreenProps {
  /** The 8-digit target number to display (format: "12345678" or "1234-5678") */
  targetNumber: string;
  /** Session elapsed time in seconds (optional) */
  sessionTimer?: number;
  /** Callback when user exits blank screen */
  onClose: () => void;
  /** Callback when user is ready to submit impressions */
  onSubmit?: () => void;
  /** Whether to show the timer in corner (default: false for minimal distraction) */
  showTimer?: boolean;
}

/**
 * Format target number as xxxx-xxxx with hyphen.
 * Accepts either "12345678" or "1234-5678" format.
 */
const formatTargetNumber = (num: string): string => {
  // Remove any existing hyphen
  const clean = num.replace(/-/g, '');
  // Ensure 8 digits, pad with zeros if needed
  const padded = clean.padStart(8, '0').slice(0, 8);
  // Insert hyphen in the middle
  return `${padded.slice(0, 4)}-${padded.slice(4)}`;
};

const RVBlankScreen: React.FC<RVBlankScreenProps> = ({
  targetNumber,
  sessionTimer = 0,
  onClose,
  onSubmit,
  showTimer = false
}) => {
  const [numberVisible, setNumberVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Format timer as MM:SS
  const formatTimer = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'h':
          e.preventDefault();
          setNumberVisible(prev => !prev);
          break;
        case 'escape':
          e.preventDefault();
          setIsExiting(true);
          setTimeout(onClose, 300);
          break;
        case 'enter':
          e.preventDefault();
          if (onSubmit) {
            setIsExiting(true);
            setTimeout(onSubmit, 300);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClose, onSubmit]);

  // Prevent scrolling while in blank screen mode
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <Fade in={!isExiting} timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000000',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          cursor: 'none',
          overflow: 'hidden',
          userSelect: 'none'
        }}
        onClick={() => setNumberVisible(prev => !prev)}
      >
        {/* Target Number Display */}
        <Fade in={numberVisible} timeout={500}>
          <Typography
            sx={{
              fontSize: { xs: '4rem', sm: '6rem', md: '8rem', lg: '10rem' },
              fontWeight: 700,
              fontFamily: '"Courier New", Courier, monospace',
              color: '#00ff88',
              letterSpacing: { xs: '0.2em', sm: '0.3em', md: '0.4em' },
              animation: `${numberAppear} 0.8s ease-out, ${subtleGlow} 4s ease-in-out infinite`,
              textAlign: 'center',
              lineHeight: 1.2
            }}
          >
            {formatTargetNumber(targetNumber)}
          </Typography>
        </Fade>

        {/* Hidden state indicator */}
        {!numberVisible && (
          <Typography
            sx={{
              position: 'absolute',
              color: 'rgba(255, 255, 255, 0.1)',
              fontSize: '1rem',
              fontFamily: 'monospace'
            }}
          >
            [Press H or Space to reveal]
          </Typography>
        )}

        {/* Optional Timer (top right, very subtle) */}
        {showTimer && (
          <Typography
            sx={{
              position: 'absolute',
              top: 16,
              right: 24,
              color: 'rgba(255, 255, 255, 0.15)',
              fontSize: '0.9rem',
              fontFamily: 'monospace'
            }}
          >
            {formatTimer(sessionTimer)}
          </Typography>
        )}

        {/* Subtle help text (bottom, very faded) */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 24,
            display: 'flex',
            gap: 4,
            opacity: 0.08,
            transition: 'opacity 0.3s ease',
            '&:hover': { opacity: 0.25 }
          }}
        >
          <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontFamily: 'monospace' }}>
            [H] Hide/Show
          </Typography>
          <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontFamily: 'monospace' }}>
            [ESC] Exit
          </Typography>
          {onSubmit && (
            <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontFamily: 'monospace' }}>
              [ENTER] Submit
            </Typography>
          )}
        </Box>
      </Box>
    </Fade>
  );
};

export default RVBlankScreen;
