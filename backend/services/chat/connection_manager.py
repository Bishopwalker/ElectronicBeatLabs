"""
Chat WebSocket Connection Manager.

Handles multi-room WebSocket connections, user presence, and message broadcasting.
"""

from fastapi import WebSocket
from typing import Dict, List, Optional, Set
import asyncio
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Maximum users per room
MAX_ROOM_USERS = 50


class ChatConnectionManager:
    """
    Manages WebSocket connections across multiple chat rooms.

    Tracks:
        room_connections: room_id -> {user_id -> WebSocket}
        user_connections: user_id -> WebSocket (for direct messaging)
        active_users: user_id -> user_data dict
        typing_users: room_id -> {user_id -> timestamp}
        user_rooms: user_id -> Set[room_id]
    """

    def __init__(self):
        """Initialize empty connection tracking structures."""
        self.room_connections: Dict[str, Dict[str, WebSocket]] = {}
        self.user_connections: Dict[str, WebSocket] = {}
        self.active_users: Dict[str, dict] = {}
        self.typing_users: Dict[str, Dict[str, float]] = {}
        self.user_rooms: Dict[str, Set[str]] = {}
        self._lock = asyncio.Lock()

    async def register_user(
        self,
        websocket: WebSocket,
        user_id: str,
        user_data: dict
    ) -> None:
        """
        Register a new user connection.

        Args:
            websocket: The WebSocket connection
            user_id: Unique user identifier
            user_data: User profile data dict
        """
        async with self._lock:
            self.user_connections[user_id] = websocket
            self.active_users[user_id] = user_data
            self.user_rooms[user_id] = set()
            logger.info(f"User registered: {user_data.get('nickname', user_id)}")

    async def unregister_user(self, user_id: str) -> List[str]:
        """
        Remove user and leave all rooms.

        Args:
            user_id: User to unregister

        Returns:
            List of room_ids the user was in (for broadcasting leave events)
        """
        async with self._lock:
            rooms_left = list(self.user_rooms.get(user_id, set()))

            # Remove from all rooms
            for room_id in rooms_left:
                if room_id in self.room_connections:
                    self.room_connections[room_id].pop(user_id, None)
                    # Clean up empty rooms
                    if not self.room_connections[room_id]:
                        del self.room_connections[room_id]

                # Remove typing status
                if room_id in self.typing_users:
                    self.typing_users[room_id].pop(user_id, None)

            # Remove user tracking
            self.user_connections.pop(user_id, None)
            user_data = self.active_users.pop(user_id, {})
            self.user_rooms.pop(user_id, None)

            logger.info(f"User unregistered: {user_data.get('nickname', user_id)}")
            return rooms_left

    async def join_room(self, user_id: str, room_id: str) -> bool:
        """
        Add user to a room.

        Args:
            user_id: User joining
            room_id: Room to join

        Returns:
            True if joined successfully, False if room is full
        """
        async with self._lock:
            # Check room capacity
            if room_id in self.room_connections:
                if len(self.room_connections[room_id]) >= MAX_ROOM_USERS:
                    logger.warning(f"Room {room_id} is full (max {MAX_ROOM_USERS})")
                    return False

            # Get user's websocket
            websocket = self.user_connections.get(user_id)
            if not websocket:
                logger.error(f"User {user_id} not connected")
                return False

            # Add to room
            if room_id not in self.room_connections:
                self.room_connections[room_id] = {}
            self.room_connections[room_id][user_id] = websocket
            self.user_rooms.setdefault(user_id, set()).add(room_id)

            logger.info(f"User {user_id} joined room {room_id}")
            return True

    async def leave_room(self, user_id: str, room_id: str) -> None:
        """
        Remove user from a room.

        Args:
            user_id: User leaving
            room_id: Room to leave
        """
        async with self._lock:
            if room_id in self.room_connections:
                self.room_connections[room_id].pop(user_id, None)
                if not self.room_connections[room_id]:
                    del self.room_connections[room_id]

            if user_id in self.user_rooms:
                self.user_rooms[user_id].discard(room_id)

            # Clear typing status
            if room_id in self.typing_users:
                self.typing_users[room_id].pop(user_id, None)

            logger.info(f"User {user_id} left room {room_id}")

    async def broadcast_to_room(
        self,
        room_id: str,
        message: dict,
        exclude_user_id: Optional[str] = None
    ) -> None:
        """
        Send message to all users in a room.

        Args:
            room_id: Target room
            message: Message dict to send
            exclude_user_id: Optional user to exclude from broadcast
        """
        connections = self.room_connections.get(room_id, {})
        message_json = json.dumps(message)

        failed_users = []
        for user_id, websocket in connections.items():
            if user_id == exclude_user_id:
                continue
            try:
                await websocket.send_text(message_json)
            except Exception as e:
                logger.warning(f"Failed to send to {user_id}: {e}")
                failed_users.append(user_id)

        # Clean up failed connections
        for user_id in failed_users:
            await self.unregister_user(user_id)

    async def send_to_user(self, user_id: str, message: dict) -> bool:
        """
        Send message to a specific user.

        Args:
            user_id: Target user
            message: Message dict to send

        Returns:
            True if sent successfully
        """
        websocket = self.user_connections.get(user_id)
        if not websocket:
            return False

        try:
            await websocket.send_text(json.dumps(message))
            return True
        except Exception as e:
            logger.warning(f"Failed to send to {user_id}: {e}")
            await self.unregister_user(user_id)
            return False

    def get_room_users(self, room_id: str) -> List[dict]:
        """
        Get all user data for users in a room.

        Args:
            room_id: Room to query

        Returns:
            List of user data dicts
        """
        user_ids = self.room_connections.get(room_id, {}).keys()
        return [
            self.active_users[uid]
            for uid in user_ids
            if uid in self.active_users
        ]

    def get_room_user_count(self, room_id: str) -> int:
        """Get number of users in a room."""
        return len(self.room_connections.get(room_id, {}))

    def is_room_full(self, room_id: str) -> bool:
        """Check if room has reached max capacity."""
        return self.get_room_user_count(room_id) >= MAX_ROOM_USERS

    async def set_typing(
        self,
        user_id: str,
        room_id: str,
        is_typing: bool
    ) -> None:
        """
        Update typing status and broadcast to room.

        Args:
            user_id: User typing
            room_id: Room user is typing in
            is_typing: True if started typing, False if stopped
        """
        async with self._lock:
            if room_id not in self.typing_users:
                self.typing_users[room_id] = {}

            if is_typing:
                self.typing_users[room_id][user_id] = datetime.now().timestamp()
            else:
                self.typing_users[room_id].pop(user_id, None)

        # Get user nickname for broadcast
        user_data = self.active_users.get(user_id, {})
        nickname = user_data.get("nickname", "Someone")

        msg_type = "user_typing" if is_typing else "user_stopped_typing"
        await self.broadcast_to_room(
            room_id,
            {
                "type": msg_type,
                "data": {
                    "roomId": room_id,
                    "userId": user_id,
                    "nickname": nickname,
                },
                "timestamp": datetime.now().isoformat(),
            },
            exclude_user_id=user_id
        )

    async def update_user_status(
        self,
        user_id: str,
        status: str,
        away_message: Optional[str] = None
    ) -> None:
        """
        Update user status and broadcast to all rooms.

        Args:
            user_id: User updating status
            status: New status ("online", "away", "offline")
            away_message: Optional away message
        """
        if user_id in self.active_users:
            self.active_users[user_id]["status"] = status
            self.active_users[user_id]["awayMessage"] = away_message

        # Broadcast to all rooms user is in
        message = {
            "type": "user_status_changed",
            "data": {
                "userId": user_id,
                "status": status,
                "awayMessage": away_message,
            },
            "timestamp": datetime.now().isoformat(),
        }

        for room_id in self.user_rooms.get(user_id, set()):
            await self.broadcast_to_room(room_id, message, exclude_user_id=user_id)

    def get_typing_users(self, room_id: str) -> List[str]:
        """Get list of user_ids currently typing in a room."""
        return list(self.typing_users.get(room_id, {}).keys())

    def get_user_data(self, user_id: str) -> Optional[dict]:
        """Get user data by ID."""
        return self.active_users.get(user_id)
