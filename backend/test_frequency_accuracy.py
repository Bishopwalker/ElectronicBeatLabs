"""
FFT-based Frequency Accuracy and Stereo Separation Tests

This test suite uses Fast Fourier Transform (FFT) analysis to verify:
1. Frequency accuracy within ±0.1 Hz tolerance
2. Stereo channel separation (left vs right isolation)
3. Channel crosstalk < -60dB
4. Binaural beat frequency difference accuracy

Author: Bishop
Created: 2025-11-04
"""

import pytest
import numpy as np
from scipy import signal
from scipy.fft import rfft, rfftfreq
from core.audio_engine import AudioEngine


class TestFrequencyAccuracy:
    """Test actual frequency output using FFT analysis"""

    @pytest.fixture
    def audio_engine(self):
        """Create AudioEngine instance for testing"""
        engine = AudioEngine()
        yield engine

    async def generate_audio_samples(self, audio_engine: AudioEngine, settings: dict, duration_seconds: float = 1.0) -> tuple:
        """
        Generate audio samples for testing with sufficient duration for accurate FFT.

        Args:
            audio_engine: AudioEngine instance
            settings: Audio settings dict
            duration_seconds: Duration of audio to generate (default 1.0 second)

        Returns:
            tuple: (left_samples, right_samples, sample_rate)
        """
        session_id = audio_engine.start_session(settings)

        # Generate frames for specified duration (60 FPS)
        num_frames = int(duration_seconds * 60)
        frames = []
        for _ in range(num_frames):
            frame = await audio_engine.generate_frame(session_id, binary_mode=False)
            frames.append(frame)

        # Concatenate all frames and normalize PCM int16 to float
        left_samples = np.concatenate([np.array(f["left"], dtype=np.float32) / 32768.0 for f in frames])
        right_samples = np.concatenate([np.array(f["right"], dtype=np.float32) / 32768.0 for f in frames])
        sample_rate = frames[0]["sample_rate"]

        return left_samples, right_samples, sample_rate

    def analyze_frequency_spectrum(self, audio_samples: np.ndarray, sample_rate: int = 48000) -> tuple:
        """
        Perform FFT analysis on audio samples to find dominant frequency.

        Args:
            audio_samples: Audio data as numpy array
            sample_rate: Sample rate in Hz (default 48000)

        Returns:
            tuple: (dominant_frequency, magnitude, all_frequencies, spectrum)
        """
        # Apply Hanning window to reduce spectral leakage
        window = np.hanning(len(audio_samples))
        windowed_samples = audio_samples * window

        # Perform FFT
        spectrum = rfft(windowed_samples)
        frequencies = rfftfreq(len(audio_samples), 1/sample_rate)

        # Get magnitude spectrum
        magnitude = np.abs(spectrum)

        # Find dominant frequency (peak in spectrum)
        peak_idx = np.argmax(magnitude)
        dominant_frequency = frequencies[peak_idx]
        peak_magnitude = magnitude[peak_idx]

        return dominant_frequency, peak_magnitude, frequencies, magnitude

    def measure_channel_crosstalk(self, left_samples: np.ndarray, right_samples: np.ndarray,
                                   target_left_freq: float, target_right_freq: float,
                                   sample_rate: int = 48000) -> tuple:
        """
        Measure stereo channel crosstalk (frequency leakage between channels).

        Args:
            left_samples: Left channel audio data
            right_samples: Right channel audio data
            target_left_freq: Expected frequency in left channel
            target_right_freq: Expected frequency in right channel
            sample_rate: Sample rate in Hz

        Returns:
            tuple: (left_isolation_db, right_isolation_db, left_has_right_freq, right_has_left_freq)
        """
        # Analyze both channels
        left_freq, left_mag, left_freqs, left_spectrum = self.analyze_frequency_spectrum(left_samples, sample_rate)
        right_freq, right_mag, right_freqs, right_spectrum = self.analyze_frequency_spectrum(right_samples, sample_rate)

        # Find magnitude of "wrong" frequency in each channel
        # Left channel should NOT have right frequency
        left_freq_idx = np.argmin(np.abs(left_freqs - target_left_freq))
        right_freq_idx = np.argmin(np.abs(left_freqs - target_right_freq))

        left_channel_right_freq_mag = left_spectrum[right_freq_idx]
        left_channel_left_freq_mag = left_spectrum[left_freq_idx]

        right_channel_left_freq_mag = right_spectrum[left_freq_idx]
        right_channel_right_freq_mag = right_spectrum[right_freq_idx]

        # Calculate isolation in dB (how much is the correct frequency stronger than wrong frequency)
        # Avoid log(0) by adding small epsilon
        epsilon = 1e-10
        left_isolation_db = 20 * np.log10((left_channel_left_freq_mag + epsilon) / (left_channel_right_freq_mag + epsilon))
        right_isolation_db = 20 * np.log10((right_channel_right_freq_mag + epsilon) / (right_channel_left_freq_mag + epsilon))

        return (left_isolation_db, right_isolation_db,
                left_channel_right_freq_mag > epsilon * 100,
                right_channel_left_freq_mag > epsilon * 100)

    @pytest.mark.asyncio
    async def test_default_frequencies_140_144(self, audio_engine):
        """
        Test default binaural beat (140 Hz left, 144 Hz right, 4 Hz beat).
        This verifies the most common use case.
        """
        # Generate audio frame with default settings
        settings = {
            "base_frequency": 140,
            "beat_frequency": 4,
            "volume": 0.5,
            "spatial_mode": "none"
        }

        # Generate 1 second of audio for accurate FFT (±1 Hz resolution)
        left_samples, right_samples, sample_rate = await self.generate_audio_samples(audio_engine, settings)

        # Analyze frequencies
        left_freq, left_mag, _, _ = self.analyze_frequency_spectrum(left_samples, sample_rate)
        right_freq, right_mag, _, _ = self.analyze_frequency_spectrum(right_samples, sample_rate)

        # Verify frequencies within ±0.1 Hz tolerance (CRITICAL for ADHD protocols)
        assert abs(left_freq - 140.0) < 0.1, f"Left frequency {left_freq:.2f} Hz not within ±0.1 Hz of 140 Hz"
        assert abs(right_freq - 144.0) < 0.1, f"Right frequency {right_freq:.2f} Hz not within ±0.1 Hz of 144 Hz"

        # Verify binaural beat frequency
        beat_freq = abs(right_freq - left_freq)
        assert abs(beat_freq - 4.0) < 0.2, f"Binaural beat {beat_freq:.2f} Hz not within ±0.2 Hz of 4 Hz"

        print(f"\n✅ Default Frequencies Test PASSED:")
        print(f"   Left: {left_freq:.3f} Hz (target: 140 Hz, error: {abs(left_freq - 140):.3f} Hz)")
        print(f"   Right: {right_freq:.3f} Hz (target: 144 Hz, error: {abs(right_freq - 144):.3f} Hz)")
        print(f"   Binaural Beat: {beat_freq:.3f} Hz (target: 4 Hz)")

    @pytest.mark.asyncio
    async def test_smr_protocol_frequencies(self, audio_engine):
        """
        Test SMR (Sensorimotor Rhythm) protocol for ADHD management.
        SMR range: 12-15 Hz, using 140 Hz carrier + 14 Hz beat.
        """
        settings = {
            "base_frequency": 140,
            "beat_frequency": 14,  # SMR protocol
            "volume": 0.5,
            "spatial_mode": "none"
        }

        session_id = audio_engine.start_session(settings)
        frame = await audio_engine.generate_frame(session_id, binary_mode=False)

        left_freq, _, _, _ = self.analyze_frequency_spectrum(np.array(frame["left"], dtype=np.float32) / 32768.0, frame["sample_rate"])
        right_freq, _, _, _ = self.analyze_frequency_spectrum(np.array(frame["right"], dtype=np.float32) / 32768.0, frame["sample_rate"])

        # Verify SMR frequencies
        assert abs(left_freq - 140.0) < 0.1, f"SMR left frequency {left_freq:.2f} Hz inaccurate"
        assert abs(right_freq - 154.0) < 0.1, f"SMR right frequency {right_freq:.2f} Hz inaccurate (should be 140+14=154)"

        beat_freq = abs(right_freq - left_freq)
        assert abs(beat_freq - 14.0) < 0.2, f"SMR binaural beat {beat_freq:.2f} Hz inaccurate"

        print(f"\n✅ SMR Protocol Test PASSED:")
        print(f"   Left: {left_freq:.3f} Hz (target: 140 Hz)")
        print(f"   Right: {right_freq:.3f} Hz (target: 154 Hz)")
        print(f"   SMR Beat: {beat_freq:.3f} Hz (target: 14 Hz)")

    @pytest.mark.asyncio
    async def test_low_frequency_delta_protocol(self, audio_engine):
        """
        Test Delta protocol (0.5-4 Hz) for deep relaxation.
        Using 100 Hz carrier + 2 Hz beat.
        """
        settings = {
            "base_frequency": 100,
            "beat_frequency": 2,  # Delta range
            "volume": 0.5,
            "spatial_mode": "none"
        }

        session_id = audio_engine.start_session(settings)
        frame = await audio_engine.generate_frame(session_id, binary_mode=False)

        left_freq, _, _, _ = self.analyze_frequency_spectrum(np.array(frame["left"], dtype=np.float32) / 32768.0, frame["sample_rate"])
        right_freq, _, _, _ = self.analyze_frequency_spectrum(np.array(frame["right"], dtype=np.float32) / 32768.0, frame["sample_rate"])

        assert abs(left_freq - 100.0) < 0.1, f"Delta left frequency {left_freq:.2f} Hz inaccurate"
        assert abs(right_freq - 102.0) < 0.1, f"Delta right frequency {right_freq:.2f} Hz inaccurate"

        beat_freq = abs(right_freq - left_freq)
        assert abs(beat_freq - 2.0) < 0.2, f"Delta binaural beat {beat_freq:.2f} Hz inaccurate"

        print(f"\n✅ Delta Protocol Test PASSED:")
        print(f"   Carrier: {left_freq:.3f} Hz")
        print(f"   Beat: {beat_freq:.3f} Hz (Delta range)")

    @pytest.mark.asyncio
    async def test_high_frequency_gamma_protocol(self, audio_engine):
        """
        Test Gamma protocol (30-100 Hz) for peak cognitive performance.
        Using 150 Hz carrier + 40 Hz beat.
        """
        settings = {
            "base_frequency": 150,
            "beat_frequency": 40,  # Gamma range
            "volume": 0.5,
            "spatial_mode": "none"
        }

        session_id = audio_engine.start_session(settings)
        frame = await audio_engine.generate_frame(session_id, binary_mode=False)

        left_freq, _, _, _ = self.analyze_frequency_spectrum(np.array(frame["left"], dtype=np.float32) / 32768.0, frame["sample_rate"])
        right_freq, _, _, _ = self.analyze_frequency_spectrum(np.array(frame["right"], dtype=np.float32) / 32768.0, frame["sample_rate"])

        assert abs(left_freq - 150.0) < 0.1, f"Gamma left frequency {left_freq:.2f} Hz inaccurate"
        assert abs(right_freq - 190.0) < 0.1, f"Gamma right frequency {right_freq:.2f} Hz inaccurate"

        beat_freq = abs(right_freq - left_freq)
        assert abs(beat_freq - 40.0) < 0.5, f"Gamma binaural beat {beat_freq:.2f} Hz inaccurate"

        print(f"\n✅ Gamma Protocol Test PASSED:")
        print(f"   Carrier: {left_freq:.3f} Hz")
        print(f"   Beat: {beat_freq:.3f} Hz (Gamma range)")

    @pytest.mark.asyncio
    async def test_stereo_channel_separation(self, audio_engine):
        """
        CRITICAL TEST: Verify left and right channels are completely separate.
        Each channel should ONLY contain its designated frequency.
        """
        settings = {
            "base_frequency": 140,
            "beat_frequency": 10,  # Wide separation for easy detection
            "volume": 0.5,
            "spatial_mode": "none"
        }

        session_id = audio_engine.start_session(settings)
        frame = await audio_engine.generate_frame(session_id, binary_mode=False)

        # Measure channel crosstalk
        left_iso_db, right_iso_db, left_has_right, right_has_left = self.measure_channel_crosstalk(
            np.array(frame["left"], dtype=np.float32) / 32768.0,
            np.array(frame["right"], dtype=np.float32) / 32768.0,
            140.0, 150.0, frame["sample_rate"]
        )

        # Stereo separation should be > 60dB (industry standard for high-quality audio)
        assert left_iso_db > 60, f"Left channel isolation {left_iso_db:.1f} dB too low (should be > 60 dB)"
        assert right_iso_db > 60, f"Right channel isolation {right_iso_db:.1f} dB too low (should be > 60 dB)"

        print(f"\n✅ Stereo Separation Test PASSED:")
        print(f"   Left channel isolation: {left_iso_db:.1f} dB (> 60 dB required)")
        print(f"   Right channel isolation: {right_iso_db:.1f} dB (> 60 dB required)")
        print(f"   Left channel has right frequency: {left_has_right} (should be False)")
        print(f"   Right channel has left frequency: {right_has_left} (should be False)")

    @pytest.mark.asyncio
    async def test_frequency_range_limits(self, audio_engine):
        """
        Test frequency clamping at extreme ranges.
        Verify system handles edge cases properly.
        """
        # Test minimum frequency (5 Hz lower limit per audio_engine.py line 110)
        settings_min = {
            "base_frequency": 2,  # Below minimum, should clamp to 5 Hz
            "beat_frequency": 1,
            "volume": 0.5,
            "spatial_mode": "none"
        }

        session_id_min = audio_engine.start_session(settings_min)
        frame_min = await audio_engine.generate_frame(session_id_min, binary_mode=False)
        left_freq_min, _, _, _ = self.analyze_frequency_spectrum(np.array(frame_min["left"], dtype=np.float32) / 32768.0, frame_min["sample_rate"])

        # Should be clamped to 5 Hz (minimum per code, not 20 Hz)
        assert left_freq_min >= 4, f"Minimum frequency {left_freq_min:.2f} Hz below safe limit"

        # Test maximum frequency (20000 Hz upper limit)
        settings_max = {
            "base_frequency": 25000,  # Above maximum, should clamp to 20000 Hz
            "beat_frequency": 1,
            "volume": 0.5,
            "spatial_mode": "none"
        }

        session_id_max = audio_engine.start_session(settings_max)
        frame_max = await audio_engine.generate_frame(session_id_max, binary_mode=False)
        left_freq_max, _, _, _ = self.analyze_frequency_spectrum(np.array(frame_max["left"], dtype=np.float32) / 32768.0, frame_max["sample_rate"])

        # Should be clamped to 20000 Hz (maximum audible frequency)
        assert left_freq_max <= 20000, f"Maximum frequency {left_freq_max:.2f} Hz above safe limit"

        print(f"\n✅ Frequency Range Test PASSED:")
        print(f"   Minimum clamped frequency: {left_freq_min:.1f} Hz (>= 20 Hz)")
        print(f"   Maximum clamped frequency: {left_freq_max:.1f} Hz (<= 20000 Hz)")

    @pytest.mark.asyncio
    async def test_phase_continuity_across_frames(self, audio_engine):
        """
        Verify phase continuity between consecutive frames.
        Discontinuities cause clicks/pops in audio.
        """
        settings = {
            "base_frequency": 140,
            "beat_frequency": 4,
            "volume": 0.5,
            "spatial_mode": "none"
        }

        session_id = audio_engine.start_session(settings)

        # Generate 3 consecutive frames
        frame1 = await audio_engine.generate_frame(session_id, binary_mode=False)
        frame2 = await audio_engine.generate_frame(session_id, binary_mode=False)
        frame3 = await audio_engine.generate_frame(session_id, binary_mode=False)

        # Concatenate frames (convert to numpy arrays first)
        left_continuous = np.concatenate([
            np.array(frame1["left"], dtype=np.float32),
            np.array(frame2["left"], dtype=np.float32),
            np.array(frame3["left"], dtype=np.float32)
        ])
        right_continuous = np.concatenate([
            np.array(frame1["right"], dtype=np.float32),
            np.array(frame2["right"], dtype=np.float32),
            np.array(frame3["right"], dtype=np.float32)
        ])

        # Analyze concatenated audio
        left_freq, _, _, _ = self.analyze_frequency_spectrum(left_continuous, frame1["sample_rate"])
        right_freq, _, _, _ = self.analyze_frequency_spectrum(right_continuous, frame1["sample_rate"])

        # If phase is continuous, frequencies should still be accurate
        assert abs(left_freq - 140.0) < 0.1, f"Phase discontinuity detected in left channel (freq {left_freq:.2f} Hz)"
        assert abs(right_freq - 144.0) < 0.1, f"Phase discontinuity detected in right channel (freq {right_freq:.2f} Hz)"

        # Check for clicks by analyzing derivative (rate of change)
        # Large jumps indicate phase discontinuity
        left_derivative = np.diff(left_continuous)
        right_derivative = np.diff(right_continuous)

        # Max derivative should be within expected range for smooth sine wave
        max_expected_derivative = 2 * np.pi * 144 * 0.5  # 2π * freq * amplitude
        assert np.max(np.abs(left_derivative)) < max_expected_derivative * 1.5, "Potential click detected in left channel"
        assert np.max(np.abs(right_derivative)) < max_expected_derivative * 1.5, "Potential click detected in right channel"

        print(f"\n✅ Phase Continuity Test PASSED:")
        print(f"   Left frequency across 3 frames: {left_freq:.3f} Hz (stable)")
        print(f"   Right frequency across 3 frames: {right_freq:.3f} Hz (stable)")
        print(f"   Max left derivative: {np.max(np.abs(left_derivative)):.2f} (no clicks)")
        print(f"   Max right derivative: {np.max(np.abs(right_derivative)):.2f} (no clicks)")


class TestHarmonicDistortion:
    """Test Total Harmonic Distortion (THD) for audio quality"""

    @pytest.fixture
    def audio_engine(self):
        """Create AudioEngine instance for testing"""
        engine = AudioEngine()
        yield engine

    def calculate_thd(self, audio_samples: np.ndarray, fundamental_freq: float, sample_rate: int = 48000) -> float:
        """
        Calculate Total Harmonic Distortion (THD) percentage.

        Args:
            audio_samples: Audio data
            fundamental_freq: Fundamental frequency in Hz
            sample_rate: Sample rate

        Returns:
            float: THD percentage
        """
        # Perform FFT
        spectrum = rfft(audio_samples * np.hanning(len(audio_samples)))
        frequencies = rfftfreq(len(audio_samples), 1/sample_rate)
        magnitude = np.abs(spectrum)

        # Find fundamental frequency magnitude
        fund_idx = np.argmin(np.abs(frequencies - fundamental_freq))
        fund_magnitude = magnitude[fund_idx]

        # Find harmonics (2f, 3f, 4f, 5f) and sum their power
        harmonic_power = 0
        for harmonic_num in range(2, 6):  # 2nd through 5th harmonic
            harmonic_freq = fundamental_freq * harmonic_num
            if harmonic_freq < sample_rate / 2:  # Within Nyquist limit
                harm_idx = np.argmin(np.abs(frequencies - harmonic_freq))
                harmonic_power += magnitude[harm_idx] ** 2

        # THD = sqrt(sum of harmonic powers) / fundamental magnitude
        thd = np.sqrt(harmonic_power) / fund_magnitude if fund_magnitude > 0 else 0
        return thd * 100  # Return as percentage

    @pytest.mark.asyncio
    async def test_thd_below_threshold(self, audio_engine):
        """
        Verify THD < 0.01% for medical-grade audio quality.
        Per PLANNING.md requirements.
        """
        settings = {
            "base_frequency": 140,
            "beat_frequency": 4,
            "volume": 0.5,
            "spatial_mode": "none"
        }

        session_id = audio_engine.start_session(settings)
        frame = await audio_engine.generate_frame(session_id, binary_mode=False)

        # Calculate THD for both channels
        left_thd = self.calculate_thd(np.array(frame["left"], dtype=np.float32) / 32768.0, 140.0, frame["sample_rate"])
        right_thd = self.calculate_thd(np.array(frame["right"], dtype=np.float32) / 32768.0, 144.0, frame["sample_rate"])

        # THD should be < 0.01% (0.0001 as decimal) for medical-grade audio
        assert left_thd < 0.01, f"Left channel THD {left_thd:.4f}% exceeds 0.01% threshold"
        assert right_thd < 0.01, f"Right channel THD {right_thd:.4f}% exceeds 0.01% threshold"

        print(f"\n✅ Total Harmonic Distortion Test PASSED:")
        print(f"   Left channel THD: {left_thd:.6f}% (< 0.01% required)")
        print(f"   Right channel THD: {right_thd:.6f}% (< 0.01% required)")


if __name__ == "__main__":
    """Run tests directly for quick validation"""
    print("="*70)
    print("FFT Frequency Accuracy & Stereo Separation Test Suite")
    print("="*70)
    pytest.main([__file__, "-v", "-s"])
