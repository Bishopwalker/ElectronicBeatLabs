/**
 * Tutorial Context Provider
 *
 * Centralized state management for the EBL tutorial system.
 * Integrates with useSettingsContext for persistence.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useSettingsContext } from '../../hooks/useSettingsContext';
import { TutorialContextValue, TooltipStep, TutorialCategory } from './types';
import { TUTORIAL_STEPS, getNextStep, getPreviousStep, getStepsByCategory } from './tutorialSteps';

// Create context
const TutorialContext = createContext<TutorialContextValue | undefined>(undefined);

/**
 * Tutorial Provider Component
 */
export const TutorialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { settings, updateSettings } = useSettingsContext();

  // Local state
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<TooltipStep | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [dismissedTooltips, setDismissedTooltips] = useState<string[]>([]);
  const [showOnStartup, setShowOnStartup] = useState(true);
  const [showScienceByDefault, setShowScienceByDefault] = useState(false);

  // Initialize from settings on mount
  useEffect(() => {
    if (settings.tutorial) {
      setCompletedSteps(settings.tutorial.completedSections || []);
      setShowOnStartup(!settings.tutorial.dontShowAgain);
    }
  }, [settings.tutorial]);

  // Persist to settings when state changes
  // Note: Only persist when completedSteps or showOnStartup actually changes
  // Using a ref to track if this is initial mount to avoid unnecessary updates
  const isInitialMount = React.useRef(true);
  useEffect(() => {
    // Skip on initial mount to prevent overwriting loaded settings
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    updateSettings({
      tutorial: {
        hasSeenTutorial: completedSteps.length > 0,
        dontShowAgain: !showOnStartup,
        completedSections: completedSteps
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedSteps, showOnStartup]);

  /**
   * Start the tutorial from the beginning
   */
  const startTutorial = useCallback(() => {
    setIsActive(true);
    const firstIncompleteStep = TUTORIAL_STEPS.find(
      step => !completedSteps.includes(step.id)
    );
    setCurrentStep(firstIncompleteStep || TUTORIAL_STEPS[0]);
  }, [completedSteps]);

  /**
   * Stop the tutorial
   */
  const stopTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentStep(null);
  }, []);

  /**
   * Move to next step
   */
  const nextStep = useCallback(() => {
    if (!currentStep) return;

    // Mark current step as completed
    if (!completedSteps.includes(currentStep.id)) {
      setCompletedSteps(prev => [...prev, currentStep.id]);
    }

    // Move to next step
    const next = getNextStep(currentStep.id);
    if (next) {
      setCurrentStep(next);
    } else {
      // Tutorial completed
      stopTutorial();
    }
  }, [currentStep, completedSteps, stopTutorial]);

  /**
   * Move to previous step
   */
  const previousStep = useCallback(() => {
    if (!currentStep) return;

    const prev = getPreviousStep(currentStep.id);
    if (prev) {
      setCurrentStep(prev);
    }
  }, [currentStep]);

  /**
   * Skip to specific step by ID
   */
  const skipToStep = useCallback((stepId: string) => {
    const step = TUTORIAL_STEPS.find(s => s.id === stepId);
    if (step) {
      setCurrentStep(step);
      setIsActive(true);
    }
  }, []);

  /**
   * Skip to first step in category
   */
  const skipToCategory = useCallback((category: TutorialCategory) => {
    const categorySteps = getStepsByCategory(category);
    if (categorySteps.length > 0) {
      const firstIncomplete = categorySteps.find(
        step => !completedSteps.includes(step.id)
      );
      setCurrentStep(firstIncomplete || categorySteps[0]);
      setIsActive(true);
    }
  }, [completedSteps]);

  /**
   * Dismiss a specific tooltip permanently
   */
  const dismissTooltip = useCallback((tooltipId: string) => {
    setDismissedTooltips(prev => {
      if (!prev.includes(tooltipId)) {
        return [...prev, tooltipId];
      }
      return prev;
    });
  }, []);

  /**
   * Restore a dismissed tooltip
   */
  const restoreTooltip = useCallback((tooltipId: string) => {
    setDismissedTooltips(prev => prev.filter(id => id !== tooltipId));
  }, []);

  /**
   * Toggle show tutorial on startup
   */
  const toggleShowOnStartup = useCallback(() => {
    setShowOnStartup(prev => !prev);
  }, []);

  /**
   * Toggle show science explanations by default
   */
  const toggleShowScience = useCallback(() => {
    setShowScienceByDefault(prev => !prev);
  }, []);

  /**
   * Reset tutorial progress completely
   */
  const resetTutorial = useCallback(() => {
    setCompletedSteps([]);
    setDismissedTooltips([]);
    setCurrentStep(null);
    setIsActive(false);
    updateSettings({
      tutorial: {
        hasSeenTutorial: false,
        dontShowAgain: false,
        completedSections: []
      }
    });
  }, [updateSettings]);

  /**
   * Get progress for a specific category
   */
  const getCategoryProgress = useCallback((category: TutorialCategory) => {
    const categorySteps = getStepsByCategory(category);
    const completed = categorySteps.filter(step =>
      completedSteps.includes(step.id)
    ).length;
    const total = categorySteps.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }, [completedSteps]);

  /**
   * Get all steps
   */
  const getAllSteps = useCallback(() => {
    return TUTORIAL_STEPS;
  }, []);

  /**
   * Check if tutorial is complete
   */
  const isTutorialComplete = TUTORIAL_STEPS.every(step =>
    completedSteps.includes(step.id) || step.optional
  );

  const value: TutorialContextValue = {
    // State
    isActive,
    currentStep,
    completedSteps,
    dismissedTooltips,
    showOnStartup,
    showScienceByDefault,
    isTutorialComplete,

    // Navigation
    startTutorial,
    nextStep,
    previousStep,
    skipToStep,
    skipToCategory,

    // Dismissal & Settings
    dismissTooltip,
    restoreTooltip,
    toggleShowOnStartup,
    toggleShowScience,

    // Reset
    resetTutorial,
    stopTutorial,

    // Progress
    getCategoryProgress,

    // Access
    getAllSteps,
    getStepsByCategory
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};

/**
 * Hook to access tutorial context
 */
export const useTutorial = (): TutorialContextValue => {
  const context = useContext(TutorialContext);

  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }

  return context;
};
