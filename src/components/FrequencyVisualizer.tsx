import React, {useEffect, useRef, useState} from 'react';
import {
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import {styled} from '@mui/material/styles';
import {useAudioAnalysis} from '../hooks/useAudioAnalysis';
import type {ElectromagneticField, Pattern8D, PatternConfig, PatternMode, WaveForm} from '../types';
import {DEFAULT_BASE_FREQUENCY, DEFAULT_BEAT_FREQUENCY} from '../constants/audio.constants';
import WavesIcon from '@mui/icons-material/Waves';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import RadarIcon from '@mui/icons-material/Radar';
import GridOnIcon from '@mui/icons-material/GridOn';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import PsychologyIcon from '@mui/icons-material/Psychology';
import {
  analyzeConsciousness,
  BRAINWAVE_RANGES,
  type ConsciousnessMetrics,
  drawBrainwaveIndicator,
  drawCoherenceMandala,
  drawEntrainmentMeter,
  drawGoldenSpiral,
  drawSchumannRing,
  generateCoherenceGradient
} from '../utils/consciousnessDetection';

// ============================================================================
// 🔥 AUDIO-REACTIVE HELPER FUNCTIONS - 100% LIVE FREQUENCY ANALYSIS
// ============================================================================

/**
 * 🎨 VISUAL BOOST MULTIPLIER
 * Boosts visual signal strength without affecting audio gain
 * Applied to all frequency data readings for visualization only
 */
// VISUAL_BOOST is now controlled by visualSensitivity slider in the component
// Default value for reference only - actual boost comes from state
const DEFAULT_VISUAL_BOOST = 10;

/**
 * Maps FFT bin index to HSL hue value based on frequency range
 * Bass (0-20% bins) → 0-30° (Red/Orange)
 * Mid (20-60% bins) → 120-180° (Green/Cyan)
 * Treble (60-100% bins) → 240-280° (Blue/Purple)
 */
function mapFrequencyBinToColor(binIndex: number, totalBins: number): number {
  const normalized = binIndex / totalBins; // 0 to 1
  
  if (normalized < 0.2 ) {
    // Bass: Red to Orange
    return normalized * 150; // 0° to 30°
  } else if (normalized < 0.6) {
    // Mid: Green to Cyan
    return 120 + ((normalized - 0.2) * 150); // 120° to 180°
  } else {
    // Treble: Blue to Purple
    return 240 + ((normalized - 0.6) * 100); // 240° to 280°
  }
}

/**
 * Calculates dominant color based on frequency content energy distribution
 */
function calculateFrequencyColor(frequencyData: Uint8Array): number {
  const bassEnd = Math.floor(frequencyData.length * 1.2);
  const midEnd = Math.floor(frequencyData.length * 1.6);
  
  let bassSum = 0, midSum = 0, trebleSum = 0;
  
  for (let i = 0; i < bassEnd; i++) bassSum += frequencyData[i];
  for (let i = bassEnd; i < midEnd; i++) midSum += frequencyData[i];
  for (let i = midEnd; i < frequencyData.length; i++) trebleSum += frequencyData[i];
  
  const bassAvg = bassSum / bassEnd;
  const midAvg = midSum / (midEnd - bassEnd);
  const trebleAvg = trebleSum / (frequencyData.length - midEnd);
  
  // Weight by energy, return dominant hue
  if (bassAvg > midAvg && bassAvg > trebleAvg) return 15;    // Orange (bass)
  if (midAvg > bassAvg && midAvg > trebleAvg) return 150;    // Green-Cyan (mid)
  return 260; // Blue-Purple (treble)
}

/**
 * Gets frequency band energies and identifies dominant band
 */
function getFrequencyBands(frequencyData: Uint8Array, visualBoost: number = DEFAULT_VISUAL_BOOST): {
  bass: number;
  mid: number;
  treble: number;
  overall: number;
  dominant: 'bass' | 'mid' | 'treble';
} {
  const bassEnd = Math.floor(frequencyData.length * 0.2);
  const midEnd = Math.floor(frequencyData.length * 0.6);

  let bassSum = 0, midSum = 0, trebleSum = 0;

  for (let i = 0; i < bassEnd; i++) bassSum += frequencyData[i];
  for (let i = bassEnd; i < midEnd; i++) midSum += frequencyData[i];
  for (let i = midEnd; i < frequencyData.length; i++) trebleSum += frequencyData[i];

  // 🔥 Apply visual boost from slider to normalize values (no audio gain change!)
  const bass = Math.min(1, (bassSum / bassEnd / 255) * visualBoost);
  const mid = Math.min(1, (midSum / (midEnd - bassEnd) / 255) * visualBoost);
  const treble = Math.min(1, (trebleSum / (frequencyData.length - midEnd) / 255) * visualBoost);
  const overall = (bass + mid + treble) / 3;

  let dominant: 'bass' | 'mid' | 'treble' = 'mid';
  if (bass > mid && bass > treble) dominant = 'bass';
  else if (treble > bass && treble > mid) dominant = 'treble';

  return { bass, mid, treble, overall, dominant };
}

// ============================================================================
// 🎵 WAVEFORM GENERATION FUNCTIONS - ACCURATE SHAPE RENDERING
// ============================================================================

/**
 * Generate sine wave value at normalized time t (0-1)
 */
function generateSineWave(t: number): number {
  return Math.sin(2 * Math.PI * t);
}

/**
 * Generate square wave value at normalized time t (0-1)
 * Creates sharp transitions between +1 and -1
 */
function generateSquareWave(t: number): number {
  return Math.sign(Math.sin(2 * Math.PI * t));
}

/**
 * Generate tfriangle wave value at normalized time t (0-1)
 * Creates linear ramp up and down
 */
function generateTriangleWave(t: number): number {
  const normalized = t - Math.floor(t); // Wrap to 0-1
  return 2 * Math.abs(2 * normalized - 1) - 1;
}

/**
 * Generate sawtooth wave value at normalized time t (0-1)
 * Creates linear ramp from -1 to +1 then sharp drop
 */
function generateSawtoothWave(t: number): number {
  const normalized = t - Math.floor(t); // Wrap to 0-1
  return 2 * normalized - 1;
}

/**
 * Generate waveform value based on waveform type
 * @param t Normalized time (0-1 represents one complete cycle)
 * @param waveform Type of waveform to generate
 */
function generateWaveform(t: number, waveform: 'sine' | 'square' | 'triangle' | 'sawtooth'): number {
  switch (waveform) {
    case 'sine':
      return generateSineWave(t);
    case 'square':
      return generateSquareWave(t);
    case 'triangle':
      return generateTriangleWave(t);
    case 'sawtooth':
      return generateSawtoothWave(t);
    default:
      return generateSineWave(t); // Fallback to sine
  }
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

// 🔥 FIXED: Minimal interface - only requires what FrequencyVisualizer actually uses
// No longer coupled to full AppState
interface FrequencyVisualizerState {
  // Audio engine reference (optional)
  audio?: {
    audioState?: {
      isPlaying?: boolean;
      waveform?: WaveForm;
    };
  };
  
  // Direct audio properties (fallback if audio engine not available)
  isPlaying?: boolean;
  base_frequency?: number;
  beat_frequency?: number;
  
  // Config object (alternative source for frequencies)
  config?: {
    base_frequency?: number;
    beat_frequency?: number;
    waveform?: WaveForm;
  };
  
  // Optional pattern/EM data for advanced visualizations
  patterns8D?: Pattern8D[];
  currentPattern?: PatternConfig | null;
  electromagnetic?: ElectromagneticField;
  
  // UI state
  mode?: PatternMode;
  activeTab?: string;
}

interface FrequencyVisualizerProps {
  state: FrequencyVisualizerState;
  title?: string;
  showSpectrum?: boolean;
  showFrequencies?: boolean;
  showMetrics?: boolean;
  height?: number;
  width?: number;
  audioContext?: AudioContext;
  analyserNode?: AnalyserNode;
  audioWorklet?: AudioWorkletNode | null;
  // 🔥 NEW: AudioWorklet status for debugging and visibility
  audioWorkletStatus?: {
    moduleLoaded: boolean;
    nodeExists: boolean;
    nodeReference: AudioWorkletNode | null;
    isProcessing: boolean;
  };
}

type VisualizationMode = 'waveform' | 'spiral2d' | 'spiral3d' | 'radial' | 'combined' | 'consciousness';

const VisualizerContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(1),
  height: '100%',
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
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
  showSpectrum = false, // Turned off those annoying bars at the top
  showFrequencies = true,
  showMetrics = true,
  audioContext,
  analyserNode,
    // 🔥 NEW: AudioWorklet status for debugging and visibility
  audioWorkletStatus,
    audioWorklet
}) => {
  // Early return if state is invalid
  if (!state || typeof state !== 'object') {
    return (
      <Box sx={{ p: 2, color: 'error.main', textAlign: 'center' }}>
        <Typography>Frequency Visualizer: Invalid state</Typography>
      </Box>
    );
  }

  // Show initialization message if no analyser node
  if (!analyserNode) {
    return (
      <VisualizerContainer elevation={10}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          minHeight: '300px',
          textAlign: 'center',
          gap: 2
        }}>
          <Typography variant="h6" sx={{ color: '#ff6b00', mb: 1 }}>
            🎵 Frequency Visualizer Ready
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', maxWidth: '400px' }}>
            Click the <strong style={{ color: '#00ff88' }}>Play</strong> button to start audio and see real-time frequency visualization
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            The visualizer will show waveforms, spirals, and butterfly patterns synced to your binaural beats
          </Typography>
        </Box>
      </VisualizerContainer>
    );
  }

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const visualizerContainerRef = useRef<HTMLDivElement>(null);
  const fpsRef = useRef<number>(0);
  const [fps, setFps] = useState(0);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 300 });
  const dimensionsRef = useRef(canvasDimensions);
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('combined');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visualSensitivity, setVisualSensitivity] = useState(10.0);
  const [consciousnessMetrics, setConsciousnessMetrics] = useState<ConsciousnessMetrics | null>(null);
  const [showConsciousnessPanel, setShowConsciousnessPanel] = useState(false);
  const consciousnessMetricsRef = useRef<ConsciousnessMetrics | null>(null);
   // Extract frequency values
  const base_frequency =
    state?.config?.base_frequency ??
    state.base_frequency ??
    DEFAULT_BASE_FREQUENCY;

  const beat_frequency =
    state?.config?.beat_frequency ??
    state.beat_frequency ??
    DEFAULT_BEAT_FREQUENCY;


  const isPlaying =
    state?.audio?.audioState?.isPlaying ??
    state.isPlaying ??
    false;

  // 🔥 CRITICAL FIX: Extract waveform type from audio engine state
  const waveform: 'sine' | 'square' | 'triangle' | 'sawtooth' =
    state?.config?.waveform ??
     state.audio?.audioState?.waveform ??
    'sine'; // Default to sine if not specified

  const { 
    patterns8D = [],
    currentPattern = null,
    electromagnetic = null
  } = state || {};

  // Calculate frequencies
  const leftFreq = base_frequency;
  const rightFreq = base_frequency + beat_frequency;
  const beatFreq = beat_frequency;

  // Match active pattern
  const activePattern = currentPattern && patterns8D
    ? patterns8D.find(p => p.id === currentPattern.id) || null
    : null;

  // Audio analysis hook
  const { analysisData, stats, isAnalyzing } = useAudioAnalysis({
    enabled: isPlaying,
    updateRate: 60,
    audioContext,
    analyserNode
  });

  // Fullscreen handler
  const toggleFullscreen = async () => {
    if (!visualizerContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await visualizerContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
    }
  };
// 🔥 NEW: Enhanced AudioWorklet visibility debugging
  // Run only once on mount to avoid interference
  const debugLoggedRef = React.useRef(false);
  React.useEffect(() => {
    if (!audioContext && !analyserNode) return;
    if (debugLoggedRef.current) return; // Only log once
    debugLoggedRef.current = true;

    // 🔥 REMOVED: Test AudioWorkletNode creation was interfering with audio playback!
    // We already have audioWorkletStatus from the backend engine - no need to test here

    // 🔥 NEW: Display AudioWorklet status if available
    if (audioWorkletStatus) {
      if (audioWorkletStatus.nodeReference) {
        // AudioWorklet node is ready
      }
    } else {
      // No AudioWorklet status available
    }

    // 🔥 NEW: Listen for AudioWorklet metrics responses
    if (audioWorkletStatus?.nodeReference) {
      const handleWorkletMessage = (event: MessageEvent) => {
        if (event.data.type === 'metrics') {
        }
      };

      audioWorkletStatus.nodeReference.port.addEventListener('message', handleWorkletMessage);
      return () => {
        audioWorkletStatus.nodeReference?.port.removeEventListener('message', handleWorkletMessage);
      };
    }
  }, [audioContext, analyserNode, audioWorkletStatus]);
  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Update dimensions ref
  useEffect(() => {
    dimensionsRef.current = canvasDimensions;
  }, [canvasDimensions]);

  // FPS update
  useEffect(() => {
    if (!isPlaying) return;

    const fpsUpdateInterval = setInterval(() => {
      setFps(fpsRef.current);
    }, 1000);

    return () => clearInterval(fpsUpdateInterval);
  }, [isPlaying]);

  // Canvas sizing
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

  // ============================================================================
  // 🔥 MAIN VISUALIZATION LOOP - 100% AUDIO-REACTIVE
  // ============================================================================
  useEffect(() => {
    if (!canvasRef.current || !isPlaying) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    let animationId: number;
    let lastFrameTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;
    let frameCount = 0;
    let fpsTime = 0;

    // Frequency analysis data buffer
    const frequencyData = new Uint8Array(analyserNode?.frequencyBinCount || 2048);

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
        if ("fillStyle" in ctx) {
          ctx.fillStyle = 'rgba(10, 10, 25, 0.3)';
        }
        if ("fillRect" in ctx) {
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const centerY = canvas.height / 2;
        const centerX = canvas.width / 2;

        // 🔥 TIME IN SECONDS - for smooth animation
        const time = timestamp / 1000;

        // 🔥 GET REAL-TIME FREQUENCY DATA
        if (analyserNode) {
          analyserNode.getByteFrequencyData(frequencyData);
        }

        // 🔥 CALCULATE AUDIO BANDS FOR ALL RENDERS (controlled by Signal slider)
        const audioBands = getFrequencyBands(frequencyData, visualSensitivity);

        // 🧠 CONSCIOUSNESS PATTERN ANALYSIS - Real-time detection
        const currentMetrics = analyzeConsciousness(frequencyData, beatFreq, leftFreq);
        consciousnessMetricsRef.current = currentMetrics;

        // Update state every 100ms to avoid excessive re-renders
        if (frameCount % 6 === 0) {
          setConsciousnessMetrics(currentMetrics);
        }

        // Electromagnetic field modulation
        const fieldStrength = electromagnetic?.strength * 50  || 50;
        const fieldFrequency = electromagnetic?.frequency * 50 || beatFreq * 10;

        // Render based on mode
        switch (visualizationMode) {
          case 'waveform':
            renderWaveform(ctx, canvas, centerX, centerY, time, fieldStrength, fieldFrequency, frequencyData, audioBands )
            break;
          case 'spiral2d':
            renderSpiral2D(ctx, canvas, centerX, centerY, time, fieldStrength, fieldFrequency, frequencyData, audioBands);
            break;
          case 'spiral3d':
            renderSpiral3D(ctx, canvas, centerX, centerY, time, fieldStrength, fieldFrequency,frequencyData, audioBands);
            break;
          case 'radial':
            renderRadialBars(ctx, canvas, centerX, centerY, time, fieldStrength, fieldFrequency,frequencyData, audioBands);
            break;
          case 'combined':
            renderRadialBars(ctx, canvas, centerX, centerY, time, fieldStrength, fieldFrequency,frequencyData, audioBands);
            renderSpiral2D(ctx, canvas, centerX, centerY, time, fieldStrength, fieldFrequency,frequencyData, audioBands);
            break;
          case 'consciousness':
            // 🧠 CONSCIOUSNESS VISUALIZATION MODE
            renderConsciousnessOverlay(ctx, canvas, centerX, centerY, time, currentMetrics, audioBands);
            break;
        }

        // 🌀 SACRED GEOMETRY OVERLAYS - Always render when detected (except in consciousness mode)
        if (visualizationMode !== 'consciousness' && showConsciousnessPanel) {
          // Golden Spiral when golden ratio detected
          if (currentMetrics.goldenRatio.detected) {
            drawGoldenSpiral(ctx, centerX, centerY, {
              color: '#FFD700',
              opacity: 0.3,
              rotations: 3,
              scale: Math.min(canvas.width, canvas.height) * 0.002,
              animated: true,
              time
            });
          }

          // Schumann resonance ring when locked
          if (currentMetrics.schumannLock.locked) {
            drawSchumannRing(ctx, centerX, centerY, currentMetrics.schumannLock.frequency, time);
          }

          // Coherence mandala when coherence is high
          if (currentMetrics.coherence > 0.7) {
            drawCoherenceMandala(ctx, centerX, centerY, {
              complexity: currentMetrics.coherence * 12,
              rotationSpeed: currentMetrics.coherence * 0.5,
              colors: generateCoherenceGradient(currentMetrics.coherence),
              radius: Math.min(canvas.width, canvas.height) * 0.15,
              time
            });
          }

          // Brainwave state indicator in top-left corner
          drawBrainwaveIndicator(ctx, 50, 50, currentMetrics.dominantState, audioBands.overall);

          // Entrainment meter at bottom
          drawEntrainmentMeter(ctx, canvas.width - 120, canvas.height - 30, currentMetrics.entrainment, 100);
        }

        // 🔥 FREQUENCY SPECTRUM - NOW 100% AUDIO-REACTIVE
        if (analyserNode && frequencyData.length * 50 > 0 && showSpectrum) {
          const barCount = 128;
          const barWidth = (canvas.width / barCount)
          const maxBarHeight = canvas.height * 0.35;

          for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.min(
              frequencyData.length - 1,
              Math.floor((i / barCount) * frequencyData.length)
            );
            // 🔥 FIXED: Divide by 255 for full range, NO VISUAL BOOST for bars
            const freqValue = Math.min(1, frequencyData[dataIndex] / 255);
            const barHeight = freqValue * maxBarHeight; // Bars stay within 35% of canvas height
            const x = i * barWidth;
            const y = 10;

            // 🔥 COLOR MAPPED TO FREQUENCY BIN
            const hue = mapFrequencyBinToColor(i, barCount);
            const alpha = freqValue * 0.9; // Pure audio-based alpha

            ctx.fillStyle = `hsla(${hue}, 90%, 65%, ${alpha})`;
            ctx.fillRect(x, y, barWidth - 2, barHeight);
          }
        }

        // 8D pattern overlay (if active)
        if (activePattern && activePattern.path.length > 0 && audioBands.overall > 0.1) {
          // 🔥 PATTERN MOVEMENT DRIVEN BY AUDIO ENERGY
          const patternProgress = (audioBands.overall * 10) % 10;
          const pathIndex = Math.floor(patternProgress * activePattern.path.length);
          const point = activePattern.path[pathIndex];

          if (point) {
            const scale = 1.5;
            const x = centerX + point.x * scale;
            const y = centerY + point.y * scale;

            // Size driven by audio
            const glowSize = 40 + (audioBands.overall * 8);

            ctx.beginPath();
            ctx.arc(x, y, glowSize, 0, 2 * Math.PI);
            ctx.fillStyle = activePattern.color;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, glowSize * 2, 0, 2 * Math.PI);
            ctx.strokeStyle = activePattern.color + '88';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    // ========================================================================
    // 🔥 PHASE 3: RENDER WAVEFORM - 100% AUDIO-REACTIVE + LIVE WAVEFORM TYPE
    // ========================================================================
    function renderWaveform(
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      centerX: number,
      centerY: number,
      time: number,
      strength: number,
      frequency: number,
      frequencyData: Uint8Array,
      audioBands: ReturnType<typeof getFrequencyBands>
    ) {
      const dominantHue = calculateFrequencyColor(frequencyData);

      ctx.beginPath();
      ctx.strokeStyle = activePattern?.color || `hsl(${dominantHue}, 90%, 65%)`;
      ctx.lineWidth = 2 + (audioBands.overall * 30); // Audio-reactive thickness
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = audioBands.overall * 50; // Audio-reactive glow
      strength = parseFloat(frequency.toExponential(4));
      const samples = 300; // 🔥 FIXED: Reduced from 40000 to 2500 for 60 FPS
      const cycles = 8;

      for (let i = 0; i < samples; i++) {
        const centerX= (i / samples) * canvas.width;
        const normalizedPos = i / samples;
        const visualT = normalizedPos * cycles;

        // 🔥 CRITICAL FIX: Use actual waveform type from audio engine
        // Generate left and right channel waveforms based on selected type
        const leftWave = generateWaveform(visualT, waveform);
        const rightWave = generateWaveform(
          visualT + (beatFreq / leftFreq) * cycles, // Phase offset for binaural beat
          waveform
        );
        const binauralBeat = (leftWave + rightWave) / 2;

        // 🔥 AMPLITUDE DRIVEN BY AUDIO ENERGY (CRANKED UP 3X!)
        const amplitude = audioBands.overall * 3000 + 20; // Minimum 20px so it's always visible

        const centerY = centerX+ binauralBeat * amplitude;

        if (i === 0) {
          ctx.moveTo(centerX, centerY);
        } else {
          ctx.lineTo(centerX, centerY);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // ========================================================================
    // 🔥 PHASE 4: RENDER SPIRAL 2D - 100% AUDIO-REACTIVE
    // ========================================================================
    function renderSpiral2D(
        ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, centerX: number, centerY: number, time: number, fieldStrength: number, fieldFrequency: number, frequencyData: Uint8Array, audioBands: ReturnType<typeof getFrequencyBands>    ) {
      const numBins = Math.min(frequencyData.length, 256);
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;

      ctx.save();
      ctx.translate(centerX, centerY);

      const numArms = 3;

      for (let arm = 0; arm < numArms; arm++) {
        const armOffset = (arm * Math.PI * 2) / numArms;
        // 🔥 ROTATING RAINBOW HUE - smooth time-based animation
        const hue = (arm * 120 + time * 30) % 360;

        ctx.beginPath();
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
        ctx.lineWidth = 2 + fieldStrength * 0.04; // Field-based thickness
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 8 + fieldStrength * 0.12; // 🔥 FIXED: Reasonable glow (not 250+)

        for (let i = 10; i < numBins; i++) {
          // 🔥 Apply visual boost from slider (clamped to 1.0 max)
          const freqValue = Math.min(1, (frequencyData[i] / 255) * visualSensitivity);
          const t = i / numBins;

          // 🔥 ROTATION SPEED LINKED TO BEAT FREQUENCY - syncs with binaural beats!
          // Higher beat freq = faster rotation. Scale: 10Hz beat = ~0.5 rad/s base speed
          const beatSpeed = beatFreq * 0.05; // Direct Hz to speed multiplier
          const angle = t * Math.PI * 6 + time * beatSpeed + armOffset;

          // 🔥 RADIUS DRIVEN BY FREQUENCY DATA (NO CONSTANTS)
          const radius = t * maxRadius * freqValue;

          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          // 🔥 SPARKLES ONLY WHEN STRONG FREQUENCY
          if (freqValue > 0.6 && i % 8 === 0) {
            ctx.save();
            ctx.fillStyle = `hsla(${(hue + 60) % 360}, 90%, 70%, ${freqValue})`;
            ctx.beginPath();
            ctx.arc(x, y, 2 + freqValue * 3, 0, Math.PI * 2); // 🔥 FIXED: 2-5px sparkles
            ctx.fill();
            ctx.restore();
          }
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    }

    // ========================================================================
    // 🔥 PHASE 5: RENDER SPIRAL 3D - 100% AUDIO-REACTIVE
    // ========================================================================
    function renderSpiral3D(
        ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, centerX: number, centerY: number, time: number, fieldStrength: number, fieldFrequency: number, frequencyData: Uint8Array, audioBands: ReturnType<typeof getFrequencyBands>    ) {
      const numBins = Math.min(frequencyData.length, 256); // 🔥 FIXED: Math.min not Math.max
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.35; // 🔥 FIXED: Proper radius scaling
      const zDepth = 200;

      ctx.save();
      ctx.translate(centerX, centerY);

      const numHelixes = 2;
      for (let helix = 0; helix < numHelixes; helix++) {
        const helixOffset = helix * Math.PI;

        ctx.beginPath();

        for (let i = 0; i < numBins; i++) {
          // 🔥 Apply visual boost from slider (clamped to 1.0 max)
          const freqValue = Math.min(1, (frequencyData[i] / 255) * visualSensitivity);
          const t = i / numBins;

          // 🔥 SMOOTH TIME-BASED ROTATION + audio modulation
          // 🔥 3D HELIX SPEED LINKED TO BEAT FREQUENCY
          const beatSpeed3D = beatFreq * 0.03; // Direct Hz to speed multiplier
          const angle = t * Math.PI * 8 + time * beatSpeed3D + (audioBands.mid * Math.PI) + helixOffset;

          // 🔥 FIXED: Simpler radius formula
          const radius = maxRadius * freqValue * (0.5 + t * 0.5);
          const z = (t - 0.5) * zDepth;

          const perspective = 300 / (300 + z);
          const x = Math.cos(angle) * radius * perspective;
          const y = Math.sin(angle) * radius * perspective + z * 0.3;

          // 🔥 COLOR MAPPED TO FREQUENCY BIN
          const depthHue = mapFrequencyBinToColor(i, numBins);
          
          // 🔥 ALPHA PURE FREQUENCY VALUE
          const depthAlpha = freqValue * perspective;
          
          // 🔥 LINE WIDTH PURE FREQUENCY
          const lineWidth = freqValue * 4 * perspective;

          ctx.strokeStyle = `hsla(${depthHue}, 90%, 65%, ${depthAlpha})`;
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

    // ========================================================================
    // 🔥 PHASE 6: RENDER RADIAL BARS - 100% AUDIO-REACTIVE BUTTERFLY
    // ========================================================================
    function renderRadialBars(
        ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, centerX: number, centerY: number, time: number, fieldStrength: number, fieldFrequency: number, frequencyData: Uint8Array, audioBands: ReturnType<typeof getFrequencyBands>    ) {
      const numBars = Math.min(frequencyData.length, 255);
      const maxBarLength = Math.min(canvas.width, canvas.height) * 0.45;

      ctx.save();
      ctx.translate(centerX, centerY);

      for (let i = 0; i < numBars; i++) {
        // 🔥 FIXED: Divide by 255 for full range
        const freqValue = frequencyData[i] / 255;

        const angle = (i / numBars) * Math.PI * 2 - Math.PI / 2;

        // 🔥 FIXED: Simple bar length formula
        const barLength = freqValue * maxBarLength * (1 + fieldStrength * 0.006);
        const barWidth = (Math.PI * 2) / numBars * maxBarLength * 1.2;

        // 🔥 ROTATING RAINBOW HUE - THE BUTTERFLY EFFECT!
        const hue = ((i / numBars) * 360 + time * 20) % 360;

        const gradient = ctx.createLinearGradient(0, 0, Math.cos(angle) * barLength, Math.sin(angle) * barLength);
        gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.1)`);
        gradient.addColorStop(0.5, `hsla(${hue}, 85%, 65%, ${freqValue * 0.6})`);
        gradient.addColorStop(1, `hsla(${hue}, 90%, 70%, ${freqValue})`);

        ctx.fillStyle = gradient;
        ctx.shadowColor = `hsla(${hue}, 90%, 70%, ${freqValue * 0.8})`;
        ctx.shadowBlur = 15 * freqValue; // 🔥 BRIGHT multiplicative glow

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

        // 🔥 SPARKLE TIPS - THE BUTTERFLY GLOW!
        if (freqValue > 0.5) {
          const tipX = Math.cos(angle) * barLength;
          const tipY = Math.sin(angle) * barLength;

          ctx.fillStyle = `hsla(${(hue + 60) % 360}, 100%, 85%, ${freqValue})`;
          ctx.beginPath();
          ctx.arc(tipX, tipY, 4 + freqValue * 6, 0, Math.PI * 2); // 🔥 FIXED: 4-10px glowing tips
          ctx.fill();
        }
      }

      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // ========================================================================
    // 🧠 CONSCIOUSNESS OVERLAY - SACRED GEOMETRY & METRICS VISUALIZATION
    // ========================================================================
    function renderConsciousnessOverlay(
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      centerX: number,
      centerY: number,
      time: number,
      metrics: ConsciousnessMetrics,
      audioBands: ReturnType<typeof getFrequencyBands>
    ) {
      // Background gradient based on brainwave state
      const stateColor = BRAINWAVE_RANGES[metrics.dominantState].color;
      const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(canvas.width, canvas.height) * 0.7);
      bgGradient.addColorStop(0, `${stateColor}33`);
      bgGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Central coherence mandala - always present, size based on coherence
      const mandalaRadius = Math.min(canvas.width, canvas.height) * 0.25 * (0.5 + metrics.coherence * 0.5);
      drawCoherenceMandala(ctx, centerX, centerY, {
        complexity: metrics.coherence * 12,
        rotationSpeed: metrics.coherence * 0.3,
        colors: generateCoherenceGradient(metrics.coherence),
        radius: mandalaRadius,
        time
      });

      // Golden spiral when detected
      if (metrics.goldenRatio.detected) {
        drawGoldenSpiral(ctx, centerX, centerY, {
          color: '#FFD700',
          opacity: 0.6,
          rotations: 4,
          scale: Math.min(canvas.width, canvas.height) * 0.003,
          animated: true,
          time
        });

        // Golden ratio label
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.fillText(`Golden Ratio: ${metrics.goldenRatio.ratio.toFixed(4)}`, centerX, canvas.height - 80);
      }

      // Schumann resonance rings
      if (metrics.schumannLock.locked) {
        drawSchumannRing(ctx, centerX, centerY, metrics.schumannLock.frequency, time);
      }

      // Brainwave state indicator (larger, centered top)
      drawBrainwaveIndicator(ctx, centerX, 60, metrics.dominantState, audioBands.overall);

      // State label
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = stateColor;
      ctx.textAlign = 'center';
      ctx.fillText(BRAINWAVE_RANGES[metrics.dominantState].label, centerX, 110);
      ctx.fillText(`${metrics.dominantFreq.toFixed(2)} Hz`, centerX, 130);

      // Entrainment meter (bottom center)
      drawEntrainmentMeter(ctx, centerX - 75, canvas.height - 40, metrics.entrainment, 150);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('Entrainment', centerX, canvas.height - 50);

      // Coherence percentage (left side)
      ctx.save();
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = metrics.coherence > 0.7 ? '#00FF00' : metrics.coherence > 0.4 ? '#FFFF00' : '#FF6666';
      ctx.textAlign = 'left';
      ctx.fillText(`${(metrics.coherence * 100).toFixed(0)}%`, 20, canvas.height / 2);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('Coherence', 20, canvas.height / 2 + 20);
      ctx.restore();

      // Heart-Brain coherence (right side)
      ctx.save();
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = metrics.heartBrain > 0.5 ? '#FF69B4' : '#FF9999';
      ctx.textAlign = 'right';
      ctx.fillText(`${(metrics.heartBrain * 100).toFixed(0)}%`, canvas.width - 20, canvas.height / 2);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('Heart-Brain', canvas.width - 20, canvas.height / 2 + 20);
      ctx.restore();

      // Sacred geometry name
      ctx.font = 'italic 14px serif';
      ctx.fillStyle = '#9400D3';
      ctx.textAlign = 'center';
      ctx.fillText(metrics.sacredGeometry, centerX, canvas.height - 10);

      // Chakra activation indicator (if detected)
      if (metrics.activeChakra) {
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = metrics.activeChakra.color;
        ctx.textAlign = 'right';
        ctx.fillText(`${metrics.activeChakra.name} Chakra`, canvas.width - 20, 30);
        ctx.fillText(`${metrics.activeChakra.freq} Hz`, canvas.width - 20, 45);
      }

      // Pulsing energy particles based on coherence
      const numParticles = Math.floor(metrics.coherence * 20);
      for (let i = 0; i < numParticles; i++) {
        // 🔥 PARTICLE SPEED LINKED TO BEAT FREQUENCY
        const beatSpeedParticle = beatFreq * 0.02; // Direct Hz to speed multiplier
        const angle = (i / numParticles) * Math.PI * 2 + time * beatSpeedParticle;
        // 🔥 PULSING SYNCED TO BEAT FREQUENCY
        const beatPulse = beatFreq * 0.01; // Pulse at beat frequency rate
        const distance = mandalaRadius + 20 + Math.sin(time * beatPulse + i) * 10;
        const px = centerX + Math.cos(angle) * distance;
        const py = centerY + Math.sin(angle) * distance;

        ctx.beginPath();
        ctx.arc(px, py, 3 + audioBands.overall * 5, 0, Math.PI * 2);
        ctx.fillStyle = generateCoherenceGradient(metrics.coherence)[i % 3];
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, leftFreq, rightFreq, beatFreq, activePattern, analyserNode, electromagnetic, showSpectrum, visualizationMode, showConsciousnessPanel, visualSensitivity]);

  return (
    <VisualizerContainer
      id="frequencyVisualizer"
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
        minHeight: '100%',
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
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ color: '#fff', fontSize: '0.95rem', lineHeight: 1.2 }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: '#00ff88', 
              fontWeight: 'bold',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Mode: {visualizationMode === 'waveform' ? 'Waveform' : 
                     visualizationMode === 'spiral2d' ? '2D Spiral' :
                     visualizationMode === 'spiral3d' ? '3D Helix' :
                     visualizationMode === 'radial' ? 'Radial Bars (Butterfly)' :
                     'Combined'}
            </Typography>
          </Box>
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
            <ToggleButton value="consciousness" title="Consciousness Patterns">
              <PsychologyIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>

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

          {/* Signal Strength Slider */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, minWidth: 150 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
              Signal
            </Typography>
            <Slider
              value={visualSensitivity}
              onChange={(_, value) => setVisualSensitivity(value as number)}
              min={1}
              max={20}
              step={0.5}
              size="small"
              sx={{
                width: 100,
                color: '#00ff88',
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                },
                '& .MuiSlider-track': {
                  height: 3,
                },
                '& .MuiSlider-rail': {
                  height: 3,
                  opacity: 0.3,
                }
              }}
              title={`Visual Signal Strength: ${visualSensitivity.toFixed(1)}x`}
            />
            <Typography variant="caption" sx={{ color: '#00ff88', fontSize: '0.65rem', minWidth: 30 }}>
              {visualSensitivity.toFixed(1)}x
            </Typography>
          </Box>
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
        <FrequencyDisplay sx={{ mt: 1}}>
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
            label={isPlaying ? '🎵 LIVE AUDIO' : 'PAUSED'}
            size="small"
            sx={{
              backgroundColor: isPlaying ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 152, 0, 0.2)',
              color: isPlaying ? '#00ff88' : '#ff9800',
              border: `1px solid ${isPlaying ? '#00ff88' : '#ff9800'}`,
              fontWeight: 'bold'
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

      {/* 🧠 CONSCIOUSNESS METRICS PANEL */}
      {showMetrics && consciousnessMetrics && showConsciousnessPanel && (
        <Box sx={{
          mt: 1,
          p: 1.5,
          background: 'rgba(148, 0, 211, 0.1)',
          border: '1px solid rgba(148, 0, 211, 0.3)',
          borderRadius: 1,
          flexShrink: 0
        }}>
          <Typography variant="subtitle2" sx={{
            color: '#9400D3',
            fontWeight: 'bold',
            mb: 1,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            🧠 Consciousness Metrics
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, fontSize: '0.75rem' }}>
            {/* Dominant State */}
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                Brainwave State
              </Typography>
              <Typography variant="body2" sx={{
                color: BRAINWAVE_RANGES[consciousnessMetrics.dominantState].color,
                fontWeight: 'bold',
                fontSize: '0.8rem'
              }}>
                {consciousnessMetrics.dominantState.toUpperCase()} ({consciousnessMetrics.dominantFreq.toFixed(2)} Hz)
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.65rem' }}>
                {BRAINWAVE_RANGES[consciousnessMetrics.dominantState].label}
              </Typography>
            </Box>

            {/* Coherence */}
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                Coherence
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={consciousnessMetrics.coherence * 100}
                  sx={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: consciousnessMetrics.coherence > 0.7 ? '#00FF00' : consciousnessMetrics.coherence > 0.4 ? '#FFFF00' : '#FF6666',
                      borderRadius: 4
                    }
                  }}
                />
                <Typography variant="body2" sx={{
                  color: consciousnessMetrics.coherence > 0.7 ? '#00FF00' : '#FFFF00',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  minWidth: '40px'
                }}>
                  {(consciousnessMetrics.coherence * 100).toFixed(0)}%
                </Typography>
              </Box>
            </Box>

            {/* Schumann Lock */}
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                Schumann Resonance
              </Typography>
              <Typography variant="body2" sx={{
                color: consciousnessMetrics.schumannLock.locked ? '#9400D3' : 'rgba(255, 255, 255, 0.4)',
                fontWeight: 'bold',
                fontSize: '0.8rem'
              }}>
                {consciousnessMetrics.schumannLock.locked
                  ? `LOCKED ${consciousnessMetrics.schumannLock.frequency} Hz`
                  : 'Not Locked'}
              </Typography>
            </Box>

            {/* Golden Ratio */}
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                Golden Ratio
              </Typography>
              <Typography variant="body2" sx={{
                color: consciousnessMetrics.goldenRatio.detected ? '#FFD700' : 'rgba(255, 255, 255, 0.4)',
                fontWeight: 'bold',
                fontSize: '0.8rem'
              }}>
                {consciousnessMetrics.goldenRatio.detected
                  ? `DETECTED (${consciousnessMetrics.goldenRatio.ratio.toFixed(4)})`
                  : `Ratio: ${consciousnessMetrics.goldenRatio.ratio.toFixed(4)}`}
              </Typography>
            </Box>

            {/* Entrainment */}
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                Entrainment
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={consciousnessMetrics.entrainment * 100}
                  sx={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: consciousnessMetrics.entrainment > 0.7 ? '#00FF00' : consciousnessMetrics.entrainment > 0.4 ? '#FFFF00' : '#FF0000',
                      borderRadius: 4
                    }
                  }}
                />
                <Typography variant="body2" sx={{
                  color: consciousnessMetrics.entrainment > 0.7 ? '#00FF00' : '#FFFF00',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  minWidth: '40px'
                }}>
                  {(consciousnessMetrics.entrainment * 100).toFixed(0)}%
                </Typography>
              </Box>
            </Box>

            {/* Heart-Brain Coherence */}
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                Heart-Brain Sync
              </Typography>
              <Typography variant="body2" sx={{
                color: consciousnessMetrics.heartBrain > 0.5 ? '#FF69B4' : 'rgba(255, 255, 255, 0.4)',
                fontWeight: 'bold',
                fontSize: '0.8rem'
              }}>
                {(consciousnessMetrics.heartBrain * 100).toFixed(0)}%
              </Typography>
            </Box>

            {/* Sacred Geometry */}
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                Sacred Geometry
              </Typography>
              <Typography variant="body2" sx={{
                color: '#9400D3',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                fontStyle: 'italic'
              }}>
                {consciousnessMetrics.sacredGeometry}
              </Typography>
            </Box>

            {/* Chakra Activation */}
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                Chakra Activation
              </Typography>
              <Typography variant="body2" sx={{
                color: consciousnessMetrics.activeChakra?.color || 'rgba(255, 255, 255, 0.4)',
                fontWeight: 'bold',
                fontSize: '0.8rem'
              }}>
                {consciousnessMetrics.activeChakra
                  ? `${consciousnessMetrics.activeChakra.name} (${consciousnessMetrics.activeChakra.freq} Hz)`
                  : 'None'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Pattern Info */}
      {activePattern && (
        <Box sx={{
          mt: 1,
          p: 1.5,
          background: 'rgba(255, 20, 147, 0.1)',
          border: '1px solid rgba(255, 20, 147, 0.3)',
          borderRadius: 1,
          flexShrink: 0
        }}>
          <Typography variant="subtitle2" sx={{
            color: '#ff1493',
            fontWeight: 'bold',
            mb: 1,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            📊 Pattern Details
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, fontSize: '0.75rem' }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                Direction
              </Typography>
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>
                {activePattern.direction.toUpperCase()}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                Speed
              </Typography>
              <Typography variant="body2" sx={{ color: '#00ff88', fontWeight: 'bold', fontSize: '0.8rem' }}>
                {activePattern.speed.toFixed(2)}x
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                Intensity
              </Typography>
              <Typography variant="body2" sx={{ color: '#ff6b00', fontWeight: 'bold', fontSize: '0.8rem' }}>
                {(activePattern.intensity * 100).toFixed(0)}%
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                EM Frequency
              </Typography>
              <Typography variant="body2" sx={{ color: '#00bfff', fontWeight: 'bold', fontSize: '0.8rem' }}>
                {activePattern.electromagnetic.frequency.toFixed(2)} Hz
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                Wavelength
              </Typography>
              <Typography variant="body2" sx={{ color: '#8a2be2', fontWeight: 'bold', fontSize: '0.8rem' }}>
                {activePattern.electromagnetic.wavelength.toFixed(2)} m
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                Amplitude
              </Typography>
              <Typography variant="body2" sx={{ color: '#ff1493', fontWeight: 'bold', fontSize: '0.8rem' }}>
                {activePattern.electromagnetic.amplitude.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </VisualizerContainer>
  );
};