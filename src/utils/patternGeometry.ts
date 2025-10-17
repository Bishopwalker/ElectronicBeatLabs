// Pattern Geometry Generator - Converts PatternConfig to Pattern8D with actual 3D paths
// Generates geometric coordinates for electromagnetic field visualizations

import type { PatternConfig, Pattern8D, Position3D, WavePattern } from '../types';

/**
 * Generate toroidal (donut-shaped) 3D path
 * Creates a rotating torus with major and minor radius
 */
export const generateToroidalPath = (
  patternConfig: PatternConfig,
  pointCount: number = 120
): Position3D[] => {
  const path: Position3D[] = [];
  const majorRadius = 150; // Distance from center to tube center
  const minorRadius = 40;  // Tube thickness
  
  for (let i = 0; i < pointCount; i++) {
    const theta = (i / pointCount) * Math.PI * 2; // Around major circle
    const phi = (i / pointCount) * Math.PI * 4;   // Around minor circle (2 loops)
    
    // Toroidal coordinates
    const x = (majorRadius + minorRadius * Math.cos(phi)) * Math.cos(theta);
    const y = (majorRadius + minorRadius * Math.cos(phi)) * Math.sin(theta);
    const z = minorRadius * Math.sin(phi);
    
    path.push({ x, y, z });
  }
  
  return path;
};

/**
 * Generate vortex (ascending spiral) 3D path
 * Creates a cone-shaped spiral rising upward
 */
export const generateVortexPath = (
  patternConfig: PatternConfig,
  pointCount: number = 100
): Position3D[] => {
  const path: Position3D[] = [];
  const maxRadius = 150;
  const height = 200;
  
  for (let i = 0; i < pointCount; i++) {
    const t = i / pointCount;
    const angle = t * Math.PI * 8; // Multiple rotations
    
    // Radius decreases as we ascend (cone shape)
    const radius = maxRadius * (1 - t * 0.7);
    
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const z = (t - 0.5) * height; // -100 to +100
    
    path.push({ x, y, z });
  }
  
  return path;
};

/**
 * Generate spiral (flat spiral) 3D path
 * Creates an Archimedean spiral in the XY plane
 */
export const generateSpiralPath = (
  patternConfig: PatternConfig,
  pointCount: number = 150
): Position3D[] => {
  const path: Position3D[] = [];
  const maxRadius = 180;
  const rotations = 5;
  
  for (let i = 0; i < pointCount; i++) {
    const t = i / pointCount;
    const angle = t * Math.PI * 2 * rotations;
    const radius = t * maxRadius;
    
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const z = Math.sin(angle * 2) * 20; // Slight wave in Z
    
    path.push({ x, y, z });
  }
  
  return path;
};

/**
 * Generate helix (DNA double-helix) 3D path
 * Creates intertwining helical strands
 */
export const generateHelixPath = (
  patternConfig: PatternConfig,
  pointCount: number = 100
): Position3D[] => {
  const path: Position3D[] = [];
  const radius = 80;
  const height = 300;
  const rotations = 4;
  
  // Generate two intertwining helixes
  for (let i = 0; i < pointCount; i++) {
    const t = i / pointCount;
    const angle = t * Math.PI * 2 * rotations;
    
    // First helix
    const x1 = radius * Math.cos(angle);
    const y1 = radius * Math.sin(angle);
    const z = (t - 0.5) * height;
    
    // Add first strand point
    path.push({ x: x1, y: y1, z });
    
    // Second helix (180 degrees out of phase)
    if (i % 2 === 0) {
      const x2 = radius * Math.cos(angle + Math.PI);
      const y2 = radius * Math.sin(angle + Math.PI);
      path.push({ x: x2, y: y2, z });
    }
  }
  
  return path;
};

/**
 * Generate wave (sine wave) 3D path
 * Creates oscillating wave pattern
 */
export const generateWavePath = (
  patternConfig: PatternConfig,
  pointCount: number = 120
): Position3D[] => {
  const path: Position3D[] = [];
  const length = 300;
  const amplitude = 80;
  const frequency = 3;
  
  for (let i = 0; i < pointCount; i++) {
    const t = i / pointCount;
    const x = (t - 0.5) * length;
    const y = amplitude * Math.sin(t * Math.PI * 2 * frequency);
    const z = amplitude * Math.cos(t * Math.PI * 2 * frequency) * 0.5;
    
    path.push({ x, y, z });
  }
  
  return path;
};

/**
 * Generate interference (crossing waves) 3D path
 * Creates complex interference pattern
 */
export const generateInterferencePath = (
  patternConfig: PatternConfig,
  pointCount: number = 150
): Position3D[] => {
  const path: Position3D[] = [];
  const size = 150;
  
  for (let i = 0; i < pointCount; i++) {
    const t = i / pointCount;
    const angle = t * Math.PI * 4;
    
    // Two interfering circular patterns
    const x = size * Math.cos(angle);
    const y = size * Math.sin(angle);
    
    // Interference creates vertical oscillation
    const interference = Math.sin(angle * 3) * Math.cos(angle * 5);
    const z = interference * 60;
    
    path.push({ x, y, z });
  }
  
  return path;
};

/**
 * Generate standing wave 3D path
 * Creates stationary wave with nodes and antinodes
 */
export const generateStandingWavePath = (
  patternConfig: PatternConfig,
  pointCount: number = 100
): Position3D[] => {
  const path: Position3D[] = [];
  const length = 300;
  const amplitude = 70;
  const nodes = 4;
  
  for (let i = 0; i < pointCount; i++) {
    const t = i / pointCount;
    const x = (t - 0.5) * length;
    
    // Standing wave: sin(kx) pattern
    const y = amplitude * Math.sin(t * Math.PI * nodes);
    const z = amplitude * Math.cos(t * Math.PI * nodes) * 0.3;
    
    path.push({ x, y, z });
  }
  
  return path;
};

/**
 * Main converter: PatternConfig → Pattern8D
 * Generates actual 3D geometry based on pattern type
 */
export const convertPatternConfigToPattern8D = (
  config: PatternConfig
): Pattern8D => {
  let path: Position3D[] = [];
  
  // Generate path based on pattern type
  switch (config.type) {
    case 'toroidal':
      path = generateToroidalPath(config);
      break;
    case 'vortex':
      path = generateVortexPath(config);
      break;
    case 'spiral':
      path = generateSpiralPath(config);
      break;
    case 'helix':
      path = generateHelixPath(config);
      break;
    case 'wave':
      path = generateWavePath(config);
      break;
    case 'interference':
      path = generateInterferencePath(config);
      break;
    case 'standing':
      path = generateStandingWavePath(config);
      break;
    default:
      // Fallback: simple circle
      path = generateCirclePath(50);
  }
  
  // Determine direction based on pattern characteristics
  const direction = determineDirection(config.type);
  
  // Calculate speed based on beat frequency
  const speed = calculateSpeed(config.frequencies.beat);
  
  console.log('✅ Pattern Geometry Generated:', {
    type: config.type,
    points: path.length,
    direction,
    speed,
    beatFreq: config.frequencies.beat
  });
  
  return {
    id: config.id,
    name: config.name,
    path,
    speed,
    direction,
    intensity: config.electromagnetic.fieldStrength,
    color: config.visualization.color,
    electromagnetic: {
      frequency: config.frequencies.beat,
      wavelength: calculateWavelength(config.frequencies.beat),
      amplitude: config.electromagnetic.fieldStrength
    }
  };
};

/**
 * Helper: Generate simple circle path (fallback)
 */
const generateCirclePath = (pointCount: number = 50): Position3D[] => {
  const path: Position3D[] = [];
  const radius = 100;
  
  for (let i = 0; i < pointCount; i++) {
    const angle = (i / pointCount) * Math.PI * 2;
    path.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      z: 0
    });
  }
  
  return path;
};

/**
 * Helper: Determine rotation direction from pattern type
 */
const determineDirection = (
  type: WavePattern
): 'clockwise' | 'counterclockwise' | 'figure8' | 'spiral' => {
  switch (type) {
    case 'toroidal':
      return 'clockwise';
    case 'vortex':
      return 'spiral';
    case 'spiral':
      return 'spiral';
    case 'helix':
      return 'figure8';
    case 'wave':
      return 'counterclockwise';
    case 'interference':
      return 'figure8';
    case 'standing':
      return 'clockwise';
    default:
      return 'clockwise';
  }
};

/**
 * Helper: Calculate animation speed from frequency
 * Higher frequencies = faster movement
 */
const calculateSpeed = (beatFrequency: number): number => {
  // Base speed of 1, scale with frequency
  // Delta (0.5-4 Hz) → slow (0.3-0.6)
  // Theta (4-8 Hz) → medium (0.6-0.9)
  // Alpha (8-13 Hz) → fast (0.9-1.2)
  // Beta (13-30 Hz) → very fast (1.2-2.0)
  // Gamma (30+ Hz) → ultra fast (2.0-3.0)
  
  if (beatFrequency < 4) return 0.3 + (beatFrequency / 4) * 0.3;
  if (beatFrequency < 8) return 0.6 + ((beatFrequency - 4) / 4) * 0.3;
  if (beatFrequency < 13) return 0.9 + ((beatFrequency - 8) / 5) * 0.3;
  if (beatFrequency < 30) return 1.2 + ((beatFrequency - 13) / 17) * 0.8;
  return 2.0 + Math.min((beatFrequency - 30) / 70, 1.0);
};

/**
 * Helper: Calculate wavelength from frequency
 * λ = c / f (simplified for visualization)
 */
const calculateWavelength = (frequency: number): number => {
  const speedOfSound = 343; // m/s
  return speedOfSound / frequency;
};

/**
 * Batch convert all pattern configs
 */
export const convertAllPatternsToPattern8D = (
  configs: PatternConfig[]
): Pattern8D[] => {
  return configs.map(config => convertPatternConfigToPattern8D(config));
};
