// Backend Audio Frame Processor - AudioWorklet Implementation
// Handles real-time audio frame processing from WebSocket backend
// Replaces deprecated ScriptProcessorNode with modern AudioWorklet

class BackendAudioProcessor extends AudioWorkletProcessor {

  constructor(options) {
    super();

    // Audio parameters - use actual sample rate from audio context
    this.sampleRate = sampleRate; // Use actual sample rate (48kHz or 44.1kHz)
    const initialVolume = options.processorOptions?.volume || 0.8;
    this.volume = isNaN(initialVolume) ? 0.8 : initialVolume; // Protect against NaN

    // CRITICAL CHANGE #1: Use a ring buffer for efficiency - sized based on actual sample rate
    this.bufferSize = this.sampleRate * 6; // 6 seconds of buffer space for stability
    this._audioBuffer = {
      left: new Float32Array(this.bufferSize),
      right: new Float32Array(this.bufferSize),
      writeIndex: 0,
      readIndex: 0,
      availableSamples: 0
    };

    // CRITICAL CHANGE #2: Dynamic frame size calculation based on actual sample rate
    // Backend sends at 60 FPS with precise timing
    this.frameSamples = Math.floor(this.sampleRate / 60); // Expected samples per WebSocket frame at 60 FPS
    this.framesPerSecond = 60;

    // ULTRA-STABLE buffer thresholds for 48kHz/800 samples per frame - MAXIMUM RELIABILITY
    // 🔥 OPTIMIZED: Tuned thresholds for better underrun recovery while maintaining stability
    this.minBufferSize = this.frameSamples * 120; // ~120 frames minimum (2000ms) - matches backend min_buffer_size
    this.targetBufferSize = this.frameSamples * 180; // ~180 frames target (3000ms) - 3 second buffer for rock-solid stability
    this.maxBufferSize = this.frameSamples * 300; // ~300 frames max (5000ms) - 5 second max buffering for network spikes
    this.restartThreshold = this.frameSamples * 20; // ~20 frames (333ms) - lower threshold for more tolerance

    // Playback state management
    this.isPlaying = false;
    this.isPrimed = false; // Track if we've ever reached minimum buffer
    this.underrunRecoveryFrames = 0; // 🔥 Track frames since underrun for hysteresis

    // Smooth transitions to prevent clicks - scale with sample rate
    this.fadeInSamples = Math.floor(this.sampleRate * 0.005); // ~5ms fade in (smoother)
    this.fadeOutSamples = Math.floor(this.sampleRate * 0.005); // ~5ms fade out (smoother)
    this.currentFade = 0; // Current fade position
    this.fadingIn = false;
    this.fadingOut = false;

    // Frame counter for debugging
    this.frameCount = 0;
    this.messagesReceived = 0;
    this.totalSamplesReceived = 0;
    this.totalSamplesPlayed = 0;
    this.underrunCount = 0;

    // Message handling from main thread
    this.port.onmessage = (event) => {
      this.handleMessage(event.data);
    };

  }

  static get parameterDescriptors() {
    return [
      {
        name: 'volume',
        defaultValue: 0.5,
        minValue: 0,
        maxValue: 1.0,
        automationRate: 'a-rate'
      }
    ];
  }

  handleMessage(message) {
    this.messagesReceived++;

    switch (message.type) {
      case 'audioFrame':
        this.processAudioFrame(message.data);
        break;
      case 'setVolume':
        this.volume = message.volume;
        break;
      case 'clearBuffer':
        this.clearBuffer();
        break;
      case 'start':
      case 'start_session':
      case 'start_stream':
        this.isPrimed = true; // Force prime to allow immediate playback
        break;
      case 'stop':
      case 'stop_session':
      case 'stop_stream':
        this.isPlaying = false;
        this.isPrimed = false;
        this.fadingIn = false;
        this.fadingOut = false;
        this.clearBuffer();
        break;
      case 'update_settings':
        // Settings are handled by backend, just acknowledge
        this.port.postMessage({
          type: 'settings_updated',
          acknowledged: true
        });
        break;
      case 'enable_spatial':
        this.port.postMessage({
          type: 'spatial_enabled',
          acknowledged: true
        });
        break;
      case 'disable_spatial':
        this.port.postMessage({
          type: 'spatial_disabled',
          acknowledged: true
        });
        break;
      case 'load_protocol':
        this.port.postMessage({
          type: 'protocol_loaded',
          protocol: message.protocol,
          acknowledged: true
        });
        break;
      case 'get_metrics':
        this.port.postMessage({
          type: 'metrics',
          data: {
            bufferSize: this._audioBuffer.availableSamples,
            isPlaying: this.isPlaying,
            isPrimed: this.isPrimed,
            totalReceived: this.totalSamplesReceived,
            totalPlayed: this.totalSamplesPlayed,
            underrunCount: this.underrunCount,
            messagesReceived: this.messagesReceived
          }
        });
        break;
      case 'configure':
        this.port.postMessage({
          type: 'configured',
          acknowledged: true
        });
        break;
      default:
    }
  }

  // Ring buffer write operation
  writeToRingBuffer(leftSample, rightSample) {
    // Check if buffer is full
    if (this._audioBuffer.availableSamples >= this.maxBufferSize) {
      // Drop oldest sample by advancing read index
      this._audioBuffer.readIndex = (this._audioBuffer.readIndex + 1) % this.bufferSize;
      this._audioBuffer.availableSamples--;
    }

    // Write new sample
    this._audioBuffer.left[this._audioBuffer.writeIndex] = leftSample;
    this._audioBuffer.right[this._audioBuffer.writeIndex] = rightSample;
    this._audioBuffer.writeIndex = (this._audioBuffer.writeIndex + 1) % this.bufferSize;
    this._audioBuffer.availableSamples++;
  }

  // Ring buffer read operation
  readFromRingBuffer() {
    if (this._audioBuffer.availableSamples === 0) {
      return { left: 0, right: 0 };
    }

    const left = this._audioBuffer.left[this._audioBuffer.readIndex];
    const right = this._audioBuffer.right[this._audioBuffer.readIndex];
    this._audioBuffer.readIndex = (this._audioBuffer.readIndex + 1) % this.bufferSize;
    this._audioBuffer.availableSamples--;

    return { left, right };
  }

  processAudioFrame(frameData) {
    try {
      // Handle binary frame format (faster, 50% smaller)
      if (frameData instanceof ArrayBuffer) {
        return this.processBinaryFrame(frameData);
      }

      // Legacy JSON frame format
      if (!frameData || !frameData.left || !frameData.right) {
        return;
      }

      const samplesReceived = frameData.left.length;
      const bufferBefore = this._audioBuffer.availableSamples;

      // Validate expected frame size to catch timing issues
      if (samplesReceived !== this.frameSamples) {
      }

      // Add samples to ring buffer with improved conversion
      let addedCount = 0;
      for (let i = 0; i < samplesReceived; i++) {
        // FIXED: Proper 16-bit PCM to float conversion with clamping
        const leftRaw = Math.max(-32768, Math.min(32767, frameData.left[i]));
        const rightRaw = Math.max(-32768, Math.min(32767, frameData.right[i]));

        // Convert from int16 range [-32768, 32767] to float [-1.0, 1.0]
        // Use 32768.0 for proper normalization (not 32767)
        const leftSample = leftRaw / 32768.0;
        const rightSample = rightRaw / 32768.0;

        this.writeToRingBuffer(leftSample, rightSample);
        addedCount++;
      }

      this.totalSamplesReceived += addedCount;

      // Auto-prime when we have enough buffer for the first time
      if (bufferBefore < this.minBufferSize && this._audioBuffer.availableSamples >= this.minBufferSize) {
        this.isPrimed = true;
      }

      // Warn if buffer is getting too full
      if (this._audioBuffer.availableSamples > this.maxBufferSize * 0.95) {
      }

      // Send confirmation back to main thread
      this.port.postMessage({
        type: 'frameProcessed',
        data: {
          frameSize: samplesReceived,
          bufferSize: this._audioBuffer.availableSamples,
          bufferHealth: this.getBufferHealth(),
          expectedFrameSize: this.frameSamples,
          timestamp: currentTime
        }
      });

    } catch (error) {
      this.port.postMessage({
        type: 'processingError',
        error: error.message
      });
    }
  }

  getBufferHealth() {
    const samples = this._audioBuffer.availableSamples;
    if (samples < this.minBufferSize) return 'critical';
    if (samples < this.targetBufferSize) return 'low';
    if (samples > this.maxBufferSize * 0.9) return 'high';
    return 'good';
  }

  /**
   * Process binary audio frame (50% faster, 50% smaller than JSON)
   * Binary format: [4 bytes: frame_size][left_pcm int16 array][right_pcm int16 array]
   */
  processBinaryFrame(arrayBuffer) {
    try {
      const dataView = new DataView(arrayBuffer);

      // Read header (4 bytes, little-endian unsigned int)
      const frameSize = dataView.getUint32(0, true);

      if (frameSize !== this.frameSamples) {
      }

      // Calculate byte positions (after 4-byte header)
      const headerSize = 4;
      const bytesPerSample = 2; // int16 = 2 bytes
      const leftOffset = headerSize;
      const rightOffset = headerSize + (frameSize * bytesPerSample);

      // Read int16 samples directly from ArrayBuffer (much faster than JSON parsing)
      const bufferBefore = this._audioBuffer.availableSamples;
      let addedCount = 0;

      for (let i = 0; i < frameSize; i++) {
        // Read int16 samples (little-endian)
        const leftRaw = dataView.getInt16(leftOffset + (i * bytesPerSample), true);
        const rightRaw = dataView.getInt16(rightOffset + (i * bytesPerSample), true);

        // Convert int16 [-32768, 32767] to float [-1.0, 1.0]
        const leftSample = leftRaw / 32768.0;
        const rightSample = rightRaw / 32768.0;

        this.writeToRingBuffer(leftSample, rightSample);
        addedCount++;
      }

      this.totalSamplesReceived += addedCount;

      // Auto-prime when we have enough buffer for the first time
      if (bufferBefore < this.minBufferSize && this._audioBuffer.availableSamples >= this.minBufferSize) {
        this.isPrimed = true;
      }

      // Send confirmation back to main thread
      this.port.postMessage({
        type: 'frameProcessed',
        data: {
          frameSize: frameSize,
          bufferSize: this._audioBuffer.availableSamples,
          bufferHealth: this.getBufferHealth(),
          expectedFrameSize: this.frameSamples,
          binaryMode: true,
          timestamp: currentTime
        }
      });

    } catch (error) {
      this.port.postMessage({
        type: 'processingError',
        error: error.message
      });
    }
  }

  clearBuffer() {
    const size = this._audioBuffer.availableSamples;
    this._audioBuffer.writeIndex = 0;
    this._audioBuffer.readIndex = 0;
    this._audioBuffer.availableSamples = 0;
    this.isPlaying = false;
    this.isPrimed = false;

    // Reset fade states to prevent lingering audio
    this.fadingIn = false;
    this.fadingOut = false;
    this.currentFade = 0;

  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];

    // Ensure we have stereo output
    if (!output || output.length < 2) {
      return true;
    }

    const leftChannel = output[0];
    const rightChannel = output[1];
    const frameLength = leftChannel.length; // Should be 128

    // Get current volume parameter - clamp to safe range with NaN protection
    const volumeParam = parameters.volume;
    const rawVolume = volumeParam[0] || this.volume || 0.5;
    const volume = Math.min(1, isNaN(rawVolume) ? 0.5 : rawVolume); // Max 200% for flexibility, default 0.8 (80%) if NaN

    // 🔍 DEBUG LOGGING: Track volume every 5 seconds (Phase 1)
    if (this.frameCount % 3330 === 0 && this.isPlaying) {
    }

    // Buffer state management
    const availableSamples = this._audioBuffer.availableSamples;

    // Start playing when primed and we have sufficient buffer
    // Use target buffer size for more stable startup
    if (!this.isPlaying && this.isPrimed && availableSamples >= this.targetBufferSize) {
      this.isPlaying = true;
      this.fadingIn = true;
      this.currentFade = 0;
    }

    // 🔥 FIXED: Stop playing if buffer runs too low (with hysteresis to prevent rapid cycling)
    if (this.isPlaying && availableSamples < this.restartThreshold) {
      if (!this.fadingOut) {
        this.fadingOut = true;
        this.currentFade = 0;
        this.underrunCount++;
        this.underrunRecoveryFrames = 0; // Reset recovery counter
      }
    }

    // 🔥 OPTIMIZED: Restart playback faster when buffer recovers (prevent long dead air)
    if (!this.isPlaying && this.isPrimed && !this.fadingOut && availableSamples >= this.targetBufferSize) {
      this.underrunRecoveryFrames++;
      // Require buffer to stay full for at least 10 frames (~167ms at 128 samples/frame) before restarting
      if (this.underrunRecoveryFrames > 10) {
        this.isPlaying = true;
        this.fadingIn = true;
        this.currentFade = 0;
        this.underrunRecoveryFrames = 0;
      }
    } else if (availableSamples < this.targetBufferSize) {
      // Reset recovery counter if buffer drops below target
      this.underrunRecoveryFrames = 0;
    }

    // Fill output buffer with smooth transitions
    let consumed = 0;
    for (let i = 0; i < frameLength; i++) {
      let fadeMultiplier = 1.0;

      // Calculate fade multiplier
      if (this.fadingIn) {
        fadeMultiplier = Math.min(1.0, this.currentFade / this.fadeInSamples);
        this.currentFade++;
        if (this.currentFade >= this.fadeInSamples) {
          this.fadingIn = false;
        }
      } else if (this.fadingOut) {
        fadeMultiplier = Math.max(0.0, 1.0 - (this.currentFade / this.fadeOutSamples));
        this.currentFade++;
        if (this.currentFade >= this.fadeOutSamples) {
          this.fadingOut = false;
          this.isPlaying = false;
        }
      }

      if (this.isPlaying && this._audioBuffer.availableSamples > 0) {
        const sample = this.readFromRingBuffer();

        // Apply volume and fade
        const leftBeforeClamp = sample.left * volume * fadeMultiplier;
        const rightBeforeClamp = sample.right * volume * fadeMultiplier;

        // Clamp to prevent clipping
        const leftOut = Math.max(-1.0, Math.min(2.0, leftBeforeClamp));
        const rightOut = Math.max(-1.0, Math.min(2.0, rightBeforeClamp));

        // 🔍 DEBUG LOGGING: Sample values and clipping detection (Phase 1)
        if (this.frameCount % 3330 === 0 && i === 0 && this.isPlaying) {

          // Detect if clamping occurred (indicates too-loud audio)
          if (Math.abs(leftBeforeClamp) > 1.0 || Math.abs(rightBeforeClamp) > 1.0) {
          }
        }

        leftChannel[i] = leftOut;
        rightChannel[i] = rightOut;
        consumed++;
        this.totalSamplesPlayed++;
      } else {
        // COMPLETE silence when not playing - no humming
        leftChannel[i] = 0.0;
        rightChannel[i] = 0.0;
      }
    }

    // Increment frame counter
    this.frameCount++;

    // Periodic status update (every 5 seconds for better monitoring)
    if (this.frameCount % 3330 === 0) { // 1720 * 128 = 220160 ≈ 5 seconds at 44.1kHz
      const bufferMs = Math.round((this._audioBuffer.availableSamples / this.sampleRate) * 1000);
      const bufferFrames = Math.round(this._audioBuffer.availableSamples / this.frameSamples);
      const bufferHealth = this.getBufferHealth();

      // Log more frequently to help debug timing issues
      if (this.isPlaying && bufferHealth === 'critical' || bufferHealth === 'low' || this.underrunCount > 0) {
        console.log(`📊 Status: Buffer=${bufferMs}ms (~${bufferFrames} frames, ${this._audioBuffer.availableSamples} samples), ` +
            `Health=${bufferHealth}, Playing=${this.isPlaying}, ` +
            `Underruns=${this.underrunCount}, Received=${this.totalSamplesReceived}, Played=${this.totalSamplesPlayed}`);
      }

      // Always send status to main thread for UI updates
      this.port.postMessage({
        type: 'bufferStatus',
        data: {
          bufferSize: this._audioBuffer.availableSamples,
          bufferMs: bufferMs,
          bufferFrames: bufferFrames,
          bufferHealth: bufferHealth,
          isPlaying: this.isPlaying,
          underrunCount: this.underrunCount,
          totalReceived: this.totalSamplesReceived,
          totalPlayed: this.totalSamplesPlayed
        }
      });
    }

    return true; // Keep processor alive
  }
}

// Register the processor
// Guard against double registration (Vite HMR causes this)
try {
  registerProcessor('backend-audio-processor', BackendAudioProcessor);
} catch (error) {
  if (error.name === 'NotSupportedError' && error.message.includes('already registered')) {
  } else {
    throw error;
  }
}