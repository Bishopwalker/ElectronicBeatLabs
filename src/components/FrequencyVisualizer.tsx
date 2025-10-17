import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, ToggleButtonGroup, ToggleButton, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAudioAnalysis } from '../hooks/index.ts';
import type { AppState} from '../types';
import WavesIcon from '@mui/icons-material/Waves';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import RadarIcon from '@mui/icons-material/Radar';
import GridOnIcon from '@mui/icons-material/GridOn';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

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

type VisualizationMode = 'waveform' | 'spiral2d' | 'spiral3d' | 'radial' | 'combined';

// 🔥 FIXED: Made container flexible for embedding
const VisualizerContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(1),
  height: '100%',
  minHeight: '250px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
}));

const CanvasContainer = styled(Box)({
  position: 'relative',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  overflow: 'hidden',
  background: 'radial-gradient(circle at center, rgba(0, 200, 255, 0.1) 0%, transparent 70%)',
  width: '100%',
  flex: 1,
  minHeight: '200px',
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
  flexShrink: 0,
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
  // 🔥 CRITICAL FIX: Early return if state is invalid
  if (!state || typeof state !== 'object') {
    console.error('❌ FrequencyVisualizer: Invalid state provided', state);
    return (
      <Box sx={{ p: 2, color: 'error.main', textAlign: 'center' }}>
        <Typography>Frequency Visualizer: Invalid state</Typography>
      </Box>
    );
  }

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const visualizerContainerRef = useRef<HTMLDivElement>(null); // 🔥 For fullscreen
  const fpsRef = useRef<number>(0);
  const [fps, setFps] = useState(0);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 300 });
  const dimensionsRef = useRef(canvasDimensions);
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('combined');
  const [isFullscreen, setIsFullscreen] = useState(false); // 🔥 Fullscreen state

  // 🔥 FIXED: Read from both audio.audioState AND top-level state for flexibility
  // Timer transitions pass frequencies at top level, audio engine has them nested
  const base_frequency = 
    state.base_frequency ?? 
    state.audio?.audioState?.base_frequency ?? 
    140;
  
  const beat_frequency = 
    state.beat_frequency ?? 
    state.audio?.audioState?.beat_frequency ?? 
    4;
  
  const isPlaying = 
    state.isPlaying ?? 
    state.audio?.audioState?.isPlaying ?? 
    false;

  const { 
    patterns8D = [],
    currentPattern = null,
    electromagnetic = null
  } = state || {};

  // Calculate frequencies
  const leftFreq = base_frequency;
  const rightFreq = base_frequency + beat_frequency;
  const beatFreq = beat_frequency;

  // ✅ FIXED: Match active pattern by currentPattern ID
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

  // 🔥 Fullscreen handler
  const toggleFullscreen = async () => {
    if (!visualizerContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await visualizerContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
        console.log('✅ Entered fullscreen mode');
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        console.log('✅ Exited fullscreen mode');
      }
    } catch (error) {
      console.error('❌ Fullscreen toggle failed:', error);
    }
  };

  // 🔥 Listen for fullscreen changes (ESC key, browser controls)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      console.log('🔄 Fullscreen state changed:', isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 🔥 FIXED: Update dimensionsRef when canvasDimensions changes
  useEffect(() => {
    dimensionsRef.current = canvasDimensions;
  }, [canvasDimensions]);

  // 🔥 FIXED: Update FPS display from ref
  useEffect(() => {
    if (!isPlaying) return;

    const fpsUpdateInterval = setInterval(() => {
      setFps(fpsRef.current);
    }, 1000);

    return () => clearInterval(fpsUpdateInterval);
  }, [isPlaying]);

  // 🔥 FIXED: Throttled responsive canvas sizing
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

        if (Math.abs(width - lastWidth) > 5 || Math.abs(height - lastHeight) > 5) {
          lastWidth = width;
          lastHeight = height;

          if (resizeTimeout) clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            setCanvasDimensions({ width, height });
          }, 150);
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

  // 🎨 ENHANCED: Multi-mode visualization with FFT-driven spiral and radial bars
  useEffect(() => {
    console.log('🎨 FrequencyVisualizer useEffect triggered:', {
      hasCanvas: !!canvasRef.current,
      isPlaying,
      visualizationMode,
      hasAnalyser: !!analyserNode,
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

        // FPS calculation
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
        const time = timestamp * 0.001;

        // Get real-time frequency data from analyser
        if (analyserNode) {
          analyserNode.getByteFrequencyData(frequencyData);
        }

        // Electromagnetic field modulation
        const fieldStrength = electromagnetic?.strength || 0;
        const fieldFrequency = electromagnetic?.frequency || beatFreq;
        const fieldCoherence = electromagnetic?.coherence || 0;

        // 🎨 RENDER BASED ON MODE
        switch (visualizationMode) {
          case 'waveform':
            renderWaveform(ctx, canvas, centerX, centerY, time, frequencyData, fieldStrength, fieldFrequency);
            break;
          case 'spiral2d':
            renderSpiral2D(ctx, canvas, centerX, centerY, time, frequencyData, fieldStrength, fieldCoherence);
            break;
          case 'spiral3d':
            renderSpiral3D(ctx, canvas, centerX, centerY, time, frequencyData, fieldStrength, fieldCoherence);
            break;
          case 'radial':
            renderRadialBars(ctx, canvas, centerX, centerY, time, frequencyData, fieldStrength);
            break;
          case 'combined':
            // Draw radial bars as background
            renderRadialBars(ctx, canvas, centerX, centerY, time, frequencyData, fieldStrength);
            // Overlay spiral on top
            renderSpiral2D(ctx, canvas, centerX, centerY, time, frequencyData, fieldStrength, fieldCoherence);
            break;
        }

        // Draw frequency spectrum analysis at top (if enabled)
        if (analyserNode && frequencyData.length > 0 && showSpectrum) {
          const barWidth = canvas.width / 64;
          const maxBarHeight = canvas.height * 0.15;

          for (let i = 0; i < 64; i++) {
            const barHeight = (frequencyData[i] / 255) * maxBarHeight;
            const x = i * barWidth;
            const y = 10;

            const hue = (i / 64) * 240 + (fieldCoherence * 60);
            const intensity = 0.4 + (fieldStrength * 0.4);
            ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${intensity})`;
            ctx.fillRect(x, y, barWidth - 2, barHeight);
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
      }

      animationId = requestAnimationFrame(draw);
    };

    // 🎨 RENDER FUNCTIONS FOR EACH MODE

    // Waveform visualization (original)
    function renderWaveform(
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      centerX: number,
      centerY: number,
      time: number,
      frequencyData: Uint8Array,
      fieldStrength: number,
      fieldFrequency: number
    ) {
      ctx.beginPath();
      ctx.strokeStyle = activePattern?.color || '#00ff88';
      ctx.lineWidth = 2;
      ctx.shadowColor = activePattern?.color || '#00ff88';
      ctx.shadowBlur = 10;

      const samples = 200;
      const cycles = 3;
      const fieldModulation = Math.sin(2 * Math.PI * fieldFrequency * time) * fieldStrength;

      for (let i = 0; i < samples; i++) {
        const x = (i / samples) * canvas.width;
        const normalizedPos = i / samples;
        const visualT = normalizedPos * cycles;

        const leftWave = Math.sin(2 * Math.PI * visualT);
        const rightWave = Math.sin(2 * Math.PI * visualT + (beatFreq / leftFreq) * 2 * Math.PI * cycles);

        const binauralBeat = (leftWave + rightWave) / 2;
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
    }

    // 🌀 2D Spiral driven by FFT data
    function renderSpiral2D(
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      centerX: number,
      centerY: number,
      time: number,
      frequencyData: Uint8Array,
      fieldStrength: number,
      fieldCoherence: number
    ) {
      const numBins = Math.min(frequencyData.length, 128);
      const rotationSpeed = 0.5;
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Draw multiple spiral arms
      const numArms = 3;
      for (let arm = 0; arm < numArms; arm++) {
        const armOffset = (arm * Math.PI * 2) / numArms;

        ctx.beginPath();
        ctx.strokeStyle = `hsla(${(arm * 120 + time * 30) % 360}, 80%, 60%, 0.8)`;
        ctx.lineWidth = 2 + fieldStrength * 2;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 8 + fieldStrength * 6;

        for (let i = 0; i < numBins; i++) {
          const freqValue = frequencyData[i] / 255;
          const t = i / numBins;
          
          // Spiral equation: radius grows with angle
          const angle = t * Math.PI * 6 + time * rotationSpeed + armOffset;
          const radius = (t * maxRadius) * (0.5 + freqValue * 0.5) * (1 + fieldCoherence * 0.3);

          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          // Draw energy points at peaks
          if (freqValue > 0.6 && i % 8 === 0) {
            ctx.save();
            ctx.fillStyle = `hsla(${(arm * 120 + 60) % 360}, 90%, 70%, ${freqValue})`;
            ctx.beginPath();
            ctx.arc(x, y, 2 + freqValue * 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    }

    // 🌀 3D Spiral with perspective (Z-axis depth)
    function renderSpiral3D(
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      centerX: number,
      centerY: number,
      time: number,
      frequencyData: Uint8Array,
      fieldStrength: number,
      fieldCoherence: number
    ) {
      const numBins = Math.min(frequencyData.length, 128);
      const rotationSpeed = 0.5;
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.35;
      const zDepth = 200;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Draw helix with 3D perspective
      const numHelixes = 2;
      for (let helix = 0; helix < numHelixes; helix++) {
        const helixOffset = (helix * Math.PI);

        ctx.beginPath();

        for (let i = 0; i < numBins; i++) {
          const freqValue = frequencyData[i] / 255;
          const t = i / numBins;

          // 3D helix equations
          const angle = t * Math.PI * 8 + time * rotationSpeed + helixOffset;
          const radius = maxRadius * 0.6 * (0.5 + freqValue * 0.5);
          const z = (t - 0.5) * zDepth; // Z from -100 to +100

          // Perspective projection (simple)
          const perspective = 300 / (300 + z);
          const x = Math.cos(angle) * radius * perspective;
          const y = Math.sin(angle) * radius * perspective + z * 0.3; // Add Z to Y for depth

          // Color based on depth
          const depthHue = (t * 240 + helix * 180 + time * 20) % 360;
          const depthAlpha = 0.3 + (freqValue * 0.5) + (perspective - 0.5) * 0.4;
          const lineWidth = 1 + freqValue * 3 * perspective;

          ctx.strokeStyle = `hsla(${depthHue}, 80%, 60%, ${depthAlpha})`;
          ctx.lineWidth = lineWidth;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      ctx.restore();
    }

    // ☀️ Radial Sunburst Bars emanating from center
    function renderRadialBars(
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      centerX: number,
      centerY: number,
      time: number,
      frequencyData: Uint8Array,
      fieldStrength: number
    ) {
      const numBars = Math.min(frequencyData.length / 2, 64);
      const maxBarLength = Math.min(canvas.width, canvas.height) * 0.4;

      ctx.save();
      ctx.translate(centerX, centerY);

      for (let i = 0; i < numBars; i++) {
        const freqValue = frequencyData[i] / 255;
        const angle = (i / numBars) * Math.PI * 2 - Math.PI / 2; // Start from top
        const barLength = freqValue * maxBarLength * (1 + fieldStrength * 0.3);
        const barWidth = (Math.PI * 2) / numBars * maxBarLength * 0.8;

        // Gradient from center to edge
        const gradient = ctx.createLinearGradient(0, 0, Math.cos(angle) * barLength, Math.sin(angle) * barLength);
        const hue = (i / numBars) * 360 + time * 20;
        gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.1)`);
        gradient.addColorStop(0.5, `hsla(${hue}, 85%, 65%, ${freqValue * 0.6})`);
        gradient.addColorStop(1, `hsla(${hue}, 90%, 70%, ${freqValue})`);

        ctx.fillStyle = gradient;
        ctx.shadowColor = `hsla(${hue}, 90%, 70%, ${freqValue * 0.5})`;
        ctx.shadowBlur = 10 * freqValue;

        // Draw bar as triangle
        ctx.beginPath();
        ctx.moveTo(0, 0);
        
        const x1 = Math.cos(angle - barWidth / maxBarLength) * barLength;
        const y1 = Math.sin(angle - barWidth / maxBarLength) * barLength;
        const x2 = Math.cos(angle + barWidth / maxBarLength) * barLength;
        const y2 = Math.sin(angle + barWidth / maxBarLength) * barLength;

        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.fill();

        // Draw energy burst at tips for strong frequencies
        if (freqValue > 0.7) {
          const tipX = Math.cos(angle) * barLength;
          const tipY = Math.sin(angle) * barLength;

          ctx.fillStyle = `hsla(${hue + 60}, 100%, 80%, ${freqValue})`;
          ctx.beginPath();
          ctx.arc(tipX, tipY, 3 + freqValue * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.shadowBlur = 0;
      ctx.restore();
    }

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, leftFreq, rightFreq, beatFreq, activePattern, analyserNode, electromagnetic, showSpectrum, visualizationMode]);

  return (
    <VisualizerContainer 
      elevation={10} 
      ref={visualizerContainerRef}
      sx={{
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : '100%',
        zIndex: isFullscreen ? 9999 : 'auto',
        margin: 0
      }}
    >
      {/* Visualization Mode Selector + Fullscreen Button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1,
        flexShrink: 0
      }}>
        {title && (
          <Typography variant="h6" sx={{ color: '#fff', fontSize: '0.95rem', flexGrow: 1 }}>
            {title}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={visualizationMode}
            exclusive
            onChange={(_, newMode) => newMode && setVisualizationMode(newMode)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                color: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '4px 8px',
                '&.Mui-selected': {
                  color: '#00ff88',
                  backgroundColor: 'rgba(0, 255, 136, 0.2)',
                  border: '1px solid #00ff88'
                }
              }
            }}
          >
            <ToggleButton value="waveform" title="Waveform">
              <WavesIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="spiral2d" title="2D Spiral">
              <BubbleChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="spiral3d" title="3D Helix">
              <RadarIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="radial" title="Radial Bars">
              <RadarIcon fontSize="small" style={{ transform: 'rotate(45deg)' }} />
            </ToggleButton>
            <ToggleButton value="combined" title="Combined">
              <GridOnIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>

          {/* 🔥 Fullscreen Button */}
          <IconButton
            onClick={toggleFullscreen}
            size="small"
            sx={{
              color: isFullscreen ? '#00ff88' : 'rgba(255, 255, 255, 0.6)',
              bgcolor: isFullscreen ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
              border: '1px solid',
              borderColor: isFullscreen ? '#00ff88' : 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                bgcolor: isFullscreen ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.1)'
              }
            }}
            title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

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
        <FrequencyDisplay sx={{ mt: 1 }}>
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
          <Chip
            label={visualizationMode.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: 'rgba(138, 43, 226, 0.2)',
              color: '#8a2be2',
              border: '1px solid #8a2be2'
            }}
          />
          {activePattern && (
            <Chip
              label={`Pattern: ${activePattern.name}`}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 20, 147, 0.2)',
                color: '#ff1493',
                border: '1px solid #ff1493'
              }}
            />
          )}
        </Box>
      )}
    </VisualizerContainer>
  );
};