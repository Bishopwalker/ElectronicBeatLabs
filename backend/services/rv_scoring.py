"""
Remote Viewing Scoring Service

Handles the full lifecycle of RV sessions:
1. Session creation and tracking
2. Submission processing
3. Scoring after target reveal
4. Statistics aggregation
5. Leaderboard generation

Scoring Algorithm:
- Text similarity using simple word matching (upgradeable to embeddings)
- Category match scoring (colors, shapes, emotions, textures)
- Confidence correlation (calibration of user's self-assessment)
- Historical performance trends
"""

import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

logger = logging.getLogger("ebl.rv_scoring")

# Scoring constants
MIN_SCORE = 0.0
MAX_SCORE = 100.0
EXCEPTIONAL_THRESHOLD = 85.0
HIGH_THRESHOLD = 70.0
MEDIUM_THRESHOLD = 50.0

# Component weights
TEXT_WEIGHT = 0.5
CATEGORY_WEIGHT = 0.3
CONFIDENCE_WEIGHT = 0.2


class RVScoringService:
    """
    Service for Remote Viewing session management and scoring.

    Provides complete RV lifecycle management from session start
    to final scoring and statistics tracking.
    """

    def __init__(self):
        """Initialize the RV scoring service."""
        logger.info("RV Scoring Service initialized")

    # ========================================================================
    # Session Management
    # ========================================================================

    def create_session(
        self,
        db: Session,
        mode: str,
        target_type: str,
        target_id: Optional[str],
        base_frequency: float,
        beat_frequency: float,
        protocol_used: Optional[str] = None,
        user_id: Optional[str] = None,
        user_identifier: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new RV session.

        Args:
            db: Database session
            mode: "tournament" or "practice"
            target_type: "number", "image", "location", etc.
            target_id: Reference to target (quantum number ID, image ID, etc.)
            base_frequency: Base audio frequency used
            beat_frequency: Binaural beat frequency
            protocol_used: Audio protocol name (theta, alpha, etc.)
            user_id: User ID if authenticated
            user_identifier: IP or session ID for anonymous users

        Returns:
            Dict with session details
        """
        from database.models import RVSession

        # Create session record
        session = RVSession(
            user_id=user_id,
            user_identifier=user_identifier,
            mode=mode,
            target_type=target_type,
            target_id=target_id,
            base_frequency=base_frequency,
            beat_frequency=beat_frequency,
            protocol_used=protocol_used,
            status="active"
        )

        db.add(session)
        db.commit()
        db.refresh(session)

        logger.info(f"RV session created: {session.id}, mode={mode}, target_type={target_type}")

        return {
            "session_id": session.id,
            "mode": session.mode,
            "target_type": session.target_type,
            "started_at": session.started_at.isoformat(),
            "status": session.status,
            "frequencies": {
                "base": session.base_frequency,
                "beat": session.beat_frequency,
                "protocol": session.protocol_used
            }
        }

    def get_session(self, db: Session, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get session details.

        Args:
            db: Database session
            session_id: Session ID to retrieve

        Returns:
            Dict with session details or None if not found
        """
        from database.models import RVSession

        session = db.query(RVSession).filter(RVSession.id == session_id).first()

        if not session:
            return None

        return {
            "session_id": session.id,
            "mode": session.mode,
            "target_type": session.target_type,
            "target_id": session.target_id,
            "target_revealed": session.target_revealed,
            "status": session.status,
            "started_at": session.started_at.isoformat(),
            "submitted_at": session.submitted_at.isoformat() if session.submitted_at else None,
            "duration_seconds": session.duration_seconds,
            "frequencies": {
                "base": session.base_frequency,
                "beat": session.beat_frequency,
                "protocol": session.protocol_used
            }
        }

    # ========================================================================
    # Submission Processing
    # ========================================================================

    def submit_impressions(
        self,
        db: Session,
        session_id: str,
        impressions_text: str,
        confidence_level: int,
        sketch_description: Optional[str] = None,
        colors: Optional[List[str]] = None,
        shapes: Optional[List[str]] = None,
        emotions: Optional[List[str]] = None,
        textures: Optional[List[str]] = None,
        clarity_rating: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Submit user impressions for an RV session.

        Args:
            db: Database session
            session_id: Session ID
            impressions_text: Main text description of impressions
            confidence_level: 1-10 scale
            sketch_description: Description of any sketches
            colors: List of perceived colors
            shapes: List of perceived shapes
            emotions: List of perceived emotions
            textures: List of perceived textures
            clarity_rating: 1-10 how clear the impressions were

        Returns:
            Dict with submission details
        """
        from database.models import RVSession, RVSubmission

        # Get session
        session = db.query(RVSession).filter(RVSession.id == session_id).first()
        if not session:
            raise ValueError(f"Session {session_id} not found")

        if session.status != "active":
            raise ValueError(f"Session {session_id} is not active (status: {session.status})")

        # Calculate duration
        now_utc = datetime.now(timezone.utc)
        started_at = session.started_at if session.started_at.tzinfo else session.started_at.replace(tzinfo=timezone.utc)
        duration = (now_utc - started_at).total_seconds()

        # Create submission
        submission = RVSubmission(
            session_id=session_id,
            impressions_text=impressions_text,
            sketch_description=sketch_description,
            colors=",".join(colors) if colors else None,
            shapes=",".join(shapes) if shapes else None,
            emotions=",".join(emotions) if emotions else None,
            textures=",".join(textures) if textures else None,
            confidence_level=confidence_level,
            clarity_rating=clarity_rating
        )

        # Update session
        session.status = "submitted"
        session.submitted_at = datetime.now(timezone.utc)
        session.duration_seconds = int(duration)

        db.add(submission)
        db.commit()
        db.refresh(submission)

        logger.info(f"Impressions submitted for session {session_id}, confidence={confidence_level}")

        return {
            "submission_id": submission.id,
            "session_id": session_id,
            "submitted_at": submission.created_at.isoformat(),
            "duration_seconds": session.duration_seconds,
            "status": "submitted"
        }

    # ========================================================================
    # Scoring Algorithm
    # ========================================================================

    def score_session(
        self,
        db: Session,
        session_id: str,
        target_description: str,
        target_categories: Optional[Dict[str, List[str]]] = None
    ) -> Dict[str, Any]:
        """
        Calculate score for RV session after target reveal.

        Args:
            db: Database session
            session_id: Session ID to score
            target_description: Actual description of the target
            target_categories: Dict with target's actual categories
                e.g., {"colors": ["red", "blue"], "shapes": ["circular"]}

        Returns:
            Dict with scoring details
        """
        from database.models import RVSession, RVSubmission, RVScore

        # Get session and submission
        session = db.query(RVSession).filter(RVSession.id == session_id).first()
        if not session:
            raise ValueError(f"Session {session_id} not found")

        if session.status != "submitted":
            raise ValueError(f"Cannot score session with status: {session.status}")

        submission = db.query(RVSubmission).filter(
            RVSubmission.session_id == session_id
        ).first()

        if not submission:
            raise ValueError(f"No submission found for session {session_id}")

        # Calculate component scores
        text_score = self._calculate_text_similarity(
            submission.impressions_text,
            target_description
        )

        category_score, matched, missed = self._calculate_category_match(
            submission,
            target_categories or {}
        )

        confidence_corr = self._calculate_confidence_correlation(
            submission.confidence_level,
            text_score + category_score / 2  # Average of both scores
        )

        # Calculate weighted total score
        total_score = (
            TEXT_WEIGHT * text_score +
            CATEGORY_WEIGHT * category_score +
            CONFIDENCE_WEIGHT * max(0, confidence_corr * 50 + 50)  # Scale -1:1 to 0:100
        )

        # Clamp to valid range
        total_score = max(MIN_SCORE, min(MAX_SCORE, total_score))

        # Determine accuracy rating
        if total_score >= EXCEPTIONAL_THRESHOLD:
            rating = "exceptional"
        elif total_score >= HIGH_THRESHOLD:
            rating = "high"
        elif total_score >= MEDIUM_THRESHOLD:
            rating = "medium"
        else:
            rating = "low"

        # Create detailed breakdown
        scoring_details = {
            "text_similarity": text_score,
            "category_match": category_score,
            "confidence_correlation": confidence_corr,
            "weights": {
                "text": TEXT_WEIGHT,
                "category": CATEGORY_WEIGHT,
                "confidence": CONFIDENCE_WEIGHT
            },
            "components": {
                "text_contribution": TEXT_WEIGHT * text_score,
                "category_contribution": CATEGORY_WEIGHT * category_score,
                "confidence_contribution": CONFIDENCE_WEIGHT * max(0, confidence_corr * 50 + 50)
            }
        }

        # Create score record
        score = RVScore(
            session_id=session_id,
            total_score=total_score,
            accuracy_rating=rating,
            text_similarity_score=text_score,
            category_match_score=category_score,
            confidence_correlation=confidence_corr,
            scoring_details=json.dumps(scoring_details),
            target_description=target_description,
            matched_elements=json.dumps(matched),
            missed_elements=json.dumps(missed),
            scoring_algorithm_version="v1.0"
        )

        # Update session
        session.status = "scored"
        session.target_revealed = True

        db.add(score)
        db.commit()
        db.refresh(score)

        # Update user statistics
        self._update_user_stats(db, session, total_score)

        logger.info(f"Session {session_id} scored: {total_score:.1f} ({rating})")

        return {
            "session_id": session_id,
            "total_score": total_score,
            "accuracy_rating": rating,
            "components": {
                "text_similarity": text_score,
                "category_match": category_score,
                "confidence_correlation": confidence_corr
            },
            "target_description": target_description,
            "matched_elements": matched,
            "missed_elements": missed,
            "scoring_details": scoring_details,
            "scored_at": score.scored_at.isoformat()
        }

    def _calculate_text_similarity(self, user_text: str, target_text: str) -> float:
        """
        Calculate text similarity using simple word matching.

        This is a basic implementation using word overlap.
        Can be upgraded to use embeddings (sentence-transformers) for better accuracy.

        Args:
            user_text: User's impression text
            target_text: Actual target description

        Returns:
            Similarity score 0-100
        """
        # Normalize texts
        user_words = set(user_text.lower().split())
        target_words = set(target_text.lower().split())

        if not target_words:
            return 0.0

        # Remove common stop words
        stop_words = {"the", "a", "an", "is", "it", "and", "or", "but", "in", "on", "at", "to", "for"}
        user_words = user_words - stop_words
        target_words = target_words - stop_words

        # Calculate Jaccard similarity
        intersection = user_words & target_words
        union = user_words | target_words

        if not union:
            return 0.0

        similarity = len(intersection) / len(union)

        # Scale to 0-100
        return similarity * 100.0

    def _calculate_category_match(
        self,
        submission,
        target_categories: Dict[str, List[str]]
    ) -> Tuple[float, List[str], List[str]]:
        """
        Calculate category match score.

        Args:
            submission: RVSubmission object
            target_categories: Dict with actual target categories

        Returns:
            Tuple of (score, matched_elements, missed_elements)
        """
        matched = []
        missed = []
        total_possible = 0
        correct = 0

        # Check each category
        categories = {
            "colors": (submission.colors.split(",") if submission.colors else [],
                      target_categories.get("colors", [])),
            "shapes": (submission.shapes.split(",") if submission.shapes else [],
                      target_categories.get("shapes", [])),
            "emotions": (submission.emotions.split(",") if submission.emotions else [],
                        target_categories.get("emotions", [])),
            "textures": (submission.textures.split(",") if submission.textures else [],
                        target_categories.get("textures", []))
        }

        for category_name, (user_values, target_values) in categories.items():
            user_set = set(v.strip().lower() for v in user_values if v.strip())
            target_set = set(v.strip().lower() for v in target_values if v.strip())

            if target_set:
                total_possible += len(target_set)
                matches = user_set & target_set
                correct += len(matches)

                for match in matches:
                    matched.append(f"{category_name}: {match}")

                for miss in target_set - user_set:
                    missed.append(f"{category_name}: {miss}")

        # Calculate score
        if total_possible == 0:
            return 0.0, matched, missed

        score = (correct / total_possible) * 100.0
        return score, matched, missed

    def _calculate_confidence_correlation(
        self,
        confidence: int,
        actual_score: float
    ) -> float:
        """
        Calculate confidence correlation (calibration).

        Measures if user's confidence matches actual accuracy.
        Positive correlation = well calibrated.
        Negative = overconfident or underconfident.

        Args:
            confidence: User's self-reported confidence (1-10)
            actual_score: Actual performance score (0-100)

        Returns:
            Correlation value -1 to 1
        """
        # Normalize confidence to 0-100 scale
        normalized_confidence = (confidence / 10.0) * 100.0

        # Calculate difference
        diff = abs(normalized_confidence - actual_score)

        # Convert to correlation (-1 to 1)
        # 0 difference = 1.0, 100 difference = -1.0
        correlation = 1.0 - (diff / 50.0)
        return max(-1.0, min(1.0, correlation))

    # ========================================================================
    # Statistics & Leaderboards
    # ========================================================================

    def _update_user_stats(self, db: Session, session, score: float):
        """
        Update user statistics after scoring a session.

        Args:
            db: Database session
            session: RVSession object
            score: Total score achieved
        """
        from database.models import UserRVStats

        # Get or create user stats
        if session.user_id:
            stats = db.query(UserRVStats).filter(
                UserRVStats.user_id == session.user_id
            ).first()
        else:
            stats = db.query(UserRVStats).filter(
                UserRVStats.user_identifier == session.user_identifier
            ).first()

        if not stats:
            stats = UserRVStats(
                user_id=session.user_id,
                user_identifier=session.user_identifier,
                first_session_at=session.started_at,
                total_sessions=0,
                tournament_sessions=0,
                practice_sessions=0,
                total_points=0,
                current_streak=0,
                best_streak=0
            )
            db.add(stats)

        # Update session counts
        stats.total_sessions = (stats.total_sessions or 0) + 1
        if session.mode == "tournament":
            stats.tournament_sessions = (stats.tournament_sessions or 0) + 1
        else:
            stats.practice_sessions = (stats.practice_sessions or 0) + 1

        # Update scoring statistics
        if stats.average_score is None:
            stats.average_score = score
        else:
            # Running average
            total = stats.average_score * (stats.total_sessions - 1) + score
            stats.average_score = total / stats.total_sessions

        # Update best/worst
        if stats.best_score is None or score > stats.best_score:
            stats.best_score = score
        if stats.worst_score is None or score < stats.worst_score:
            stats.worst_score = score

        # Update streak (threshold: 60 points)
        if score >= 60:
            stats.current_streak = (stats.current_streak or 0) + 1
            if stats.current_streak > (stats.best_streak or 0):
                stats.best_streak = stats.current_streak
        else:
            stats.current_streak = 0

        # Update points (for leaderboard)
        stats.total_points = (stats.total_points or 0) + int(score)

        # Update timestamps
        stats.last_session_at = session.submitted_at

        db.commit()

        logger.info(f"User stats updated: avg={stats.average_score:.1f}, streak={stats.current_streak}")

    def get_user_stats(
        self,
        db: Session,
        user_id: Optional[str] = None,
        user_identifier: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Get user statistics.

        Args:
            db: Database session
            user_id: User ID if authenticated
            user_identifier: User identifier if anonymous

        Returns:
            Dict with user statistics or None
        """
        from database.models import UserRVStats

        if user_id:
            stats = db.query(UserRVStats).filter(UserRVStats.user_id == user_id).first()
        elif user_identifier:
            stats = db.query(UserRVStats).filter(
                UserRVStats.user_identifier == user_identifier
            ).first()
        else:
            return None

        if not stats:
            return None

        return {
            "total_sessions": stats.total_sessions,
            "tournament_sessions": stats.tournament_sessions,
            "practice_sessions": stats.practice_sessions,
            "average_score": stats.average_score,
            "best_score": stats.best_score,
            "worst_score": stats.worst_score,
            "total_points": stats.total_points,
            "current_streak": stats.current_streak,
            "best_streak": stats.best_streak,
            "first_session_at": stats.first_session_at.isoformat() if stats.first_session_at else None,
            "last_session_at": stats.last_session_at.isoformat() if stats.last_session_at else None
        }

    def get_session_history(
        self,
        db: Session,
        user_id: Optional[str] = None,
        user_identifier: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Get user's session history.

        Args:
            db: Database session
            user_id: User ID if authenticated
            user_identifier: User identifier if anonymous
            limit: Max number of sessions to return

        Returns:
            List of session summaries
        """
        from database.models import RVSession, RVScore

        # Build query
        query = db.query(RVSession).filter(RVSession.status == "scored")

        if user_id:
            query = query.filter(RVSession.user_id == user_id)
        elif user_identifier:
            query = query.filter(RVSession.user_identifier == user_identifier)
        else:
            return []

        sessions = query.order_by(desc(RVSession.started_at)).limit(limit).all()

        history = []
        for session in sessions:
            score = db.query(RVScore).filter(RVScore.session_id == session.id).first()

            history.append({
                "session_id": session.id,
                "mode": session.mode,
                "target_type": session.target_type,
                "started_at": session.started_at.isoformat(),
                "duration_seconds": session.duration_seconds,
                "score": score.total_score if score else None,
                "accuracy_rating": score.accuracy_rating if score else None,
                "protocol_used": session.protocol_used
            })

        return history

    def get_leaderboard(
        self,
        db: Session,
        mode: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get leaderboard rankings.

        Args:
            db: Database session
            mode: Filter by mode ("tournament" or "practice"), None for all
            limit: Number of top users to return

        Returns:
            List of user rankings
        """
        from database.models import UserRVStats, User

        query = db.query(UserRVStats).filter(UserRVStats.total_sessions > 0)

        # Order by total points descending
        query = query.order_by(desc(UserRVStats.total_points)).limit(limit)

        stats = query.all()

        leaderboard = []
        for rank, stat in enumerate(stats, start=1):
            # Get user name if available
            user_name = "Anonymous"
            if stat.user_id:
                user = db.query(User).filter(User.id == stat.user_id).first()
                if user and user.name:
                    user_name = user.name
                elif user and user.email:
                    user_name = user.email.split("@")[0]

            leaderboard.append({
                "rank": rank,
                "user_name": user_name,
                "total_points": stat.total_points,
                "total_sessions": stat.total_sessions,
                "average_score": stat.average_score,
                "best_score": stat.best_score,
                "current_streak": stat.current_streak,
                "best_streak": stat.best_streak
            })

        return leaderboard


# Singleton instance
rv_scoring_service = RVScoringService()
