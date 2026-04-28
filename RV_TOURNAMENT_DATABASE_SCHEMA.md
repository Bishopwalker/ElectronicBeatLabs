# RV Tournament Database Schema - Complete Design

## Overview
This document provides the complete database schema for the Remote Viewing (RV) tournament and practice system. The schema supports 12-hour tournament cycles with quantum entanglement timing, user predictions, scoring, and leaderboards.

## Schema Architecture

### Core Tables

#### 1. `rv_tournament_cycles`
**Purpose**: Manages 12-hour tournament cycles with quantum entanglement timing

**Key Features**:
- Twice-daily cycles (00:00 UTC and 12:00 UTC start times)
- Entanglement time at 3h33m (3:33) after cycle start
- Reveal time at 12 hours after start
- Target format: xxxx-xxxx coordinate
- Status tracking: pending → active → entangled → revealed → completed

**Columns**:
```python
id: String (UUID, primary key)
cycle_number: Integer (unique, sequential cycle number)
cycle_id: String (unique, format: "2024-01-15_00" or "2024-01-15_12")

# Timing (UTC)
start_time: DateTime (cycle start: 00:00 or 12:00 UTC)
entanglement_time: DateTime (start_time + 3h33m)
reveal_time: DateTime (start_time + 12h)

# Target information (hidden until reveal_time)
target_number: String (unique, "xxxx-xxxx" format)
target_name: String (name of the target)
target_description: Text (detailed description)
target_category: String ("location", "object", "event", etc.)
target_data: Text (JSON: entangled data, feedback URL, metadata)
feedback_url: String (image/info URL for feedback)

# Quantum entanglement
entanglement_source: String (default: "ANU_QRNG")
raw_quantum_values: Text (JSON array of raw quantum values)

# Status and statistics
status: String (indexed, default: "pending")
total_predictions: Integer (default: 0)
average_score: Float
winner_user_id: String (ForeignKey to users.id)

# Timestamps
created_at: DateTime
revealed_at: DateTime
completed_at: DateTime
```

**Relationships**:
- `predictions`: One-to-many → `rv_user_predictions`
- `winner`: Many-to-one → `users`

**Indexes**:
- `cycle_number` (unique)
- `cycle_id` (unique)
- `start_time`
- `entanglement_time`
- `reveal_time`
- `target_number` (unique)
- `status`

---

#### 2. `rv_user_predictions`
**Purpose**: Unified prediction tracking for both tournament and practice modes

**Key Features**:
- Supports tournament and practice modes
- Tracks pre-entanglement submissions (bonus points)
- Comprehensive scoring breakdown
- Audio protocol tracking
- Status lifecycle: submitted → pending_score → scored

**Columns**:
```python
id: String (UUID, primary key)

# User tracking
user_id: String (ForeignKey to users.id, nullable for anonymous)
user_identifier: String (IP or session ID)

# Target references (one will be null)
tournament_cycle_id: String (ForeignKey to rv_tournament_cycles.id)
practice_target_id: String (ForeignKey to rv_practice_targets.id)

# Mode
mode: String (indexed, "tournament" or "practice")

# Prediction data
predicted_target: Text (user's description)
predicted_category: String
predicted_tags: String (comma-separated)

# Metadata
confidence: Float (0.0-1.0, default: 0.5)
session_notes: Text
audio_protocol_used: String

# Audio session details
base_frequency: Float
beat_frequency: Float
session_duration_minutes: Float

# Timing
submitted_at: DateTime (indexed)
is_pre_entanglement: Boolean (default: False)

# Scoring
was_correct: Boolean
score: Float (0-100)
points_awarded: Integer (default: 0)
correct_digits: Integer (for number predictions, 0-8)
scoring_details: Text (JSON breakdown)

# Status
status: String (indexed, default: "submitted")
scored_at: DateTime
```

**Relationships**:
- `user`: Many-to-one → `users`
- `tournament_cycle`: Many-to-one → `rv_tournament_cycles`
- `practice_target`: Many-to-one → `rv_practice_targets`

**Indexes**:
- `user_id`
- `user_identifier`
- `tournament_cycle_id`
- `practice_target_id`
- `mode`
- `submitted_at`
- `status`

---

#### 3. `rv_practice_targets` (Updated)
**Purpose**: On-demand practice targets

**Added Columns**:
```python
user_id: String (ForeignKey to users.id)
```

**New Relationships**:
- `user`: Many-to-one → `users`
- `predictions`: One-to-many → `rv_user_predictions`

---

#### 4. `rv_leaderboard`
**Purpose**: Aggregate user performance rankings

**Key Features**:
- Multiple leaderboard types: all_time, monthly, weekly, daily
- Real-time rank updates
- Streak tracking
- Tournament wins tracking

**Columns**:
```python
id: String (UUID, primary key)

# User reference
user_id: String (ForeignKey to users.id)

# Leaderboard type
leaderboard_type: String (indexed, "all_time", "monthly", "weekly", "daily")
period_identifier: String (indexed, "2024-01", "2024-W03", "2024-01-15")

# Ranking metrics
rank: Integer (indexed)
total_points: Integer (default: 0)
prediction_count: Integer (default: 0)
average_score: Float

# Performance stats
accuracy_percentage: Float
best_score: Float
current_streak: Integer (default: 0)
total_tournament_wins: Integer (default: 0)

# Timestamps
last_prediction_at: DateTime
updated_at: DateTime (auto-update)
```

**Relationships**:
- `user`: Many-to-one → `users`

**Indexes**:
- `user_id`
- `leaderboard_type`
- `period_identifier`
- `rank`

---

## Database Relationships Diagram

```
┌─────────────────────────┐
│       users             │
└──────────┬──────────────┘
           │
           ├─────────────────────────────────┐
           │                                 │
           │                                 │
┌──────────▼──────────────┐       ┌─────────▼────────────────┐
│ rv_tournament_cycles    │       │  rv_practice_targets     │
│                         │       │                          │
│ - cycle_id              │       │ - coordinate             │
│ - target_number         │       │ - target_name            │
│ - entanglement_time     │       │ - target_description     │
│ - reveal_time           │       │                          │
│ - status                │       └─────────┬────────────────┘
└──────────┬──────────────┘                 │
           │                                 │
           │                                 │
           └────────────┬────────────────────┘
                        │
                        │
           ┌────────────▼──────────────┐
           │  rv_user_predictions      │
           │                           │
           │ - predicted_target        │
           │ - score                   │
           │ - points_awarded          │
           │ - is_pre_entanglement     │
           │ - status                  │
           └───────────────────────────┘
                        │
                        │
           ┌────────────▼──────────────┐
           │   rv_leaderboard          │
           │                           │
           │ - rank                    │
           │ - total_points            │
           │ - accuracy_percentage     │
           │ - current_streak          │
           └───────────────────────────┘
```

---

## Tournament Cycle Lifecycle

### 1. Cycle Creation (PENDING)
```python
cycle = RVTournamentCycle(
    cycle_number=1,
    cycle_id="2024-01-15_00",
    start_time=datetime(2024, 1, 15, 0, 0, 0, tzinfo=timezone.utc),
    entanglement_time=datetime(2024, 1, 15, 3, 33, 0, tzinfo=timezone.utc),
    reveal_time=datetime(2024, 1, 15, 12, 0, 0, tzinfo=timezone.utc),
    status="pending"
)
```

### 2. Cycle Activation (ACTIVE)
- Status changes to "active" at `start_time`
- Users can now submit predictions
- Target information remains hidden

### 3. Quantum Entanglement (ENTANGLED)
- Status changes to "entangled" at `entanglement_time` (3:33)
- Quantum state collapses
- Target number materializes
- Predictions still accepted but no longer pre-entanglement bonus

### 4. Cycle Reveal (REVEALED)
- Status changes to "revealed" at `reveal_time` (12h)
- Target information becomes visible
- Scoring begins for all predictions
- `revealed_at` timestamp recorded

### 5. Cycle Completion (COMPLETED)
- All predictions scored
- Leaderboard updated
- Winner determined
- `completed_at` timestamp recorded

---

## Prediction Scoring Algorithm

### Components

1. **Text Similarity (40 points)**
   - NLP/embedding similarity between predicted_target and actual target_description
   - Uses sentence transformers or similar NLP models
   - Score range: 0-40

2. **Category Match (20 points)**
   - Exact category match: 20 points
   - Related category: 10 points
   - No match: 0 points

3. **Tag Overlap (15 points)**
   - Jaccard similarity between predicted_tags and actual tags
   - Score range: 0-15

4. **Confidence Calibration (10 points)**
   - Rewards accurate confidence ratings
   - Penalizes over/under-confidence
   - Score range: -10 to +10

5. **Time Bonus (15 points)**
   - Pre-entanglement submission: +15 points
   - Post-entanglement, early submission: +5 to +10 points (scaled)
   - Late submission: 0 points

### Total Score Calculation
```python
total_score = (
    text_similarity_score +      # 0-40
    category_match_score +       # 0-20
    tag_overlap_score +          # 0-15
    confidence_calibration +     # -10 to +10
    time_bonus                   # 0-15
)
# Range: -10 to 100
# Clamp to 0-100
total_score = max(0, min(100, total_score))
```

### Points Award System
```python
if score >= 80:
    points_awarded = 100
    was_correct = True
elif score >= 60:
    points_awarded = 50
    was_correct = True
elif score >= 40:
    points_awarded = 25
    was_correct = False
else:
    points_awarded = 0
    was_correct = False

# Apply multipliers
if is_pre_entanglement:
    points_awarded *= 1.5  # 50% bonus for pre-entanglement
```

---

## Leaderboard Calculation

### Update Triggers
1. Real-time: After each prediction is scored
2. Daily batch: Midnight UTC rollup
3. Weekly batch: Sunday midnight UTC
4. Monthly batch: 1st of month midnight UTC

### Ranking Algorithm
```python
# Primary sort: total_points (descending)
# Tiebreaker 1: average_score (descending)
# Tiebreaker 2: prediction_count (ascending - quality over quantity)
# Tiebreaker 3: last_prediction_at (descending - recent activity)
```

### Leaderboard Types

#### All-Time
```python
leaderboard_type = "all_time"
period_identifier = None
# Includes all predictions ever made
```

#### Monthly
```python
leaderboard_type = "monthly"
period_identifier = "2024-01"
# Includes predictions from January 2024
```

#### Weekly
```python
leaderboard_type = "weekly"
period_identifier = "2024-W03"
# Includes predictions from week 3 of 2024 (ISO week)
```

#### Daily
```python
leaderboard_type = "daily"
period_identifier = "2024-01-15"
# Includes predictions from January 15, 2024
```

---

## Query Examples

### Get Current Active Cycle
```python
from sqlalchemy import and_
from datetime import datetime, timezone

now = datetime.now(timezone.utc)
current_cycle = session.query(RVTournamentCycle).filter(
    and_(
        RVTournamentCycle.start_time <= now,
        RVTournamentCycle.reveal_time > now,
        RVTournamentCycle.status.in_(["active", "entangled"])
    )
).first()
```

### Submit Prediction
```python
from datetime import datetime, timezone

# Check if before entanglement
is_pre_entanglement = datetime.now(timezone.utc) < cycle.entanglement_time

prediction = RVUserPrediction(
    user_id=user.id,
    tournament_cycle_id=cycle.id,
    mode="tournament",
    predicted_target="A large building with reflective windows...",
    predicted_category="location",
    predicted_tags="urban,modern,tall",
    confidence=0.75,
    audio_protocol_used="theta",
    is_pre_entanglement=is_pre_entanglement,
    status="submitted"
)
session.add(prediction)
session.commit()
```

### Score Predictions for Revealed Cycle
```python
from sqlalchemy import and_

# Get all unscored predictions for revealed cycle
predictions = session.query(RVUserPrediction).filter(
    and_(
        RVUserPrediction.tournament_cycle_id == cycle.id,
        RVUserPrediction.status == "pending_score"
    )
).all()

for prediction in predictions:
    # Calculate score (using scoring algorithm)
    score = calculate_score(prediction, cycle)

    # Update prediction
    prediction.score = score
    prediction.points_awarded = calculate_points(score, prediction.is_pre_entanglement)
    prediction.was_correct = score >= 60
    prediction.status = "scored"
    prediction.scored_at = datetime.now(timezone.utc)

session.commit()
```

### Get Top 10 Leaderboard (All-Time)
```python
leaderboard = session.query(RVLeaderboard).filter(
    RVLeaderboard.leaderboard_type == "all_time"
).order_by(
    RVLeaderboard.rank.asc()
).limit(10).all()

for entry in leaderboard:
    print(f"{entry.rank}. {entry.user.name} - {entry.total_points} points")
```

### Get User Statistics
```python
user_predictions = session.query(RVUserPrediction).filter(
    and_(
        RVUserPrediction.user_id == user.id,
        RVUserPrediction.status == "scored"
    )
).all()

total = len(user_predictions)
correct = sum(1 for p in user_predictions if p.was_correct)
avg_score = sum(p.score for p in user_predictions) / total if total > 0 else 0
accuracy = (correct / total * 100) if total > 0 else 0

print(f"Total: {total}, Accuracy: {accuracy:.1f}%, Avg Score: {avg_score:.1f}")
```

---

## Migration Strategy

### Step 1: Backup Existing Data
```bash
# Export existing RV data
python backend/scripts/export_rv_data.py --output rv_backup.json
```

### Step 2: Add New Models
```python
# In models.py, add new models:
# - RVTournamentCycle
# - RVUserPrediction
# - RVLeaderboard
# Update RVPracticeTarget with new relationships
```

### Step 3: Create Database Migration
```bash
# Using Alembic
alembic revision --autogenerate -m "Add RV tournament system"
alembic upgrade head
```

### Step 4: Migrate Legacy Data (if any)
```python
# backend/scripts/migrate_tournament_data.py
# Convert old RVTournamentTarget/RVTournamentPrediction to new schema
```

### Step 5: Verify Schema
```bash
# Run schema verification
python backend/scripts/verify_rv_schema.py
```

---

## Performance Optimization

### Recommended Indexes
All indexes are already defined in the models above. Additional composite indexes for common queries:

```python
# Composite index for active cycles lookup
Index('idx_cycle_active',
      RVTournamentCycle.start_time,
      RVTournamentCycle.reveal_time,
      RVTournamentCycle.status)

# Composite index for user prediction history
Index('idx_user_predictions',
      RVUserPrediction.user_id,
      RVUserPrediction.mode,
      RVUserPrediction.status)

# Composite index for leaderboard queries
Index('idx_leaderboard_ranking',
      RVLeaderboard.leaderboard_type,
      RVLeaderboard.period_identifier,
      RVLeaderboard.rank)
```

### Query Optimization Tips
1. **Use pagination** for leaderboard queries (LIMIT/OFFSET)
2. **Cache current cycle** to avoid repeated lookups
3. **Batch score calculations** for revealed cycles
4. **Use eager loading** for relationships (joinedload/selectinload)
5. **Partition large tables** by period_identifier for historical data

---

## Data Retention Policy

### Active Data (< 1 month)
- Keep all predictions and cycles
- Real-time leaderboard updates

### Historical Data (1-12 months)
- Archive completed cycles
- Maintain leaderboard snapshots
- Compress prediction details

### Old Data (> 12 months)
- Aggregate statistics only
- Delete individual predictions
- Keep tournament winners

---

## Security Considerations

### Access Control
1. **Target data** must be hidden until reveal_time
2. **Quantum values** should not be exposed via API
3. **User predictions** should only be visible to owner until reveal
4. **Leaderboard** is public but user details require permission

### Data Validation
1. **Cycle times** must be validated (start < entanglement < reveal)
2. **Predictions** can only be submitted before reveal_time
3. **Scoring** can only occur after reveal_time
4. **Status transitions** must follow lifecycle rules

### Rate Limiting
1. **Prediction submissions**: Max 1 per cycle per user
2. **Leaderboard queries**: Max 60 requests/minute
3. **Target generation**: Max 10/hour for practice mode

---

## Testing Requirements

### Unit Tests
- Model creation and validation
- Relationship integrity
- Status lifecycle transitions
- Scoring algorithm accuracy

### Integration Tests
- Full cycle lifecycle (pending → completed)
- Prediction submission and scoring
- Leaderboard calculation and updates
- Concurrent prediction handling

### Performance Tests
- 10,000+ predictions per cycle
- Leaderboard calculation with 1,000+ users
- Real-time scoring performance

---

## Complete Code

The complete implementation is available in:
- **Models**: `backend/database/models_tournament_complete.py`
- **This file replaces the tournament section** (from line 674) in `backend/database/models.py`

### Integration Steps

1. Replace the existing tournament models in `models.py` (lines 674+) with content from `models_tournament_complete.py`
2. Update `RVPracticeTarget` to include the new `user_id` and `predictions` relationship
3. Run database migrations
4. Test all relationships and queries

---

## Summary

This schema provides a comprehensive, production-ready database design for the RV tournament system with:

✅ **12-hour tournament cycles** with quantum entanglement timing
✅ **Unified prediction model** supporting tournament and practice modes
✅ **Comprehensive scoring** with multiple components and time bonuses
✅ **Multi-tier leaderboards** (all-time, monthly, weekly, daily)
✅ **Proper relationships** between users, cycles, predictions, and leaderboards
✅ **Performance optimizations** with strategic indexes
✅ **Data integrity** with constraints and validation
✅ **Scalability** for high-volume predictions and real-time scoring

The schema is ready for implementation and testing!
