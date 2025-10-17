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
    case 'lissajous':
      path = generateLissajousPath(config);
      break;
    case 'mobius':
      path = generateMobiusPath(config);
      break;
    case 'rose':
      path = generateRosePath(config);
      break;
    case 'trefoil':
      path = generateTrefoilPath(config);
      break;
    case 'lorenz':
      path = generateLorenzPath(config);
      break;
    case 'spherical':
      path = generateSphericalHarmonicsPath(config);
      break;
    case 'infinity':
      path = generateInfinityPath(config);
      break;
    case 'star':
      path = generateStarPolyhedronPath(config);
      break;
    case 'conical':
      path = generateConicalHelixPath(config);
      break;
    case 'mandala':
      path = generateMandalaPath(config);
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
 * Generate Lissajous curve (3D parametric) path
 * Creates beautiful figure-8 patterns with varying frequency ratios
 */
export const generateLissajousPath = (
  patternConfig: PatternConfig,
  pointCount: number = 120
): Position3D[] => {
  const path: Position3D[] = [];
  const a = 3; // X frequency
  const b = 4; // Y frequency
  const c = 2; // Z frequency
  const size = 120;

  for (let i = 0; i < pointCount; i++) {
    const t = (i / pointCount) * Math.PI * 2;

    const x = size * Math.sin(a * t);
    const y = size * Math.sin(b * t);
    const z = size * 0.5 * Math.sin(c * t);

    path.push({ x, y, z });
  }

  return path;
};

/**
 * Generate Möbius strip path
 * Creates a twisted surface with single-sided topology
 */
export const generateMobiusPath = (
  patternConfig: PatternConfig,
  pointCount: number = 150
): Position3D[] => {
  const path: Position3D[] = [];
  const radius = 120;
  const width = 40;

  for (let i = 0; i < pointCount; i++) {
    const t = (i / pointCount) * Math.PI * 2;
    const s = 0; // Position along width (0 for center line)

    // Möbius strip parametric equations
    const x = (radius + s * Math.cos(t / 2)) * Math.cos(t);
    const y = (radius + s * Math.cos(t / 2)) * Math.sin(t);
    const z = s * Math.sin(t / 2) * width;

    path.push({ x, y, z });
  }

  return path;
};

/**
 * Generate Rose curve (rhodonea) path
 * Creates beautiful petal patterns
 */
export const generateRosePath = (
  patternConfig: PatternConfig,
  pointCount: number = 200
): Position3D[] => {
  const path: Position3D[] = [];
  const petals = 7; // Number of petals
  const size = 140;

  for (let i = 0; i < pointCount; i++) {
    const theta = (i / pointCount) * Math.PI * 2;

    // Rose curve: r = a * cos(k * θ)
    const r = size * Math.cos(petals * theta);

    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    const z = Math.sin(theta * petals) * 30; // Add z variation

    path.push({ x, y, z });
  }

  return path;
};

/**
 * Generate Trefoil knot path
 * Creates a mathematical knot in 3D space
 */
export const generateTrefoilPath = (
  patternConfig: PatternConfig,
  pointCount: number = 150
): Position3D[] => {
  const path: Position3D[] = [];
  const scale = 50;

  for (let i = 0; i < pointCount; i++) {
    const t = (i / pointCount) * Math.PI * 2;

    // Trefoil knot parametric equations
    const x = scale * (Math.sin(t) + 2 * Math.sin(2 * t));
    const y = scale * (Math.cos(t) - 2 * Math.cos(2 * t));
    const z = scale * (-Math.sin(3 * t));

    path.push({ x, y, z });
  }

  return path;
};

/**
 * Generate Lorenz attractor path (chaotic system)
 * Creates a butterfly-shaped strange attractor
 */
export const generateLorenzPath = (
  patternConfig: PatternConfig,
  pointCount: number = 500
): Position3D[] => {
  const path: Position3D[] = [];

  // Lorenz attractor parameters
  const sigma = 10;
  const rho = 28;
  const beta = 8/3;
  const dt = 0.01;

  // Initial conditions
  let x = 0.1;
  let y = 0;
  let z = 0;

  const scale = 3;

  for (let i = 0; i < pointCount; i++) {
    // Lorenz equations
    const dx = sigma * (y - x);
    const dy = x * (rho - z) - y;
    const dz = x * y - beta * z;

    x += dx * dt;
    y += dy * dt;
    z += dz * dt;

    path.push({
      x: x * scale,
      y: y * scale,
      z: z * scale
    });
  }

  return path;
};

/**
 * Generate spherical harmonics path
 * Creates quantum-like orbital patterns
 */
export const generateSphericalHarmonicsPath = (
  patternConfig: PatternConfig,
  pointCount: number = 200
): Position3D[] => {
  const path: Position3D[] = [];
  const radius = 100;
  const l = 3; // Orbital quantum number
  const m = 2; // Magnetic quantum number

  for (let i = 0; i < pointCount; i++) {
    const t = i / pointCount;
    const theta = t * Math.PI; // 0 to π
    const phi = t * Math.PI * 4; // 0 to 4π (2 rotations)

    // Simplified spherical harmonic modulation
    const harmonic = Math.abs(Math.sin(l * theta) * Math.cos(m * phi));
    const r = radius * (0.5 + harmonic);

    const x = r * Math.sin(theta) * Math.cos(phi);
    const y = r * Math.sin(theta) * Math.sin(phi);
    const z = r * Math.cos(theta);

    path.push({ x, y, z });
  }

  return path;
};

/**
 * Generate infinity symbol (lemniscate) path
 * Creates 3D figure-8 pattern
 */
export const generateInfinityPath = (
  patternConfig: PatternConfig,
  pointCount: number = 100
): Position3D[] => {
  const path: Position3D[] = [];
  const size = 130;

  for (let i = 0; i < pointCount; i++) {
    const t = (i / pointCount) * Math.PI * 2;

    // Lemniscate of Bernoulli in 3D
    const scale = size / (1 + Math.sin(t) ** 2);
    const x = scale * Math.cos(t);
    const y = scale * Math.sin(t) * Math.cos(t);
    const z = Math.sin(t * 2) * 30;

    path.push({ x, y, z });
  }

  return path;
};

/**
 * Generate star polyhedron path
 * Creates geometric star with pointed vertices
 */
export const generateStarPolyhedronPath = (
  patternConfig: PatternConfig,
  pointCount: number = 60
): Position3D[] => {
  const path: Position3D[] = [];
  const outerRadius = 130;
  const innerRadius = 50;
  const points = 12; // Star points

  for (let i = 0; i < pointCount; i++) {
    const t = (i / pointCount) * points;
    const angle = t * Math.PI * 2 / points;

    // Alternate between outer and inner radius
    const radius = (i % 2 === 0) ? outerRadius : innerRadius;

    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const z = Math.sin(angle * 3) * 40;

    path.push({ x, y, z });
  }

  return path;
};

/**
 * Generate conical helix path
 * Spiral that moves along a cone
 */
export const generateConicalHelixPath = (
  patternConfig: PatternConfig,
  pointCount: number = 120
): Position3D[] => {
  const path: Position3D[] = [];
  const maxRadius = 140;
  const height = 250;
  const rotations = 5;

  for (let i = 0; i < pointCount; i++) {
    const t = i / pointCount;
    const angle = t * Math.PI * 2 * rotations;

    // Radius increases linearly (cone shape)
    const radius = t * maxRadius;

    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const z = (t - 0.5) * height;

    path.push({ x, y, z });
  }

  return path;
};

/**
 * Generate mandala pattern path
 * Sacred geometry circular pattern
 */
export const generateMandalaPath = (
  patternConfig: PatternConfig,
  pointCount: number = 180
): Position3D[] => {
  const path: Position3D[] = [];
  const radius = 120;
  const layers = 6;

  for (let i = 0; i < pointCount; i++) {
    const t = i / pointCount;
    const angle = t * Math.PI * 2;

    // Create layered mandala effect
    let r = 0;
    for (let layer = 1; layer <= layers; layer++) {
      r += Math.abs(Math.sin(angle * layer)) * (radius / layers);
    }

    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    const z = Math.sin(angle * 8) * 25;

    path.push({ x, y, z });
  }

  return path;
};

/**
 * Batch convert all pattern configs
 */
export const convertAllPatternsToPattern8D = (
  configs: PatternConfig[]
): Pattern8D[] => {
  return configs.map(config => convertPatternConfigToPattern8D(config));
};
