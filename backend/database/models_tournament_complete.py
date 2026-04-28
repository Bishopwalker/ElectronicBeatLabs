"""
Complete RV Tournament Database Models
This file contains the COMPLETE models for the RV tournament system.
Replace the tournament section in models.py with this content.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.base import Base
import uuid


# ============================================================================
# RV Tournament Models - 12-Hour Cycle System
# ============================================================================

class RVTournamentCycle(Base):
    """
    RV Tournament Cycle - 12-hour competitive cycles with quantum entanglement timing.

    Tournament Protocol:
    - Cycles run twice daily (12-hour duration each)
    - Entanglement Time: 3h33m (3:33) after cycle start - optimal quantum coherence window
    - Reveal Time: 12 hours after start - target becomes visible to all participants
    - Target Format: xxxx-xxxx coordinate format (e.g., "3F7A-9B2C")
    - Quantum Entanglement: Target is entangled with specific data/outcome at entanglement time

    Cycle Lifecycle:
    1. PENDING: Cycle created but not yet started
    2. ACTIVE: Cycle is running, users can submit predictions
    3. ENTANGLED: Past entanglement time (3:33), quantum state collapsed
    4. REVEALED: 12 hours elapsed, target revealed, scoring begins
    5. COMPLETED: All predictions scored and leaderboard finalized

    Key Timestamps:
    - start_time: When cycle begins (00:00 or 12:00 UTC)
    - entanglement_time: start_time + 3h33m - quantum coherence peak
    - reveal_time: start_time + 12h - target reveals to participants
    """
    __tablename__ = "rv_tournament_cycles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Cycle identification
    cycle_number = Column(Integer, nullable=False, unique=True, index=True)  # Sequential cycle number
    cycle_id = Column(String, unique=True, nullable=False, index=True)  # "2024-01-15_00" or "2024-01-15_12"

    # Timing (all times in UTC)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    entanglement_time = Column(DateTime(timezone=True), nullable=False, index=True)  # start_time + 3h33m
    reveal_time = Column(DateTime(timezone=True), nullable=False, index=True)  # start_time + 12h

    # Target information (hidden until reveal_time)
    target_number = Column(String, nullable=False, unique=True, index=True)  # "xxxx-xxxx" format
    target_name = Column(String, nullable=False)  # Name of the target
    target_description = Column(Text, nullable=False)  # Detailed description
    target_category = Column(String, nullable=False)  # "location", "object", "event", etc.
    target_data = Column(Text, nullable=True)  # JSON: quantum entangled data, feedback URL, metadata
    feedback_url = Column(String, nullable=True)  # Image/info URL for feedback

    # Quantum entanglement metadata
    entanglement_source = Column(String, nullable=False, default="ANU_QRNG")  # Source of quantum randomness
    raw_quantum_values = Column(Text, nullable=False)  # Raw quantum values (JSON array)

    # Cycle status
    status = Column(String, nullable=False, default="pending", index=True)  # pending, active, entangled, revealed, completed

    # Statistics
    total_predictions = Column(Integer, default=0)  # Count of user predictions for this cycle
    average_score = Column(Float, nullable=True)  # Average accuracy score across all predictions
    winner_user_id = Column(String, ForeignKey("users.id"), nullable=True)  # Top scorer for cycle

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    revealed_at = Column(DateTime(timezone=True), nullable=True)  # Actual reveal timestamp
    completed_at = Column(DateTime(timezone=True), nullable=True)  # When scoring finalized

    # Relationships
    predictions = relationship("RVUserPrediction", back_populates="tournament_cycle")
    winner = relationship("User", foreign_keys=[winner_user_id], backref="tournament_wins")


class RVUserPrediction(Base):
    """
    RV User Prediction - tracks individual user predictions for tournament or practice targets.

    Supports two modes:
    1. Tournament Mode: Predictions for RVTournamentCycle targets
    2. Practice Mode: Predictions for RVPracticeTarget targets

    Prediction Lifecycle:
    1. SUBMITTED: User submits prediction before reveal time
    2. PENDING_SCORE: Target revealed, awaiting scoring
    3. SCORED: Accuracy calculated, points awarded
    4. LATE: Submitted after reveal time (not eligible for points)

    Scoring Algorithm:
    - Text similarity: NLP/embedding similarity to actual target description
    - Category match: Categorical accuracy (colors, shapes, emotions, etc.)
    - Confidence calibration: Correlation between confidence and actual accuracy
    - Time bonus: Earlier submissions within entanglement window get bonus
    - Streak multiplier: Consecutive high-accuracy predictions earn multiplier
    """
    __tablename__ = "rv_user_predictions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # User tracking
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    user_identifier = Column(String, nullable=True, index=True)  # IP or session ID for anonymous

    # Target references (one will be null depending on mode)
    tournament_cycle_id = Column(String, ForeignKey("rv_tournament_cycles.id"), nullable=True, index=True)
    practice_target_id = Column(String, ForeignKey("rv_practice_targets.id"), nullable=True, index=True)

    # Mode tracking
    mode = Column(String, nullable=False, index=True)  # "tournament" or "practice"

    # User's prediction data
    predicted_target = Column(Text, nullable=False)  # User's description of what they perceive
    predicted_category = Column(String, nullable=True)  # User's categorical guess
    predicted_tags = Column(String, nullable=True)  # Comma-separated tags

    # Prediction metadata
    confidence = Column(Float, nullable=False, default=0.5)  # 0.0-1.0 confidence rating
    session_notes = Column(Text, nullable=True)  # Additional notes from viewing session
    audio_protocol_used = Column(String, nullable=True)  # Binaural protocol used during viewing

    # Audio session details
    base_frequency = Column(Float, nullable=True)  # Audio frequency used
    beat_frequency = Column(Float, nullable=True)  # Binaural beat frequency
    session_duration_minutes = Column(Float, nullable=True)  # How long user took to view

    # Timing
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    is_pre_entanglement = Column(Boolean, nullable=False, default=False)  # Submitted before 3:33?

    # Scoring results
    was_correct = Column(Boolean, nullable=True)  # Overall correctness (threshold-based)
    score = Column(Float, nullable=True)  # 0-100 accuracy score
    points_awarded = Column(Integer, default=0)  # Tournament points earned
    correct_digits = Column(Integer, nullable=True)  # For number-based predictions (0-8)

    # Detailed scoring breakdown (JSON)
    scoring_details = Column(Text, nullable=True)  # JSON: {text_similarity, category_match, etc.}

    # Status
    status = Column(String, nullable=False, default="submitted", index=True)  # submitted, pending_score, scored, late

    # Timestamps
    scored_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", backref="rv_predictions")
    tournament_cycle = relationship("RVTournamentCycle", back_populates="predictions")
    practice_target = relationship("RVPracticeTarget", back_populates="predictions")


class RVLeaderboard(Base):
    """
    RV Leaderboard - aggregate user performance rankings.

    Supports multiple leaderboard types:
    - ALL_TIME: Overall career performance
    - MONTHLY: Performance within a specific month
    - WEEKLY: Performance within a specific week
    - DAILY: Daily performance (for high-activity users)

    Rankings are calculated based on:
    - Total points earned (primary)
    - Average accuracy score (tiebreaker)
    - Prediction count (minimum threshold for ranking)
    - Current streak (bonus consideration)

    Leaderboard updates:
    - Real-time: After each prediction is scored
    - Batch: Daily rollup at midnight UTC
    - Archival: Monthly snapshots for historical tracking
    """
    __tablename__ = "rv_leaderboard"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # User reference
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    # Leaderboard type and period
    leaderboard_type = Column(String, nullable=False, index=True)  # "all_time", "monthly", "weekly", "daily"
    period_identifier = Column(String, nullable=True, index=True)  # "2024-01", "2024-W03", "2024-01-15"

    # Ranking metrics
    rank = Column(Integer, nullable=False, index=True)  # Current rank position
    total_points = Column(Integer, default=0)  # Total points earned in period
    prediction_count = Column(Integer, default=0)  # Number of predictions made
    average_score = Column(Float, nullable=True)  # Average accuracy across predictions

    # Performance statistics
    accuracy_percentage = Column(Float, nullable=True)  # % of correct predictions (above threshold)
    best_score = Column(Float, nullable=True)  # Highest single prediction score
    current_streak = Column(Integer, default=0)  # Consecutive high-accuracy predictions
    total_tournament_wins = Column(Integer, default=0)  # Number of cycle wins

    # Timestamps
    last_prediction_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    user = relationship("User", backref="leaderboard_entries")
