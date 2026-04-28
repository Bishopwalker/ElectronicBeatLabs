"""
Remote Viewing Tournament Service - 12-Hour Cycle System

Implements tournament-style RV competitions with time-locked quantum targets:

Tournament Schedule:
- 12-hour cycles running twice daily
- Cycle 1: 00:00 UTC → 12:00 UTC
- Cycle 2: 12:00 UTC → 00:00 UTC (next day)

Entanglement Protocol:
- Target number is quantum-generated at exactly 3 hours 33 minutes (3:33) into each cycle
- Before entanglement: Users can submit predictions (blind)
- After entanglement: Target exists but remains hidden
- At cycle end (12 hours): Target is revealed, scores calculated

Target Format:
- 8-digit quantum number: "xxxx-xxxx" (e.g., "4729-8153")
- Generated using ANU QRNG (quantum_oracle.py)
- Each digit is truly random from quantum vacuum fluctuations

Key Principle: The target number does NOT exist until the entanglement moment.
This ensures true remote viewing (perceiving future events) rather than
just accessing existing information.

Example Timeline (Cycle 1):
00:00 UTC - Cycle starts, predictions open
03:33 UTC - Quantum entanglement (target materializes)
12:00 UTC - Cycle ends, target revealed, scores calculated

References:
- CIA Star Gate Program (remote viewing protocols)
- PEAR Lab precognition experiments
- ANU Quantum Random Number Generator
"""

from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_
import logging

logger = logging.getLogger("ebl.rv_tournament")

# Tournament cycle configuration
CYCLE_DURATION_HOURS = 12
ENTANGLEMENT_HOUR = 3
ENTANGLEMENT_MINUTE = 33
ENTANGLEMENT_OFFSET_SECONDS = (ENTANGLEMENT_HOUR * 3600) + (ENTANGLEMENT_MINUTE * 60)  # 3:33 in seconds

# Cycle start times (UTC)
CYCLE_START_HOURS = [0, 12]  # Midnight and Noon UTC


class TournamentCycle:
    """
    Represents a single 12-hour tournament cycle.

    Timeline:
    - start_time: Cycle begins, predictions can be submitted
    - entanglement_time: Target number materializes (3:33 after start)
    - end_time: Cycle ends, results revealed (12:00 after start)
    """

    def __init__(self, start_time: datetime):
        """
        Initialize a tournament cycle.

        Args:
            start_time: Cycle start datetime (UTC)
        """
        self.start_time = start_time
        self.entanglement_time = start_time + timedelta(seconds=ENTANGLEMENT_OFFSET_SECONDS)
        self.end_time = start_time + timedelta(hours=CYCLE_DURATION_HOURS)

        # Cycle identifier: "2024-01-15_00" or "2024-01-15_12"
        self.cycle_id = f"{start_time.date().isoformat()}_{start_time.hour:02d}"

    def get_phase(self, current_time: datetime) -> str:
        """
        Determine current phase of the cycle.

        Args:
            current_time: Current datetime (UTC)

        Returns:
            Phase: "pre_entanglement", "post_entanglement", "revealed", or "future"
        """
        if current_time < self.start_time:
            return "future"
        elif current_time < self.entanglement_time:
            return "pre_entanglement"
        elif current_time < self.end_time:
            return "post_entanglement"
        else:
            return "revealed"

    def time_until_entanglement(self, current_time: datetime) -> timedelta:
        """Get time remaining until entanglement."""
        return self.entanglement_time - current_time

    def time_until_reveal(self, current_time: datetime) -> timedelta:
        """Get time remaining until reveal."""
        return self.end_time - current_time


class RVTournamentService:
    """
    Service for managing Remote Viewing tournament cycles.

    Implements:
    - 12-hour tournament cycles (twice daily)
    - Quantum target generation at 3:33 mark
    - Prediction submission and scoring
    - Leaderboard and user statistics
    """

    def __init__(self):
        """Initialize the RV Tournament service."""
        self._cache: Dict[str, Any] = {}

    def get_current_cycle(self, current_time: Optional[datetime] = None) -> TournamentCycle:
        """
        Determine which 12-hour cycle we're currently in.

        Args:
            current_time: Current datetime (default: now UTC)

        Returns:
            TournamentCycle object for current cycle
        """
        if current_time is None:
            current_time = datetime.now(timezone.utc)

        # Normalize to UTC
        if current_time.tzinfo is None:
            current_time = current_time.replace(tzinfo=timezone.utc)

        # Determine which cycle we're in (00:00 or 12:00)
        if current_time.hour < 12:
            # We're in the 00:00-12:00 cycle
            cycle_start = current_time.replace(hour=0, minute=0, second=0, microsecond=0)
        else:
            # We're in the 12:00-00:00 cycle
            cycle_start = current_time.replace(hour=12, minute=0, second=0, microsecond=0)

        cycle = TournamentCycle(cycle_start)
        logger.debug(f"Current cycle: {cycle.cycle_id}, phase: {cycle.get_phase(current_time)}")

        return cycle

    def get_cycle_by_id(self, cycle_id: str) -> TournamentCycle:
        """
        Get a specific cycle by its ID.

        Args:
            cycle_id: Cycle identifier (e.g., "2024-01-15_00")

        Returns:
            TournamentCycle object
        """
        # Parse cycle_id: "YYYY-MM-DD_HH"
        date_part, hour_part = cycle_id.split("_")
        year, month, day = map(int, date_part.split("-"))
        hour = int(hour_part)

        if hour not in CYCLE_START_HOURS:
            raise ValueError(f"Invalid cycle hour: {hour}. Must be 0 or 12.")

        cycle_start = datetime(year, month, day, hour, 0, 0, tzinfo=timezone.utc)
        return TournamentCycle(cycle_start)

    def get_cycle_status(
        self,
        db: Session,
        cycle_id: Optional[str] = None,
        current_time: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Get detailed status of a tournament cycle.

        Args:
            db: Database session
            cycle_id: Specific cycle ID (default: current cycle)
            current_time: Current time (default: now UTC)

        Returns:
            Dict containing:
                - cycle_id: Cycle identifier
                - phase: Current phase
                - start_time, entanglement_time, end_time
                - seconds_until_entanglement (if applicable)
                - seconds_until_reveal (if applicable)
                - target_number (if revealed)
                - total_predictions: Number of predictions submitted
                - can_submit_prediction: Boolean
        """
        if current_time is None:
            current_time = datetime.now(timezone.utc)

        # Get cycle
        if cycle_id:
            cycle = self.get_cycle_by_id(cycle_id)
        else:
            cycle = self.get_current_cycle(current_time)

        phase = cycle.get_phase(current_time)

        result = {
            "cycle_id": cycle.cycle_id,
            "phase": phase,
            "start_time": cycle.start_time.isoformat(),
            "entanglement_time": cycle.entanglement_time.isoformat(),
            "end_time": cycle.end_time.isoformat(),
        }

        # Add countdown timers
        if phase == "pre_entanglement":
            time_until = cycle.time_until_entanglement(current_time)
            result["seconds_until_entanglement"] = int(time_until.total_seconds())
            result["countdown_to_entanglement"] = str(time_until).split('.')[0]  # HH:MM:SS format
            result["can_submit_prediction"] = True
            result["message"] = "Prediction window open. Target will materialize at entanglement time."

        elif phase == "post_entanglement":
            time_until = cycle.time_until_reveal(current_time)
            result["seconds_until_reveal"] = int(time_until.total_seconds())
            result["countdown_to_reveal"] = str(time_until).split('.')[0]
            result["can_submit_prediction"] = True
            result["target_exists"] = True
            result["message"] = "Target has materialized but remains hidden. Submit your prediction!"

        elif phase == "revealed":
            result["can_submit_prediction"] = False
            result["target_revealed"] = True
            result["message"] = "Cycle complete. Target revealed."

            # Get target number from database
            target = self._get_tournament_target(db, cycle.cycle_id)
            if target:
                result["target_number"] = target["target_number"]

        else:  # future
            result["can_submit_prediction"] = False
            result["message"] = "Cycle has not started yet."

        # Get prediction count for this cycle
        prediction_count = self._count_cycle_predictions(db, cycle.cycle_id)
        result["total_predictions"] = prediction_count

        logger.info(f"Cycle status for {cycle.cycle_id}: {phase}, {prediction_count} predictions")

        return result

    async def generate_tournament_target(
        self,
        db: Session,
        cycle_id: str,
        force: bool = False
    ) -> Dict[str, Any]:
        """
        Generate the entangled quantum target for a cycle.

        This should ONLY be called at the exact entanglement time (3:33).
        The target is an 8-digit quantum number in format "xxxx-xxxx".

        Args:
            db: Database session
            cycle_id: Cycle identifier
            force: Force generation even if not at entanglement time (admin only)

        Returns:
            Dict containing:
                - target_number: "xxxx-xxxx" format
                - cycle_id: Cycle identifier
                - entanglement_timestamp: When target materialized
                - raw_quantum_values: List of raw uint16 values from QRNG
        """
        from database.models import RVTournamentTarget
        from services.quantum_oracle import quantum_oracle

        # Check if target already exists
        existing = db.query(RVTournamentTarget).filter(
            RVTournamentTarget.cycle_id == cycle_id
        ).first()

        if existing:
            return {
                "target_number": existing.target_number,
                "cycle_id": existing.cycle_id,
                "entanglement_timestamp": existing.entanglement_timestamp.isoformat(),
                "raw_quantum_values": self._parse_raw_quantum(existing.raw_quantum_values),
                "status": "already_exists",
                "message": "Target already materialized for this cycle."
            }

        # Verify we're at entanglement time (unless force=True)
        if not force:
            cycle = self.get_cycle_by_id(cycle_id)
            current_time = datetime.now(timezone.utc)

            # Allow generation within 5 minutes of entanglement time
            time_diff = abs((current_time - cycle.entanglement_time).total_seconds())
            if time_diff > 300:  # 5 minutes tolerance
                raise ValueError(
                    f"Not at entanglement time. Current: {current_time.isoformat()}, "
                    f"Entanglement: {cycle.entanglement_time.isoformat()}"
                )

        # QUANTUM COLLAPSE: Generate 8-digit number using ANU QRNG
        quantum_result = await quantum_oracle.generate_rv_target_number()

        # Format as xxxx-xxxx
        target_digits = quantum_result["target_number"]
        target_number = f"{target_digits[:4]}-{target_digits[4:]}"

        # Store in database
        tournament_target = RVTournamentTarget(
            cycle_id=cycle_id,
            target_number=target_number,
            raw_quantum_values=str(quantum_result["raw_quantum_values"]),
            source="ANU_QRNG",
            entanglement_timestamp=datetime.now(timezone.utc)
        )

        db.add(tournament_target)
        db.commit()
        db.refresh(tournament_target)

        logger.info(
            f"Tournament target materialized for cycle {cycle_id}: {target_number} "
            f"at {tournament_target.entanglement_timestamp.isoformat()}"
        )

        return {
            "target_number": target_number,
            "cycle_id": cycle_id,
            "entanglement_timestamp": tournament_target.entanglement_timestamp.isoformat(),
            "raw_quantum_values": quantum_result["raw_quantum_values"],
            "status": "materialized",
            "message": "Target number quantum-entangled successfully."
        }

    async def submit_prediction(
        self,
        db: Session,
        user_identifier: str,
        predicted_number: str,
        cycle_id: Optional[str] = None,
        confidence: Optional[float] = None,
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Submit a prediction for the current or specified cycle.

        Args:
            db: Database session
            user_identifier: User ID or identifier
            predicted_number: User's predicted 8-digit number (format: "xxxx-xxxx")
            cycle_id: Specific cycle (default: current cycle)
            confidence: Confidence level (0.0-1.0)
            notes: Optional prediction notes

        Returns:
            Dict with submission confirmation
        """
        from database.models import RVTournamentPrediction

        current_time = datetime.now(timezone.utc)

        # Get cycle
        if cycle_id:
            cycle = self.get_cycle_by_id(cycle_id)
        else:
            cycle = self.get_current_cycle(current_time)

        # Validate cycle phase
        phase = cycle.get_phase(current_time)
        if phase not in ["pre_entanglement", "post_entanglement"]:
            raise ValueError(
                f"Cannot submit prediction during phase '{phase}'. "
                f"Predictions only allowed before cycle reveal."
            )

        # Validate number format
        predicted_number = self._validate_target_number(predicted_number)

        # Check for duplicate prediction from same user
        existing = db.query(RVTournamentPrediction).filter(
            and_(
                RVTournamentPrediction.cycle_id == cycle.cycle_id,
                RVTournamentPrediction.user_identifier == user_identifier
            )
        ).first()

        if existing:
            raise ValueError(
                f"You already submitted a prediction for cycle {cycle.cycle_id}. "
                f"Predicted: {existing.predicted_number}"
            )

        # Record whether prediction was made before or after entanglement
        is_pre_entanglement = (phase == "pre_entanglement")

        # Create prediction record
        prediction = RVTournamentPrediction(
            cycle_id=cycle.cycle_id,
            user_identifier=user_identifier,
            predicted_number=predicted_number,
            confidence=confidence,
            notes=notes,
            submitted_at=current_time,
            is_pre_entanglement=is_pre_entanglement
        )

        db.add(prediction)
        db.commit()
        db.refresh(prediction)

        logger.info(
            f"Prediction submitted for cycle {cycle.cycle_id} by {user_identifier}: "
            f"{predicted_number} (pre-entanglement: {is_pre_entanglement})"
        )

        return {
            "prediction_id": prediction.id,
            "cycle_id": cycle.cycle_id,
            "predicted_number": predicted_number,
            "submitted_at": prediction.submitted_at.isoformat(),
            "is_pre_entanglement": is_pre_entanglement,
            "phase": phase,
            "status": "submitted",
            "message": (
                "Prediction recorded. Target will be revealed at cycle end." if is_pre_entanglement
                else "Prediction recorded. Target already exists but remains hidden until cycle end."
            )
        }

    def check_user_prediction(
        self,
        db: Session,
        user_identifier: str,
        cycle_id: str
    ) -> Dict[str, Any]:
        """
        Check a user's prediction against the actual target.

        Only available after cycle reveal.

        Args:
            db: Database session
            user_identifier: User ID or identifier
            cycle_id: Cycle identifier

        Returns:
            Dict containing:
                - predicted_number: User's prediction
                - actual_number: Actual target
                - is_correct: Boolean (exact match)
                - partial_score: 0-8 (number of correct digits)
                - score_breakdown: Per-digit accuracy
                - points_awarded: Tournament points
        """
        from database.models import RVTournamentPrediction, RVTournamentTarget

        # Verify cycle is revealed
        cycle = self.get_cycle_by_id(cycle_id)
        current_time = datetime.now(timezone.utc)
        phase = cycle.get_phase(current_time)

        if phase != "revealed":
            raise ValueError(
                f"Cannot check prediction until cycle is revealed. "
                f"Current phase: {phase}. Reveal time: {cycle.end_time.isoformat()}"
            )

        # Get user's prediction
        prediction = db.query(RVTournamentPrediction).filter(
            and_(
                RVTournamentPrediction.cycle_id == cycle_id,
                RVTournamentPrediction.user_identifier == user_identifier
            )
        ).first()

        if not prediction:
            raise ValueError(f"No prediction found for user {user_identifier} in cycle {cycle_id}")

        # Get actual target
        target = db.query(RVTournamentTarget).filter(
            RVTournamentTarget.cycle_id == cycle_id
        ).first()

        if not target:
            raise ValueError(f"No target found for cycle {cycle_id}")

        # Calculate accuracy
        predicted_digits = prediction.predicted_number.replace("-", "")
        actual_digits = target.target_number.replace("-", "")

        # Exact match
        is_correct = (predicted_digits == actual_digits)

        # Per-digit accuracy
        correct_digits = sum(
            1 for p, a in zip(predicted_digits, actual_digits) if p == a
        )

        # Score breakdown
        score_breakdown = [
            {
                "position": i,
                "predicted": p,
                "actual": a,
                "correct": p == a
            }
            for i, (p, a) in enumerate(zip(predicted_digits, actual_digits))
        ]

        # Calculate points
        # Base points: 10 per correct digit
        # Bonus: 100 points for exact match
        # Bonus: +50% if predicted before entanglement
        base_points = correct_digits * 10
        exact_match_bonus = 100 if is_correct else 0
        pre_entanglement_multiplier = 1.5 if prediction.is_pre_entanglement else 1.0

        total_points = int((base_points + exact_match_bonus) * pre_entanglement_multiplier)

        # Update prediction with results
        if not prediction.is_scored:
            prediction.is_correct = is_correct
            prediction.correct_digits = correct_digits
            prediction.points_awarded = total_points
            prediction.is_scored = True
            prediction.scored_at = datetime.now(timezone.utc)
            db.commit()

        logger.info(
            f"Prediction checked for {user_identifier} in cycle {cycle_id}: "
            f"{correct_digits}/8 digits correct, {total_points} points"
        )

        return {
            "prediction_id": prediction.id,
            "cycle_id": cycle_id,
            "predicted_number": prediction.predicted_number,
            "actual_number": target.target_number,
            "is_correct": is_correct,
            "correct_digits": correct_digits,
            "score_breakdown": score_breakdown,
            "points_awarded": total_points,
            "is_pre_entanglement": prediction.is_pre_entanglement,
            "submitted_at": prediction.submitted_at.isoformat(),
            "accuracy_percent": round((correct_digits / 8) * 100, 2)
        }

    def get_leaderboard(
        self,
        db: Session,
        time_period: str = "all_time",
        limit: int = 100
    ) -> Dict[str, Any]:
        """
        Get tournament leaderboard rankings.

        Args:
            db: Database session
            time_period: "all_time", "month", "week", "cycle"
            limit: Maximum number of users to return

        Returns:
            Dict containing:
                - period: Time period description
                - updated_at: Leaderboard timestamp
                - rankings: List of user rankings with stats
        """
        from database.models import RVTournamentPrediction
        from sqlalchemy import func

        # Determine time cutoff
        current_time = datetime.now(timezone.utc)

        if time_period == "cycle":
            # Current cycle only
            cycle = self.get_current_cycle(current_time)
            cutoff = cycle.start_time
            period_desc = f"Current Cycle ({cycle.cycle_id})"
        elif time_period == "week":
            cutoff = current_time - timedelta(days=7)
            period_desc = "Past 7 Days"
        elif time_period == "month":
            cutoff = current_time - timedelta(days=30)
            period_desc = "Past 30 Days"
        else:  # all_time
            cutoff = datetime.min.replace(tzinfo=timezone.utc)
            period_desc = "All Time"

        # Query predictions with scores
        query = db.query(
            RVTournamentPrediction.user_identifier,
            func.count(RVTournamentPrediction.id).label("total_predictions"),
            func.sum(RVTournamentPrediction.points_awarded).label("total_points"),
            func.avg(RVTournamentPrediction.correct_digits).label("avg_accuracy"),
            func.sum(
                func.cast(RVTournamentPrediction.is_correct, type_=db.bind.dialect.impl_integer_type)
            ).label("exact_matches")
        ).filter(
            and_(
                RVTournamentPrediction.is_scored == True,
                RVTournamentPrediction.submitted_at >= cutoff
            )
        ).group_by(
            RVTournamentPrediction.user_identifier
        ).order_by(
            desc("total_points")
        ).limit(limit)

        results = query.all()

        # Format rankings
        rankings = [
            {
                "rank": idx + 1,
                "user_identifier": r.user_identifier,
                "total_points": int(r.total_points or 0),
                "total_predictions": r.total_predictions,
                "exact_matches": int(r.exact_matches or 0),
                "average_accuracy": round((r.avg_accuracy or 0) / 8 * 100, 2),  # Convert to percentage
                "average_correct_digits": round(r.avg_accuracy or 0, 2)
            }
            for idx, r in enumerate(results)
        ]

        logger.info(f"Leaderboard generated for period '{time_period}': {len(rankings)} users")

        return {
            "period": period_desc,
            "time_period": time_period,
            "updated_at": current_time.isoformat(),
            "total_users": len(rankings),
            "rankings": rankings
        }

    def get_user_stats(
        self,
        db: Session,
        user_identifier: str
    ) -> Dict[str, Any]:
        """
        Get comprehensive statistics for a user.

        Args:
            db: Database session
            user_identifier: User ID or identifier

        Returns:
            Dict with user statistics
        """
        from database.models import RVTournamentPrediction
        from sqlalchemy import func

        # Get all predictions for user
        predictions = db.query(RVTournamentPrediction).filter(
            RVTournamentPrediction.user_identifier == user_identifier
        ).all()

        if not predictions:
            return {
                "user_identifier": user_identifier,
                "total_predictions": 0,
                "message": "No predictions found for this user."
            }

        # Calculate statistics
        total_predictions = len(predictions)
        scored_predictions = [p for p in predictions if p.is_scored]

        total_points = sum(p.points_awarded or 0 for p in scored_predictions)
        total_correct_digits = sum(p.correct_digits or 0 for p in scored_predictions)
        exact_matches = sum(1 for p in scored_predictions if p.is_correct)
        pre_entanglement_count = sum(1 for p in predictions if p.is_pre_entanglement)

        avg_accuracy = (
            (total_correct_digits / (len(scored_predictions) * 8) * 100)
            if scored_predictions else 0
        )

        # Recent performance (last 10 predictions)
        recent = scored_predictions[-10:] if len(scored_predictions) >= 10 else scored_predictions
        recent_accuracy = (
            sum(p.correct_digits or 0 for p in recent) / (len(recent) * 8) * 100
            if recent else 0
        )

        # Best performance
        best_prediction = max(scored_predictions, key=lambda p: p.correct_digits or 0) if scored_predictions else None

        logger.info(f"User stats retrieved for {user_identifier}: {total_points} points, {total_predictions} predictions")

        return {
            "user_identifier": user_identifier,
            "total_predictions": total_predictions,
            "scored_predictions": len(scored_predictions),
            "pending_predictions": total_predictions - len(scored_predictions),
            "total_points": total_points,
            "exact_matches": exact_matches,
            "average_accuracy_percent": round(avg_accuracy, 2),
            "recent_accuracy_percent": round(recent_accuracy, 2),
            "pre_entanglement_predictions": pre_entanglement_count,
            "best_performance": {
                "cycle_id": best_prediction.cycle_id,
                "correct_digits": best_prediction.correct_digits,
                "points": best_prediction.points_awarded,
                "predicted_number": best_prediction.predicted_number
            } if best_prediction else None
        }

    def get_cycle_results(
        self,
        db: Session,
        cycle_id: str
    ) -> Dict[str, Any]:
        """
        Get complete results for a specific cycle.

        Args:
            db: Database session
            cycle_id: Cycle identifier

        Returns:
            Dict with cycle results including target and all predictions
        """
        from database.models import RVTournamentPrediction, RVTournamentTarget

        # Verify cycle is revealed
        cycle = self.get_cycle_by_id(cycle_id)
        current_time = datetime.now(timezone.utc)
        phase = cycle.get_phase(current_time)

        if phase != "revealed":
            raise ValueError(
                f"Cycle results not available until reveal. "
                f"Current phase: {phase}. Reveal time: {cycle.end_time.isoformat()}"
            )

        # Get target
        target = db.query(RVTournamentTarget).filter(
            RVTournamentTarget.cycle_id == cycle_id
        ).first()

        if not target:
            raise ValueError(f"No target found for cycle {cycle_id}")

        # Get all predictions
        predictions = db.query(RVTournamentPrediction).filter(
            RVTournamentPrediction.cycle_id == cycle_id
        ).order_by(
            desc(RVTournamentPrediction.points_awarded)
        ).all()

        # Format prediction results
        prediction_results = [
            {
                "user_identifier": p.user_identifier,
                "predicted_number": p.predicted_number,
                "correct_digits": p.correct_digits or 0,
                "is_correct": p.is_correct or False,
                "points_awarded": p.points_awarded or 0,
                "is_pre_entanglement": p.is_pre_entanglement,
                "submitted_at": p.submitted_at.isoformat()
            }
            for p in predictions
        ]

        # Calculate statistics
        total_predictions = len(predictions)
        exact_matches = sum(1 for p in predictions if p.is_correct)
        avg_accuracy = (
            sum(p.correct_digits or 0 for p in predictions) / (total_predictions * 8) * 100
            if total_predictions > 0 else 0
        )

        logger.info(f"Cycle results retrieved for {cycle_id}: {total_predictions} predictions")

        return {
            "cycle_id": cycle_id,
            "target_number": target.target_number,
            "entanglement_timestamp": target.entanglement_timestamp.isoformat(),
            "start_time": cycle.start_time.isoformat(),
            "end_time": cycle.end_time.isoformat(),
            "total_predictions": total_predictions,
            "exact_matches": exact_matches,
            "average_accuracy_percent": round(avg_accuracy, 2),
            "predictions": prediction_results
        }

    def _get_tournament_target(self, db: Session, cycle_id: str) -> Optional[Dict[str, Any]]:
        """
        Internal method to get tournament target from database.

        Args:
            db: Database session
            cycle_id: Cycle identifier

        Returns:
            Dict with target data or None
        """
        from database.models import RVTournamentTarget

        target = db.query(RVTournamentTarget).filter(
            RVTournamentTarget.cycle_id == cycle_id
        ).first()

        if not target:
            return None

        return {
            "target_number": target.target_number,
            "cycle_id": target.cycle_id,
            "entanglement_timestamp": target.entanglement_timestamp.isoformat(),
            "raw_quantum_values": self._parse_raw_quantum(target.raw_quantum_values)
        }

    def _count_cycle_predictions(self, db: Session, cycle_id: str) -> int:
        """
        Count predictions for a specific cycle.

        Args:
            db: Database session
            cycle_id: Cycle identifier

        Returns:
            Number of predictions
        """
        from database.models import RVTournamentPrediction

        count = db.query(RVTournamentPrediction).filter(
            RVTournamentPrediction.cycle_id == cycle_id
        ).count()

        return count

    def _validate_target_number(self, number: str) -> str:
        """
        Validate and format target number.

        Args:
            number: User input number

        Returns:
            Formatted number (xxxx-xxxx)

        Raises:
            ValueError: If number is invalid
        """
        # Remove any whitespace
        number = number.strip()

        # Remove hyphen if present
        clean_number = number.replace("-", "")

        # Validate: must be exactly 8 digits
        if len(clean_number) != 8:
            raise ValueError(f"Target number must be 8 digits. Got: {len(clean_number)}")

        if not clean_number.isdigit():
            raise ValueError("Target number must contain only digits (0-9)")

        # Format as xxxx-xxxx
        formatted = f"{clean_number[:4]}-{clean_number[4:]}"

        return formatted

    def _parse_raw_quantum(self, raw_values_str: str) -> List[int]:
        """
        Parse raw quantum values from string storage.

        Args:
            raw_values_str: String representation of list

        Returns:
            List of integers
        """
        try:
            return eval(raw_values_str)
        except:
            return []


# Singleton instance
rv_tournament = RVTournamentService()
