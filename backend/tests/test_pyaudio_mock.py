"""Test that PyAudio mock works in CI/CD environment."""

import sys
import os
import numpy as np

# Add mocks to path for CI/CD
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'mocks'))

def test_pyaudio_mock_import():
    """Test that we can import and use PyAudio mock."""
    # Try to detect which PyAudio we're using
    using_mock = False

    try:
        import pyaudio
        p = pyaudio.PyAudio()
        print("Using real PyAudio")
    except ImportError:
        # If real pyaudio isn't available, use our mock
        print("Using PyAudio mock")
        from pyaudio_mock import PyAudio
        p = PyAudio()
        using_mock = True

    # Test basic functionality
    device_count = p.get_device_count()
    if using_mock:
        assert device_count == 2  # Mock always returns 2
    else:
        assert device_count >= 1  # Real system has at least one device

    # Test stream creation
    stream = p.open(
        format=1,  # paFloat32 value
        channels=2,
        rate=44100,
        output=True
    )

    assert stream is not None

    # For mock, test the is_active method
    if hasattr(stream, 'is_active'):
        assert stream.is_active() == True

    # Test write
    data = np.zeros(1024, dtype=np.float32).tobytes()
    bytes_written = stream.write(data)

    # Mock returns length, real pyaudio returns None
    if using_mock:
        assert bytes_written == len(data)

    # Test cleanup
    if hasattr(stream, 'close'):
        stream.close()
    # Only check is_active for mock (real PyAudio throws error after close)
    if using_mock and hasattr(stream, 'is_active'):
        assert stream.is_active() == False

    p.terminate()
    print("PyAudio import test passed!")


def test_device_info():
    """Test mock device info retrieval."""
    using_mock = False

    try:
        import pyaudio
        p = pyaudio.PyAudio()
    except ImportError:
        from pyaudio_mock import PyAudio
        p = PyAudio()
        using_mock = True

    for i in range(p.get_device_count()):
        info = p.get_device_info_by_index(i)
        assert 'name' in info
        assert 'maxInputChannels' in info
        assert 'maxOutputChannels' in info
        assert 'defaultSampleRate' in info

        # Mock always returns 44100.0
        if using_mock:
            assert info['defaultSampleRate'] == 44100.0

    p.terminate()
    print("Device info test passed!")


def test_ci_environment_simulation():
    """Test that the mock will work in CI/CD where PyAudio isn't available."""
    # Force use of mock
    original_modules = sys.modules.copy()

    # Remove pyaudio if it exists
    if 'pyaudio' in sys.modules:
        del sys.modules['pyaudio']

    # Use the mock
    from pyaudio_mock import PyAudio

    p = PyAudio()
    assert p.get_device_count() == 2

    stream = p.open(channels=2, rate=44100, output=True)
    assert stream.is_active == True

    stream.close()
    p.terminate()

    # Restore original modules
    sys.modules = original_modules

    print("CI environment simulation test passed!")


if __name__ == "__main__":
    test_pyaudio_mock_import()
    test_device_info()
    test_ci_environment_simulation()
    print("\n[SUCCESS] All PyAudio mock tests passed!")