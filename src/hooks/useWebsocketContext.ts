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
    sendMessage: (message: WebSocketMessage | string) => void;
    connect: (baseFrequency?: number, beatFrequency?: number) => void;
    disconnect: () => void;

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
                                                                        sessionId = 'default-session',
                                                                        autoConnect = false
                                                                    }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 3; // Reduced for better UX
    const reconnectDelay = 2000;
    const currentParamsRef = useRef<{ baseFreq?: number; beatFreq?: number }>({});

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
    }, []);

    // Connect function
    const connect = useCallback((baseFrequency = 440, beatFrequency = 4) => {
        console.log('🔌 WebSocket connect() called with:', { baseFrequency, beatFrequency });
        
        // Check WebSocket ref directly for state
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            console.log('✅ WebSocket: Already connected (readyState = OPEN)');
            setIsConnected(true);  // Update state in case it's out of sync
            setIsConnecting(false);
            return;
        }

        // If connecting, log but don't return - let backend wait for it
        if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
            console.log('⏳ WebSocket: Connection already in progress (readyState = CONNECTING)');
            return;
        }

        // Store parameters for potential reconnection
        currentParamsRef.current = { baseFreq: baseFrequency, beatFreq: beatFrequency };

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
            console.log('🔧 WebSocket: Starting connection process...');

            // Construct WebSocket URL - BACKEND EXPECTS base_frequency and beat_frequency!
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.hostname;
            const port = import.meta.env.DEV ? '8000' : window.location.port;
            const baseUrl = `${protocol}//${host}:${port}`;
            
            // Generate a unique session ID if not provided
            const currentSessionId = sessionId || `session-${Date.now()}`;

            // Backend calculates: left_ear = base_frequency - beat_frequency
            // Using main WebSocket endpoint that actually streams audio frames
            const wsUrl = `${baseUrl}/ws/${currentSessionId}?base_frequency=${baseFrequency}&beat_frequency=${beatFrequency}`;

            console.log('🚀 Connecting to WebSocket:', wsUrl);

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;
            console.log('📡 WebSocket object created, readyState:', ws.readyState);

            // Add immediate state check
            setTimeout(() => {
                console.log('🔍 WebSocket state after 100ms:', ws.readyState, 'CONNECTING=', WebSocket.CONNECTING, 'OPEN=', WebSocket.OPEN, 'CLOSING=', WebSocket.CLOSING, 'CLOSED=', WebSocket.CLOSED);
            }, 100);

            setTimeout(() => {
                console.log('🔍 WebSocket state after 500ms:', ws.readyState);
                if (ws.readyState === WebSocket.CONNECTING) {
                    console.log('⚠️ Still connecting after 500ms...');
                }
            }, 500);

            ws.onopen = () => {
                console.log('✅ WebSocket connected successfully');
                setIsConnected(true);
                setIsConnecting(false);
                setError(null);
                reconnectAttemptsRef.current = 0;
            };

            ws.onmessage = (event) => {
                try {
                    const data = typeof event.data === 'string'
                        ? JSON.parse(event.data)
                        : event.data;

              //      console.log('📨 WebSocket message received:', data);
                    setLastMessage(data);
                } catch (err) {
                    console.error('❌ Error parsing WebSocket message:', err);
                }
            };

            ws.onerror = (event) => {
                console.error('❌ WebSocket error:', event);
                console.error('❌ Error details:', {
                    readyState: ws.readyState,
                    url: ws.url,
                    protocol: ws.protocol,
                    extensions: ws.extensions,
                });
                const wsError = new Error('WebSocket connection error');
                setError(wsError);
            };

            ws.onclose = (event) => {
                console.log('🔌 WebSocket disconnected:', event.code, event.reason);
                setIsConnected(false);
                setIsConnecting(false);
                wsRef.current = null;

                // Only attempt reconnect for abnormal closures
                if (event.code !== 1000 && event.code !== 1001) {
                    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                        reconnectAttemptsRef.current++;
                        console.log(`🔄 Reconnecting (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);

                        reconnectTimeoutRef.current = setTimeout(() => {
                            const { baseFreq, beatFreq } = currentParamsRef.current;
                            connect(baseFreq, beatFreq);
                        }, reconnectDelay * reconnectAttemptsRef.current); // Exponential backoff
                    } else {
                        setError(new Error('Max reconnection attempts reached'));
                    }
                }
            };

        } catch (err) {
            console.error('❌ Error creating WebSocket connection:', err);
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
            console.warn('⚠️ Cannot send message: WebSocket not connected');
            return;
        }

        try {
            const messageToSend = typeof message === 'string'
                ? message
                : JSON.stringify(message);

            wsRef.current.send(messageToSend);
            console.log('📤 Message sent:', messageToSend);
        } catch (err) {
            console.error('❌ Error sending message:', err);
            setError(err instanceof Error ? err : new Error('Failed to send message'));
        }
    }, []);

    // Disconnect function
    const disconnect = useCallback(() => {
        console.log('🔌 Manually disconnecting WebSocket');
        reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent auto-reconnect
        cleanup();
    }, [cleanup]);

    // Auto-connect on mount if enabled
    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        // Cleanup on unmount
        return () => {
            disconnect();
        };
    }, []); // Empty deps - only run on mount/unmount

    const value: WebSocketContextType = {
        isConnected,
        isConnecting,
        error,
        lastMessage,
        sendMessage,
        connect,
        disconnect,
    };

    return React.createElement(
        WebSocketContext.Provider,
        { value: value },
        children
    );
};