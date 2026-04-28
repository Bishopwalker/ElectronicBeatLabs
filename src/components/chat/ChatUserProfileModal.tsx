/**
 * ChatUserProfileModal Component - User Profile View/Edit
 *
 * Modal for viewing user profiles and editing own profile.
 * Features:
 * - View any user's profile (nickname, status, avatar)
 * - Edit own profile (nickname, color, avatar)
 * - Start DM with other users
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  IconButton,
  Chip,
  Tooltip,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import ChatIcon from '@mui/icons-material/Chat';
import VerifiedIcon from '@mui/icons-material/Verified';
import PersonIcon from '@mui/icons-material/Person';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import type { ChatUser } from '../../types/chat.types';

// Color palette for profile customization
const COLOR_PALETTE = [
  '#FF6B6B', '#FF8E53', '#FFC107', '#00FF88', '#4ECDC4',
  '#45B7D1', '#8A2BE2', '#FF69B4', '#FFFFFF', '#E0E0E0',
];

interface ChatUserProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: ChatUser | null;
  isOwnProfile?: boolean;
  onStartDM?: (userId: string) => void;
  onUpdateProfile?: (updates: { nickname?: string; chatColor?: string }) => void;
}

/**
 * User profile modal with view/edit capabilities.
 */
export const ChatUserProfileModal: React.FC<ChatUserProfileModalProps> = ({
  open,
  onClose,
  user,
  isOwnProfile = false,
  onStartDM,
  onUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editColor, setEditColor] = useState('');
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  // Reset edit state when modal opens/closes or user changes
  useEffect(() => {
    if (open && user) {
      setEditNickname(user.nickname);
      setEditColor(user.chatColor);
      setIsEditing(false);
      setNicknameError(null);
    }
  }, [open, user]);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    if (user) {
      setEditNickname(user.nickname);
      setEditColor(user.chatColor);
    }
    setIsEditing(false);
    setNicknameError(null);
  }, [user]);

  const handleSaveProfile = useCallback(() => {
    // Validate nickname
    const trimmed = editNickname.trim();
    if (trimmed.length < 2) {
      setNicknameError('Nickname must be at least 2 characters');
      return;
    }
    if (trimmed.length > 20) {
      setNicknameError('Nickname must be 20 characters or less');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setNicknameError('Only letters, numbers, underscores, and dashes');
      return;
    }

    // Submit changes
    const updates: { nickname?: string; chatColor?: string } = {};
    if (trimmed !== user?.nickname) {
      updates.nickname = trimmed;
    }
    if (editColor !== user?.chatColor) {
      updates.chatColor = editColor;
    }

    if (Object.keys(updates).length > 0) {
      onUpdateProfile?.(updates);
    }

    setIsEditing(false);
    setNicknameError(null);
  }, [editNickname, editColor, user, onUpdateProfile]);

  const handleStartDM = useCallback(() => {
    if (user) {
      onStartDM?.(user.id);
      onClose();
    }
  }, [user, onStartDM, onClose]);

  const handleColorSelect = useCallback((color: string) => {
    setEditColor(color);
  }, []);

  if (!user) return null;

  const statusColor =
    user.status === 'online'
      ? '#00ff88'
      : user.status === 'away'
      ? '#ffc107'
      : '#666';

  const statusLabel =
    user.status === 'online'
      ? 'Online'
      : user.status === 'away'
      ? user.awayMessage || 'Away'
      : 'Offline';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(20, 20, 30, 0.98)',
          border: '2px solid rgba(138, 43, 226, 0.5)',
          borderRadius: 2,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(138, 43, 226, 0.1)',
          borderBottom: '1px solid rgba(138, 43, 226, 0.3)',
          py: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon sx={{ color: '#8a2be2' }} />
          <Typography sx={{ color: '#e0e0e0', fontWeight: 600 }}>
            {isOwnProfile ? 'Your Profile' : 'User Profile'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#888' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ pt: 3 }}>
        {/* Avatar & Name Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 3,
          }}
        >
          {/* Avatar */}
          <Avatar
            src={user.avatarUrl}
            sx={{
              width: 80,
              height: 80,
              bgcolor: isEditing ? editColor : user.chatColor,
              fontSize: '2rem',
              mb: 2,
              border: `3px solid ${statusColor}`,
            }}
          >
            {user.nickname.charAt(0).toUpperCase()}
          </Avatar>

          {/* Nickname */}
          {isEditing ? (
            <TextField
              value={editNickname}
              onChange={(e) => {
                setEditNickname(e.target.value);
                setNicknameError(null);
              }}
              size="small"
              error={!!nicknameError}
              helperText={nicknameError}
              sx={{
                width: 200,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  color: editColor,
                  fontWeight: 600,
                  textAlign: 'center',
                  '& fieldset': {
                    borderColor: nicknameError
                      ? '#ff6b6b'
                      : 'rgba(138, 43, 226, 0.4)',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  textAlign: 'center',
                },
              }}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                sx={{
                  color: user.chatColor,
                  fontWeight: 600,
                  fontSize: '1.25rem',
                }}
              >
                {user.nickname}
              </Typography>
              {user.isVerified && (
                <Tooltip title="Verified user">
                  <VerifiedIcon
                    sx={{ color: '#00ff88', fontSize: 18 }}
                  />
                </Tooltip>
              )}
            </Box>
          )}

          {/* Status */}
          <Chip
            label={statusLabel}
            size="small"
            sx={{
              mt: 1,
              backgroundColor: `${statusColor}20`,
              color: statusColor,
              border: `1px solid ${statusColor}50`,
              fontSize: '0.75rem',
            }}
          />
        </Box>

        {/* Color Picker (Edit Mode) */}
        {isEditing && (
          <>
            <Divider sx={{ borderColor: 'rgba(138, 43, 226, 0.2)', my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ColorLensIcon sx={{ color: '#8a2be2', fontSize: 18 }} />
                <Typography sx={{ color: '#aaa', fontSize: '0.8rem' }}>
                  Name Color
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.5,
                  p: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 1,
                }}
              >
                {COLOR_PALETTE.map((color) => (
                  <Tooltip key={color} title={color} placement="top">
                    <IconButton
                      onClick={() => handleColorSelect(color)}
                      sx={{
                        width: 28,
                        height: 28,
                        minWidth: 28,
                        backgroundColor: color,
                        border:
                          editColor === color
                            ? '2px solid #fff'
                            : '2px solid transparent',
                        '&:hover': {
                          backgroundColor: color,
                          transform: 'scale(1.1)',
                        },
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Box>
          </>
        )}

        {/* User Info */}
        {!isEditing && (
          <>
            <Divider sx={{ borderColor: 'rgba(138, 43, 226, 0.2)', my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>
                  Type
                </Typography>
                <Typography sx={{ color: '#aaa', fontSize: '0.8rem' }}>
                  {user.isVerified ? 'Verified Account' : 'Anonymous'}
                </Typography>
              </Box>
              {user.lastSeen && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>
                    Last Seen
                  </Typography>
                  <Typography sx={{ color: '#aaa', fontSize: '0.8rem' }}>
                    {new Date(user.lastSeen).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderTop: '1px solid rgba(138, 43, 226, 0.2)',
        }}
      >
        {isOwnProfile ? (
          isEditing ? (
            <>
              <Button
                onClick={handleCancelEdit}
                sx={{
                  color: '#888',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                variant="contained"
                sx={{
                  backgroundColor: '#8a2be2',
                  '&:hover': { backgroundColor: '#9932CC' },
                }}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              onClick={handleStartEdit}
              startIcon={<EditIcon />}
              sx={{
                color: '#8a2be2',
                border: '1px solid rgba(138, 43, 226, 0.5)',
                '&:hover': {
                  backgroundColor: 'rgba(138, 43, 226, 0.1)',
                },
              }}
            >
              Edit Profile
            </Button>
          )
        ) : (
          <Button
            onClick={handleStartDM}
            startIcon={<ChatIcon />}
            variant="contained"
            sx={{
              backgroundColor: '#8a2be2',
              '&:hover': { backgroundColor: '#9932CC' },
            }}
          >
            Send Message
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
