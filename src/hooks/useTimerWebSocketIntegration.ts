import { useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import type { FrequencyTransition } from '../data/timer/types';

interface TimerWebSocketIntegrationProps {
  sessionId?: string;
  enableWebSocketTransitions?: boolean;
}

export const useTimerWebSocketIntegration = ({ 
  sessionId = 'timer-session-' + Date.now(),
  enableWebSocketTransitions = true 
}: TimerWebSocketIntegrationProps = {}) => {
  const websocket = useWebSocket();
  const currentSessionId = useRef<string>(sessionId);

  // Connect WebSocket for timer sessions
  const connectForTimer = useCallback(() => {
    if (enableWebSocketTransitions && !websocket.state.connected) {
      console.log('🔌 Timer WebSocket: Connecting for timer session:', currentSessionId.current);
      websocket.connect(currentSessionId.current);
    }
  }, [websocket, enableWebSocketTransitions]);

  // Disconnect WebSocket
  const disconnectTimer = useCallback(() => {
    if (websocket.state.connected) {
      console.log('🔌 Timer WebSocket: Disconnecting');
      websocket.disconnect();
    }
  }, [websocket]);

  // Send frequency transition via WebSocket
  const sendFrequencyTransition = useCallback((
    transition: FrequencyTransition,
    transitionIndex: number,
    totalTransitions: number,
    transitionDuration: number = 3.0
  ) => {
    if (!enableWebSocketTransitions) return false;
    
    if (!websocket.state.connected) {
      console.warn('⚠️ Timer WebSocket: Not connected, cannot send transition');
      return false;
    }

    const transitionData = {
      leftFreq: transition.left_ear_hz,
      rightFreq: transition.right_ear_hz,
      beatFreq: transition.frequency_hz,
      transition_duration: transitionDuration,
      session_progress: ((transitionIndex + 1) / totalTransitions) * 100,
      description: transition.description,
      frequency_type: transition.frequency_type,
      duration_minutes: transition.duration_minutes,
      transition_index: transitionIndex,
      total_transitions: totalTransitions
    };

    websocket.sendMessage({
      type: 'frequency_transition',
      data: transitionData
    });

    console.log('📡 Timer WebSocket: Sent frequency transition -', 
                `${transition.left_ear_hz}Hz / ${transition.right_ear_hz}Hz`,
                `(${transition.frequency_hz}Hz ${transition.frequency_type})`);

    return true;
  }, [websocket, enableWebSocketTransitions]);

  // Create a WebSocket-aware audio engine wrapper
  const createWebSocketAudioEngine = useCallback((baseAudioEngine: any) => {
    return {
      ...baseAudioEngine,
      
      // Override updateFrequency to use WebSocket when enabled
      updateFrequency: (leftFreq: number, rightFreq: number) => {
        if (enableWebSocketTransitions && websocket.state.connected) {
          // Send via WebSocket for smooth transitions
          const transitionData = {
            leftFreq,
            rightFreq,
            beatFreq: Math.abs(rightFreq - leftFreq),
            transition_duration: 2.0,
            session_progress: 0,
            description: 'Manual frequency update',
            frequency_type: 'manual',
            duration_minutes: 0,
            transition_index: 0,
            total_transitions: 1
          };

          websocket.sendMessage({
            type: 'frequency_transition',
            data: transitionData
          });

          console.log('🎛️ Timer WebSocket: Manual frequency update via WebSocket -', 
                      leftFreq, 'Hz /', rightFreq, 'Hz');
        } else {
          // Fallback to direct update if WebSocket not available
          if (baseAudioEngine.updateFrequency) {
            baseAudioEngine.updateFrequency(leftFreq, rightFreq);
          }
        }
      },

      // Enhanced start method that connects WebSocket
      startBinauralBeat: async (config: any) => {
        // Connect WebSocket first
        connectForTimer();
        
        // Wait a moment for connection
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Call original start method
        if (baseAudioEngine.startBinauralBeat) {
          return await baseAudioEngine.startBinauralBeat(config);
        }
      },

      // Enhanced stop method that disconnects WebSocket
      stopBinauralBeat: async () => {
        // Call original stop method
        if (baseAudioEngine.stopBinauralBeat) {
          await baseAudioEngine.stopBinauralBeat();
        }
        
        // Disconnect WebSocket after stopping
        setTimeout(() => {
          disconnectTimer();
        }, 1000);
      }
    };
  }, [enableWebSocketTransitions, websocket, connectForTimer, disconnectTimer]);

  return {
    websocketState: websocket.state,
    connectForTimer,
    disconnectTimer,
    sendFrequencyTransition,
    createWebSocketAudioEngine,
    isWebSocketEnabled: enableWebSocketTransitions
  };
};