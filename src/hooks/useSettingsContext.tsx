/**
 * Settings Context - Centralized settings management for EBL
 * Provides app-wide access to user preferences and configuration
 *
 * Usage:
 * ```tsx
 * const { settings, updateSettings } = useSettingsContext();
 *
 * // Update a setting
 * updateSettings({ darkMode: true });
 *
 * // Access settings
 * console.log(settings.audioDefaults.sampleRate);
 * ```
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Settings interface - add your settings here
export interface AppSettings {
  // Audio Settings
  audioDefaults: {
    sampleRate: 44100 | 48000;
    baseFrequency: number;
    beatFrequency: number;
    volume: number;
    waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
  };

  // Spatial Audio Settings
  spatialAudio: {
    enabled: boolean;
    pattern: 'circular' | 'figure8' | 'spiral' | 'random';
    speed: number;
    depth: number;
  };

  // UI/UX Settings
  ui: {
    darkMode: boolean;
    showAdvancedControls: boolean;
    visualizationMode: 'toroidal' | 'vortex' | 'spiral' | 'default';
    closedSections: string[];
    compactMode: boolean;
  };

  // Timer Settings
  timer: {
    defaultPresetId: string | null;
    autoStartOnSelect: boolean;
    loopByDefault: boolean;
    showNotifications: boolean;
  };

  // Equalizer Settings
  equalizer: {
    enabled: boolean;
    preset: string | null;
    customBands: Array<{ frequency: number; gain: number; q: number }>;
  };

  // Backend Connection Settings
  backend: {
    autoConnect: boolean;
    reconnectOnDrop: boolean;
    preferredEngine: 'hybrid' | 'frontend' | 'backend';
  };

  // Tutorial/Onboarding Settings
  tutorial: {
    hasSeenTutorial: boolean;
    dontShowAgain: boolean;
    completedSections: string[];
  };
}

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  audioDefaults: {
    sampleRate: 48000,
    baseFrequency: 140,
    beatFrequency: 4,
    volume: 0.5,
    waveform: 'sine'
  },
  spatialAudio: {
    enabled: false,
    pattern: 'circular',
    speed: 1.0,
    depth: 0.5
  },
  ui: {
    darkMode: false,
    showAdvancedControls: false,
    visualizationMode: 'toroidal',
    closedSections: [],
    compactMode: false
  },
  timer: {
    defaultPresetId: null,
    autoStartOnSelect: false,
    loopByDefault: false,
    showNotifications: true
  },
  equalizer: {
    enabled: false,
    preset: null,
    customBands: []
  },
  backend: {
    autoConnect: true,
    reconnectOnDrop: true,
    preferredEngine: 'hybrid'
  },
  tutorial: {
    hasSeenTutorial: false,
    dontShowAgain: false,
    completedSections: []
  }
};

// Context interface
interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
  isLoading: boolean;
}

// Create context
const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

// LocalStorage key
const SETTINGS_STORAGE_KEY = 'ebl-settings-v1';

/**
 * Settings Provider Component
 */
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Deep merge with defaults to handle new settings added in updates
        const merged = deepMerge(DEFAULT_SETTINGS, parsed);

        setSettings(merged);
      } else {
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
      }
    }
  }, [settings, isLoading]);

  /**
   * Update settings (partial update with deep merge)
   */
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = deepMerge(prev, updates);
      return updated;
    });
  }, []);

  /**
   * Reset settings to defaults
   */
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  }, []);

  const value: SettingsContextValue = {
    settings,
    updateSettings,
    resetSettings,
    isLoading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

/**
 * Hook to access settings context
 *
 * @throws Error if used outside SettingsProvider
 */
export const useSettingsContext = (): SettingsContextValue => {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettingsContext must be used within SettingsProvider');
  }

  return context;
};

/**
 * Deep merge utility for nested objects
 * Preserves nested structure and only updates provided values
 */
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      // If both are objects (and not arrays), recursively merge
      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        // Otherwise, directly assign the source value
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * Hook for specific setting sections (convenience)
 *
 * Example:
 * ```tsx
 * const [audioSettings, updateAudio] = useSettingsSection('audioDefaults');
 * updateAudio({ volume: 0.8 });
 * ```
 */
export function useSettingsSection<K extends keyof AppSettings>(
  section: K
): [AppSettings[K], (updates: Partial<AppSettings[K]>) => void] {
  const { settings, updateSettings } = useSettingsContext();

  const updateSection = useCallback(
    (updates: Partial<AppSettings[K]>) => {
      updateSettings({
        [section]: {
          ...settings[section],
          ...updates
        }
      } as Partial<AppSettings>);
    },
    [section, settings, updateSettings]
  );

  return [settings[section], updateSection];
}