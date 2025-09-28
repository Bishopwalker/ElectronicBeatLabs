// ============================================
// MASTER AUDIO TYPES - SINGLE SOURCE OF TRUTH
// ============================================

/**
 * MASTER AUDIO CONFIGURATION
 * This is the ONLY BinauralBeatConfig in the entire app
 * All components must use this or convert to it
 */
export interface BinauralBeatConfig {
    // Core frequencies
    baseFrequency: number;      // Left ear (Hz) - the carrier frequency
    beatFrequency: number;      // Beat frequency (Hz) - the difference

    // Audio properties
    amplitude: number;          // Volume 0-1 (NOT "volume", always "amplitude")
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
    amplitude: number;
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
export interface AudioEngineState {
    isPlaying: boolean;
    config: BinauralBeatConfig | null;
    sessionId: string | null;
    webSocket?: boolean;
    connected: boolean;
    error: string | null;
}

/**
 * FRONTEND AUDIO ENGINE STATE (Web Audio API)
 * Used by the frontend fallback engine only
 */
export interface FrontendAudioEngineState {
    isPlaying: boolean;
    amplitude: number;
    leftFreq: number;
    rightFreq: number;
    beatFreq: number;
    waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
    gainL: GainNode | null;
    gainR: GainNode | null;
    oscillatorL: OscillatorNode | null;
    oscillatorR: OscillatorNode | null;
    context: AudioContext | null;
}

// ============================================
// CONVERSION FUNCTIONS - USE THESE EVERYWHERE
// ============================================


/**
 * Convert timer config to standard binaural config
 */
/**
 * FREQUENCY CALCULATION FUNCTIONS FOR UI DISPLAY ONLY
 * Internal audio processing uses baseFrequency + beatFrequency
 * These are ONLY for UI display purposes
 */
export const calculateLeftFreq = (baseFrequency: number): number => baseFrequency;
export const calculateRightFreq = (baseFrequency: number, beatFrequency: number): number => baseFrequency + beatFrequency;

/**
 * Convert timer config to standard binaural config
 * Using unknown is safer than any
 */
export const fromTimerConfig = (timer: unknown): BinauralBeatConfig => {
    // Type guard to ensure it's an object
    const t = timer as Record<string, number>;

    return {
        baseFrequency: t?.leftFreq || t?.baseFreq || 440,
        beatFrequency: t?.beatFreq ||
            (t?.rightFreq && t?.leftFreq
                ? t.rightFreq - t.leftFreq
                : 15),
        amplitude: t?.amplitude || t?.volume || 0.7,
        waveform: t?.waveform || 'sine',
        spatial: t?.spatial || undefined
    };
};
/**
 * Calculate right frequency from base and beat
 */
export const calculateRightFrequency = (baseFreq: number, beatFreq: number): number => {
    return baseFreq + beatFreq;
};

/**
 * Calculate beat frequency from left and right
 */
export const calculateBeatFrequency = (leftFreq: number, rightFreq: number): number => {
    return Math.abs(rightFreq - leftFreq);
};