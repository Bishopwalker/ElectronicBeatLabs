/**
 * AudioMixer - Dual Engine Audio Crossfading System
 *
 * Manages two audio sources (frontend + backend) with seamless crossfading:
 * - Frontend: Web Audio API oscillators (instant, low latency)
 * - Backend: WebSocket AudioWorklet stream (precision, complex patterns)
 *
 * Features:
 * - Smart crossfade between engines (2s smooth transition)
 * - Instant fallback to frontend if backend drops
 * - Shared AnalyserNode for visualization
 * - Zero-dropout audio continuity
 */

export class AudioMixer {
  private audioContext: AudioContext;
  private frontendGain: GainNode;
  private backendGain: GainNode;
  private merger: ChannelMergerNode;
  public analyserNode: AnalyserNode;

  private currentMode: 'frontend' | 'backend' | 'hybrid' = 'frontend';
  private isCrossfading: boolean = false;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;

    // Create gain nodes for each engine
    this.frontendGain = audioContext.createGain();
    this.backendGain = audioContext.createGain();

    // Start with frontend at full volume, backend muted
    this.frontendGain.gain.value = 1.0;
    this.backendGain.gain.value = 0.0;

    // Create channel merger to combine both sources
    this.merger = audioContext.createChannelMerger(2);

    // Create shared analyser for visualization
    this.analyserNode = audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.8;

    // Connect audio chain:
    // Both gains → merger → analyser → destination
    this.frontendGain.connect(this.merger, 0, 0);
    this.backendGain.connect(this.merger, 0, 1);
    this.merger.connect(this.analyserNode);
    this.analyserNode.connect(audioContext.destination);

    console.log('🎚️ AudioMixer: Initialized with dual-engine crossfade capability');
  }

  /**
   * Get gain node for frontend engine to connect to
   */
  getFrontendGain(): GainNode {
    return this.frontendGain;
  }

  /**
   * Get gain node for backend engine to connect to
   */
  getBackendGain(): GainNode {
    return this.backendGain;
  }

  /**
   * Get current audio mode
   */
  getMode(): 'frontend' | 'backend' | 'hybrid' {
    return this.currentMode;
  }

  /**
   * Check if currently crossfading
   */
  getIsCrossfading(): boolean {
    return this.isCrossfading;
  }

  /**
   * Set frontend gain immediately (no crossfade)
   */
  setFrontendGain(value: number): void {
    const safeValue = Math.max(0, Math.min(1, value));
    this.frontendGain.gain.setValueAtTime(safeValue, this.audioContext.currentTime);
    console.log(`🎚️ AudioMixer: Frontend gain set to ${safeValue.toFixed(2)}`);
  }

  /**
   * Set backend gain immediately (no crossfade)
   */
  setBackendGain(value: number): void {
    const safeValue = Math.max(0, Math.min(1, value));
    this.backendGain.gain.setValueAtTime(safeValue, this.audioContext.currentTime);
    console.log(`🎚️ AudioMixer: Backend gain set to ${safeValue.toFixed(2)}`);
  }

  /**
   * Update master volume (affects both engines proportionally)
   */
  setMasterVolume(volume: number): void {
    const safeVolume = Math.max(0, Math.min(2, volume));
    const now = this.audioContext.currentTime;

    // Scale both gains proportionally to maintain crossfade ratio
    const frontendRatio = this.frontendGain.gain.value;
    const backendRatio = this.backendGain.gain.value;
    const totalRatio = frontendRatio + backendRatio;

    if (totalRatio > 0) {
      this.frontendGain.gain.setValueAtTime((frontendRatio / totalRatio) * safeVolume, now);
      this.backendGain.gain.setValueAtTime((backendRatio / totalRatio) * safeVolume, now);
    }

    console.log(`🔊 AudioMixer: Master volume set to ${safeVolume.toFixed(2)}`);
  }

  /**
   * Crossfade to backend engine over specified duration
   * Frontend fades out, backend fades in
   */
  crossfadeToBackend(duration: number = 2.0): void {
    if (this.isCrossfading) {
      console.warn('⚠️ AudioMixer: Crossfade already in progress, skipping...');
      return;
    }

    this.isCrossfading = true;
    const now = this.audioContext.currentTime;
    const endTime = now + duration;

    console.log(`🎚️ AudioMixer: Crossfading to BACKEND over ${duration}s...`);

    // Smooth exponential ramp for professional fade
    this.frontendGain.gain.setValueAtTime(this.frontendGain.gain.value, now);
    this.frontendGain.gain.exponentialRampToValueAtTime(0.001, endTime); // Nearly zero

    this.backendGain.gain.setValueAtTime(this.backendGain.gain.value, now);
    this.backendGain.gain.exponentialRampToValueAtTime(1.0, endTime);

    // Update mode after crossfade completes
    setTimeout(() => {
      this.currentMode = 'backend';
      this.isCrossfading = false;
      console.log('✅ AudioMixer: Crossfade to backend complete');
    }, duration * 1000);
  }

  /**
   * Instant failover to frontend (for backend disconnection)
   * No crossfade - immediate switch for zero dropout
   */
  failoverToFrontend(): void {
    const now = this.audioContext.currentTime;

    console.log('🚨 AudioMixer: INSTANT FAILOVER to frontend (backend dropped)');

    // Instant switch - no ramp
    this.frontendGain.gain.setValueAtTime(1.0, now);
    this.backendGain.gain.setValueAtTime(0.0, now);

    this.currentMode = 'frontend';
    this.isCrossfading = false;
  }

  /**
   * Crossfade to frontend engine (graceful switch)
   */
  crossfadeToFrontend(duration: number = 2.0): void {
    if (this.isCrossfading) {
      console.warn('⚠️ AudioMixer: Crossfade already in progress, skipping...');
      return;
    }

    this.isCrossfading = true;
    const now = this.audioContext.currentTime;
    const endTime = now + duration;

    console.log(`🎚️ AudioMixer: Crossfading to FRONTEND over ${duration}s...`);

    this.frontendGain.gain.setValueAtTime(this.frontendGain.gain.value, now);
    this.frontendGain.gain.exponentialRampToValueAtTime(1.0, endTime);

    this.backendGain.gain.setValueAtTime(this.backendGain.gain.value, now);
    this.backendGain.gain.exponentialRampToValueAtTime(0.001, endTime);

    setTimeout(() => {
      this.currentMode = 'frontend';
      this.isCrossfading = false;
      console.log('✅ AudioMixer: Crossfade to frontend complete');
    }, duration * 1000);
  }

  /**
   * Set to hybrid mode (both engines playing simultaneously)
   * Useful for testing or special effects
   */
  setHybridMode(frontendRatio: number = 0.5, backendRatio: number = 0.5): void {
    const now = this.audioContext.currentTime;

    console.log(`🔀 AudioMixer: Setting HYBRID mode (F:${frontendRatio} B:${backendRatio})`);

    this.frontendGain.gain.setValueAtTime(frontendRatio, now);
    this.backendGain.gain.setValueAtTime(backendRatio, now);

    this.currentMode = 'hybrid';
    this.isCrossfading = false;
  }

  /**
   * Get current gain values for debugging
   */
  getGainValues(): { frontend: number; backend: number } {
    return {
      frontend: this.frontendGain.gain.value,
      backend: this.backendGain.gain.value
    };
  }

  /**
   * Cleanup - disconnect all nodes
   */
  destroy(): void {
    console.log('🧹 AudioMixer: Cleaning up...');

    this.frontendGain.disconnect();
    this.backendGain.disconnect();
    this.merger.disconnect();
    this.analyserNode.disconnect();
  }
}
