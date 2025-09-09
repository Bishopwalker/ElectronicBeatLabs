// Hook to track and provide current active preset information for UI display
import { useState, useEffect, useCallback } from 'react';

interface CurrentPreset {
  name?: string;
  description?: string;
  isActive?: boolean;
  source?: 'timer' | 'pattern' | 'manual';
  frequencies?: {
    left: number;
    right: number;
    beat: number;
  };
}

interface PresetTrackerParams {
  timerStatus?: any; // Timer status from useTimerLogic
  activePattern?: any; // Active pattern from patterns engine
  audioState?: {
    isPlaying: boolean;
    leftFreq: number;
    rightFreq: number;
  };
}

export const useCurrentPresetTracker = ({
  timerStatus,
  activePattern,
  audioState
}: PresetTrackerParams) => {
  const [currentPreset, setCurrentPreset] = useState<CurrentPreset | null>(null);

  const updatePreset = useCallback(() => {
    // Priority 1: Active timer session
    if (timerStatus?.session?.is_active && timerStatus?.current_transition) {
      const transition = timerStatus.current_transition;
      const preset = timerStatus.session.preset;
      const currentIndex = timerStatus.session.current_transition_index || 0;
      const totalTransitions = preset?.transitions_count || 1;
      
      setCurrentPreset({
        name: `⏰ ${preset?.name || 'Timer Session'}`,
        description: `Transition ${currentIndex + 1}/${totalTransitions}: ${transition.description} • ${transition.frequency_hz}Hz ${transition.frequency_type} • ${Math.floor(timerStatus.time_remaining_current)}min left`,
        isActive: true,
        source: 'timer',
        frequencies: {
          left: transition.left_ear_hz,
          right: transition.right_ear_hz,
          beat: transition.frequency_hz
        }
      });
      return;
    }

    // Priority 2: Active pattern from patterns engine
    if (activePattern && audioState?.isPlaying) {
      setCurrentPreset({
        name: activePattern.name,
        description: activePattern.description,
        isActive: true,
        source: 'pattern',
        frequencies: {
          left: activePattern.frequencies?.carrier || audioState.leftFreq,
          right: (activePattern.frequencies?.carrier || audioState.leftFreq) + (activePattern.frequencies?.beat || 4),
          beat: activePattern.frequencies?.beat || Math.abs(audioState.rightFreq - audioState.leftFreq)
        }
      });
      return;
    }

    // Priority 3: Manual frequencies when playing
    if (audioState?.isPlaying && audioState.leftFreq && audioState.rightFreq) {
      const beatFreq = Math.abs(audioState.rightFreq - audioState.leftFreq);
      let frequencyType = 'Custom';
      
      if (beatFreq <= 4) frequencyType = 'Delta';
      else if (beatFreq <= 8) frequencyType = 'Theta';
      else if (beatFreq <= 13) frequencyType = 'Alpha';
      else if (beatFreq <= 30) frequencyType = 'Beta';
      else frequencyType = 'Gamma';

      setCurrentPreset({
        name: `Manual ${frequencyType}`,
        description: `${audioState.leftFreq}Hz / ${audioState.rightFreq}Hz • ${beatFreq.toFixed(1)}Hz beat`,
        isActive: true,
        source: 'manual',
        frequencies: {
          left: audioState.leftFreq,
          right: audioState.rightFreq,
          beat: beatFreq
        }
      });
      return;
    }

    // No active preset
    setCurrentPreset(null);
  }, [timerStatus, activePattern, audioState]);

  useEffect(() => {
    updatePreset();
  }, [updatePreset]);

  return {
    currentPreset,
    updatePreset
  };
};