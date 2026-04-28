/**
 * Chat Hooks Package - AOL/AIM Style Real-Time Chat
 *
 * Modular hooks for the EBL chat system:
 * - useChatContext: Main context provider
 * - useChatConnection: WebSocket connection logic
 * - useChatSounds: Door/message sounds
 * - useTypingIndicator: Typing debounce
 * - useChatCommands: Slash command parser
 */

export { ChatProvider, useChatContext } from './useChatContext';
export { useChatConnection } from './useChatConnection';
export { useChatSounds } from './useChatSounds';
export { useTypingIndicator } from './useTypingIndicator';
export { useChatCommands } from './useChatCommands';
export type { CommandResult, ChatCommandsOptions } from './useChatCommands';
