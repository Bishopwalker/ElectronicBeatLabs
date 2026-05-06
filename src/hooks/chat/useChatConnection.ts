/**
 * Chat WebSocket Connection Hook
 *
 * Manages the WebSocket connection to the chat server.
 * Separated from context for reusability and testing.
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import type { ChatWebSocketMessage } from '../../types/chat.types';

interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  sessionId: string | null;
}

interface UseChatConnectionOptions {
  onMessage: (message: ChatWebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  autoConnect?: boolean;
}

/**
 * Hook for managing chat WebSocket connection.
 *
 * @param options - Connection options and callbacks
 * @returns Connection state and control functions
 */
export const useChatConnection = (options: UseChatConnectionOptions) => {
  const { onMessage, onConnect, onDisconnect, autoConnect = false } = options;

  const [state, setState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    sessionId: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;
  const reconnectDelay = 3000;

  /**
   * Build WebSocket URL based on environment.
   */
  const getWebSocketUrl = useCallback((sessionId: string): string => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws/chat/${sessionId}`;
  }, []);

  /**
   * Generate unique session ID.
   */
  const generateSessionId = useCallback((): string => {
    return `chat-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  /**
   * Connect to chat WebSocket server.
   */
  const connect = useCallback(() => {
    // Prevent duplicate connections
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    const sessionId = generateSessionId();
    const url = getWebSocketUrl(sessionId);

    setState((prev) => ({
      ...prev,
      isConnecting: true,
      error: null,
      sessionId,
    }));

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
        }));
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as ChatWebSocketMessage;
          onMessage(data);
        } catch (err) {
          console.error('Failed to parse chat message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('Chat WebSocket error:', event);
        setState((prev) => ({
          ...prev,
          error: new Error('WebSocket connection error'),
        }));
      };

      ws.onclose = (event) => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));
        wsRef.current = null;
        onDisconnect?.();

        // Attempt reconnection for abnormal closures
        if (event.code !== 1000 && event.code !== 1001) {
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            setTimeout(() => {
              connect();
            }, reconnectDelay * reconnectAttemptsRef.current);
          }
        }
      };
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: err instanceof Error ? err : new Error('Failed to connect'),
      }));
    }
  }, [generateSessionId, getWebSocketUrl, onMessage, onConnect, onDisconnect]);

  /**
   * Disconnect from chat server.
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnect');
      wsRef.current = null;
    }
    setState({
      isConnected: false,
      isConnecting: false,
      error: null,
      sessionId: null,
    });
  }, []);

  /**
   * Send message to server.
   */
  const sendMessage = useCallback((message: ChatWebSocketMessage) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send message: WebSocket not connected');
      return false;
    }

    try {
      wsRef.current.send(JSON.stringify(message));
      return true;
    } catch (err) {
      console.error('Failed to send message:', err);
      return false;
    }
  }, []);

  /**
   * Check if connection is open (sync check).
   */
  const isOpenSync = useCallback((): boolean => {
    return wsRef.current?.readyState === WebSocket.OPEN;
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    isOpenSync,
  };
};
