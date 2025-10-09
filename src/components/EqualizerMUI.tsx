// Electromagnetic Beat Lab - Equalizer Component
// Professional multi-band audio equalizer with Material-UI interface

import React, { useEffect, useCallback, useMemo } from 'react';
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

interface EqualizerMUIProps {
  audioContext: AudioContext | null;
  onEqualizerChange?: (inputNode: GainNode | null, outputNode: GainNode | null) => void;
}

const EqualizerMUI: React.FC<EqualizerMUIProps> = ({
  audioContext,
  onEqualizerChange
}) => {
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

  // Initialize equalizer when enabled
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

  // Auto-initialize and enable equalizer on mount
  useEffect(() => {
    if (audioContext && !inputNode) {
      console.log('🎚️ Auto-initializing equalizer on mount');
      const nodes = initializeEqualizer();
      if (nodes && onEqualizerChange) {
        console.log('🎚️ Calling onEqualizerChange with nodes:', nodes);
        onEqualizerChange(nodes.input, nodes.output);
      }
    }
  }, [audioContext, initializeEqualizer, onEqualizerChange, inputNode]);

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

  // Handle band gain change
  const handleBandChange = useCallback((bandId: string) => (
    _event: Event,
    value: number | number[]
  ) => {
    updateBandGain(bandId, value as number);
  }, [updateBandGain]);

  // Render vertical slider for each band
  const renderBandSlider = useCallback((band: EqualizerBand) => {
    // Calculate color based on gain (green for boost, red for cut)
    const getSliderColor = (gain: number) => {
      if (gain > 0) return '#00ff88'; // Green for boost
      if (gain < 0) return '#ff6b6b'; // Red for cut
      return '#888'; // Gray for neutral
    };

    return (
      <Box
        key={band.id}
        sx={{
          display: 'flex',
          overflow: "auto",
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: '40px'  // Reduced from 50px
        }}
      >
        {/* Gain value display */}
        <Chip
          label={`${band.gain >= 0 ? '+' : ''}${band.gain.toFixed(1)}`}
          size="small"
          sx={{
            mb: 0.5,  // Reduced from 1
            fontSize: '0.65rem',  // Reduced from 0.7rem
            height: '18px',  // Reduced from 20px
            bgcolor: getSliderColor(band.gain),
            color: 'white',
            fontWeight: 'bold'
          }}
        />

        {/* Vertical slider */}
        <Slider
          orientation="vertical"
          value={band.gain}
          onChange={handleBandChange(band.id)}
          min={-40}
          max={40}
          step={0.5}
          disabled={!equalizerState.enabled}
          sx={{
            height: 150,  // Reduced from 200
            '& .MuiSlider-thumb': {
              width: 16,
              height: 16,
              bgcolor: getSliderColor(band.gain),
              border: '2px solid white',
              '&:hover, &.Mui-focusVisible': {
                boxShadow: `0 0 0 8px rgba(${band.gain > 0 ? '0, 255, 136' : '255, 107, 107'}, 0.16)`
              }
            },
            '& .MuiSlider-track': {
              bgcolor: getSliderColor(band.gain),
              border: 'none'
            },
            '& .MuiSlider-rail': {
              bgcolor: 'rgba(255, 255, 255, 0.2)'
            }
          }}
        />

        {/* Frequency label */}
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,  // Reduced from 1
            fontSize: '0.65rem',  // Reduced from 0.7rem
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center'
          }}
        >
          {band.label}
        </Typography>
      </Box>
    );
  }, [equalizerState.enabled, handleBandChange]);

  // Memoize preset buttons - optimized for vertical layout
  const presetButtons = useMemo(() => {
    return Object.entries(EQ_PRESETS).map(([key, preset]) => (
      <Tooltip key={key} title={preset.description} arrow placement="right">
        <Button
          variant={equalizerState.preset === key ? 'contained' : 'outlined'}
          size="small"
          fullWidth
          onClick={() => handlePresetClick(key as keyof typeof EQ_PRESETS)}
          sx={{
            fontSize: '0.55rem',
            py: 0.25,
            px: 0.5,
            minWidth: 'unset',
            color: equalizerState.preset === key ? 'white' : '#00bfff',
            borderColor: '#00bfff',
            bgcolor: equalizerState.preset === key ? '#00bfff' : 'transparent',
            '&:hover': {
              bgcolor: equalizerState.preset === key ? '#0099cc' : 'rgba(0, 191, 255, 0.1)',
              borderColor: '#00bfff'
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
        p: 0.5,
        bgcolor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'auto'
      }}
    >
      {/* Main Layout: Presets on left (vertical), Sliders on right */}
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>

        {/* Left Column: Presets & Controls */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
          minWidth: '90px',
          maxWidth: '110px'
        }}>
          {/* Enable/Disable Switch */}
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
              <Typography variant="caption" sx={{ color: 'white', fontSize: '0.6rem' }}>
                {equalizerState.enabled ? 'ON' : 'OFF'}
              </Typography>
            }
            sx={{ m: 0, mb: 0.25 }}
          />

          {/* Reset Button */}
          <Button
            onClick={resetEqualizer}
            disabled={!equalizerState.enabled}
            size="small"
            variant="outlined"
            sx={{
              minWidth: '70px',
              fontSize: '0.55rem',
              color: '#ff6b00',
              borderColor: '#ff6b00',
              py: 0.25,
              '&:hover': {
                bgcolor: 'rgba(255, 107, 0, 0.1)',
                borderColor: '#ff6b00'
              }
            }}
          >
            🔄 Reset
          </Button>

          {/* Current Preset Chip */}
          {equalizerState.preset !== 'flat' && (
            <Chip
              label={EQ_PRESETS[equalizerState.preset as keyof typeof EQ_PRESETS]?.name || 'Custom'}
              size="small"
              sx={{
                bgcolor: equalizerState.preset === 'custom' ? '#ff6b00' : '#00bfff',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.55rem',
                height: '16px'
              }}
            />
          )}

          {/* Preset Buttons - Vertical Stack */}
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.55rem', mt: 0.5 }}>
            Presets:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            {presetButtons}
          </Box>
        </Box>

        {/* Right Column: Frequency Sliders */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 0.15,  // Ultra-tight spacing
            p: 0.5,
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 1,
            overflowX: 'auto',
            flex: 1
          }}
        >
          {equalizerState.bands.map(band => renderBandSlider(band))}
        </Box>
      </Box>
    </Paper>
  );
};

export default EqualizerMUI;