// Electromagnetic Beat Lab - Spatial Visualizer Component
// 3D visualization of electromagnetic field patterns

import React, { useEffect, useRef, useCallback } from 'react';
import { Box } from '@mui/material';
import type { SpatialVisualizerProps, ElectromagneticField } from '../types/index';

const SpatialVisualizer: React.FC<SpatialVisualizerProps> = ({
  pattern,
  electromagnetic,
  size = 400
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const timeRef = useRef<number>(0);

  // Render electromagnetic field pattern
  const renderPattern = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const time = timeRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up electromagnetic field visualization
    ctx.save();
    ctx.translate(centerX, centerY);

    // Draw field lines based on pattern type
    switch (pattern.name) {
      case 'Maximum Resonance Toroid':
        renderToroidalField(ctx, electromagnetic, time);
        break;
      case 'Focus Enhancement Vortex':
        renderVortexField(ctx, electromagnetic, time);
        break;
      case 'Creative Vortex Flow':
        renderSpiralField(ctx, electromagnetic, time);
        break;
      default:
        renderDefaultField(ctx, electromagnetic);
    }

    // Draw pattern path
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
    }

    ctx.restore();
  }, [pattern, electromagnetic]);

  // Render toroidal electromagnetic field
  const renderToroidalField = (ctx: CanvasRenderingContext2D, field: ElectromagneticField, time: number) => {
    const radius = 100;
    const fieldStrength = Math.max(0, Math.min(1, isFinite(field.strength) ? field.strength : 0));
    const fieldFreq = Math.max(0.1, isFinite(field.frequency) ? field.frequency : 1);
    const resonance = Math.max(0, Math.min(1, isFinite(field.resonance) ? field.resonance : 0));
    
    for (let i = 0; i < 8; i++) {
      const safeTime = isFinite(time) ? time : 0;
      // Use field frequency and resonance to modulate animation speed
      const animSpeed = 0.001 * (1 + resonance) * (fieldFreq / 440);
      const angle = (i / 8) * Math.PI * 2 + safeTime * animSpeed;
      const x = Math.cos(angle) * radius * (1 + fieldStrength * 0.3);
      const y = Math.sin(angle) * radius * 0.3 * (1 + resonance * 0.5);
      
      // Ensure all gradient parameters are finite
      const safeX = isFinite(x) ? x : 0;
      const safeY = isFinite(y) ? y : 0;
      
      const intensity = fieldStrength * (0.7 + resonance * 0.3);
      const gradient = ctx.createRadialGradient(safeX, safeY, 0, safeX, safeY, 50 + resonance * 20);
      gradient.addColorStop(0, `rgba(255, 107, 0, ${intensity})`);
      gradient.addColorStop(1, 'rgba(255, 107, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(safeX, safeY, 30 * intensity, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Render vortex electromagnetic field
  const renderVortexField = (ctx: CanvasRenderingContext2D, field: ElectromagneticField, time: number) => {
    const fieldStrength = Math.max(0, Math.min(1, isFinite(field.strength) ? field.strength : 0));
    const fieldFreq = Math.max(0.1, isFinite(field.frequency) ? field.frequency : 1);
    const coherence = Math.max(0, Math.min(1, isFinite(field.coherence) ? field.coherence : 0));
    
    for (let r = 20; r < 150; r += 20) {
      const points = Math.floor(r / 10);
      
      for (let i = 0; i < points; i++) {
        const safeTime = isFinite(time) ? time : 0;
        // Frequency modulates rotation speed, coherence affects pattern density
        const rotSpeed = 0.002 * (fieldFreq / 440) * (1 + coherence);
        const angle = (i / points) * Math.PI * 2 + safeTime * rotSpeed + r * 0.01;
        const x = Math.cos(angle) * r * (1 + fieldStrength * 0.2);
        const y = Math.sin(angle) * r * (1 + fieldStrength * 0.2);
        
        const safeX = isFinite(x) ? x : 0;
        const safeY = isFinite(y) ? y : 0;
        
        const intensity = fieldStrength * (0.3 + coherence * 0.2);
        ctx.fillStyle = `rgba(138, 43, 226, ${intensity})`;
        ctx.beginPath();
        ctx.arc(safeX, safeY, 3 * fieldStrength * (1 + coherence * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // Render spiral electromagnetic field
  const renderSpiralField = (ctx: CanvasRenderingContext2D, field: ElectromagneticField, time: number) => {
    const fieldStrength = Math.max(0, Math.min(1, isFinite(field.strength) ? field.strength : 0));
    const fieldFreq = Math.max(0.1, isFinite(field.frequency) ? field.frequency : 1);
    const stability = Math.max(0, Math.min(1, isFinite(field.stability) ? field.stability : 0));
    
    const intensity = fieldStrength * (0.8 + stability * 0.2);
    ctx.strokeStyle = `rgba(0, 191, 255, ${intensity})`;
    ctx.lineWidth = 2 + fieldStrength * 2;
    
    ctx.beginPath();
    const safeTime = isFinite(time) ? time : 0;
    // Use field frequency to modulate spiral tightness and rotation speed
    const spiralSpeed = 0.001 * (fieldFreq / 440) * (1 + fieldStrength);
    for (let t = 0; t < Math.PI * 8; t += 0.1) {
      const r = t * 10 * (1 + stability * 0.3);
      const x = Math.cos(t + safeTime * spiralSpeed) * r;
      const y = Math.sin(t + safeTime * spiralSpeed) * r;
      
      const safeX = isFinite(x) ? x : 0;
      const safeY = isFinite(y) ? y : 0;
      
      if (t === 0) {
        ctx.moveTo(safeX, safeY);
      } else {
        ctx.lineTo(safeX, safeY);
      }
    }
    ctx.stroke();
    
    // Add pulsing effect based on field strength
    if (fieldStrength > 0.5) {
      ctx.shadowColor = 'rgba(0, 191, 255, 0.5)';
      ctx.shadowBlur = 10 * fieldStrength;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  };

  // Render default electromagnetic field
  const renderDefaultField = (ctx: CanvasRenderingContext2D, field: ElectromagneticField) => {
    const fieldStrength = Math.max(0, Math.min(1, isFinite(field.strength) ? field.strength : 0));
    const gridSize = 20;
    
    for (let x = -200; x < 200; x += gridSize) {
      for (let y = -200; y < 200; y += gridSize) {
        const distance = Math.sqrt(x * x + y * y);
        const intensity = fieldStrength * (1 / (1 + distance * 0.01));
        
        if (intensity > 0.1) {
          ctx.fillStyle = `rgba(0, 255, 136, ${intensity * 0.5})`;
          ctx.beginPath();
          ctx.arc(x, y, 2 * intensity, 0, Math.PI * 2);
          ctx.fill();
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
    // Reduce to 15fps for eyes-closed usage
    animationRef.current = window.setTimeout(animate, 66);
  }, [renderPattern]);

  // Initialize canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = size;
    canvas.height = size;

    animationRef.current = window.setTimeout(animate, 66);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [animate, size]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        component="canvas"
        ref={canvasRef}
        sx={{
          width: '100%',
          height: '100%',
          background: 'transparent'
        }}
      />
    </Box>
  );
};

export default SpatialVisualizer;