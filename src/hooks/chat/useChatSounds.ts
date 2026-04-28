/**
 * Chat Sounds Hook - AOL/AIM Door Open/Close Sounds
 *
 * Provides classic AOL/AIM sound effects:
 * - Door open: User joins room
 * - Door close: User leaves room
 * - Message: New message received
 */

import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook for managing chat sound effects.
 *
 * @returns Sound playback functions and control
 */
export const useChatSounds = () => {
  const doorOpenRef = useRef<HTMLAudioElement | null>(null);
  const doorCloseRef = useRef<HTMLAudioElement | null>(null);
  const messageRef = useRef<HTMLAudioElement | null>(null);
  const soundsEnabledRef = useRef(true);
  const volumeRef = useRef(0.5);

  useEffect(() => {
    // Pre-load sounds
    doorOpenRef.current = new Audio('/sounds/door-open.mp3');
    doorCloseRef.current = new Audio('/sounds/door-close.mp3');
    messageRef.current = new Audio('/sounds/message-received.mp3');

    // Set initial volume
    const setVolume = (audio: HTMLAudioElement | null) => {
      if (audio) audio.volume = volumeRef.current;
    };
    setVolume(doorOpenRef.current);
    setVolume(doorCloseRef.current);
    setVolume(messageRef.current);

    return () => {
      // Cleanup audio elements
      const cleanup = (ref: React.MutableRefObject<HTMLAudioElement | null>) => {
        if (ref.current) {
          ref.current.pause();
          ref.current.src = '';
          ref.current = null;
        }
      };
      cleanup(doorOpenRef);
      cleanup(doorCloseRef);
      cleanup(messageRef);
    };
  }, []);

  /**
   * Play a sound with error handling for autoplay restrictions.
   */
  const playSound = useCallback((audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
    if (!soundsEnabledRef.current || !audioRef.current) return;

    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Silently fail - browser may block autoplay
      });
    } catch {
      // Ignore errors
    }
  }, []);

  /**
   * Play door open sound (user joined).
   */
  const playDoorOpen = useCallback(() => {
    playSound(doorOpenRef);
  }, [playSound]);

  /**
   * Play door close sound (user left).
   */
  const playDoorClose = useCallback(() => {
    playSound(doorCloseRef);
  }, [playSound]);

  /**
   * Play message received sound.
   */
  const playMessageSound = useCallback(() => {
    playSound(messageRef);
  }, [playSound]);

  /**
   * Enable or disable all sounds.
   */
  const setSoundsEnabled = useCallback((enabled: boolean) => {
    soundsEnabledRef.current = enabled;
  }, []);

  /**
   * Set volume for all sounds (0-1).
   */
  const setVolume = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    volumeRef.current = clamped;

    [doorOpenRef, doorCloseRef, messageRef].forEach((ref) => {
      if (ref.current) ref.current.volume = clamped;
    });
  }, []);

  return {
    playDoorOpen,
    playDoorClose,
    playMessageSound,
    setSoundsEnabled,
    setVolume,
  };
};
