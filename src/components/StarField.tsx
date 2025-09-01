// Electromagnetic Beat Lab - StarField Background Component
// Dynamic starfield with electromagnetic field interactions

import React, { useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import type { StarFieldProps } from '../types/index';

const Canvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -10;
  background: transparent;
  pointer-events: none;
`;

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  twinklePhase: number;
  velocity: { x: number; y: number; z: number };
  brightness: number;
  electromagnetic: {
    fieldStrength: number;
    resonance: number;
    phase: number;
  };
}

const StarField: React.FC<StarFieldProps> = ({
  density = 100,
  speed = 1,
  color = '#ffffff',
  twinkle = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>();
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Initialize stars
  const initializeStars = useCallback((canvas: HTMLCanvasElement) => {
    const stars: Star[] = [];
    const width = canvas.width;
    const height = canvas.height;

    for (let i = 0; i < density; i++) {
      const star: Star = {
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * 1000,
        size: Math.random() * 2 + 0.5,
        color: color,
        twinklePhase: Math.random() * Math.PI * 2,
        velocity: {
          x: (Math.random() - 0.5) * speed * 0.1,
          y: (Math.random() - 0.5) * speed * 0.1,
          z: -speed
        },
        brightness: Math.random() * 0.5 + 0.5,
        electromagnetic: {
          fieldStrength: Math.random(),
          resonance: Math.random(),
          phase: Math.random() * Math.PI * 2
        }
      };
      stars.push(star);
    }

    starsRef.current = stars;
  }, [density, speed, color]);

  // Update star positions and properties
  const updateStars = useCallback((canvas: HTMLCanvasElement, deltaTime: number) => {
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    starsRef.current.forEach((star) => {
      // Update position
      star.x += star.velocity.x * deltaTime * 0.01;
      star.y += star.velocity.y * deltaTime * 0.01;
      star.z += star.velocity.z * deltaTime * 0.01;

      // Reset star if it goes too far
      if (star.z <= 1) {
        star.x = Math.random() * width - width / 2;
        star.y = Math.random() * height - height / 2;
        star.z = 1000;
        star.electromagnetic.fieldStrength = Math.random();
        star.electromagnetic.resonance = Math.random();
      }

      // Update electromagnetic properties
      star.electromagnetic.phase += deltaTime * 0.001;
      star.electromagnetic.fieldStrength = 
        0.5 + 0.5 * Math.sin(star.electromagnetic.phase * 2);

      // Mouse interaction - electromagnetic field disturbance
      const mouseDistance = Math.sqrt(
        Math.pow(mouseRef.current.x - centerX, 2) + 
        Math.pow(mouseRef.current.y - centerY, 2)
      );
      
      if (mouseDistance < 200) {
        const influence = (200 - mouseDistance) / 200;
        star.electromagnetic.fieldStrength *= (1 + influence * 0.5);
        
        // Subtle attraction to mouse
        const dx = mouseRef.current.x - (star.x + centerX);
        const dy = mouseRef.current.y - (star.y + centerY);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          star.velocity.x += (dx / distance) * influence * 0.01;
          star.velocity.y += (dy / distance) * influence * 0.01;
        }
      }

      // Update twinkle phase
      if (twinkle) {
        star.twinklePhase += deltaTime * 0.002;
        star.brightness = 0.3 + 0.7 * (Math.sin(star.twinklePhase) * 0.5 + 0.5);
      }
    });
  }, [twinkle]);

  // Render stars with electromagnetic effects
  const renderStars = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas with subtle fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    ctx.fillRect(0, 0, width, height);

    starsRef.current.forEach((star, index) => {
      // Project 3D position to 2D
      const scale = 200 / (star.z + 200);
      const x2d = star.x * scale + centerX;
      const y2d = star.y * scale + centerY;
      
      // Skip if star is outside canvas
      if (x2d < 0 || x2d > width || y2d < 0 || y2d > height) return;

      // Calculate electromagnetic glow
      const fieldGlow = star.electromagnetic.fieldStrength * 2;
      const size = star.size * scale * (1 + fieldGlow * 0.5);
      const alpha = star.brightness * (1 + fieldGlow * 0.3) * Math.min(1, scale * 2);

      // Create electromagnetic field gradient
      const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 3);
      
      // Core star color
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      
      // Electromagnetic field color based on field strength
      const fieldColor = star.electromagnetic.fieldStrength > 0.7 ? 
        `rgba(255, 107, 0, ${alpha * 0.6})` : 
        star.electromagnetic.fieldStrength > 0.4 ?
        `rgba(0, 255, 136, ${alpha * 0.4})` :
        `rgba(138, 43, 226, ${alpha * 0.3})`;
      
      gradient.addColorStop(0.3, fieldColor);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      // Draw electromagnetic field
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x2d, y2d, size * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw core star
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.shadowColor = fieldColor;
      ctx.shadowBlur = size * 2;
      ctx.beginPath();
      ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw electromagnetic field lines for highly charged stars
      if (star.electromagnetic.fieldStrength > 0.8) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.strokeStyle = `rgba(255, 107, 0, ${alpha * 0.3})`;
        ctx.lineWidth = 0.5;
        
        const fieldLines = 6;
        for (let i = 0; i < fieldLines; i++) {
          const angle = (i / fieldLines) * Math.PI * 2 + star.electromagnetic.phase;
          const lineLength = size * 8 * star.electromagnetic.fieldStrength;
          
          ctx.beginPath();
          ctx.moveTo(x2d, y2d);
          ctx.lineTo(
            x2d + Math.cos(angle) * lineLength,
            y2d + Math.sin(angle) * lineLength
          );
          ctx.stroke();
        }
        ctx.restore();
      }
    });

    // Draw electromagnetic grid overlay
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
    ctx.lineWidth = 0.5;
    
    const gridSize = 50;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }, []);

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update canvas size if needed
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeStars(canvas);
    }

    // Update and render
    updateStars(canvas, 16.67); // Assume 60fps
    renderStars(canvas, ctx);

    animationRef.current = requestAnimationFrame(animate);
  }, [initializeStars, updateStars, renderStars]);

  // Handle mouse movement
  const handleMouseMove = useCallback((event: MouseEvent) => {
    mouseRef.current = {
      x: event.clientX,
      y: event.clientY
    };
  }, []);

  // Handle window resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initializeStars(canvas);
  }, [initializeStars]);

  // Initialize and start animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize stars
    initializeStars(canvas);

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [animate, handleMouseMove, handleResize, initializeStars]);

  // Update stars when props change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      initializeStars(canvas);
    }
  }, [density, speed, color, initializeStars]);

  return <Canvas ref={canvasRef} />;
};

export default StarField;