"""
RV Tournament Mode API Routes

Tournament Mode Remote Viewing with time-based reveals:
- 12-hour cycles: Entanglement (midnight UTC), Reveal (noon UTC)
- Target format: xxxx-xxxx (8-digit number with hyphen)
- Predictions submitted before reveal
- Results available after reveal
- Global leaderboard rankings

Tournament Flow:
1. GET /tournament/status - Check current cycle and countdown
2. GET /tournament/current - Get current target coordinate (after entanglement)
3. POST /tournament/predict - Submit prediction (what you think target is)
4. GET /tournament/results - Get results (after reveal)
5. GET /tournament/leaderboard - View rankings

Practice Mode (for reference):
- POST /api/quantum/rv/target - Generate instant practice target
- POST /api/quantum/rv/target/{id}/predict - Submit practice prediction
- GET /api/quantum/rv/target/{id}/feedback - Get instant results
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import Integer, func, desc, cast
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
import logging

from database.database import get_db
from services.rv_targets import rv_target_service
from services.rv_scoring import rv_scoring_service

router = APIRouter(prefix="/rv/tournament", tags=["RV Tournament"])
logger = logging.getLogger("ebl.rv_tournament")

# Tournament constants
ENTANGLEMENT_HOUR_UTC = 0  # Midnight UTC - target materializes
REVEAL_HOUR_UTC = 12       # Noon UTC - results become available
CYCLE_HOURS = 12           # 12-hour cycles


# ============================================================================
# Request/Response Models
# ============================================================================

class TournamentStatusResponse(BaseModel):
    """Current tournament cycle status."""
    status: str  # "before_entanglement", "prediction_phase", "reveal_phase"
    current_cycle_start: str  # ISO datetime
    current_cycle_end: str  # ISO datetime
    entanglement_time: str  # When target became available
    reveal_time: str  # When results will be/were revealed
    seconds_until_reveal: Optional[int] = None
    can_predict: bool  # Can users submit predictions now?
    can_view_results: bool  # Are results available now?
    message: str


class TournamentTargetResponse(BaseModel):
    """Tournament target coordinate (available after entanglement)."""
    coordinate: str  # "xxxx-xxxx" format
    target_id: str
    cycle_start: str
    reveal_time: str
    seconds_until_reveal: int
    predictions_allowed: bool
    message: str


class TournamentPredictionRequest(BaseModel):
    """Prediction submission for tournament target."""
    predicted_number: str = Field(
        ...,
        pattern=r"^\d{4}-\d{4}$",
        description="Predicted 8-digit number in xxxx-xxxx format"
    )
    impressions: str = Field(..., min_length=1, description="Your viewing impressions")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence level 0-1")

    # Optional viewing session details
    base_frequency: Optional[float] = Field(None, ge=20, le=20000)
    beat_frequency: Optional[float] = Field(None, ge=0.1, le=100)
    protocol_used: Optional[str] = None
    session_duration_minutes: Optional[int] = Field(None, ge=0)


class TournamentPredictionResponse(BaseModel):
    """Response after submitting tournament prediction."""
    prediction_id: str
    coordinate: str
    predicted_number: str
    submitted_at: str
    reveal_time: str
    seconds_until_reveal: int
    status: str
    message: str


class TournamentResultsResponse(BaseModel):
    """Tournament results (available after reveal)."""
    coordinate: str
    actual_target: Dict[str, Any]  # Full target details
    your_prediction: Optional[Dict[str, Any]] = None  # User's prediction if they participated
    is_correct: Optional[bool] = None
    score: Optional[float] = None  # Accuracy score if predicted
    total_participants: int
    correct_predictions: int
    accuracy_rate: float
    revealed_at: str


class TournamentLeaderboardEntry(BaseModel):
    """Single leaderboard entry."""
    rank: int
    user_name: str
    total_correct: int
    total_predictions: int
    accuracy_rate: float
    total_points: int
    current_streak: int
    best_streak: int


class TournamentLeaderboardResponse(BaseModel):
    """Tournament leaderboard."""
    leaderboard: List[TournamentLeaderboardEntry]
    total_users: int
    cycle_filter: Optional[str] = None  # "current", "all_time", "last_30_days"
    updated_at: str


# ============================================================================
# Helper Functions
# ============================================================================

def _get_current_cycle() -> Dict[str, Any]:
    """
    Calculate current tournament cycle times.

    Tournament runs in 12-hour cycles:
    - Cycle 1: 00:00 UTC to 12:00 UTC (entanglement at 00:00, reveal at 12:00)
    - Cycle 2: 12:00 UTC to 00:00 UTC (entanglement at 12:00, reveal at 00:00 next day)

    Returns:
        Dict with cycle timing information
    """
    now = datetime.now(timezone.utc)

    # Determine which cycle we're in
    if now.hour < REVEAL_HOUR_UTC:
        # We're in Cycle 1 (midnight to noon)
        cycle_start = now.replace(hour=ENTANGLEMENT_HOUR_UTC, minute=0, second=0, microsecond=0)
        entanglement = cycle_start
        reveal = now.replace(hour=REVEAL_HOUR_UTC, minute=0, second=0, microsecond=0)
        cycle_end = reveal
    else:
        # We're in Cycle 2 (noon to midnight)
        cycle_start = now.replace(hour=REVEAL_HOUR_UTC, minute=0, second=0, microsecond=0)
        entanglement = cycle_start
        reveal = (now + timedelta(days=1)).replace(
            hour=ENTANGLEMENT_HOUR_UTC, minute=0, second=0, microsecond=0
        )
        cycle_end = reveal

    # Calculate seconds until reveal
    seconds_until_reveal = int((reveal - now).total_seconds())

    # Determine phase
    if now < entanglement:
        status = "before_entanglement"
        can_predict = False
        can_view_results = False
        message = "Tournament cycle not yet started"
    elif now < reveal:
        status = "prediction_phase"
        can_predict = True
        can_view_results = False
        message = "Prediction phase - submit your predictions now!"
    else:
        status = "reveal_phase"
        can_predict = False
        can_view_results = True
        message = "Results available - view your accuracy!"

    return {
        "status": status,
        "cycle_start": cycle_start,
        "cycle_end": cycle_end,
        "entanglement": entanglement,
        "reveal": reveal,
        "seconds_until_reveal": max(0, seconds_until_reveal),
        "can_predict": can_predict,
        "can_view_results": can_view_results,
        "message": message,
        "now": now
    }


def _format_cycle_id(dt: datetime) -> str:
    """
    Generate unique cycle ID from datetime.

    Format: YYYYMMDD-C1 or YYYYMMDD-C2

    Args:
        dt: Datetime in the cycle

    Returns:
        Cycle ID string
    """
    cycle_num = 1 if dt.hour < REVEAL_HOUR_UTC else 2
    return f"{dt.strftime('%Y%m%d')}-C{cycle_num}"


def _generate_tournament_coordinate() -> str:
    """
    Generate tournament target coordinate in xxxx-xxxx format.

    Uses cryptographically secure random generation.

    Returns:
        String in format "xxxx-xxxx"
    """
    import secrets

    # Generate two 4-digit numbers
    part1 = secrets.randbelow(10000)  # 0000-9999
    part2 = secrets.randbelow(10000)  # 0000-9999

    # Format with leading zeros
    coordinate = f"{part1:04d}-{part2:04d}"
    logger.info(f"Generated tournament coordinate: {coordinate}")
    return coordinate


async def _generate_quantum_number() -> Dict[str, Any]:
    """
    Generate hidden quantum number using ANU QRNG with fallback.

    This number is tied to the coordinate but hidden until reveal.

    Returns:
        Dict with quantum_number (1-69), raw value, and source
    """
    from services.quantum_oracle import quantum_oracle

    try:
        result = await quantum_oracle.generate_quantum_number(min_val=1, max_val=69)
        return {
            "quantum_number": result["number"],
            "quantum_raw": result["raw_quantum"],
            "quantum_source": result["source"]
        }
    except Exception as e:
        # Fallback to local if quantum service fails
        import secrets
        raw = secrets.randbelow(65536)
        number = 1 + (raw % 69)
        logger.warning(f"Quantum service failed ({e}), using local fallback")
        return {
            "quantum_number": number,
            "quantum_raw": raw,
            "quantum_source": "LOCAL_CRYPTO"
        }


# ============================================================================
# Tournament Status Endpoints
# ============================================================================

@router.get("/status", response_model=TournamentStatusResponse)
async def get_tournament_status(db: Session = Depends(get_db)):
    """
    Get current tournament cycle status and countdown.

    Returns information about:
    - Current cycle phase (before entanglement, prediction, reveal)
    - Timing (when entanglement happened, when reveal occurs)
    - Whether predictions are allowed
    - Whether results are available
    - Countdown to reveal

    Use this to show users when they can predict and view results.
    """
    try:
        cycle = _get_current_cycle()

        return TournamentStatusResponse(
            status=cycle["status"],
            current_cycle_start=cycle["cycle_start"].isoformat(),
            current_cycle_end=cycle["cycle_end"].isoformat(),
            entanglement_time=cycle["entanglement"].isoformat(),
            reveal_time=cycle["reveal"].isoformat(),
            seconds_until_reveal=cycle["seconds_until_reveal"],
            can_predict=cycle["can_predict"],
            can_view_results=cycle["can_view_results"],
            message=cycle["message"]
        )

    except Exception as e:
        logger.error(f"Error getting tournament status: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Tournament status error: {str(e)}")


@router.get("/current", response_model=TournamentTargetResponse)
async def get_current_tournament_target(db: Session = Depends(get_db)):
    """
    Get current tournament target coordinate.

    Returns the target number for the current cycle.
    - Only available AFTER entanglement time
    - Before entanglement: Returns error
    - During prediction phase: Returns coordinate only
    - After reveal: Returns coordinate (get full results from /results endpoint)

    All users receive the same coordinate for the current cycle.
    """
    try:
        cycle = _get_current_cycle()

        # Check if target is available
        if cycle["status"] == "before_entanglement":
            raise HTTPException(
                status_code=400,
                detail=f"Tournament target not yet available. Entanglement at {cycle['entanglement'].isoformat()}"
            )

        # Get or create tournament target for this cycle
        from database.models import RVTournamentCycle

        cycle_id = _format_cycle_id(cycle["entanglement"])

        tournament_cycle = db.query(RVTournamentCycle).filter(
            RVTournamentCycle.cycle_id == cycle_id
        ).first()

        if not tournament_cycle:
            # Create new tournament cycle with coordinate AND hidden quantum number
            coordinate = _generate_tournament_coordinate()

            # Generate the hidden quantum number (tied to this coordinate)
            quantum_data = await _generate_quantum_number()

            tournament_cycle = RVTournamentCycle(
                cycle_id=cycle_id,
                coordinate=coordinate,
                quantum_number=quantum_data["quantum_number"],
                quantum_raw=quantum_data["quantum_raw"],
                quantum_source=quantum_data["quantum_source"],
                entanglement_time=cycle["entanglement"],
                reveal_time=cycle["reveal"],
                status="active" if cycle["can_predict"] else "revealed"
            )

            db.add(tournament_cycle)
            db.commit()
            db.refresh(tournament_cycle)

            logger.info(f"Created tournament cycle: {cycle_id}, coordinate: {coordinate}, quantum: {quantum_data['quantum_number']} (hidden)")

        return TournamentTargetResponse(
            coordinate=tournament_cycle.coordinate,
            target_id=tournament_cycle.id,
            cycle_start=cycle["cycle_start"].isoformat(),
            reveal_time=cycle["reveal"].isoformat(),
            seconds_until_reveal=cycle["seconds_until_reveal"],
            predictions_allowed=cycle["can_predict"],
            message="Submit your prediction before reveal time!" if cycle["can_predict"]
                    else "Prediction phase ended - check /results"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting tournament target: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Tournament target error: {str(e)}")


# ============================================================================
# Prediction Submission
# ============================================================================

@router.post("/predict", response_model=TournamentPredictionResponse)
async def submit_tournament_prediction(
    request: TournamentPredictionRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """
    Submit your prediction for the current tournament target.

    Predict what the 8-digit number will be for the current cycle.

    Requirements:
    - Must be during prediction phase (after entanglement, before reveal)
    - Format: xxxx-xxxx (e.g., "1234-5678")
    - Include your viewing impressions
    - One prediction per user per cycle

    After reveal time, check /results to see if you were correct!
    """
    try:
        cycle = _get_current_cycle()

        # Validate timing
        if not cycle["can_predict"]:
            if cycle["status"] == "before_entanglement":
                raise HTTPException(
                    status_code=400,
                    detail=f"Tournament not yet started. Entanglement at {cycle['entanglement'].isoformat()}"
                )
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Prediction phase ended. Results available at /tournament/results"
                )

        # Get current tournament cycle
        from database.models import RVTournamentCycle, RVTournamentPrediction

        cycle_id = _format_cycle_id(cycle["entanglement"])

        tournament_cycle = db.query(RVTournamentCycle).filter(
            RVTournamentCycle.cycle_id == cycle_id
        ).first()

        if not tournament_cycle:
            raise HTTPException(
                status_code=500,
                detail="Tournament cycle not initialized. Try GET /tournament/current first."
            )

        # Check for existing prediction from this user
        user_identifier = req.client.host if req else None

        existing = db.query(RVTournamentPrediction).filter(
            RVTournamentPrediction.cycle_id == tournament_cycle.id,
            RVTournamentPrediction.user_identifier == user_identifier
        ).first()

        if existing:
            raise HTTPException(
                status_code=400,
                detail="You already submitted a prediction for this cycle"
            )

        # Create prediction
        prediction = RVTournamentPrediction(
            cycle_id=tournament_cycle.id,
            user_identifier=user_identifier,
            predicted_number=request.predicted_number,
            impressions=request.impressions,
            confidence=request.confidence,
            base_frequency=request.base_frequency,
            beat_frequency=request.beat_frequency,
            protocol_used=request.protocol_used,
            session_duration_minutes=request.session_duration_minutes
        )

        db.add(prediction)
        db.commit()
        db.refresh(prediction)

        logger.info(f"Tournament prediction submitted: {prediction.id}, user: {user_identifier}")

        return TournamentPredictionResponse(
            prediction_id=prediction.id,
            coordinate=tournament_cycle.coordinate,
            predicted_number=request.predicted_number,
            submitted_at=prediction.submitted_at.isoformat(),
            reveal_time=cycle["reveal"].isoformat(),
            seconds_until_reveal=cycle["seconds_until_reveal"],
            status="pending",
            message=f"Prediction recorded! Results available in {cycle['seconds_until_reveal']} seconds"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting tournament prediction: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction submission error: {str(e)}")


# ============================================================================
# Results & Scoring
# ============================================================================

@router.get("/results", response_model=TournamentResultsResponse)
async def get_tournament_results(
    req: Request,
    db: Session = Depends(get_db)
):
    """
    Get tournament results for the current cycle.

    Available ONLY after reveal time.
    Shows:
    - The actual target
    - Your prediction (if you participated)
    - Whether you were correct
    - Overall statistics (total participants, accuracy rate)

    Before reveal time: Returns error with countdown.
    """
    try:
        cycle = _get_current_cycle()

        # Check if results are available
        if not cycle["can_view_results"]:
            raise HTTPException(
                status_code=400,
                detail=f"Results not yet available. Reveal in {cycle['seconds_until_reveal']} seconds"
            )

        # Get tournament cycle
        from database.models import RVTournamentCycle, RVTournamentPrediction

        cycle_id = _format_cycle_id(cycle["entanglement"])

        tournament_cycle = db.query(RVTournamentCycle).filter(
            RVTournamentCycle.cycle_id == cycle_id
        ).first()

        if not tournament_cycle:
            raise HTTPException(
                status_code=404,
                detail="No tournament cycle found for current period"
            )

        # Mark cycle as revealed if not already
        if tournament_cycle.status != "revealed":
            tournament_cycle.status = "revealed"
            tournament_cycle.revealed_at = datetime.now(timezone.utc)
            db.commit()

        # Get all predictions for this cycle
        predictions = db.query(RVTournamentPrediction).filter(
            RVTournamentPrediction.cycle_id == tournament_cycle.id
        ).all()

        # Calculate results
        total_participants = len(predictions)
        correct_count = 0

        user_identifier = req.client.host if req else None
        user_prediction = None
        is_correct = None
        score = None

        for pred in predictions:
            # Check if prediction matches actual coordinate
            pred_correct = (pred.predicted_number == tournament_cycle.coordinate)

            if pred_correct:
                correct_count += 1

            # Update prediction record
            if pred.is_correct is None:
                pred.is_correct = pred_correct

                # Simple scoring: 100 for exact match, 0 otherwise
                # In production, could use similarity scoring
                pred.score = 100.0 if pred_correct else 0.0

            # Check if this is current user's prediction
            if pred.user_identifier == user_identifier:
                user_prediction = {
                    "predicted_number": pred.predicted_number,
                    "impressions": pred.impressions,
                    "confidence": pred.confidence,
                    "submitted_at": pred.submitted_at.isoformat()
                }
                is_correct = pred.is_correct
                score = pred.score

        db.commit()

        # Calculate accuracy rate
        accuracy_rate = (correct_count / total_participants * 100) if total_participants > 0 else 0.0

        return TournamentResultsResponse(
            coordinate=tournament_cycle.coordinate,
            actual_target={
                "coordinate": tournament_cycle.coordinate,
                "quantum_number": tournament_cycle.quantum_number,  # REVEALED!
                "quantum_source": tournament_cycle.quantum_source,
                "type": "quantum_entangled",
                "description": f"The quantum number {tournament_cycle.quantum_number} was entangled with coordinate {tournament_cycle.coordinate}"
            },
            your_prediction=user_prediction,
            is_correct=is_correct,
            score=score,
            total_participants=total_participants,
            correct_predictions=correct_count,
            accuracy_rate=accuracy_rate,
            revealed_at=tournament_cycle.revealed_at.isoformat() if tournament_cycle.revealed_at else cycle["reveal"].isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting tournament results: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Results retrieval error: {str(e)}")


# ============================================================================
# Leaderboard
# ============================================================================

@router.get("/leaderboard", response_model=TournamentLeaderboardResponse)
async def get_tournament_leaderboard(
    limit: int = 100,
    cycle_filter: str = "all_time",
    db: Session = Depends(get_db)
):
    """
    Get tournament leaderboard rankings.

    Shows top users by:
    - Total correct predictions
    - Accuracy rate
    - Total points
    - Current/best streaks

    Parameters:
    - **limit**: Number of top users (1-1000, default: 100)
    - **cycle_filter**: Time filter - "current", "last_30_days", "all_time" (default: all_time)
    """
    try:
        if limit < 1 or limit > 1000:
            raise HTTPException(status_code=400, detail="Limit must be between 1 and 1000")

        if cycle_filter not in ["current", "last_30_days", "all_time"]:
            raise HTTPException(
                status_code=400,
                detail="cycle_filter must be 'current', 'last_30_days', or 'all_time'"
            )

        from database.models import RVTournamentPrediction
        from sqlalchemy import func, desc

        # Build query based on filter
        if cycle_filter == "current":
            # Current cycle only
            cycle = _get_current_cycle()
            cycle_id = _format_cycle_id(cycle["entanglement"])

            from database.models import RVTournamentCycle
            current_cycle_obj = db.query(RVTournamentCycle).filter(
                RVTournamentCycle.cycle_id == cycle_id
            ).first()

            if not current_cycle_obj:
                return TournamentLeaderboardResponse(
                    leaderboard=[],
                    total_users=0,
                    cycle_filter=cycle_filter,
                    updated_at=datetime.now(timezone.utc).isoformat()
                )

            query = db.query(
                RVTournamentPrediction.user_identifier,
                func.count(RVTournamentPrediction.id).label("total_predictions"),
                func.sum(func.cast(RVTournamentPrediction.is_correct, Integer)).label("total_correct"),
                func.sum(func.coalesce(RVTournamentPrediction.score, 0)).label("total_points")
            ).filter(
                RVTournamentPrediction.cycle_id == current_cycle_obj.id
            ).group_by(RVTournamentPrediction.user_identifier)

        elif cycle_filter == "last_30_days":
            # Last 30 days
            cutoff = datetime.now(timezone.utc) - timedelta(days=30)

            query = db.query(
                RVTournamentPrediction.user_identifier,
                func.count(RVTournamentPrediction.id).label("total_predictions"),
                func.sum(func.cast(RVTournamentPrediction.is_correct, Integer)).label("total_correct"),
                func.sum(func.coalesce(RVTournamentPrediction.score, 0)).label("total_points")
            ).filter(
                RVTournamentPrediction.submitted_at >= cutoff
            ).group_by(RVTournamentPrediction.user_identifier)

        else:  # all_time
            query = db.query(
                RVTournamentPrediction.user_identifier,
                func.count(RVTournamentPrediction.id).label("total_predictions"),
                func.sum(func.cast(RVTournamentPrediction.is_correct, Integer)).label("total_correct"),
                func.sum(func.coalesce(RVTournamentPrediction.score, 0)).label("total_points")
            ).group_by(RVTournamentPrediction.user_identifier)

        # Order by total points (or correct predictions)
        results = query.order_by(desc("total_correct"), desc("total_points")).limit(limit).all()

        # Format leaderboard
        leaderboard = []
        for rank, row in enumerate(results, start=1):
            total_predictions = row.total_predictions or 0
            total_correct = row.total_correct or 0
            total_points = int(row.total_points or 0)

            accuracy_rate = (total_correct / total_predictions * 100) if total_predictions > 0 else 0.0

            # TODO: Calculate streaks from sequential predictions
            # For now, using placeholder values
            current_streak = 0
            best_streak = 0

            leaderboard.append(TournamentLeaderboardEntry(
                rank=rank,
                user_name=f"User_{row.user_identifier[:8]}" if row.user_identifier else "Anonymous",
                total_correct=total_correct,
                total_predictions=total_predictions,
                accuracy_rate=accuracy_rate,
                total_points=total_points,
                current_streak=current_streak,
                best_streak=best_streak
            ))

        return TournamentLeaderboardResponse(
            leaderboard=leaderboard,
            total_users=len(leaderboard),
            cycle_filter=cycle_filter,
            updated_at=datetime.now(timezone.utc).isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting tournament leaderboard: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Leaderboard error: {str(e)}")


# ============================================================================
# Info & History
# ============================================================================

@router.get("/info")
async def get_tournament_info():
    """
    Get information about tournament mode.

    Explains how the tournament system works, timing, and rules.
    """
    return {
        "name": "RV Tournament Mode",
        "description": "12-hour tournament cycles with global leaderboard",
        "how_it_works": {
            "1_entanglement": "Every 12 hours (midnight & noon UTC), a new target coordinate materializes",
            "2_prediction": "All users predict the same 8-digit number (xxxx-xxxx format)",
            "3_reveal": "After 12 hours, results are revealed and predictions are scored",
            "4_leaderboard": "Rankings based on accuracy, points, and streaks"
        },
        "timing": {
            "cycle_duration": "12 hours",
            "entanglement_times": "00:00 UTC and 12:00 UTC",
            "reveal_times": "12:00 UTC and 00:00 UTC (next day)",
            "timezone": "All times in UTC"
        },
        "scoring": {
            "exact_match": "100 points",
            "no_match": "0 points",
            "future_enhancement": "Partial credit for close predictions"
        },
        "rules": {
            "one_prediction_per_cycle": "Can only submit once per 12-hour cycle",
            "prediction_window": "Must predict after entanglement, before reveal",
            "target_format": "xxxx-xxxx (8 digits with hyphen)",
            "impressions_required": "Must include your viewing impressions"
        },
        "endpoints": {
            "status": "GET /tournament/status - Check current cycle",
            "current": "GET /tournament/current - Get target coordinate",
            "predict": "POST /tournament/predict - Submit prediction",
            "results": "GET /tournament/results - View results (after reveal)",
            "leaderboard": "GET /tournament/leaderboard - Global rankings"
        }
    }


@router.get("/history")
async def get_tournament_history(
    req: Request,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Get user's tournament history.

    Returns your past predictions and results.

    Parameters:
    - **limit**: Number of recent cycles (1-100, default: 20)
    """
    try:
        if limit < 1 or limit > 100:
            raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")

        from database.models import RVTournamentPrediction, RVTournamentCycle

        user_identifier = req.client.host if req else None

        predictions = db.query(RVTournamentPrediction).join(
            RVTournamentCycle,
            RVTournamentPrediction.cycle_id == RVTournamentCycle.id
        ).filter(
            RVTournamentPrediction.user_identifier == user_identifier
        ).order_by(
            RVTournamentPrediction.submitted_at.desc()
        ).limit(limit).all()

        history = []
        for pred in predictions:
            cycle = db.query(RVTournamentCycle).filter(
                RVTournamentCycle.id == pred.cycle_id
            ).first()

            history.append({
                "prediction_id": pred.id,
                "cycle_id": cycle.cycle_id if cycle else None,
                "coordinate": cycle.coordinate if cycle else None,
                "predicted_number": pred.predicted_number,
                "is_correct": pred.is_correct,
                "score": pred.score,
                "confidence": pred.confidence,
                "submitted_at": pred.submitted_at.isoformat(),
                "revealed": cycle.status == "revealed" if cycle else False
            })

        return {
            "history": history,
            "count": len(history),
            "user_identifier": user_identifier
        }

    except Exception as e:
        logger.error(f"Error getting tournament history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"History retrieval error: {str(e)}")
