/**
 * ChatMessage Component - Single Message Display
 *
 * Renders individual chat message with AOL/AIM styling:
 * - Colored nicknames
 * - Verified badge
 * - Timestamps
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import type { ChatMessage as ChatMessageType } from '../../types/chat.types';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage?: boolean;
}

/**
 * Renders a single chat message.
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwnMessage = false,
}) => {
  const formatTime = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // System messages have different styling
  if (message.messageType === 'system') {
    return (
      <Box sx={{ py: 0.5, px: 1 }}>
        <Typography
          variant="body2"
          sx={{
            color: '#888',
            fontStyle: 'italic',
            fontSize: '0.85rem',
            textAlign: 'center',
          }}
        >
          {message.content}
        </Typography>
      </Box>
    );
  }

  // Emote messages: "/me does something"
  if (message.messageType === 'emote') {
    return (
      <Box sx={{ py: 0.5, px: 1 }}>
        <Typography
          variant="body2"
          sx={{
            color: message.senderColor,
            fontStyle: 'italic',
            fontSize: '0.9rem',
          }}
        >
          * {message.senderNickname} {message.content}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: 0.5,
        px: 1,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        backgroundColor: isOwnMessage
          ? 'rgba(138, 43, 226, 0.1)'
          : 'transparent',
        borderRadius: 1,
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
        },
      }}
    >
      {/* Timestamp */}
      <Typography
        component="span"
        sx={{
          color: '#666',
          fontSize: '0.75rem',
          minWidth: '50px',
          flexShrink: 0,
          fontFamily: 'monospace',
        }}
      >
        [{formatTime(message.createdAt)}]
      </Typography>

      {/* Nickname with color and verified badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        <Typography
          component="span"
          sx={{
            color: message.senderColor,
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {message.senderNickname}
        </Typography>
        {message.senderIsVerified && (
          <VerifiedIcon
            sx={{
              fontSize: '0.9rem',
              color: '#00ff88',
            }}
          />
        )}
        <Typography component="span" sx={{ color: '#666' }}>
          :
        </Typography>
      </Box>

      {/* Message content */}
      <Typography
        component="span"
        sx={{
          color: '#e0e0e0',
          fontSize: '0.9rem',
          wordBreak: 'break-word',
          flex: 1,
        }}
      >
        {message.content}
      </Typography>
    </Box>
  );
};
