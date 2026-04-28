"""
ARV (Associative Remote Viewing) System Service

Implements the ARV protocol for prediction using remote viewing:
1. Target pairs: Two distinct targets associated with binary outcomes
2. Blind viewing: Viewer receives target WITHOUT knowing which outcome it represents
3. Recording: Viewer describes impressions/target details
4. Judging: After viewing, judge determines which target best matches the description
5. Outcome resolution: Real-world outcome revealed, prediction accuracy calculated

Key Principle: The viewer never sees the outcome association until after judging.
This prevents analytical overlay and preserves the intuitive remote viewing signal.

ARV has been successfully used for:
- Stock market predictions (up/down)
- Sports outcomes (win/lose)
- Binary events (yes/no)
- Multiple choice predictions (A/B/C/D)

Reference: Russell Targ, Lyn Buchanan, PEAR Lab ARV experiments
"""

import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any, Tuple
from enum import Enum
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
import logging

logger = logging.getLogger("ebl.arv_system")


class ARVOutcomeStatus(str, Enum):
    """ARV prediction outcome status"""
    PENDING = "pending"  # Viewing complete, awaiting real-world outcome
    RESOLVED = "resolved"  # Outcome known, accuracy calculated
    EXPIRED = "expired"  # Deadline passed without resolution


class ARVTargetType(str, Enum):
    """Types of target pairs for ARV"""
    IMAGE_PAIR = "image_pair"  # Two distinct images
    LOCATION_PAIR = "location_pair"  # Two geographic coordinates
    DESCRIPTION_PAIR = "description_pair"  # Two text descriptions
    OBJECT_PAIR = "object_pair"  # Two physical objects


class ARVSystemService:
    """
    Service for managing ARV (Associative Remote Viewing) predictions.

    Protocol Flow:
    1. Create prediction with target pair and outcome associations
    2. Viewer receives blind target (random selection)
    3. Viewer submits impressions/description
    4. Judge determines which target matches viewer's description
    5. Real-world outcome is recorded
    6. System calculates if prediction was correct
    """

    def __init__(self):
        """Initialize ARV system service."""
        self._cache: Dict[str, Any] = {}

    def create_prediction(
        self,
        db: Session,
        name: str,
        description: str,
        target_a: Dict[str, Any],
        target_b: Dict[str, Any],
        outcome_a_label: str,
        outcome_b_label: str,
        target_type: ARVTargetType = ARVTargetType.IMAGE_PAIR,
        user_identifier: Optional[str] = None,
        deadline: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Create a new ARV prediction session.

        Args:
            db: Database session
            name: Prediction name (e.g., "AAPL Stock Monday")
            description: What is being predicted
            target_a: Target A data (image URL, coordinates, description)
            target_b: Target B data (image URL, coordinates, description)
            outcome_a_label: Label for outcome A (e.g., "Stock Up")
            outcome_b_label: Label for outcome B (e.g., "Stock Down")
            target_type: Type of target pair
            user_identifier: User ID or identifier
            deadline: When prediction must be resolved (optional)

        Returns:
            Dict with prediction details and session ID
        """
        from database.models import ARVPrediction, ARVTargetPair

        # Create target pair
        target_pair = ARVTargetPair(
            target_type=target_type.value,
            target_a_data=str(target_a),
            target_b_data=str(target_b),
            outcome_a_label=outcome_a_label,
            outcome_b_label=outcome_b_label
        )

        db.add(target_pair)
        db.flush()  # Get target_pair.id

        # Create prediction
        prediction = ARVPrediction(
            name=name,
            description=description,
            user_identifier=user_identifier,
            target_pair_id=target_pair.id,
            status=ARVOutcomeStatus.PENDING.value,
            deadline=deadline
        )

        db.add(prediction)
        db.commit()
        db.refresh(prediction)

        logger.info(f"ARV prediction created: {name} (ID: {prediction.id})")

        return {
            "prediction_id": prediction.id,
            "name": name,
            "description": description,
            "target_type": target_type.value,
            "status": prediction.status,
            "deadline": deadline.isoformat() if deadline else None,
            "created_at": prediction.created_at.isoformat()
        }

    def get_blind_target(
        self,
        db: Session,
        prediction_id: str
    ) -> Dict[str, Any]:
        """
        Get a blind target for viewing (randomly selected A or B).

        This is the core of ARV protocol: the viewer receives ONE target
        without knowing which outcome it represents. The viewer describes
        what they perceive, then judges which target matches their experience.

        Args:
            db: Database session
            prediction_id: Prediction session ID

        Returns:
            Dict with blind target data (A or B, randomly selected)
        """
        from database.models import ARVPrediction, ARVTargetPair
        import random

        prediction = db.query(ARVPrediction).filter(
            ARVPrediction.id == prediction_id
        ).first()

        if not prediction:
            raise ValueError(f"Prediction {prediction_id} not found")

        target_pair = db.query(ARVTargetPair).filter(
            ARVTargetPair.id == prediction.target_pair_id
        ).first()

        if not target_pair:
            raise ValueError(f"Target pair not found for prediction {prediction_id}")

        # Randomly select target A or B
        selected_target = random.choice(["A", "B"])

        if selected_target == "A":
            target_data = eval(target_pair.target_a_data)  # Convert string back to dict
        else:
            target_data = eval(target_pair.target_b_data)

        # Store which target was selected for this session
        prediction.selected_target = selected_target
        db.commit()

        logger.info(f"Blind target selected for prediction {prediction_id}: Target {selected_target}")

        return {
            "prediction_id": prediction_id,
            "target_data": target_data,
            "target_type": target_pair.target_type,
            "instructions": (
                "Focus on this target. Describe what you perceive, see, feel, or sense. "
                "Do not analyze or try to guess the outcome. Simply report your impressions."
            )
        }

    def submit_viewing_data(
        self,
        db: Session,
        prediction_id: str,
        impressions: str,
        confidence: Optional[float] = None,
        session_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Submit viewing impressions from the viewer.

        Args:
            db: Database session
            prediction_id: Prediction session ID
            impressions: Viewer's description of target impressions
            confidence: Confidence level (0-1, optional)
            session_notes: Additional notes about viewing session

        Returns:
            Dict with submission confirmation
        """
        from database.models import ARVPrediction, ARVSubmission

        prediction = db.query(ARVPrediction).filter(
            ARVPrediction.id == prediction_id
        ).first()

        if not prediction:
            raise ValueError(f"Prediction {prediction_id} not found")

        # Create submission record
        submission = ARVSubmission(
            prediction_id=prediction_id,
            impressions=impressions,
            confidence=confidence,
            session_notes=session_notes,
            submitted_at=datetime.now(timezone.utc)
        )

        db.add(submission)
        db.commit()
        db.refresh(submission)

        logger.info(f"Viewing data submitted for prediction {prediction_id}")

        return {
            "submission_id": submission.id,
            "prediction_id": prediction_id,
            "status": "submitted",
            "submitted_at": submission.submitted_at.isoformat(),
            "next_step": "judging"
        }

    def judge_target_match(
        self,
        db: Session,
        prediction_id: str,
        judged_target: str
    ) -> Dict[str, Any]:
        """
        Judge which target (A or B) best matches the viewer's impressions.

        This is done AFTER viewing but BEFORE the outcome is known.
        The judge reviews the impressions and determines which target
        they most closely match.

        Args:
            db: Database session
            prediction_id: Prediction session ID
            judged_target: "A" or "B" - which target matches impressions

        Returns:
            Dict with judging results
        """
        from database.models import ARVPrediction, ARVTargetPair

        if judged_target not in ["A", "B"]:
            raise ValueError("judged_target must be 'A' or 'B'")

        prediction = db.query(ARVPrediction).filter(
            ARVPrediction.id == prediction_id
        ).first()

        if not prediction:
            raise ValueError(f"Prediction {prediction_id} not found")

        # Store judged target
        prediction.judged_target = judged_target
        prediction.judged_at = datetime.now(timezone.utc)
        db.commit()

        # Get target pair for outcome labels
        target_pair = db.query(ARVTargetPair).filter(
            ARVTargetPair.id == prediction.target_pair_id
        ).first()

        predicted_outcome = (
            target_pair.outcome_a_label if judged_target == "A"
            else target_pair.outcome_b_label
        )

        logger.info(f"Target judged for prediction {prediction_id}: {judged_target} ({predicted_outcome})")

        return {
            "prediction_id": prediction_id,
            "judged_target": judged_target,
            "predicted_outcome": predicted_outcome,
            "status": "judged",
            "judged_at": prediction.judged_at.isoformat(),
            "next_step": "resolve_outcome",
            "message": f"Prediction locked in: {predicted_outcome}. Awaiting real-world outcome."
        }

    def resolve_outcome(
        self,
        db: Session,
        prediction_id: str,
        actual_outcome: str,
        outcome_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Record the actual real-world outcome and calculate prediction accuracy.

        Args:
            db: Database session
            prediction_id: Prediction session ID
            actual_outcome: "A" or "B" - which outcome actually occurred
            outcome_notes: Notes about the outcome (optional)

        Returns:
            Dict with outcome resolution and accuracy
        """
        from database.models import ARVPrediction, ARVOutcome, ARVTargetPair

        if actual_outcome not in ["A", "B"]:
            raise ValueError("actual_outcome must be 'A' or 'B'")

        prediction = db.query(ARVPrediction).filter(
            ARVPrediction.id == prediction_id
        ).first()

        if not prediction:
            raise ValueError(f"Prediction {prediction_id} not found")

        if not prediction.judged_target:
            raise ValueError(f"Prediction {prediction_id} has not been judged yet")

        # Calculate if prediction was correct
        is_correct = (prediction.judged_target == actual_outcome)

        # Create outcome record
        outcome = ARVOutcome(
            prediction_id=prediction_id,
            actual_outcome=actual_outcome,
            is_correct=is_correct,
            outcome_notes=outcome_notes,
            resolved_at=datetime.now(timezone.utc)
        )

        db.add(outcome)

        # Update prediction status
        prediction.status = ARVOutcomeStatus.RESOLVED.value
        prediction.is_correct = is_correct

        db.commit()
        db.refresh(outcome)

        # Get target pair for labels
        target_pair = db.query(ARVTargetPair).filter(
            ARVTargetPair.id == prediction.target_pair_id
        ).first()

        predicted_label = (
            target_pair.outcome_a_label if prediction.judged_target == "A"
            else target_pair.outcome_b_label
        )

        actual_label = (
            target_pair.outcome_a_label if actual_outcome == "A"
            else target_pair.outcome_b_label
        )

        logger.info(
            f"Outcome resolved for prediction {prediction_id}: "
            f"Predicted={predicted_label}, Actual={actual_label}, Correct={is_correct}"
        )

        return {
            "prediction_id": prediction_id,
            "predicted_target": prediction.judged_target,
            "predicted_outcome": predicted_label,
            "actual_target": actual_outcome,
            "actual_outcome": actual_label,
            "is_correct": is_correct,
            "status": "resolved",
            "resolved_at": outcome.resolved_at.isoformat(),
            "accuracy": "HIT" if is_correct else "MISS"
        }

    def get_prediction_status(
        self,
        db: Session,
        prediction_id: str
    ) -> Dict[str, Any]:
        """
        Get current status of a prediction.

        Args:
            db: Database session
            prediction_id: Prediction session ID

        Returns:
            Dict with complete prediction status
        """
        from database.models import (
            ARVPrediction, ARVTargetPair, ARVSubmission, ARVOutcome
        )

        prediction = db.query(ARVPrediction).filter(
            ARVPrediction.id == prediction_id
        ).first()

        if not prediction:
            raise ValueError(f"Prediction {prediction_id} not found")

        # Get related data
        target_pair = db.query(ARVTargetPair).filter(
            ARVTargetPair.id == prediction.target_pair_id
        ).first()

        submission = db.query(ARVSubmission).filter(
            ARVSubmission.prediction_id == prediction_id
        ).first()

        outcome = db.query(ARVOutcome).filter(
            ARVOutcome.prediction_id == prediction_id
        ).first()

        result = {
            "prediction_id": prediction.id,
            "name": prediction.name,
            "description": prediction.description,
            "status": prediction.status,
            "created_at": prediction.created_at.isoformat(),
            "deadline": prediction.deadline.isoformat() if prediction.deadline else None
        }

        # Add submission data if exists
        if submission:
            result["submission"] = {
                "impressions": submission.impressions,
                "confidence": submission.confidence,
                "submitted_at": submission.submitted_at.isoformat()
            }

        # Add judging data if exists
        if prediction.judged_target:
            predicted_label = (
                target_pair.outcome_a_label if prediction.judged_target == "A"
                else target_pair.outcome_b_label
            )
            result["judging"] = {
                "judged_target": prediction.judged_target,
                "predicted_outcome": predicted_label,
                "judged_at": prediction.judged_at.isoformat() if prediction.judged_at else None
            }

        # Add outcome data if resolved
        if outcome:
            actual_label = (
                target_pair.outcome_a_label if outcome.actual_outcome == "A"
                else target_pair.outcome_b_label
            )
            result["outcome"] = {
                "actual_target": outcome.actual_outcome,
                "actual_outcome": actual_label,
                "is_correct": outcome.is_correct,
                "resolved_at": outcome.resolved_at.isoformat()
            }

        return result

    def get_accuracy_statistics(
        self,
        db: Session,
        user_identifier: Optional[str] = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Calculate ARV prediction accuracy statistics.

        Args:
            db: Database session
            user_identifier: Filter by user (optional)
            days: Number of days to analyze (default: 30)

        Returns:
            Dict with accuracy statistics
        """
        from database.models import ARVPrediction

        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)

        # Query resolved predictions
        query = db.query(ARVPrediction).filter(
            and_(
                ARVPrediction.status == ARVOutcomeStatus.RESOLVED.value,
                ARVPrediction.created_at >= cutoff_date
            )
        )

        if user_identifier:
            query = query.filter(ARVPrediction.user_identifier == user_identifier)

        predictions = query.all()

        total = len(predictions)
        hits = sum(1 for p in predictions if p.is_correct)
        misses = total - hits

        accuracy = (hits / total * 100) if total > 0 else 0

        # Calculate statistical significance
        # For ARV, chance is 50% (binary choice)
        # Use binomial test to determine if results are significantly different from chance
        significance = self._calculate_significance(hits, total)

        logger.info(
            f"ARV statistics calculated: {hits}/{total} hits ({accuracy:.1f}%) "
            f"over {days} days"
        )

        return {
            "period_days": days,
            "total_predictions": total,
            "hits": hits,
            "misses": misses,
            "accuracy_percent": round(accuracy, 2),
            "expected_chance": 50.0,
            "above_chance": accuracy > 50.0,
            "statistical_significance": significance,
            "user_identifier": user_identifier
        }

    def _calculate_significance(
        self,
        successes: int,
        total: int,
        chance: float = 0.5
    ) -> str:
        """
        Calculate statistical significance using binomial test.

        Args:
            successes: Number of hits
            total: Total predictions
            chance: Expected chance rate (default: 0.5 for binary)

        Returns:
            Significance level description
        """
        if total == 0:
            return "insufficient_data"

        # Simple binomial probability approximation
        # For more rigorous analysis, use scipy.stats.binom_test
        import math

        expected = total * chance
        std_dev = math.sqrt(total * chance * (1 - chance))
        z_score = (successes - expected) / std_dev if std_dev > 0 else 0

        # Determine significance level
        if abs(z_score) < 1.96:
            return "not_significant"  # p > 0.05
        elif abs(z_score) < 2.58:
            return "significant"  # p < 0.05
        elif abs(z_score) < 3.29:
            return "very_significant"  # p < 0.01
        else:
            return "highly_significant"  # p < 0.001

    def get_prediction_history(
        self,
        db: Session,
        user_identifier: Optional[str] = None,
        limit: int = 20,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get prediction history.

        Args:
            db: Database session
            user_identifier: Filter by user (optional)
            limit: Maximum number of predictions to return
            status: Filter by status (optional)

        Returns:
            List of prediction records
        """
        from database.models import ARVPrediction

        query = db.query(ARVPrediction)

        if user_identifier:
            query = query.filter(ARVPrediction.user_identifier == user_identifier)

        if status:
            query = query.filter(ARVPrediction.status == status)

        predictions = query.order_by(
            desc(ARVPrediction.created_at)
        ).limit(limit).all()

        return [
            {
                "prediction_id": p.id,
                "name": p.name,
                "description": p.description,
                "status": p.status,
                "is_correct": p.is_correct,
                "created_at": p.created_at.isoformat(),
                "deadline": p.deadline.isoformat() if p.deadline else None
            }
            for p in predictions
        ]


# Singleton instance
arv_system = ARVSystemService()
