import { useState, useEffect, useCallback, useRef } from 'react';

import {
  ALL_TIMER_PRESETS,
  getPresetTransitions,
  type TimerPreset,
  type TimerStatus,
  type LocalTimer,
  type FrequencyTransition,
  type TimerSession,
  type TimerAction,
  type CustomPresetForm
} from '../data/timer';
import { loadCustomPresets, savePresetToStorage, updatePresetInStorage, deletePresetFromStorage, isCustomPreset } from '../helpers/timer/timerUtils';
import { WAVE_PATTERNS } from '../data/patterns';
import type {PatternConfig} from "../types";
import { useWebSocketContext } from './useWebsocketContext';

interface UseTimerLogicProps {
  audioEngine?: {
    sessionId: string | null;
    startBinauralBeat: (config: any) => Promise<void>;
    stopBinauralBeat: () => Promise<void>;
    updateFrequency: (left: number, right: number) => void;
    audioState: {
      isPlaying: boolean;
    };
  };
  patterns8D?: {
    setActivePattern: (pattern: PatternConfig) => void;
    clearActivePattern: () => void;
  };
  onElectromagneticUpdate?: (electromagnetic: {
    strength: number;
    frequency: any;
    phase: number;
    coherence: number;
    resonance: number;
    state: string;
    stability: number
  }) => void;
  onTimerStatusUpdate?: (status: TimerStatus) => void;
}

export const useTimerLogic = (props: UseTimerLogicProps) => {
  // Get props
  const {
    audioEngine,
    patterns8D,
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
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
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

      // Update frequencies directly on the audio engine
      audioEngine.updateFrequency(currentTransition.left_ear_hz, currentTransition.right_ear_hz);

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
        const config = {
          base_frequency: firstTransition.left_ear_hz,
          beat_frequency: firstTransition.frequency_hz,
          amplitude: 0.7,
          waveform: 'sine' as const,
        };

        console.log('🔥 Timer: Starting audio engine');
        console.log('🔥 Timer: Config:', config);
        console.log('🔥 Timer: Has backend session:', !!audioEngine?.sessionId);

        // Start the audio engine (it will handle reusing existing sessions)
        console.log('🚀 Timer: Starting audio engine with config:', config);
        await audioEngine.startBinauralBeat(config);

        // Send initial timer state via WebSocket
        sendTimerUpdate({
          action: 'start',
          preset: selectedPresetId,
          firstTransition: firstTransition,
          totalTransitions: mockTransitions.length
        });

        // If preset specifies a pattern, set it active
        const currentPreset = presets.find(p => p.id === selectedPresetId);
        if (patterns8D && currentPreset && (currentPreset).pattern_id) {
          const patternId = (currentPreset ).pattern_id;
          const realPattern = WAVE_PATTERNS.find(p => p.id === patternId);
          if (realPattern) {
            console.log('🎨 Timer: Setting REAL pattern for visualizer:', realPattern.name);
            patterns8D.setActivePattern(realPattern);
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
        if (patterns8D) {
          console.log('🎨 Timer: Clearing active pattern from visualizer');
          patterns8D.clearActivePattern();
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
        sendTimerUpdate({ action: 'pause' });
      } else if (action === 'resume') {
        setLocalTimer({...localTimer!, isPaused: false});
        sendTimerUpdate({ action: 'resume' });
      } else if (action === 'restart') {
        if (audioEngine) {
          await audioEngine.stopBinauralBeat();
        }

        // Clear visualizer pattern temporarily
        if (patterns8D) {
          patterns8D.clearActivePattern();
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
    isWebSocketConnected: isConnected // Simple boolean for WebSocket status
  };
};