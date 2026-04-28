/**
 * True8DSpatialEngine.ts
 *
 * Implements proper 8D spatial audio processing with HRTF panning
 * and serial effect chain for immersive audio experience.
 *
 * Supports multiple spatial effect modes:
 * - toroidal: Horizontal circular rotation (torus/donut)
 * - vortex: Spiral inward/outward motion
 * - spiral: 3D helix path (rising/falling spiral)
 * - wave: Wave-like left/right oscillation
 * - pattern8D: Classic 8D movement with vertical bobbing
 * - combined: Toroidal + vertical 8D elements
 */

import type { SpatialEffectMode } from '../../types';

export class True8DSpatialEngine {
  private context: AudioContext;
  private input: GainNode;
  private output: GainNode;

  // Single panner that moves in 3D space (NOT multiple parallel panners!)
  private panner: PannerNode;
  private stereoPanner: StereoPannerNode;

  // Effect chain for spatial depth
  private preDelay: DelayNode;
  private reverb: ConvolverNode;
  private lowpass: BiquadFilterNode;
  private highpass: BiquadFilterNode;
  private wetGain: GainNode;
  private dryGain: GainNode;

  // Automation control
  private rotationSpeed: number = 1;
  private intensity: number = 0.5;
  private isActive: boolean = false;
  private animationFrame: number | null = null;
  private startTime: number = 0;
  private currentMode: SpatialEffectMode = 'none';
  
  constructor(context: AudioContext) {
    this.context = context;
    
    // Create main I/O nodes
    this.input = context.createGain();
    this.output = context.createGain();
    this.output.gain.value = 1.0;
    
    // Create PannerNode for 3D positioning using HRTF
    this.panner = context.createPanner();
    this.panner.panningModel = 'HRTF'; // Head-related transfer function for realistic 3D
    this.panner.distanceModel = 'inverse';
    this.panner.refDistance = 1;
    this.panner.maxDistance = 10;
    this.panner.rolloffFactor = 1;
    this.panner.coneInnerAngle = 360;
    this.panner.coneOuterAngle = 0;
    this.panner.coneOuterGain = 0;
    
    // Backup stereo panner for additional width
    this.stereoPanner = context.createStereoPanner();
    this.stereoPanner.pan.value = 0;
    
    // Create effect nodes
    this.preDelay = context.createDelay(1);
    this.preDelay.delayTime.value = 0.01;
    
    this.reverb = context.createConvolver();
    this.loadImpulseResponse();
    
    // Filters for distance simulation
    this.lowpass = context.createBiquadFilter();
    this.lowpass.type = 'lowpass';
    this.lowpass.frequency.value = 2000;
    this.lowpass.Q.value = 1;
    
    this.highpass = context.createBiquadFilter();
    this.highpass.type = 'highpass';
    this.highpass.frequency.value = 200;
    this.highpass.Q.value = 1;
    
    // Wet/dry mix for reverb
    this.wetGain = context.createGain();
    this.wetGain.gain.value = 0.3; // 30% wet signal
    
    this.dryGain = context.createGain();
    this.dryGain.gain.value = 0.7; // 70% dry signal
    
    this.connectNodes();
  }
  
  private connectNodes(): void {
    // Main serial chain for dry signal
    this.input
      .connect(this.highpass)
      .connect(this.lowpass)
      .connect(this.preDelay)
      .connect(this.panner)
      .connect(this.stereoPanner)
      .connect(this.dryGain)
      .connect(this.output);
    
    // Parallel reverb send (wet signal)
    this.preDelay.connect(this.reverb);
    this.reverb.connect(this.wetGain);
    this.wetGain.connect(this.output);
  }
  
  private async loadImpulseResponse(): Promise<void> {
    try {
      // Try to load a real impulse response
      const response = await fetch('/audio/impulse-responses/small-room.wav');
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
        this.reverb.buffer = audioBuffer;
      } else {
        throw new Error('Impulse response not found');
      }
    } catch (error) {
      console.warn('Using synthetic impulse response:', error);
      this.createSyntheticImpulse();
    }
  }
  
  private createSyntheticImpulse(): void {
    // Create a synthetic room impulse response
    const length = this.context.sampleRate * 0.8; // 0.8 second reverb tail
    const impulse = this.context.createBuffer(2, length, this.context.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // Exponential decay with early reflections
        const decay = Math.pow(1 - i / length, 2);
        
        // Add early reflections
        if (i < 1000) {
          channelData[i] = (Math.random() * 2 - 1) * decay * 0.5;
        } else {
          // Diffuse late reverb
          channelData[i] = (Math.random() * 2 - 1) * decay * 0.3;
        }
      }
    }
    
    this.reverb.buffer = impulse;
  }
  
  /**
   * Start 8D spatial movement with configurable parameters
   */
  public start8DMovement(
    speed: number = 1, 
    radius: number = 2,
    verticalAmount: number = 0.5
  ): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.rotationSpeed = speed;
    this.startTime = this.context.currentTime;
    
    const animate = (): void => {
      if (!this.isActive) return;
      
      const elapsed = this.context.currentTime - this.startTime;
      const angle = (elapsed * this.rotationSpeed * 0.5) % (Math.PI * 2);
      
      // Calculate 3D position for circular/elliptical motion
      const x = Math.sin(angle) * radius;
      const y = Math.cos(angle * 0.5) * verticalAmount; // Vertical bobbing
      const z = Math.cos(angle) * radius;
      
      // Update panner position smoothly
      const rampTime = this.context.currentTime + 0.1;
      this.panner.positionX.linearRampToValueAtTime(x, rampTime);
      this.panner.positionY.linearRampToValueAtTime(y, rampTime);
      this.panner.positionZ.linearRampToValueAtTime(z, rampTime);
      
      // Calculate distance from listener for filter modulation
      const distance = Math.sqrt(x * x + z * z);
      const normalizedDistance = distance / radius;
      
      // Modulate lowpass filter based on distance (farther = more muffled)
      const filterFreq = 4000 - (normalizedDistance * 2000);
      this.lowpass.frequency.linearRampToValueAtTime(
        Math.max(filterFreq, 1000), 
        rampTime
      );
      
      // Subtle delay modulation for doppler-like effect
      const delayTime = 0.01 + (Math.abs(Math.sin(angle * 2)) * 0.015);
      this.preDelay.delayTime.linearRampToValueAtTime(delayTime, rampTime);
      
      // Add some stereo width variation
      const panValue = Math.sin(angle * 3) * 0.3;
      this.stereoPanner.pan.linearRampToValueAtTime(panValue, rampTime);
      
      // Modulate reverb mix based on position
      const reverbMix = 0.3 + (normalizedDistance * 0.2);
      this.wetGain.gain.linearRampToValueAtTime(reverbMix, rampTime);
      this.dryGain.gain.linearRampToValueAtTime(1 - reverbMix * 0.5, rampTime);
      
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  /**
   * Stop any spatial movement and return to center position
   */
  public stopMovement(): void {
    this.isActive = false;
    this.currentMode = 'none';

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // Smoothly return to center position
    const rampTime = this.context.currentTime + 0.5;

    this.panner.positionX.linearRampToValueAtTime(0, rampTime);
    this.panner.positionY.linearRampToValueAtTime(0, rampTime);
    this.panner.positionZ.linearRampToValueAtTime(1, rampTime);

    // Reset filters
    this.lowpass.frequency.linearRampToValueAtTime(4000, rampTime);
    this.preDelay.delayTime.linearRampToValueAtTime(0.01, rampTime);
    this.stereoPanner.pan.linearRampToValueAtTime(0, rampTime);

    // Reset reverb mix
    this.wetGain.gain.linearRampToValueAtTime(0.3, rampTime);
    this.dryGain.gain.linearRampToValueAtTime(0.7, rampTime);
  }

  /**
   * Legacy method - calls stopMovement
   */
  public stop8DMovement(): void {
    this.stopMovement();
  }

  /**
   * Set the spatial effect mode with unified interface
   * This is the main entry point for changing spatial effects
   */
  public setSpatialEffect(mode: SpatialEffectMode, intensity: number = 0.5, speed: number = 1): void {
    // Stop any current movement first
    if (this.isActive) {
      this.stopMovement();
    }

    this.currentMode = mode;
    this.intensity = Math.max(0, Math.min(1, intensity));
    this.rotationSpeed = Math.max(0.1, Math.min(5, speed));

    if (mode === 'none') {
      return; // Stay stopped
    }

    // Start the appropriate effect
    this.isActive = true;
    this.startTime = this.context.currentTime;

    const animate = (): void => {
      if (!this.isActive) return;

      const elapsed = this.context.currentTime - this.startTime;

      // Calculate position based on effect mode
      const position = this.calculatePosition(elapsed);

      // Update panner position smoothly
      const rampTime = this.context.currentTime + 0.05;
      this.panner.positionX.linearRampToValueAtTime(position.x, rampTime);
      this.panner.positionY.linearRampToValueAtTime(position.y, rampTime);
      this.panner.positionZ.linearRampToValueAtTime(position.z, rampTime);

      // Calculate distance for filter modulation
      const distance = Math.sqrt(position.x * position.x + position.z * position.z);
      const maxRadius = 2 * this.intensity;
      const normalizedDistance = maxRadius > 0 ? distance / maxRadius : 0;

      // Modulate lowpass filter based on distance
      const filterFreq = 4000 - (normalizedDistance * 2000 * this.intensity);
      this.lowpass.frequency.linearRampToValueAtTime(
        Math.max(filterFreq, 1000),
        rampTime
      );

      // Subtle delay modulation for doppler-like effect
      const delayTime = 0.01 + (normalizedDistance * 0.015 * this.intensity);
      this.preDelay.delayTime.linearRampToValueAtTime(delayTime, rampTime);

      // Stereo width variation
      const panValue = (position.x / (maxRadius || 1)) * 0.5 * this.intensity;
      this.stereoPanner.pan.linearRampToValueAtTime(
        Math.max(-1, Math.min(1, panValue)),
        rampTime
      );

      // Modulate reverb mix based on position
      const reverbMix = 0.2 + (normalizedDistance * 0.3 * this.intensity);
      this.wetGain.gain.linearRampToValueAtTime(reverbMix, rampTime);
      this.dryGain.gain.linearRampToValueAtTime(1 - reverbMix * 0.5, rampTime);

      this.animationFrame = requestAnimationFrame(animate);
    };

    animate();
    console.log(`🌀 Spatial Engine: Started ${mode} effect (intensity: ${this.intensity}, speed: ${this.rotationSpeed})`);
  }

  /**
   * Calculate 3D position based on current effect mode
   */
  private calculatePosition(elapsed: number): { x: number; y: number; z: number } {
    const radius = 2 * this.intensity;
    const speed = this.rotationSpeed;

    switch (this.currentMode) {
      case 'toroidal': {
        // Horizontal circular rotation (torus shape in XZ plane)
        const angle = (elapsed * speed * 0.5) % (Math.PI * 2);
        return {
          x: Math.sin(angle) * radius,
          y: 0, // No vertical movement
          z: Math.cos(angle) * radius
        };
      }

      case 'vortex': {
        // Spiral inward/outward motion
        const angle = (elapsed * speed * 0.8) % (Math.PI * 2);
        const radiusOscillation = 0.5 + Math.sin(elapsed * speed * 0.3) * 0.5; // Oscillate between 0 and 1
        const currentRadius = radius * radiusOscillation;
        return {
          x: Math.sin(angle) * currentRadius,
          y: Math.sin(elapsed * speed * 0.2) * radius * 0.3, // Subtle vertical
          z: Math.cos(angle) * currentRadius
        };
      }

      case 'spiral': {
        // 3D helix path - rising and falling spiral
        const angle = (elapsed * speed * 0.6) % (Math.PI * 2);
        const verticalCycle = Math.sin(elapsed * speed * 0.15) * radius * 0.8;
        return {
          x: Math.sin(angle) * radius * 0.8,
          y: verticalCycle,
          z: Math.cos(angle) * radius * 0.8
        };
      }

      case 'wave': {
        // Wave-like left/right oscillation with depth
        const wavePhase = elapsed * speed * 0.4;
        return {
          x: Math.sin(wavePhase) * radius,
          y: Math.sin(wavePhase * 2) * radius * 0.2, // Subtle vertical wave
          z: 1 + Math.cos(wavePhase * 0.5) * radius * 0.5 // Depth oscillation
        };
      }

      case 'pattern8D': {
        // Classic 8D movement with vertical bobbing
        const angle = (elapsed * speed * 0.5) % (Math.PI * 2);
        return {
          x: Math.sin(angle) * radius,
          y: Math.cos(angle * 0.5) * radius * 0.5, // Vertical bobbing
          z: Math.cos(angle) * radius
        };
      }

      case 'combined': {
        // Toroidal + 8D combined - complex motion
        const angle1 = (elapsed * speed * 0.5) % (Math.PI * 2);
        const angle2 = (elapsed * speed * 0.3) % (Math.PI * 2);
        return {
          x: Math.sin(angle1) * radius + Math.sin(angle2 * 2) * radius * 0.3,
          y: Math.cos(angle2) * radius * 0.4,
          z: Math.cos(angle1) * radius + Math.cos(angle2 * 2) * radius * 0.3
        };
      }

      default:
        return { x: 0, y: 0, z: 1 }; // Center position
    }
  }

  /**
   * Update intensity without restarting the effect
   */
  public setIntensity(intensity: number): void {
    this.intensity = Math.max(0, Math.min(1, intensity));
  }

  /**
   * Get current effect mode
   */
  public getCurrentMode(): SpatialEffectMode {
    return this.currentMode;
  }

  /**
   * Check if engine is currently active
   */
  public getIsActive(): boolean {
    return this.isActive;
  }
  
  /**
   * Set the wet/dry mix for reverb
   */
  public setReverbMix(wetAmount: number): void {
    const wet = Math.max(0, Math.min(1, wetAmount));
    const dry = 1 - wet * 0.5; // Don't completely kill dry signal
    
    this.wetGain.gain.linearRampToValueAtTime(
      wet, 
      this.context.currentTime + 0.05
    );
    this.dryGain.gain.linearRampToValueAtTime(
      dry, 
      this.context.currentTime + 0.05
    );
  }
  
  /**
   * Set the rotation speed of 8D movement
   */
  public setRotationSpeed(speed: number): void {
    this.rotationSpeed = Math.max(0.1, Math.min(5, speed));
  }
  
  /**
   * Connect the spatial engine in an audio graph
   */
  public connect(destination: AudioNode): AudioNode {
    this.output.connect(destination);
    return this.output;
  }
  
  /**
   * Disconnect the spatial engine
   */
  public disconnect(): void {
    this.output.disconnect();
  }
  
  /**
   * Get the input node for connecting sources
   */
  public getInput(): AudioNode {
    return this.input;
  }
  
  /**
   * Get the output node
   */
  public getOutput(): AudioNode {
    return this.output;
  }
  
  /**
   * Cleanup resources
   */
  public dispose(): void {
    this.stop8DMovement();
    this.input.disconnect();
    this.output.disconnect();
    this.panner.disconnect();
    this.stereoPanner.disconnect();
    this.preDelay.disconnect();
    this.reverb.disconnect();
    this.lowpass.disconnect();
    this.highpass.disconnect();
    this.wetGain.disconnect();
    this.dryGain.disconnect();
  }
}
