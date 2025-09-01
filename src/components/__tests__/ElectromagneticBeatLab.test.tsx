import { render, screen } from '@testing-library/react';
import ElectromagneticBeatLab from '../ElectromagneticBeatLab';

// Mock hooks
jest.mock('../../hooks/useAudioEngine', () => ({
  useAudioEngine: () => ({
    isPlaying: false,
    startAudio: jest.fn(),
    stopAudio: jest.fn(),
    volume: 0.5,
    setVolume: jest.fn(),
    error: null
  })
}));

jest.mock('../../hooks/use8DPatterns', () => ({
  use8DPatterns: () => ({
    currentPattern: null,
    startPattern: jest.fn(),
    stopPattern: jest.fn(),
    setPatternSettings: jest.fn()
  })
}));

// Mock components that might cause issues in testing
jest.mock('../StarField', () => {
  return function StarField() {
    return <div data-testid="star-field">StarField Component</div>;
  };
});

jest.mock('../SpatialVisualizer', () => {
  return function SpatialVisualizer() {
    return <div data-testid="spatial-visualizer">Spatial Visualizer</div>;
  };
});

describe('ElectromagneticBeatLab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<ElectromagneticBeatLab />);
    expect(screen.getByTestId('star-field')).toBeInTheDocument();
  });

  test('displays the main title', () => {
    render(<ElectromagneticBeatLab />);
    expect(screen.getByText(/Electromagnetic Beat Lab/i)).toBeInTheDocument();
  });

  test('renders with initial pattern', () => {
    render(<ElectromagneticBeatLab initialPattern="alpha-wave" />);
    expect(screen.getByTestId('star-field')).toBeInTheDocument();
  });

  test('renders with autoStart enabled', () => {
    render(<ElectromagneticBeatLab autoStart={true} />);
    expect(screen.getByText(/Electromagnetic Beat Lab/i)).toBeInTheDocument();
  });

  test('renders with fullscreen enabled', () => {
    render(<ElectromagneticBeatLab fullscreen={true} />);
    expect(screen.getByText(/Electromagnetic Beat Lab/i)).toBeInTheDocument();
  });
});