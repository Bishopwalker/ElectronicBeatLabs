"""
Chat WebSocket Endpoint - Real-Time Chat for EBL.

Provides WebSocket endpoint at /ws/chat/{session_id}
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
import json
import logging
from typing import Optional

from database import get_db
from services.chat import ChatConnectionManager
from .handlers import (
    handle_auth,
    handle_join_room,
    handle_leave_room,
    handle_send_message,
    handle_typing_start,
    handle_typing_stop,
    handle_set_away,
    handle_set_online,
    handle_get_history,
    handle_get_rooms,
    handle_get_users,
    handle_create_dm,
    handle_update_profile,
    send_error,
)

logger = logging.getLogger(__name__)

router = APIRouter()

# Global connection manager instance
manager = ChatConnectionManager()


@router.websocket("/ws/chat/{session_id}")
async def chat_websocket_endpoint(
    websocket: WebSocket,
    session_id: str
):
    """
    WebSocket endpoint for real-time chat.

    Protocol:
        1. Client connects with session_id
        2. Client sends chat_auth message with nickname
        3. Client receives auth_success with user data and rooms
        4. Client can join/leave rooms, send messages, etc.

    Args:
        websocket: WebSocket connection
        session_id: Client session identifier
    """
    await websocket.accept()
    user_id: Optional[str] = None
    db: Session = next(get_db())

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type")
            msg_data = message.get("data", {})

            # Route to appropriate handler
            if msg_type == "chat_auth":
                user_id = await handle_auth(
                    msg_data, session_id, websocket, manager, db
                )

            elif not user_id:
                await send_error(websocket, "Not authenticated", "not_auth")

            elif msg_type == "join_room":
                await handle_join_room(
                    msg_data, user_id, websocket, manager, db
                )

            elif msg_type == "leave_room":
                await handle_leave_room(
                    msg_data, user_id, websocket, manager, db
                )

            elif msg_type == "send_message":
                await handle_send_message(
                    msg_data, user_id, websocket, manager, db
                )

            elif msg_type == "typing_start":
                await handle_typing_start(msg_data, user_id, manager)

            elif msg_type == "typing_stop":
                await handle_typing_stop(msg_data, user_id, manager)

            elif msg_type == "set_away":
                await handle_set_away(
                    msg_data, user_id, websocket, manager, db
                )

            elif msg_type == "set_online":
                await handle_set_online(
                    msg_data, user_id, websocket, manager, db
                )

            elif msg_type == "get_history":
                await handle_get_history(msg_data, user_id, websocket, db)

            elif msg_type == "get_rooms":
                await handle_get_rooms(msg_data, websocket, manager, db)

            elif msg_type == "get_users":
                await handle_get_users(msg_data, user_id, websocket, manager)

            elif msg_type == "create_dm":
                await handle_create_dm(
                    msg_data, user_id, websocket, manager, db
                )

            elif msg_type == "update_profile":
                await handle_update_profile(
                    msg_data, user_id, websocket, manager, db
                )

            else:
                await send_error(
                    websocket, f"Unknown message type: {msg_type}"
                )

    except WebSocketDisconnect:
        logger.info(f"Chat WebSocket disconnected: {session_id}")
    except json.JSONDecodeError:
        logger.warning(f"Invalid JSON from {session_id}")
    except Exception as e:
        logger.error(f"Chat WebSocket error: {e}", exc_info=True)
    finally:
        # Clean up on disconnect
        if user_id:
            rooms_left = await manager.unregister_user(user_id)

            # Broadcast user_left to all rooms
            from datetime import datetime
            user_data = manager.get_user_data(user_id) or {}
            nickname = user_data.get("nickname", "Unknown")

            for room_id in rooms_left:
                await manager.broadcast_to_room(
                    room_id,
                    {
                        "type": "user_left",
                        "data": {
                            "roomId": room_id,
                            "userId": user_id,
                            "nickname": nickname,
                        },
                        "timestamp": datetime.now().isoformat(),
                    }
                )

        db.close()
