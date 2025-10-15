// System Status Chips - Displays all system status indicators
// Extracted from main component to reduce clutter

import React, {useEffect, useState} from 'react';
import { Box, Chip, Typography } from '@mui/material';
import type {AppState, AudioEngine, Pattern8D} from '../../types';
import { ElectromagneticLabStyles } from '../styles/ElectromagneticLabStyles';

interface SystemStatusChipsProps {
    appState: AppState;
    audioEngine: AudioEngine;
    patterns8D: Pattern8D[];
    onStateChange: (state: Partial<AppState>) => void;
    onToggleEngine?: (engineType: 'binaural' | 'backend' | 'spatial', enabled: boolean) => void;
}
const SystemStatusChips: React.FC<SystemStatusChipsProps> = ({
  appState,
  audioEngine,
  onToggleEngine
 }) => {
    // Local state to track audio context and connection states
    const [audioContextState, setAudioContextState] = useState(
        audioEngine.audioState?.context?.state || 'closed'
    );
    const [backendConnected, setBackendConnected] = useState(
        audioEngine.backendConnected || false
    );
    const [websocketState, setWebsocketState] = useState({
        connected: audioEngine.websocketState?.connected || false,
        connecting: audioEngine.websocketState?.connecting || false,
        error: audioEngine.websocketState?.error || null
    });
    const [backendRetryCount, setBackendRetryCount] = useState(0);
    const [isCheckingBackend, setIsCheckingBackend] = useState(false);
    // Simple state sync based on prop changes (no polling!)
    useEffect(() => {
        const isNowConnected = audioEngine.backendConnected || false;

        // Only update if value actually changed
        if (backendConnected !== isNowConnected) {
            setBackendConnected(isNowConnected);
        }

        // Only update websocket state if values changed
        const newWsConnected = audioEngine.websocketState?.connected || false;
        const newWsConnecting = audioEngine.websocketState?.connecting || false;
        const newWsError = audioEngine.websocketState?.error || null;

        if (websocketState.connected !== newWsConnected ||
            websocketState.connecting !== newWsConnecting ||
            websocketState.error !== newWsError) {
            setWebsocketState({
                connected: newWsConnected,
                connecting: newWsConnecting,
                error: newWsError
            });
        }

        // Reset checking state when connected
        if (isNowConnected && (isCheckingBackend || backendRetryCount > 0)) {
            setIsCheckingBackend(false);
            setBackendRetryCount(0);
        }
    }, [audioEngine.backendConnected, audioEngine.websocketState]);
     return (
    <Box sx={ElectromagneticLabStyles.systemStatusChips}>
      <Typography variant="caption" color="text.secondary">
        Systems:
      </Typography>
      
      {/* Binaural Engine = Backend Engine - show connection + playing status */}
      <Chip
        label={
          audioEngine.backendConnected && audioEngine.audioState?.isPlaying
            ? "🎧 Binaural PLAYING"
            : audioEngine.backendConnected
              ? "🎧 Binaural CONNECTED"
              : isCheckingBackend && backendRetryCount > 0
                ? `🔍 Connecting (${backendRetryCount}/20)`
                : "🎧 Binaural OFF"
        }
        size="small"
        color={
          audioEngine.backendConnected && audioEngine.audioState?.isPlaying
            ? "success"
            : audioEngine.backendConnected
              ? "info"
              : isCheckingBackend
                ? "warning"
                : "default"
        }
        variant={audioEngine.backendConnected ? "filled" : "outlined"}
        onClick={onToggleEngine ? () => {
          console.log(`🔄 SystemStatusChips: Toggling binaural (backend) engine:`, !audioEngine.backendConnected);
          onToggleEngine('backend', !audioEngine.backendConnected);
        } : undefined}
        sx={{
          ...ElectromagneticLabStyles.statusChip(!!audioEngine.backendConnected),
          ...(audioEngine.backendConnected && audioEngine.audioState?.isPlaying && {
            background: 'linear-gradient(45deg, #00ff00, #00dd00) !important',
            fontWeight: 'bold',
            boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
            animation: 'pulse 2s infinite'
          }),
          ...(audioEngine.backendConnected && !audioEngine.audioState?.isPlaying && {
            background: 'linear-gradient(45deg, #0066ff, #0044dd) !important',
            fontWeight: 'bold',
            boxShadow: '0 0 8px rgba(0, 102, 255, 0.4)'
          }),
          ...(isCheckingBackend && !audioEngine.backendConnected && {
            background: 'linear-gradient(45deg, #ff6b00, #dd5500) !important',
            fontWeight: 'bold',
            boxShadow: '0 0 8px rgba(255, 107, 0, 0.4)',
            animation: 'pulse 3s infinite'
          }),
          ...(onToggleEngine && {
            cursor: 'pointer',
            '&:hover': {
              transform: 'scale(1.02)',
            },
            transition: 'all 0.2s ease-in-out'
          })
        }}
      />

      {/* Backend Engine Status - separate from binaural */}
      <Chip
        label={audioEngine.backendConnected ? "🔗 Backend ON" : "⚠️ Backend OFF"}
        size="small"
        color={audioEngine.backendConnected ? "success" : "error"}
        variant="filled"
        sx={{
          ...ElectromagneticLabStyles.statusChip(!!audioEngine.backendConnected),
          ...(audioEngine.backendConnected && {
            background: 'linear-gradient(45deg, #00ff00, #00dd00) !important'
          })
        }}
      />

      {/* Frontend Engine - Web Audio API */}
      <Chip
        label={!audioEngine.backendConnected ? "⚡ Frontend ON" : "⚡ Frontend OFF"}
        size="small"
        color={!audioEngine.backendConnected ? "success" : "default"}
        variant={!audioEngine.backendConnected ? "filled" : "outlined"}
        onClick={onToggleEngine ? () => {
          console.log(`🔄 SystemStatusChips: Toggling frontend engine - currently backend connected:`, audioEngine.backendConnected);
          // If backend is connected, enable frontend (switch to frontend)
          // If backend is not connected, we're already using frontend so this would disable it
          onToggleEngine('frontend', !audioEngine.backendConnected);
        } : undefined}
        sx={{
          ...ElectromagneticLabStyles.statusChip(!audioEngine.backendConnected),
          ...(!audioEngine.backendConnected && {
            background: 'linear-gradient(45deg, #ff8533, #9944d9) !important',
            fontWeight: 'bold',
            boxShadow: '0 0 8px rgba(255, 133, 51, 0.4)'
          }),
          ...(onToggleEngine && {
            cursor: 'pointer',
            '&:hover': {
              transform: 'scale(1.02)',
            },
            transition: 'all 0.2s ease-in-out'
          })
        }}
      />

      {/* Spatial Audio */}
      <Chip
        label={appState.spatialAudio?.enabled ? "🎧 Spatial ON" : "🎧 Spatial OFF"}
        size="small"
        color={
          appState.spatialAudio?.enabled
            ? (audioEngine.backendConnected ? "success" : "warning")
            : "default"
        }
        variant={appState.spatialAudio?.enabled ? "filled" : "outlined"}
        onClick={onToggleEngine ? () => {
          console.log(`🔄 SystemStatusChips: Toggling spatial audio:`, !appState.spatialAudio?.enabled);
          onToggleEngine('spatial', !appState.spatialAudio?.enabled);
        } : undefined}
        sx={{
          ...ElectromagneticLabStyles.statusChip(!!appState.spatialAudio?.enabled),
          // Special styling for spatial audio enabled but backend not connected
          ...(appState.spatialAudio?.enabled && !audioEngine.backendConnected && {
            background: 'linear-gradient(45deg, #ff8533, #ffaa00) !important',
            fontWeight: 'bold',
            boxShadow: '0 0 8px rgba(255, 133, 51, 0.4)'
          }),
          // Special styling for spatial audio enabled and backend connected
          ...(appState.spatialAudio?.enabled && audioEngine.backendConnected && {
            background: 'linear-gradient(45deg, #00ff00, #00dd00) !important',
            fontWeight: 'bold',
            boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)'
          }),
          ...(onToggleEngine && {
            cursor: 'pointer',
            '&:hover': {
              transform: 'scale(1.02)',
            },
            transition: 'all 0.2s ease-in-out'
          })
        }}
      />
    </Box>
  );
};

export default SystemStatusChips;