# Remote Viewing Tournament Service

**Complete implementation of 12-hour tournament cycles with quantum entanglement timing**

---

## Overview

The RV Tournament Service implements a competitive remote viewing platform where users predict quantum-generated 8-digit numbers. The system runs on 12-hour cycles with a unique "entanglement" mechanism at the 3:33 mark.

### Key Concepts

1. **12-Hour Cycles**: Tournaments run twice daily (00:00-12:00 UTC and 12:00-00:00 UTC)
2. **Quantum Entanglement**: Target number materializes at exactly 3 hours 33 minutes into each cycle
3. **Target Format**: 8-digit quantum number (format: `xxxx-xxxx`, e.g., `4729-8153`)
4. **Quantum Source**: Uses ANU QRNG (Australian National University Quantum Random Number Generator)
5. **True Precognition**: Numbers don't exist until entanglement moment, enabling true future perception

---

## Timeline Example

### Cycle 1 (Midnight Cycle)

```
00:00 UTC - Cycle starts
          ├─ Predictions can be submitted
          ├─ Phase: "pre_entanglement"
          ├─ Bonus points for pre-entanglement predictions
          │
03:33 UTC - ENTANGLEMENT (Target materializes)
          ├─ Quantum number generated from ANU QRNG
          ├─ Target exists but remains hidden
          ├─ Phase: "post_entanglement"
          ├─ Predictions still accepted (no bonus)
          │
12:00 UTC - REVEAL (Cycle ends)
          ├─ Target number revealed
          ├─ All predictions scored
          ├─ Phase: "revealed"
          └─ Leaderboard updated
```

### Cycle 2 (Noon Cycle)

```
12:00 UTC - Cycle starts
15:33 UTC - ENTANGLEMENT
00:00 UTC - REVEAL (next day)
```

---

## Architecture

### File Structure

```
backend/
├── services/
│   ├── rv_tournament.py          # Main service implementation
│   ├── rv_tournament_example.py  # Usage examples
│   ├── quantum_oracle.py          # Quantum random number generation
│   └── rv_targets.py              # Target pool management
├── database/
│   └── models.py                  # Database models
│       ├── RVTournamentTarget     # Cycle targets
│       ├── RVTournamentPrediction # User predictions
│       └── RVTournamentCycle      # Cycle metadata
└── tests/
    └── test_rv_tournament.py      # Unit tests
```

### Core Classes

#### `TournamentCycle`
Represents a single 12-hour cycle with timing calculations.

**Attributes:**
- `start_time` - Cycle start (00:00 or 12:00 UTC)
- `entanglement_time` - Target materialization (start + 3:33)
- `end_time` - Cycle completion (start + 12:00)
- `cycle_id` - Unique identifier (format: `"YYYY-MM-DD_HH"`)

**Methods:**
- `get_phase(current_time)` - Returns phase: `"pre_entanglement"`, `"post_entanglement"`, `"revealed"`, or `"future"`
- `time_until_entanglement()` - Countdown to target materialization
- `time_until_reveal()` - Countdown to results reveal

#### `RVTournamentService`
Main service for tournament operations.

**Key Methods:**

1. **`get_current_cycle()`** - Determine which 12h cycle we're in
2. **`get_cycle_status()`** - Full status with countdowns and phase info
3. **`generate_tournament_target()`** - Create quantum target at 3:33 mark
4. **`submit_prediction()`** - User prediction submission
5. **`check_user_prediction()`** - Compare prediction to actual target
6. **`get_leaderboard()`** - Tournament rankings
7. **`get_user_stats()`** - Individual user performance
8. **`get_cycle_results()`** - Complete cycle results

---

## Database Schema

### `RVTournamentTarget`

```sql
CREATE TABLE rv_tournament_targets (
    id VARCHAR PRIMARY KEY,
    cycle_id VARCHAR UNIQUE NOT NULL,        -- "2024-01-15_00"
    target_number VARCHAR NOT NULL,          -- "4729-8153"
    raw_quantum_values TEXT NOT NULL,        -- "[12345, 23456, ...]"
    source VARCHAR NOT NULL,                 -- "ANU_QRNG"
    entanglement_timestamp TIMESTAMP         -- When target materialized
);
```

### `RVTournamentPrediction`

```sql
CREATE TABLE rv_tournament_predictions (
    id VARCHAR PRIMARY KEY,
    cycle_id VARCHAR NOT NULL,
    user_identifier VARCHAR NOT NULL,
    predicted_number VARCHAR NOT NULL,       -- "1234-5678"
    confidence FLOAT,                        -- 0.0-1.0
    notes TEXT,
    submitted_at TIMESTAMP,
    is_pre_entanglement BOOLEAN,            -- Bonus points eligibility
    is_scored BOOLEAN DEFAULT FALSE,
    is_correct BOOLEAN,                      -- Exact match
    correct_digits INTEGER,                  -- 0-8
    points_awarded INTEGER,                  -- Tournament points
    scored_at TIMESTAMP,
    impressions TEXT,                        -- Viewing session notes
    base_frequency FLOAT,                    -- Audio frequency used
    beat_frequency FLOAT,                    -- Binaural beat frequency
    protocol_used VARCHAR,                   -- Audio protocol name
    session_duration_minutes INTEGER
);
```

### `RVTournamentCycle`

```sql
CREATE TABLE rv_tournament_cycles (
    id VARCHAR PRIMARY KEY,
    cycle_id VARCHAR UNIQUE NOT NULL,        -- "20250125-C1"
    coordinate VARCHAR NOT NULL,             -- "xxxx-xxxx"
    entanglement_time TIMESTAMP NOT NULL,
    reveal_time TIMESTAMP NOT NULL,
    status VARCHAR DEFAULT 'active',         -- "active" or "revealed"
    revealed_at TIMESTAMP,
    created_at TIMESTAMP
);
```

---

## Usage Examples

### 1. Check Current Cycle Status

```python
from services.rv_tournament import rv_tournament

# Get current cycle status
status = rv_tournament.get_cycle_status(db)

print(f"Cycle: {status['cycle_id']}")
print(f"Phase: {status['phase']}")
print(f"Can Submit: {status['can_submit_prediction']}")

if 'countdown_to_entanglement' in status:
    print(f"Entanglement in: {status['countdown_to_entanglement']}")
```

**Response Example:**
```json
{
  "cycle_id": "2025-01-25_00",
  "phase": "pre_entanglement",
  "start_time": "2025-01-25T00:00:00+00:00",
  "entanglement_time": "2025-01-25T03:33:00+00:00",
  "end_time": "2025-01-25T12:00:00+00:00",
  "seconds_until_entanglement": 8520,
  "countdown_to_entanglement": "2:22:00",
  "can_submit_prediction": true,
  "total_predictions": 47,
  "message": "Prediction window open. Target will materialize at entanglement time."
}
```

### 2. Submit Prediction

```python
# Submit user prediction
result = await rv_tournament.submit_prediction(
    db=db,
    user_identifier="user_12345",
    predicted_number="4729-8153",
    confidence=0.85,
    notes="Strong visual impression, high confidence"
)

print(f"Prediction ID: {result['prediction_id']}")
print(f"Pre-Entanglement Bonus: {result['is_pre_entanglement']}")
```

**Response Example:**
```json
{
  "prediction_id": "pred_abc123",
  "cycle_id": "2025-01-25_00",
  "predicted_number": "4729-8153",
  "submitted_at": "2025-01-25T02:15:00+00:00",
  "is_pre_entanglement": true,
  "phase": "pre_entanglement",
  "status": "submitted",
  "message": "Prediction recorded. Target will be revealed at cycle end."
}
```

### 3. Generate Tournament Target (Automated)

```python
# This runs automatically at 3:33 via scheduled job
result = await rv_tournament.generate_tournament_target(
    db=db,
    cycle_id="2025-01-25_00",
    force=False  # Only allow at entanglement time
)

print(f"Target: {result['target_number']}")
print(f"Raw Quantum: {result['raw_quantum_values']}")
```

**Response Example:**
```json
{
  "target_number": "4729-8153",
  "cycle_id": "2025-01-25_00",
  "entanglement_timestamp": "2025-01-25T03:33:00+00:00",
  "raw_quantum_values": [12345, 23456, 34567, 45678, 56789, 67890, 78901, 89012],
  "status": "materialized",
  "message": "Target number quantum-entangled successfully."
}
```

### 4. Check Prediction Results

```python
# After cycle reveal, check your prediction
result = rv_tournament.check_user_prediction(
    db=db,
    user_identifier="user_12345",
    cycle_id="2025-01-25_00"
)

print(f"Predicted: {result['predicted_number']}")
print(f"Actual: {result['actual_number']}")
print(f"Correct Digits: {result['correct_digits']}/8")
print(f"Points: {result['points_awarded']}")
```

**Response Example:**
```json
{
  "prediction_id": "pred_abc123",
  "cycle_id": "2025-01-25_00",
  "predicted_number": "4729-8153",
  "actual_number": "4729-9999",
  "is_correct": false,
  "correct_digits": 4,
  "score_breakdown": [
    {"position": 0, "predicted": "4", "actual": "4", "correct": true},
    {"position": 1, "predicted": "7", "actual": "7", "correct": true},
    {"position": 2, "predicted": "2", "actual": "2", "correct": true},
    {"position": 3, "predicted": "9", "actual": "9", "correct": true},
    {"position": 4, "predicted": "8", "actual": "9", "correct": false},
    {"position": 5, "predicted": "1", "actual": "9", "correct": false},
    {"position": 6, "predicted": "5", "actual": "9", "correct": false},
    {"position": 7, "predicted": "3", "actual": "9", "correct": false}
  ],
  "points_awarded": 60,
  "is_pre_entanglement": true,
  "accuracy_percent": 50.0
}
```

### 5. View Leaderboard

```python
# Get tournament rankings
leaderboard = rv_tournament.get_leaderboard(
    db=db,
    time_period="week",  # "all_time", "month", "week", "cycle"
    limit=10
)

for ranking in leaderboard['rankings']:
    print(f"#{ranking['rank']} - {ranking['user_identifier']}")
    print(f"  Points: {ranking['total_points']}")
    print(f"  Accuracy: {ranking['average_accuracy']}%")
```

**Response Example:**
```json
{
  "period": "Past 7 Days",
  "time_period": "week",
  "updated_at": "2025-01-25T14:30:00+00:00",
  "total_users": 156,
  "rankings": [
    {
      "rank": 1,
      "user_identifier": "user_98765",
      "total_points": 1420,
      "total_predictions": 12,
      "exact_matches": 1,
      "average_accuracy": 68.75,
      "average_correct_digits": 5.5
    },
    {
      "rank": 2,
      "user_identifier": "user_12345",
      "total_points": 1180,
      "total_predictions": 14,
      "exact_matches": 0,
      "average_accuracy": 52.68,
      "average_correct_digits": 4.21
    }
  ]
}
```

---

## Scoring System

### Points Calculation

```
Base Points = Correct Digits × 10
Exact Match Bonus = 100 points (if all 8 digits correct)
Pre-Entanglement Multiplier = 1.5× (if predicted before 3:33)

Total Points = (Base Points + Exact Match Bonus) × Pre-Entanglement Multiplier
```

### Examples

**Example 1: 6 correct digits, pre-entanglement**
```
Base: 6 × 10 = 60
Bonus: 0 (not exact match)
Multiplier: 1.5× (pre-entanglement)
Total: 60 × 1.5 = 90 points
```

**Example 2: 8 correct digits (exact match), post-entanglement**
```
Base: 8 × 10 = 80
Bonus: 100 (exact match)
Multiplier: 1.0× (post-entanglement)
Total: (80 + 100) × 1.0 = 180 points
```

**Example 3: 8 correct digits (exact match), pre-entanglement**
```
Base: 8 × 10 = 80
Bonus: 100 (exact match)
Multiplier: 1.5× (pre-entanglement)
Total: (80 + 100) × 1.5 = 270 points (MAXIMUM)
```

---

## Automated Jobs

### Target Generation Job

**Schedule:** Runs at 03:33 UTC and 15:33 UTC daily

**Cron Expression:** `33 3,15 * * *`

**Implementation:**
```python
# backend/jobs/generate_tournament_targets.py

import asyncio
from datetime import datetime, timezone
from database.session import get_db
from services.rv_tournament import rv_tournament

async def generate_targets_job():
    """Generate tournament targets at entanglement time."""
    db = next(get_db())
    current_time = datetime.now(timezone.utc)

    # Determine cycle ID
    if current_time.hour == 3:
        cycle_id = f"{current_time.date().isoformat()}_00"
    elif current_time.hour == 15:
        cycle_id = f"{current_time.date().isoformat()}_12"
    else:
        return

    # Generate target
    result = await rv_tournament.generate_tournament_target(
        db=db,
        cycle_id=cycle_id,
        force=False
    )

    print(f"Target generated: {result['target_number']}")

if __name__ == "__main__":
    asyncio.run(generate_targets_job())
```

---

## Testing

### Run Unit Tests

```bash
# Run all tournament tests
pytest backend/tests/test_rv_tournament.py -v

# Run specific test
pytest backend/tests/test_rv_tournament.py::TestTournamentCycle::test_cycle_initialization -v

# Run with coverage
pytest backend/tests/test_rv_tournament.py --cov=backend.services.rv_tournament
```

### Test Coverage

- ✅ Cycle initialization and timing
- ✅ Phase detection (pre/post entanglement, revealed)
- ✅ Target number validation
- ✅ Quantum target generation
- ✅ Prediction submission
- ✅ Duplicate prediction prevention
- ✅ Accuracy calculation
- ✅ Scoring system
- ✅ Leaderboard generation
- ✅ User statistics

---

## Integration with Quantum Oracle

The tournament service uses `quantum_oracle.py` for true quantum random number generation:

```python
from services.quantum_oracle import quantum_oracle

# Generate 8-digit quantum number
quantum_result = await quantum_oracle.generate_rv_target_number()

# Returns:
{
  "target_number": "47298153",  # 8 digits
  "raw_quantum_values": [12345, 23456, ...],  # Raw uint16 from ANU QRNG
  "timestamp": "2025-01-25T03:33:00+00:00",
  "source": "ANU_QRNG",
  "mode": "rv_target"
}
```

**Key Properties:**
- Uses ANU QRNG (quantum vacuum fluctuations)
- Numbers don't exist until observed
- True quantum randomness (unpredictable)
- Verifiable via raw quantum values

---

## API Routes (To Be Implemented)

### Recommended FastAPI Routes

```python
# GET /api/rv/tournament/status
# Get current cycle status

# POST /api/rv/tournament/predict
# Submit user prediction

# GET /api/rv/tournament/results/{cycle_id}
# Get cycle results

# GET /api/rv/tournament/leaderboard
# Get tournament rankings

# GET /api/rv/tournament/user/{user_id}/stats
# Get user statistics

# POST /api/rv/tournament/generate (Admin only)
# Manually trigger target generation
```

---

## Performance Considerations

1. **Database Indexing**
   - Index on `cycle_id` for fast lookups
   - Index on `user_identifier` for user queries
   - Composite index on `(cycle_id, user_identifier)` for prediction checks

2. **Caching**
   - Cache current cycle status (TTL: 1 minute)
   - Cache leaderboard (TTL: 5 minutes)
   - Cache user stats (TTL: 1 minute)

3. **Scheduled Jobs**
   - Target generation: Exactly at 03:33 and 15:33 UTC
   - Cleanup old predictions: Daily at 00:00 UTC
   - Leaderboard updates: Every 5 minutes

---

## Security & Anti-Cheating

1. **Rate Limiting**
   - One prediction per user per cycle
   - Prevent prediction spam

2. **Timestamp Verification**
   - Server-side timestamps only
   - Reject backdated predictions

3. **Target Security**
   - Targets generated at exact time (not pre-generated)
   - Raw quantum values stored for verification
   - Admin-only force generation

4. **User Verification**
   - Require authenticated user_identifier
   - Track IP addresses for abuse detection

---

## Future Enhancements

1. **Enhanced Analytics**
   - Statistical significance testing
   - User accuracy trends over time
   - Protocol effectiveness analysis

2. **Social Features**
   - Team tournaments
   - Friend leaderboards
   - Prediction sharing (after reveal)

3. **Advanced Scoring**
   - Position-weighted accuracy
   - Streak bonuses
   - Achievement system

4. **Visualization**
   - Real-time cycle countdown
   - Prediction distribution charts
   - Historical accuracy graphs

---

## References

- **ANU QRNG**: https://qrng.anu.edu.au/
- **CIA Star Gate Program**: Remote viewing protocols
- **PEAR Lab**: Princeton Engineering Anomalies Research
- **Quantum Mechanics**: Wave function collapse and observation

---

## Contact & Support

For questions or issues with the RV Tournament Service:
- Check the unit tests for usage examples
- Review `rv_tournament_example.py` for complete workflows
- See database models for schema details

**Created:** 2025-01-25
**Version:** 1.0.0
**Author:** EBL Development Team
