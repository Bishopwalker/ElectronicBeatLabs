/**
 * Tutorial Overlay Component
 *
 * Creates a spotlight effect on the current tutorial target element
 * with smooth transitions and click-outside-to-dismiss functionality.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Box, Fade } from '@mui/material';
import { useTutorial } from './TutorialContext';
import { TutorialOverlayProps } from './types';

/**
 * TutorialOverlay Component
 *
 * Dark overlay with spotlight on current element.
 */
export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  targetElement: targetElementProp,
  onDismiss
}) => {
  const { isActive, currentStep, stopTutorial, nextStep } = useTutorial();
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  const [missingElementAttempts, setMissingElementAttempts] = useState(0);

  // Determine target element
  const targetSelector = targetElementProp || currentStep?.targetElement;

  /**
   * Update element position when target changes
   */
  const updateElementPosition = useCallback(() => {
    if (!targetSelector) {
      setElementRect(null);
      setMissingElementAttempts(0);
      return;
    }

    try {
      const element = document.querySelector(targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setElementRect(rect);
        setMissingElementAttempts(0); // Reset counter when element found
      } else {
        setElementRect(null);
        setMissingElementAttempts(prev => prev + 1);
      }
    } catch (error) {
      console.warn('Tutorial: Invalid selector:', targetSelector);
      setElementRect(null);
      setMissingElementAttempts(prev => prev + 1);
    }
  }, [targetSelector]);

  // Auto-skip to next step if element not found after several attempts
  useEffect(() => {
    if (isActive && missingElementAttempts >= 6) { // ~3 seconds (500ms intervals)
      console.warn('Tutorial: Element not found after multiple attempts, skipping step:', targetSelector);
      nextStep();
      setMissingElementAttempts(0);
    }
  }, [isActive, missingElementAttempts, targetSelector, nextStep]);

  /**
   * Handle click outside spotlight
   */
  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    // Only dismiss if clicking directly on overlay, not spotlight area
    if (event.target === event.currentTarget) {
      if (onDismiss) {
        onDismiss();
      } else {
        stopTutorial();
      }
    }
  }, [onDismiss, stopTutorial]);

  /**
   * Update position on mount and when dependencies change
   */
  useEffect(() => {
    if (!isActive || !targetSelector) {
      setElementRect(null);
      return;
    }

    // Initial position
    updateElementPosition();

    // Update on window resize/scroll
    window.addEventListener('resize', updateElementPosition);
    window.addEventListener('scroll', updateElementPosition, true);

    // Poll for position changes (for dynamic content)
    const intervalId = setInterval(updateElementPosition, 500);

    return () => {
      window.removeEventListener('resize', updateElementPosition);
      window.removeEventListener('scroll', updateElementPosition, true);
      clearInterval(intervalId);
    };
  }, [isActive, targetSelector, updateElementPosition]);

  // Don't render if not active
  // CRITICAL: Also don't render if no valid element rect - prevents blocking the entire UI
  if (!isActive) {
    return null;
  }

  // If active but no element found, don't block the UI - just show nothing
  // This prevents the overlay from blocking all interactions when target element isn't found
  if (!elementRect) {
    return null;
  }

  // Calculate spotlight dimensions with padding
  const padding = 12;
  const spotlightRect = {
    top: elementRect.top - padding,
    left: elementRect.left - padding,
    width: elementRect.width + padding * 2,
    height: elementRect.height + padding * 2
  };

  return (
    <Fade in={isActive} timeout={300}>
      <Box
        onClick={handleOverlayClick}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9998, // Below tooltip (9999) but above everything else
          pointerEvents: 'auto',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          // Create spotlight effect using clip-path
          background: 'rgba(0, 0, 0, 0.7)',
          clipPath: elementRect
            ? `polygon(
                0% 0%,
                0% 100%,
                ${spotlightRect.left}px 100%,
                ${spotlightRect.left}px ${spotlightRect.top}px,
                ${spotlightRect.left + spotlightRect.width}px ${spotlightRect.top}px,
                ${spotlightRect.left + spotlightRect.width}px ${spotlightRect.top + spotlightRect.height}px,
                ${spotlightRect.left}px ${spotlightRect.top + spotlightRect.height}px,
                ${spotlightRect.left}px 100%,
                100% 100%,
                100% 0%
              )`
            : undefined
        }}
      >
        {/* Spotlight glow effect */}
        {elementRect && (
          <Box
            sx={{
              position: 'absolute',
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
              borderRadius: 2,
              boxShadow: `
                0 0 0 4px rgba(0, 255, 136, 0.3),
                0 0 20px 8px rgba(0, 255, 136, 0.2),
                inset 0 0 20px rgba(0, 255, 136, 0.1)
              `,
              pointerEvents: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'tutorial-pulse 2s ease-in-out infinite'
            }}
          />
        )}

        {/* Keyframe animation for pulse effect */}
        <style>
          {`
            @keyframes tutorial-pulse {
              0%, 100% {
                box-shadow:
                  0 0 0 4px rgba(0, 255, 136, 0.3),
                  0 0 20px 8px rgba(0, 255, 136, 0.2),
                  inset 0 0 20px rgba(0, 255, 136, 0.1);
              }
              50% {
                box-shadow:
                  0 0 0 4px rgba(0, 255, 136, 0.5),
                  0 0 30px 12px rgba(0, 255, 136, 0.3),
                  inset 0 0 30px rgba(0, 255, 136, 0.15);
              }
            }
          `}
        </style>
      </Box>
    </Fade>
  );
};
