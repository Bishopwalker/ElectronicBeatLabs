/**
 * ChatMessageList Component - Scrollable Message Area
 *
 * Displays list of messages with auto-scroll to bottom.
 */

import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { ChatMessage } from './ChatMessage';
import type { ChatMessage as ChatMessageType } from '../../types/chat.types';

interface ChatMessageListProps {
  messages: ChatMessageType[];
  currentUserId?: string;
}

/**
 * Scrollable list of chat messages.
 */
export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  currentUserId,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Box
      ref={containerRef}
      sx={{
        flex: 1,
        overflowY: 'auto',
        backgroundColor: 'rgba(10, 10, 20, 0.8)',
        borderRadius: 1,
        p: 1,
        // Custom scrollbar
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.3)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(138, 43, 226, 0.5)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(138, 43, 226, 0.7)',
          },
        },
      }}
    >
      {messages.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#666',
            fontStyle: 'italic',
          }}
        >
          No messages yet. Say hello!
        </Box>
      ) : (
        messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isOwnMessage={msg.senderId === currentUserId}
          />
        ))
      )}
      <div ref={bottomRef} />
    </Box>
  );
};
