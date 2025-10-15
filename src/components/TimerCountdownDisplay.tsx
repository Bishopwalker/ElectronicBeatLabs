// Timer Countdown Display Component
// Shows prominent countdown for active timer sessions

import React, {useState,useEffect,useMemo} from 'react';
import {Box, Typography, Paper, LinearProgress, Chip, IconButton, Tooltip} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import type {TimerPreset, TimerStatus} from '../data/timer';
import type {AppState} from "../types";
import { FrequencyVisualizer } from './FrequencyVisualizer';
import DraggableFrequencyVisualizer from "./DraggableFrequencyVisualizer";
import { DEFAULT_BASE_FREQUENCY, DEFAULT_BEAT_FREQUENCY } from '../constants/audio.constants';

interface TimerCountdownDisplayProps {
    timerStatus: TimerStatus | null,
    isVisible?: boolean,
    presets?: TimerPreset[],
    appState?: AppState,
    onJumpToTransition?: (direction: 'next' | 'previous') => void,
    onRestartTransition?: () => void,
    audioContext?: AudioContext,
    analyserNode?: AnalyserNode,
    hybridEngine?: any, // 🔥 NEW: Pass the hybrid engine to get real audio state
    onClose?: () => void,
    defaultPosition?: { x: 0, y: 0 },
    defaultSize?: { width: 0, height: 0 },
}

const TimerCountdownDisplay: React.FC<TimerCountdownDisplayProps> = ({
                                                                         timerStatus,
                                                                         isVisible = true,
                                                                         appState,
                                                                         onJumpToTransition,
                                                                         onRestartTransition,
                                                                         audioContext,
                                                                         analyserNode,
                                                                         hybridEngine, // 🔥 NEW
                                                                         onClose,
                                                                         defaultPosition = { x: window.innerWidth - 520, y: 150 },
                                                                         defaultSize = { width: 500, height: 200 }
                                                                     }) => {
    // State for fullscreen visualizer toggle
    const [isVisualizerFullscreen, setIsVisualizerFullscreen] = useState(false);

    // Show countdown if timer is running OR if session is active
    const shouldShow = isVisible && timerStatus && (
        timerStatus.isRunning ||
        timerStatus.session?.is_active ||
        (timerStatus.current_transition && timerStatus.time_remaining_current !== undefined)
    );

    if (!shouldShow) {
        return null;
    }

    // Resume audio context if suspended
    React.useEffect(() => {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().catch(err => console.warn('Failed to resume audio context:', err));
        }
    }, [audioContext]);
    
    // Timer status for preset tracking
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

    // 🔥 CRITICAL FIX: Use ACTUAL audio engine state instead of appState
    // The hybrid engine knows the real isPlaying state from both frontend and backend
    const isAudioActuallyPlaying = hybridEngine?.audioState?.isPlaying || false;

    // Debug logging
    React.useEffect(() => {
        console.log('⏱️ Timer Display Audio State:', {
            isAudioActuallyPlaying,
            appStateIsPlaying: appState?.isPlaying,
            hybridEngineState: hybridEngine?.audioState?.isPlaying,
            hasAudioContext: !!audioContext,
            hasAnalyserNode: !!analyserNode
        });
    }, [isAudioActuallyPlaying, appState?.isPlaying, audioContext, analyserNode, hybridEngine]);

    // 🔥 FIXED: Use actual audio playing state from engine
    const visualizerState = useMemo(() => ({
        ...appState,
        base_frequency: currentTransition?.frequency_hz || DEFAULT_BASE_FREQUENCY,
        beat_frequency: (currentTransition?.right_ear_hz || 0) - (currentTransition?.left_ear_hz || 0) || DEFAULT_BEAT_FREQUENCY,
        isPlaying: isAudioActuallyPlaying, // 🔥 FIXED: Use real audio state
        patterns8D: [],
        timer: timerStatus,
        electromagnetic: appState?.electromagnetic
    }), [
        appState,
        currentTransition?.frequency_hz,
        currentTransition?.right_ear_hz,
        currentTransition?.left_ear_hz,
        timerStatus,
        isAudioActuallyPlaying // 🔥 Critical dependency
    ]);

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
                width: '100%',
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
            {/* 🔥 FIXED: Proper 50/50 Horizontal Layout */}
            <Box sx={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                gap: 2,
                alignItems: 'stretch',
                width: '100%',
                minHeight: '300px'
            }}>
                {/* LEFT SIDE: Timer Section - 50% Width */}
                <Box sx={{
                    flex: '1 1 50%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    {/* Header */}
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1}}>
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

                    {/* Current Transition Info */}
                    <Box sx={{mb: 1}}>
                        <Typography variant="caption" color="text.secondary" sx={{fontSize: '0.75rem'}}>
                            Step {currentIndex + 1}/{totalTransitions}: {currentTransition?.description}
                        </Typography>
                        <Typography variant="caption" color="secondary" sx={{display: 'block', fontSize: '0.7rem'}}>
                            {currentTransition?.frequency_hz}Hz
                            • {currentTransition?.left_ear_hz}/{currentTransition?.right_ear_hz}Hz
                        </Typography>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{mb: 2}}>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(100, Math.max(0, transitionProgress))}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                    background: 'linear-gradient(45deg, #ff6b00, #8a2be2)'
                                }
                            }}
                        />
                    </Box>

                    {/* Time Display */}
                    <Box sx={{display: 'flex', justifyContent: 'space-around', alignItems: 'center', mb: 2}}>
                        <Box sx={{textAlign: 'center'}}>
                            <Typography variant="h4" sx={{
                                fontFamily: 'monospace',
                                fontWeight: 'bold',
                                color: '#ff6b00',
                                fontSize: '2rem',
                                textShadow: '0 0 10px rgba(255, 107, 0, 0.5)'
                            }}>
                                {formatTime(timeRemainingCurrent)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{fontSize: '0.7rem'}}>
                                Current Step
                            </Typography>
                        </Box>

                        <Box sx={{textAlign: 'center'}}>
                            <Typography variant="h5" sx={{
                                fontFamily: 'monospace',
                                fontWeight: 'bold',
                                color: '#8a2be2',
                                fontSize: '1.5rem'
                            }}>
                                {formatTime(timeRemainingTotal)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{fontSize: '0.7rem'}}>
                                Total Remaining
                            </Typography>
                        </Box>
                    </Box>

                    {/* Next Transition Preview */}
                    {timerStatus.next_transition && (
                        <Box sx={{
                            mb: 2,
                            p: 1,
                            background: 'rgba(138, 43, 226, 0.15)',
                            borderRadius: 1,
                            border: '1px solid rgba(138, 43, 226, 0.3)'
                        }}>
                            <Typography variant="caption" sx={{fontSize: '0.7rem', color: '#8a2be2', fontWeight: 'bold'}}>
                                Up Next:
                            </Typography>
                            <Typography variant="caption" sx={{display: 'block', fontSize: '0.7rem', color: 'text.secondary'}}>
                                {timerStatus.next_transition.description} • {timerStatus.next_transition.frequency_hz}Hz • {timerStatus.next_transition.duration_minutes}min
                            </Typography>
                        </Box>
                    )}

                    {/* Navigation Controls */}
                    <Box sx={{display: 'flex', justifyContent: 'center', gap: 1}}>
                        <Tooltip title="Previous Transition">
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={() => onJumpToTransition?.('previous')}
                                    disabled={currentIndex === 0}
                                    sx={{
                                        bgcolor: 'rgba(255, 107, 0, 0.2)',
                                        '&:hover': {bgcolor: 'rgba(255, 107, 0, 0.3)'},
                                        '&:disabled': {opacity: 0.3}
                                    }}
                                >
                                    <SkipPreviousIcon sx={{fontSize: '1.2rem', color: '#ff6b00'}} />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Tooltip title="Restart Current Transition">
                            <IconButton
                                size="small"
                                onClick={() => onRestartTransition?.()}
                                disabled={!onRestartTransition}
                                sx={{
                                    bgcolor: 'rgba(138, 43, 226, 0.2)',
                                    '&:hover': {bgcolor: 'rgba(138, 43, 226, 0.3)'}
                                }}
                            >
                                <RestartAltIcon sx={{fontSize: '1.2rem', color: '#8a2be2'}} />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Next Transition">
                            <span>
                            <IconButton
                                size="small"
                                onClick={() => onJumpToTransition?.('next')}
                                disabled={!onJumpToTransition || currentIndex >= totalTransitions - 1}
                                sx={{
                                    bgcolor: 'rgba(255, 107, 0, 0.2)',
                                    '&:hover': {bgcolor: 'rgba(255, 107, 0, 0.3)'},
                                    '&:disabled': {opacity: 0.3}
                                }}
                            >   <SkipNextIcon sx={{fontSize: '1.2rem', color: '#ff6b00'}} />
                            </IconButton>
                                </span>
                        </Tooltip>
                    </Box>
                </Box>

                {/* RIGHT SIDE: Frequency Visualizer - 50% Width */}
                <Box sx={{
                    flex: '1 1 50%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 1,
                    border: '1px solid rgba(138, 43, 226, 0.3)',
                    overflow: 'hidden'
                }}>
                    {/* Visualizer Header */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1,
                        borderBottom: '1px solid rgba(138, 43, 226, 0.3)'
                    }}>
                        <Typography variant="caption" sx={{
                            fontSize: '0.8rem',
                            color: '#8a2be2',
                            fontWeight: 'bold'
                        }}>
                            📊 Live Frequency Visualization
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={() => setIsVisualizerFullscreen(true)}
                            sx={{
                                color: '#8a2be2',
                                p: 0.25,
                                '&:hover': { bgcolor: 'rgba(138, 43, 226, 0.2)' }
                            }}
                            title="Expand to fullscreen"
                        >
                            <FullscreenIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                    </Box>
                    
                    {/* 🔥 FIXED: Visualizer takes full space */}
                    <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
                        <FrequencyVisualizer
                            state={visualizerState}
                            audioContext={audioContext}
                            analyserNode={analyserNode}
                            title=""
                            showSpectrum={true}
                            showFrequencies={true}
                            showMetrics={false}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Fullscreen Draggable Visualizer Overlay */}
            {isVisualizerFullscreen && (
                <DraggableFrequencyVisualizer
                    state={visualizerState}
                    audioContext={audioContext}
                    analyserNode={analyserNode}
                    onClose={() => setIsVisualizerFullscreen(false)}
                    defaultPosition={{ x: window.innerWidth - 520, y: 100 }}
                    defaultSize={{ width: 500, height: 400 }}
                />
            )}
        </Paper>
    );
};
export default TimerCountdownDisplay;