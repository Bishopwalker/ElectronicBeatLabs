import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BinauralTestMUI from '../BinauralTestMUI';

// Mock the audio engine hook
const mockUseBackendAudioEngine = {
  isConnected: false,
  isPlaying: false,
  currentSession: null,
  connect: jest.fn(),
  disconnect: jest.fn(),
  startSession: jest.fn(),
  stopSession: jest.fn(),
  updateSettings: jest.fn(),
  error: null as string | null,
  metrics: {
    sessionDuration: 0,
    avgBeatFrequency: 0,
    fieldStrength: 0
  }
};

jest.mock('../../hooks/useBackendAudioEngine', () => ({
  useBackendAudioEngine: () => mockUseBackendAudioEngine
}));

describe('BinauralTestMUI', () => {
  const defaultProps = {
    leftFreq: 440,
    rightFreq: 444,
    onFrequencyChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders binaural test interface', () => {
    render(<BinauralTestMUI {...defaultProps} />);
    
    expect(screen.getByText(/Binaural Test/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /test/i })).toBeInTheDocument();
  });

  test('displays frequency controls', () => {
    render(<BinauralTestMUI {...defaultProps} />);
    
    expect(screen.getByText(/LEFT EAR/i)).toBeInTheDocument();
    expect(screen.getByText(/RIGHT EAR/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('440')).toBeInTheDocument();
    expect(screen.getByDisplayValue('444')).toBeInTheDocument();
  });

  test('starts binaural test when button clicked', async () => {
    render(<BinauralTestMUI {...defaultProps} />);
    
    const startButton = screen.getByRole('button', { name: /start test/i });
    await userEvent.click(startButton);
    
    expect(mockUseBackendAudioEngine.startSession).toHaveBeenCalled();
  });

  test('updates frequencies when controls are adjusted', async () => {
    render(<BinauralTestMUI {...defaultProps} />);
    
    const leftFreqSlider = screen.getByRole('slider', { name: /left frequency/i });
    fireEvent.change(leftFreqSlider, { target: { value: '450' } });
    
    expect(mockUseBackendAudioEngine.updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        frequency_left: 450
      })
    );
  });

  test('calculates and displays beat frequency correctly', () => {
    render(<BinauralTestMUI {...defaultProps} />);
    
    const leftFreqInput = screen.getByDisplayValue('440');
    const rightFreqInput = screen.getByDisplayValue('444');
    
    expect(leftFreqInput).toBeInTheDocument();
    expect(rightFreqInput).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument(); // Beat frequency
  });

  test('shows connection status', () => {
    render(<BinauralTestMUI {...defaultProps} />);
    
    expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
    
    // Test connected state
    mockUseBackendAudioEngine.isConnected = true;
    render(<BinauralTestMUI {...defaultProps} />);
    expect(screen.getByText(/connected/i)).toBeInTheDocument();
  });

  test('displays session metrics when playing', () => {
    mockUseBackendAudioEngine.isPlaying = true;
    mockUseBackendAudioEngine.metrics = {
      sessionDuration: 120,
      avgBeatFrequency: 8.5,
      fieldStrength: 0.75
    };
    
    render(<BinauralTestMUI {...defaultProps} />);
    
    expect(screen.getByText(/2:00/)).toBeInTheDocument(); // Duration
    expect(screen.getByText('8.5')).toBeInTheDocument(); // Avg beat freq
    expect(screen.getByText('0.75')).toBeInTheDocument(); // Field strength
  });

  test('handles test presets', async () => {
    render(<BinauralTestMUI {...defaultProps} />);
    
    const presetButton = screen.getByRole('button', { name: /alpha.*test/i });
    await userEvent.click(presetButton);
    
    expect(mockUseBackendAudioEngine.updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        frequency_left: 440,
        frequency_right: 450 // 10Hz alpha beat
      })
    );
  });

  test('stops test when stop button clicked', async () => {
    mockUseBackendAudioEngine.isPlaying = true;
    render(<BinauralTestMUI {...defaultProps} />);
    
    const stopButton = screen.getByRole('button', { name: /stop test/i });
    await userEvent.click(stopButton);
    
    expect(mockUseBackendAudioEngine.stopSession).toHaveBeenCalled();
  });

  test('displays error states appropriately', () => {
    mockUseBackendAudioEngine.error = 'Failed to connect to backend';
    
    render(<BinauralTestMUI {...defaultProps} />);
    
    expect(screen.getByText(/Failed to connect to backend/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  test('validates frequency input ranges', async () => {
    render(<BinauralTestMUI {...defaultProps} />);
    
    const leftFreqInput = screen.getByDisplayValue('440');
    
    // Test invalid low frequency
    await userEvent.clear(leftFreqInput);
    await userEvent.type(leftFreqInput, '10');
    
    expect(screen.getByText(/frequency too low/i)).toBeInTheDocument();
    
    // Test invalid high frequency
    await userEvent.clear(leftFreqInput);
    await userEvent.type(leftFreqInput, '25000');
    
    expect(screen.getByText(/frequency too high/i)).toBeInTheDocument();
  });

  test('shows waveform selection options', () => {
    render(<BinauralTestMUI {...defaultProps} />);
    
    expect(screen.getByRole('combobox', { name: /waveform/i })).toBeInTheDocument();
    
    const waveformSelect = screen.getByRole('combobox', { name: /waveform/i });
    expect(waveformSelect).toContainHTML('sine');
    expect(waveformSelect).toContainHTML('square');
    expect(waveformSelect).toContainHTML('triangle');
  });

  test('updates waveform when changed', async () => {
    render(<BinauralTestMUI {...defaultProps} />);
    
    const waveformSelect = screen.getByRole('combobox', { name: /waveform/i });
    await userEvent.selectOptions(waveformSelect, 'square');
    
    expect(mockUseBackendAudioEngine.updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        waveform: 'square'
      })
    );
  });

  test('handles volume control', async () => {
    render(<BinauralTestMUI {...defaultProps} />);
    
    const volumeSlider = screen.getByRole('slider', { name: /volume/i });
    fireEvent.change(volumeSlider, { target: { value: '0.8' } });
    
    expect(mockUseBackendAudioEngine.updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        amplitude: 0.8
      })
    );
  });

  test('shows real-time frequency analysis', () => {
    mockUseBackendAudioEngine.isPlaying = true;
    
    render(<BinauralTestMUI {...defaultProps} />);
    
    expect(screen.getByTestId('frequency-analyzer')).toBeInTheDocument();
    expect(screen.getByTestId('waveform-display')).toBeInTheDocument();
  });
});