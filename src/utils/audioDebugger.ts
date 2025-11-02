/**
 * Audio Debugging Utilities
 * Comprehensive logging and state inspection for audio playback
 *
 * Usage in IntelliJ:
 * 1. Set breakpoints in traced functions
 * 2. Use window.__audioDebugger in console to inspect state
 * 3. Call window.__audioDebugger.exportDebugData() to download logs
 */

export interface AudioDebugState {
  timestamp: number;
  context: {
    state: AudioContextState;
    sampleRate: number;
    currentTime: number;
    baseLatency?: number;
  } | null;
  oscillators: {
    left: {
      frequency: number;
      type: OscillatorType | 'none';
      playing: boolean;
    };
    right: {
      frequency: number;
      type: OscillatorType | 'none';
      playing: boolean;
    };
  };
  gains: {
    left: number;
    right: number;
    master?: number;
  };
  mixer?: {
    frontendGain: number;
    backendGain: number;
    masterVolume: number;
    currentEngine: string;
  };
  analyser?: {
    fftSize: number;
    smoothingTimeConstant: number;
    frequencyBinCount: number;
    minDecibels: number;
    maxDecibels: number;
  };
}

/**
 * Audio Debugger Class
 * Singleton for tracking audio state and logging
 */
class AudioDebugger {
  private static instance: AudioDebugger;
  private enabled: boolean = true;
  private logHistory: string[] = [];
  private stateHistory: AudioDebugState[] = [];
  private maxHistorySize: number = 100;

  private constructor() {
  }

  static getInstance(): AudioDebugger {
    if (!AudioDebugger.instance) {
      AudioDebugger.instance = new AudioDebugger();
    }
    return AudioDebugger.instance;
  }

  /**
   * Enable/disable debug logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Log with timestamp and category
   */
  log(category: string, message: string, data?: any): void {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${category}] ${message}`;

    if (data !== undefined) {
    } else {
    }

    this.logHistory.push(logEntry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  /**
   * Capture complete audio state snapshot
   */
  captureState(
    audioContext: AudioContext | null,
    oscillatorL: OscillatorNode | null,
    oscillatorR: OscillatorNode | null,
    gainL: GainNode | null,
    gainR: GainNode | null,
    analyser: AnalyserNode | null,
    mixer?: any
  ): AudioDebugState {
    const state: AudioDebugState = {
      timestamp: Date.now(),
      context: audioContext ? {
        state: audioContext.state,
        sampleRate: audioContext.sampleRate,
        currentTime: audioContext.currentTime,
        baseLatency: audioContext.baseLatency
      } : null,
      oscillators: {
        left: {
          frequency: oscillatorL?.frequency.value ?? 0,
          type: oscillatorL?.type ?? 'none',
          playing: !!oscillatorL
        },
        right: {
          frequency: oscillatorR?.frequency.value ?? 0,
          type: oscillatorR?.type ?? 'none',
          playing: !!oscillatorR
        }
      },
      gains: {
        left: gainL?.gain.value ?? 0,
        right: gainR?.gain.value ?? 0,
        master: mixer?.masterVolume
      }
    };

    if (mixer) {
      state.mixer = {
        frontendGain: mixer.frontendGain?.gain.value ?? 0,
        backendGain: mixer.backendGain?.gain.value ?? 0,
        masterVolume: mixer.masterVolume ?? 0,
        currentEngine: mixer.currentEngine ?? 'unknown'
      };
    }

    if (analyser) {
      state.analyser = {
        fftSize: analyser.fftSize,
        smoothingTimeConstant: analyser.smoothingTimeConstant,
        frequencyBinCount: analyser.frequencyBinCount,
        minDecibels: analyser.minDecibels,
        maxDecibels: analyser.maxDecibels
      };
    }

    this.stateHistory.push(state);
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }

    this.log('STATE', 'Captured audio state snapshot', state);
    return state;
  }

  /**
   * Log audio graph connections
   */
  logAudioGraph(nodes: { name: string; node: AudioNode | null }[]): void {
    this.log('GRAPH', '=== Audio Graph ===');
    nodes.forEach(({ name, node }) => {
      if (node) {
      } else {
      }
    });
  }

  /**
   * Analyze frequency data from analyser
   */
  analyzeFrequencyData(analyser: AnalyserNode): {
    peak: number;
    average: number;
    frequencies: Float32Array;
  } | null {
    if (!analyser) return null;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    analyser.getFloatFrequencyData(dataArray);

    let sum = 0;
    let peak = -Infinity;

    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i];
      sum += value;
      if (value > peak) peak = value;
    }

    const average = sum / bufferLength;

    this.log('ANALYSIS', `Frequency Analysis - Peak: ${peak.toFixed(2)}dB, Avg: ${average.toFixed(2)}dB`);

    return {
      peak,
      average,
      frequencies: dataArray
    };
  }

  /**
   * Get recent log history
   */
  getLogHistory(count: number = 20): string[] {
    return this.logHistory.slice(-count);
  }

  /**
   * Get state history
   */
  getStateHistory(count: number = 10): AudioDebugState[] {
    return this.stateHistory.slice(-count);
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    this.logHistory = [];
    this.stateHistory = [];
    this.log('SYSTEM', 'History cleared');
  }

  /**
   * Export debug data as JSON
   */
  exportDebugData(): string {
    const data = JSON.stringify({
      logs: this.logHistory,
      states: this.stateHistory,
      exportedAt: new Date().toISOString()
    }, null, 2);

    // Auto-download in browser
    if (typeof window !== 'undefined') {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audio-debug-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    return data;
  }

  /**
   * Trace a function call with timing
   */
  trace<T>(category: string, functionName: string, fn: () => T): T {
    if (!this.enabled) return fn();

    const startTime = performance.now();
    this.log(category, `▶️ ${functionName} START`);

    try {
      const result = fn();
      const duration = performance.now() - startTime;
      this.log(category, `✅ ${functionName} COMPLETE (${duration.toFixed(2)}ms)`);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.log(category, `❌ ${functionName} FAILED (${duration.toFixed(2)}ms)`, error);
      throw error;
    }
  }

  /**
   * Trace an async function call with timing
   */
  async traceAsync<T>(category: string, functionName: string, fn: () => Promise<T>): Promise<T> {
    if (!this.enabled) return fn();

    const startTime = performance.now();
    this.log(category, `▶️ ${functionName} START (async)`);

    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.log(category, `✅ ${functionName} COMPLETE (${duration.toFixed(2)}ms)`);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.log(category, `❌ ${functionName} FAILED (${duration.toFixed(2)}ms)`, error);
      throw error;
    }
  }

  /**
   * Create a conditional breakpoint (useful for IntelliJ debugging)
   */
  breakpoint(condition: boolean, message: string, data?: any): void {
    if (condition) {
      // Uncomment next line to trigger actual debugger breakpoint
      // debugger;
    }
  }

  /**
   * Mark a decision point (useful for debugging control flow)
   */
  decision(description: string, condition: boolean, path: string): void {
    this.log('DECISION', `${description} → ${path}`, { condition });
  }
}

// Export singleton instance
export const audioDebugger = AudioDebugger.getInstance();

// Export convenience functions
export const debugLog = (category: string, message: string, data?: any) =>
  audioDebugger.log(category, message, data);

export const debugTrace = <T>(category: string, functionName: string, fn: () => T) =>
  audioDebugger.trace(category, functionName, fn);

export const debugTraceAsync = <T>(category: string, functionName: string, fn: () => Promise<T>) =>
  audioDebugger.traceAsync(category, functionName, fn);

export const debugCapture = (
  audioContext: AudioContext | null,
  oscillatorL: OscillatorNode | null,
  oscillatorR: OscillatorNode | null,
  gainL: GainNode | null,
  gainR: GainNode | null,
  analyser: AnalyserNode | null,
  mixer?: any
) => audioDebugger.captureState(audioContext, oscillatorL, oscillatorR, gainL, gainR, analyser, mixer);

export const debugBreakpoint = (condition: boolean, message: string, data?: any) =>
  audioDebugger.breakpoint(condition, message, data);

export const debugDecision = (description: string, condition: boolean, path: string) =>
  audioDebugger.decision(description, condition, path);

// Make debugger globally available in development
if (typeof window !== 'undefined') {
  (window as any).__audioDebugger = audioDebugger;
}