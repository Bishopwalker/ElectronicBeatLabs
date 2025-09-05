# Electromagnetic Beat Lab - Testing Guide

This document describes the comprehensive test suite for the Electromagnetic Beat Lab application using Jest (unit tests) and Cucumber (BDD/integration tests).

## Overview

The test suite covers:
- **Unit Tests**: Individual components, hooks, and utility functions
- **Integration Tests**: Component interactions and data flow
- **End-to-End Tests**: Complete user workflows and feature scenarios
- **Backend Tests**: Python API and audio engine functionality

## Test Structure

```
├── src/
│   ├── components/
│   │   └── __tests__/           # Component unit tests
│   └── hooks/
│       └── __tests__/           # Hook unit tests
├── features/                    # Cucumber feature files
│   ├── *.feature              # BDD test scenarios
│   ├── step_definitions/       # Step implementations
│   └── support/               # Test utilities
├── jest.config.js              # Jest configuration
├── cucumber.js                # Cucumber configuration
└── backend/tests/             # Python backend tests
```

## Running Tests

### Unit Tests (Jest)

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD
npm run test:ci
```

### Integration Tests (Cucumber)

```bash
# Run all BDD scenarios
npm run test:e2e

# Run specific feature
npm run cucumber -- features/binaural_beats_generation.feature

# Run with specific tags
npm run cucumber -- --tags "@smoke"
```

### Backend Tests

```bash
# Run Python backend tests
npm run backend:test

# Or directly with pytest
cd backend && python -m pytest
```

### Complete Test Suite

```bash
# Run all tests (frontend + backend)
npm run test:full
```

## Test Categories

### 1. Unit Tests

#### Component Tests
- **ElectromagneticBeatLab.test.tsx**: Main application component
- **FrequencyDisplayMUI.test.tsx**: Frequency display and controls
- **PatternSelectorMUI.test.tsx**: Pattern selection interface
- **BinauralGeneratorMUI.test.tsx**: Binaural beat testing component

#### Hook Tests
- **useAudioEngine.test.ts**: Audio generation and management
- **useBackendAudioEngine.test.ts**: Backend communication
- **useWebSocket.test.ts**: Real-time data streaming

### 2. Integration Tests (Cucumber BDD)

#### Core Features
- **binaural_beats_generation.feature**: Audio generation workflows
- **pattern_selection_and_management.feature**: Pattern-based functionality
- **electromagnetic_field_visualization.feature**: Field visualization and monitoring

### 3. Test Scenarios Coverage

#### Audio Engine Testing
- ✅ Basic binaural beat generation
- ✅ Frequency adjustment during playback
- ✅ Volume control functionality
- ✅ Waveform switching
- ✅ Clean audio start/stop cycles
- ✅ Error handling for invalid inputs
- ✅ Resource cleanup and memory management

#### Pattern System Testing
- ✅ Pattern library loading
- ✅ Pattern selection and application
- ✅ Mode switching (AUTO/MANUAL/SYNC/FLOW)
- ✅ Custom pattern creation and persistence
- ✅ Pattern categorization and filtering
- ✅ Backend synchronization

#### Electromagnetic Field Testing
- ✅ Real-time field visualization
- ✅ Field strength calculations
- ✅ Coherence and resonance monitoring
- ✅ Spatial field distribution
- ✅ Performance under load

#### User Interface Testing
- ✅ Component rendering and interaction
- ✅ Form validation and error handling
- ✅ Accessibility compliance
- ✅ Responsive design behavior
- ✅ Keyboard navigation support

## Test Configuration

### Jest Setup

```javascript
// jest.config.js
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts'
  ]
};
```

### Cucumber Configuration

```javascript
// cucumber.js
export default {
  default: {
    paths: ['features/**/*.feature'],
    require: ['features/step_definitions/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['@cucumber/pretty-formatter']
  }
};
```

## Mock Strategy

### Audio API Mocking
- Mock Web Audio API (AudioContext, OscillatorNode, GainNode)
- Mock real-time audio processing
- Simulate audio hardware interactions

### WebSocket Mocking
- Mock real-time communication with backend
- Simulate connection states and data streaming
- Test reconnection logic

### Backend API Mocking
- Mock REST API endpoints
- Simulate various response scenarios
- Test error handling and retry logic

## Test Data

### Sample Patterns
```javascript
{
  id: 'focus',
  name: 'Focus Enhancement',
  frequency: 40,
  duration: 1800,
  category: 'focus'
}
```

### Sample Audio States
```javascript
{
  isPlaying: false,
  leftFreq: 440,
  rightFreq: 444,
  beatFreq: 4,
  volume: 0.5
}
```

## Coverage Goals

- **Unit Test Coverage**: > 90%
- **Integration Test Coverage**: All major user workflows
- **Backend Test Coverage**: > 85%
- **E2E Scenario Coverage**: All critical features

## Continuous Integration

### GitHub Actions
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:ci
      - name: Run E2E tests
        run: npm run test:e2e
```

## Debugging Tests

### Jest Debugging
```bash
# Run specific test file
npm test -- --testPathPattern=FrequencyDisplay

# Run with verbose output
npm test -- --verbose

# Run single test case
npm test -- --testNamePattern="should update frequency"
```

### Cucumber Debugging
```bash
# Run with debug output
npm run cucumber -- --format json:reports/debug.json

# Run specific scenario
npm run cucumber -- --name "Generate basic binaural beats"
```

## Performance Testing

### Load Testing
- Multiple concurrent audio streams
- High-frequency pattern switching
- Extended session duration testing

### Memory Testing
- Audio resource cleanup verification
- WebSocket connection management
- Component unmounting behavior

## Accessibility Testing

### Screen Reader Testing
- ARIA label verification
- Keyboard navigation paths
- Focus management testing

### Visual Testing
- Color contrast verification
- Responsive layout testing
- Animation performance testing

## Best Practices

### Test Writing
1. Use descriptive test names
2. Follow AAA pattern (Arrange, Act, Assert)
3. Mock external dependencies
4. Test both happy path and error cases
5. Keep tests isolated and independent

### BDD Scenarios
1. Write scenarios from user perspective
2. Use ubiquitous language
3. Focus on behavior, not implementation
4. Keep scenarios concise and focused
5. Use scenario outlines for data-driven tests

### Maintenance
1. Update tests with feature changes
2. Refactor tests alongside code
3. Monitor test performance
4. Review and update test data regularly
5. Keep documentation current

## Reporting

### Coverage Reports
- HTML coverage reports generated in `coverage/`
- JSON reports for CI/CD integration
- Coverage badges for repository

### Test Results
- JUnit XML for CI/CD integration
- HTML reports for manual review
- Performance metrics tracking

## Tools and Libraries

### Testing Frameworks
- **Jest**: Unit testing framework
- **@testing-library/react**: React component testing utilities
- **@cucumber/cucumber**: BDD testing framework
- **@testing-library/user-event**: User interaction simulation

### Mocking Libraries
- **Jest mocks**: Built-in mocking capabilities
- **MSW**: API mocking for integration tests
- **Sinon.js**: Advanced mocking and spying

### Utilities
- **ts-jest**: TypeScript support for Jest
- **jsdom**: DOM environment simulation
- **@testing-library/jest-dom**: DOM assertion utilities

---

For questions about testing or to report issues with the test suite, please refer to the main project documentation or create an issue in the project repository.