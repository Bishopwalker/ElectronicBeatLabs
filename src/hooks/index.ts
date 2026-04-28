// Electromagnetic Beat Lab - Hooks Barrel Export
// Central export point for all custom React hooks

// Audio Engine Hooks
export { useAudioEngine } from './useAudioEngine';
export { useBackendAudioEngine } from './useBackendAudioEngine';
export { useHybridAudioEngine } from './useHybridAudioEngine';
export { useEqualizer, EQ_PRESETS } from './useEqualizer';

// Analysis & Visualization Hooks
export { useAudioAnalysis } from './useAudioAnalysis';
export { useBinauralVisualization } from './useBinauralVisualization';
export { useDynamicElectromagneticField } from './useDynamicElectromagneticField';

// State Management Hooks
export { useElectromagneticLabState } from './useElectromagneticLabState';
export { useCurrentPresetTracker } from './useCurrentPresetTracker';

// Timer Hooks
export { useTimerLogic } from './useTimerLogic';

// Network & Context Hooks
export { useWebSocketContext, WebSocketProvider } from './useWebsocketContext';
export { useSettingsContext, useSettingsSection, SettingsProvider } from './useSettingsContext';
export { useAuth } from './useAuth';

// Chat Hooks (modular package)
export {
  ChatProvider,
  useChatContext,
  useChatConnection,
  useChatSounds,
  useTypingIndicator,
} from './chat';

// Re-export types from hooks if needed
export type { EqualizerBand, EqualizerState } from '../types';