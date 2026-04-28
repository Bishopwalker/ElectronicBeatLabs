"""
RV Tournament Service - Usage Examples

This file demonstrates how to use the Remote Viewing Tournament service
for implementing the 12-hour cycle system with quantum target generation.

Tournament Flow:
1. User checks current cycle status
2. User submits prediction (before or after entanglement)
3. At 3:33 mark, target is quantum-generated (automatic)
4. At 12-hour mark, cycle ends and target is revealed
5. User checks their prediction accuracy
6. Leaderboard updates with user's score
"""

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from services.rv_tournament import rv_tournament


# ============================================================================
# EXAMPLE 1: Check Current Cycle Status
# ============================================================================

async def check_current_cycle(db: Session):
    """
    Check the status of the current tournament cycle.

    Returns information about:
    - Current phase (pre_entanglement, post_entanglement, revealed)
    - Countdown to entanglement or reveal
    - Whether predictions can be submitted
    """
    status = rv_tournament.get_cycle_status(db)

    print("=== Current Cycle Status ===")
    print(f"Cycle ID: {status['cycle_id']}")
    print(f"Phase: {status['phase']}")
    print(f"Start Time: {status['start_time']}")
    print(f"Entanglement Time: {status['entanglement_time']}")
    print(f"End Time: {status['end_time']}")

    if "seconds_until_entanglement" in status:
        print(f"Time Until Entanglement: {status['countdown_to_entanglement']}")
    elif "seconds_until_reveal" in status:
        print(f"Time Until Reveal: {status['countdown_to_reveal']}")

    print(f"Can Submit Prediction: {status.get('can_submit_prediction', False)}")
    print(f"Total Predictions: {status['total_predictions']}")
    print(f"Message: {status['message']}")

    return status


# ============================================================================
# EXAMPLE 2: Submit a Prediction
# ============================================================================

async def submit_user_prediction(
    db: Session,
    user_id: str,
    predicted_number: str,
    confidence: float = 0.7,
    notes: str = None
):
    """
    Submit a prediction for the current cycle.

    Args:
        db: Database session
        user_id: User identifier
        predicted_number: 8-digit prediction (format: "xxxx-xxxx" or "xxxxxxxx")
        confidence: Confidence level (0.0-1.0)
        notes: Optional prediction notes

    Returns:
        Prediction confirmation with submission details
    """
    try:
        result = await rv_tournament.submit_prediction(
            db=db,
            user_identifier=user_id,
            predicted_number=predicted_number,
            confidence=confidence,
            notes=notes
        )

        print("=== Prediction Submitted ===")
        print(f"Prediction ID: {result['prediction_id']}")
        print(f"Cycle ID: {result['cycle_id']}")
        print(f"Predicted Number: {result['predicted_number']}")
        print(f"Submitted At: {result['submitted_at']}")
        print(f"Pre-Entanglement: {result['is_pre_entanglement']}")
        print(f"Phase: {result['phase']}")
        print(f"Status: {result['status']}")
        print(f"Message: {result['message']}")

        return result

    except ValueError as e:
        print(f"Error: {e}")
        return None


# ============================================================================
# EXAMPLE 3: Generate Tournament Target (Automated at 3:33)
# ============================================================================

async def generate_target_at_entanglement(db: Session, cycle_id: str):
    """
    Generate the quantum target for a cycle at entanglement time.

    This should be called automatically at the 3:33 mark of each cycle.
    In production, this would be triggered by a scheduled job/cron task.

    Args:
        db: Database session
        cycle_id: Cycle identifier (e.g., "2024-01-15_00")

    Returns:
        Target generation result
    """
    try:
        result = await rv_tournament.generate_tournament_target(
            db=db,
            cycle_id=cycle_id,
            force=False  # Set to True for testing/admin purposes only
        )

        print("=== Quantum Target Generated ===")
        print(f"Target Number: {result['target_number']}")
        print(f"Cycle ID: {result['cycle_id']}")
        print(f"Entanglement Timestamp: {result['entanglement_timestamp']}")
        print(f"Status: {result['status']}")
        print(f"Message: {result['message']}")

        # Raw quantum values (for verification/transparency)
        print(f"Raw Quantum Values: {result['raw_quantum_values']}")

        return result

    except ValueError as e:
        print(f"Error: {e}")
        return None


# ============================================================================
# EXAMPLE 4: Check User's Prediction (After Reveal)
# ============================================================================

def check_prediction_result(db: Session, user_id: str, cycle_id: str):
    """
    Check a user's prediction against the actual target.

    Only available after the cycle has ended (revealed phase).

    Args:
        db: Database session
        user_id: User identifier
        cycle_id: Cycle identifier

    Returns:
        Prediction accuracy results with scoring
    """
    try:
        result = rv_tournament.check_user_prediction(
            db=db,
            user_identifier=user_id,
            cycle_id=cycle_id
        )

        print("=== Prediction Results ===")
        print(f"Cycle ID: {result['cycle_id']}")
        print(f"Your Prediction: {result['predicted_number']}")
        print(f"Actual Target: {result['actual_number']}")
        print(f"Exact Match: {result['is_correct']}")
        print(f"Correct Digits: {result['correct_digits']}/8")
        print(f"Accuracy: {result['accuracy_percent']}%")
        print(f"Points Awarded: {result['points_awarded']}")
        print(f"Pre-Entanglement Bonus: {result['is_pre_entanglement']}")

        print("\nPer-Digit Breakdown:")
        for digit_result in result['score_breakdown']:
            status = "✓" if digit_result['correct'] else "✗"
            print(f"  Position {digit_result['position']}: "
                  f"Predicted {digit_result['predicted']}, "
                  f"Actual {digit_result['actual']} {status}")

        return result

    except ValueError as e:
        print(f"Error: {e}")
        return None


# ============================================================================
# EXAMPLE 5: View Tournament Leaderboard
# ============================================================================

def view_leaderboard(db: Session, time_period: str = "all_time", limit: int = 10):
    """
    View the tournament leaderboard.

    Args:
        db: Database session
        time_period: "all_time", "month", "week", or "cycle"
        limit: Number of top users to display

    Returns:
        Leaderboard with rankings
    """
    result = rv_tournament.get_leaderboard(
        db=db,
        time_period=time_period,
        limit=limit
    )

    print(f"=== Leaderboard: {result['period']} ===")
    print(f"Updated: {result['updated_at']}")
    print(f"Total Users: {result['total_users']}\n")

    for ranking in result['rankings']:
        print(f"#{ranking['rank']} - {ranking['user_identifier']}")
        print(f"   Points: {ranking['total_points']}")
        print(f"   Predictions: {ranking['total_predictions']}")
        print(f"   Exact Matches: {ranking['exact_matches']}")
        print(f"   Avg Accuracy: {ranking['average_accuracy']}%")
        print(f"   Avg Correct Digits: {ranking['average_correct_digits']}/8\n")

    return result


# ============================================================================
# EXAMPLE 6: View User Statistics
# ============================================================================

def view_user_stats(db: Session, user_id: str):
    """
    View comprehensive statistics for a user.

    Args:
        db: Database session
        user_id: User identifier

    Returns:
        User statistics
    """
    result = rv_tournament.get_user_stats(db=db, user_identifier=user_id)

    if result['total_predictions'] == 0:
        print(f"No predictions found for user: {user_id}")
        return result

    print(f"=== User Statistics: {user_id} ===")
    print(f"Total Predictions: {result['total_predictions']}")
    print(f"Scored Predictions: {result['scored_predictions']}")
    print(f"Pending Predictions: {result['pending_predictions']}")
    print(f"Total Points: {result['total_points']}")
    print(f"Exact Matches: {result['exact_matches']}")
    print(f"Average Accuracy: {result['average_accuracy_percent']}%")
    print(f"Recent Accuracy (Last 10): {result['recent_accuracy_percent']}%")
    print(f"Pre-Entanglement Predictions: {result['pre_entanglement_predictions']}")

    if result['best_performance']:
        print("\nBest Performance:")
        print(f"  Cycle: {result['best_performance']['cycle_id']}")
        print(f"  Correct Digits: {result['best_performance']['correct_digits']}/8")
        print(f"  Points: {result['best_performance']['points']}")
        print(f"  Prediction: {result['best_performance']['predicted_number']}")

    return result


# ============================================================================
# EXAMPLE 7: View Complete Cycle Results
# ============================================================================

def view_cycle_results(db: Session, cycle_id: str):
    """
    View complete results for a finished cycle.

    Shows the target number and all user predictions with scores.

    Args:
        db: Database session
        cycle_id: Cycle identifier (e.g., "2024-01-15_00")

    Returns:
        Complete cycle results
    """
    try:
        result = rv_tournament.get_cycle_results(db=db, cycle_id=cycle_id)

        print(f"=== Cycle Results: {result['cycle_id']} ===")
        print(f"Target Number: {result['target_number']}")
        print(f"Entanglement Time: {result['entanglement_timestamp']}")
        print(f"Start Time: {result['start_time']}")
        print(f"End Time: {result['end_time']}")
        print(f"Total Predictions: {result['total_predictions']}")
        print(f"Exact Matches: {result['exact_matches']}")
        print(f"Average Accuracy: {result['average_accuracy_percent']}%\n")

        print("User Predictions:")
        for idx, pred in enumerate(result['predictions'], 1):
            print(f"\n#{idx} - {pred['user_identifier']}")
            print(f"   Predicted: {pred['predicted_number']}")
            print(f"   Correct Digits: {pred['correct_digits']}/8")
            print(f"   Exact Match: {pred['is_correct']}")
            print(f"   Points: {pred['points_awarded']}")
            print(f"   Pre-Entanglement: {pred['is_pre_entanglement']}")
            print(f"   Submitted: {pred['submitted_at']}")

        return result

    except ValueError as e:
        print(f"Error: {e}")
        return None


# ============================================================================
# EXAMPLE 8: Complete Tournament Flow
# ============================================================================

async def complete_tournament_example(db: Session, user_id: str):
    """
    Demonstrate complete tournament flow from start to finish.

    This example shows:
    1. Checking cycle status
    2. Submitting a prediction
    3. Waiting for cycle to complete
    4. Checking results
    5. Viewing leaderboard
    """
    print("=" * 60)
    print("COMPLETE TOURNAMENT FLOW EXAMPLE")
    print("=" * 60)

    # Step 1: Check current cycle
    print("\nStep 1: Check Current Cycle Status")
    print("-" * 60)
    cycle_status = await check_current_cycle(db)

    # Step 2: Submit prediction (if allowed)
    if cycle_status.get('can_submit_prediction'):
        print("\nStep 2: Submit Prediction")
        print("-" * 60)
        prediction = await submit_user_prediction(
            db=db,
            user_id=user_id,
            predicted_number="4729-8153",
            confidence=0.85,
            notes="Strong visual impression of these digits"
        )
    else:
        print("\nStep 2: Cannot submit prediction (cycle complete or not started)")
        print("-" * 60)

    # Step 3: Check if we're at entanglement time (normally automated)
    print("\nStep 3: Target Generation (Automated at 3:33)")
    print("-" * 60)
    print("In production, this runs automatically at 3:33 via scheduled job")

    # Step 4: After reveal, check results
    print("\nStep 4: Check Prediction Results (After Reveal)")
    print("-" * 60)
    # This would only work if cycle is in "revealed" phase
    # check_prediction_result(db, user_id, cycle_status['cycle_id'])

    # Step 5: View user stats
    print("\nStep 5: View User Statistics")
    print("-" * 60)
    view_user_stats(db, user_id)

    # Step 6: View leaderboard
    print("\nStep 6: View Tournament Leaderboard")
    print("-" * 60)
    view_leaderboard(db, time_period="week", limit=5)

    print("\n" + "=" * 60)
    print("TOURNAMENT FLOW COMPLETE")
    print("=" * 60)


# ============================================================================
# Scheduled Job Example (For Automatic Target Generation)
# ============================================================================

async def scheduled_target_generation_job(db: Session):
    """
    Scheduled job that runs every minute to check if target generation is needed.

    This should be set up as a cron job or background task that runs:
    - At 03:33 UTC daily (for midnight cycle)
    - At 15:33 UTC daily (for noon cycle)

    Example cron schedule:
    - 33 3,15 * * * python -m backend.jobs.generate_tournament_targets
    """
    from datetime import datetime, timezone

    current_time = datetime.now(timezone.utc)

    # Check if we're at entanglement time (3:33 or 15:33)
    if current_time.hour in [3, 15] and current_time.minute == 33:
        # Determine which cycle to generate for
        if current_time.hour == 3:
            # Generate for midnight cycle (00:00-12:00)
            cycle_id = f"{current_time.date().isoformat()}_00"
        else:
            # Generate for noon cycle (12:00-00:00)
            cycle_id = f"{current_time.date().isoformat()}_12"

        print(f"Generating tournament target for cycle: {cycle_id}")

        try:
            result = await rv_tournament.generate_tournament_target(
                db=db,
                cycle_id=cycle_id,
                force=False
            )

            print(f"Target generated successfully: {result['target_number']}")
            return result

        except Exception as e:
            print(f"Error generating tournament target: {e}")
            return None
    else:
        print(f"Not at entanglement time. Current: {current_time.hour}:{current_time.minute:02d} UTC")
        return None
