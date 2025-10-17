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
  
  // 🔥 CRITICAL FIX: Handle hot reload gracefully
  if (context === undefined) {
    // During hot reload, React may remount components out of order
    // Instead of throwing immediately, check if we're in dev mode
    if (import.meta.env.DEV) {
      console.warn('⚠️ AudioEngineContext not available (possibly due to hot reload). Providing fallback...');
      // Return a minimal fallback to prevent crashes during hot reload
      // This will be replaced when the provider remounts
      return null as any; // Type cast to satisfy TypeScript
    }
    
    // In production, this is a real error
    throw new Error('useAudioEngineContext must be used within an AudioEngineProvider');
  }
  
  return context;
};
