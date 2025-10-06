"""
Audio processing tools for the Audio Agent.

These tools implement various audio generation and analysis functions,
drawing from examples in:
- .claude/examples/binauralbeats.html
- .claude/examples/binural.js
- .claude/examples/websocket-streaming-example.js
- .claude/examples/em-field-visualization.html
"""

import asyncio
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
import logging
from scipy import signal
from scipy.fft import fft, fftfreq

logger = logging.getLogger(__name__)


async def generate_binaural_beats(
    base_frequency: float,
    beat_frequency: float,
    duration: float,
    sample_rate: int = 44100,
    amplitude: float = 0.5,
    fade_in: float = 2.0,
    fade_out: float = 2.0
) -> np.ndarray:
    """
    Generate binaural beats audio.

    Based on patterns from binauralbeats.html and binural.js examples.

    Args:
        base_frequency: Carrier frequency in Hz
        beat_frequency: Beat frequency in Hz
        duration: Duration in seconds
        sample_rate: Sample rate in Hz
        amplitude: Volume level (0-1)
        fade_in: Fade in duration in seconds
        fade_out: Fade out duration in seconds

    Returns:
        Stereo audio array with binaural beats
    """
    try:
        # Calculate frequencies for left and right channels
        left_freq = base_frequency - (beat_frequency / 2)
        right_freq = base_frequency + (beat_frequency / 2)

        # Generate time array
        t = np.linspace(0, duration, int(sample_rate * duration), False)

        # Generate sine waves for each channel
        left_channel = amplitude * np.sin(2 * np.pi * left_freq * t)
        right_channel = amplitude * np.sin(2 * np.pi * right_freq * t)

        # Apply fade in and fade out
        fade_in_samples = int(fade_in * sample_rate)
        fade_out_samples = int(fade_out * sample_rate)

        if fade_in_samples > 0:
            fade_in_curve = np.linspace(0, 1, fade_in_samples)
            left_channel[:fade_in_samples] *= fade_in_curve
            right_channel[:fade_in_samples] *= fade_in_curve

        if fade_out_samples > 0:
            fade_out_curve = np.linspace(1, 0, fade_out_samples)
            left_channel[-fade_out_samples:] *= fade_out_curve
            right_channel[-fade_out_samples:] *= fade_out_curve

        # Combine into stereo array
        stereo_audio = np.vstack([left_channel, right_channel]).T

        logger.info(f"Generated binaural beats: {base_frequency}Hz ± {beat_frequency/2}Hz for {duration}s")
        return stereo_audio

    except Exception as e:
        logger.error(f"Error generating binaural beats: {e}")
        raise


async def generate_isochronic_tones(
    frequency: float,
    pulse_rate: float,
    duration: float,
    sample_rate: int = 44100,
    duty_cycle: float = 0.5,
    amplitude: float = 0.5
) -> np.ndarray:
    """
    Generate isochronic tones (pulsed audio).

    Args:
        frequency: Tone frequency in Hz
        pulse_rate: Pulse rate in Hz
        duration: Duration in seconds
        sample_rate: Sample rate in Hz
        duty_cycle: Ratio of on-time to period (0-1)
        amplitude: Volume level (0-1)

    Returns:
        Mono audio array with isochronic tones
    """
    try:
        # Generate time array
        t = np.linspace(0, duration, int(sample_rate * duration), False)

        # Generate carrier tone
        carrier = amplitude * np.sin(2 * np.pi * frequency * t)

        # Generate pulse envelope
        pulse_period = 1.0 / pulse_rate
        pulse_envelope = np.zeros_like(t)

        for i, time in enumerate(t):
            cycle_position = (time % pulse_period) / pulse_period
            if cycle_position < duty_cycle:
                pulse_envelope[i] = 1.0

        # Apply smooth transitions to reduce clicks
        transition_samples = int(0.005 * sample_rate)  # 5ms transitions
        if transition_samples > 0:
            for i in range(1, len(pulse_envelope)):
                if pulse_envelope[i] != pulse_envelope[i-1]:
                    # Apply short ramp
                    start_idx = max(0, i - transition_samples // 2)
                    end_idx = min(len(pulse_envelope), i + transition_samples // 2)
                    if pulse_envelope[i] > pulse_envelope[i-1]:
                        # Ramp up
                        ramp = np.linspace(0, 1, end_idx - start_idx)
                    else:
                        # Ramp down
                        ramp = np.linspace(1, 0, end_idx - start_idx)
                    pulse_envelope[start_idx:end_idx] = ramp

        # Modulate carrier with pulse envelope
        isochronic_audio = carrier * pulse_envelope

        logger.info(f"Generated isochronic tones: {frequency}Hz at {pulse_rate}Hz pulse for {duration}s")
        return isochronic_audio

    except Exception as e:
        logger.error(f"Error generating isochronic tones: {e}")
        raise


async def create_em_field_audio(
    field_strength: float,
    frequency_range: Tuple[float, float],
    duration: float,
    sample_rate: int = 44100,
    modulation_frequency: float = 7.83,
    harmonics: Optional[List[float]] = None
) -> np.ndarray:
    """
    Generate audio representation of electromagnetic field patterns.

    Based on em-field-visualization.html example, creates audio that
    represents EM field characteristics using Schumann resonances.

    Args:
        field_strength: Field strength (0-10)
        frequency_range: Min and max frequencies
        duration: Duration in seconds
        sample_rate: Sample rate in Hz
        modulation_frequency: Base modulation (Schumann resonance)
        harmonics: Additional harmonic frequencies

    Returns:
        Audio array representing EM field
    """
    try:
        if harmonics is None:
            harmonics = [14.3, 20.8, 27.3, 33.8]  # Schumann harmonics

        # Generate time array
        t = np.linspace(0, duration, int(sample_rate * duration), False)

        # Initialize audio with base Schumann resonance
        audio = np.zeros_like(t)

        # Add base frequency with field strength modulation
        base_amplitude = field_strength / 10.0
        audio += base_amplitude * np.sin(2 * np.pi * modulation_frequency * t)

        # Add harmonics with decreasing amplitude
        for i, harmonic in enumerate(harmonics):
            harmonic_amplitude = base_amplitude / (i + 2)
            audio += harmonic_amplitude * np.sin(2 * np.pi * harmonic * t)

        # Add noise component to simulate field fluctuations
        noise_level = 0.05 * field_strength / 10.0
        noise = np.random.normal(0, noise_level, len(t))

        # Apply band-pass filter to noise
        nyquist = sample_rate / 2
        low = frequency_range[0] / nyquist
        high = min(frequency_range[1] / nyquist, 0.99)
        b, a = signal.butter(4, [low, high], btype='band')
        filtered_noise = signal.filtfilt(b, a, noise)

        audio += filtered_noise

        # Normalize to prevent clipping
        max_val = np.max(np.abs(audio))
        if max_val > 0:
            audio = audio / max_val * 0.8

        logger.info(f"Generated EM field audio: strength={field_strength}, freq_range={frequency_range}")
        return audio

    except Exception as e:
        logger.error(f"Error creating EM field audio: {e}")
        raise


async def analyze_frequency_spectrum(
    audio_data: np.ndarray,
    sample_rate: int = 44100,
    window_size: int = 2048
) -> Dict[str, Any]:
    """
    Analyze frequency spectrum of audio data.

    Args:
        audio_data: Audio samples
        sample_rate: Sample rate in Hz
        window_size: FFT window size

    Returns:
        Dictionary with frequency analysis results
    """
    try:
        # Handle stereo by converting to mono
        if audio_data.ndim > 1:
            audio_mono = np.mean(audio_data, axis=1)
        else:
            audio_mono = audio_data

        # Apply window function to reduce spectral leakage
        window = signal.windows.hann(min(window_size, len(audio_mono)))
        windowed_audio = audio_mono[:len(window)] * window

        # Compute FFT
        spectrum = fft(windowed_audio)
        frequencies = fftfreq(len(windowed_audio), 1/sample_rate)

        # Get positive frequencies only
        positive_freq_idx = frequencies > 0
        frequencies = frequencies[positive_freq_idx]
        magnitudes = np.abs(spectrum[positive_freq_idx])

        # Find dominant frequency
        dominant_idx = np.argmax(magnitudes)
        dominant_frequency = frequencies[dominant_idx]

        # Calculate signal-to-noise ratio
        signal_power = np.max(magnitudes) ** 2
        noise_power = np.mean(magnitudes) ** 2
        snr = 10 * np.log10(signal_power / noise_power) if noise_power > 0 else float('inf')

        # Calculate quality score based on SNR and spectral clarity
        quality_score = min(1.0, snr / 40.0)  # 40 dB SNR = perfect score

        analysis = {
            "frequencies": frequencies.tolist()[:1000],  # Limit to first 1000 frequencies
            "amplitudes": magnitudes.tolist()[:1000],
            "dominant_frequency": float(dominant_frequency),
            "signal_to_noise_ratio": float(snr),
            "quality_score": float(quality_score),
            "spectral_centroid": float(np.sum(frequencies * magnitudes) / np.sum(magnitudes)),
            "spectral_bandwidth": float(np.sqrt(np.sum((frequencies - dominant_frequency) ** 2 * magnitudes) / np.sum(magnitudes)))
        }

        logger.info(f"Frequency analysis complete: dominant={dominant_frequency:.2f}Hz, SNR={snr:.2f}dB")
        return analysis

    except Exception as e:
        logger.error(f"Error analyzing frequency spectrum: {e}")
        raise


def validate_audio_parameters(config: Any) -> bool:
    """
    Validate audio configuration parameters.

    Args:
        config: Audio configuration object

    Returns:
        True if valid, False otherwise
    """
    try:
        # Check sample rate
        valid_sample_rates = [8000, 16000, 22050, 44100, 48000, 96000, 192000]
        if hasattr(config, 'sample_rate') and config.sample_rate not in valid_sample_rates:
            logger.warning(f"Non-standard sample rate: {config.sample_rate}")

        # Check bit depth
        valid_bit_depths = [8, 16, 24, 32]
        if hasattr(config, 'bit_depth') and config.bit_depth not in valid_bit_depths:
            logger.error(f"Invalid bit depth: {config.bit_depth}")
            return False

        # Check channels
        if hasattr(config, 'channels') and config.channels not in [1, 2]:
            logger.error(f"Invalid channel count: {config.channels}")
            return False

        # Check buffer size (should be power of 2)
        if hasattr(config, 'buffer_size'):
            if config.buffer_size & (config.buffer_size - 1) != 0:
                logger.warning(f"Buffer size {config.buffer_size} is not a power of 2")

        return True

    except Exception as e:
        logger.error(f"Error validating audio parameters: {e}")
        return False


async def optimize_frequency_patterns(
    base_pattern: Any,
    target_state: str,
    engine_config: Any
) -> Any:
    """
    Optimize frequency patterns for specific mental states.

    Uses knowledge from audiokit-audioengine-reference.md and
    qt-multimedia-audioengine-reference.md for professional audio optimization.

    Args:
        base_pattern: Starting frequency pattern
        target_state: Target mental state
        engine_config: Audio engine configuration

    Returns:
        Optimized frequency pattern
    """
    try:
        from .models import FrequencyPattern, BRAINWAVE_STATES

        # Get target brainwave state
        target_brainwave = None
        for state_key, state in BRAINWAVE_STATES.items():
            if target_state.lower() in [s.lower() for s in state.associated_states]:
                target_brainwave = state
                break

        if not target_brainwave:
            logger.warning(f"Unknown target state: {target_state}, using base pattern")
            return base_pattern

        # Optimize beat frequencies for target state
        optimized_beats = []
        freq_min, freq_max = target_brainwave.frequency_range

        # Generate optimal beat frequencies within target range
        if hasattr(base_pattern, 'beat_frequencies'):
            for beat in base_pattern.beat_frequencies:
                if freq_min <= beat <= freq_max:
                    optimized_beats.append(beat)

        # Add additional frequencies if needed
        if len(optimized_beats) < 3:
            # Add frequencies at golden ratio intervals
            golden_ratio = 1.618
            freq = freq_min
            while freq <= freq_max and len(optimized_beats) < 5:
                if freq not in optimized_beats:
                    optimized_beats.append(round(freq, 2))
                freq *= golden_ratio

        # Create optimized pattern
        optimized = FrequencyPattern(
            name=f"Optimized {target_state}",
            base_frequency=base_pattern.base_frequency if hasattr(base_pattern, 'base_frequency') else 150,
            beat_frequencies=optimized_beats,
            description=f"Optimized for {target_brainwave.description}",
            tags=[target_state, target_brainwave.name.lower(), "optimized"],
            effectiveness_score=0.9
        )

        logger.info(f"Optimized pattern for {target_state}: beats={optimized_beats}")
        return optimized

    except Exception as e:
        logger.error(f"Error optimizing frequency patterns: {e}")
        return base_pattern


async def generate_pink_noise(
    duration: float,
    sample_rate: int = 44100,
    amplitude: float = 0.3
) -> np.ndarray:
    """
    Generate pink noise (1/f noise) for background ambience.

    Pink noise has equal energy per octave and is often used
    for relaxation and sleep.

    Args:
        duration: Duration in seconds
        sample_rate: Sample rate in Hz
        amplitude: Volume level (0-1)

    Returns:
        Pink noise audio array
    """
    try:
        samples = int(duration * sample_rate)

        # Generate white noise
        white = np.random.randn(samples)

        # Apply pink noise filter (1/f spectrum)
        # Using Voss-McCartney algorithm
        num_octaves = 16
        pink = np.zeros(samples)

        for octave in range(num_octaves):
            frequency = 2 ** octave
            if frequency > samples:
                break

            # Downsample and upsample to create band-limited noise
            downsampled = white[::frequency]
            upsampled = np.repeat(downsampled, frequency)[:samples]
            pink += upsampled / frequency

        # Normalize
        pink = pink / np.max(np.abs(pink)) * amplitude

        logger.info(f"Generated {duration}s of pink noise")
        return pink

    except Exception as e:
        logger.error(f"Error generating pink noise: {e}")
        raise


async def apply_reverb(
    audio_data: np.ndarray,
    room_size: float = 0.5,
    damping: float = 0.5,
    wet_level: float = 0.3,
    sample_rate: int = 44100
) -> np.ndarray:
    """
    Apply reverb effect to audio.

    Based on Freeverb algorithm for natural room acoustics.

    Args:
        audio_data: Input audio
        room_size: Room size (0-1)
        damping: High frequency damping (0-1)
        wet_level: Wet/dry mix (0-1)
        sample_rate: Sample rate in Hz

    Returns:
        Audio with reverb applied
    """
    try:
        # Simple reverb using comb filters and all-pass filters
        delay_times = [0.037, 0.043, 0.051, 0.067]  # in seconds
        reverb = np.zeros_like(audio_data)

        for delay_time in delay_times:
            delay_samples = int(delay_time * sample_rate * room_size)
            if delay_samples < len(audio_data):
                # Create delayed version
                delayed = np.pad(audio_data, (delay_samples, 0), mode='constant')[:-delay_samples]
                # Apply damping
                delayed *= (1 - damping)
                # Add to reverb signal
                reverb += delayed / len(delay_times)

        # Mix wet and dry signals
        output = audio_data * (1 - wet_level) + reverb * wet_level

        logger.info(f"Applied reverb: room_size={room_size}, damping={damping}, wet={wet_level}")
        return output

    except Exception as e:
        logger.error(f"Error applying reverb: {e}")
        raise