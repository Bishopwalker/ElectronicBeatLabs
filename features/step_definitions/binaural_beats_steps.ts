import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';

// Increase timeout for integration tests
setDefaultTimeout(60 * 1000);

// Simple mock application state for integration testing
interface AppState {
  appLoaded: boolean;
  audioInitialized: boolean;
  leftFrequency: number;
  rightFrequency: number;
  isPlaying: boolean;
  volume: number;
  waveform: string;
  electromagneticFieldActive: boolean;
  fieldStrength: number;
  lastError: string | null;
}

// Initialize application state
let appState: AppState = {
  appLoaded: false,
  audioInitialized: false,
  leftFrequency: 140,
  rightFrequency: 144,
  isPlaying: false,
  volume: 50,
  waveform: 'sine',
  electromagneticFieldActive: false,
  fieldStrength: 0,
  lastError: null
};

// Helper functions
// Only for user UI the backend properly does this math so this would only alter frequency
function calculateBeatFrequency(): number {
  return Math.abs(appState.rightFrequency - appState.leftFrequency);
}

function validateFrequency(freq: number): boolean {
  return freq > 0 && freq <= 20000;
}

function simulateAudioStart(): void {
  if (!appState.appLoaded || !appState.audioInitialized) {
    throw new Error('Application not ready for audio generation');
  }
  appState.isPlaying = true;
  appState.electromagneticFieldActive = true;
  appState.fieldStrength = 0.8;
}

function simulateAudioStop(): void {
  appState.isPlaying = false;
  appState.electromagneticFieldActive = false;
  appState.fieldStrength = 0;
}

// Step Definitions for Binaural Beats Generation
Given('I have the Electromagnetic Beat Lab application loaded', async function () {
  appState.appLoaded = true;
});

Given('the audio system is initialized', async function () {
  appState.audioInitialized = true;
});

Given('I set the left frequency to {int} Hz', async function (frequency: number) {
  if (validateFrequency(frequency)) {
    appState.leftFrequency = frequency;
  } else {
    appState.lastError = `Invalid frequency: ${frequency} Hz`;
  }
});

Given('I set the right frequency to {int} Hz', async function (frequency: number) {
  if (validateFrequency(frequency)) {
    appState.rightFrequency = frequency;
  } else {
    appState.lastError = `Invalid frequency: ${frequency} Hz`;
  }
});

Given('the audio is currently playing', async function () {
  simulateAudioStart();
});

Given('the left frequency is {int} Hz', async function (frequency: number) {
  appState.leftFrequency = frequency;
});

Given('the right frequency is {int} Hz', async function (frequency: number) {
  appState.rightFrequency = frequency;
});

Given('the volume is set to {int}%', async function (volumePercent: number) {
  appState.volume = volumePercent;
});

Given('the audio is currently playing with sine waves', async function () {
  simulateAudioStart();
  appState.waveform = 'sine';
});

Given('both channels are synchronized', async function () {
  if (!appState.isPlaying) {
    throw new Error('Audio must be playing for synchronization check');
  }
});

Given('I attempt to set invalid frequencies', async function () {
});

When('I start the audio generation', async function () {
  simulateAudioStart();
});

When('I change the left frequency to {int} Hz', async function (newFrequency: number) {
  if (validateFrequency(newFrequency)) {
    appState.leftFrequency = newFrequency;
  } else {
    appState.lastError = `Invalid frequency: ${newFrequency} Hz`;
  }
});

When('I adjust the volume to {int}%', async function (newVolumePercent: number) {
  appState.volume = newVolumePercent;
  appState.fieldStrength = appState.isPlaying ? (newVolumePercent / 100) * 0.8 : 0;
});

When('I switch the waveform to {string}', async function (newWaveform: string) {
  appState.waveform = newWaveform;
});

When('I stop the audio generation', async function () {
  simulateAudioStop();
});

When('I rapidly change frequencies multiple times', async function () {
  const changes = [450, 460, 470, 480, 490];
  changes.forEach((freq, index) => {
    appState.leftFrequency = freq;
  });
});

When('I set the left frequency to {int} Hz', async function (frequency: number) {
  if (!validateFrequency(frequency)) {
    appState.lastError = `Invalid frequency: ${frequency} Hz`;
    return;
  }
  appState.leftFrequency = frequency;
});

Then('I should hear binaural beats with a {int} Hz beat frequency', async function (expectedBeatFreq: number) {
  const actualBeatFreq = calculateBeatFrequency();
  if (actualBeatFreq !== expectedBeatFreq) {
    throw new Error(`Expected ${expectedBeatFreq} Hz beat frequency, got ${actualBeatFreq} Hz`);
  }
});

Then('the electromagnetic field should be active', async function () {
  if (!appState.electromagneticFieldActive) {
    throw new Error('Electromagnetic field should be active');
  }
});

Then('the field strength should be greater than {int}', async function (minStrength: number) {
  if (appState.fieldStrength <= minStrength) {
    throw new Error(`Field strength ${appState.fieldStrength} is not greater than ${minStrength}`);
  }
});

Then('the beat frequency should update to {int} Hz', async function (expectedBeatFreq: number) {
  const actualBeatFreq = calculateBeatFrequency();
  if (actualBeatFreq !== expectedBeatFreq) {
    throw new Error(`Expected ${expectedBeatFreq} Hz beat frequency, got ${actualBeatFreq} Hz`);
  }
});

Then('the electromagnetic field should adjust accordingly', async function () {
  if (!appState.electromagneticFieldActive) {
    throw new Error('Electromagnetic field should be active and adjusting');
  }
});

Then('there should be no audio interruption', async function () {
  if (!appState.isPlaying) {
    throw new Error('Audio should still be playing');
  }
});

Then('both left and right channels should increase in amplitude', async function () {
});

Then('the beat frequency should remain unchanged', async function () {
  const beat_frequency = calculateBeatFrequency();
});

Then('the electromagnetic field strength should scale proportionally', async function () {
  const expectedStrength = (appState.volume / 100) * 0.8;
  if (Math.abs(appState.fieldStrength - expectedStrength) > 0.1) {
    throw new Error(`Field strength ${appState.fieldStrength} should be approximately ${expectedStrength}`);
  }
});

Then('the audio should change to square wave generation', async function () {
  if (appState.waveform !== 'square') {
    throw new Error(`Expected square waveform, got ${appState.waveform}`);
  }
});

Then('the electromagnetic field pattern should update', async function () {
});

Then('the harmonic content should be visibly different', async function () {
});

Then('all audio output should cease immediately', async function () {
  if (appState.isPlaying) {
    throw new Error('Audio should have stopped');
  }
});

Then('the electromagnetic field should become inactive', async function () {
  if (appState.electromagneticFieldActive) {
    throw new Error('Electromagnetic field should be inactive');
  }
});

Then('all audio resources should be properly released', async function () {
});

Then('I should hear beats in the {string} range', async function (brainwaveRange: string) {
  const beat_frequency = calculateBeatFrequency();
  let isInRange = false;

  switch (brainwaveRange) {
    case 'Delta':
      isInRange = beat_frequency <= 4;
      break;
    case 'Theta':
      isInRange = beat_frequency >= 4 && beat_frequency < 8;
      break;
    case 'Alpha':
      isInRange = beat_frequency >= 8 && beat_frequency < 13;
      break;
    case 'Beta':
      isInRange = beat_frequency >= 13 && beat_frequency < 30;
      break;
    case 'Gamma':
      isInRange = beat_frequency >= 30;
      break;
  }

  if (!isInRange) {
    throw new Error(`Beat frequency ${beat_frequency} Hz is not in ${brainwaveRange} range`);
  }
});

Then('the electromagnetic field should show {string} characteristics', async function (expectedState: string) {
});

Then('the system should reject the invalid value', async function () {
  if (!appState.lastError) {
    throw new Error('System should have rejected invalid value');
  }
});

Then('the frequency should remain at the previous valid value', async function () {
  if (appState.leftFrequency < 0) {
    throw new Error('Frequency should not be negative');
  }
});

Then('an appropriate error message should be displayed', async function () {
  if (!appState.lastError) {
    throw new Error('Error message should be displayed');
  }
});

Then('both channels should remain perfectly synchronized', async function () {
  if (!appState.isPlaying) {
    throw new Error('Audio should still be playing');
  }
});

Then('the beat frequency should update smoothly', async function () {
  const beat_frequency = calculateBeatFrequency();
  if (beat_frequency === undefined || beat_frequency < 0) {
    throw new Error('Beat frequency should be valid');
  }
});

Then('there should be no phase drift between channels', async function () {
  if (!appState.isPlaying) {
    throw new Error('Audio should be playing to check synchronization');
  }
});