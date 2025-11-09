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

// Audio Mixer Constants
const DEFAULT_FRONTEND_GAIN = 1.0;
const DEFAULT_BACKEND_GAIN = 0.0;
const DEFAULT_HYBRID_FRONTEND = 0.5;
const DEFAULT_HYBRID_BACKEND = 0.5;
const CROSSFADE_STEPS_PER_SECOND = 60;
const ANALYSER_FFT_SIZE = 2048;
const ANALYSER_SMOOTHING = 0.8;
const ANALYSER_MIN_DECIBELS = -100;
const ANALYSER_MAX_DECIBELS = -30;

export class AudioMixer {
  private audioContext: AudioContext;
  private frontendGain: GainNode;
  private backendGain: GainNode;
  private frontendPreAnalyserGain: GainNode; // Full-strength signal for analyser
  private backendPreAnalyserGain: GainNode;  // Full-strength signal for analyser
  public analyserNode: AnalyserNode;

  private currentMode: 'hybrid'|'frontend' | 'backend' = 'frontend';
  private isCrossfading: boolean = false;
  private crossfadeTimeoutId: number | null = null;

  constructor(audioContext: AudioContext) {
    // Validate audioContext
    if (!audioContext) {
      throw new Error('AudioMixer: audioContext is required');
    }
    if (audioContext.state === 'closed') {
      throw new Error('AudioMixer: audioContext is closed');
    }

    this.audioContext = audioContext;

    // Create pre-analyser gain nodes (always at 1.0 for full strength)
    this.frontendPreAnalyserGain = audioContext.createGain();
    this.backendPreAnalyserGain = audioContext.createGain();
    this.frontendPreAnalyserGain.gain.value = 1.0; // Full strength to analyser
    this.backendPreAnalyserGain.gain.value = 1.0;  // Full strength to analyser

    // Create gain nodes for each engine (for volume control)
    this.frontendGain = audioContext.createGain();
    this.backendGain = audioContext.createGain();
    // Frontend starts at full volume (1.0), backend muted (0.0)
    this.frontendGain.gain.value = DEFAULT_FRONTEND_GAIN;
    this.backendGain.gain.value = DEFAULT_BACKEND_GAIN;

    // Create shared analyser for visualization
    this.analyserNode = audioContext.createAnalyser();
    this.analyserNode.fftSize = ANALYSER_FFT_SIZE;
    this.analyserNode.smoothingTimeConstant = ANALYSER_SMOOTHING;
    this.analyserNode.minDecibels = ANALYSER_MIN_DECIBELS;
    this.analyserNode.maxDecibels = ANALYSER_MAX_DECIBELS;

    // Signal Path Architecture:
    // Engine → Pre-Analyser Gain (1.0) → [Split to analyser + main gain]
    //                                      ├→ Analyser (full strength visualization)
    //                                      └→ Main Gain (0-1.0) → Destination (volume control)
    //
    // This ensures FrequencyVisualizer ALWAYS gets strong signal regardless of crossfade

    // Connect pre-analyser gains to analyser (full strength tap for visualization)
    this.frontendPreAnalyserGain.connect(this.analyserNode);
    this.backendPreAnalyserGain.connect(this.analyserNode);

    // Connect pre-analyser gains to main gains (for volume-controlled output)
    this.frontendPreAnalyserGain.connect(this.frontendGain);
    this.backendPreAnalyserGain.connect(this.backendGain);

    // Connect main gains to destination
    this.frontendGain.connect(audioContext.destination);
    this.backendGain.connect(audioContext.destination);
  }

  /**
   * Get gain node for frontend engine to connect to
   * Returns pre-analyser gain (always 1.0) for full-strength signal
   */
  getFrontendGain(): GainNode {
    return this.frontendPreAnalyserGain;
  }

  /**
   * Get gain node for backend engine to connect to
   * Returns pre-analyser gain (always 1.0) for full-strength signal
   */
  getBackendGain(): GainNode {
    return this.backendPreAnalyserGain;
  }

  /**
   * Get current audio mode
   */
  getMode(): 'hybrid'|'frontend' | 'backend' {
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
  }

  /**
   * Set backend gain immediately (no crossfade)
   */
  setBackendGain(value: number): void {
    const safeValue = Math.max(0, Math.min(1, value));
    this.backendGain.gain.setValueAtTime(safeValue, this.audioContext.currentTime);
  }

  /**
   * Update master volume (scales both engines proportionally)
   */
  setMasterVolume(volume: number): void {
    // Validate volume
    if (isNaN(volume)) {
      console.warn('⚠️ AudioMixer: Invalid volume (NaN), using 0.5');
      volume = 0.5;
    }

    const safeVolume = Math.max(0, Math.min(1, volume));
    const now = this.audioContext.currentTime;

    // If we're crossfading, maintain the ratio
    if (this.isCrossfading) {
      // Don't change anything during crossfade - let it complete
      return;
    }

    // Apply volume based on current mode
    if (this.currentMode === 'frontend') {
      this.frontendGain.gain.setValueAtTime(safeVolume, now); // Full volume for active engine
      this.backendGain.gain.setValueAtTime(0, now);
    } else if (this.currentMode === 'backend') {
      this.frontendGain.gain.setValueAtTime(0, now);
      this.backendGain.gain.setValueAtTime(safeVolume, now); // Full volume for active engine
    } else if (this.currentMode === 'hybrid') {
      // Hybrid mode splits volume equally (0.5 * volume each engine)
      this.frontendGain.gain.setValueAtTime(safeVolume * 0.5, now);
      this.backendGain.gain.setValueAtTime(safeVolume * 0.5, now);
    }
  }

  /**
   * Crossfade to backend engine over specified duration
   * Uses LINEAR crossfade for correlated signals (same frequency)
   *
   * Why linear instead of equal-power:
   * - Equal-power is for uncorrelated signals (different sources)
   * - Our signals are correlated (same frequency on both engines)
   * - Correlated signals add in amplitude, causing volume spike
   * - Linear crossfade maintains constant total amplitude (1.0)
   */
  crossfadeToBackend(duration: number = 2.0): void {
    if (this.isCrossfading) {
      return;
    }

    this.isCrossfading = true;
    const now = this.audioContext.currentTime;

    // Dynamic step calculation for smooth crossfade
    const steps = Math.max(20, Math.floor(duration * CROSSFADE_STEPS_PER_SECOND));
    const stepTime = duration / steps;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps; // 0 to 1

      // Linear crossfade for correlated signals (maintains constant total gain)
      const frontendGain = (1 - progress) * 1.0; // Decreases from 1.0 to 0
      const backendGain = progress * 1.0;        // Increases from 0 to 1.0
      // Total always = 1.0 (constant perceived loudness)

      const time = now + (i * stepTime);

      if (i === 0) {
        // Set initial values
        this.frontendGain.gain.setValueAtTime(frontendGain, time);
        this.backendGain.gain.setValueAtTime(backendGain, time);
      } else {
        // Linear ramp to next value
        this.frontendGain.gain.linearRampToValueAtTime(frontendGain, time);
        this.backendGain.gain.linearRampToValueAtTime(backendGain, time);
      }
    }

    // Update mode after crossfade completes
    this.crossfadeTimeoutId = setTimeout(() => {
      this.currentMode = 'backend';
      this.isCrossfading = false;
      this.crossfadeTimeoutId = null;
    }, duration * 1000) as unknown as number;
  }

  /**
   * Instant failover to frontend (for backend disconnection)
   * No crossfade - immediate switch for zero dropout
   */
  failoverToFrontend(): void {
    const now = this.audioContext.currentTime;

    // Instant failover: frontend full volume, backend off
    this.frontendGain.gain.setValueAtTime(1.0, now);
    this.backendGain.gain.setValueAtTime(0.0, now);

    this.currentMode = 'frontend';
    this.isCrossfading = false;
  }

  /**
   * Crossfade to frontend engine (graceful switch)
   * Uses LINEAR crossfade for correlated signals (same frequency)
   */
  crossfadeToFrontend(duration: number = 2.0): void {
    if (this.isCrossfading) {
      return;
    }

    this.isCrossfading = true;
    const now = this.audioContext.currentTime;

    // Get current gain values (don't assume starting point)
    const currentFrontendGain = this.frontendGain.gain.value;
    const currentBackendGain = this.backendGain.gain.value;

    // Dynamic step calculation for smooth crossfade
    const steps = Math.max(20, Math.floor(duration * CROSSFADE_STEPS_PER_SECOND));
    const stepTime = duration / steps;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps; // 0 to 1

      // Linear crossfade from current values to target
      const backendGain = currentBackendGain * (1 - progress);
      const frontendGain = currentFrontendGain + (1.0 - currentFrontendGain) * progress;

      const time = now + (i * stepTime);

      if (i === 0) {
        this.backendGain.gain.setValueAtTime(backendGain, time);
        this.frontendGain.gain.setValueAtTime(frontendGain, time);
      } else {
        this.backendGain.gain.linearRampToValueAtTime(backendGain, time);
        this.frontendGain.gain.linearRampToValueAtTime(frontendGain, time);
      }
    }

    this.crossfadeTimeoutId = setTimeout(() => {
      this.currentMode = 'frontend';
      this.isCrossfading = false;
      this.crossfadeTimeoutId = null;
    }, duration * 1000) as unknown as number;
  }

  /**
   * Set to hybrid mode (both engines playing simultaneously)
   * Useful for testing or special effects
   */
  setHybridMode(frontendRatio: number = DEFAULT_HYBRID_FRONTEND, backendRatio: number = DEFAULT_HYBRID_BACKEND): void {
    const now = this.audioContext.currentTime;

    // Validate total gain
    const totalGain = frontendRatio + backendRatio;
    if (totalGain > 1.0) {
      console.warn(`⚠️ AudioMixer: Hybrid mode total gain ${totalGain.toFixed(2)} exceeds 1.0, may cause clipping`);
    }

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
    try {
      // Cancel pending timeouts
      if (this.crossfadeTimeoutId !== null) {
        clearTimeout(this.crossfadeTimeoutId);
        this.crossfadeTimeoutId = null;
      }

      // Disconnect all nodes
      this.frontendPreAnalyserGain?.disconnect();
      this.backendPreAnalyserGain?.disconnect();
      this.frontendGain?.disconnect();
      this.backendGain?.disconnect();
      this.analyserNode?.disconnect();
    } catch (error) {
      console.error('⚠️ AudioMixer cleanup error:', error);
    }
  }
}
