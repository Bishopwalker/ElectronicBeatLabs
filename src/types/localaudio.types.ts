// ============================================
// LOCALAUDIO - THE FATHER TYPE
// One type to rule them all for audio
// ============================================

import type {
    AudioConfig,
    SpatialConfig,
    Pattern,
    ElectromagneticField,
    VisualizationData,
    SystemStatus
} from './clean.types';

/**
 * LOCALAUDIO - The Master Audio State Container
 * This is the ONLY type you need to pass around
 * Everything audio-related lives here
 */
export interface LocalAudio {
    // ==========================================
    // IDENTIFICATION
    // ==========================================
    id: string;                          // Unique instance ID
    type: 'frontend' | 'backend' | 'hybrid'; // Which engine is active
    name: string;                        // User-friendly name

    // ==========================================
    // CORE CONFIGURATION
    // ==========================================
    config: AudioConfig;                 // Current audio configuration
    spatial: SpatialConfig;              // Spatial audio settings

    // ==========================================
    // ENGINE STATE
    // ==========================================
    engine: {
        // Frontend Engine (Web Audio API)
        frontend: {
            isAvailable: boolean;
            isActive: boolean;
            context: AudioContext | null;
            oscillatorL: OscillatorNode | null;
            oscillatorR: OscillatorNode | null;
            gainL: GainNode | null;
            gainR: GainNode | null;
            workletNode: AudioWorkletNode | null;
        };

        // Backend Engine (WebSocket + Python)
        backend: {
            isAvailable: boolean;
            isActive: boolean;
            isConnected: boolean;
            sessionId: string | null;
            websocketState: 'disconnected' | 'connecting' | 'connected' | 'error';
            lastError: string | null;
        };

        // Hybrid Mode Settings
        hybrid: {
            enabled: boolean;
            primary: 'frontend' | 'backend';
            fallback: 'frontend' | 'backend' | null;
            autoSwitch: boolean;
        };
    };

    // ==========================================
    // PLAYBACK STATE
    // ==========================================
    playback: {
        state: 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'error';
        isPlaying: boolean;
        isPaused: boolean;
        startTime: number | null;           // When playback started
        pauseTime: number | null;           // When paused
        totalPlayTime: number;              // Total time played (seconds)

        // Buffer management
        buffer: {
            size: number;                    // Buffer size in samples
            health: 'good' | 'low' | 'critical';
            underruns: number;                // Count of buffer underruns
            latency: number;                  // Current latency in ms
        };
    };

    // ==========================================
    // PATTERN & TIMER INTEGRATION
    // ==========================================
    pattern: {
        current: Pattern | null;            // Currently loaded pattern
        queue: Pattern[];                   // Pattern queue
        history: Pattern[];                 // Previously played patterns
        isLooping: boolean;                 // Is pattern looping?
        loopCount: number;                  // Number of loops completed
    };

    timer: {
        isActive: boolean;
        duration: number;                   // Total duration in seconds
        elapsed: number;                    // Elapsed time in seconds
        remaining: number;                  // Remaining time in seconds
        transitions: any[];                 // Timer transitions (if using timer)
        currentTransitionIndex: number;
    };

    // ==========================================
    // VISUALIZATION & EFFECTS
    // ==========================================
    visualization: {
        enabled: boolean;
        data: VisualizationData | null;
        electromagnetic: ElectromagneticField;
        updateRate: number;                 // Updates per second

        // 3D visualization
        three: {
            enabled: boolean;
            camera: { x: number; y: number; z: number };
            rotation: { x: number; y: number; z: number };
            zoom: number;
        };
    };

    // ==========================================
    // METRICS & MONITORING
    // ==========================================
    metrics: {
        frequencyAccuracy: number;          // Frequency accuracy percentage
        signalQuality: number;              // Signal quality 0-1
        thd: number;                        // Total harmonic distortion
        snr: number;                        // Signal-to-noise ratio

        // Performance
        performance: {
            cpu: number;                      // CPU usage percentage
            memory: number;                   // Memory usage MB
            fps: number;                      // Frames per second
            audioLatency: number;             // Audio latency ms
        };

        // Session stats
        session: {
            totalSessions: number;
            totalPlayTime: number;            // Total play time in seconds
            averageSessionLength: number;     // Average session length
            lastSessionDate: Date | null;
        };
    };

    // ==========================================
    // USER PREFERENCES
    // ==========================================
    preferences: {
        defaultEngine: 'frontend' | 'backend' | 'auto';
        autoStart: boolean;
        notifications: boolean;
        saveHistory: boolean;

        // Audio preferences
        audio: {
            defaultVolume: number;
            defaultWaveform: AudioConfig['waveform'];
            enableSpatial: boolean;
            qualityPreset: 'low' | 'medium' | 'high' | 'ultra';
        };

        // UI preferences
        ui: {
            showVisualization: boolean;
            showMetrics: boolean;
            showAdvancedControls: boolean;
            theme: 'dark' | 'light' | 'auto';
        };
    };

    // ==========================================
    // ERROR HANDLING
    // ==========================================
    errors: {
        current: Error | null;
        history: Array<{
            timestamp: number;
            error: Error;
            context: string;
        }>;
        retryCount: number;
        maxRetries: number;
    };

    // ==========================================
    // METHODS (Type signatures only)
    // ==========================================
    actions: {
        // Core controls
        start: (config?: Partial<AudioConfig>) => Promise<void>;
        stop: () => void;
        pause: () => void;
        resume: () => void;
        restart: () => void;

        // Updates
        updateFrequency: (base: number, beat: number) => void;
        updateVolume: (volume: number) => void;
        updateWaveform: (waveform: AudioConfig['waveform']) => void;
        updateSpatial: (spatial: Partial<SpatialConfig>) => void;

        // Pattern management
        loadPattern: (pattern: Pattern) => void;
        queuePattern: (pattern: Pattern) => void;
        clearQueue: () => void;

        // Engine management
        switchEngine: (engine: 'frontend' | 'backend') => Promise<void>;
        connectBackend: () => Promise<void>;
        disconnectBackend: () => void;

        // Utility
        reset: () => void;
        exportState: () => string;
        importState: (state: string) => void;
    };

    // ==========================================
    // TIMESTAMPS
    // ==========================================
    timestamps: {
        created: number;
        lastModified: number;
        lastPlayed: number | null;
        lastStopped: number | null;
    };
}

// ============================================
// MAPPING GUIDE - How Everything Connects
// ============================================

/**
 * MAPPING: LocalAudio -> Frontend Hook (useAudioEngine)
 */
export interface UseAudioEngineProps {
    localAudio: LocalAudio;
    onUpdate: (audio: LocalAudio) => void;
    skipInitialization?: boolean;
}

/**
 * MAPPING: LocalAudio -> Backend Hook (useBackendAudioEngine)
 */
export interface UseBackendAudioEngineProps {
    localAudio: LocalAudio;
    onUpdate: (audio: LocalAudio) => void;
    autoConnect?: boolean;
}

/**
 * MAPPING: LocalAudio -> Timer Integration
 */
export interface AudioTimerIntegrationProps {
    localAudio: LocalAudio;
    localTimer: any; // Your LocalTimer type
    onFrequencyTransition: (transition: any) => void;
}

/**
 * MAPPING: LocalAudio -> Visualization
 */
export interface AudioVisualizationProps {
    localAudio: LocalAudio;
    type: 'spectrum' | 'waveform' | 'spatial' | 'electromagnetic';
    size?: { width: number; height: number };
}

/**
 * MAPPING: LocalAudio -> Controls
 */
export interface AudioControlsProps {
    localAudio: LocalAudio;
    onAction: (action: keyof LocalAudio['actions']) => void;
    showAdvanced?: boolean;
    disabled?: boolean;
}

// ============================================
// FACTORY FUNCTIONS - Create LocalAudio
// ============================================

/**
 * Create a new LocalAudio instance with defaults
 */
export function createLocalAudio(config?: Partial<AudioConfig>): LocalAudio {
    const now = Date.now();

    return {
        // Identification
        id: `audio-${now}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'frontend',
        name: 'Default Audio Session',

        // Core configuration
        config: {
            baseFrequency: config?.baseFrequency || 144,
            beat_frequency: config?.beat_frequency || 4,
            amplitude: config?.amplitude || 0.7,
            waveform: config?.waveform || 'sine'
        },

        spatial: {
            enabled: false,
            mode: 'binaural',
            positioning: 'headphones',
            roomSize: 'medium'
        },

        // Engine state
        engine: {
            frontend: {
                isAvailable: true,
                isActive: false,
                context: null,
                oscillatorL: null,
                oscillatorR: null,
                gainL: null,
                gainR: null,
                workletNode: null
            },
            backend: {
                isAvailable: false,
                isActive: false,
                isConnected: false,
                sessionId: null,
                websocketState: 'disconnected',
                lastError: null
            },
            hybrid: {
                enabled: false,
                primary: 'frontend',
                fallback: 'backend',
                autoSwitch: false
            }
        },

        // Playback state
        playback: {
            state: 'idle',
            isPlaying: false,
            isPaused: false,
            startTime: null,
            pauseTime: null,
            totalPlayTime: 0,
            buffer: {
                size: 4096,
                health: 'good',
                underruns: 0,
                latency: 0
            }
        },

        // Pattern & timer
        pattern: {
            current: null,
            queue: [],
            history: [],
            isLooping: false,
            loopCount: 0
        },

        timer: {
            isActive: false,
            duration: 0,
            elapsed: 0,
            remaining: 0,
            transitions: [],
            currentTransitionIndex: 0
        },

        // Visualization
        visualization: {
            enabled: true,
            data: null,
            electromagnetic: {
                strength: 0,
                frequency: 0,
                state: 'INACTIVE',
                stability: 0
            },
            updateRate: 60,
            three: {
                enabled: false,
                camera: { x: 0, y: 0, z: 5 },
                rotation: { x: 0, y: 0, z: 0 },
                zoom: 1
            }
        },

        // Metrics
        metrics: {
            frequencyAccuracy: 100,
            signalQuality: 1,
            thd: 0,
            snr: 90,
            performance: {
                cpu: 0,
                memory: 0,
                fps: 60,
                audioLatency: 0
            },
            session: {
                totalSessions: 0,
                totalPlayTime: 0,
                averageSessionLength: 0,
                lastSessionDate: null
            }
        },

        // Preferences
        preferences: {
            defaultEngine: 'frontend',
            autoStart: false,
            notifications: true,
            saveHistory: true,
            audio: {
                defaultVolume: 0.7,
                defaultWaveform: 'sine',
                enableSpatial: false,
                qualityPreset: 'high'
            },
            ui: {
                showVisualization: true,
                showMetrics: false,
                showAdvancedControls: false,
                theme: 'dark'
            }
        },

        // Errors
        errors: {
            current: null,
            history: [],
            retryCount: 0,
            maxRetries: 3
        },

        // Actions (will be populated by hooks)
        actions: {} as LocalAudio['actions'],

        // Timestamps
        timestamps: {
            created: now,
            lastModified: now,
            lastPlayed: null,
            lastStopped: null
        }
    };
}

// ============================================
// TYPE GUARDS - Check LocalAudio state
// ============================================

export const isAudioPlaying = (audio: LocalAudio): boolean => {
    return audio.playback.isPlaying && audio.playback.state === 'playing';
};

export const isBackendConnected = (audio: LocalAudio): boolean => {
    return audio.engine.backend.isConnected && audio.engine.backend.websocketState === 'connected';
};

export const isFrontendActive = (audio: LocalAudio): boolean => {
    return audio.engine.frontend.isActive && audio.type === 'frontend';
};

export const hasPattern = (audio: LocalAudio): boolean => {
    return audio.pattern.current !== null;
};

export const hasErrors = (audio: LocalAudio): boolean => {
    return audio.errors.current !== null || audio.errors.history.length > 0;
};

// ============================================
// MIGRATION GUIDE
// ============================================

/**
 * HOW TO USE LocalAudio:
 *
 * 1. In your main component:
 * ```typescript
 * const [localAudio, setLocalAudio] = useState(createLocalAudio());
 * ```
 *
 * 2. Pass to hooks:
 * ```typescript
 * const audioEngine = useAudioEngine({
 *   localAudio,
 *   onUpdate: setLocalAudio
 * });
 * ```
 *
 * 3. Pass to components:
 * ```typescript
 * <AudioControls localAudio={localAudio} />
 * <AudioVisualizer localAudio={localAudio} />
 * <TimerTab localAudio={localAudio} />
 * ```
 *
 * 4. Update state:
 * ```typescript
 * setLocalAudio(prev => ({
 *   ...prev,
 *   config: { ...prev.config, amplitude: 0.8 }
 * }));
 * ```
 */

// Default export the main type
export default LocalAudio;