/**
 * CRV Protocol Tab Component
 *
 * Controlled Remote Viewing 6-stage protocol interface.
 * Based on Ingo Swann's Stanford Research Institute methodology.
 *
 * Features:
 * - Stage-by-stage guided interface
 * - Binaural frequency recommendations per stage
 * - Timer and progression tracking
 * - Session save and review
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  Chip,
  Card,
  CardContent,
  Grid,
  Divider,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  keyframes
} from '@mui/material';

// Animation keyframes
const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 15px rgba(138, 43, 226, 0.4); }
  50% { box-shadow: 0 0 30px rgba(138, 43, 226, 0.7); }
`;

const breathe = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

// API Configuration
const API_BASE = import.meta.env.DEV ? 'http://localhost:8000' : '';

interface CRVStage {
  stage_number: number;
  name: string;
  description: string;
  objectives: string[];
  duration_minutes: number;
  techniques: string[];
  frequency_recommendation: {
    beat_frequency: number;
    brain_state: string;
    description: string;
  };
}

interface CRVSession {
  session_id: string;
  coordinate: string;
  current_stage: number;
  status: string;
  created_at: string;
  stage_data: Record<string, string>;
}

interface StageInput {
  impressions: string;
  sketches?: string;
  aol_declarations?: string;
}

const CRVProtocolTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // CRV stages info
  const [stages, setStages] = useState<CRVStage[]>([]);

  // Active session
  const [activeSession, setActiveSession] = useState<CRVSession | null>(null);
  const [activeStage, setActiveStage] = useState(0);

  // Stage input
  const [stageInput, setStageInput] = useState<StageInput>({
    impressions: '',
    sketches: '',
    aol_declarations: ''
  });

  // Timer
  const [stageTimer, setStageTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Fetch CRV stages info
  const fetchStages = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/rv/crv/stages`);
      if (response.ok) {
        const data = await response.json();
        setStages(data.stages || []);
      }
    } catch (err) {
      console.error('Failed to fetch CRV stages:', err);
    }
  }, []);

  // Start a new CRV session
  const startSession = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/rv/crv/sessions/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'practice' })
      });

      if (!response.ok) throw new Error('Failed to start CRV session');

      const session: CRVSession = await response.json();
      setActiveSession(session);
      setActiveStage(0);
      setStageInput({ impressions: '', sketches: '', aol_declarations: '' });
      setSuccess('CRV session started! Begin with Stage 1.');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  // Submit stage data
  const submitStage = async () => {
    if (!activeSession) return;

    setLoading(true);
    setError(null);

    try {
      const stageNumber = activeStage + 1;
      const response = await fetch(
        `${API_BASE}/api/rv/crv/sessions/${activeSession.session_id}/stage/${stageNumber}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stageInput)
        }
      );

      if (!response.ok) throw new Error('Failed to submit stage');

      // Move to next stage
      if (activeStage < 5) {
        setActiveStage(prev => prev + 1);
        setStageInput({ impressions: '', sketches: '', aol_declarations: '' });
        setStageTimer(0);
        setSuccess(`Stage ${stageNumber} completed! Moving to Stage ${stageNumber + 1}.`);
      } else {
        setSuccess('CRV session completed! All 6 stages finished.');
        // Could fetch final results here
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit stage');
    } finally {
      setLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setStageTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Format timer
  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initial fetch
  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  const resetSession = () => {
    setActiveSession(null);
    setActiveStage(0);
    setStageInput({ impressions: '', sketches: '', aol_declarations: '' });
    setStageTimer(0);
    setTimerRunning(false);
    setError(null);
    setSuccess(null);
  };

  const currentStageInfo = stages[activeStage];

  return (
    <Box sx={{ py: 1 }}>
      <Typography
        variant="h5"
        component="h4"
        sx={{
          color: '#8a2be2',
          mb: 2,
          textAlign: 'center',
          textShadow: '0 0 10px rgba(138, 43, 226, 0.5)'
        }}
      >
        CRV Protocol
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
        Ingo Swann's 6-Stage Controlled Remote Viewing Methodology
      </Typography>

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

      {!activeSession ? (
        // Start Session View
        <Box>
          <Paper
            sx={{
              p: 3,
              background: 'rgba(138, 43, 226, 0.1)',
              border: '1px solid rgba(138, 43, 226, 0.3)',
              borderRadius: 3,
              mb: 3
            }}
          >
            <Typography sx={{ color: '#8a2be2', mb: 2, fontWeight: 600 }}>
              About CRV Protocol
            </Typography>
            <Typography sx={{ color: '#ccc', mb: 2, fontSize: '0.9rem' }}>
              Controlled Remote Viewing (CRV) is a structured protocol developed at Stanford Research Institute.
              It consists of 6 progressive stages, each building upon the previous to systematically
              decode target information from subconscious perception.
            </Typography>

            <Grid container spacing={2}>
              {stages.slice(0, 6).map((stage, idx) => (
                <Grid item xs={6} sm={4} key={idx}>
                  <Card sx={{ background: 'rgba(0, 0, 0, 0.3)', height: '100%' }}>
                    <CardContent sx={{ p: 1.5 }}>
                      <Typography sx={{ color: '#8a2be2', fontWeight: 600, fontSize: '0.9rem' }}>
                        Stage {stage.stage_number}
                      </Typography>
                      <Typography sx={{ color: '#fff', fontSize: '0.8rem' }}>
                        {stage.name}
                      </Typography>
                      <Chip
                        label={`${stage.frequency_recommendation?.beat_frequency || 0}Hz ${stage.frequency_recommendation?.brain_state || ''}`}
                        size="small"
                        sx={{
                          mt: 1,
                          fontSize: '0.7rem',
                          background: 'rgba(0, 255, 136, 0.2)',
                          color: '#00ff88'
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Button
            onClick={startSession}
            disabled={loading}
            fullWidth
            variant="contained"
            size="large"
            sx={{
              py: 2,
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #8a2be2, #00ff88)',
              '&:hover': {
                background: 'linear-gradient(45deg, #9b4dff, #33ffaa)'
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Start CRV Session'}
          </Button>
        </Box>
      ) : (
        // Active Session View
        <Box>
          {/* Session Header */}
          <Paper
            sx={{
              p: 2,
              mb: 2,
              background: 'rgba(138, 43, 226, 0.1)',
              border: '1px solid rgba(138, 43, 226, 0.3)',
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box>
              <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>Target Coordinate</Typography>
              <Typography sx={{ color: '#00ff88', fontFamily: 'monospace', fontSize: '1.2rem' }}>
                {activeSession.coordinate}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>Stage Timer</Typography>
              <Typography sx={{ color: '#8a2be2', fontSize: '1.2rem', fontFamily: 'monospace' }}>
                {formatTimer(stageTimer)}
              </Typography>
              <Button
                size="small"
                onClick={() => setTimerRunning(!timerRunning)}
                sx={{ color: timerRunning ? '#ff5050' : '#00ff88', fontSize: '0.7rem' }}
              >
                {timerRunning ? 'Pause' : 'Start'}
              </Button>
            </Box>
          </Paper>

          {/* Progress Indicator */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ color: '#8a2be2' }}>Progress</Typography>
              <Typography sx={{ color: '#00ff88' }}>{activeStage + 1} / 6</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={((activeStage + 1) / 6) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(138, 43, 226, 0.2)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #8a2be2, #00ff88)'
                }
              }}
            />
          </Box>

          {/* Stage Content */}
          {currentStageInfo && (
            <Paper
              sx={{
                p: 3,
                background: 'rgba(138, 43, 226, 0.1)',
                border: '1px solid rgba(138, 43, 226, 0.3)',
                borderRadius: 3,
                animation: `${pulseGlow} 4s ease-in-out infinite`
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography sx={{ color: '#8a2be2', fontSize: '1.3rem', fontWeight: 600 }}>
                    Stage {currentStageInfo.stage_number}: {currentStageInfo.name}
                  </Typography>
                  <Typography sx={{ color: '#ccc', fontSize: '0.9rem', mt: 1 }}>
                    {currentStageInfo.description}
                  </Typography>
                </Box>
                <Chip
                  label={`${currentStageInfo.frequency_recommendation?.beat_frequency || 0}Hz`}
                  sx={{
                    background: 'linear-gradient(45deg, #8a2be2, #00ff88)',
                    color: '#fff',
                    fontWeight: 600
                  }}
                />
              </Box>

              <Divider sx={{ my: 2, borderColor: 'rgba(138, 43, 226, 0.3)' }} />

              {/* Objectives */}
              <Typography sx={{ color: '#00ff88', mb: 1, fontSize: '0.9rem' }}>
                Objectives:
              </Typography>
              <Box sx={{ mb: 2 }}>
                {currentStageInfo.objectives?.map((obj, idx) => (
                  <Chip
                    key={idx}
                    label={obj}
                    size="small"
                    sx={{
                      mr: 1,
                      mb: 1,
                      background: 'rgba(0, 255, 136, 0.15)',
                      color: '#00ff88',
                      fontSize: '0.75rem'
                    }}
                  />
                ))}
              </Box>

              {/* Frequency Recommendation */}
              <Card sx={{ background: 'rgba(0, 0, 0, 0.3)', mb: 3 }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>
                    Recommended Binaural Frequency
                  </Typography>
                  <Typography sx={{ color: '#8a2be2', fontSize: '1.2rem', fontWeight: 600 }}>
                    {currentStageInfo.frequency_recommendation?.beat_frequency || 0} Hz - {currentStageInfo.frequency_recommendation?.brain_state || ''}
                  </Typography>
                  <Typography sx={{ color: '#999', fontSize: '0.8rem' }}>
                    {currentStageInfo.frequency_recommendation?.description || ''}
                  </Typography>
                </CardContent>
              </Card>

              {/* Input Fields */}
              <TextField
                label="Impressions & Ideograms"
                placeholder="Record your spontaneous impressions, ideograms, and gestalt responses..."
                value={stageInput.impressions}
                onChange={(e) => setStageInput(prev => ({ ...prev, impressions: e.target.value }))}
                fullWidth
                multiline
                rows={4}
                sx={{ mb: 2 }}
              />

              {activeStage >= 2 && (
                <TextField
                  label="Sketches & Diagrams (describe)"
                  placeholder="Describe any sketches, dimensional data, or spatial relationships..."
                  value={stageInput.sketches || ''}
                  onChange={(e) => setStageInput(prev => ({ ...prev, sketches: e.target.value }))}
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                />
              )}

              <TextField
                label="AOL Declarations"
                placeholder="Analytical Overlay - Note any mental guesses or assumptions to set aside..."
                value={stageInput.aol_declarations || ''}
                onChange={(e) => setStageInput(prev => ({ ...prev, aol_declarations: e.target.value }))}
                fullWidth
                multiline
                rows={2}
                sx={{ mb: 3 }}
              />

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  onClick={resetSession}
                  variant="outlined"
                  sx={{ flex: 1, borderColor: '#666', color: '#666' }}
                >
                  End Session
                </Button>
                <Button
                  onClick={submitStage}
                  disabled={loading || !stageInput.impressions}
                  variant="contained"
                  sx={{
                    flex: 2,
                    background: 'linear-gradient(45deg, #8a2be2, #00ff88)',
                    '&:hover': { background: 'linear-gradient(45deg, #9b4dff, #33ffaa)' }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : activeStage < 5 ? (
                    `Complete Stage ${activeStage + 1} →`
                  ) : (
                    'Finish Session'
                  )}
                </Button>
              </Box>
            </Paper>
          )}

          {/* Stage Progress Stepper */}
          <Paper
            sx={{
              p: 2,
              mt: 2,
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: 2
            }}
          >
            <Stepper activeStep={activeStage} alternativeLabel>
              {stages.slice(0, 6).map((stage, idx) => (
                <Step key={idx}>
                  <StepLabel
                    sx={{
                      '& .MuiStepLabel-label': {
                        color: idx <= activeStage ? '#00ff88' : '#666',
                        fontSize: '0.7rem'
                      },
                      '& .MuiStepIcon-root': {
                        color: idx < activeStage ? '#00ff88' : idx === activeStage ? '#8a2be2' : '#333'
                      }
                    }}
                  >
                    {stage.name}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default CRVProtocolTab;
