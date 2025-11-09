import { useState, useEffect, useCallback, useRef } from 'react';

import {
  ALL_TIMER_PRESETS,
  getPresetTransitions,
} from '../data/timer';
import { loadCustomPresets, savePresetToStorage, updatePresetInStorage, deletePresetFromStorage, isCustomPreset } from '../helpers/timer/timerUtils';
import { WAVE_PATTERNS } from '../data/patterns';
import type {
  PatternConfig,
  ElectromagneticField,
  TimerPreset,
  FrequencyTransition,
  TimerAction,
  CustomPresetForm,
  AnyAudioEngine
} from "../types";
import { useWebSocketContext } from './useWebsocketContext';
import { AudioState } from './useAudioState';
import { DEFAULT_VOLUME } from '../constants/audio.constants';

/**
 * Timer-only state (not audio/playback state which lives in AudioState)
 */
interface TimerOnlyState {
  startTime: number;
  currentTransitionIndex: number;
  transitions: FrequencyTransition[];
  isActive: boolean;
  isPaused: boolean;
  forceLoop?: boolean;
}

/**
 * Props for useTimerLogic hook - extracted from AppState
 */
interface UseTimerLogicProps {
  audioEngine?: AnyAudioEngine;
  audioState: AudioState;  // Centralized audio state type
  updateAudioState: {
    updateFrequencies: (left: number, right: number) => void;
    setPlaying: (playing: boolean) => void;
  };
  patterns8DControl?: {
    setActivePattern: (pattern: PatternConfig) => void;
    clearActivePattern: () => void;
  };
  onElectromagneticUpdate?: (electromagnetic: ElectromagneticField) => void;
  onTimerStatusUpdate?: (status: any) => void; // 🔥 FIXED: Re-added for parent component
}

export const useTimerLogic = (props: UseTimerLogicProps) => {
  // Get props
  const {
    audioEngine,
    audioState,
    updateAudioState,
    patterns8DControl,
    onElectromagneticUpdate,
    onTimerStatusUpdate // 🔥 FIXED: Extract callback
  } = props;

  // Use the WebSocket context
  const {
    isConnected,
    sendMessage,
    lastMessage
  } = useWebSocketContext();

  const [presets, setPresets] = useState<TimerPreset[]>([]);
  // Load selected preset from localStorage on mount
  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    const saved = localStorage.getItem('ebl_selected_preset');
    return saved || '';
  });
  // 🔥 REFACTORED: Use TimerOnlyState instead of LocalTimer + TimerStatus
  const [timerState, setTimerState] = useState<TimerOnlyState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hideSession, setHideSession] = useState(false);
  const [customPresetTransitions, setCustomPresetTransitions] = useState<{[key: string]: FrequencyTransition[]}>({});

  const currentTransitionIndexRef = useRef<number | null>(null);
  // 🔥 CRITICAL FIX: Store latest loadTimerStatus to prevent interval thrashing
  const loadTimerStatusRef = useRef<() => void>();

  // Function to send timer updates via WebSocket
  const sendTimerUpdate = useCallback((data: Record<string, any>) => {
    if (isConnected) {
      sendMessage({
        type: 'timer_update',
        data: data,
        timestamp: new Date().toISOString()
      });
    }
  }, [isConnected, sendMessage]);

  // Handle timer-specific WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'timer_response') {
      // Handle timer-specific responses here if needed
    }
  }, [lastMessage]);

  // Helper function to update electromagnetic state for visualizer
  const updateElectromagneticState = useCallback((transition: FrequencyTransition) => {
    const electromagnetic = {
      strength: Math.min(1, 0.5 + (transition.frequency_hz / 50)),
      frequency: transition.frequency_hz,
      phase: (Date.now() % 10000) / 10000 * 360, // Rotating phase
      coherence: 0.85 + (Math.min(30, transition.frequency_hz) / 100),
      resonance: Math.min(1, 0.6 + (transition.frequency_hz / 80)),
      state: transition.frequency_hz > 0 ? 'ACTIVE' :
          transition.frequency_hz > 10 ? 'RESONANT' :
              transition.frequency_hz < 1 ? 'CHARGING' : 'INACTIVE',
      stability: 0.8 + (Math.min(40, transition.frequency_hz) / 200)
    };

    if (onElectromagneticUpdate) {
      onElectromagneticUpdate(electromagnetic);
    }
  }, [onElectromagneticUpdate]); 
  // Save selected preset to localStorage whenever it changes
  useEffect(() => {
    if (selectedPresetId) {
      localStorage.setItem('ebl_selected_preset', selectedPresetId);
    }
  }, [selectedPresetId]);

  const loadPresets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Clean up duplicate keys in localStorage first
      const cleanupDuplicates = () => {
        try {
          const presetsJson = localStorage.getItem('ebl-custom-presets');
          if (presetsJson) {
            const presets = JSON.parse(presetsJson);
            const seenIds = new Set();
            const cleanPresets = presets.filter((preset: any) => {
              if (seenIds.has(preset.id)) {
                return false;
              }
              seenIds.add(preset.id);
              return true;
            });
            if (cleanPresets.length !== presets.length) {
              localStorage.setItem('ebl-custom-presets', JSON.stringify(cleanPresets));
            }
          }
        } catch (err) {
        }
      };

      cleanupDuplicates();
      const { savedCustomPresets, savedTransitions } = loadCustomPresets();
      setCustomPresetTransitions(savedTransitions);

      const allPresets = [...ALL_TIMER_PRESETS, ...savedCustomPresets];
      setPresets(allPresets);

    } catch (err) {
      setError('Error loading presets');
    } finally {
      setLoading(false);
    }
  };

  const loadTimerStatus = useCallback(async () => {
    if (!timerState || !timerState.isActive) {
      // 🔥 FIXED: Clear timer status when inactive
      if (onTimerStatusUpdate) {
        onTimerStatusUpdate(null);
      }
      return;
    }

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - timerState.startTime) / 1000);

    let currentTransitionIndex = 0;
    let elapsedInTransitionsSeconds = elapsedSeconds;

    for (const element of timerState.transitions) {
      const transitionDurationSeconds = element.duration_minutes * 60;
      if (elapsedInTransitionsSeconds >= transitionDurationSeconds) {
        elapsedInTransitionsSeconds -= transitionDurationSeconds;
        currentTransitionIndex++;
      } else {
        break;
      }
    }

    if (currentTransitionIndex >= timerState.transitions.length) {
      // Check if loop is enabled for the current preset
      const currentPreset = presets.find(p => p.id === selectedPresetId);
      if (currentPreset?.loop_enabled || timerState.forceLoop) {
        // Reset to beginning for loop
        setTimerState({
          ...timerState,
          startTime: Date.now(),
          currentTransitionIndex: 0
        });
        currentTransitionIndexRef.current = null;
        return;
      } else {
        // End the session - stop audio via AudioState
        setTimerState(null);
        updateAudioState.setPlaying(false);
        currentTransitionIndexRef.current = null;
        return;
      }
    }

    const currentTransition = timerState.transitions[currentTransitionIndex];
    const nextTransition = timerState.transitions[currentTransitionIndex + 1] || null;
    const currentTransitionDurationSeconds = currentTransition.duration_minutes * 60;
    const timeRemainingCurrentSeconds = currentTransitionDurationSeconds - elapsedInTransitionsSeconds;
    const timeRemainingCurrentMinutes = timeRemainingCurrentSeconds / 60;

    const totalTimeRemainingSeconds = timerState.transitions
        .slice(currentTransitionIndex)
        .reduce((sum, t, i) => {
          if (i === 0) return sum + timeRemainingCurrentSeconds;
          return sum + (t.duration_minutes * 60);
        }, 0);
    const totalTimeRemainingMinutes = totalTimeRemainingSeconds / 60;

    if (audioEngine && currentTransition && currentTransitionIndexRef.current !== currentTransitionIndex) {

      // 🔥 NEW: Update centralized AudioState instead of calling audioEngine directly
      updateAudioState.updateFrequencies(currentTransition.left_ear_hz, currentTransition.right_ear_hz);

      // Send timer update via WebSocket if connected
      sendTimerUpdate({
        currentTime: Date.now() - timerState.startTime,
        isPaused: timerState.isPaused,
        isRunning: timerState.isActive && !timerState.isPaused,
        progress: totalTimeRemainingMinutes ? (1 - (totalTimeRemainingMinutes / timerState.transitions.reduce((sum, t) => sum + t.duration_minutes, 0))) * 100 : 0,
        totalTime: timerState.transitions.reduce((sum, t) => sum + t.duration_minutes, 0),
        current_transition: currentTransition,
        transitionIndex: currentTransitionIndex,
        totalTransitions: timerState.transitions.length,
        leftFreq: currentTransition.left_ear_hz,
        rightFreq: currentTransition.right_ear_hz,
        beat_frequency: currentTransition.frequency_hz
      });

      // Update electromagnetic state for visualizer (driven by real frequency)
      updateElectromagneticState(currentTransition);

      currentTransitionIndexRef.current = currentTransitionIndex;
    }

    // 🔥 FIXED: Call onTimerStatusUpdate with computed TimerStatus for parent component
    if (onTimerStatusUpdate) {
      onTimerStatusUpdate({
        session: {
          is_active: timerState.isActive,
          is_paused: timerState.isPaused,
          preset: presets.find(p => p.id === selectedPresetId) || null,
          current_transition: currentTransition
        },
        current_transition: currentTransition,
        next_transition: nextTransition,
        time_remaining_current: timeRemainingCurrentMinutes,
        time_remaining_total: totalTimeRemainingMinutes
      });
    }
  }, [timerState, audioEngine, selectedPresetId, presets, updateElectromagneticState, sendTimerUpdate, updateAudioState, onTimerStatusUpdate]);

  const startTimer = async (forceLoop?: boolean) => {
    if (!selectedPresetId) return;

    try {
      setLoading(true);
      setError(null);

      currentTransitionIndexRef.current = null;

      const mockTransitions: FrequencyTransition[] = [];

      if (selectedPresetId.startsWith('custom-')) {
        const customTransitions = customPresetTransitions[selectedPresetId];
        if (customTransitions && customTransitions.length > 0) {
          mockTransitions.push(...customTransitions);
        } else {
          setError('No transitions found for this custom preset');
          return;
        }
      } else {
        const presetTransitions = getPresetTransitions(selectedPresetId);
        mockTransitions.push(...presetTransitions);
      }

      const timer: TimerOnlyState = {
        startTime: Date.now(),
        currentTransitionIndex: 0,
        transitions: mockTransitions,
        isActive: true,
        isPaused: false,
        forceLoop: forceLoop
      };

      setTimerState(timer);
      updateAudioState.setPlaying(true);

      if (audioEngine && mockTransitions.length > 0) {
        const firstTransition = mockTransitions[0];

        // 🔥 NEW: Update AudioState with initial frequencies
        updateAudioState.updateFrequencies(firstTransition.left_ear_hz, firstTransition.right_ear_hz);

        // Calculate base/beat for audio engine config
        const baseFreq = Math.min(firstTransition.left_ear_hz, firstTransition.right_ear_hz);
        const beatFreq = Math.abs(firstTransition.right_ear_hz - firstTransition.left_ear_hz);

        const config = {
          base_frequency: baseFreq,
          beat_frequency: beatFreq,
          volume: DEFAULT_VOLUME,
          waveform: 'sine' as const,
        };

        // CRITICAL: Initialize audio context first (requires user gesture)
        if ((audioEngine as any).initializeAudio) {
          try {
            const audioContext = await (audioEngine as any).initializeAudio();
            if (audioContext) {
            }
          } catch (error) {
          }
        }

        // Start the audio engine (it will read from AudioState)
        await audioEngine.startBinauralBeat(config);

        // Send initial timer state via WebSocket
        sendTimerUpdate({
          action: 'start',
          preset: selectedPresetId,
          firstTransition: firstTransition,
          totalTransitions: mockTransitions.length,
          isRunning: true,
          totalTime: mockTransitions.reduce((sum, t) => sum + t.duration_minutes, 0),
          progress: 0
        });

        // If preset specifies a pattern, set it active
        const currentPreset = presets.find(p => p.id === selectedPresetId);
        if (patterns8DControl && currentPreset && (currentPreset).pattern_id) {
          const patternId = (currentPreset ).pattern_id;
          const realPattern = WAVE_PATTERNS.find(p => p.id === patternId);
          if (realPattern) {
            patterns8DControl.setActivePattern(realPattern);
          }
        }

        // Set initial electromagnetic state (driven by real frequency)
        updateElectromagneticState(firstTransition);
      }

      loadTimerStatus();

    } catch (err) {
      setError('Error starting timer');
    } finally {
      setLoading(false);
    }
  };

  const controlTimer = async (action: TimerAction) => {
    if (!timerState && action !== 'restart') return;

    try {
      setLoading(true);

      if (action === 'stop') {
        if (audioEngine) {
          await audioEngine.stopBinauralBeat();
        }

        // 🔥 NEW: Stop audio via AudioState
        updateAudioState.setPlaying(false);

        // Send stop action via WebSocket
        sendTimerUpdate({ action: 'stop' });

        // Clear visualizer pattern
        if (patterns8DControl) {
          patterns8DControl.clearActivePattern();
        }

        // Clear electromagnetic state
        if (onElectromagneticUpdate) {
          onElectromagneticUpdate({
            strength: 0,
            frequency: 0,
            phase: 0,
            coherence: 0,
            resonance: 0,
            state: 'INACTIVE',
            stability: 0
          });
        }

        setTimerState(null);
        currentTransitionIndexRef.current = null;
      } else if (action === 'pause') {
        setTimerState({...timerState!, isPaused: true});
        updateAudioState.setPlaying(false);
        sendTimerUpdate({
          action: 'pause',
          isRunning: false,
          totalTime: timerState!.transitions.reduce((sum, t) => sum + t.duration_minutes, 0),
          progress: 0
        });
      } else if (action === 'resume') {
        setTimerState({...timerState!, isPaused: false});
        updateAudioState.setPlaying(true);
        sendTimerUpdate({
          action: 'resume',
          isRunning: true,
          totalTime: timerState!.transitions.reduce((sum, t) => sum + t.duration_minutes, 0),
          progress: 0
        });
      } else if (action === 'restart') {
        if (audioEngine) {
          await audioEngine.stopBinauralBeat();
        }

        // Clear visualizer pattern temporarily
        if (patterns8DControl) {
          patterns8DControl.clearActivePattern();
        }

        setTimerState(null);
        updateAudioState.setPlaying(false);
        currentTransitionIndexRef.current = null;

        setTimeout(() => {
          if (selectedPresetId) {
            const currentPreset = presets.find(p => p.id === selectedPresetId);
            const wasLooping = timerState && timerState.forceLoop;
            startTimer(wasLooping || currentPreset?.loop_enabled);
          }
        }, 100);
      }

    } catch (err) {
    } finally {
      if (action !== 'restart') {
        setLoading(false);
      }
    }
  };

  const saveCustomPreset = (customPreset: CustomPresetForm) => {

    if (!customPreset.name.trim()) {
      setError('Please enter a preset name');
      return;
    }

    const totalDuration = customPreset.transitions.reduce((sum, t) => sum + t.duration_minutes, 0);
    const presetId = `custom-${Date.now()}-${crypto.randomUUID()}`;

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

    setPresets(prev => {
      const updated = [...prev, newPreset];
      return updated;
    });

    setSelectedPresetId(newPreset.id);
    setError(null);

  };

  const updateCustomPreset = (presetId: string, updatedPreset: CustomPresetForm) => {

    if (!updatedPreset.name.trim()) {
      setError('Please enter a preset name');
      return false;
    }

    if (!isCustomPreset(presetId)) {
      setError('Cannot update built-in presets');
      return false;
    }

    const totalDuration = updatedPreset.transitions.reduce((sum, t) => sum + t.duration_minutes, 0);

    const newPresetData: TimerPreset = {
      id: presetId,
      name: updatedPreset.name,
      description: updatedPreset.description || `Custom preset - ${totalDuration} minutes`,
      total_duration: totalDuration,
      transitions_count: updatedPreset.transitions.length,
      tags: ['custom'],
      is_premium: false,
      available: true
    };

    const success = updatePresetInStorage(presetId, newPresetData, updatedPreset.transitions);

    if (success) {
      setCustomPresetTransitions(prev => ({
        ...prev,
        [presetId]: updatedPreset.transitions
      }));

      setPresets(prev => prev.map(p =>
          p.id === presetId ? newPresetData : p
      ));

      setError(null);
      return true;
    } else {
      setError('Failed to update preset');
      return false;
    }
  };

  const deleteCustomPreset = (presetId: string) => {

    if (!isCustomPreset(presetId)) {
      setError('Cannot delete built-in presets');
      return false;
    }

    const success = deletePresetFromStorage(presetId);

    if (success) {
      setCustomPresetTransitions(prev => {
        const updated = { ...prev };
        delete updated[presetId];
        return updated;
      });

      setPresets(prev => prev.filter(p => p.id !== presetId));

      if (selectedPresetId === presetId) {
        setSelectedPresetId('');
      }

      setError(null);
      return true;
    } else {
      setError('Failed to delete preset');
      return false;
    }
  };

  // 🔥 FIXED: Validate selectedPresetId after presets are loaded
  useEffect(() => {
    if (presets.length > 0 && selectedPresetId) {
      // Check if selected preset exists in available presets
      const presetExists = presets.some(p => p.id === selectedPresetId);
      if (!presetExists) {
        setSelectedPresetId('');
        localStorage.removeItem('ebl_selected_preset');
      }
    }
  }, [presets, selectedPresetId]);

  useEffect(() => {
    loadPresets();
  }, []);

  // 🔥 CRITICAL FIX: Keep ref updated with latest loadTimerStatus
  useEffect(() => {
    loadTimerStatusRef.current = loadTimerStatus;
  }, [loadTimerStatus]);

  // 🔥 CRITICAL FIX: Interval with stable dependencies - no loadTimerStatus in deps!
  // This prevents the interval from being destroyed/recreated on every render
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerState?.isActive && !timerState?.isPaused) {
      // Update every second for countdown display
      interval = setInterval(() => {
        // Call via ref to always get latest version
        loadTimerStatusRef.current?.();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState?.isActive, timerState?.isPaused]); // 🔥 REMOVED loadTimerStatus from deps!

  // Navigation functions for timer transitions
  const jumpToTransition = async (direction: 'next' | 'previous') => {
    if (!timerState || !timerState.transitions.length) return;

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - timerState.startTime) / 1000);

    let currentTransitionIndex = 0;
    let elapsedInTransitionsSeconds = elapsedSeconds;

    // Calculate current transition index
    for (const element of timerState.transitions) {
      const transitionDurationSeconds = element.duration_minutes * 60;
      if (elapsedInTransitionsSeconds >= transitionDurationSeconds) {
        elapsedInTransitionsSeconds -= transitionDurationSeconds;
        currentTransitionIndex++;
      } else {
        break;
      }
    }

    let targetIndex: number;

    if (direction === 'next') {
      targetIndex = Math.min(currentTransitionIndex + 1, timerState.transitions.length - 1);
    } else {
      targetIndex = Math.max(currentTransitionIndex - 1, 0);
    }

    if (targetIndex === currentTransitionIndex) {
      return;
    }

    // Calculate elapsed time up to target transition
    let newElapsedSeconds = 0;
    for (let i = 0; i < targetIndex; i++) {
      newElapsedSeconds += timerState.transitions[i].duration_minutes * 60;
    }

    // Update timer start time to reflect new position
    const newStartTime = Date.now() - (newElapsedSeconds * 1000);

    setTimerState({
      ...timerState,
      startTime: newStartTime
    });

    // Send update via WebSocket
    sendTimerUpdate({
      action: `jump_${direction}`,
      transitionIndex: targetIndex
    });

    // Immediately trigger loadTimerStatus to update audio engine
    setTimeout(() => loadTimerStatus(), 100);
  };

  const restartCurrentTransition = () => {
    if (!timerState || !timerState.transitions.length) return;

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - timerState.startTime) / 1000);

    let currentTransitionIndex = 0;
    let elapsedInTransitionsSeconds = elapsedSeconds;

    // Calculate current transition index
    for (const element of timerState.transitions) {
      const transitionDurationSeconds = element.duration_minutes * 60;
      if (elapsedInTransitionsSeconds >= transitionDurationSeconds) {
        elapsedInTransitionsSeconds -= transitionDurationSeconds;
        currentTransitionIndex++;
      } else {
        break;
      }
    }

    // Calculate elapsed time up to current transition (restart it)
    let newElapsedSeconds = 0;
    for (let i = 0; i < currentTransitionIndex; i++) {
      newElapsedSeconds += timerState.transitions[i].duration_minutes * 60;
    }

    // Update timer start time to restart current transition
    const newStartTime = Date.now() - (newElapsedSeconds * 1000);

    setTimerState({
      ...timerState,
      startTime: newStartTime
    });

    // Send update via WebSocket
    sendTimerUpdate({
      action: 'restart_transition',
      transitionIndex: currentTransitionIndex
    });

    // Immediately trigger loadTimerStatus to update display
    setTimeout(() => loadTimerStatus(), 100);
  };

  return {
    presets,
    selectedPresetId,
    setSelectedPresetId,
    // 🔥 NEW: Return timer-only state instead of full TimerStatus
    timerState,  // { startTime, currentTransitionIndex, transitions, isActive, isPaused, forceLoop? }
    // Computed helpers
    isTimerRunning: timerState?.isActive && !timerState?.isPaused && audioState.isPlaying,
    loading,
    error,
    hideSession,
    setHideSession,
    startTimer,
    controlTimer,
    saveCustomPreset,
    updateCustomPreset,
    deleteCustomPreset,
    customPresetTransitions,
    isWebSocketConnected: isConnected, // Simple boolean for WebSocket status
    jumpToTransition,
    restartCurrentTransition
  };
};