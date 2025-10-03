// Timer Countdown Display Component
// Shows prominent countdown for active timer sessions

import React from 'react';
import {Box, Typography, Paper, LinearProgress, Chip} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import type {TimerPreset, TimerStatus} from '../data/timer';
import type {AppState} from "../types";

interface TimerCountdownDisplayProps {
    timerStatus: TimerStatus | null,
    isVisible?: boolean,
    presets?: TimerPreset[],
    appState?: AppState
}

const TimerCountdownDisplay: React.FC<TimerCountdownDisplayProps> = ({
                                                                         timerStatus,
                                                                         isVisible = true,
                                                                         appState
                                                                     }) => {
    // Show countdown if timer is running OR if session is active
    const shouldShow = isVisible && timerStatus && (
        timerStatus.isRunning ||
        timerStatus.session?.is_active ||
        (timerStatus.current_transition && timerStatus.time_remaining_current !== undefined)
    );

    if (!shouldShow) {
        return null;
    }

    const currentTransition = timerStatus.current_transition;
    const timeRemainingCurrent = timerStatus.time_remaining_current;
    const timeRemainingTotal = timerStatus.time_remaining_total;
    const preset = timerStatus.session?.preset;

    const currentIndex = timerStatus.session?.current_transition_index || 0;
    const totalTransitions = preset?.transitions_count || 1;

    // Format time as MM:SS with proper seconds display
    const formatTime = (minutes: number | undefined): string => {
        if (minutes === undefined || minutes === null || isNaN(minutes)) return '00:00';
        const totalSeconds = Math.max(0, Math.floor(minutes * 60));
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress percentage for current transition
    const transitionProgress = currentTransition ?
        ((currentTransition.duration_minutes - timeRemainingCurrent) / currentTransition.duration_minutes) * 100 : 0;

    // Force component update when time changes
    const timeKey = `${Math.floor((timeRemainingCurrent || 0) * 60)}`;

    // Debug logging
    React.useEffect(() => {
        console.log('⏱️ Timer Display Update:', {
            timeRemainingCurrent,
            formatted: formatTime(timeRemainingCurrent),
            timeKey
        });
    }, [timeRemainingCurrent, timeKey]);

    return (
        <Paper
            key={timeKey}
            elevation={3}
            sx={{
                p: 1.5,
                background: 'linear-gradient(45deg, rgba(255, 107, 0, 0.1), rgba(138, 43, 226, 0.1))',
                border: '1px solid',
                borderColor: '#ff6b00',
                borderRadius: 1,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255, 107, 0, 0.05), rgba(138, 43, 226, 0.05))',
                    animation: 'pulse 3s ease-in-out infinite',
                }
            }}
        >
            <Box sx={{position: 'relative', zIndex: 1}}>
                {/* Header */}
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                        <TimerIcon sx={{color: '#ff6b00', fontSize: '1.2rem'}}/>
                        <Typography variant="body1" sx={{color: '#ff6b00', fontWeight: 'bold', fontSize: '0.9rem'}}>
                            {preset?.name || 'Timer Session'}
                        </Typography>
                    </Box>

                    <Chip
                        icon={<PlayArrowIcon/>}
                        label="ACTIVE"
                        color="success"
                        variant="filled"
                        size="small"
                        sx={{
                            fontWeight: 'bold',
                            animation: 'pulse 2s infinite',
                            boxShadow: '0 0 8px rgba(0, 255, 0, 0.4)',
                            height: '20px',
                            fontSize: '0.7rem'
                        }}
                    />
                </Box>

                {/* Current Transition Info - More Compact */}
                <Box sx={{mb: 1}}>
                    <Typography variant="caption" color="text.secondary" sx={{fontSize: '0.7rem'}}>
                        Step {currentIndex + 1}/{totalTransitions}: {currentTransition?.description}
                    </Typography>
                    <Typography variant="caption" color="secondary" sx={{display: 'block', fontSize: '0.65rem'}}>
                        {currentTransition?.frequency_hz}Hz
                        • {currentTransition?.left_ear_hz}/{currentTransition?.right_ear_hz}Hz
                    </Typography>
                </Box>

                {/* Progress Bar - Thinner */}
                <Box sx={{mb: 1}}>
                    <LinearProgress
                        variant="determinate"
                        value={Math.min(100, Math.max(0, transitionProgress))}
                        sx={{
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 2,
                                background: 'linear-gradient(45deg, #ff6b00, #8a2be2)'
                            }
                        }}
                    />
                </Box>

                {/* Time Display - Compact */}
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Box sx={{textAlign: 'center'}}>
                        <Typography variant="h5" sx={{
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            color: '#ff6b00',
                            fontSize: '1.3rem',
                            textShadow: '0 0 10px rgba(255, 107, 0, 0.5)'
                        }}>
                            {formatTime(timeRemainingCurrent)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{fontSize: '0.65rem'}}>
                            Current Step
                        </Typography>
                    </Box>

                    <Box sx={{textAlign: 'center'}}>
                        <Typography variant="h6" sx={{
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            color: '#8a2be2',
                            fontSize: '1.1rem'
                        }}>
                            {formatTime(timeRemainingTotal)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{fontSize: '0.65rem'}}>
                            Total Remaining
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
};

export default TimerCountdownDisplay;