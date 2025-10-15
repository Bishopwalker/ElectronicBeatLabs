/**
 * Audio Engine Context - Global Hybrid Audio Engine
 * Shares the hybrid audio engine (frontend + backend) across all components
 * Provides audioContext and analyserNode for visualizations
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useHybridAudioEngine } from '../hooks/useHybridAudioEngine';

type AudioEngineContextType = ReturnType<typeof useHybridAudioEngine>;

const AudioEngineContext = createContext<AudioEngineContextType | undefined>(undefined);

export const AudioEngineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize hybrid audio engine ONCE at the app level
  const hybridEngine = useHybridAudioEngine();

  return (
    <AudioEngineContext.Provider value={hybridEngine}>
      {children}
    </AudioEngineContext.Provider>
  );
};

export const useAudioEngineContext = () => {
  const context = useContext(AudioEngineContext);
  if (context === undefined) {
    throw new Error('useAudioEngineContext must be used within an AudioEngineProvider');
  }
  return context;
};
