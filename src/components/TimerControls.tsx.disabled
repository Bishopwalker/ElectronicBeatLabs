import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Alert, Button, FormControl, InputLabel, Select, MenuItem, Grid, Card, CardContent, LinearProgress, Chip } from '@mui/material';

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
  const { user, isSubscribed } = useAuth();
  const [presets, setPresets] = useState<TimerPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [timerStatus, setTimerStatus] = useState<TimerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    loadPresets();
    checkTimerStatus();
    
    // Poll timer status every 5 seconds when session is active
    const interval = setInterval(() => {
      if (timerStatus?.session?.is_active) {
        checkTimerStatus();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadPresets = async () => {
    try {
      const response = await fetch('/api/timer/presets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPresets(data.filter((item: any) => item.id)); // Filter out promotion messages
      }
    } catch (err) {
      console.error('Error loading presets:', err);
    }
  };

  const checkTimerStatus = async () => {
    try {
      const response = await fetch('/api/timer/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const status = await response.json();
        setTimerStatus(status);
      }
    } catch (err) {
      console.error('Error checking timer status:', err);
    }
  };

  const startTimer = async () => {
    if (!selectedPresetId) {
      setError('Please select a timer preset');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/timer/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action: 'start',
          preset_id: selectedPresetId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setTimerStatus(data);
      } else if (response.status === 403 && data.upgrade_message) {
        setError(data.upgrade_message);
        setShowUpgrade(true);
      } else {
        setError(data.detail || 'Error starting timer');
      }
    } catch (err) {
      setError('Network error starting timer');
    } finally {
      setLoading(false);
    }
  };

  const controlTimer = async (action: string) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/timer/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        const data = await response.json();
        setTimerStatus(data);
      } else {
        const error = await response.json();
        setError(error.detail || `Error ${action}ing timer`);
      }
    } catch (err) {
      setError(`Network error ${action}ing timer`);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const getFrequencyColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'delta': return '#4A90E2'; // Blue
      case 'theta': return '#50C878'; // Green
      case 'alpha': return '#FFD700'; // Gold
      case 'beta': return '#FF6B35';  // Orange
      case 'gamma': return '#FF1744'; // Red
      default: return '#9E9E9E';
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'grey.900', borderRadius: 2, color: 'white', maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
        Timer Controls
      </Typography>
      
      {error && (
        <Alert severity={showUpgrade ? "info" : "error"} sx={{ mb: 2 }}>
          <Typography variant="body2">{error}</Typography>
          {showUpgrade && (
            <Button 
              onClick={() => window.location.href = '/subscription'}
              variant="contained"
              size="small"
              sx={{ mt: 1 }}
            >
              Upgrade Now
            </Button>
          )}
        </Alert>
      )}

      {/* Preset Selection */}
      <div className=\"mb-6\">
        <label className=\"block text-sm font-medium mb-2\">Select Timer Preset:</label>
        <select 
          value={selectedPresetId} 
          onChange={(e) => setSelectedPresetId(e.target.value)}
          className=\"w-full p-3 bg-gray-800 border border-gray-600 rounded text-white\"
          disabled={timerStatus?.session?.is_active}
        >
          <option value=\"\">Choose a preset...</option>
          {presets.map((preset) => (
            <option 
              key={preset.id} 
              value={preset.id}
              disabled={!preset.available}
            >
              {preset.name} ({formatTime(preset.total_duration)})
              {preset.is_premium && !isSubscribed ? ' 🔒' : ''}
            </option>
          ))}
        </select>
        
        {selectedPresetId && (
          <div className=\"mt-2 p-3 bg-gray-800 rounded\">
            {(() => {
              const preset = presets.find(p => p.id === selectedPresetId);
              return preset ? (
                <div>
                  <p className=\"text-sm text-gray-300\">{preset.description}</p>
                  <div className=\"mt-2 flex flex-wrap gap-1\">
                    {preset.tags.map(tag => (
                      <span key={tag} className=\"px-2 py-1 bg-gray-700 rounded text-xs\">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {preset.is_premium && !isSubscribed && (
                    <p className=\"text-yellow-400 text-sm mt-2\">⭐ Premium Feature</p>
                  )}
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>

      {/* Timer Status Display */}
      {timerStatus?.session && (
        <div className=\"mb-6 p-4 bg-gray-800 rounded\">
          <h3 className=\"font-semibold mb-3\">Current Session</h3>
          
          {timerStatus.current_transition && (
            <div className=\"mb-4\">
              <div className=\"flex items-center justify-between mb-2\">
                <span 
                  className=\"px-3 py-1 rounded text-sm font-medium\"
                  style={{ 
                    backgroundColor: getFrequencyColor(timerStatus.current_transition.frequency_type),
                    color: 'white'
                  }}
                >
                  {timerStatus.current_transition.frequency_type.toUpperCase()} - {timerStatus.current_transition.frequency_hz}Hz
                </span>
                <span className=\"text-sm text-gray-400\">
                  {formatTime(timerStatus.time_remaining_current)} remaining
                </span>
              </div>
              <p className=\"text-sm text-gray-300\">{timerStatus.current_transition.description}</p>
              
              {/* Progress bar */}
              <div className=\"mt-2 w-full bg-gray-700 rounded-full h-2\">
                <div 
                  className=\"h-2 rounded-full transition-all duration-1000\"
                  style={{ 
                    width: `${Math.max(0, Math.min(100, ((timerStatus.current_transition.duration_minutes - timerStatus.time_remaining_current) / timerStatus.current_transition.duration_minutes) * 100))}%`,
                    backgroundColor: getFrequencyColor(timerStatus.current_transition.frequency_type)
                  }}
                />
              </div>
            </div>
          )}

          {timerStatus.next_transition && (
            <div className=\"mb-4 p-3 bg-gray-700 rounded\">
              <p className=\"text-sm text-gray-400 mb-1\">Next:</p>
              <span 
                className=\"px-2 py-1 rounded text-xs\"
                style={{ 
                  backgroundColor: getFrequencyColor(timerStatus.next_transition.frequency_type),
                  color: 'white'
                }}
              >
                {timerStatus.next_transition.frequency_type.toUpperCase()} - {timerStatus.next_transition.frequency_hz}Hz
              </span>
              <p className=\"text-xs text-gray-400 mt-1\">{timerStatus.next_transition.description}</p>
            </div>
          )}

          <div className=\"text-center text-lg font-mono\">
            Total Remaining: {formatTime(timerStatus.time_remaining_total)}
          </div>

          {timerStatus.session.is_paused && (
            <div className=\"mt-2 text-center text-yellow-400 text-sm\">⏸️ PAUSED</div>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className=\"flex gap-3 justify-center\">
        {!timerStatus?.session?.is_active ? (
          <button
            onClick={startTimer}
            disabled={loading || !selectedPresetId}
            className=\"px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-medium\"
          >
            {loading ? 'Starting...' : 'Start Timer'}
          </button>
        ) : (
          <>
            {timerStatus.session.is_paused ? (
              <button
                onClick={() => controlTimer('resume')}
                disabled={loading}
                className=\"px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-medium\"
              >
                Resume
              </button>
            ) : (
              <button
                onClick={() => controlTimer('pause')}
                disabled={loading}
                className=\"px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded font-medium\"
              >
                Pause
              </button>
            )}
            
            <button
              onClick={() => controlTimer('stop')}
              disabled={loading}
              className=\"px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded font-medium\"
            >
              Stop
            </button>
          </>
        )}
      </div>

      {/* Subscription Promotion for Free Users */}
      {!isSubscribed && (
        <div className=\"mt-6 p-4 bg-gradient-to-r from-blue-900 to-purple-900 rounded border border-blue-400\">
          <h4 className=\"font-semibold mb-2\">🚀 Unlock Premium Timer Features</h4>
          <ul className=\"text-sm space-y-1 mb-3\">
            <li>• 5+ Advanced Timer Presets</li>
            <li>• Unlimited Custom Sequences</li>
            <li>• Gamma Wave Protocols</li>
            <li>• Extended 8-hour Sessions</li>
            <li>• Lucid Dream Sequences</li>
          </ul>
          <button 
            onClick={() => window.location.href = '/subscription'}
            className=\"px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium\"
          >
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
};

export default TimerControls;