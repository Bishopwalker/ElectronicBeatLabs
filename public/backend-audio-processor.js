// Backend Audio Frame Processor - AudioWorklet Implementation
// Handles real-time audio frame processing from WebSocket backend
// Replaces deprecated ScriptProcessorNode with modern AudioWorklet

class BackendAudioProcessor extends AudioWorkletProcessor {

  constructor(options) {
    super();

    // Audio parameters - use actual sample rate from audio context
    this.sampleRate = sampleRate; // Use actual sample rate (48kHz or 44.1kHz)
    const initialVolume = options.processorOptions?.volume || 0.5;
    this.volume = isNaN(initialVolume) ? 0.5 : initialVolume; // Protect against NaN

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

    // Optimized buffer thresholds for 48kHz/800 samples per frame
    this.minBufferSize = this.frameSamples * 8; // ~8 frames minimum (133ms) - stable startup
    this.targetBufferSize = this.frameSamples * 16; // ~16 frames target (267ms) - balanced buffer
    this.maxBufferSize = this.frameSamples * 100; // ~100 frames max (1667ms) - prevent excessive buffering
    this.restartThreshold = this.frameSamples * 6; // ~6 frames (100ms) - stable restart

    // Playback state management
    this.isPlaying = false;
    this.isPrimed = false; // Track if we've ever reached minimum buffer

    // Smooth transitions to prevent clicks - scale with sample rate
    this.fadeInSamples = Math.floor(this.sampleRate * 0.003); // ~3ms fade in
    this.fadeOutSamples = Math.floor(this.sampleRate * 0.003); // ~3ms fade out
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

    console.log('🎵 BackendAudioProcessor: Initialized with sample rate:', this.sampleRate);
    console.log(`📊 Frame-Based Buffer Config: Min=${this.minBufferSize} (~${Math.round(this.minBufferSize/this.frameSamples)} frames), Target=${this.targetBufferSize} (~${Math.round(this.targetBufferSize/this.frameSamples)} frames), Max=${this.maxBufferSize} (~${Math.round(this.maxBufferSize/this.frameSamples)} frames)`);
  }

  static get parameterDescriptors() {
    return [
      {
        name: 'volume',
        defaultValue: 0.5,
        minValue: 0,
        maxValue: 2.0,
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
        console.log('🔊 AudioWorklet: Manual start command received');
        this.isPrimed = true; // Force prime to allow immediate playback
        break;
      case 'stop':
        console.log('⏹️ AudioWorklet: Stop command received');
        this.isPlaying = false;
        this.isPrimed = false;
        this.fadingIn = false;
        this.fadingOut = false;
        break;
      default:
        console.warn('🎵 BackendAudioProcessor: Unknown message type:', message.type);
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
      if (!frameData || !frameData.left || !frameData.right) {
        console.warn('🎵 BackendAudioProcessor: Invalid frame data received');
        return;
      }

      const samplesReceived = frameData.left.length;
      const bufferBefore = this._audioBuffer.availableSamples;

      // Validate expected frame size to catch timing issues
      if (samplesReceived !== this.frameSamples) {
        console.warn(`⚠️ Frame size mismatch: expected ${this.frameSamples}, got ${samplesReceived}`);
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
        console.log(`✅ Buffer reached minimum threshold: ${this._audioBuffer.availableSamples} samples - auto-priming`);
        this.isPrimed = true;
      }

      // Warn if buffer is getting too full
      if (this._audioBuffer.availableSamples > this.maxBufferSize * 0.85) {
        console.warn(`⚠️ Buffer near maximum: ${this._audioBuffer.availableSamples}/${this.maxBufferSize}`);
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
      console.error('🎵 BackendAudioProcessor: Error processing frame:', error);
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
    if (samples > this.maxBufferSize * 0.8) return 'high';
    return 'good';
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

    console.log(`🧹 Cleared audio buffer (had ${size} samples) and reset all playback states`);
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
    const rawVolume = volumeParam[0] || this.volume || 0.3;
    const volume = Math.min(0.8, isNaN(rawVolume) ? 0.3 : rawVolume); // Max 80% to prevent clipping, default 0.3 if NaN

    // Buffer state management
    const availableSamples = this._audioBuffer.availableSamples;

    // Start playing when primed and we have sufficient buffer
    // Use target buffer size for more stable startup
    if (!this.isPlaying && this.isPrimed && availableSamples >= this.targetBufferSize) {
      this.isPlaying = true;
      this.fadingIn = true;
      this.currentFade = 0;
      console.log(`▶️ Starting playback with fade-in: ${availableSamples} samples (target: ${this.targetBufferSize})`);
    }

    // Stop playing if buffer runs too low (but don't reset isPrimed)
    if (this.isPlaying && availableSamples < this.restartThreshold) {
      if (!this.fadingOut) {
        this.fadingOut = true;
        this.currentFade = 0;
        this.underrunCount++;
        console.warn(`⚠️ UNDERRUN #${this.underrunCount}! Buffer below ${this.restartThreshold} samples (${availableSamples} available), starting fade-out. Will restart when buffer reaches ${this.targetBufferSize}`);
      }
    }

    // Restart playback when buffer recovers to target level after underrun
    if (!this.isPlaying && this.isPrimed && !this.fadingOut && availableSamples >= this.targetBufferSize) {
      this.isPlaying = true;
      this.fadingIn = true;
      this.currentFade = 0;
      console.log(`🔄 Restarting playback after buffer recovery: ${availableSamples} samples`);
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
        // Apply volume and fade, then clamp to prevent clipping
        const leftOut = Math.max(-1.0, Math.min(1.0, sample.left * volume * fadeMultiplier));
        const rightOut = Math.max(-1.0, Math.min(1.0, sample.right * volume * fadeMultiplier));
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
    if (this.frameCount % 1720 === 0) { // 1720 * 128 = 220160 ≈ 5 seconds at 44.1kHz
      const bufferMs = Math.round((this._audioBuffer.availableSamples / this.sampleRate) * 1000);
      const bufferFrames = Math.round(this._audioBuffer.availableSamples / this.frameSamples);
      const bufferHealth = this.getBufferHealth();

      // Log more frequently to help debug timing issues
      if (this.isPlaying || bufferHealth === 'critical' || bufferHealth === 'low' || this.underrunCount > 0) {
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
registerProcessor('backend-audio-processor', BackendAudioProcessor);