// Electromagnetic Beat Lab - Timer Tab Component (Complete Integration)
// Full timer session management with preset selection and custom preset creation

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
import {
    AppState,
    ElectromagneticField,
    PatternConfig,
    BinauralBeatConfig, AnyAudioEngine
} from '../../types';
import type { AudioState as CoreAudioState } from '../../hooks/useAudioState';
import type { CustomPresetForm, TimerStatus } from '../../data/timer';
import { formatTime } from '../../helpers/timer/timerUtils';
import { useTimerLogic } from '../../hooks/useTimerLogic';
import CustomPresetDialog from '../timer/CustomPresetDialog';
import {
    DEFAULT_LEFT_FREQUENCY,
    DEFAULT_RIGHT_FREQUENCY,
    DEFAULT_BEAT_FREQUENCY,
    DEFAULT_VOLUME
} from '../../constants/audio.constants';

interface TimerTabProps {
    appState: AppState;
    patterns8D?: any[];
    onStateChange: (state: Partial<AppState>) => void;
    onTimerStatusUpdate?: (status: TimerStatus | null) => void;
    onTransitionNavigation?: {
        jumpToTransition: (direction: 'next' | 'previous') => void;
        restartCurrentTransition: () => void;
    };
    onTimerControl?: {
        stopTimer: () => void;
        pauseTimer: () => void;
        resumeTimer: () => void;
        restartTimer: () => void;
    };
    audioEngine?: AnyAudioEngine;
    patterns8DEngine?: {
        setActivePattern: (pattern: PatternConfig) => void;
        clearActivePattern: () => void;
    };
    onElectromagneticUpdate?: (electromagnetic: ElectromagneticField) => void;
}

const TimerTab: React.FC<TimerTabProps> = ({
    audioEngine,
    patterns8DEngine,
    onStateChange,
    onTimerStatusUpdate,
    onElectromagneticUpdate,
    onTransitionNavigation,
    onTimerControl
}) => {
    // Extract audioState from the audio engine
    const audioState: CoreAudioState = React.useMemo(() => {
        const left = (audioEngine as any)?.audioState?.leftFreq ?? DEFAULT_LEFT_FREQUENCY;
        const right = (audioEngine as any)?.audioState?.rightFreq ?? DEFAULT_RIGHT_FREQUENCY;
        const beat = Math.abs(right - left) || DEFAULT_BEAT_FREQUENCY;
        return {
            isPlaying: (audioEngine as any)?.audioState?.isPlaying ?? false,
            currentEngine: (audioEngine as any)?.backendConnected ? 'backend' : 'frontend',
            leftFreq: left,
            rightFreq: right,
            baseFreq: Math.min(left, right),
            beatFreq: beat,
            volume: (audioEngine as any)?.audioState?.volume ?? DEFAULT_VOLUME,
            waveform: (audioEngine as any)?.audioState?.waveform ?? 'sine',
            backendConnected: !!(audioEngine as any)?.backendConnected,
            sessionId: (audioEngine as any)?.sessionId ?? null,
            spatialEnabled: false,
            spatialMode: 'off'
        } as CoreAudioState;
    }, [audioEngine]);

    // Create updateAudioState wrapper using audioEngine methods
    const updateAudioState = React.useMemo(() => ({
        updateFrequencies: (left: number, right: number) => {
            if (audioEngine?.updateFrequency) {
                audioEngine.updateFrequency(left, right);
            }
        },
        setPlaying: (playing: boolean) => {
            // Audio engine handles its own playing state
        }
    }), [audioEngine]);

    // Timer logic hook
    const {
        presets,
        selectedPresetId,
        setSelectedPresetId,
        timerState,
        isTimerRunning,
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
        jumpToTransition,
        restartCurrentTransition
    } = useTimerLogic({
        audioEngine,
        audioState,
        updateAudioState,
        patterns8DControl: patterns8DEngine,
        onElectromagneticUpdate,
        onTimerStatusUpdate // 🔥 FIXED: Pass callback to hook
    });

    // Expose navigation functions to parent via callback
    React.useEffect(() => {
        if (onTransitionNavigation) {
            onTransitionNavigation.jumpToTransition = jumpToTransition;
            onTransitionNavigation.restartCurrentTransition = restartCurrentTransition;
        }
    }, [jumpToTransition, restartCurrentTransition, onTransitionNavigation]);

    // Expose control functions to parent via callback
    React.useEffect(() => {
        if (onTimerControl) {
            onTimerControl.stopTimer = () => {
                controlTimer('stop');
            };
            onTimerControl.pauseTimer = () => {
                controlTimer('pause');
            };
            onTimerControl.resumeTimer = () => {
                controlTimer('resume');
            };
            onTimerControl.restartTimer = () => {
                controlTimer('restart');
            };
        }
    }, [controlTimer, onTimerControl]);

    // Local state for dialogs and custom presets
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

    // Custom preset handlers
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
                        description: 'Alpha waves'
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

    return (
        <Box
            sx={{
                py: 1,
                maxWidth: 1200,
                mx: 'auto',
                height: 'auto',
                overflow: 'visible'
            }}
        >
            {/* Header Section */}
            <Typography
                variant="h6"
                component="h4"
                sx={{
                    fontSize: '1.2rem',
                    color: '#ff6b00',
                    mb: 1,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}
            >
                Frequency Timer Sessions
            </Typography>
            <Typography
                sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    mb: 2,
                    textAlign: 'center',
                    maxWidth: 800,
                    mx: 'auto'
                }}
            >
                Schedule automated frequency transitions for extended sessions.
                Perfect for sleep induction, meditation progressions, and lucid dreaming protocols.
            </Typography>

            {/* Error Display */}
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

            {/* Preset Selection Card */}
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
                            value={presets.some(p => p.id === selectedPresetId) ? selectedPresetId : ''}
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
                                    <Box sx={{ width: '100%' }}>
                                        <Typography component="div" variant="body2"
                                                    sx={{ fontWeight: selectedPresetId === preset.id ? 'bold' : 'normal' }}>
                                            {preset.name}
                                            {preset.id.startsWith('custom-') &&
                                                <Chip label="Custom" size="small" color="secondary" sx={{ ml: 1 }} />}
                                            {preset.is_premium &&
                                                <Chip label="Premium" size="small" color="warning" sx={{ ml: 1 }} />}
                                            {preset.loop_enabled &&
                                                <Chip label="Loop" size="small" color="info" sx={{ ml: 1 }} />}
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
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Button
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => handleEditPreset(selectedPresetId)}
                                disabled={loading || timerState?.isActive}
                                sx={{ color: '#00bfff' }}
                            >
                                Edit
                            </Button>
                            <Button
                                size="small"
                                startIcon={<DeleteIcon />}
                                onClick={() => handleDeletePreset(selectedPresetId)}
                                disabled={loading || timerState?.isActive}
                                sx={{ color: '#ff6b6b' }}
                            >
                                Delete
                            </Button>
                        </Box>
                    )}

                    {/* Loop Control */}
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={loopEnabled || (timerState?.forceLoop || false)}
                                onChange={(e) => setLoopEnabled(e.target.checked)}
                                disabled={loading || timerState?.isActive}
                                sx={{
                                    color: '#00bfff',
                                    '&.Mui-checked': { color: '#00bfff' }
                                }}
                            />
                        }
                        label={
                            <Typography variant="body2" sx={{ color: '#00bfff' }}>
                                🔄 Enable Loop for this session
                                {timerState?.isActive && loopEnabled && (
                                    <Box component="span" sx={{ color: '#00ff88', ml: 1, fontWeight: 'bold' }}>
                                        (ACTIVE)
                                    </Box>
                                )}
                            </Typography>
                        }
                        sx={{ mb: 2 }}
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
                        sx={{ mb: 2 }}
                    >
                        {loading ? <CircularProgress size={20} /> : 'Start Timer Session'}
                    </Button>

                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<AddIcon />}
                        onClick={() => setShowCreateDialog(true)}
                        disabled={loading || timerState?.isActive}
                    >
                        Create Custom Preset
                    </Button>
                </CardContent>
            </Card>

            {/* Active Session Card */}
            {timerState?.isActive && (
                <Card sx={{ bgcolor: 'rgba(0,0,0,0.3)' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom color="primary">
                            Active Session
                        </Typography>

                        {!hideSession && timerState.transitions[timerState.currentTransitionIndex] && (
                            <Box mb={3}>
                                <Typography variant="subtitle1" gutterBottom sx={{ color: '#00ff88' }}>
                                    🎧 ACTIVE: {timerState.transitions[timerState.currentTransitionIndex].description}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    <Box component="span" sx={{ color: '#ff6b00', fontWeight: 'bold' }}>
                                        {timerState.transitions[timerState.currentTransitionIndex].frequency_hz}Hz
                                    </Box> •
                                    {timerState.transitions[timerState.currentTransitionIndex].frequency_type} waves •
                                    <Box component="span" sx={{ color: '#00bfff' }}>
                                        {timerState.transitions[timerState.currentTransitionIndex].left_ear_hz}Hz L
                                        / {timerState.transitions[timerState.currentTransitionIndex].right_ear_hz}Hz R
                                    </Box>
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#ffd700', fontStyle: 'italic' }}>
                                    ⚡ Timer is automatically controlling your binaural beat frequencies
                                    {timerState.forceLoop && (
                                        <Box component="span" sx={{ color: '#00bfff', ml: 1 }}>
                                            🔄 Loop: Enabled
                                        </Box>
                                    )}
                                </Typography>
                            </Box>
                        )}

                        {!hideSession && timerState.transitions[timerState.currentTransitionIndex + 1] && (
                            <Box mb={2}>
                                <Typography variant="body2" color="textSecondary">
                                    Next: {timerState.transitions[timerState.currentTransitionIndex + 1].description}
                                </Typography>
                            </Box>
                        )}

                        <Box mt={2} display="flex" gap={2} flexWrap="wrap">
                            {timerState.isPaused ? (
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
            {loading && !timerState && (
                <Box display="flex" justifyContent="center" mt={3}>
                    <CircularProgress />
                </Box>
            )}

            {/* Create Custom Preset Dialog */}
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
                <DialogTitle sx={{ color: '#ff6b6b' }}>
                    🗑️ Delete Custom Preset
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this custom preset? This action cannot be undone.
                    </Typography>
                    {deletingPresetId && (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
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
                        {loading ? <CircularProgress size={20} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TimerTab;