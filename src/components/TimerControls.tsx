import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  Typography, 
  Alert, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Card, 
  CardContent, 
  LinearProgress, 
  Chip,
  CircularProgress
} from '@mui/material';

interface FrequencyTransition {
  duration_minutes: number;
  frequency_hz: number;
  frequency_type: string;
  left_ear_hz: number;
  right_ear_hz: number;
  description: string;
}

interface TimerPreset {
  id: string;
  name: string;
  description: string;
  total_duration: number;
  transitions_count: number;
  tags: string[];
  is_premium: boolean;
  available: boolean;
  upgrade_message?: string;
}

interface TimerSession {
  session_id: string;
  preset_id: string;
  user_id: string;
  start_time: string;
  current_transition_index: number;
  elapsed_minutes: number;
  is_active: boolean;
  is_paused: boolean;
}

interface TimerStatus {
  session: TimerSession | null;
  current_transition: FrequencyTransition | null;
  next_transition: FrequencyTransition | null;
  time_remaining_current: number;
  time_remaining_total: number;
  subscription_required?: boolean;
}

interface TimerControlsProps {
  audioEngine?: {
    startBinauralBeat: (config: any) => void;
    stopBinauralBeat: () => void;
    updateFrequency: (left: number, right: number) => void;
    audioState: {
      isPlaying: boolean;
    };
  };
}

const TimerControls: React.FC<TimerControlsProps> = ({ audioEngine }) => {
  const { user } = useAuth();
  const [presets, setPresets] = useState<TimerPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [timerStatus, setTimerStatus] = useState<TimerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localTimer, setLocalTimer] = useState<{
    startTime: number;
    currentTransitionIndex: number;
    transitions: FrequencyTransition[];
    isActive: boolean;
    isPaused: boolean;
  } | null>(null);

  // Load presets on component mount
  useEffect(() => {
    loadPresets();
  }, [user]);

  // Poll for timer status when active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (localTimer?.isActive && !localTimer?.isPaused) {
      interval = setInterval(loadTimerStatus, 1000); // Update every second
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [localTimer?.isActive, localTimer?.isPaused, selectedPresetId]);

  const loadPresets = async () => {
    // Mock presets for development
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockPresets: TimerPreset[] = [
        {
          id: 'focus-30min',
          name: 'Focus Session - 30min',
          description: 'Beta waves for concentration and productivity',
          total_duration: 30,
          transitions_count: 3,
          tags: ['focus', 'beta', 'productivity'],
          is_premium: false,
          available: true
        },
        {
          id: 'meditation-20min', 
          name: 'Meditation - 20min',
          description: 'Alpha to theta progression for deep relaxation',
          total_duration: 20,
          transitions_count: 2,
          tags: ['meditation', 'alpha', 'theta'],
          is_premium: false,
          available: true
        },
        {
          id: 'sleep-60min',
          name: 'Sleep Induction - 60min',
          description: 'Progressive delta waves for natural sleep',
          total_duration: 60,
          transitions_count: 4,
          tags: ['sleep', 'delta', 'relaxation'],
          is_premium: true,
          available: true
        },
        {
          id: 'lucid-dream-45min',
          name: 'Lucid Dreaming - 45min', 
          description: 'Theta-Delta-REM pattern for lucid states',
          total_duration: 45,
          transitions_count: 3,
          tags: ['lucid', 'theta', 'rem'],
          is_premium: true,
          available: true
        }
      ];
      
      setPresets(mockPresets);
    } catch (err) {
      setError('Error loading presets');
      console.error('Error loading presets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTimerStatus = async () => {
    if (!localTimer || !localTimer.isActive) return;
    
    const now = Date.now();
    const elapsed = Math.floor((now - localTimer.startTime) / 1000 / 60); // minutes
    
    // Calculate current transition
    let currentTransitionIndex = 0;
    let elapsedInTransitions = elapsed;
    
    for (let i = 0; i < localTimer.transitions.length; i++) {
      if (elapsedInTransitions >= localTimer.transitions[i].duration_minutes) {
        elapsedInTransitions -= localTimer.transitions[i].duration_minutes;
        currentTransitionIndex++;
      } else {
        break;
      }
    }
    
    if (currentTransitionIndex >= localTimer.transitions.length) {
      // Timer finished
      setLocalTimer(null);
      setTimerStatus(null);
      return;
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
    
    const mockSession: TimerSession = {
      session_id: 'mock-session-' + Date.now(),
      preset_id: selectedPresetId,
      user_id: 'mock-user',
      start_time: new Date(localTimer.startTime).toISOString(),
      current_transition_index: currentTransitionIndex,
      elapsed_minutes: elapsed,
      is_active: localTimer.isActive,
      is_paused: localTimer.isPaused
    };
    
    const status: TimerStatus = {
      session: mockSession,
      current_transition: currentTransition,
      next_transition: nextTransition,
      time_remaining_current: timeRemainingCurrent,
      time_remaining_total: totalTimeRemaining
    };
    
    setTimerStatus(status);
    
    // Update audio engine with current frequencies
    if (audioEngine && currentTransition) {
      audioEngine.updateFrequency(currentTransition.left_ear_hz, currentTransition.right_ear_hz);
    }
  };

  const startTimer = async () => {
    if (!selectedPresetId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Create mock transitions based on preset
      const mockTransitions: FrequencyTransition[] = [];
      
      switch (selectedPresetId) {
        case 'focus-30min':
          mockTransitions.push(
            {
              duration_minutes: 10,
              frequency_hz: 15,
              frequency_type: 'Beta',
              left_ear_hz: 440,
              right_ear_hz: 455,
              description: 'Beta waves for focus activation'
            },
            {
              duration_minutes: 15,
              frequency_hz: 20,
              frequency_type: 'Beta',
              left_ear_hz: 440,
              right_ear_hz: 460,
              description: 'High beta for peak concentration'
            },
            {
              duration_minutes: 5,
              frequency_hz: 12,
              frequency_type: 'Alpha',
              left_ear_hz: 440,
              right_ear_hz: 452,
              description: 'Alpha cool-down'
            }
          );
          break;
        case 'meditation-20min':
          mockTransitions.push(
            {
              duration_minutes: 10,
              frequency_hz: 10,
              frequency_type: 'Alpha',
              left_ear_hz: 440,
              right_ear_hz: 450,
              description: 'Alpha relaxation'
            },
            {
              duration_minutes: 10,
              frequency_hz: 6,
              frequency_type: 'Theta',
              left_ear_hz: 440,
              right_ear_hz: 446,
              description: 'Deep theta meditation'
            }
          );
          break;
        case 'sleep-60min':
          mockTransitions.push(
            {
              duration_minutes: 15,
              frequency_hz: 8,
              frequency_type: 'Alpha',
              left_ear_hz: 440,
              right_ear_hz: 448,
              description: 'Initial relaxation'
            },
            {
              duration_minutes: 15,
              frequency_hz: 4,
              frequency_type: 'Theta',
              left_ear_hz: 440,
              right_ear_hz: 444,
              description: 'Pre-sleep theta'
            },
            {
              duration_minutes: 20,
              frequency_hz: 2,
              frequency_type: 'Delta',
              left_ear_hz: 440,
              right_ear_hz: 442,
              description: 'Deep delta sleep'
            },
            {
              duration_minutes: 10,
              frequency_hz: 1,
              frequency_type: 'Delta',
              left_ear_hz: 440,
              right_ear_hz: 441,
              description: 'Ultra-deep delta'
            }
          );
          break;
        default:
          mockTransitions.push({
            duration_minutes: 5,
            frequency_hz: 10,
            frequency_type: 'Alpha',
            left_ear_hz: 440,
            right_ear_hz: 450,
            description: 'Default session'
          });
      }
      
      const timer = {
        startTime: Date.now(),
        currentTransitionIndex: 0,
        transitions: mockTransitions,
        isActive: true,
        isPaused: false
      };
      
      setLocalTimer(timer);
      
      // Start audio with first transition frequencies
      if (audioEngine && mockTransitions.length > 0) {
        const firstTransition = mockTransitions[0];
        const config = {
          leftFreq: firstTransition.left_ear_hz,
          rightFreq: firstTransition.right_ear_hz,
          beatFreq: firstTransition.frequency_hz,
          amplitude: 0.5,
          waveform: 'sine' as const
        };
        audioEngine.startBinauralBeat(config);
      }
      
      loadTimerStatus();
      
    } catch (err) {
      setError('Error starting timer');
      console.error('Error starting timer:', err);
    } finally {
      setLoading(false);
    }
  };

  const controlTimer = async (action: 'pause' | 'resume' | 'stop') => {
    if (!localTimer) return;
    
    try {
      setLoading(true);
      
      if (action === 'stop') {
        if (audioEngine) {
          audioEngine.stopBinauralBeat();
        }
        setLocalTimer(null);
        setTimerStatus(null);
      } else if (action === 'pause') {
        setLocalTimer({...localTimer, isPaused: true});
      } else if (action === 'resume') {
        setLocalTimer({...localTimer, isPaused: false});
      }
      
    } catch (err) {
      console.error(`Error ${action} timer:`, err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes % 1) * 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // if (!user) {
  //   return (
  //     <Box p={3}>
  //       <Alert severity="info">
  //         Please log in to access timer functionality
  //       </Alert>
  //     </Box>
  //   );
  // }

  return (
    <Box p={3}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          {error.includes('subscription') && (
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ ml: 2 }}
              onClick={() => window.open('/subscription/plans', '_blank')}
            >
              Upgrade Now
            </Button>
          )}
        </Alert>
      )}

      {/* Preset Selection */}
      <Card sx={{ mb: 3, bgcolor: 'rgba(0,0,0,0.3)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Select Timer Preset
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Choose Preset</InputLabel>
            <Select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              disabled={loading || timerStatus?.session?.is_active}
            >
              {presets.map((preset) => (
                <MenuItem 
                  key={preset.id} 
                  value={preset.id}
                  disabled={!preset.available}
                >
                  <Box>
                    <Typography variant="body2">
                      {preset.name}
                      {preset.is_premium && <Chip label="Premium" size="small" color="warning" sx={{ ml: 1 }} />}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {preset.description} ({preset.total_duration} min)
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            fullWidth
            onClick={startTimer}
            disabled={!selectedPresetId || loading || timerStatus?.session?.is_active}
          >
            {loading ? <CircularProgress size={20} /> : 'Start Timer Session'}
          </Button>
        </CardContent>
      </Card>

      {/* Active Session */}
      {timerStatus?.session && (
        <Card sx={{ bgcolor: 'rgba(0,0,0,0.3)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Active Session
            </Typography>

            {timerStatus.current_transition && (
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Current: {timerStatus.current_transition.description}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {timerStatus.current_transition.frequency_hz}Hz • 
                  {timerStatus.current_transition.frequency_type} waves
                </Typography>
                
                <Box mb={2}>
                  <Typography variant="caption">
                    Time Remaining: {formatTime(timerStatus.time_remaining_current)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.max(0, Math.min(100, 
                      (1 - timerStatus.time_remaining_current / timerStatus.current_transition.duration_minutes) * 100
                    ))}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
            )}

            {timerStatus.next_transition && (
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Next: {timerStatus.next_transition.description}
                </Typography>
              </Box>
            )}

            <Typography variant="body2" gutterBottom>
              Total Time Remaining: {formatTime(timerStatus.time_remaining_total)}
            </Typography>

            <Box mt={2} display="flex" gap={2}>
              {timerStatus.session.is_paused ? (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => controlTimer('resume')}
                  disabled={loading}
                >
                  Resume
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => controlTimer('pause')}
                  disabled={loading}
                >
                  Pause
                </Button>
              )}
              
              <Button
                variant="contained"
                color="error"
                onClick={() => controlTimer('stop')}
                disabled={loading}
              >
                Stop
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Loading state for presets */}
      {loading && !timerStatus && (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default TimerControls;