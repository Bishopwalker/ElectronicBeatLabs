/**
 * AudioContextProvider - Single Audio Context for Entire App
 * 
 * CRITICAL: Provides ONE AudioContext and ONE AnalyserNode
 * All audio engines use this shared context
 * Prevents multiple audio contexts and resource waste
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AudioContextState {
  audioContext: AudioContext | null;
  analyserNode: AnalyserNode | null;
  initializeAudio: () => Promise<void>;
  isInitialized: boolean;
}

const AudioContextContext = createContext<AudioContextState | null>(null);

export const useAudioContextProvider = () => {
  const context = useContext(AudioContextContext);
  if (!context) {
    throw new Error('useAudioContextProvider must be used within AudioContextProvider');
  }
  return context;
};

interface AudioContextProviderProps {
  children: ReactNode;
}

export const AudioContextProvider: React.FC<AudioContextProviderProps> = ({ children }) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Initialize audio context (requires user gesture)
   * Creates ONE context and ONE analyser for entire app
   */
  const initializeAudio = async () => {
    if (audioContext && audioContext.state === 'running') {
      console.log('✅ AudioContext already initialized and running');
      return;
    }

    try {
      console.log('🎵 Initializing ONE AudioContext for entire app...');
      
      // Create or resume context
      let context = audioContext;
      if (!context) {
        context = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(context);
      }

      // Resume if suspended
      if (context.state === 'suspended') {
        console.log('📢 Resuming suspended AudioContext...');
        await context.resume();
      }

      // Create ONE analyser node for all visualization
      if (!analyserNode) {
        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.8;
        setAnalyserNode(analyser);
        console.log('📊 Created single AnalyserNode for app-wide visualization');
      }

      setIsInitialized(true);
      console.log('✅ AudioContext initialized successfully, state:', context.state);
    } catch (error) {
      console.error('❌ Failed to initialize AudioContext:', error);
      throw error;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContext && audioContext.state !== 'closed') {
        console.log('🧹 Closing AudioContext...');
        audioContext.close();
      }
    };
  }, [audioContext]);

  // Log context state changes
  useEffect(() => {
    if (!audioContext) return;

    const handleStateChange = () => {
      console.log('🔄 AudioContext state changed:', audioContext.state);
    };

    audioContext.addEventListener('statechange', handleStateChange);
    return () => {
      audioContext.removeEventListener('statechange', handleStateChange);
    };
  }, [audioContext]);

  return (
    <AudioContextContext.Provider 
      value={{ 
        audioContext, 
        analyserNode, 
        initializeAudio,
        isInitialized 
      }}
    >
      {children}
    </AudioContextContext.Provider>
  );
};
