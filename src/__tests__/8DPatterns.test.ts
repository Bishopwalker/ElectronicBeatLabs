// 8D Patterns Test Suite
// Test electromagnetic field pattern generation and animation

import { renderHook, act } from '@testing-library/react';
import { use8DPatterns } from '../hooks/use8DPatterns';

describe('use8DPatterns - 8D Pattern Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default patterns', () => {
    const { result } = renderHook(() => use8DPatterns());
    
    expect(result.current.patterns).toHaveLength(8);
    expect(result.current.activePattern).toBeTruthy();
    expect(result.current.activePattern?.name).toBe('Maximum Resonance Toroid');
    expect(result.current.isAnimating).toBe(false);
  });

  it('should create toroidal pattern correctly', () => {
    const { result } = renderHook(() => use8DPatterns());
    
    const toroidalPattern = result.current.createPattern(
      'toroidal',
      'test-toroidal',
      'Test Toroidal',
      40
    );

    expect(toroidalPattern.name).toBe('Test Toroidal');
    expect(toroidalPattern.color).toBe('#ff6b00');
    expect(toroidalPattern.electromagnetic.frequency).toBe(40);
    expect(toroidalPattern.path.length).toBeGreaterThan(0);
  });

  it('should create vortex pattern correctly', () => {
    const { result } = renderHook(() => use8DPatterns());
    
    const vortexPattern = result.current.createPattern(
      'vortex',
      'test-vortex',
      'Test Vortex',
      12
    );

    expect(vortexPattern.name).toBe('Test Vortex');
    expect(vortexPattern.color).toBe('#8a2be2');
    expect(vortexPattern.speed).toBe(1.2);
    expect(vortexPattern.direction).toBe('spiral');
  });

  it('should start animation correctly', async () => {
    const { result } = renderHook(() => use8DPatterns());
    
    const pattern = result.current.patterns[0];
    
    act(() => {
      result.current.startAnimation(pattern);
    });

    expect(result.current.isAnimating).toBe(true);
    expect(result.current.activePattern?.id).toBe(pattern.id);
  });

  it('should stop animation correctly', () => {
    const { result } = renderHook(() => use8DPatterns());
    
    const pattern = result.current.patterns[0];
    
    act(() => {
      result.current.startAnimation(pattern);
    });

    act(() => {
      result.current.stopAnimation();
    });

    expect(result.current.isAnimating).toBe(false);
  });

  it('should get pattern by ID', () => {
    const { result } = renderHook(() => use8DPatterns());
    
    const pattern = result.current.getPatternById('toroidal-max');
    
    expect(pattern).toBeTruthy();
    expect(pattern?.name).toBe('Maximum Resonance Toroid');
  });

  it('should calculate field strength correctly', () => {
    const { result } = renderHook(() => use8DPatterns());
    
    const position = { x: 10, y: 10, z: 10 };
    const pattern = result.current.patterns[0];
    
    const fieldStrength = result.current.calculateFieldStrength(position, pattern);
    
    expect(fieldStrength).toBeGreaterThan(0);
    expect(fieldStrength).toBeLessThanOrEqual(1);
  });

  it('should create custom pattern', () => {
    const { result } = renderHook(() => use8DPatterns());
    
    const customPoints = [
      { x: 0, y: 0, z: 0 },
      { x: 50, y: 50, z: 50 },
      { x: 100, y: 0, z: 0 }
    ];
    
    const customPattern = result.current.createCustomPattern(
      customPoints,
      'Custom Test',
      1.5,
      0.9,
      20
    );

    expect(customPattern.name).toBe('Custom Test');
    expect(customPattern.speed).toBe(1.5);
    expect(customPattern.intensity).toBe(0.9);
    expect(customPattern.electromagnetic.frequency).toBe(20);
    expect(customPattern.path).toHaveLength(3);
  });

  it('should morph between patterns', () => {
    const { result } = renderHook(() => use8DPatterns());
    
    const pattern1 = result.current.patterns[0];
    const pattern2 = result.current.patterns[1];
    const morphFactor = 0.5;
    
    const morphedPattern = result.current.morphPatterns(
      pattern1,
      pattern2,
      morphFactor
    );

    expect(morphedPattern.name).toContain('→');
    expect(morphedPattern.speed).toBe(
      pattern1.speed * 0.5 + pattern2.speed * 0.5
    );
    expect(morphedPattern.path.length).toBeGreaterThan(0);
  });

  it('should handle animation progress updates', async () => {
    const { result } = renderHook(() => use8DPatterns());
    
    const pattern = result.current.patterns[0];
    
    act(() => {
      result.current.startAnimation(pattern);
    });

    // Wait for animation update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.animationProgress).toBeGreaterThanOrEqual(0);
    expect(result.current.currentPosition).toBeDefined();
  });
});