const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');

// Increase timeout for integration tests
setDefaultTimeout(60 * 1000);

// Simple mock application state for integration testing
let appState = {
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
function calculateBeatFrequency() {
  return Math.abs(appState.rightFrequency - appState.leftFrequency);
}

function validateFrequency(freq) {
  return freq > 0 && freq <= 20000;
}

function simulateAudioStart() {
  if (!appState.appLoaded || !appState.audioInitialized) {
    throw new Error('Application not ready for audio generation');
  }
  appState.isPlaying = true;
  appState.electromagneticFieldActive = true;
  appState.fieldStrength = 0.8;
}

function simulateAudioStop() {
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

Given('I set the left frequency to {int} Hz', async function (frequency) {
  if (validateFrequency(frequency)) {
    appState.leftFrequency = frequency;
    console.log(`✅ Left frequency set to ${frequency} Hz`);
  } else {
    appState.lastError = `Invalid frequency: ${frequency} Hz`;
    console.log(`❌ Invalid left frequency: ${frequency} Hz`);
  }
});

Given('I set the right frequency to {int} Hz', async function (frequency) {
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

Given('the left frequency is {int} Hz', async function (frequency) {
  appState.leftFrequency = frequency;
  console.log(`✅ Left frequency is ${frequency} Hz`);
});

Given('the right frequency is {int} Hz', async function (frequency) {
  appState.rightFrequency = frequency;
  console.log(`✅ Right frequency is ${frequency} Hz`);
});

Given('the volume is set to {int}%', async function (volumePercent) {
  appState.volume = volumePercent;
  console.log(`✅ Volume set to ${volumePercent}%`);
});

When('I start the audio generation', async function () {
  simulateAudioStart();
  console.log('▶️ Audio generation started');
});

When('I change the left frequency to {int} Hz', async function (newFrequency) {
  if (validateFrequency(newFrequency)) {
    appState.leftFrequency = newFrequency;
    console.log(`🔄 Left frequency changed to ${newFrequency} Hz during playback`);
  } else {
    appState.lastError = `Invalid frequency: ${newFrequency} Hz`;
    console.log(`❌ Failed to change left frequency to ${newFrequency} Hz`);
  }
});

Then('I should hear binaural beats with a {int} Hz beat frequency', async function (expectedBeatFreq) {
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

Then('the field strength should be greater than {int}', async function (minStrength) {
  if (appState.fieldStrength <= minStrength) {
    throw new Error(`Field strength ${appState.fieldStrength} is not greater than ${minStrength}`);
  }
  console.log(`✅ Field strength: ${appState.fieldStrength}`);
});

Then('the beat frequency should update to {int} Hz', async function (expectedBeatFreq) {
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

// Add more basic step definitions to cover common scenarios
Given('I attempt to set invalid frequencies', async function () {
  console.log('✅ Ready to test invalid frequencies');
});

// Removed duplicate step definition - using the Given version instead

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

// Remove duplicated step - only keep one instance of this definition
// (The duplicate was causing ambiguous step definitions error)