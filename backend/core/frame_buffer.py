"""
Frame Buffer for Zero-Lag Audio Streaming
Generates and buffers audio frames ahead of time for smooth playback
"""

import asyncio
import logging
from collections import deque
from typing import Optional
import time

logger = logging.getLogger(__name__)


class FrameBuffer:
    """
    Pre-generates and buffers audio frames for zero-lag streaming
    Maintains a buffer of frames to handle network jitter and timing variations
    """
    
    def __init__(self, audio_engine, session_id: str, target_buffer_size: int = 180):
        """
        Initialize frame buffer

        Args:
            audio_engine: AudioEngine instance for frame generation
            session_id: Audio session ID
            target_buffer_size: Target number of frames to keep buffered (default 180 = 3 seconds at 60 FPS)
        """
        self.audio_engine = audio_engine
        self.session_id = session_id
        self.target_buffer_size = target_buffer_size
        self.min_buffer_size = 120  # Start streaming at 2 seconds (improved from 1/3 full)
        self.max_buffer_size = target_buffer_size * 2  # Maximum buffer to prevent memory issues
        
        self.buffer = deque(maxlen=self.max_buffer_size)
        self.is_running = False
        self.generation_task = None
        
        # Statistics
        self.frames_generated = 0
        self.frames_delivered = 0
        self.buffer_underruns = 0
        self.last_generation_time = 0
        
    async def start(self):
        """Start the frame generation task"""
        if not self.is_running:
            self.is_running = True
            self.generation_task = asyncio.create_task(self._generate_frames())
            logger.info(f"🎬 FrameBuffer started for session {self.session_id[:8]}...")
            
    async def stop(self):
        """Stop the frame generation task"""
        self.is_running = False
        if self.generation_task:
            self.generation_task.cancel()
            try:
                await self.generation_task
            except asyncio.CancelledError:
                pass
        logger.info(f"🛑 FrameBuffer stopped for session {self.session_id[:8]}...")
        
    async def _generate_frames(self):
        """Background task that continuously generates frames"""
        frame_duration = 1.0 / 60  # 60 FPS
        
        try:
            while self.is_running:
                start_time = time.perf_counter()
                
                # Check buffer size
                current_buffer_size = len(self.buffer)
                
                # Only generate if buffer is below target
                if current_buffer_size < self.target_buffer_size:
                    # Generate frame (binary mode for efficiency)
                    frame = await self.audio_engine.generate_frame(self.session_id, binary_mode=True)
                    
                    if frame and frame != b'':
                        self.buffer.append(frame)
                        self.frames_generated += 1
                        
                        # Log every 300 frames (5 seconds)
                        if self.frames_generated % 300 == 0:
                            logger.debug(
                                f"📊 FrameBuffer [{self.session_id[:8]}]: "
                                f"Generated={self.frames_generated}, "
                                f"Buffer={len(self.buffer)}/{self.target_buffer_size}, "
                                f"Underruns={self.buffer_underruns}"
                            )
                
                # Calculate sleep time to maintain generation rate
                generation_time = time.perf_counter() - start_time
                self.last_generation_time = generation_time
                
                # Adjust sleep based on buffer fullness
                if current_buffer_size < self.min_buffer_size:
                    # Buffer is critically low, generate MUCH faster (4x speed)
                    sleep_time = max(0, frame_duration / 4 - generation_time)
                elif current_buffer_size > self.target_buffer_size:
                    # Buffer is full, slow down
                    sleep_time = frame_duration * 2
                else:
                    # Normal rate
                    sleep_time = max(0, frame_duration - generation_time)
                
                if sleep_time > 0:
                    await asyncio.sleep(sleep_time)
                    
        except asyncio.CancelledError:
            logger.info(f"Frame generation cancelled for session {self.session_id[:8]}...")
            raise
        except Exception as e:
            logger.error(f"Error in frame generation for session {self.session_id[:8]}...: {e}", exc_info=True)
            self.is_running = False
            
    def get_frame(self) -> Optional[bytes]:
        """
        Get the next frame from the buffer (non-blocking)
        
        Returns:
            bytes: Next audio frame or None if buffer is empty
        """
        if self.buffer:
            frame = self.buffer.popleft()
            self.frames_delivered += 1
            return frame
        else:
            self.buffer_underruns += 1
            if self.buffer_underruns % 10 == 1:  # Log every 10th underrun
                logger.warning(
                    f"⚠️ Buffer underrun #{self.buffer_underruns} for session {self.session_id[:8]}... "
                    f"(Generated={self.frames_generated}, Delivered={self.frames_delivered})"
                )
            return None
            
    def get_buffer_status(self) -> dict:
        """Get current buffer statistics"""
        return {
            "buffer_size": len(self.buffer),
            "target_size": self.target_buffer_size,
            "min_size": self.min_buffer_size,
            "max_size": self.max_buffer_size,
            "buffer_percent": (len(self.buffer) / self.target_buffer_size) * 100,
            "frames_generated": self.frames_generated,
            "frames_delivered": self.frames_delivered,
            "buffer_underruns": self.buffer_underruns,
            "last_generation_time_ms": self.last_generation_time * 1000,
            "is_running": self.is_running
        }
