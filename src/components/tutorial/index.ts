/**
 * Tutorial System - Main Export
 *
 * Comprehensive tutorial system for the EBL application.
 * Provides interactive tooltips, progress tracking, and settings management.
 *
 * Usage:
 * ```tsx
 * import { TutorialProvider, TutorialTooltip, useTutorial } from '@/components/tutorial';
 *
 * // Wrap app with provider
 * <TutorialProvider>
 *   <App />
 * </TutorialProvider>
 *
 * // Use tooltips
 * <TutorialTooltip tooltipId="audio-01-play">
 *   <Button>Play</Button>
 * </TutorialTooltip>
 *
 * // Access tutorial context
 * const { startTutorial, nextStep } = useTutorial();
 * ```
 */

// Context & Hook
export { TutorialProvider, useTutorial } from './TutorialContext';

// Components
export { TutorialTooltip } from './TutorialTooltip';
export { TutorialOverlay } from './TutorialOverlay';
export { TutorialProgress } from './TutorialProgress';
export { TutorialSettings } from './TutorialSettings';
export { TutorialStartupModal } from './TutorialStartupModal';

// Types
export type {
  TutorialCategory,
  TooltipStep,
  TutorialState,
  TutorialContextValue,
  TutorialTooltipProps,
  TutorialOverlayProps,
  TutorialProgressProps,
  TutorialSettingsProps,
  TutorialStartupModalProps
} from './types';

// Tutorial Steps
export {
  TUTORIAL_STEPS,
  getStepsByCategory,
  getStepById,
  getAllCategories,
  getNextStep,
  getPreviousStep
} from './tutorialSteps';
