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
    const fieldStrength = field.strength;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + time * 0.001;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.3;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 50);
      gradient.addColorStop(0, `rgba(255, 107, 0, ${fieldStrength})`);
      gradient.addColorStop(1, 'rgba(255, 107, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 30 * fieldStrength, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Render vortex electromagnetic field
  const renderVortexField = (ctx: CanvasRenderingContext2D, field: ElectromagneticField, time: number) => {
    const fieldStrength = field.strength;
    
    for (let r = 20; r < 150; r += 20) {
      const points = Math.floor(r / 10);
      
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2 + time * 0.002 + r * 0.01;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        
        ctx.fillStyle = `rgba(138, 43, 226, ${fieldStrength * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, 3 * fieldStrength, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // Render spiral electromagnetic field
  const renderSpiralField = (ctx: CanvasRenderingContext2D, field: ElectromagneticField, time: number) => {
    const fieldStrength = field.strength;
    
    ctx.strokeStyle = `rgba(0, 191, 255, ${fieldStrength})`;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    for (let t = 0; t < Math.PI * 8; t += 0.1) {
      const r = t * 10;
      const x = Math.cos(t + time * 0.001) * r;
      const y = Math.sin(t + time * 0.001) * r;
      
      if (t === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  };

  // Render default electromagnetic field
  const renderDefaultField = (ctx: CanvasRenderingContext2D, field: ElectromagneticField) => {
    const fieldStrength = field.strength;
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