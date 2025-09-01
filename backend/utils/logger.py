# Electromagnetic Beat Lab - Logging Configuration
# Real-time logging for development and structured logging for production

import logging
import sys
import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict
import colorlog

# Create logs directory if it doesn't exist
LOGS_DIR = Path(__file__).parent.parent / "logs"
LOGS_DIR.mkdir(exist_ok=True)

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add extra fields if present
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        if hasattr(record, 'session_id'):
            log_data['session_id'] = record.session_id
        if hasattr(record, 'frequency'):
            log_data['frequency'] = record.frequency
        if hasattr(record, 'pattern'):
            log_data['pattern'] = record.pattern
        if hasattr(record, 'performance'):
            log_data['performance'] = record.performance
            
        # Add exception info if present
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
            
        return json.dumps(log_data)


def setup_logger(
    name: str = "ebl",
    level: str = "DEBUG",
    env: str = "development"
) -> logging.Logger:
    """
    Set up logger with appropriate configuration for environment
    
    Args:
        name: Logger name
        level: Logging level
        env: Environment (development/production)
    
    Returns:
        Configured logger
    """
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper()))
    logger.handlers.clear()
    
    if env == "development":
        # Colorful console output for development
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.DEBUG)
        
        # Color format for console
        color_formatter = colorlog.ColoredFormatter(
            "%(log_color)s%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d | %(message)s%(reset)s",
            datefmt='%H:%M:%S',
            reset=True,
            log_colors={
                'DEBUG': 'cyan',
                'INFO': 'green',
                'WARNING': 'yellow',
                'ERROR': 'red',
                'CRITICAL': 'red,bg_white',
            },
            secondary_log_colors={},
            style='%'
        )
        console_handler.setFormatter(color_formatter)
        logger.addHandler(console_handler)
        
    else:  # production
        # JSON formatted file output for production
        file_handler = logging.FileHandler(
            LOGS_DIR / f"ebl_{datetime.now().strftime('%Y%m%d')}.log"
        )
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(JSONFormatter())
        logger.addHandler(file_handler)
        
        # Also add console handler for production (less verbose)
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.WARNING)
        simple_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(simple_formatter)
        logger.addHandler(console_handler)
    
    return logger


class RequestLogger:
    """Middleware for logging HTTP requests"""
    
    def __init__(self, logger: logging.Logger):
        self.logger = logger
        
    def log_request(self, request: Dict[str, Any], duration: float):
        """Log HTTP request details"""
        self.logger.info(
            f"Request: {request.get('method')} {request.get('path')} - "
            f"Status: {request.get('status')} - Duration: {duration:.3f}s",
            extra={
                'performance': {
                    'duration': duration,
                    'method': request.get('method'),
                    'path': request.get('path'),
                    'status': request.get('status')
                }
            }
        )


class AudioLogger:
    """Specialized logger for audio processing events"""
    
    def __init__(self, logger: logging.Logger):
        self.logger = logger
        
    def log_frequency_change(self, left: float, right: float, beat: float, session_id: str):
        """Log frequency changes"""
        self.logger.info(
            f"Frequency changed - Left: {left}Hz, Right: {right}Hz, Beat: {beat}Hz",
            extra={
                'frequency': {
                    'left': left,
                    'right': right,
                    'beat': beat
                },
                'session_id': session_id
            }
        )
        
    def log_pattern_change(self, pattern: str, session_id: str):
        """Log pattern changes"""
        self.logger.info(
            f"Pattern changed to: {pattern}",
            extra={
                'pattern': pattern,
                'session_id': session_id
            }
        )
        
    def log_audio_buffer(self, buffer_size: int, latency: float, session_id: str):
        """Log audio buffer performance"""
        self.logger.debug(
            f"Audio buffer - Size: {buffer_size}, Latency: {latency:.2f}ms",
            extra={
                'performance': {
                    'buffer_size': buffer_size,
                    'latency': latency
                },
                'session_id': session_id
            }
        )


# Create default logger
logger = setup_logger(env="development")