import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
    type: string;
    data?: any;
    timestamp?: string;
}

interface WebSocketContextType {
    isConnected: boolean;
    isConnecting: boolean;
    error: Error | null;
    lastMessage: WebSocketMessage | null;
    sessionId: string | null;
    sendMessage: (message: WebSocketMessage | string) => void;
    connect: () => void;
    disconnect: () => void;
    registerFrameHandler: (handler: (message: any) => void) => void;
    // Synchronous state check that reads the underlying WebSocket readyState
    // Useful for polling without relying on React state updates
    isOpenSync: () => boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocketContext = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocketContext must be used within WebSocketProvider');
    }
    return context;
};

interface WebSocketProviderProps {
    children: React.ReactNode;
    sessionId?: string;
    autoConnect?: boolean;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
                                                                        children,
                                                                        sessionId,
                                                                        autoConnect = false
                                                                    }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 1; // Only try once to avoid connection spam
    const reconnectDelay = 5000; // Longer delay between attempts
    const frameMessageHandlerRef = useRef<{ handler?: (message: WebSocketMessage) => void; lastUpdate?: number } | null>(null);

    // Cleanup function
    const cleanup = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close(1000, 'Manual disconnect');
            wsRef.current = null;
        }

        setIsConnected(false);
        setIsConnecting(false);
        setCurrentSessionId(null); // Clear session ID on cleanup
    }, []);

    // Connect function
    const connect = useCallback(() => {
        console.log('🔌 WebSocket connect() called, checking state...');

        // Check WebSocket ref directly for state
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            console.log('✅ WebSocket already OPEN, skipping duplicate connection');
            setIsConnected(true);  // Update state in case it's out of sync
            setIsConnecting(false);
            return;
        }

        // If connecting, log but don't return - let backend wait for it
        if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
            console.log('⏳ WebSocket already CONNECTING, waiting for it to open...');
            setIsConnected(false);  // 🔥 FIX: NOT connected yet, still connecting
            setIsConnecting(true);  // 🔥 FIX: IS connecting, not false
            return;
        }

        try {
            // Clean up any existing connection first
            if (wsRef.current) {
                wsRef.current.close(1000, 'Reconnecting');
                wsRef.current = null;
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            setIsConnected(false);

            // Now set connecting state
            setIsConnecting(true);
            setError(null);

            // Construct WebSocket URL - BACKEND EXPECTS base_frequency and beat_frequency!
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.hostname;
            const port = import.meta.env.DEV ? '8000' : window.location.port;
            const baseUrl = `${protocol}//${host}:${port}`;

            // Generate a unique session ID if not provided
            const currentSessionId = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // 🔥 FIX: NO URL PARAMS - frequencies come from WebSocket messages/audio context
            const wsUrl = `${baseUrl}/ws/audio/${currentSessionId}`;

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            // Add immediate state check
            setTimeout(() => {
            }, 100);

            setTimeout(() => {
                if (ws.readyState === WebSocket.CONNECTING) {
                }
            }, 500);

            ws.onopen = () => {
                console.log('✅🎉 WebSocket CONNECTED successfully!', wsUrl);
                // Extract session ID from URL: /ws/session-123?params -> session-123
                const extractedSessionId = wsUrl.split('/').pop()?.split('?')[0];

                if (extractedSessionId) {
                    console.log('🎫 Session ID:', extractedSessionId);
                    setCurrentSessionId(extractedSessionId);
                }

                // Move these inside onopen to ensure proper state sync
                setIsConnected(true);
                setIsConnecting(false);
                setError(null);
                reconnectAttemptsRef.current = 0;
            }

            ws.onmessage = (event) => {
                try {
                    // Handle binary frames (50% smaller, faster)
                    if (event.data instanceof Blob) {
                        // Convert Blob to ArrayBuffer
                        event.data.arrayBuffer().then((arrayBuffer: ArrayBuffer) => {
                            // Send binary frame directly to registered handler
                            if (frameMessageHandlerRef.current?.handler) {
                                frameMessageHandlerRef.current.handler({
                                    type: 'audio_frame',
                                    data: arrayBuffer
                                });
                            }
                        });
                        return;
                    }

                    // Handle text/JSON frames (legacy or control messages)
                    const data = typeof event.data === 'string'
                        ? JSON.parse(event.data)
                        : event.data;

                    // Optimize: For frame messages, only call handlers without updating state
                    if (data.type === 'frame' || data.type === 'audio_frame') {
                        // Don't update state for frame messages to prevent re-render loops
                        // Just call the registered handler directly
                        if (frameMessageHandlerRef.current?.handler) {
                            frameMessageHandlerRef.current.handler(data);
                        }
                    } else {
                        // Non-frame messages update state immediately
                        setLastMessage(data);
                    }
                } catch (err) {
                }
            };

            ws.onerror = (event) => {
                console.error(' Error details:', {
                    readyState: ws.readyState,
                    url: ws.url,
                    protocol: ws.protocol,
                    extensions: ws.extensions,
                });
                const wsError = new Error('WebSocket connection error');
                setError(wsError);
            };

            ws.onclose = (event) => {
                setIsConnected(false);
                setIsConnecting(false);
                setCurrentSessionId(null); // Clear session ID on disconnect
                wsRef.current = null;

                // Only attempt reconnect for abnormal closures
                if (event.code !== 1000 && event.code !== 1001) {
                    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                        reconnectAttemptsRef.current++;

                        reconnectTimeoutRef.current = setTimeout(() => {
                            connect();
                        }, reconnectDelay * reconnectAttemptsRef.current); // Exponential backoff
                    } else {
                        setError(new Error('Max reconnection attempts reached'));
                    }
                }
            };

        } catch (err) {
            let connectionError: Error;
            if (err instanceof Error) {
                connectionError = err;
            } else {
                connectionError = new Error('Failed to create WebSocket');
            }
            setError(connectionError);
            setIsConnecting(false);
        }
    }, [sessionId]);

    // Send message function
    const sendMessage = useCallback((message: WebSocketMessage | string) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            return;
        }

        try {
            const messageToSend = typeof message === 'string'
                ? message
                : JSON.stringify(message);

            wsRef.current.send(messageToSend);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to send message'));
        }
    }, []);

    // Disconnect function
    const disconnect = useCallback(() => {
        reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent auto-reconnect
        cleanup();
    }, [cleanup]);

    const registerFrameHandler = useCallback((handler: (message: WebSocketMessage) => void) => {
        frameMessageHandlerRef.current = {
            ...frameMessageHandlerRef.current,
            handler
        };
    }, []);

    // Auto-connect on mount if enabled
    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        // Cleanup on unmount
        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]); // Empty deps - only run on mount/unmount

    const value: WebSocketContextType = {
        isConnected,
        isConnecting,
        error,
        lastMessage,
        sessionId: currentSessionId,
        sendMessage,
        connect,
        disconnect,
        registerFrameHandler,
        isOpenSync: () => wsRef.current?.readyState === WebSocket.OPEN,
    };

    return React.createElement(
        WebSocketContext.Provider,
        { value: value },
        children
    );
};