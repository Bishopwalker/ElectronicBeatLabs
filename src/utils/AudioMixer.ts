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
const INITIAL_FRONTEND_GAIN = 1.0;  // Frontend starts at full volume (active)
const INITIAL_BACKEND_GAIN = 0.0;   // Backend starts muted (not connected yet)
const DEFAULT_HYBRID_FRONTEND = 0.5;  // 🔥 FIXED: 50% split prevents clipping (was 0.9)
const DEFAULT_HYBRID_BACKEND = 0.5;   // 🔥 FIXED: 50% split for total 1.0 (was 0.9)
const CROSSFADE_STEPS_PER_SECOND = 60;
const ANALYSER_FFT_SIZE = 2048;
const ANALYSER_SMOOTHING = 0.8;
const ANALYSER_MIN_DECIBELS = -100;
const ANALYSER_MAX_DECIBELS = -30;

export class AudioMixer {
  private readonly audioContext: AudioContext; // 🔥 FIXED: Made readonly - never reassigned
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

    // 🔥 FIXED: Use this.audioContext consistently instead of parameter
    // This ensures we're using the class instance variable, not the shadowed parameter

    // Create pre-analyser gain nodes (always at 1.0 for full strength)
    this.frontendPreAnalyserGain = this.audioContext.createGain();
    this.backendPreAnalyserGain = this.audioContext.createGain();
    this.frontendPreAnalyserGain.gain.value = 1.0; // Full strength to analyser
    this.backendPreAnalyserGain.gain.value = 1.0;  // Full strength to analyser

    // Create gain nodes for each engine (for volume control)
    this.frontendGain = this.audioContext.createGain();
    this.backendGain = this.audioContext.createGain();
    // 🔥 FIXED: Frontend starts at full volume (1.0), backend muted (0.0)
    // This prevents volume spikes during crossfade - backend is silent until connected
    this.frontendGain.gain.value = INITIAL_FRONTEND_GAIN; // 1.0 - active
    this.backendGain.gain.value = INITIAL_BACKEND_GAIN;   // 0.0 - muted

    // Create shared analyser for visualization
    this.analyserNode = this.audioContext.createAnalyser();
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
    this.frontendGain.connect(this.audioContext.destination);
    this.backendGain.connect(this.audioContext.destination);
  }

  /**
   * Get input node for frontend engine to connect to
   * Returns pre-analyser gain (always 1.0) for full-strength signal before volume control
   */
  getFrontendInput(): GainNode {
    return this.frontendPreAnalyserGain;
  }

  /**
   * Get input node for backend engine to connect to
   * Returns pre-analyser gain (always 1.0) for full-strength signal before volume control
   */
  getBackendInput(): GainNode {
    return this.backendPreAnalyserGain;
  }

  /**
   * Get the actual frontend volume control gain node
   * This is the main gain that controls frontend output volume (0-1.0)
   */
  getFrontendGain(): GainNode {
    return this.frontendGain;
  }

  /**
   * Get the actual backend volume control gain node
   * This is the main gain that controls backend output volume (0-1.0)
   */
  getBackendGain(): GainNode {
    return this.backendGain;
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
      console.warn('⚠️ AudioMixer: Invalid volume (NaN), using 0.8');
      volume = 0.8;
    }

    const safeVolume = Math.max(0, Math.min(1, volume));
    const now = this.audioContext.currentTime;

    // 🔥 FIXED: Allow volume updates during crossfade (apply proportionally)
    if (this.isCrossfading) {
      const frontendRatio = this.frontendGain.gain.value;
      const backendRatio = this.backendGain.gain.value;
      const total = frontendRatio + backendRatio;

      if (total > 0) {
        // Apply new volume while maintaining current crossfade ratio
        this.frontendGain.gain.setValueAtTime(safeVolume * (frontendRatio / total), now);
        this.backendGain.gain.setValueAtTime(safeVolume * (backendRatio / total), now);
      }
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
      // 🔥 FIXED: Hybrid mode splits volume equally (0.5 each = 1.0 total)
      // This prevents clipping and distortion from volume exceeding 1.0
      this.frontendGain.gain.setValueAtTime(safeVolume * DEFAULT_HYBRID_FRONTEND, now);
      this.backendGain.gain.setValueAtTime(safeVolume * DEFAULT_HYBRID_BACKEND, now);
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
  crossfadeToBackend(duration: number = 20.0): void {
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
    this.backendGain.gain.setValueAtTime(.0, now);

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
    const currentBackendGain = this.backendGain.gain.value;

    // Dynamic step calculation for smooth crossfade
    const steps = Math.max(20, Math.floor(duration * CROSSFADE_STEPS_PER_SECOND));
    const stepTime = duration / steps;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps; // 0 to 1

      // 🔥 FIXED: Linear crossfade maintaining constant total=1.0
      // Backend fades out, frontend fills the gap to keep total constant
      // This prevents volume spikes during mixed/hybrid state transitions
      const backendGain = currentBackendGain * (1 - progress);  // Decreases from current → 0
      const frontendGain = 1.0 - backendGain;  // Increases to fill gap → 1.0
      // Total always = backendGain + frontendGain = 1.0 (constant perceived loudness)

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

    // 🔥 FIXED: Auto-normalize if total gain exceeds 1.0 (prevents clipping)
    let totalGain = frontendRatio + backendRatio;
    if (totalGain > 1.0) {
      const scale = 1.0 / totalGain;
      frontendRatio *= scale;
      backendRatio *= scale;
      console.warn(`⚠️ AudioMixer: Hybrid mode total gain ${totalGain.toFixed(2)} exceeded 1.0, normalized to ${frontendRatio.toFixed(2)} + ${backendRatio.toFixed(2)} = 1.0`);
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