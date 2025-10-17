// Pattern Converter Utility
// Converts PatternConfig to Pattern8D for SpatialVisualizer

import type { PatternConfig, Pattern8D, Position3D } from '../types';

/**
 * Generates a 3D path for Pattern8D based on pattern type
 */
function generatePathForPattern(type: string, intensity: number): Position3D[] {
  const points: Position3D[] = [];
  const numPoints = 100;

  switch (type) {
    case 'toroidal':
      // Torus path
      for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2;
        const majorRadius = 100;
        const minorRadius = 40 * intensity;
        points.push({
          x: (majorRadius + minorRadius * Math.cos(t * 3)) * Math.cos(t),
          y: (majorRadius + minorRadius * Math.cos(t * 3)) * Math.sin(t),
          z: minorRadius * Math.sin(t * 3)
        });
      }
      break;

    case 'vortex':
    case 'spiral':
      // Spiral path
      for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 6;
        const radius = t * 15 * intensity;
        points.push({
          x: Math.cos(t) * radius,
          y: Math.sin(t) * radius,
          z: (i / numPoints) * 100 - 50
        });
      }
      break;

    case 'helix':
      // Helix path
      for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 8;
        const radius = 80 * intensity;
        points.push({
          x: Math.cos(t) * radius,
          y: Math.sin(t) * radius,
          z: (i / numPoints) * 200 - 100
        });
      }
      break;

    case 'wave':
    case 'interference':
    case 'standing':
      // Wave path
      for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 4;
        points.push({
          x: t * 40 - 80,
          y: Math.sin(t) * 60 * intensity,
          z: Math.cos(t * 2) * 30
        });
      }
      break;

    default:
      // Circle path (default)
      for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2;
        const radius = 100 * intensity;
        points.push({
          x: Math.cos(t) * radius,
          y: Math.sin(t) * radius,
          z: 0
        });
      }
  }

  return points;
}

/**
 * Converts PatternConfig to Pattern8D for spatial visualization
 */
export function convertPatternConfigToPattern8D(config: PatternConfig): Pattern8D {
  const intensity = config.electromagnetic?.fieldStrength || 0.5;
  
  return {
    id: config.id,
    name: config.name,
    path: generatePathForPattern(config.type, intensity),
    speed: config.electromagnetic?.resonanceFreq ? config.electromagnetic.resonanceFreq / 10 : 1,
    direction: config.type === 'vortex' ? 'spiral' : 'clockwise',
    intensity: intensity,
    color: config.visualization?.color || '#00ff88',
    electromagnetic: {
      frequency: config.frequencies.beat,
      wavelength: config.electromagnetic?.resonanceFreq || 100,
      amplitude: intensity
    }
  };
}

/**
 * Creates a default Pattern8D when no pattern is selected
 */
export function createDefaultPattern8D(): Pattern8D {
  return {
    id: 'default',
    name: 'Default Pattern',
    path: generatePathForPattern('toroidal', 0.5),
    speed: 1,
    direction: 'clockwise',
    intensity: 0.5,
    color: '#00ff88',
    electromagnetic: {
      frequency: 4,
      wavelength: 100,
      amplitude: 0.5
    }
  };
}
