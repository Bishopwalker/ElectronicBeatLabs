"""
Unit tests for Remote Viewing Scoring Service

Tests cover:
- Session creation and management
- Submission processing
- Scoring algorithms
- Statistics tracking
- Leaderboard generation
"""

import pytest
from datetime import datetime, timezone
from unittest.mock import Mock, patch
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database.base import Base
from database.models import RVSession, RVSubmission, RVScore, UserRVStats, User
from services.rv_scoring import RVScoringService


# Test database setup
@pytest.fixture(scope="function")
def db_session():
    """Create a test database session."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture
def rv_service():
    """Create RV scoring service instance."""
    return RVScoringService()


@pytest.fixture
def test_user(db_session):
    """Create a test user."""
    user = User(
        id="test-user-123",
        email="test@example.com",
        name="Test User",
        oauth_provider="google"
    )
    db_session.add(user)
    db_session.commit()
    return user


# ============================================================================
# Session Management Tests
# ============================================================================

def test_create_session(rv_service, db_session):
    """Test creating a new RV session."""
    result = rv_service.create_session(
        db=db_session,
        mode="practice",
        target_type="number",
        target_id="test-target-1",
        base_frequency=140.0,
        beat_frequency=6.0,
        protocol_used="theta_deep",
        user_identifier="192.168.1.1"
    )

    assert "session_id" in result
    assert result["mode"] == "practice"
    assert result["target_type"] == "number"
    assert result["status"] == "active"
    assert result["frequencies"]["base"] == 140.0
    assert result["frequencies"]["beat"] == 6.0

    # Verify database record
    session = db_session.query(RVSession).filter(
        RVSession.id == result["session_id"]
    ).first()
    assert session is not None
    assert session.status == "active"


def test_get_session(rv_service, db_session):
    """Test retrieving a session."""
    # Create session
    created = rv_service.create_session(
        db=db_session,
        mode="tournament",
        target_type="number",
        target_id=None,
        base_frequency=140.0,
        beat_frequency=10.0,
        user_identifier="test-user"
    )

    # Get session
    result = rv_service.get_session(db_session, created["session_id"])

    assert result is not None
    assert result["session_id"] == created["session_id"]
    assert result["mode"] == "tournament"
    assert result["status"] == "active"


def test_get_nonexistent_session(rv_service, db_session):
    """Test getting a session that doesn't exist."""
    result = rv_service.get_session(db_session, "nonexistent-id")
    assert result is None


# ============================================================================
# Submission Tests
# ============================================================================

def test_submit_impressions(rv_service, db_session):
    """Test submitting impressions for a session."""
    # Create session
    created = rv_service.create_session(
        db=db_session,
        mode="practice",
        target_type="number",
        target_id="test-1",
        base_frequency=140.0,
        beat_frequency=6.0,
        user_identifier="test-user"
    )

    # Submit impressions
    result = rv_service.submit_impressions(
        db=db_session,
        session_id=created["session_id"],
        impressions_text="I see a circular shape with blue and red colors",
        confidence_level=7,
        colors=["blue", "red"],
        shapes=["circular"],
        emotions=["calm"],
        clarity_rating=8
    )

    assert "submission_id" in result
    assert result["session_id"] == created["session_id"]
    assert result["status"] == "submitted"
    assert result["duration_seconds"] >= 0

    # Verify session status updated
    session = db_session.query(RVSession).filter(
        RVSession.id == created["session_id"]
    ).first()
    assert session.status == "submitted"
    assert session.submitted_at is not None


def test_submit_impressions_invalid_session(rv_service, db_session):
    """Test submitting impressions for invalid session."""
    with pytest.raises(ValueError, match="not found"):
        rv_service.submit_impressions(
            db=db_session,
            session_id="invalid-id",
            impressions_text="Test",
            confidence_level=5
        )


def test_submit_impressions_already_submitted(rv_service, db_session):
    """Test submitting impressions for already submitted session."""
    # Create and submit session
    created = rv_service.create_session(
        db=db_session,
        mode="practice",
        target_type="number",
        target_id="test-1",
        base_frequency=140.0,
        beat_frequency=6.0,
        user_identifier="test-user"
    )

    rv_service.submit_impressions(
        db=db_session,
        session_id=created["session_id"],
        impressions_text="First submission",
        confidence_level=7
    )

    # Try to submit again
    with pytest.raises(ValueError, match="not active"):
        rv_service.submit_impressions(
            db=db_session,
            session_id=created["session_id"],
            impressions_text="Second submission",
            confidence_level=8
        )


# ============================================================================
# Scoring Algorithm Tests
# ============================================================================

def test_text_similarity_exact_match(rv_service):
    """Test text similarity with exact match."""
    score = rv_service._calculate_text_similarity(
        "blue circular shape",
        "blue circular shape"
    )
    assert score > 90.0  # Should be very high


def test_text_similarity_partial_match(rv_service):
    """Test text similarity with partial match."""
    score = rv_service._calculate_text_similarity(
        "blue circular shape with red edges",
        "blue square shape with green edges"
    )
    assert 20.0 < score < 80.0  # Partial match


def test_text_similarity_no_match(rv_service):
    """Test text similarity with no match."""
    score = rv_service._calculate_text_similarity(
        "mountain landscape",
        "ocean waves"
    )
    assert score < 30.0  # Low similarity


def test_category_match_perfect(rv_service, db_session):
    """Test category matching with perfect match."""
    # Create session and submission
    created = rv_service.create_session(
        db=db_session,
        mode="practice",
        target_type="number",
        target_id="test-1",
        base_frequency=140.0,
        beat_frequency=6.0,
        user_identifier="test-user"
    )

    rv_service.submit_impressions(
        db=db_session,
        session_id=created["session_id"],
        impressions_text="Test",
        confidence_level=7,
        colors=["red", "blue"],
        shapes=["circular"]
    )

    submission = db_session.query(RVSubmission).filter(
        RVSubmission.session_id == created["session_id"]
    ).first()

    # Test category matching
    score, matched, missed = rv_service._calculate_category_match(
        submission,
        {"colors": ["red", "blue"], "shapes": ["circular"]}
    )

    assert score == 100.0  # Perfect match
    assert len(matched) == 3  # All categories matched
    assert len(missed) == 0


def test_category_match_partial(rv_service, db_session):
    """Test category matching with partial match."""
    # Create session and submission
    created = rv_service.create_session(
        db=db_session,
        mode="practice",
        target_type="number",
        target_id="test-1",
        base_frequency=140.0,
        beat_frequency=6.0,
        user_identifier="test-user"
    )

    rv_service.submit_impressions(
        db=db_session,
        session_id=created["session_id"],
        impressions_text="Test",
        confidence_level=7,
        colors=["red", "green"],
        shapes=["square"]
    )

    submission = db_session.query(RVSubmission).filter(
        RVSubmission.session_id == created["session_id"]
    ).first()

    # Test category matching
    score, matched, missed = rv_service._calculate_category_match(
        submission,
        {"colors": ["red", "blue"], "shapes": ["circular"]}
    )

    assert 0.0 < score < 100.0  # Partial match
    assert len(matched) == 1  # Only red matched
    assert len(missed) == 2  # blue and circular missed


def test_confidence_correlation_well_calibrated(rv_service):
    """Test confidence correlation for well-calibrated user."""
    # High confidence, high score
    corr = rv_service._calculate_confidence_correlation(
        confidence=9,  # 90%
        actual_score=85.0
    )
    assert corr > 0.5  # Good correlation


def test_confidence_correlation_overconfident(rv_service):
    """Test confidence correlation for overconfident user."""
    # High confidence, low score
    corr = rv_service._calculate_confidence_correlation(
        confidence=9,  # 90%
        actual_score=30.0
    )
    assert corr < 0.0  # Negative correlation (overconfident)


def test_full_scoring(rv_service, db_session):
    """Test full scoring process."""
    # Create session and submit
    created = rv_service.create_session(
        db=db_session,
        mode="practice",
        target_type="number",
        target_id="test-1",
        base_frequency=140.0,
        beat_frequency=6.0,
        user_identifier="test-user"
    )

    rv_service.submit_impressions(
        db=db_session,
        session_id=created["session_id"],
        impressions_text="circular blue shape with smooth texture",
        confidence_level=7,
        colors=["blue"],
        shapes=["circular"],
        textures=["smooth"]
    )

    # Score session
    result = rv_service.score_session(
        db=db_session,
        session_id=created["session_id"],
        target_description="circular blue shape with smooth surface",
        target_categories={
            "colors": ["blue"],
            "shapes": ["circular"],
            "textures": ["smooth"]
        }
    )

    assert "total_score" in result
    assert 0.0 <= result["total_score"] <= 100.0
    assert result["accuracy_rating"] in ["low", "medium", "high", "exceptional"]
    assert "text_similarity" in result["components"]
    assert "category_match" in result["components"]
    assert "confidence_correlation" in result["components"]

    # Verify session status
    session = db_session.query(RVSession).filter(
        RVSession.id == created["session_id"]
    ).first()
    assert session.status == "scored"
    assert session.target_revealed is True


def test_score_invalid_session(rv_service, db_session):
    """Test scoring invalid session."""
    with pytest.raises(ValueError, match="not found"):
        rv_service.score_session(
            db=db_session,
            session_id="invalid-id",
            target_description="Test"
        )


def test_score_unsubmitted_session(rv_service, db_session):
    """Test scoring session that hasn't been submitted."""
    created = rv_service.create_session(
        db=db_session,
        mode="practice",
        target_type="number",
        target_id="test-1",
        base_frequency=140.0,
        beat_frequency=6.0,
        user_identifier="test-user"
    )

    with pytest.raises(ValueError, match="Cannot score"):
        rv_service.score_session(
            db=db_session,
            session_id=created["session_id"],
            target_description="Test"
        )


# ============================================================================
# Statistics Tests
# ============================================================================

def test_user_stats_creation(rv_service, db_session):
    """Test user statistics are created after first scored session."""
    # Create, submit, and score a session
    created = rv_service.create_session(
        db=db_session,
        mode="practice",
        target_type="number",
        target_id="test-1",
        base_frequency=140.0,
        beat_frequency=6.0,
        user_identifier="test-user"
    )

    rv_service.submit_impressions(
        db=db_session,
        session_id=created["session_id"],
        impressions_text="Test impressions",
        confidence_level=7
    )

    rv_service.score_session(
        db=db_session,
        session_id=created["session_id"],
        target_description="Target description"
    )

    # Check stats
    stats = rv_service.get_user_stats(
        db=db_session,
        user_identifier="test-user"
    )

    assert stats is not None
    assert stats["total_sessions"] == 1
    assert stats["average_score"] is not None


def test_user_stats_multiple_sessions(rv_service, db_session):
    """Test user statistics with multiple sessions."""
    # Create and score multiple sessions
    for i in range(3):
        created = rv_service.create_session(
            db=db_session,
            mode="practice",
            target_type="number",
            target_id=f"test-{i}",
            base_frequency=140.0,
            beat_frequency=6.0,
            user_identifier="test-user"
        )

        rv_service.submit_impressions(
            db=db_session,
            session_id=created["session_id"],
            impressions_text=f"Test impressions {i}",
            confidence_level=7
        )

        rv_service.score_session(
            db=db_session,
            session_id=created["session_id"],
            target_description=f"Target {i}"
        )

    # Check stats
    stats = rv_service.get_user_stats(
        db=db_session,
        user_identifier="test-user"
    )

    assert stats["total_sessions"] == 3
    assert stats["average_score"] is not None


def test_session_history(rv_service, db_session):
    """Test retrieving session history."""
    # Create and score multiple sessions
    for i in range(5):
        created = rv_service.create_session(
            db=db_session,
            mode="practice" if i % 2 == 0 else "tournament",
            target_type="number",
            target_id=f"test-{i}",
            base_frequency=140.0,
            beat_frequency=6.0,
            user_identifier="test-user"
        )

        rv_service.submit_impressions(
            db=db_session,
            session_id=created["session_id"],
            impressions_text=f"Test impressions {i}",
            confidence_level=7
        )

        rv_service.score_session(
            db=db_session,
            session_id=created["session_id"],
            target_description=f"Target {i}"
        )

    # Get history
    history = rv_service.get_session_history(
        db=db_session,
        user_identifier="test-user",
        limit=3
    )

    assert len(history) == 3  # Limited to 3
    assert all("session_id" in session for session in history)
    assert all("score" in session for session in history)


def test_leaderboard(rv_service, db_session):
    """Test leaderboard generation."""
    # Create sessions for multiple users
    for user_idx in range(3):
        for session_idx in range(2):
            created = rv_service.create_session(
                db=db_session,
                mode="practice",
                target_type="number",
                target_id=f"test-{user_idx}-{session_idx}",
                base_frequency=140.0,
                beat_frequency=6.0,
                user_identifier=f"user-{user_idx}"
            )

            rv_service.submit_impressions(
                db=db_session,
                session_id=created["session_id"],
                impressions_text="Test impressions",
                confidence_level=7
            )

            rv_service.score_session(
                db=db_session,
                session_id=created["session_id"],
                target_description="Target description"
            )

    # Get leaderboard
    leaderboard = rv_service.get_leaderboard(
        db=db_session,
        limit=10
    )

    assert len(leaderboard) == 3  # 3 users
    assert all("rank" in entry for entry in leaderboard)
    assert all("total_points" in entry for entry in leaderboard)
    assert leaderboard[0]["rank"] == 1  # First is rank 1


# ============================================================================
# Edge Cases
# ============================================================================

def test_empty_impressions_text(rv_service, db_session):
    """Test handling of empty impressions text."""
    created = rv_service.create_session(
        db=db_session,
        mode="practice",
        target_type="number",
        target_id="test-1",
        base_frequency=140.0,
        beat_frequency=6.0,
        user_identifier="test-user"
    )

    rv_service.submit_impressions(
        db=db_session,
        session_id=created["session_id"],
        impressions_text="x",  # Minimal text
        confidence_level=1
    )

    result = rv_service.score_session(
        db=db_session,
        session_id=created["session_id"],
        target_description="Complex target with many details"
    )

    assert result["total_score"] < 20.0  # Should be very low


def test_extremely_high_confidence(rv_service):
    """Test confidence correlation with max confidence."""
    corr = rv_service._calculate_confidence_correlation(
        confidence=10,  # Max
        actual_score=100.0  # Perfect
    )
    assert corr == 1.0  # Perfect calibration
