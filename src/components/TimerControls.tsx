import React, {useState} from 'react';
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
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type {AudioEngine, ElectromagneticField, PatternConfig} from '../types';
import type { AudioState } from '../hooks/useAudioState';
import {
    DEFAULT_LEFT_FREQUENCY,
    DEFAULT_RIGHT_FREQUENCY,
    DEFAULT_VOLUME,
    DEFAULT_WAVEFORM
} from '../constants/audio.constants';
import type {CustomPresetForm, TimerStatus} from '../data/timer';
import {formatTime} from '../helpers/timer/timerUtils';
import {useTimerLogic} from '../hooks/useTimerLogic';
import CustomPresetDialog from './timer/CustomPresetDialog';

interface TimerControlsProps {
    audioEngine?:AudioEngine;
    onTimerStatusUpdate?: (status: TimerStatus | null) => void,
    patterns8D?: {
        setActivePattern: (pattern: PatternConfig) => void;
        clearActivePattern: () => void;
    },
    onElectromagneticUpdate?: (electromagnetic: ElectromagneticField) => void,

}

const TimerControls: React.FC<TimerControlsProps> = ({
                                                         audioEngine,
                                                         patterns8D,
                                                         onElectromagneticUpdate,
                                                         onTimerStatusUpdate
                                                     }) => {
    // const { user } = useAuth();
    // Track computed timer status emitted by the hook
    const [timerStatus, setTimerStatus] = useState<TimerStatus | null>(null);

    // Minimal audio state and updaters to satisfy useTimerLogic API
    const defaultAudioState: AudioState = {
        isPlaying: false,
        currentEngine: 'frontend',
        leftFreq: DEFAULT_LEFT_FREQUENCY,
        rightFreq: DEFAULT_RIGHT_FREQUENCY,
        baseFreq: Math.min(DEFAULT_LEFT_FREQUENCY, DEFAULT_RIGHT_FREQUENCY),
        beatFreq: Math.abs(DEFAULT_RIGHT_FREQUENCY - DEFAULT_LEFT_FREQUENCY),
        volume: DEFAULT_VOLUME,
        waveform: DEFAULT_WAVEFORM as AudioState['waveform'],
        backendConnected: false,
        sessionId: null,
        spatialEnabled: false,
        spatialMode: 'off'
    };

    const updateAudioState = {
        updateFrequencies: (left: number, right: number) => {
            audioEngine?.updateFrequency(left, right);
        },
        setPlaying: (_playing: boolean) => {
            // No direct control available here; audio engine manages playback
        }
    };

    const {
        presets,
        selectedPresetId,
        setSelectedPresetId,
        timerState,
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
    } = useTimerLogic({
        audioEngine,
        // Fallback to defaults; parents using TimerTab should provide richer state
        audioState: defaultAudioState,
        updateAudioState,
        patterns8DControl: patterns8D,
        onElectromagneticUpdate,
        onTimerStatusUpdate: (status) => {
            setTimerStatus(status);
            onTimerStatusUpdate?.(status || null);
        }
    });
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
    const [deletingPresetId, setDeletingPresetId] = useState<string | null>(null);
    const [loopEnabled, setLoopEnabled] = useState(false);
    const [customPreset, setCustomPreset] = useState<CustomPresetForm>({
        name: '',
        description: '',
        duration: 10,
        tags: [],
        transitions: [
            {
                duration_minutes: 10,
                frequency_hz: 4,
                frequency_type: 'Theta',
                left_ear_hz: 140,
                right_ear_hz: 144,
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
            duration: 10,
            tags: [],
            transitions: [{
                duration_minutes: 10,
                frequency_hz: 10,
                frequency_type: 'Alpha',
                left_ear_hz: 140,
                right_ear_hz: 150,
                description: 'Alpha waves'
            }]
        });
    };

    const handleEditPreset = (presetId: string) => {
        const preset = presets.find(p => p.id === presetId);
        if (preset && presetId.startsWith('custom-')) {
            const transitions = customPresetTransitions[presetId] || [{
                duration_minutes: 10,
                frequency_hz: 10,
                frequency_type: 'Alpha',
                left_ear_hz: 140,
                right_ear_hz: 150,
                description: 'Alpha waves'
            }];
            setCustomPreset({
                name: preset.name,
                description: preset.description || '',
                duration: transitions.reduce((sum, t) => sum + t.duration_minutes, 0),
                tags: [],
                transitions
            });
            setEditingPresetId(presetId);
            setShowEditDialog(true);
        }
    };

    const handleSaveEditPreset = () => {
        if (editingPresetId) {
            const success = updateCustomPreset(editingPresetId, customPreset);
            if (success) {
                setShowEditDialog(false);
                setEditingPresetId(null);
                setCustomPreset({
                    name: '',
                    description: '',
                    duration: 10,
                    tags: [],
                    transitions: [{
                        duration_minutes: 10,
                        frequency_hz: 10,
                        frequency_type: 'Alpha',
                        left_ear_hz: 140,
                        right_ear_hz: 150,
                        description: 'Alpha waves',

                    }]
                });
            }
        }
    };

    const handleDeletePreset = (presetId: string) => {
        if (presetId.startsWith('custom-')) {
            setDeletingPresetId(presetId);
            setShowDeleteDialog(true);
        }
    };

    const confirmDeletePreset = () => {
        if (deletingPresetId) {
            deleteCustomPreset(deletingPresetId);
            setShowDeleteDialog(false);
            setDeletingPresetId(null);
        }
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
                <Alert severity="error" sx={{mb: 2}}>
                    {error}
                    {error.includes('subscription') && (
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ml: 2}}
                            onClick={() => window.open('/subscription/plans', '_blank')}
                        >
                            Upgrade Now
                        </Button>
                    )}
                </Alert>
            )}

            {/* Preset Selection */}
            <Card sx={{mb: 3, bgcolor: 'rgba(0,0,0,0.3)'}}>
                <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                        Select Timer Preset
                    </Typography>

                    <FormControl fullWidth sx={{mb: 2}}>
                        <InputLabel id="preset-select-label">Choose Preset</InputLabel>
                        <Select
                            labelId="preset-select-label"
                            id="preset-select"
                            value={selectedPresetId}
                            label="Choose Preset"
                            onChange={(e) => {
                                setSelectedPresetId(e.target.value);
                            }}
                            disabled={false}
                            MenuProps={{

                                PaperProps: {
                                    style: {
                                        maxHeight: '400px',
                                        width: '40%',
                                        opacity: '80%',
                                        background: 'rgba(0, 0, 0, 0.95)',
                                        border: '1px solid rgba(255, 107, 0, 0.3)',
                                        boxShadow: '0 8px 32px rgba(255, 107, 0, 0.2)',
                                        fontWeight: 'bolder',
                                    }
                                },
                                anchorOrigin: {
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                },
                                transformOrigin: {
                                    vertical: 'top',
                                    horizontal: 'left',
                                }
                            }}
                        >
                            {presets.map((preset) => (
                                <MenuItem
                                    key={preset.id}
                                    value={preset.id}
                                >
                                    <Box sx={{width: '100%'}}>
                                        <Typography component="div" variant="body2"
                                                    sx={{fontWeight: selectedPresetId === preset.id ? 'bold' : 'normal'}}>
                                            {preset.name}
                                            {preset.id.startsWith('custom-') &&
                                                <Chip label="Custom" size="small" color="secondary" sx={{ml: 1}}/>}
                                            {preset.is_premium &&
                                                <Chip label="Premium" size="small" color="warning" sx={{ml: 1}}/>}
                                            {preset.loop_enabled &&
                                                <Chip label="Loop" size="small" color="info" sx={{ml: 1}}/>}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {preset.description} ({preset.total_duration} min)
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Custom Preset Actions */}
                    {selectedPresetId && selectedPresetId.startsWith('custom-') && (
                        <Box sx={{display: 'flex', gap: 1, mb: 2}}>
                            <Button
                                size="small"
                                startIcon={<EditIcon/>}
                                onClick={() => handleEditPreset(selectedPresetId)}

                                disabled={loading || !!timerStatus?.session?.is_active}
                                sx={{color: '#00bfff'}}
                            >
                                Edit
                            </Button>
                            <Button
                                size="small"
                                startIcon={<DeleteIcon/>}
                                onClick={() => handleDeletePreset(selectedPresetId)}
                                disabled={loading || !!timerStatus?.session?.is_active}
                                sx={{color: '#ff6b6b'}}
                            >
                                Delete
                            </Button>
                        </Box>
                    )}

                    {/* Loop Control */}
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={loopEnabled || (timerStatus?.session?.preset?.loop_enabled || false)}
                                onChange={(e) => setLoopEnabled(e.target.checked)}
                                disabled={loading || !!timerStatus?.session?.is_active}
                                sx={{
                                    color: '#00bfff',
                                    '&.Mui-checked': {color: '#00bfff'}
                                }}
                            />
                        }
                        label={
                            <Typography variant="body2" sx={{color: '#00bfff'}}>
                                🔄 Enable Loop for this session
                                {timerStatus?.session?.is_active && (loopEnabled || (timerStatus?.session?.preset?.loop_enabled || false)) && (
                                    <Box component="span" sx={{color: '#00ff88', ml: 1, fontWeight: 'bold'}}>
                                        (ACTIVE)
                                    </Box>
                                )}
                            </Typography>
                        }
                        sx={{mb: 2}}
                    />

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                            if (!selectedPresetId) {
                                return;
                            }
                            startTimer(loopEnabled);
                        }}
                        disabled={!selectedPresetId}
                        sx={{mb: 2}}
                    >
                        {loading ? <CircularProgress size={20}/> : 'Start Timer Session'}
                    </Button>

                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<AddIcon/>}
                        onClick={() => setShowCreateDialog(true)}
                        disabled={loading || !!timerStatus?.session?.is_active}
                    >
                        Create Custom Preset
                    </Button>
                </CardContent>
            </Card>

            {/* Active Session */}
            {timerStatus?.session && (
                <Card sx={{bgcolor: 'rgba(0,0,0,0.3)'}}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom color="primary">
                            Active Session
                        </Typography>

                        {!hideSession && timerStatus.current_transition && (
                            <Box mb={3}>
                                <Typography variant="subtitle1" gutterBottom sx={{color: '#00ff88'}}>
                                    🎧 ACTIVE: {timerStatus.current_transition.description}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    <Box component="span" sx={{color: '#ff6b00', fontWeight: 'bold'}}>
                                        {timerStatus.current_transition.frequency_hz}Hz
                                    </Box> •
                                    {timerStatus.current_transition.frequency_type} waves •
                                    <Box component="span" sx={{color: '#00bfff'}}>
                                        {timerStatus.current_transition.left_ear_hz}Hz L
                                        / {timerStatus.current_transition.right_ear_hz}Hz R
                                    </Box>
                                    {'spatial_settings' in (timerStatus.current_transition as any) &&
                                        (timerStatus.current_transition as any).spatial_settings && (
                                            <Box component="span" sx={{color: '#ff69b4', ml: 1}}>
                                                • 8D Spatial: {((timerStatus.current_transition as any).spatial_settings).pattern}
                                            </Box>
                                        )}
                                    {'pattern' in (timerStatus.current_transition as any) && (
                                        <Box component="span" sx={{color: '#9932cc', ml: 1}}>
                                            • Pattern: {((timerStatus.current_transition as any).pattern)}
                                        </Box>
                                    )}
                                </Typography>
                                <Typography variant="caption" sx={{color: '#ffd700', fontStyle: 'italic'}}>
                                    ⚡ Timer is automatically controlling your binaural beat frequencies
                                    {timerStatus.session?.preset?.loop_enabled && (
                                        <Box component="span" sx={{color: '#00bfff', ml: 1}}>
                                            🔄
                                            Loop: {timerStatus.session.preset.loop_count === 0 ? 'Infinite' : `${timerStatus.session.preset.loop_count}x`}
                                        </Box>
                                    )}
                                </Typography>

                                <Box mb={2}>
                                    <Typography variant="caption">
                                        Time Remaining: {formatTime(timerStatus.time_remaining_current || 0)}
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.max(0, Math.min(100,
                                            (1 - ( (timerStatus.time_remaining_current || 0) / (timerStatus.current_transition?.duration_minutes || 1) )) * 100
                                        ))}
                                        sx={{mt: 1}}
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
                                Total Time Remaining: {formatTime(timerStatus.time_remaining_total || 0)}
                            </Typography>
                        )}
                        <Box mt={2} display="flex" gap={2} flexWrap="wrap">
                            {timerStatus.session?.isPaused ? (
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
                                    '&:hover': {backgroundColor: '#0099cc'}
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
                    <CircularProgress/>
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

            {/* Edit Custom Preset Dialog */}
            <CustomPresetDialog
                open={showEditDialog}
                onClose={() => {
                    setShowEditDialog(false);
                    setEditingPresetId(null);
                }}
                customPreset={customPreset}
                setCustomPreset={setCustomPreset}
                onSave={handleSaveEditPreset}
                loading={loading}
                title="Edit Custom Preset"
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{color: '#ff6b6b'}}>
                    🗑️ Delete Custom Preset
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this custom preset? This action cannot be undone.
                    </Typography>
                    {deletingPresetId && (
                        <Typography variant="body2" color="textSecondary" sx={{mt: 1}}>
                            Preset: {presets.find(p => p.id === deletingPresetId)?.name}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setShowDeleteDialog(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDeletePreset}
                        color="error"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={20}/> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TimerControls;