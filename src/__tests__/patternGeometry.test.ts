// Pattern Geometry Generator Test Suite
// Tests for convertPatternConfigToPattern8D and geometry generation

import { describe, it, expect } from '@jest/globals';
import {
  generateToroidalPath,
  generateVortexPath,
  generateSpiralPath,
  generateHelixPath,
  generateWavePath,
  generateInterferencePath,
  generateStandingWavePath,
  convertPatternConfigToPattern8D,
  convertAllPatternsToPattern8D
} from '../utils/patternGeometry';
import { WAVE_PATTERNS } from '../data/patterns';
import type { Position3D, Pattern8D } from '../types';

describe('Pattern Geometry Generator', () => {
  // Helper: Validate Position3D coordinates
  const isValidPosition3D = (pos: Position3D): boolean => {
    return (
      typeof pos.x === 'number' &&
      typeof pos.y === 'number' &&
      typeof pos.z === 'number' &&
      isFinite(pos.x) &&
      isFinite(pos.y) &&
      isFinite(pos.z)
    );
  };

  // Helper: Validate Pattern8D structure
  const isValidPattern8D = (pattern: Pattern8D): boolean => {
    return (
      typeof pattern.id === 'string' &&
      typeof pattern.name === 'string' &&
      Array.isArray(pattern.path) &&
      pattern.path.length > 0 &&
      pattern.path.every(isValidPosition3D) &&
      typeof pattern.speed === 'number' &&
      isFinite(pattern.speed) &&
      ['clockwise', 'counterclockwise', 'figure8', 'spiral'].includes(pattern.direction)
    );
  };

  describe('Toroidal Path Generation', () => {
    it('should generate valid toroidal path', () => {
      const testConfig = WAVE_PATTERNS.find(p => p.type === 'toroidal')!;
      const path = generateToroidalPath(testConfig, 120);

      expect(path.length).toBe(120);
      expect(path.every(isValidPosition3D)).toBe(true);
    });

    it('should create donut-shaped geometry', () => {
      const testConfig = WAVE_PATTERNS.find(p => p.type === 'toroidal')!;
      const path = generateToroidalPath(testConfig, 60);

      // Check that path loops back to start (donut closes)
      const firstPoint = path[0];
      const lastPoint = path[path.length - 1];
      const distance = Math.sqrt(
        Math.pow(firstPoint.x - lastPoint.x, 2) +
        Math.pow(firstPoint.y - lastPoint.y, 2) +
        Math.pow(firstPoint.z - lastPoint.z, 2)
      );

      // Should be close to starting point (within reasonable tolerance)
      expect(distance).toBeLessThan(100);
    });

    it('should have points distributed around major and minor radius', () => {
      const testConfig = WAVE_PATTERNS.find(p => p.type === 'toroidal')!;
      const path = generateToroidalPath(testConfig, 100);

      // Calculate average distance from origin (should be around major radius)
      const avgDistance = path.reduce((sum, p) => {
        return sum + Math.sqrt(p.x * p.x + p.y * p.y);
      }, 0) / path.length;

      expect(avgDistance).toBeGreaterThan(100);
      expect(avgDistance).toBeLessThan(200);
    });
  });

  describe('Vortex Path Generation', () => {
    it('should generate ascending spiral', () => {
      const testConfig = WAVE_PATTERNS.find(p => p.type === 'vortex')!;
      const path = generateVortexPath(testConfig, 100);

      expect(path.length).toBe(100);
      expect(path.every(isValidPosition3D)).toBe(true);

      // Z coordinates should generally increase (ascending)
      const firstZ = path[0].z;
      const lastZ = path[path.length - 1].z;
      expect(lastZ).toBeGreaterThan(firstZ);
    });

    it('should have decreasing radius as height increases', () => {
      const testConfig = WAVE_PATTERNS.find(p => p.type === 'vortex')!;
      const path = generateVortexPath(testConfig, 100);

      const firstRadius = Math.sqrt(path[0].x ** 2 + path[0].y ** 2);
      const lastRadius = Math.sqrt(path[path.length - 1].x ** 2 + path[path.length - 1].y ** 2);

      expect(lastRadius).toBeLessThan(firstRadius);
    });
  });

  describe('Spiral Path Generation', () => {
    it('should generate flat spiral', () => {
      const testConfig = WAVE_PATTERNS.find(p => p.type === 'spiral')!;
      const path = generateSpiralPath(testConfig, 150);

      expect(path.length).toBe(150);
      expect(path.every(isValidPosition3D)).toBe(true);

      // Spiral should be mostly flat (Z variation should be small)
      const zValues = path.map(p => p.z);
      const maxZ = Math.max(...zValues);
      const minZ = Math.min(...zValues);
      expect(maxZ - minZ).toBeLessThan(50); // Minimal Z variation
    });

    it('should spiral outward from center', () => {
      const testConfig = WAVE_PATTERNS.find(p => p.type === 'spiral')!;
      const path = generateSpiralPath(testConfig, 100);

      const firstRadius = Math.sqrt(path[0].x ** 2 + path[0].y ** 2);
      const lastRadius = Math.sqrt(path[path.length - 1].x ** 2 + path[path.length - 1].y ** 2);

      expect(lastRadius).toBeGreaterThan(firstRadius);
    });
  });

  describe('Helix Path Generation', () => {
    it('should generate double helix structure', () => {
      const testConfig = WAVE_PATTERNS.find(p => p.type === 'helix')!;
      const path = generateHelixPath(testConfig, 100);

      expect(path.length).toBeGreaterThan(100); // More than input due to double strand
      expect(path.every(isValidPosition3D)).toBe(true);
    });

    it('should have vertical progression', () => {
      const testConfig = WAVE_PATTERNS.find(p => p.type === 'helix')!;
      const path = generateHelixPath(testConfig, 100);

      const zValues = path.map(p => p.z);
      const maxZ = Math.max(...zValues);
      const minZ = Math.min(...zValues);

      expect(maxZ - minZ).toBeGreaterThan(200); // Significant vertical span
    });
  });

  describe('Wave Path Generation', () => {
    it('should generate sine wave pattern', () => {
      const testConfig = WAVE_PATTERNS.find(p => p.type === 'wave')!;
      const path = generateWavePath(testConfig, 120);

      expect(path.length).toBe(120);
      expect(path.every(isValidPosition3D)).toBe(true);
    });

    it('should oscillate in Y dimension', () => {
      const testConfig = WAVE_PATTERNS.find(p => p.type === 'wave')!;
      const path = generateWavePath(testConfig, 100);

      const yValues = path.map(p => p.y);
      const maxY = Math.max(...yValues);
      const minY = Math.min(...yValues);

      expect(maxY).toBeGreaterThan(0);
      expect(minY).toBeLessThan(0);
      expect(maxY - minY).toBeGreaterThan(100); // Significant oscillation
    });
  });

  describe('Interference Path Generation', () => {
    it('should generate complex interference pattern', () => {
      const testConfig = WAVE_PATTERNS.find(p => p.type === 'interference')!;
      const path = generateInterferencePath(testConfig, 150);

      expect(path.length).toBe(150);
      expect(path.every(isValidPosition3D)).toBe(true);
    });

    it('should have vertical oscillations from interference', () => {
      const testConfig = WAVE_PATTERNS.find(p => p.type === 'interference')!;
      const path = generateInterferencePath(testConfig, 100);

      const zValues = path.map(p => p.z);
      const maxZ = Math.max(...zValues);
      const minZ = Math.min(...zValues);

      expect(maxZ).toBeGreaterThan(0);
      expect(minZ).toBeLessThan(0);
    });
  });

  describe('Standing Wave Path Generation', () => {
    it('should generate standing wave with nodes', () => {
      const testConfig = WAVE_PATTERNS.find(p => p.type === 'standing')!;
      const path = generateStandingWavePath(testConfig, 100);

      expect(path.length).toBe(100);
      expect(path.every(isValidPosition3D)).toBe(true);
    });

    it('should have multiple wave nodes', () => {
      const testConfig = WAVE_PATTERNS.find(p => p.type === 'standing')!;
      const path = generateStandingWavePath(testConfig, 100);

      const yValues = path.map(p => p.y);

      // Find zero crossings (nodes)
      let nodeCrossings = 0;
      for (let i = 1; i < yValues.length; i++) {
        if ((yValues[i - 1] > 0 && yValues[i] < 0) || (yValues[i - 1] < 0 && yValues[i] > 0)) {
          nodeCrossings++;
        }
      }

      expect(nodeCrossings).toBeGreaterThan(4); // Should have multiple nodes
    });
  });

  describe('PatternConfig to Pattern8D Conversion', () => {
    it('should convert all pattern types successfully', () => {
      WAVE_PATTERNS.forEach(patternConfig => {
        const pattern8D = convertPatternConfigToPattern8D(patternConfig);

        expect(isValidPattern8D(pattern8D)).toBe(true);
        expect(pattern8D.id).toBe(patternConfig.id);
        expect(pattern8D.name).toBe(patternConfig.name);
        expect(pattern8D.path.length).toBeGreaterThan(0);
      });
    });

    it('should generate correct speed based on frequency', () => {
      const deltaPattern = WAVE_PATTERNS.find(p => p.frequencies.beat < 4)!;
      const gammaPattern = WAVE_PATTERNS.find(p => p.frequencies.beat > 30)!;

      const deltaPattern8D = convertPatternConfigToPattern8D(deltaPattern);
      const gammaPattern8D = convertPatternConfigToPattern8D(gammaPattern);

      // Gamma should be faster than delta
      expect(gammaPattern8D.speed).toBeGreaterThan(deltaPattern8D.speed);
    });

    it('should preserve electromagnetic properties', () => {
      const testConfig = WAVE_PATTERNS[0];
      const pattern8D = convertPatternConfigToPattern8D(testConfig);

      expect(pattern8D.electromagnetic.frequency).toBe(testConfig.frequencies.beat);
      expect(pattern8D.electromagnetic.amplitude).toBe(testConfig.electromagnetic.fieldStrength);
      expect(pattern8D.electromagnetic.wavelength).toBeGreaterThan(0);
    });

    it('should set correct color from visualization config', () => {
      const testConfig = WAVE_PATTERNS[0];
      const pattern8D = convertPatternConfigToPattern8D(testConfig);

      expect(pattern8D.color).toBe(testConfig.visualization.color);
    });

    it('should set appropriate direction for each pattern type', () => {
      const toroidal = convertPatternConfigToPattern8D(WAVE_PATTERNS.find(p => p.type === 'toroidal')!);
      const vortex = convertPatternConfigToPattern8D(WAVE_PATTERNS.find(p => p.type === 'vortex')!);
      const spiral = convertPatternConfigToPattern8D(WAVE_PATTERNS.find(p => p.type === 'spiral')!);

      expect(toroidal.direction).toBe('clockwise');
      expect(vortex.direction).toBe('spiral');
      expect(spiral.direction).toBe('spiral');
    });
  });

  describe('Batch Conversion', () => {
    it('should convert all patterns in batch', () => {
      const patterns8D = convertAllPatternsToPattern8D(WAVE_PATTERNS);

      expect(patterns8D.length).toBe(WAVE_PATTERNS.length);
      expect(patterns8D.every(isValidPattern8D)).toBe(true);
    });

    it('should maintain pattern order', () => {
      const patterns8D = convertAllPatternsToPattern8D(WAVE_PATTERNS);

      WAVE_PATTERNS.forEach((config, index) => {
        expect(patterns8D[index].id).toBe(config.id);
        expect(patterns8D[index].name).toBe(config.name);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum point count', () => {
      const testConfig = WAVE_PATTERNS[0];
      const path = generateToroidalPath(testConfig, 10);

      expect(path.length).toBe(10);
      expect(path.every(isValidPosition3D)).toBe(true);
    });

    it('should handle large point counts', () => {
      const testConfig = WAVE_PATTERNS[0];
      const path = generateToroidalPath(testConfig, 1000);

      expect(path.length).toBe(1000);
      expect(path.every(isValidPosition3D)).toBe(true);
    });

    it('should never generate NaN or Infinity', () => {
      WAVE_PATTERNS.forEach(config => {
        const pattern8D = convertPatternConfigToPattern8D(config);

        pattern8D.path.forEach(point => {
          expect(isFinite(point.x)).toBe(true);
          expect(isFinite(point.y)).toBe(true);
          expect(isFinite(point.z)).toBe(true);
        });
      });
    });
  });
});
