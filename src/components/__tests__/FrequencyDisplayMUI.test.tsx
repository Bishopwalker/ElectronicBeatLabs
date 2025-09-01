import { render, screen, fireEvent } from '@testing-library/react';
import FrequencyDisplayMUI from '../FrequencyDisplayMUI';

describe('FrequencyDisplayMUI', () => {
  const defaultProps = {
    frequency: 440,
    beatFreq: 4,
    target: 444,
    range: 'alpha' as const,
    onChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<FrequencyDisplayMUI {...defaultProps} />);
    expect(screen.getByText(/Frequency Control/i)).toBeInTheDocument();
  });

  test('displays frequency value correctly', () => {
    render(<FrequencyDisplayMUI {...defaultProps} />);
    expect(screen.getByText('440.0 Hz')).toBeInTheDocument();
  });

  test('displays beat frequency correctly', () => {
    render(<FrequencyDisplayMUI {...defaultProps} />);
    expect(screen.getByText('Beat: 4.0 Hz')).toBeInTheDocument();
  });

  test('displays target frequency correctly', () => {
    render(<FrequencyDisplayMUI {...defaultProps} />);
    expect(screen.getByText('Target: 444.0 Hz')).toBeInTheDocument();
  });

  test('displays range label', () => {
    render(<FrequencyDisplayMUI {...defaultProps} />);
    expect(screen.getByText('Alpha (8-13 Hz)')).toBeInTheDocument();
  });

  test('calls onChange when frequency is adjusted via slider', async () => {
    const onChange = jest.fn();
    render(<FrequencyDisplayMUI {...defaultProps} onChange={onChange} />);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '450' } });
    
    expect(onChange).toHaveBeenCalledWith(450);
  });

  test('displays correct range labels for different ranges', () => {
    const { rerender } = render(
      <FrequencyDisplayMUI {...defaultProps} range="delta" />
    );
    expect(screen.getByText('Delta (0.5-4 Hz)')).toBeInTheDocument();

    rerender(<FrequencyDisplayMUI {...defaultProps} range="theta" />);
    expect(screen.getByText('Theta (4-8 Hz)')).toBeInTheDocument();

    rerender(<FrequencyDisplayMUI {...defaultProps} range="beta" />);
    expect(screen.getByText('Beta (13-30 Hz)')).toBeInTheDocument();

    rerender(<FrequencyDisplayMUI {...defaultProps} range="gamma" />);
    expect(screen.getByText('Gamma (30+ Hz)')).toBeInTheDocument();
  });
});