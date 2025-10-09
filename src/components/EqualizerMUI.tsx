// Electromagnetic Beat Lab - Equalizer Component
// Professional multi-band audio equalizer with Material-UI interface

import React, { useEffect,useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  Button,
  ButtonGroup,
  Switch,
  FormControlLabel,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import { useEqualizer, EQ_PRESETS, type EqualizerBand } from '../hooks/useEqualizer';

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


    useEffect(() => {
        initializeEqualizer();
    }, []);

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
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: '60px'
        }}
      >
        {/* Gain value display */}
        <Chip
          label={`${band.gain >= 0 ? '+' : ''}${band.gain.toFixed(1)}`}
          size="small"
          sx={{
            mb: 1,
            fontSize: '0.7rem',
            height: '20px',
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
            height: 200,
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
            mt: 1,
            fontSize: '0.7rem',
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center'
          }}
        >
          {band.label}
        </Typography>
      </Box>
    );
  }, [equalizerState.enabled, handleBandChange]);

  // Memoize preset buttons
  const presetButtons = useMemo(() => {
    return Object.entries(EQ_PRESETS).map(([key, preset]) => (
      <Tooltip key={key} title={preset.description} arrow>
        <Button
          variant={equalizerState.preset === key ? 'contained' : 'outlined'}
          size="small"
          onClick={() => handlePresetClick(key as keyof typeof EQ_PRESETS)}
          sx={{
            minWidth: '80px',
            fontSize: '0.7rem',
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
        p: 2,
        bgcolor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          🎚️ Equalizer
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={equalizerState.enabled}
                onChange={handleToggle}
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
              <Typography variant="body2" sx={{ color: 'white' }}>
                {equalizerState.enabled ? 'Enabled' : 'Disabled'}
              </Typography>
            }
          />

          <Tooltip title="Reset all bands to 0 dB" arrow>
            <IconButton
              onClick={resetEqualizer}
              disabled={!equalizerState.enabled}
              size="small"
              sx={{
                color: '#ff6b00',
                '&:hover': { bgcolor: 'rgba(255, 107, 0, 0.1)' }
              }}
            >
              🔄
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Preset Buttons */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1, display: 'block' }}>
          Presets:
        </Typography>
        <ButtonGroup size="small" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          {presetButtons}
        </ButtonGroup>
      </Box>

      {/* Current Preset Display */}
      {equalizerState.preset !== 'flat' && (
        <Box sx={{ mb: 2 }}>
          <Chip
            label={`Active: ${EQ_PRESETS[equalizerState.preset as keyof typeof EQ_PRESETS]?.name || 'Custom'}`}
            size="small"
            sx={{
              bgcolor: equalizerState.preset === 'custom' ? '#ff6b00' : '#00bfff',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Box>
      )}

      {/* Band Sliders */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 1,
          p: 2,
          bgcolor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: 1,
          overflowX: 'auto'
        }}
      >
        {equalizerState.bands.map(band => renderBandSlider(band))}
      </Box>

      {/* Info */}
      <Typography
        variant="caption"
        sx={{
          mt: 2,
          display: 'block',
          color: 'rgba(255, 255, 255, 0.5)',
          textAlign: 'center'
        }}
      >
        Adjust frequency bands to shape your audio. Range: -40 dB to +40 dB
      </Typography>
    </Paper>
  );
};

export default EqualizerMUI;