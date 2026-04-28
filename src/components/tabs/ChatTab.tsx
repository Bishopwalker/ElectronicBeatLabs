/**
 * ChatTab Component - Chat Tab Wrapper
 *
 * Integrates the AOL/AIM-style chat system into the EBL tab interface.
 */

import React from 'react';
import { Box } from '@mui/material';
import { ChatContainer } from '../chat';

interface ChatTabProps {
  isActive?: boolean;
}

/**
 * Tab wrapper for the chat system.
 */
export const ChatTab: React.FC<ChatTabProps> = ({ isActive = true }) => {
  if (!isActive) {
    return null;
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 500,
      }}
    >
      <ChatContainer height="100%" />
    </Box>
  );
};

export default ChatTab;
