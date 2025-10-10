// Electromagnetic Beat Lab - Equalizer Component
// Professional multi-band audio equalizer with Material-UI interface
// FIXED: Hooks order violation - all hooks now at top level

import React, { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Tooltip
} from '@mui/material';
import { useEqualizer, EQ_PRESETS } from '../hooks/useEqualizer';
import type { EqualizerBand } from '../types';

// Simple Frequency Visualizer Component
const SimpleFrequencyVisualizer: React.FC<{ 
  audioContext: AudioContext | null; 
  analyserNode: AnalyserNode | null;
  isPlaying?: boolean;
}> = ({ audioContext, analyserNode, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!analyserNode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArray);

      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        
        // Create gradient colors
        const r = barHeight + 25 * (i / bufferLength);
        const g = 250 * (i / bufferLength);
        const b = 250;
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyserNode]);

  return (
    <Box sx={{ width: '100%', height: '100%', bgcolor: 'black', borderRadius: 1 }}>
      <canvas 
        ref={canvasRef}
        width={400}
        height={100}
        style={{ width: '100%', height: '100%', borderRadius: '4px' }}
      />
    </Box>
  );
};

interface EqualizerMUIProps {
  audioContext: AudioContext | null;
  analyserNode?: AnalyserNode | null;
  isPlaying?: boolean;
  onEqualizerChange?: (inputNode: GainNode | null, outputNode: GainNode | null) => void;
}

const EqualizerMUI: React.FC<EqualizerMUIProps> = ({
  audioContext,
  analyserNode,
  isPlaying = false,
  onEqualizerChange
}) => {
  // ALL HOOKS MUST BE AT THE TOP - NO CONDITIONALS BEFORE THIS
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Call useEqualizer hook UNCONDITIONALLY at top level
  const {
    equalizerState,
    initializeEqualizer,
    updateBandGain,
    loadPreset,
    resetEqualizer,
    toggleEqualizer,
    inputNode,
    outputNode
  } = useEqualizer(audioContext);

  // Initialize equalizer when audio context is ready
  useEffect(() => {
    if (audioContext && !isInitialized) {
      console.log('🎚️ Initializing equalizer with audio context');
      const nodes = initializeEqualizer();
      if (nodes) {
        setIsInitialized(true);
        if (onEqualizerChange) {
          onEqualizerChange(nodes.input, nodes.output);
        }
      }
    }
  }, [audioContext, isInitialized, initializeEqualizer, onEqualizerChange]);

  // Handle toggle
  const handleToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    toggleEqualizer(enabled);

    if (enabled && !inputNode) {
      // Initialize equalizer
      const nodes = initializeEqualizer();
      if (nodes && onEqualizerChange) {
        onEqualizerChange(nodes.input, nodes.output);
      }
    } else if (!enabled && onEqualizerChange) {
      // Bypass equalizer
      onEqualizerChange(null, null);
    }
  }, [toggleEqualizer, inputNode, initializeEqualizer, onEqualizerChange]);

  // Handle preset selection
  const handlePresetClick = useCallback((presetName: keyof typeof EQ_PRESETS) => {
    if (!equalizerState.enabled) {
      toggleEqualizer(true);
      const nodes = initializeEqualizer();
      if (nodes && onEqualizerChange) {
        onEqualizerChange(nodes.input, nodes.output);
      }
    }
    loadPreset(presetName);
  }, [equalizerState.enabled, toggleEqualizer, initializeEqualizer, loadPreset, onEqualizerChange]);

  // Handle band gain change with proper typing
  const handleBandChange = useCallback((bandId: string) => (
    _event: Event,
    value: number | number[]
  ) => {
    const gainValue = Array.isArray(value) ? value[0] : value;
    updateBandGain(bandId, gainValue);
  }, [updateBandGain]);

  // Helper function to get slider color
  const getSliderColor = useCallback((gain: number) => {
    if (gain > 0) return '#00ff88';
    if (gain < 0) return '#ff6b6b';
    return '#888';
  }, []);

  // Render vertical slider for each band - ULTRA COMPACT
  const renderBandSlider = useCallback((band: EqualizerBand) => {
    return (
      <Box
        key={band.id}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '28px', // Ultra compact width
          mx: '1px' // Minimal margin between sliders
        }}
      >
        {/* Gain value display */}
        <Typography
          sx={{
            fontSize: '0.55rem',
            color: getSliderColor(band.gain),
            fontWeight: 'bold',
            mb: 0.25,
            height: '14px'
          }}
        >
          {band.gain >= 0 ? '+' : ''}{band.gain.toFixed(0)}
        </Typography>

        {/* Vertical slider */}
        <Slider
          orientation="vertical"
          value={band.gain}
          onChange={handleBandChange(band.id)}
          min={-40}
          max={40}
          step={1}
          disabled={!equalizerState.enabled}
          sx={{
            height: 100, // Reduced height
            '& .MuiSlider-thumb': {
              width: 10,
              height: 10,
              bgcolor: getSliderColor(band.gain),
              border: '1px solid white',
              '&:hover': {
                boxShadow: `0 0 0 4px rgba(${band.gain > 0 ? '0, 255, 136' : '255, 107, 107'}, 0.16)`
              }
            },
            '& .MuiSlider-track': {
              width: 2,
              bgcolor: getSliderColor(band.gain),
              border: 'none'
            },
            '& .MuiSlider-rail': {
              width: 2,
              bgcolor: 'rgba(255, 255, 255, 0.2)'
            }
          }}
        />

        {/* Frequency label */}
        <Typography
          sx={{
            fontSize: '0.5rem',
            color: 'rgba(255, 255, 255, 0.5)',
            mt: 0.25
          }}
        >
          {band.label}
        </Typography>
      </Box>
    );
  }, [equalizerState.enabled, handleBandChange, getSliderColor]);

  // Memoize preset buttons
  const presetButtons = useMemo(() => {
    return Object.entries(EQ_PRESETS).map(([key, preset]) => (
      <Tooltip key={key} title={preset.description} arrow placement="top">
        <Button
          variant={equalizerState.preset === key ? 'contained' : 'outlined'}
          size="small"
          onClick={() => handlePresetClick(key as keyof typeof EQ_PRESETS)}
          sx={{
            fontSize: '0.5rem',
            py: 0.25,
            px: 0.5,
            minWidth: 'unset',
            color: equalizerState.preset === key ? 'white' : '#00bfff',
            borderColor: '#00bfff',
            bgcolor: equalizerState.preset === key ? '#00bfff' : 'transparent',
            '&:hover': {
              bgcolor: equalizerState.preset === key ? '#0099cc' : 'rgba(0, 191, 255, 0.1)'
            }
          }}
        >
          {preset.name}
        </Button>
      </Tooltip>
    ));
  }, [equalizerState.preset, handlePresetClick]);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 1,
        bgcolor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Header with controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={equalizerState.enabled}
                onChange={handleToggle}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#00ff88'
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    bgcolor: '#00ff88'
                  }
                }}
              />
            }
            label={
              <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
                EQ {equalizerState.enabled ? 'ON' : 'OFF'}
              </Typography>
            }
            sx={{ m: 0 }}
          />
          
          {equalizerState.preset !== 'flat' && (
            <Chip
              label={equalizerState.preset === 'custom' ? 'Custom' : EQ_PRESETS[equalizerState.preset as keyof typeof EQ_PRESETS]?.name}
              size="small"
              sx={{
                bgcolor: equalizerState.preset === 'custom' ? '#ff6b00' : '#00bfff',
                color: 'white',
                height: '18px',
                fontSize: '0.6rem'
              }}
            />
          )}
        </Box>

        <Button
          onClick={resetEqualizer}
          disabled={!equalizerState.enabled}
          size="small"
          variant="outlined"
          sx={{
            fontSize: '0.6rem',
            color: '#ff6b00',
            borderColor: '#ff6b00',
            py: 0.25,
            px: 0.5
          }}
        >
          Reset
        </Button>
      </Box>

      {/* Main content row - Sliders and Visualizer on same row */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch' }}>
        
        {/* Frequency sliders - Ultra compact */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: 0, // No gap between sliders
            p: 0.5,
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 1,
            flex: '0 0 auto'
          }}
        >
          {equalizerState.bands.map(band => renderBandSlider(band))}
        </Box>

        {/* Right side - Presets and Visualizer stacked */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1, 
          flex: 1,
          minWidth: '250px'
        }}>
          
          {/* Presets grid - 2 rows */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: 0.5
          }}>
            {presetButtons}
          </Box>

          {/* Frequency Visualizer */}
          {audioContext && analyserNode && (
            <Box sx={{ 
              flex: 1, 
              minHeight: '80px',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: 1,
              p: 0.5
            }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)', 
                  fontSize: '0.6rem',
                  display: 'block',
                  mb: 0.5
                }}
              >
                Live Frequency Spectrum {isPlaying ? '(Active)' : '(Idle)'}
              </Typography>
              <SimpleFrequencyVisualizer 
                audioContext={audioContext}
                analyserNode={analyserNode}
                isPlaying={isPlaying}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default EqualizerMUI;