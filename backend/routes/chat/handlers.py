"""
Chat WebSocket Message Handlers.

Individual handlers for each message type, separated for maintainability.
"""

from fastapi import WebSocket
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import logging

from services.chat import (
    ChatConnectionManager,
    RoomService,
    MessageService,
    UserService,
)

logger = logging.getLogger(__name__)


async def send_response(
    websocket: WebSocket,
    msg_type: str,
    data: dict
) -> None:
    """Send JSON response to client."""
    import json
    await websocket.send_text(json.dumps({
        "type": msg_type,
        "data": data,
        "timestamp": datetime.now().isoformat(),
    }))


async def send_error(
    websocket: WebSocket,
    message: str,
    code: str = "error"
) -> None:
    """Send error response to client."""
    await send_response(websocket, "chat_error", {
        "code": code,
        "message": message,
    })


async def handle_auth(
    data: dict,
    session_id: str,
    websocket: WebSocket,
    manager: ChatConnectionManager,
    db: Session
) -> Optional[str]:
    """
    Handle user authentication.

    Creates or retrieves chat user, registers with connection manager.

    Args:
        data: {token?, nickname, color?}
        session_id: WebSocket session ID
        websocket: WebSocket connection
        manager: Connection manager
        db: Database session

    Returns:
        chat_user_id if successful
    """
    nickname = data.get("nickname", f"User-{session_id[:6]}")
    token = data.get("token")
    color = data.get("color", "#FFFFFF")

    user_service = UserService(db)
    room_service = RoomService(db)

    # Get or create user
    # TODO: Validate OAuth token if provided
    user_id = None  # Would come from token validation
    is_verified = token is not None

    chat_user, created = user_service.get_or_create(
        nickname=nickname,
        user_id=user_id,
        session_token=session_id,
    )

    if color and color != chat_user.chat_color:
        user_service.update_profile(chat_user.id, chat_color=color)

    # Register with connection manager
    await manager.register_user(websocket, chat_user.id, chat_user.to_dict())

    # Get available rooms
    rooms = room_service.get_available_rooms()
    rooms_data = [
        {
            "id": r.id,
            "name": r.name,
            "roomType": r.room_type,
            "slug": r.slug,
            "description": r.description,
            "maxUsers": r.max_users,
            "userCount": manager.get_room_user_count(r.id),
        }
        for r in rooms
    ]

    await send_response(websocket, "chat_auth_success", {
        "user": chat_user.to_dict(),
        "rooms": rooms_data,
    })

    logger.info(f"Auth success: {nickname} (verified={is_verified})")
    return chat_user.id


async def handle_join_room(
    data: dict,
    user_id: str,
    websocket: WebSocket,
    manager: ChatConnectionManager,
    db: Session
) -> None:
    """
    Handle room join request.

    Checks capacity, joins room, broadcasts user_joined, sends room data.
    """
    room_id = data.get("room_id")
    if not room_id:
        await send_error(websocket, "room_id required")
        return

    room_service = RoomService(db)
    message_service = MessageService(db)

    # Check if room exists and has space
    room = room_service.get_by_id(room_id)
    if not room:
        await send_error(websocket, "Room not found", "room_not_found")
        return

    if manager.is_room_full(room_id):
        await send_error(websocket, "Room is full (max 50 users)", "room_full")
        return

    # Join in connection manager
    if not await manager.join_room(user_id, room_id):
        await send_error(websocket, "Failed to join room")
        return

    # Join in database
    user_service = UserService(db)
    chat_user = user_service.get_by_id(user_id)
    room_service.join_room(room_id, user_id)

    # Get room data
    users = manager.get_room_users(room_id)
    recent_messages = message_service.get_recent(room_id, 50)

    # Send room_joined to joining user
    await send_response(websocket, "room_joined", {
        "room": {
            "id": room.id,
            "name": room.name,
            "roomType": room.room_type,
            "slug": room.slug,
            "description": room.description,
            "maxUsers": room.max_users,
        },
        "users": users,
        "recentMessages": [m.to_dict() for m in recent_messages],
    })

    # Broadcast user_joined to others (triggers door sound)
    user_data = manager.get_user_data(user_id)
    await manager.broadcast_to_room(
        room_id,
        {
            "type": "user_joined",
            "data": {"roomId": room_id, "user": user_data},
            "timestamp": datetime.now().isoformat(),
        },
        exclude_user_id=user_id
    )

    logger.info(f"User {user_id} joined room {room.name}")


async def handle_leave_room(
    data: dict,
    user_id: str,
    websocket: WebSocket,
    manager: ChatConnectionManager,
    db: Session
) -> None:
    """Handle room leave request."""
    room_id = data.get("room_id")
    if not room_id:
        return

    user_data = manager.get_user_data(user_id)
    nickname = user_data.get("nickname", "Unknown") if user_data else "Unknown"

    # Leave in connection manager
    await manager.leave_room(user_id, room_id)

    # Leave in database
    room_service = RoomService(db)
    room_service.leave_room(room_id, user_id)

    # Confirm to user
    await send_response(websocket, "room_left", {"roomId": room_id})

    # Broadcast user_left to others (triggers door sound)
    await manager.broadcast_to_room(
        room_id,
        {
            "type": "user_left",
            "data": {"roomId": room_id, "userId": user_id, "nickname": nickname},
            "timestamp": datetime.now().isoformat(),
        }
    )


async def handle_send_message(
    data: dict,
    user_id: str,
    websocket: WebSocket,
    manager: ChatConnectionManager,
    db: Session
) -> None:
    """Handle sending a message to a room."""
    room_id = data.get("room_id")
    content = data.get("content", "").strip()

    if not room_id or not content:
        await send_error(websocket, "room_id and content required")
        return

    message_service = MessageService(db)
    message = message_service.send_message(room_id, user_id, content)

    if not message:
        await send_error(websocket, "Failed to send message")
        return

    # Broadcast to all room members
    await manager.broadcast_to_room(
        room_id,
        {
            "type": "new_message",
            "data": message.to_dict(),
            "timestamp": datetime.now().isoformat(),
        }
    )


async def handle_typing_start(
    data: dict,
    user_id: str,
    manager: ChatConnectionManager
) -> None:
    """Handle typing indicator start."""
    room_id = data.get("room_id")
    if room_id:
        await manager.set_typing(user_id, room_id, True)


async def handle_typing_stop(
    data: dict,
    user_id: str,
    manager: ChatConnectionManager
) -> None:
    """Handle typing indicator stop."""
    room_id = data.get("room_id")
    if room_id:
        await manager.set_typing(user_id, room_id, False)


async def handle_set_away(
    data: dict,
    user_id: str,
    websocket: WebSocket,
    manager: ChatConnectionManager,
    db: Session
) -> None:
    """Handle away status."""
    away_message = data.get("message")

    user_service = UserService(db)
    user_service.set_status(user_id, "away", away_message)

    await manager.update_user_status(user_id, "away", away_message)
    await send_response(websocket, "status_updated", {
        "status": "away",
        "awayMessage": away_message,
    })


async def handle_set_online(
    data: dict,
    user_id: str,
    websocket: WebSocket,
    manager: ChatConnectionManager,
    db: Session
) -> None:
    """Handle back online status."""
    user_service = UserService(db)
    user_service.set_status(user_id, "online")

    await manager.update_user_status(user_id, "online")
    await send_response(websocket, "status_updated", {"status": "online"})


async def handle_get_history(
    data: dict,
    user_id: str,
    websocket: WebSocket,
    db: Session
) -> None:
    """Handle message history request."""
    room_id = data.get("room_id")
    before_id = data.get("before_message_id")

    if not room_id:
        await send_error(websocket, "room_id required")
        return

    message_service = MessageService(db)
    messages = message_service.get_history(room_id, before_message_id=before_id)

    await send_response(websocket, "message_history", {
        "roomId": room_id,
        "messages": [m.to_dict() for m in messages],
    })


async def handle_get_rooms(
    data: dict,
    websocket: WebSocket,
    manager: ChatConnectionManager,
    db: Session
) -> None:
    """Handle room list request."""
    room_service = RoomService(db)
    rooms = room_service.get_available_rooms()

    rooms_data = [
        {
            "id": r.id,
            "name": r.name,
            "roomType": r.room_type,
            "slug": r.slug,
            "description": r.description,
            "maxUsers": r.max_users,
            "userCount": manager.get_room_user_count(r.id),
        }
        for r in rooms
    ]

    await send_response(websocket, "room_list", {"rooms": rooms_data})


async def handle_get_users(
    data: dict,
    user_id: str,
    websocket: WebSocket,
    manager: ChatConnectionManager
) -> None:
    """Handle room user list request."""
    room_id = data.get("room_id")
    if not room_id:
        await send_error(websocket, "room_id required")
        return

    users = manager.get_room_users(room_id)
    await send_response(websocket, "users_list", {
        "roomId": room_id,
        "users": users,
    })


async def handle_create_dm(
    data: dict,
    user_id: str,
    websocket: WebSocket,
    manager: ChatConnectionManager,
    db: Session
) -> None:
    """Handle DM room creation."""
    target_user_id = data.get("target_user_id")
    if not target_user_id:
        await send_error(websocket, "target_user_id required")
        return

    room_service = RoomService(db)
    dm_room = room_service.get_or_create_dm_room(user_id, target_user_id)

    # Auto-join the DM room
    await manager.join_room(user_id, dm_room.id)

    await send_response(websocket, "dm_created", {
        "room": {
            "id": dm_room.id,
            "name": dm_room.name,
            "roomType": "dm",
            "slug": dm_room.slug,
        }
    })


async def handle_update_profile(
    data: dict,
    user_id: str,
    websocket: WebSocket,
    manager: ChatConnectionManager,
    db: Session
) -> None:
    """Handle profile update."""
    user_service = UserService(db)

    chat_user = user_service.update_profile(
        user_id,
        nickname=data.get("nickname"),
        chat_color=data.get("color"),
        avatar_url=data.get("avatarUrl"),
    )

    if chat_user:
        # Update in connection manager
        manager.active_users[user_id] = chat_user.to_dict()

        await send_response(websocket, "profile_updated", {
            "user": chat_user.to_dict(),
        })
