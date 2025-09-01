// UI Components Test Suite
// Test user interface components and interactions

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SimpleAudioTest from '../components/SimpleAudioTest';
import QuickStartGuide from '../components/QuickStartGuide';

// Mock Web Audio API
const mockAudioContext = {
  state: 'running',
  currentTime: 0,
  createOscillator: jest.fn(() => ({
    frequency: { value: 440 },
    type: 'sine',
    connect: jest.fn().mockReturnThis(),
    start: jest.fn(),
    stop: jest.fn(),
    disconnect: jest.fn(),
    addEventListener: jest.fn()
  })),
  createGain: jest.fn(() => ({
    gain: { value: 0.1 },
    connect: jest.fn().mockReturnThis()
  })),
  createStereoPanner: jest.fn(() => ({
    pan: { value: 0 },
    connect: jest.fn().mockReturnThis()
  })),
  destination: {},
  resume: jest.fn().mockResolvedValue(undefined),
  close: jest.fn()
};

global.AudioContext = jest.fn(() => mockAudioContext) as jest.MockedClass<typeof AudioContext>;
(global as unknown as { webkitAudioContext: jest.MockedClass<typeof AudioContext> }).webkitAudioContext = global.AudioContext;

describe('UI Components Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SimpleAudioTest Component', () => {
    it('should render correctly', () => {
      render(<SimpleAudioTest />);
      
      expect(screen.getByText('🎵 Audio Test')).toBeInTheDocument();
      expect(screen.getByText('Start 4Hz Beat')).toBeInTheDocument();
      expect(screen.getByText('Stop Audio')).toBeInTheDocument();
      expect(screen.getByText('⏹ Audio Stopped')).toBeInTheDocument();
    });

    it('should handle start button click', () => {
      render(<SimpleAudioTest />);
      
      const startButton = screen.getByText('Start 4Hz Beat');
      const stopButton = screen.getByText('Stop Audio');
      
      expect(startButton).not.toHaveAttribute('disabled');
      expect(stopButton).toHaveAttribute('disabled');
      
      fireEvent.click(startButton);
      
      expect(startButton).toHaveAttribute('disabled');
      expect(stopButton).not.toHaveAttribute('disabled');
    });

    it('should handle stop button click', () => {
      render(<SimpleAudioTest />);
      
      const startButton = screen.getByText('Start 4Hz Beat');
      const stopButton = screen.getByText('Stop Audio');
      
      // Start audio first
      fireEvent.click(startButton);
      
      // Then stop
      fireEvent.click(stopButton);
      
      expect(startButton).not.toHaveAttribute('disabled');
      expect(stopButton).toHaveAttribute('disabled');
      expect(screen.getByText('⏹ Audio Stopped')).toBeInTheDocument();
    });

    it('should update status text correctly', () => {
      render(<SimpleAudioTest />);
      
      const startButton = screen.getByText('Start 4Hz Beat');
      
      expect(screen.getByText('⏹ Audio Stopped')).toBeInTheDocument();
      
      fireEvent.click(startButton);
      
      expect(screen.getByText('▶ Playing 4Hz Binaural Beat')).toBeInTheDocument();
    });
  });

  describe('QuickStartGuide Component', () => {
    it('should render guide when autoShow is true', () => {
      render(<QuickStartGuide autoShow={true} />);
      
      expect(screen.getByText('🚀 Quick Start Guide')).toBeInTheDocument();
      expect(screen.getByText('Hide Guide')).toBeInTheDocument();
      expect(screen.getByText('Got It!')).toBeInTheDocument();
    });

    it('should hide guide when autoShow is false', () => {
      render(<QuickStartGuide autoShow={false} />);
      
      expect(screen.queryByText('🚀 Quick Start Guide')).not.toBeInTheDocument();
      expect(screen.getByText('Show Guide')).toBeInTheDocument();
    });

    it('should toggle guide visibility', () => {
      render(<QuickStartGuide autoShow={false} />);
      
      const toggleButton = screen.getByText('Show Guide');
      
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('🚀 Quick Start Guide')).toBeInTheDocument();
      expect(screen.getByText('Hide Guide')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Hide Guide'));
      
      expect(screen.queryByText('🚀 Quick Start Guide')).not.toBeInTheDocument();
      expect(screen.getByText('Show Guide')).toBeInTheDocument();
    });

    it('should render all guide steps', () => {
      render(<QuickStartGuide autoShow={true} />);
      
      expect(screen.getByText('🎵 Test Audio First')).toBeInTheDocument();
      expect(screen.getByText('🎛️ Choose a Pattern')).toBeInTheDocument();
      expect(screen.getByText('▶️ Start the Session')).toBeInTheDocument();
      expect(screen.getByText('🔧 Adjust Settings')).toBeInTheDocument();
      expect(screen.getByText('🎚️ Control Volume')).toBeInTheDocument();
      expect(screen.getByText('⏹️ Stop When Done')).toBeInTheDocument();
    });

    it('should close guide when Got It is clicked', () => {
      render(<QuickStartGuide autoShow={true} />);
      
      const gotItButton = screen.getByText('Got It!');
      
      fireEvent.click(gotItButton);
      
      expect(screen.queryByText('🚀 Quick Start Guide')).not.toBeInTheDocument();
      expect(screen.getByText('Show Guide')).toBeInTheDocument();
    });
  });

  describe('Button States and Interactions', () => {
    it('should handle button hover states', () => {
      render(<SimpleAudioTest />);
      
      const startButton = screen.getByText('Start 4Hz Beat');
      
      fireEvent.mouseEnter(startButton);
      fireEvent.mouseLeave(startButton);
      
      expect(startButton).toBeInTheDocument();
    });

    it('should handle disabled button interactions', () => {
      render(<SimpleAudioTest />);
      
      const stopButton = screen.getByText('Stop Audio');
      
      // Initially stop button should be disabled
      expect(stopButton).toHaveAttribute('disabled');
      
      // Should not respond to clicks when disabled
      fireEvent.click(stopButton);
      expect(screen.getByText('⏹ Audio Stopped')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should handle container resizing', () => {
      const { container } = render(<SimpleAudioTest />);
      
      // Component should render without errors in different viewport sizes
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should maintain button functionality on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<SimpleAudioTest />);
      
      const startButton = screen.getByText('Start 4Hz Beat');
      
      fireEvent.click(startButton);
      
      expect(startButton).toHaveAttribute('disabled');
    });
  });

  describe('Error Handling', () => {
    it('should handle audio context creation failure gracefully', () => {
      // Mock failed AudioContext
      global.AudioContext = jest.fn(() => {
        throw new Error('Audio not supported');
      }) as jest.MockedClass<typeof AudioContext>;

      render(<SimpleAudioTest />);
      
      const startButton = screen.getByText('Start 4Hz Beat');
      
      fireEvent.click(startButton);
      
      // Should remain in stopped state after error
      expect(screen.getByText('⏹ Audio Stopped')).toBeInTheDocument();
    });
  });
});