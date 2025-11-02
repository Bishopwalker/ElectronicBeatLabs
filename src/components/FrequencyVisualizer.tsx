import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, ToggleButtonGroup, ToggleButton, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAudioAnalysis } from '../hooks/useAudioAnalysis';
import type { Pattern8D, PatternConfig, ElectromagneticField, PatternMode, WaveForm } from '../types';
import { DEFAULT_BASE_FREQUENCY, DEFAULT_BEAT_FREQUENCY } from '../constants/audio.constants';
import WavesIcon from '@mui/icons-material/Waves';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import RadarIcon from '@mui/icons-material/Radar';
import GridOnIcon from '@mui/icons-material/GridOn';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

// ============================================================================
// 🔥 AUDIO-REACTIVE HELPER FUNCTIONS - 100% LIVE FREQUENCY ANALYSIS
// ============================================================================

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
function getFrequencyBands(frequencyData: Uint8Array): {
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

  const bass = bassSum / bassEnd / 255; // Normalize to 0-1
  const mid = midSum / (midEnd - bassEnd) / 255;
  const treble = trebleSum / (frequencyData.length - midEnd) / 255;
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
 * Generate triangle wave value at normalized time t (0-1)
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
  // 🔥 NEW: AudioWorklet status for debugging and visibility
  audioWorkletStatus?: {
    moduleLoaded: boolean;
    nodeExists: boolean;
    nodeReference: AudioWorkletNode | null;
    isProcessing: boolean;
  };
}

type VisualizationMode = 'waveform' | 'spiral2d' | 'spiral3d' | 'radial' | 'combined';

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
  showSpectrum = true,
  showFrequencies = true,
  showMetrics = true,
  audioContext,
  analyserNode,
    // 🔥 NEW: AudioWorklet status for debugging and visibility
  audioWorkletStatus,
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
   // Extract frequency values
  const base_frequency =
    state?.config?.base_frequency ??
      state.base_frequency??
       DEFAULT_BASE_FREQUENCY ;

  const beat_frequency =
    state?.config?.beat_frequency ??
      state.base_frequency ??
     DEFAULT_BEAT_FREQUENCY;

  const isPlaying =
    state?.audio?.audioState?.isPlaying ??
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
  const leftFreq = state.base_frequency;
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
      }
    } else {
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

        // 🔥 GET REAL-TIME FREQUENCY DATA
        if (analyserNode) {
          analyserNode.getByteFrequencyData(frequencyData);
        }

        // 🔥 CALCULATE AUDIO BANDS FOR ALL RENDERS
        const audioBands = getFrequencyBands(frequencyData);

        // 🎨 DEBUG: Show audio levels on canvas for troubleshooting (every 10 seconds)
        if (frameCount % 600 === 0) {
          const freqSum = frequencyData.reduce((a, b) => a + b, 0);
          console.log('🎵 FrequencyVisualizer Audio Levels:', {
            bass: (audioBands.bass * 100).toFixed(1) + '%',
            mid: (audioBands.mid * 100).toFixed(1) + '%',
            treble: (audioBands.treble * 100).toFixed(1) + '%',
            overall: (audioBands.overall * 100).toFixed(1) + '%',
            dominant: audioBands.dominant,
            analyserNode: !!analyserNode,
            frequencyDataSum: freqSum
          });

          // 🔥 CRITICAL DEBUG: If no audio detected, diagnose why
          if (freqSum === 0 && analyserNode) {
console.log('🎵 FrequencyVisualizer Audio Worklet Status:', {
  audioWorkletStatus
});
            // 🔥 Check if AudioWorklet is actually playing
            if (audioWorkletStatus?.nodeReference) {
console.log('Deez niggaz playing')
              // Ask the worklet for metrics
              try {
                audioWorkletStatus.nodeReference.port.postMessage({ type: 'get_metrics' });
              } catch (error) {
              }
            }

          }
        }

        // Electromagnetic field modulation
        const fieldStrength = electromagnetic?.strength || 0;
        const fieldFrequency = electromagnetic?.frequency || beatFreq;

        // Render based on mode
        switch (visualizationMode) {
          case 'waveform':
            renderWaveform(ctx, canvas, centerX, centerY, fieldStrength, fieldFrequency, frequencyData, audioBands )
            break;
          case 'spiral2d':
            renderSpiral2D(ctx, canvas, centerX, centerY, fieldStrength, fieldFrequency, frequencyData, audioBands);
            break;
          case 'spiral3d':
            renderSpiral3D(ctx, canvas, centerX, centerY, fieldStrength, fieldFrequency,frequencyData, audioBands);
            break;
          case 'radial':
            renderRadialBars(ctx, canvas, centerX, centerY, fieldStrength, fieldFrequency,frequencyData, audioBands);
            break;
          case 'combined':
            renderRadialBars(ctx, canvas, centerX, centerY, fieldStrength, fieldFrequency,frequencyData, audioBands);
            renderSpiral2D(ctx, canvas, centerX, centerY, fieldStrength, fieldFrequency,frequencyData, audioBands);
            break;
        }

        // 🔥 FREQUENCY SPECTRUM - NOW 100% AUDIO-REACTIVE
        if (analyserNode && frequencyData.length > 0 && showSpectrum) {
          const barWidth = canvas.width / 64;
          const maxBarHeight = canvas.height * 0.15;

          for (let i = 0; i < 64; i++) {
            const dataIndex = Math.floor((i / 64) * frequencyData.length);
            const freqValue = frequencyData[dataIndex] / 255;
            const barHeight = freqValue * maxBarHeight;
            const x = i * barWidth;
            const y = 10;

            // 🔥 COLOR MAPPED TO FREQUENCY BIN
            const hue = mapFrequencyBinToColor(i, 64);
            const alpha = freqValue * 0.9; // Pure audio-based alpha

            ctx.fillStyle = `hsla(${hue}, 90%, 65%, ${alpha})`;
            ctx.fillRect(x, y, barWidth - 2, barHeight);
          }
        }

        // 8D pattern overlay (if active)
        if (activePattern && activePattern.path.length > 0 && audioBands.overall > 0.1) {
          // 🔥 PATTERN MOVEMENT DRIVEN BY AUDIO ENERGY
          const patternProgress = (audioBands.overall * 10) % 1;
          const pathIndex = Math.floor(patternProgress * activePattern.path.length);
          const point = activePattern.path[pathIndex];

          if (point) {
            const scale = 1.5;
            const x = centerX + point.x * scale;
            const y = centerY + point.y * scale;

            // Size driven by audio
            const glowSize = 4 + (audioBands.overall * 8);

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
      strength: number,
      frequency: number,
      frequencyData: Uint8Array,
      audioBands: ReturnType<typeof getFrequencyBands>
    ) {
      const dominantHue = calculateFrequencyColor(frequencyData);

      ctx.beginPath();
      ctx.strokeStyle = activePattern?.color || `hsl(${dominantHue}, 90%, 65%)`;
      ctx.lineWidth = 2 + (audioBands.overall * 3); // Audio-reactive thickness
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = audioBands.overall * 20; // Audio-reactive glow

      const samples = 200;
      const cycles = 3;

      for (let i = 0; i < samples; i++) {
        const x = (i / samples) * canvas.width;
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
        const amplitude = audioBands.overall * 100 * 3.0 + 20; // Minimum 20px so it's always visible

        const y = centerY + binauralBeat * amplitude;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // ========================================================================
    // 🔥 PHASE 4: RENDER SPIRAL 2D - 100% AUDIO-REACTIVE
    // ========================================================================
    function renderSpiral2D(
        ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, centerX: number, centerY: number, fieldStrength: number, fieldFrequency: number, frequencyData: Uint8Array, audioBands: ReturnType<typeof getFrequencyBands>    ) {
      const numBins = Math.min(frequencyData.length, 256);
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;

      ctx.save();
      ctx.translate(centerX, centerY);

      const numArms = 3;
      const armHues = [15, 150, 260]; // Bass, Mid, Treble colors

      for (let arm = 0; arm < numArms; arm++) {
        const armOffset = (arm * Math.PI * 2) / numArms;
        const hue = armHues[arm];

        ctx.beginPath();
        ctx.strokeStyle = `hsla(${hue}, 95%, 70%, ${Math.min(1, audioBands.overall * 1.5)})`;
        ctx.lineWidth = (audioBands.overall * 8) + 2; // THICC lines + minimum
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = (audioBands.overall * 25) + 8; // MASSIVE glow

        for (let i = 0; i < numBins; i++) {
          const freqValue = frequencyData[i] / 255;
          const t = i / numBins;
          
          // 🔥 ROTATION SPEED DRIVEN BY TREBLE
          const angle = t * Math.PI * 6 + (audioBands.treble * Math.PI * 2) + armOffset;
          
          // 🔥 RADIUS DRIVEN BY FREQUENCY DATA (NO CONSTANTS)
          const radius = t * maxRadius * freqValue;

          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          // 🔥 SPARKLES ONLY WHEN STRONG FREQUENCY (NO MINIMUM)
          if (freqValue > 0.7 && i % 8 === 0) {
            ctx.save();
            ctx.fillStyle = `hsla(${hue + 60}, 100%, 80%, ${freqValue})`;
            ctx.beginPath();
            ctx.arc(x, y, freqValue * 5, 0, Math.PI * 2);
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
        ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, centerX: number, centerY: number, fieldStrength: number, fieldFrequency: number, frequencyData: Uint8Array, audioBands: ReturnType<typeof getFrequencyBands>    ) {
      const numBins = Math.min(frequencyData.length, 255);
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.35;
      const zDepth = 200;

      ctx.save();
      ctx.translate(centerX, centerY);

      const numHelixes = 2;
      for (let helix = 0; helix < numHelixes; helix++) {
        const helixOffset = helix * Math.PI;

        ctx.beginPath();

        for (let i = 0; i < numBins; i++) {
          const freqValue = frequencyData[i] / 255;
          const t = i / numBins;

          // 🔥 ROTATION DRIVEN BY MID FREQUENCIES
          const angle = t * Math.PI * 8 + (audioBands.mid * Math.PI * 4) + helixOffset;
          
          // 🔥 RADIUS DRIVEN BY FREQUENCY VALUE
          const radius = maxRadius * 0.6 * freqValue;
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
        ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, centerX: number, centerY: number, fieldStrength: number, fieldFrequency: number, frequencyData: Uint8Array, audioBands: ReturnType<typeof getFrequencyBands>    ) {
      const numBars = Math.min(frequencyData.length / 2, 255);
      const maxBarLength = Math.min(canvas.width, canvas.height) * 0.45;

      ctx.save();
      ctx.translate(centerX, centerY);

      for (let i = 0; i < numBars; i++) {
        // 🔥 PURE FREQUENCY VALUE - CAN GO TO ZERO
        const freqValue = frequencyData[i] / 255;
        
        // 🔥 SKIP IF SILENT (bars disappear when no audio)
        if (freqValue < 0.01) continue;

        const angle = (i / numBars) * Math.PI * 2 - Math.PI / 2;
        
        // 🔥 BAR LENGTH 100% DRIVEN BY FREQUENCY (BOOSTED 2X FOR DRAMA!)
        const barLength = (freqValue * maxBarLength * 2.0) + (maxBarLength * 0.1); // Min 10% length
        const barWidth = (Math.PI * 2) / numBars * maxBarLength * 1.5; // Wider bars

        // 🔥 COLOR MAPPED TO FREQUENCY BIN
        const hue = mapFrequencyBinToColor(i, numBars);

        const gradient = ctx.createLinearGradient(0, 0, Math.cos(angle) * barLength, Math.sin(angle) * barLength);
        gradient.addColorStop(0, `hsla(${hue}, 95%, 65%, ${freqValue * 0.5})`);
        gradient.addColorStop(0.5, `hsla(${hue}, 100%, 70%, ${freqValue * 0.8})`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 75%, ${freqValue})`);

        ctx.fillStyle = gradient;
        ctx.shadowColor = `hsla(${hue}, 100%, 75%, ${freqValue})`;
        ctx.shadowBlur = freqValue * 50 + 10; // MASSIVE glow effect

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

        // 🔥 TIP GLOW ONLY WHEN STRONG (NO MINIMUM)
        if (freqValue > 0.5) {
          const tipX = Math.cos(angle) * barLength;
          const tipY = Math.sin(angle) * barLength;

          ctx.fillStyle = `hsla(${hue + 60}, 100%, 90%, ${freqValue})`;
          ctx.beginPath();
          ctx.arc(tipX, tipY, freqValue * 8, 0, Math.PI * 2);
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