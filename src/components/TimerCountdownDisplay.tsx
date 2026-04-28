// Timer Countdown Display Component
// Shows prominent countdown for active timer sessions

import React from 'react';
import {Box, Chip, IconButton, LinearProgress, Tooltip, Typography} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import RepeatIcon from '@mui/icons-material/Repeat';
import type {TimerPreset, TimerStatus} from '../data/timer';
import type {AppState} from "../types";
import CollapsibleSection from './shared/CollapsibleSection';

interface TimerCountdownDisplayProps {
    timerStatus: TimerStatus | null,
    isVisible?: boolean,
    presets?: TimerPreset[],
    appState?: AppState,
    onJumpToTransition?: (direction: 'next' | 'previous') => void,
    onRestartTransition?: () => void,
    onPauseTimer?: () => void,
    onResumeTimer?: () => void,
    onRepeatSession?: () => void,
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
                                                                         onPauseTimer,
                                                                         onResumeTimer,
                                                                         onRepeatSession,
                                                                         audioContext,
                                                                         analyserNode,
                                                                         hybridEngine, // 🔥 NEW
                                                                         onClose,
                                                                         defaultPosition = { x: window.innerWidth - 520, y: 150 },
                                                                         defaultSize = { width: 500, height: 200 }
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

    return (
        <Box id="timerCountdown" sx={{
            minHeight:0,
            width: '100%',
            mb: 1,
            maxHeight: '220px', // 🔥 CRITICAL: Fixed max height
            overflow: 'hidden',
            position: 'relative',
            top: 0,
            zIndex: 100,
            background: 'linear-gradient(45deg, rgba(255, 107, 0, 0.1), rgba(138, 43, 226, 0.1))',
            border: '1px solid',
            borderColor: '#ff6b00',
            borderRadius: 1,
            boxShadow: '0 4px 20px rgba(255, 107, 0, 0.3)',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, rgba(255, 107, 0, 0.05), rgba(138, 43, 226, 0.05))',
                animation: 'pulse 3s ease-in-out infinite',
                pointerEvents: 'none',
                zIndex: 0
            }
        }}>
            <CollapsibleSection
                id="timerDisplay"
                title={preset?.name || 'Timer Session'}
                icon="⏰"
                onClose={onClose}
                defaultOpen={true}
                compact={true}
            >
                {/* Timer Section - Single Column Layout */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    width: '100%',
                    height: '180px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    position: 'relative',
                    zIndex: 1, // Above animated background
                    pr: 1 // Padding for scrollbar
                }}>
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
                                // ✅ REMOVED: animation causing UI jumping!
                                boxShadow: '0 0 8px rgba(0, 255, 0, 0.4)',
                                height: '20px',
                                fontSize: '0.7rem'
                            }}
                        />
                    </Box>

                    {/* Current Transition Info */}
                    <Box sx={{mb: 0.5}}>
                        <Typography variant="caption" color="text.secondary" sx={{fontSize: '0.75rem'}}>
                            Step {currentIndex + 1}/{totalTransitions}: {currentTransition?.description}
                        </Typography>
                        <Typography variant="caption" color="secondary" sx={{display: 'block', fontSize: '0.7rem'}}>
                            {currentTransition?.frequency_hz}Hz
                            • {currentTransition?.left_ear_hz}/{currentTransition?.right_ear_hz}Hz
                        </Typography>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{mb: 1}}>
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

                    {/* Time Display - COMPACT */}
                    <Box sx={{display: 'flex', justifyContent: 'space-around', alignItems: 'center', mb: 0.5}}>
                        <Box sx={{textAlign: 'center'}}>
                            <Typography variant="h5" sx={{
                                fontFamily: 'monospace',
                                fontWeight: 'bold',
                                color: '#ff6b00',
                                fontSize: '1.5rem', // 🔥 REDUCED from 2rem
                                textShadow: '0 0 10px rgba(255, 107, 0, 0.5)',
                                lineHeight: 1
                            }}>
                                {formatTime(timeRemainingCurrent)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{fontSize: '0.65rem', lineHeight: 1}}>
                                Current Step
                            </Typography>
                        </Box>

                        <Box sx={{textAlign: 'center'}}>
                            <Typography variant="h6" sx={{
                                fontFamily: 'monospace',
                                fontWeight: 'bold',
                                color: '#8a2be2',
                                fontSize: '1.2rem', // 🔥 REDUCED from 1.5rem
                                lineHeight: 1
                            }}>
                                {formatTime(timeRemainingTotal)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{fontSize: '0.65rem', lineHeight: 1}}>
                                Total Remaining
                            </Typography>
                        </Box>
                    </Box>

                    {/* Next Transition Preview - ULTRA COMPACT */}
                    {timerStatus.next_transition && (
                        <Box sx={{
                            mb: 0.5,  // 🔥 REDUCED further
                            p: 0.5,   // 🔥 REDUCED further
                            background: 'rgba(138, 43, 226, 0.15)',
                            borderRadius: 0.5,
                            border: '1px solid rgba(138, 43, 226, 0.3)'
                        }}>
                            <Typography variant="caption" sx={{fontSize: '0.65rem', color: '#8a2be2', fontWeight: 'bold', lineHeight: 1}}>
                                Up Next:
                            </Typography>
                            <Typography variant="caption" sx={{display: 'block', fontSize: '0.65rem', color: 'text.secondary', lineHeight: 1.2}}>
                                {timerStatus.next_transition.description} • {timerStatus.next_transition.frequency_hz}Hz • {timerStatus.next_transition.duration_minutes}min
                            </Typography>
                        </Box>
                    )}

                    {/* Navigation Controls */}
                    <Box sx={{display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap'}}>
                        {/* First Row - Transport Controls */}
                        <Box sx={{display: 'flex', gap: 1}}>
                            <Tooltip title={timerStatus.session?.isPaused ? "Resume Timer" : "Pause Timer"}>
                                <IconButton
                                    size="small"
                                    onClick={() => timerStatus.session?.isPaused ? onResumeTimer?.() : onPauseTimer?.()}
                                    disabled={!onPauseTimer || !onResumeTimer}
                                    sx={{
                                        bgcolor: timerStatus.session?.isPaused ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 193, 7, 0.2)',
                                        '&:hover': {
                                            bgcolor: timerStatus.session?.isPaused ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 193, 7, 0.3)'
                                        }
                                    }}
                                >
                                    {timerStatus.session?.isPaused ?
                                        <PlayArrowIcon sx={{fontSize: '1.2rem', color: '#00ff88'}} /> :
                                        <PauseIcon sx={{fontSize: '1.2rem', color: '#ffc107'}} />
                                    }
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Repeat Session">
                                <IconButton
                                    size="small"
                                    onClick={() => onRepeatSession?.()}
                                    disabled={!onRepeatSession}
                                    sx={{
                                        bgcolor: 'rgba(33, 150, 243, 0.2)',
                                        '&:hover': {bgcolor: 'rgba(33, 150, 243, 0.3)'}
                                    }}
                                >
                                    <RepeatIcon sx={{fontSize: '1.2rem', color: '#2196f3'}} />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {/* Second Row - Transition Controls */}
                        <Box sx={{display: 'flex', gap: 1, width: '100%', justifyContent: 'center'}}>
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
                </Box>
            </CollapsibleSection>
        </Box>
    );
};
export default TimerCountdownDisplay;