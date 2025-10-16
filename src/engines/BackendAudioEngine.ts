/**
 * BackendAudioEngine - WebSocket Audio Streaming Engine
 * 
 * CRITICAL: This engine receives STEREO audio frames from Python backend
 * Processes both LEFT and RIGHT channels through AudioWorklet
 * Maintains binaural beat integrity from NumPy-generated audio
 */

interface AudioFrame {
  left: Float32Array;   // LEFT channel samples
  right: Float32Array;  // RIGHT channel samples
  timestamp: number;
}

export class BackendAudioEngine {
  private audioContext: AudioContext;
  private outputNode: AudioNode;
  private websocket: WebSocket | null = null;
  private audioWorklet: AudioWorkletNode | null = null;
  private isConnected: boolean = false;
  private sessionId: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(audioContext: AudioContext, outputNode: AudioNode) {
    this.audioContext = audioContext;
    this.outputNode = outputNode;
    
    console.log('🔌 BackendAudioEngine initialized (STEREO WebSocket mode)');
  }

  /**
   * Connect to backend WebSocket server
   */
  async connect(url: string = 'ws://localhost:8000/ws/audio'): Promise<void> {
    if (this.isConnected) {
      console.log('✅ BackendEngine: Already connected');
      return;
    }

    console.log('🔌 BackendEngine: Connecting to WebSocket...');

    try {
      // Initialize AudioWorklet for processing backend frames
      await this.initializeAudioWorklet();

      // Create WebSocket connection
      this.websocket = new WebSocket(url);
      this.websocket.binaryType = 'arraybuffer';

      // Setup WebSocket handlers
      this.websocket.onopen = () => this.handleOpen();
      this.websocket.onmessage = (event) => this.handleMessage(event);
      this.websocket.onerror = (error) => this.handleError(error);
      this.websocket.onclose = () => this.handleClose();

      // Wait for connection
      await this.waitForConnection();
    } catch (error) {
      console.error('❌ BackendEngine: Connection failed:', error);
      throw error;
    }
  }

  /**
   * Initialize AudioWorklet for processing STEREO frames
   */
  private async initializeAudioWorklet(): Promise<void> {
    try {
      // Check if worklet module already loaded
      if (this.audioWorklet) {
        console.log('✅ AudioWorklet already initialized');
        return;
      }

      // Create inline worklet processor for STEREO audio
      const workletCode = `
        class BackendProcessor extends AudioWorkletProcessor {
          constructor() {
            super();
            this.bufferL = new Float32Array(4096);
            this.bufferR = new Float32Array(4096);
            this.writeIndex = 0;
            this.readIndex = 0;
            
            // Handle STEREO frames from main thread
            this.port.onmessage = (event) => {
              if (event.data.type === 'audioFrame') {
                const { left, right } = event.data;
                
                // Copy STEREO data to ring buffers
                for (let i = 0; i < left.length; i++) {
                  this.bufferL[this.writeIndex] = left[i];
                  this.bufferR[this.writeIndex] = right[i];
                  this.writeIndex = (this.writeIndex + 1) % this.bufferL.length;
                }
              }
            };
          }
          
          process(inputs, outputs, parameters) {
            const output = outputs[0];
            if (!output || output.length < 2) return true;
            
            const leftChannel = output[0];
            const rightChannel = output[1];
            
            // Output STEREO audio from ring buffers
            for (let i = 0; i < leftChannel.length; i++) {
              leftChannel[i] = this.bufferL[this.readIndex];
              rightChannel[i] = this.bufferR[this.readIndex];
              this.readIndex = (this.readIndex + 1) % this.bufferL.length;
            }
            
            return true; // Keep processor alive
          }
        }
        
        registerProcessor('backend-processor', BackendProcessor);
      `;

      // Create blob URL for worklet
      const blob = new Blob([workletCode], { type: 'application/javascript' });
      const workletUrl = URL.createObjectURL(blob);

      // Load worklet module
      await this.audioContext.audioWorklet.addModule(workletUrl);

      // Create AudioWorkletNode with STEREO output
      this.audioWorklet = new AudioWorkletNode(
        this.audioContext, 
        'backend-processor',
        {
          numberOfInputs: 0,
          numberOfOutputs: 1,
          outputChannelCount: [2] // STEREO output
        }
      );

      // Connect to output
      this.audioWorklet.connect(this.outputNode);

      console.log('✅ BackendEngine: AudioWorklet initialized for STEREO streaming');
    } catch (error) {
      console.error('❌ BackendEngine: Failed to initialize AudioWorklet:', error);
      throw error;
    }
  }

  /**
   * Handle WebSocket open
   */
  private handleOpen(): void {
    console.log('✅ BackendEngine: WebSocket connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;
  }

  /**
   * Handle WebSocket message (STEREO audio frames)
   */
  private handleMessage(event: MessageEvent): void {
    try {
      if (event.data instanceof ArrayBuffer) {
        // Parse binary STEREO frame
        const dataView = new DataView(event.data);
        const frameSize = dataView.getUint32(0, true);
        
        // Extract STEREO channels
        const leftOffset = 4;
        const rightOffset = 4 + frameSize * 4;
        
        const leftChannel = new Float32Array(event.data, leftOffset, frameSize);
        const rightChannel = new Float32Array(event.data, rightOffset, frameSize);
        
        // Send STEREO frame to AudioWorklet
        if (this.audioWorklet) {
          this.audioWorklet.port.postMessage({
            type: 'audioFrame',
            left: leftChannel,
            right: rightChannel
          });
        }
      } else {
        // Handle JSON messages (session info, etc)
        const data = JSON.parse(event.data);
        
        if (data.type === 'session_started') {
          this.sessionId = data.session_id;
          console.log(`✅ BackendEngine: Session started - ${this.sessionId}`);
        }
      }
    } catch (error) {
      console.error('❌ BackendEngine: Error processing message:', error);
    }
  }

  /**
   * Handle WebSocket error
   */
  private handleError(error: Event): void {
    console.error('❌ BackendEngine: WebSocket error:', error);
  }

  /**
   * Handle WebSocket close
   */
  private handleClose(): void {
    console.log('🔌 BackendEngine: WebSocket disconnected');
    this.isConnected = false;
    this.sessionId = null;
    
    // Attempt reconnection
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`🔄 BackendEngine: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`);
      setTimeout(() => this.connect(), delay);
    }
  }

  /**
   * Wait for WebSocket connection
   */
  private waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      const checkInterval = setInterval(() => {
        if (this.isConnected) {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * Start audio session with STEREO parameters
   */
  async startSession(leftFreq: number, rightFreq: number, volume: number = 0.8): Promise<void> {
    if (!this.isConnected || !this.websocket) {
      throw new Error('BackendEngine: Not connected');
    }

    const beatFreq = Math.abs(rightFreq - leftFreq);
    const baseFreq = Math.min(leftFreq, rightFreq);

    console.log(`🎵 BackendEngine: Starting STEREO session`);
    console.log(`   Base: ${baseFreq}Hz, Beat: ${beatFreq}Hz`);
    console.log(`   Left: ${leftFreq}Hz, Right: ${rightFreq}Hz`);

    // Send session parameters
    this.websocket.send(JSON.stringify({
      type: 'start_session',
      base_frequency: baseFreq,
      beat_frequency: beatFreq,
      amplitude: volume,
      waveform: 'sine'
    }));
  }

  /**
   * Stop audio session
   */
  stopSession(): void {
    if (!this.isConnected || !this.websocket) {
      console.warn('⚠️ BackendEngine: Not connected');
      return;
    }

    console.log('🛑 BackendEngine: Stopping session');

    this.websocket.send(JSON.stringify({
      type: 'stop_session'
    }));

    this.sessionId = null;
  }

  /**
   * Update STEREO frequencies
   */
  updateFrequencies(leftFreq: number, rightFreq: number): void {
    if (!this.isConnected || !this.websocket || !this.sessionId) {
      console.warn('⚠️ BackendEngine: Cannot update - no active session');
      return;
    }

    const beatFreq = Math.abs(rightFreq - leftFreq);
    const baseFreq = Math.min(leftFreq, rightFreq);

    this.websocket.send(JSON.stringify({
      type: 'update_parameters',
      session_id: this.sessionId,
      base_frequency: baseFreq,
      beat_frequency: beatFreq
    }));

    console.log(`🎛️ BackendEngine: Updated STEREO - L:${leftFreq}Hz, R:${rightFreq}Hz`);
  }

  /**
   * Update volume
   */
  updateVolume(volume: number): void {
    if (!this.isConnected || !this.websocket || !this.sessionId) {
      console.warn('⚠️ BackendEngine: Cannot update volume - no active session');
      return;
    }

    const safeVolume = Math.max(0, Math.min(2, volume));

    this.websocket.send(JSON.stringify({
      type: 'update_parameters',
      session_id: this.sessionId,
      amplitude: safeVolume
    }));

    console.log(`🔊 BackendEngine: Volume set to ${safeVolume.toFixed(2)}`);
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    console.log('🧹 BackendEngine: Disconnecting...');
    
    if (this.sessionId) {
      this.stopSession();
    }

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    if (this.audioWorklet) {
      this.audioWorklet.disconnect();
      this.audioWorklet = null;
    }

    this.isConnected = false;
    this.sessionId = null;
  }

  /**
   * Get connection status
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Destroy engine
   */
  destroy(): void {
    console.log('🧹 BackendEngine: Destroying...');
    this.disconnect();
  }
}
