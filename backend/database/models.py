"""
Database models for Electromagnetic Beat Lab
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.base import Base
import uuid

class User(Base):
    """
    Simple user model - just OAuth email and subscription status
    """
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    
    # OAuth provider (required - no local passwords)
    oauth_provider = Column(String, nullable=False)  # google, facebook, github, keycloak
    
    # Simple subscription tracking
    is_premium = Column(Boolean, default=False)
    stripe_customer_id = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    subscriptions = relationship("Subscription", back_populates="user")
    payments = relationship("PaymentRecord", back_populates="user")

class Subscription(Base):
    """
    Subscription tracking for premium features
    """
    __tablename__ = "subscriptions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    stripe_subscription_id = Column(String, unique=True, nullable=False)
    status = Column(String, nullable=False)  # active, canceled, past_due, etc.
    current_period_start = Column(DateTime(timezone=True), nullable=False)
    current_period_end = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    user = relationship("User", back_populates="subscriptions")

class PaymentRecord(Base):
    """
    Payment history tracking
    """
    __tablename__ = "payment_records"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    stripe_payment_intent_id = Column(String, unique=True, nullable=False)
    amount = Column(Integer, nullable=False)  # Amount in cents
    currency = Column(String, nullable=False, default="usd")
    status = Column(String, nullable=False)  # succeeded, failed, pending
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    user = relationship("User", back_populates="payments")

class UsageRecord(Base):
    """
    Simple usage tracking for free tier (3 hours/month limit)
    Track by IP address initially, email only after login required
    """
    __tablename__ = "usage_records"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Track by IP address for anonymous usage
    ip_address = Column(String, nullable=False, index=True)
    user_email = Column(String, nullable=True, index=True)  # Only after login
    
    # Simple session tracking
    minutes_used = Column(Float, nullable=False)
    year_month = Column(String, nullable=False, index=True)  # "2024-01"
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Simple webhook logging for Stripe events
class WebhookEvent(Base):
    """
    Just log Stripe webhook events for subscription changes
    """
    __tablename__ = "webhook_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    stripe_event_id = Column(String, unique=True, nullable=False)
    event_type = Column(String, nullable=False)
    processed = Column(Boolean, default=False)
    data = Column(Text, nullable=False)  # JSON data
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class QuantumDailyNumber(Base):
    """
    Daily quantum numbers for Tournament mode.

    Each date has ONE quantum number that materializes at midnight UTC.
    The number is generated from ANU QRNG (true quantum randomness)
    and does NOT exist until the moment of materialization.

    Key Principle: Quantum collapse - number goes from superposition
    of all possibilities to a single definite value at reveal time.
    """
    __tablename__ = "quantum_daily_numbers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # The date this number belongs to (ISO format: "2024-01-15")
    date = Column(String, unique=True, nullable=False, index=True)

    # The materialized number (1-69 for Powerball-style)
    number = Column(Integer, nullable=False)

    # Raw quantum value from ANU QRNG (0-65535)
    raw_quantum = Column(Integer, nullable=False)

    # Source of randomness
    source = Column(String, nullable=False, default="ANU_QRNG")

    # When the quantum collapse occurred
    materialized_at = Column(DateTime(timezone=True), server_default=func.now())


class QuantumPracticeNumber(Base):
    """
    Practice mode quantum numbers - on-demand generation.

    Users can generate as many practice numbers as they want.
    Each generation is a new quantum collapse.
    Optionally track for user analytics/history.
    """
    __tablename__ = "quantum_practice_numbers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # User tracking (optional - can be IP or user ID)
    user_identifier = Column(String, nullable=True, index=True)

    # The materialized number
    number = Column(Integer, nullable=False)

    # Raw quantum value from ANU QRNG
    raw_quantum = Column(Integer, nullable=False)

    # Source and timestamp
    source = Column(String, nullable=False, default="ANU_QRNG")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ============================================================================
# ARV (Associative Remote Viewing) Prediction Models
# ============================================================================

class ARVTargetPair(Base):
    """
    ARV Target Pair - Two distinct targets associated with binary outcomes.

    In ARV, each target represents a possible outcome:
    - Target A: Outcome A (e.g., "Stock Up", "Win", "Yes")
    - Target B: Outcome B (e.g., "Stock Down", "Loss", "No")

    The targets should be distinctly different (highly dissimilar)
    to maximize signal clarity for the remote viewer.

    Example pairs:
    - Beach vs. Mountain
    - Cat vs. Dog
    - Fire vs. Water
    - Urban vs. Rural
    """
    __tablename__ = "arv_target_pairs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Target type
    target_type = Column(String, nullable=False)  # "image_pair", "location_pair", "description_pair"

    # Target data (stored as JSON-compatible strings)
    target_a_data = Column(Text, nullable=False)  # JSON: {url, description, coordinates, etc.}
    target_b_data = Column(Text, nullable=False)  # JSON: {url, description, coordinates, etc.}

    # Outcome labels
    outcome_a_label = Column(String, nullable=False)  # e.g., "Stock Up"
    outcome_b_label = Column(String, nullable=False)  # e.g., "Stock Down"

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    predictions = relationship("ARVPrediction", back_populates="target_pair")


class ARVPrediction(Base):
    """
    ARV Prediction Session - A complete ARV prediction cycle.

    Protocol Flow:
    1. Prediction created with target pair and outcome associations
    2. Viewer receives blind target (randomly selected A or B)
    3. Viewer submits impressions
    4. Judge determines which target matches impressions
    5. Real-world outcome is recorded
    6. Accuracy is calculated

    Key Principle: The viewer never knows which target corresponds to
    which outcome until AFTER judging is complete.
    """
    __tablename__ = "arv_predictions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Prediction details
    name = Column(String, nullable=False)  # e.g., "AAPL Stock Monday"
    description = Column(Text, nullable=False)  # What is being predicted
    user_identifier = Column(String, nullable=True, index=True)  # User ID or IP

    # Target pair reference
    target_pair_id = Column(String, ForeignKey("arv_target_pairs.id"), nullable=False)

    # Blind target selection (which target was shown to viewer)
    selected_target = Column(String, nullable=True)  # "A" or "B"

    # Judging results (which target viewer matched)
    judged_target = Column(String, nullable=True)  # "A" or "B"
    judged_at = Column(DateTime(timezone=True), nullable=True)

    # Prediction status
    status = Column(String, nullable=False, default="pending")  # "pending", "resolved", "expired"

    # Final result
    is_correct = Column(Boolean, nullable=True)  # Was prediction correct?

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    deadline = Column(DateTime(timezone=True), nullable=True)  # When outcome must be resolved

    # Relationships
    target_pair = relationship("ARVTargetPair", back_populates="predictions")
    submissions = relationship("ARVSubmission", back_populates="prediction")
    outcomes = relationship("ARVOutcome", back_populates="prediction")


class ARVSubmission(Base):
    """
    ARV Viewing Submission - Viewer's impressions and descriptions.

    The viewer records what they perceive during the viewing session:
    - Visual impressions
    - Sensory data (colors, textures, sounds)
    - Emotional impressions
    - Symbolic content
    - Any other perceptions

    This is recorded BEFORE knowing the outcome or target associations.
    """
    __tablename__ = "arv_submissions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Prediction reference
    prediction_id = Column(String, ForeignKey("arv_predictions.id"), nullable=False)

    # Viewing data
    impressions = Column(Text, nullable=False)  # Viewer's description
    confidence = Column(Float, nullable=True)  # Confidence level (0-1)
    session_notes = Column(Text, nullable=True)  # Additional notes

    # Audio protocol used during viewing (optional)
    base_frequency = Column(Float, nullable=True)
    beat_frequency = Column(Float, nullable=True)
    protocol_used = Column(String, nullable=True)  # "theta", "alpha", etc.

    # Timestamps
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    prediction = relationship("ARVPrediction", back_populates="submissions")


class ARVOutcome(Base):
    """
    ARV Outcome Record - The actual real-world outcome and accuracy.

    After the prediction is made and locked in, the real-world outcome
    is recorded. The system then calculates whether the prediction was
    correct (HIT) or incorrect (MISS).

    This is the final step in the ARV protocol.
    """
    __tablename__ = "arv_outcomes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Prediction reference
    prediction_id = Column(String, ForeignKey("arv_predictions.id"), nullable=False)

    # Actual outcome
    actual_outcome = Column(String, nullable=False)  # "A" or "B"
    is_correct = Column(Boolean, nullable=False)  # Was prediction correct?

    # Outcome details
    outcome_notes = Column(Text, nullable=True)  # Notes about the outcome
    resolved_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    prediction = relationship("ARVPrediction", back_populates="outcomes")


# ============================================================================
# Remote Viewing Session Tracking & Scoring Models
# ============================================================================

class RVSession(Base):
    """
    Remote Viewing Session - tracks a single RV attempt.

    A session represents one complete RV cycle:
    1. Session start with binaural frequencies
    2. User views target (without seeing it)
    3. User submits impressions
    4. Target is revealed
    5. Score is calculated

    Links to quantum targets for tournament mode.
    """
    __tablename__ = "rv_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # User tracking
    user_id = Column(String, ForeignKey("users.id"), nullable=True)  # Null for anonymous
    user_identifier = Column(String, nullable=True, index=True)  # IP or session ID

    # Session mode
    mode = Column(String, nullable=False)  # "tournament" or "practice"

    # Target information
    target_type = Column(String, nullable=False)  # "number", "image", "location", etc.
    target_id = Column(String, nullable=True)  # Links to quantum number or image DB
    target_revealed = Column(Boolean, default=False)  # Has user seen the target?

    # Audio configuration used during session
    base_frequency = Column(Float, nullable=False)
    beat_frequency = Column(Float, nullable=False)
    protocol_used = Column(String, nullable=True)  # "theta", "alpha", etc.

    # Session duration tracking
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    submitted_at = Column(DateTime(timezone=True), nullable=True)  # When impressions submitted
    duration_seconds = Column(Integer, nullable=True)  # Total session time

    # Session status
    status = Column(String, nullable=False, default="active")  # "active", "submitted", "scored", "abandoned"

    # Relationships
    submissions = relationship("RVSubmission", back_populates="session", cascade="all, delete-orphan")
    score = relationship("RVScore", back_populates="session", uselist=False, cascade="all, delete-orphan")


class RVSubmission(Base):
    """
    Remote Viewing Submission - user's impressions/data from RV session.

    Stores what the user perceived during the session:
    - Text impressions (descriptions, feelings, colors, shapes)
    - Sketch descriptions (if user drew anything)
    - Confidence level
    - Categories/tags
    """
    __tablename__ = "rv_submissions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("rv_sessions.id"), nullable=False)

    # Submission content
    impressions_text = Column(Text, nullable=False)  # Main text description
    sketch_description = Column(Text, nullable=True)  # Description of any sketches

    # Categorical impressions (can be JSON arrays)
    colors = Column(String, nullable=True)  # e.g., "red,blue,green"
    shapes = Column(String, nullable=True)  # e.g., "circular,angular"
    emotions = Column(String, nullable=True)  # e.g., "calm,excited"
    textures = Column(String, nullable=True)  # e.g., "smooth,rough"

    # User's self-assessment
    confidence_level = Column(Integer, nullable=False)  # 1-10 scale
    clarity_rating = Column(Integer, nullable=True)  # 1-10, how clear the impressions were

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    session = relationship("RVSession", back_populates="submissions")


class RVScore(Base):
    """
    Remote Viewing Score - calculated accuracy after target reveal.

    Scoring algorithm considers:
    - Text similarity to target description (NLP/embedding similarity)
    - Category matches (colors, shapes, emotions)
    - Confidence correlation (were high-confidence guesses correct?)
    - Historical accuracy trends
    """
    __tablename__ = "rv_scores"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("rv_sessions.id"), nullable=False, unique=True)

    # Overall scoring
    total_score = Column(Float, nullable=False)  # 0-100 scale
    accuracy_rating = Column(String, nullable=False)  # "low", "medium", "high", "exceptional"

    # Component scores
    text_similarity_score = Column(Float, nullable=True)  # 0-100, NLP similarity
    category_match_score = Column(Float, nullable=True)  # 0-100, categorical accuracy
    confidence_correlation = Column(Float, nullable=True)  # -1 to 1, calibration

    # Detailed scoring breakdown (JSON)
    scoring_details = Column(Text, nullable=True)  # JSON with detailed breakdown

    # Comparison with target
    target_description = Column(Text, nullable=False)  # What the target actually was
    matched_elements = Column(Text, nullable=True)  # JSON array of matched elements
    missed_elements = Column(Text, nullable=True)  # JSON array of missed elements

    # Scoring metadata
    scored_at = Column(DateTime(timezone=True), server_default=func.now())
    scoring_algorithm_version = Column(String, nullable=False, default="v1.0")

    # Relationship
    session = relationship("RVSession", back_populates="score")


class UserRVStats(Base):
    """
    User Remote Viewing Statistics - aggregate performance tracking.

    Tracks long-term RV performance for each user:
    - Total sessions, scores, accuracy trends
    - Best/worst performances
    - Improvement over time
    - Leaderboard position
    """
    __tablename__ = "user_rv_stats"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True, unique=True)
    user_identifier = Column(String, nullable=True, index=True)  # For anonymous users

    # Session counts
    total_sessions = Column(Integer, default=0)
    tournament_sessions = Column(Integer, default=0)
    practice_sessions = Column(Integer, default=0)

    # Scoring statistics
    average_score = Column(Float, nullable=True)  # Overall average
    best_score = Column(Float, nullable=True)
    worst_score = Column(Float, nullable=True)

    # Performance tracking
    total_points = Column(Integer, default=0)  # Cumulative points for leaderboard
    accuracy_trend = Column(String, nullable=True)  # "improving", "declining", "stable"
    current_streak = Column(Integer, default=0)  # Consecutive sessions above threshold
    best_streak = Column(Integer, default=0)

    # Protocol effectiveness (which frequencies work best for user)
    best_protocol = Column(String, nullable=True)  # Protocol with highest avg score
    protocol_stats = Column(Text, nullable=True)  # JSON with per-protocol performance

    # Timestamps
    first_session_at = Column(DateTime(timezone=True), nullable=True)
    last_session_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # User relationship
    user = relationship("User", backref="rv_stats")


# ============================================================================
# CRV (Controlled Remote Viewing) Stage Protocol Models
# ============================================================================

class CRVSession(Base):
    """
    Controlled Remote Viewing (CRV) Session tracking.

    CRV is a structured 6-stage protocol developed by Ingo Swann at Stanford
    Research Institute for remote viewing training. Each session progresses
    through stages of increasing detail and complexity.

    Stage Protocol:
    - Stage 1: Major gestalts (land, water, structure, etc.)
    - Stage 2: Sensory data (colors, textures, sounds, smells, tastes)
    - Stage 3: Dimensional data (size, shape, mass, volume)
    - Stage 4: Emotional/aesthetic impact and conceptual data
    - Stage 5: Interrogation of site (off-signal analysis)
    - Stage 6: 3D modeling/detailed sketching
    """
    __tablename__ = "crv_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # User tracking
    user_identifier = Column(String, nullable=True, index=True)

    # Target information (coordinate or description)
    target_coordinate = Column(String, nullable=True)
    target_description = Column(String, nullable=True)

    # Session status
    current_stage = Column(Integer, nullable=False, default=1)  # 1-6
    status = Column(String, nullable=False, default="in_progress")  # in_progress, completed, abandoned

    # Timestamps
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    total_duration_seconds = Column(Float, nullable=True)

    # Relationships
    stage_data = relationship("CRVStageData", back_populates="session", cascade="all, delete-orphan")


class CRVStageData(Base):
    """
    Data collected during each CRV stage.

    Each stage has specific data types:
    - Stage 1: Major gestalts (ideogram data, initial impressions)
    - Stage 2: Sensory data (colors, textures, sounds, smells, tastes, temperature)
    - Stage 3: Dimensional data (size, shape, dimensions, mass, volume)
    - Stage 4: Emotional/aesthetic impact and conceptual data
    - Stage 5: Interrogation data (off-signal analysis, deep queries)
    - Stage 6: 3D modeling descriptions and detailed sketches
    """
    __tablename__ = "crv_stage_data"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("crv_sessions.id"), nullable=False, index=True)

    # Stage information
    stage_number = Column(Integer, nullable=False)  # 1-6

    # Data collected (JSON-encoded stage-specific data)
    data_json = Column(Text, nullable=False)

    # Timing information
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Float, nullable=True)

    # Relationship
    session = relationship("CRVSession", back_populates="stage_data")


# ============================================================================
# Simple Double-Blind Remote Viewing Target Models
# ============================================================================

class RVDailyTarget(Base):
    """
    Daily Remote Viewing targets for Tournament mode.

    Each date has ONE RV target that materializes at midnight UTC.
    Implements proper double-blind protocol - coordinate is random,
    target is randomly selected from curated pool.

    Key Principle: Double-blind means neither viewer NOR anyone present
    with the viewer knows what the target is during the session.
    """
    __tablename__ = "rv_daily_targets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # The date this target belongs to (ISO format: "2024-01-15")
    date = Column(String, unique=True, nullable=False, index=True)

    # Random alphanumeric coordinate (e.g., "8A3F-9B2C")
    coordinate = Column(String, nullable=False, unique=True, index=True)

    # Target details (hidden until impression submitted)
    target_name = Column(String, nullable=False)
    target_description = Column(Text, nullable=False)
    category = Column(String, nullable=False)  # locations, objects, events, etc.
    subcategory = Column(String, nullable=True)
    difficulty = Column(String, nullable=False, default="medium")  # easy, medium, hard
    feedback_url = Column(String, nullable=True)  # Image/info URL for feedback
    tags = Column(Text, nullable=True)  # Comma-separated descriptive tags

    # Status tracking
    status = Column(String, nullable=False, default="active")  # active, revealed
    materialized_at = Column(DateTime(timezone=True), server_default=func.now())
    revealed_at = Column(DateTime(timezone=True), nullable=True)


class RVPracticeTarget(Base):
    """
    Practice mode RV targets - on-demand generation.

    Users can generate as many practice targets as they want.
    Each generation creates a new target-coordinate pair.
    Follows same double-blind protocol as daily targets.
    """
    __tablename__ = "rv_practice_targets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Random alphanumeric coordinate
    coordinate = Column(String, nullable=False, unique=True, index=True)

    # User tracking (optional - can be IP or user ID)
    user_identifier = Column(String, nullable=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)

    # Target details
    target_name = Column(String, nullable=False)
    target_description = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    subcategory = Column(String, nullable=True)
    difficulty = Column(String, nullable=False, default="medium")
    feedback_url = Column(String, nullable=True)
    tags = Column(Text, nullable=True)

    # Status and timestamps
    status = Column(String, nullable=False, default="active")  # active, revealed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    revealed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", backref="practice_targets")
    predictions = relationship("RVUserPrediction", back_populates="practice_target")


class RVImpression(Base):
    """
    Remote viewing impressions submitted by viewers.

    Stores the viewer's perception of the target before feedback reveal.
    Essential for double-blind protocol - impression must be recorded
    before the viewer can see the actual target.
    """
    __tablename__ = "rv_impressions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Link to target (practice or daily)
    target_id = Column(String, nullable=False, index=True)
    mode = Column(String, nullable=False)  # "practice" or "tournament"

    # Viewer's impression data
    descriptors = Column(Text, nullable=True)  # Textual descriptions/adjectives
    sketches_data = Column(Text, nullable=True)  # Base64 encoded sketches or drawing data
    notes = Column(Text, nullable=True)  # Session notes and observations
    confidence = Column(Float, nullable=False, default=0.5)  # 0.0-1.0 confidence rating

    # Session metadata
    session_duration_minutes = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ============================================================================
# RV Tournament Models - 12-Hour Cycle System
# ============================================================================

class RVTournamentTarget(Base):
    """
    Tournament target for 12-hour cycles.

    Each cycle has ONE quantum-entangled target number that materializes
    at exactly 3 hours 33 minutes (3:33) after the cycle starts.

    Target Format: "xxxx-xxxx" (8 digits, e.g., "4729-8153")

    Cycle Schedule:
    - Cycle 1: 00:00 UTC → 12:00 UTC (entanglement at 03:33 UTC)
    - Cycle 2: 12:00 UTC → 00:00 UTC (entanglement at 15:33 UTC)

    Key Principle: The target number does NOT exist until entanglement time.
    This ensures true precognition (perceiving future quantum events).
    """
    __tablename__ = "rv_tournament_targets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Cycle identifier (e.g., "2024-01-15_00" or "2024-01-15_12")
    cycle_id = Column(String, unique=True, nullable=False, index=True)

    # The quantum-entangled target number (format: "xxxx-xxxx")
    target_number = Column(String, nullable=False)

    # Raw quantum values from ANU QRNG (stored as string list)
    raw_quantum_values = Column(Text, nullable=False)

    # Source of randomness
    source = Column(String, nullable=False, default="ANU_QRNG")

    # When the quantum entanglement occurred (3:33 after cycle start)
    entanglement_timestamp = Column(DateTime(timezone=True), server_default=func.now())


class RVTournamentPrediction(Base):
    """
    User predictions for tournament cycles.

    Users can submit predictions at any time during the cycle:
    - Before entanglement (3:33 mark): True precognition
    - After entanglement but before reveal (12:00 mark): Remote viewing

    Predictions made before entanglement receive bonus points as they
    demonstrate true precognitive ability (perceiving future quantum events).
    """
    __tablename__ = "rv_tournament_predictions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Cycle identifier
    cycle_id = Column(String, nullable=False, index=True)

    # User tracking
    user_identifier = Column(String, nullable=False, index=True)

    # Predicted target number (format: "xxxx-xxxx")
    predicted_number = Column(String, nullable=False)

    # Submission metadata
    confidence = Column(Float, nullable=True)  # 0.0-1.0 confidence rating
    notes = Column(Text, nullable=True)  # User's prediction notes
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    # Was this prediction made before entanglement?
    is_pre_entanglement = Column(Boolean, nullable=False, default=False)

    # Scoring results (populated after cycle reveal)
    is_scored = Column(Boolean, nullable=False, default=False)
    is_correct = Column(Boolean, nullable=True)  # Exact match
    correct_digits = Column(Integer, nullable=True)  # 0-8 correct digits
    points_awarded = Column(Integer, nullable=True)  # Tournament points
    scored_at = Column(DateTime(timezone=True), nullable=True)

    # Viewing session details (optional)
    impressions = Column(Text, nullable=True)  # User's viewing impressions
    base_frequency = Column(Float, nullable=True)  # Audio frequency used
    beat_frequency = Column(Float, nullable=True)  # Binaural beat frequency
    protocol_used = Column(String, nullable=True)  # Audio protocol name
    session_duration_minutes = Column(Integer, nullable=True)  # Session duration
    score = Column(Float, nullable=True)  # Calculated accuracy score


class RVTournamentCycle(Base):
    """
    Tournament Cycle Model - Simplified 12-hour cycle system.

    Each cycle has:
    - Unique cycle_id (e.g., "20250125-C1" or "20250125-C2")
    - Target coordinate in xxxx-xxxx format (shown to users for viewing)
    - Hidden quantum number (revealed only after reveal time)
    - Entanglement time (when target materializes)
    - Reveal time (when results become available)
    - Status tracking

    Flow:
    1. Generate quantum number (hidden) and coordinate (shown)
    2. User views coordinate, does remote viewing
    3. User submits impressions of what they perceived
    4. At reveal time, quantum number is shown

    This model is used by rv_tournament_routes.py for:
    - Creating tournament cycles
    - Tracking predictions
    - Managing reveal timing
    """
    __tablename__ = "rv_tournament_cycles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Cycle identifier (format: "YYYYMMDD-C1" or "YYYYMMDD-C2")
    cycle_id = Column(String, unique=True, nullable=False, index=True)

    # Target coordinate (format: "xxxx-xxxx") - SHOWN to users for viewing
    coordinate = Column(String, nullable=False)

    # Hidden quantum number - ONLY revealed after reveal_time
    # This is the actual quantum-generated number tied to the coordinate
    quantum_number = Column(Integer, nullable=True)  # The hidden target number
    quantum_raw = Column(Integer, nullable=True)  # Raw quantum value (0-65535)
    quantum_source = Column(String, nullable=True)  # "ANU_QRNG" or "LOCAL_CRYPTO"

    # Timing
    entanglement_time = Column(DateTime(timezone=True), nullable=False)  # When target materialized
    reveal_time = Column(DateTime(timezone=True), nullable=False)  # When results revealed

    # Status: "active" (predictions allowed), "revealed" (results available)
    status = Column(String, nullable=False, default="active")
    revealed_at = Column(DateTime(timezone=True), nullable=True)  # Actual reveal timestamp

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RVUserPrediction(Base):
    """
    User predictions for Remote Viewing targets (both tournament and practice).

    Unified model for tracking user predictions across all RV modes.
    Supports both practice (instant feedback) and tournament (12h reveal) modes.
    """
    __tablename__ = "rv_user_predictions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Link to target - can be tournament cycle or practice target
    tournament_cycle_id = Column(String, ForeignKey("rv_tournament_cycles.id"), nullable=True, index=True)
    practice_target_id = Column(String, ForeignKey("rv_practice_targets.id"), nullable=True, index=True)

    # User tracking
    user_identifier = Column(String, nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)

    # What the user predicted they "saw"
    predicted_description = Column(Text, nullable=False)  # User's sensed impressions
    predicted_category = Column(String, nullable=True)  # Optional category guess
    confidence = Column(Float, nullable=False, default=0.5)  # 0.0-1.0

    # Session details
    viewing_duration_seconds = Column(Integer, nullable=True)
    base_frequency = Column(Float, nullable=True)
    beat_frequency = Column(Float, nullable=True)
    protocol_used = Column(String, nullable=True)

    # Scoring (populated after reveal)
    is_scored = Column(Boolean, nullable=False, default=False)
    accuracy_score = Column(Float, nullable=True)  # 0-100
    points_awarded = Column(Integer, nullable=True)
    matched_elements = Column(Text, nullable=True)  # JSON array

    # Timestamps
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    scored_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    practice_target = relationship("RVPracticeTarget", back_populates="predictions")
    user = relationship("User", backref="rv_predictions")


class RVLeaderboard(Base):
    """
    Leaderboard tracking for Remote Viewing accuracy.

    Maintains aggregate statistics for user rankings across:
    - All-time performance
    - Monthly rankings
    - Weekly rankings
    - Daily rankings
    """
    __tablename__ = "rv_leaderboard"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # User identification
    user_identifier = Column(String, nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)

    # Leaderboard type
    period_type = Column(String, nullable=False, index=True)  # "all_time", "monthly", "weekly", "daily"
    period_key = Column(String, nullable=True, index=True)  # e.g., "2025-01" for monthly

    # Rankings
    rank = Column(Integer, nullable=True)

    # Statistics
    total_predictions = Column(Integer, nullable=False, default=0)
    correct_predictions = Column(Integer, nullable=False, default=0)
    total_points = Column(Integer, nullable=False, default=0)
    average_score = Column(Float, nullable=True)
    best_score = Column(Float, nullable=True)
    current_streak = Column(Integer, nullable=False, default=0)
    best_streak = Column(Integer, nullable=False, default=0)

    # Timestamps
    last_prediction_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # User relationship
    user = relationship("User", backref="leaderboard_entries")