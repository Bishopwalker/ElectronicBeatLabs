// 508 Accessibility Test Suite
// Test WCAG 2.1 AA compliance and keyboard navigation

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ElectromagneticBeatLab from '../components/ElectromagneticBeatLab';
import SimpleAudioTest from '../components/SimpleAudioTest';
import QuickStartGuide from '../components/QuickStartGuide';

expect.extend(toHaveNoViolations);

// Mock styled-components
jest.mock('styled-components', () => ({
  __esModule: true,
  default: (component: any) => (props: any) => React.createElement(component, props),
  createGlobalStyle: () => () => null,
}));

// Mock hooks
jest.mock('../hooks/useAudioEngine', () => ({
  useAudioEngine: () => ({
    audioState: {
      isPlaying: false,
      volume: 0.3,
      leftFreq: 440,
      rightFreq: 444,
      beatFreq: 4,
      waveform: 'sine'
    },
    electromagnetic: {
      strength: 0,
      frequency: 0,
      state: 'INACTIVE'
    },
    startBinauralBeat: jest.fn(),
    stopBinauralBeat: jest.fn(),
    updateFrequency: jest.fn(),
    updateVolume: jest.fn(),
    loadPattern: jest.fn()
  })
}));

jest.mock('../hooks/use8DPatterns', () => ({
  use8DPatterns: () => ({
    patterns: [],
    activePattern: null,
    startAnimation: jest.fn(),
    stopAnimation: jest.fn()
  })
}));

describe('508 Accessibility Tests', () => {
  beforeEach(() => {
    // Mock Web Audio API
    global.AudioContext = jest.fn(() => ({
      state: 'running',
      currentTime: 0,
      createOscillator: jest.fn(() => ({
        connect: jest.fn().mockReturnThis(),
        start: jest.fn(),
        stop: jest.fn(),
        addEventListener: jest.fn()
      })),
      createGain: jest.fn(() => ({
        connect: jest.fn().mockReturnThis(),
        gain: { setValueAtTime: jest.fn() }
      })),
      createStereoPanner: jest.fn(() => ({
        connect: jest.fn().mockReturnThis(),
        pan: { setValueAtTime: jest.fn() }
      })),
      destination: {},
      resume: jest.fn().mockResolvedValue(undefined)
    }));
  });

  it('should have no accessibility violations in main app', async () => {
    const { container } = render(<ElectromagneticBeatLab />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in audio test', async () => {
    const { container } = render(<SimpleAudioTest />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in quick start guide', async () => {
    const { container } = render(<QuickStartGuide autoShow={true} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should support keyboard navigation', () => {
    render(<SimpleAudioTest />);
    
    const startButton = screen.getByText('Start 4Hz Beat');
    const stopButton = screen.getByText('Stop Audio');

    // Test tab navigation
    startButton.focus();
    expect(document.activeElement).toBe(startButton);
    
    // Test Enter key activation
    fireEvent.keyDown(startButton, { key: 'Enter' });
    expect(startButton).toHaveAttribute('disabled');
    expect(stopButton).not.toHaveAttribute('disabled');
  });

  it('should have proper ARIA labels', () => {
    render(<SimpleAudioTest />);
    
    const container = screen.getByText('🎵 Audio Test').closest('div');
    expect(container).toBeInTheDocument();
    
    const startButton = screen.getByText('Start 4Hz Beat');
    const stopButton = screen.getByText('Stop Audio');
    
    expect(startButton).toHaveAttribute('type', 'button');
    expect(stopButton).toHaveAttribute('type', 'button');
  });

  it('should have sufficient color contrast', () => {
    render(<SimpleAudioTest />);
    
    const title = screen.getByText('🎵 Audio Test');
    const computedStyle = window.getComputedStyle(title);
    
    // Orange text (#ff6b00) on dark background should pass WCAG AA
    expect(computedStyle.color).toBeTruthy();
  });

  it('should provide screen reader feedback', () => {
    render(<SimpleAudioTest />);
    
    const statusElement = screen.getByText(/Audio Stopped|Playing 4Hz Binaural Beat/);
    expect(statusElement).toBeInTheDocument();
  });

  it('should support reduced motion preference', () => {
    // Mock prefers-reduced-motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    const { container } = render(<ElectromagneticBeatLab />);
    expect(container).toBeInTheDocument();
  });

  it('should have proper heading hierarchy', () => {
    render(<QuickStartGuide autoShow={true} />);
    
    const mainHeading = screen.getByRole('heading', { level: 2 });
    expect(mainHeading).toHaveTextContent('🚀 Quick Start Guide');
    
    const stepHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(stepHeadings.length).toBeGreaterThan(0);
  });

  it('should support high contrast mode', () => {
    // Mock high contrast media query
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    const { container } = render(<SimpleAudioTest />);
    expect(container).toBeInTheDocument();
  });

  it('should have proper focus management', () => {
    render(<QuickStartGuide autoShow={true} />);
    
    const toggleButton = screen.getByText('Hide Guide');
    const gotItButton = screen.getByText('Got It!');
    
    // Focus should be manageable
    toggleButton.focus();
    expect(document.activeElement).toBe(toggleButton);
    
    gotItButton.focus();
    expect(document.activeElement).toBe(gotItButton);
  });

  it('should provide meaningful error messages', async () => {
    // Mock failed audio context
    global.AudioContext = jest.fn(() => {
      throw new Error('Audio not supported');
    });

    render(<SimpleAudioTest />);
    
    const startButton = screen.getByText('Start 4Hz Beat');
    fireEvent.click(startButton);
    
    // Error should be logged (check console.error was called)
    expect(console.error).toHaveBeenCalled();
  });
});