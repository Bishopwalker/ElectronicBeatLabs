/**
 * ARV Predictions Tab Component
 *
 * Associative Remote Viewing for making binary predictions.
 * Uses target pairs to predict future events (sports, markets, etc.)
 *
 * Features:
 * - Create predictions with target pairs
 * - Blind target viewing and selection
 * - Judge comparisons
 * - Track prediction accuracy
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  TextField,
  Card,
  CardContent,
  Grid,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  keyframes
} from '@mui/material';

// Animation keyframes
const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 0, 0.5); }
  50% { box-shadow: 0 0 40px rgba(255, 107, 0, 0.8), 0 0 60px rgba(0, 255, 136, 0.4); }
`;

const revealAnimation = keyframes`
  0% { opacity: 0; transform: scale(0.8) rotateY(180deg); }
  50% { opacity: 0.5; transform: scale(1.1) rotateY(90deg); }
  100% { opacity: 1; transform: scale(1) rotateY(0deg); }
`;

// API Configuration
const API_BASE = import.meta.env.DEV ? 'http://localhost:8080' : '';

interface ARVPrediction {
  prediction_id: string;
  question: string;
  outcome_a: string;
  outcome_b: string;
  status: string;
  created_at: string;
  target_a?: { coordinate: string };
  target_b?: { coordinate: string };
  selected_target?: string;
  actual_outcome?: string;
  correct?: boolean;
}

interface ARVStats {
  total_predictions: number;
  resolved_predictions: number;
  correct_predictions: number;
  accuracy_rate: number;
  current_streak: number;
  best_streak: number;
}

interface ViewingImpression {
  primary_impression: string;
  secondary_details: string;
  confidence: number;
}

const ARVPredictionsTab: React.FC = () => {
  const [mode, setMode] = useState<'create' | 'active' | 'history' | 'stats'>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Active predictions list
  const [activePredictions, setActivePredictions] = useState<ARVPrediction[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<ARVPrediction | null>(null);

  // Create prediction form
  const [createForm, setCreateForm] = useState({
    question: '',
    outcome_a: '',
    outcome_b: '',
    event_date: ''
  });

  // Viewing state
  const [viewingTarget, setViewingTarget] = useState<'A' | 'B' | null>(null);
  const [impressions, setImpressions] = useState<ViewingImpression>({
    primary_impression: '',
    secondary_details: '',
    confidence: 50
  });

  // Judge dialog
  const [judgeDialogOpen, setJudgeDialogOpen] = useState(false);
  const [judgeSelection, setJudgeSelection] = useState<'A' | 'B' | null>(null);

  // Resolve dialog
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [actualOutcome, setActualOutcome] = useState<'A' | 'B' | null>(null);

  // Stats and history
  const [stats, setStats] = useState<ARVStats | null>(null);
  const [history, setHistory] = useState<ARVPrediction[]>([]);

  // Fetch active predictions
  const fetchActivePredictions = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/arv/predictions/active`);
      if (response.ok) {
        const data = await response.json();
        setActivePredictions(data.predictions || []);
      }
    } catch (err) {
      console.error('Failed to fetch predictions:', err);
    }
  }, []);

  // Create a new prediction
  const createPrediction = async () => {
    if (!createForm.question || !createForm.outcome_a || !createForm.outcome_b) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/arv/predictions/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });

      if (!response.ok) throw new Error('Failed to create prediction');

      const prediction: ARVPrediction = await response.json();
      setSuccess('Prediction created! Now view the blind target.');
      setCreateForm({ question: '', outcome_a: '', outcome_b: '', event_date: '' });
      setSelectedPrediction(prediction);
      setMode('active');
      fetchActivePredictions();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prediction');
    } finally {
      setLoading(false);
    }
  };

  // Get blind target for viewing
  const getBlindTarget = async (predictionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/arv/predictions/${predictionId}/target`);
      if (!response.ok) throw new Error('Failed to get target');

      const data = await response.json();
      setViewingTarget(data.assigned_target);
      setImpressions({ primary_impression: '', secondary_details: '', confidence: 50 });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get target');
    } finally {
      setLoading(false);
    }
  };

  // Submit viewing impressions
  const submitImpressions = async () => {
    if (!selectedPrediction) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/api/arv/predictions/${selectedPrediction.prediction_id}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(impressions)
        }
      );

      if (!response.ok) throw new Error('Failed to submit impressions');

      setSuccess('Impressions submitted! Ready for judging.');
      setViewingTarget(null);
      fetchActivePredictions();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  // Judge the prediction (compare impressions to targets)
  const judgePrediction = async () => {
    if (!selectedPrediction || !judgeSelection) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/api/arv/predictions/${selectedPrediction.prediction_id}/judge`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selected_target: judgeSelection })
        }
      );

      if (!response.ok) throw new Error('Failed to judge prediction');

      setSuccess(`Target ${judgeSelection} selected! Prediction locked.`);
      setJudgeDialogOpen(false);
      setJudgeSelection(null);
      fetchActivePredictions();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to judge');
    } finally {
      setLoading(false);
    }
  };

  // Resolve the prediction (after event occurs)
  const resolvePrediction = async () => {
    if (!selectedPrediction || !actualOutcome) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/api/arv/predictions/${selectedPrediction.prediction_id}/resolve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actual_outcome: actualOutcome })
        }
      );

      if (!response.ok) throw new Error('Failed to resolve prediction');

      const result = await response.json();
      setSuccess(result.correct ? 'Correct prediction!' : 'Incorrect prediction.');
      setResolveDialogOpen(false);
      setActualOutcome(null);
      fetchActivePredictions();
      fetchStats();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/arv/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch {
      // Stats are optional
    }
  }, []);

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/arv/history?limit=20`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.predictions || []);
      }
    } catch {
      // History is optional
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchActivePredictions();
    if (mode === 'stats') fetchStats();
    if (mode === 'history') fetchHistory();
  }, [mode, fetchActivePredictions, fetchStats, fetchHistory]);

  const handleModeChange = (_: React.SyntheticEvent, newValue: 'create' | 'active' | 'history' | 'stats') => {
    setMode(newValue);
    setError(null);
    setSuccess(null);
  };

  return (
    <Box sx={{ py: 1 }}>
      <Typography
        variant="h5"
        component="h4"
        sx={{
          color: '#ff6b00',
          mb: 2,
          textAlign: 'center',
          textShadow: '0 0 10px rgba(255, 107, 0, 0.5)'
        }}
      >
        ARV Predictions
      </Typography>

      <Typography
        sx={{
          color: '#00ff88',
          fontSize: '0.85rem',
          textAlign: 'center',
          mb: 2,
          fontStyle: 'italic'
        }}
      >
        Associative Remote Viewing for binary outcome predictions
      </Typography>

      {/* Mode Tabs */}
      <Tabs
        value={mode}
        onChange={handleModeChange}
        centered
        sx={{
          mb: 2,
          '& .MuiTab-root': {
            color: '#ff6b00',
            fontSize: '0.8rem',
            minWidth: 'auto',
            px: 2,
            '&.Mui-selected': { color: '#00ff88' }
          },
          '& .MuiTabs-indicator': { backgroundColor: '#00ff88' }
        }}
      >
        <Tab value="create" label="Create" />
        <Tab value="active" label={`Active (${activePredictions.length})`} />
        <Tab value="history" label="History" />
        <Tab value="stats" label="Stats" />
      </Tabs>

      {/* Error/Success Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Create Mode */}
      {mode === 'create' && (
        <Paper
          sx={{
            p: 3,
            background: 'rgba(255, 107, 0, 0.1)',
            border: '1px solid rgba(255, 107, 0, 0.3)',
            borderRadius: 3
          }}
        >
          <Typography sx={{ color: '#ff6b00', mb: 2, fontWeight: 600 }}>
            Create New Prediction
          </Typography>

          <TextField
            label="Question / Event"
            placeholder="What are you predicting? (e.g., 'Will Team A win tomorrow?')"
            value={createForm.question}
            onChange={(e) => setCreateForm(prev => ({ ...prev, question: e.target.value }))}
            fullWidth
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                label="Outcome A"
                placeholder="First possible outcome"
                value={createForm.outcome_a}
                onChange={(e) => setCreateForm(prev => ({ ...prev, outcome_a: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Outcome B"
                placeholder="Second possible outcome"
                value={createForm.outcome_b}
                onChange={(e) => setCreateForm(prev => ({ ...prev, outcome_b: e.target.value }))}
                fullWidth
              />
            </Grid>
          </Grid>

          <TextField
            label="Event Date (optional)"
            type="date"
            value={createForm.event_date}
            onChange={(e) => setCreateForm(prev => ({ ...prev, event_date: e.target.value }))}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3 }}
          />

          <Button
            onClick={createPrediction}
            disabled={loading}
            fullWidth
            variant="contained"
            sx={{
              py: 1.5,
              background: 'linear-gradient(45deg, #ff6b00, #00ff88)',
              '&:hover': { background: 'linear-gradient(45deg, #ff8533, #33ffaa)' }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Prediction'}
          </Button>

          <Divider sx={{ my: 3, borderColor: 'rgba(255, 107, 0, 0.3)' }} />

          <Typography sx={{ color: '#666', fontSize: '0.8rem', textAlign: 'center' }}>
            ARV uses two random targets associated with each outcome.
            You view a blind target, then judge which target your impressions match.
            The matched target determines your prediction.
          </Typography>
        </Paper>
      )}

      {/* Active Mode */}
      {mode === 'active' && (
        <Box>
          {activePredictions.length === 0 ? (
            <Paper
              sx={{
                p: 3,
                background: 'rgba(255, 107, 0, 0.1)',
                border: '1px solid rgba(255, 107, 0, 0.3)',
                borderRadius: 3,
                textAlign: 'center'
              }}
            >
              <Typography sx={{ color: '#666' }}>
                No active predictions. Create one to get started!
              </Typography>
              <Button
                onClick={() => setMode('create')}
                sx={{ mt: 2, color: '#ff6b00' }}
              >
                Create Prediction
              </Button>
            </Paper>
          ) : (
            <Box>
              {activePredictions.map((pred) => (
                <Paper
                  key={pred.prediction_id}
                  sx={{
                    p: 2,
                    mb: 2,
                    background: 'rgba(255, 107, 0, 0.1)',
                    border: '1px solid rgba(255, 107, 0, 0.3)',
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': { borderColor: '#ff6b00' }
                  }}
                  onClick={() => setSelectedPrediction(pred)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                        {pred.question}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip
                          label={`A: ${pred.outcome_a}`}
                          size="small"
                          sx={{ background: 'rgba(255, 107, 0, 0.2)', color: '#ff6b00' }}
                        />
                        <Chip
                          label={`B: ${pred.outcome_b}`}
                          size="small"
                          sx={{ background: 'rgba(0, 255, 136, 0.2)', color: '#00ff88' }}
                        />
                      </Box>
                    </Box>
                    <Chip
                      label={pred.status}
                      size="small"
                      sx={{
                        background: pred.status === 'judged' ? 'rgba(138, 43, 226, 0.2)' : 'rgba(255, 107, 0, 0.2)',
                        color: pred.status === 'judged' ? '#8a2be2' : '#ff6b00'
                      }}
                    />
                  </Box>

                  {/* Action buttons based on status */}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    {pred.status === 'created' && (
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPrediction(pred);
                          getBlindTarget(pred.prediction_id);
                        }}
                        sx={{ color: '#00ff88' }}
                      >
                        Start Viewing
                      </Button>
                    )}
                    {pred.status === 'viewed' && (
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPrediction(pred);
                          setJudgeDialogOpen(true);
                        }}
                        sx={{ color: '#8a2be2' }}
                      >
                        Judge
                      </Button>
                    )}
                    {pred.status === 'judged' && (
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPrediction(pred);
                          setResolveDialogOpen(true);
                        }}
                        sx={{ color: '#ff6b00' }}
                      >
                        Resolve
                      </Button>
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>
          )}

          {/* Viewing Interface */}
          {viewingTarget && selectedPrediction && (
            <Paper
              sx={{
                p: 3,
                mt: 2,
                background: 'rgba(0, 0, 0, 0.3)',
                border: '2px solid #00ff88',
                borderRadius: 3,
                animation: `${pulseGlow} 3s ease-in-out infinite`
              }}
            >
              <Typography sx={{ color: '#00ff88', mb: 2, textAlign: 'center', fontWeight: 600 }}>
                Blind Target Viewing
              </Typography>

              <Typography sx={{ color: '#666', textAlign: 'center', mb: 2 }}>
                Focus on the target. Record your impressions below.
              </Typography>

              <TextField
                label="Primary Impression"
                placeholder="What do you perceive?"
                value={impressions.primary_impression}
                onChange={(e) => setImpressions(prev => ({ ...prev, primary_impression: e.target.value }))}
                fullWidth
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Additional Details"
                placeholder="Colors, shapes, textures, feelings..."
                value={impressions.secondary_details}
                onChange={(e) => setImpressions(prev => ({ ...prev, secondary_details: e.target.value }))}
                fullWidth
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />

              <Box sx={{ mb: 2 }}>
                <Typography sx={{ color: '#666', mb: 1 }}>
                  Confidence: {impressions.confidence}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={impressions.confidence}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 107, 0, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #ff6b00, #00ff88)'
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  {[20, 40, 60, 80, 100].map(val => (
                    <Chip
                      key={val}
                      label={`${val}%`}
                      size="small"
                      onClick={() => setImpressions(prev => ({ ...prev, confidence: val }))}
                      sx={{
                        cursor: 'pointer',
                        background: impressions.confidence === val ? '#00ff88' : 'rgba(255, 107, 0, 0.2)',
                        color: impressions.confidence === val ? '#000' : '#ff6b00'
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Button
                onClick={submitImpressions}
                disabled={loading || !impressions.primary_impression}
                fullWidth
                variant="contained"
                sx={{
                  background: 'linear-gradient(45deg, #ff6b00, #00ff88)',
                  '&:hover': { background: 'linear-gradient(45deg, #ff8533, #33ffaa)' }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Impressions'}
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {/* History Mode */}
      {mode === 'history' && (
        <Paper
          sx={{
            p: 2,
            background: 'rgba(255, 107, 0, 0.1)',
            border: '1px solid rgba(255, 107, 0, 0.3)',
            borderRadius: 3
          }}
        >
          <Typography sx={{ color: '#ff6b00', mb: 2 }}>Prediction History</Typography>

          {history.length === 0 ? (
            <Typography sx={{ color: '#666', textAlign: 'center', py: 3 }}>
              No resolved predictions yet.
            </Typography>
          ) : (
            <List>
              {history.map((pred, idx) => (
                <ListItem
                  key={pred.prediction_id || idx}
                  sx={{
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: 2,
                    mb: 1
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: '#fff' }}>{pred.question}</Typography>
                        <Chip
                          label={pred.correct ? 'Correct' : 'Incorrect'}
                          size="small"
                          sx={{
                            background: pred.correct ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 50, 50, 0.2)',
                            color: pred.correct ? '#00ff88' : '#ff5050'
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>
                        {new Date(pred.created_at).toLocaleDateString()} |
                        Selected: {pred.selected_target} |
                        Actual: {pred.actual_outcome}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}

      {/* Stats Mode */}
      {mode === 'stats' && (
        <Paper
          sx={{
            p: 3,
            background: 'rgba(255, 107, 0, 0.1)',
            border: '1px solid rgba(255, 107, 0, 0.3)',
            borderRadius: 3
          }}
        >
          <Typography sx={{ color: '#ff6b00', mb: 3 }}>Your ARV Statistics</Typography>

          {stats ? (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card sx={{ background: 'rgba(0, 0, 0, 0.3)', p: 2 }}>
                  <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>Total Predictions</Typography>
                  <Typography sx={{ color: '#ff6b00', fontSize: '2rem', fontWeight: 700 }}>
                    {stats.total_predictions}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ background: 'rgba(0, 0, 0, 0.3)', p: 2 }}>
                  <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>Resolved</Typography>
                  <Typography sx={{ color: '#00ff88', fontSize: '2rem', fontWeight: 700 }}>
                    {stats.resolved_predictions}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ background: 'rgba(0, 0, 0, 0.3)', p: 2 }}>
                  <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>Correct</Typography>
                  <Typography sx={{ color: '#00ff88', fontSize: '2rem', fontWeight: 700 }}>
                    {stats.correct_predictions}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ background: 'rgba(0, 0, 0, 0.3)', p: 2 }}>
                  <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>Accuracy Rate</Typography>
                  <Typography
                    sx={{
                      color: stats.accuracy_rate > 50 ? '#00ff88' : '#ffaa00',
                      fontSize: '2rem',
                      fontWeight: 700
                    }}
                  >
                    {stats.accuracy_rate?.toFixed(1) || 0}%
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ background: 'rgba(0, 0, 0, 0.3)', p: 2 }}>
                  <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>Current Streak</Typography>
                  <Typography sx={{ color: '#8a2be2', fontSize: '2rem', fontWeight: 700 }}>
                    {stats.current_streak || 0}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ background: 'rgba(0, 0, 0, 0.3)', p: 2 }}>
                  <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>Best Streak</Typography>
                  <Typography sx={{ color: '#ff6b00', fontSize: '2rem', fontWeight: 700 }}>
                    {stats.best_streak || 0}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CircularProgress sx={{ color: '#ff6b00' }} />
            </Box>
          )}
        </Paper>
      )}

      {/* Judge Dialog */}
      <Dialog open={judgeDialogOpen} onClose={() => setJudgeDialogOpen(false)}>
        <DialogTitle sx={{ background: '#1a1a2e', color: '#ff6b00' }}>
          Judge Prediction
        </DialogTitle>
        <DialogContent sx={{ background: '#1a1a2e' }}>
          <Typography sx={{ color: '#ccc', mb: 2 }}>
            Compare your impressions to both targets. Which one matches better?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant={judgeSelection === 'A' ? 'contained' : 'outlined'}
              onClick={() => setJudgeSelection('A')}
              sx={{
                flex: 1,
                borderColor: '#ff6b00',
                color: judgeSelection === 'A' ? '#000' : '#ff6b00',
                background: judgeSelection === 'A' ? '#ff6b00' : 'transparent'
              }}
            >
              Target A
            </Button>
            <Button
              variant={judgeSelection === 'B' ? 'contained' : 'outlined'}
              onClick={() => setJudgeSelection('B')}
              sx={{
                flex: 1,
                borderColor: '#00ff88',
                color: judgeSelection === 'B' ? '#000' : '#00ff88',
                background: judgeSelection === 'B' ? '#00ff88' : 'transparent'
              }}
            >
              Target B
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ background: '#1a1a2e' }}>
          <Button onClick={() => setJudgeDialogOpen(false)} sx={{ color: '#666' }}>
            Cancel
          </Button>
          <Button
            onClick={judgePrediction}
            disabled={!judgeSelection || loading}
            sx={{ color: '#00ff88' }}
          >
            {loading ? <CircularProgress size={20} /> : 'Confirm Selection'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)}>
        <DialogTitle sx={{ background: '#1a1a2e', color: '#ff6b00' }}>
          Resolve Prediction
        </DialogTitle>
        <DialogContent sx={{ background: '#1a1a2e' }}>
          <Typography sx={{ color: '#ccc', mb: 2 }}>
            What was the actual outcome?
          </Typography>
          {selectedPrediction && (
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant={actualOutcome === 'A' ? 'contained' : 'outlined'}
                onClick={() => setActualOutcome('A')}
                sx={{
                  flex: 1,
                  borderColor: '#ff6b00',
                  color: actualOutcome === 'A' ? '#000' : '#ff6b00',
                  background: actualOutcome === 'A' ? '#ff6b00' : 'transparent'
                }}
              >
                {selectedPrediction.outcome_a}
              </Button>
              <Button
                variant={actualOutcome === 'B' ? 'contained' : 'outlined'}
                onClick={() => setActualOutcome('B')}
                sx={{
                  flex: 1,
                  borderColor: '#00ff88',
                  color: actualOutcome === 'B' ? '#000' : '#00ff88',
                  background: actualOutcome === 'B' ? '#00ff88' : 'transparent'
                }}
              >
                {selectedPrediction.outcome_b}
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ background: '#1a1a2e' }}>
          <Button onClick={() => setResolveDialogOpen(false)} sx={{ color: '#666' }}>
            Cancel
          </Button>
          <Button
            onClick={resolvePrediction}
            disabled={!actualOutcome || loading}
            sx={{ color: '#00ff88' }}
          >
            {loading ? <CircularProgress size={20} /> : 'Resolve'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ARVPredictionsTab;
