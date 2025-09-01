"""
Timer API routes for managing frequency transitions and sessions.

Provides endpoints for timer presets, session control, and subscription-gated features.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Dict, Any
import logging

from ..services.timer_service import timer_service
from ..services.simple_auth import get_current_user, User
from ..services.stripe_service import stripe_service
from ..schemas.timer_schemas import (
    TimerPreset, CreatePresetRequest, TimerControlRequest, 
    TimerStatusResponse, TimerSession
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/timer", tags=["timer"])


@router.get("/presets", response_model=List[Dict[str, Any]])
async def get_timer_presets(current_user: User = Depends(get_current_user)):
    """
    Get available timer presets based on user's subscription status.
    
    Free users get 2 basic presets, subscribers get all presets including premium ones.
    """
    try:
        # Check subscription status
        is_subscriber = False
        if current_user.stripe_customer_id:
            subscription = await stripe_service.get_active_subscription(current_user.stripe_customer_id)
            is_subscriber = subscription is not None
        
        presets = timer_service.get_available_presets(is_subscriber)
        
        # Add subscription promotion for free users
        if not is_subscriber:
            promotion_message = {
                "type": "subscription_promotion",
                "message": (
                    "🚀 Unlock Premium Features! Get 5+ advanced timer presets, "
                    "unlimited custom sequences, and exclusive protocols for deep meditation, "
                    "lucid dreaming, and enhanced focus. Upgrade now!"
                ),
                "benefits": [
                    "5+ Advanced Timer Presets",
                    "Unlimited Custom Sequences",
                    "Up to 10 Transitions per Timer",
                    "Exclusive Lucid Dream Protocols",
                    "Gamma Wave Burst Patterns",
                    "Extended Session Lengths (up to 8 hours)"
                ],
                "upgrade_url": "/subscription/plans"
            }
            presets.append(promotion_message)
        
        logger.info(f"Retrieved {len(presets)} presets for user {current_user.email}")
        return presets
        
    except Exception as e:
        logger.error(f"Error retrieving presets for user {current_user.email}: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving timer presets")


@router.post("/presets", response_model=Dict[str, str])
async def create_timer_preset(
    request: CreatePresetRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Create custom timer preset.
    
    Free users: 2 custom presets with up to 3 transitions each
    Premium users: 50 custom presets with up to 10 transitions each
    """
    try:
        # Check subscription status
        is_subscriber = False
        if current_user.stripe_customer_id:
            subscription = await stripe_service.get_active_subscription(current_user.stripe_customer_id)
            is_subscriber = subscription is not None
        
        preset_id = timer_service.create_custom_preset(
            request.preset, 
            str(current_user.id), 
            is_subscriber
        )
        
        logger.info(f"Created preset {preset_id} for user {current_user.email}")
        return {"preset_id": preset_id, "message": "Timer preset created successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating preset for user {current_user.email}: {e}")
        raise HTTPException(status_code=500, detail="Error creating timer preset")


@router.post("/start", response_model=TimerStatusResponse)
async def start_timer(
    request: TimerControlRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Start timer session with selected preset.
    
    Automatically handles subscription validation for premium presets.
    """
    try:
        if not request.preset_id:
            raise HTTPException(status_code=400, detail="Preset ID required to start timer")
        
        # Check subscription status
        is_subscriber = False
        if current_user.stripe_customer_id:
            subscription = await stripe_service.get_active_subscription(current_user.stripe_customer_id)
            is_subscriber = subscription is not None
        
        session_id, status = await timer_service.start_timer_session(
            request.preset_id,
            str(current_user.id),
            is_subscriber
        )
        
        logger.info(f"Started timer session {session_id} for user {current_user.email}")
        return status
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting timer for user {current_user.email}: {e}")
        raise HTTPException(status_code=500, detail="Error starting timer session")


@router.post("/control", response_model=TimerStatusResponse)
async def control_timer(
    request: TimerControlRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Control active timer session (pause, resume, stop, next, previous).
    """
    try:
        # Get user's active session
        active_session = timer_service.get_user_active_session(str(current_user.id))
        if not active_session:
            raise HTTPException(status_code=404, detail="No active timer session found")
        
        session_id = active_session.session.session_id
        
        if request.action == "pause":
            status = await timer_service.pause_timer_session(session_id)
        elif request.action == "resume":
            status = await timer_service.resume_timer_session(session_id)
        elif request.action == "stop":
            await timer_service.stop_timer_session(session_id)
            status = TimerStatusResponse(
                session=None,
                current_transition=None,
                next_transition=None,
                time_remaining_current=0,
                time_remaining_total=0
            )
        else:
            raise HTTPException(status_code=400, detail=f"Action '{request.action}' not implemented")
        
        logger.info(f"Applied action '{request.action}' to session {session_id}")
        return status
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error controlling timer for user {current_user.email}: {e}")
        raise HTTPException(status_code=500, detail="Error controlling timer session")


@router.get("/status", response_model=TimerStatusResponse)
async def get_timer_status(current_user: User = Depends(get_current_user)):
    """
    Get current timer session status for the user.
    """
    try:
        active_session = timer_service.get_user_active_session(str(current_user.id))
        
        if not active_session:
            return TimerStatusResponse(
                session=None,
                current_transition=None,
                next_transition=None,
                time_remaining_current=0,
                time_remaining_total=0
            )
        
        return active_session
        
    except Exception as e:
        logger.error(f"Error getting timer status for user {current_user.email}: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving timer status")


@router.delete("/presets/{preset_id}")
async def delete_timer_preset(
    preset_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete custom timer preset.
    
    Users can only delete their own custom presets.
    """
    try:
        # Verify preset belongs to user and is custom (not built-in)
        if not preset_id.startswith(f"user_{current_user.id}"):
            raise HTTPException(
                status_code=403, 
                detail="Can only delete your own custom presets"
            )
        
        if preset_id in timer_service.presets:
            del timer_service.presets[preset_id]
            logger.info(f"Deleted preset {preset_id} for user {current_user.email}")
            return {"message": "Timer preset deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Preset not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting preset {preset_id} for user {current_user.email}: {e}")
        raise HTTPException(status_code=500, detail="Error deleting timer preset")


@router.get("/subscription-benefits")
async def get_subscription_benefits():
    """
    Get detailed subscription benefits for timer features.
    """
    return {
        "free_features": {
            "presets": 2,
            "custom_presets": 2,
            "transitions_per_preset": 3,
            "max_session_length": "2 hours",
            "available_frequencies": "Basic (Alpha, Beta, Theta)"
        },
        "premium_features": {
            "presets": "5+ Advanced",
            "custom_presets": "Unlimited (up to 50)",
            "transitions_per_preset": 10,
            "max_session_length": "8 hours",
            "available_frequencies": "All (Delta, Theta, Alpha, Beta, Gamma)",
            "exclusive_protocols": [
                "Lucid Dream Protocol",
                "OBE Induction Sequence",
                "Deep Focus Gamma Bursts",
                "REM Sleep Optimization",
                "Meditation Enhancement"
            ]
        },
        "upgrade_benefits": [
            "🧠 Advanced brainwave protocols for deep states",
            "⏰ Extended session lengths up to 8 hours",
            "🎯 Gamma wave bursts for cognitive enhancement",
            "🌙 Specialized lucid dreaming sequences",
            "🚀 Unlimited custom timer creation",
            "🔧 Advanced transition controls",
            "📊 Detailed session analytics"
        ],
        "upgrade_url": "/subscription/plans"
    }