import '@testing-library/jest-dom';
import { afterEach } from '@jest/globals';
import { cleanup } from '@testing-library/react';

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock WebSocket for testing
const WS_CONNECTING = 0;
const WS_OPEN = 1;
const WS_CLOSING = 2;
const WS_CLOSED = 3;

global.WebSocket = jest.fn().mockImplementation(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: WS_CONNECTING
})) as unknown as typeof WebSocket;

// Add WebSocket constants
(global.WebSocket as any).CONNECTING = WS_CONNECTING;
(global.WebSocket as any).OPEN = WS_OPEN;
(global.WebSocket as any).CLOSING = WS_CLOSING;
(global.WebSocket as any).CLOSED = WS_CLOSED;

// Mock Audio API
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 0, setValueAtTime: jest.fn() },
    type: 'sine',
    disconnect: jest.fn(),
    addEventListener: jest.fn()
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    disconnect: jest.fn(),
    gain: { value: 1, setValueAtTime: jest.fn() }
  }),
  createStereoPanner: jest.fn().mockReturnValue({
    connect: jest.fn(),
    disconnect: jest.fn(),
    pan: { value: 0, setValueAtTime: jest.fn() }
  }),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined)
})) as unknown as typeof AudioContext;

// Also mock webkitAudioContext
(global as any).webkitAudioContext = global.AudioContext;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});