// Electromagnetic Beat Lab - Equalizer Component
// Professional multi-band audio equalizer with Material-UI interface
// FIXED: Proper fullscreen functionality for EQ and visualizer

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
  Tooltip,
  IconButton,
  Dialog
} from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { useEqualizer, EQ_PRESETS } from '../hooks/useEqualizer';
import type { EqualizerBand } from '../types';

// Simple Frequency Visualizer Component
const SimpleFrequencyVisualizer: React.FC<{ 
  audioContext: AudioContext | null; 
  analyserNode: AnalyserNode | null;
  isPlaying?: boolean;
  height?: number;
}> = ({ audioContext, analyserNode, isPlaying, height = 100 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  //const animationRef = useRef<number>();

  useEffect(() => {
    if (!analyserNode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

  //   const draw = () => {
  //     animationRef.current = requestAnimationFrame(draw);
  //     analyserNode.getByteFrequencyData(dataArray);
  //
  //     // Clear canvas with fade effect
  //     ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  //     ctx.fillRect(0, 0, canvas.width, canvas.height);
  //
  //     const barWidth = (canvas.width / bufferLength) * 2.5;
  //     let x = 0;
  //
  //     for (let i = 0; i < bufferLength; i++) {
  //       const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
  //
  //       // Create gradient colors
  //       const r = barHeight + 25 * (i / bufferLength);
  //       const g = 250 * (i / bufferLength);
  //       const b = 250;
  //
  //       ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  //       ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
  //
  //       x += barWidth + 1;
  //     }
  //   };
  //
  //   draw();
  //
  //   return () => {
  //     if (animationRef.current) {
  //       cancelAnimationFrame(animationRef.current);
  //     }
  //   };
  // }, [analyserNode]);

  return (
    <Box sx={{ width: '100%', height: '100%', bgcolor: 'black', borderRadius: 1 }}>
      <canvas 
        ref={canvasRef}
        // width={800}
        // height={height * 2}
        // style={{ width: '100%', height: '100%', borderRadius: '4px' }}
      />
    </Box>
  );
};

interface EqualizerMUIProps {
  audioContext?: AudioContext | null;
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
  const [visualizerFullscreen, setVisualizerFullscreen] = useState(false);
  const [eqFullscreen, setEqFullscreen] = useState(false);

  // Use ref to track initialization (doesn't cause re-renders)
  const initializedRef = useRef(false);

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

  // Track if we showed the "needs audio" warning
  const [showAudioWarning, setShowAudioWarning] = useState(!audioContext);

  // Initialize equalizer when audio context is ready
  useEffect(() => {
    if (audioContext && !initializedRef.current) {
      setShowAudioWarning(false);

      console.log('🎚️ Initializing equalizer with audio context');
      const nodes = initializeEqualizer();
      audioContext.resume();
      if (nodes) {
        initializedRef.current = true;
        setIsInitialized(true);
        if (onEqualizerChange) {
          onEqualizerChange(nodes.input, nodes.output);
        }
      }
    } else if (audioContext) {
      setShowAudioWarning(false);
    }
  }, [audioContext]);

  // Handle toggle
  const handleToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    toggleEqualizer(enabled);

    if (enabled && !inputNode) {
      const nodes = initializeEqualizer();
      if (nodes && onEqualizerChange) {
        onEqualizerChange(nodes.input, nodes.output);
      }
    } else if (!enabled && onEqualizerChange) {
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

  // Handle band gain change
  const handleBandChange = useCallback((bandId: string) => (
    _event: Event | React.SyntheticEvent,
    value: number | number[]
  ) => {
    const gainValue = Array.isArray(value) ? value[0] : value;
    console.log(`🎚️ EQ Slider moved - Band: ${bandId}, New Value: ${gainValue}dB`);
    updateBandGain(bandId, gainValue);
  }, [updateBandGain]);

  // Helper function to get slider color
  const getSliderColor = useCallback((gain: number) => {
    if (gain > 0) return '#00ff88';
    if (gain < 0) return '#ff6b6b';
    return '#888';
  }, []);

  // Render vertical slider for each band
  const renderBandSlider = useCallback((band: EqualizerBand) => {
    const sliderHeight = eqFullscreen ? 400 : 220;
    const thumbSize = eqFullscreen ? 16 : 10;
    
    return (
      <Box
        key={band.id}
        sx={
          {height: '400',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: eqFullscreen ? '50px' : '32px',
          mx: eqFullscreen ? 1 : '2px'
        }}
      >
        {/* Gain value display */}
        <Typography
          sx={{
            fontSize: eqFullscreen ? '0.75rem' : '0.55rem',
            color: getSliderColor(band.gain),
            fontWeight: 'bold',
            mb: 0.25,
            height: eqFullscreen ? '20px' : '14px'
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
            height: sliderHeight,
            pointerEvents: equalizerState.enabled ? 'auto' : 'none',
            userSelect: 'none',
            touchAction: 'none',
            '& .MuiSlider-thumb': {
              width: thumbSize,
              height: thumbSize,
              bgcolor: getSliderColor(band.gain),
              border: '1px solid white',
              pointerEvents: equalizerState.enabled ? 'auto' : 'none',
              cursor: equalizerState.enabled ? 'pointer' : 'not-allowed',
              '&:hover': {
                boxShadow: `0 0 0 ${eqFullscreen ? 6 : 4}px rgba(${band.gain > 0 ? '0, 255, 136' : '255, 107, 107'}, 0.16)`
              }
            },
            '& .MuiSlider-track': {
              width: eqFullscreen ? 3 : 2,
              bgcolor: getSliderColor(band.gain),
              border: 'none',
              pointerEvents: 'none'
            },
            '& .MuiSlider-rail': {
              width: eqFullscreen ? 3 : 2,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              pointerEvents: 'none'
            }
          }}
        />

        {/* Frequency label */}
        <Typography
          sx={{
            fontSize: eqFullscreen ? '0.65rem' : '0.5rem',
            color: 'rgba(255, 255, 255, 0.5)',
            mt: 0.25
          }}
        >
          {band.label}
        </Typography>
      </Box>
    );
  }, [equalizerState.enabled, handleBandChange, getSliderColor, eqFullscreen]);

  // Memoize preset buttons
  const presetButtons = useMemo(() => {
    return Object.entries(EQ_PRESETS).map(([key, preset]) => (
      <Tooltip key={key} title={preset.description} arrow placement="top">
        <Button
          variant={equalizerState.preset === key ? 'contained' : 'outlined'}
          size="small"
          onClick={() => handlePresetClick(key as keyof typeof EQ_PRESETS)}
          sx={{
            fontSize: eqFullscreen ? '0.65rem' : '0.5rem',
            py: eqFullscreen ? 0.5 : 0.25,
            px: eqFullscreen ? 1 : 0.5,
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
  }, [equalizerState.preset, handlePresetClick, eqFullscreen]);

  const eqContent = (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
        wrap: "wrap",
        overflow: "scroll",
        width: '40%'
    }}>
      {/* Audio Context Warning Overlay */}
      {showAudioWarning && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(5px)',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            gap: 2,
            p: 3
          }}
        >
          <Typography variant="h6" sx={{ color: '#ff6b00', fontWeight: 'bold', textAlign: 'center' }}>
            🎵 Audio Not Initialized
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', maxWidth: '400px' }}>
            Click the <strong style={{ color: '#00ff88' }}>Play ▶️</strong> button in the Master Controls section to initialize audio, then the EQ will become available.
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', fontStyle: 'italic' }}>
            (Browser security requires user interaction to enable audio)
          </Typography>
        </Box>
      )}

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
              <Typography variant="caption" sx={{ color: 'white', fontSize: eqFullscreen ? '0.85rem' : '0.7rem' }}>
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
                height: eqFullscreen ? '22px' : '18px',
                fontSize: eqFullscreen ? '0.7rem' : '0.6rem'
              }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            onClick={resetEqualizer}
            disabled={!equalizerState.enabled}
            size="small"
            variant="outlined"
            sx={{
              fontSize: eqFullscreen ? '0.7rem' : '0.6rem',
              color: '#ff6b00',
              borderColor: '#ff6b00',
              py: eqFullscreen ? 0.5 : 0.25,
              px: eqFullscreen ? 1 : 0.5
            }}
          >
            Reset
          </Button>
          
          {!eqFullscreen && (
            <IconButton
              size="small"
              onClick={() => setEqFullscreen(true)}
              sx={{
                color: 'white',
                p: 0.25,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
              title="Fullscreen EQ"
            >
              <FullscreenIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Main content - Sliders and Visualizer */}
      <Box sx={{ 
        display: 'flex', 
        gap: eqFullscreen ? 3 : 1, 
        alignItems: 'stretch',
        flex: 1,
        minHeight: 0
      }}>
        
        {/* Frequency sliders */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: eqFullscreen ? 0.5 : 0,
            p: eqFullscreen ? 2 : 0.5,
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 1,
            flex: '0 0 auto',
            overflowX: 'auto',
            overflowY: 'hidden',
            maxWidth: '100%',
            '&::-webkit-scrollbar': {
              height: '6px'
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '3px'
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '3px',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.5)'
              }
            }
          }}
        >
          {equalizerState.bands.map(band => renderBandSlider(band))}
        </Box>

        {/* Right side - Presets and Visualizer */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: eqFullscreen ? 2 : 1, 
          flex: 1,
          minWidth: eqFullscreen ? '400px' : '250px',
          minHeight: 0
        }}>
          
          {/* Presets grid */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: eqFullscreen ? 'repeat(4, 1fr)' : 'repeat(4, 1fr)', 
            gap: eqFullscreen ? 1 : 0.5
          }}>
            {presetButtons}
          </Box>

          {/* Frequency Visualizer */}
          {audioContext && analyserNode && (
            <Box sx={{
              flex: 1,
              minHeight: visualizerFullscreen ? (eqFullscreen ? '500px' : '300px') : (eqFullscreen ? '200px' : '80px'),
              maxHeight: visualizerFullscreen ? '90vh' : 'auto',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: 1,
              p: eqFullscreen ? 1 : 0.5,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: eqFullscreen ? '0.75rem' : '0.6rem'
                  }}
                >
                  Live Frequency Spectrum {isPlaying ? '(Active)' : '(Idle)'}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setVisualizerFullscreen(!visualizerFullscreen)}
                  sx={{
                    color: 'white',
                    p: 0.25,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  title={visualizerFullscreen ? 'Exit visualizer fullscreen' : 'Visualizer fullscreen'}
                >
                  {visualizerFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <SimpleFrequencyVisualizer
                  audioContext={audioContext}
                  analyserNode={analyserNode}
                  isPlaying={isPlaying}
                  height={visualizerFullscreen ? (eqFullscreen ? 500 : 300) : (eqFullscreen ? 200 : 100)}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  // Fullscreen Dialog
  if (eqFullscreen) {
    return (
      <Dialog
        open={eqFullscreen}
        onClose={() => setEqFullscreen(false)}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            width: '95vw',
            height: '95vh',
            maxWidth: '95vw',
            maxHeight: '95vh',
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            p: 2
          }
        }}
      >
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative'
        }}>
          <IconButton
            onClick={() => setEqFullscreen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              zIndex: 1,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
            title="Exit fullscreen"
          >
            <FullscreenExitIcon />
          </IconButton>
          {eqContent}
        </Box>
      </Dialog>
    );
  }

  // Normal view
  return (
    <Paper
      elevation={3}
      sx={{
        p: 1,
        bgcolor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative'
      }}
    >
      {eqContent}
    </Paper>
  );
};

export default EqualizerMUI;