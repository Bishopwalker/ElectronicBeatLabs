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
  // REMOVED: merger not needed - we mix stereo signals directly
  public analyserNode: AnalyserNode;

  private currentMode: 'frontend' | 'backend' | 'hybrid' = 'frontend';
  private isCrossfading: boolean = false;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;

    // Create gain nodes for each engine
    this.frontendGain = audioContext.createGain();
    this.backendGain = audioContext.createGain();

    // Start with frontend at 50% volume (equal-power standard), backend muted
    this.frontendGain.gain.value = 0.5;
    this.backendGain.gain.value = 0.0;

    // No merger needed - stereo signals mix naturally at the analyser

    // Create shared analyser for visualization
    this.analyserNode = audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.8;

    // FIXED: Connect audio chain properly for STEREO signals
    // Both engines output stereo → Mix them together → analyser → destination
    // Don't use merger - just sum the gains directly!
    this.frontendGain.connect(this.analyserNode);
    this.backendGain.connect(this.analyserNode);
    this.analyserNode.connect(audioContext.destination);

    console.log('🎚️ AudioMixer: Initialized with STEREO dual-engine crossfade');
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
   * Update master volume (scales both engines proportionally)
   */
  setMasterVolume(volume: number): void {
    const safeVolume = Math.max(0, Math.min(2, volume));
    const now = this.audioContext.currentTime;

    // 🔍 DEBUG LOGGING: Track volume changes (Phase 1)
    console.log(`🎚️ [AUDIOMIXER DEBUG] setMasterVolume called:`);
    console.log(`   ├─ input volume=${volume.toFixed(3)}, safe volume=${safeVolume.toFixed(3)}`);
    console.log(`   ├─ current mode=${this.currentMode}`);
    console.log(`   └─ crossfading=${this.isCrossfading}`);

    // DON'T override crossfade! Scale the existing gains proportionally
    const currentFrontend = this.frontendGain.gain.value;
    const currentBackend = this.backendGain.gain.value;
    
    // If we're crossfading, maintain the ratio
    if (this.isCrossfading) {
      // Don't change anything during crossfade - let it complete
      console.log(`⚠️ AudioMixer: Volume change during crossfade ignored`);
      return;
    }
    
    // Apply volume based on current mode
    if (this.currentMode === 'frontend') {
      this.frontendGain.gain.setValueAtTime(safeVolume * 0.5, now); // 50% for equal-power
      this.backendGain.gain.setValueAtTime(0, now);
      console.log(`   ├─ FRONTEND mode: frontendGain=${(safeVolume * 0.5).toFixed(3)}, backendGain=0.000`);
    } else if (this.currentMode === 'backend') {
      this.frontendGain.gain.setValueAtTime(0, now);
      this.backendGain.gain.setValueAtTime(safeVolume * 0.5, now); // 50% for equal-power
      console.log(`   ├─ BACKEND mode: frontendGain=0.000, backendGain=${(safeVolume * 0.5).toFixed(3)}`);
    } else if (this.currentMode === 'hybrid') {
      // In hybrid mode, split volume to prevent doubling
      this.frontendGain.gain.setValueAtTime(safeVolume * 0.25, now);
      this.backendGain.gain.setValueAtTime(safeVolume * 0.25, now);
      console.log(`   ├─ HYBRID mode: frontendGain=${(safeVolume * 0.25).toFixed(3)}, backendGain=${(safeVolume * 0.25).toFixed(3)}`);
    }

    console.log(`   └─ Master volume set to ${safeVolume.toFixed(2)}`);
  }

  /**
   * Crossfade to backend engine over specified duration
   * Uses EQUAL-POWER crossfade to maintain constant perceived loudness
   */
  crossfadeToBackend(duration: number = 2.0): void {
    if (this.isCrossfading) {
      console.warn('⚠️ AudioMixer: Crossfade already in progress, skipping...');
      return;
    }

    this.isCrossfading = true;
    const now = this.audioContext.currentTime;
    const endTime = now + duration;

    // 🔍 DEBUG LOGGING: Crossfade tracking (Phase 1)
    console.log(`🎚️ [AUDIOMIXER DEBUG] Starting crossfade to BACKEND:`);
    console.log(`   ├─ duration=${duration.toFixed(1)}s`);
    console.log(`   ├─ current frontend gain=${this.frontendGain.gain.value.toFixed(3)}`);
    console.log(`   ├─ current backend gain=${this.backendGain.gain.value.toFixed(3)}`);
    console.log(`   └─ using equal-power curve (cosine/sine)`);

    // EQUAL-POWER CROSSFADE: Use cosine/sine curves
    // This maintains constant perceived loudness during crossfade
    // Frontend goes from cos(0) = 1 to cos(π/2) = 0
    // Backend goes from sin(0) = 0 to sin(π/2) = 1
    
    const steps = 20; // Number of interpolation points
    const stepTime = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const angle = progress * Math.PI / 2; // 0 to π/2
      
      // Equal-power curves
      const frontendGain = Math.cos(angle) * 0.5; // Max 0.5 to prevent clipping
      const backendGain = Math.sin(angle) * 0.5;  // Max 0.5 to prevent clipping
      
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
      console.log('✅ AudioMixer: Equal-power crossfade to backend complete');
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
    // Use 0.5 for equal-power standard
    this.frontendGain.gain.setValueAtTime(0.5, now);
    this.backendGain.gain.setValueAtTime(0.0, now);

    this.currentMode = 'frontend';
    this.isCrossfading = false;
  }

  /**
   * Crossfade to frontend engine (graceful switch)
   * Uses EQUAL-POWER crossfade to maintain constant perceived loudness
   */
  crossfadeToFrontend(duration: number = 2.0): void {
    if (this.isCrossfading) {
      console.warn('⚠️ AudioMixer: Crossfade already in progress, skipping...');
      return;
    }

    this.isCrossfading = true;
    const now = this.audioContext.currentTime;
    const endTime = now + duration;

    console.log(`🎚️ AudioMixer: EQUAL-POWER crossfading to FRONTEND over ${duration}s...`);

    // EQUAL-POWER CROSSFADE: Reverse of backend crossfade
    // Backend goes from cos(0) = 1 to cos(π/2) = 0  
    // Frontend goes from sin(0) = 0 to sin(π/2) = 1
    
    const steps = 20;
    const stepTime = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const angle = progress * Math.PI / 2;
      
      // Equal-power curves (reversed)
      const backendGain = Math.cos(angle) * 0.5;
      const frontendGain = Math.sin(angle) * 0.5;
      
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
      console.log('✅ AudioMixer: Equal-power crossfade to frontend complete');
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
    this.analyserNode.disconnect();
  }
}
