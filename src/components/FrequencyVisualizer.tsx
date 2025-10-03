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
  // TEMPORARILY DISABLED - PERFORMANCE OPTIMIZATION
  // The visualization is causing performance issues, so we're showing a placeholder instead

  const configDisplay = config ? `${config.baseFrequency}Hz + ${config.beat_frequency}Hz` : 'No config';

  return (
    <VisualizerContainer elevation={3}>
      <Typography variant="h6" gutterBottom sx={{ color: '#fff', textAlign: 'center' }}>
        {title}
      </Typography>

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        minHeight: `${height}px`,
        gap: 2
      }}>
        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
          🎵 Visualizer Temporarily Disabled
        </Typography>

        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
          Performance optimization in progress...
        </Typography>

        {config && (
          <Box sx={{
            mt: 2,
            p: 2,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.05)'
          }}>
            <Typography variant="body2" sx={{ color: '#fff', textAlign: 'center' }}>
              Current Config: {configDisplay}
            </Typography>
          </Box>
        )}

        <Chip
          label="Visualizer: DISABLED"
          size="small"
          sx={{
            backgroundColor: 'rgba(255, 193, 7, 0.2)',
            color: '#ffc107',
            border: '1px solid #ffc107'
          }}
        />
      </Box>
    </VisualizerContainer>
  );
};