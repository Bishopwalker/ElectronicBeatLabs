"""
Frame Buffer - Audio frame buffering for WebSocket streaming
PRODUCTION IMPLEMENTATION - Generates real audio frames
"""

import logging
import asyncio
from typing import Optional, Deque
from collections import deque

logger = logging.getLogger(__name__)


class FrameBuffer:
    """
    Frame buffer for managing audio frame delivery to WebSocket clients
    Provides zero-lag buffering and smooth frame delivery at 60 FPS
    """

    def __init__(self, audio_engine, session_id: str, target_buffer_size: int = 120):
        """
        Initialize frame buffer

        Args:
            audio_engine: AudioEngine instance providing audio data
            session_id: Unique session identifier
            target_buffer_size: Target buffer size in frames (default 120 = 2 seconds at 60 FPS)
        """
        self.audio_engine = audio_engine
        self.session_id = session_id
        self.target_buffer_size = target_buffer_size
        self.is_running = False
        
        # Frame buffer - thread-safe deque
        self.buffer: Deque[bytes] = deque(maxlen=target_buffer_size * 2)  # Allow overflow headroom
        
        # Background task for generating frames
        self.generator_task: Optional[asyncio.Task] = None
        
        # Performance tracking
        self.frames_generated = 0
        self.frames_delivered = 0
        self.underruns = 0

        logger.info(f"📦 FrameBuffer initialized for session {session_id[:8]} (buffer size: {target_buffer_size} frames)")

    async def start(self):
        """
        Start the frame buffer processing
        Launches background task to generate frames ahead of time
        """
        self.is_running = True
        
        # Start background frame generator
        self.generator_task = asyncio.create_task(self._generate_frames())
        
        logger.info(f"▶️ FrameBuffer started for session {self.session_id[:8]}")

    async def stop(self):
        """
        Stop the frame buffer processing
        """
        self.is_running = False
        
        # Cancel generator task
        if self.generator_task and not self.generator_task.done():
            self.generator_task.cancel()
            try:
                await self.generator_task
            except asyncio.CancelledError:
                pass
        
        # Clear buffer
        self.buffer.clear()
        
        logger.info(f"⏹️ FrameBuffer stopped for session {self.session_id[:8]}")

    async def _generate_frames(self):
        """
        Background task: Generate frames ahead of time to maintain buffer
        Runs at 120 FPS to stay ahead of 60 FPS consumption
        """
        target_generation_rate = 120  # Generate at 2x consumption rate
        frame_duration = 1.0 / target_generation_rate
        
        import time
        next_frame_time = time.perf_counter()
        
        logger.info(f"🎬 Frame generator started for session {self.session_id[:8]} at {target_generation_rate} FPS")
        
        try:
            while self.is_running:
                current_time = time.perf_counter()
                
                # Only generate if buffer has room
                current_buffer_size = len(self.buffer)
                
                if current_buffer_size < self.target_buffer_size:
                    # Generate frame using AudioEngine
                    try:
                        frame = await self.audio_engine.generate_frame(
                            self.session_id,
                            binary_mode=True
                        )
                        
                        if frame and len(frame) > 0:
                            self.buffer.append(frame)
                            self.frames_generated += 1
                            
                            # Log every 5 seconds
                            if self.frames_generated % 600 == 0:
                                logger.info(
                                    f"🎵 Generator [{self.session_id[:8]}]: "
                                    f"Generated={self.frames_generated}, "
                                    f"Delivered={self.frames_delivered}, "
                                    f"BufferSize={current_buffer_size}/{self.target_buffer_size}, "
                                    f"Underruns={self.underruns}"
                                )
                    except Exception as e:
                        logger.error(f"❌ Frame generation error: {e}", exc_info=True)
                
                # Maintain generation rate
                next_frame_time += frame_duration
                sleep_time = next_frame_time - time.perf_counter()
                
                if sleep_time > 0:
                    await asyncio.sleep(sleep_time)
                else:
                    # Behind schedule - skip sleep and catch up
                    next_frame_time = time.perf_counter()
                    
        except asyncio.CancelledError:
            logger.info(f"🛑 Frame generator cancelled for session {self.session_id[:8]}")
            raise
        except Exception as e:
            logger.error(f"❌ Frame generator crashed: {e}", exc_info=True)

    def get_frame(self) -> Optional[bytes]:
        """
        Get the next audio frame from the buffer
        NON-BLOCKING - returns immediately

        Returns:
            Audio frame data as bytes, or None if buffer empty
        """
        try:
            frame = self.buffer.popleft()
            self.frames_delivered += 1
            return frame
        except IndexError:
            # Buffer underrun - no frames available
            self.underruns += 1
            
            # Log underruns (but not too frequently)
            if self.underruns % 10 == 1:
                logger.warning(
                    f"⚠️ Buffer underrun #{self.underruns} for session {self.session_id[:8]} "
                    f"(generated={self.frames_generated}, delivered={self.frames_delivered})"
                )
            
            return None

    def get_buffer_status(self) -> dict:
        """
        Get the current buffer status

        Returns:
            Dictionary with buffer statistics
        """
        current_size = len(self.buffer)
        buffer_percent = (current_size / self.target_buffer_size * 100) if self.target_buffer_size > 0 else 0
        
        return {
            "buffer_size": current_size,
            "target_size": self.target_buffer_size,
            "buffer_percent": buffer_percent,
            "is_running": self.is_running,
            "frames_generated": self.frames_generated,
            "frames_delivered": self.frames_delivered,
            "underruns": self.underruns
        }
