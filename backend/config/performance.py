"""
Performance configuration settings for EBL backend.
Centralized configuration for frame rates, buffer sizes, and optimization.
"""

# Frame Rate Settings (reduced from 60Hz to 30Hz for audio stability)
STREAM_FPS = 30  # WebSocket streaming frame rate
FIELD_SIMULATOR_FPS = 30  # Electromagnetic field simulation frame rate
VISUALIZATION_FPS = 30  # Frontend visualization frame rate

# Audio Buffer Settings
MIN_BUFFER_SAMPLES = 8820  # 200ms at 44.1kHz
TARGET_BUFFER_SAMPLES = 13230  # 300ms target for stability
MAX_BUFFER_SAMPLES = 22050  # 500ms maximum

# Streaming Optimization
DEFAULT_CHUNK_SIZE = 1024  # Samples per WebSocket chunk
HIGH_FREQ_CHUNK_SIZE = 512  # For beat frequencies > 30Hz
LOW_FREQ_CHUNK_SIZE = 1536  # For beat frequencies < 5Hz

# Performance Thresholds
UNDERRUN_WARNING_COUNT = 3  # Show warning after this many underruns
CPU_USAGE_WARNING = 80  # Warn if CPU usage above this percent
MEMORY_USAGE_WARNING = 85  # Warn if memory usage above this percent

# Stream Rate Optimization Based on Beat Frequency
STREAM_RATE_CONFIG = {
    'high_frequency': {  # Beat freq > 30Hz
        'fps': 45,
        'chunk_size': HIGH_FREQ_CHUNK_SIZE,
        'buffer_multiplier': 1.2
    },
    'medium_frequency': {  # Beat freq 15-30Hz
        'fps': 37,
        'chunk_size': 768,
        'buffer_multiplier': 1.0
    },
    'low_frequency': {  # Beat freq < 15Hz
        'fps': STREAM_FPS,
        'chunk_size': DEFAULT_CHUNK_SIZE,
        'buffer_multiplier': 0.8
    }
}

def get_optimal_stream_config(beat_frequency: float) -> dict:
    """
    Get optimal streaming configuration based on beat frequency.

    Args:
        beat_frequency: Beat frequency in Hz

    Returns:
        Dictionary with optimal streaming parameters
    """
    if beat_frequency > 30:
        config_key = 'high_frequency'
    elif beat_frequency > 15:
        config_key = 'medium_frequency'
    else:
        config_key = 'low_frequency'

    config = STREAM_RATE_CONFIG[config_key].copy()
    config['beat_frequency'] = beat_frequency
    config['sleep_interval'] = 1.0 / config['fps']

    return config

def get_buffer_size_for_frequency(beat_frequency: float, base_samples: int = TARGET_BUFFER_SAMPLES) -> int:
    """
    Calculate optimal buffer size for given beat frequency.

    Args:
        beat_frequency: Beat frequency in Hz
        base_samples: Base buffer size in samples

    Returns:
        Optimal buffer size in samples
    """
    config = get_optimal_stream_config(beat_frequency)
    multiplier = config['buffer_multiplier']

    # Ensure minimum buffer size
    optimal_size = int(base_samples * multiplier)
    return max(optimal_size, MIN_BUFFER_SAMPLES)

# Export commonly used values
SLEEP_INTERVAL = 1.0 / STREAM_FPS  # 33.33ms sleep interval
FIELD_SLEEP_INTERVAL = 1.0 / FIELD_SIMULATOR_FPS  # 33.33ms field update interval