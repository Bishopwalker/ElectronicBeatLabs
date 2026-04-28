/**
 * ChatHeader Component - Room Header Bar
 *
 * Displays current room name, user count, and room actions.
 */

import React from 'react';
import { Box, Typography, IconButton, Tooltip, Chip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import PeopleIcon from '@mui/icons-material/People';
import type { ChatRoom } from '../../types/chat.types';

interface ChatHeaderProps {
  room: ChatRoom | null;
  userCount: number;
  maxUsers: number;
  soundsEnabled: boolean;
  onToggleSounds: () => void;
  onOpenSettings?: () => void;
}

/**
 * Header bar for chat room display.
 */
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  room,
  userCount,
  maxUsers,
  soundsEnabled,
  onToggleSounds,
  onOpenSettings,
}) => {
  const getRoomTypeLabel = (type: string): string => {
    switch (type) {
      case 'global':
        return 'Global';
      case 'topic':
        return 'Topic';
      case 'dm':
        return 'DM';
      default:
        return type;
    }
  };

  const getRoomTypeColor = (type: string): string => {
    switch (type) {
      case 'global':
        return '#00ff88';
      case 'topic':
        return '#8a2be2';
      case 'dm':
        return '#ffc107';
      default:
        return '#888';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1.5,
        backgroundColor: 'rgba(15, 15, 25, 0.95)',
        borderBottom: '2px solid rgba(138, 43, 226, 0.5)',
        minHeight: 56,
      }}
    >
      {/* Left: Room info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {room ? (
          <>
            <Typography
              sx={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#e0e0e0',
                letterSpacing: '0.5px',
              }}
            >
              {room.name}
            </Typography>

            <Chip
              label={getRoomTypeLabel(room.roomType)}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 600,
                backgroundColor: 'transparent',
                border: `1px solid ${getRoomTypeColor(room.roomType)}`,
                color: getRoomTypeColor(room.roomType),
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            />
          </>
        ) : (
          <Typography
            sx={{
              fontSize: '1rem',
              color: '#888',
              fontStyle: 'italic',
            }}
          >
            Select a room to join
          </Typography>
        )}
      </Box>

      {/* Right: User count and actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* User count */}
        {room && (
          <Tooltip title={`${userCount} of ${maxUsers} users`}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                backgroundColor: 'rgba(138, 43, 226, 0.2)',
              }}
            >
              <PeopleIcon
                sx={{
                  fontSize: '1rem',
                  color: userCount >= maxUsers ? '#ff6b6b' : '#8a2be2',
                }}
              />
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: userCount >= maxUsers ? '#ff6b6b' : '#e0e0e0',
                }}
              >
                {userCount}/{maxUsers}
              </Typography>
            </Box>
          </Tooltip>
        )}

        {/* Sound toggle */}
        <Tooltip title={soundsEnabled ? 'Mute sounds' : 'Enable sounds'}>
          <IconButton
            onClick={onToggleSounds}
            size="small"
            sx={{
              color: soundsEnabled ? '#00ff88' : '#666',
              '&:hover': {
                backgroundColor: 'rgba(138, 43, 226, 0.2)',
              },
            }}
          >
            {soundsEnabled ? (
              <VolumeUpIcon fontSize="small" />
            ) : (
              <VolumeOffIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {/* Settings */}
        {onOpenSettings && (
          <Tooltip title="Chat settings">
            <IconButton
              onClick={onOpenSettings}
              size="small"
              sx={{
                color: '#888',
                '&:hover': {
                  color: '#8a2be2',
                  backgroundColor: 'rgba(138, 43, 226, 0.2)',
                },
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};
