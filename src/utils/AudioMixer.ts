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
  private frontendPreAnalyserGain: GainNode; // 🔥 NEW: Full-strength signal for analyser
  private backendPreAnalyserGain: GainNode;  // 🔥 NEW: Full-strength signal for analyser
  public analyserNode: AnalyserNode;

  private currentMode: 'hybrid'|'frontend' | 'backend' = 'frontend';
  private isCrossfading: boolean = false;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;

    // 🔥 NEW: Create pre-analyser gain nodes (always at 1.0 for full strength)
    this.frontendPreAnalyserGain = audioContext.createGain();
    this.backendPreAnalyserGain = audioContext.createGain();
    this.frontendPreAnalyserGain.gain.value = 1.0; // Full strength to analyser
    this.backendPreAnalyserGain.gain.value = 1.0;  // Full strength to analyser

    // Create gain nodes for each engine (for volume control)
    this.frontendGain = audioContext.createGain();
    this.backendGain = audioContext.createGain();
    // Start with frontend at 50% volume (equal-power standard), backend muted
    this.frontendGain.gain.value = 0.5;
    this.backendGain.gain.value = 0.0;  // Backend starts muted

    // Create shared analyser for visualization
    this.analyserNode = audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.8;
    // 🔥 FIXED: Analyser now receives full-strength signals, so use standard settings
    this.analyserNode.minDecibels = -100;
    this.analyserNode.maxDecibels = -30;

    // 🔥 NEW ARCHITECTURE: Linear signal path with full-strength analyser tap
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
   * 🔥 RETURNS: Pre-analyser gain (always 1.0) for full-strength signal
   */
  getFrontendGain(): GainNode {
    return this.frontendPreAnalyserGain; // Return pre-analyser gain, not main gain
  }

  /**
   * Get gain node for backend engine to connect to
   * 🔥 RETURNS: Pre-analyser gain (always 1.0) for full-strength signal
   */
  getBackendGain(): GainNode {
    return this.backendPreAnalyserGain; // Return pre-analyser gain, not main gain
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
    const safeVolume = Math.max(0, Math.min(2, volume));
    const now = this.audioContext.currentTime;

    // DON'T override crossfade! Scale the existing gains proportionally
    const currentFrontend = this.frontendGain.gain.value;
    const currentBackend = this.backendGain.gain.value;

    // If we're crossfading, maintain the ratio
    if (this.isCrossfading) {
      // Don't change anything during crossfade - let it complete
      return;
    }
    
    // Apply volume based on current mode
    if (this.currentMode === 'frontend') {
      this.frontendGain.gain.setValueAtTime(safeVolume * 0.5, now); // 50% base volume
      this.backendGain.gain.setValueAtTime(0, now);
    } else if (this.currentMode === 'backend') {
      this.frontendGain.gain.setValueAtTime(0, now);
      this.backendGain.gain.setValueAtTime(safeVolume * 0.5, now); // 50% base volume
    } else if (this.currentMode === 'hybrid') {
      // In hybrid mode, split volume to prevent doubling (0.25 + 0.25 = 0.5 total)
      this.frontendGain.gain.setValueAtTime(safeVolume * 0.25, now);
      this.backendGain.gain.setValueAtTime(safeVolume * 0.25, now);
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
   * - Linear crossfade maintains constant total amplitude (0.5)
   */
  crossfadeToBackend(duration: number = 2.0): void {
    if (this.isCrossfading) {
      return;
    }

    this.isCrossfading = true;
    const now = this.audioContext.currentTime;
    const endTime = now + duration;

    const steps = 20; // Number of interpolation points
    const stepTime = duration / steps;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps; // 0 to 1

      // Linear crossfade for correlated signals (maintains constant total gain)
      const frontendGain = (1 - progress) * 0.5; // Decreases from 0.5 to 0
      const backendGain = progress * 0.5;        // Increases from 0 to 0.5
      // Total always = 0.5 (no volume spike!)

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
    setTimeout(() => {
      this.currentMode = 'backend';
      this.isCrossfading = false;
    }, duration * 1000);
  }

  /**
   * Instant failover to frontend (for backend disconnection)
   * No crossfade - immediate switch for zero dropout
   */
  failoverToFrontend(): void {
    const now = this.audioContext.currentTime;

    // Instant switch - no ramp
    // Use 0.5 for equal-power standard
    this.frontendGain.gain.setValueAtTime(0.5, now);
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
    const endTime = now + duration;

    const steps = 20;
    const stepTime = duration / steps;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps; // 0 to 1

      // Linear crossfade for correlated signals (maintains constant total gain)
      const backendGain = (1 - progress) * 0.5;  // Decreases from 0.5 to 0
      const frontendGain = progress * 0.5;       // Increases from 0 to 0.5
      // Total always = 0.5 (no volume spike!)

      const time = now + (i * stepTime);

      if (i === 0) {
        this.backendGain.gain.setValueAtTime(backendGain, time);
        this.frontendGain.gain.setValueAtTime(frontendGain, time);
      } else {
        this.backendGain.gain.linearRampToValueAtTime(backendGain, time);
        this.frontendGain.gain.linearRampToValueAtTime(frontendGain, time);
      }
    }

    setTimeout(() => {
      this.currentMode = 'frontend';
      this.isCrossfading = false;
    }, duration * 1000);
  }

  /**
   * Set to hybrid mode (both engines playing simultaneously)
   * Useful for testing or special effects
   */
  setHybridMode(frontendRatio: number = 0.5, backendRatio: number = 0.5): void {
    const now = this.audioContext.currentTime;

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

    this.frontendGain.disconnect();
    this.backendGain.disconnect();
    this.analyserNode.disconnect();
  }
}