/**
 * ChatInput Component - Message Input with Commands
 *
 * Text input for sending messages with:
 * - Typing indicator support
 * - Slash command parsing
 * - Command autocomplete
 */

import React, { useState, useCallback, KeyboardEvent, useMemo } from 'react';
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Popper,
  ClickAwayListener,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

// Command definitions for autocomplete
const COMMANDS = [
  { cmd: '/me', desc: 'Perform an action', example: '/me waves hello' },
  { cmd: '/away', desc: 'Set away status', example: '/away grabbing coffee' },
  { cmd: '/back', desc: 'Return from away', example: '/back' },
  { cmd: '/nick', desc: 'Change nickname', example: '/nick NewName' },
  { cmd: '/color', desc: 'Change name color', example: '/color #FF6B6B' },
  { cmd: '/clear', desc: 'Clear chat (local)', example: '/clear' },
  { cmd: '/users', desc: 'List room users', example: '/users' },
  { cmd: '/dm', desc: 'Direct message user', example: '/dm username' },
  { cmd: '/help', desc: 'Show commands', example: '/help' },
];

interface ChatInputProps {
  onSendMessage: (content: string, isEmote?: boolean) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  onCommand?: (command: string, args: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Chat message input with send button and command support.
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onTyping,
  onStopTyping,
  onCommand,
  disabled = false,
  placeholder = 'Type a message... (/ for commands)',
}) => {
  const [message, setMessage] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Filter commands based on input
  const filteredCommands = useMemo(() => {
    if (!message.startsWith('/')) return [];
    const partial = message.slice(1).toLowerCase();
    return COMMANDS.filter((c) =>
      c.cmd.slice(1).startsWith(partial) && partial.length < c.cmd.length - 1
    );
  }, [message]);

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed) return;

    // Check if it's a command
    if (trimmed.startsWith('/')) {
      const parts = trimmed.slice(1).split(/\s+/);
      const cmd = parts[0]?.toLowerCase();
      const args = parts.slice(1).join(' ');

      // Handle /me specially - it sends an emote message
      if (cmd === 'me' && args) {
        onSendMessage(args, true);
      } else {
        // Let the container handle the command
        onCommand?.(cmd, args);
      }
    } else {
      // Regular message
      onSendMessage(trimmed, false);
    }

    setMessage('');
    setShowCommands(false);
    onStopTyping?.();
  }, [message, onSendMessage, onCommand, onStopTyping]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      // Handle command autocomplete navigation
      if (showCommands && filteredCommands.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          return;
        }
        if (e.key === 'Tab' || (e.key === 'Enter' && filteredCommands.length > 0)) {
          e.preventDefault();
          const selected = filteredCommands[selectedIndex];
          if (selected) {
            setMessage(selected.cmd + ' ');
            setShowCommands(false);
          }
          return;
        }
        if (e.key === 'Escape') {
          setShowCommands(false);
          return;
        }
      }

      // Send message on Enter (without Shift)
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend, showCommands, filteredCommands, selectedIndex]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setMessage(value);

      // Show command autocomplete
      if (value.startsWith('/') && value.length > 1) {
        setShowCommands(true);
        setSelectedIndex(0);
      } else if (value === '/') {
        setShowCommands(true);
        setSelectedIndex(0);
      } else {
        setShowCommands(false);
      }

      onTyping?.();
    },
    [onTyping]
  );

  const handleCommandSelect = useCallback((cmd: string) => {
    setMessage(cmd + ' ');
    setShowCommands(false);
  }, []);

  const handleClickAway = useCallback(() => {
    setShowCommands(false);
  }, []);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          gap: 1,
          p: 1,
          backgroundColor: 'rgba(15, 15, 25, 0.9)',
          borderTop: '1px solid rgba(138, 43, 226, 0.3)',
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          inputRef={(el) => setAnchorEl(el)}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              color: '#e0e0e0',
              fontSize: '0.9rem',
              '& fieldset': {
                borderColor: message.startsWith('/')
                  ? 'rgba(0, 255, 136, 0.4)'
                  : 'rgba(138, 43, 226, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: message.startsWith('/')
                  ? 'rgba(0, 255, 136, 0.6)'
                  : 'rgba(138, 43, 226, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: message.startsWith('/') ? '#00ff88' : '#8a2be2',
              },
            },
            '& .MuiOutlinedInput-input': {
              padding: '10px 14px',
            },
            '& .MuiOutlinedInput-input::placeholder': {
              color: '#666',
              opacity: 1,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleSend}
                  disabled={disabled || !message.trim()}
                  size="small"
                  sx={{
                    color: message.trim() ? '#8a2be2' : '#444',
                    '&:hover': {
                      color: '#00ff88',
                    },
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Command Autocomplete Dropdown */}
        <Popper
          open={showCommands && filteredCommands.length > 0}
          anchorEl={anchorEl}
          placement="top-start"
          sx={{ zIndex: 1300 }}
        >
          <Paper
            elevation={8}
            sx={{
              backgroundColor: 'rgba(25, 25, 35, 0.98)',
              border: '1px solid rgba(0, 255, 136, 0.4)',
              borderRadius: 1,
              maxHeight: 200,
              overflow: 'auto',
              minWidth: 280,
              mb: 0.5,
            }}
          >
            <List dense disablePadding>
              {filteredCommands.map((cmd, index) => (
                <ListItemButton
                  key={cmd.cmd}
                  selected={index === selectedIndex}
                  onClick={() => handleCommandSelect(cmd.cmd)}
                  sx={{
                    py: 0.5,
                    px: 1.5,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(0, 255, 136, 0.15)',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          sx={{
                            color: '#00ff88',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            fontFamily: 'monospace',
                          }}
                        >
                          {cmd.cmd}
                        </Typography>
                        <Typography
                          sx={{
                            color: '#888',
                            fontSize: '0.75rem',
                          }}
                        >
                          {cmd.desc}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography
                        sx={{
                          color: '#555',
                          fontSize: '0.7rem',
                          fontFamily: 'monospace',
                        }}
                      >
                        {cmd.example}
                      </Typography>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};
