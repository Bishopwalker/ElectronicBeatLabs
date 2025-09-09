// WebSocket Hook for Backend Communication
// Handles real-time connection to FastAPI backend

import { useState, useEffect, useCallback, useRef } from 'react';

interface WebSocketMessage {
  type: string;
  data?: Record<string, unknown>;
  timestamp?: string;
}

interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastMessage: WebSocketMessage | null;
}

interface UseWebSocketReturn {
  state: WebSocketState;
  sendMessage: (message: WebSocketMessage) => void;
  connect: (sessionId: string) => void;
  disconnect: () => void;
}

export const useWebSocket = (baseUrl: string = 'ws://localhost:8000'): UseWebSocketReturn => {
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
    lastMessage: null
  });

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const manualDisconnect = useRef(false); // Track if disconnect was manual

  const connect = useCallback((sessionId: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    // Reset manual disconnect flag when connecting
    manualDisconnect.current = false;
    setState(prev => ({ ...prev, connecting: true, error: null }));

    try {
      ws.current = new WebSocket(`${baseUrl}/api/ws/audio/${sessionId}`);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setState(prev => ({ 
          ...prev, 
          connected: true, 
          connecting: false, 
          error: null 
        }));
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          // Use functional update with message comparison to prevent infinite loops
          setState(prev => {
            // Only update if message is actually different (prevent re-render loops)
            if (prev.lastMessage && 
                prev.lastMessage.type === message.type && 
                JSON.stringify(prev.lastMessage.data) === JSON.stringify(message.data)) {
              return prev; // No change, prevent unnecessary re-render
            }
            return { ...prev, lastMessage: message };
          });
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setState(prev => ({ 
          ...prev, 
          connected: false, 
          connecting: false 
        }));

        // Only attempt reconnection if not manually disconnected and not a clean close
        if (event.code !== 1000 && 
            !manualDisconnect.current && 
            reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          reconnectTimeout.current = setTimeout(() => {
            console.log(`Reconnection attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
            connect(sessionId);
          }, Math.pow(2, reconnectAttempts.current) * 1000); // Exponential backoff
        } else if (manualDisconnect.current) {
          console.log('WebSocket disconnected manually, no reconnection attempt');
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'Connection error', 
          connecting: false 
        }));
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to connect', 
        connecting: false 
      }));
    }
  }, [baseUrl]);

  const disconnect = useCallback(() => {
    // Mark as manual disconnect to prevent reconnection attempts
    manualDisconnect.current = true;
    
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    if (ws.current) {
      ws.current.close(1000, 'Client disconnect');
      ws.current = null;
    }

    setState({
      connected: false,
      connecting: false,
      error: null,
      lastMessage: null
    });
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
      }));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    state,
    sendMessage,
    connect,
    disconnect
  };
};