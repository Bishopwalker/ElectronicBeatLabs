"""
Chat Routes Package - WebSocket and REST API for EBL Chat.

Provides:
    - WebSocket endpoint for real-time chat
    - REST API for room list, history
    - Message handlers for all chat operations
"""

from .websocket import router as chat_ws_router
from .rest import router as chat_api_router

__all__ = [
    "chat_ws_router",
    "chat_api_router",
]
