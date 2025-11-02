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

// Audio engine constants
const RING_BUFFER_SIZE = 4096;
const CONNECTION_TIMEOUT_MS = 10000;
const CONNECTION_CHECK_INTERVAL_MS = 100;
const MAX_RECONNECT_DELAY_MS = 30000;
const MAX_RECONNECT_ATTEMPTS = 5;
const DEFAULT_SESSION_VOLUME = 0.8;
const MIN_VOLUME = 0;
const MAX_VOLUME = 2;
const DEFAULT_WAVEFORM = 'sine';
const BINARY_FRAME_HEADER_SIZE = 4;

export class BackendAudioEngine {
  private audioContext: AudioContext;
  private outputNode: AudioNode;
  private websocket: WebSocket | null = null;
  private audioWorklet: AudioWorkletNode | null = null;
  private isConnected: boolean = false;
  private sessionId: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = MAX_RECONNECT_ATTEMPTS;

  constructor(audioContext: AudioContext, outputNode: AudioNode) {
    this.audioContext = audioContext;
    this.outputNode = outputNode;
  }

  /**
   * Connect to backend WebSocket server
   */
  async connect(url: string = 'ws://localhost:8000/ws/audio'): Promise<void> {
    if (this.isConnected) {
      return;
    }

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
        return;
      }

      // Create inline worklet processor for STEREO audio
      const workletCode = `
        class BackendProcessor extends AudioWorkletProcessor {
          constructor() {
            super();
            this.bufferL = new Float32Array(${RING_BUFFER_SIZE});
            this.bufferR = new Float32Array(${RING_BUFFER_SIZE});
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

    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle WebSocket open
   */
  private handleOpen(): void {
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

        // Extract STEREO channels from binary frame
        const leftOffset = BINARY_FRAME_HEADER_SIZE;
        const rightOffset = BINARY_FRAME_HEADER_SIZE + frameSize * BINARY_FRAME_HEADER_SIZE;
        
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
        }
      }
    } catch (error) {
      console.error('[BackendAudioEngine] Error handling WebSocket message:', error);
    }
  }

  /**
   * Handle WebSocket error
   */
  private handleError(error: Event): void {
    console.error('[BackendAudioEngine] WebSocket error:', error);
  }

  /**
   * Handle WebSocket close
   */
  private handleClose(): void {
    this.isConnected = false;
    this.sessionId = null;

    // Attempt reconnection with exponential backoff
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), MAX_RECONNECT_DELAY_MS);
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
      }, CONNECTION_TIMEOUT_MS);

      const checkInterval = setInterval(() => {
        if (this.isConnected) {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          resolve();
        }
      }, CONNECTION_CHECK_INTERVAL_MS);
    });
  }

  /**
   * Start audio session with STEREO parameters
   *
   * Args:
   *   leftFreq: Left channel frequency in Hz
   *   rightFreq: Right channel frequency in Hz
   *   volume: Audio volume (0-2 range, default 0.8)
   */
  async startSession(leftFreq: number, rightFreq: number, volume: number = DEFAULT_SESSION_VOLUME): Promise<void> {
    if (!this.isConnected || !this.websocket) {
      throw new Error('BackendEngine: Not connected');
    }

    const beatFreq = Math.abs(rightFreq - leftFreq);
    const baseFreq = Math.min(leftFreq, rightFreq);

    this.websocket.send(JSON.stringify({
      type: 'start_session',
      data: {
        base_frequency: baseFreq,
        beat_frequency: beatFreq,
        amplitude: volume,
        waveform: DEFAULT_WAVEFORM
      }
    }));
  }

  /**
   * Stop audio session
   */
  stopSession(): void {
    if (!this.isConnected || !this.websocket) {
      return;
    }

    this.websocket.send(JSON.stringify({
      type: 'stop_session'
    }));

    this.sessionId = null;
  }

  /**
   * Update STEREO frequencies
   *
   * Args:
   *   leftFreq: New left channel frequency in Hz
   *   rightFreq: New right channel frequency in Hz
   */
  updateFrequencies(leftFreq: number, rightFreq: number): void {
    if (!this.isConnected || !this.websocket || !this.sessionId) {
      return;
    }

    const beatFreq = Math.abs(rightFreq - leftFreq);
    const baseFreq = Math.min(leftFreq, rightFreq);

    this.websocket.send(JSON.stringify({
      type: 'update_settings',
      settings: {
        base_frequency: baseFreq,
        beat_frequency: beatFreq
      }
    }));
  }

  /**
   * Update volume
   *
   * Args:
   *   volume: New volume level (0-2 range)
   */
  updateVolume(volume: number): void {
    if (!this.isConnected || !this.websocket || !this.sessionId) {
      return;
    }

    const safeVolume = Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, volume));

    this.websocket.send(JSON.stringify({
      type: 'update_settings',
      settings: {
        amplitude: safeVolume
      }
    }));
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
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
    this.disconnect();
  }
}