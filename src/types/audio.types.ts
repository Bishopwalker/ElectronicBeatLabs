// Electromagnetic Beat Lab - Master Audio Types

/**
 * MASTER AUDIO CONFIGURATION
 * This is the ONLY BinauralBeatConfig in the entire app
 * All components must use this or convert to it
 */
export interface BinauralBeatConfig {
    // Core frequencies
    base_frequency: number;      // Carrier/base frequency (Hz) - the base tone
    beat_frequency: number;      // Beat frequency (Hz) - the difference creating binaural effect

    // Audio properties
    volume: number;             // Volume 0-2 (0-100% normal, 100-200% boost mode)
    waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';

    // Optional spatial audio
    spatial?: {
        enabled: boolean;
        mode: 'binaural' | 'stereo' | '3d';
        positioning: 'headphones' | 'speakers';
        roomSize: 'small' | 'medium' | 'large';
    };

    // Optional metadata
    presetName?: string;
    duration?: number;  // in seconds
    rampTime?: number;  // fade in/out time
}

/**
 * BACKEND API FORMAT - Snake case for Python backend
 */
export interface BackendAudioConfig {
    base_frequency: number;
    beat_frequency: number;
    volume: number;  // Changed from amplitude to match backend API
    waveform: string;
    spatial_enabled?: boolean;
    spatial_settings?: {
        mode: string;
        positioning: string;
        room_size: string;
    };
}

/**
 * WEBSOCKET MESSAGE TYPES
 */
export interface WebSocketAudioMessage {
    type: 'start_session' | 'update_settings' | 'stop_session' | 'session_started' | 'session_stopped';
    sessionId?: string;
    config?: BackendAudioConfig;
}

/**
 * AUDIO ENGINE STATE
 */
export interface  BackendAudioEngineState {
    isPlaying: boolean;
    config: BinauralBeatConfig | null;
    sessionId: string | null;
    webSocket?: boolean;
    connected: boolean;
    error: string | null;
    // Computed properties for UI compatibility (calculated from config.base_frequency and config.beat_frequency)
    leftFreq?: number;  // Left ear = base_frequency
    rightFreq?: number; // Right ear = base_frequency + beat_frequency
    beat_frequency?: number; // Beat frequency from config
    gainL: GainNode | null;
    gainR: GainNode | null;
    oscillatorL: OscillatorNode | null;
    oscillatorR: OscillatorNode | null;
    context: AudioContext | null;
}

/**
 * FRONTEND AUDIO ENGINE STATE (Web Audio API)
 * Used by the frontend fallback engine only
 */
export interface FrontendAudioEngineState {
    isPlaying: boolean;
    volume: number;  // Changed from amplitude
    leftFreq: number;
    rightFreq: number;
    beat_frequency: number;
    waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
    gainL: GainNode | null;
    gainR: GainNode | null;
    oscillatorL: OscillatorNode | null;
    oscillatorR: OscillatorNode | null;
    context: AudioContext | null;
}
export interface ActiveAudioStatus {
    binauralEngine: boolean;
    backendEngine: boolean;
    spatialAudio: boolean;
    patterns: boolean;
    testTones: boolean;
}

export interface SpatialAudioConfig {
    enabled: boolean;
    hrtf: boolean;
    roomSize: number;
    reverbAmount: number;
    spatialWidth: number;
    elevation: number;
    azimuth: number;
    movement_speed?: number;
    spatial_intensity?: number;
    reverb_enabled?: boolean;
    reverberance?: number;
    room_scale?: number;
    hf_damping?: number;
}

// ============================================
// CONVERSION FUNCTIONS - USE THESE EVERYWHERE
// ============================================


/**
 * FREQUENCY CALCULATION FUNCTIONS FOR UI DISPLAY ONLY
 * Binaural beats formula: Right = Left + Beat
 * - Left ear: base_frequency (carrier)
 * - Right ear: base_frequency + beat_frequency
 * - Beat: difference perceived by brain
 */
//export const calculateLeftFreq = (base_frequency: number): number => base_frequency;
//export const calculateRightFreq = (base_frequency: number, beat_frequency: number): number => base_frequency + beat_frequency;


/**
 * Calculate beat frequency from left and right
 */
//export const calculateBeatFrequency = (leftFreq: number, rightFreq: number): number => {
//    return Math.abs(leftFreq - rightFreq);
//};