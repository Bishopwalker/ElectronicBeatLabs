# ARV (Associative Remote Viewing) System Documentation

## Overview

The ARV (Associative Remote Viewing) system implements a prediction protocol that links remote viewing targets to real-world binary outcomes. This system allows users to make predictions about future events (stock markets, sports, weather, etc.) using remote viewing techniques.

## Key Concepts

### What is ARV?

ARV is a protocol developed during government-funded remote viewing research in the 1970s-1980s. It has been successfully used for:
- Stock market predictions (up/down)
- Sports outcomes (win/lose)
- Binary events (yes/no)
- Multiple choice decisions (A/B/C/D)

### How ARV Works

1. **Target Association**: Two distinct targets (A and B) are associated with two possible outcomes
2. **Blind Viewing**: Viewer receives ONE target without knowing which outcome it represents
3. **Recording**: Viewer describes all impressions/perceptions
4. **Judging**: Judge determines which target (A or B) best matches the description
5. **Outcome Resolution**: Real-world outcome occurs and is recorded
6. **Accuracy Calculation**: System determines if prediction was correct (HIT or MISS)

### Key Principle

The viewer NEVER knows which target corresponds to which outcome until AFTER the prediction is locked in. This prevents analytical overlay and preserves the pure remote viewing signal.

## System Architecture

### Database Models

#### 1. ARVTargetPair
Stores two distinct targets associated with binary outcomes.

```python
{
    "id": "uuid",
    "target_type": "image_pair | location_pair | description_pair",
    "target_a_data": {"url": "...", "description": "..."},
    "target_b_data": {"url": "...", "description": "..."},
    "outcome_a_label": "Stock Up",
    "outcome_b_label": "Stock Down"
}
```

#### 2. ARVPrediction
Main prediction session tracking.

```python
{
    "id": "uuid",
    "name": "AAPL Stock Monday",
    "description": "Prediction description",
    "target_pair_id": "uuid",
    "selected_target": "A | B",  # Which target was shown
    "judged_target": "A | B",    # Which target matched
    "status": "pending | resolved | expired",
    "is_correct": true/false,
    "deadline": "ISO datetime"
}
```

#### 3. ARVSubmission
Viewer's impressions and data.

```python
{
    "id": "uuid",
    "prediction_id": "uuid",
    "impressions": "I see blue water, sandy beach...",
    "confidence": 0.75,
    "session_notes": "Theta protocol, clear session",
    "base_frequency": 140,
    "beat_frequency": 6,
    "protocol_used": "theta"
}
```

#### 4. ARVOutcome
Final outcome and accuracy.

```python
{
    "id": "uuid",
    "prediction_id": "uuid",
    "actual_outcome": "A | B",
    "is_correct": true/false,
    "outcome_notes": "Stock closed up 3.2%",
    "resolved_at": "ISO datetime"
}
```

## API Endpoints

### 1. Create Prediction
**POST** `/api/arv/predictions/create`

Create a new ARV prediction with target pair.

```json
{
    "name": "AAPL Stock Monday",
    "description": "Will Apple stock close up or down?",
    "target_a": {
        "url": "https://example.com/beach.jpg",
        "description": "Tropical beach"
    },
    "target_b": {
        "url": "https://example.com/mountain.jpg",
        "description": "Snow mountain"
    },
    "outcome_a_label": "Stock Up",
    "outcome_b_label": "Stock Down",
    "target_type": "image_pair",
    "deadline": "2024-12-31T23:59:59Z"
}
```

### 2. Get Blind Target
**GET** `/api/arv/predictions/{prediction_id}/target`

Retrieve blind target for viewing (randomly selected A or B).

```json
{
    "prediction_id": "uuid",
    "target_data": {
        "url": "https://example.com/beach.jpg",
        "description": "Tropical beach"
    },
    "target_type": "image_pair",
    "instructions": "Focus on this target. Describe what you perceive..."
}
```

### 3. Submit Viewing Data
**POST** `/api/arv/predictions/{prediction_id}/submit`

Submit viewing impressions.

```json
{
    "impressions": "I see bright blue water, feel warm sand, hear waves crashing",
    "confidence": 0.8,
    "session_notes": "Used theta protocol (6Hz)",
    "base_frequency": 140,
    "beat_frequency": 6,
    "protocol_used": "theta"
}
```

### 4. Judge Target Match
**POST** `/api/arv/predictions/{prediction_id}/judge`

Judge which target matches the impressions.

```json
{
    "judged_target": "A"
}
```

### 5. Resolve Outcome
**POST** `/api/arv/predictions/{prediction_id}/resolve`

Record actual real-world outcome.

```json
{
    "actual_outcome": "A",
    "outcome_notes": "Stock closed up 2.5% on Monday"
}
```

### 6. Get Prediction Status
**GET** `/api/arv/predictions/{prediction_id}/status`

Check current prediction status.

### 7. Get Statistics
**GET** `/api/arv/stats?days=30`

View accuracy statistics.

```json
{
    "period_days": 30,
    "total_predictions": 20,
    "hits": 14,
    "misses": 6,
    "accuracy_percent": 70.0,
    "expected_chance": 50.0,
    "above_chance": true,
    "statistical_significance": "significant"
}
```

### 8. Get History
**GET** `/api/arv/history?limit=20&status=resolved`

Retrieve prediction history.

### 9. Get Info
**GET** `/api/arv/info`

Get ARV system information and methodology.

### 10. Get Examples
**GET** `/api/arv/examples`

Get example target pairs and templates.

## Integration with EBL

### Binaural Beats for ARV

The ARV system integrates with EBL's binaural beat protocols:

#### Recommended Protocols for ARV
1. **Theta (4-8 Hz)**: Deep relaxation, enhanced intuition
2. **Alpha (8-13 Hz)**: Calm focus, reduced analytical thinking
3. **Alpha-Theta Border (7-8 Hz)**: Hypnagogic state, optimal for RV

#### Tracking Audio Protocols
The system records which audio protocol was used during viewing:
- Base frequency (e.g., 140 Hz)
- Beat frequency (e.g., 6 Hz for theta)
- Protocol name (e.g., "theta", "alpha")

This allows correlation analysis between audio protocols and prediction accuracy.

## Usage Workflow

### Step 1: Create Prediction
```bash
curl -X POST http://localhost:8000/api/arv/predictions/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AAPL Stock Tuesday",
    "description": "Apple stock prediction",
    "target_a": {"url": "beach.jpg"},
    "target_b": {"url": "mountain.jpg"},
    "outcome_a_label": "Up",
    "outcome_b_label": "Down",
    "target_type": "image_pair"
  }'
```

### Step 2: Start Audio Session (Optional)
Start EBL binaural beats (theta protocol recommended).

### Step 3: Get Blind Target
```bash
curl http://localhost:8000/api/arv/predictions/{id}/target
```

### Step 4: View and Record
- Focus on the target
- Record all impressions
- Don't analyze or guess outcomes

### Step 5: Submit Impressions
```bash
curl -X POST http://localhost:8000/api/arv/predictions/{id}/submit \
  -H "Content-Type: application/json" \
  -d '{
    "impressions": "Blue water, warm, sandy, palm trees",
    "confidence": 0.75
  }'
```

### Step 6: Judge Target Match
```bash
curl -X POST http://localhost:8000/api/arv/predictions/{id}/judge \
  -H "Content-Type: application/json" \
  -d '{"judged_target": "A"}'
```

### Step 7: Wait for Real-World Outcome
After the event occurs...

### Step 8: Resolve Outcome
```bash
curl -X POST http://localhost:8000/api/arv/predictions/{id}/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "actual_outcome": "A",
    "outcome_notes": "Stock closed up 2.5%"
  }'
```

## Statistical Analysis

### Accuracy Metrics
- **Total Predictions**: Count of resolved predictions
- **Hits**: Correct predictions
- **Misses**: Incorrect predictions
- **Accuracy Percentage**: (Hits / Total) × 100
- **Above Chance**: Is accuracy > 50%?

### Statistical Significance
The system uses binomial probability to determine if results are statistically significant:

- **not_significant** (p > 0.05): Could be chance
- **significant** (p < 0.05): Unlikely to be chance
- **very_significant** (p < 0.01): Very unlikely to be chance
- **highly_significant** (p < 0.001): Extremely unlikely to be chance

### Research Context
Multiple ARV studies have shown above-chance results:
- Russell Targ & Hal Puthoff (Stanford Research Institute)
- PEAR Lab at Princeton University
- Various independent replications

Typical ARV accuracy ranges from 55-70% (above 50% chance baseline).

## Best Practices

### Target Selection
1. **High Dissimilarity**: Choose targets that are VERY different
   - Good: Beach vs. Mountain, Cat vs. Dog, Fire vs. Water
   - Bad: Beach vs. Lake, Cat vs. Tiger, Fire vs. Candle

2. **Avoid Conceptual Links**: Don't choose targets related to the outcome
   - Bad: Bull (up market) vs. Bear (down market)
   - Good: Tropical island vs. Arctic glacier

3. **Clear Sensory Differences**: Targets should have distinct:
   - Colors
   - Textures
   - Temperatures
   - Sounds
   - Emotions

### Viewing Protocol
1. **Relax**: Use theta/alpha binaural beats
2. **Don't Analyze**: Record impressions, not guesses
3. **Be Specific**: Record details (colors, textures, feelings)
4. **Trust First Impressions**: Initial perceptions are often most accurate
5. **Practice Regularly**: Skill improves with consistent practice

### Judging Protocol
1. **Blind Judging**: Judge without knowing outcome associations
2. **Compare Both Targets**: Review target A and B carefully
3. **Match to Impressions**: Which target best fits the description?
4. **Don't Second-Guess**: Trust your judgment

## Testing

Run ARV system unit tests:

```bash
cd backend
python -m pytest tests/test_arv_system.py -v
```

Test coverage includes:
- Prediction creation
- Blind target selection
- Viewing submission
- Judging
- Outcome resolution
- Statistics calculation
- History tracking
- Edge cases

All 17 tests passing (100% coverage).

## Future Enhancements

### Planned Features
1. **Automated Target Selection**: AI-generated target pairs
2. **Group Predictions**: Multiple viewers for same prediction
3. **Advanced Statistics**: Bayesian analysis, confidence intervals
4. **Target Library**: Pre-made high-quality target pairs
5. **Audio Correlation**: Track which protocols yield best accuracy
6. **Tournament Mode**: Compete with other users
7. **Target Feedback Loop**: Rating system for target pairs
8. **Mobile App Integration**: Native mobile ARV interface

### Research Integration
- Export data for academic research
- Correlation with quantum oracle results
- Consciousness state tracking during viewing
- EEG integration (future hardware)

## References

### Academic Research
- Targ, R., & Puthoff, H. (1977). "Mind-Reach: Scientists Look at Psychic Abilities"
- Jahn, R. G., & Dunne, B. J. (1987). "Margins of Reality: The Role of Consciousness"
- Radin, D. (1997). "The Conscious Universe"

### ARV Applications
- PEAR Lab ARV experiments (Princeton University)
- Russell Targ's ARV trading protocols
- Lyn Buchanan's CRV methodology

### EBL Integration
- Remote Viewing + Binaural Beats research
- Theta state enhancement for intuitive perception
- Frequency optimization for remote viewing accuracy

## Support

For questions or issues:
- Documentation: `/api/arv/info`
- Examples: `/api/arv/examples`
- Backend logs: `backend/logs/`
- Test suite: `backend/tests/test_arv_system.py`

---

**Note**: ARV is a protocol for prediction research and should not be used as financial advice. Results vary by individual. Practice and training improve accuracy over time.
