"""
Chat Database Models Package - AOL/AIM Style Real-Time Chat

This package contains the database models for the EBL chat system.
Separated from main models.py for modularity and maintainability.
"""

from .models import ChatRoom, ChatUser, ChatMessage, ChatRoomMember
from .init_rooms import init_default_rooms, DEFAULT_ROOMS

__all__ = [
    "ChatRoom",
    "ChatUser",
    "ChatMessage",
    "ChatRoomMember",
    "init_default_rooms",
    "DEFAULT_ROOMS",
]
