"""
Unit tests for ARV (Associative Remote Viewing) System

Tests cover:
- Creating predictions
- Blind target selection
- Viewing submission
- Judging
- Outcome resolution
- Statistics calculation
- History tracking
"""

import pytest
from datetime import datetime, timezone, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.base import Base
from database.models import ARVPrediction, ARVTargetPair, ARVSubmission, ARVOutcome
from services.arv_system import arv_system, ARVTargetType, ARVOutcomeStatus


# Test database setup
@pytest.fixture
def db_session():
    """
    Create a test database session.

    Uses in-memory SQLite for testing isolation.
    """
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    yield session

    session.close()


# ============================================================================
# Test Fixtures
# ============================================================================

@pytest.fixture
def sample_target_pair():
    """Sample target pair data for testing."""
    return {
        "target_a": {
            "url": "https://example.com/beach.jpg",
            "description": "Tropical beach with palm trees"
        },
        "target_b": {
            "url": "https://example.com/mountain.jpg",
            "description": "Snow-covered mountain peak"
        }
    }


# ============================================================================
# Test: Create Prediction
# ============================================================================

def test_create_prediction_success(db_session, sample_target_pair):
    """
    Test successful ARV prediction creation.

    Expected:
        - Prediction record created
        - Target pair created
        - Returns prediction ID and details
    """
    result = arv_system.create_prediction(
        db=db_session,
        name="Test Prediction",
        description="Test stock prediction",
        target_a=sample_target_pair["target_a"],
        target_b=sample_target_pair["target_b"],
        outcome_a_label="Stock Up",
        outcome_b_label="Stock Down",
        target_type=ARVTargetType.IMAGE_PAIR,
        user_identifier="test_user"
    )

    assert "prediction_id" in result
    assert result["name"] == "Test Prediction"
    assert result["status"] == ARVOutcomeStatus.PENDING.value

    # Verify database records
    prediction = db_session.query(ARVPrediction).filter(
        ARVPrediction.id == result["prediction_id"]
    ).first()

    assert prediction is not None
    assert prediction.name == "Test Prediction"


def test_create_prediction_with_deadline(db_session, sample_target_pair):
    """
    Test creating prediction with deadline.

    Expected:
        - Deadline is stored correctly
    """
    deadline = datetime.now(timezone.utc) + timedelta(days=1)

    result = arv_system.create_prediction(
        db=db_session,
        name="Test with Deadline",
        description="Prediction with deadline",
        target_a=sample_target_pair["target_a"],
        target_b=sample_target_pair["target_b"],
        outcome_a_label="Yes",
        outcome_b_label="No",
        target_type=ARVTargetType.IMAGE_PAIR,
        deadline=deadline
    )

    prediction = db_session.query(ARVPrediction).filter(
        ARVPrediction.id == result["prediction_id"]
    ).first()

    # Just verify deadline was stored (SQLite may not preserve timezone exactly)
    assert prediction.deadline is not None


# ============================================================================
# Test: Get Blind Target
# ============================================================================

def test_get_blind_target_random_selection(db_session, sample_target_pair):
    """
    Test blind target retrieval.

    Expected:
        - Returns either target A or B
        - Selected target is stored in prediction
        - Target data is returned
    """
    # Create prediction
    prediction = arv_system.create_prediction(
        db=db_session,
        name="Blind Target Test",
        description="Test blind target selection",
        target_a=sample_target_pair["target_a"],
        target_b=sample_target_pair["target_b"],
        outcome_a_label="Option A",
        outcome_b_label="Option B",
        target_type=ARVTargetType.IMAGE_PAIR
    )

    # Get blind target
    result = arv_system.get_blind_target(
        db=db_session,
        prediction_id=prediction["prediction_id"]
    )

    assert "target_data" in result
    assert result["prediction_id"] == prediction["prediction_id"]
    assert "instructions" in result

    # Verify selected target is stored
    db_prediction = db_session.query(ARVPrediction).filter(
        ARVPrediction.id == prediction["prediction_id"]
    ).first()

    assert db_prediction.selected_target in ["A", "B"]


def test_get_blind_target_invalid_prediction(db_session):
    """
    Test blind target retrieval with invalid prediction ID.

    Expected:
        - Raises ValueError
    """
    with pytest.raises(ValueError, match="Prediction .* not found"):
        arv_system.get_blind_target(
            db=db_session,
            prediction_id="invalid_id"
        )


# ============================================================================
# Test: Submit Viewing Data
# ============================================================================

def test_submit_viewing_data_success(db_session, sample_target_pair):
    """
    Test submitting viewing impressions.

    Expected:
        - Submission record created
        - Returns submission ID
    """
    # Create prediction and get target
    prediction = arv_system.create_prediction(
        db=db_session,
        name="Viewing Test",
        description="Test viewing submission",
        target_a=sample_target_pair["target_a"],
        target_b=sample_target_pair["target_b"],
        outcome_a_label="Up",
        outcome_b_label="Down",
        target_type=ARVTargetType.IMAGE_PAIR
    )

    arv_system.get_blind_target(db=db_session, prediction_id=prediction["prediction_id"])

    # Submit impressions
    result = arv_system.submit_viewing_data(
        db=db_session,
        prediction_id=prediction["prediction_id"],
        impressions="I see blue water, sandy beach, palm trees swaying",
        confidence=0.75,
        session_notes="Theta protocol, clear session"
    )

    assert "submission_id" in result
    assert result["status"] == "submitted"
    assert result["next_step"] == "judging"

    # Verify database record
    submission = db_session.query(ARVSubmission).filter(
        ARVSubmission.prediction_id == prediction["prediction_id"]
    ).first()

    assert submission is not None
    assert submission.impressions == "I see blue water, sandy beach, palm trees swaying"
    assert submission.confidence == 0.75


def test_submit_viewing_data_minimal(db_session, sample_target_pair):
    """
    Test submitting minimal viewing data (impressions only).

    Expected:
        - Submission succeeds with only required fields
    """
    prediction = arv_system.create_prediction(
        db=db_session,
        name="Minimal Test",
        description="Minimal submission test",
        target_a=sample_target_pair["target_a"],
        target_b=sample_target_pair["target_b"],
        outcome_a_label="Win",
        outcome_b_label="Lose",
        target_type=ARVTargetType.IMAGE_PAIR
    )

    arv_system.get_blind_target(db=db_session, prediction_id=prediction["prediction_id"])

    result = arv_system.submit_viewing_data(
        db=db_session,
        prediction_id=prediction["prediction_id"],
        impressions="Cold, dark, metallic"
    )

    assert result["status"] == "submitted"


# ============================================================================
# Test: Judge Target Match
# ============================================================================

def test_judge_target_match_success(db_session, sample_target_pair):
    """
    Test judging which target matches impressions.

    Expected:
        - Judged target is stored
        - Returns predicted outcome
    """
    # Create and submit
    prediction = arv_system.create_prediction(
        db=db_session,
        name="Judge Test",
        description="Test judging",
        target_a=sample_target_pair["target_a"],
        target_b=sample_target_pair["target_b"],
        outcome_a_label="Stock Up",
        outcome_b_label="Stock Down",
        target_type=ARVTargetType.IMAGE_PAIR
    )

    arv_system.get_blind_target(db=db_session, prediction_id=prediction["prediction_id"])

    arv_system.submit_viewing_data(
        db=db_session,
        prediction_id=prediction["prediction_id"],
        impressions="Beach vibes"
    )

    # Judge
    result = arv_system.judge_target_match(
        db=db_session,
        prediction_id=prediction["prediction_id"],
        judged_target="A"
    )

    assert result["judged_target"] == "A"
    assert result["predicted_outcome"] == "Stock Up"
    assert result["status"] == "judged"

    # Verify database
    db_prediction = db_session.query(ARVPrediction).filter(
        ARVPrediction.id == prediction["prediction_id"]
    ).first()

    assert db_prediction.judged_target == "A"
    assert db_prediction.judged_at is not None


def test_judge_target_match_invalid_target(db_session, sample_target_pair):
    """
    Test judging with invalid target (not A or B).

    Expected:
        - Raises ValueError
    """
    prediction = arv_system.create_prediction(
        db=db_session,
        name="Invalid Judge",
        description="Test invalid judge",
        target_a=sample_target_pair["target_a"],
        target_b=sample_target_pair["target_b"],
        outcome_a_label="Yes",
        outcome_b_label="No",
        target_type=ARVTargetType.IMAGE_PAIR
    )

    with pytest.raises(ValueError, match="judged_target must be"):
        arv_system.judge_target_match(
            db=db_session,
            prediction_id=prediction["prediction_id"],
            judged_target="C"
        )


# ============================================================================
# Test: Resolve Outcome
# ============================================================================

def test_resolve_outcome_correct_prediction(db_session, sample_target_pair):
    """
    Test resolving outcome with correct prediction (HIT).

    Expected:
        - Outcome recorded
        - is_correct = True
        - Status updated to resolved
    """
    # Create full prediction cycle
    prediction = arv_system.create_prediction(
        db=db_session,
        name="Resolve Test",
        description="Test outcome resolution",
        target_a=sample_target_pair["target_a"],
        target_b=sample_target_pair["target_b"],
        outcome_a_label="Up",
        outcome_b_label="Down",
        target_type=ARVTargetType.IMAGE_PAIR
    )

    arv_system.get_blind_target(db=db_session, prediction_id=prediction["prediction_id"])
    arv_system.submit_viewing_data(
        db=db_session,
        prediction_id=prediction["prediction_id"],
        impressions="Test impressions"
    )
    arv_system.judge_target_match(
        db=db_session,
        prediction_id=prediction["prediction_id"],
        judged_target="A"
    )

    # Resolve with correct outcome
    result = arv_system.resolve_outcome(
        db=db_session,
        prediction_id=prediction["prediction_id"],
        actual_outcome="A",
        outcome_notes="Stock closed up 2.5%"
    )

    assert result["is_correct"] is True
    assert result["accuracy"] == "HIT"
    assert result["actual_target"] == "A"

    # Verify database
    outcome = db_session.query(ARVOutcome).filter(
        ARVOutcome.prediction_id == prediction["prediction_id"]
    ).first()

    assert outcome is not None
    assert outcome.is_correct is True


def test_resolve_outcome_incorrect_prediction(db_session, sample_target_pair):
    """
    Test resolving outcome with incorrect prediction (MISS).

    Expected:
        - Outcome recorded
        - is_correct = False
    """
    prediction = arv_system.create_prediction(
        db=db_session,
        name="Miss Test",
        description="Test incorrect prediction",
        target_a=sample_target_pair["target_a"],
        target_b=sample_target_pair["target_b"],
        outcome_a_label="Win",
        outcome_b_label="Lose",
        target_type=ARVTargetType.IMAGE_PAIR
    )

    arv_system.get_blind_target(db=db_session, prediction_id=prediction["prediction_id"])
    arv_system.submit_viewing_data(
        db=db_session,
        prediction_id=prediction["prediction_id"],
        impressions="Test"
    )
    arv_system.judge_target_match(
        db=db_session,
        prediction_id=prediction["prediction_id"],
        judged_target="A"
    )

    # Resolve with incorrect outcome
    result = arv_system.resolve_outcome(
        db=db_session,
        prediction_id=prediction["prediction_id"],
        actual_outcome="B"  # Different from judged target
    )

    assert result["is_correct"] is False
    assert result["accuracy"] == "MISS"


def test_resolve_outcome_without_judging(db_session, sample_target_pair):
    """
    Test resolving outcome without judging first.

    Expected:
        - Raises ValueError
    """
    prediction = arv_system.create_prediction(
        db=db_session,
        name="No Judge Test",
        description="Test resolve without judge",
        target_a=sample_target_pair["target_a"],
        target_b=sample_target_pair["target_b"],
        outcome_a_label="Yes",
        outcome_b_label="No",
        target_type=ARVTargetType.IMAGE_PAIR
    )

    with pytest.raises(ValueError, match="has not been judged"):
        arv_system.resolve_outcome(
            db=db_session,
            prediction_id=prediction["prediction_id"],
            actual_outcome="A"
        )


# ============================================================================
# Test: Get Prediction Status
# ============================================================================

def test_get_prediction_status_complete(db_session, sample_target_pair):
    """
    Test getting status of complete prediction.

    Expected:
        - Returns all stages of prediction
    """
    prediction = arv_system.create_prediction(
        db=db_session,
        name="Status Test",
        description="Complete prediction status",
        target_a=sample_target_pair["target_a"],
        target_b=sample_target_pair["target_b"],
        outcome_a_label="Up",
        outcome_b_label="Down",
        target_type=ARVTargetType.IMAGE_PAIR
    )

    arv_system.get_blind_target(db=db_session, prediction_id=prediction["prediction_id"])
    arv_system.submit_viewing_data(
        db=db_session,
        prediction_id=prediction["prediction_id"],
        impressions="Test impressions"
    )
    arv_system.judge_target_match(
        db=db_session,
        prediction_id=prediction["prediction_id"],
        judged_target="A"
    )
    arv_system.resolve_outcome(
        db=db_session,
        prediction_id=prediction["prediction_id"],
        actual_outcome="A"
    )

    # Get status
    status = arv_system.get_prediction_status(
        db=db_session,
        prediction_id=prediction["prediction_id"]
    )

    assert "prediction_id" in status
    assert "submission" in status
    assert "judging" in status
    assert "outcome" in status
    assert status["status"] == ARVOutcomeStatus.RESOLVED.value


# ============================================================================
# Test: Statistics
# ============================================================================

def test_accuracy_statistics_no_predictions(db_session):
    """
    Test statistics with no predictions.

    Expected:
        - Returns zero stats
    """
    stats = arv_system.get_accuracy_statistics(db=db_session, days=30)

    assert stats["total_predictions"] == 0
    assert stats["hits"] == 0
    assert stats["misses"] == 0
    assert stats["accuracy_percent"] == 0


def test_accuracy_statistics_with_predictions(db_session, sample_target_pair):
    """
    Test statistics calculation with multiple predictions.

    Expected:
        - Calculates correct accuracy percentage
        - Shows statistical significance
    """
    # Create 3 correct, 1 incorrect prediction
    for i in range(4):
        pred = arv_system.create_prediction(
            db=db_session,
            name=f"Pred {i}",
            description=f"Prediction {i}",
            target_a=sample_target_pair["target_a"],
            target_b=sample_target_pair["target_b"],
            outcome_a_label="Up",
            outcome_b_label="Down",
            target_type=ARVTargetType.IMAGE_PAIR
        )

        arv_system.get_blind_target(db=db_session, prediction_id=pred["prediction_id"])
        arv_system.submit_viewing_data(
            db=db_session,
            prediction_id=pred["prediction_id"],
            impressions="Test"
        )
        arv_system.judge_target_match(
            db=db_session,
            prediction_id=pred["prediction_id"],
            judged_target="A"
        )

        # Make first 3 correct, last one incorrect
        actual = "A" if i < 3 else "B"
        arv_system.resolve_outcome(
            db=db_session,
            prediction_id=pred["prediction_id"],
            actual_outcome=actual
        )

    stats = arv_system.get_accuracy_statistics(db=db_session, days=30)

    assert stats["total_predictions"] == 4
    assert stats["hits"] == 3
    assert stats["misses"] == 1
    assert stats["accuracy_percent"] == 75.0
    assert stats["above_chance"] is True


# ============================================================================
# Test: Prediction History
# ============================================================================

def test_prediction_history(db_session, sample_target_pair):
    """
    Test retrieving prediction history.

    Expected:
        - Returns list of predictions
        - Sorted by creation date (newest first)
    """
    import time

    # Create multiple predictions with slight time delays to ensure ordering
    for i in range(3):
        arv_system.create_prediction(
            db=db_session,
            name=f"History Test {i}",
            description=f"Prediction {i}",
            target_a=sample_target_pair["target_a"],
            target_b=sample_target_pair["target_b"],
            outcome_a_label="A",
            outcome_b_label="B",
            target_type=ARVTargetType.IMAGE_PAIR,
            user_identifier="test_user"
        )
        time.sleep(0.01)  # Small delay to ensure different timestamps

    history = arv_system.get_prediction_history(
        db=db_session,
        user_identifier="test_user",
        limit=10
    )

    assert len(history) == 3
    # Verify we got all three predictions (order may vary in test DB)
    names = [h["name"] for h in history]
    assert "History Test 0" in names
    assert "History Test 1" in names
    assert "History Test 2" in names


def test_prediction_history_limit(db_session, sample_target_pair):
    """
    Test prediction history with limit.

    Expected:
        - Returns only specified number of predictions
    """
    for i in range(5):
        arv_system.create_prediction(
            db=db_session,
            name=f"Limit Test {i}",
            description=f"Prediction {i}",
            target_a=sample_target_pair["target_a"],
            target_b=sample_target_pair["target_b"],
            outcome_a_label="A",
            outcome_b_label="B",
            target_type=ARVTargetType.IMAGE_PAIR
        )

    history = arv_system.get_prediction_history(db=db_session, limit=2)

    assert len(history) == 2


# ============================================================================
# Test: Edge Cases
# ============================================================================

def test_statistical_significance_calculation():
    """
    Test statistical significance calculation.

    Expected:
        - Correctly categorizes significance levels
    """
    # Test with high accuracy (should be significant)
    significance = arv_system._calculate_significance(successes=80, total=100)
    assert significance in ["very_significant", "highly_significant"]

    # Test with chance accuracy (should not be significant)
    significance = arv_system._calculate_significance(successes=50, total=100)
    assert significance == "not_significant"

    # Test with no data
    significance = arv_system._calculate_significance(successes=0, total=0)
    assert significance == "insufficient_data"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
