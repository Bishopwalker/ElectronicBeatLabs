"""
ARV (Associative Remote Viewing) API Routes

Endpoints for ARV prediction system:
- Create predictions with target pairs
- Get blind targets for viewing
- Submit viewing impressions
- Judge target matches
- Resolve outcomes
- Get statistics and history

ARV Protocol Flow:
1. POST /predictions/create - Create new ARV prediction
2. GET /predictions/{id}/target - Get blind target for viewing
3. POST /predictions/{id}/submit - Submit viewing impressions
4. POST /predictions/{id}/judge - Judge which target matches
5. POST /predictions/{id}/resolve - Record actual outcome
6. GET /predictions/{id}/status - Check prediction status
7. GET /stats - View accuracy statistics
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

from database.database import get_db
from services.arv_system import arv_system, ARVTargetType

router = APIRouter(prefix="/arv", tags=["ARV Predictions"])


# ============================================================================
# Request/Response Models
# ============================================================================

class TargetData(BaseModel):
    """Target data structure (flexible for different target types)."""
    url: Optional[str] = None  # For images
    description: Optional[str] = None  # Text description
    coordinates: Optional[Dict[str, float]] = None  # For locations
    metadata: Optional[Dict[str, Any]] = None  # Additional data


class CreatePredictionRequest(BaseModel):
    """Request to create a new ARV prediction."""
    name: str = Field(..., description="Prediction name (e.g., 'AAPL Stock Monday')")
    description: str = Field(..., description="What is being predicted")

    target_a: Dict[str, Any] = Field(..., description="Target A data")
    target_b: Dict[str, Any] = Field(..., description="Target B data")

    outcome_a_label: str = Field(..., description="Outcome A label (e.g., 'Stock Up')")
    outcome_b_label: str = Field(..., description="Outcome B label (e.g., 'Stock Down')")

    target_type: str = Field(
        default="image_pair",
        description="Target type: image_pair, location_pair, description_pair"
    )

    deadline: Optional[str] = None  # ISO format datetime


class CreatePredictionResponse(BaseModel):
    """Response after creating prediction."""
    prediction_id: str
    name: str
    description: str
    target_type: str
    status: str
    deadline: Optional[str]
    created_at: str


class BlindTargetResponse(BaseModel):
    """Response containing blind target for viewing."""
    prediction_id: str
    target_data: Dict[str, Any]
    target_type: str
    instructions: str


class SubmitViewingRequest(BaseModel):
    """Request to submit viewing impressions."""
    impressions: str = Field(..., description="Viewer's description of target")
    confidence: Optional[float] = Field(None, ge=0, le=1, description="Confidence (0-1)")
    session_notes: Optional[str] = None

    # Optional: Audio protocol used during viewing
    base_frequency: Optional[float] = None
    beat_frequency: Optional[float] = None
    protocol_used: Optional[str] = None


class SubmitViewingResponse(BaseModel):
    """Response after submitting viewing data."""
    submission_id: str
    prediction_id: str
    status: str
    submitted_at: str
    next_step: str


class JudgeTargetRequest(BaseModel):
    """Request to judge which target matches impressions."""
    judged_target: str = Field(..., description="'A' or 'B' - which target matches")


class JudgeTargetResponse(BaseModel):
    """Response after judging target match."""
    prediction_id: str
    judged_target: str
    predicted_outcome: str
    status: str
    judged_at: str
    next_step: str
    message: str


class ResolveOutcomeRequest(BaseModel):
    """Request to resolve actual outcome."""
    actual_outcome: str = Field(..., description="'A' or 'B' - actual outcome")
    outcome_notes: Optional[str] = None


class ResolveOutcomeResponse(BaseModel):
    """Response after outcome resolution."""
    prediction_id: str
    predicted_target: str
    predicted_outcome: str
    actual_target: str
    actual_outcome: str
    is_correct: bool
    status: str
    resolved_at: str
    accuracy: str


class PredictionStatusResponse(BaseModel):
    """Response for prediction status check."""
    prediction_id: str
    name: str
    description: str
    status: str
    created_at: str
    deadline: Optional[str]
    submission: Optional[Dict[str, Any]] = None
    judging: Optional[Dict[str, Any]] = None
    outcome: Optional[Dict[str, Any]] = None


class AccuracyStatsResponse(BaseModel):
    """Response for accuracy statistics."""
    period_days: int
    total_predictions: int
    hits: int
    misses: int
    accuracy_percent: float
    expected_chance: float
    above_chance: bool
    statistical_significance: str
    user_identifier: Optional[str]


class PredictionHistoryItem(BaseModel):
    """Single prediction history item."""
    prediction_id: str
    name: str
    description: str
    status: str
    is_correct: Optional[bool]
    created_at: str
    deadline: Optional[str]


class PredictionHistoryResponse(BaseModel):
    """Response for prediction history."""
    predictions: List[PredictionHistoryItem]
    count: int


# ============================================================================
# ARV Endpoints
# ============================================================================

@router.post("/predictions/create", response_model=CreatePredictionResponse)
async def create_arv_prediction(
    request: CreatePredictionRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """
    Create a new ARV prediction session.

    This sets up the target pair and outcome associations.
    The viewer will then receive a blind target for viewing.

    **Target Types:**
    - `image_pair`: Two distinct images (URLs)
    - `location_pair`: Two geographic locations (coordinates)
    - `description_pair`: Two text descriptions
    - `object_pair`: Two physical objects

    **Example:**
    ```json
    {
        "name": "AAPL Stock Monday",
        "description": "Will Apple stock close up or down on Monday?",
        "target_a": {"url": "https://example.com/beach.jpg", "description": "Tropical beach"},
        "target_b": {"url": "https://example.com/mountain.jpg", "description": "Snow mountain"},
        "outcome_a_label": "Stock Up",
        "outcome_b_label": "Stock Down",
        "target_type": "image_pair"
    }
    ```
    """
    try:
        # Parse deadline if provided
        deadline = None
        if request.deadline:
            deadline = datetime.fromisoformat(request.deadline).replace(tzinfo=timezone.utc)

        # Get user identifier (IP address or user ID)
        user_identifier = req.client.host if req else None

        # Validate target type
        try:
            target_type_enum = ARVTargetType(request.target_type)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid target_type. Must be one of: {[t.value for t in ARVTargetType]}"
            )

        result = arv_system.create_prediction(
            db=db,
            name=request.name,
            description=request.description,
            target_a=request.target_a,
            target_b=request.target_b,
            outcome_a_label=request.outcome_a_label,
            outcome_b_label=request.outcome_b_label,
            target_type=target_type_enum,
            user_identifier=user_identifier,
            deadline=deadline
        )

        return CreatePredictionResponse(**result)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ARV system error: {str(e)}")


@router.get("/predictions/{prediction_id}/target", response_model=BlindTargetResponse)
async def get_blind_target(
    prediction_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a blind target for viewing.

    Returns a randomly selected target (A or B) WITHOUT revealing
    which outcome it represents. This is the core of ARV protocol.

    The viewer should:
    1. Focus on the target data
    2. Record all impressions, perceptions, feelings
    3. NOT try to analyze or guess the outcome
    4. Submit impressions via `/submit` endpoint
    """
    try:
        result = arv_system.get_blind_target(db=db, prediction_id=prediction_id)
        return BlindTargetResponse(**result)

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ARV system error: {str(e)}")


@router.post("/predictions/{prediction_id}/submit", response_model=SubmitViewingResponse)
async def submit_viewing_data(
    prediction_id: str,
    request: SubmitViewingRequest,
    db: Session = Depends(get_db)
):
    """
    Submit viewing impressions and data.

    Record all perceptions from the viewing session:
    - Visual impressions
    - Sensory data (colors, textures, sounds, smells)
    - Emotional impressions
    - Symbolic content
    - Any other perceptions

    This should be done BEFORE knowing which target corresponds to which outcome.

    **Example:**
    ```json
    {
        "impressions": "I see blue water, bright sunlight, sandy texture. Feel relaxed and warm. Hear waves.",
        "confidence": 0.75,
        "session_notes": "Clear session, theta protocol",
        "base_frequency": 140,
        "beat_frequency": 6,
        "protocol_used": "theta"
    }
    ```
    """
    try:
        result = arv_system.submit_viewing_data(
            db=db,
            prediction_id=prediction_id,
            impressions=request.impressions,
            confidence=request.confidence,
            session_notes=request.session_notes
        )

        return SubmitViewingResponse(**result)

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ARV system error: {str(e)}")


@router.post("/predictions/{prediction_id}/judge", response_model=JudgeTargetResponse)
async def judge_target_match(
    prediction_id: str,
    request: JudgeTargetRequest,
    db: Session = Depends(get_db)
):
    """
    Judge which target (A or B) best matches the viewing impressions.

    This is done AFTER viewing but BEFORE the outcome is known.

    The judge (can be the viewer or a separate judge):
    1. Reviews both Target A and Target B
    2. Reviews the viewing impressions
    3. Determines which target best matches the description
    4. Submits the judgment (A or B)

    Once judged, the prediction is LOCKED IN. The outcome association
    is still not revealed until the real-world event occurs.

    **Example:**
    ```json
    {
        "judged_target": "A"
    }
    ```
    """
    if request.judged_target not in ["A", "B"]:
        raise HTTPException(
            status_code=400,
            detail="judged_target must be 'A' or 'B'"
        )

    try:
        result = arv_system.judge_target_match(
            db=db,
            prediction_id=prediction_id,
            judged_target=request.judged_target
        )

        return JudgeTargetResponse(**result)

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ARV system error: {str(e)}")


@router.post("/predictions/{prediction_id}/resolve", response_model=ResolveOutcomeResponse)
async def resolve_outcome(
    prediction_id: str,
    request: ResolveOutcomeRequest,
    db: Session = Depends(get_db)
):
    """
    Record the actual real-world outcome.

    After the event occurs, record which outcome actually happened.
    The system will calculate if the prediction was correct (HIT or MISS).

    **Example:**
    ```json
    {
        "actual_outcome": "A",
        "outcome_notes": "Stock closed up 3.2% on Monday"
    }
    ```

    **Accuracy Calculation:**
    - If `judged_target == actual_outcome`: **HIT** (correct prediction)
    - If `judged_target != actual_outcome`: **MISS** (incorrect prediction)
    """
    if request.actual_outcome not in ["A", "B"]:
        raise HTTPException(
            status_code=400,
            detail="actual_outcome must be 'A' or 'B'"
        )

    try:
        result = arv_system.resolve_outcome(
            db=db,
            prediction_id=prediction_id,
            actual_outcome=request.actual_outcome,
            outcome_notes=request.outcome_notes
        )

        return ResolveOutcomeResponse(**result)

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ARV system error: {str(e)}")


@router.get("/predictions/{prediction_id}/status", response_model=PredictionStatusResponse)
async def get_prediction_status(
    prediction_id: str,
    db: Session = Depends(get_db)
):
    """
    Get current status of an ARV prediction.

    Returns complete details about the prediction including:
    - Creation details
    - Submission status
    - Judging status
    - Outcome resolution (if complete)

    Use this to check progress through the ARV protocol.
    """
    try:
        result = arv_system.get_prediction_status(
            db=db,
            prediction_id=prediction_id
        )

        return PredictionStatusResponse(**result)

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ARV system error: {str(e)}")


@router.get("/stats", response_model=AccuracyStatsResponse)
async def get_accuracy_statistics(
    days: int = 30,
    req: Request = None,
    db: Session = Depends(get_db)
):
    """
    Get ARV prediction accuracy statistics.

    Calculates:
    - Total predictions
    - Hits vs. Misses
    - Accuracy percentage
    - Statistical significance (vs. 50% chance)

    **Query Parameters:**
    - `days`: Number of days to analyze (default: 30, max: 365)

    **Statistical Significance Levels:**
    - `not_significant`: p > 0.05 (could be chance)
    - `significant`: p < 0.05 (likely not chance)
    - `very_significant`: p < 0.01 (very unlikely to be chance)
    - `highly_significant`: p < 0.001 (extremely unlikely to be chance)

    ARV research has shown above-chance results in controlled studies.
    Track your personal accuracy over time!
    """
    if days < 1 or days > 365:
        raise HTTPException(
            status_code=400,
            detail="Days must be between 1 and 365"
        )

    try:
        # Get user identifier for personalized stats
        user_identifier = req.client.host if req else None

        result = arv_system.get_accuracy_statistics(
            db=db,
            user_identifier=user_identifier,
            days=days
        )

        return AccuracyStatsResponse(**result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ARV system error: {str(e)}")


@router.get("/history", response_model=PredictionHistoryResponse)
async def get_prediction_history(
    limit: int = 20,
    status: Optional[str] = None,
    req: Request = None,
    db: Session = Depends(get_db)
):
    """
    Get prediction history.

    Returns list of past predictions with their outcomes.

    **Query Parameters:**
    - `limit`: Maximum predictions to return (default: 20, max: 100)
    - `status`: Filter by status (pending, resolved, expired)
    """
    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=400,
            detail="Limit must be between 1 and 100"
        )

    if status and status not in ["pending", "resolved", "expired"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be 'pending', 'resolved', or 'expired'"
        )

    try:
        # Get user identifier
        user_identifier = req.client.host if req else None

        predictions = arv_system.get_prediction_history(
            db=db,
            user_identifier=user_identifier,
            limit=limit,
            status=status
        )

        history_items = [PredictionHistoryItem(**p) for p in predictions]

        return PredictionHistoryResponse(
            predictions=history_items,
            count=len(history_items)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ARV system error: {str(e)}")


@router.get("/info")
async def get_arv_info():
    """
    Get information about the ARV system.

    Explains how ARV works and its historical background.
    """
    return {
        "name": "ARV (Associative Remote Viewing)",
        "description": "Prediction system using remote viewing and target association",
        "protocol": {
            "step_1": "Create prediction with two distinct targets (A and B)",
            "step_2": "Associate each target with a binary outcome",
            "step_3": "Viewer receives blind target (randomly selected)",
            "step_4": "Viewer describes impressions without knowing associations",
            "step_5": "Judge determines which target matches description",
            "step_6": "Real-world outcome occurs and is recorded",
            "step_7": "Accuracy calculated (HIT or MISS)"
        },
        "key_principles": [
            "Viewer never knows outcome associations during viewing",
            "Targets should be maximally different (high dissimilarity)",
            "Judging happens BEFORE outcome is known",
            "Statistical tracking reveals above-chance performance"
        ],
        "applications": [
            "Stock market predictions (up/down)",
            "Sports outcomes (win/lose)",
            "Binary events (yes/no)",
            "Multiple choice decisions (A/B/C/D)"
        ],
        "research": {
            "origin": "Developed in 1970s-1980s during remote viewing research",
            "key_researchers": ["Russell Targ", "Lyn Buchanan", "PEAR Lab (Princeton)"],
            "results": "Multiple studies showed statistically significant above-chance results",
            "reference": "Mind-Reach by Russell Targ and Harold Puthoff"
        },
        "integration_with_ebl": (
            "Use EBL's binaural beats (theta/alpha protocols) to enhance "
            "remote viewing sessions. Track which frequencies correlate with "
            "higher prediction accuracy."
        )
    }


@router.get("/examples")
async def get_arv_examples():
    """
    Get example target pairs and prediction setups.

    Use these as templates for creating your own ARV predictions.
    """
    return {
        "examples": [
            {
                "name": "Stock Market Prediction",
                "description": "Will AAPL stock close up or down tomorrow?",
                "target_a": {
                    "url": "https://example.com/targets/beach.jpg",
                    "description": "Tropical beach with palm trees"
                },
                "target_b": {
                    "url": "https://example.com/targets/mountain.jpg",
                    "description": "Snow-covered mountain peak"
                },
                "outcome_a_label": "Stock Up",
                "outcome_b_label": "Stock Down",
                "target_type": "image_pair"
            },
            {
                "name": "Sports Game Outcome",
                "description": "Will the Lakers win or lose tonight?",
                "target_a": {
                    "description": "Fireworks celebration, trophy, champagne"
                },
                "target_b": {
                    "description": "Empty locker room, quiet, dimly lit"
                },
                "outcome_a_label": "Win",
                "outcome_b_label": "Loss",
                "target_type": "description_pair"
            },
            {
                "name": "Weather Prediction",
                "description": "Will it rain tomorrow?",
                "target_a": {
                    "coordinates": {"lat": 21.3099, "lon": -157.8581},
                    "description": "Waikiki Beach, Hawaii (sunny)"
                },
                "target_b": {
                    "coordinates": {"lat": 47.6062, "lon": -122.3321},
                    "description": "Seattle, Washington (rainy)"
                },
                "outcome_a_label": "No Rain",
                "outcome_b_label": "Rain",
                "target_type": "location_pair"
            }
        ],
        "tips": [
            "Choose targets that are VERY different from each other",
            "Visual targets tend to work well (images, locations)",
            "Avoid targets that are conceptually related to the outcome",
            "Use consistent target types for better statistics",
            "Record all impressions, even if they seem irrelevant",
            "Practice regularly to improve accuracy over time"
        ]
    }
