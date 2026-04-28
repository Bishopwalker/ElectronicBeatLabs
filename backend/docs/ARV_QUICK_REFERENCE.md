# ARV System Quick Reference

## Quick Start

### 1. Import Models
```python
from database.models import ARVPrediction, ARVTargetPair, ARVSubmission, ARVOutcome
from services.arv_system import arv_system, ARVTargetType
```

### 2. Create Prediction
```python
result = arv_system.create_prediction(
    db=db_session,
    name="AAPL Stock Monday",
    description="Will Apple stock close up or down?",
    target_a={"url": "beach.jpg", "description": "Tropical beach"},
    target_b={"url": "mountain.jpg", "description": "Snow mountain"},
    outcome_a_label="Stock Up",
    outcome_b_label="Stock Down",
    target_type=ARVTargetType.IMAGE_PAIR
)
prediction_id = result["prediction_id"]
```

### 3. Get Blind Target
```python
target = arv_system.get_blind_target(db=db_session, prediction_id=prediction_id)
# Returns either target A or B (randomly selected)
```

### 4. Submit Impressions
```python
arv_system.submit_viewing_data(
    db=db_session,
    prediction_id=prediction_id,
    impressions="I see blue water, feel warm sand, hear waves",
    confidence=0.75
)
```

### 5. Judge Target
```python
arv_system.judge_target_match(
    db=db_session,
    prediction_id=prediction_id,
    judged_target="A"  # or "B"
)
```

### 6. Resolve Outcome
```python
arv_system.resolve_outcome(
    db=db_session,
    prediction_id=prediction_id,
    actual_outcome="A",  # or "B"
    outcome_notes="Stock closed up 2.5%"
)
```

## API Endpoints Cheat Sheet

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/arv/predictions/create` | Create new prediction |
| GET | `/api/arv/predictions/{id}/target` | Get blind target |
| POST | `/api/arv/predictions/{id}/submit` | Submit impressions |
| POST | `/api/arv/predictions/{id}/judge` | Judge target match |
| POST | `/api/arv/predictions/{id}/resolve` | Resolve outcome |
| GET | `/api/arv/predictions/{id}/status` | Check status |
| GET | `/api/arv/stats` | View statistics |
| GET | `/api/arv/history` | Get history |
| GET | `/api/arv/info` | System info |
| GET | `/api/arv/examples` | Example targets |

## Target Types

```python
class ARVTargetType(str, Enum):
    IMAGE_PAIR = "image_pair"          # Two images (URLs)
    LOCATION_PAIR = "location_pair"    # Two coordinates
    DESCRIPTION_PAIR = "description_pair"  # Two text descriptions
    OBJECT_PAIR = "object_pair"        # Two physical objects
```

## Prediction Status Flow

```
pending → [viewing] → [judging] → resolved
                                → expired (if deadline passed)
```

## Statistical Significance Levels

| Level | p-value | Meaning |
|-------|---------|---------|
| `not_significant` | > 0.05 | Could be chance |
| `significant` | < 0.05 | Unlikely chance |
| `very_significant` | < 0.01 | Very unlikely chance |
| `highly_significant` | < 0.001 | Extremely unlikely chance |

## Database Schema

```sql
-- Target Pairs
arv_target_pairs: id, target_type, target_a_data, target_b_data,
                  outcome_a_label, outcome_b_label, created_at

-- Predictions
arv_predictions: id, name, description, user_identifier, target_pair_id,
                selected_target, judged_target, judged_at, status,
                is_correct, created_at, deadline

-- Submissions
arv_submissions: id, prediction_id, impressions, confidence, session_notes,
                base_frequency, beat_frequency, protocol_used, submitted_at

-- Outcomes
arv_outcomes: id, prediction_id, actual_outcome, is_correct,
             outcome_notes, resolved_at
```

## Common Patterns

### Full ARV Cycle (Python)
```python
# 1. Create
pred = arv_system.create_prediction(db, name, desc, target_a, target_b, ...)

# 2. Get target
target = arv_system.get_blind_target(db, pred["prediction_id"])

# 3. Submit
arv_system.submit_viewing_data(db, pred["prediction_id"], impressions, ...)

# 4. Judge
arv_system.judge_target_match(db, pred["prediction_id"], "A")

# 5. Resolve
result = arv_system.resolve_outcome(db, pred["prediction_id"], "A")
print(f"Accuracy: {result['accuracy']}")  # HIT or MISS
```

### Full ARV Cycle (REST API)
```bash
# 1. Create prediction
PRED_ID=$(curl -X POST .../predictions/create -d '{...}' | jq -r .prediction_id)

# 2. Get target
curl .../predictions/$PRED_ID/target

# 3. Submit impressions
curl -X POST .../predictions/$PRED_ID/submit -d '{"impressions": "..."}'

# 4. Judge
curl -X POST .../predictions/$PRED_ID/judge -d '{"judged_target": "A"}'

# 5. Resolve
curl -X POST .../predictions/$PRED_ID/resolve -d '{"actual_outcome": "A"}'
```

### Get Statistics
```python
stats = arv_system.get_accuracy_statistics(
    db=db_session,
    user_identifier="user123",
    days=30
)
print(f"{stats['accuracy_percent']}% accuracy over {stats['total_predictions']} predictions")
```

### Get History
```python
history = arv_system.get_prediction_history(
    db=db_session,
    user_identifier="user123",
    limit=20,
    status="resolved"  # or "pending", "expired"
)
```

## Testing

### Run All Tests
```bash
cd backend
python -m pytest tests/test_arv_system.py -v
```

### Run Specific Test
```bash
python -m pytest tests/test_arv_system.py::test_create_prediction_success -v
```

### Test with Coverage
```bash
python -m pytest tests/test_arv_system.py --cov=services.arv_system --cov-report=html
```

## Binaural Beat Integration

### Track Audio Protocol
```python
arv_system.submit_viewing_data(
    db=db_session,
    prediction_id=prediction_id,
    impressions="...",
    base_frequency=140,      # Hz
    beat_frequency=6,        # Hz (theta)
    protocol_used="theta"    # Protocol name
)
```

### Recommended Protocols
- **Theta (4-8 Hz)**: Deep relaxation, enhanced intuition
- **Alpha (8-13 Hz)**: Calm focus, reduced analytical thinking
- **Alpha-Theta (7-8 Hz)**: Hypnagogic state, optimal for RV

## Error Handling

### Common Errors
```python
# Invalid prediction ID
try:
    target = arv_system.get_blind_target(db, "invalid_id")
except ValueError as e:
    print(f"Error: {e}")  # "Prediction invalid_id not found"

# Invalid judged target
try:
    arv_system.judge_target_match(db, pred_id, "C")
except ValueError as e:
    print(f"Error: {e}")  # "judged_target must be 'A' or 'B'"

# Resolve before judging
try:
    arv_system.resolve_outcome(db, pred_id, "A")
except ValueError as e:
    print(f"Error: {e}")  # "Prediction has not been judged yet"
```

## Best Practices

### Target Selection
✅ **Good Targets**: Beach vs. Mountain, Cat vs. Dog, Fire vs. Water
❌ **Bad Targets**: Beach vs. Lake, Cat vs. Tiger (too similar)
❌ **Avoid**: Bull vs. Bear (conceptually linked to outcomes)

### Viewing Protocol
1. Use theta/alpha binaural beats
2. Record impressions, not guesses
3. Be specific (colors, textures, feelings)
4. Trust first impressions
5. Don't analyze during viewing

### Judging Protocol
1. Judge without knowing outcome associations
2. Compare both targets carefully
3. Match to impressions objectively
4. Don't second-guess

## Example Target Pairs

### Stock Market
```python
{
    "target_a": {"url": "tropical_beach.jpg"},
    "target_b": {"url": "snowy_mountain.jpg"},
    "outcome_a_label": "Stock Up",
    "outcome_b_label": "Stock Down"
}
```

### Sports
```python
{
    "target_a": {"description": "Victory celebration, fireworks, trophy"},
    "target_b": {"description": "Empty locker room, quiet, dim lights"},
    "outcome_a_label": "Win",
    "outcome_b_label": "Loss"
}
```

### Weather
```python
{
    "target_a": {"coordinates": {"lat": 21.3099, "lon": -157.8581}, "description": "Waikiki Beach"},
    "target_b": {"coordinates": {"lat": 47.6062, "lon": -122.3321}, "description": "Seattle"},
    "outcome_a_label": "Sunny",
    "outcome_b_label": "Rainy"
}
```

## Troubleshooting

### Database Issues
```python
# Check if prediction exists
from database.models import ARVPrediction
pred = db.query(ARVPrediction).filter(ARVPrediction.id == pred_id).first()
if not pred:
    print("Prediction not found")

# Check prediction status
print(f"Status: {pred.status}")
print(f"Selected target: {pred.selected_target}")
print(f"Judged target: {pred.judged_target}")
```

### Statistical Issues
```python
# Verify sufficient data
stats = arv_system.get_accuracy_statistics(db, days=30)
if stats["total_predictions"] < 10:
    print("Need at least 10 predictions for reliable statistics")

# Check significance
if stats["statistical_significance"] == "not_significant":
    print("Results could be due to chance - need more predictions")
```

## Resources

- **Full Documentation**: `backend/docs/ARV_SYSTEM.md`
- **Implementation Summary**: `ARV_IMPLEMENTATION_SUMMARY.md`
- **Test Suite**: `backend/tests/test_arv_system.py`
- **API Info Endpoint**: `GET /api/arv/info`
- **Examples Endpoint**: `GET /api/arv/examples`

## Support

For issues or questions:
1. Check logs: `backend/logs/`
2. Run tests: `pytest tests/test_arv_system.py -v`
3. Check status: `GET /api/arv/predictions/{id}/status`
4. Review docs: `backend/docs/ARV_SYSTEM.md`

---

**Quick Tip**: Start with simple predictions (stock up/down) and clear target pairs (beach/mountain) before attempting complex ARV applications.
