/**
 * Timer Context - Global Timer State Management
 * Shares timer state across all tabs and components
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { TimerStatus } from '../data/timer';

interface TimerContextType {
  timerStatus: TimerStatus | null;
  setTimerStatus: (status: TimerStatus | null) => void;
  timerNavigationRef: React.MutableRefObject<{
    jumpToTransition: (direction: 'next' | 'previous') => void;
    restartCurrentTransition: () => void;
  }>;
  timerControlRef: React.MutableRefObject<{
    stopTimer: () => void;
  }>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timerStatus, setTimerStatus] = useState<TimerStatus | null>(null);

  // Navigation functions ref (populated by TimerTab)
  const timerNavigationRef = React.useRef<{
    jumpToTransition: (direction: 'next' | 'previous') => void;
    restartCurrentTransition: () => void;
  }>({
    jumpToTransition: () => console.warn('Timer navigation not initialized'),
    restartCurrentTransition: () => console.warn('Timer navigation not initialized')
  });

  // Control functions ref (populated by TimerTab)
  const timerControlRef = React.useRef<{
    stopTimer: () => void;
  }>({
    stopTimer: () => console.warn('Timer control not initialized')
  });

  const value = {
    timerStatus,
    setTimerStatus,
    timerNavigationRef,
    timerControlRef
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimerContext = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
};
