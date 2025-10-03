import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { CustomWorld } from './world';

BeforeAll(async function() {
  // Global setup before all scenarios
  console.log('🚀 Starting Electromagnetic Beat Lab E2E Tests');
  
  // Setup global test environment
  process.env.NODE_ENV = 'test';
  
  // Initialize any global mocks or services
  jest.setTimeout(30000); // 30 second timeout for E2E tests
});

Before(async function(this: CustomWorld) {
  // Setup before each scenario
  console.log(`🧪 Starting scenario: ${this.pickle?.name}`);
  
  // Reset all mocks to clean state
  jest.clearAllMocks();
  
  // Reset world state
  this.selectedPattern = null;
  this.currentMode = 'AUTO';
  this.testData = {};
  
  // Update mock states to default values
  this.updateAudioEngine({
    isPlaying: false,
    leftFreq: 440,
    rightFreq: 444,
    beat_frequency: 4,
    volume: 0.5,
    waveform: 'sine',
    error: null
  });
  
  this.updateElectromagneticField({
    strength: 0,
    frequency: 0,
    coherence: 0,
    resonance: 0,
    state: 'INACTIVE',
    stability: 0,
    phase: 0
  });
  
  // Clear localStorage
  localStorage.clear();
  
  // Reset API mocks
  (global.fetch as jest.Mock).mockClear();
  (global.WebSocket as jest.Mock).mockClear();
});

After(async function(this: CustomWorld, testCase) {
  // Cleanup after each scenario
  console.log(`✅ Completed scenario: ${this.pickle?.name} - ${testCase.result?.status}`);
  
  // Cleanup component if it was rendered
  if (this.component) {
    this.component.unmount();
    this.component = undefined;
  }
  
  // Cleanup any running timers or intervals
  jest.clearAllTimers();
  
  // Clear any pending async operations
  await new Promise(resolve => setTimeout(resolve, 0));
  
  // Reset mocks
  jest.clearAllMocks();
  
  // Log test results for debugging
  if (testCase.result?.status === 'FAILED') {
    console.error(`❌ Scenario failed: ${this.pickle?.name}`);
    if (testCase.result?.message) {
      console.error(`Error: ${testCase.result.message}`);
    }
  }
});

AfterAll(async function() {
  // Global cleanup after all scenarios
  console.log('🏁 Completed Electromagnetic Beat Lab E2E Tests');
  
  // Perform any global cleanup
  jest.restoreAllMocks();
  
  // Clear any global state
  localStorage.clear();
  
  // Final cleanup
  await new Promise(resolve => setTimeout(resolve, 100));
});