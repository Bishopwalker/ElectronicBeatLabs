/**
 * FrontendAudioEngine - Web Audio API Binaural Beat Generator
 * 
 * CRITICAL: This engine generates STEREO audio (left + right frequencies)
 * Creates two oscillators for true binaural beats
 * Both frequencies are output to create the beat frequency
 * 
 * 🔥 RAW WAVEFORM POWER - NO COMPENSATION!
 * Outputs authentic waveform energy for maximum visualizer impact
 * Users can adjust master volume to control loudness
 */

export class FrontendAudioEngine {
  private audioContext: AudioContext;
  private outputNode: AudioNode;
  
  // STEREO oscillators - one for each ear
  private oscillatorL: OscillatorNode | null = null;
  private oscillatorR: OscillatorNode | null = null;
  
  // Gain nodes for volume control
  private gainL: GainNode | null = null;
  private gainR: GainNode | null = null;
  
  // Channel merger for proper STEREO output
  private merger: ChannelMergerNode | null = null;
  
  private isPlaying: boolean = false;
  private currentWaveform: OscillatorType = 'sine';
  private baseVolume: number = 0.5;

  constructor(audioContext: AudioContext, outputNode: AudioNode) {
    this.audioContext = audioContext;
    this.outputNode = outputNode;
    
  }

  /**
   * Start generating binaural beats with BOTH frequencies
   * @param leftFreq - Frequency for LEFT ear (Hz)
   * @param rightFreq - Frequency for RIGHT ear (Hz)
   * @param volume - Amplitude (0.0 - 2.0)
   * @param waveform - Oscillator waveform type
   */
  start(
    leftFreq: number, 
    rightFreq: number, 
    volume: number ,
    waveform: OscillatorType = 'sine'
  ): void {
    if (this.isPlaying) {
      this.stop();
    }

    try {
      // Store waveform and base volume
      this.currentWaveform = waveform;
      this.baseVolume = volume;
      
      // Create STEREO oscillators
      this.oscillatorL = this.audioContext.createOscillator();
      this.oscillatorR = this.audioContext.createOscillator();
      
      // Set frequencies
      this.oscillatorL.frequency.setValueAtTime(leftFreq, this.audioContext.currentTime);
      this.oscillatorR.frequency.setValueAtTime(rightFreq, this.audioContext.currentTime);
      
      // Set waveform
      this.oscillatorL.type = waveform;
      this.oscillatorR.type = waveform;
      
      // Create gain nodes at USER VOLUME
      this.gainL = this.audioContext.createGain();
      this.gainR = this.audioContext.createGain();
      this.gainL.gain.setValueAtTime(volume, this.audioContext.currentTime);
      this.gainR.gain.setValueAtTime(volume, this.audioContext.currentTime);
      
      // Create channel merger for STEREO output
      this.merger = this.audioContext.createChannelMerger(2);
      
      // 🔥 DIRECT AUDIO CHAIN - NO COMPENSATION:
      // Oscillator → Gain → Merger → Output
      // RAW WAVEFORM POWER FOR MAXIMUM VISUALIZER IMPACT!
      
      // LEFT channel: oscillator → gain → merger
      this.oscillatorL.connect(this.gainL);
      this.gainL.connect(this.merger, 0, 0); // to left channel
      
      // RIGHT channel: oscillator → gain → merger  
      this.oscillatorR.connect(this.gainR);
      this.gainR.connect(this.merger, 0, 1); // to right channel
      
      // Merger outputs RAW STEREO signal to output node
      this.merger.connect(this.outputNode);
      
      // Start oscillators
      const now = this.audioContext.currentTime;
      this.oscillatorL.start(now);
      this.oscillatorR.start(now);
      
      this.isPlaying = true;
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  /**
   * Stop audio playback
   */
  stop(): void {
    if (!this.isPlaying) {
      return;
    }

    try {
      const now = this.audioContext.currentTime;
      const fadeTime = 0.05; // 50ms fade to prevent clicks
      
      // Fade out
      if (this.gainL) {
        this.gainL.gain.setValueAtTime(this.gainL.gain.value, now);
        this.gainL.gain.exponentialRampToValueAtTime(0.001, now + fadeTime);
      }
      if (this.gainR) {
        this.gainR.gain.setValueAtTime(this.gainR.gain.value, now);
        this.gainR.gain.exponentialRampToValueAtTime(0.001, now + fadeTime);
      }
      
      // Stop oscillators after fade
      if (this.oscillatorL) {
        this.oscillatorL.stop(now + fadeTime);
      }
      if (this.oscillatorR) {
        this.oscillatorR.stop(now + fadeTime);
      }
      
      // Cleanup after fade
      setTimeout(() => this.cleanup(), fadeTime * 1000 + 50);
      
      this.isPlaying = false;
    } catch (error) {
      this.cleanup();
    }
  }

  /**
   * Update frequencies while playing
   * Maintains STEREO - updates BOTH oscillators
   */
  updateFrequencies(leftFreq: number, rightFreq: number): void {
    if (!this.isPlaying || !this.oscillatorL || !this.oscillatorR) {
      return;
    }

    const now = this.audioContext.currentTime;
    const rampTime = 0.1; // 100ms smooth transition
    
    // Update BOTH frequencies
    this.oscillatorL.frequency.setValueAtTime(this.oscillatorL.frequency.value, now);
    this.oscillatorL.frequency.exponentialRampToValueAtTime(leftFreq, now + rampTime);
    
    this.oscillatorR.frequency.setValueAtTime(this.oscillatorR.frequency.value, now);
    this.oscillatorR.frequency.exponentialRampToValueAtTime(rightFreq, now + rampTime);
    
  }

  /**
   * Update volume
   */
  updateVolume(volume: number): void {
    if (!this.gainL || !this.gainR) {
      return;
    }

    // Store base volume
    this.baseVolume = volume;
    
    // Update volume directly - no compensation
    const safeVolume = Math.max(0, Math.min(2, volume));
    const now = this.audioContext.currentTime;
    
    this.gainL.gain.setValueAtTime(safeVolume, now);
    this.gainR.gain.setValueAtTime(safeVolume, now);
  }

  /**
   * Update waveform (can be changed on the fly)
   */
  updateWaveform(waveform: OscillatorType): void {
    if (!this.oscillatorL || !this.oscillatorR) {
      return;
    }

    // Update waveform type
    this.currentWaveform = waveform;
    this.oscillatorL.type = waveform;
    this.oscillatorR.type = waveform;
    
    // No compensation needed - raw waveform power!
  }

  /**
   * Cleanup audio nodes
   */
  private cleanup(): void {
    // Disconnect all nodes
    if (this.oscillatorL) {
      this.oscillatorL.disconnect();
      this.oscillatorL = null;
    }
    if (this.oscillatorR) {
      this.oscillatorR.disconnect();
      this.oscillatorR = null;
    }
    if (this.gainL) {
      this.gainL.disconnect();
      this.gainL = null;
    }
    if (this.gainR) {
      this.gainR.disconnect();
      this.gainR = null;
    }
    if (this.merger) {
      this.merger.disconnect();
      this.merger = null;
    }
  }

  /**
   * Get playing status
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Destroy engine
   */
  destroy(): void {
    this.stop();
    this.cleanup();
  }
}