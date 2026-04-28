/**
 * Tutorial System Types
 *
 * Comprehensive type definitions for the EBL interactive tutorial system.
 */

import { ReactNode } from 'react';

/**
 * Tutorial step categories
 */
export type TutorialCategory =
  | 'audio'
  | 'patterns'
  | 'spatial'
  | 'timer'
  | 'equalizer'
  | 'visualization'
  | 'advanced';

/**
 * Tutorial step definition
 */
export interface TooltipStep {
  id: string;
  category: TutorialCategory;
  title: string;
  content: string;
  scienceContent?: string; // Extended scientific explanation
  targetElement: string; // CSS selector or element ID
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  order: number;
  optional?: boolean; // Can be skipped without completing
  prerequisite?: string[]; // Step IDs that must be completed first
}

/**
 * Tutorial state interface
 */
export interface TutorialState {
  isActive: boolean;
  currentStep: TooltipStep | null;
  completedSteps: string[];
  dismissedTooltips: string[];
  showOnStartup: boolean;
  showScienceByDefault: boolean;
  currentCategory?: TutorialCategory;
}

/**
 * Tutorial context value
 */
export interface TutorialContextValue {
  // State
  isActive: boolean;
  currentStep: TooltipStep | null;
  completedSteps: string[];
  dismissedTooltips: string[];
  showOnStartup: boolean;
  showScienceByDefault: boolean;
  isTutorialComplete: boolean;

  // Navigation
  startTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipToStep: (stepId: string) => void;
  skipToCategory: (category: TutorialCategory) => void;

  // Dismissal & Settings
  dismissTooltip: (tooltipId: string) => void;
  restoreTooltip: (tooltipId: string) => void;
  toggleShowOnStartup: () => void;
  toggleShowScience: () => void;

  // Reset
  resetTutorial: () => void;
  stopTutorial: () => void;

  // Progress tracking
  getCategoryProgress: (category: TutorialCategory) => {
    completed: number;
    total: number;
    percentage: number;
  };

  // Step access
  getAllSteps: () => TooltipStep[];
  getStepsByCategory: (category: TutorialCategory) => TooltipStep[];
}

/**
 * Tutorial tooltip props
 */
export interface TutorialTooltipProps {
  tooltipId: string;
  children: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  showScience?: boolean;
  category?: TutorialCategory;
  title?: string;
  content?: string;
  scienceContent?: string;
  disabled?: boolean;
  forceShow?: boolean; // Show tooltip even if dismissed
}

/**
 * Tutorial overlay props
 */
export interface TutorialOverlayProps {
  targetElement?: string | null;
  onDismiss?: () => void;
}

/**
 * Tutorial progress props
 */
export interface TutorialProgressProps {
  compact?: boolean;
  showCategories?: boolean;
}

/**
 * Tutorial settings props
 */
export interface TutorialSettingsProps {
  embedded?: boolean; // Embedded in settings panel vs standalone
}

/**
 * Tutorial startup modal props
 */
export interface TutorialStartupModalProps {
  open?: boolean;
  onClose?: () => void;
}
