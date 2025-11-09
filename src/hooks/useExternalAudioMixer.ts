/**
 * useExternalAudioMixer.ts
 * 
 * React hook for integrating external audio capture with 8D spatial processing
 * and the existing EBL hybrid audio engine.
 * 
 * This hook manages the connection between external audio sources and the
 * main audio processing pipeline without creating additional audio contexts.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ExternalAudioService, ExternalAudioState } from '../engines/spatial/ExternalAudioService';
import { True8DSpatialEngine } from '../engines/spatial/True8DSpatialEngine';

export interface ExternalAudioMixerState {
  // Capture state
  isCapturing: boolean;
  captureSource: 'none' | 'tab' | 'microphone' | 'system';
  
  // Spatial processing
  is8DActive: boolean;
  spatialSpeed: number;
  spatialRadius: number;
  reverbMix: number;
  
  // Volume controls
  externalVolume: number;
  binauralVolume: number;
  
  // Error state
  error: string | null;
}

export interface UseExternalAudioMixerProps {
  audioContext: AudioContext | null;
  analyserNode: AnalyserNode | null;
  masterGainNode: GainNode | null;
}

export const useExternalAudioMixer = ({
  audioContext,
  analyserNode,
  masterGainNode
}: UseExternalAudioMixerProps) => {
  // Services
  const externalService = useRef(new ExternalAudioService());
  const spatialEngine = useRef<True8DSpatialEngine | null>(null);
  
  // Audio nodes
  const externalSourceNode = useRef<MediaStreamAudioSourceNode | null>(null);
  const externalGainNode = useRef<GainNode | null>(null);
  const binauralGainNode = useRef<GainNode | null>(null);
  const mixerNode = useRef<ChannelMergerNode | null>(null);
  
  // State
  const [state, setState] = useState<ExternalAudioMixerState>({
    isCapturing: false,
    captureSource: 'none',
    is8DActive: false,
    spatialSpeed: 1,
    spatialRadius: 2,
    reverbMix: 0.3,
    externalVolume: 0.7,
    binauralVolume: 0.5,
    error: null
  });
  
  // Initialize audio nodes when context is available
  useEffect(() => {
    if (!audioContext) return;
    
    console.log('[useExternalAudioMixer] Initializing audio nodes...');
    
    // Create nodes if not already created
    if (!externalGainNode.current) {
      externalGainNode.current = audioContext.createGain();
      externalGainNode.current.gain.value = state.externalVolume;
    }
    
    if (!binauralGainNode.current) {
      binauralGainNode.current = audioContext.createGain();
      binauralGainNode.current.gain.value = state.binauralVolume;
    }
    
    if (!mixerNode.current) {
      mixerNode.current = audioContext.createChannelMerger(2);
    }
    
    // Initialize spatial engine
    if (!spatialEngine.current) {
      spatialEngine.current = new True8DSpatialEngine(audioContext);
      console.log('[useExternalAudioMixer] 8D Spatial Engine initialized');
    }
    
    // Connect mixer to analyser if available
    if (analyserNode && mixerNode.current) {
      try {
        mixerNode.current.connect(analyserNode);
        console.log('[useExternalAudioMixer] Connected mixer to analyser');
      } catch (error) {
        console.error('[useExternalAudioMixer] Failed to connect to analyser:', error);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (spatialEngine.current) {
        spatialEngine.current.dispose();
        spatialEngine.current = null;
      }
    };
  }, [audioContext, analyserNode]);
  
  /**
   * Start capturing tab/browser audio
   */
  const startTabCapture = useCallback(async () => {
    if (!audioContext || !mixerNode.current || !externalGainNode.current) {
      setState(prev => ({
        ...prev,
        error: 'Audio system not initialized'
      }));
      return;
    }
    
    try {
      console.log('[useExternalAudioMixer] Starting tab capture...');
      setState(prev => ({ ...prev, error: null }));
      
      // Get the audio stream
      const stream = await externalService.current.captureTabAudio({
        sampleRate: audioContext.sampleRate
      });
      
      // Create source node from stream
      if (externalSourceNode.current) {
        externalSourceNode.current.disconnect();
      }
      
      externalSourceNode.current = audioContext.createMediaStreamSource(stream);
      
      // Setup audio routing
      if (state.is8DActive && spatialEngine.current) {
        // Route through 8D spatial processing
        externalSourceNode.current.connect(externalGainNode.current);
        externalGainNode.current.connect(spatialEngine.current.getInput());
        spatialEngine.current.connect(mixerNode.current);
        
        // Start 8D movement
        spatialEngine.current.start8DMovement(
          state.spatialSpeed,
          state.spatialRadius
        );
        
        console.log('[useExternalAudioMixer] Tab audio connected with 8D processing');
      } else {
        // Direct routing without spatial
        externalSourceNode.current
          .connect(externalGainNode.current)
          .connect(mixerNode.current);
        
        console.log('[useExternalAudioMixer] Tab audio connected (direct)');
      }
      
      // Update state
      setState(prev => ({
        ...prev,
        isCapturing: true,
        captureSource: 'tab'
      }));
      
      // Setup cleanup on stream end
      externalService.current.onStreamEnd(() => {
        stopCapture();
      });
      
    } catch (error) {
      console.error('[useExternalAudioMixer] Tab capture failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to capture audio'
      }));
    }
  }, [audioContext, state.is8DActive, state.spatialSpeed, state.spatialRadius]);
  
  /**
   * Start capturing microphone audio
   */
  const startMicrophoneCapture = useCallback(async () => {
    if (!audioContext || !mixerNode.current || !externalGainNode.current) {
      setState(prev => ({
        ...prev,
        error: 'Audio system not initialized'
      }));
      return;
    }
    
    try {
      console.log('[useExternalAudioMixer] Starting microphone capture...');
      setState(prev => ({ ...prev, error: null }));
      
      const stream = await externalService.current.captureMicrophoneAudio({
        sampleRate: audioContext.sampleRate
      });
      
      if (externalSourceNode.current) {
        externalSourceNode.current.disconnect();
      }
      
      externalSourceNode.current = audioContext.createMediaStreamSource(stream);
      
      // Route audio
      if (state.is8DActive && spatialEngine.current) {
        externalSourceNode.current.connect(externalGainNode.current);
        externalGainNode.current.connect(spatialEngine.current.getInput());
        spatialEngine.current.connect(mixerNode.current);
        spatialEngine.current.start8DMovement(state.spatialSpeed, state.spatialRadius);
      } else {
        externalSourceNode.current
          .connect(externalGainNode.current)
          .connect(mixerNode.current);
      }
      
      setState(prev => ({
        ...prev,
        isCapturing: true,
        captureSource: 'microphone'
      }));
      
      externalService.current.onStreamEnd(() => {
        stopCapture();
      });
      
    } catch (error) {
      console.error('[useExternalAudioMixer] Microphone capture failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to capture microphone'
      }));
    }
  }, [audioContext, state.is8DActive, state.spatialSpeed, state.spatialRadius]);
  
  /**
   * Stop audio capture
   */
  const stopCapture = useCallback(() => {
    console.log('[useExternalAudioMixer] Stopping capture...');
    
    // Disconnect audio nodes
    if (externalSourceNode.current) {
      externalSourceNode.current.disconnect();
      externalSourceNode.current = null;
    }
    
    // Stop spatial processing
    if (spatialEngine.current && state.is8DActive) {
      spatialEngine.current.stop8DMovement();
    }
    
    // Cleanup service
    externalService.current.cleanup();
    
    // Update state
    setState(prev => ({
      ...prev,
      isCapturing: false,
      captureSource: 'none'
    }));
  }, [state.is8DActive]);
  
  /**
   * Toggle 8D spatial processing
   */
  const toggle8D = useCallback(() => {
    if (!spatialEngine.current || !state.isCapturing) return;
    
    const newIs8DActive = !state.is8DActive;
    
    if (newIs8DActive) {
      // Reconnect with spatial processing
      if (externalSourceNode.current && externalGainNode.current && mixerNode.current) {
        externalSourceNode.current.disconnect();
        externalGainNode.current.disconnect();
        
        externalSourceNode.current.connect(externalGainNode.current);
        externalGainNode.current.connect(spatialEngine.current.getInput());
        spatialEngine.current.connect(mixerNode.current);
        
        spatialEngine.current.start8DMovement(state.spatialSpeed, state.spatialRadius);
        
        console.log('[useExternalAudioMixer] 8D processing enabled');
      }
    } else {
      // Reconnect without spatial processing
      if (externalSourceNode.current && externalGainNode.current && mixerNode.current) {
        spatialEngine.current.stop8DMovement();
        spatialEngine.current.disconnect();
        
        externalSourceNode.current.disconnect();
        externalGainNode.current.disconnect();
        
        externalSourceNode.current
          .connect(externalGainNode.current)
          .connect(mixerNode.current);
        
        console.log('[useExternalAudioMixer] 8D processing disabled');
      }
    }
    
    setState(prev => ({
      ...prev,
      is8DActive: newIs8DActive
    }));
  }, [state.isCapturing, state.is8DActive, state.spatialSpeed, state.spatialRadius]);
  
  /**
   * Set external audio volume
   */
  const setExternalVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    if (externalGainNode.current && audioContext) {
      externalGainNode.current.gain.linearRampToValueAtTime(
        clampedVolume,
        audioContext.currentTime + 0.05
      );
    }
    
    setState(prev => ({
      ...prev,
      externalVolume: clampedVolume
    }));
  }, [audioContext]);
  
  /**
   * Set binaural beats volume
   */
  const setBinauralVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    if (binauralGainNode.current && audioContext) {
      binauralGainNode.current.gain.linearRampToValueAtTime(
        clampedVolume,
        audioContext.currentTime + 0.05
      );
    }
    
    setState(prev => ({
      ...prev,
      binauralVolume: clampedVolume
    }));
  }, [audioContext]);
  
  /**
   * Set spatial rotation speed
   */
  const setSpatialSpeed = useCallback((speed: number) => {
    const clampedSpeed = Math.max(0.1, Math.min(5, speed));
    
    if (spatialEngine.current) {
      spatialEngine.current.setRotationSpeed(clampedSpeed);
    }
    
    setState(prev => ({
      ...prev,
      spatialSpeed: clampedSpeed
    }));
  }, []);
  
  /**
   * Set reverb mix amount
   */
  const setReverbMix = useCallback((mix: number) => {
    const clampedMix = Math.max(0, Math.min(1, mix));
    
    if (spatialEngine.current) {
      spatialEngine.current.setReverbMix(clampedMix);
    }
    
    setState(prev => ({
      ...prev,
      reverbMix: clampedMix
    }));
  }, []);
  
  return {
    // State
    ...state,
    
    // Actions
    startTabCapture,
    startMicrophoneCapture,
    stopCapture,
    toggle8D,
    
    // Controls
    setExternalVolume,
    setBinauralVolume,
    setSpatialSpeed,
    setReverbMix,
    
    // Nodes (for advanced usage)
    mixerNode: mixerNode.current,
    binauralGainNode: binauralGainNode.current
  };
};
