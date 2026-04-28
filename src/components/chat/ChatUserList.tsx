/**
 * ChatUserList Component - User Sidebar
 *
 * Displays list of users in current room with status.
 */

import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { ChatUserItem } from './ChatUserItem';
import type { ChatUser } from '../../types/chat.types';

interface ChatUserListProps {
  users: ChatUser[];
  onUserClick?: (user: ChatUser) => void;
  maxUsers?: number;
}

/**
 * Sidebar showing users in the current room.
 */
export const ChatUserList: React.FC<ChatUserListProps> = ({
  users,
  onUserClick,
  maxUsers = 50,
}) => {
  // Sort users: online first, then away, then offline
  const sortedUsers = [...users].sort((a, b) => {
    const order = { online: 0, away: 1, offline: 2 };
    return (order[a.status] ?? 2) - (order[b.status] ?? 2);
  });

  const onlineCount = users.filter((u) => u.status === 'online').length;
  const awayCount = users.filter((u) => u.status === 'away').length;

  return (
    <Box
      sx={{
        width: 180,
        minWidth: 180,
        borderRight: '1px solid rgba(138, 43, 226, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(15, 15, 25, 0.9)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#8a2be2',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Users ({users.length}/{maxUsers})
        </Typography>
        <Typography
          sx={{
            fontSize: '0.7rem',
            color: '#888',
            mt: 0.5,
          }}
        >
          {onlineCount} online{awayCount > 0 ? `, ${awayCount} away` : ''}
        </Typography>
      </Box>

      {/* User list */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 0.5,
          // Custom scrollbar
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(138, 43, 226, 0.3)',
            borderRadius: '3px',
          },
        }}
      >
        {sortedUsers.length === 0 ? (
          <Typography
            sx={{
              color: '#666',
              fontSize: '0.8rem',
              fontStyle: 'italic',
              textAlign: 'center',
              py: 2,
            }}
          >
            No users in room
          </Typography>
        ) : (
          sortedUsers.map((user) => (
            <ChatUserItem
              key={user.id}
              user={user}
              onClick={onUserClick}
            />
          ))
        )}
      </Box>

      {/* Footer with room capacity */}
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <Box sx={{ p: 1, textAlign: 'center' }}>
        <Typography
          sx={{
            fontSize: '0.65rem',
            color: users.length >= maxUsers ? '#ff6b6b' : '#666',
          }}
        >
          {users.length >= maxUsers ? 'Room Full' : `${maxUsers - users.length} slots open`}
        </Typography>
      </Box>
    </Box>
  );
};
