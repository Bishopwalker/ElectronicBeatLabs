import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook to automatically track usage time for sessions
 * Call startSession() when user starts using the app
 * Call endSession() when they stop (or component unmounts)
 */
export const useUsageTracking = () => {
  const { recordUsage } = useAuth();
  const sessionStartRef = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = () => {
    if (sessionStartRef.current) return; // Already started
    
    sessionStartRef.current = new Date();
    console.log('🕐 Session started at', sessionStartRef.current.toLocaleTimeString());
    
    // Record usage every 5 minutes during active session
    intervalRef.current = setInterval(() => {
      recordPartialUsage();
    }, 5 * 60 * 1000); // 5 minutes
  };

  const endSession = useCallback(async () => {
    if (!sessionStartRef.current) return; // No session to end
    
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Calculate final session time
    const sessionEnd = new Date();
    const sessionDurationMs = sessionEnd.getTime() - sessionStartRef.current.getTime();
    const sessionMinutes = sessionDurationMs / (1000 * 60);
    
    console.log('🛑 Session ended. Duration:', Math.round(sessionMinutes), 'minutes');
    
    // Record final usage
    if (sessionMinutes > 0.5) { // Only record if session was longer than 30 seconds
      try {
        await recordUsage(sessionMinutes);
      } catch (error) {
        console.error('Failed to record session usage:', error);
      }
    }
    
    sessionStartRef.current = null;
  }, [recordUsage]);

  const recordPartialUsage = async () => {
    if (!sessionStartRef.current) return;
    
    // Record usage in 5-minute chunks during long sessions
    const now = new Date();
    const sessionDurationMs = now.getTime() - sessionStartRef.current.getTime();
    const sessionMinutes = sessionDurationMs / (1000 * 60);
    
    if (sessionMinutes >= 5) {
      console.log('📊 Recording partial usage:', Math.round(sessionMinutes), 'minutes');
      
      try {
        await recordUsage(sessionMinutes);
        // Reset session start to track next chunk
        sessionStartRef.current = now;
      } catch (error) {
        console.error('Failed to record partial usage:', error);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endSession();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    startSession,
    endSession,
    isSessionActive: sessionStartRef.current !== null
  };
};