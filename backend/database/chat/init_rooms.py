"""
Initialize Default Chat Rooms for EBL.

Creates the default topic rooms on application startup.
"""

from typing import List
import logging

logger = logging.getLogger(__name__)

# Default rooms configuration
DEFAULT_ROOMS: List[dict] = [
    {
        "name": "Global Chat",
        "slug": "global",
        "room_type": "global",
        "description": "Main chat room for all EBL users",
    },
    {
        "name": "Focus & Productivity",
        "slug": "focus",
        "room_type": "topic",
        "description": "Discuss focus techniques and share experiences",
    },
    {
        "name": "Meditation & Relaxation",
        "slug": "meditation",
        "room_type": "topic",
        "description": "Meditation practice and mindfulness discussion",
    },
    {
        "name": "Remote Viewing",
        "slug": "remote-viewing",
        "room_type": "topic",
        "description": "RV sessions, techniques, and results",
    },
    {
        "name": "Lucid Dreams & OBE",
        "slug": "lucid-dreams",
        "room_type": "topic",
        "description": "Lucid dreaming and out-of-body experiences",
    },
]


def init_default_rooms(db_session) -> int:
    """
    Create default chat rooms if they don't exist.

    Args:
        db_session: SQLAlchemy database session

    Returns:
        Number of rooms created
    """
    from .models import ChatRoom

    created_count = 0

    for room_data in DEFAULT_ROOMS:
        existing = db_session.query(ChatRoom).filter_by(
            slug=room_data["slug"]
        ).first()

        if not existing:
            room = ChatRoom(**room_data)
            db_session.add(room)
            created_count += 1
            logger.info(f"Created chat room: {room_data['name']}")

    if created_count > 0:
        db_session.commit()
        logger.info(f"Initialized {created_count} default chat rooms")

    return created_count
