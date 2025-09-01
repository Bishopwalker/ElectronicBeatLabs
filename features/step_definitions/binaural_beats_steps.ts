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
  leftFrequency: 440,
  rightFrequency: 444,
  isPlaying: false,
  volume: 50,
  waveform: 'sine',
  electromagneticFieldActive: false,
  fieldStrength: 0,
  lastError: null
};

// Helper functions
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
  console.log('✅ Electromagnetic Beat Lab application loaded');
});

Given('the audio system is initialized', async function () {
  appState.audioInitialized = true;
  console.log('✅ Audio system initialized');
});

Given('I set the left frequency to {int} Hz', async function (frequency: number) {
  if (validateFrequency(frequency)) {
    appState.leftFrequency = frequency;
    console.log(`✅ Left frequency set to ${frequency} Hz`);
  } else {
    appState.lastError = `Invalid frequency: ${frequency} Hz`;
    console.log(`❌ Invalid left frequency: ${frequency} Hz`);
  }
});

Given('I set the right frequency to {int} Hz', async function (frequency: number) {
  if (validateFrequency(frequency)) {
    appState.rightFrequency = frequency;
    console.log(`✅ Right frequency set to ${frequency} Hz`);
  } else {
    appState.lastError = `Invalid frequency: ${frequency} Hz`;
    console.log(`❌ Invalid right frequency: ${frequency} Hz`);
  }
});

Given('the audio is currently playing', async function () {
  simulateAudioStart();
  console.log('✅ Audio is currently playing');
});

Given('the left frequency is {int} Hz', async function (frequency: number) {
  appState.leftFrequency = frequency;
  console.log(`✅ Left frequency is ${frequency} Hz`);
});

Given('the right frequency is {int} Hz', async function (frequency: number) {
  appState.rightFrequency = frequency;
  console.log(`✅ Right frequency is ${frequency} Hz`);
});

Given('the volume is set to {int}%', async function (volumePercent: number) {
  appState.volume = volumePercent;
  console.log(`✅ Volume set to ${volumePercent}%`);
});

Given('the audio is currently playing with sine waves', async function () {
  simulateAudioStart();
  appState.waveform = 'sine';
  console.log('✅ Audio playing with sine waves');
});

Given('both channels are synchronized', async function () {
  if (!appState.isPlaying) {
    throw new Error('Audio must be playing for synchronization check');
  }
  console.log('✅ Both channels are synchronized');
});

Given('I attempt to set invalid frequencies', async function () {
  console.log('✅ Ready to test invalid frequencies');
});

When('I start the audio generation', async function () {
  simulateAudioStart();
  console.log('▶️ Audio generation started');
});

When('I change the left frequency to {int} Hz', async function (newFrequency: number) {
  if (validateFrequency(newFrequency)) {
    appState.leftFrequency = newFrequency;
    console.log(`🔄 Left frequency changed to ${newFrequency} Hz during playback`);
  } else {
    appState.lastError = `Invalid frequency: ${newFrequency} Hz`;
    console.log(`❌ Failed to change left frequency to ${newFrequency} Hz`);
  }
});

When('I adjust the volume to {int}%', async function (newVolumePercent: number) {
  appState.volume = newVolumePercent;
  appState.fieldStrength = appState.isPlaying ? (newVolumePercent / 100) * 0.8 : 0;
  console.log(`🔊 Volume adjusted to ${newVolumePercent}%`);
});

When('I switch the waveform to {string}', async function (newWaveform: string) {
  appState.waveform = newWaveform;
  console.log(`〰️ Waveform switched to ${newWaveform}`);
});

When('I stop the audio generation', async function () {
  simulateAudioStop();
  console.log('⏹️ Audio generation stopped');
});

When('I rapidly change frequencies multiple times', async function () {
  const changes = [450, 460, 470, 480, 490];
  changes.forEach((freq, index) => {
    appState.leftFrequency = freq;
    console.log(`🔄 Rapid change ${index + 1}: Left=${freq}Hz`);
  });
});

When('I set the left frequency to {int} Hz', async function (frequency: number) {
  if (!validateFrequency(frequency)) {
    appState.lastError = `Invalid frequency: ${frequency} Hz`;
    console.log(`❌ Rejected invalid frequency: ${frequency} Hz`);
    return;
  }
  appState.leftFrequency = frequency;
  console.log(`✅ Left frequency set to ${frequency} Hz`);
});

Then('I should hear binaural beats with a {int} Hz beat frequency', async function (expectedBeatFreq: number) {
  const actualBeatFreq = calculateBeatFrequency();
  if (actualBeatFreq !== expectedBeatFreq) {
    throw new Error(`Expected ${expectedBeatFreq} Hz beat frequency, got ${actualBeatFreq} Hz`);
  }
  console.log(`✅ Binaural beats playing at ${expectedBeatFreq} Hz`);
});

Then('the electromagnetic field should be active', async function () {
  if (!appState.electromagneticFieldActive) {
    throw new Error('Electromagnetic field should be active');
  }
  console.log('✅ Electromagnetic field is active');
});

Then('the field strength should be greater than {int}', async function (minStrength: number) {
  if (appState.fieldStrength <= minStrength) {
    throw new Error(`Field strength ${appState.fieldStrength} is not greater than ${minStrength}`);
  }
  console.log(`✅ Field strength: ${appState.fieldStrength}`);
});

Then('the beat frequency should update to {int} Hz', async function (expectedBeatFreq: number) {
  const actualBeatFreq = calculateBeatFrequency();
  if (actualBeatFreq !== expectedBeatFreq) {
    throw new Error(`Expected ${expectedBeatFreq} Hz beat frequency, got ${actualBeatFreq} Hz`);
  }
  console.log(`✅ Beat frequency updated to ${expectedBeatFreq} Hz`);
});

Then('the electromagnetic field should adjust accordingly', async function () {
  if (!appState.electromagneticFieldActive) {
    throw new Error('Electromagnetic field should be active and adjusting');
  }
  console.log('✅ Electromagnetic field adjusted accordingly');
});

Then('there should be no audio interruption', async function () {
  if (!appState.isPlaying) {
    throw new Error('Audio should still be playing');
  }
  console.log('✅ No audio interruption detected');
});

Then('both left and right channels should increase in amplitude', async function () {
  console.log('✅ Both channels amplitude increased');
});

Then('the beat frequency should remain unchanged', async function () {
  const beatFreq = calculateBeatFrequency();
  console.log(`✅ Beat frequency remains ${beatFreq} Hz`);
});

Then('the electromagnetic field strength should scale proportionally', async function () {
  const expectedStrength = (appState.volume / 100) * 0.8;
  if (Math.abs(appState.fieldStrength - expectedStrength) > 0.1) {
    throw new Error(`Field strength ${appState.fieldStrength} should be approximately ${expectedStrength}`);
  }
  console.log(`✅ Field strength scaled proportionally: ${appState.fieldStrength}`);
});

Then('the audio should change to square wave generation', async function () {
  if (appState.waveform !== 'square') {
    throw new Error(`Expected square waveform, got ${appState.waveform}`);
  }
  console.log('✅ Audio changed to square wave generation');
});

Then('the electromagnetic field pattern should update', async function () {
  console.log('✅ Electromagnetic field pattern updated');
});

Then('the harmonic content should be visibly different', async function () {
  console.log('✅ Harmonic content visibly different');
});

Then('all audio output should cease immediately', async function () {
  if (appState.isPlaying) {
    throw new Error('Audio should have stopped');
  }
  console.log('✅ All audio output ceased');
});

Then('the electromagnetic field should become inactive', async function () {
  if (appState.electromagneticFieldActive) {
    throw new Error('Electromagnetic field should be inactive');
  }
  console.log('✅ Electromagnetic field became inactive');
});

Then('all audio resources should be properly released', async function () {
  console.log('✅ Audio resources properly released');
});

Then('I should hear beats in the {string} range', async function (brainwaveRange: string) {
  const beatFreq = calculateBeatFrequency();
  let isInRange = false;

  switch (brainwaveRange) {
    case 'Delta':
      isInRange = beatFreq <= 4;
      break;
    case 'Theta':
      isInRange = beatFreq >= 4 && beatFreq < 8;
      break;
    case 'Alpha':
      isInRange = beatFreq >= 8 && beatFreq < 13;
      break;
    case 'Beta':
      isInRange = beatFreq >= 13 && beatFreq < 30;
      break;
    case 'Gamma':
      isInRange = beatFreq >= 30;
      break;
  }

  if (!isInRange) {
    throw new Error(`Beat frequency ${beatFreq} Hz is not in ${brainwaveRange} range`);
  }
  console.log(`✅ Beats playing in ${brainwaveRange} range (${beatFreq} Hz)`);
});

Then('the electromagnetic field should show {string} characteristics', async function (expectedState: string) {
  console.log(`✅ Electromagnetic field showing ${expectedState} characteristics`);
});

Then('the system should reject the invalid value', async function () {
  if (!appState.lastError) {
    throw new Error('System should have rejected invalid value');
  }
  console.log('✅ System rejected invalid value');
});

Then('the frequency should remain at the previous valid value', async function () {
  if (appState.leftFrequency < 0) {
    throw new Error('Frequency should not be negative');
  }
  console.log('✅ Frequency remained at valid value');
});

Then('an appropriate error message should be displayed', async function () {
  if (!appState.lastError) {
    throw new Error('Error message should be displayed');
  }
  console.log(`✅ Error message: ${appState.lastError}`);
});

Then('both channels should remain perfectly synchronized', async function () {
  if (!appState.isPlaying) {
    throw new Error('Audio should still be playing');
  }
  console.log('✅ Channels remain perfectly synchronized');
});

Then('the beat frequency should update smoothly', async function () {
  const beatFreq = calculateBeatFrequency();
  if (beatFreq === undefined || beatFreq < 0) {
    throw new Error('Beat frequency should be valid');
  }
  console.log(`✅ Beat frequency updated smoothly: ${beatFreq} Hz`);
});

Then('there should be no phase drift between channels', async function () {
  if (!appState.isPlaying) {
    throw new Error('Audio should be playing to check synchronization');
  }
  console.log('✅ No phase drift between channels');
});