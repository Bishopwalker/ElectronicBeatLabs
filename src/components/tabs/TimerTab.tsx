// Electromagnetic Beat Lab - Timer Tab Component
import React from 'react';
import {Box, Typography} from '@mui/material';
import TimerControls from '../TimerControls';
import type {
    ADHDProtocol,
    AppState,
    AudioEngine,
    BackendAudioEngineState,
    BinauralBeatConfig,
    ElectromagneticField,
    Pattern8D, PatternConfig
} from '../../types';
import type {TimerStatus} from "../../data/timer";

interface TimerTabProps {
    appState: AppState,
    patterns8D: Pattern8D[],
    onStateChange: (state: Partial<AppState>) => void,
    onTimerStatusUpdate?: (status: TimerStatus | null) => void,
    audioEngine?: {
        startBinauralBeat: (config:BinauralBeatConfig) => Promise<void>;
        stopBinauralBeat: () => Promise<void>;
        updateFrequency: (left: number, right: number) => void;
        audioState: {
            isPlaying: boolean;
        };
    };
    patterns8DEngine?: {
        setActivePattern: (pattern: PatternConfig) => void;
        clearActivePattern: () => void;
    };
}

const TimerTab: React.FC<TimerTabProps> = ({audioEngine, patterns8DEngine, onStateChange, onTimerStatusUpdate}) => {
    return (
        <Box
            sx={{
                py: 1,
                maxWidth: 1200,
                mx: 'auto'
            }}
        >
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
            <TimerControls 
                audioEngine={audioEngine}
                patterns8D={patterns8DEngine}
                onElectromagneticUpdate={(electromagnetic) => onStateChange({ electromagnetic })}
                onTimerStatusUpdate={onTimerStatusUpdate}
            />
        </Box>
    );
};

export default TimerTab;