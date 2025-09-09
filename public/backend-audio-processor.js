// Backend Audio Frame Processor - AudioWorklet Implementation
// Handles real-time audio frame processing from WebSocket backend
// Replaces deprecated ScriptProcessorNode with modern AudioWorklet

class BackendAudioProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    
    // Initialize audio buffers
    this.audioBuffer = { 
      left: new Float32Array(4096), 
      right: new Float32Array(4096) 
    };
    this.bufferIndex = 0;
    this.bufferReady = false;
    
    // Audio parameters
    this.volume = options.processorOptions?.volume || 0.5;
    this.sampleRate = sampleRate || 44100;
    
    // Message handling from main thread
    this.port.onmessage = (event) => {
      this.handleMessage(event.data);
    };
    
    console.log('🎵 BackendAudioProcessor: Initialized with sample rate:', this.sampleRate);
  }
  
  static get parameterDescriptors() {
    return [
      {
        name: 'volume',
        defaultValue: 0.5,
        minValue: 0,
        maxValue: 2.0, // Allow up to 200% volume for audio boost
        automationRate: 'a-rate'
      }
    ];
  }
  
  handleMessage(message) {
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
  
  processAudioFrame(frameData) {
    try {
      if (!frameData || !frameData.left || !frameData.right) {
        console.warn('🎵 BackendAudioProcessor: Invalid frame data received');
        return;
      }
      
      // Convert PCM data to Float32Array (normalize from 16-bit to -1.0 to 1.0)
      const leftData = frameData.left.map(sample => 
        typeof sample === 'number' ? sample / 32767 : 0
      );
      const rightData = frameData.right.map(sample => 
        typeof sample === 'number' ? sample / 32767 : 0
      );
      
      // Store audio data in buffer
      this.audioBuffer.left = new Float32Array(leftData);
      this.audioBuffer.right = new Float32Array(rightData);
      this.bufferIndex = 0;
      this.bufferReady = true;
      
      // Send confirmation back to main thread
      this.port.postMessage({
        type: 'frameProcessed',
        data: {
          frameSize: leftData.length,
          leftRange: [Math.min(...leftData), Math.max(...leftData)],
          rightRange: [Math.min(...rightData), Math.max(...rightData)]
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
  
  clearBuffer() {
    this.audioBuffer.left.fill(0);
    this.audioBuffer.right.fill(0);
    this.bufferIndex = 0;
    this.bufferReady = false;
  }
  
  process(inputs, outputs, parameters) {
    const output = outputs[0];
    
    // Ensure we have stereo output
    if (output.length < 2) {
      console.error('🎵 BackendAudioProcessor: Stereo output not available');
      return true;
    }
    
    const leftChannel = output[0];
    const rightChannel = output[1];
    const frameLength = leftChannel.length;
    
    // Get current volume parameter
    const volumeParam = parameters.volume;
    
    // Process audio frame
    for (let i = 0; i < frameLength; i++) {
      const currentVolume = volumeParam.length > 1 ? volumeParam[i] : volumeParam[0];
      
      if (this.bufferReady && this.bufferIndex < this.audioBuffer.left.length) {
        // Output audio from backend buffer with volume control
        leftChannel[i] = this.audioBuffer.left[this.bufferIndex] * currentVolume;
        rightChannel[i] = this.audioBuffer.right[this.bufferIndex] * currentVolume;
        this.bufferIndex++;
      } else {
        // Fill with silence when no data available
        leftChannel[i] = 0;
        rightChannel[i] = 0;
      }
    }
    
    // Notify main thread when buffer is exhausted
    if (this.bufferReady && this.bufferIndex >= this.audioBuffer.left.length) {
      this.bufferReady = false;
      this.port.postMessage({
        type: 'bufferExhausted',
        data: { processedSamples: this.bufferIndex }
      });
    }
    
    return true; // Keep processor alive
  }
}

// Register the processor
registerProcessor('backend-audio-processor', BackendAudioProcessor);