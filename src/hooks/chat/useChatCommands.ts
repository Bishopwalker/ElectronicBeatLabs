/**
 * Chat Commands Hook - Slash Command Parser
 *
 * Handles AOL/AIM-style slash commands:
 * - /me <action> - Emote/action message
 * - /away [message] - Set away status
 * - /back - Come back online
 * - /nick <nickname> - Change nickname
 * - /color <hex> - Change name color
 * - /clear - Clear chat history (local only)
 * - /help - Show available commands
 * - /users - List users in current room
 * - /dm <user> - Open DM with user
 */

import { useCallback, useMemo } from 'react';

export interface CommandResult {
  type: 'emote' | 'away' | 'back' | 'nick' | 'color' | 'clear' | 'help' | 'users' | 'dm' | 'message' | 'error';
  content?: string;
  data?: Record<string, string>;
  helpText?: string;
}

export interface ChatCommandsOptions {
  onSetAway?: (message?: string) => void;
  onSetOnline?: () => void;
  onUpdateProfile?: (updates: { nickname?: string; chatColor?: string }) => void;
  onClearMessages?: () => void;
  onCreateDM?: (nickname: string) => void;
}

// Help text for all commands
const COMMAND_HELP = `
**Available Commands:**
• /me <action> - Perform an action (e.g., "/me waves")
• /away [message] - Set your status to away
• /back - Return from away status
• /nick <name> - Change your nickname
• /color <hex> - Change your name color (e.g., "/color #FF6B6B")
• /clear - Clear chat messages (local only)
• /users - List users in the current room
• /dm <user> - Start a DM with a user
• /help - Show this help message
`.trim();

/**
 * Parse and handle slash commands in chat input.
 */
export const useChatCommands = (options: ChatCommandsOptions = {}) => {
  const {
    onSetAway,
    onSetOnline,
    onUpdateProfile,
    onClearMessages,
    onCreateDM,
  } = options;

  /**
   * Check if a message is a command.
   */
  const isCommand = useCallback((message: string): boolean => {
    return message.trim().startsWith('/');
  }, []);

  /**
   * Parse a command and return the result.
   */
  const parseCommand = useCallback((message: string): CommandResult => {
    const trimmed = message.trim();

    if (!trimmed.startsWith('/')) {
      // Regular message
      return { type: 'message', content: trimmed };
    }

    // Parse command and arguments
    const parts = trimmed.slice(1).split(/\s+/);
    const command = parts[0]?.toLowerCase();
    const args = parts.slice(1);
    const argString = args.join(' ');

    switch (command) {
      case 'me': {
        // Emote/action command
        if (!argString) {
          return {
            type: 'error',
            content: 'Usage: /me <action> (e.g., "/me waves hello")',
          };
        }
        return { type: 'emote', content: argString };
      }

      case 'away': {
        // Set away status
        onSetAway?.(argString || undefined);
        return {
          type: 'away',
          content: argString || 'Away',
          data: { message: argString },
        };
      }

      case 'back':
      case 'online': {
        // Return from away
        onSetOnline?.();
        return { type: 'back' };
      }

      case 'nick':
      case 'nickname': {
        // Change nickname
        const newNick = args[0];
        if (!newNick) {
          return {
            type: 'error',
            content: 'Usage: /nick <nickname>',
          };
        }
        if (newNick.length < 2 || newNick.length > 20) {
          return {
            type: 'error',
            content: 'Nickname must be 2-20 characters',
          };
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(newNick)) {
          return {
            type: 'error',
            content: 'Nickname can only contain letters, numbers, underscores, and dashes',
          };
        }
        onUpdateProfile?.({ nickname: newNick });
        return {
          type: 'nick',
          content: newNick,
          data: { nickname: newNick },
        };
      }

      case 'color': {
        // Change name color
        const newColor = args[0];
        if (!newColor) {
          return {
            type: 'error',
            content: 'Usage: /color <hex> (e.g., "/color #FF6B6B")',
          };
        }
        // Validate hex color
        const colorRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
        if (!colorRegex.test(newColor)) {
          return {
            type: 'error',
            content: 'Invalid color format. Use hex (e.g., "#FF6B6B" or "FF6B6B")',
          };
        }
        const normalizedColor = newColor.startsWith('#') ? newColor : `#${newColor}`;
        onUpdateProfile?.({ chatColor: normalizedColor });
        return {
          type: 'color',
          content: normalizedColor,
          data: { color: normalizedColor },
        };
      }

      case 'clear': {
        // Clear local messages
        onClearMessages?.();
        return { type: 'clear' };
      }

      case 'users':
      case 'who': {
        // List users - handled by container
        return { type: 'users' };
      }

      case 'dm':
      case 'msg':
      case 'whisper': {
        // Start DM with user
        const targetUser = args[0];
        if (!targetUser) {
          return {
            type: 'error',
            content: 'Usage: /dm <username>',
          };
        }
        onCreateDM?.(targetUser);
        return {
          type: 'dm',
          content: targetUser,
          data: { targetUser },
        };
      }

      case 'help':
      case '?': {
        // Show help
        return {
          type: 'help',
          helpText: COMMAND_HELP,
        };
      }

      default: {
        return {
          type: 'error',
          content: `Unknown command: /${command}. Type /help for available commands.`,
        };
      }
    }
  }, [onSetAway, onSetOnline, onUpdateProfile, onClearMessages, onCreateDM]);

  /**
   * Get command suggestions based on partial input.
   */
  const getSuggestions = useCallback((input: string): string[] => {
    if (!input.startsWith('/')) return [];

    const partial = input.slice(1).toLowerCase();
    const commands = [
      '/me', '/away', '/back', '/nick', '/color',
      '/clear', '/users', '/dm', '/help',
    ];

    return commands.filter((cmd) =>
      cmd.slice(1).startsWith(partial)
    );
  }, []);

  return useMemo(
    () => ({
      isCommand,
      parseCommand,
      getSuggestions,
      helpText: COMMAND_HELP,
    }),
    [isCommand, parseCommand, getSuggestions]
  );
};
