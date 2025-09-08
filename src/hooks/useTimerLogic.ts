import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  TimerPreset, 
  TimerStatus, 
  LocalTimer, 
  FrequencyTransition,
  TimerAction,
  CustomPresetForm,
  TimerSession
} from '../data/timer/types';
import { ALL_TIMER_PRESETS, getPresetTransitions } from '../data/timer';
import { loadCustomPresets, savePresetToStorage, updatePresetInStorage, deletePresetFromStorage, isCustomPreset } from '../helpers/timer/timerUtils';

interface UseTimerLogicProps {
  audioEngine?: {
    startBinauralBeat: (config: never) => void;
    stopBinauralBeat: () => void;
    updateFrequency: (left: number, right: number) => void;
    audioState: {
      isPlaying: boolean;
    };
  };
}

export const useTimerLogic = ({ audioEngine }: UseTimerLogicProps) => {
  const [presets, setPresets] = useState<TimerPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [timerStatus, setTimerStatus] = useState<TimerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hideSession, setHideSession] = useState(false);
  const [localTimer, setLocalTimer] = useState<LocalTimer | null>(null);
  const [customPresetTransitions, setCustomPresetTransitions] = useState<{[key: string]: FrequencyTransition[]}>({});
  
  const currentTransitionIndexRef = useRef<number | null>(null);

  const loadPresets = async () => {
    try {
      setLoading(true);
      setError(null);

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
    const elapsed = Math.floor((now - localTimer.startTime) / 1000 / 60);

    let currentTransitionIndex = 0;
    let elapsedInTransitions = elapsed;

    for (const element of localTimer.transitions) {
      if (elapsedInTransitions >= element.duration_minutes) {
        elapsedInTransitions -= element.duration_minutes;
        currentTransitionIndex++;
      } else {
        break;
      }
    }

    if (currentTransitionIndex >= localTimer.transitions.length) {
      // Check if loop is enabled for the current preset
      const currentPreset = presets.find(p => p.id === selectedPresetId);
      if (currentPreset?.loop_enabled || (localTimer as any).forceLoop) {
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
    const timeRemainingCurrent = currentTransition.duration_minutes - elapsedInTransitions;

    const totalTimeRemaining = localTimer.transitions
      .slice(currentTransitionIndex)
      .reduce((sum, t, i) => {
        if (i === 0) return sum + timeRemainingCurrent;
        return sum + t.duration_minutes;
      }, 0);

    const currentPreset = presets.find(p => p.id === selectedPresetId);
    
    const mockSession: TimerSession = {
      session_id: 'mock-session-' + Date.now(),
      preset_id: selectedPresetId,
      user_id: 'mock-user',
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

    if (audioEngine && currentTransition && currentTransitionIndexRef.current !== currentTransitionIndex) {
      console.log(`🔄 Timer transition changed to index ${currentTransitionIndex}: ${currentTransition.left_ear_hz}Hz / ${currentTransition.right_ear_hz}Hz`);
      audioEngine.updateFrequency(currentTransition.left_ear_hz, currentTransition.right_ear_hz);
      currentTransitionIndexRef.current = currentTransitionIndex;
    }
  }, [localTimer, audioEngine, selectedPresetId]);

  const startTimer = async (forceLoop?: boolean) => {
    if (!selectedPresetId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      currentTransitionIndexRef.current = null;
      
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
        isPaused: false,
        forceLoop: forceLoop
      } as LocalTimer & { forceLoop?: boolean };
      
      setLocalTimer(timer);
      
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
          audioEngine.stopBinauralBeat();
        }
        setLocalTimer(null);
        setTimerStatus(null);
        currentTransitionIndexRef.current = null;
      } else if (action === 'pause') {
        setLocalTimer({...localTimer!, isPaused: true});
      } else if (action === 'resume') {
        setLocalTimer({...localTimer!, isPaused: false});
      } else if (action === 'restart') {
        if (audioEngine) {
          audioEngine.stopBinauralBeat();
        }
        setLocalTimer(null);
        setTimerStatus(null);
        currentTransitionIndexRef.current = null;
        
        setTimeout(() => {
          if (selectedPresetId) {
            const currentPreset = presets.find(p => p.id === selectedPresetId);
            const wasLooping = localTimer && (localTimer as any).forceLoop;
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
      interval = setInterval(loadTimerStatus, 1000);
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
    customPresetTransitions
  };
};