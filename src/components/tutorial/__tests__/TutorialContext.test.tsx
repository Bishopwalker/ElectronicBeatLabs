/**
 * TutorialContext Unit Tests
 *
 * Tests for tutorial context provider, hooks, and state management.
 */

import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { TutorialProvider, useTutorial } from '../TutorialContext';
import { SettingsProvider } from '../../../hooks/useSettingsContext';

/**
 * Wrapper component for testing with providers
 */
const createWrapper = () => {
  return ({ children }: { children: ReactNode }) => (
    <SettingsProvider>
      <TutorialProvider>{children}</TutorialProvider>
    </SettingsProvider>
  );
};

describe('TutorialContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useTutorial(), {
        wrapper: createWrapper()
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.currentStep).toBeNull();
      expect(result.current.completedSteps).toEqual([]);
      expect(result.current.dismissedTooltips).toEqual([]);
      expect(result.current.showOnStartup).toBe(true);
      expect(result.current.isTutorialComplete).toBe(false);
    });

    it('should load state from localStorage', async () => {
      // Pre-populate localStorage
      localStorage.setItem(
        'ebl-settings-v1',
        JSON.stringify({
          tutorial: {
            hasSeenTutorial: true,
            dontShowAgain: true,
            completedSections: ['audio-01-play', 'audio-02-volume']
          }
        })
      );

      const { result } = renderHook(() => useTutorial(), {
        wrapper: createWrapper()
      });

      // Settings load synchronously from localStorage
      expect(result.current.completedSteps).toContain('audio-01-play');
      expect(result.current.completedSteps).toContain('audio-02-volume');
      expect(result.current.showOnStartup).toBe(false);
    });
  });

  describe('Tutorial Navigation', () => {
    it('should start tutorial with first step', () => {
      const { result } = renderHook(() => useTutorial(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.startTutorial();
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.currentStep).not.toBeNull();
      expect(result.current.currentStep?.id).toBe('audio-01-play');
    });

    it('should move to next step', () => {
      const { result } = renderHook(() => useTutorial(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.startTutorial();
      });

      const firstStepId = result.current.currentStep?.id;

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStep?.id).not.toBe(firstStepId);
      expect(result.current.completedSteps).toContain(firstStepId);
    });

    it('should move to previous step', () => {
      const { result } = renderHook(() => useTutorial(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.startTutorial();
      });

      const firstStepId = result.current.currentStep?.id;

      act(() => {
        result.current.nextStep();
      });

      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStep?.id).toBe(firstStepId);
    });

    it('should skip to specific step by ID', () => {
      const { result } = renderHook(() => useTutorial(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.skipToStep('spatial-01-enable');
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.currentStep?.id).toBe('spatial-01-enable');
    });

    it('should skip to category', () => {
      const { result } = renderHook(() => useTutorial(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.skipToCategory('timer');
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.currentStep?.category).toBe('timer');
    });

    it('should stop tutorial', () => {
      const { result } = renderHook(() => useTutorial(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.startTutorial();
      });

      expect(result.current.isActive).toBe(true);

      act(() => {
        result.current.stopTutorial();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.currentStep).toBeNull();
    });
  });

  describe('Tooltip Dismissal', () => {
    it('should dismiss tooltip', () => {
      const { result } = renderHook(() => useTutorial(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.dismissTooltip('audio-01-play');
      });

      expect(result.current.dismissedTooltips).toContain('audio-01-play');
    });

    it('should restore dismissed tooltip', () => {
      const { result } = renderHook(() => useTutorial(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.dismissTooltip('audio-01-play');
      });

      expect(result.current.dismissedTooltips).toContain('audio-01-play');

      act(() => {
        result.current.restoreTooltip('audio-01-play');
      });

      expect(result.current.dismissedTooltips).not.toContain('audio-01-play');
    });

    it('should not add duplicate dismissed tooltips', () => {
      const { result } = renderHook(() => useTutorial(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.dismissTooltip('audio-01-play');
        result.current.dismissTooltip('audio-01-play');
      });

      const count = result.current.dismissedTooltips.filter(
        id => id === 'audio-01-play'
      ).length;

      expect(count).toBe(1);
    });
  });

  describe('Settings', () => {
    it('should toggle show on startup', () => {
      const { result } = renderHook(() => useTutorial(), {
        wrapper: createWrapper()
      });

      const initialValue = result.current.showOnStartup;

      act(() => {
        result.current.toggleShowOnStartup();
      });

      expect(result.current.showOnStartup).toBe(!initialValue);
    });

    it('should toggle show science by default', () => {
      const { result } = renderHook(() => useTutorial(), {
        wrapper: createWrapper()
      });

      const initialValue = result.current.showScienceByDefault;

      act(() => {
        result.current.toggleShowScience();
      });

      expect(result.current.showScienceByDefault).toBe(!initialValue);
    });
  });

  describe('Progress Tracking', () => {
    it('should get category progress', () => {
      const { result } = renderHook(() => useTutorial(), {
        wrapper: createWrapper()
      });

      const progress = result.current.getCategoryProgress('audio');

      expect(progress).toHaveProperty('completed');
      expect(progress).toHaveProperty('total');
      expect(progress).toHaveProperty('percentage');
      expect(typeof progress.completed).toBe('number');
      expect(typeof progress.total).toBe('number');
      expect(typeof progress.percentage).toBe('number');
    });

    it('should calculate correct category progress', () => {
      const { result } = renderHook(() => useTutorial(), {
        wrapper: createWrapper()
      });

      // Complete some audio steps
      act(() => {
        result.current.skipToStep('audio-01-play');
        result.current.nextStep();
        result.current.nextStep();
      });

      const progress = result.current.getCategoryProgress('audio');

      expect(progress.completed).toBeGreaterThan(0);
      expect(progress.total).toBeGreaterThan(0);
      expect(progress.percentage).toBeGreaterThan(0);
      expect(progress.percentage).toBeLessThanOrEqual(100);
    });

    it('should determine tutorial completion correctly', () => {
      const { result } = renderHook(() => useTutorial(), {
        wrapper: createWrapper()
      });

      expect(result.current.isTutorialComplete).toBe(false);

      // Complete all required steps
      const allSteps = result.current.getAllSteps();
      const requiredSteps = allSteps.filter(s => !s.optional);

      act(() => {
        requiredSteps.forEach(step => {
          result.current.skipToStep(step.id);
          result.current.nextStep();
        });
      });

      expect(result.current.isTutorialComplete).toBe(true);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset tutorial completely', async () => {
      const { result } = renderHook(() => useTutorial(), {
        wrapper: createWrapper()
      });

      // Add some state
      act(() => {
        result.current.startTutorial();
        result.current.nextStep();
        result.current.dismissTooltip('audio-01-play');
        result.current.toggleShowOnStartup();
      });

      // Reset
      act(() => {
        result.current.resetTutorial();
      });

      // Reset is synchronous
      expect(result.current.completedSteps).toEqual([]);
      expect(result.current.dismissedTooltips).toEqual([]);
      expect(result.current.isActive).toBe(false);
      expect(result.current.currentStep).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useTutorial());
      }).toThrow('useTutorial must be used within TutorialProvider');

      console.error = consoleError;
    });

    it('should handle invalid step ID gracefully', () => {
      const { result } = renderHook(() => useTutorial(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.skipToStep('invalid-step-id');
      });

      // Should not activate tutorial with invalid step
      expect(result.current.isActive).toBe(false);
    });
  });
});
