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
  AnyAudioEngine,
    LocalTimer,
    TimerStatus
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
  audioState: AudioState;  // 🔥 NEW: Use centralized AudioState instead of local state
  updateAudioState: {
    updateFrequencies: (left: number, right: number) => void;
    setPlaying: (playing: boolean) => void;
  };
  patterns8DControl?: {
    setActivePattern: (pattern: PatternConfig) => void;
    clearActivePattern: () => void;
  };
  onElectromagneticUpdate?: (electromagnetic: ElectromagneticField) => void;
}

export const useTimerLogic = (props: UseTimerLogicProps) => {
  // Get props
  const {
    audioEngine,
    patterns8DControl,
    onElectromagneticUpdate,
    onTimerStatusUpdate
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
  const [timerStatus, setTimerStatus] = useState<TimerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hideSession, setHideSession] = useState(false);
  const [localTimer, setLocalTimer] = useState<LocalTimer | null>(null);
  const [customPresetTransitions, setCustomPresetTransitions] = useState<{[key: string]: FrequencyTransition[]}>({});

  const currentTransitionIndexRef = useRef<number | null>(null);

  // Function to send timer updates via WebSocket
  const sendTimerUpdate = useCallback((data: TimerStatus) => {
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
      console.log('⏰ Timer response from backend:', lastMessage.data);
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

    console.log('🎨 Timer: Updating electromagnetic state for visualizer:', electromagnetic);
    if (onElectromagneticUpdate) {
      onElectromagneticUpdate(electromagnetic);
    }
  }, [onElectromagneticUpdate]); 
  // Save selected preset to localStorage whenever it changes
  useEffect(() => {
    if (selectedPresetId) {
      localStorage.setItem('ebl_selected_preset', selectedPresetId);
      console.log('💾 Saved preset to localStorage:', selectedPresetId);
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
                console.log('🗑️ Removing duplicate preset:', preset.id);
                return false;
              }
              seenIds.add(preset.id);
              return true;
            });
            if (cleanPresets.length !== presets.length) {
              localStorage.setItem('ebl-custom-presets', JSON.stringify(cleanPresets));
              console.log('🧹 Cleaned up duplicate presets');
            }
          }
        } catch (err) {
          console.error('Error cleaning duplicates:', err);
        }
      };

      cleanupDuplicates();
      const { savedCustomPresets, savedTransitions } = loadCustomPresets();
      setCustomPresetTransitions(savedTransitions);

      const allPresets = [...ALL_TIMER_PRESETS, ...savedCustomPresets];
      setPresets(allPresets);

      console.log('✅ ALL PRESETS LOADED:', allPresets);
    } catch (err) {
      setError('Error loading presets');
      console.error('Error loading presets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTimerStatus = useCallback(async () => {
    if (!localTimer || !localTimer.isActive) return;

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - localTimer.startTime) / 1000);

    let currentTransitionIndex = 0;
    let elapsedInTransitionsSeconds = elapsedSeconds;

    for (const element of localTimer.transitions) {
      const transitionDurationSeconds = element.duration_minutes * 60;
      if (elapsedInTransitionsSeconds >= transitionDurationSeconds) {
        elapsedInTransitionsSeconds -= transitionDurationSeconds;
        currentTransitionIndex++;
      } else {
        break;
      }
    }

    if (currentTransitionIndex >= localTimer.transitions.length) {
      // Check if loop is enabled for the current preset
      const currentPreset = presets.find(p => p.id === selectedPresetId);
      if (currentPreset?.loop_enabled || (localTimer).forceLoop) {
        // Reset to beginning for loop
        setLocalTimer({
          ...localTimer,
          startTime: Date.now(),
          currentTransitionIndex: 0
        });
        currentTransitionIndexRef.current = null;
        return;
      } else {
        // End the session
        setLocalTimer(null);
        setTimerStatus(null);
        currentTransitionIndexRef.current = null;
        return;
      }
    }

    const currentTransition = localTimer.transitions[currentTransitionIndex];
    const nextTransition = localTimer.transitions[currentTransitionIndex + 1] || null;
    const currentTransitionDurationSeconds = currentTransition.duration_minutes * 60;
    const timeRemainingCurrentSeconds = currentTransitionDurationSeconds - elapsedInTransitionsSeconds;
    const timeRemainingCurrentMinutes = timeRemainingCurrentSeconds / 60;

    const totalTimeRemainingSeconds = localTimer.transitions
        .slice(currentTransitionIndex)
        .reduce((sum, t, i) => {
          if (i === 0) return sum + timeRemainingCurrentSeconds;
          return sum + (t.duration_minutes * 60);
        }, 0);
    const totalTimeRemainingMinutes = totalTimeRemainingSeconds / 60;

    const currentPreset = presets.find(p => p.id === selectedPresetId);



    const status: TimerStatus = {
      session: audioEngine?.sessionId ? {
        presetId: currentPreset,
        startTime: localTimer.startTime,
        currentPhase: currentTransitionIndex,
        isPaused: localTimer.isPaused,
        loopCount: 0,
        session_id: audioEngine.sessionId
      } : undefined,
      current_transition: currentTransition,
      next_transition: nextTransition,
      time_remaining_current: timeRemainingCurrentMinutes,
      time_remaining_total: totalTimeRemainingMinutes,
      isRunning: localTimer?.isActive && !localTimer?.isPaused,
      totalTime: localTimer?.transitions.reduce((sum, t) => sum + t.duration_minutes, 0) || 0,
      progress: (localTimer && totalTimeRemainingMinutes) ?
          (1 - (totalTimeRemainingMinutes / localTimer.transitions.reduce((sum, t) => sum + t.duration_minutes, 0))) * 100 : 0
    };

    console.log('⏰ Timer Status Updated:', {
      isRunning: status.isRunning,
      hasTransition: !!status.current_transition,
      timeRemaining: status.time_remaining_current,
      status
    });

    setTimerStatus(status);
    console.log('📤 AudioEngine Pimping', audioEngine);
    // Notify parent component of timer status changes
    if (onTimerStatusUpdate) {
      console.log('📤 Calling onTimerStatusUpdate with status:', status);
      onTimerStatusUpdate(status);
    } else {
      console.warn('⚠️ No onTimerStatusUpdate callback provided!');
    }

    if (audioEngine && currentTransition && currentTransitionIndexRef.current !== currentTransitionIndex) {
      console.log(`🚨 TIMER TRANSITION ${currentTransitionIndex + 1}/${localTimer.transitions.length}: ${currentTransition.left_ear_hz}Hz / ${currentTransition.right_ear_hz}Hz`);
      console.log(`🎯 ${currentTransition.description} - ${currentTransition.frequency_hz}Hz ${currentTransition.frequency_type} for ${currentTransition.duration_minutes} minutes`);

      // Update frequencies based on engine type
      // Backend engine uses updateSettings({ base_frequency, beat_frequency })
      // Frontend engine uses updateFrequency(leftFreq, rightFreq)

      // 🔥 FIXED: Calculate correct base_frequency (must be the LOWER of the two frequencies)
      const baseFreq = Math.min(currentTransition.left_ear_hz, currentTransition.right_ear_hz);
      const beatFreq = Math.abs(currentTransition.right_ear_hz - currentTransition.left_ear_hz);

      if ((audioEngine as any).updateSettings) {
        // Backend engine - use base/beat model
        console.log('🎛️ Timer: Updating backend engine with base:', baseFreq, 'beat:', beatFreq);
        (audioEngine as any).updateSettings({
          base_frequency: baseFreq,  // 🔥 FIXED: Use calculated minimum frequency as carrier
          beat_frequency: beatFreq   // 🔥 FIXED: Use calculated beat frequency
        });
      } else if (audioEngine.updateFrequency) {
        // Frontend engine - use left/right model
        console.log('🎛️ Timer: Updating frontend engine with left:', currentTransition.left_ear_hz, 'right:', currentTransition.right_ear_hz);
        audioEngine.updateFrequency(currentTransition.left_ear_hz, currentTransition.right_ear_hz);
      }

      // Send timer update via WebSocket if connected
      sendTimerUpdate({
        currentTime: Date.now() - localTimer.startTime, isPaused: false, isRunning: false, progress: 0, totalTime: 0,
        current_transition: currentTransition,
        transitionIndex: currentTransitionIndex,
        totalTransitions: localTimer.transitions.length,
        leftFreq: currentTransition.left_ear_hz,
        rightFreq: currentTransition.right_ear_hz,
        beat_frequency: currentTransition.frequency_hz
      });

      // Update electromagnetic state for visualizer (driven by real frequency)
      updateElectromagneticState(currentTransition);

      currentTransitionIndexRef.current = currentTransitionIndex;
    }
  }, [localTimer, audioEngine, selectedPresetId, presets, updateElectromagneticState, onTimerStatusUpdate, sendTimerUpdate]);

  const startTimer = async (forceLoop?: boolean) => {
    if (!selectedPresetId) return;

    try {
      setLoading(true);
      setError(null);

      currentTransitionIndexRef.current = null;

      const mockTransitions: FrequencyTransition[] = [];

      if (selectedPresetId.startsWith('custom-')) {
        const customTransitions = customPresetTransitions[selectedPresetId];
        console.log('🔥 Custom preset transitions lookup:', selectedPresetId, customTransitions);
        console.log('🔥 Available custom presets:', Object.keys(customPresetTransitions));
        if (customTransitions && customTransitions.length > 0) {
          mockTransitions.push(...customTransitions);
          console.log('✅ Custom transitions loaded:', mockTransitions.length);
        } else {
          console.error('❌ No custom transitions found for preset:', selectedPresetId);
          setError('No transitions found for this custom preset');
          return;
        }
      } else {
        const presetTransitions = getPresetTransitions(selectedPresetId);
        mockTransitions.push(...presetTransitions);
        console.log('✅ Built-in transitions loaded:', mockTransitions.length);
      }

      const timer: LocalTimer = {
        startTime: Date.now(),
        currentTransitionIndex: 0,
        transitions: mockTransitions,
        isActive: true,
        isPaused: false,
        forceLoop: forceLoop
      } as LocalTimer & { forceLoop?: boolean };

      setLocalTimer(timer);

      if (audioEngine && mockTransitions.length > 0) {
        const firstTransition = mockTransitions[0];

        // Convert timer frequencies to proper format for BOTH engines
        // Backend engine expects: { base_frequency, beat_frequency }
        // Frontend engine expects: { base_frequency, beat_frequency } (same now!)

        // 🔥 FIXED: Calculate correct base_frequency (must be the LOWER of the two frequencies)
        const baseFreq = Math.min(firstTransition.left_ear_hz, firstTransition.right_ear_hz);
        const beatFreq = Math.abs(firstTransition.right_ear_hz - firstTransition.left_ear_hz);

        const config = {
          base_frequency: baseFreq,   // 🔥 FIXED: Use calculated minimum frequency as carrier
          beat_frequency: beatFreq,   // 🔥 FIXED: Use calculated beat frequency
          amplitude: DEFAULT_VOLUME,
          waveform: 'sine' as const,
        };

        console.log('🔥 Timer: Starting audio engine');
        console.log('🔥 Timer: Config:', config);
        console.log('🔥 Timer: Has backend session:', !!audioEngine?.sessionId);

        // CRITICAL: Initialize audio context first (requires user gesture)
        if ((audioEngine as any).initializeAudio) {
          try {
            console.log('🎵 Timer: Initializing audio context...');
            const audioContext = await (audioEngine as any).initializeAudio();
            if (audioContext) {
              console.log('✅ Timer: Audio context initialized:', audioContext.state);
            }
          } catch (error) {
            console.warn('⚠️ Timer: Audio context initialization failed:', error);
          }
        }

        // Start the audio engine (it will handle reusing existing sessions)
        console.log('🚀 Timer: Starting audio engine with config:', config);
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
            console.log('🎨 Timer: Setting REAL pattern for visualizer:', realPattern.name);
            patterns8DControl.setActivePattern(realPattern);
          }
        }

        // Set initial electromagnetic state (driven by real frequency)
        updateElectromagneticState(firstTransition);
      }

      loadTimerStatus();

    } catch (err) {
      setError('Error starting timer');
      console.error('Error starting timer:', err);
    } finally {
      setLoading(false);
    }
  };

  const controlTimer = async (action: TimerAction) => {
    if (!localTimer && action !== 'restart') return;

    try {
      setLoading(true);

      if (action === 'stop') {
        if (audioEngine) {
          await audioEngine.stopBinauralBeat();
        }

        // Send stop action via WebSocket
        sendTimerUpdate({ action: 'stop' });

        // Clear visualizer pattern
        if (patterns8DControl) {
          console.log('🎨 Timer: Clearing active pattern from visualizer');
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

        setLocalTimer(null);
        setTimerStatus(null);
        currentTransitionIndexRef.current = null;

        // Notify parent that timer stopped
        if (onTimerStatusUpdate) {
          onTimerStatusUpdate(null);
        }
      } else if (action === 'pause') {
        setLocalTimer({...localTimer!, isPaused: true});
        sendTimerUpdate({
          action: 'pause',
          isRunning: false,
          totalTime: 0,
          progress: 0
        });
      } else if (action === 'resume') {
        setLocalTimer({...localTimer!, isPaused: false});
        sendTimerUpdate(({...timerStatus!,isRunning:true,totalTime:timerStatus!.totalTime,progress:timerStatus!.progress,isPaused:false}));
      } else if (action === 'restart') {
        if (audioEngine) {
          audioEngine.stopBinauralBeat();

        }

        // Clear visualizer pattern temporarily
        if (patterns8DControl) {
          patterns8DControl.clearActivePattern();
        }

        setLocalTimer(null);
        setTimerStatus(null);
        currentTransitionIndexRef.current = null;

        setTimeout(() => {
          if (selectedPresetId) {
            const currentPreset = presets.find(p => p.id === selectedPresetId);
            const wasLooping = localTimer && (localTimer).forceLoop;
            startTimer(wasLooping || currentPreset?.loop_enabled);
          }
        }, 100);
      }

    } catch (err) {
      console.error(`Error ${action} timer:`, err);
    } finally {
      if (action !== 'restart') {
        setLoading(false);
      }
    }
  };

  const saveCustomPreset = (customPreset: CustomPresetForm) => {
    console.log('🔥 ATTEMPTING TO SAVE PRESET:', customPreset.name);

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

    console.log('🎉 PRESET SAVE COMPLETED SUCCESSFULLY!');
  };

  const updateCustomPreset = (presetId: string, updatedPreset: CustomPresetForm) => {
    console.log('🔄 ATTEMPTING TO UPDATE PRESET:', presetId);

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
      console.log('🎉 PRESET UPDATE COMPLETED SUCCESSFULLY!');
      return true;
    } else {
      setError('Failed to update preset');
      return false;
    }
  };

  const deleteCustomPreset = (presetId: string) => {
    console.log('🗑️ ATTEMPTING TO DELETE PRESET:', presetId);

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
      console.log('🎉 PRESET DELETE COMPLETED SUCCESSFULLY!');
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
        console.warn(`⚠️ Selected preset "${selectedPresetId}" no longer exists, resetting to empty`);
        setSelectedPresetId('');
        localStorage.removeItem('ebl_selected_preset');
      }
    }
  }, [presets, selectedPresetId]);

  useEffect(() => {
    loadPresets();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (localTimer?.isActive && !localTimer?.isPaused) {
      // Update every second for countdown display
      interval = setInterval(() => {
        loadTimerStatus();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [localTimer?.isActive, localTimer?.isPaused, loadTimerStatus]);

  // Navigation functions for timer transitions
  const jumpToTransition = async (direction: 'next' | 'previous') => {
    if (!localTimer || !localTimer.transitions.length) return;

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - localTimer.startTime) / 1000);

    let currentTransitionIndex = 0;
    let elapsedInTransitionsSeconds = elapsedSeconds;

    // Calculate current transition index
    for (const element of localTimer.transitions) {
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
      targetIndex = Math.min(currentTransitionIndex + 1, localTimer.transitions.length - 1);
    } else {
      targetIndex = Math.max(currentTransitionIndex - 1, 0);
    }

    if (targetIndex === currentTransitionIndex) {
      console.log('⏩ Already at boundary transition');
      return;
    }

    // Calculate elapsed time up to target transition
    let newElapsedSeconds = 0;
    for (let i = 0; i < targetIndex; i++) {
      newElapsedSeconds += localTimer.transitions[i].duration_minutes * 60;
    }

    // Update timer start time to reflect new position
    const newStartTime = Date.now() - (newElapsedSeconds * 1000);

    setLocalTimer({
      ...localTimer,
      startTime: newStartTime
    });

    console.log(`⏩ Jumped to transition ${targetIndex + 1}/${localTimer.transitions.length}`);

    // Send update via WebSocket
    sendTimerUpdate({
      action: `jump_${direction}`,
      transitionIndex: targetIndex
    });

    // Immediately trigger loadTimerStatus to update audio engine
    setTimeout(() => loadTimerStatus(), 100);
  };

  const restartCurrentTransition = () => {
    if (!localTimer || !localTimer.transitions.length) return;

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - localTimer.startTime) / 1000);

    let currentTransitionIndex = 0;
    let elapsedInTransitionsSeconds = elapsedSeconds;

    // Calculate current transition index
    for (const element of localTimer.transitions) {
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
      newElapsedSeconds += localTimer.transitions[i].duration_minutes * 60;
    }

    // Update timer start time to restart current transition
    const newStartTime = Date.now() - (newElapsedSeconds * 1000);

    setLocalTimer({
      ...localTimer,
      startTime: newStartTime
    });

    console.log(`🔄 Restarted transition ${currentTransitionIndex + 1}/${localTimer.transitions.length}`);

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
    timerStatus,
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