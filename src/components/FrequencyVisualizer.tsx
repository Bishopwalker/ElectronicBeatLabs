import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, LinearProgress, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useBinauralVisualization } from '../hooks/useBinauralVisualization';
import type { BinauralBeatConfig, Pattern8D } from '../types';
import type { TimerStatus } from '../data/timer';

interface FrequencyVisualizerProps {
  config?: BinauralBeatConfig;
  title?: string;
  showSpectrum?: boolean;
  showFrequencies?: boolean;
  showMetrics?: boolean;
  height?: number;
  width?: number;
  autoStart?: boolean;
  timerStatus?: TimerStatus;
  activePattern?: Pattern8D | null;
  audioState?: {
    isPlaying: boolean;
    leftFreq: number;
    rightFreq: number;
  };
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
  autoStart = false,
  timerStatus,
  activePattern,
  audioState
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fps, setFps] = useState(0);

  // Use actual audio state or fallback to config
  const leftFreq = audioState?.leftFreq || config?.beat_frequency || 140;
  const rightFreq = audioState?.rightFreq || (config?.beat_frequency ? config.beat_frequency + (config.beat_frequency || 0) : 150);
  const beatFreq = Math.abs(rightFreq - leftFreq);
  const isPlaying = audioState?.isPlaying || false;

  // Timer info display
  const getTimerInfo = () => {
    if (!timerStatus) return null;

    const { currentStepIndex, steps, remainingTime, isRunning } = timerStatus;
    if (!isRunning || currentStepIndex === undefined || !steps) return null;

    const currentStep = steps[currentStepIndex];
    if (!currentStep) return null;

    return {
      stepName: currentStep.name || `Step ${currentStepIndex + 1}`,
      stepIndex: currentStepIndex + 1,
      totalSteps: steps.length,
      remainingTime,
      targetFreq: currentStep.targetFrequency
    };
  };

  const timerInfo = getTimerInfo();

  // Performance-optimized visualization at 20 FPS
  useEffect(() => {
    if (!canvasRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let lastFrameTime = 0;
    const targetFPS = 20; // Eyes-closed optimized FPS
    const frameInterval = 1000 / targetFPS;
    let frameCount = 0;
    let fpsTime = 0;

    const draw = (timestamp: number) => {
      const elapsed = timestamp - lastFrameTime;

      if (elapsed >= frameInterval) {
        lastFrameTime = timestamp - (elapsed % frameInterval);

        // FPS calculation
        frameCount++;
        fpsTime += elapsed;
        if (fpsTime >= 1000) {
          setFps(Math.round((frameCount * 1000) / fpsTime));
          frameCount = 0;
          fpsTime = 0;
        }

        // Clear canvas
        ctx.fillStyle = 'rgba(10, 10, 25, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerY = canvas.height / 2;
        const centerX = canvas.width / 2;

        // Draw binaural beat waveform
        ctx.beginPath();
        ctx.strokeStyle = activePattern?.color || '#00ff88';
        ctx.lineWidth = 2;

        const samples = 200; // Reduced for performance
        const time = timestamp * 0.001;

        for (let i = 0; i < samples; i++) {
          const x = (i / samples) * canvas.width;
          const t = time + (i / samples) * 0.1;

          // Left and right ear frequencies
          const leftWave = Math.sin(2 * Math.PI * leftFreq * t);
          const rightWave = Math.sin(2 * Math.PI * rightFreq * t);

          // Binaural beat interference pattern
          const binauralBeat = (leftWave + rightWave) / 2;
          const amplitude = 40 + (beatFreq * 2); // Scale with beat frequency

          const y = centerY + binauralBeat * amplitude;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();

        // Draw 8D pattern overlay if active
        if (activePattern && activePattern.path.length > 0) {
          const patternProgress = (timestamp * 0.0005 * activePattern.speed) % 1;
          const pathIndex = Math.floor(patternProgress * activePattern.path.length);
          const point = activePattern.path[pathIndex];

          if (point) {
            // Project 3D point to 2D canvas
            const scale = 1.5;
            const x = centerX + point.x * scale;
            const y = centerY + point.y * scale;

            // Draw pattern point
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = activePattern.color;
            ctx.fill();

            // Draw glow
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.strokeStyle = activePattern.color + '88';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, leftFreq, rightFreq, beatFreq, activePattern]);

  return (
    <VisualizerContainer elevation={3}>
      <Typography variant="h6" gutterBottom sx={{ color: '#fff', textAlign: 'center' }}>
        {title}
      </Typography>

      {/* Timer Status Display */}
      {timerInfo && (
        <Box sx={{
          mb: 2,
          p: 1.5,
          background: 'rgba(255, 107, 0, 0.1)',
          border: '1px solid rgba(255, 107, 0, 0.3)',
          borderRadius: 1
        }}>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ color: '#ff6b00', fontWeight: 'bold' }}>
                {timerInfo.stepName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Step {timerInfo.stepIndex}/{timerInfo.totalSteps}
              </Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ color: '#00ff88' }}>
                {Math.floor(timerInfo.remainingTime / 60)}:{(timerInfo.remainingTime % 60).toString().padStart(2, '0')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Target: {timerInfo.targetFreq}Hz
              </Typography>
            </Grid>
          </Grid>
          <LinearProgress
            variant="determinate"
            value={(timerInfo.stepIndex / timerInfo.totalSteps) * 100}
            sx={{
              mt: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#ff6b00'
              }
            }}
          />
        </Box>
      )}

      {/* Canvas Visualization */}
      <CanvasContainer>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
      </CanvasContainer>

      {/* Frequency Display */}
      {showFrequencies && (
        <FrequencyDisplay sx={{ mt: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Left Ear
            </Typography>
            <Typography variant="h6" sx={{ color: '#00bfff', fontWeight: 'bold' }}>
              {leftFreq.toFixed(2)} Hz
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Beat Frequency
            </Typography>
            <Typography variant="h6" sx={{ color: '#ff6b00', fontWeight: 'bold' }}>
              {beatFreq.toFixed(2)} Hz
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Right Ear
            </Typography>
            <Typography variant="h6" sx={{ color: '#ff1493', fontWeight: 'bold' }}>
              {rightFreq.toFixed(2)} Hz
            </Typography>
          </Box>
        </FrequencyDisplay>
      )}

      {/* Metrics */}
      {showMetrics && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Chip
            label={isPlaying ? 'PLAYING' : 'PAUSED'}
            size="small"
            sx={{
              backgroundColor: isPlaying ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
              color: isPlaying ? '#4caf50' : '#ff9800',
              border: `1px solid ${isPlaying ? '#4caf50' : '#ff9800'}`
            }}
          />
          <Chip
            label={`${fps} FPS`}
            size="small"
            sx={{
              backgroundColor: 'rgba(0, 191, 255, 0.2)',
              color: '#00bfff',
              border: '1px solid #00bfff'
            }}
          />
          {activePattern && (
            <Chip
              label={`Pattern: ${activePattern.name}`}
              size="small"
              sx={{
                backgroundColor: 'rgba(138, 43, 226, 0.2)',
                color: '#8a2be2',
                border: '1px solid #8a2be2'
              }}
            />
          )}
        </Box>
      )}
    </VisualizerContainer>
  );
};