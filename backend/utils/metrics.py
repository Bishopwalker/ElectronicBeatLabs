# Electromagnetic Beat Lab - Metrics Collection
# Prometheus metrics for Grafana monitoring

from prometheus_client import Counter, Histogram, Gauge, Summary, CollectorRegistry
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
import time
from typing import Optional
from functools import wraps

# Create a custom registry
registry = CollectorRegistry()

# Request metrics
request_count = Counter(
    'ebl_requests_total',
    'Total number of requests',
    ['method', 'endpoint', 'status'],
    registry=registry
)

request_duration = Histogram(
    'ebl_request_duration_seconds',
    'Request duration in seconds',
    ['method', 'endpoint'],
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0),
    registry=registry
)

# WebSocket metrics
websocket_connections = Gauge(
    'ebl_websocket_connections',
    'Number of active WebSocket connections',
    registry=registry
)

websocket_messages = Counter(
    'ebl_websocket_messages_total',
    'Total WebSocket messages',
    ['direction', 'type'],  # direction: sent/received, type: audio/control
    registry=registry
)

# Audio processing metrics
audio_frequency = Gauge(
    'ebl_audio_frequency_hz',
    'Current audio frequency in Hz',
    ['channel'],  # left/right/beat
    registry=registry
)

audio_buffer_size = Gauge(
    'ebl_audio_buffer_size_bytes',
    'Current audio buffer size',
    registry=registry
)

audio_processing_time = Summary(
    'ebl_audio_processing_seconds',
    'Audio processing time in seconds',
    registry=registry
)

audio_latency = Histogram(
    'ebl_audio_latency_ms',
    'Audio latency in milliseconds',
    buckets=(1, 5, 10, 25, 50, 100, 250, 500, 1000),
    registry=registry
)

# Pattern metrics
pattern_changes = Counter(
    'ebl_pattern_changes_total',
    'Total pattern changes',
    ['pattern_type', 'pattern_name'],
    registry=registry
)

pattern_duration = Histogram(
    'ebl_pattern_duration_seconds',
    'Duration of pattern usage',
    ['pattern_name'],
    buckets=(10, 30, 60, 120, 300, 600, 1800, 3600),
    registry=registry
)

# Session metrics
active_sessions = Gauge(
    'ebl_active_sessions',
    'Number of active sessions',
    registry=registry
)

session_duration = Histogram(
    'ebl_session_duration_seconds',
    'Session duration in seconds',
    buckets=(60, 300, 600, 1800, 3600, 7200, 14400),
    registry=registry
)

# Error metrics
error_count = Counter(
    'ebl_errors_total',
    'Total number of errors',
    ['error_type', 'component'],
    registry=registry
)

# Performance metrics
cpu_usage = Gauge(
    'ebl_cpu_usage_percent',
    'CPU usage percentage',
    registry=registry
)

memory_usage = Gauge(
    'ebl_memory_usage_mb',
    'Memory usage in MB',
    registry=registry
)

class MetricsCollector:
    """Metrics collection utility"""
    
    @staticmethod
    def track_request(method: str, endpoint: str, status: int, duration: float):
        """Track HTTP request metrics"""
        request_count.labels(method=method, endpoint=endpoint, status=str(status)).inc()
        request_duration.labels(method=method, endpoint=endpoint).observe(duration)
    
    @staticmethod
    def track_websocket_connection(connected: bool):
        """Track WebSocket connection"""
        if connected:
            websocket_connections.inc()
        else:
            websocket_connections.dec()
    
    @staticmethod
    def track_websocket_message(direction: str, msg_type: str):
        """Track WebSocket message"""
        websocket_messages.labels(direction=direction, type=msg_type).inc()
    
    @staticmethod
    def update_frequency(left: float, right: float, beat: float):
        """Update frequency metrics"""
        audio_frequency.labels(channel='left').set(left)
        audio_frequency.labels(channel='right').set(right)
        audio_frequency.labels(channel='beat').set(beat)
    
    @staticmethod
    def track_audio_processing(duration: float):
        """Track audio processing time"""
        audio_processing_time.observe(duration)
    
    @staticmethod
    def track_audio_latency(latency: float):
        """Track audio latency"""
        audio_latency.observe(latency)
    
    @staticmethod
    def update_buffer_size(size: int):
        """Update audio buffer size"""
        audio_buffer_size.set(size)
    
    @staticmethod
    def track_pattern_change(pattern_type: str, pattern_name: str):
        """Track pattern change"""
        pattern_changes.labels(pattern_type=pattern_type, pattern_name=pattern_name).inc()
    
    @staticmethod
    def track_session(started: bool):
        """Track session"""
        if started:
            active_sessions.inc()
        else:
            active_sessions.dec()
    
    @staticmethod
    def track_error(error_type: str, component: str):
        """Track error"""
        error_count.labels(error_type=error_type, component=component).inc()
    
    @staticmethod
    def update_system_metrics(cpu: float, memory: float):
        """Update system metrics"""
        cpu_usage.set(cpu)
        memory_usage.set(memory)

def timing_metric(metric_name: str):
    """Decorator to measure function execution time"""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start = time.time()
            try:
                result = await func(*args, **kwargs)
                return result
            finally:
                duration = time.time() - start
                if metric_name == 'audio_processing':
                    audio_processing_time.observe(duration)
                elif metric_name == 'request':
                    # Extract endpoint from args/kwargs if available
                    endpoint = kwargs.get('endpoint', 'unknown')
                    method = kwargs.get('method', 'unknown')
                    request_duration.labels(method=method, endpoint=endpoint).observe(duration)
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start = time.time()
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                duration = time.time() - start
                if metric_name == 'audio_processing':
                    audio_processing_time.observe(duration)
        
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    return decorator

def get_metrics():
    """Get current metrics in Prometheus format"""
    return generate_latest(registry)

# Import asyncio for async support
import asyncio