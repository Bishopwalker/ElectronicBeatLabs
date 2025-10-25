// Electromagnetic Beat Lab - Binaural Generator with Visualization
// Unified binaural beat generator with frequency and electromagnetic analysis

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  Stack,
  Paper,
  Chip,
  IconButton,
  LinearProgress,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import RefreshIcon from '@mui/icons-material/Refresh';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import {calculateRightFreq} from "../types/clean.types.ts";
import { useBinauralVisualization } from '../hooks/useBinauralVisualization';
import  {DEFAULT_BASE_FREQUENCY,DEFAULT_BEAT_FREQUENCY} from '../constants/audio.constants.ts';
import MainControlsMUI from "./MainControlsMUI.tsx";
import type { WaveForm, MainControlsProps, AppState } from '../types';

interface BinauralGeneratorProps extends MainControlsProps{
   base_frequency: number;
  beat_frequency: number;
  waveform?: WaveForm;
  onFrequencyChange: (base_frequency: number, beat_frequency: number) => void;
  onWaveformChange?: (waveform: WaveForm) => void;
  currentPreset?: {
    name?: string;
    description?: string;
    isActive?: boolean;
    source?: 'timer' | 'pattern' | 'manual';
  };
  appState?:AppState;
}

const BinauralGeneratorMUI: React.FC<BinauralGeneratorProps> = ({
  base_frequency,
  beat_frequency,
  waveform = 'sine',
  onFrequencyChange,
  onWaveformChange,
  currentPreset,
  volume,
  onVolumeChange,
  isPlaying,
  onPlay,
         appState,
                                                                  onStop
}) => {
  // Calculate display frequencies from base + beat
  const leftFreq = base_frequency;
  const rightFreq = base_frequency+ beat_frequency;

  // Local state for typing - allows smooth input
  const [leftInput, setLeftInput] = useState(leftFreq);
  const [rightInput, setRightInput] = useState(rightFreq);

  // Binaural visualization hook for frequency and electromagnetic analysis
  const { visualizationData, stats, isPlaying: isVisualizing} = useBinauralVisualization({
    updateRate: 50,
    enabled: true,
    showSpectrum: true,
    showPeaks: true,
    showAmplitudes: true });

  // 🔥 EM FIELD FREQUENCY MODULATION SYSTEM
  // Calculates real-time frequency modulation based on electromagnetic field simulation
  const calculateEMModulation = useCallback((
    beatFreq: number,
    baseFreq: number
  ): number => {
    // Null safety check
    if (!appState?.electromagnetic || !appState?.currentPattern) return 0;

    const emField = appState.electromagnetic;
    const pattern = appState.currentPattern.type;

    // Frequency range sensitivity (lower frequencies = more affected by EM)
    let maxDeviation = 0.1; // Default 10%
    if (beatFreq <= 4) maxDeviation = 0.10;       // Delta: ±10%
    else if (beatFreq <= 8) maxDeviation = 0.07;  // Theta: ±7%
    else if (beatFreq <= 13) maxDeviation = 0.05; // Alpha: ±5%
    else if (beatFreq <= 30) maxDeviation = 0.03; // Beta: ±3%
    else maxDeviation = 0.01;                     // Gamma: ±1%

    // Pattern-specific modulation shape
    const phase = emField.phase || 0;
    let patternModifier = 1.0;

    switch(pattern) {
      case 'toroidal':
        // Circular wave - smooth sine oscillation
        patternModifier = Math.sin(phase * Math.PI / 180);
        break;
      case 'vortex':
        // Spiral decay - sine with exponential falloff
        patternModifier = Math.sin(phase * Math.PI / 180) * Math.exp(-phase / 720);
        break;
      case 'wave':
      case 'standing':
        // Standing wave interference - combination of harmonics
        patternModifier = (Math.sin(phase * Math.PI / 90) + Math.cos(phase * Math.PI / 180)) / 2;
        break;
      case 'spiral':
      case 'helix':
        // Logarithmic growth
        patternModifier = Math.sin(phase * Math.PI / 180) * (1 + Math.log(1 + phase / 360));
        break;
      default:
        // Default to simple sine wave
        patternModifier = Math.sin(phase * Math.PI / 180);
    }

    // Combine all factors: base freq * max deviation * EM strength * pattern shape * coherence
    const modulation = baseFreq * maxDeviation * (emField.strength || 0) * patternModifier * (emField.coherence || 1);

    console.log('🌀 EM Modulation:', {
      baseFreq,
      beatFreq,
      maxDev: maxDeviation,
      strength: emField.strength,
      pattern,
      patternMod: patternModifier.toFixed(3),
      coherence: emField.coherence,
      finalMod: modulation.toFixed(2)
    });

    return modulation;
  }, [appState]);

  // Calculate modulated frequencies based on EM field
  const modulatedFrequencies = useMemo(() => {
    const modulation = calculateEMModulation(beat_frequency, base_frequency);

    return {
      base: base_frequency + modulation,
      beat: beat_frequency,
      left: base_frequency + modulation,
      right: base_frequency + beat_frequency + modulation,
      offset: modulation,
      original: {
        base: base_frequency,
        left: base_frequency,
        right: base_frequency + beat_frequency
      }
    };
  }, [base_frequency, beat_frequency, calculateEMModulation]);

  const handleWaveformChange = (_: React.MouseEvent<HTMLElement>, value: WaveForm) => {
    if (onWaveformChange) {
      onWaveformChange(value);
    }
  };

  // Calculate electromagnetic field strength for display (0-1 range)
  const calculateElectromagneticStrength = (beatFreq: number): number => {
    if (!appState?.electromagnetic) return 0.5;

    // Use actual EM field strength with frequency-based weighting
    const baseStrength = appState.electromagnetic.strength || 0.5;

    // Frequency-based intensity mapping
    if (beatFreq <= 4) return baseStrength * 0.333;  // Delta - Low field
    if (beatFreq <= 8) return baseStrength * 0.444;  // Theta - medium field
    if (beatFreq <= 13) return baseStrength * 0.666; // Alpha - medium field
    if (beatFreq <= 30) return baseStrength * 0.777; // Beta - moderate field
    return baseStrength * 0.999;                     // Gamma - very strong field
  };

  const electromagneticStrength = calculateElectromagneticStrength(beat_frequency);
  const electromagneticState = beat_frequency > 0 ?
    (beat_frequency <= 4 ? 'DEEP RESONANCE' :
     beat_frequency <= 8 ? 'CREATIVE FLOW' :
     beat_frequency <= 13 ? 'FOCUSED CALM' :
     beat_frequency <= 30 ? 'ACTIVE FOCUS' : 'HIGH ALERT') : 'INACTIVE';

  // Update local state when base_frequency/beat_frequency changes
  useEffect(() => {
    const newLeftFreq =  base_frequency;
    console.log('🎛️ BinauralGenerator: Base frequency changed, left freq:', newLeftFreq);
    setLeftInput(newLeftFreq);
  }, [base_frequency]);

  useEffect(() => {
    const newRightFreq = calculateRightFreq(base_frequency, beat_frequency);
    console.log('🎛️ BinauralGenerator: Beat frequency changed, right freq:', newRightFreq);
    setRightInput(newRightFreq);
  }, [base_frequency, beat_frequency]);

  const handleLeftChange = (value: number) => {
    console.log('🎛️ Left Hz input changed:', value);
    setLeftInput(value);

    const leftNum = parseFloat(value.toString());
    if (!isNaN(leftNum)) {
      // Convert left freq back to base_frequency, keep current beat_frequency
      const newBaseFreq = leftNum; // left = base
      console.log('🎛️ Calling onFrequencyChange with base_frequency:', newBaseFreq, 'beat_frequency:', beat_frequency);
      onFrequencyChange(newBaseFreq, beat_frequency);
    }
  };

  const handleRightChange = (value: string) => {
    console.log('🎛️ Right Hz input changed:', value);
    setRightInput(parseFloat(value));

    const rightNum = parseFloat(value);
    if (!isNaN(rightNum)) {
      // Convert right freq to beat_frequency: beat = right - left (right - base)
     // const newBeatFreq = calculateBeatFrequency(leftFreq, rightNum);
    //  console.log('🎛️ Calling onFrequencyChange with base_frequency:', base_frequency, 'beat_frequency:', newBeatFreq);
      onFrequencyChange(base_frequency, beat_frequency);
    }
  };

  // Beat frequency comes from props, display frequencies calculated above

  const handleReset = () => {
    const defaultBaseFreq =  DEFAULT_BASE_FREQUENCY;
    const defaultBeatFreq = DEFAULT_BEAT_FREQUENCY;
    const newLeftFreq = defaultBaseFreq;
    const newRightFreq = defaultBaseFreq+defaultBeatFreq;
    setLeftInput(newLeftFreq);
    setRightInput(newRightFreq);

    onFrequencyChange(defaultBaseFreq, defaultBeatFreq);
  };

  // @ts-ignore
  return (
    <Card sx={{ 
      minHeight: 'fit-content',
      maxHeight: '400PX',
      overflowX: 'hidden',
       background: 'rgba(0, 191, 255, 0.05)',
      borderColor: 'rgba(0, 191, 255, 0.3)',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'linear-gradient(45deg, #00bfff, #8a2be2)',
        borderRadius: '4px',
      },
    }}>
      <CardContent sx={{ p: 0.75 }}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} mb={0.5}>
          <HeadphonesIcon color="info" />
          <Typography variant="subtitle1" align="center" color="info">
            Binaural Beat Generator
          </Typography>
        </Stack>

        {/* Current Preset Display */}
        {currentPreset && currentPreset.name && (
          <Paper
            elevation={3}
            sx={{
              p: 0.75,
              mb: 1,
              textAlign: 'center',
              background: currentPreset.source === 'timer' 
                ? 'rgba(255, 107, 0, 0.1)' 
                : currentPreset.source === 'pattern'
                ? 'rgba(138, 43, 226, 0.1)'
                : 'rgba(0, 191, 255, 0.1)',
              border: `1px solid ${currentPreset.source === 'timer' 
                ? 'rgba(255, 107, 0, 0.3)' 
                : currentPreset.source === 'pattern'
                ? 'rgba(138, 43, 226, 0.3)'
                : 'rgba(0, 191, 255, 0.3)'}`,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
              <Chip 
                label={currentPreset.source === 'timer' ? '⏰' : currentPreset.source === 'pattern' ? '🌀' : '🎛️'}
                size="small"
                sx={{ 
                  fontSize: '0.7rem',
                  height: '20px',
                  background: 'transparent',
                  border: 'none'
                }}
              />
              <Typography variant="caption" color="text.primary" sx={{ fontWeight: 600 }}>
                {currentPreset.name}
              </Typography>
              {currentPreset.isActive && (
                <Chip 
                  label="ACTIVE"
                  size="small"
                  color="success"
                  sx={{ 
                    fontSize: '0.6rem',
                    height: '18px',
                    fontWeight: 700
                  }}
                />
              )}
            </Stack>
            {currentPreset.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  mt: 0.25,
                  fontSize: '0.7rem',
                  fontStyle: 'italic'
                }}
              >
                {currentPreset.description}
              </Typography>
            )}
          </Paper>
        )}

        {/* Waveform Selector - Controls oscillator waveform type */}
        {onWaveformChange && (
          <Box sx={{ mb: 0.75 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem', mb: 0.5, display: 'block', textAlign: 'center' }}>
              <GraphicEqIcon sx={{ fontSize: '0.8rem', mr: 0.5, verticalAlign: 'middle' }} />
              Oscillator Waveform
            </Typography>
            <ToggleButtonGroup
              value={waveform}
              exclusive
              onChange={(e)=>handleWaveformChange(e.target as HTMLButtonElement,waveform)}
              size="small"
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  fontSize: '0.6rem',
                  py: 0.3,
                  px: 0.5,
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(0, 191, 255, 0.3)',
                  '&.Mui-selected': {
                    bgcolor: '#00bfff',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#0099cc'
                    }
                  }
                }
              }}
            >
              <ToggleButton value="sine">Sine</ToggleButton>
              <ToggleButton value="square">Square</ToggleButton>
              <ToggleButton value="triangle">Triangle</ToggleButton>
              <ToggleButton value="sawtooth">Saw</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        <Stack spacing={0.75}>
          <Stack direction="row" spacing={0.5}>
            <Box flex={1}>
              <Paper
                elevation={0}
                sx={{
                  p: 0.5,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Typography variant="caption" align="center" display="block" gutterBottom>
                  LEFT EAR
                </Typography>
                <TextField
                  type="text"
                  value={leftInput}
                  onChange={(e) => handleLeftChange(parseFloat(e.target.value),)}
                  size="small"
                  fullWidth
                  inputProps={{ 
                    style: { textAlign: 'center', fontFamily: 'monospace' }
                  }}
                  sx={{
                    '& input': {
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }
                  }}
                />
                <Typography 
                  variant="caption" 
                  align="center" 
                  display="block" 
                  sx={{ mt: 0.5, color: 'text.secondary' }}
                >
                  Hz
                </Typography>
              </Paper>
            </Box>
            
            <Box flex={1}>
              <Paper
                elevation={0}
                sx={{
                  p: 0.5,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Typography variant="caption" align="center" display="block" gutterBottom>
                  RIGHT EAR
                </Typography>
                <TextField
                  type="text"
                  value={rightInput}
                  onChange={(e) => handleRightChange(e.target.value)}
                  size="small"
                  fullWidth
                  inputProps={{ 
                    style: { textAlign: 'center', fontFamily: 'monospace' }
                  }}
                  sx={{
                    '& input': {
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }
                  }}
                />
                <Typography 
                  variant="caption" 
                  align="center" 
                  display="block" 
                  sx={{ mt: 0.5, color: 'text.secondary' }}
                >
                  Hz
                </Typography>
              </Paper>
            </Box>
          </Stack>
          
          <Paper
            elevation={0}
            sx={{
              p: 1,
              textAlign: 'center',
              background: 'rgba(0, 191, 255, 0.1)',
              border: '1px solid rgba(0, 191, 255, 0.3)',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Binaural Beat Frequency
            </Typography>
            <Typography
              variant="h6"
              color="info"
              sx={{ fontFamily: 'monospace', fontWeight: 700 }}
            >
              {beat_frequency.toFixed(1)} Hz
            </Typography>
          </Paper>

          {/* Backend Values Display */}
          <Paper
            elevation={0}
            sx={{
              p: 0.75,
              background: 'rgba(138, 43, 226, 0.1)',
              border: '1px solid rgba(138, 43, 226, 0.3)',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Backend Values
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  Base Freq
                </Typography>
                <Typography
                  variant="body2"
                  color="secondary"
                  sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}
                >
                  {base_frequency.toFixed(2)} Hz
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  Beat Freq
                </Typography>
                <Typography
                  variant="body2"
                  color="secondary"
                  sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}
                >
                  {beat_frequency.toFixed(2)} Hz
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Electromagnetic Field Analyzer */}
          <Paper
            elevation={0}
            sx={{
              p: 0.75,
              background: 'rgba(0, 255, 136, 0.05)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              ⚡ Electromagnetic Field Analysis
            </Typography>
            <Grid container spacing={1}>
              <Grid size={6}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                  Field Strength
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={electromagneticStrength * 100}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#00ff88'
                    }
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#00ff88', fontWeight: 600 }}>
                  {(electromagneticStrength * 100).toFixed(0)}%
                </Typography>
              </Grid>

              <Grid size={6}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                  State
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#00ff88', fontWeight: 700 }}>
                  {electromagneticState}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          {/* Frequency Analyzer */}
          {visualizationData && (
            <Paper
              elevation={0}
              sx={{
                p: 0.75,
                background: 'rgba(255, 107, 0, 0.05)',
                border: '1px solid rgba(255, 107, 0, 0.3)',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                📊 Real-time Frequency Analysis
              </Typography>
              <Grid container spacing={1}>
                <Grid size={4}>
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                    SNR
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#ff6b00', fontWeight: 600 }}>
                    {visualizationData.signalQuality.snr.toFixed(1)} dB
                  </Typography>
                </Grid>
                <Grid size={4}>
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                    Clarity
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#ff6b00', fontWeight: 600 }}>
                    {(visualizationData.signalQuality.clarity * 100).toFixed(0)}%
                  </Typography>
                </Grid>
                <Grid size={4}>
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                    Quality
                  </Typography>
                  <Chip
                    label={stats.dataQuality.toUpperCase()}
                    size="small"
                    sx={{
                      fontSize: '0.55rem',
                      height: '16px',
                      backgroundColor:
                        stats.dataQuality === 'excellent' ? 'rgba(76, 175, 80, 0.2)' :
                        stats.dataQuality === 'good' ? 'rgba(255, 193, 7, 0.2)' :
                        stats.dataQuality === 'fair' ? 'rgba(255, 152, 0, 0.2)' :
                        'rgba(244, 67, 54, 0.2)',
                      color:
                        stats.dataQuality === 'excellent' ? '#4caf50' :
                        stats.dataQuality === 'good' ? '#ffc107' :
                        stats.dataQuality === 'fair' ? '#ff9800' :
                        '#f44336',
                    }}
                  />
                </Grid>
              </Grid>
              {visualizationData.peakFrequencies.length > 0 && (
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                    Detected Peaks: {visualizationData.peakFrequencies.slice(0, 2).map(p => `${p.frequency.toFixed(1)}Hz`).join(', ')}
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          <Stack direction="row" spacing={0.5} justifyContent="center">
            <IconButton
              onClick={handleReset}
              color="default"
              size="small"
              sx={{
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.05)',
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={0.5} justifyContent="center">
            <Chip label={`Viz: ${stats.averageFps} FPS`} size="small" sx={{ fontSize: '0.65rem' }} />
            <Chip
              label={isVisualizing ? 'ANALYZING' : 'READY'}
              color={isVisualizing ? 'success' : 'default'}
              size="small"
              sx={{ fontSize: '0.65rem' }}
            />
          </Stack>
          <Stack direction="row" spacing={0.5} justifyContent="center">
           <MainControlsMUI
               isPlaying={isPlaying}
               volume={volume}
               onVolumeChange={onVolumeChange}
               onPlay={onPlay}
               onStop={onStop}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default BinauralGeneratorMUI;