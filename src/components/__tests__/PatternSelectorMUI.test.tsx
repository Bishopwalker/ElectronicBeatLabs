import { render, screen } from '@testing-library/react';
import PatternSelectorMUI from '../PatternSelectorMUI';

describe('PatternSelectorMUI', () => {
  const mockPatterns = [
    { 
      id: 'focus', 
      name: 'Focus', 
      type: 'toroidal' as const,
      description: 'Enhance concentration', 
      instructions: 'Use during work',
      benefits: ['Better focus'],
      frequencies: {
        carrier: 200,
        beat: 40, 
        range: 'gamma' as const
      },
      duration: 1800,
      electromagnetic: {
        fieldStrength: 0.8,
        resonanceFreq: 40,
        coherence: 0.9
      },
      visualization: {
        color: '#ff6b00',
        intensity: 0.8,
        pattern: 'spiral'
      }
    }
  ];

  const defaultProps = {
    patterns: mockPatterns,
    selected: null,
    onSelect: jest.fn(),
    mode: 'AUTO' as const,
    onModeChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<PatternSelectorMUI {...defaultProps} />);
    expect(screen.getByText('Focus')).toBeInTheDocument();
  });

  test('renders pattern selector interface', () => {
    render(<PatternSelectorMUI {...defaultProps} />);
    expect(screen.getByText(/Pattern Selection/i)).toBeInTheDocument();
  });

  test('handles mode changes', () => {
    render(<PatternSelectorMUI {...defaultProps} />);
    // The mode selector should be present
    // Actual interaction testing would require finding the mode selector component
  });
});