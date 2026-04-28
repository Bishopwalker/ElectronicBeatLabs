/**
 * Typing Indicator Hook - Debounced Typing Status
 *
 * Manages typing indicator state with debounce to prevent
 * excessive WebSocket messages.
 */

import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook for managing typing indicator with debounce.
 *
 * @param onTypingStart - Called when user starts typing
 * @param onTypingStop - Called when user stops typing
 * @param debounceMs - Debounce timeout in ms (default 2000)
 * @returns Typing control functions
 */
export const useTypingIndicator = (
  onTypingStart: (roomId: string) => void,
  onTypingStop: (roomId: string) => void,
  debounceMs = 2000
) => {
  // Track timeouts per room
  const typingTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // Track typing state per room
  const isTypingRef = useRef<Map<string, boolean>>(new Map());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      typingTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeoutRef.current.clear();
    };
  }, []);

  /**
   * Call on every keystroke in input.
   * Sends typing_start once, then debounces typing_stop.
   */
  const handleTyping = useCallback(
    (roomId: string) => {
      // Clear existing timeout
      const existingTimeout = typingTimeoutRef.current.get(roomId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Send typing start if not already typing
      if (!isTypingRef.current.get(roomId)) {
        isTypingRef.current.set(roomId, true);
        onTypingStart(roomId);
      }

      // Set timeout to stop typing
      const timeout = setTimeout(() => {
        isTypingRef.current.set(roomId, false);
        onTypingStop(roomId);
        typingTimeoutRef.current.delete(roomId);
      }, debounceMs);

      typingTimeoutRef.current.set(roomId, timeout);
    },
    [onTypingStart, onTypingStop, debounceMs]
  );

  /**
   * Call when message is sent to immediately stop typing.
   */
  const stopTyping = useCallback(
    (roomId: string) => {
      // Clear timeout
      const timeout = typingTimeoutRef.current.get(roomId);
      if (timeout) {
        clearTimeout(timeout);
        typingTimeoutRef.current.delete(roomId);
      }

      // Send stop if was typing
      if (isTypingRef.current.get(roomId)) {
        isTypingRef.current.set(roomId, false);
        onTypingStop(roomId);
      }
    },
    [onTypingStop]
  );

  /**
   * Check if currently typing in a room.
   */
  const isTyping = useCallback((roomId: string): boolean => {
    return isTypingRef.current.get(roomId) ?? false;
  }, []);

  return {
    handleTyping,
    stopTyping,
    isTyping,
  };
};
