import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, LinearProgress, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAudioAnalysis } from '../hooks/index.ts';
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

// 🔥 FIXED: Made container flexible for embedding
const VisualizerContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1), // 🔥 FIXED: Reduced from 2 to 1 for tighter fit
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(1), // 🔥 FIXED: Reduced from 2 to 1
  height: '100%', // 🔥 FIXED: Was '400px', now flexible
  minHeight: '250px', // Minimum usable height
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto', // 🔥 FIXED: Was 'scroll', now auto
}));

// 🔥 FIXED: Made canvas container flexible
const CanvasContainer = styled(Box)({
  position: 'relative',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  overflow: 'hidden', // 🔥 FIXED: Was 'scroll'
  background: 'radial-gradient(circle at center, rgba(0, 200, 255, 0.1) 0%, transparent 70%)',
  width: '100%',
  flex: 1, // 🔥 FIXED: Take remaining space
  minHeight: '200px', // Minimum canvas height
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
  flexShrink: 0, // 🔥 Don't shrink when space is tight
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
  const fpsRef = useRef<number>(0); // 🔥 FIXED: Use ref instead of state to avoid re-renders
  const [fps, setFps] = useState(0); // 🔥 FIXED: State for UI display only, updated from ref
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 300 });
  const dimensionsRef = useRef(canvasDimensions); // 🔥 FIXED: Ref for animation access
  // Deconstruct from state
  const {
    base_frequency,
    beat_frequency,
    isPlaying,
    patterns8D,
    currentPattern,
    timer,
    electromagnetic
  } = state;

  // Calculate frequencies
  const leftFreq = base_frequency;
  const rightFreq = base_frequency + beat_frequency;
  const beatFreq = beat_frequency;

  // ✅ FIXED: Match active pattern by currentPattern ID instead of always using first pattern
  const activePattern = currentPattern && patterns8D
    ? patterns8D.find(p => p.id === currentPattern.id) || null
    : null;

  // Initialize audio analysis
  const { analysisData, stats, isAnalyzing } = useAudioAnalysis({
    enabled: isPlaying,
    updateRate: 40,
    audioContext,
    analyserNode
  });
  // Timer info display
  // const getTimerInfo = () => {
  //   if (!timer?.status) return null;
  //
  //   const { session, isRunning } = timer.status;
  //   const currentStepIndex = session?.current_transition_index;
  //   const transitions = timer.transitions;
  //
  //   if (!isRunning || currentStepIndex === undefined || !transitions) return null;
  //
  //   const currentStep = transitions[currentStepIndex];
  //   if (!currentStep) return null;
  //
  //   return {
  //     stepName: currentStep.description || `Step ${currentStepIndex + 1}`,
  //     stepIndex: currentStepIndex + 1,
  //     totalSteps: transitions.length,
  //     targetFreq: currentStep.frequency_hz,
  //     remainingTime: timer.status.time_remaining_current || 0
  //   };
  // };

  //const timerInfo = getTimerInfo();

  // 🔥 FIXED: Update dimensionsRef when canvasDimensions changes
  useEffect(() => {
    dimensionsRef.current = canvasDimensions;
  }, [canvasDimensions]);

  // 🔥 FIXED: Update FPS display from ref (separate from animation to avoid re-renders)
  useEffect(() => {
    if (!isPlaying) return;

    const fpsUpdateInterval = setInterval(() => {
      setFps(fpsRef.current);
    }, 1000); // Update UI every second

    return () => clearInterval(fpsUpdateInterval);
  }, [isPlaying]);

  // 🔥 FIXED: Throttled responsive canvas sizing (prevents resize loops)
  useEffect(() => {
    if (!containerRef.current) return;

    let resizeTimeout: NodeJS.Timeout | null = null;
    let lastWidth = 0;
    let lastHeight = 0;

    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = Math.max(Math.floor(rect.width) || 800, 400);
        const height = Math.max(Math.floor(rect.height) || 300, 200);

        // 🔥 CRITICAL: Only update if size actually changed significantly (>5px)
        if (Math.abs(width - lastWidth) > 5 || Math.abs(height - lastHeight) > 5) {
          lastWidth = width;
          lastHeight = height;

          // 🔥 Throttle updates to prevent rapid-fire resize loops
          if (resizeTimeout) clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            setCanvasDimensions({ width, height });
          }, 150); // 150ms debounce
        }
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    window.addEventListener('resize', updateDimensions);

    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
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
      hasElectromagnetic: !!electromagnetic,
      canvasWidth: canvasDimensions.width,
      canvasHeight: canvasDimensions.height
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


    let animationId: number;
    let lastFrameTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;
    let frameCount = 0;
    let fpsTime = 0;

    // Frequency analysis data buffer
    const frequencyData = new Uint8Array(analyserNode?.frequencyBinCount || 1024);

    const draw = (timestamp: number) => {
      const elapsed = timestamp - lastFrameTime;

      if (elapsed >= frameInterval) {
        lastFrameTime = timestamp - (elapsed % frameInterval);

        // 🔥 FIXED: FPS calculation (use ref to avoid re-renders)
        frameCount++;
        fpsTime += elapsed;
        if (fpsTime >= 1000) {
          fpsRef.current = Math.round((frameCount * 1000) / fpsTime);
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
          const normalizedPos = i / samples;

          // Show 2-3 complete cycles across the canvas for better visualization
          const cycles = 3;
          const visualT = normalizedPos * cycles;

          // Left and right ear frequencies with scaled time
          const leftWave = Math.sin(2 * Math.PI * visualT);
          const rightWave = Math.sin(2 * Math.PI * visualT + (beatFreq / leftFreq) * 2 * Math.PI * cycles);

          // Binaural beat interference pattern with electromagnetic modulation
          const binauralBeat = (leftWave + rightWave) / 2;
          const fieldModulation = Math.sin(2 * Math.PI * fieldFrequency * time) * fieldStrength;
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

        // Don't draw timer info overlay in canvas (shows in UI instead)
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, leftFreq, rightFreq, beatFreq, activePattern, analyserNode, electromagnetic, showSpectrum]);
  // 🔥 CRITICAL: canvasDimensions removed from deps - animation uses current canvas.width/height directly!

  return (
    <VisualizerContainer elevation={10}>
      {title && (
        <Typography variant="h6" gutterBottom sx={{ color: '#fff', textAlign: 'center', flexShrink: 0}}>
          {title}
        </Typography>
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
            height: '100%'
          }}
        />
      </CanvasContainer>

      {/* Frequency Display */}
      {showFrequencies && (
        <FrequencyDisplay sx={{ mt: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}>
              Left Ear
            </Typography>
            <Typography variant="body2" sx={{ color: '#00bfff', fontWeight: 'bold', fontSize: '0.9rem' }}>
              {leftFreq.toFixed(2)} Hz
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}>
              Beat Frequency
            </Typography>
            <Typography variant="body2" sx={{ color: '#ff6b00', fontWeight: 'bold', fontSize: '0.9rem' }}>
              {beatFreq.toFixed(2)} Hz
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}>
              Right Ear
            </Typography>
            <Typography variant="body2" sx={{ color: '#ff1493', fontWeight: 'bold', fontSize: '0.9rem' }}>
              {rightFreq.toFixed(2)} Hz
            </Typography>
          </Box>
        </FrequencyDisplay>
      )}

      {/* Metrics */}
      {showMetrics && (
        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', flexShrink: 0 }}>
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