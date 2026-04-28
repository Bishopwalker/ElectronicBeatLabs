/**
 * ChatRoomSelector Component - Room Navigation
 *
 * Displays available rooms as tabs/buttons for switching.
 */

import React from 'react';
import { Box, Typography, Badge, Tooltip } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import TagIcon from '@mui/icons-material/Tag';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import type { ChatRoom } from '../../types/chat.types';

interface ChatRoomSelectorProps {
  rooms: ChatRoom[];
  currentRoomId: string | null;
  unreadCounts?: Map<string, number>;
  onSelectRoom: (roomId: string) => void;
}

/**
 * Room selector tabs/buttons.
 */
export const ChatRoomSelector: React.FC<ChatRoomSelectorProps> = ({
  rooms,
  currentRoomId,
  unreadCounts = new Map(),
  onSelectRoom,
}) => {
  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'global':
        return <PublicIcon sx={{ fontSize: '0.9rem' }} />;
      case 'topic':
        return <TagIcon sx={{ fontSize: '0.9rem' }} />;
      case 'dm':
        return <ChatBubbleIcon sx={{ fontSize: '0.9rem' }} />;
      default:
        return <TagIcon sx={{ fontSize: '0.9rem' }} />;
    }
  };

  // Group rooms by type
  const globalRooms = rooms.filter((r) => r.roomType === 'global');
  const topicRooms = rooms.filter((r) => r.roomType === 'topic');
  const dmRooms = rooms.filter((r) => r.roomType === 'dm');

  const renderRoomButton = (room: ChatRoom) => {
    const isSelected = room.id === currentRoomId;
    const unreadCount = unreadCounts.get(room.id) || 0;

    return (
      <Tooltip key={room.id} title={room.description || room.name} placement="right">
        <Box
          onClick={() => onSelectRoom(room.id)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.75,
            cursor: 'pointer',
            borderRadius: 1,
            transition: 'all 0.2s ease',
            backgroundColor: isSelected
              ? 'rgba(138, 43, 226, 0.3)'
              : 'transparent',
            borderLeft: isSelected
              ? '3px solid #8a2be2'
              : '3px solid transparent',
            '&:hover': {
              backgroundColor: isSelected
                ? 'rgba(138, 43, 226, 0.3)'
                : 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          {/* Room icon */}
          <Box
            sx={{
              color: isSelected ? '#8a2be2' : '#666',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {getRoomIcon(room.roomType)}
          </Box>

          {/* Room name */}
          <Typography
            sx={{
              flex: 1,
              fontSize: '0.85rem',
              fontWeight: isSelected ? 600 : 400,
              color: isSelected ? '#e0e0e0' : '#aaa',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {room.name}
          </Typography>

          {/* Unread badge */}
          {unreadCount > 0 && (
            <Badge
              badgeContent={unreadCount > 99 ? '99+' : unreadCount}
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#ff6b6b',
                  color: '#fff',
                  fontSize: '0.65rem',
                  height: 18,
                  minWidth: 18,
                },
              }}
            />
          )}

          {/* User count */}
          {room.userCount !== undefined && (
            <Typography
              sx={{
                fontSize: '0.7rem',
                color: '#666',
              }}
            >
              ({room.userCount})
            </Typography>
          )}
        </Box>
      </Tooltip>
    );
  };

  const renderSection = (title: string, sectionRooms: ChatRoom[]) => {
    if (sectionRooms.length === 0) return null;

    return (
      <Box sx={{ mb: 2 }}>
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            px: 1.5,
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        {sectionRooms.map(renderRoomButton)}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: 200,
        minWidth: 200,
        borderRight: '1px solid rgba(138, 43, 226, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(15, 15, 25, 0.9)',
        overflowY: 'auto',
        py: 1,
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
      {/* Header */}
      <Box
        sx={{
          px: 1.5,
          pb: 1.5,
          mb: 1,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#8a2be2',
            letterSpacing: '0.5px',
          }}
        >
          💬 Chat Rooms
        </Typography>
      </Box>

      {/* Room sections */}
      {renderSection('Global', globalRooms)}
      {renderSection('Topics', topicRooms)}
      {renderSection('Direct Messages', dmRooms)}

      {/* Empty state */}
      {rooms.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            color: '#666',
            fontStyle: 'italic',
            fontSize: '0.8rem',
          }}
        >
          No rooms available
        </Box>
      )}
    </Box>
  );
};
