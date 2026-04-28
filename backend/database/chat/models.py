"""
Chat Database Models - AOL/AIM Style Real-Time Chat

SQLAlchemy models for:
- ChatRoom: Global, topic, and DM rooms (max 50 users)
- ChatUser: User profiles with nickname, color, status, role, IP tracking
- ChatMessage: Messages with sender styling preserved
- ChatRoomMember: Room membership tracking
"""

from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from database.base import Base


class UserRole(enum.Enum):
    """
    User roles for chat moderation and access control.

    Hierarchy (highest to lowest):
        - ADMIN: Full system control, can manage all users and rooms
        - MODERATOR: Can mute/kick users, delete messages
        - ADULT: Verified adult user (18+), full feature access
        - MINOR: Age-restricted user, limited features, monitored
    """
    ADMIN = "admin"
    MODERATOR = "moderator"
    ADULT = "adult"
    MINOR = "minor"


class ChatRoom(Base):
    """
    Chat room supporting global, topic, and private DM rooms.

    Room Types:
        - "global": Main public chat room
        - "topic": Topic-specific rooms (focus, meditation, etc.)
        - "dm": Private direct message rooms between two users

    Attributes:
        id: Unique room identifier (UUID)
        name: Display name (e.g., "Global Chat", "Focus Room")
        room_type: One of "global", "topic", "dm"
        slug: URL-friendly identifier (unique)
        description: Optional room description
        max_users: Maximum users allowed (default 50)
        is_active: Whether room is active
        dm_participant_ids: For DMs, sorted "user1:user2" format
        created_at: Room creation timestamp
    """
    __tablename__ = "chat_rooms"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, index=True)
    room_type = Column(String(20), nullable=False, index=True)
    slug = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    max_users = Column(Integer, default=50)
    is_active = Column(Boolean, default=True)
    dm_participant_ids = Column(String(100), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    messages = relationship(
        "ChatMessage",
        back_populates="room",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )
    members = relationship(
        "ChatRoomMember",
        back_populates="room",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<ChatRoom {self.slug} ({self.room_type})>"


class ChatUser(Base):
    """
    Chat user profile supporting OAuth and anonymous users.

    OAuth users (is_verified=True) are linked to the main User model.
    Anonymous users use session_token for identification.

    Attributes:
        id: Unique chat user ID (UUID)
        user_id: Optional FK to main users table (OAuth users)
        nickname: Display name in chat
        is_verified: True for OAuth users (green badge)
        is_anonymous: True for non-OAuth users
        avatar_url: Optional buddy icon URL
        chat_color: User's chat text color (hex)
        away_message: Optional away message
        status: "online", "away", or "offline"
        last_seen: Last activity timestamp
        session_token: For anonymous user sessions
        created_at: Profile creation timestamp
    """
    __tablename__ = "chat_users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    nickname = Column(String(50), nullable=False, index=True)
    is_verified = Column(Boolean, default=False)
    is_anonymous = Column(Boolean, default=True)
    avatar_url = Column(String(500), nullable=True)
    chat_color = Column(String(7), default="#FFFFFF")
    away_message = Column(String(200), nullable=True)
    status = Column(String(20), default="online", index=True)
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    session_token = Column(String(100), unique=True, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", backref="chat_profile")
    messages = relationship("ChatMessage", back_populates="sender")
    room_memberships = relationship("ChatRoomMember", back_populates="chat_user")

    def __repr__(self) -> str:
        badge = "✓" if self.is_verified else ""
        return f"<ChatUser {self.nickname}{badge}>"

    def to_dict(self) -> dict:
        """Convert to dictionary for WebSocket messages."""
        return {
            "id": self.id,
            "nickname": self.nickname,
            "isVerified": self.is_verified,
            "isAnonymous": self.is_anonymous,
            "avatarUrl": self.avatar_url,
            "chatColor": self.chat_color,
            "status": self.status,
            "awayMessage": self.away_message,
        }


class ChatMessage(Base):
    """
    Individual chat message with AOL/AIM styling.

    Sender information is preserved at send time to maintain
    message appearance even if user changes profile later.

    Attributes:
        id: Unique message ID (UUID)
        room_id: FK to chat room
        sender_id: FK to chat user
        content: Message text
        message_type: "text", "system", or "emote"
        sender_nickname: Preserved sender nickname
        sender_color: Preserved sender color
        sender_is_verified: Preserved verification status
        created_at: Message timestamp
    """
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id = Column(
        String, ForeignKey("chat_rooms.id"), nullable=False, index=True
    )
    sender_id = Column(
        String, ForeignKey("chat_users.id"), nullable=False, index=True
    )
    content = Column(Text, nullable=False)
    message_type = Column(String(20), default="text")
    sender_nickname = Column(String(50), nullable=False)
    sender_color = Column(String(7), default="#FFFFFF")
    sender_is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    room = relationship("ChatRoom", back_populates="messages")
    sender = relationship("ChatUser", back_populates="messages")

    def __repr__(self) -> str:
        preview = self.content[:20] + "..." if len(self.content) > 20 else self.content
        return f"<ChatMessage {self.sender_nickname}: {preview}>"

    def to_dict(self) -> dict:
        """Convert to dictionary for WebSocket messages."""
        return {
            "id": self.id,
            "roomId": self.room_id,
            "senderId": self.sender_id,
            "content": self.content,
            "messageType": self.message_type,
            "senderNickname": self.sender_nickname,
            "senderColor": self.sender_color,
            "senderIsVerified": self.sender_is_verified,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class ChatRoomMember(Base):
    """
    Tracks room membership and user presence.

    Attributes:
        id: Unique membership ID (UUID)
        room_id: FK to chat room
        chat_user_id: FK to chat user
        is_active: Currently in room
        joined_at: When user joined
        left_at: When user left (null if active)
    """
    __tablename__ = "chat_room_members"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id = Column(
        String, ForeignKey("chat_rooms.id"), nullable=False, index=True
    )
    chat_user_id = Column(
        String, ForeignKey("chat_users.id"), nullable=False, index=True
    )
    is_active = Column(Boolean, default=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    left_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    room = relationship("ChatRoom", back_populates="members")
    chat_user = relationship("ChatUser", back_populates="room_memberships")

    def __repr__(self) -> str:
        status = "active" if self.is_active else "left"
        return f"<ChatRoomMember {self.chat_user_id} in {self.room_id} ({status})>"
