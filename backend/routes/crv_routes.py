"""
CRV (Controlled Remote Viewing) API Routes

Endpoints for the 6-stage CRV protocol system developed by Ingo Swann:
- Stage definitions and guidance
- Session management and progression
- Stage data submission
- Frequency recommendations

Protocol Overview:
- Stage 1: Major gestalts (initial contact)
- Stage 2: Sensory data
- Stage 3: Dimensional data
- Stage 4: Conceptual/emotional data
- Stage 5: Off-signal interrogation
- Stage 6: 3D modeling
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import json

from database.database import get_db
from services.crv_protocols import crv_protocol_service

router = APIRouter(prefix="/rv/crv", tags=["CRV Protocol"])


# ============================================================================
# Request/Response Models
# ============================================================================

class CRVSessionStartRequest(BaseModel):
    """Request to start a new CRV session."""
    target_coordinate: Optional[str] = Field(None, description="Target coordinate (optional)")
    target_description: Optional[str] = Field(None, description="Target description for feedback")
    user_identifier: Optional[str] = Field(None, description="User ID or identifier")


class CRVSessionResponse(BaseModel):
    """Response for CRV session data."""
    session_id: str
    current_stage: int
    status: str
    target_coordinate: Optional[str]
    started_at: str
    completed_at: Optional[str]
    total_duration_seconds: Optional[float]


class CRVStageDataSubmission(BaseModel):
    """Stage data submission."""
    stage_number: int = Field(..., ge=1, le=6, description="Stage number (1-6)")
    data: Dict[str, Any] = Field(..., description="Stage-specific data")


class CRVStageDataResponse(BaseModel):
    """Response for stage data submission."""
    stage_data_id: str
    session_id: str
    stage_number: int
    started_at: str
    completed_at: Optional[str]
    duration_seconds: Optional[float]


class CRVProgressResponse(BaseModel):
    """Session progress response."""
    session_id: str
    current_stage: int
    completed_stages: List[int]
    status: str
    can_progress: bool
    next_stage: Optional[int]
    stage_data: List[Dict[str, Any]]


class FrequencyRecommendationResponse(BaseModel):
    """Frequency recommendation response."""
    stage_number: int
    stage_name: str
    base_frequency: float
    beat_frequency: float
    brainwave_target: str
    description: str


# ============================================================================
# Stage Definition Endpoints
# ============================================================================

@router.get("/stages")
async def get_all_stages():
    """
    Get all CRV stage definitions.

    Returns complete information about all 6 stages including:
    - Stage descriptions and purposes
    - Data collection guidelines
    - Time recommendations
    - Frequency recommendations

    Based on Ingo Swann's CRV methodology developed at Stanford Research Institute.
    """
    try:
        stages = crv_protocol_service.get_all_stages()
        return {
            "stages": stages,
            "total_stages": len(stages),
            "protocol": "Controlled Remote Viewing (CRV)",
            "developer": "Ingo Swann, Stanford Research Institute",
            "description": "Structured 6-stage remote viewing methodology"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving stage definitions: {str(e)}"
        )


@router.get("/stages/{stage_number}")
async def get_stage_details(stage_number: int):
    """
    Get detailed information for a specific stage.

    - **stage_number**: Stage number (1-6)

    Returns comprehensive guidance including:
    - Stage description and purpose
    - Data types to collect
    - Viewer guidelines
    - Duration recommendations
    - Binaural frequency settings
    """
    if stage_number < 1 or stage_number > 6:
        raise HTTPException(
            status_code=400,
            detail="Stage number must be between 1 and 6"
        )

    try:
        stage_guidance = crv_protocol_service.get_stage_guidance(stage_number)

        if "error" in stage_guidance:
            raise HTTPException(
                status_code=404,
                detail=stage_guidance["error"]
            )

        return stage_guidance

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving stage details: {str(e)}"
        )


# ============================================================================
# Frequency Recommendation Endpoints
# ============================================================================

@router.get("/frequencies")
async def get_all_frequency_protocols():
    """
    Get all frequency protocols for CRV/RV sessions.

    Returns comprehensive frequency recommendations including:
    - Deep Theta (4-6 Hz) - intuition, subconscious access
    - Mid Theta (6-8 Hz) - sensory clarity, visualization
    - Alpha-Theta Bridge (7.83 Hz) - Schumann resonance, hemispheric sync
    - Low Alpha (8-10 Hz) - conceptual understanding
    - Mid Alpha (10-12 Hz) - focused construction

    Based on optimal brainwave states for remote viewing.
    """
    try:
        protocols = crv_protocol_service.get_all_frequency_protocols()
        return {
            "protocols": protocols,
            "optimal_range": "4-12 Hz (Theta to Alpha)",
            "primary_target": "Theta (4-8 Hz) for intuition and non-local perception",
            "research_basis": [
                "Stanford Research Institute CRV protocols",
                "Brainwave entrainment research for remote viewing",
                "Schumann resonance (7.83 Hz) for hemispheric synchronization"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving frequency protocols: {str(e)}"
        )


@router.get("/frequencies/stage/{stage_number}")
async def get_stage_frequency(stage_number: int):
    """
    Get optimal frequency recommendation for a specific stage.

    - **stage_number**: Stage number (1-6)

    Returns binaural beat frequency settings optimized for that stage.
    """
    if stage_number < 1 or stage_number > 6:
        raise HTTPException(
            status_code=400,
            detail="Stage number must be between 1 and 6"
        )

    try:
        stage = crv_protocol_service.get_stage(stage_number)
        if not stage:
            raise HTTPException(
                status_code=404,
                detail=f"Stage {stage_number} not found"
            )

        freq_rec = crv_protocol_service.get_frequency_recommendation(stage_number)

        return FrequencyRecommendationResponse(
            stage_number=stage_number,
            stage_name=stage.name,
            base_frequency=freq_rec["base_frequency"],
            beat_frequency=freq_rec["beat_frequency"],
            brainwave_target=freq_rec["brainwave_target"],
            description=freq_rec["description"]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving frequency recommendation: {str(e)}"
        )


# ============================================================================
# Session Management Endpoints
# ============================================================================

@router.post("/sessions/start", response_model=CRVSessionResponse)
async def start_crv_session(
    request: CRVSessionStartRequest,
    req: Request = None,
    db: Session = Depends(get_db)
):
    """
    Start a new CRV session.

    Creates a new session and initializes at Stage 1.
    User will progress through stages 1-6 as they complete each stage.

    - **target_coordinate**: Optional coordinate for the target
    - **target_description**: Optional description (for feedback after completion)
    - **user_identifier**: Optional user ID or identifier
    """
    from database.models import CRVSession

    try:
        # Create new session
        session = CRVSession(
            user_identifier=request.user_identifier or (req.client.host if req else None),
            target_coordinate=request.target_coordinate,
            target_description=request.target_description,
            current_stage=1,
            status="in_progress"
        )

        db.add(session)
        db.commit()
        db.refresh(session)

        return CRVSessionResponse(
            session_id=session.id,
            current_stage=session.current_stage,
            status=session.status,
            target_coordinate=session.target_coordinate,
            started_at=session.started_at.isoformat(),
            completed_at=None,
            total_duration_seconds=None
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error starting CRV session: {str(e)}"
        )


@router.post("/sessions/{session_id}/stage/{stage_number}", response_model=CRVStageDataResponse)
async def submit_stage_data(
    session_id: str,
    stage_number: int,
    submission: CRVStageDataSubmission,
    db: Session = Depends(get_db)
):
    """
    Submit data for a specific stage.

    Records the viewer's impressions and data for the current stage.
    Validates data and progresses to next stage if appropriate.

    - **session_id**: CRV session ID
    - **stage_number**: Stage number (1-6)
    - **submission**: Stage data (format depends on stage)
    """
    from database.models import CRVSession, CRVStageData

    if stage_number < 1 or stage_number > 6:
        raise HTTPException(
            status_code=400,
            detail="Stage number must be between 1 and 6"
        )

    try:
        # Get session
        session = db.query(CRVSession).filter(CRVSession.id == session_id).first()

        if not session:
            raise HTTPException(
                status_code=404,
                detail=f"Session {session_id} not found"
            )

        if session.status != "in_progress":
            raise HTTPException(
                status_code=400,
                detail=f"Session is {session.status}, cannot submit data"
            )

        # Validate stage progression
        completed_stages = [
            sd.stage_number
            for sd in session.stage_data
            if sd.completed_at is not None
        ]

        can_progress, reason = crv_protocol_service.can_progress_to_stage(
            stage_number,
            completed_stages
        )

        if not can_progress:
            raise HTTPException(
                status_code=400,
                detail=reason or "Cannot progress to this stage"
            )

        # Validate stage data
        is_valid, error_msg = crv_protocol_service.validate_stage_data(
            stage_number,
            submission.data
        )

        if not is_valid:
            raise HTTPException(
                status_code=400,
                detail=error_msg or "Invalid stage data"
            )

        # Check if stage data already exists
        existing_data = next(
            (sd for sd in session.stage_data if sd.stage_number == stage_number),
            None
        )

        if existing_data:
            # Update existing data
            existing_data.data_json = json.dumps(submission.data)
            existing_data.completed_at = datetime.now(timezone.utc)
            existing_data.duration_seconds = (
                existing_data.completed_at - existing_data.started_at
            ).total_seconds()
            stage_data_record = existing_data
        else:
            # Create new stage data
            stage_data_record = CRVStageData(
                session_id=session_id,
                stage_number=stage_number,
                data_json=json.dumps(submission.data),
                started_at=datetime.now(timezone.utc)
            )
            # Mark as completed immediately
            stage_data_record.completed_at = stage_data_record.started_at
            stage_data_record.duration_seconds = 0.0

            db.add(stage_data_record)

        # Update session current stage
        if stage_number == session.current_stage:
            next_stage = crv_protocol_service.get_next_stage(stage_number)
            if next_stage:
                session.current_stage = next_stage
            else:
                # Session completed
                session.status = "completed"
                session.completed_at = datetime.now(timezone.utc)
                session.total_duration_seconds = (
                    session.completed_at - session.started_at
                ).total_seconds()

        db.commit()
        db.refresh(stage_data_record)

        return CRVStageDataResponse(
            stage_data_id=stage_data_record.id,
            session_id=session_id,
            stage_number=stage_data_record.stage_number,
            started_at=stage_data_record.started_at.isoformat(),
            completed_at=stage_data_record.completed_at.isoformat() if stage_data_record.completed_at else None,
            duration_seconds=stage_data_record.duration_seconds
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error submitting stage data: {str(e)}"
        )


@router.get("/sessions/{session_id}/progress", response_model=CRVProgressResponse)
async def get_session_progress(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Get progress for a CRV session.

    Returns current stage, completed stages, and stage data.

    - **session_id**: CRV session ID
    """
    from database.models import CRVSession

    try:
        # Get session with stage data
        session = db.query(CRVSession).filter(CRVSession.id == session_id).first()

        if not session:
            raise HTTPException(
                status_code=404,
                detail=f"Session {session_id} not found"
            )

        # Get completed stages
        completed_stages = [
            sd.stage_number
            for sd in session.stage_data
            if sd.completed_at is not None
        ]

        # Check if can progress
        next_stage = crv_protocol_service.get_next_stage(session.current_stage)
        can_progress = session.status == "in_progress" and next_stage is not None

        # Format stage data
        stage_data_list = [
            {
                "stage_number": sd.stage_number,
                "data": json.loads(sd.data_json),
                "started_at": sd.started_at.isoformat(),
                "completed_at": sd.completed_at.isoformat() if sd.completed_at else None,
                "duration_seconds": sd.duration_seconds
            }
            for sd in session.stage_data
        ]

        return CRVProgressResponse(
            session_id=session_id,
            current_stage=session.current_stage,
            completed_stages=sorted(completed_stages),
            status=session.status,
            can_progress=can_progress,
            next_stage=next_stage,
            stage_data=stage_data_list
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving session progress: {str(e)}"
        )


@router.get("/sessions/{session_id}")
async def get_session_details(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Get complete details for a CRV session.

    Returns all session information including stage data.

    - **session_id**: CRV session ID
    """
    from database.models import CRVSession

    try:
        session = db.query(CRVSession).filter(CRVSession.id == session_id).first()

        if not session:
            raise HTTPException(
                status_code=404,
                detail=f"Session {session_id} not found"
            )

        return {
            "session": CRVSessionResponse(
                session_id=session.id,
                current_stage=session.current_stage,
                status=session.status,
                target_coordinate=session.target_coordinate,
                started_at=session.started_at.isoformat(),
                completed_at=session.completed_at.isoformat() if session.completed_at else None,
                total_duration_seconds=session.total_duration_seconds
            ),
            "stage_data": [
                {
                    "stage_number": sd.stage_number,
                    "data": json.loads(sd.data_json),
                    "started_at": sd.started_at.isoformat(),
                    "completed_at": sd.completed_at.isoformat() if sd.completed_at else None,
                    "duration_seconds": sd.duration_seconds
                }
                for sd in session.stage_data
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving session details: {str(e)}"
        )


# ============================================================================
# Info Endpoint
# ============================================================================

@router.get("/info")
async def get_crv_info():
    """
    Get information about the CRV protocol system.

    Returns overview of CRV methodology, stage progression,
    and frequency recommendations.
    """
    return {
        "name": "Controlled Remote Viewing (CRV)",
        "description": "Structured 6-stage remote viewing methodology",
        "developer": "Ingo Swann",
        "institution": "Stanford Research Institute (SRI)",
        "development_period": "1970s-1980s",
        "overview": (
            "CRV is a structured protocol for remote viewing that progresses through "
            "six stages of increasing detail and complexity. Each stage focuses on "
            "specific types of information, from initial gestalts to detailed 3D modeling."
        ),
        "stages": {
            "1": "Initial Contact / Major Gestalts - First impressions",
            "2": "Sensory Data - Colors, textures, sounds, smells, tastes",
            "3": "Dimensional Analysis - Size, shape, spatial relationships",
            "4": "Conceptual & Emotional - Abstract concepts, feelings",
            "5": "Interrogation - Off-signal analysis of subconscious data",
            "6": "3D Modeling - Comprehensive synthesis and construction"
        },
        "frequency_recommendations": {
            "primary": "Theta (4-8 Hz) for intuition and non-local perception",
            "alpha_theta_bridge": "7.83 Hz Schumann resonance for hemispheric sync",
            "alpha": "8-12 Hz for conceptual understanding and synthesis"
        },
        "usage": {
            "start_session": "POST /api/rv/crv/sessions/start",
            "submit_stage": "POST /api/rv/crv/sessions/{id}/stage/{num}",
            "get_progress": "GET /api/rv/crv/sessions/{id}/progress",
            "stage_guidance": "GET /api/rv/crv/stages/{num}",
            "frequencies": "GET /api/rv/crv/frequencies"
        }
    }
