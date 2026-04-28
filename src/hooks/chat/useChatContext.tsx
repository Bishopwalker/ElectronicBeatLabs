/**
 * Chat Context Provider - Main Chat State Management
 *
 * Provides chat state and actions to the entire application.
 * Uses modular hooks for connection, sounds, and typing.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import type {
  ChatContextType,
  ChatUser,
  ChatRoom,
  ChatMessage,
  ChatWebSocketMessage,
} from '../../types/chat.types';
import { useChatConnection } from './useChatConnection';
import { useChatSounds } from './useChatSounds';

// Create context with null default
const ChatContext = createContext<ChatContextType | null>(null);

interface ChatProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
}

/**
 * Chat context provider component.
 *
 * Wrap your app or chat section with this provider to access chat functionality.
 */
export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  autoConnect = false,
}) => {
  // User state
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);

  // Room state
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);

  // Per-room state using Maps for efficiency
  const [messages, setMessages] = useState<Map<string, ChatMessage[]>>(new Map());
  const [users, setUsers] = useState<Map<string, ChatUser[]>>(new Map());
  const [typingUsers, setTypingUsers] = useState<Map<string, string[]>>(new Map());
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(new Map());

  // Sound effects
  const { playDoorOpen, playDoorClose, playMessageSound } = useChatSounds();

  /**
   * Handle incoming WebSocket messages.
   */
  const handleMessage = useCallback(
    (message: ChatWebSocketMessage) => {
      const { type, data } = message;

      switch (type) {
        case 'chat_auth_success': {
          const authData = data as { user: ChatUser; rooms: ChatRoom[] };
          setCurrentUser(authData.user);
          setRooms(authData.rooms);
          break;
        }

        case 'room_joined': {
          const joinData = data as {
            room: ChatRoom;
            users: ChatUser[];
            recentMessages: ChatMessage[];
          };
          setCurrentRoom(joinData.room);
          setUsers((prev) => new Map(prev).set(joinData.room.id, joinData.users));
          setMessages((prev) =>
            new Map(prev).set(joinData.room.id, joinData.recentMessages)
          );
          // Clear unread count for this room
          setUnreadCounts((prev) => {
            const newMap = new Map(prev);
            newMap.delete(joinData.room.id);
            return newMap;
          });
          break;
        }

        case 'room_left': {
          const leftData = data as { roomId: string };
          if (currentRoom?.id === leftData.roomId) {
            setCurrentRoom(null);
          }
          break;
        }

        case 'user_joined': {
          const userJoinData = data as { roomId: string; user: ChatUser };
          setUsers((prev) => {
            const roomUsers = prev.get(userJoinData.roomId) || [];
            // Avoid duplicates
            if (roomUsers.some((u) => u.id === userJoinData.user.id)) {
              return prev;
            }
            return new Map(prev).set(userJoinData.roomId, [
              ...roomUsers,
              userJoinData.user,
            ]);
          });
          // Play door open sound
          playDoorOpen();
          break;
        }

        case 'user_left': {
          const userLeftData = data as {
            roomId: string;
            userId: string;
            nickname: string;
          };
          setUsers((prev) => {
            const roomUsers = prev.get(userLeftData.roomId) || [];
            return new Map(prev).set(
              userLeftData.roomId,
              roomUsers.filter((u) => u.id !== userLeftData.userId)
            );
          });
          // Remove from typing users
          setTypingUsers((prev) => {
            const typing = prev.get(userLeftData.roomId) || [];
            return new Map(prev).set(
              userLeftData.roomId,
              typing.filter((id) => id !== userLeftData.userId)
            );
          });
          // Play door close sound
          playDoorClose();
          break;
        }

        case 'new_message': {
          const msgData = data as ChatMessage;
          setMessages((prev) => {
            const roomMessages = prev.get(msgData.roomId) || [];
            // Limit to 100 messages in memory
            const newMessages = [...roomMessages, msgData].slice(-100);
            return new Map(prev).set(msgData.roomId, newMessages);
          });
          // Play message sound if not from current user
          if (msgData.senderId !== currentUser?.id) {
            playMessageSound();
            // Increment unread count if message is not in current room
            if (msgData.roomId !== currentRoom?.id) {
              setUnreadCounts((prev) => {
                const count = prev.get(msgData.roomId) || 0;
                return new Map(prev).set(msgData.roomId, count + 1);
              });
            }
          }
          break;
        }

        case 'user_typing': {
          const typingData = data as {
            roomId: string;
            userId: string;
            nickname: string;
          };
          setTypingUsers((prev) => {
            const typing = prev.get(typingData.roomId) || [];
            if (typing.includes(typingData.userId)) return prev;
            return new Map(prev).set(typingData.roomId, [
              ...typing,
              typingData.userId,
            ]);
          });
          break;
        }

        case 'user_stopped_typing': {
          const stopTypingData = data as { roomId: string; userId: string };
          setTypingUsers((prev) => {
            const typing = prev.get(stopTypingData.roomId) || [];
            return new Map(prev).set(
              stopTypingData.roomId,
              typing.filter((id) => id !== stopTypingData.userId)
            );
          });
          break;
        }

        case 'user_status_changed': {
          const statusData = data as {
            userId: string;
            status: 'online' | 'away' | 'offline';
            awayMessage?: string;
          };
          // Update user status in all rooms
          setUsers((prev) => {
            const newMap = new Map(prev);
            newMap.forEach((roomUsers, roomId) => {
              const updated = roomUsers.map((u) =>
                u.id === statusData.userId
                  ? { ...u, status: statusData.status, awayMessage: statusData.awayMessage }
                  : u
              );
              newMap.set(roomId, updated);
            });
            return newMap;
          });
          break;
        }

        case 'room_list': {
          const roomListData = data as { rooms: ChatRoom[] };
          setRooms(roomListData.rooms);
          break;
        }

        case 'users_list': {
          const usersListData = data as { roomId: string; users: ChatUser[] };
          setUsers((prev) =>
            new Map(prev).set(usersListData.roomId, usersListData.users)
          );
          break;
        }

        case 'message_history': {
          const historyData = data as {
            roomId: string;
            messages: ChatMessage[];
          };
          setMessages((prev) =>
            new Map(prev).set(historyData.roomId, historyData.messages)
          );
          break;
        }

        case 'chat_error': {
          const errorData = data as { code: string; message: string };
          console.error(`Chat error [${errorData.code}]: ${errorData.message}`);
          break;
        }

        case 'dm_created': {
          const dmData = data as { room: ChatRoom };
          setRooms((prev) => [...prev, dmData.room]);
          break;
        }

        case 'profile_updated': {
          const profileData = data as { user: ChatUser };
          setCurrentUser(profileData.user);
          break;
        }

        case 'status_updated': {
          const statusUpdateData = data as {
            status: 'online' | 'away' | 'offline';
            awayMessage?: string;
          };
          setCurrentUser((prev) =>
            prev
              ? {
                  ...prev,
                  status: statusUpdateData.status,
                  awayMessage: statusUpdateData.awayMessage,
                }
              : null
          );
          break;
        }

        default:
          console.log('Unhandled chat message type:', type);
      }
    },
    [currentUser?.id, currentRoom?.id, playDoorOpen, playDoorClose, playMessageSound]
  );

  // WebSocket connection
  const {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendMessage: sendWsMessage,
  } = useChatConnection({
    onMessage: handleMessage,
    autoConnect,
  });

  // ============================================================================
  // Actions
  // ============================================================================

  const authenticate = useCallback(
    (token?: string, nickname?: string, color?: string) => {
      sendWsMessage({
        type: 'chat_auth',
        data: {
          token,
          nickname: nickname || `User-${Date.now().toString(36)}`,
          color: color || '#FFFFFF',
        },
      });
    },
    [sendWsMessage]
  );

  const joinRoom = useCallback(
    (roomId: string) => {
      sendWsMessage({
        type: 'join_room',
        data: { room_id: roomId },
      });
    },
    [sendWsMessage]
  );

  const leaveRoom = useCallback(
    (roomId: string) => {
      sendWsMessage({
        type: 'leave_room',
        data: { room_id: roomId },
      });
    },
    [sendWsMessage]
  );

  const sendMessage = useCallback(
    (roomId: string, content: string) => {
      if (!content.trim()) return;
      sendWsMessage({
        type: 'send_message',
        data: { room_id: roomId, content: content.trim() },
      });
    },
    [sendWsMessage]
  );

  const setTyping = useCallback(
    (roomId: string, isTyping: boolean) => {
      sendWsMessage({
        type: isTyping ? 'typing_start' : 'typing_stop',
        data: { room_id: roomId },
      });
    },
    [sendWsMessage]
  );

  const setAway = useCallback(
    (message?: string) => {
      sendWsMessage({
        type: 'set_away',
        data: { message },
      });
    },
    [sendWsMessage]
  );

  const setOnline = useCallback(() => {
    sendWsMessage({
      type: 'set_online',
      data: {},
    });
  }, [sendWsMessage]);

  const getHistory = useCallback(
    (roomId: string) => {
      sendWsMessage({
        type: 'get_history',
        data: { room_id: roomId },
      });
    },
    [sendWsMessage]
  );

  const updateProfile = useCallback(
    (updates: Partial<Pick<ChatUser, 'nickname' | 'chatColor' | 'avatarUrl'>>) => {
      sendWsMessage({
        type: 'update_profile',
        data: {
          nickname: updates.nickname,
          color: updates.chatColor,
          avatarUrl: updates.avatarUrl,
        },
      });
    },
    [sendWsMessage]
  );

  const createDM = useCallback(
    (targetUserId: string) => {
      sendWsMessage({
        type: 'create_dm',
        data: { target_user_id: targetUserId },
      });
    },
    [sendWsMessage]
  );

  const markRoomAsRead = useCallback((roomId: string) => {
    setUnreadCounts((prev) => {
      const newMap = new Map(prev);
      newMap.delete(roomId);
      return newMap;
    });
  }, []);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: ChatContextType = useMemo(
    () => ({
      // Connection state
      isConnected,
      isConnecting,
      error,

      // User state
      currentUser,

      // Room state
      currentRoom,
      rooms,

      // Per-room state
      messages,
      users,
      typingUsers,
      unreadCounts,

      // Unread actions
      markRoomAsRead,

      // Connection actions
      connect,
      disconnect,

      // Auth actions
      authenticate,

      // Room actions
      joinRoom,
      leaveRoom,
      setCurrentRoom,

      // Message actions
      sendMessage,
      getHistory,

      // Status actions
      setTyping,
      setAway,
      setOnline,

      // Profile actions
      updateProfile,

      // DM actions
      createDM,
    }),
    [
      isConnected,
      isConnecting,
      error,
      currentUser,
      currentRoom,
      rooms,
      messages,
      users,
      typingUsers,
      unreadCounts,
      markRoomAsRead,
      connect,
      disconnect,
      authenticate,
      joinRoom,
      leaveRoom,
      sendMessage,
      getHistory,
      setTyping,
      setAway,
      setOnline,
      updateProfile,
      createDM,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

/**
 * Hook to access chat context.
 *
 * @throws Error if used outside ChatProvider
 * @returns Chat context value
 */
export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
