"""
Remote Viewing API Routes

Endpoints for Remote Viewing session management and scoring:
- Session lifecycle (start, submit, score)
- User statistics and history
- Leaderboards
- Integration with Quantum Oracle for tournament mode

Links to quantum_routes.py for daily targets.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

from database.database import get_db
from services.rv_scoring import rv_scoring_service
from services.quantum_oracle import quantum_oracle
from services.rv_targets import rv_target_service

router = APIRouter(prefix="/rv", tags=["Remote Viewing"])


# ============================================================================
# Request/Response Models
# ============================================================================

class RVSessionStartRequest(BaseModel):
    """Request to start a new RV session."""
    mode: str = Field(..., description="Session mode: 'tournament' or 'practice'")
    target_type: str = Field(..., description="Target type: 'number', 'image', 'location'")
    target_id: Optional[str] = Field(None, description="Target ID (for practice mode)")
    base_frequency: float = Field(..., ge=20, le=20000, description="Base audio frequency (Hz)")
    beat_frequency: float = Field(..., ge=0.1, le=100, description="Binaural beat frequency (Hz)")
    protocol_used: Optional[str] = Field(None, description="Audio protocol name")


class RVSessionResponse(BaseModel):
    """Response with session details."""
    session_id: str
    mode: str
    target_type: str
    started_at: str
    status: str
    frequencies: Dict[str, Any]


class RVSubmissionRequest(BaseModel):
    """Request to submit impressions for RV session."""
    impressions_text: str = Field(..., min_length=1, description="Main text description of impressions")
    confidence_level: int = Field(..., ge=1, le=10, description="Confidence level (1-10)")
    sketch_description: Optional[str] = Field(None, description="Description of any sketches")
    colors: Optional[List[str]] = Field(None, description="List of perceived colors")
    shapes: Optional[List[str]] = Field(None, description="List of perceived shapes")
    emotions: Optional[List[str]] = Field(None, description="List of perceived emotions")
    textures: Optional[List[str]] = Field(None, description="List of perceived textures")
    clarity_rating: Optional[int] = Field(None, ge=1, le=10, description="Clarity rating (1-10)")


class RVSubmissionResponse(BaseModel):
    """Response after submitting impressions."""
    submission_id: str
    session_id: str
    submitted_at: str
    duration_seconds: int
    status: str


class RVScoreRequest(BaseModel):
    """Request to score an RV session."""
    target_description: str = Field(..., description="Actual target description")
    target_categories: Optional[Dict[str, List[str]]] = Field(
        None,
        description="Target categories (colors, shapes, emotions, textures)"
    )


class RVScoreResponse(BaseModel):
    """Response with scoring results."""
    session_id: str
    total_score: float
    accuracy_rating: str
    components: Dict[str, float]
    target_description: str
    matched_elements: List[str]
    missed_elements: List[str]
    scoring_details: Dict[str, Any]
    scored_at: str


class UserStatsResponse(BaseModel):
    """Response with user statistics."""
    total_sessions: int
    tournament_sessions: int
    practice_sessions: int
    average_score: Optional[float]
    best_score: Optional[float]
    worst_score: Optional[float]
    total_points: int
    current_streak: int
    best_streak: int
    first_session_at: Optional[str]
    last_session_at: Optional[str]


# ============================================================================
# Session Management Endpoints
# ============================================================================

@router.post("/sessions/start", response_model=RVSessionResponse)
async def start_rv_session(
    request: RVSessionStartRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """
    Start a new Remote Viewing session.

    Creates a session with specified parameters and audio frequencies.
    For tournament mode, the target is linked to today's quantum number.

    - **mode**: "tournament" (daily target) or "practice" (custom target)
    - **target_type**: Type of target to view
    - **base_frequency**: Base audio frequency in Hz
    - **beat_frequency**: Binaural beat frequency in Hz
    - **protocol_used**: Optional audio protocol name
    """
    try:
        # For tournament mode with quantum numbers, get today's target
        target_id = request.target_id
        if request.mode == "tournament" and request.target_type == "number":
            # Get today's quantum number (or pending state)
            daily_number_result = await quantum_oracle.get_daily_number(db)

            if daily_number_result["status"] == "pending":
                raise HTTPException(
                    status_code=400,
                    detail=f"Today's quantum number not yet revealed. {daily_number_result['message']}"
                )

            # Use quantum number's date as target_id
            target_id = daily_number_result["date"]

        # Create session
        result = rv_scoring_service.create_session(
            db=db,
            mode=request.mode,
            target_type=request.target_type,
            target_id=target_id,
            base_frequency=request.base_frequency,
            beat_frequency=request.beat_frequency,
            protocol_used=request.protocol_used,
            user_identifier=req.client.host if req else None
        )

        return RVSessionResponse(**result)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start session: {str(e)}")


@router.get("/sessions/{session_id}")
async def get_rv_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Get details of an RV session.

    - **session_id**: Session ID to retrieve
    """
    result = rv_scoring_service.get_session(db, session_id)

    if not result:
        raise HTTPException(status_code=404, detail="Session not found")

    return result


@router.post("/sessions/{session_id}/submit", response_model=RVSubmissionResponse)
async def submit_rv_impressions(
    session_id: str,
    request: RVSubmissionRequest,
    db: Session = Depends(get_db)
):
    """
    Submit impressions for an RV session.

    Records user's perceptions and impressions from the viewing session.
    Session must be in 'active' state.

    - **session_id**: Session ID to submit for
    - **impressions_text**: Main text description (required)
    - **confidence_level**: Confidence rating 1-10 (required)
    - **colors, shapes, emotions, textures**: Optional category lists
    - **clarity_rating**: Optional clarity rating 1-10
    """
    try:
        result = rv_scoring_service.submit_impressions(
            db=db,
            session_id=session_id,
            impressions_text=request.impressions_text,
            confidence_level=request.confidence_level,
            sketch_description=request.sketch_description,
            colors=request.colors,
            shapes=request.shapes,
            emotions=request.emotions,
            textures=request.textures,
            clarity_rating=request.clarity_rating
        )

        return RVSubmissionResponse(**result)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit impressions: {str(e)}")


@router.post("/sessions/{session_id}/score", response_model=RVScoreResponse)
async def score_rv_session(
    session_id: str,
    request: RVScoreRequest,
    db: Session = Depends(get_db)
):
    """
    Score an RV session after target reveal.

    Calculates accuracy score by comparing user's impressions to actual target.
    Session must be in 'submitted' state.

    - **session_id**: Session ID to score
    - **target_description**: Actual description of the target (required)
    - **target_categories**: Optional dict with actual target categories
    """
    try:
        result = rv_scoring_service.score_session(
            db=db,
            session_id=session_id,
            target_description=request.target_description,
            target_categories=request.target_categories
        )

        return RVScoreResponse(**result)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to score session: {str(e)}")


# ============================================================================
# Tournament Mode Integration
# ============================================================================

@router.get("/tournament/today")
async def get_today_tournament_target(db: Session = Depends(get_db)):
    """
    Get today's tournament target (quantum number).

    Returns the quantum number that all users will attempt to remote view.
    This endpoint integrates with the Quantum Oracle system.
    """
    try:
        result = await quantum_oracle.get_daily_number(db)

        if result["status"] == "pending":
            return {
                "status": "pending",
                "message": result["message"],
                "reveal_time": result["reveal_time"],
                "seconds_until_reveal": result["seconds_until_reveal"]
            }

        return {
            "status": "revealed",
            "target_type": "number",
            "target_id": result["date"],
            "date": result["date"],
            "revealed_at": result["materialized_at"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get tournament target: {str(e)}")


@router.post("/tournament/reveal/{session_id}")
async def reveal_tournament_target(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Reveal tournament target for a session and auto-score.

    For tournament mode with quantum numbers, this:
    1. Gets the actual quantum number for the session's date
    2. Auto-scores the session against the quantum number
    3. Updates user statistics

    - **session_id**: Tournament session ID
    """
    try:
        # Get session
        session = rv_scoring_service.get_session(db, session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        if session["mode"] != "tournament":
            raise HTTPException(status_code=400, detail="Session is not tournament mode")

        if session["status"] != "submitted":
            raise HTTPException(status_code=400, detail="Session must be submitted before reveal")

        # Get quantum number for session's date
        if session["target_type"] == "number":
            target_date = session["target_id"]  # Date string
            target_datetime = datetime.fromisoformat(target_date + "T00:00:00+00:00")
            quantum_result = await quantum_oracle.get_daily_number(db, date=target_datetime)

            if quantum_result["status"] != "revealed":
                raise HTTPException(
                    status_code=400,
                    detail="Target not yet revealed for this date"
                )

            # Score using quantum number
            target_description = f"The number is {quantum_result['number']}"
            result = rv_scoring_service.score_session(
                db=db,
                session_id=session_id,
                target_description=target_description,
                target_categories={}
            )

            return {
                **result,
                "quantum_number": quantum_result["number"],
                "target_date": target_date
            }

        else:
            raise HTTPException(
                status_code=400,
                detail="Auto-reveal only supports 'number' target type"
            )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reveal target: {str(e)}")


# ============================================================================
# Statistics & History Endpoints
# ============================================================================

@router.get("/stats", response_model=UserStatsResponse)
async def get_user_rv_stats(
    req: Request,
    db: Session = Depends(get_db)
):
    """
    Get user's RV statistics.

    Returns aggregate performance metrics, streaks, and rankings.
    Uses IP address for anonymous users.
    """
    user_identifier = req.client.host if req else None

    stats = rv_scoring_service.get_user_stats(
        db=db,
        user_identifier=user_identifier
    )

    if not stats:
        # Return empty stats for new users
        return UserStatsResponse(
            total_sessions=0,
            tournament_sessions=0,
            practice_sessions=0,
            average_score=None,
            best_score=None,
            worst_score=None,
            total_points=0,
            current_streak=0,
            best_streak=0,
            first_session_at=None,
            last_session_at=None
        )

    return UserStatsResponse(**stats)


@router.get("/history")
async def get_user_rv_history(
    req: Request,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Get user's RV session history.

    Returns list of past sessions with scores and details.

    - **limit**: Max number of sessions to return (default: 20, max: 100)
    """
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")

    user_identifier = req.client.host if req else None

    history = rv_scoring_service.get_session_history(
        db=db,
        user_identifier=user_identifier,
        limit=limit
    )

    return {
        "sessions": history,
        "count": len(history)
    }


@router.get("/leaderboard")
async def get_rv_leaderboard(
    mode: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get RV leaderboard rankings.

    Returns top users by total points.

    - **mode**: Filter by mode ("tournament" or "practice"), None for all
    - **limit**: Number of top users (default: 100, max: 1000)
    """
    if limit < 1 or limit > 1000:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 1000")

    leaderboard = rv_scoring_service.get_leaderboard(
        db=db,
        mode=mode,
        limit=limit
    )

    return {
        "leaderboard": leaderboard,
        "count": len(leaderboard),
        "mode_filter": mode
    }


# ============================================================================
# Info Endpoints
# ============================================================================

@router.get("/info")
async def get_rv_info():
    """
    Get information about the Remote Viewing system.

    Explains how RV sessions work, scoring methodology, and best practices.
    """
    return {
        "name": "Remote Viewing Session System",
        "description": "Track and score Remote Viewing sessions with binaural beat integration",
        "modes": {
            "tournament": {
                "description": "Daily tournament with quantum number targets",
                "target": "Today's quantum number from ANU QRNG",
                "leaderboard": "Global rankings with all users"
            },
            "practice": {
                "description": "Practice sessions with custom targets",
                "target": "User-defined or system-generated targets",
                "leaderboard": "Personal statistics only"
            }
        },
        "scoring": {
            "algorithm": "Multi-component scoring system",
            "components": {
                "text_similarity": {
                    "weight": 0.5,
                    "description": "Word overlap between impressions and target"
                },
                "category_match": {
                    "weight": 0.3,
                    "description": "Accuracy of colors, shapes, emotions, textures"
                },
                "confidence_correlation": {
                    "weight": 0.2,
                    "description": "Calibration of user's confidence vs. actual score"
                }
            },
            "ratings": {
                "exceptional": "85-100 points",
                "high": "70-84 points",
                "medium": "50-69 points",
                "low": "0-49 points"
            }
        },
        "protocol_flow": [
            "1. Start session with chosen binaural frequencies",
            "2. Enter viewing state (no target information shown)",
            "3. Record impressions, colors, shapes, emotions",
            "4. Submit impressions with confidence rating",
            "5. Target is revealed",
            "6. System calculates accuracy score",
            "7. Statistics and leaderboard updated"
        ],
        "best_practices": {
            "frequencies": "Theta (4-8Hz) or Alpha (8-13Hz) for optimal results",
            "duration": "10-30 minutes viewing time recommended",
            "environment": "Quiet, comfortable, minimal distractions",
            "recording": "Write impressions as they come, don't filter",
            "confidence": "Rate honestly for better calibration tracking"
        }
    }


@router.get("/protocols")
async def get_rv_protocols():
    """
    Get recommended audio protocols for Remote Viewing.

    Returns frequency configurations optimized for RV sessions.
    """
    return {
        "protocols": {
            "theta_deep": {
                "name": "Deep Theta",
                "base_frequency": 140,
                "beat_frequency": 6,
                "description": "Deep relaxation for enhanced intuition (6 Hz theta)",
                "recommended_duration": "20-30 minutes"
            },
            "alpha_relaxed": {
                "name": "Relaxed Alpha",
                "base_frequency": 140,
                "beat_frequency": 10,
                "description": "Relaxed awareness for clear impressions (10 Hz alpha)",
                "recommended_duration": "15-25 minutes"
            },
            "theta_alpha_bridge": {
                "name": "Theta-Alpha Bridge",
                "base_frequency": 140,
                "beat_frequency": 7.83,
                "description": "Schumann resonance for natural coherence (7.83 Hz)",
                "recommended_duration": "20-40 minutes"
            },
            "quick_practice": {
                "name": "Quick Practice",
                "base_frequency": 140,
                "beat_frequency": 8,
                "description": "Short alpha session for rapid practice (8 Hz alpha)",
                "recommended_duration": "5-15 minutes"
            }
        },
        "note": "All protocols can be customized. These are starting recommendations."
    }


# ============================================================================
# Double-Blind Target System Endpoints
# ============================================================================

class DBTargetRequest(BaseModel):
    """Request for double-blind target generation."""
    category: Optional[str] = Field(default=None, description="Target category filter")


class DBImpressionRequest(BaseModel):
    """Request to submit double-blind RV impression."""
    descriptors: Optional[str] = Field(default=None, description="Textual descriptors")
    notes: Optional[str] = Field(default=None, description="Session notes")
    sketches: Optional[str] = Field(default=None, description="Sketch data (base64)")
    confidence: float = Field(default=0.5, ge=0.0, le=1.0, description="Confidence rating")
    duration_minutes: Optional[float] = Field(default=None, description="Session duration")


@router.post("/targets/practice")
async def generate_double_blind_target(
    request: DBTargetRequest = DBTargetRequest(),
    req: Request = None,
    db: Session = Depends(get_db)
):
    """
    Generate a double-blind remote viewing target (Practice Mode).

    Returns a random alphanumeric coordinate (e.g., "8A3F-9B2C") that
    contains NO information about the target. Proper double-blind protocol.

    - **category**: Optional filter (locations, objects, events, structures, concepts)
    """
    try:
        user_identifier = req.client.host if req else None

        result = await rv_target_service.create_practice_target(
            db=db,
            user_identifier=user_identifier,
            category=request.category
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Target service error: {str(e)}")


@router.get("/targets/daily")
async def get_daily_double_blind_target(db: Session = Depends(get_db)):
    """
    Get today's double-blind target (Tournament Mode).

    Target materializes at midnight UTC. All users receive the same
    coordinate for each day. Returns coordinate only - no target info.
    """
    try:
        result = await rv_target_service.get_daily_target(db)
        return result
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Target service error: {str(e)}")


@router.post("/targets/{target_id}/impressions")
async def submit_double_blind_impression(
    target_id: str,
    impression: DBImpressionRequest,
    mode: str = "practice",
    db: Session = Depends(get_db)
):
    """
    Submit impression for a double-blind target.

    - **target_id**: Target ID from generation endpoint
    - **mode**: "practice" or "tournament"
    - **impression**: Your viewing data

    MUST submit impression before viewing feedback (double-blind protocol).
    """
    if mode not in ["practice", "tournament"]:
        raise HTTPException(status_code=400, detail="Mode must be 'practice' or 'tournament'")

    try:
        impression_data = {
            "descriptors": impression.descriptors,
            "notes": impression.notes,
            "sketches": impression.sketches,
            "confidence": impression.confidence,
            "duration_minutes": impression.duration_minutes
        }

        result = await rv_target_service.submit_impression(
            db=db,
            target_id=target_id,
            impression_data=impression_data,
            mode=mode
        )

        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Impression service error: {str(e)}")


@router.get("/targets/{target_id}/feedback")
async def get_double_blind_feedback(
    target_id: str,
    mode: str = "practice",
    db: Session = Depends(get_db)
):
    """
    Reveal target feedback after impression submission.

    Shows actual target details so you can compare with your impressions.

    - **target_id**: Target ID
    - **mode**: "practice" or "tournament"

    Requires impression submission first (double-blind protocol).
    """
    if mode not in ["practice", "tournament"]:
        raise HTTPException(status_code=400, detail="Mode must be 'practice' or 'tournament'")

    try:
        result = await rv_target_service.get_feedback(
            db=db,
            target_id=target_id,
            mode=mode
        )

        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Feedback service error: {str(e)}")


@router.get("/targets/history")
async def get_double_blind_history(
    mode: str = "practice",
    days: int = 30,
    req: Request = None,
    db: Session = Depends(get_db)
):
    """
    Get history of double-blind targets.

    - **mode**: "practice" or "tournament"
    - **days**: Number of days (1-365)
    """
    if days < 1 or days > 365:
        raise HTTPException(status_code=400, detail="Days must be between 1 and 365")

    if mode not in ["practice", "tournament"]:
        raise HTTPException(status_code=400, detail="Mode must be 'practice' or 'tournament'")

    try:
        user_identifier = req.client.host if req else None

        targets = await rv_target_service.get_history(
            db=db,
            mode=mode,
            user_identifier=user_identifier if mode == "practice" else None,
            days=days
        )

        return {"targets": targets, "count": len(targets)}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"History service error: {str(e)}")


@router.get("/targets/categories")
async def get_double_blind_categories():
    """
    Get available target categories for filtering.

    Returns structured list of target types.
    """
    return {
        "categories": rv_target_service.get_categories(),
        "message": "Use category parameter when generating practice targets"
    }
