"""
Chat User Service - User Profile Management.

Handles creation, retrieval, and updates for chat user profiles.
Supports both OAuth (verified) and anonymous users.
"""

from sqlalchemy.orm import Session
from typing import Optional, Tuple
import logging
import uuid

from database.chat.models import ChatUser

logger = logging.getLogger(__name__)


class UserService:
    """
    Service for chat user profile operations.

    Handles:
        - Creating OAuth and anonymous users
        - Profile retrieval by various identifiers
        - Profile updates (nickname, color, avatar, status)
    """

    def __init__(self, db: Session):
        """
        Initialize with database session.

        Args:
            db: SQLAlchemy session
        """
        self.db = db

    def create_user(
        self,
        nickname: str,
        user_id: Optional[str] = None,
        is_verified: bool = False,
        session_token: Optional[str] = None,
        chat_color: str = "#FFFFFF",
        avatar_url: Optional[str] = None
    ) -> ChatUser:
        """
        Create a new chat user profile.

        Args:
            nickname: Display name
            user_id: Optional link to OAuth User
            is_verified: True for OAuth users
            session_token: For anonymous user sessions
            chat_color: User's chat color (hex)
            avatar_url: Optional avatar URL

        Returns:
            Created ChatUser instance
        """
        chat_user = ChatUser(
            nickname=nickname,
            user_id=user_id,
            is_verified=is_verified,
            is_anonymous=user_id is None,
            session_token=session_token or str(uuid.uuid4()),
            chat_color=chat_color,
            avatar_url=avatar_url,
        )
        self.db.add(chat_user)
        self.db.commit()
        self.db.refresh(chat_user)

        logger.info(f"Created chat user: {nickname} (verified={is_verified})")
        return chat_user

    def get_or_create(
        self,
        nickname: str,
        user_id: Optional[str] = None,
        session_token: Optional[str] = None
    ) -> Tuple[ChatUser, bool]:
        """
        Get existing or create new chat user.

        Args:
            nickname: Display name
            user_id: Optional OAuth user ID
            session_token: Optional session token

        Returns:
            Tuple of (ChatUser, created: bool)
        """
        # Try to find by OAuth user_id first
        if user_id:
            existing = self.get_by_user_id(user_id)
            if existing:
                return existing, False

        # Try to find by session token
        if session_token:
            existing = self.get_by_session(session_token)
            if existing:
                return existing, False

        # Create new user
        chat_user = self.create_user(
            nickname=nickname,
            user_id=user_id,
            is_verified=user_id is not None,
            session_token=session_token,
        )
        return chat_user, True

    def get_by_id(self, chat_user_id: str) -> Optional[ChatUser]:
        """Get chat user by ID."""
        return self.db.query(ChatUser).filter(
            ChatUser.id == chat_user_id
        ).first()

    def get_by_session(self, session_token: str) -> Optional[ChatUser]:
        """Get chat user by session token."""
        return self.db.query(ChatUser).filter(
            ChatUser.session_token == session_token
        ).first()

    def get_by_user_id(self, user_id: str) -> Optional[ChatUser]:
        """Get chat user by OAuth user ID."""
        return self.db.query(ChatUser).filter(
            ChatUser.user_id == user_id
        ).first()

    def update_profile(
        self,
        chat_user_id: str,
        nickname: Optional[str] = None,
        chat_color: Optional[str] = None,
        avatar_url: Optional[str] = None,
        status: Optional[str] = None,
        away_message: Optional[str] = None
    ) -> Optional[ChatUser]:
        """
        Update chat user profile.

        Args:
            chat_user_id: User to update
            nickname: New nickname
            chat_color: New chat color (hex)
            avatar_url: New avatar URL
            status: New status
            away_message: New away message

        Returns:
            Updated ChatUser or None if not found
        """
        chat_user = self.get_by_id(chat_user_id)
        if not chat_user:
            return None

        if nickname is not None:
            chat_user.nickname = nickname
        if chat_color is not None:
            chat_user.chat_color = chat_color
        if avatar_url is not None:
            chat_user.avatar_url = avatar_url
        if status is not None:
            chat_user.status = status
        if away_message is not None:
            chat_user.away_message = away_message

        self.db.commit()
        self.db.refresh(chat_user)

        logger.info(f"Updated chat user: {chat_user.nickname}")
        return chat_user

    def set_status(
        self,
        chat_user_id: str,
        status: str,
        away_message: Optional[str] = None
    ) -> Optional[ChatUser]:
        """
        Set user status (online/away/offline).

        Args:
            chat_user_id: User to update
            status: New status
            away_message: Optional away message

        Returns:
            Updated ChatUser or None
        """
        return self.update_profile(
            chat_user_id,
            status=status,
            away_message=away_message
        )

    def update_last_seen(self, chat_user_id: str) -> None:
        """Update user's last_seen timestamp."""
        from datetime import datetime
        chat_user = self.get_by_id(chat_user_id)
        if chat_user:
            chat_user.last_seen = datetime.utcnow()
            self.db.commit()
