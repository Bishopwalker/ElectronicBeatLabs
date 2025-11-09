/**
 * ExternalAudioService.ts
 * 
 * Service for capturing external audio sources (YouTube, browser tabs, microphone)
 * and integrating them with the EBL binaural beat system.
 * 
 * Cash Money implementation
 */

export interface CaptureOptions {
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
  sampleRate?: number;
  channelCount?: number;
}

export interface ExternalAudioState {
  isCapturing: boolean;
  sourceType: 'none' | 'tab' | 'microphone' | 'system';
  stream: MediaStream | null;
  audioTracks: MediaStreamTrack[];
}

export class ExternalAudioService {
  private activeStream: MediaStream | null = null;
  private audioTracks: MediaStreamTrack[] = [];
  private onStreamEndCallbacks: Set<() => void> = new Set();
  
  /**
   * Capture audio from a browser tab (YouTube, Spotify, etc.)
   * This will show a tab picker to the user
   */
  public async captureTabAudio(options: CaptureOptions = {}): Promise<MediaStream> {
    // Clean up any existing stream
    this.cleanup();
    
    const defaultOptions: CaptureOptions = {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      sampleRate: 48000,
      channelCount: 2
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
      console.log('[ExternalAudioService] Requesting tab audio capture...');
      
      // Request display media with audio
      // Note: We need video:true to show the tab picker, but we'll remove it
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: {
          echoCancellation: finalOptions.echoCancellation,
          noiseSuppression: finalOptions.noiseSuppression,
          autoGainControl: finalOptions.autoGainControl,
          sampleRate: finalOptions.sampleRate,
          sampleSize: 16,
          channelCount: finalOptions.channelCount
        },
        video: true // Required to show tab picker
      });
      
      // Remove video tracks immediately - we only want audio
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach(track => {
        console.log('[ExternalAudioService] Removing video track:', track.label);
        track.stop();
        stream.removeTrack(track);
      });
      
      // Store audio tracks
      this.audioTracks = stream.getAudioTracks();
      
      if (this.audioTracks.length === 0) {
        throw new Error('No audio track found in captured stream');
      }
      
      console.log('[ExternalAudioService] Audio tracks captured:', this.audioTracks.length);
      this.audioTracks.forEach(track => {
        console.log(`  - ${track.label} (${track.kind})`);
        
        // Setup cleanup on track end
        track.onended = () => {
          console.log('[ExternalAudioService] Audio track ended:', track.label);
          this.handleStreamEnd();
        };
      });
      
      this.activeStream = stream;
      
      // Log audio constraints that were applied
      const audioTrack = this.audioTracks[0];
      const settings = audioTrack.getSettings();
      console.log('[ExternalAudioService] Audio settings:', settings);
      
      return stream;
      
    } catch (error) {
      console.error('[ExternalAudioService] Failed to capture tab audio:', error);
      
      // Provide helpful error messages
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Permission denied. Please allow screen/audio sharing.');
        } else if (error.name === 'NotFoundError') {
          throw new Error('No audio sources found. Make sure the tab is playing audio.');
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Capture audio from the microphone
   */
  public async captureMicrophoneAudio(options: CaptureOptions = {}): Promise<MediaStream> {
    this.cleanup();
    
    const defaultOptions: CaptureOptions = {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      sampleRate: 48000,
      channelCount: 2
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
      console.log('[ExternalAudioService] Requesting microphone access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: finalOptions.echoCancellation,
          noiseSuppression: finalOptions.noiseSuppression,
          autoGainControl: finalOptions.autoGainControl,
          sampleRate: finalOptions.sampleRate,
          channelCount: finalOptions.channelCount
        }
      });
      
      this.audioTracks = stream.getAudioTracks();
      console.log('[ExternalAudioService] Microphone captured:', this.audioTracks[0]?.label);
      
      // Setup cleanup on track end
      this.audioTracks.forEach(track => {
        track.onended = () => {
          console.log('[ExternalAudioService] Microphone track ended');
          this.handleStreamEnd();
        };
      });
      
      this.activeStream = stream;
      return stream;
      
    } catch (error) {
      console.error('[ExternalAudioService] Failed to capture microphone:', error);
      
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        throw new Error('Microphone permission denied. Please allow microphone access.');
      }
      
      throw error;
    }
  }
  
  /**
   * Attempt to capture system audio (experimental, may not work in all browsers)
   */
  public async captureSystemAudio(options: CaptureOptions = {}): Promise<MediaStream> {
    this.cleanup();
    
    try {
      console.log('[ExternalAudioService] Attempting system audio capture...');
      
      // This is experimental and may not work in all browsers
      // @ts-ignore - Using experimental API
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: options.sampleRate || 48000,
          // Chrome/Edge specific flags for system audio
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: ''
          }
        }
      });
      
      this.audioTracks = stream.getAudioTracks();
      this.activeStream = stream;
      
      // Setup cleanup
      this.audioTracks.forEach(track => {
        track.onended = () => this.handleStreamEnd();
      });
      
      return stream;
      
    } catch (error) {
      console.error('[ExternalAudioService] System audio capture failed:', error);
      throw new Error('System audio capture not supported in this browser');
    }
  }
  
  /**
   * Stop and cleanup all active streams
   */
  public cleanup(): void {
    console.log('[ExternalAudioService] Cleaning up streams...');
    
    if (this.activeStream) {
      // Stop all tracks
      this.activeStream.getTracks().forEach(track => {
        console.log(`[ExternalAudioService] Stopping track: ${track.label}`);
        track.stop();
      });
      
      this.activeStream = null;
    }
    
    this.audioTracks = [];
  }
  
  /**
   * Check if currently capturing
   */
  public isCapturing(): boolean {
    return this.activeStream !== null && this.audioTracks.length > 0;
  }
  
  /**
   * Get the current stream
   */
  public getStream(): MediaStream | null {
    return this.activeStream;
  }
  
  /**
   * Get audio tracks
   */
  public getAudioTracks(): MediaStreamTrack[] {
    return this.audioTracks;
  }
  
  /**
   * Add callback for when stream ends
   */
  public onStreamEnd(callback: () => void): void {
    this.onStreamEndCallbacks.add(callback);
  }
  
  /**
   * Remove stream end callback
   */
  public offStreamEnd(callback: () => void): void {
    this.onStreamEndCallbacks.delete(callback);
  }
  
  private handleStreamEnd(): void {
    console.log('[ExternalAudioService] Stream ended, running callbacks...');
    this.cleanup();
    
    // Notify all listeners
    this.onStreamEndCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[ExternalAudioService] Error in stream end callback:', error);
      }
    });
  }
  
  /**
   * Get information about the current capture
   */
  public getCaptureInfo(): ExternalAudioState {
    let sourceType: ExternalAudioState['sourceType'] = 'none';
    
    if (this.audioTracks.length > 0) {
      const trackLabel = this.audioTracks[0].label.toLowerCase();
      if (trackLabel.includes('tab') || trackLabel.includes('screen')) {
        sourceType = 'tab';
      } else if (trackLabel.includes('microphone') || trackLabel.includes('mic')) {
        sourceType = 'microphone';
      } else if (trackLabel.includes('system')) {
        sourceType = 'system';
      }
    }
    
    return {
      isCapturing: this.isCapturing(),
      sourceType,
      stream: this.activeStream,
      audioTracks: this.audioTracks
    };
  }
}

// Export singleton instance for app-wide use
export const externalAudioService = new ExternalAudioService();
