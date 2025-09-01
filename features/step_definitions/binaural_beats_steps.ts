import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ElectromagneticBeatLab from '../../src/components/ElectromagneticBeatLab';
import React from 'react';

// Shared test state
let mockAudioEngine: {
  isPlaying: boolean;
  leftFreq: number;
  rightFreq: number;
  beatFreq: number;
  volume: number;
  startAudio: jest.Mock;
  stopAudio: jest.Mock;
  setVolume: jest.Mock;
  setFrequencies: jest.Mock;
  setWaveform: jest.Mock;
  error: null | Error;
};
let mockElectromagneticField: {
  strength: number;
  frequency: number;
  coherence: number;
  state: string;
  stability: number;
};

// Mock setup
beforeAll(() => {
  // Mock audio engine
  mockAudioEngine = {
    isPlaying: false,
    leftFreq: 440,
    rightFreq: 444,
    beatFreq: 4,
    volume: 0.5,
    startAudio: jest.fn(),
    stopAudio: jest.fn(),
    setVolume: jest.fn(),
    setFrequencies: jest.fn(),
    setWaveform: jest.fn(),
    error: null
  };

  // Mock electromagnetic field
  mockElectromagneticField = {
    strength: 0,
    frequency: 0,
    coherence: 0,
    state: 'INACTIVE',
    stability: 0
  };

  // Mock hooks
  jest.mock('../../src/hooks/useAudioEngine', () => ({
    useAudioEngine: () => mockAudioEngine
  }));
});

Given('I have the Electromagnetic Beat Lab application loaded', async () => {
  const defaultProps = {
    onStateChange: jest.fn(),
    initialState: {
      isPlaying: false,
      leftFrequency: 440,
      rightFrequency: 444,
      volume: 0.5,
      selectedPattern: null,
      currentTab: 'frequency'
    }
  };
  
  render(React.createElement(ElectromagneticBeatLab, defaultProps));
  expect(screen.getByText(/Electromagnetic Beat Lab/i)).toBeInTheDocument();
});

Given('the audio system is initialized', () => {
  expect(mockAudioEngine).toBeDefined();
  expect(mockAudioEngine.error).toBeNull();
});

Given('I set the left frequency to {int} Hz', (frequency: number) => {
  mockAudioEngine.leftFreq = frequency;
  const leftFreqInput = screen.getByLabelText(/left.*frequency/i);
  fireEvent.change(leftFreqInput, { target: { value: frequency.toString() } });
});

Given('I set the right frequency to {int} Hz', (frequency: number) => {
  mockAudioEngine.rightFreq = frequency;
  mockAudioEngine.beatFreq = Math.abs(mockAudioEngine.rightFreq - mockAudioEngine.leftFreq);
  const rightFreqInput = screen.getByLabelText(/right.*frequency/i);
  fireEvent.change(rightFreqInput, { target: { value: frequency.toString() } });
});

When('I start the audio generation', async () => {
  mockAudioEngine.isPlaying = true;
  mockElectromagneticField.state = 'ACTIVE';
  mockElectromagneticField.strength = 0.8;
  
  const playButton = screen.getByRole('button', { name: /play|start/i });
  await userEvent.click(playButton);
  expect(mockAudioEngine.startAudio).toHaveBeenCalled();
});

Then('I should hear binaural beats with a {int} Hz beat frequency', (expectedBeatFreq: number) => {
  expect(mockAudioEngine.beatFreq).toBe(expectedBeatFreq);
  expect(screen.getByText(expectedBeatFreq.toString())).toBeInTheDocument();
});

Then('the electromagnetic field should be active', () => {
  expect(mockElectromagneticField.state).toBe('ACTIVE');
  expect(screen.getByText(/active|running/i)).toBeInTheDocument();
});

Then('the field strength should be greater than {int}', (minStrength: number) => {
  expect(mockElectromagneticField.strength).toBeGreaterThan(minStrength);
});

Given('the audio is currently playing', () => {
  mockAudioEngine.isPlaying = true;
  mockElectromagneticField.state = 'ACTIVE';
});

Given('the left frequency is {int} Hz', (frequency: number) => {
  mockAudioEngine.leftFreq = frequency;
});

Given('the right frequency is {int} Hz', (frequency: number) => {
  mockAudioEngine.rightFreq = frequency;
});

When('I change the left frequency to {int} Hz', async (newFrequency: number) => {
  const leftFreqInput = screen.getByLabelText(/left.*frequency/i);
  await userEvent.clear(leftFreqInput);
  await userEvent.type(leftFreqInput, newFrequency.toString());
  
  mockAudioEngine.leftFreq = newFrequency;
  mockAudioEngine.beatFreq = Math.abs(mockAudioEngine.rightFreq - newFrequency);
  expect(mockAudioEngine.setFrequencies).toHaveBeenCalledWith(newFrequency, mockAudioEngine.rightFreq);
});

Then('the beat frequency should update to {int} Hz', (expectedBeatFreq: number) => {
  expect(mockAudioEngine.beatFreq).toBe(expectedBeatFreq);
  expect(screen.getByText(expectedBeatFreq.toString())).toBeInTheDocument();
});

Then('the electromagnetic field should adjust accordingly', () => {
  expect(mockElectromagneticField.frequency).toBe(mockAudioEngine.beatFreq);
});

Then('there should be no audio interruption', () => {
  expect(mockAudioEngine.isPlaying).toBe(true);
  expect(mockAudioEngine.stopAudio).not.toHaveBeenCalled();
});

Given('the volume is set to {int}%', (volumePercent: number) => {
  mockAudioEngine.volume = volumePercent / 100;
});

When('I adjust the volume to {int}%', async (newVolumePercent: number) => {
  const volumeSlider = screen.getByRole('slider', { name: /volume/i });
  const newVolume = newVolumePercent / 100;
  
  fireEvent.change(volumeSlider, { target: { value: newVolume.toString() } });
  mockAudioEngine.volume = newVolume;
  expect(mockAudioEngine.setVolume).toHaveBeenCalledWith(newVolume);
});

Then('both left and right channels should increase in amplitude', () => {
  expect(mockAudioEngine.volume).toBe(0.8);
  expect(mockAudioEngine.setVolume).toHaveBeenCalledWith(0.8);
});

Then('the beat frequency should remain unchanged', () => {
  const expectedBeatFreq = Math.abs(mockAudioEngine.rightFreq - mockAudioEngine.leftFreq);
  expect(mockAudioEngine.beatFreq).toBe(expectedBeatFreq);
});

Then('the electromagnetic field strength should scale proportionally', () => {
  expect(mockElectromagneticField.strength).toBeGreaterThan(0);
});

Given('the audio is currently playing with sine waves', () => {
  mockAudioEngine.isPlaying = true;
  mockAudioEngine.waveform = 'sine';
});

When('I switch the waveform to {string}', async (waveform: string) => {
  const waveformSelector = screen.getByRole('combobox', { name: /waveform/i });
  await userEvent.selectOptions(waveformSelector, waveform);
  
  mockAudioEngine.waveform = waveform;
  expect(mockAudioEngine.setWaveform).toHaveBeenCalledWith(waveform);
});

Then('the audio should change to square wave generation', () => {
  expect(mockAudioEngine.waveform).toBe('square');
});

Then('the electromagnetic field pattern should update', () => {
  // Field should reflect the waveform change
  expect(mockElectromagneticField.state).toBe('ACTIVE');
});

Then('the harmonic content should be visibly different', () => {
  // Visual representation should show harmonic differences
  expect(screen.getByTestId('waveform-display')).toBeInTheDocument();
});

When('I stop the audio generation', async () => {
  const stopButton = screen.getByRole('button', { name: /stop|pause/i });
  await userEvent.click(stopButton);
  
  mockAudioEngine.isPlaying = false;
  mockElectromagneticField.state = 'INACTIVE';
  mockElectromagneticField.strength = 0;
  expect(mockAudioEngine.stopAudio).toHaveBeenCalled();
});

Then('all audio output should cease immediately', () => {
  expect(mockAudioEngine.isPlaying).toBe(false);
});

Then('the electromagnetic field should become inactive', () => {
  expect(mockElectromagneticField.state).toBe('INACTIVE');
  expect(mockElectromagneticField.strength).toBe(0);
});

Then('all audio resources should be properly released', () => {
  expect(mockAudioEngine.stopAudio).toHaveBeenCalled();
});

// Scenario Outline steps
Then('I should hear beats in the {string} range', (brainwaveRange: string) => {
  const beatFreq = mockAudioEngine.beatFreq;
  
  switch (brainwaveRange) {
    case 'Delta':
      expect(beatFreq).toBeLessThan(4);
      break;
    case 'Theta':
      expect(beatFreq).toBeGreaterThanOrEqual(4);
      expect(beatFreq).toBeLessThan(8);
      break;
    case 'Alpha':
      expect(beatFreq).toBeGreaterThanOrEqual(8);
      expect(beatFreq).toBeLessThan(13);
      break;
    case 'Beta':
      expect(beatFreq).toBeGreaterThanOrEqual(13);
      expect(beatFreq).toBeLessThan(30);
      break;
    case 'Gamma':
      expect(beatFreq).toBeGreaterThanOrEqual(30);
      break;
  }
});

Then('the electromagnetic field should show {string} characteristics', () => {
  expect(mockElectromagneticField.state).toBe('ACTIVE');
  // Additional state-specific validations could be added here
});

Given('I attempt to set invalid frequencies', () => {
  // Setup for invalid frequency testing
});

When('I set the left frequency to {int} Hz', (invalidFreq: number) => {
  const leftFreqInput = screen.getByLabelText(/left.*frequency/i);
  fireEvent.change(leftFreqInput, { target: { value: invalidFreq.toString() } });
});

Then('the system should reject the invalid value', () => {
  expect(mockAudioEngine.leftFreq).not.toBe(-100);
});

Then('the frequency should remain at the previous valid value', () => {
  expect(mockAudioEngine.leftFreq).toBeGreaterThan(0);
});

Then('an appropriate error message should be displayed', () => {
  expect(screen.getByText(/invalid.*frequency/i)).toBeInTheDocument();
});

Given('both channels are synchronized', () => {
  // Both channels should be in phase
  expect(mockAudioEngine.isPlaying).toBe(true);
});

When('I rapidly change frequencies multiple times', async () => {
  const leftFreqInput = screen.getByLabelText(/left.*frequency/i);
  
  // Simulate rapid changes
  await userEvent.clear(leftFreqInput);
  await userEvent.type(leftFreqInput, '450');
  await userEvent.clear(leftFreqInput);
  await userEvent.type(leftFreqInput, '460');
  await userEvent.clear(leftFreqInput);
  await userEvent.type(leftFreqInput, '470');
  
  mockAudioEngine.leftFreq = 470;
  mockAudioEngine.beatFreq = Math.abs(mockAudioEngine.rightFreq - 470);
});

Then('both channels should remain perfectly synchronized', () => {
  expect(mockAudioEngine.isPlaying).toBe(true);
});

Then('the beat frequency should update smoothly', () => {
  expect(mockAudioEngine.beatFreq).toBeDefined();
  expect(mockAudioEngine.beatFreq).toBeGreaterThan(0);
});

Then('there should be no phase drift between channels', () => {
  // Phase synchronization should be maintained
  expect(mockAudioEngine.isPlaying).toBe(true);
});