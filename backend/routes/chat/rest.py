"""
Chat REST API Routes.

Provides REST endpoints for:
    - Room list
    - Message history
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from services.chat import RoomService, MessageService

router = APIRouter(prefix="/chat", tags=["chat"])


# ============================================================================
# Response Models
# ============================================================================

class RoomResponse(BaseModel):
    """Chat room response model."""
    id: str
    name: str
    room_type: str
    slug: str
    description: Optional[str]
    max_users: int

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    """Chat message response model."""
    id: str
    room_id: str
    content: str
    message_type: str
    sender_nickname: str
    sender_color: str
    sender_is_verified: bool
    created_at: str

    class Config:
        from_attributes = True


# ============================================================================
# Endpoints
# ============================================================================

@router.get("/rooms", response_model=List[RoomResponse])
def get_rooms(db: Session = Depends(get_db)):
    """
    Get list of available chat rooms.

    Returns all active non-DM rooms.
    """
    service = RoomService(db)
    rooms = service.get_available_rooms()
    return [
        RoomResponse(
            id=r.id,
            name=r.name,
            room_type=r.room_type,
            slug=r.slug,
            description=r.description,
            max_users=r.max_users,
        )
        for r in rooms
    ]


@router.get("/rooms/{room_id}", response_model=RoomResponse)
def get_room(room_id: str, db: Session = Depends(get_db)):
    """
    Get a specific chat room by ID.
    """
    service = RoomService(db)
    room = service.get_by_id(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return RoomResponse(
        id=room.id,
        name=room.name,
        room_type=room.room_type,
        slug=room.slug,
        description=room.description,
        max_users=room.max_users,
    )


@router.get("/rooms/{room_id}/history", response_model=List[MessageResponse])
def get_room_history(
    room_id: str,
    limit: int = 100,
    before_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get message history for a room.

    Args:
        room_id: Room to query
        limit: Max messages (default 100)
        before_id: Optional cursor for pagination
    """
    room_service = RoomService(db)
    room = room_service.get_by_id(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    message_service = MessageService(db)
    messages = message_service.get_history(
        room_id,
        limit=min(limit, 100),
        before_message_id=before_id
    )

    return [
        MessageResponse(
            id=m.id,
            room_id=m.room_id,
            content=m.content,
            message_type=m.message_type,
            sender_nickname=m.sender_nickname,
            sender_color=m.sender_color,
            sender_is_verified=m.sender_is_verified,
            created_at=m.created_at.isoformat() if m.created_at else "",
        )
        for m in messages
    ]


@router.get("/rooms/slug/{slug}", response_model=RoomResponse)
def get_room_by_slug(slug: str, db: Session = Depends(get_db)):
    """
    Get a chat room by its slug.
    """
    service = RoomService(db)
    room = service.get_by_slug(slug)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return RoomResponse(
        id=room.id,
        name=room.name,
        room_type=room.room_type,
        slug=room.slug,
        description=room.description,
        max_users=room.max_users,
    )
