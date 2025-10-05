/**
 * Unified Timer Hook - Single source of truth for all timer functionality
 * 
 * Architecture:
 * 1. Primary: Backend timer service for advanced features and reliability
 * 2. Fallback: Frontend local timer when backend is unavailable
 * 3. Auto-detection: Seamlessly switches between backend/frontend based on availability
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
    CustomPresetForm,
    FrequencyTransition,
    LocalTimer,
    TimerAction,
    TimerPreset,
    TimerSession,
    TimerStatus
} from '../data/timer/types';
import {ALL_TIMER_PRESETS, getPresetTransitions} from '../data/timer';
import {loadCustomPresets, savePresetToStorage} from '../helpers/timer/timerUtils';

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
  userId?: string;
  isSubscriber?: boolean;
}

type TimerMode = 'backend' | 'frontend' | 'detecting';

export const useUnifiedTimer = ({ 
  audioEngine, 
  backendEngine, 
  userId = 'anonymous',
  isSubscriber = false 
}: UseUnifiedTimerProps) => {
  // Core state
  const [presets, setPresets] = useState<TimerPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [timerStatus, setTimerStatus] = useState<TimerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timerMode, setTimerMode] = useState<TimerMode>('detecting');
  
  // Backend state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Frontend fallback state
  const [localTimer, setLocalTimer] = useState<LocalTimer | null>(null);
  const [customPresetTransitions, setCustomPresetTransitions] = useState<{[key: string]: FrequencyTransition[]}>({});
  const currentTransitionIndexRef = useRef<number | null>(null);

  /**
   * Detect which timer mode to use based on backend availability
   */
  const detectTimerMode = useCallback((): TimerMode => {
    if (backendEngine?.backendConnected) {
      return 'backend';
    }
    return 'frontend';
  }, [backendEngine?.backendConnected]);

  /**
   * Load available presets from both backend and frontend sources
   */
  const loadPresets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const mode = detectTimerMode();
      setTimerMode(mode);

      if (mode === 'backend') {
        // Load presets from backend API
        try {
          const response = await fetch('/api/timer/presets', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
            }
          });
          
          if (response.ok) {
            const backendPresets = await response.json();
            setPresets(backendPresets);
            console.log('✅ Backend presets loaded:', backendPresets.length);
            return;
          }
        } catch (err) {
          console.warn('Backend preset loading failed, falling back to frontend');
          setTimerMode('frontend');
        }
      }
      
      // Frontend fallback
      const { savedCustomPresets, savedTransitions } = loadCustomPresets();
      setCustomPresetTransitions(savedTransitions);
      
      const allPresets = [...ALL_TIMER_PRESETS, ...savedCustomPresets];
      setPresets(allPresets);
      
      console.log('✅ Frontend presets loaded:', allPresets.length);
      
    } catch (err) {
      setError('Error loading presets');
      console.error('Error loading presets:', err);
    } finally {
      setLoading(false);
    }
  }, [detectTimerMode]);

  /**
   * Backend timer status polling
   */
  const pollBackendStatus = useCallback(async () => {
    if (!sessionId || timerMode !== 'backend') return;

    try {
      const response = await fetch(`/api/timer/sessions/${sessionId}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        }
      });

      if (response.ok) {
        const status = await response.json();
        setTimerStatus(status);

        // Update audio engine if transition changed
        if (audioEngine && status.current_transition) {
          const newIndex = status.session.current_transition_index;
          if (currentTransitionIndexRef.current !== newIndex) {
            audioEngine.updateFrequency(
              status.current_transition.left_ear_hz,
              status.current_transition.right_ear_hz
            );
            currentTransitionIndexRef.current = newIndex;
            console.log(`🔄 Backend timer transition: ${status.current_transition.left_ear_hz}Hz / ${status.current_transition.right_ear_hz}Hz`);
          }
        }

        // Session completed
        if (!status.session.is_active) {
          setSessionId(null);
          setTimerStatus(null);
          if (statusIntervalRef.current) {
            clearInterval(statusIntervalRef.current);
            statusIntervalRef.current = null;
          }
        }
      }
    } catch (err) {
      console.error('Error polling backend status:', err);
      // Could implement fallback to frontend here
    }
  }, [sessionId, timerMode, audioEngine]);

  /**
   * Frontend timer status calculation (original logic)
   */
  const calculateFrontendStatus = useCallback(() => {
    if (!localTimer?.isActive || timerMode !== 'frontend') return;

    const now = Date.now();
    const elapsed = Math.floor((now - localTimer.startTime) / 1000 / 60);

    let currentTransitionIndex = 0;
    let elapsedInTransitions = elapsed;

    // Find current transition
    for (const transition of localTimer.transitions) {
      if (elapsedInTransitions >= transition.duration_minutes) {
        elapsedInTransitions -= transition.duration_minutes;
        currentTransitionIndex++;
      } else {
        break;
      }
    }

    // Timer completed
    if (currentTransitionIndex >= localTimer.transitions.length) {
      setLocalTimer(null);
      setTimerStatus(null);
      currentTransitionIndexRef.current = null;
      return;
    }

    const currentTransition = localTimer.transitions[currentTransitionIndex];
    const nextTransition = localTimer.transitions[currentTransitionIndex + 1] || null;
    const timeRemainingCurrent = currentTransition.duration_minutes - elapsedInTransitions;

    // FIXED: Correct total time calculation
    const totalTimeRemaining = localTimer.transitions
      .slice(currentTransitionIndex)
      .reduce((sum, t, i) => {
        if (i === 0) return sum + timeRemainingCurrent; // Current transition remaining time
        return sum + t.duration_minutes; // Future transitions full duration
      }, 0);

    const currentPreset = presets.find(p => p.id === selectedPresetId);
    
    const mockSession: TimerSession = {
      session_id: 'frontend-session-' + localTimer.startTime,
      preset_id: selectedPresetId,
      user_id: userId,
      start_time: new Date(localTimer.startTime).toISOString(),
      current_transition_index: currentTransitionIndex,
      elapsed_minutes: elapsed,
      is_active: localTimer.isActive,
      is_paused: localTimer.isPaused,
      preset: currentPreset
    };

    const status: TimerStatus = {
      session: mockSession,
      current_transition: currentTransition,
      next_transition: nextTransition,
      time_remaining_current: timeRemainingCurrent,
      time_remaining_total: totalTimeRemaining
    };

    setTimerStatus(status);

    // Update audio engine
    if (audioEngine && currentTransition && currentTransitionIndexRef.current !== currentTransitionIndex) {
      console.log(`🔄 Frontend timer transition: ${currentTransition.left_ear_hz}Hz / ${currentTransition.right_ear_hz}Hz`);
      audioEngine.updateFrequency(currentTransition.left_ear_hz, currentTransition.right_ear_hz);
      currentTransitionIndexRef.current = currentTransitionIndex;
    }
  }, [localTimer, timerMode, presets, selectedPresetId, userId, audioEngine]);

  /**
   * Start timer - chooses backend or frontend based on availability
   */
  const startTimer = useCallback(async () => {
    if (!selectedPresetId) {
      setError('Please select a preset');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      currentTransitionIndexRef.current = null;

      const mode = detectTimerMode();
      setTimerMode(mode);

      if (mode === 'backend') {
        // Start backend timer
        const response = await fetch('/api/timer/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
          },
          body: JSON.stringify({
            preset_id: selectedPresetId
          })
        });

        if (response.ok) {
          const result = await response.json();
          setSessionId(result.session_id);
          setTimerStatus(result.status);

          // Start status polling
          statusIntervalRef.current = setInterval(pollBackendStatus, 1000);

          // Start audio
          if (audioEngine && result.status.current_transition) {
            const config = {
              leftFreq: result.status.current_transition.left_ear_hz,
              rightFreq: result.status.current_transition.right_ear_hz,
              beatFreq: result.status.current_transition.frequency_hz,
              amplitude: 0.5,
              waveform: 'sine' as const
            };
            audioEngine.startBinauralBeat(config as never);
          }

          console.log('🎯 Backend timer started:', result.session_id);
          return;
        } else {
          console.warn('Backend timer start failed, falling back to frontend');
          setTimerMode('frontend');
        }
      }
      
      // Frontend fallback
      const mockTransitions: FrequencyTransition[] = [];
      
      if (selectedPresetId.startsWith('custom-')) {
        const customTransitions = customPresetTransitions[selectedPresetId];
        if (customTransitions) {
          mockTransitions.push(...customTransitions);
        }
      } else {
        const presetTransitions = getPresetTransitions(selectedPresetId);
        mockTransitions.push(...presetTransitions);
      }
      
      const timer: LocalTimer = {
        startTime: Date.now(),
        currentTransitionIndex: 0,
        transitions: mockTransitions,
        isActive: true,
        isPaused: false
      };
      
      setLocalTimer(timer);
      
      // Start audio
      if (audioEngine && mockTransitions.length > 0) {
        const firstTransition = mockTransitions[0];
        const config = {
          leftFreq: firstTransition.left_ear_hz,
          rightFreq: firstTransition.right_ear_hz,
          beatFreq: firstTransition.frequency_hz,
          amplitude: 0.5,
          waveform: 'sine' as const
        };
        audioEngine.startBinauralBeat(config as never);
      }
      
      calculateFrontendStatus();
      console.log('🎯 Frontend timer started');
      
    } catch (err) {
      setError('Error starting timer');
      console.error('Error starting timer:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedPresetId, detectTimerMode, pollBackendStatus, customPresetTransitions, audioEngine, calculateFrontendStatus]);

  /**
   * Control timer actions (pause, resume, stop, restart)
   */
  const controlTimer = useCallback(async (action: TimerAction) => {
    try {
      setLoading(true);

      if (timerMode === 'backend' && sessionId) {
        // Backend timer control
        const response = await fetch(`/api/timer/sessions/${sessionId}/${action}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
          }
        });

        if (response.ok) {
          if (action === 'stop') {
            setSessionId(null);
            setTimerStatus(null);
            if (statusIntervalRef.current) {
              clearInterval(statusIntervalRef.current);
              statusIntervalRef.current = null;
            }
            if (audioEngine) {
              audioEngine.stopBinauralBeat();
            }
          }
          console.log(`🎯 Backend timer ${action}ed`);
          return;
        }
      }
      
      // Frontend timer control
      if (action === 'stop') {
        if (audioEngine) {
          audioEngine.stopBinauralBeat();
        }
        setLocalTimer(null);
        setTimerStatus(null);
        currentTransitionIndexRef.current = null;
      } else if (action === 'pause' && localTimer) {
        setLocalTimer({...localTimer, isPaused: true});
      } else if (action === 'resume' && localTimer) {
        setLocalTimer({...localTimer, isPaused: false});
      } else if (action === 'restart') {
        if (audioEngine) {
          audioEngine.stopBinauralBeat();
        }
        setLocalTimer(null);
        setTimerStatus(null);
        currentTransitionIndexRef.current = null;
        
        setTimeout(() => {
          startTimer();
        }, 100);
      }
      
    } catch (err) {
      console.error(`Error ${action} timer:`, err);
    } finally {
      if (action !== 'restart') {
        setLoading(false);
      }
    }
  }, [timerMode, sessionId, localTimer, audioEngine, startTimer]);

  /**
   * Save custom preset
   */
  const saveCustomPreset = useCallback((customPreset: CustomPresetForm) => {
    if (!customPreset.name.trim()) {
      setError('Please enter a preset name');
      return;
    }

    const totalDuration = customPreset.transitions.reduce((sum, t) => sum + t.duration_minutes, 0);
    const presetId = `custom-${Date.now()}`;
    
    const newPreset: TimerPreset = {
      id: presetId,
      name: customPreset.name,
      description: customPreset.description || `Custom preset - ${totalDuration} minutes`,
      total_duration: totalDuration,
      transitions_count: customPreset.transitions.length,
      tags: ['custom'],
      is_premium: false,
      available: true
    };

    setCustomPresetTransitions(prev => {
      const updated = {
        ...prev,
        [presetId]: customPreset.transitions
      };
      
      savePresetToStorage(presetId, newPreset, customPreset.transitions);
      
      return updated;
    });

    setPresets(prev => [...prev, newPreset]);
    setSelectedPresetId(newPreset.id);
    setError(null);
    
    console.log('🎉 Custom preset saved:', newPreset.name);
  }, []);

  // Initialize
  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  // Frontend timer polling
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerMode === 'frontend' && localTimer?.isActive && !localTimer?.isPaused) {
      interval = setInterval(calculateFrontendStatus, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerMode, localTimer?.isActive, localTimer?.isPaused, calculateFrontendStatus]);

  // Backend timer polling
  useEffect(() => {
    if (timerMode === 'backend' && sessionId) {
      statusIntervalRef.current = setInterval(pollBackendStatus, 1000);
    }

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }
    };
  }, [timerMode, sessionId, pollBackendStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    presets,
    selectedPresetId,
    setSelectedPresetId,
    timerStatus,
    loading,
    error,
    timerMode,
    
    // Actions
    startTimer,
    controlTimer,
    saveCustomPreset,
    loadPresets,
    
    // Legacy compatibility
    hideSession: false,
    setHideSession: () => {},
  };
};