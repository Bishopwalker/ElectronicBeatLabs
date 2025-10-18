// Electromagnetic Beat Lab - Enhanced Spatial Visualizer Component
// 3D visualization of electromagnetic field patterns with deep pattern integration

import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, Chip } from '@mui/material';
import type { SpatialVisualizerProps, ElectromagneticField, Pattern8D } from '../types/index';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import TornadoIcon from '@mui/icons-material/Tornado';
import WavesIcon from '@mui/icons-material/Waves';
import GridOnIcon from '@mui/icons-material/GridOn';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';

type VisualizationMode = 'toroidal' | 'vortex' | 'spiral' | 'wave' | 'pattern8d' | 'combined';

const SpatialVisualizer: React.FC<SpatialVisualizerProps> = ({
  pattern,
  electromagnetic,
  size = 400
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const timeRef = useRef<number>(0);
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('toroidal');

  // 🔥 CRITICAL: Ensure we always have valid electromagnetic data (MEMOIZED)
  const safeElectromagnetic: ElectromagneticField = useMemo(() => {
    return electromagnetic || {
      strength: 0.8, // 🔥 INCREASED default for visibility
      frequency: 4,
      phase: 0,
      coherence: 0.7,
      resonance: 0.7,
      state: 'ACTIVE',
      stability: 0.7
    };
  }, [electromagnetic]);

  // 🎨 ENHANCED: Extract pattern properties for visualization
  const patternProperties = useMemo(() => {
    if (!pattern) {
      return {
        name: 'Default Pattern',
        speed: 1,
        direction: 'clockwise' as const,
        intensity: 1.0, // 🔥 FULL intensity by default
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

  // Render electromagnetic field pattern based on mode
  const renderPattern = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const time = timeRef.current;

    // Clear canvas with black background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(centerX, centerY);

    console.log('🎨 Rendering mode:', visualizationMode); // 🔥 DEBUG

    // Draw field lines based on visualization mode
    switch (visualizationMode) {
      case 'toroidal':
        renderToroidalField(ctx, safeElectromagnetic, patternProperties, time);
        break;
      case 'vortex':
        renderVortexField(ctx, safeElectromagnetic, patternProperties, time);
        break;
      case 'spiral':
        renderSpiralField(ctx, safeElectromagnetic, patternProperties, time);
        break;
      case 'wave':
        renderWaveField(ctx, safeElectromagnetic, patternProperties, time);
        break;
      case 'pattern8d':
        renderPattern8D(ctx, safeElectromagnetic, patternProperties, time);
        break;
      case 'combined':
        renderToroidalField(ctx, safeElectromagnetic, patternProperties, time);
        renderPattern8D(ctx, safeElectromagnetic, patternProperties, time);
        break;
      default:
        renderToroidalField(ctx, safeElectromagnetic, patternProperties, time);
    }

    ctx.restore();
  }, [safeElectromagnetic, patternProperties, visualizationMode]);

  // 🌀 BULLETPROOF: Toroidal field - HIGHLY VISIBLE
  const renderToroidalField = (
    ctx: CanvasRenderingContext2D,
    field: ElectromagneticField,
    props: typeof patternProperties,
    time: number
  ) => {
    console.log('🔥 renderToroidalField called'); // DEBUG
    
    const radius = 120;
    const fieldStrength = Math.max(0.5, Math.min(1, field.strength || 0.8)); // 🔥 MIN 0.5
    const fieldFreq = Math.max(1, field.frequency || 4);
    const resonance = Math.max(0.5, field.resonance || 0.7);

    const numRings = 16; // 🔥 FIXED number for visibility

    for (let i = 0; i < numRings; i++) {
      const animSpeed = 0.001 * props.speed;
      const directionMultiplier = props.direction === 'counterclockwise' ? -1 : 1;
      const angle = (i / numRings) * Math.PI * 2 + time * animSpeed * directionMultiplier;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.5;

      // 🔥 MINIMUM alpha of 0.6 for visibility!
      const alpha = 0.6 + fieldStrength * 0.4;

      const baseColor = hexToHSL(props.color);
      const hue = (baseColor.h + i * 20) % 360;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 50);
      gradient.addColorStop(0, `hsla(${hue}, 90%, 70%, ${alpha})`);
      gradient.addColorStop(0.5, `hsla(${hue}, 85%, 60%, ${alpha * 0.7})`);
      gradient.addColorStop(1, `hsla(${hue}, 80%, 50%, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      const ringSize = 30 + Math.sin(time * 0.002 + i) * 8;
      ctx.arc(x, y, ringSize, 0, Math.PI * 2);
      ctx.fill();

      // 🔥 BRIGHT center sparkle
      ctx.fillStyle = `hsla(${hue + 40}, 100%, 80%, ${alpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    console.log('✅ renderToroidalField complete'); // DEBUG
  };

  // 🌪️ BULLETPROOF: Vortex field - HIGHLY VISIBLE
  const renderVortexField = (
    ctx: CanvasRenderingContext2D,
    field: ElectromagneticField,
    props: typeof patternProperties,
    time: number
  ) => {
    console.log('🔥 renderVortexField called'); // DEBUG

    const fieldStrength = Math.max(0.7, field.strength || 0.8); // 🔥 MIN 0.7
    const fieldFreq = Math.max(1, field.frequency || 4);

    const baseColor = hexToHSL(props.color);

    // 🔥 SIMPLIFIED: Fixed number of particles for visibility
    for (let r = 20; r < 160; r += 12) {
      const points = Math.floor(r / 6) + 8;

      for (let i = 0; i < points; i++) {
        const rotSpeed = 0.002 * props.speed;
        const directionMultiplier = props.direction === 'counterclockwise' ? -1 : 1;
        const angle = (i / points) * Math.PI * 2 + time * rotSpeed * directionMultiplier + r * 0.03;
        
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        const alpha = 0.7 + fieldStrength * 0.3; // 🔥 MIN 0.7 alpha
        const hue = (baseColor.h + (r / 160) * 120 + time * 0.02) % 360;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 12);
        gradient.addColorStop(0, `hsla(${hue}, 90%, 75%, ${alpha})`);
        gradient.addColorStop(0.6, `hsla(${hue}, 85%, 65%, ${alpha * 0.6})`);
        gradient.addColorStop(1, `hsla(${hue}, 80%, 55%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 8 + fieldStrength * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    console.log('✅ renderVortexField complete'); // DEBUG
  };

  // 🌀 BULLETPROOF: Spiral field - HIGHLY VISIBLE
  const renderSpiralField = (
    ctx: CanvasRenderingContext2D,
    field: ElectromagneticField,
    props: typeof patternProperties,
    time: number
  ) => {
    console.log('🔥 renderSpiralField called'); // DEBUG

    const fieldStrength = Math.max(0.7, field.strength || 0.8);
    const alpha = 0.8 + fieldStrength * 0.2; // 🔥 MIN 0.8 alpha

    const spiralCount = 3;
    const baseColor = hexToHSL(props.color);

    for (let spiral = 0; spiral < spiralCount; spiral++) {
      const spiralOffset = (spiral * Math.PI * 2) / spiralCount;
      const hue = (baseColor.h + spiral * 60) % 360;

      ctx.strokeStyle = `hsla(${hue}, 90%, 70%, ${alpha})`;
      ctx.lineWidth = 4 + fieldStrength * 3; // 🔥 THICKER lines
      ctx.shadowColor = `hsla(${hue}, 95%, 75%, ${alpha})`;
      ctx.shadowBlur = 15; // 🔥 STRONG glow

      ctx.beginPath();

      const directionMultiplier = props.direction === 'counterclockwise' ? -1 : 1;
      const spiralSpeed = 0.001 * props.speed;

      for (let t = 0; t < Math.PI * 8; t += 0.06) {
        const r = t * 10;
        const angle = t * directionMultiplier + time * spiralSpeed + spiralOffset;
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

    console.log('✅ renderSpiralField complete'); // DEBUG
  };

  // 🌊 BULLETPROOF: Wave interference - HIGHLY VISIBLE
  const renderWaveField = (
    ctx: CanvasRenderingContext2D,
    field: ElectromagneticField,
    props: typeof patternProperties,
    time: number
  ) => {
    console.log('🔥 renderWaveField called'); // DEBUG

    const fieldStrength = Math.max(0.7, field.strength || 0.8);
    const fieldFreq = Math.max(1, field.frequency || 4);
    
    const wavelength = props.emWavelength || 100;
    const numWaves = 8;
    const baseColor = hexToHSL(props.color);

    for (let i = 0; i < numWaves; i++) {
      const angle = (i / numWaves) * Math.PI * 2;
      const waveOriginX = Math.cos(angle) * 40;
      const waveOriginY = Math.sin(angle) * 40;

      for (let r = 10; r < 150; r += wavelength / 12) {
        const phase = (time * 0.001 * fieldFreq * props.speed - r * 0.015) * Math.PI * 2;
        const offset = Math.sin(phase) * 15;
        const actualRadius = r + offset;
        
        if (actualRadius < 5) continue;

        const alpha = (1 - actualRadius / 160) * 0.6 + 0.4; // 🔥 MIN 0.4 alpha
        const hue = (baseColor.h + r * 0.4 + i * 45) % 360;

        ctx.strokeStyle = `hsla(${hue}, 90%, 70%, ${alpha})`;
        ctx.lineWidth = 3 + fieldStrength * 2; // 🔥 THICKER

        ctx.beginPath();
        ctx.arc(waveOriginX, waveOriginY, actualRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    console.log('✅ renderWaveField complete'); // DEBUG
  };

  // 🎯 Pattern8D path visualization
  const renderPattern8D = (
    ctx: CanvasRenderingContext2D,
    field: ElectromagneticField,
    props: typeof patternProperties,
    time: number
  ) => {
    console.log('🔥 renderPattern8D called'); // DEBUG
    
    if (!props.path || props.path.length === 0) {
      console.warn('⚠️ No path data for pattern8d');
      return;
    }

    const pathProgress = (time * 0.0005 * props.speed) % 1;
    const currentIndex = Math.floor(pathProgress * props.path.length);

    const baseColor = hexToHSL(props.color);
    const hue = baseColor.h;

    // Draw full path
    ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.6)`;
    ctx.lineWidth = 3;
    ctx.shadowColor = props.color;
    ctx.shadowBlur = 10;

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

    // Draw current position
    const currentPoint = props.path[currentIndex];
    if (currentPoint) {
      const x = currentPoint.x * 0.8;
      const y = currentPoint.y * 0.8;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 25);
      gradient.addColorStop(0, `hsla(${hue}, 95%, 75%, 0.9)`);
      gradient.addColorStop(0.4, `hsla(${hue + 30}, 90%, 70%, 0.6)`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = props.color;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `hsla(${hue + 60}, 100%, 85%, 0.9)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.stroke();
    }

    console.log('✅ renderPattern8D complete'); // DEBUG
  };

  // 🎨 Helper: Convert hex color to HSL
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

  const renderPatternRef = useRef(renderPattern);
  useEffect(() => {
    renderPatternRef.current = renderPattern;
  }, [renderPattern]);

  const animate = useCallback(
    (timestamp: number) => {
      timeRef.current = timestamp;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      renderPatternRef.current(ctx, canvas.width, canvas.height);

      animationRef.current = window.setTimeout(() => {
        animate(performance.now());
      }, 66);
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
    }, 66);

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
    const isActive = safeElectromagnetic.strength > 0.1;

    return { frequency, patternName, hue, isActive, state: safeElectromagnetic.state };
  }, [safeElectromagnetic.frequency, safeElectromagnetic.strength, safeElectromagnetic.state, patternProperties]);

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
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
          color: '#00bfff', 
          fontWeight: 'bold',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          mb: 0.5
        }}>
          3D Mode: {visualizationMode === 'toroidal' ? 'Toroidal Field' :
                    visualizationMode === 'vortex' ? 'Vortex Field' :
                    visualizationMode === 'spiral' ? 'Spiral Field' :
                    visualizationMode === 'wave' ? 'Wave Interference' :
                    visualizationMode === 'pattern8d' ? '8D Pattern Path' :
                    'Combined'}
        </Typography>
        <ToggleButtonGroup
          value={visualizationMode}
          exclusive
          onChange={(_, newMode) => newMode && setVisualizationMode(newMode)}
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
          <ToggleButton value="toroidal" title="Toroidal Field">
            <BlurOnIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="vortex" title="Vortex Field">
            <TornadoIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="spiral" title="Spiral Field">
            <WavesIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="wave" title="Wave Interference">
            <GridOnIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="pattern8d" title="8D Pattern Path">
            <BubbleChartIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="combined" title="Combined">
            <GridOnIcon fontSize="small" style={{ transform: 'rotate(45deg)' }} />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* State Indicator */}
      {displayValues.isActive && (
        <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
          <Chip
            label={displayValues.state}
            size="small"
            sx={{
              backgroundColor:
                displayValues.state === 'CRITICAL' ? 'rgba(255, 20, 147, 0.3)' :
                displayValues.state === 'RESONANT' ? 'rgba(255, 107, 0, 0.3)' :
                displayValues.state === 'ACTIVE' ? 'rgba(0, 255, 136, 0.3)' :
                'rgba(138, 43, 226, 0.3)',
              color:
                displayValues.state === 'CRITICAL' ? '#ff1493' :
                displayValues.state === 'RESONANT' ? '#ff6b00' :
                displayValues.state === 'ACTIVE' ? '#00ff88' :
                '#8a2be2',
              fontWeight: 'bold',
              border: `1px solid ${
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
            color: 'rgba(0, 255, 136, 0.9)',
            fontWeight: 'bold',
            fontSize: '11px',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
          }}>
            🎵 {visualizationMode.toUpperCase()}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SpatialVisualizer;
