/**
 * Tutorial Steps Index
 * EBL (Electromagnetic Beat Lab)
 *
 * Central export point for all tutorial step definitions
 */

import { TooltipStep } from '../types';
import { audioSteps } from './audioSteps';
import { patternSteps } from './patternSteps';
import { visualizationSteps } from './visualizationSteps';
import { equalizerSteps } from './equalizerSteps';
import { timerSteps } from './timerSteps';
import { advancedSteps } from './advancedSteps';

/**
 * All tutorial steps organized by category
 */
export const tutorialSteps = {
  audio: audioSteps,
  patterns: patternSteps,
  visualization: visualizationSteps,
  equalizer: equalizerSteps,
  timer: timerSteps,
  advanced: advancedSteps,
};

/**
 * Flattened array of all tutorial steps
 */
export const allTutorialSteps: TooltipStep[] = [
  ...audioSteps,
  ...patternSteps,
  ...visualizationSteps,
  ...equalizerSteps,
  ...timerSteps,
  ...advancedSteps,
];

/**
 * Get tutorial steps by category
 */
export function getStepsByCategory(category: string): TooltipStep[] {
  switch (category) {
    case 'audio':
      return audioSteps;
    case 'patterns':
      return patternSteps;
    case 'visualization':
      return visualizationSteps;
    case 'equalizer':
      return equalizerSteps;
    case 'timer':
      return timerSteps;
    case 'advanced':
      return advancedSteps;
    default:
      return [];
  }
}

/**
 * Get tutorial step by ID
 */
export function getStepById(id: string): TooltipStep | undefined {
  return allTutorialSteps.find(step => step.id === id);
}

/**
 * Get tutorial steps by target element
 */
export function getStepsByTarget(targetElement: string): TooltipStep[] {
  return allTutorialSteps.filter(step => step.targetElement === targetElement);
}

/**
 * Tutorial step count by category
 */
export const tutorialStepCounts = {
  audio: audioSteps.length,
  patterns: patternSteps.length,
  visualization: visualizationSteps.length,
  equalizer: equalizerSteps.length,
  timer: timerSteps.length,
  advanced: advancedSteps.length,
  total: allTutorialSteps.length,
};

// Named exports for individual step arrays
export { audioSteps } from './audioSteps';
export { patternSteps } from './patternSteps';
export { visualizationSteps } from './visualizationSteps';
export { equalizerSteps } from './equalizerSteps';
export { timerSteps } from './timerSteps';
export { advancedSteps } from './advancedSteps';
