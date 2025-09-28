// Electromagnetic Beat Lab - 8D Patterns Hook
// Advanced 8-dimensional pattern animations for maximum electromagnetic resonance

import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  Pattern8D, 
  Position3D, 
  WavePattern 
} from '../types';

export const use8DPatterns = () => {
  const [patterns, setPatterns] = useState<Pattern8D[]>([]);
  const [activePattern, setActivePattern] = useState<Pattern8D | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position3D>({ x: 0, y: 0, z: 0 });
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const patternIndexRef = useRef<number>(0);

  // Generate toroidal pattern (maximum resonance)
  const generateToroidalPattern = useCallback((
    majorRadius: number = 100,
    minorRadius: number = 30,
    resolution: number = 64
  ): Position3D[] => {
    const path: Position3D[] = [];
    
    for (let i = 0; i < resolution; i++) {
      const u = (i / resolution) * 2 * Math.PI;
      
      for (let j = 0; j < resolution / 4; j++) {
        const v = (j / (resolution / 4)) * 2 * Math.PI;
        
        const x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
        const y = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
        const z = minorRadius * Math.sin(v);
        
        path.push({ x, y, z });
      }
    }
    
    return path;
  }, []);

  // Generate vortex pattern
  const generateVortexPattern = useCallback((
    radius: number = 80,
    height: number = 160,
    turns: number = 8,
    resolution: number = 128
  ): Position3D[] => {
    const path: Position3D[] = [];
    
    for (let i = 0; i < resolution; i++) {
      const t = i / resolution;
      const angle = t * turns * 2 * Math.PI;
      const r = radius * (1 - t * 0.8);
      
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      const z = height * (t - 0.5);
      
      path.push({ x, y, z });
    }
    
    return path;
  }, []);

  // Generate spiral pattern
  const generateSpiralPattern = useCallback((
    radius: number = 60,
    height: number = 120,
    turns: number = 4,
    resolution: number = 96
  ): Position3D[] => {
    const path: Position3D[] = [];
    
    for (let i = 0; i < resolution; i++) {
      const t = i / resolution;
      const angle = t * turns * 2 * Math.PI;
      
      const x = radius * Math.cos(angle) * (1 + t * 0.5);
      const y = radius * Math.sin(angle) * (1 + t * 0.5);
      const z = height * (t - 0.5);
      
      path.push({ x, y, z });
    }
    
    return path;
  }, []);

  // Generate helix pattern
  const generateHelixPattern = useCallback((
    radius: number = 50,
    height: number = 100,
    turns: number = 6,
    resolution: number = 80
  ): Position3D[] => {
    const path: Position3D[] = [];
    
    for (let i = 0; i < resolution; i++) {
      const t = i / resolution;
      const angle = t * turns * 2 * Math.PI;
      
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const z = height * (t - 0.5);
      
      path.push({ x, y, z });
    }
    
    return path;
  }, []);

  // Generate wave interference pattern
  const generateInterferencePattern = useCallback((
    amplitude: number = 70,
    frequency1: number = 3,
    frequency2: number = 5,
    resolution: number = 100
  ): Position3D[] => {
    const path: Position3D[] = [];
    
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution / 2; j++) {
        const x = (i - resolution / 2) * 2;
        const y = (j - resolution / 4) * 2;
        
        const wave1 = Math.sin(Math.sqrt(x * x + y * y) * frequency1 * 0.01) * amplitude * 0.3;
        const wave2 = Math.sin(Math.sqrt(x * x + y * y) * frequency2 * 0.01) * amplitude * 0.3;
        const z = wave1 + wave2;
        
        path.push({ x, y, z });
      }
    }
    
    return path;
  }, []);

  // Generate standing wave pattern
  const generateStandingWavePattern = useCallback((
    amplitude: number = 60,
    wavelength: number = 40,
    nodes: number = 8,
    resolution: number = 120
  ): Position3D[] => {
    const path: Position3D[] = [];
    
    for (let i = 0; i < resolution; i++) {
      const x = (i / resolution - 0.5) * wavelength * nodes;
      const y = 0;
      const z = amplitude * Math.sin((x / wavelength) * 2 * Math.PI) * Math.cos((i / resolution) * 2 * Math.PI);
      
      path.push({ x, y, z });
      
      // Add perpendicular components for 3D effect
      const y2 = amplitude * Math.cos((x / wavelength) * 2 * Math.PI) * Math.sin((i / resolution) * 2 * Math.PI);
      path.push({ x, y: y2, z: 0 });
    }
    
    return path;
  }, []);

  // Create pattern based on type
  const createPattern = useCallback((
    type: WavePattern,
    id: string,
    name: string,
    frequency: number = 40
  ): Pattern8D => {
    let path: Position3D[] = [];
    let color = '#00ff88';
    let speed = 1;
    let direction: 'clockwise' | 'counterclockwise' | 'figure8' | 'spiral' = 'clockwise';

    switch (type) {
      case 'toroidal':
        path = generateToroidalPattern();
        color = '#ff6b00';
        speed = 0.8;
        direction = 'clockwise';
        break;
      case 'vortex':
        path = generateVortexPattern();
        color = '#8a2be2';
        speed = 1.2;
        direction = 'spiral';
        break;
      case 'spiral':
        path = generateSpiralPattern();
        color = '#00bfff';
        speed = 1.0;
        direction = 'spiral';
        break;
      case 'helix':
        path = generateHelixPattern();
        color = '#ff1493';
        speed = 0.9;
        direction = 'clockwise';
        break;
      case 'interference':
        path = generateInterferencePattern();
        color = '#32cd32';
        speed = 0.6;
        direction = 'figure8';
        break;
      case 'standing':
        path = generateStandingWavePattern();
        color = '#ffd700';
        speed = 0.7;
        direction = 'figure8';
        break;
      default:
        path = generateToroidalPattern();
        color = '#00ff88';
        speed = 1.0;
        direction = 'clockwise';
    }

    return {
      id,
      name,
      path,
      speed,
      direction,
      intensity: 0.8,
      color,
      electromagnetic: {
        frequency,
        wavelength: 299792458 / (frequency * 1000000), // c/f in meters
        amplitude: 0.7
      }
    };
  }, [
    generateToroidalPattern,
    generateVortexPattern,
    generateSpiralPattern,
    generateHelixPattern,
    generateInterferencePattern,
    generateStandingWavePattern
  ]);

  // Initialize default patterns
  const initializePatterns = useCallback(() => {
    const defaultPatterns: Pattern8D[] = [
      createPattern('toroidal', 'toroidal-max', 'Maximum Resonance Toroid', 40),
      createPattern('vortex', 'vortex-focus', 'Focus Enhancement Vortex', 12),
      createPattern('spiral', 'spiral-creativity', 'Creativity Spiral', 8),
      createPattern('helix', 'helix-healing', 'Healing Helix', 6),
      createPattern('interference', 'interference-balance', 'Balance Interference', 10),
      createPattern('standing', 'standing-meditation', 'Meditation Standing Wave', 4),
      createPattern('toroidal', 'toroidal-gamma', 'ADHD Gamma Toroid', 40),
      createPattern('vortex', 'vortex-theta', 'Deep State Vortex', 7)
    ];

    setPatterns(defaultPatterns);
    setActivePattern(defaultPatterns[0]);
  }, [createPattern]);

  // Start pattern animation
  const startAnimation = useCallback((pattern: Pattern8D) => {
    if (!pattern.path.length) return;

    setActivePattern(pattern);
    setIsAnimating(true);
    startTimeRef.current = Date.now();
    patternIndexRef.current = 0;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTimeRef.current;
      const cycleDuration = (pattern.path.length / pattern.speed) * 50; // ms per cycle
      
      const progress = (elapsed % cycleDuration) / cycleDuration;
      const index = Math.floor(progress * pattern.path.length);
      
      setAnimationProgress(progress);
      setCurrentPosition(pattern.path[index] || { x: 0, y: 0, z: 0 });
      
      if (isAnimating) {
        // Reduce to 20fps for eyes-closed usage
        animationRef.current = window.setTimeout(animate, 50);
      }
    };

    animationRef.current = window.setTimeout(animate, 50);
  }, [isAnimating]);

  // Stop pattern animation
  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  }, []);

  // Get pattern by ID
  const getPatternById = useCallback((id: string): Pattern8D | null => {
    return patterns.find(p => p.id === id) || null;
  }, [patterns]);

  // Calculate electromagnetic field strength at position
  const calculateFieldStrength = useCallback((
    position: Position3D,
    pattern: Pattern8D
  ): number => {
    const distance = Math.sqrt(
      position.x * position.x + 
      position.y * position.y + 
      position.z * position.z
    );
    
    // Field strength decreases with distance but increases with pattern intensity
    const baseStrength = pattern.intensity * pattern.electromagnetic.amplitude;
    const distanceFactor = 1 / (1 + distance * 0.01);
    
    return baseStrength * distanceFactor;
  }, []);

  // Generate custom pattern from user parameters
  const createCustomPattern = useCallback((
    points: Position3D[],
    name: string,
    speed: number = 1,
    intensity: number = 0.8,
    frequency: number = 10
  ): Pattern8D => {
    return {
      id: `custom-${Date.now()}`,
      name,
      path: points,
      speed,
      direction: 'clockwise',
      intensity,
      color: '#ff69b4',
      electromagnetic: {
        frequency,
        wavelength: 299792458 / (frequency * 1000000),
        amplitude: intensity
      }
    };
  }, []);

  // Morph between two patterns
  const morphPatterns = useCallback((
    pattern1: Pattern8D,
    pattern2: Pattern8D,
    factor: number // 0 to 1
  ): Pattern8D => {
    const morphedPath: Position3D[] = [];
    const maxLength = Math.max(pattern1.path.length, pattern2.path.length);
    
    for (let i = 0; i < maxLength; i++) {
      const p1 = pattern1.path[i % pattern1.path.length] || { x: 0, y: 0, z: 0 };
      const p2 = pattern2.path[i % pattern2.path.length] || { x: 0, y: 0, z: 0 };
      
      morphedPath.push({
        x: p1.x * (1 - factor) + p2.x * factor,
        y: p1.y * (1 - factor) + p2.y * factor,
        z: p1.z * (1 - factor) + p2.z * factor
      });
    }

    return {
      id: `morph-${Date.now()}`,
      name: `${pattern1.name} → ${pattern2.name}`,
      path: morphedPath,
      speed: pattern1.speed * (1 - factor) + pattern2.speed * factor,
      direction: pattern1.direction,
      intensity: pattern1.intensity * (1 - factor) + pattern2.intensity * factor,
      color: factor < 0.5 ? pattern1.color : pattern2.color,
      electromagnetic: {
        frequency: pattern1.electromagnetic.frequency * (1 - factor) + 
                  pattern2.electromagnetic.frequency * factor,
        wavelength: pattern1.electromagnetic.wavelength * (1 - factor) + 
                   pattern2.electromagnetic.wavelength * factor,
        amplitude: pattern1.electromagnetic.amplitude * (1 - factor) + 
                  pattern2.electromagnetic.amplitude * factor
      }
    };
  }, []);

  // Initialize patterns on mount
  useEffect(() => {
    initializePatterns();
  }, [initializePatterns]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    patterns,
    activePattern,
    currentPosition,
    animationProgress,
    isAnimating,
    startAnimation,
    stopAnimation,
    getPatternById,
    calculateFieldStrength,
    createCustomPattern,
    morphPatterns,
    createPattern,
    setActivePattern
  };
};