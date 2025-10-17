// Audio-Reactive Pattern Modulation System
// Ties 8D patterns to live frequency analyzer data for real-time visualization

import type { Pattern8D, Position3D, FrequencyAnalysis } from '../types';

/**
 * Frequency band analysis from audio data
 */
export interface AudioFrequencyBands {
  bass: number;      // 20-250 Hz (0-1)
  lowMid: number;    // 250-500 Hz (0-1)
  mid: number;       // 500-2000 Hz (0-1)
  highMid: number;   // 2000-4000 Hz (0-1)
  treble: number;    // 4000-20000 Hz (0-1)
  overall: number;   // Total energy (0-1)
}

/**
 * Audio-reactive pattern modulation parameters
 */
export interface AudioReactiveModulation {
  scaleModulation: number;    // How much size responds to audio (0-2)
  speedModulation: number;    // How much speed responds to audio (0-3)
  colorModulation: number;    // How much color responds to audio (0-360 degrees)
  morphModulation: number;    // How much shape morphs to audio (0-1)
  intensityModulation: number; // How much glow/intensity responds (0-1)
}

/**
 * Extract frequency bands from audio analyzer
 * Simulated for now - will connect to actual analyzer
 */
export const extractFrequencyBands = (
  frequencyData: Uint8Array | null
): AudioFrequencyBands => {
  if (!frequencyData || frequencyData.length === 0) {
    return {
      bass: 0,
      lowMid: 0,
      mid: 0,
      highMid: 0,
      treble: 0,
      overall: 0
    };
  }

  const dataLength = frequencyData.length;

  // Calculate average for each frequency band
  const bass = averageFrequencyRange(frequencyData, 0, Math.floor(dataLength * 0.1));
  const lowMid = averageFrequencyRange(frequencyData, Math.floor(dataLength * 0.1), Math.floor(dataLength * 0.25));
  const mid = averageFrequencyRange(frequencyData, Math.floor(dataLength * 0.25), Math.floor(dataLength * 0.5));
  const highMid = averageFrequencyRange(frequencyData, Math.floor(dataLength * 0.5), Math.floor(dataLength * 0.75));
  const treble = averageFrequencyRange(frequencyData, Math.floor(dataLength * 0.75), dataLength);

  // Overall energy
  const overall = (bass + lowMid + mid + highMid + treble) / 5;

  return { bass, lowMid, mid, highMid, treble, overall };
};

/**
 * Helper: Calculate average frequency in range
 */
const averageFrequencyRange = (
  data: Uint8Array,
  startIndex: number,
  endIndex: number
): number => {
  let sum = 0;
  let count = 0;

  for (let i = startIndex; i < endIndex && i < data.length; i++) {
    sum += data[i];
    count++;
  }

  // Normalize to 0-1 range (frequency data is 0-255)
  return count > 0 ? sum / (count * 255) : 0;
};

/**
 * Modulate pattern scale based on audio
 * Bass frequencies = larger scale
 */
export const modulatePatternScale = (
  pattern: Pattern8D,
  audioBands: AudioFrequencyBands,
  modulation: AudioReactiveModulation
): Pattern8D => {
  if (modulation.scaleModulation === 0) return pattern;

  // Bass makes patterns bigger, treble makes them sharper
  const scaleFactor = 1 + (audioBands.bass * modulation.scaleModulation * 0.5) - (audioBands.treble * 0.2);

  const scaledPath = pattern.path.map(point => ({
    x: point.x * scaleFactor,
    y: point.y * scaleFactor,
    z: point.z * scaleFactor
  }));

  return {
    ...pattern,
    path: scaledPath
  };
};

/**
 * Modulate pattern speed based on audio
 * Higher frequencies = faster movement
 */
export const modulatePatternSpeed = (
  pattern: Pattern8D,
  audioBands: AudioFrequencyBands,
  modulation: AudioReactiveModulation
): Pattern8D => {
  if (modulation.speedModulation === 0) return pattern;

  // Mid and treble frequencies increase speed
  const speedFactor = 1 + (audioBands.mid + audioBands.treble) * modulation.speedModulation * 0.5;

  return {
    ...pattern,
    speed: pattern.speed * speedFactor
  };
};

/**
 * Modulate pattern color based on audio
 * Different frequency bands affect hue
 */
export const modulatePatternColor = (
  pattern: Pattern8D,
  audioBands: AudioFrequencyBands,
  modulation: AudioReactiveModulation
): Pattern8D => {
  if (modulation.colorModulation === 0) return pattern;

  // Convert current color to HSL
  const hsl = hexToHSL(pattern.color);

  // Each frequency band shifts hue differently
  const hueShift =
    (audioBands.bass * 30) +      // Bass → red/orange shift
    (audioBands.lowMid * 60) +    // Low-mid → yellow/green
    (audioBands.mid * 120) +      // Mid → cyan/blue
    (audioBands.highMid * 180) +  // High-mid → purple
    (audioBands.treble * 240);    // Treble → pink/red

  const newHue = (hsl.h + hueShift * modulation.colorModulation) % 360;

  // Increase saturation with overall energy
  const newSaturation = Math.min(100, hsl.s + (audioBands.overall * 20));

  return {
    ...pattern,
    color: hslToHex(newHue, newSaturation, hsl.l)
  };
};

/**
 * Modulate pattern intensity based on audio
 * Overall energy affects glow/brightness
 */
export const modulatePatternIntensity = (
  pattern: Pattern8D,
  audioBands: AudioFrequencyBands,
  modulation: AudioReactiveModulation
): Pattern8D => {
  if (modulation.intensityModulation === 0) return pattern;

  const intensityBoost = audioBands.overall * modulation.intensityModulation;

  return {
    ...pattern,
    intensity: Math.min(1, pattern.intensity + intensityBoost),
    electromagnetic: {
      ...pattern.electromagnetic,
      amplitude: Math.min(2, pattern.electromagnetic.amplitude + intensityBoost)
    }
  };
};

/**
 * Morph pattern path based on audio
 * Creates dynamic deformations
 */
export const morphPatternPath = (
  pattern: Pattern8D,
  audioBands: AudioFrequencyBands,
  modulation: AudioReactiveModulation,
  time: number
): Pattern8D => {
  if (modulation.morphModulation === 0) return pattern;

  const morphedPath = pattern.path.map((point, index) => {
    const t = index / pattern.path.length;

    // Bass creates wave-like deformations
    const bassWave = Math.sin(t * Math.PI * 4 + time * 0.001) * audioBands.bass * 20 * modulation.morphModulation;

    // Treble creates high-frequency ripples
    const trebleRipple = Math.sin(t * Math.PI * 20 + time * 0.003) * audioBands.treble * 10 * modulation.morphModulation;

    // Mid frequencies add rotation
    const midRotation = (audioBands.mid * Math.PI * 0.1 * modulation.morphModulation);
    const rotatedX = point.x * Math.cos(midRotation) - point.y * Math.sin(midRotation);
    const rotatedY = point.x * Math.sin(midRotation) + point.y * Math.cos(midRotation);

    return {
      x: rotatedX + bassWave,
      y: rotatedY + bassWave,
      z: point.z + trebleRipple
    };
  });

  return {
    ...pattern,
    path: morphedPath
  };
};

/**
 * Apply all audio-reactive modulations to pattern
 * Main entry point for real-time audio reactivity
 */
export const applyAudioReactiveModulation = (
  pattern: Pattern8D,
  frequencyData: Uint8Array | null,
  modulation: AudioReactiveModulation,
  time: number = performance.now()
): Pattern8D => {
  // Extract frequency bands
  const audioBands = extractFrequencyBands(frequencyData);

  // Apply all modulations in sequence
  let modulatedPattern = pattern;

  modulatedPattern = modulatePatternScale(modulatedPattern, audioBands, modulation);
  modulatedPattern = modulatePatternSpeed(modulatedPattern, audioBands, modulation);
  modulatedPattern = modulatePatternColor(modulatedPattern, audioBands, modulation);
  modulatedPattern = modulatePatternIntensity(modulatedPattern, audioBands, modulation);
  modulatedPattern = morphPatternPath(modulatedPattern, audioBands, modulation, time);

  return modulatedPattern;
};

/**
 * Create preset audio-reactive modulation profiles
 */
export const AUDIO_REACTIVE_PRESETS: Record<string, AudioReactiveModulation> = {
  subtle: {
    scaleModulation: 0.3,
    speedModulation: 0.5,
    colorModulation: 0.2,
    morphModulation: 0.2,
    intensityModulation: 0.3
  },
  moderate: {
    scaleModulation: 0.7,
    speedModulation: 1.0,
    colorModulation: 0.5,
    morphModulation: 0.5,
    intensityModulation: 0.6
  },
  intense: {
    scaleModulation: 1.5,
    speedModulation: 2.0,
    colorModulation: 0.8,
    morphModulation: 0.8,
    intensityModulation: 1.0
  },
  extreme: {
    scaleModulation: 2.0,
    speedModulation: 3.0,
    colorModulation: 1.0,
    morphModulation: 1.0,
    intensityModulation: 1.0
  },
  bassOnly: {
    scaleModulation: 2.0,
    speedModulation: 0.2,
    colorModulation: 0.3,
    morphModulation: 1.5,
    intensityModulation: 0.8
  },
  trebleOnly: {
    scaleModulation: 0.3,
    speedModulation: 3.0,
    colorModulation: 1.0,
    morphModulation: 0.5,
    intensityModulation: 1.0
  }
};

// ==================== COLOR CONVERSION UTILITIES ====================

/**
 * Convert hex color to HSL
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace('#', '');

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default {
  extractFrequencyBands,
  modulatePatternScale,
  modulatePatternSpeed,
  modulatePatternColor,
  modulatePatternIntensity,
  morphPatternPath,
  applyAudioReactiveModulation,
  AUDIO_REACTIVE_PRESETS
};
