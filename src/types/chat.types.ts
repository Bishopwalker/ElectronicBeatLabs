/**
 * Chat System Types - AOL/AIM Style Real-Time Chat
 *
 * Type definitions for the EBL chat system including:
 * - User profiles (verified + anonymous)
 * - Chat rooms (global, topic, DM)
 * - Messages with sender styling
 * - WebSocket message protocols
 */

// ============================================================================
// Core Entity Types
// ============================================================================

/**
 * Chat user profile with AOL/AIM features.
 */
export interface ChatUser {
  id: string;
  nickname: string;
  isVerified: boolean;
  isAnonymous: boolean;
  avatarUrl?: string;
  chatColor: string;
  status: 'online' | 'away' | 'offline';
  awayMessage?: string;
  lastSeen?: string;
}

/**
 * Chat room configuration.
 */
export interface ChatRoom {
  id: string;
  name: string;
  roomType: 'global' | 'topic' | 'dm';
  slug: string;
  description?: string;
  maxUsers: number;
  userCount?: number;
  dmParticipantIds?: string;
}

/**
 * Chat message with preserved sender styling.
 */
export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'system' | 'emote';
  senderNickname: string;
  senderColor: string;
  senderIsVerified: boolean;
  createdAt: string;
}

// ============================================================================
// WebSocket Message Types
// ============================================================================

/**
 * Base WebSocket message structure.
 */
export interface ChatWebSocketMessage {
  type: string;
  data?: Record<string, unknown>;
  timestamp?: string;
}

// Client -> Server Messages

export interface ChatAuthMessage extends ChatWebSocketMessage {
  type: 'chat_auth';
  data: {
    token?: string;
    nickname: string;
    color?: string;
  };
}

export interface JoinRoomMessage extends ChatWebSocketMessage {
  type: 'join_room';
  data: { room_id: string };
}

export interface LeaveRoomMessage extends ChatWebSocketMessage {
  type: 'leave_room';
  data: { room_id: string };
}

export interface SendMessageMessage extends ChatWebSocketMessage {
  type: 'send_message';
  data: { room_id: string; content: string };
}

export interface TypingMessage extends ChatWebSocketMessage {
  type: 'typing_start' | 'typing_stop';
  data: { room_id: string };
}

export interface SetAwayMessage extends ChatWebSocketMessage {
  type: 'set_away';
  data: { message?: string };
}

export interface CreateDMMessage extends ChatWebSocketMessage {
  type: 'create_dm';
  data: { target_user_id: string };
}

// Server -> Client Messages

export interface AuthSuccessMessage extends ChatWebSocketMessage {
  type: 'chat_auth_success';
  data: {
    user: ChatUser;
    rooms: ChatRoom[];
  };
}

export interface RoomJoinedMessage extends ChatWebSocketMessage {
  type: 'room_joined';
  data: {
    room: ChatRoom;
    users: ChatUser[];
    recentMessages: ChatMessage[];
  };
}

export interface UserJoinedMessage extends ChatWebSocketMessage {
  type: 'user_joined';
  data: {
    roomId: string;
    user: ChatUser;
  };
}

export interface UserLeftMessage extends ChatWebSocketMessage {
  type: 'user_left';
  data: {
    roomId: string;
    userId: string;
    nickname: string;
  };
}

export interface NewMessageMessage extends ChatWebSocketMessage {
  type: 'new_message';
  data: ChatMessage;
}

export interface UserTypingMessage extends ChatWebSocketMessage {
  type: 'user_typing' | 'user_stopped_typing';
  data: {
    roomId: string;
    userId: string;
    nickname: string;
  };
}

export interface UserStatusMessage extends ChatWebSocketMessage {
  type: 'user_status_changed';
  data: {
    userId: string;
    status: 'online' | 'away' | 'offline';
    awayMessage?: string;
  };
}

export interface RoomListMessage extends ChatWebSocketMessage {
  type: 'room_list';
  data: { rooms: ChatRoom[] };
}

export interface UsersListMessage extends ChatWebSocketMessage {
  type: 'users_list';
  data: {
    roomId: string;
    users: ChatUser[];
  };
}

export interface MessageHistoryMessage extends ChatWebSocketMessage {
  type: 'message_history';
  data: {
    roomId: string;
    messages: ChatMessage[];
  };
}

export interface ChatErrorMessage extends ChatWebSocketMessage {
  type: 'chat_error';
  data: {
    code: string;
    message: string;
  };
}

// ============================================================================
// Context Type
// ============================================================================

/**
 * Chat context state and actions.
 */
export interface ChatContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;

  // User state
  currentUser: ChatUser | null;

  // Room state
  currentRoom: ChatRoom | null;
  rooms: ChatRoom[];

  // Per-room state (Map for efficiency)
  messages: Map<string, ChatMessage[]>;
  users: Map<string, ChatUser[]>;
  typingUsers: Map<string, string[]>;
  unreadCounts: Map<string, number>;

  // Unread actions
  markRoomAsRead: (roomId: string) => void;

  // Connection actions
  connect: () => void;
  disconnect: () => void;

  // Auth actions
  authenticate: (token?: string, nickname?: string, color?: string) => void;

  // Room actions
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  setCurrentRoom: (room: ChatRoom | null) => void;

  // Message actions
  sendMessage: (roomId: string, content: string) => void;
  getHistory: (roomId: string) => void;

  // Status actions
  setTyping: (roomId: string, isTyping: boolean) => void;
  setAway: (message?: string) => void;
  setOnline: () => void;

  // Profile actions
  updateProfile: (updates: Partial<Pick<ChatUser, 'nickname' | 'chatColor' | 'avatarUrl'>>) => void;

  // DM actions
  createDM: (targetUserId: string) => void;
}

// ============================================================================
// Sound Settings
// ============================================================================

export interface ChatSoundSettings {
  doorSoundsEnabled: boolean;
  messageSoundsEnabled: boolean;
  volume: number;
}
