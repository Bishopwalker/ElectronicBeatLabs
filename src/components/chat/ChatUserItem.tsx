/**
 * ChatUserItem Component - Single User in List
 *
 * Displays user with status indicator and verified badge.
 */

import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import CircleIcon from '@mui/icons-material/Circle';
import type { ChatUser } from '../../types/chat.types';

interface ChatUserItemProps {
  user: ChatUser;
  onClick?: (user: ChatUser) => void;
}

/**
 * Renders a single user in the user list.
 */
export const ChatUserItem: React.FC<ChatUserItemProps> = ({ user, onClick }) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'online':
        return '#00ff88';
      case 'away':
        return '#ffc107';
      case 'offline':
        return '#666';
      default:
        return '#666';
    }
  };

  return (
    <Box
      onClick={() => onClick?.(user)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 0.75,
        px: 1,
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        },
      }}
    >
      {/* Status indicator */}
      <CircleIcon
        sx={{
          fontSize: '0.6rem',
          color: getStatusColor(user.status),
        }}
      />

      {/* Nickname with color */}
      <Typography
        sx={{
          color: user.chatColor,
          fontSize: '0.85rem',
          fontWeight: 500,
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {user.nickname}
      </Typography>

      {/* Verified badge */}
      {user.isVerified && (
        <Tooltip title="Verified User">
          <VerifiedIcon
            sx={{
              fontSize: '0.9rem',
              color: '#00ff88',
            }}
          />
        </Tooltip>
      )}

      {/* Away message indicator */}
      {user.status === 'away' && user.awayMessage && (
        <Tooltip title={user.awayMessage}>
          <Typography
            sx={{
              fontSize: '0.7rem',
              color: '#ffc107',
              fontStyle: 'italic',
            }}
          >
            (away)
          </Typography>
        </Tooltip>
      )}
    </Box>
  );
};
