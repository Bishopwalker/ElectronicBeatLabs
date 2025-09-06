export interface FrequencyTransition {
  duration_minutes: number;
  frequency_hz: number;
  frequency_type: string;
  left_ear_hz: number;
  right_ear_hz: number;
  description: string;
  
  // Advanced features for comprehensive presets
  pattern?: string;
  spatial_settings?: {
    enabled?: boolean;
    hrtf?: boolean;
    roomSize?: number;
    reverbAmount?: number;
    spatialWidth?: number;
    elevation?: number;
    azimuth?: number;
    movement_speed?: number;
    spatial_intensity?: number;
    reverberance?: number;
    room_scale?: number;
    hf_damping?: number;
    pattern?: string;
  };
}

export interface TimerPreset {
  id: string;
  name: string;
  description: string;
  total_duration: number;
  transitions_count: number;
  tags: string[];
  is_premium: boolean;
  available: boolean;
  upgrade_message?: string;
  
  // Loop configuration
  loop_enabled?: boolean;
  loop_count?: number; // 0 = infinite, 1+ = specific number of loops
  loop_phase?: 'full' | 'specific_transitions'; // Loop entire preset or specific phases
  loop_transitions?: number[]; // Which transition indices to loop (if loop_phase = 'specific_transitions')
}

export interface TimerSession {
  session_id: string;
  preset_id: string;
  user_id: string;
  start_time: string;
  current_transition_index: number;
  elapsed_minutes: number;
  is_active: boolean;
  is_paused: boolean;
  preset?: TimerPreset; // Include preset info for UI display
}

export interface TimerStatus {
  session: TimerSession | null;
  current_transition: FrequencyTransition | null;
  next_transition: FrequencyTransition | null;
  time_remaining_current: number;
  time_remaining_total: number;
  subscription_required?: boolean;
}

export interface TimerControlsProps {
  audioEngine?: {
    startBinauralBeat: (config: never) => void;
    stopBinauralBeat: () => void;
    updateFrequency: (left: number, right: number) => void;
    audioState: {
      isPlaying: boolean;
    };
  };
}

export interface LocalTimer {
  startTime: number;
  currentTransitionIndex: number;
  transitions: FrequencyTransition[];
  isActive: boolean;
  isPaused: boolean;
}

export interface CustomPresetForm {
  name: string;
  description: string;
  transitions: FrequencyTransition[];
}

export type TimerAction = 'pause' | 'resume' | 'stop' | 'restart';