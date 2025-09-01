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

const TimerControls: React.FC = () => {
  const { user } = useAuth();
  const [presets, setPresets] = useState<TimerPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [timerStatus, setTimerStatus] = useState<TimerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load presets on component mount
  useEffect(() => {
    loadPresets();
  }, [user]);

  // Poll for timer status when active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerStatus?.session?.is_active) {
      interval = setInterval(loadTimerStatus, 5000); // Poll every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStatus?.session?.is_active]);

  const loadPresets = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/timer/presets', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'dummy'}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPresets(data.filter((item: any) => item.type !== 'subscription_promotion'));
      } else {
        setError('Failed to load timer presets');
      }
    } catch (err) {
      setError('Error loading presets');
      console.error('Error loading presets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTimerStatus = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/timer/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'dummy'}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const status = await response.json();
        setTimerStatus(status);
      }
    } catch (err) {
      console.error('Error loading timer status:', err);
    }
  };

  const startTimer = async () => {
    if (!selectedPresetId || !user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/timer/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'dummy'}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preset_id: selectedPresetId
        }),
      });

      if (response.ok) {
        const status = await response.json();
        setTimerStatus(status);
      } else {
        const errorData = await response.json();
        if (errorData.detail?.includes('subscription')) {
          setError('Premium subscription required for this preset');
        } else {
          setError('Failed to start timer');
        }
      }
    } catch (err) {
      setError('Error starting timer');
      console.error('Error starting timer:', err);
    } finally {
      setLoading(false);
    }
  };

  const controlTimer = async (action: 'pause' | 'resume' | 'stop') => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/timer/control', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'dummy'}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const status = await response.json();
        setTimerStatus(status);
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

  if (!user) {
    return (
      <Box p={3}>
        <Alert severity="info">
          Please log in to access timer functionality
        </Alert>
      </Box>
    );
  }

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