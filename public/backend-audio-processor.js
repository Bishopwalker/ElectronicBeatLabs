// Backend Audio Frame Processor - AudioWorklet Implementation
// Handles real-time audio frame processing from WebSocket backend
// Replaces deprecated ScriptProcessorNode with modern AudioWorklet

class BackendAudioProcessor extends AudioWorkletProcessor {

  constructor(options) {
    super();

    // CRITICAL CHANGE #1: Use a ring buffer for efficiency
    this.bufferSize = 44100 * 2; // 2 seconds of buffer space
    this._audioBuffer = {
      left: new Float32Array(this.bufferSize),
      right: new Float32Array(this.bufferSize),
      writeIndex: 0,
      readIndex: 0,
      availableSamples: 0
    };

    // CRITICAL CHANGE #2: Much larger minimum buffer before playback starts
    this.minBufferSize = 8820; // 200ms minimum buffer (was 50ms - WAY too small!)
    this.targetBufferSize = 22050; // 500ms target buffer for stability
    this.maxBufferSize = 44100; // 1 second max before we start dropping old samples

    // Audio parameters
    this.volume = options.processorOptions?.volume || 0.5;
    this.sampleRate = sampleRate || 44100;

    // Playback state management
    this.isPlaying = false;
    this.isPrimed = false; // Track if we've ever reached minimum buffer

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
    console.log(`📊 Buffer Config: Min=${this.minBufferSize}, Target=${this.targetBufferSize}, Max=${this.maxBufferSize}`);
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

      // Add samples to ring buffer
      let addedCount = 0;
      for (let i = 0; i < samplesReceived; i++) {
        // Normalize from 16-bit PCM to float
        const leftSample = frameData.left[i] / 32767;
        const rightSample = frameData.right[i] / 32767;

        this.writeToRingBuffer(leftSample, rightSample);
        addedCount++;
      }

      this.totalSamplesReceived += addedCount;

      // Only log significant events
      if (bufferBefore < this.minBufferSize && this._audioBuffer.availableSamples >= this.minBufferSize) {
        console.log(`✅ Buffer reached minimum threshold: ${this._audioBuffer.availableSamples} samples`);
        this.isPrimed = true;
      }

      // Warn if buffer is getting too full
      if (this._audioBuffer.availableSamples > this.maxBufferSize * 0.9) {
        console.warn(`⚠️ Buffer near maximum: ${this._audioBuffer.availableSamples}/${this.maxBufferSize}`);
      }

      // Send confirmation back to main thread
      this.port.postMessage({
        type: 'frameProcessed',
        data: {
          frameSize: samplesReceived,
          bufferSize: this._audioBuffer.availableSamples,
          bufferHealth: this.getBufferHealth(),
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
    console.log(`🧹 Cleared audio buffer (had ${size} samples)`);
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

    // Get current volume parameter
    const volumeParam = parameters.volume;
    const volume = volumeParam.length > 1 ? volumeParam[0] : volumeParam[0];

    // Buffer state management
    const availableSamples = this._audioBuffer.availableSamples;

    // Start playing only when we have enough buffer AND we've been primed
    if (!this.isPlaying && this.isPrimed && availableSamples >= this.minBufferSize) {
      this.isPlaying = true;
      console.log(`▶️ Starting playback, buffer: ${availableSamples} samples`);
    }

    // Stop playing if buffer runs too low (but don't reset isPrimed)
    if (this.isPlaying && availableSamples < frameLength) {
      this.isPlaying = false;
      this.underrunCount++;
      console.warn(`⚠️ UNDERRUN #${this.underrunCount}! Buffer empty, pausing playback`);
    }

    // Fill output buffer
    let consumed = 0;
    for (let i = 0; i < frameLength; i++) {
      if (this.isPlaying && this._audioBuffer.availableSamples > 0) {
        const sample = this.readFromRingBuffer();
        leftChannel[i] = sample.left * volume;
        rightChannel[i] = sample.right * volume;
        consumed++;
        this.totalSamplesPlayed++;
      } else {
        // Output silence when not playing or no data
        leftChannel[i] = 0;
        rightChannel[i] = 0;
      }
    }

    // Increment frame counter
    this.frameCount++;

    // Periodic status update (about once per second)
    if (this.frameCount % 344 === 0) { // 344 * 128 = 44032 ≈ 1 second
      const bufferMs = Math.round((this._audioBuffer.availableSamples / this.sampleRate) * 1000);
      console.log(`📊 Status: Buffer=${bufferMs}ms (${this._audioBuffer.availableSamples} samples), ` +
          `Health=${this.getBufferHealth()}, Playing=${this.isPlaying}, ` +
          `Underruns=${this.underrunCount}`);

      this.port.postMessage({
        type: 'bufferStatus',
        data: {
          bufferSize: this._audioBuffer.availableSamples,
          bufferMs: bufferMs,
          bufferHealth: this.getBufferHealth(),
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