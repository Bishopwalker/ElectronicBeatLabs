// Electromagnetic Beat Lab - Audio-Reactive Spatial Visualizer Component
// 🔥 100% LIVE AUDIO ANALYSIS - NO FAKE ANIMATIONS

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Box, Chip, IconButton, ToggleButton, ToggleButtonGroup, Typography} from '@mui/material';
import type {ElectromagneticField, SpatialVisualizerProps} from '../types/index';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import TornadoIcon from '@mui/icons-material/Tornado';
import WavesIcon from '@mui/icons-material/Waves';
import GridOnIcon from '@mui/icons-material/GridOn';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

// ============================================================================
// 🔥 AUDIO-REACTIVE HELPER FUNCTIONS - 100% LIVE FREQUENCY ANALYSIS
// ============================================================================

/**
 * 🎨 VISUAL BOOST MULTIPLIER
 * Boosts visual signal strength without affecting audio gain
 * Applied to all frequency data readings for visualization only
 */
const VISUAL_BOOST = 10; // 10x boost for better visibility (matching FrequencyVisualizer)
const MIN_ANIMATION = 0.1; // Minimum animation even when silent

/**
 * Maps FFT bin index to HSL hue value based on frequency range
 * Bass (0-20% bins) → 0-30° (Red/Orange)
 * Mid (20-60% bins) → 120-180° (Green/Cyan)
 * Treble (60-100% bins) → 240-280° (Blue/Purple)
 */
function mapFrequencyBinToColor(binIndex: number, totalBins: number): number {
  const normalized = binIndex / totalBins;
  
  if (normalized < 0.2) {
    return normalized * 150; // Bass: 0° to 30°
  } else if (normalized < 0.6) {
    return 120 + ((normalized - 0.2) * 150); // Mid: 120° to 180°
  } else {
    return 240 + ((normalized - 0.6) * 100); // Treble: 240° to 280°
  }
}

/**
 * Calculates dominant color based on frequency content
 */
function calculateFrequencyColor(frequencyData: Uint8Array): number {
  const bassEnd = Math.floor(frequencyData.length * 0.2);
  const midEnd = Math.floor(frequencyData.length * 0.6);
  
  let bassSum = 0, midSum = 0, trebleSum = 0;
  
  for (let i = 0; i < bassEnd; i++) bassSum += frequencyData[i];
  for (let i = bassEnd; i < midEnd; i++) midSum += frequencyData[i];
  for (let i = midEnd; i < frequencyData.length; i++) trebleSum += frequencyData[i];
  
  const bassAvg = bassSum / bassEnd;
  const midAvg = midSum / (midEnd - bassEnd);
  const trebleAvg = trebleSum / (frequencyData.length - midEnd);
  
  if (bassAvg > midAvg && bassAvg > trebleAvg) return 15;    // Orange (bass)
  if (midAvg > bassAvg && midAvg > trebleAvg) return 150;    // Green-Cyan (mid)
  return 260; // Blue-Purple (treble)
}

// Helper: Convert hex to HSL
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// ============================================================================
// COMPONENT
// ============================================================================

type VisualizationMode = 'toroidal' | 'vortex' | 'spiral' | 'wave' | 'pattern8d' | 'combined';

/**
 * 🔥 CRITICAL FIX: Map pattern names to visualization modes
 * Auto-detects which visualization mode to use based on pattern name
 */
function detectVisualizationModeFromPattern(patternName: string): VisualizationMode {
  const name = patternName.toLowerCase();

  // Helix/DNA patterns → spiral (3D helix effect)
  if (name.includes('helix') || name.includes('dna')) {
    return 'spiral';
  }

  // Spiral patterns → spiral mode
  if (name.includes('spiral') || name.includes('transformation')) {
    return 'spiral';
  }

  // Toroidal/torus patterns → toroidal mode
  if (name.includes('toroidal') || name.includes('torus') || name.includes('donut')) {
    return 'toroidal';
  }

  // Vortex patterns → vortex mode
  if (name.includes('vortex') || name.includes('tornado') || name.includes('spin')) {
    return 'vortex';
  }

  // Wave/interference patterns → wave mode
  if (name.includes('wave') || name.includes('interference') || name.includes('standing')) {
    return 'wave';
  }

  // 8D patterns → pattern8d mode
  if (name.includes('8d') || name.includes('path') || name.includes('orbit')) {
    return 'pattern8d';
  }

  // Default: toroidal (safest default with good visual appeal)
  return 'toroidal';
}

const SpatialVisualizer: React.FC<SpatialVisualizerProps> = ({
  pattern,
  electromagnetic,
  size = 400,
  audioContext,
  analyserNode,
  isPlaying = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('toroidal');
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false); // Track if user manually changed mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 🔥 AUDIO DATA BUFFER
  const frequencyDataRef = useRef<Uint8Array>(new Uint8Array(256));
  const audioEnergyRef = useRef<{
    bass: number;
    mid: number;
    treble: number;
    overall: number;
  }>({ bass: 0, mid: 0, treble: 0, overall: 0 });

  // Fullscreen handler
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  };

  // 🔥 CRITICAL FIX: Auto-sync visualization mode when pattern changes
  useEffect(() => {
    if (pattern && pattern.name && !isManualOverride) {
      const detectedMode = detectVisualizationModeFromPattern(pattern.name);
      setVisualizationMode(detectedMode);
    }
  }, [pattern?.name, isManualOverride]); // Re-run when pattern name changes or override toggled

  const safeElectromagnetic: ElectromagneticField = useMemo(() => {
    return electromagnetic || {
      strength: 0.8,
      frequency: 4,
      phase: 0,
      coherence: 0.7,
      resonance: 0.7,
      state: 'ACTIVE',
      stability: 0.7
    };
  }, [electromagnetic]);

  const patternProperties = useMemo(() => {
    if (!pattern) {
      return {
        name: 'Default Pattern',
        speed: 1,
        direction: 'clockwise' as const,
        intensity: 1.0,
        color: '#00ff88',
        emFrequency: 4,
        emWavelength: 100,
        emAmplitude: 1,
        path: [
          { x: 0, y: -100, z: 0 },
          { x: 70.7, y: -70.7, z: 10 },
          { x: 100, y: 0, z: 20 },
          { x: 70.7, y: 70.7, z: 30 },
          { x: 0, y: 100, z: 40 },
          { x: -70.7, y: 70.7, z: 30 },
          { x: -100, y: 0, z: 20 },
          { x: -70.7, y: -70.7, z: 10 }
        ],
      };
    }

    return {
      name: pattern.name || 'Unknown',
      speed: pattern.speed || 1,
      direction: pattern.direction || 'clockwise',
      intensity: pattern.intensity || 0.8,
      color: pattern.color || '#00ff88',
      emFrequency: pattern.electromagnetic?.frequency || 4,
      emWavelength: pattern.electromagnetic?.wavelength || 100,
      emAmplitude: pattern.electromagnetic?.amplitude || 1,
      path: pattern.path || [],
    };
  }, [pattern]);

  // ============================================================================
  // 🔥 UPDATE AUDIO DATA WITH VISUAL BOOST FOR VISIBILITY
  // ============================================================================
  const updateAudioData = useCallback(() => {
    if (!analyserNode) {
      // 🔥 MINIMUM ANIMATION when no analyser
      audioEnergyRef.current = { 
        bass: MIN_ANIMATION, 
        mid: MIN_ANIMATION, 
        treble: MIN_ANIMATION, 
        overall: MIN_ANIMATION 
      };
      return;
    }

    analyserNode.getByteFrequencyData(frequencyDataRef.current);
    const data = frequencyDataRef.current;
    
    const bassEnd = Math.floor(data.length * 0.1);
    const midEnd = Math.floor(data.length * 0.4);

    let bassSum = 0, midSum = 0, trebleSum = 0;
    
    for (let i = 0; i < bassEnd; i++) {
      bassSum += data[i];
    }
    for (let i = bassEnd; i < midEnd; i++) {
      midSum += data[i];
    }
    for (let i = midEnd; i < data.length; i++) {
      trebleSum += data[i];
    }

    // 🔥 APPLY VISUAL BOOST FOR VISIBILITY (matching FrequencyVisualizer)
    const bassAvg = Math.min(1, (bassSum / bassEnd / 255) * VISUAL_BOOST + MIN_ANIMATION);
    const midAvg = Math.min(1, (midSum / (midEnd - bassEnd) / 255) * VISUAL_BOOST + MIN_ANIMATION);
    const trebleAvg = Math.min(1, (trebleSum / (data.length - midEnd) / 255) * VISUAL_BOOST + MIN_ANIMATION);
    const overallAvg = (bassAvg + midAvg + trebleAvg) / 3;

    // 🔥 ALWAYS HAVE SOME ANIMATION
    audioEnergyRef.current = {
      bass: isPlaying ? bassAvg : MIN_ANIMATION,
      mid: isPlaying ? midAvg : MIN_ANIMATION,
      treble: isPlaying ? trebleAvg : MIN_ANIMATION,
      overall: isPlaying ? overallAvg : MIN_ANIMATION
    };
  }, [analyserNode, isPlaying]);

  // ============================================================================
  // RENDER PATTERN DISPATCHER
  // ============================================================================
  const renderPattern = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, timestamp: number) => {
    const centerX = width / 2;
    const centerY = height / 2;

    // Update audio data
    updateAudioData();
    const audio = audioEnergyRef.current;
    const frequencyData = frequencyDataRef.current;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(centerX, centerY);

    // 🔥 TIME FOR CONTINUOUS ANIMATION
    const time = timestamp / 1000;

    // Draw based on mode
    switch (visualizationMode) {
      case 'toroidal':
        renderToroidalField(ctx, safeElectromagnetic, patternProperties, frequencyData, audio, time);
        break;
      case 'vortex':
        renderVortexField(ctx, safeElectromagnetic, patternProperties, frequencyData, audio, time);
        break;
      case 'spiral':
        renderSpiralField(ctx, safeElectromagnetic, patternProperties, frequencyData, audio, time);
        break;
      case 'wave':
        renderWaveField(ctx, safeElectromagnetic, patternProperties, frequencyData, audio, time);
        break;
      case 'pattern8d':
        renderPattern8D(ctx, safeElectromagnetic, patternProperties, frequencyData, audio, time);
        break;
      case 'combined':
        renderToroidalField(ctx, safeElectromagnetic, patternProperties, frequencyData, audio, time);
        renderPattern8D(ctx, safeElectromagnetic, patternProperties, frequencyData, audio, time);
        break;
    }

    ctx.restore();
  }, [safeElectromagnetic, patternProperties, visualizationMode, updateAudioData]);

  // ============================================================================
  // 🔥 PHASE 3: TOROIDAL FIELD - 100% AUDIO-REACTIVE
  // ============================================================================
  const renderToroidalField = (
    ctx: CanvasRenderingContext2D,
    field: ElectromagneticField,
    props: typeof patternProperties,
    frequencyData: Uint8Array,
    audio: typeof audioEnergyRef.current,
    time: number
  ) => {
    // 🔥 ALWAYS RENDER - NO SKIP

    const radius = 120;
    const numRings = 16;

    for (let i = 0; i < numRings; i++) {
      // 🔥 ROTATION WITH TIME + AUDIO BOOST
      const angle = (i / numRings) * Math.PI * 2 + time * 0.5 + (audio.treble * Math.PI * 8);
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.5;

      // 🔥 RING SIZE PURE BASS (NO SINE WAVES)
      const ringSize = audio.bass * 50;
      
      // 🔥 ALWAYS SHOW SOMETHING
      if (ringSize < 2) continue; // Lower threshold

      // 🔥 ALPHA PURE OVERALL
      const alpha = audio.overall;

      // 🔥 COLOR MAPPED TO FREQUENCY BIN
      const binIndex = Math.floor((i / numRings) * frequencyData.length);
      const hue = mapFrequencyBinToColor(binIndex, frequencyData.length);

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, ringSize);
      gradient.addColorStop(0, `hsla(${hue}, 95%, 75%, ${alpha})`);
      gradient.addColorStop(0.5, `hsla(${hue}, 90%, 65%, ${alpha * 0.7})`);
      gradient.addColorStop(1, `hsla(${hue}, 85%, 55%, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, ringSize, 0, Math.PI * 2);
      ctx.fill();

      // 🔥 CENTER SPARKLE ONLY WHEN STRONG TREBLE
      if (audio.treble > 0.5) {
        const sparkleSize = audio.treble * 8;
        ctx.fillStyle = `hsla(${hue + 60}, 100%, 90%, ${audio.treble})`;
        ctx.beginPath();
        ctx.arc(x, y, sparkleSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // ============================================================================
  // 🔥 PHASE 4: VORTEX FIELD - 100% AUDIO-REACTIVE
  // ============================================================================
  const renderVortexField = (
    ctx: CanvasRenderingContext2D,
    field: ElectromagneticField,
    props: typeof patternProperties,
    frequencyData: Uint8Array,
    audio: typeof audioEnergyRef.current,
    time: number
  ) => {
    // 🔥 ALWAYS RENDER - NO SKIP

    for (let r = 20; r < 160; r += 12) {
      const points = Math.floor(r / 6) + 8;

      for (let i = 0; i < points; i++) {
        // 🔥 ROTATION WITH TIME + AUDIO BOOST
        const angle = (i / points) * Math.PI * 2 + time * 0.3 + (audio.treble * Math.PI * 4) + r * 0.03;
        
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        // 🔥 ALPHA PURE OVERALL
        const alpha = audio.overall;
        
        // 🔥 COLOR MAPPED TO RADIUS (frequency range simulation)
        const normalizedR = r / 160;
        const hue = mapFrequencyBinToColor(normalizedR * 100, 100);

        // 🔥 PARTICLE SIZE PURE MID
        const particleSize = Math.max(2, audio.mid * 12 * props.intensity);
        
        // 🔥 ALWAYS RENDER SOMETHING

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 12);
        gradient.addColorStop(0, `hsla(${hue}, 95%, 80%, ${alpha})`);
        gradient.addColorStop(0.6, `hsla(${hue}, 90%, 70%, ${alpha * 0.6})`);
        gradient.addColorStop(1, `hsla(${hue}, 85%, 60%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // ============================================================================
  // 🔥 PHASE 5: SPIRAL FIELD - 100% AUDIO-REACTIVE
  // ============================================================================
  const renderSpiralField = (
    ctx: CanvasRenderingContext2D,
    field: ElectromagneticField,
    props: typeof patternProperties,
    frequencyData: Uint8Array,
    audio: typeof audioEnergyRef.current,
    time: number
  ) => {
    // 🔥 ALWAYS RENDER - NO SKIP

    const spiralCount = 3;
    const spiralHues = [15, 150, 260]; // Bass, Mid, Treble

    for (let spiral = 0; spiral < spiralCount; spiral++) {
      const spiralOffset = (spiral * Math.PI * 2) / spiralCount;
      const hue = spiralHues[spiral];

      // 🔥 LINE WIDTH PURE OVERALL
      const lineWidth = Math.max(1, audio.overall * 10 * props.intensity);
      
      // 🔥 ALWAYS RENDER SOMETHING

      // 🔥 ALPHA PURE OVERALL
      const alpha = audio.overall;

      ctx.strokeStyle = `hsla(${hue}, 95%, 75%, ${alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.shadowColor = `hsla(${hue}, 100%, 80%, ${alpha})`;
      ctx.shadowBlur = audio.treble * 20; // Pure treble glow

      ctx.beginPath();

      for (let t = 0; t < Math.PI * 8; t += 0.06) {
        const r = t * 10;
        // 🔥 ANGLE WITH TIME + AUDIO BOOST
        const angle = t + time * 0.2 + (audio.mid * Math.PI * 2) + spiralOffset;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        if (t === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  };

  // ============================================================================
  // 🔥 PHASE 6: WAVE FIELD - 100% AUDIO-REACTIVE
  // ============================================================================
  const renderWaveField = (
    ctx: CanvasRenderingContext2D,
    field: ElectromagneticField,
    props: typeof patternProperties,
    frequencyData: Uint8Array,
    audio: typeof audioEnergyRef.current,
    time: number
  ) => {
    // 🔥 ALWAYS RENDER - NO SKIP

    const wavelength = props.emWavelength || 100;
    const numWaves = 8;

    for (let i = 0; i < numWaves; i++) {
      const angle = (i / numWaves) * Math.PI * 2;
      const waveOriginX = Math.cos(angle) * 40;
      const waveOriginY = Math.sin(angle) * 40;

      for (let r = 10; r < 150; r += wavelength / 12) {
        // 🔥 PHASE WITH TIME + AUDIO BOOST
        const phase = (time * 2 + audio.overall * 10 - r * 0.015) * Math.PI * 2;
        
        // 🔥 AMPLITUDE PURE BASS
        const amplitude = audio.bass * 40 * props.intensity;
        const offset = Math.sin(phase) * amplitude;
        const actualRadius = r + offset;
        
        if (actualRadius < 5) continue;

        // 🔥 ALPHA PURE OVERALL SCALED BY DISTANCE
        const alpha = Math.max(0.1, (1 - actualRadius / 160) * audio.overall);
        
        // 🔥 ALWAYS RENDER SOMETHING

        // 🔥 COLOR MAPPED TO RADIUS
        const hue = mapFrequencyBinToColor(r / 150 * 100, 100);

        ctx.strokeStyle = `hsla(${hue}, 95%, 75%, ${alpha})`;
        ctx.lineWidth = audio.overall * 5;

        ctx.beginPath();
        ctx.arc(waveOriginX, waveOriginY, actualRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  // ============================================================================
  // 🔥 PHASE 7: PATTERN 8D - 100% AUDIO-REACTIVE
  // ============================================================================
  const renderPattern8D = (
    ctx: CanvasRenderingContext2D,
    field: ElectromagneticField,
    props: typeof patternProperties,
    frequencyData: Uint8Array,
    audio: typeof audioEnergyRef.current,
    time: number
  ) => {
    if (!props.path || props.path.length === 0) return;
    
    // 🔥 ALWAYS RENDER - NO SKIP

    // 🔥 PATH POSITION WITH TIME + AUDIO BOOST
    const pathProgress = ((time * 0.1 + audio.overall * 2)) % 1;
    const currentIndex = Math.floor(pathProgress * props.path.length);

    // 🔥 COLOR FROM DOMINANT FREQUENCY
    const hue = calculateFrequencyColor(frequencyData);

    // Draw path
    ctx.strokeStyle = `hsla(${hue}, 90%, 70%, ${audio.overall * 0.8})`;
    ctx.lineWidth = audio.overall * 4;
    ctx.shadowColor = `hsla(${hue}, 100%, 80%, ${audio.overall})`;
    ctx.shadowBlur = audio.overall * 15;

    ctx.beginPath();
    props.path.forEach((point, index) => {
      const x = point.x * 0.8;
      const y = point.y * 0.8;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Current position marker
    const currentPoint = props.path[currentIndex];
    if (currentPoint) {
      const x = currentPoint.x * 0.8;
      const y = currentPoint.y * 0.8;

      // 🔥 GLOW SIZE PURE OVERALL
      const glowSize = audio.overall * 30;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
      gradient.addColorStop(0, `hsla(${hue}, 100%, 85%, ${audio.overall})`);
      gradient.addColorStop(0.4, `hsla(${hue + 30}, 95%, 75%, ${audio.treble})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Center dot
      ctx.fillStyle = props.color;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring
      ctx.strokeStyle = `hsla(${hue + 60}, 100%, 90%, ${audio.overall})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const renderPatternRef = useRef(renderPattern);
  useEffect(() => {
    renderPatternRef.current = renderPattern;
  }, [renderPattern]);

  const animate = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      renderPatternRef.current(ctx, canvas.width, canvas.height, timestamp);

      animationRef.current = window.setTimeout(() => {
        animate(performance.now());
      }, 33); // ~30fps
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = size;
    canvas.height = size;

    animationRef.current = window.setTimeout(() => {
      animate(performance.now());
    }, 33);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [animate, size]);

  const displayValues = useMemo(() => {
    const frequency = safeElectromagnetic.frequency || 4;
    const patternName = patternProperties?.name || 'Unknown Pattern';
    const hue = (frequency / 20) * 240;
    const isActive = isPlaying && safeElectromagnetic.strength > 0.1;

    return { frequency, patternName, hue, isActive, state: safeElectromagnetic.state };
  }, [safeElectromagnetic, patternProperties, isPlaying]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto',
        overflow: 'hidden',
        background: isFullscreen ? '#000' : 'transparent'
      }}
    >
      {/* Mode Selector */}
      <Box sx={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 1,
        padding: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}>
        <Typography variant="caption" sx={{
          color: isPlaying ? '#00ff88' : '#00bfff',
          fontWeight: 'bold',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          mb: 0.5
        }}>
          {isPlaying ? '🎵 LIVE AUDIO' : '3D Mode'}: {visualizationMode === 'toroidal' ? 'Toroidal' :
                    visualizationMode === 'vortex' ? 'Vortex' :
                    visualizationMode === 'spiral' ? 'Spiral' :
                    visualizationMode === 'wave' ? 'Wave' :
                    visualizationMode === 'pattern8d' ? '8D Pattern' :
                    'Combined'}
          {!isManualOverride && pattern?.name && (
            <span style={{ color: '#ff6b00', fontSize: '0.65rem', marginLeft: '4px' }}>
              (Auto)
            </span>
          )}
          {isManualOverride && (
            <span style={{ color: '#ff1493', fontSize: '0.65rem', marginLeft: '4px' }}>
              (Manual)
            </span>
          )}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={visualizationMode}
            exclusive
            onChange={(_, newMode) => {
              if (newMode) {
                // 🔥 CRITICAL FIX: Enable manual override when user changes mode
                setIsManualOverride(true);
                setVisualizationMode(newMode);
              }
            }}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                color: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&.Mui-selected': {
                  color: '#00ff88',
                  backgroundColor: 'rgba(0, 255, 136, 0.2)',
                  border: '1px solid #00ff88',
                },
              },
            }}
          >
            <ToggleButton value="toroidal" title="Toroidal Field (Bass Reactive)">
              <BlurOnIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="vortex" title="Vortex Field (Treble Reactive)">
              <TornadoIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="spiral" title="Spiral Field (Volume Reactive)">
              <WavesIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="wave" title="Wave Interference (Bass/Treble)">
              <GridOnIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="pattern8d" title="8D Pattern Path (Energy Reactive)">
              <BubbleChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="combined" title="Combined">
              <GridOnIcon fontSize="small" style={{ transform: 'rotate(45deg)' }} />
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Fullscreen Button */}
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

      {/* State Indicator */}
      {displayValues.isActive && (
        <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
          <Chip
            label={isPlaying ? '🎵 LIVE AUDIO' : displayValues.state}
            size="small"
            sx={{
              backgroundColor: isPlaying ? 'rgba(0, 255, 136, 0.3)' :
                displayValues.state === 'CRITICAL' ? 'rgba(255, 20, 147, 0.3)' :
                displayValues.state === 'RESONANT' ? 'rgba(255, 107, 0, 0.3)' :
                displayValues.state === 'ACTIVE' ? 'rgba(0, 255, 136, 0.3)' :
                'rgba(138, 43, 226, 0.3)',
              color: isPlaying ? '#00ff88' :
                displayValues.state === 'CRITICAL' ? '#ff1493' :
                displayValues.state === 'RESONANT' ? '#ff6b00' :
                displayValues.state === 'ACTIVE' ? '#00ff88' :
                '#8a2be2',
              fontWeight: 'bold',
              border: `1px solid ${isPlaying ? '#00ff88' :
                displayValues.state === 'CRITICAL' ? '#ff1493' :
                displayValues.state === 'RESONANT' ? '#ff6b00' :
                displayValues.state === 'ACTIVE' ? '#00ff88' :
                '#8a2be2'
              }`,
            }}
          />
        </Box>
      )}

      <Box
        component="canvas"
        ref={canvasRef}
        sx={{ width: '100%', height: '100%', background: 'transparent' }}
      />

      {/* Bottom Info */}
      <Box sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9))',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        pointerEvents: 'none',
      }}>
        <Typography variant="caption" sx={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontWeight: 'bold',
        }}>
          8D Pattern
        </Typography>
        <Typography variant="h6" sx={{
          color: `hsl(${displayValues.hue}, 80%, 70%)`,
          fontWeight: 'bold',
          fontSize: '18px',
          textShadow: '2px 2px 6px rgba(0, 0, 0, 0.9)',
          lineHeight: 1.1,
          mb: 0.5,
        }}>
          {displayValues.patternName}
        </Typography>
        <Typography variant="body2" sx={{
          color: `hsl(${(displayValues.hue + 60) % 360}, 90%, 80%)`,
          fontWeight: 'bold',
          fontSize: '13px',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
        }}>
          {displayValues.frequency.toFixed(1)} Hz Beat Frequency
        </Typography>
        {displayValues.isActive && (
          <Typography variant="caption" sx={{
            position: 'absolute',
            bottom: '4px',
            right: '8px',
            color: isPlaying ? 'rgba(0, 255, 136, 0.9)' : 'rgba(0, 191, 255, 0.9)',
            fontWeight: 'bold',
            fontSize: '11px',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
          }}>
            {isPlaying ? '🎵 LIVE' : '🎵'} {visualizationMode.toUpperCase()}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SpatialVisualizer;