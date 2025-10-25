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
    connect: (base_frequency?: number, beat_frequency?: number) => void;
    disconnect: () => void;
    registerFrameHandler: (handler: (message: any) => void) => void;
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
    const maxReconnectAttempts = 3; // Reduced for better UX
    const reconnectDelay = 2000;
    const currentParamsRef = useRef<{ base_frequency?: number; beat_frequency?: number }>({});
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
    const connect = useCallback((base_frequency: number | undefined, beat_frequency: number | undefined) => {
        console.log('🔌 WebSocket connect() called with:', {base_frequency, beat_frequency});

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
            setIsConnected(false);  // 🔥 FIX: NOT connected yet, still connecting
            setIsConnecting(true);  // 🔥 FIX: IS connecting, not false
            return;
        }

        // Store parameters for potential reconnection
        currentParamsRef.current = {base_frequency: base_frequency, beat_frequency: beat_frequency};

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
            const currentSessionId = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            console.log('🆔 WebSocket: Using session ID:', currentSessionId);

            // Backend calculates: left_ear = base_frequency - beat_frequency
            // Using audio-specific WebSocket endpoint for backend audio engine
            const wsUrl = `${baseUrl}/ws/audio/${currentSessionId}?base_frequency=${base_frequency}&beat_frequency=${beat_frequency}`;

            console.log('🚀 Connecting to WebSocket:', wsUrl);

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;
            console.log('📡 WebSocket object created, readyState:', ws.readyState);

            // Add immediate state check
            setTimeout(() => {
                console.log('🔍 WebSocket state after 10ms:', ws.readyState, 'CONNECTING=', WebSocket.CONNECTING, 'OPEN=', WebSocket.OPEN, 'CLOSING=', WebSocket.CLOSING, 'CLOSED=', WebSocket.CLOSED);
            }, 100);

            setTimeout(() => {
                console.log('🔍 WebSocket state after 500ms:', ws.readyState);
                if (ws.readyState === WebSocket.CONNECTING) {
                    console.log('⚠️ Still connecting after 500ms...');
                }
            }, 500);

            ws.onopen = () => {
                console.log('✅ WebSocket connected successfully');
                // Extract session ID from URL: /ws/session-123?params -> session-123
                const extractedSessionId = wsUrl.split('/').pop()?.split('?')[0];
                console.log('🆔 WebSocket Session ID from URL:', extractedSessionId);

                if (extractedSessionId)
                    setCurrentSessionId(extractedSessionId);
                console.log('💾 Session ID stored in WebSocket context:', extractedSessionId);

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

                    console.log('📨 WebSocket message received:', data);

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
                    console.error(' Error parsing WebSocket message:', err);
                }
            };

            ws.onerror = (event) => {
                console.error(' WebSocket error:', event);
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
                console.log('🔌 WebSocket disconnected:', event.code, event.reason);
                setIsConnected(false);
                setIsConnecting(false);
                setCurrentSessionId(null); // Clear session ID on disconnect
                wsRef.current = null;

                // Only attempt reconnect for abnormal closures
                if (event.code !== 1000 && event.code !== 1001) {
                    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                        reconnectAttemptsRef.current++;
                        console.log(`🔄 Reconnecting (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);

                        reconnectTimeoutRef.current = setTimeout(() => {
                            const { base_frequency, beat_frequency } = currentParamsRef.current;
                           if (currentParamsRef.current) connect(base_frequency ,beat_frequency);
                        }, reconnectDelay * reconnectAttemptsRef.current); // Exponential backoff
                    } else {
                        setError(new Error('Max reconnection attempts reached'));
                    }
                }
            };

        } catch (err) {
            console.error(' Error creating WebSocket connection:', err);
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
            console.warn('⚠ Cannot send message: WebSocket not connected');
            return;
        }

        try {
            const messageToSend = typeof message === 'string'
                ? message
                : JSON.stringify(message);

            wsRef.current.send(messageToSend);
            console.log(' Message sent:', messageToSend);
        } catch (err) {
            console.error('Error sending message:', err);
            setError(err instanceof Error ? err : new Error('Failed to send message'));
        }
    }, []);

    // Disconnect function
    const disconnect = useCallback(() => {
        console.log('🔌 Manually disconnecting WebSocket');
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
            const { base_frequency, beat_frequency } = currentParamsRef.current;
            connect(base_frequency,beat_frequency);
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
    };

    return React.createElement(
        WebSocketContext.Provider,
        { value: value },
        children
    );
};