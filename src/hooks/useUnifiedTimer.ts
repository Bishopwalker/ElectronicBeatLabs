// Unified Timer Hook - extends useTimerLogic with backend integration
import { useTimerLogic } from './useTimerLogic';

interface UseUnifiedTimerProps {
  audioEngine?: {
    startBinauralBeat: (config: never) => void;
    stopBinauralBeat: () => void;
    updateFrequency: (left: number, right: number) => void;
    audioState: {
      isPlaying: boolean;
    };
  };
  backendEngine?: {
    backendConnected: boolean;
  };
  userId: string;
  isSubscriber: boolean;
}

export const useUnifiedTimer = ({ audioEngine, backendEngine, userId, isSubscriber }: UseUnifiedTimerProps) => {
  // For now, use the existing timer logic as the base
  const timerLogic = useTimerLogic({ audioEngine });
  
  // Determine timer mode based on backend availability
  const timerMode = backendEngine?.backendConnected ? 'backend' : 'frontend';
  
  // Return all the original functionality plus new unified features
  return {
    ...timerLogic,
    timerMode,
    userId,
    isSubscriber,
    // Add backend-specific features when available
    backendConnected: backendEngine?.backendConnected || false
  };
};