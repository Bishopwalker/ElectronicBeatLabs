import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, LinearProgress, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useBinauralVisualization } from '../hooks/useBinauralVisualization';
import type { BinauralBeatConfig } from '../types';

interface FrequencyVisualizerProps {
  config?: BinauralBeatConfig;
  title?: string;
  showSpectrum?: boolean;
  showFrequencies?: boolean;
  showMetrics?: boolean;
  height?: number;
  width?: number;
  autoStart?: boolean;
}

const VisualizerContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(2),
  minHeight: '300px',
}));

const CanvasContainer = styled(Box)({
  position: 'relative',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  overflow: 'hidden',
  background: 'radial-gradient(circle at center, rgba(0, 200, 255, 0.1) 0%, transparent 70%)',
});

const FrequencyDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1),
  background: 'rgba(0, 0, 0, 0.3)',
  borderRadius: theme.spacing(1),
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const MetricChip = styled(Chip)<{ quality: string }>(({ quality }) => ({
  backgroundColor: 
    quality === 'excellent' ? 'rgba(76, 175, 80, 0.2)' :
    quality === 'good' ? 'rgba(255, 193, 7, 0.2)' :
    quality === 'fair' ? 'rgba(255, 152, 0, 0.2)' : 
    'rgba(244, 67, 54, 0.2)',
  color: 
    quality === 'excellent' ? '#4caf50' :
    quality === 'good' ? '#ffc107' :
    quality === 'fair' ? '#ff9800' : 
    '#f44336',
  border: `1px solid ${
    quality === 'excellent' ? '#4caf50' :
    quality === 'good' ? '#ffc107' :
    quality === 'fair' ? '#ff9800' : 
    '#f44336'
  }`,
}));

export const FrequencyVisualizer: React.FC<FrequencyVisualizerProps> = ({
  config,
  title = 'Binaural Beat Frequency Visualizer',
  showSpectrum = true,
  showFrequencies = true,
  showMetrics = true,
  height = 200,
  width = 800,
  autoStart = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    visualizationData,
    stats,
    audioState,
    createBinauralBeats,
    stopBinauralBeats,
    isPlaying,
    isSupported
  } = useBinauralVisualization({ enabled: true, updateRate: 60 });
  const [animationId, setAnimationId] = useState<number | null>(null);

  // Main visualization drawing function
  const drawVisualization = React.useCallback(() => {
    if (!canvasRef.current || !visualizationData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(10, 10, 30, 0.9)');
    gradient.addColorStop(1, 'rgba(5, 5, 15, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    if (showSpectrum && visualizationData.spectrumData) {
      drawFrequencySpectrum(ctx, visualizationData.spectrumData);
    }

    if (visualizationData.peakFrequencies?.length > 0) {
      drawPeakMarkers(ctx, visualizationData.peakFrequencies);
    }

    // Draw target frequency indicators
    if (visualizationData.targetFrequencies) {
      drawFrequencyIndicators(ctx, visualizationData.targetFrequencies);
    }
  }, [visualizationData, width, height, showSpectrum]);

  // Draw frequency spectrum bars
  const drawFrequencySpectrum = (ctx: CanvasRenderingContext2D, spectrumData: number[]) => {
    const barWidth = width / spectrumData.length;
    const maxHeight = height * 0.8;

    for (let i = 0; i < spectrumData.length; i++) {
      const barHeight = (spectrumData[i] / 255) * maxHeight;
      const hue = (i / spectrumData.length) * 300; // Blue to green spectrum
      
      ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
    }
  };

  // Draw peak frequency markers
  const drawPeakMarkers = (ctx: CanvasRenderingContext2D, peaks: { frequency: number; amplitude: number }[]) => {
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.font = '12px Arial';
    ctx.fillStyle = '#ff6b6b';

    peaks.slice(0, 5).forEach((peak) => {
      // Convert frequency to x position (assuming 0-1000 Hz range)
      const xPos = (peak.frequency / 1000) * width;
      const yPos = height - (peak.amplitude / 255) * height * 0.8;

      // Draw vertical line
      ctx.beginPath();
      ctx.moveTo(xPos, height);
      ctx.lineTo(xPos, yPos);
      ctx.stroke();

      // Draw frequency label
      ctx.fillText(`${peak.frequency}Hz`, xPos + 5, yPos - 5);
    });
  };

  // Draw target frequency indicators
  const drawFrequencyIndicators = (ctx: CanvasRenderingContext2D, targets: { left: number; right: number }) => {
    const leftX = (targets.left / 1000) * width;
    const rightX = (targets.right / 1000) * width;

    // Left frequency indicator (blue)
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(leftX, 0);
    ctx.lineTo(leftX, height);
    ctx.stroke();

    // Right frequency indicator (orange)
    ctx.strokeStyle = '#ff9500';
    ctx.beginPath();
    ctx.moveTo(rightX, 0);
    ctx.lineTo(rightX, height);
    ctx.stroke();

    ctx.setLineDash([]);
  };

  // Auto-start binaural beats if config provided
  useEffect(() => {
    if (autoStart && config && isSupported && !isPlaying) {
      console.log('🎵 FrequencyVisualizer: Auto-starting with config:', config);
      createBinauralBeats(config);
    }
  }, [autoStart, config, isSupported, isPlaying, createBinauralBeats]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      drawVisualization();
      const id = requestAnimationFrame(animate);
      setAnimationId(id);
    };

    if (visualizationData) {
      animate();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [drawVisualization, visualizationData]);

  return (
    <VisualizerContainer elevation={3}>
      <Typography variant="h6" gutterBottom sx={{ color: '#fff', textAlign: 'center' }}>
        {title}
      </Typography>

      <Grid container spacing={2}>
        {/* Frequency Display */}
        {showFrequencies && visualizationData && (
          <Grid size={12}>
            <FrequencyDisplay>
              <Box>
                <Typography variant="body2" sx={{ color: '#00d4ff' }}>
                  Left: {visualizationData.targetFrequencies?.left || 0}Hz
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(0, 212, 255, 0.7)' }}>
                  Detected: {visualizationData.actualDetectedFrequencies?.left || 'N/A'}Hz
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#fff' }}>
                  {visualizationData.currentBeatFreq.toFixed(1)}Hz
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Binaural Beat
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ color: '#ff9500' }}>
                  Right: {visualizationData.targetFrequencies?.right || 0}Hz
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 149, 0, 0.7)' }}>
                  Detected: {visualizationData.actualDetectedFrequencies?.right || 'N/A'}Hz
                </Typography>
              </Box>
            </FrequencyDisplay>
          </Grid>
        )}

        {/* Spectrum Canvas */}
        {showSpectrum && (
          <Grid size={12}>
            <CanvasContainer>
              <canvas
                ref={canvasRef}
                style={{ 
                  width: '100%', 
                  height: `${height}px`,
                  display: 'block'
                }}
              />
            </CanvasContainer>
          </Grid>
        )}

        {/* Metrics */}
        {showMetrics && visualizationData && stats && (
          <Grid size={12}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <MetricChip 
                quality={stats.dataQuality}
                label={`Quality: ${stats.dataQuality.toUpperCase()}`} 
                size="small" 
              />
              <Chip 
                label={`SNR: ${visualizationData.signalQuality?.snr || 0}dB`} 
                size="small" 
                sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}
              />
              <Chip 
                label={`FPS: ${stats.averageFps}`} 
                size="small" 
                sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}
              />
              <Chip 
                label={`Clarity: ${Math.round((visualizationData.signalQuality?.clarity || 0) * 100)}%`} 
                size="small" 
                sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}
              />
            </Box>

            {/* Signal strength bars */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Signal Strength
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: '#00d4ff' }}>Left</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(visualizationData.amplitudes?.left || 0) / 255 * 100}
                    sx={{ 
                      height: 8, 
                      backgroundColor: 'rgba(0, 212, 255, 0.2)',
                      '& .MuiLinearProgress-bar': { backgroundColor: '#00d4ff' }
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: '#ff9500' }}>Right</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(visualizationData.amplitudes?.right || 0) / 255 * 100}
                    sx={{ 
                      height: 8, 
                      backgroundColor: 'rgba(255, 149, 0, 0.2)',
                      '& .MuiLinearProgress-bar': { backgroundColor: '#ff9500' }
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
        )}
      </Grid>
    </VisualizerContainer>
  );
};