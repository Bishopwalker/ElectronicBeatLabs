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
  console.log('🔍 SpatialVisualizer RENDER:', {
    hasPattern: !!pattern,
    patternName: pattern?.name,
    hasElectromagnetic: !!electromagnetic,
    emState: electromagnetic?.state,
    emFrequency: electromagnetic?.frequency,
    emStrength: electromagnetic?.strength,
    size
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const timeRef = useRef<number>(0);
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('toroidal');

  // 🔥 CRITICAL: Ensure we always have valid electromagnetic data (MEMOIZED)
  const safeElectromagnetic: ElectromagneticField = useMemo(() => {
    return electromagnetic || {
      strength: 0.5,
      frequency: 4,
      phase: 0,
      coherence: 0.5,
      resonance: 0.5,
      state: 'ACTIVE',
      stability: 0.5
    };
  }, [electromagnetic]);

  // 🎨 ENHANCED: Extract pattern properties for visualization
  const patternProperties = useMemo(() => {
    if (!pattern) {
      console.warn('⚠️ SpatialVisualizer: No pattern provided, using defaults');
      // Return default properties so we always have SOMETHING to render
      return {
        name: 'Default Pattern',
        speed: 1,
        direction: 'clockwise' as const,
        intensity: 0.8,
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
      intensity: pattern.intensity || 0.5,
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

    // Clear canvas with black background so we can see SOMETHING
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(0, 0, width, height);

    // Set up electromagnetic field visualization
    ctx.save();
    ctx.translate(centerX, centerY);

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
        // Render multiple layers
        renderToroidalField(ctx, safeElectromagnetic, patternProperties, time);
        renderPattern8D(ctx, safeElectromagnetic, patternProperties, time);
        break;
      default:
        renderToroidalField(ctx, safeElectromagnetic, patternProperties, time);
    }

    ctx.restore();
  }, [safeElectromagnetic, patternProperties, visualizationMode]);

  // 🌀 ENHANCED: Toroidal field with pattern integration
  const renderToroidalField = (
    ctx: CanvasRenderingContext2D,
    field: ElectromagneticField,
    props: typeof patternProperties,
    time: number
  ) => {
    if (!props) {
      console.warn('⚠️ renderToroidalField: No pattern properties!');
      // Draw a simple default visualization so something shows
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 100, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }

    const radius = 100;
    const fieldStrength = Math.max(0, Math.min(1, isFinite(field.strength) ? field.strength : 0));
    const fieldFreq = Math.max(0.1, isFinite(field.frequency) ? field.frequency : 1);
    const resonance = Math.max(0, Math.min(1, isFinite(field.resonance) ? field.resonance : 0));

    // 🔥 Use pattern properties for ring count and colors
    const numRings = Math.floor(8 + props.intensity * 8); // 8-16 rings based on intensity

    for (let i = 0; i < numRings; i++) {
      const safeTime = isFinite(time) ? time : 0;
      const animSpeed = 0.002 * (fieldFreq / 40) * (1 + resonance) * props.speed;
      
      // 🔥 Rotation direction based on pattern
      const directionMultiplier = props.direction === 'counterclockwise' ? -1 : 1;
      const angle = (i / numRings) * Math.PI * 2 + safeTime * animSpeed * directionMultiplier;
      
      const x = Math.cos(angle) * radius * (1 + fieldStrength * 0.4);
      const y = Math.sin(angle) * radius * 0.4 * (1 + resonance * 0.6);

      const safeX = isFinite(x) ? x : 0;
      const safeY = isFinite(y) ? y : 0;

      const intensity = fieldStrength * (0.6 + resonance * 0.4) * props.intensity;

      // 🔥 Use pattern color as base, modulate with electromagnetic state
      const baseColor = hexToHSL(props.color);
      const hue = (baseColor.h + i * 30 + safeTime * 0.1 * fieldFreq) % 360;
      const saturation = 80 + resonance * 20;
      const lightness = 50 + fieldStrength * 30;

      const gradient = ctx.createRadialGradient(safeX, safeY, 0, safeX, safeY, 40 + resonance * 30 * props.intensity);
      gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, ${intensity})`);
      gradient.addColorStop(0.7, `hsla(${hue}, ${saturation}%, ${lightness * 0.7}%, ${intensity * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();

      const ringSize = 25 + intensity * 15 + Math.sin(safeTime * 0.003 * fieldFreq) * 5;
      ctx.arc(safeX, safeY, ringSize, 0, Math.PI * 2);
      ctx.fill();

      // Add sparkle effect for high frequencies and RESONANT state
      if (fieldFreq > 10 || field.state === 'RESONANT' || field.state === 'CRITICAL') {
        ctx.fillStyle = `hsla(${hue + 60}, 100%, 80%, ${intensity * 0.8})`;
        ctx.beginPath();
        ctx.arc(safeX, safeY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Add pulsing center core for CRITICAL state
    if (field.state === 'CRITICAL') {
      const coreSize = 15 + Math.sin(time * 0.005) * 5;
      const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
      coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      coreGradient.addColorStop(0.5, 'rgba(255, 107, 0, 0.6)');
      coreGradient.addColorStop(1, 'rgba(255, 107, 0, 0)');
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // 🌪️ ENHANCED: Vortex field with pattern direction and intensity
  const renderVortexField = (
    ctx: CanvasRenderingContext2D,
    field: ElectromagneticField,
    props: typeof patternProperties,
    time: number
  ) => {
    if (!props) return;

    const fieldStrength = Math.max(0, Math.min(1, isFinite(field.strength) ? field.strength : 0));
    const fieldFreq = Math.max(0.1, isFinite(field.frequency) ? field.frequency : 1);
    const coherence = Math.max(0, Math.min(1, isFinite(field.coherence) ? field.coherence : 0));

    // 🔥 Use pattern intensity for particle density
    const maxRadius = 160 * props.intensity;
    const radiusStep = 15 / props.intensity;

    for (let r = 15; r < maxRadius; r += radiusStep) {
      const points = Math.floor(r / 8) + 4;

      for (let i = 0; i < points; i++) {
        const safeTime = isFinite(time) ? time : 0;
        const rotSpeed = 0.003 * (fieldFreq / 40) * (1 + coherence) * props.speed;
        
        // 🔥 Direction-aware rotation
        const directionMultiplier = props.direction === 'counterclockwise' ? -1 : 1;
        const angle = (i / points) * Math.PI * 2 + safeTime * rotSpeed * directionMultiplier + r * 0.02;
        
        const x = Math.cos(angle) * r * (1 + fieldStrength * 0.3);
        const y = Math.sin(angle) * r * (1 + fieldStrength * 0.3);

        const safeX = isFinite(x) ? x : 0;
        const safeY = isFinite(y) ? y : 0;

        const intensity = fieldStrength * (0.5 + coherence * 0.3) * props.intensity;

        // 🔥 Pattern color integration
        const baseColor = hexToHSL(props.color);
        const distanceHue = (r / 160) * 120;
        const frequencyHue = (fieldFreq / 20) * 60;
        const finalHue = (baseColor.h + distanceHue + frequencyHue + safeTime * 0.05) % 360;

        const gradient = ctx.createRadialGradient(safeX, safeY, 0, safeX, safeY, 8 + coherence * 4);
        gradient.addColorStop(0, `hsla(${finalHue}, 80%, 70%, ${intensity})`);
        gradient.addColorStop(0.5, `hsla(${finalHue}, 90%, 50%, ${intensity * 0.6})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        const particleSize = 4 + fieldStrength * 6 * (1 + coherence * 0.8) * props.intensity;
        ctx.arc(safeX, safeY, particleSize, 0, Math.PI * 2);
        ctx.fill();

        // Trails for strong fields
        if (fieldStrength > 0.3) {
          const trailAngle = angle - 0.2 * directionMultiplier;
          const trailX = Math.cos(trailAngle) * r * 0.95;
          const trailY = Math.sin(trailAngle) * r * 0.95;

          ctx.fillStyle = `hsla(${finalHue}, 70%, 60%, ${intensity * 0.3})`;
          ctx.beginPath();
          ctx.arc(trailX, trailY, particleSize * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  };

  // 🌀 ENHANCED: Spiral field with pattern wavelength
  const renderSpiralField = (
    ctx: CanvasRenderingContext2D,
    field: ElectromagneticField,
    props: typeof patternProperties,
    time: number
  ) => {
    if (!props) return;

    const fieldStrength = Math.max(0, Math.min(1, isFinite(field.strength) ? field.strength : 0));
    const fieldFreq = Math.max(0.1, isFinite(field.frequency) ? field.frequency : 1);
    const stability = Math.max(0, Math.min(1, isFinite(field.stability) ? field.stability : 0));

    const intensity = fieldStrength * (0.7 + stability * 0.3) * props.intensity;
    const safeTime = isFinite(time) ? time : 0;

    // 🔥 Use pattern wavelength for spiral tightness
    const spiralCount = Math.floor(2 + props.intensity * 2);
    
    for (let spiral = 0; spiral < spiralCount; spiral++) {
      const spiralOffset = (spiral * Math.PI * 2) / spiralCount;

      // 🔥 Pattern color
      const baseColor = hexToHSL(props.color);
      const stateModulation = field.state === 'RESONANT' ? 40 : field.state === 'CRITICAL' ? 80 : 0;
      const hue = (baseColor.h + stateModulation + spiral * 40 + safeTime * 0.02 * fieldFreq * props.speed) % 360;

      ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${intensity})`;
      ctx.lineWidth = 3 + fieldStrength * 3 + Math.sin(safeTime * 0.002 * fieldFreq) * 1;

      ctx.shadowColor = `hsla(${hue}, 90%, 70%, ${intensity * 0.8})`;
      ctx.shadowBlur = 8 + fieldStrength * 6;

      ctx.beginPath();

      const directionMultiplier = props.direction === 'counterclockwise' ? -1 : 1;
      const spiralSpeed = 0.002 * (fieldFreq / 40) * (1 + fieldStrength) * props.speed;
      
      // 🔥 Use electromagnetic wavelength for tightness
      const tightness = 6 + (props.emWavelength / 50) * 4 + stability * 4;

      for (let t = 0; t < Math.PI * tightness; t += 0.08) {
        const r = t * 8 * (1 + stability * 0.4);
        const angle = t * directionMultiplier + safeTime * spiralSpeed + spiralOffset;
        const x = Math.cos(angle) * r * (1 + fieldStrength * 0.2);
        const y = Math.sin(angle) * r * (1 + fieldStrength * 0.2);

        const safeX = isFinite(x) ? x : 0;
        const safeY = isFinite(y) ? y : 0;

        if (t === 0) {
          ctx.moveTo(safeX, safeY);
        } else {
          ctx.lineTo(safeX, safeY);
        }
      }
      ctx.stroke();

      // Sparkle points
      if (fieldStrength > 0.4 || field.state === 'RESONANT') {
        for (let t = 0; t < Math.PI * tightness; t += Math.PI * 0.5) {
          const r = t * 8 * (1 + stability * 0.4);
          const angle = t * directionMultiplier + safeTime * spiralSpeed + spiralOffset;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;

          ctx.fillStyle = `hsla(${hue + 60}, 100%, 80%, ${intensity})`;
          ctx.beginPath();
          ctx.arc(x, y, 2 + fieldStrength * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.shadowBlur = 0;
    }
  };

  // 🌊 NEW: Wave interference pattern
  const renderWaveField = (
    ctx: CanvasRenderingContext2D,
    field: ElectromagneticField,
    props: typeof patternProperties,
    time: number
  ) => {
    if (!props) return;

    const fieldStrength = Math.max(0, Math.min(1, isFinite(field.strength) ? field.strength : 0));
    const fieldFreq = Math.max(0.1, isFinite(field.frequency) ? field.frequency : 1);
    const safeTime = isFinite(time) ? time : 0;
    
    // 🔥 Use pattern wavelength for wave properties
    const wavelength = props.emWavelength;
    const numWaves = 12;

    const baseColor = hexToHSL(props.color);

    for (let i = 0; i < numWaves; i++) {
      const angle = (i / numWaves) * Math.PI * 2;
      const waveOriginX = Math.cos(angle) * 50;
      const waveOriginY = Math.sin(angle) * 50;

      // Draw expanding concentric circles
      for (let r = 0; r < 150; r += wavelength / 10) {
        const phase = (safeTime * 0.001 * fieldFreq * props.speed - r * 0.02) * Math.PI * 2;
        const amplitude = 10 + props.emAmplitude * 20;
        const offset = Math.sin(phase) * amplitude * fieldStrength * props.intensity;

        const actualRadius = r + offset;
        if (actualRadius < 0) continue;

        const alpha = (1 - actualRadius / 150) * fieldStrength * 0.5 * props.intensity;
        if (alpha < 0.05) continue;

        const hue = (baseColor.h + r * 0.5 + i * 30) % 360;

        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
        ctx.lineWidth = 2 + fieldStrength * 2;

        ctx.beginPath();
        ctx.arc(waveOriginX, waveOriginY, actualRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  // 🎯 NEW: Pure Pattern8D path visualization
  const renderPattern8D = (
    ctx: CanvasRenderingContext2D,
    field: ElectromagneticField,
    props: typeof patternProperties,
    time: number
  ) => {
    if (!props || props.path.length === 0) return;

    const safeTime = isFinite(time) ? time : 0;
    const pathProgress = (safeTime * 0.001 * props.speed) % 1;
    const currentIndex = Math.floor(pathProgress * props.path.length);

    const baseColor = hexToHSL(props.color);
    const hue = baseColor.h;

    // Draw full path
    ctx.strokeStyle = `hsla(${hue}, 70%, 50%, 0.4)`;
    ctx.lineWidth = 2;
    ctx.shadowColor = props.color;
    ctx.shadowBlur = 8;

    ctx.beginPath();
    props.path.forEach((point, index) => {
      const x = point.x * 0.8;
      const y = point.y * 0.8;
      const z = point.z || 0;

      // Simple 3D projection
      const scale = 1 / (1 + z * 0.001);
      const projX = x * scale;
      const projY = y * scale;

      if (index === 0) {
        ctx.moveTo(projX, projY);
      } else {
        ctx.lineTo(projX, projY);
      }
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw current position with glow
    const currentPoint = props.path[currentIndex];
    if (currentPoint) {
      const x = currentPoint.x * 0.8;
      const y = currentPoint.y * 0.8;
      const z = currentPoint.z || 0;
      const scale = 1 / (1 + z * 0.001);

      const projX = x * scale;
      const projY = y * scale;

      // Outer glow
      const gradient = ctx.createRadialGradient(projX, projY, 0, projX, projY, 20);
      gradient.addColorStop(0, `hsla(${hue}, 90%, 70%, 0.8)`);
      gradient.addColorStop(0.5, `hsla(${hue + 30}, 80%, 60%, 0.4)`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(projX, projY, 20, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = props.color;
      ctx.beginPath();
      ctx.arc(projX, projY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Ring
      ctx.strokeStyle = `hsla(${hue + 60}, 100%, 80%, 0.8)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(projX, projY, 12, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw trail
    const trailLength = 10;
    for (let i = 1; i <= trailLength; i++) {
      const trailIndex = (currentIndex - i + props.path.length) % props.path.length;
      const trailPoint = props.path[trailIndex];
      if (!trailPoint) continue;

      const alpha = (1 - i / trailLength) * 0.6;
      const x = trailPoint.x * 0.8;
      const y = trailPoint.y * 0.8;
      const z = trailPoint.z || 0;
      const scale = 1 / (1 + z * 0.001);

      ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x * scale, y * scale, 4 - i * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // 🎨 Helper: Convert hex color to HSL
  function hexToHSL(hex: string): { h: number; s: number; l: number } {
    // Remove # if present
    hex = hex.replace('#', '');

    // Convert to RGB
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

  // Store renderPattern in a ref so animate doesn't need it as a dependency
  const renderPatternRef = useRef(renderPattern);
  useEffect(() => {
    renderPatternRef.current = renderPattern;
  }, [renderPattern]);

  // Animation loop - stable, doesn't recreate
  const animate = useCallback(
    (timestamp: number) => {
      timeRef.current = timestamp;

      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('❌ SpatialVisualizer animate: No canvas!');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('❌ SpatialVisualizer animate: No context!');
        return;
      }

      // Use the ref to get the current renderPattern function
      renderPatternRef.current(ctx, canvas.width, canvas.height);

      animationRef.current = window.setTimeout(() => {
        animate(performance.now());
      }, 66); // ~15fps for eyes-closed usage
    },
    [] // Empty deps - function never recreates!
  );

  // Initialize canvas and start animation
  useEffect(() => {
    console.log('🎨 SpatialVisualizer: useEffect triggered', {
      hasCanvas: !!canvasRef.current,
      size,
      hasPattern: !!pattern,
      hasElectromagnetic: !!electromagnetic,
      patternName: pattern?.name,
      emFrequency: safeElectromagnetic.frequency,
      emState: safeElectromagnetic.state
    });

    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('❌ SpatialVisualizer: No canvas ref!');
      return;
    }

    // Set canvas size
    canvas.width = size;
    canvas.height = size;
    console.log('✅ SpatialVisualizer: Canvas sized:', size, 'x', size);

    // Check if we have valid data
    if (!electromagnetic) {
      console.warn('⚠️ SpatialVisualizer: No electromagnetic data - using defaults');
    } else {
      console.log('✅ SpatialVisualizer: Has electromagnetic data:', {
        frequency: safeElectromagnetic.frequency,
        strength: safeElectromagnetic.strength,
        state: safeElectromagnetic.state
      });
    }
    if (!pattern) {
      console.warn('⚠️ SpatialVisualizer: No pattern data - using default pattern');
    } else {
      console.log('✅ SpatialVisualizer: Has pattern data:', {
        name: pattern.name,
        pathLength: pattern.path?.length || 0
      });
    }

    // Start animation
    animationRef.current = window.setTimeout(() => {
      console.log('▶️ SpatialVisualizer: Starting animation loop');
      animate(performance.now());
    }, 66);

    return () => {
      if (animationRef.current) {
        console.log('⏹️ SpatialVisualizer: Stopping animation');
        clearTimeout(animationRef.current);
      }
    };
  }, [animate, size]); // animate is now stable (empty deps), so this is safe

  // Calculate display values
  const displayValues = useMemo(() => {
    const frequency = safeElectromagnetic.frequency || 4;
    const patternName = patternProperties?.name || 'Unknown Pattern';
    const hue = (frequency / 20) * 240;
    const isActive = safeElectromagnetic.strength > 0.1;

    return { frequency, patternName, hue, isActive, state: safeElectromagnetic.state };
  }, [safeElectromagnetic.frequency, safeElectromagnetic.strength, safeElectromagnetic.state, patternProperties]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Visualization Mode Selector */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 10,
          background: 'rgba(0, 0, 0, 0.7)',
          borderRadius: 1,
          padding: 0.5,
        }}
      >
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

      {/* Electromagnetic State Indicator */}
      {displayValues.isActive && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 10,
          }}
        >
          <Chip
            label={displayValues.state}
            size="small"
            sx={{
              backgroundColor:
                displayValues.state === 'CRITICAL'
                  ? 'rgba(255, 20, 147, 0.3)'
                  : displayValues.state === 'RESONANT'
                  ? 'rgba(255, 107, 0, 0.3)'
                  : displayValues.state === 'ACTIVE'
                  ? 'rgba(0, 255, 136, 0.3)'
                  : 'rgba(138, 43, 226, 0.3)',
              color:
                displayValues.state === 'CRITICAL'
                  ? '#ff1493'
                  : displayValues.state === 'RESONANT'
                  ? '#ff6b00'
                  : displayValues.state === 'ACTIVE'
                  ? '#00ff88'
                  : '#8a2be2',
              fontWeight: 'bold',
              border: `1px solid ${
                displayValues.state === 'CRITICAL'
                  ? '#ff1493'
                  : displayValues.state === 'RESONANT'
                  ? '#ff6b00'
                  : displayValues.state === 'ACTIVE'
                  ? '#00ff88'
                  : '#8a2be2'
              }`,
            }}
          />
        </Box>
      )}

      <Box
        component="canvas"
        ref={canvasRef}
        sx={{
          width: '100%',
          height: '100%',
          background: 'transparent',
        }}
      />

      {/* HTML Text Overlay */}
      <Box
        sx={{
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
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: `hsl(${displayValues.hue}, 80%, 70%)`,
            fontWeight: 'bold',
            fontSize: '16px',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            lineHeight: 1.1,
            mb: 0.5,
          }}
        >
          {displayValues.patternName}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: `hsl(${(displayValues.hue + 60) % 360}, 90%, 80%)`,
            fontWeight: 'bold',
            fontSize: '13px',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
          }}
        >
          {displayValues.frequency.toFixed(1)} Hz Beat Frequency
        </Typography>

        {displayValues.isActive && (
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              bottom: '4px',
              right: '8px',
              color: 'rgba(0, 255, 136, 0.9)',
              fontWeight: 'bold',
              fontSize: '11px',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
            }}
          >
            🎵 {visualizationMode.toUpperCase()}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SpatialVisualizer;
