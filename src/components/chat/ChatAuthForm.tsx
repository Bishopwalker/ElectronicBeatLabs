/**
 * ChatAuthForm Component - Anonymous User Authentication
 *
 * AOL/AIM-style nickname input form for anonymous users to join chat.
 */

import React, { useState, useCallback, KeyboardEvent } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Tooltip,
  IconButton,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ShuffleIcon from '@mui/icons-material/Shuffle';

// Predefined color palette for easy selection
const COLOR_PALETTE = [
  '#FF6B6B', // Red
  '#FF8E53', // Orange
  '#FFC107', // Gold
  '#00FF88', // Green
  '#4ECDC4', // Teal
  '#45B7D1', // Sky Blue
  '#8A2BE2', // Purple
  '#FF69B4', // Pink
  '#FFFFFF', // White
  '#E0E0E0', // Light Gray
];

// Fun random nickname generators
const ADJECTIVES = [
  'Cosmic', 'Quantum', 'Astral', 'Lucid', 'Mystic', 'Neural', 'Ethereal',
  'Zen', 'Focus', 'Dream', 'Theta', 'Alpha', 'Gamma', 'Delta', 'Sigma',
  'Swift', 'Silent', 'Bright', 'Calm', 'Deep', 'Wild', 'Free', 'Cool',
];

const NOUNS = [
  'Dreamer', 'Voyager', 'Explorer', 'Seeker', 'Wanderer', 'Navigator',
  'Traveler', 'Pioneer', 'Viewer', 'Mind', 'Spirit', 'Soul', 'Wave',
  'Phoenix', 'Tiger', 'Dragon', 'Wolf', 'Hawk', 'Owl', 'Bear', 'Fox',
];

interface ChatAuthFormProps {
  onAuthenticate: (nickname: string, color: string) => void;
  isConnecting?: boolean;
}

/**
 * Generate a random nickname.
 */
const generateRandomNickname = (): string => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${noun}${num}`;
};

/**
 * AOL/AIM-style authentication form for anonymous users.
 */
export const ChatAuthForm: React.FC<ChatAuthFormProps> = ({
  onAuthenticate,
  isConnecting = false,
}) => {
  const [nickname, setNickname] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[6]); // Default purple
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(() => {
    const trimmedNickname = nickname.trim();

    // Validation
    if (!trimmedNickname) {
      setError('Please enter a nickname');
      return;
    }

    if (trimmedNickname.length < 2) {
      setError('Nickname must be at least 2 characters');
      return;
    }

    if (trimmedNickname.length > 20) {
      setError('Nickname must be 20 characters or less');
      return;
    }

    // Check for valid characters (alphanumeric, underscores, dashes)
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedNickname)) {
      setError('Only letters, numbers, underscores, and dashes allowed');
      return;
    }

    setError(null);
    onAuthenticate(trimmedNickname, selectedColor);
  }, [nickname, selectedColor, onAuthenticate]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleRandomNickname = useCallback(() => {
    setNickname(generateRandomNickname());
    setError(null);
  }, []);

  const handleColorSelect = useCallback((color: string) => {
    setSelectedColor(color);
    setShowColorPicker(false);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        p: 3,
      }}
    >
      {/* Title */}
      <Typography
        variant="h5"
        sx={{
          color: '#8a2be2',
          fontWeight: 600,
          mb: 1,
          textShadow: '0 0 10px rgba(138, 43, 226, 0.5)',
        }}
      >
        Welcome to EBL Chat
      </Typography>
      <Typography
        sx={{
          color: '#888',
          fontSize: '0.85rem',
          mb: 3,
          textAlign: 'center',
        }}
      >
        Enter a nickname to join the conversation
      </Typography>

      {/* Auth Form */}
      <Paper
        elevation={4}
        sx={{
          p: 3,
          backgroundColor: 'rgba(30, 30, 40, 0.95)',
          border: '1px solid rgba(138, 43, 226, 0.4)',
          borderRadius: 2,
          width: '100%',
          maxWidth: 320,
        }}
      >
        {/* Nickname Input */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PersonIcon sx={{ color: '#8a2be2', fontSize: 18 }} />
            <Typography sx={{ color: '#aaa', fontSize: '0.8rem' }}>
              Nickname
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="YourNickname"
              disabled={isConnecting}
              error={!!error}
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  color: selectedColor,
                  fontWeight: 500,
                  '& fieldset': {
                    borderColor: error
                      ? '#ff6b6b'
                      : 'rgba(138, 43, 226, 0.4)',
                  },
                  '&:hover fieldset': {
                    borderColor: error
                      ? '#ff6b6b'
                      : 'rgba(138, 43, 226, 0.6)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: error ? '#ff6b6b' : '#8a2be2',
                  },
                },
                '& .MuiOutlinedInput-input::placeholder': {
                  color: '#555',
                  opacity: 1,
                },
              }}
            />
            <Tooltip title="Random nickname">
              <IconButton
                onClick={handleRandomNickname}
                disabled={isConnecting}
                size="small"
                sx={{
                  color: '#8a2be2',
                  border: '1px solid rgba(138, 43, 226, 0.4)',
                  '&:hover': {
                    backgroundColor: 'rgba(138, 43, 226, 0.1)',
                  },
                }}
              >
                <ShuffleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          {error && (
            <Typography
              sx={{
                color: '#ff6b6b',
                fontSize: '0.75rem',
                mt: 0.5,
                ml: 0.5,
              }}
            >
              {error}
            </Typography>
          )}
        </Box>

        {/* Color Selector */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ColorLensIcon sx={{ color: '#8a2be2', fontSize: 18 }} />
            <Typography sx={{ color: '#aaa', fontSize: '0.8rem' }}>
              Name Color
            </Typography>
          </Box>

          {/* Color Preview Button */}
          <Button
            onClick={() => setShowColorPicker(!showColorPicker)}
            disabled={isConnecting}
            sx={{
              width: '100%',
              height: 36,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(138, 43, 226, 0.4)',
              justifyContent: 'flex-start',
              px: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(138, 43, 226, 0.6)',
              },
            }}
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: selectedColor,
                mr: 1.5,
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            />
            <Typography
              sx={{
                color: selectedColor,
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              {nickname || 'Preview'}
            </Typography>
          </Button>

          {/* Color Picker Grid */}
          {showColorPicker && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5,
                mt: 1,
                p: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 1,
                border: '1px solid rgba(138, 43, 226, 0.3)',
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
                        selectedColor === color
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
          )}
        </Box>

        {/* Join Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={isConnecting || !nickname.trim()}
          sx={{
            backgroundColor: '#8a2be2',
            color: '#fff',
            fontWeight: 600,
            py: 1,
            '&:hover': {
              backgroundColor: '#9932CC',
            },
            '&:disabled': {
              backgroundColor: 'rgba(138, 43, 226, 0.3)',
              color: '#666',
            },
          }}
        >
          {isConnecting ? 'Joining...' : 'Join Chat'}
        </Button>
      </Paper>

      {/* Footer Text */}
      <Typography
        sx={{
          color: '#555',
          fontSize: '0.7rem',
          mt: 2,
          textAlign: 'center',
        }}
      >
        Connect with fellow explorers of consciousness
      </Typography>
    </Box>
  );
};
