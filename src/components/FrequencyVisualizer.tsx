import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, LinearProgress, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAudioAnalysis } from '../hooks/useAudioAnalysis';
import type { AppState} from '../types';

interface FrequencyVisualizerProps {
  state: AppState;
  title?: string;
  showSpectrum?: boolean;
  showFrequencies?: boolean;
  showMetrics?: boolean;
  height?: number;
  width?: number;
  audioContext?: AudioContext;
  analyserNode?: AnalyserNode;
}

const VisualizerContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(2),
  height: '400px',
  display: 'flex',
  flexDirection: 'column',
  overflowX: 'scroll',
}));

const CanvasContainer = styled(Box)({
  position: 'relative',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  overflowX: 'scroll',
  background: 'radial-gradient(circle at center, rgba(0, 200, 255, 0.1) 0%, transparent 70%)',
  width: '100%',
  minHeight: '300px',
  maxHeight: '300px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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

export const FrequencyVisualizer: React.FC<FrequencyVisualizerProps> = ({
  state,
  title = 'Binaural Beat Frequency Visualizer',
  showSpectrum = true,
  showFrequencies = true,
  showMetrics = true,
  audioContext,
  analyserNode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fps, setFps] = useState(0);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 300 });
   // Deconstruct from state
  const {
    base_frequency = 0,
    beat_frequency = 0,
    isPlaying = false,
    patterns8D = [],
    timer,
    electromagnetic
  } = state;

  // Calculate frequencies
  const leftFreq = base_frequency;
  const rightFreq = base_frequency + beat_frequency;
  const beatFreq = beat_frequency;

  // Get active pattern (first pattern if available)
  const activePattern = patterns8D?.[0] || null;

  // Initialize audio analysis
  const { analysisData, stats, isAnalyzing } = useAudioAnalysis({
    enabled: isPlaying,
    updateRate: 40,
    audioContext,
    analyserNode
  });

  // Timer info display
  const getTimerInfo = () => {
    if (!timer?.status) return null;

    const { session, isRunning } = timer.status;
    const currentStepIndex = session?.current_transition_index;
    const transitions = timer.transitions;

    if (!isRunning || currentStepIndex === undefined || !transitions) return null;

    const currentStep = transitions[currentStepIndex];
    if (!currentStep) return null;

    return {
      stepName: currentStep.description || `Step ${currentStepIndex + 1}`,
      stepIndex: currentStepIndex + 1,
      totalSteps: transitions.length,
      targetFreq: currentStep.frequency_hz,
      remainingTime: timer.status.time_remaining_current || 0
    };
  };

  const timerInfo = getTimerInfo();

  // Update canvas dimensions based on container size
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasDimensions({
          width: rect.width || 800,
          height: Math.min(rect.height || 300, 300)
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // ENHANCED: Performance-optimized visualization with electromagnetic field and frequency analysis
  useEffect(() => {
    console.log('🎨 FrequencyVisualizer useEffect triggered:', {
      hasCanvas: !!canvasRef.current,
      isPlaying,
      leftFreq,
      rightFreq,
      hasElectromagnetic: !!electromagnetic
    });

    if (!canvasRef.current || !isPlaying) {
      console.log('❌ FrequencyVisualizer: Not rendering -', !canvasRef.current ? 'No canvas' : 'Not playing');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('❌ FrequencyVisualizer: No canvas context');
      return;
    }

    console.log('✅ FrequencyVisualizer: Starting animation loop with electromagnetic field integration');

    let animationId: number;
    let lastFrameTime = 0;
    const targetFPS = 40;
    const frameInterval = 1000 / targetFPS;
    let frameCount = 0;
    let fpsTime = 0;

    // Frequency analysis data buffer
    const frequencyData = new Uint8Array(analyserNode?.frequencyBinCount || 1024);

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

        // Clear canvas with fade effect
        ctx.fillStyle = 'rgba(10, 10, 25, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerY = canvas.height / 2;
        const centerX = canvas.width / 2;

        // Get frequency data from analyser if available
        if (analyserNode) {
          analyserNode.getByteFrequencyData(frequencyData);
        }

        // ENHANCED: Draw binaural beat waveform with electromagnetic field modulation
        ctx.beginPath();
        ctx.strokeStyle = activePattern?.color || '#00ff88';
        ctx.lineWidth = 2;
        ctx.shadowColor = activePattern?.color || '#00ff88';
        ctx.shadowBlur = 10;

        const samples = 200;
        const time = timestamp * 0.001;

        // Use electromagnetic field data for modulation
        const fieldStrength = electromagnetic?.strength || 0;
        const fieldFrequency = electromagnetic?.frequency || beatFreq;
        const fieldCoherence = electromagnetic?.coherence || 0;

        for (let i = 0; i < samples; i++) {
          const x = (i / samples) * canvas.width;
          const t = time + (i / samples) * 0.1;

          // Left and right ear frequencies
          const leftWave = Math.sin(2 * Math.PI * leftFreq * t);
          const rightWave = Math.sin(2 * Math.PI * rightFreq * t);

          // Binaural beat interference pattern with electromagnetic modulation
          const binauralBeat = (leftWave + rightWave) / 2;
          const fieldModulation = Math.sin(2 * Math.PI * fieldFrequency * t) * fieldStrength;
          const amplitude = 40 + (beatFreq * 2) + (fieldModulation * 30);

          const y = centerY + (binauralBeat + fieldModulation * 0.3) * amplitude;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
        ctx.shadowBlur = 0;

        // ENHANCED: Draw frequency spectrum analysis at top
        if (analyserNode && frequencyData.length > 0 && showSpectrum) {
          const barWidth = canvas.width / 64;
          const maxBarHeight = canvas.height * 0.2;
          
          for (let i = 0; i < 64; i++) {
            const barHeight = (frequencyData[i] / 255) * maxBarHeight;
            const x = i * barWidth;
            const y = 10;
            
            // Color based on frequency and electromagnetic coherence
            const hue = (i / 64) * 240 + (fieldCoherence * 60);
            const intensity = 0.4 + (fieldStrength * 0.4);
            ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${intensity})`;
            ctx.fillRect(x, y, barWidth - 2, barHeight);
          }
        }

        // ENHANCED: Draw electromagnetic field visualization overlay
        if (electromagnetic && fieldStrength > 0.1) {
          const fieldRadius = 60 + (fieldStrength * 40);
          const numRings = 5;
          
          for (let ring = 0; ring < numRings; ring++) {
            const progress = ring / numRings;
            const radius = fieldRadius * (1 - progress);
            const alpha = (1 - progress) * fieldStrength * 0.5;
            
            const angle = time * fieldFrequency * 0.1 + (ring * Math.PI / numRings);
            const offsetX = Math.cos(angle) * 10;
            const offsetY = Math.sin(angle) * 10;
            
            ctx.beginPath();
            ctx.arc(centerX + offsetX, centerY + offsetY, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = `hsla(${180 + fieldCoherence * 60}, 80%, 60%, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }

        // Draw 8D pattern overlay if active
        if (activePattern && activePattern.path.length > 0) {
          const patternProgress = (timestamp * 0.0005 * activePattern.speed) % 1;
          const pathIndex = Math.floor(patternProgress * activePattern.path.length);
          const point = activePattern.path[pathIndex];

          if (point) {
            const scale = 1.5;
            const x = centerX + point.x * scale;
            const y = centerY + point.y * scale;

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = activePattern.color;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.strokeStyle = activePattern.color + '88';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }

        // ENHANCED: Liquid countdown display at bottom with electromagnetic glow
        if (timerInfo) {
          const progress = timerInfo.remainingTime / (timerInfo.remainingTime + 1);
          const liquidHeight = 35;
          const liquidY = canvas.height - liquidHeight;
          
          // Liquid background with field glow
          const glowIntensity = fieldStrength * 0.3;
          ctx.fillStyle = `rgba(255, 107, 0, ${0.2 + glowIntensity})`;
          ctx.fillRect(0, liquidY, canvas.width, liquidHeight);
          
          // Liquid progress with animated wave effect
          const waveAmplitude = 3 + (fieldStrength * 2);
          const waveFrequency = 0.02;
          const waveOffset = timestamp * 0.001 * (1 + fieldCoherence);
          
          ctx.beginPath();
          ctx.moveTo(0, liquidY + liquidHeight);
          
          for (let x = 0; x <= canvas.width; x += 2) {
            const wave = Math.sin(x * waveFrequency + waveOffset) * waveAmplitude;
            const fieldWave = Math.sin(x * 0.01 + time * fieldFrequency * 0.1) * fieldStrength * 2;
            const y = liquidY + liquidHeight - (progress * liquidHeight) + wave + fieldWave;
            ctx.lineTo(x, y);
          }
          
          ctx.lineTo(canvas.width, liquidY + liquidHeight);
          ctx.closePath();
          
          // Gradient with electromagnetic influence
          const gradient = ctx.createLinearGradient(0, liquidY, 0, canvas.height);
          gradient.addColorStop(0, `rgba(255, 107, 0, ${0.8 + glowIntensity})`);
          gradient.addColorStop(0.5, `rgba(${180 + fieldCoherence * 75}, 43, 226, 0.8)`);
          gradient.addColorStop(1, `rgba(138, 43, 226, ${0.8 + glowIntensity})`);
          ctx.fillStyle = gradient;
          ctx.fill();
          
          // Glow effect on liquid surface
          ctx.shadowColor = `rgba(255, 107, 0, ${fieldStrength})`;
          ctx.shadowBlur = 10 + (fieldStrength * 10);
          ctx.stroke();
          ctx.shadowBlur = 0;
          
          // Timer text overlay with electromagnetic pulsing
          const textScale = 1 + (fieldStrength * 0.1);
          ctx.save();
          ctx.translate(centerX, liquidY + liquidHeight / 2);
          ctx.scale(textScale, textScale);
          
          ctx.font = 'bold 16px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 4;
          
          const minutes = Math.floor(timerInfo.remainingTime / 60);
          const seconds = Math.floor(timerInfo.remainingTime % 60);
          const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          
          ctx.fillText(timeText, 0, 0);
          
          // Step indicator
          ctx.font = 'bold 10px monospace';
          ctx.fillText(`Step ${timerInfo.stepIndex}/${timerInfo.totalSteps}`, 0, 14);
          
          ctx.restore();
          ctx.shadowBlur = 0;
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, leftFreq, rightFreq, beatFreq, activePattern, timerInfo, analyserNode, electromagnetic, showSpectrum]);

  return (
    <VisualizerContainer elevation={10}>
      <Typography variant="h6" gutterBottom sx={{ color: '#fff', textAlign: 'center'}}>
        {title}
      </Typography>

      {/* Electromagnetic Field Status */}
      {electromagnetic && (
        <Box sx={{
          mb: 1,
          p: 1,
          background: 'rgba(0, 200, 255, 0.1)',
          border: '1px solid rgba(0, 200, 255, 0.3)',
          borderRadius: 1
        }}>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}>
                Field Strength
              </Typography>
              <Typography variant="body2" sx={{ color: '#00bfff', fontWeight: 'bold', fontSize: '0.85rem' }}>
                {(electromagnetic.strength * 100).toFixed(0)}%
              </Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}>
                Coherence
              </Typography>
              <Typography variant="body2" sx={{ color: '#00ff88', fontWeight: 'bold', fontSize: '0.85rem' }}>
                {(electromagnetic.coherence * 100).toFixed(0)}%
              </Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}>
                State
              </Typography>
              <Typography variant="body2" sx={{ 
                color: electromagnetic.state === 'RESONANT' ? '#ff6b00' : 
                       electromagnetic.state === 'CRITICAL' ? '#ff1493' : '#8a2be2',
                fontWeight: 'bold',
                fontSize: '0.85rem'
              }}>
                {electromagnetic.state}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}

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
                🎧 {timerInfo.stepName}
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
      <CanvasContainer ref={containerRef}>
        <canvas
          ref={canvasRef}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            maxHeight: '300px'
          }}
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
              {parseInt(beatFreq.toFixed(2))} Hz
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Right Ear
            </Typography>
            <Typography variant="h6" sx={{ color: '#ff1493', fontWeight: 'bold' }}>
              {parseInt(rightFreq.toFixed(2))} Hz
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
