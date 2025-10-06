import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import TuneIcon from '@mui/icons-material/Tune';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import BrainIcon from '@mui/icons-material/Psychology';
import { useAudioAgentState } from '../hooks/useAudioAgentState';

interface AudioAgentState {
  status: string;
  engine_state: {
    is_initialized: boolean;
    is_playing: boolean;
    sample_rate: number;
    bit_depth: number;
    active_generators: number;
    error_count: number;
  };
  active_sessions: number;
  available_patterns: number;
}

interface AudioRequest {
  type: 'binaural' | 'isochronic' | 'em_field';
  config: {
    base_frequency?: number;
    beat_frequency?: number;
    frequency?: number;
    pulse_rate?: number;
    field_strength?: number;
    duration?: number;
    amplitude?: number;
  };
}

interface FrequencyPreset {
  base_frequency: number;
  beat_frequencies: number[];
  brainwave_target: string;
  description: string;
  duration: number;
  source: string;
}

const AudioAgentTab: React.FC = () => {
  // Use the new Audio Agent state management hook
  const [agentState, agentActions] = useAudioAgentState();
  const [presets, setPresets] = useState<Record<string, FrequencyPreset>>({});

  // Audio generation settings (sync with state)
  const audioType = agentState.audioConfig.type as 'binaural' | 'isochronic' | 'em_field';
  const baseFrequency = agentState.audioConfig.baseFrequency;
  const beatFrequency = agentState.audioConfig.beatFrequency;
  const duration = agentState.audioConfig.duration;
  const amplitude = agentState.audioConfig.amplitude;
  const [pulseRate, setPulseRate] = useState(8);
  const [fieldStrength, setFieldStrength] = useState(1.0);

  // Derived state
  const loading = !agentState.isInitialized;
  const generating = agentState.agentStatus === 'generating';
  const error = agentState.error;

  // Load presets on mount
  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const response = await fetch('/api/agents/audio/patterns');
      if (response.ok) {
        const data = await response.json();
        setPresets(data.frequency_presets || {});
      }
    } catch (err) {
      console.error('Error loading presets:', err);
    }
  };

  const generateAudio = async () => {
    setGenerating(true);
    setError(null);

    try {
      // For now, demonstrate by optimizing parameters for the existing WebSocket system
      if (audioType === 'binaural') {
        // Calculate optimal frequencies for existing system
        const leftFreq = baseFrequency - (beatFrequency / 2);
        const rightFreq = baseFrequency + (beatFrequency / 2);

        console.log('🎵 Audio Agent Parameters:');
        console.log(`   Type: ${audioType.toUpperCase()}`);
        console.log(`   Base Frequency: ${baseFrequency} Hz`);
        console.log(`   Beat Frequency: ${beatFrequency} Hz`);
        console.log(`   Left Ear: ${leftFreq} Hz`);
        console.log(`   Right Ear: ${rightFreq} Hz`);
        console.log(`   Brainwave Target: ${getBrainwaveCategory(beatFrequency)}`);
        console.log(`   Duration: ${duration}s`);
        console.log(`   Volume: ${Math.round(amplitude * 100)}%`);

        // Send message to parent to update the main audio engine
        if (window.parent) {
          window.parent.postMessage({
            type: 'audio_agent_request',
            data: {
              audioType,
              baseFrequency,
              beatFrequency,
              leftFreq,
              rightFreq,
              duration,
              amplitude,
              brainwaveTarget: getBrainwaveCategory(beatFrequency)
            }
          }, '*');
        }

        // Also call the Audio Agent API for analysis
        const config = {
          base_frequency: baseFrequency,
          beat_frequency: beatFrequency,
          duration: Math.min(duration, 30), // Limit to 30s for demo
          amplitude
        };

        const request: AudioRequest = {
          type: audioType,
          config
        };

        const response = await fetch('/api/agents/audio/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Audio Agent Analysis Complete:', result.data);

          alert(`🎵 Audio Agent Configuration Applied!

✅ Binaural Beat Settings:
• Base: ${baseFrequency} Hz
• Beat: ${beatFrequency} Hz (${getBrainwaveCategory(beatFrequency)})
• Left Ear: ${leftFreq.toFixed(1)} Hz
• Right Ear: ${rightFreq.toFixed(1)} Hz
• Quality Score: ${result.data.quality_score?.toFixed(2) || 'N/A'}

🎧 Use the main audio generator to play with these optimized settings!`);
        } else {
          const error = await response.json();
          setError(error.error || 'Failed to generate audio analysis');
        }
      } else {
        // For other audio types, just show the configuration
        console.log(`🎵 Audio Agent Configuration - ${audioType.toUpperCase()}:`);
        if (audioType === 'isochronic') {
          console.log(`   Frequency: ${baseFrequency} Hz`);
          console.log(`   Pulse Rate: ${pulseRate} Hz`);
        } else if (audioType === 'em_field') {
          console.log(`   Field Strength: ${fieldStrength}`);
          console.log(`   Schumann Resonance: 7.83 Hz base`);
        }
        console.log(`   Duration: ${duration}s`);
        console.log(`   Volume: ${Math.round(amplitude * 100)}%`);

        alert(`⚡ ${audioType.toUpperCase()} Configuration Ready!

This advanced audio type will be integrated with the main audio engine in a future update.

Current settings logged to console for reference.`);
      }

    } catch (err) {
      setError('Failed to configure audio');
      console.error('Error in Audio Agent:', err);
    } finally {
      setGenerating(false);
    }
  };

  const loadPreset = (presetName: string) => {
    const preset = presets[presetName];
    if (preset) {
      setBaseFrequency(preset.base_frequency);
      setBeatFrequency(preset.beat_frequencies[0] || 10);
      setDuration(preset.duration);
    }
  };

  const getBrainwaveCategory = (freq: number): string => {
    if (freq < 4) return 'Delta - Deep Sleep';
    if (freq < 8) return 'Theta - Meditation';
    if (freq < 13) return 'Alpha - Relaxation';
    if (freq < 15) return 'SMR - ADHD Focus';
    if (freq < 30) return 'Beta - Concentration';
    return 'Gamma - Peak Performance';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2, color: 'white' }}>
          Loading Audio Agent...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, minHeight: 'calc(100vh - 64px)', color: 'white' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <BrainIcon sx={{ mr: 2, color: '#ff6b00' }} />
        Audio Agent Control Center
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Agent Status */}
      <Card sx={{ mb: 3, bgcolor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <GraphicEqIcon sx={{ mr: 1 }} />
            Agent Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Status</Typography>
              <Chip
                label={agentState?.status || 'Unknown'}
                color={agentState?.status === 'running' ? 'success' : 'error'}
                size="small"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Sample Rate</Typography>
              <Typography variant="body1">{agentState?.engine_state.sample_rate} Hz</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Active Sessions</Typography>
              <Typography variant="body1">{agentState?.active_sessions}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Available Patterns</Typography>
              <Typography variant="body1">{agentState?.available_patterns}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Frequency Presets */}
      <Card sx={{ mb: 3, bgcolor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Frequency Presets
          </Typography>
          <Grid container spacing={1}>
            {Object.entries(presets).map(([name, preset]) => (
              <Grid item key={name} xs={6} md={4}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => loadPreset(name)}
                  sx={{
                    width: '100%',
                    color: 'white',
                    borderColor: '#ff6b00',
                    '&:hover': { borderColor: '#ff8c00', bgcolor: 'rgba(255, 107, 0, 0.1)' }
                  }}
                >
                  <Box textAlign="left" sx={{ width: '100%' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {preset.brainwave_target} • {preset.base_frequency}Hz
                    </Typography>
                  </Box>
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Audio Generation Controls */}
      <Card sx={{ mb: 3, bgcolor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <TuneIcon sx={{ mr: 1 }} />
            Audio Generation
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'white' }}>Audio Type</InputLabel>
                <Select
                  value={audioType}
                  onChange={(e) => setAudioType(e.target.value as any)}
                  sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ff6b00' } }}
                >
                  <MenuItem value="binaural">Binaural Beats</MenuItem>
                  <MenuItem value="isochronic">Isochronic Tones</MenuItem>
                  <MenuItem value="em_field">EM Field Audio</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {audioType === 'binaural' && (
              <>
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom sx={{ color: 'white' }}>
                    Base Frequency: {baseFrequency} Hz
                  </Typography>
                  <Slider
                    value={baseFrequency}
                    onChange={(_, value) => setBaseFrequency(value as number)}
                    min={80}
                    max={800}
                    sx={{ color: '#ff6b00' }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom sx={{ color: 'white' }}>
                    Beat Frequency: {beatFrequency} Hz
                  </Typography>
                  <Slider
                    value={beatFrequency}
                    onChange={(_, value) => setBeatFrequency(value as number)}
                    min={0.5}
                    max={50}
                    step={0.5}
                    sx={{ color: '#ff6b00' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {getBrainwaveCategory(beatFrequency)}
                  </Typography>
                </Grid>
              </>
            )}

            {audioType === 'isochronic' && (
              <>
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom sx={{ color: 'white' }}>
                    Frequency: {baseFrequency} Hz
                  </Typography>
                  <Slider
                    value={baseFrequency}
                    onChange={(_, value) => setBaseFrequency(value as number)}
                    min={80}
                    max={800}
                    sx={{ color: '#ff6b00' }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom sx={{ color: 'white' }}>
                    Pulse Rate: {pulseRate} Hz
                  </Typography>
                  <Slider
                    value={pulseRate}
                    onChange={(_, value) => setPulseRate(value as number)}
                    min={0.5}
                    max={50}
                    step={0.5}
                    sx={{ color: '#ff6b00' }}
                  />
                </Grid>
              </>
            )}

            {audioType === 'em_field' && (
              <Grid item xs={12} md={4}>
                <Typography gutterBottom sx={{ color: 'white' }}>
                  Field Strength: {fieldStrength}
                </Typography>
                <Slider
                  value={fieldStrength}
                  onChange={(_, value) => setFieldStrength(value as number)}
                  min={0.1}
                  max={3.0}
                  step={0.1}
                  sx={{ color: '#ff6b00' }}
                />
              </Grid>
            )}

            <Grid item xs={12} md={4}>
              <Typography gutterBottom sx={{ color: 'white' }}>
                Duration: {duration} seconds
              </Typography>
              <Slider
                value={duration}
                onChange={(_, value) => setDuration(value as number)}
                min={5}
                max={3600}
                sx={{ color: '#ff6b00' }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography gutterBottom sx={{ color: 'white' }}>
                Volume: {Math.round(amplitude * 100)}%
              </Typography>
              <Slider
                value={amplitude}
                onChange={(_, value) => setAmplitude(value as number)}
                min={0.1}
                max={1.0}
                step={0.05}
                sx={{ color: '#ff6b00' }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={generateAudio}
              disabled={generating || !agentState?.engine_state.is_initialized}
              startIcon={generating ? <CircularProgress size={20} /> : <PlayArrowIcon />}
              sx={{
                bgcolor: '#ff6b00',
                '&:hover': { bgcolor: '#ff8c00' },
                minWidth: 200,
                mr: 2
              }}
            >
              {generating ? 'Generating...' : 'Generate Audio'}
            </Button>

            {generating && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress sx={{ '& .MuiLinearProgress-bar': { bgcolor: '#ff6b00' } }} />
                <Typography variant="body2" color="text.secondary">
                  Generating {audioType} audio...
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Performance Optimization Card */}
      {agentState?.engine_state.error_count > 0 && (
        <Card sx={{ mb: 3, bgcolor: 'rgba(255, 140, 0, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 140, 0, 0.3)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: '#ff8c00' }}>
              ⚠️ Performance Optimization
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Detected audio buffer underruns. For optimal performance:
            </Alert>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Close unnecessary browser tabs and applications
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Use wired headphones instead of Bluetooth for lower latency
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Try reducing beat frequencies below 30 Hz for smoother processing
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Consider using 44.1kHz sample rate (current: {agentState.engine_state.sample_rate} Hz)
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            🧠 How to Use the Audio Agent
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Binaural Beats:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Uses different frequencies in each ear to create a beat frequency that entrains brainwaves.
                Requires headphones for proper effect.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Isochronic Tones:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pulsed audio that turns on and off at regular intervals. Works with speakers or headphones.
                Good for focus and concentration.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                EM Field Audio:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Audio representation of electromagnetic fields using Schumann resonances.
                Creates natural Earth frequencies for grounding and balance.
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AudioAgentTab;