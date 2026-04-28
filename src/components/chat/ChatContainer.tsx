/**
 * ChatContainer Component - Main Chat Wrapper
 *
 * Combines all chat components into the main AOL/AIM-style interface.
 */

import React, { useState, useCallback } from 'react';
import { Box, Paper, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';
import { ChatHeader } from './ChatHeader';
import { ChatRoomSelector } from './ChatRoomSelector';
import { ChatUserList } from './ChatUserList';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { ChatTypingIndicator } from './ChatTypingIndicator';
import { ChatAuthForm } from './ChatAuthForm';
import { ChatUserProfileModal } from './ChatUserProfileModal';
import { useChatContext } from '../../hooks/chat';
import type { ChatUser, ChatMessage } from '../../types/chat.types';

interface ChatContainerProps {
  height?: string | number;
  onOpenSettings?: () => void;
}

/**
 * Main chat container with AOL/AIM styling.
 */
export const ChatContainer: React.FC<ChatContainerProps> = ({
  height = '600px',
  onOpenSettings,
}) => {
  const {
    isConnected,
    isConnecting,
    currentUser,
    rooms,
    currentRoom,
    messages,
    users: roomUsers,
    typingUsers,
    unreadCounts,
    authenticate,
    joinRoom,
    leaveRoom,
    sendMessage,
    setTyping,
    setAway,
    setOnline,
    updateProfile,
    createDM,
  } = useChatContext();

  // Sound settings are managed locally
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [showUserList, setShowUserList] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({ open: false, message: '', severity: 'info' });

  // Local message overrides for /clear and system messages
  const [localMessages, setLocalMessages] = useState<Map<string, ChatMessage[]>>(new Map());

  // User profile modal state
  const [profileModalUser, setProfileModalUser] = useState<ChatUser | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Derived state - user is authenticated if we have a currentUser
  const isAuthenticated = !!currentUser;
  const currentRoomId = currentRoom?.id || null;

  // Get current room data
  const currentMessages = currentRoomId
    ? messages.get(currentRoomId) || []
    : [];
  const currentUsers = currentRoomId
    ? roomUsers.get(currentRoomId) || []
    : [];
  const currentTyping = currentRoomId
    ? typingUsers.get(currentRoomId) || []
    : [];

  // Get typing user names
  const typingUserNames = currentTyping
    .filter((id) => id !== currentUser?.id)
    .map((id) => {
      const user = currentUsers.find((u) => u.id === id);
      return user?.nickname || 'Someone';
    });

  // Handlers
  const handleSelectRoom = useCallback(
    (roomId: string) => {
      if (currentRoomId && currentRoomId !== roomId) {
        leaveRoom(currentRoomId);
      }
      joinRoom(roomId);
    },
    [currentRoomId, joinRoom, leaveRoom]
  );

  const handleSendMessage = useCallback(
    (content: string, isEmote?: boolean) => {
      if (currentRoomId) {
        // For emotes, prefix with /me for backend to handle
        const messageContent = isEmote ? `/me ${content}` : content;
        sendMessage(currentRoomId, messageContent);
      }
    },
    [currentRoomId, sendMessage]
  );

  // Handle slash commands
  const handleCommand = useCallback(
    (command: string, args: string) => {
      switch (command) {
        case 'away': {
          setAway(args || 'Away');
          setSnackbar({
            open: true,
            message: `Status set to away${args ? `: ${args}` : ''}`,
            severity: 'info',
          });
          break;
        }

        case 'back':
        case 'online': {
          setOnline();
          setSnackbar({
            open: true,
            message: 'Welcome back! Status set to online.',
            severity: 'success',
          });
          break;
        }

        case 'nick':
        case 'nickname': {
          if (args) {
            updateProfile({ nickname: args });
            setSnackbar({
              open: true,
              message: `Nickname changed to ${args}`,
              severity: 'success',
            });
          } else {
            setSnackbar({
              open: true,
              message: 'Usage: /nick <nickname>',
              severity: 'warning',
            });
          }
          break;
        }

        case 'color': {
          if (args) {
            const color = args.startsWith('#') ? args : `#${args}`;
            updateProfile({ chatColor: color });
            setSnackbar({
              open: true,
              message: `Name color changed to ${color}`,
              severity: 'success',
            });
          } else {
            setSnackbar({
              open: true,
              message: 'Usage: /color <hex> (e.g., /color #FF6B6B)',
              severity: 'warning',
            });
          }
          break;
        }

        case 'clear': {
          if (currentRoomId) {
            setLocalMessages((prev) => new Map(prev).set(currentRoomId, []));
            setSnackbar({
              open: true,
              message: 'Chat cleared locally',
              severity: 'info',
            });
          }
          break;
        }

        case 'users':
        case 'who': {
          const userList = currentUsers.map((u) => u.nickname).join(', ');
          setSnackbar({
            open: true,
            message: `Users in room: ${userList || 'None'}`,
            severity: 'info',
          });
          break;
        }

        case 'dm':
        case 'msg':
        case 'whisper': {
          if (args) {
            // Find user by nickname
            const targetUser = currentUsers.find(
              (u) => u.nickname.toLowerCase() === args.toLowerCase()
            );
            if (targetUser) {
              createDM(targetUser.id);
              setSnackbar({
                open: true,
                message: `Starting DM with ${targetUser.nickname}...`,
                severity: 'info',
              });
            } else {
              setSnackbar({
                open: true,
                message: `User "${args}" not found in this room`,
                severity: 'warning',
              });
            }
          } else {
            setSnackbar({
              open: true,
              message: 'Usage: /dm <username>',
              severity: 'warning',
            });
          }
          break;
        }

        case 'help':
        case '?': {
          setSnackbar({
            open: true,
            message: 'Commands: /me, /away, /back, /nick, /color, /clear, /users, /dm, /help',
            severity: 'info',
          });
          break;
        }

        default: {
          setSnackbar({
            open: true,
            message: `Unknown command: /${command}. Type /help for available commands.`,
            severity: 'error',
          });
        }
      }
    },
    [currentRoomId, currentUsers, setAway, setOnline, updateProfile, createDM]
  );

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const handleTyping = useCallback(() => {
    if (currentRoomId) {
      setTyping(currentRoomId, true);
    }
  }, [currentRoomId, setTyping]);

  const handleStopTyping = useCallback(() => {
    if (currentRoomId) {
      setTyping(currentRoomId, false);
    }
  }, [currentRoomId, setTyping]);

  const handleToggleSounds = useCallback(() => {
    setSoundsEnabled(!soundsEnabled);
  }, [soundsEnabled, setSoundsEnabled]);

  const handleUserClick = useCallback(
    (user: ChatUser) => {
      // Open profile modal for clicked user
      setProfileModalUser(user);
      setProfileModalOpen(true);
    },
    []
  );

  const handleCloseProfileModal = useCallback(() => {
    setProfileModalOpen(false);
    setProfileModalUser(null);
  }, []);

  const handleProfileStartDM = useCallback(
    (userId: string) => {
      createDM(userId);
    },
    [createDM]
  );

  const handleProfileUpdateProfile = useCallback(
    (updates: { nickname?: string; chatColor?: string }) => {
      updateProfile(updates);
      setSnackbar({
        open: true,
        message: 'Profile updated!',
        severity: 'success',
      });
    },
    [updateProfile]
  );

  const handleAuthenticate = useCallback(
    (nickname: string, color: string) => {
      authenticate(undefined, nickname, color);
    },
    [authenticate]
  );

  // Loading state
  if (!isConnected) {
    return (
      <Paper
        elevation={8}
        sx={{
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(20, 20, 30, 0.95)',
          border: '2px solid rgba(138, 43, 226, 0.5)',
          borderRadius: 2,
        }}
      >
        <CircularProgress
          size={40}
          sx={{ color: '#8a2be2', mb: 2 }}
        />
        <Typography sx={{ color: '#888' }}>
          Connecting to chat...
        </Typography>
      </Paper>
    );
  }

  // Not authenticated state - show auth form
  if (!isAuthenticated) {
    return (
      <Paper
        elevation={8}
        sx={{
          height,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(20, 20, 30, 0.95)',
          border: '2px solid rgba(138, 43, 226, 0.5)',
          borderRadius: 2,
        }}
      >
        <ChatAuthForm
          onAuthenticate={handleAuthenticate}
          isConnecting={isConnecting}
        />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={8}
      sx={{
        height,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(20, 20, 30, 0.95)',
        border: '2px solid rgba(138, 43, 226, 0.5)',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <ChatHeader
        room={currentRoom}
        userCount={currentUsers.length}
        maxUsers={currentRoom?.maxUsers || 50}
        soundsEnabled={soundsEnabled}
        onToggleSounds={handleToggleSounds}
        onOpenSettings={onOpenSettings}
      />

      {/* Main content area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Room selector */}
        <ChatRoomSelector
          rooms={rooms}
          currentRoomId={currentRoomId}
          unreadCounts={unreadCounts}
          onSelectRoom={handleSelectRoom}
        />

        {/* Chat area */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {currentRoom ? (
            <>
              {/* Messages */}
              <ChatMessageList
                messages={currentMessages}
                currentUserId={currentUser?.id}
              />

              {/* Typing indicator */}
              {typingUserNames.length > 0 && (
                <Box sx={{ px: 1 }}>
                  <ChatTypingIndicator typingUserNames={typingUserNames} />
                </Box>
              )}

              {/* Input */}
              <ChatInput
                onSendMessage={handleSendMessage}
                onCommand={handleCommand}
                onTyping={handleTyping}
                onStopTyping={handleStopTyping}
                disabled={!currentRoomId}
              />
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Typography
                sx={{
                  color: '#666',
                  fontSize: '1.2rem',
                }}
              >
                👋 Welcome to EBL Chat!
              </Typography>
              <Typography
                sx={{
                  color: '#888',
                  fontSize: '0.9rem',
                }}
              >
                Select a room from the left to start chatting
              </Typography>
            </Box>
          )}
        </Box>

        {/* User list */}
        {showUserList && currentRoom && (
          <ChatUserList
            users={currentUsers}
            onUserClick={handleUserClick}
            maxUsers={currentRoom.maxUsers}
          />
        )}
      </Box>

      {/* User profile modal */}
      <ChatUserProfileModal
        open={profileModalOpen}
        onClose={handleCloseProfileModal}
        user={profileModalUser}
        isOwnProfile={profileModalUser?.id === currentUser?.id}
        onStartDM={handleProfileStartDM}
        onUpdateProfile={handleProfileUpdateProfile}
      />

      {/* Command feedback snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            backgroundColor:
              snackbar.severity === 'success'
                ? 'rgba(0, 255, 136, 0.15)'
                : snackbar.severity === 'error'
                ? 'rgba(255, 107, 107, 0.15)'
                : snackbar.severity === 'warning'
                ? 'rgba(255, 193, 7, 0.15)'
                : 'rgba(138, 43, 226, 0.15)',
            color: '#e0e0e0',
            border: `1px solid ${
              snackbar.severity === 'success'
                ? 'rgba(0, 255, 136, 0.5)'
                : snackbar.severity === 'error'
                ? 'rgba(255, 107, 107, 0.5)'
                : snackbar.severity === 'warning'
                ? 'rgba(255, 193, 7, 0.5)'
                : 'rgba(138, 43, 226, 0.5)'
            }`,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};
