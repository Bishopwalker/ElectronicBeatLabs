/**
 * WebSocket Streaming Example for Electromagnetic Beat Lab
 * 
 * This example demonstrates how to connect to the EBL backend via WebSocket
 * and handle real-time audio and field data streaming at 60 FPS.
 * 
 * Usage:
 * 1. Start the FastAPI backend: uvicorn backend.main:app --reload --port 8000
 * 2. Include this script in your HTML page
 * 3. Call EBLWebSocketClient.connect() to establish connection
 */

class EBLWebSocketClient {
    constructor(serverUrl = 'ws://localhost:8000') {
        this.serverUrl = serverUrl;
        this.socket = null;
        this.sessionId = null;
        this.isConnected = false;
        this.audioContext = null;
        this.audioQueue = [];
        this.fieldCallbacks = [];
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        
        // Performance monitoring
        this.frameStats = {
            audioFramesReceived: 0,
            fieldFramesReceived: 0,
            lastFrameTime: Date.now(),
            fps: 0,
            latency: 0
        };
        
        console.log('🎵 EBL WebSocket Client initialized');
    }
    
    /**
     * Connect to the WebSocket server
     * @param {string} sessionId - Unique session identifier
     */
    async connect(sessionId = null) {
        try {
            this.sessionId = sessionId || this.generateSessionId();
            const wsUrl = `${this.serverUrl}/ws/${this.sessionId}`;
            
            console.log(`🔌 Connecting to EBL WebSocket: ${wsUrl}`);
            
            this.socket = new WebSocket(wsUrl);
            this.setupSocketHandlers();
            
            // Wait for connection
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Connection timeout'));
                }, 5000);
                
                this.socket.onopen = () => {
                    clearTimeout(timeout);
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.reconnectDelay = 1000;
                    console.log('✅ Connected to EBL WebSocket server');
                    resolve();
                };
                
                this.socket.onerror = (error) => {
                    clearTimeout(timeout);
                    console.error('❌ WebSocket connection error:', error);
                    reject(error);
                };
            });
            
        } catch (error) {
            console.error('❌ Failed to connect to EBL WebSocket:', error);
            throw error;
        }
    }
    
    /**
     * Set up WebSocket event handlers
     */
    setupSocketHandlers() {
        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('❌ Failed to parse WebSocket message:', error);
            }
        };
        
        this.socket.onclose = (event) => {
            this.isConnected = false;
            console.log(`🔌 WebSocket connection closed (code: ${event.code})`);
            
            if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.attemptReconnect();
            }
        };
        
        this.socket.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
        };
    }
    
    /**
     * Handle incoming WebSocket messages
     * @param {Object} data - Parsed JSON message
     */
    handleMessage(data) {
        const currentTime = Date.now();
        
        switch (data.type) {
            case 'frame':
                this.handleFrameData(data, currentTime);
                break;
                
            case 'session_status':
                this.handleSessionStatus(data);
                break;
                
            case 'error':
                console.error('❌ Server error:', data.message);
                break;
                
            case 'ping':
                // Respond to server ping for connection health
                this.send({ type: 'pong', timestamp: currentTime });
                break;
                
            default:
                console.warn('⚠️ Unknown message type:', data.type);
        }
    }
    
    /**
     * Handle real-time frame data (audio + field)
     * @param {Object} data - Frame data
     * @param {number} currentTime - Current timestamp
     */
    handleFrameData(data, currentTime) {
        // Calculate latency
        if (data.timestamp) {
            this.frameStats.latency = currentTime - data.timestamp;
        }
        
        // Update FPS calculation
        const timeSinceLastFrame = currentTime - this.frameStats.lastFrameTime;
        if (timeSinceLastFrame > 0) {
            this.frameStats.fps = 1000 / timeSinceLastFrame;
        }
        this.frameStats.lastFrameTime = currentTime;
        
        // Process audio data
        if (data.audio) {
            this.processAudioFrame(data.audio);
            this.frameStats.audioFramesReceived++;
        }
        
        // Process field data
        if (data.field) {
            this.processFieldFrame(data.field);
            this.frameStats.fieldFramesReceived++;
        }
        
        // Log performance stats periodically
        if (this.frameStats.audioFramesReceived % 300 === 0) { // Every 5 seconds at 60 FPS
            console.log('📊 Performance Stats:', {
                fps: this.frameStats.fps.toFixed(1),
                latency: `${this.frameStats.latency}ms`,
                audioFrames: this.frameStats.audioFramesReceived,
                fieldFrames: this.frameStats.fieldFramesReceived
            });
        }
    }
    
    /**
     * Process incoming audio frame data
     * @param {Object} audioData - Audio frame data
     */
    async processAudioFrame(audioData) {
        try {
            // Initialize audio context if needed
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('🎵 Audio context initialized');
            }
            
            // Resume audio context if suspended (Chrome autoplay policy)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Convert received data to audio buffers
            const sampleRate = audioData.sample_rate || 44100;
            const frameSize = audioData.frame_size || audioData.left.length;
            
            // Create audio buffer
            const audioBuffer = this.audioContext.createBuffer(2, frameSize, sampleRate);
            
            // Fill buffer with left and right channel data
            const leftChannel = audioBuffer.getChannelData(0);
            const rightChannel = audioBuffer.getChannelData(1);
            
            for (let i = 0; i < frameSize; i++) {
                leftChannel[i] = audioData.left[i];
                rightChannel[i] = audioData.right[i];
            }
            
            // Queue for playback (implement buffering to prevent dropouts)
            this.queueAudioBuffer(audioBuffer);
            
        } catch (error) {
            console.error('❌ Audio processing error:', error);
        }
    }
    
    /**
     * Queue audio buffer for smooth playback
     * @param {AudioBuffer} buffer - Audio buffer to queue
     */
    queueAudioBuffer(buffer) {
        // Simple audio playback - in production, implement proper buffering
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start();
    }
    
    /**
     * Process incoming field visualization data
     * @param {Object} fieldData - Field frame data
     */
    processFieldFrame(fieldData) {
        // Notify all registered field visualization callbacks
        this.fieldCallbacks.forEach(callback => {
            try {
                callback(fieldData);
            } catch (error) {
                console.error('❌ Field callback error:', error);
            }
        });
    }
    
    /**
     * Handle session status updates
     * @param {Object} data - Session status data
     */
    handleSessionStatus(data) {
        console.log('📊 Session status:', data);
        
        // Trigger custom event for UI updates
        const event = new CustomEvent('eblSessionStatus', { 
            detail: data 
        });
        window.dispatchEvent(event);
    }
    
    /**
     * Start streaming with specified settings
     * @param {Object} settings - Streaming configuration
     */
    startStream(settings = {}) {
        if (!this.isConnected) {
            console.error('❌ Cannot start stream: not connected');
            return;
        }
        
        const defaultSettings = {
            base_frequency: 200,
            beat_frequency: 4,
            amplitude: 0.5,
            field_pattern: 'toroidal',
            field_intensity: 1.0
        };
        
        const streamSettings = { ...defaultSettings, ...settings };
        
        console.log('▶️ Starting EBL stream with settings:', streamSettings);
        
        this.send({
            type: 'start_stream',
            settings: streamSettings
        });
    }
    
    /**
     * Update streaming settings in real-time
     * @param {Object} settings - Updated settings
     */
    updateSettings(settings) {
        if (!this.isConnected) {
            console.error('❌ Cannot update settings: not connected');
            return;
        }
        
        console.log('⚙️ Updating EBL stream settings:', settings);
        
        this.send({
            type: 'update_settings',
            settings: settings
        });
    }
    
    /**
     * Stop the current stream
     */
    stopStream() {
        if (!this.isConnected) {
            console.error('❌ Cannot stop stream: not connected');
            return;
        }
        
        console.log('⏹️ Stopping EBL stream');
        
        this.send({
            type: 'stop_stream'
        });
        
        // Reset frame stats
        this.frameStats = {
            audioFramesReceived: 0,
            fieldFramesReceived: 0,
            lastFrameTime: Date.now(),
            fps: 0,
            latency: 0
        };
    }
    
    /**
     * Send message to server
     * @param {Object} message - Message to send
     */
    send(message) {
        if (!this.isConnected || !this.socket) {
            console.error('❌ Cannot send message: not connected');
            return;
        }
        
        try {
            this.socket.send(JSON.stringify(message));
        } catch (error) {
            console.error('❌ Failed to send message:', error);
        }
    }
    
    /**
     * Register callback for field visualization updates
     * @param {Function} callback - Function to call with field data
     */
    onFieldUpdate(callback) {
        this.fieldCallbacks.push(callback);
        console.log(`📡 Registered field visualization callback (${this.fieldCallbacks.length} total)`);
    }
    
    /**
     * Unregister field visualization callback
     * @param {Function} callback - Function to remove
     */
    offFieldUpdate(callback) {
        const index = this.fieldCallbacks.indexOf(callback);
        if (index > -1) {
            this.fieldCallbacks.splice(index, 1);
            console.log(`📡 Unregistered field visualization callback (${this.fieldCallbacks.length} total)`);
        }
    }
    
    /**
     * Get current performance statistics
     * @returns {Object} Performance stats
     */
    getStats() {
        return { ...this.frameStats };
    }
    
    /**
     * Attempt to reconnect to the server
     */
    attemptReconnect() {
        this.reconnectAttempts++;
        
        console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        
        setTimeout(() => {
            this.connect(this.sessionId).catch(error => {
                console.error(`❌ Reconnection attempt ${this.reconnectAttempts} failed:`, error);
                
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectDelay *= 2; // Exponential backoff
                    this.attemptReconnect();
                } else {
                    console.error('❌ Max reconnection attempts reached. Please refresh the page.');
                    
                    // Trigger custom event for UI notification
                    const event = new CustomEvent('eblConnectionFailed', {
                        detail: { attempts: this.reconnectAttempts }
                    });
                    window.dispatchEvent(event);
                }
            });
        }, this.reconnectDelay);
    }
    
    /**
     * Generate a unique session ID
     * @returns {string} Session ID
     */
    generateSessionId() {
        return 'ebl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Disconnect from the server
     */
    disconnect() {
        if (this.socket) {
            console.log('🔌 Disconnecting from EBL WebSocket server');
            this.socket.close(1000, 'Client disconnect');
            this.socket = null;
        }
        
        this.isConnected = false;
        this.sessionId = null;
        
        // Close audio context
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

// Usage Example:
if (typeof window !== 'undefined') {
    // Make client available globally
    window.EBLWebSocketClient = EBLWebSocketClient;
    
    // Example usage
    console.log(`
🎵 EBL WebSocket Streaming Example

Usage:
1. const client = new EBLWebSocketClient('ws://localhost:8000');
2. await client.connect();
3. client.startStream({ beat_frequency: 4, field_pattern: 'toroidal' });
4. client.onFieldUpdate((fieldData) => { /* visualize field */ });
5. client.stopStream();
6. client.disconnect();

Available ADHD Protocol Settings:
- SMR Training: { base_frequency: 200, beat_frequency: 14 }
- Alpha Relaxation: { base_frequency: 200, beat_frequency: 10 }
- Beta Focus: { base_frequency: 250, beat_frequency: 18 }
- Theta Meditation: { base_frequency: 150, beat_frequency: 6 }

Field Patterns: 'toroidal', 'spherical', 'vortex', 'wave'
    `);
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EBLWebSocketClient;
}

/**
 * Example HTML Integration:
 * 
 * <!DOCTYPE html>
 * <html>
 * <head>
 *     <title>EBL WebSocket Example</title>
 * </head>
 * <body>
 *     <div id="status">Disconnected</div>
 *     <div id="stats"></div>
 *     <canvas id="fieldCanvas" width="400" height="400"></canvas>
 *     
 *     <button onclick="connect()">Connect</button>
 *     <button onclick="startSMR()">Start SMR Training</button>
 *     <button onclick="stopStream()">Stop</button>
 *     <button onclick="disconnect()">Disconnect</button>
 *     
 *     <script src="websocket-streaming-example.js"></script>
 *     <script>
 *         let client = null;
 *         
 *         async function connect() {
 *             client = new EBLWebSocketClient();
 *             try {
 *                 await client.connect();
 *                 document.getElementById('status').textContent = 'Connected';
 *                 
 *                 // Set up field visualization
 *                 client.onFieldUpdate(renderField);
 *                 
 *                 // Performance monitoring
 *                 setInterval(() => {
 *                     const stats = client.getStats();
 *                     document.getElementById('stats').textContent = 
 *                         `FPS: ${stats.fps.toFixed(1)}, Latency: ${stats.latency}ms`;
 *                 }, 1000);
 *                 
 *             } catch (error) {
 *                 document.getElementById('status').textContent = 'Connection failed';
 *             }
 *         }
 *         
 *         function startSMR() {
 *             if (client) {
 *                 client.startStream({
 *                     base_frequency: 200,
 *                     beat_frequency: 14,
 *                     field_pattern: 'toroidal',
 *                     amplitude: 0.5
 *                 });
 *             }
 *         }
 *         
 *         function stopStream() {
 *             if (client) {
 *                 client.stopStream();
 *             }
 *         }
 *         
 *         function disconnect() {
 *             if (client) {
 *                 client.disconnect();
 *                 client = null;
 *                 document.getElementById('status').textContent = 'Disconnected';
 *             }
 *         }
 *         
 *         function renderField(fieldData) {
 *             const canvas = document.getElementById('fieldCanvas');
 *             const ctx = canvas.getContext('2d');
 *             
 *             // Simple field visualization
 *             ctx.clearRect(0, 0, canvas.width, canvas.height);
 *             
 *             const gridSize = fieldData.grid_size[0];
 *             const cellWidth = canvas.width / gridSize;
 *             const cellHeight = canvas.height / gridSize;
 *             
 *             for (let x = 0; x < gridSize; x++) {
 *                 for (let y = 0; y < gridSize; y++) {
 *                     const intensity = fieldData.field[x][y];
 *                     const alpha = Math.abs(intensity) * 0.5;
 *                     
 *                     if (alpha > 0.1) {
 *                         ctx.fillStyle = intensity > 0 ? 
 *                             `rgba(255, 100, 100, ${alpha})` : 
 *                             `rgba(100, 200, 255, ${alpha})`;
 *                         ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
 *                     }
 *                 }
 *             }
 *         }
 *         
 *         // Handle connection events
 *         window.addEventListener('eblSessionStatus', (event) => {
 *             console.log('Session status update:', event.detail);
 *         });
 *         
 *         window.addEventListener('eblConnectionFailed', (event) => {
 *             alert('Connection failed after multiple attempts. Please refresh the page.');
 *         });
 *     </script>
 * </body>
 * </html>
 */