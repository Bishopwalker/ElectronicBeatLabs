"""
WebSocket Audio Streaming Optimizer for Audio Agent.

Handles buffer management and stream optimization to prevent underruns.
"""

import asyncio
import logging
import time
from typing import Dict, Any, Optional
import numpy as np

logger = logging.getLogger(__name__)


class StreamingOptimizer:
    """
    Optimizes WebSocket audio streaming to prevent buffer underruns.
    """

    def __init__(self):
        self.active_streams: Dict[str, Dict[str, Any]] = {}
        self.chunk_size = 1024  # Samples per chunk
        self.buffer_target = 8820  # 200ms at 44.1kHz
        self.stream_rate = 30  # FPS for streaming (optimized for audio stability)

    async def optimize_stream_settings(self, session_id: str, settings: Dict[str, Any]) -> Dict[str, Any]:
        """
        Optimize streaming settings based on audio parameters.

        Args:
            session_id: Unique session identifier
            settings: Current audio settings

        Returns:
            Optimized settings for WebSocket streaming
        """
        try:
            # Get audio parameters
            base_freq = settings.get('base_frequency', 440)
            beat_freq = settings.get('beat_frequency', 4)
            sample_rate = settings.get('sample_rate', 44100)

            # Calculate optimal chunk size based on frequency
            # Higher frequencies need smaller chunks for smooth processing
            if beat_freq > 30:
                chunk_size = 512  # Smaller chunks for high-frequency beats
                stream_rate = 45  # Higher stream rate but still audio-friendly
            elif beat_freq > 15:
                chunk_size = 768
                stream_rate = 37  # Balanced rate
            else:
                chunk_size = 1024  # Standard chunk size for low frequencies
                stream_rate = 30

            # Calculate buffer settings
            buffer_target = max(chunk_size * 8, 4410)  # At least 100ms buffer

            # For very low beat frequencies, use larger buffers
            if beat_freq < 2:
                buffer_target *= 2
                chunk_size = min(chunk_size * 2, 2048)

            optimized_settings = {
                **settings,
                'chunk_size': chunk_size,
                'buffer_target': buffer_target,
                'stream_rate': stream_rate,
                'optimization_applied': True,
                'optimization_reason': f'Optimized for {beat_freq}Hz beat frequency'
            }

            # Store stream info
            self.active_streams[session_id] = {
                'settings': optimized_settings,
                'start_time': time.time(),
                'chunks_sent': 0,
                'underruns_detected': 0
            }

            logger.info(f"Stream optimized for session {session_id}: "
                       f"chunk_size={chunk_size}, buffer_target={buffer_target}, "
                       f"stream_rate={stream_rate}")

            return optimized_settings

        except Exception as e:
            logger.error(f"Error optimizing stream settings: {e}")
            return settings

    async def generate_optimized_chunk(self, session_id: str, timestamp: float) -> Optional[Dict[str, Any]]:
        """
        Generate an optimized audio chunk for streaming.

        Args:
            session_id: Session identifier
            timestamp: Current timestamp

        Returns:
            Audio chunk data optimized for streaming
        """
        try:
            if session_id not in self.active_streams:
                logger.warning(f"Session {session_id} not found in active streams")
                return None

            stream_info = self.active_streams[session_id]
            settings = stream_info['settings']

            # Get parameters
            chunk_size = settings.get('chunk_size', self.chunk_size)
            base_freq = settings.get('base_frequency', 440)
            beat_freq = settings.get('beat_frequency', 4)
            sample_rate = settings.get('sample_rate', 44100)
            amplitude = settings.get('amplitude', 0.5)

            # Calculate time progression
            elapsed_time = timestamp - stream_info['start_time']
            chunk_duration = chunk_size / sample_rate

            # Generate time array for this chunk
            t_start = elapsed_time
            t_end = elapsed_time + chunk_duration
            t = np.linspace(t_start, t_end, chunk_size, False)

            # Generate binaural beat audio
            left_freq = base_freq - (beat_freq / 2)
            right_freq = base_freq + (beat_freq / 2)

            # Generate audio with smooth transitions
            left_channel = amplitude * np.sin(2 * np.pi * left_freq * t)
            right_channel = amplitude * np.sin(2 * np.pi * right_freq * t)

            # Apply gentle fade to prevent clicks
            fade_samples = min(32, chunk_size // 8)
            if fade_samples > 0:
                fade_in = np.linspace(0, 1, fade_samples)
                fade_out = np.linspace(1, 0, fade_samples)

                left_channel[:fade_samples] *= fade_in
                left_channel[-fade_samples:] *= fade_out
                right_channel[:fade_samples] *= fade_in
                right_channel[-fade_samples:] *= fade_out

            # Create chunk data
            chunk_data = {
                'type': 'audio_chunk',
                'session_id': session_id,
                'timestamp': timestamp,
                'chunk_index': stream_info['chunks_sent'],
                'samples': chunk_size,
                'sample_rate': sample_rate,
                'audio': {
                    'left': left_channel.tolist(),
                    'right': right_channel.tolist()
                },
                'optimization_info': {
                    'chunk_size': chunk_size,
                    'buffer_health': 'good',  # Could be calculated from client feedback
                    'stream_rate': settings.get('stream_rate', 30)
                }
            }

            # Update stream info
            stream_info['chunks_sent'] += 1
            stream_info['last_chunk_time'] = timestamp

            return chunk_data

        except Exception as e:
            logger.error(f"Error generating optimized chunk: {e}")
            return None

    async def handle_underrun_report(self, session_id: str, underrun_count: int):
        """
        Handle underrun reports from client and adjust streaming.

        Args:
            session_id: Session identifier
            underrun_count: Number of underruns reported
        """
        try:
            if session_id not in self.active_streams:
                return

            stream_info = self.active_streams[session_id]
            stream_info['underruns_detected'] = underrun_count

            # If underruns detected, increase buffer size
            if underrun_count > 0:
                settings = stream_info['settings']
                current_buffer = settings.get('buffer_target', self.buffer_target)
                new_buffer = min(current_buffer * 1.5, 22050)  # Max 500ms buffer

                settings['buffer_target'] = int(new_buffer)
                settings['optimization_reason'] = f'Increased buffer due to {underrun_count} underruns'

                logger.info(f"Increased buffer for session {session_id}: "
                           f"{current_buffer} -> {new_buffer} samples")

        except Exception as e:
            logger.error(f"Error handling underrun report: {e}")

    async def cleanup_session(self, session_id: str):
        """
        Clean up resources for a completed session.

        Args:
            session_id: Session identifier to clean up
        """
        try:
            if session_id in self.active_streams:
                stream_info = self.active_streams[session_id]
                duration = time.time() - stream_info['start_time']
                chunks_sent = stream_info['chunks_sent']
                underruns = stream_info['underruns_detected']

                logger.info(f"Session {session_id} completed: "
                           f"duration={duration:.1f}s, chunks={chunks_sent}, "
                           f"underruns={underruns}")

                del self.active_streams[session_id]

        except Exception as e:
            logger.error(f"Error cleaning up session: {e}")

    def get_stream_stats(self) -> Dict[str, Any]:
        """
        Get statistics for all active streams.

        Returns:
            Dictionary with stream statistics
        """
        try:
            stats = {
                'active_streams': len(self.active_streams),
                'total_chunks_sent': sum(s['chunks_sent'] for s in self.active_streams.values()),
                'total_underruns': sum(s['underruns_detected'] for s in self.active_streams.values()),
                'streams': {}
            }

            for session_id, stream_info in self.active_streams.items():
                duration = time.time() - stream_info['start_time']
                stats['streams'][session_id] = {
                    'duration': round(duration, 1),
                    'chunks_sent': stream_info['chunks_sent'],
                    'underruns': stream_info['underruns_detected'],
                    'settings': {
                        'chunk_size': stream_info['settings'].get('chunk_size'),
                        'buffer_target': stream_info['settings'].get('buffer_target'),
                        'stream_rate': stream_info['settings'].get('stream_rate')
                    }
                }

            return stats

        except Exception as e:
            logger.error(f"Error getting stream stats: {e}")
            return {'active_streams': 0, 'error': str(e)}


# Global streaming optimizer instance
streaming_optimizer = StreamingOptimizer()

def get_streaming_optimizer() -> StreamingOptimizer:
    """Get the global streaming optimizer instance."""
    return streaming_optimizer