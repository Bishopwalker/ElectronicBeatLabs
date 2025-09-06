// Electromagnetic Beat Lab - Timer Tab Component
import React from 'react';
import {Box, Typography} from '@mui/material';
import TimerControls from '../TimerControls';
import type {
    ADHDProtocol,
    AppState,
    AudioEngine,
    AudioEngineState,
    BinauralBeatConfig,
    ElectromagneticField,
    Pattern8D, PatternConfig
} from '../../types';

interface TimerTabProps {
    appaState: AppState,
    patterns8D: Pattern8D[],
    onStateChange: (state: Partial<AppState>) => void,
    audioEngine?: {
        audioEngine: AudioEngine;
        audioState: AudioEngineState;
        electromagnetic: ElectromagneticField;
        startBinauralBeat: (config: BinauralBeatConfig) => Promise<void>;
        stopBinauralBeat: () => void;
        updateFrequency: (leftFreq: number, rightFreq: number) => void;
        updateVolume: (volume: number) => void;
        updateWaveform: (waveform: ("sine" | "square" | "triangle" | "sawtooth")) => void;
        updateSpatialSettings: (spatialSettings: Record<string, unknown>) => void;
        loadPattern: (pattern: PatternConfig) => void;
        generateTestTones: (leftFreq: number, rightFreq: number, duration?: number) => void;
        frequencySweep: (startFreq: number, endFreq: number, duration: number, beatFreq?: number) => void;
        createGammaProtocol: (protocol: ADHDProtocol) => void;
        backendConnected: boolean;
        sessionId: null;
        websocketState: { connected: boolean; connecting: boolean; error: null };
        isSupported: boolean
    }
}

const TimerTab: React.FC<TimerTabProps> = ({audioEngine}) => {
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
            <TimerControls audioEngine={audioEngine}/>
        </Box>
    );
};

export default TimerTab;