// Electromagnetic Beat Lab - Type Definitions
import type {BackendAudioEngineState, BinauralBeatConfig, FrontendAudioEngineState,SpatialAudioConfig,ActiveAudioStatus} from './audio.types';
export * from './audio.types'

export type PatternMode = 'AUTO' | 'MANUAL' | 'OFF' | 'CUSTOM' | 'SYNC' | 'FLOW';

export type WavePattern =
    | 'toroidal'
    | 'vortex'
    | 'spiral'
    | 'helix'
    | 'wave'
    | 'interference'
    | 'standing'
    | 'lissajous'
    | 'mobius'
    | 'rose'
    | 'trefoil'
    | 'lorenz'
    | 'spherical'
    | 'infinity'
    | 'star'
    | 'conical'
    | 'mandala'
    | 'custom';

export type FrequencyRange = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';

export type ElectromagneticFieldState = 'INACTIVE' | 'CHARGING' | 'ACTIVE' | 'RESONANT' | 'CRITICAL';

export type WaveForm = 'sine' | 'square' | 'triangle' | 'sawtooth';

export interface Position3D {
    x: number;
    y: number;
    z: number;
}


export interface FrequencyPoint {
    frequency: number;
    amplitude: number;
    phase: number;
    timestamp: number;
}

// BinauralBeatConfig is now in audio.types.ts - use that for all audio configs

export interface PatternConfig {
    id: string;
    name: string;
    type: WavePattern;
    description: string;
    instructions: string;
    benefits: string[];
    frequencies: {
        carrier: number;
        beat: number;
        range: FrequencyRange;
    };
    duration: number; // in minutes
    electromagnetic: {
        fieldStrength: number;
        resonanceFreq: number;
        coherence: number;
    };
    visualization: {
        color: string;
        intensity: number;
        pattern: string;
    };
    adhd?: {
        protocol: string;
        duration: number;
        intensity: number;
    };
}

// BackendAudioEngineState is now defined in audio.types.ts - import from there
// This removes the old leftFreq/rightFreq confusion

export interface WebSocketState {
    connected: boolean;
    connecting: boolean;
    error?: string | null;
}

export interface AudioEngine {
    audioState: BackendAudioEngineState;
    electromagnetic: ElectromagneticField;
    startBinauralBeat: (config: BinauralBeatConfig) => Promise<void>;
    stopBinauralBeat: () => void;
    updateFrequency: (left: number, right: number) => void;
    updateVolume: (volume: number) => void;
    updateWaveform: (waveForm: WaveForm) => void;
    loadPattern: (pattern: PatternConfig) => void;
    generateTestTones: (leftFreq: number, rightFreq: number, duration?: number) => void;
    frequencySweep: (startFreq: number, endFreq: number, duration: number) => void;
    createGammaProtocol: (protocol: ADHDProtocol) => void;
    isSupported: boolean;
    updateSpatialSettings?: (settings: SpatialAudioConfig) => void;
    backendConnected?: boolean;
    sessionId?: string | null;
    websocketState?: WebSocketState;
    // Backend-specific methods
    connectBackend?: () => Promise<void>;
    disconnectBackend?: () => Promise<void>;
    startBackendSession?: (config?: BinauralBeatConfig & {
        spatial_enabled?: boolean,
        spatial_settings?: Record<string, unknown>
    }) => Promise<void>;
    stopBackendSession?: () => Promise<void>;
    updateSettings?: (settings: Record<string, unknown>) => void;
}

export interface FrontendAudioEngine {
    audioState: FrontendAudioEngineState;
    electromagnetic: ElectromagneticField;
    startBinauralBeat: (config: BinauralBeatConfig) => Promise<void>;
    stopBinauralBeat: () => void;
    updateFrequency: (left: number, right: number) => void;
    updateVolume: (volume: number) => void;
    updateWaveform: (waveForm: WaveForm) => void;
    loadPattern: (pattern: PatternConfig) => void;
    generateTestTones: (leftFreq: number, rightFreq: number, duration?: number) => void;
    frequencySweep: (startFreq: number, endFreq: number, duration: number) => void;
    createGammaProtocol: (protocol: ADHDProtocol) => void;
    isSupported: boolean;
    initializeAudio: () => Promise<AudioContext | null>;
    setAudioState?: (updater: (prev: FrontendAudioEngineState) => FrontendAudioEngineState) => void;
    // Required properties for compatibility
    backendConnected: false;
    sessionId: null;
    websocketState: WebSocketState;
}

// Union type for either audio engine
export type AnyAudioEngine = AudioEngine | FrontendAudioEngine;

export interface Pattern8D {
    id: string;
    name: string;
    path: Position3D[];
    speed: number;
    direction: 'clockwise' | 'counterclockwise' | 'figure8' | 'spiral';
    intensity: number;
    color: string;
    electromagnetic: {
        frequency: number;
        wavelength: number;
        amplitude: number;
    };
}

export interface ElectromagneticField {
    strength: number;
    frequency: number;
    phase: number;
    coherence: number;
    resonance: number;
    state: ElectromagneticFieldState;
    stability: number;
}

export interface FrequencyAnalysis {
    current: number;
    target: number;
    variance: number;
    stability: number;
    harmonics: number[];
    resonancePoints: number[];
}

export interface SystemStatus {
    state: string;
    electromagnetic: ElectromagneticField;
    audio: {
        latency: number;
        sampleRate: number;
        bufferSize: number;
        quality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';
    };
    performance: {
        fps: number;
        cpuUsage: number;
        memoryUsage: number;
    };
}

export interface WaveGuideConfig {
    type: 'linear' | 'circular' | 'elliptical' | 'toroidal';
    dimensions: {
        width: number;
        height: number;
        depth: number;
    };
    material: 'copper' | 'silver' | 'gold' | 'plasma';
    resonance: number;
    impedance: number;
}

export interface YouTubeIntegration {
    videoId: string;
    timestamp: number;
    syncMode: 'audio' | 'visual' | 'both';
    pythonScript: string;
    enabled: boolean;
}

export interface ADHDProtocol {
    id: string;
    name: string;
    type: 'focus' | 'attention' | 'hyperactivity' | 'combined';
    gammaFreq: number;
    duration: number;
    intensity: number;
    schedule: {
        daily: boolean;
        times: string[];
        duration: number;
    };
    effectiveness: number;
    sideEffects: string[];
}

export interface ControlTabConfig {
    id: string;
    label: string;
    icon: string;
    component: React.ComponentType<Record<string, unknown>>;
    enabled: boolean;
}

export interface PatternPreset {
    id: string;
    name: string;
    category: 'meditation' | 'focus' | 'creativity' | 'healing' | 'adhd' | 'custom';
    pattern: PatternConfig;
    electromagnetic: ElectromagneticField;
    saved: boolean;
    rating: number;
}


export interface VisualizationSettings {
    starField: {
        density: number;
        speed: number;
        color: string;
        twinkle: boolean;
    };
    spatial: {
        gridSize: number;
        opacity: number;
        color: string;
        animation: boolean;
    };
    frequency: {
        bars: number;
        sensitivity: number;
        color: string;
        glow: boolean;
    };
}

// ============================================
// TIMER TYPES - Centralized from data/timer
// ============================================

/**
 * Timer session information
 */
export interface TimerSession {
    presetId?: string; // 🔥 FIXED: Should be preset ID string, not TimerPreset object
    startTime: number;
    currentPhase: number;
    isPaused: boolean;
    loopCount: number;
    session_id: string;
    preset?: TimerPreset;
    is_active?: boolean;
    current_transition_index?: number;
}

/**
 * Timer status for UI display and state management
 */
export interface TimerStatus {
    session?: TimerSession;
    current_transition?: FrequencyTransition;
    next_transition?: FrequencyTransition | null;
    time_remaining_current?: number;
    time_remaining_total?: number;
    isRunning: boolean;
    totalTime: number;
    progress: number;
    // WebSocket compatibility fields
    currentTime?: number;
    isPaused?: boolean;
    transitionIndex?: number;
    totalTransitions?: number;
    leftFreq?: number;
    rightFreq?: number;
    beat_frequency?: number;
    action?: string;
    preset?: string;
    firstTransition?: FrequencyTransition;
}

/**
 * Local timer state for useTimerLogic hook
 */
export interface LocalTimer {
    startTime: number;
    currentTransitionIndex: number;
    currentStepIndex?: number; // Legacy support
    transitions: FrequencyTransition[];
    isActive: boolean;
    isPaused: boolean;
    forceLoop?: boolean;
    session?: TimerSession;
    status?: TimerStatus;
}

/**
 * Timer control actions
 */
export type TimerAction = 'stop' | 'pause' | 'resume' | 'restart';

/**
 * Custom preset form data
 */
export interface CustomPresetForm {
    name: string;
    description: string;
    duration: number;
    tags: string[];
    transitions: FrequencyTransition[];
}

// ============================================
// APP STATE - Main Application State
// ============================================

export interface AppState {
     // Pattern & Mode
    mode: PatternMode;
    currentPattern?: PatternConfig | null;

    // 🔥 REMOVED: Audio state now lives in HybridAudioEngine.audioState
    // 🔥 REMOVED: Timer state now lives in useTimerLogic.timerState
    // Single source of truth for each domain!

    // Electromagnetic & Patterns
    electromagnetic: ElectromagneticField;
    patterns8D: Pattern8D[];

    // System & Visualization
    systemStatus: SystemStatus;
    visualizations: VisualizationSettings;
    spatialAudio: SpatialAudioConfig;

    // Integrations
    youtube: YouTubeIntegration;
    frequency: FrequencyAnalysis;
    adhd: ADHDProtocol | null;
    frequencyRange: FrequencyRange;
    waveGuide: WaveGuideConfig;
    // UI State
    activeTab: string;
    loading?: boolean;
    error?: string | null;
    hideSession?: boolean;

    // WebSocket
    websocketState?: WebSocketState;
    webSocket?: WebSocket | null;
    webSocketError?: string | null;
    isWebSocketConnected?: boolean;

    // Misc
    audioContextState?: AudioContextState;
    lastUpdate?: number;

    // Callbacks for visualization updates
    onElectromagneticUpdate?: (electromagnetic: ElectromagneticField) => void;
    // 🔥 REMOVED: onTimerStatusUpdate - timer state accessed directly from useTimerLogic

    // 8D Pattern control
    patterns8DControl?: {
        setActivePattern: (pattern: PatternConfig) => void;
        clearActivePattern: () => void;
    };
    starFieldControl?: {
        setDensity: (density: number) => void;
        setSpeed: (speed: number) => void;
        setColor: (color: string) => void;
        setTwinkle: (twinkle: boolean) => void;
    };
    spatialVisualizerControl?: {
        setGridSize: (gridSize: number) => void;
        setOpacity: (opacity: number) => void;
        setColor: (color: string) => void;
        setAnimation: (animation: boolean) => void;
    };
    frequencyDisplayControl?: {
        setFrequency: (frequency: number) => void;
        setRange: (range: FrequencyRange) => void;
    };
}

// Event types
export interface FrequencyChangeEvent {
    frequency: number;
    source: 'user' | 'pattern' | 'auto';
    timestamp: number;
}

export interface PatternChangeEvent {
    pattern: PatternConfig;
    previousPattern: PatternConfig | null;
    source: 'user' | 'auto';
    timestamp: number;
}

export interface ElectromagneticEvent {
    type: 'field_change' | 'resonance' | 'critical' | 'stabilized';
    field: ElectromagneticField;
    timestamp: number;
}

// Component Props
export interface ElectromagneticBeatLabProps {
    initialPattern?: PatternPreset;
    autoStart?: boolean;
    fullscreen?: boolean;

}

export interface StarFieldProps {
    density?: number;
    speed?: number;
    color?: string;
    twinkle?: boolean;
}

export interface SpatialVisualizerProps {
    pattern: Pattern8D;
    electromagnetic: ElectromagneticField;
    size?: number;
}

export interface FrequencyDisplayProps {
    frequency: number;
    beat_frequency: number;
    target: number;
    range: FrequencyRange;
    onChange: (freq: number) => void;
}

export interface PatternSelectorProps {
    patterns: PatternConfig[];
    selected: string | null;
    mode: PatternMode;
    onSelect: (id: string) => void;
    onModeChange: (mode: PatternMode) => void;
}

export interface ElectromagneticStatusProps {
    field: ElectromagneticField;
    status: SystemStatus;
}

export interface WaveGuidePanelProps {
    config: WaveGuideConfig;
    onChange: (config: WaveGuideConfig) => void;
}




export interface QuickStartProps {
    activeStatus: ActiveAudioStatus;
    frequencies?: {
        left: number;
        right: number;
        beat: number;
    };
    volume: number;
    audioEngine?: {
        backendConnected: boolean;
        connectBackend?: () => Promise<void>;
        disconnectBackend?: () => Promise<void>;
        sessionId?: string | null;
    };
    onToggleEngine?: (engineType: 'binaural' | 'backend' | 'spatial', enabled: boolean) => void;
    appState?: {
        spatialAudio?: {
            enabled: boolean;
        };
    };
}

export interface MainControlsProps {
    isPlaying: boolean;
    volume: number;
    onPlay: () => void;
    onStop: () => void;
    onVolumeChange: (volume: number) => void;
    audioEngine?: () => AudioEngine;
}

// Timer-related types
export interface TimerPreset {
    id: string;
    name: string;
    description: string;
    total_duration: number; // in minutes
    transitions_count: number;
    tags: string[];
    is_premium?: boolean;
    available?: boolean;
    loop_enabled?: boolean;
    loop_count?: number; // 0 for infinite
    loop_phase?: string;
    loop_transitions?: number[];
    pattern_id?: string;
    difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    transitions?: FrequencyTransition[]; // 🔥 FIXED: Array of transitions, not single transition
    spatial_config?: SpatialAudioConfig;
    status?: TimerStatus;
}

export interface FrequencyTransition {
    duration_minutes: number;
    frequency_hz: number;
    frequency_type: string;
    left_ear_hz: number;
    right_ear_hz: number;
    description: string;
    pattern?: string;
    spatial_settings?: SpatialAudioConfig; // 🔥 FIXED: Should be SpatialAudioConfig, not ActiveAudioStatus
}


export interface ControlTabsProps {

    activeTab: string,
    onTabChange: (tabId: string) => void,
    tabs?: ({
    })[]
}

export interface BinauralTestProps {
    leftFreq: number;
    rightFreq: number;
    onFrequencyChange: (left: number, right: number) => void;
}

// LocalAudio - The Father Type
export * from './audio.types';

// ============================================
// EQUALIZER TYPES - Audio EQ System
// ============================================

/**
 * Equalizer band configuration
 */
export interface EqualizerBand {
  id: string;
  frequency: number; // Center frequency in Hz
  gain: number; // Gain in dB (-40 to +40)
  Q: number; // Quality factor (0.1 to 10)
  type: BiquadFilterType;
  label: string;
}

/**
 * Equalizer state for UI and audio processing
 */
export interface EqualizerState {
  enabled: boolean;
  bands: EqualizerBand[];
  preset: string;
}