"""
Quantum Oracle API Routes

Endpoints for quantum random number generation:
- Tournament Mode: Daily numbers that reveal at midnight UTC
- Practice Mode: On-demand number generation for intuition training

Source: ANU QRNG (Australian National University Quantum Random Number Generator)
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone

from database.database import get_db
from services.quantum_oracle import quantum_oracle

router = APIRouter(prefix="/quantum", tags=["Quantum Oracle"])


# Request/Response Models
class PracticeRequest(BaseModel):
    """Request for practice mode number generation."""
    min_value: int = Field(default=1, ge=1, le=1000, description="Minimum number")
    max_value: int = Field(default=69, ge=1, le=1000, description="Maximum number")


class QuantumNumberResponse(BaseModel):
    """Response containing a quantum random number."""
    number: int
    raw_quantum: int
    timestamp: str
    source: str
    mode: str
    status: Optional[str] = None


class DailyNumberResponse(BaseModel):
    """Response for daily tournament number."""
    number: Optional[int] = None
    raw_quantum: Optional[int] = None
    date: str
    materialized_at: Optional[str] = None
    source: Optional[str] = None
    mode: str
    status: str
    reveal_time: Optional[str] = None
    seconds_until_reveal: Optional[int] = None
    message: Optional[str] = None


class HistoryResponse(BaseModel):
    """Response for quantum number history."""
    numbers: List[dict]
    count: int


# Practice Mode Endpoints
@router.post("/practice", response_model=QuantumNumberResponse)
async def generate_practice_number(
    request: PracticeRequest = PracticeRequest(),
    req: Request = None,
    db: Session = Depends(get_db)
):
    """
    Generate a quantum random number (Practice Mode).

    Each call creates a NEW quantum collapse - the number doesn't
    exist until this observation is made. Use for intuition training.

    - **min_value**: Minimum number in range (default: 1)
    - **max_value**: Maximum number in range (default: 69)

    Returns a truly random number from ANU QRNG quantum vacuum fluctuations.
    """
    if request.min_value >= request.max_value:
        raise HTTPException(
            status_code=400,
            detail="min_value must be less than max_value"
        )

    try:
        result = await quantum_oracle.generate_quantum_number(
            min_val=request.min_value,
            max_val=request.max_value
        )

        # Optionally store practice number for analytics
        from database.models import QuantumPracticeNumber
        practice_record = QuantumPracticeNumber(
            user_identifier=req.client.host if req else None,
            number=result["number"],
            raw_quantum=result["raw_quantum"],
            source=result["source"]
        )
        db.add(practice_record)
        db.commit()

        return QuantumNumberResponse(**result)

    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Quantum oracle temporarily unavailable: {str(e)}"
        )


@router.get("/practice/quick")
async def generate_quick_number():
    """
    Quick practice number generation (no database storage).

    Faster endpoint for rapid practice sessions.
    Returns number in default 1-69 range.
    """
    try:
        result = await quantum_oracle.generate_quantum_number()
        return result
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Quantum oracle temporarily unavailable: {str(e)}"
        )


# Tournament Mode Endpoints
@router.get("/daily", response_model=DailyNumberResponse)
async def get_daily_number(db: Session = Depends(get_db)):
    """
    Get today's quantum number (Tournament Mode).

    The number materializes at midnight UTC.
    - Before midnight: Returns countdown to reveal
    - After midnight: Returns the permanent number for today

    All users see the SAME number for any given day.
    """
    try:
        result = await quantum_oracle.get_daily_number(db)
        return DailyNumberResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Quantum oracle error: {str(e)}"
        )


@router.get("/daily/{date}", response_model=DailyNumberResponse)
async def get_number_for_date(
    date: str,
    db: Session = Depends(get_db)
):
    """
    Get quantum number for a specific date (Tournament Mode).

    - **date**: ISO format date string (e.g., "2024-01-15")

    Returns the number if date has passed, or countdown if future.
    """
    try:
        # Parse date string
        target_date = datetime.fromisoformat(date).replace(tzinfo=timezone.utc)
        result = await quantum_oracle.get_daily_number(db, date=target_date)
        return DailyNumberResponse(**result)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid date format. Use ISO format: YYYY-MM-DD"
        )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Quantum oracle error: {str(e)}"
        )


@router.get("/history", response_model=HistoryResponse)
async def get_quantum_history(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """
    Get history of daily quantum numbers.

    - **days**: Number of days to fetch (default: 30, max: 365)

    Returns list of past daily numbers with their dates.
    """
    if days < 1 or days > 365:
        raise HTTPException(
            status_code=400,
            detail="Days must be between 1 and 365"
        )

    try:
        numbers = await quantum_oracle.get_history(db, days=days)
        return HistoryResponse(numbers=numbers, count=len(numbers))
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Quantum oracle error: {str(e)}"
        )


# Info Endpoints
@router.get("/info")
async def get_quantum_info():
    """
    Get information about the Quantum Oracle system.

    Explains how quantum random number generation works and
    the difference between Tournament and Practice modes.
    """
    return {
        "name": "Quantum Oracle",
        "description": "True quantum random number generation from ANU QRNG",
        "source": {
            "name": "Australian National University Quantum Random Number Generator",
            "url": "https://qrng.anu.edu.au/",
            "method": "Quantum vacuum fluctuation measurement",
            "principle": "Numbers are generated by measuring unpredictable quantum events"
        },
        "modes": {
            "tournament": {
                "description": "Daily numbers that reveal at midnight UTC",
                "reveal_time": "00:00 UTC",
                "range": "1-69",
                "persistence": "Each day's number is permanent once revealed"
            },
            "practice": {
                "description": "On-demand number generation",
                "range": "1-69 (default, customizable)",
                "persistence": "Each request generates a new quantum collapse"
            }
        },
        "quantum_principle": (
            "The number doesn't exist until observed. "
            "When you request a number, you collapse the quantum state "
            "from all possibilities into a single definite value."
        )
    }


@router.get("/countdown")
async def get_countdown():
    """
    Get countdown to next daily number reveal.

    Returns seconds until midnight UTC when the next number materializes.
    """
    now = datetime.now(timezone.utc)

    # Calculate next midnight UTC
    if now.hour == 0 and now.minute == 0:
        # It's exactly midnight - reveal is now
        seconds_until = 0
    else:
        # Calculate time until next midnight
        tomorrow = now.replace(
            hour=0, minute=0, second=0, microsecond=0
        ) + timedelta(days=1)
        seconds_until = int((tomorrow - now).total_seconds())

    return {
        "current_time_utc": now.isoformat(),
        "next_reveal_utc": now.replace(
            hour=0, minute=0, second=0, microsecond=0
        ).isoformat() if seconds_until == 0 else (
            now.replace(hour=0, minute=0, second=0, microsecond=0) +
            timedelta(days=1)
        ).isoformat(),
        "seconds_until_reveal": seconds_until,
        "formatted": f"{seconds_until // 3600}h {(seconds_until % 3600) // 60}m {seconds_until % 60}s"
    }


# Import timedelta for countdown calculation
from datetime import timedelta


# ============================================================================
# Remote Viewing Target Endpoints (8-Digit Quantum Entanglement)
# ============================================================================

class RVTargetResponse(BaseModel):
    """Response for RV target number generation."""
    target_number: str
    target_id: Optional[str] = None
    raw_quantum_values: Optional[List[int]] = None
    entanglement_timestamp: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    source: str
    status: str
    mode: str


class RVFeedbackResponse(BaseModel):
    """Response for RV target feedback reveal."""
    status: str
    target_id: str
    coordinate: str
    target: Optional[dict] = None
    your_impression: Optional[dict] = None
    revealed_at: Optional[str] = None
    message: str


@router.post("/rv/target", response_model=RVTargetResponse)
async def generate_rv_target(
    req: Request = None,
    db: Session = Depends(get_db)
):
    """
    Generate an 8-digit quantum-entangled Remote Viewing target.

    Creates a pure 8-digit number (00000000-99999999) that is quantum-entangled
    with a target image/location. The viewer focuses on this number to
    perceive the target through Remote Viewing.

    The 8-digit number and target are generated together from the same
    quantum collapse event, creating entanglement between them.

    Returns:
        - target_number: 8-digit viewing number (e.g., "12345678")
        - target_id: ID for later feedback retrieval
        - entanglement_timestamp: Moment of quantum collapse
    """
    try:
        result = await quantum_oracle.generate_entangled_rv_target(db)
        return RVTargetResponse(**result)

    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Quantum oracle unavailable: {str(e)}"
        )


@router.get("/rv/target/{target_id}/feedback", response_model=RVFeedbackResponse)
async def get_rv_target_feedback(
    target_id: str,
    db: Session = Depends(get_db)
):
    """
    Reveal the actual target after Remote Viewing session.

    This breaks the double-blind protocol - viewer can now see what
    the 8-digit number was entangled with.

    Must submit impressions first before viewing feedback.

    - **target_id**: The target ID from the initial generation

    Returns full target details including name, description, and feedback image.
    """
    from services.rv_targets import rv_target_service

    try:
        result = await rv_target_service.get_feedback(
            db=db,
            target_id=target_id,
            mode="practice"
        )
        return RVFeedbackResponse(**result)

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Feedback retrieval error: {str(e)}"
        )


class RVImpressionRequest(BaseModel):
    """Request for submitting RV impressions."""
    descriptors: str = Field(default="", description="Visual descriptors perceived")
    notes: str = Field(default="", description="Session notes and impressions")
    confidence: float = Field(default=0.5, ge=0.0, le=1.0, description="Confidence level 0-1")
    duration_minutes: int = Field(default=0, ge=0, description="Session duration in minutes")


@router.post("/rv/target/{target_id}/impressions")
async def submit_rv_impressions(
    target_id: str,
    request: RVImpressionRequest,
    db: Session = Depends(get_db)
):
    """
    Submit Remote Viewing impressions for a target.

    Record what was perceived during the RV session before
    revealing the actual target (double-blind protocol).

    - **target_id**: The target ID from generation
    - **descriptors**: Visual elements perceived (colors, shapes, textures)
    - **notes**: Free-form session notes
    - **confidence**: 0-1 confidence rating
    - **duration_minutes**: How long the session lasted

    After submission, can request feedback to see actual target.
    """
    from services.rv_targets import rv_target_service

    try:
        result = await rv_target_service.submit_impression(
            db=db,
            target_id=target_id,
            impression_data={
                "descriptors": request.descriptors,
                "notes": request.notes,
                "confidence": request.confidence,
                "duration_minutes": request.duration_minutes
            },
            mode="practice"
        )
        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Impression submission error: {str(e)}"
        )
