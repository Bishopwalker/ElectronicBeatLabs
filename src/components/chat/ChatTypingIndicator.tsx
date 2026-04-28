/**
 * ChatTypingIndicator Component
 *
 * Shows "X is typing..." with animated dots.
 */

import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';

interface ChatTypingIndicatorProps {
  typingUserNames: string[];
}

// Animated dots
const bounce = keyframes`
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
`;

/**
 * Displays typing indicator with user names.
 */
export const ChatTypingIndicator: React.FC<ChatTypingIndicatorProps> = ({
  typingUserNames,
}) => {
  if (typingUserNames.length === 0) {
    return null;
  }

  const getText = (): string => {
    if (typingUserNames.length === 1) {
      return `${typingUserNames[0]} is typing`;
    }
    if (typingUserNames.length === 2) {
      return `${typingUserNames[0]} and ${typingUserNames[1]} are typing`;
    }
    return `${typingUserNames[0]} and ${typingUserNames.length - 1} others are typing`;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.5,
        backgroundColor: 'rgba(138, 43, 226, 0.1)',
        borderRadius: 1,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.75rem',
          color: '#888',
          fontStyle: 'italic',
        }}
      >
        {getText()}
      </Typography>

      {/* Animated dots */}
      <Box sx={{ display: 'flex', gap: '2px' }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: '#8a2be2',
              animation: `${bounce} 1.4s ease-in-out infinite`,
              animationDelay: `${i * 0.16}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};
