"""
Chat Room Service - Room CRUD Operations.

Handles room creation, querying, membership, and DM room management.
Enforces 50-user room limit.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import logging

from database.chat.models import ChatRoom, ChatRoomMember

logger = logging.getLogger(__name__)

# Maximum users per room
MAX_ROOM_USERS = 50


class RoomService:
    """
    Service for chat room operations.

    Handles:
        - Room CRUD
        - Membership management with 50-user limit
        - DM room creation/retrieval
    """

    def __init__(self, db: Session):
        """
        Initialize with database session.

        Args:
            db: SQLAlchemy session
        """
        self.db = db

    def get_available_rooms(self) -> List[ChatRoom]:
        """
        Get all active non-DM rooms.

        Returns:
            List of public/topic ChatRooms
        """
        return self.db.query(ChatRoom).filter(
            ChatRoom.is_active == True,
            ChatRoom.room_type != "dm"
        ).order_by(ChatRoom.room_type, ChatRoom.name).all()

    def get_by_id(self, room_id: str) -> Optional[ChatRoom]:
        """Get room by ID."""
        return self.db.query(ChatRoom).filter(
            ChatRoom.id == room_id
        ).first()

    def get_by_slug(self, slug: str) -> Optional[ChatRoom]:
        """Get room by slug."""
        return self.db.query(ChatRoom).filter(
            ChatRoom.slug == slug
        ).first()

    def get_member_count(self, room_id: str) -> int:
        """Get count of active members in a room."""
        return self.db.query(ChatRoomMember).filter(
            ChatRoomMember.room_id == room_id,
            ChatRoomMember.is_active == True
        ).count()

    def can_join(self, room_id: str) -> bool:
        """
        Check if room has space (under 50 users).

        Args:
            room_id: Room to check

        Returns:
            True if room has space
        """
        room = self.get_by_id(room_id)
        if not room:
            return False

        current_count = self.get_member_count(room_id)
        return current_count < room.max_users

    def join_room(
        self,
        room_id: str,
        chat_user_id: str
    ) -> Optional[ChatRoomMember]:
        """
        Add user to room membership.

        Args:
            room_id: Room to join
            chat_user_id: User joining

        Returns:
            ChatRoomMember or None if room is full/doesn't exist
        """
        if not self.can_join(room_id):
            logger.warning(f"Cannot join room {room_id}: full or not found")
            return None

        # Check if already a member
        existing = self.db.query(ChatRoomMember).filter(
            ChatRoomMember.room_id == room_id,
            ChatRoomMember.chat_user_id == chat_user_id
        ).first()

        if existing:
            # Reactivate if previously left
            if not existing.is_active:
                existing.is_active = True
                existing.left_at = None
                self.db.commit()
                self.db.refresh(existing)
            return existing

        # Create new membership
        member = ChatRoomMember(
            room_id=room_id,
            chat_user_id=chat_user_id,
            is_active=True
        )
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)

        logger.info(f"User {chat_user_id} joined room {room_id}")
        return member

    def leave_room(self, room_id: str, chat_user_id: str) -> None:
        """
        Remove user from room membership.

        Args:
            room_id: Room to leave
            chat_user_id: User leaving
        """
        from datetime import datetime

        member = self.db.query(ChatRoomMember).filter(
            ChatRoomMember.room_id == room_id,
            ChatRoomMember.chat_user_id == chat_user_id,
            ChatRoomMember.is_active == True
        ).first()

        if member:
            member.is_active = False
            member.left_at = datetime.utcnow()
            self.db.commit()
            logger.info(f"User {chat_user_id} left room {room_id}")

    def get_room_members(self, room_id: str) -> List[ChatRoomMember]:
        """
        Get all active members of a room.

        Args:
            room_id: Room to query

        Returns:
            List of active ChatRoomMembers
        """
        return self.db.query(ChatRoomMember).filter(
            ChatRoomMember.room_id == room_id,
            ChatRoomMember.is_active == True
        ).all()

    def get_or_create_dm_room(
        self,
        user1_id: str,
        user2_id: str
    ) -> ChatRoom:
        """
        Get existing DM room between two users or create new one.

        Args:
            user1_id: First user's chat_user_id
            user2_id: Second user's chat_user_id

        Returns:
            DM ChatRoom
        """
        # Sort IDs for consistent lookup
        sorted_ids = ":".join(sorted([user1_id, user2_id]))

        # Look for existing DM room
        existing = self.db.query(ChatRoom).filter(
            ChatRoom.room_type == "dm",
            ChatRoom.dm_participant_ids == sorted_ids
        ).first()

        if existing:
            return existing

        # Create new DM room
        dm_room = ChatRoom(
            name=f"DM-{sorted_ids[:8]}",
            slug=f"dm-{sorted_ids[:16]}",
            room_type="dm",
            description="Private conversation",
            max_users=2,
            dm_participant_ids=sorted_ids
        )
        self.db.add(dm_room)
        self.db.commit()
        self.db.refresh(dm_room)

        logger.info(f"Created DM room between {user1_id} and {user2_id}")
        return dm_room

    def get_user_dm_rooms(self, chat_user_id: str) -> List[ChatRoom]:
        """
        Get all DM rooms for a user.

        Args:
            chat_user_id: User to query

        Returns:
            List of DM rooms
        """
        return self.db.query(ChatRoom).filter(
            ChatRoom.room_type == "dm",
            ChatRoom.dm_participant_ids.contains(chat_user_id)
        ).all()
