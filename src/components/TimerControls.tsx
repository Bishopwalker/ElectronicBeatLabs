import React, { useState } from 'react';
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
import AddIcon from '@mui/icons-material/Add';
import type { TimerControlsProps, CustomPresetForm } from '../data/timer/types';
import { formatTime } from '../helpers/timer/timerUtils';
import { useTimerLogic } from '../hooks/useTimerLogic';
import CustomPresetDialog from './timer/CustomPresetDialog';

const TimerControls: React.FC<TimerControlsProps> = ({ audioEngine }) => {
  // const { user } = useAuth();
  const {
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
    saveCustomPreset
  } = useTimerLogic({ audioEngine });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [customPreset, setCustomPreset] = useState<CustomPresetForm>({
    name: '',
    description: '',
    transitions: [
      {
        duration_minutes: 10,
        frequency_hz: 4,
        frequency_type: 'Theta',
        left_ear_hz: 440,
        right_ear_hz: 444,
        description: 'Theta waves'
      }
    ]
  });

  const handleSaveCustomPreset = () => {
    saveCustomPreset(customPreset);
    setShowCreateDialog(false);
    setCustomPreset({
      name: '',
      description: '',
      transitions: [{
        duration_minutes: 10,
        frequency_hz: 10,
        frequency_type: 'Alpha',
        left_ear_hz: 440,
        right_ear_hz: 450,
        description: 'Alpha waves'
      }]
    });
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
            <InputLabel id="preset-select-label">Choose Preset</InputLabel>
            <Select
              labelId="preset-select-label"
              id="preset-select"
              value={selectedPresetId}
              label="Choose Preset"
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
                      {preset.loop_enabled && <Chip label="Loop" size="small" color="info" sx={{ ml: 1 }} />}
                      {'difficulty_level' in preset && <Chip 
                        label={(preset as any).difficulty_level} 
                        size="small" 
                        color={'difficulty_level' in preset && (preset as any).difficulty_level === 'expert' ? 'error' : 'secondary'} 
                        sx={{ ml: 1 }} 
                      />}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {preset.description} ({preset.total_duration} min)
                      {preset.loop_enabled && (
                        <Box component="span" sx={{ color: '#00bfff', ml: 1 }}>
                          • {preset.loop_count === 0 ? '∞ Loop' : `${preset.loop_count} Loops`}
                        </Box>
                      )}
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
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={20} /> : 'Start Timer Session'}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
            disabled={loading || timerStatus?.session?.is_active}
          >
            Create Custom Preset
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

            {!hideSession && timerStatus.current_transition && (
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: '#00ff88' }}>
                  🎧 ACTIVE: {timerStatus.current_transition.description}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <Box component="span" sx={{ color: '#ff6b00', fontWeight: 'bold' }}>
                    {timerStatus.current_transition.frequency_hz}Hz
                  </Box> • 
                  {timerStatus.current_transition.frequency_type} waves • 
                  <Box component="span" sx={{ color: '#00bfff' }}>
                    {timerStatus.current_transition.left_ear_hz}Hz L / {timerStatus.current_transition.right_ear_hz}Hz R
                  </Box>
                  {'spatial_settings' in timerStatus.current_transition && 
                   timerStatus.current_transition.spatial_settings && (
                    <Box component="span" sx={{ color: '#ff69b4', ml: 1 }}>
                      • 8D Spatial: {(timerStatus.current_transition.spatial_settings as any).pattern}
                    </Box>
                  )}
                  {'pattern' in timerStatus.current_transition && (
                    <Box component="span" sx={{ color: '#9932cc', ml: 1 }}>
                      • Pattern: {(timerStatus.current_transition as any).pattern}
                    </Box>
                  )}
                </Typography>
                <Typography variant="caption" sx={{ color: '#ffd700', fontStyle: 'italic' }}>
                  ⚡ Timer is automatically controlling your binaural beat frequencies
                  {timerStatus.session?.preset?.loop_enabled && (
                    <Box component="span" sx={{ color: '#00bfff', ml: 1 }}>
                      🔄 Loop: {timerStatus.session.preset.loop_count === 0 ? 'Infinite' : `${timerStatus.session.preset.loop_count}x`}
                    </Box>
                  )}
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

            {!hideSession && timerStatus.next_transition && (
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Next: {timerStatus.next_transition.description}
                </Typography>
              </Box>
            )}

            {!hideSession && (
              <Typography variant="body2" gutterBottom>
                Total Time Remaining: {formatTime(timerStatus.time_remaining_total)}
              </Typography>
            )}
              <Box mt={2} display="flex" gap={2} flexWrap="wrap">
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
                color="info"
                onClick={() => controlTimer('restart')}
                disabled={loading}
                sx={{ 
                  backgroundColor: '#00bfff',
                  '&:hover': { backgroundColor: '#0099cc' }
                }}
              >
                🔄 Restart
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => setHideSession(!hideSession)}
                size="small"
                sx={{ 
                  color: '#ffd700',
                  borderColor: '#ffd700',
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderColor: '#ffd700'
                  }
                }}
              >
                {hideSession ? '👁️ Show' : '🙈 Hide'}
              </Button>
              
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

      <CustomPresetDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        customPreset={customPreset}
        setCustomPreset={setCustomPreset}
        onSave={handleSaveCustomPreset}
        loading={loading}
      />
    </Box>
  );
};

export default TimerControls;