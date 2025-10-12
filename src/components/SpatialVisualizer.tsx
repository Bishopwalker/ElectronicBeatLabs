// Electromagnetic Beat Lab - Spatial Visualizer Component
// 3D visualization of electromagnetic field patterns with mode switching

import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, Chip } from '@mui/material';
import type { SpatialVisualizerProps, ElectromagneticField } from '../types/index';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import TornadoIcon from '@mui/icons-material/Tornado';
import WavesIcon from '@mui/icons-material/Waves';
import GridOnIcon from '@mui/icons-material/GridOn';

type VisualizationMode = 'toroidal' | 'vortex' | 'spiral' | 'default';

const SpatialVisualizer: React.FC<SpatialVisualizerProps> = ({
  pattern,
  electromagnetic,
  size = 400
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const timeRef = useRef<number>(0);
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('toroidal');

  // Render electromagnetic field pattern based on mode
  const renderPattern = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const time = timeRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    //
    // // Debug logging for electromagnetic field changes
    // if (time % 1000 < 100) {
    //   console.log('🎨 SpatialVisualizer rendering:', {
    //     mode: visualizationMode,
    //     patternName: pattern.name,
    //     frequency: electromagnetic.frequency,
    //     strength: electromagnetic.strength,
    //     resonance: electromagnetic.resonance,
    //     coherence: electromagnetic.coherence,
    //     state: electromagnetic.state
    //   });
    // }

    // Set up electromagnetic field visualization
    ctx.save();
    ctx.translate(centerX, centerY);

    // Draw field lines based on visualization mode
    switch (visualizationMode) {
      case 'toroidal':
        renderToroidalField(ctx, electromagnetic, time);
        break;
      case 'vortex':
        renderVortexField(ctx, electromagnetic, time);
        break;
      case 'spiral':
        renderSpiralField(ctx, electromagnetic, time);
        break;
      default:
        renderDefaultField(ctx, electromagnetic, time);
    }

    // Draw pattern path overlay
    if (pattern.path && pattern.path.length > 0) {
      ctx.strokeStyle = pattern.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = pattern.color;
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      pattern.path.forEach((point, index) => {
        const x = point.x * 0.5;
        const y = point.y * 0.5;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }, [pattern, electromagnetic, visualizationMode]);

  // Render toroidal electromagnetic field
  const renderToroidalField = (ctx: CanvasRenderingContext2D, field: ElectromagneticField, time: number) => {
    const radius = 100;
    const fieldStrength = Math.max(0, Math.min(1, isFinite(field.strength) ? field.strength : 0));
    const fieldFreq = Math.max(0.1, isFinite(field.frequency) ? field.frequency : 1);
    const resonance = Math.max(0, Math.min(1, isFinite(field.resonance) ? field.resonance : 0));
    
    // Create rainbow rings that pulse with frequency
    for (let i = 0; i < 12; i++) {
      const safeTime = isFinite(time) ? time : 0;
      const animSpeed = 0.002 * (fieldFreq / 40) * (1 + resonance);
      const angle = (i / 12) * Math.PI * 2 + safeTime * animSpeed;
      const x = Math.cos(angle) * radius * (1 + fieldStrength * 0.4);
      const y = Math.sin(angle) * radius * 0.4 * (1 + resonance * 0.6);
      
      const safeX = isFinite(x) ? x : 0;
      const safeY = isFinite(y) ? y : 0;
      
      const intensity = fieldStrength * (0.6 + resonance * 0.4);
      
      // Rainbow colors based on frequency and electromagnetic state
      const hue = (i * 30 + safeTime * 0.1 * fieldFreq) % 360;
      const saturation = 80 + resonance * 20;
      const lightness = 50 + fieldStrength * 30;
      
      const gradient = ctx.createRadialGradient(safeX, safeY, 0, safeX, safeY, 40 + resonance * 30);
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

  // Render vortex electromagnetic field
  const renderVortexField = (ctx: CanvasRenderingContext2D, field: ElectromagneticField, time: number) => {
    const fieldStrength = Math.max(0, Math.min(1, isFinite(field.strength) ? field.strength : 0));
    const fieldFreq = Math.max(0.1, isFinite(field.frequency) ? field.frequency : 1);
    const coherence = Math.max(0, Math.min(1, isFinite(field.coherence) ? field.coherence : 0));
    
    // Create dancing particle spiral that responds to electromagnetic field
    for (let r = 15; r < 160; r += 15) {
      const points = Math.floor(r / 8) + 4;
      
      for (let i = 0; i < points; i++) {
        const safeTime = isFinite(time) ? time : 0;
        const rotSpeed = 0.003 * (fieldFreq / 40) * (1 + coherence);
        const angle = (i / points) * Math.PI * 2 + safeTime * rotSpeed + r * 0.02;
        const x = Math.cos(angle) * r * (1 + fieldStrength * 0.3);
        const y = Math.sin(angle) * r * (1 + fieldStrength * 0.3);
        
        const safeX = isFinite(x) ? x : 0;
        const safeY = isFinite(y) ? y : 0;
        
        const intensity = fieldStrength * (0.5 + coherence * 0.3);
        
        // Color based on electromagnetic properties
        const distanceHue = (r / 160) * 240;
        const frequencyHue = (fieldFreq / 20) * 120;
        const stateHue = field.state === 'RESONANT' ? 60 : field.state === 'CRITICAL' ? 0 : 0;
        const finalHue = (distanceHue + frequencyHue + stateHue + safeTime * 0.05) % 360;
        
        // Create glowing particles
        const gradient = ctx.createRadialGradient(safeX, safeY, 0, safeX, safeY, 8 + coherence * 4);
        gradient.addColorStop(0, `hsla(${finalHue}, 80%, 70%, ${intensity})`);
        gradient.addColorStop(0.5, `hsla(${finalHue}, 90%, 50%, ${intensity * 0.6})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        const particleSize = 4 + fieldStrength * 6 * (1 + coherence * 0.8);
        ctx.arc(safeX, safeY, particleSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Add trails for strong fields
        if (fieldStrength > 0.3) {
          const trailAngle = angle - 0.2;
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

  // Render spiral electromagnetic field
  const renderSpiralField = (ctx: CanvasRenderingContext2D, field: ElectromagneticField, time: number) => {
    const fieldStrength = Math.max(0, Math.min(1, isFinite(field.strength) ? field.strength : 0));
    const fieldFreq = Math.max(0.1, isFinite(field.frequency) ? field.frequency : 1);
    const stability = Math.max(0, Math.min(1, isFinite(field.stability) ? field.stability : 0));
    
    const intensity = fieldStrength * (0.7 + stability * 0.3);
    const safeTime = isFinite(time) ? time : 0;
    
    // Create multiple spirals with electromagnetic modulation
    const spiralCount = 3;
    for (let spiral = 0; spiral < spiralCount; spiral++) {
      const spiralOffset = (spiral * Math.PI * 2) / spiralCount;
      
      // Color shifts based on electromagnetic state
      const baseHue = 180 + (fieldFreq / 20) * 60;
      const stateModulation = field.state === 'RESONANT' ? 40 : field.state === 'CRITICAL' ? 80 : 0;
      const hue = (baseHue + stateModulation + spiral * 40 + safeTime * 0.02 * fieldFreq) % 360;
      
      ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${intensity})`;
      ctx.lineWidth = 3 + fieldStrength * 3 + Math.sin(safeTime * 0.002 * fieldFreq) * 1;
      
      // Add glow effect
      ctx.shadowColor = `hsla(${hue}, 90%, 70%, ${intensity * 0.8})`;
      ctx.shadowBlur = 8 + fieldStrength * 6;
      
      ctx.beginPath();
      
      const spiralSpeed = 0.002 * (fieldFreq / 40) * (1 + fieldStrength);
      const tightness = 8 + stability * 4;
      
      for (let t = 0; t < Math.PI * tightness; t += 0.08) {
        const r = t * 8 * (1 + stability * 0.4);
        const angle = t + safeTime * spiralSpeed + spiralOffset;
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
      
      // Add sparkle points for high activity
      if (fieldStrength > 0.4 || field.state === 'RESONANT') {
        for (let t = 0; t < Math.PI * tightness; t += Math.PI * 0.5) {
          const r = t * 8 * (1 + stability * 0.4);
          const angle = t + safeTime * spiralSpeed + spiralOffset;
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

  // Render default electromagnetic field
  const renderDefaultField = (ctx: CanvasRenderingContext2D, field: ElectromagneticField, time?: number) => {
    const fieldStrength = Math.max(0, Math.min(1, isFinite(field.strength) ? field.strength : 0));
    const fieldFreq = Math.max(0.1, isFinite(field.frequency) ? field.frequency : 1);
    const safeTime = isFinite(time || 0) ? (time || 0) : 0;
    const gridSize = 25;
    
    // Create a twinkling star field that responds to electromagnetic state
    for (let x = -200; x < 200; x += gridSize) {
      for (let y = -200; y < 200; y += gridSize) {
        const distance = Math.sqrt(x * x + y * y);
        const baseIntensity = fieldStrength * (1 / (1 + distance * 0.008));
        
        if (baseIntensity > 0.05) {
          const twinkle = Math.sin(safeTime * 0.003 * fieldFreq + x * 0.01 + y * 0.01) * 0.5 + 0.5;
          const intensity = baseIntensity * (0.5 + twinkle * 0.5);
          
          // Color based on electromagnetic state
          const baseHue = 120 + (distance / 300) * 180 + (fieldFreq / 20) * 60;
          const stateHue = field.state === 'RESONANT' ? 60 : field.state === 'CRITICAL' ? 120 : 0;
          const hue = (baseHue + stateHue) % 360;
          
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8 + intensity * 6);
          gradient.addColorStop(0, `hsla(${hue}, 70%, 70%, ${intensity})`);
          gradient.addColorStop(0.7, `hsla(${hue}, 80%, 50%, ${intensity * 0.5})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          const starSize = 3 + intensity * 4 + Math.sin(safeTime * 0.004 + x + y) * 1;
          ctx.arc(x, y, starSize, 0, Math.PI * 2);
          ctx.fill();
          
          // Add sparkles for RESONANT/CRITICAL states
          if ((field.state === 'RESONANT' || field.state === 'CRITICAL') && twinkle > 0.8) {
            ctx.fillStyle = `hsla(${hue + 60}, 90%, 80%, ${intensity * 0.8})`;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  };

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    timeRef.current = timestamp;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderPattern(ctx, canvas.width, canvas.height);
    
    animationRef.current = window.setTimeout(() => {
      animate(performance.now());
    }, 66); // ~15fps for eyes-closed usage
  }, [renderPattern]);

  // Initialize canvas and start animation
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

  // Calculate display values - reactive to changes
  const displayValues = useMemo(() => {
    const frequency = electromagnetic.frequency || 4;
    const patternName = pattern.name || 'Unknown Pattern';
    const hue = (frequency / 20) * 240;
    const isActive = electromagnetic.strength > 0.1;
    
    return { frequency, patternName, hue, isActive, state: electromagnetic.state };
  }, [electromagnetic.frequency, electromagnetic.strength, electromagnetic.state, pattern.name]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Visualization Mode Selector */}
      <Box sx={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10,
        background: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 1,
        padding: 0.5
      }}>
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
                border: '1px solid #00ff88'
              }
            }
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
          <ToggleButton value="default" title="Star Field">
            <GridOnIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Electromagnetic State Indicator */}
      {displayValues.isActive && (
        <Box sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 10
        }}>
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
              }`
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
          background: 'transparent'
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
          pointerEvents: 'none'
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
            mb: 0.5
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
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
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
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
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