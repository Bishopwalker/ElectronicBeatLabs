/**
 * Remote Viewing Sessions Tab Component
 *
 * Track and score remote viewing sessions with double-blind protocol.
 * Features:
 * - Start new RV sessions with target selection
 * - Submit impressions (drawings/descriptions)
 * - View feedback and scores
 * - Session history and statistics
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
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  keyframes
} from '@mui/material';

// Animation keyframes
const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(0, 136, 255, 0.5); }
  50% { box-shadow: 0 0 40px rgba(0, 136, 255, 0.8), 0 0 60px rgba(0, 255, 136, 0.4); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// API Configuration
const API_BASE = import.meta.env.DEV ? 'http://localhost:8080' : '';

interface RVTarget {
  target_id: string;
  coordinate: string;
  mode: string;
  status: string;
  created_at: string;
  category?: string;
  difficulty?: string;
}

interface RVSession {
  session_id: string;
  target_id: string;
  coordinate: string;
  status: string;
  created_at: string;
  score?: number;
  impressions?: string;
}

interface RVStats {
  total_sessions: number;
  completed_sessions: number;
  average_score: number;
  best_score: number;
  current_streak: number;
  best_streak: number;
}

interface Impression {
  primary_impression: string;
  secondary_details: string;
  confidence: number;
}

const RVSessionsTab: React.FC = () => {
  const [mode, setMode] = useState<'practice' | 'history' | 'stats'>('practice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Active session state
  const [activeSession, setActiveSession] = useState<RVSession | null>(null);
  const [activeTarget, setActiveTarget] = useState<RVTarget | null>(null);

  // Impression form state
  const [impression, setImpression] = useState<Impression>({
    primary_impression: '',
    secondary_details: '',
    confidence: 50
  });

  // History and stats
  const [history, setHistory] = useState<RVSession[]>([]);
  const [stats, setStats] = useState<RVStats | null>(null);

  // Feedback state (after submission)
  const [feedback, setFeedback] = useState<{
    target_name: string;
    target_image?: string;
    target_category: string;
    score: number;
  } | null>(null);

  // Start a new RV session
  const startSession = async () => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    setImpression({ primary_impression: '', secondary_details: '', confidence: 50 });

    try {
      // Get a practice target
      const targetResponse = await fetch(`${API_BASE}/api/rv/targets/practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!targetResponse.ok) throw new Error('Failed to get target');
      const target: RVTarget = await targetResponse.json();
      setActiveTarget(target);

      // Start session with this target
      const sessionResponse = await fetch(`${API_BASE}/api/rv/sessions/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_id: target.target_id,
          mode: 'practice'
        })
      });

      if (!sessionResponse.ok) throw new Error('Failed to start session');
      const session: RVSession = await sessionResponse.json();
      setActiveSession(session);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  // Submit impressions
  const submitImpressions = async () => {
    if (!activeSession || !activeTarget) return;

    setLoading(true);
    setError(null);

    try {
      // Submit impressions to target
      const impressionResponse = await fetch(
        `${API_BASE}/api/rv/targets/${activeTarget.target_id}/impressions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(impression)
        }
      );

      if (!impressionResponse.ok) throw new Error('Failed to submit impressions');

      // Get feedback (reveals target)
      const feedbackResponse = await fetch(
        `${API_BASE}/api/rv/targets/${activeTarget.target_id}/feedback`
      );

      if (!feedbackResponse.ok) throw new Error('Failed to get feedback');
      const feedbackData = await feedbackResponse.json();

      // Score the session
      const scoreResponse = await fetch(
        `${API_BASE}/api/rv/sessions/${activeSession.session_id}/score`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            impressions: `${impression.primary_impression} ${impression.secondary_details}`,
            confidence: impression.confidence
          })
        }
      );

      if (scoreResponse.ok) {
        const scoreData = await scoreResponse.json();
        setFeedback({
          ...feedbackData,
          score: scoreData.score || 0
        });
      } else {
        setFeedback(feedbackData);
      }

      setSuccess('Session completed! Check your results below.');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/rv/history?limit=20`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.sessions || []);
      }
    } catch {
      // History is optional
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/rv/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch {
      // Stats are optional
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (mode === 'history') fetchHistory();
    if (mode === 'stats') fetchStats();
  }, [mode, fetchHistory, fetchStats]);

  const handleModeChange = (_: React.SyntheticEvent, newValue: 'practice' | 'history' | 'stats') => {
    setMode(newValue);
    setError(null);
    setSuccess(null);
  };

  const resetSession = () => {
    setActiveSession(null);
    setActiveTarget(null);
    setFeedback(null);
    setImpression({ primary_impression: '', secondary_details: '', confidence: 50 });
    setError(null);
    setSuccess(null);
  };

  return (
    <Box sx={{ py: 1 }}>
      <Typography
        variant="h5"
        component="h4"
        sx={{
          color: '#0088ff',
          mb: 2,
          textAlign: 'center',
          textShadow: '0 0 10px rgba(0, 136, 255, 0.5)'
        }}
      >
        Remote Viewing Sessions
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
        Double-blind protocol for RV training and practice
      </Typography>

      {/* Mode Tabs */}
      <Tabs
        value={mode}
        onChange={handleModeChange}
        centered
        sx={{
          mb: 2,
          '& .MuiTab-root': {
            color: '#0088ff',
            '&.Mui-selected': { color: '#00ff88' }
          },
          '& .MuiTabs-indicator': { backgroundColor: '#00ff88' }
        }}
      >
        <Tab value="practice" label="Practice" />
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

      {/* Practice Mode */}
      {mode === 'practice' && (
        <Box>
          {!activeSession && !feedback ? (
            // Start Session View
            <Paper
              sx={{
                p: 3,
                background: 'rgba(0, 136, 255, 0.1)',
                border: '1px solid rgba(0, 136, 255, 0.3)',
                borderRadius: 3,
                textAlign: 'center'
              }}
            >
              <Typography sx={{ color: '#0088ff', mb: 3 }}>
                Ready to start a remote viewing session?
              </Typography>

              <Typography sx={{ color: '#666', mb: 3, fontSize: '0.9rem' }}>
                You will receive a coordinate for a hidden target.
                Record your impressions without knowing what the target is.
                After submission, the target will be revealed and scored.
              </Typography>

              <Button
                onClick={startSession}
                disabled={loading}
                variant="contained"
                size="large"
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(45deg, #0088ff, #00ff88)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #0099ff, #33ffaa)'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Start Session'}
              </Button>
            </Paper>
          ) : activeSession && !feedback ? (
            // Active Session - Record Impressions
            <Paper
              sx={{
                p: 3,
                background: 'rgba(0, 136, 255, 0.1)',
                border: '1px solid rgba(0, 136, 255, 0.3)',
                borderRadius: 3,
                animation: `${pulseGlow} 4s ease-in-out infinite`
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography sx={{ color: '#666', mb: 1 }}>Target Coordinate</Typography>
                <Typography
                  sx={{
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    fontFamily: 'Courier New, monospace',
                    color: '#00ff88',
                    letterSpacing: '0.2em'
                  }}
                >
                  {activeTarget?.coordinate || activeSession.coordinate}
                </Typography>
              </Box>

              <Divider sx={{ my: 2, borderColor: 'rgba(0, 136, 255, 0.3)' }} />

              <Typography sx={{ color: '#0088ff', mb: 2 }}>
                Record Your Impressions
              </Typography>

              <TextField
                label="Primary Impression"
                placeholder="What do you perceive? (shapes, colors, textures, feelings)"
                value={impression.primary_impression}
                onChange={(e) => setImpression(prev => ({ ...prev, primary_impression: e.target.value }))}
                fullWidth
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Secondary Details"
                placeholder="Additional details, movements, sounds, temperatures..."
                value={impression.secondary_details}
                onChange={(e) => setImpression(prev => ({ ...prev, secondary_details: e.target.value }))}
                fullWidth
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />

              <Box sx={{ mb: 3 }}>
                <Typography sx={{ color: '#666', mb: 1 }}>
                  Confidence Level: {impression.confidence}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={impression.confidence}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'rgba(0, 136, 255, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #0088ff, #00ff88)'
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  {[20, 40, 60, 80, 100].map(val => (
                    <Chip
                      key={val}
                      label={`${val}%`}
                      size="small"
                      onClick={() => setImpression(prev => ({ ...prev, confidence: val }))}
                      sx={{
                        cursor: 'pointer',
                        background: impression.confidence === val ? '#00ff88' : 'rgba(0, 136, 255, 0.2)',
                        color: impression.confidence === val ? '#000' : '#0088ff'
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  onClick={resetSession}
                  variant="outlined"
                  sx={{ flex: 1, borderColor: '#666', color: '#666' }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitImpressions}
                  disabled={loading || !impression.primary_impression}
                  variant="contained"
                  sx={{
                    flex: 2,
                    background: 'linear-gradient(45deg, #0088ff, #00ff88)',
                    '&:hover': { background: 'linear-gradient(45deg, #0099ff, #33ffaa)' }
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit & Reveal'}
                </Button>
              </Box>
            </Paper>
          ) : feedback ? (
            // Feedback View
            <Paper
              sx={{
                p: 3,
                background: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: 3,
                animation: `${fadeIn} 0.5s ease-out`
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: '#00ff88', mb: 2, textAlign: 'center' }}
              >
                Target Revealed!
              </Typography>

              <Card sx={{ mb: 3, background: 'rgba(0, 0, 0, 0.3)' }}>
                <CardContent>
                  <Typography sx={{ color: '#0088ff', fontSize: '0.9rem' }}>
                    Target Name
                  </Typography>
                  <Typography sx={{ color: '#fff', fontSize: '1.5rem', fontWeight: 600 }}>
                    {feedback.target_name}
                  </Typography>
                  <Chip
                    label={feedback.target_category}
                    size="small"
                    sx={{ mt: 1, background: 'rgba(0, 136, 255, 0.2)', color: '#0088ff' }}
                  />
                </CardContent>
              </Card>

              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography sx={{ color: '#666', mb: 1 }}>Your Score</Typography>
                <Typography
                  sx={{
                    fontSize: '3rem',
                    fontWeight: 700,
                    color: feedback.score >= 70 ? '#00ff88' : feedback.score >= 40 ? '#ffaa00' : '#ff5050'
                  }}
                >
                  {feedback.score}%
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>
                    Your Impression
                  </Typography>
                  <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                    {impression.primary_impression}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>
                    Confidence
                  </Typography>
                  <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                    {impression.confidence}%
                  </Typography>
                </Grid>
              </Grid>

              <Button
                onClick={resetSession}
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  background: 'linear-gradient(45deg, #0088ff, #00ff88)',
                  '&:hover': { background: 'linear-gradient(45deg, #0099ff, #33ffaa)' }
                }}
              >
                Start New Session
              </Button>
            </Paper>
          ) : null}
        </Box>
      )}

      {/* History Mode */}
      {mode === 'history' && (
        <Box>
          <Paper
            sx={{
              p: 2,
              background: 'rgba(0, 136, 255, 0.1)',
              border: '1px solid rgba(0, 136, 255, 0.3)',
              borderRadius: 3
            }}
          >
            <Typography sx={{ color: '#0088ff', mb: 2 }}>Session History</Typography>

            {history.length === 0 ? (
              <Typography sx={{ color: '#666', textAlign: 'center', py: 3 }}>
                No sessions yet. Start practicing to build your history!
              </Typography>
            ) : (
              <List>
                {history.map((session, idx) => (
                  <ListItem
                    key={session.session_id || idx}
                    sx={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: 2,
                      mb: 1
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ color: '#fff' }}>
                            {session.coordinate || 'Session'}
                          </Typography>
                          <Chip
                            label={`${session.score || 0}%`}
                            size="small"
                            sx={{
                              background: (session.score || 0) >= 70 ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 170, 0, 0.2)',
                              color: (session.score || 0) >= 70 ? '#00ff88' : '#ffaa00'
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>
                          {new Date(session.created_at).toLocaleDateString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      )}

      {/* Stats Mode */}
      {mode === 'stats' && (
        <Box>
          <Paper
            sx={{
              p: 3,
              background: 'rgba(0, 136, 255, 0.1)',
              border: '1px solid rgba(0, 136, 255, 0.3)',
              borderRadius: 3
            }}
          >
            <Typography sx={{ color: '#0088ff', mb: 3 }}>Your Statistics</Typography>

            {stats ? (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card sx={{ background: 'rgba(0, 0, 0, 0.3)', p: 2 }}>
                    <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>Total Sessions</Typography>
                    <Typography sx={{ color: '#00ff88', fontSize: '2rem', fontWeight: 700 }}>
                      {stats.total_sessions}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ background: 'rgba(0, 0, 0, 0.3)', p: 2 }}>
                    <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>Completed</Typography>
                    <Typography sx={{ color: '#0088ff', fontSize: '2rem', fontWeight: 700 }}>
                      {stats.completed_sessions}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ background: 'rgba(0, 0, 0, 0.3)', p: 2 }}>
                    <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>Average Score</Typography>
                    <Typography sx={{ color: '#ffaa00', fontSize: '2rem', fontWeight: 700 }}>
                      {stats.average_score?.toFixed(1) || 0}%
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ background: 'rgba(0, 0, 0, 0.3)', p: 2 }}>
                    <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>Best Score</Typography>
                    <Typography sx={{ color: '#00ff88', fontSize: '2rem', fontWeight: 700 }}>
                      {stats.best_score || 0}%
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ background: 'rgba(0, 0, 0, 0.3)', p: 2 }}>
                    <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>Current Streak</Typography>
                    <Typography sx={{ color: '#ff6b00', fontSize: '2rem', fontWeight: 700 }}>
                      {stats.current_streak || 0}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ background: 'rgba(0, 0, 0, 0.3)', p: 2 }}>
                    <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>Best Streak</Typography>
                    <Typography sx={{ color: '#8a2be2', fontSize: '2rem', fontWeight: 700 }}>
                      {stats.best_streak || 0}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CircularProgress sx={{ color: '#0088ff' }} />
                <Typography sx={{ color: '#666', mt: 2 }}>Loading stats...</Typography>
              </Box>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default RVSessionsTab;
