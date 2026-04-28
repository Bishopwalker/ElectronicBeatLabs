"""
Chat Message Service - Message CRUD with 100-limit Cleanup.

Handles sending messages, retrieving history, and enforcing
the 100-message-per-room limit.
"""

from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
import logging

from database.chat.models import ChatMessage, ChatUser

logger = logging.getLogger(__name__)

# Maximum messages to keep per room
MAX_MESSAGES_PER_ROOM = 100


class MessageService:
    """
    Service for chat message operations.

    Handles:
        - Sending messages with sender info preservation
        - Message history retrieval
        - 100-message limit enforcement
    """

    def __init__(self, db: Session):
        """
        Initialize with database session.

        Args:
            db: SQLAlchemy session
        """
        self.db = db

    def send_message(
        self,
        room_id: str,
        sender_id: str,
        content: str,
        message_type: str = "text"
    ) -> Optional[ChatMessage]:
        """
        Send a message to a room.

        Preserves sender info (nickname, color, verified status) at send time.
        Enforces 100-message limit after sending.

        Args:
            room_id: Target room
            sender_id: Sender's chat_user_id
            content: Message content
            message_type: "text", "system", or "emote"

        Returns:
            Created ChatMessage or None if sender not found
        """
        # Get sender info
        sender = self.db.query(ChatUser).filter(
            ChatUser.id == sender_id
        ).first()

        if not sender:
            logger.error(f"Sender not found: {sender_id}")
            return None

        # Create message with preserved sender info
        message = ChatMessage(
            room_id=room_id,
            sender_id=sender_id,
            content=content,
            message_type=message_type,
            sender_nickname=sender.nickname,
            sender_color=sender.chat_color,
            sender_is_verified=sender.is_verified,
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)

        # Enforce message limit
        self._enforce_limit(room_id)

        logger.debug(f"Message sent in {room_id} by {sender.nickname}")
        return message

    def send_system_message(
        self,
        room_id: str,
        content: str
    ) -> ChatMessage:
        """
        Send a system message (join/leave announcements, etc).

        Args:
            room_id: Target room
            content: System message content

        Returns:
            Created system ChatMessage
        """
        message = ChatMessage(
            room_id=room_id,
            sender_id="system",
            content=content,
            message_type="system",
            sender_nickname="System",
            sender_color="#888888",
            sender_is_verified=False,
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)

        return message

    def get_history(
        self,
        room_id: str,
        limit: int = 100,
        before_message_id: Optional[str] = None
    ) -> List[ChatMessage]:
        """
        Get message history for a room.

        Args:
            room_id: Room to query
            limit: Max messages to return (default 100)
            before_message_id: Optional cursor for pagination

        Returns:
            List of ChatMessages (newest first)
        """
        query = self.db.query(ChatMessage).filter(
            ChatMessage.room_id == room_id
        )

        if before_message_id:
            # Get the timestamp of the cursor message
            cursor_msg = self.db.query(ChatMessage).filter(
                ChatMessage.id == before_message_id
            ).first()
            if cursor_msg:
                query = query.filter(
                    ChatMessage.created_at < cursor_msg.created_at
                )

        return query.order_by(
            desc(ChatMessage.created_at)
        ).limit(min(limit, MAX_MESSAGES_PER_ROOM)).all()

    def get_recent(self, room_id: str, count: int = 50) -> List[ChatMessage]:
        """
        Get most recent messages for a room.

        Args:
            room_id: Room to query
            count: Number of messages

        Returns:
            List of ChatMessages (oldest first for display)
        """
        messages = self.db.query(ChatMessage).filter(
            ChatMessage.room_id == room_id
        ).order_by(
            desc(ChatMessage.created_at)
        ).limit(count).all()

        # Reverse to get oldest first for display
        return list(reversed(messages))

    def _enforce_limit(self, room_id: str) -> int:
        """
        Delete oldest messages if room exceeds 100-message limit.

        Args:
            room_id: Room to clean up

        Returns:
            Number of messages deleted
        """
        # Count messages in room
        count = self.db.query(ChatMessage).filter(
            ChatMessage.room_id == room_id
        ).count()

        if count <= MAX_MESSAGES_PER_ROOM:
            return 0

        # Calculate how many to delete
        to_delete = count - MAX_MESSAGES_PER_ROOM

        # Get IDs of oldest messages
        oldest_messages = self.db.query(ChatMessage.id).filter(
            ChatMessage.room_id == room_id
        ).order_by(
            ChatMessage.created_at
        ).limit(to_delete).all()

        old_ids = [m.id for m in oldest_messages]

        # Delete oldest messages
        deleted = self.db.query(ChatMessage).filter(
            ChatMessage.id.in_(old_ids)
        ).delete(synchronize_session=False)

        self.db.commit()

        if deleted > 0:
            logger.info(f"Cleaned up {deleted} old messages from room {room_id}")

        return deleted

    def get_message_count(self, room_id: str) -> int:
        """Get total message count for a room."""
        return self.db.query(ChatMessage).filter(
            ChatMessage.room_id == room_id
        ).count()
