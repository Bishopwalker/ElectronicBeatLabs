import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Paper,
    IconButton,
    CircularProgress,
    Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type {CustomPresetForm} from '../../data/timer';
import {getWaveTypeFromFrequency} from '../../helpers/timer/timerUtils';

interface CustomPresetDialogProps {
    open: boolean,
    onClose: () => void,
    customPreset: CustomPresetForm,
    setCustomPreset: React.Dispatch<React.SetStateAction<CustomPresetForm>>,
    onSave: () => void,
    loading: boolean,
    title?: string
}

const CustomPresetDialog: React.FC<CustomPresetDialogProps> = ({
                                                                   open,
                                                                   onClose,
                                                                   customPreset,
                                                                   setCustomPreset,
                                                                   onSave,
                                                                   loading,

                                                               }) => {
    const addTransition = () => {
        setCustomPreset(prev => ({
            ...prev,
            transitions: [...prev.transitions, {
                duration_minutes: 10,
                frequency_hz: 10,
                frequency_type: 'Alpha',
                left_ear_hz: 140,
                right_ear_hz: 144,
                description: 'New transition'
            }]
        }));
    };

    const removeTransition = (index: number) => {
        setCustomPreset(prev => ({
            ...prev,
            transitions: prev.transitions.filter((_, i) => i !== index)
        }));
    };

    const updateTransition = (index: number, field: string, value: any) => {
        setCustomPreset(prev => {
            const newTransitions = prev.transitions.map((t, i) => {
                if (i === index) {
                    const updatedTransition = {...t, [field]: value};

                    if (field === 'left_ear_hz' || field === 'right_ear_hz') {
                        const leftEar = field === 'left_ear_hz' ? value : updatedTransition.left_ear_hz;
                        const rightEar = field === 'right_ear_hz' ? value : updatedTransition.right_ear_hz;

                        const leftNum = parseFloat(leftEar);
                        const rightNum = parseFloat(rightEar);

                        if (!isNaN(leftNum) && !isNaN(rightNum)) {
                            const beat_frequency = Math.abs(rightNum - leftNum);
                            updatedTransition.frequency_hz = beat_frequency;
                            updatedTransition.frequency_type = getWaveTypeFromFrequency(beat_frequency);
                        }
                    }

                    return updatedTransition;
                }
                return t;
            });

            return {
                ...prev,
                transitions: newTransitions
            };
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>Create Custom Timer Preset</DialogTitle>
            <DialogContent>
                <Box sx={{mt: 2}}>
                    <TextField
                        fullWidth
                        label="Preset Name"
                        value={customPreset.name}
                        onChange={(e) => setCustomPreset(prev => ({...prev, name: e.target.value}))}
                        sx={{mb: 2}}
                        required
                    />

                    <TextField
                        fullWidth
                        label="Description"
                        value={customPreset.description}
                        onChange={(e) => setCustomPreset(prev => ({...prev, description: e.target.value}))}
                        multiline
                        rows={2}
                        sx={{mb: 3}}
                    />

                    <Typography variant="h6" gutterBottom>
                        Transitions
                    </Typography>

                    {customPreset.transitions.map((transition, index) => (
                        <Paper key={index} elevation={1} sx={{p: 2, mb: 2, bgcolor: 'rgba(0,0,0,0.05)'}}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Transition {index + 1}
                                </Typography>
                                {customPreset.transitions.length > 1 && (
                                    <IconButton
                                        size="small"
                                        onClick={() => removeTransition(index)}
                                        color="error"
                                    >
                                        <DeleteIcon/>
                                    </IconButton>
                                )}
                            </Box>

                            <Grid container spacing={2}>
                                <Grid size={{xs: 6, md: 3}}>
                                    <TextField
                                        fullWidth
                                        label="Left Ear (Hz)"
                                        type="text"
                                        value={transition.left_ear_hz}
                                        onChange={(e) => {
                                            updateTransition(index, 'left_ear_hz', e.target.value);
                                        }}
                                        size="small"
                                    />
                                </Grid>

                                <Grid size={{xs: 6, md: 3}}>
                                    <TextField
                                        fullWidth
                                        label="Right Ear (Hz)"
                                        type="text"
                                        value={transition.right_ear_hz}
                                        onChange={(e) => {
                                            updateTransition(index, 'right_ear_hz', e.target.value);
                                        }}
                                        size="small"
                                    />
                                </Grid>

                                <Grid size={{xs: 6, md: 3}}>
                                    <TextField
                                        fullWidth
                                        label="Beat Frequency (Hz)"
                                        type="number"
                                        value={transition.frequency_hz}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                        sx={{
                                            '& .MuiInputBase-input': {
                                                backgroundColor: 'rgba(0, 191, 255, 0.1)',
                                                color: '#00bfff',
                                                fontWeight: 'bold'
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid size={{xs: 6, md: 3}}>
                                    <TextField
                                        fullWidth
                                        label="Wave Type"
                                        value={transition.frequency_type}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                        sx={{
                                            '& .MuiInputBase-input': {
                                                backgroundColor: 'rgba(0, 191, 255, 0.1)',
                                                color: '#00bfff',
                                                fontWeight: 'bold'
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid size={{xs: 6, md: 6}}>
                                    <TextField
                                        fullWidth
                                        label={`Duration of Transition ${index + 1}`}
                                        type="number"
                                        value={transition.duration_minutes}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            if (!isNaN(value) && value >= 1 && value <= 300) {
                                                updateTransition(index, 'duration_minutes', value);
                                            }
                                        }}
                                        inputProps={{
                                            min: 1,
                                            max: 300,
                                            step: 1
                                        }}
                                        size="small"
                                    />
                                </Grid>

                                <Grid size={{xs: 6, md: 6}}>
                                    <TextField
                                        fullWidth
                                        label="Total Preset Duration"
                                        type="number"
                                        value={customPreset.transitions.slice(index).reduce((sum, t) => sum + t.duration_minutes, 0)}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                        sx={{
                                            '& .MuiInputBase-input': {
                                                backgroundColor: 'rgba(255, 107, 0, 0.1)',
                                                color: '#ff6b00',
                                                fontWeight: 'bold'
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}

                    <Button
                        variant="outlined"
                        startIcon={<AddIcon/>}
                        onClick={addTransition}
                        sx={{mt: 1, mb: 2}}
                    >
                        Add Transition
                    </Button>

                    <Typography variant="body2" color="textSecondary" align="center">
                        Total Preset
                        Duration: {customPreset.transitions.reduce((sum, t) => sum + t.duration_minutes, 0)} minutes
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={() => {
                        console.log('🚀 SAVE BUTTON CLICKED');
                        console.log('🚀 CURRENT PRESET DATA:', customPreset);
                        onSave();
                    }}
                    variant="contained"
                    disabled={!customPreset.name.trim() || loading}
                    sx={{
                        backgroundColor: customPreset.name.trim() ? '#00ff88' : undefined,
                        '&:hover': {
                            backgroundColor: customPreset.name.trim() ? '#00cc66' : undefined
                        }
                    }}
                >
                    {loading ? <CircularProgress size={16}/> : '💾 Save Preset'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CustomPresetDialog;