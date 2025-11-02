export const getWaveTypeFromFrequency = (frequency: number): string => {
  if (frequency >= 0.5 && frequency <= 4) return 'Delta';
  if (frequency > 4 && frequency <= 8) return 'Theta';
  if (frequency > 8 && frequency <= 13) return 'Alpha';
  if (frequency > 13 && frequency <= 30) return 'Beta';
  if (frequency > 30) return 'Gamma';
  return 'Alpha'; // default
};

export const formatTime = (minutes: number): string => {
  const hrs = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const secs = Math.floor((minutes % 1) * 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const loadCustomPresets = () => {
  try {
    const savedPresetsJson = localStorage.getItem('ebl-custom-presets');
    const savedTransitionsJson = localStorage.getItem('ebl-custom-preset-transitions');
    
    let savedCustomPresets = [];
    let savedTransitions = {};
    
    if (savedPresetsJson) {
      savedCustomPresets = JSON.parse(savedPresetsJson);
    }
    
    if (savedTransitionsJson) {
      savedTransitions = JSON.parse(savedTransitionsJson);
    }
    
    return { savedCustomPresets, savedTransitions };
  } catch (err) {
    return { savedCustomPresets: [], savedTransitions: {} };
  }
};

export const savePresetToStorage = (presetId: string, preset: any, transitions: any[]) => {
  try {
    // Save transitions
    const currentTransitions = JSON.parse(localStorage.getItem('ebl-custom-preset-transitions') || '{}');
    currentTransitions[presetId] = transitions;
    localStorage.setItem('ebl-custom-preset-transitions', JSON.stringify(currentTransitions));
    
    // Save preset
    const currentPresets = JSON.parse(localStorage.getItem('ebl-custom-presets') || '[]');
    currentPresets.push(preset);
    localStorage.setItem('ebl-custom-presets', JSON.stringify(currentPresets));
    
    return true;
  } catch (err) {
    return false;
  }
};

export const updatePresetInStorage = (presetId: string, updatedPreset: any, updatedTransitions: any[]) => {
  try {
    // Update transitions
    const currentTransitions = JSON.parse(localStorage.getItem('ebl-custom-preset-transitions') || '{}');
    currentTransitions[presetId] = updatedTransitions;
    localStorage.setItem('ebl-custom-preset-transitions', JSON.stringify(currentTransitions));
    
    // Update preset
    const currentPresets = JSON.parse(localStorage.getItem('ebl-custom-presets') || '[]');
    const presetIndex = currentPresets.findIndex((p: any) => p.id === presetId);
    
    if (presetIndex !== -1) {
      currentPresets[presetIndex] = updatedPreset;
      localStorage.setItem('ebl-custom-presets', JSON.stringify(currentPresets));
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

export const deletePresetFromStorage = (presetId: string) => {
  try {
    // Remove transitions
    const currentTransitions = JSON.parse(localStorage.getItem('ebl-custom-preset-transitions') || '{}');
    delete currentTransitions[presetId];
    localStorage.setItem('ebl-custom-preset-transitions', JSON.stringify(currentTransitions));
    
    // Remove preset
    const currentPresets = JSON.parse(localStorage.getItem('ebl-custom-presets') || '[]');
    const filteredPresets = currentPresets.filter((p: any) => p.id !== presetId);
    localStorage.setItem('ebl-custom-presets', JSON.stringify(filteredPresets));
    
    return true;
  } catch (err) {
    return false;
  }
};

export const isCustomPreset = (presetId: string) => {
  return presetId.startsWith('custom-');
};

/**
 * Build TimerStatus from timerState + audioState
 * 🔥 CRITICAL: This is a COMPUTED helper, NOT stored state
 * TimerStatus is built on-demand for UI display purposes
 */
export const buildTimerStatus = (
  timerState: any | null,  // TimerOnlyState from useTimerLogic
  audioState: any,          // AudioState from HybridEngine
  sessionId?: string | null
): any | null => {  // Returns TimerStatus or null
  if (!timerState || !timerState.isActive) return null;

  const now = Date.now();
  const elapsedSeconds = Math.floor((now - timerState.startTime) / 1000);

  let currentTransitionIndex = 0;
  let elapsedInTransitionsSeconds = elapsedSeconds;

  // Calculate current transition index
  for (const transition of timerState.transitions) {
    const transitionDurationSeconds = transition.duration_minutes * 60;
    if (elapsedInTransitionsSeconds >= transitionDurationSeconds) {
      elapsedInTransitionsSeconds -= transitionDurationSeconds;
      currentTransitionIndex++;
    } else {
      break;
    }
  }

  // If beyond last transition, return null
  if (currentTransitionIndex >= timerState.transitions.length) {
    return null;
  }

  const currentTransition = timerState.transitions[currentTransitionIndex];
  const nextTransition = timerState.transitions[currentTransitionIndex + 1] || null;
  const currentTransitionDurationSeconds = currentTransition.duration_minutes * 60;
  const timeRemainingCurrentSeconds = currentTransitionDurationSeconds - elapsedInTransitionsSeconds;
  const timeRemainingCurrentMinutes = timeRemainingCurrentSeconds / 60;

  const totalTimeRemainingSeconds = timerState.transitions
    .slice(currentTransitionIndex)
    .reduce((sum: number, t: any, i: number) => {
      if (i === 0) return sum + timeRemainingCurrentSeconds;
      return sum + (t.duration_minutes * 60);
    }, 0);
  const totalTimeRemainingMinutes = totalTimeRemainingSeconds / 60;

  const totalTime = timerState.transitions.reduce((sum: number, t: any) => sum + t.duration_minutes, 0);
  const progress = totalTime > 0 ? (1 - (totalTimeRemainingMinutes / totalTime)) * 100 : 0;

  return {
    session: sessionId ? {
      session_id: sessionId,
      startTime: timerState.startTime,
      currentPhase: currentTransitionIndex,
      isPaused: timerState.isPaused,
      is_active: timerState.isActive,
      loopCount: 0
    } : undefined,
    current_transition: currentTransition,
    next_transition: nextTransition,
    time_remaining_current: timeRemainingCurrentMinutes,
    time_remaining_total: totalTimeRemainingMinutes,
    isRunning: timerState.isActive && !timerState.isPaused && audioState.isPlaying,
    totalTime,
    progress,
    isPaused: timerState.isPaused,
    transitionIndex: currentTransitionIndex,
    totalTransitions: timerState.transitions.length
  };
};