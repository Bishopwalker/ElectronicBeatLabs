/**
 * Centralized Audio Control Utilities
 *
 * This module provides standardized start/stop functions for audio playback
 * that can be used across the entire application.
 *
 * USAGE:
 * - Import { startBinauralAudio, stopBinauralAudio } from './utils/audioControls'
 * - Call these functions instead of directly manipulating audio engines
 * - These functions handle all the complex logic and error handling
 */

import type { BinauralBeatConfig } from '../types';
import { DEFAULT_BASE_FREQUENCY, DEFAULT_BEAT_FREQUENCY, DEFAULT_VOLUME } from '../constants/audio.constants';

/**
 * Audio Control Configuration
 */
export interface AudioControlConfig {
  base_frequency?: number;
  beat_frequency?: number;
  amplitude?: number;
  volume?: number; // Alias for amplitude
  waveform?: 'sine' | 'square' | 'sawtooth' | 'triangle';
  spatial?: {
    enabled?: boolean;
    mode?: '3d' | 'binaural';
    positioning?: 'headphones' | 'speakers';
    roomSize?: 'small' | 'medium' | 'large';
  };
}

/**
 * Audio Engine Interface
 * Defines the minimum interface required for audio control
 */
export interface AudioEngineInterface {
  startBinauralBeat: (config: BinauralBeatConfig) => Promise<void> | void;
  stopBinauralBeat: () => Promise<void> | void;
  audioContext?: AudioContext;
  analyserNode?: AnalyserNode;
}

/**
 * Timer Control Interface
 * Optional interface for stopping timers
 */
export interface TimerControlInterface {
  stopTimer: () => void;
}

/**
 * START AUDIO FLOW
 * =================
 *
 * 1. Validate audio engine exists
 * 2. Build BinauralBeatConfig with proper defaults
 * 3. Call engine's startBinauralBeat() method
 * 4. Return success/failure result
 * 5. Caller handles state updates (isPlaying: true)
 *
 * @param audioEngine - The hybrid audio engine (frontend + backend)
 * @param config - Audio configuration (base_frequency, beat_frequency, amplitude, etc.)
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function startBinauralAudio(
  audioEngine: AudioEngineInterface,
  config: AudioControlConfig = {}
): Promise<boolean> {
  console.log('▶️ [AudioControl] Starting binaural audio...', config);

  // STEP 1: Validate audio engine
  if (!audioEngine || !audioEngine.startBinauralBeat) {
    console.error('❌ [AudioControl] Invalid audio engine - missing startBinauralBeat method');
    return false;
  }

  // STEP 2: Build config with defaults
  const amplitude = config.amplitude ?? config.volume ?? DEFAULT_VOLUME;
  const binauralConfig: BinauralBeatConfig = {
    base_frequency: config.base_frequency ?? DEFAULT_BASE_FREQUENCY,
    beat_frequency: config.beat_frequency ?? DEFAULT_BEAT_FREQUENCY,
    amplitude: amplitude,
    waveform: config.waveform ?? 'sine',
    // Include spatial config if provided
    ...(config.spatial && { spatial: config.spatial })
  };

  console.log('🎛️ [AudioControl] Final config:', binauralConfig);

  // STEP 3: Start audio
  try {
    await audioEngine.startBinauralBeat(binauralConfig);
    console.log('✅ [AudioControl] Audio started successfully');
    return true;
  } catch (error) {
    console.error('❌ [AudioControl] Failed to start audio:', error);
    return false;
  }
}

/**
 * STOP AUDIO FLOW
 * ================
 *
 * 1. Stop timer if active (optional)
 * 2. Validate audio engine exists
 * 3. Call engine's stopBinauralBeat() method
 * 4. Return success/failure result
 * 5. Caller handles state updates (isPlaying: false)
 *
 * @param audioEngine - The hybrid audio engine (frontend + backend)
 * @param timerControl - Optional timer control interface for stopping active timers
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function stopBinauralAudio(
  audioEngine: AudioEngineInterface,
  timerControl?: TimerControlInterface
): Promise<boolean> {
  console.log('🛑 [AudioControl] Stopping binaural audio...');

  // STEP 1: Stop timer if provided and active
  if (timerControl && timerControl.stopTimer) {
    console.log('⏰ [AudioControl] Stopping timer...');
    try {
      timerControl.stopTimer();
    } catch (error) {
      console.warn('⚠️ [AudioControl] Failed to stop timer (non-critical):', error);
      // Continue with audio stop even if timer fails
    }
  }

  // STEP 2: Validate audio engine
  if (!audioEngine || !audioEngine.stopBinauralBeat) {
    console.error('❌ [AudioControl] Invalid audio engine - missing stopBinauralBeat method');
    return false;
  }

  // STEP 3: Stop audio
  try {
    await audioEngine.stopBinauralBeat();
    console.log('✅ [AudioControl] Audio stopped successfully');
    return true;
  } catch (error) {
    console.error('❌ [AudioControl] Failed to stop audio:', error);
    return false;
  }
}

/**
 * COMPLETE FLOW DIAGRAM
 * ======================
 *
 * START FLOW:
 * -----------
 * Component/Hook
 *   ↓
 *   → startBinauralAudio(engine, config)
 *       ↓
 *       → Validate engine
 *       → Build BinauralBeatConfig
 *       → engine.startBinauralBeat(config)
 *       → Return success/failure
 *   ↓
 *   → Update state: { isPlaying: true }
 *   → Update UI
 *
 * STOP FLOW:
 * ----------
 * Component/Hook
 *   ↓
 *   → stopBinauralAudio(engine, timerControl)
 *       ↓
 *       → Stop timer (if provided)
 *       → Validate engine
 *       → engine.stopBinauralBeat()
 *       → Return success/failure
 *   ↓
 *   → Update state: { isPlaying: false }
 *   → Update UI
 *
 * ERROR HANDLING:
 * ---------------
 * - All errors are caught and logged
 * - Functions return boolean success/failure
 * - Caller decides how to handle failures
 * - Timer stop failures are non-critical
 */

/**
 * USAGE EXAMPLES
 * ==============
 *
 * Example 1: Basic Start/Stop
 * ----------------------------
 * ```typescript
 * import { startBinauralAudio, stopBinauralAudio } from './utils/audioControls';
 *
 * // Start audio
 * const success = await startBinauralAudio(hybridEngine, {
 *   base_frequency: 140,
 *   beat_frequency: 4,
 *   amplitude: 0.5
 * });
 * if (success) {
 *   setIsPlaying(true);
 * }
 *
 * // Stop audio
 * const stopped = await stopBinauralAudio(hybridEngine);
 * if (stopped) {
 *   setIsPlaying(false);
 * }
 * ```
 *
 * Example 2: With Timer Control
 * ------------------------------
 * ```typescript
 * // Stop audio and timer together
 * const stopped = await stopBinauralAudio(hybridEngine, {
 *   stopTimer: () => timerControlRef.current.stopTimer()
 * });
 * ```
 *
 * Example 3: With Spatial Audio
 * ------------------------------
 * ```typescript
 * const success = await startBinauralAudio(hybridEngine, {
 *   base_frequency: 140,
 *   beat_frequency: 4,
 *   amplitude: 0.5,
 *   spatial: {
 *     enabled: true,
 *     mode: '3d',
 *     positioning: 'headphones',
 *     roomSize: 'small'
 *   }
 * });
 * ```
 */