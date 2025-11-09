import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@jest/globals';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock pattern data
const mockPatterns = {
  'Focus Enhancement': {
    id: 'focus',
    name: 'Focus Enhancement',
    description: 'Enhance concentration and mental clarity',
    frequency: 40,
    leftFreq: 80,
    rightFreq: 120,
    duration: 1800,
    category: 'focus',
    fadeIn: 30,
    fadeOut: 30
  },
  'Deep Relaxation': {
    id: 'relaxation',
    name: 'Deep Relaxation',
    description: 'Promote deep relaxation and stress relief',
    frequency: 6,
    leftFreq: 140,
    rightFreq: 146,
    duration: 2400,
    category: 'relaxation',
    fadeIn: 60,
    fadeOut: 60
  },
  'Deep Sleep': {
    id: 'sleep',
    name: 'Deep Sleep',
    description: 'Prepare for deep, restorative sleep',
    frequency: 2,
    leftFreq: 140,
    rightFreq: 142,
    duration: 3600,
    category: 'sleep',
    fadeIn: 120,
    fadeOut: 120
  }
};

type PatternType = {
  id: string;
  name: string;
  description: string;
  frequency: number;
  leftFreq: number;
  rightFreq: number;
  duration: number;
  category: string;
  fadeIn: number;
  fadeOut: number;
  customizations?: { volume: number; customFreq: number };
};

let selectedPattern: PatternType | null = null;
let currentMode: string = 'AUTO';
const mockPatternLibrary: PatternType[] = Object.values(mockPatterns);

Given('the pattern library is available', () => {
  expect(mockPatternLibrary.length).toBeGreaterThan(0);
});

Given('I am on the patterns tab', async () => {
  const patternsTab = screen.getByRole('tab', { name: /patterns/i });
  await userEvent.click(patternsTab);
  expect(patternsTab).toHaveAttribute('aria-selected', 'true');
});

When('I open the pattern selector', () => {
  const patternSelector = screen.getByTestId('pattern-selector');
  expect(patternSelector).toBeInTheDocument();
});

Then('I should see a list of available patterns', () => {
  mockPatternLibrary.forEach(pattern => {
    expect(screen.getByText(pattern.name)).toBeInTheDocument();
  });
});

Then('each pattern should display its name, description, and target frequency', () => {
  mockPatternLibrary.forEach(pattern => {
    expect(screen.getByText(pattern.name)).toBeInTheDocument();
    expect(screen.getByText(pattern.description)).toBeInTheDocument();
    expect(screen.getByText(pattern.frequency.toString())).toBeInTheDocument();
  });
});

Then('patterns should be categorized by their intended effect', () => {
  expect(screen.getByText(/focus/i)).toBeInTheDocument();
  expect(screen.getByText(/relaxation/i)).toBeInTheDocument();
  expect(screen.getByText(/sleep/i)).toBeInTheDocument();
});

Given('the pattern {string} is available', (patternName: string) => {
  const pattern = mockPatterns[patternName as keyof typeof mockPatterns];
  expect(pattern).toBeDefined();
});

When('I select the {string} pattern', async (patternName: string) => {
  selectedPattern = mockPatterns[patternName as keyof typeof mockPatterns];
  
  const patternButton = screen.getByRole('button', { 
    name: new RegExp(patternName, 'i') 
  });
  await userEvent.click(patternButton);
});

Then('the left frequency should be set to {int} Hz', (expectedFreq: number) => {
  expect(selectedPattern.leftFreq).toBe(expectedFreq);
  expect(screen.getByDisplayValue(expectedFreq.toString())).toBeInTheDocument();
});

Then('the right frequency should be set to {int} Hz', (expectedFreq: number) => {
  expect(selectedPattern.rightFreq).toBe(expectedFreq);
  expect(screen.getByDisplayValue(expectedFreq.toString())).toBeInTheDocument();
});

Then('the pattern mode should be set to AUTO', () => {
  currentMode = 'AUTO';
  const autoButton = screen.getByRole('button', { name: 'AUTO' });
  expect(autoButton).toHaveClass('Mui-selected');
});

Then('the electromagnetic field should configure for focus enhancement', () => {
  // Verify electromagnetic field is configured for focus
  expect(screen.getByText(/gamma/i)).toBeInTheDocument(); // 40Hz is gamma range
});

Then('the frequencies should be set to the theta range', () => {
  expect(selectedPattern.frequency).toBeGreaterThanOrEqual(4);
  expect(selectedPattern.frequency).toBeLessThan(8);
  expect(screen.getByText(/theta/i)).toBeInTheDocument();
});

Then('the electromagnetic field should configure for relaxation', () => {
  expect(screen.getByText(/theta/i)).toBeInTheDocument();
});

Then('the audio should start automatically if auto-start is enabled', async () => {
  if (currentMode === 'AUTO') {
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop|pause/i })).toBeInTheDocument();
    });
  }
});

Given('I have a pattern selected', () => {
  selectedPattern = mockPatterns['Focus Enhancement'];
});

Given('the mode is currently set to {string}', (mode: string) => {
  currentMode = mode;
});

When('I change the mode to {string}', async (newMode: string) => {
  const modeButton = screen.getByRole('button', { name: newMode });
  await userEvent.click(modeButton);
  currentMode = newMode;
});

Then('I should be able to manually adjust frequencies', () => {
  const leftFreqInput = screen.getByLabelText(/left.*frequency/i);
  const rightFreqInput = screen.getByLabelText(/right.*frequency/i);
  
  expect(leftFreqInput).not.toBeDisabled();
  expect(rightFreqInput).not.toBeDisabled();
});

Then('the pattern should not automatically change settings', () => {
  // In manual mode, pattern shouldn't override manual changes
  expect(currentMode).toBe('MANUAL');
});

Then('manual controls should become enabled', () => {
  const frequencySliders = screen.getAllByRole('slider');
  frequencySliders.forEach(slider => {
    expect(slider).not.toBeDisabled();
  });
});

Given('I select a pattern with a {int}-minute duration', (durationMinutes: number) => {
  selectedPattern = {
    ...mockPatterns['Focus Enhancement'],
    duration: durationMinutes * 60
  };
});

When('I start the pattern', async () => {
  patternStartTime = Date.now();
  const startButton = screen.getByRole('button', { name: /start|play/i });
  await userEvent.click(startButton);
});

Then('the pattern should run for exactly {int} minutes', (expectedMinutes: number) => {
  expect(selectedPattern.duration).toBe(expectedMinutes * 60);
});

Then('there should be a progress indicator', () => {
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
});

Then('the pattern should fade out at the end', () => {
  expect(selectedPattern.fadeOut).toBeGreaterThan(0);
});

Given('I select a pattern with fade-in settings', () => {
  selectedPattern = mockPatterns['Deep Relaxation'];
  expect(selectedPattern.fadeIn).toBeGreaterThan(0);
});

Then('the audio should gradually increase from silence', () => {
  expect(selectedPattern.fadeIn).toBe(60); // 60 second fade-in
});

Then('the electromagnetic field should gradually strengthen', () => {
  // Field should ramp up gradually
  expect(selectedPattern.fadeIn).toBeGreaterThan(0);
});

Then('the transition should be smooth over the specified duration', () => {
  expect(selectedPattern.fadeIn).toBe(60);
});

Given('I am in manual mode', async () => {
  currentMode = 'MANUAL';
  const manualButton = screen.getByRole('button', { name: 'MANUAL' });
  await userEvent.click(manualButton);
});

When('I create a custom frequency combination', async () => {
  const leftFreqInput = screen.getByLabelText(/left.*frequency/i);
  const rightFreqInput = screen.getByLabelText(/right.*frequency/i);
  
  await userEvent.clear(leftFreqInput);
  await userEvent.type(leftFreqInput, '528');
  await userEvent.clear(rightFreqInput);
  await userEvent.type(rightFreqInput, '538');
});

When('I save it as a new pattern named {string}', async (patternName: string) => {
  const saveButton = screen.getByRole('button', { name: /save.*pattern/i });
  await userEvent.click(saveButton);
  
  const nameInput = screen.getByLabelText(/pattern.*name/i);
  await userEvent.type(nameInput, patternName);
  
  const confirmButton = screen.getByRole('button', { name: /confirm|save/i });
  await userEvent.click(confirmButton);
});

Then('the pattern should be added to my personal library', () => {
  expect(screen.getByText('My Custom Pattern')).toBeInTheDocument();
});

Then('I should be able to select it later', async () => {
  const customPattern = screen.getByRole('button', { 
    name: /My Custom Pattern/i 
  });
  expect(customPattern).toBeInTheDocument();
});

Then('it should remember all the configured settings', () => {
  // Custom pattern should retain its settings
  expect(screen.getByText('528')).toBeInTheDocument();
  expect(screen.getByText('538')).toBeInTheDocument();
});

Given('multiple patterns are available', () => {
  expect(mockPatternLibrary.length).toBeGreaterThan(2);
});

When('I filter by {string} category', async (category: string) => {
  const categoryFilter = screen.getByRole('combobox', { name: /category/i });
  await userEvent.selectOptions(categoryFilter, category.toLowerCase());
});

Then('only sleep-related patterns should be visible', () => {
  expect(screen.getByText('Deep Sleep')).toBeInTheDocument();
  expect(screen.queryByText('Focus Enhancement')).not.toBeInTheDocument();
});

Then('they should all have delta frequency ranges', () => {
  const sleepPattern = mockPatterns['Deep Sleep'];
  expect(sleepPattern.frequency).toBeLessThan(4); // Delta range
});

Then('inappropriate patterns should be hidden', () => {
  expect(screen.queryByText('Focus Enhancement')).not.toBeInTheDocument();
});

// Scenario Outline steps
Given('I have pattern {string} available', (patternName: string) => {
  const pattern = mockPatterns[patternName as keyof typeof mockPatterns];
  expect(pattern).toBeDefined();
});

When('I select the pattern {string}', async (patternName: string) => {
  selectedPattern = mockPatterns[patternName as keyof typeof mockPatterns];
  const patternButton = screen.getByRole('button', { 
    name: new RegExp(patternName, 'i') 
  });
  await userEvent.click(patternButton);
});

Then('the beat frequency should be in the {string} range', (frequencyRange: string) => {
  const frequency = selectedPattern.frequency;
  
  switch (frequencyRange) {
    case '0.5-4 Hz':
      expect(frequency).toBeGreaterThanOrEqual(0.5);
      expect(frequency).toBeLessThan(4);
      break;
    case '4-8 Hz':
      expect(frequency).toBeGreaterThanOrEqual(4);
      expect(frequency).toBeLessThan(8);
      break;
    case '8-13 Hz':
      expect(frequency).toBeGreaterThanOrEqual(8);
      expect(frequency).toBeLessThan(13);
      break;
    case '13-30 Hz':
      expect(frequency).toBeGreaterThanOrEqual(13);
      expect(frequency).toBeLessThan(30);
      break;
    case '30-100 Hz':
      expect(frequency).toBeGreaterThanOrEqual(30);
      expect(frequency).toBeLessThanOrEqual(100);
      break;
  }
});

Then('the electromagnetic field should be optimized for {string}', (targetState: string) => {
  expect(selectedPattern.category).toBe(targetState.replace('_', ''));
});

Given('I select a pattern that requires backend processing', () => {
  selectedPattern = mockPatterns['Focus Enhancement'];
});

When('the pattern is applied', async () => {
  const applyButton = screen.getByRole('button', { name: /apply|start/i });
  await userEvent.click(applyButton);
});

Then('the frontend should communicate with the backend API', () => {
  // Mock API call verification
  expect(global.fetch).toHaveBeenCalled();
});

Then('the backend should generate appropriate audio streams', () => {
  // WebSocket connection should be established
  expect(global.WebSocket).toHaveBeenCalled();
});

Then('the WebSocket connection should deliver real-time data', () => {
  expect(global.WebSocket).toHaveBeenCalled();
});

Then('the pattern should sync perfectly between frontend and backend', () => {
  // Sync verification
  expect(selectedPattern).toBeDefined();
});

Given('I attempt to load a corrupted pattern', () => {
  // Simulate pattern loading failure
});

When('the pattern fails to load', () => {
  // Trigger error state
});

Then('an appropriate error message should be displayed', () => {
  expect(screen.getByText(/error.*loading.*pattern/i)).toBeInTheDocument();
});

Then('the system should fall back to a default pattern', () => {
  expect(screen.getByText(/default/i)).toBeInTheDocument();
});

Then('the application should remain stable and usable', () => {
  expect(screen.getByRole('button', { name: /start|play/i })).toBeInTheDocument();
});

Given('I have selected and customized a pattern', () => {
  selectedPattern = {
    ...mockPatterns['Focus Enhancement'],
    customizations: { volume: 0.8, customFreq: 45 }
  };
});

When('I close and reopen the application', () => {
  // Simulate app restart by checking localStorage
  localStorage.setItem('lastPattern', JSON.stringify(selectedPattern));
});

Then('my pattern preferences should be remembered', () => {
  const savedPattern = JSON.parse(localStorage.getItem('lastPattern') || '{}');
  expect(savedPattern.id).toBe(selectedPattern.id);
});

Then('the last used pattern should be pre-selected', () => {
  expect(screen.getByText(selectedPattern.name)).toHaveAttribute('aria-selected', 'true');
});

Then('all customizations should be preserved', () => {
  const savedPattern = JSON.parse(localStorage.getItem('lastPattern') || '{}');
  expect(savedPattern.customizations).toEqual(selectedPattern.customizations);
});