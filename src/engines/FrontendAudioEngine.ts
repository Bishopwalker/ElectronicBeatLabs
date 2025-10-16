/**
 * FrontendAudioEngine - Web Audio API Binaural Beat Generator
 * 
 * CRITICAL: This engine generates STEREO audio (left + right frequencies)
 * Creates two oscillators for true binaural beats
 * Both frequencies are output to create the beat frequency
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

  constructor(audioContext: AudioContext, outputNode: AudioNode) {
    this.audioContext = audioContext;
    this.outputNode = outputNode;
    
    console.log('🎵 FrontendAudioEngine initialized (STEREO mode)');
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
      console.warn('⚠️ FrontendEngine: Already playing, stopping first...');
      this.stop();
    }

    console.log(`🎵 FrontendEngine: Starting STEREO binaural beat`);
    console.log(`   Left ear: ${leftFreq}Hz, Right ear: ${rightFreq}Hz`);
    console.log(`   Beat frequency: ${Math.abs(rightFreq - leftFreq)}Hz`);

    try {
      // Create STEREO oscillators
      this.oscillatorL = this.audioContext.createOscillator();
      this.oscillatorR = this.audioContext.createOscillator();
      
      // Set frequencies
      this.oscillatorL.frequency.setValueAtTime(leftFreq, this.audioContext.currentTime);
      this.oscillatorR.frequency.setValueAtTime(rightFreq, this.audioContext.currentTime);
      
      // Set waveform
      this.oscillatorL.type = waveform;
      this.oscillatorR.type = waveform;
      
      // Create gain nodes
      this.gainL = this.audioContext.createGain();
      this.gainR = this.audioContext.createGain();
      this.gainL.gain.setValueAtTime(volume, this.audioContext.currentTime);
      this.gainR.gain.setValueAtTime(volume, this.audioContext.currentTime);
      
      // Create channel merger for STEREO output
      this.merger = this.audioContext.createChannelMerger(2);
      
      // Connect STEREO audio chain
      // LEFT oscillator → gain → merger (left channel)
      this.oscillatorL.connect(this.gainL);
      this.gainL.connect(this.merger, 0, 0); // to left channel
      
      // RIGHT oscillator → gain → merger (right channel)
      this.oscillatorR.connect(this.gainR);
      this.gainR.connect(this.merger, 0, 1); // to right channel
      
      // Merger outputs STEREO signal to output node
      this.merger.connect(this.outputNode);
      
      // Start oscillators
      const now = this.audioContext.currentTime;
      this.oscillatorL.start(now);
      this.oscillatorR.start(now);
      
      this.isPlaying = true;
      console.log('✅ FrontendEngine: STEREO binaural beat started');
    } catch (error) {
      console.error('❌ FrontendEngine: Failed to start:', error);
      this.cleanup();
      throw error;
    }
  }

  /**
   * Stop audio playback
   */
  stop(): void {
    if (!this.isPlaying) {
      console.log('⚠️ FrontendEngine: Not playing, nothing to stop');
      return;
    }

    console.log('🛑 FrontendEngine: Stopping STEREO playback...');
    
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
      console.log('✅ FrontendEngine: Stopped');
    } catch (error) {
      console.error('❌ FrontendEngine: Error stopping:', error);
      this.cleanup();
    }
  }

  /**
   * Update frequencies while playing
   * Maintains STEREO - updates BOTH oscillators
   */
  updateFrequencies(leftFreq: number, rightFreq: number): void {
    if (!this.isPlaying || !this.oscillatorL || !this.oscillatorR) {
      console.warn('⚠️ FrontendEngine: Cannot update - not playing');
      return;
    }

    const now = this.audioContext.currentTime;
    const rampTime = 0.1; // 100ms smooth transition
    
    // Update BOTH frequencies
    this.oscillatorL.frequency.setValueAtTime(this.oscillatorL.frequency.value, now);
    this.oscillatorL.frequency.exponentialRampToValueAtTime(leftFreq, now + rampTime);
    
    this.oscillatorR.frequency.setValueAtTime(this.oscillatorR.frequency.value, now);
    this.oscillatorR.frequency.exponentialRampToValueAtTime(rightFreq, now + rampTime);
    
    console.log(`🎛️ FrontendEngine: Updated STEREO frequencies - L:${leftFreq}Hz, R:${rightFreq}Hz`);
  }

  /**
   * Update volume
   */
  updateVolume(volume: number): void {
    if (!this.gainL || !this.gainR) {
      console.warn('⚠️ FrontendEngine: Cannot update volume - not playing');
      return;
    }

    const safeVolume = Math.max(0, Math.min(2, volume));
    const now = this.audioContext.currentTime;
    
    this.gainL.gain.setValueAtTime(safeVolume, now);
    this.gainR.gain.setValueAtTime(safeVolume, now);
    
    console.log(`🔊 FrontendEngine: Volume set to ${safeVolume.toFixed(2)}`);
  }

  /**
   * Update waveform (requires restart)
   */
  updateWaveform(waveform: OscillatorType): void {
    if (!this.oscillatorL || !this.oscillatorR) {
      console.warn('⚠️ FrontendEngine: Cannot update waveform - not playing');
      return;
    }

    // Waveform can be changed on the fly
    this.oscillatorL.type = waveform;
    this.oscillatorR.type = waveform;
    
    console.log(`🌊 FrontendEngine: Waveform changed to ${waveform}`);
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
    console.log('🧹 FrontendEngine: Destroying...');
    this.stop();
    this.cleanup();
  }
}