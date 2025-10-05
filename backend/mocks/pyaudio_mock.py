"""Mock PyAudio for CI/CD environments where audio hardware isn't available."""

import numpy as np


class PyAudio:
    """Mock PyAudio class for testing."""

    paInt16 = 8
    paFloat32 = 1

    def __init__(self):
        self.streams = []

    def open(self, **kwargs):
        """Mock stream opening."""
        stream = MockStream(**kwargs)
        self.streams.append(stream)
        return stream

    def terminate(self):
        """Mock termination."""
        for stream in self.streams:
            stream.close()
        self.streams.clear()

    def get_device_count(self):
        """Return mock device count."""
        return 2

    def get_device_info_by_index(self, index):
        """Return mock device info."""
        return {
            'index': index,
            'structVersion': 2,
            'name': f'Mock Device {index}',
            'maxInputChannels': 2,
            'maxOutputChannels': 2,
            'defaultSampleRate': 44100.0
        }


class MockStream:
    """Mock audio stream."""

    def __init__(self, **kwargs):
        self.params = kwargs
        self.is_active = True

    def write(self, data):
        """Mock audio write."""
        return len(data)

    def read(self, num_frames):
        """Mock audio read."""
        channels = self.params.get('channels', 2)
        return np.zeros((num_frames * channels,), dtype=np.float32).tobytes()

    def stop_stream(self):
        """Mock stream stop."""
        self.is_active = False

    def close(self):
        """Mock stream close."""
        self.is_active = False

    def is_active(self):
        """Check if stream is active."""
        return self.is_active