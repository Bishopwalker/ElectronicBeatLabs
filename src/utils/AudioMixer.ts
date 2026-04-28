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
 * - EQ integration with dynamic routing
 * - Spatial audio effects (toroidal, vortex, spiral, wave, 8D, combined)
 */

import { True8DSpatialEngine } from '../engines/spatial/True8DSpatialEngine';
import type { SpatialEffectMode } from '../types';

// Audio Mixer Constants
const INITIAL_FRONTEND_GAIN = 1.0;
const INITIAL_BACKEND_GAIN = 0.0;
const DEFAULT_HYBRID_FRONTEND = 0.5;
const DEFAULT_HYBRID_BACKEND = 0.5;
const DEFAULT_VOLUME_FALLBACK = 0.8;
const CROSSFADE_STEPS_PER_SECOND = 60;
const ANALYSER_FFT_SIZE = 2048;
const ANALYSER_SMOOTHING = 0.8;
const ANALYSER_MIN_DECIBELS = -100;
const ANALYSER_MAX_DECIBELS = -30;
const PRE_ANALYSER_GAIN_VALUE = 2.0;
const MIN_CROSSFADE_STEPS = 20;

// Waveform compensation values to prevent distortion
const WAVEFORM_GAIN_COMPENSATION = {
  'sine': 1.0,      // Reference level
  'square': 0.5,    // Square is ~2x louder than sine
  'triangle': 0.65, // Triangle is ~1.5x louder
  'sawtooth': 0.6,  // Sawtooth is ~1.7x louder
};

// Smooth crossfade for waveform changes
const WAVEFORM_TRANSITION_TIME = 0.05; // 50ms smooth transition

export class AudioMixer {
  private readonly audioContext: AudioContext;
  private frontendGain: GainNode;
  private backendGain: GainNode;
  private frontendPreAnalyserGain: GainNode;
  private backendPreAnalyserGain: GainNode;
  public analyserNode: AnalyserNode;

  private currentMode: 'hybrid' | 'frontend' | 'backend' = 'frontend';
  private isCrossfading = false;
  private crossfadeTimeoutId: number | null = null;

  // Waveform compensation tracking
  private currentWaveform: 'sine' | 'square' | 'triangle' | 'sawtooth' = 'sine';
  private waveformCompensationNode: GainNode;
  private targetCompensation = 1.0;
  private currentMasterVolume = 1.0;

  // EQ integration - nodes provided by useEqualizer hook
  private eqInputNode: GainNode | null = null;
  private eqOutputNode: GainNode | null = null;
  private eqEnabled = false;

  // Spatial audio engine
  private spatialEngine: True8DSpatialEngine | null = null;
  private spatialEnabled = false;
  private currentSpatialMode: SpatialEffectMode = 'none';

  constructor(audioContext: AudioContext) {
    if (!audioContext) {
      throw new Error('AudioMixer: audioContext is required');
    }
    if (audioContext.state === 'closed') {
      throw new Error('AudioMixer: audioContext is closed');
    }

    this.audioContext = audioContext;

    this.frontendPreAnalyserGain = this.audioContext.createGain();
    this.backendPreAnalyserGain = this.audioContext.createGain();
    this.frontendPreAnalyserGain.gain.value = PRE_ANALYSER_GAIN_VALUE;
    this.backendPreAnalyserGain.gain.value = PRE_ANALYSER_GAIN_VALUE;

    this.frontendGain = this.audioContext.createGain();
    this.backendGain = this.audioContext.createGain();
    this.frontendGain.gain.value = INITIAL_FRONTEND_GAIN;
    this.backendGain.gain.value = INITIAL_BACKEND_GAIN;

    // Create waveform compensation node
    this.waveformCompensationNode = this.audioContext.createGain();
    this.waveformCompensationNode.gain.value = WAVEFORM_GAIN_COMPENSATION['sine'];

    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = ANALYSER_FFT_SIZE;
    this.analyserNode.smoothingTimeConstant = ANALYSER_SMOOTHING;
    this.analyserNode.minDecibels = ANALYSER_MIN_DECIBELS;
    this.analyserNode.maxDecibels = ANALYSER_MAX_DECIBELS;

    // Connect to analyser BEFORE compensation (so visualizers see raw power)
    this.frontendPreAnalyserGain.connect(this.analyserNode);
    this.backendPreAnalyserGain.connect(this.analyserNode);

    // Apply compensation AFTER analyser but BEFORE final gain
    this.frontendPreAnalyserGain.connect(this.frontendGain);
    this.backendPreAnalyserGain.connect(this.backendGain);

    // Route through compensation node before output
    // Default routing: frontendGain/backendGain → waveformCompensation → destination
    // When EQ enabled: frontendGain/backendGain → EQ input → [EQ filters] → EQ output → waveformCompensation → destination
    this.frontendGain.connect(this.waveformCompensationNode);
    this.backendGain.connect(this.waveformCompensationNode);
    this.waveformCompensationNode.connect(this.audioContext.destination);
  }

  getFrontendInput(): GainNode {
    return this.frontendPreAnalyserGain;
  }

  getBackendInput(): GainNode {
    return this.backendPreAnalyserGain;
  }

  getFrontendGain(): GainNode {
    return this.frontendGain;
  }

  getBackendGain(): GainNode {
    return this.backendGain;
  }

  getMode(): 'hybrid' | 'frontend' | 'backend' {
    return this.currentMode;
  }

  getIsCrossfading(): boolean {
    return this.isCrossfading;
  }

  setFrontendGain(value: number): void {
    const safeValue = Math.max(0, Math.min(1, value));
    this.frontendGain.gain.setValueAtTime(safeValue, this.audioContext.currentTime);
  }

  setBackendGain(value: number): void {
    const safeValue = Math.max(0, Math.min(1, value));
    this.backendGain.gain.setValueAtTime(safeValue, this.audioContext.currentTime);
  }

  setMasterVolume(volume: number): void {
    if (isNaN(volume)) {
      volume = DEFAULT_VOLUME_FALLBACK;
    }

    const safeVolume = Math.max(0, Math.min(1, volume));
    this.currentMasterVolume = safeVolume;
    const now = this.audioContext.currentTime;

    if (this.isCrossfading) {
      const frontendRatio = this.frontendGain.gain.value;
      const backendRatio = this.backendGain.gain.value;
      const total = frontendRatio + backendRatio;

      if (total > 0) {
        this.frontendPreAnalyserGain.gain.setValueAtTime(safeVolume * (frontendRatio / total), now);
        this.backendPreAnalyserGain.gain.setValueAtTime(safeVolume * (backendRatio / total), now);
      }
      return;
    }

    if (this.currentMode === 'frontend') {
      this.frontendGain.gain.setValueAtTime(safeVolume, now);
      this.backendGain.gain.setValueAtTime(0, now);
    } else if (this.currentMode === 'backend') {
      this.frontendGain.gain.setValueAtTime(0, now);
      this.backendGain.gain.setValueAtTime(safeVolume, now);
    } else if (this.currentMode === 'hybrid') {
      this.frontendGain.gain.setValueAtTime(safeVolume * DEFAULT_HYBRID_FRONTEND, now);
      this.backendGain.gain.setValueAtTime(safeVolume * DEFAULT_HYBRID_BACKEND, now);
    }
  }

  crossfadeToBackend(duration = 20.0): void {
    if (this.isCrossfading) {
      return;
    }

    this.isCrossfading = true;
    const now = this.audioContext.currentTime;

    const steps = Math.max(MIN_CROSSFADE_STEPS, Math.floor(duration * CROSSFADE_STEPS_PER_SECOND));
    const stepTime = duration / steps;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const frontendGainValue = (1 - progress) * 1.0;
      const backendGainValue = progress * 1.0;
      const time = now + (i * stepTime);

      if (i === 0) {
        this.frontendGain.gain.setValueAtTime(frontendGainValue, time);
        this.backendGain.gain.setValueAtTime(backendGainValue, time);
      } else {
        this.frontendGain.gain.linearRampToValueAtTime(frontendGainValue, time);
        this.backendGain.gain.linearRampToValueAtTime(backendGainValue, time);
      }
    }

    this.crossfadeTimeoutId = window.setTimeout(() => {
      this.currentMode = 'backend';
      this.isCrossfading = false;
      this.crossfadeTimeoutId = null;
    }, duration * 1000);
  }

  failoverToFrontend(): void {
    const now = this.audioContext.currentTime;

    this.frontendGain.gain.setValueAtTime(1.0, now);
    this.backendGain.gain.setValueAtTime(0.0, now);

    this.currentMode = 'frontend';
    this.isCrossfading = false;
  }

  crossfadeToFrontend(duration = 2.0): void {
    if (this.isCrossfading) {
      return;
    }

    this.isCrossfading = true;
    const now = this.audioContext.currentTime;

    const currentBackendGainValue = this.backendGain.gain.value;
    const steps = Math.max(MIN_CROSSFADE_STEPS, Math.floor(duration * CROSSFADE_STEPS_PER_SECOND));
    const stepTime = duration / steps;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const backendGainValue = currentBackendGainValue * (1 - progress);
      const frontendGainValue = 1.0 - backendGainValue;
      const time = now + (i * stepTime);

      if (i === 0) {
        this.backendGain.gain.setValueAtTime(backendGainValue, time);
        this.frontendGain.gain.setValueAtTime(frontendGainValue, time);
      } else {
        this.backendGain.gain.linearRampToValueAtTime(backendGainValue, time);
        this.frontendGain.gain.linearRampToValueAtTime(frontendGainValue, time);
      }
    }

    this.crossfadeTimeoutId = window.setTimeout(() => {
      this.currentMode = 'hybrid';
      this.isCrossfading = false;
      this.crossfadeTimeoutId = null;
    }, duration * 1000);
  }

  setHybridMode(frontendRatio = DEFAULT_HYBRID_FRONTEND, backendRatio = DEFAULT_HYBRID_BACKEND): void {
    const now = this.audioContext.currentTime;

    const totalGain = frontendRatio + backendRatio;
    if (totalGain > 1.0) {
      const scale = 1.0 / totalGain;
      frontendRatio *= scale;
      backendRatio *= scale;
    }

    this.frontendGain.gain.setValueAtTime(frontendRatio, now);
    this.backendGain.gain.setValueAtTime(backendRatio, now);

    this.currentMode = 'hybrid';
    this.isCrossfading = false;
  }

  getGainValues(): { frontend: number; backend: number } {
    return {
      frontend: this.frontendGain.gain.value,
      backend: this.backendGain.gain.value
    };
  }

  /**
   * Rebuild the entire audio routing chain based on current EQ and Spatial state
   * This ensures proper signal flow regardless of which effects are enabled:
   *
   * Full chain: gains → [EQ] → waveformCompensation → [Spatial] → destination
   */
  private rebuildSignalChain(): void {
    // Disconnect everything first
    try { this.frontendGain.disconnect(); } catch { /* May not be connected */ }
    try { this.backendGain.disconnect(); } catch { /* May not be connected */ }
    try { this.waveformCompensationNode.disconnect(); } catch { /* May not be connected */ }
    if (this.eqOutputNode) {
      try { this.eqOutputNode.disconnect(); } catch { /* May not be connected */ }
    }
    if (this.spatialEngine) {
      try { this.spatialEngine.disconnect(); } catch { /* May not be connected */ }
    }

    // Step 1: Route gains to EQ or directly to waveformCompensation
    if (this.eqEnabled && this.eqInputNode && this.eqOutputNode) {
      this.frontendGain.connect(this.eqInputNode);
      this.backendGain.connect(this.eqInputNode);
      this.eqOutputNode.connect(this.waveformCompensationNode);
      console.log('🎚️ AudioMixer: Gains → EQ → WaveformCompensation');
    } else {
      this.frontendGain.connect(this.waveformCompensationNode);
      this.backendGain.connect(this.waveformCompensationNode);
      console.log('🎚️ AudioMixer: Gains → WaveformCompensation (EQ bypassed)');
    }

    // Step 2: Route waveformCompensation to Spatial or directly to destination
    if (this.spatialEnabled && this.spatialEngine) {
      this.waveformCompensationNode.connect(this.spatialEngine.getInput() as GainNode);
      this.spatialEngine.connect(this.audioContext.destination);
      console.log('🌀 AudioMixer: WaveformCompensation → Spatial → Destination');
    } else {
      this.waveformCompensationNode.connect(this.audioContext.destination);
      console.log('🌀 AudioMixer: WaveformCompensation → Destination (Spatial bypassed)');
    }
  }

  /**
   * Set equalizer nodes and rewire audio graph
   * Called when EQ is enabled/disabled or initialized
   */
  setEqualizerNodes(inputNode: GainNode | null, outputNode: GainNode | null): void {
    // Store new EQ nodes
    this.eqInputNode = inputNode;
    this.eqOutputNode = outputNode;
    this.eqEnabled = !!(inputNode && outputNode);

    // Rebuild the entire chain
    this.rebuildSignalChain();
  }

  /**
   * Check if EQ is currently in the signal chain
   */
  isEqualizerEnabled(): boolean {
    return this.eqEnabled;
  }

  /**
   * Set spatial effect mode and rewire audio graph if needed
   * Uses rebuildSignalChain for consistent routing with EQ
   */
  setSpatialEffect(mode: SpatialEffectMode, intensity: number = 0.5, speed: number = 1): void {
    const newEnabled = mode !== 'none';

    // Create spatial engine lazily on first use
    if (newEnabled && !this.spatialEngine) {
      this.spatialEngine = new True8DSpatialEngine(this.audioContext);
      console.log('🌀 AudioMixer: Created spatial engine');
    }

    // Stop current movement if disabling
    if (!newEnabled && this.spatialEngine) {
      this.spatialEngine.stopMovement();
    }

    // Update state
    this.spatialEnabled = newEnabled;
    this.currentSpatialMode = mode;

    // Rebuild the entire signal chain
    this.rebuildSignalChain();

    // Start/update the spatial effect on the engine
    if (this.spatialEngine && newEnabled) {
      this.spatialEngine.setSpatialEffect(mode, intensity, speed);
    }
  }

  /**
   * Update spatial intensity without changing mode
   */
  setSpatialIntensity(intensity: number): void {
    if (this.spatialEngine && this.spatialEnabled) {
      this.spatialEngine.setIntensity(intensity);
    }
  }

  /**
   * Get current spatial effect mode
   */
  getSpatialMode(): SpatialEffectMode {
    return this.currentSpatialMode;
  }

  /**
   * Check if spatial effects are enabled
   */
  isSpatialEnabled(): boolean {
    return this.spatialEnabled;
  }

  /**
   * Update waveform compensation with smooth crossfade
   * This prevents distortion when switching between waveforms
   * Uses step functions for smooth transitions
   */
  updateWaveformCompensation(waveform: 'sine' | 'square' | 'triangle' | 'sawtooth'): void {
    if (this.currentWaveform === waveform) {
      return; // No change needed
    }
    
    const compensation = WAVEFORM_GAIN_COMPENSATION[waveform] || 1.0;
    const now = this.audioContext.currentTime;
    
    console.log(`🎛️ AudioMixer: Applying waveform compensation for ${waveform}: ${compensation}`);
    
    // Use step function for smooth transition
    const steps = 10; // 10 steps for smooth transition
    const stepTime = WAVEFORM_TRANSITION_TIME / steps;
    const currentGain = this.waveformCompensationNode.gain.value;
    const gainDifference = compensation - currentGain;
    
    // Cancel any scheduled changes
    this.waveformCompensationNode.gain.cancelScheduledValues(now);
    this.waveformCompensationNode.gain.setValueAtTime(currentGain, now);
    
    // Apply step function for smooth transition
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const stepGain = currentGain + (gainDifference * progress);
      const time = now + (i * stepTime);
      
      // Use linear ramp for each step
      this.waveformCompensationNode.gain.linearRampToValueAtTime(stepGain, time);
    }
    
    this.currentWaveform = waveform;
    this.targetCompensation = compensation;
  }
  
  /**
   * Get current waveform
   */
  getCurrentWaveform(): 'sine' | 'square' | 'triangle' | 'sawtooth' {
    return this.currentWaveform;
  }

  destroy(): void {
    if (this.crossfadeTimeoutId !== null) {
      clearTimeout(this.crossfadeTimeoutId);
      this.crossfadeTimeoutId = null;
    }

    // Clean up spatial engine
    if (this.spatialEngine) {
      this.spatialEngine.dispose();
      this.spatialEngine = null;
    }

    try {
      this.frontendPreAnalyserGain?.disconnect();
      this.backendPreAnalyserGain?.disconnect();
      this.frontendGain?.disconnect();
      this.backendGain?.disconnect();
      this.analyserNode?.disconnect();
      this.waveformCompensationNode?.disconnect();
    } catch (error) {
      // Reason: Audio nodes may already be disconnected or context may be closed
      // Gracefully handle cleanup errors to prevent crashes
      console.error('AudioMixer cleanup error:', error);
    }
  }
}
