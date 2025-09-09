import React, { useState, useCallback } from 'react';
import { Box, Button, Typography, Paper, Slider, Grid, Alert } from '@mui/material';
import { useBinauralVisualizerEngine } from '../hooks/useBinauralVisualizerEngine';
import { useWebSocket } from '../hooks/useWebSocket';
import { FrequencyVisualizer } from './FrequencyVisualizer';

export const BinauralVisualizerTest: React.FC = () => {
  const [leftFreq, setLeftFreq] = useState(440);
  const [rightFreq, setRightFreq] = useState(444);
  const [amplitude, setAmplitude] = useState(0.3);
  const [sessionId, setSessionId] = useState<string>('test-session-' + Date.now());

  const binauralEngine = useBinauralVisualizerEngine();
  const websocket = useWebSocket();

  // Handle WebSocket frequency transition messages
  const handleWebSocketMessage = useCallback(() => {
    if (!websocket.state.lastMessage) return;

    const message = websocket.state.lastMessage;
    console.log('🔄 Test: Received WebSocket message:', message.type);

    if (message.type === 'frequency_transition' && message.data) {
      const { leftFreq: newLeft, rightFreq: newRight, transition_duration = 2.0 } = message.data;
      
      console.log('🌊 Test: Processing frequency transition -', 
                  'Left:', leftFreq, '→', newLeft, 'Hz,',
                  'Right:', rightFreq, '→', newRight, 'Hz');

      // Use smooth transition
      binauralEngine.transitionFrequencies(newLeft, newRight, transition_duration);
      
      // Update local state
      setLeftFreq(newLeft);
      setRightFreq(newRight);
    }
  }, [websocket.state.lastMessage, binauralEngine, leftFreq, rightFreq]);

  // Auto-handle WebSocket messages
  React.useEffect(() => {
    handleWebSocketMessage();
  }, [handleWebSocketMessage]);

  // Start binaural beats
  const handleStart = async () => {
    const success = await binauralEngine.createBinauralBeats({
      leftFreq,
      rightFreq,
      amplitude,
      waveform: 'sine'
    });

    if (success) {
      console.log('✅ Test: Binaural beats started successfully');
    } else {
      console.error('❌ Test: Failed to start binaural beats');
    }
  };

  // Stop binaural beats
  const handleStop = () => {
    binauralEngine.stopBinauralBeats();
    console.log('🛑 Test: Binaural beats stopped');
  };

  // Connect WebSocket for testing
  const handleConnectWebSocket = () => {
    websocket.connect(sessionId);
    console.log('🔌 Test: Connecting WebSocket with session:', sessionId);
  };

  // Disconnect WebSocket
  const handleDisconnectWebSocket = () => {
    websocket.disconnect();
    console.log('🔌 Test: WebSocket disconnected');
  };

  // Simulate frequency transition from backend
  const simulateFrequencyTransition = () => {
    const transitions = [
      { left: 200, right: 208, beat: 8 },  // Delta
      { left: 300, right: 306, beat: 6 },  // Theta
      { left: 400, right: 410, beat: 10 }, // Alpha
      { left: 500, right: 515, beat: 15 }, // Beta
      { left: 250, right: 254, beat: 4 },  // Back to Delta
    ];

    let currentTransition = 0;

    const sendTransition = () => {
      const transition = transitions[currentTransition];
      
      // Simulate WebSocket message from backend
      websocket.sendMessage({
        type: 'frequency_transition',
        data: {
          leftFreq: transition.left,
          rightFreq: transition.right,
          beatFreq: transition.beat,
          transition_duration: 3.0,
          session_progress: ((currentTransition + 1) / transitions.length) * 100
        }
      });

      currentTransition = (currentTransition + 1) % transitions.length;
      
      console.log('🎯 Test: Sent simulated transition to', transition.left, 'Hz /', transition.right, 'Hz');
    };

    sendTransition();
    
    // Send multiple transitions for testing
    const interval = setInterval(() => {
      sendTransition();
      if (currentTransition === 0) {
        clearInterval(interval);
        console.log('✅ Test: Completed full transition cycle');
      }
    }, 5000); // 5 seconds between transitions
  };

  // Manual frequency update
  const handleManualFrequencyUpdate = () => {
    binauralEngine.updateFrequencies(leftFreq, rightFreq);
  };

  return (
    <Paper sx={{ p: 3, m: 2, background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)' }}>
      <Typography variant="h5" gutterBottom sx={{ color: '#fff', textAlign: 'center' }}>
        🎧 Binaural Visualizer Engine Test
      </Typography>

      <Grid container spacing={3}>
        {/* Control Panel */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
              Audio Controls
            </Typography>

            {/* Frequency Controls */}
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom sx={{ color: '#00d4ff' }}>
                Left Frequency: {leftFreq} Hz
              </Typography>
              <Slider
                value={leftFreq}
                min={50}
                max={1000}
                onChange={(_, value) => setLeftFreq(value as number)}
                sx={{ color: '#00d4ff' }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom sx={{ color: '#ff9500' }}>
                Right Frequency: {rightFreq} Hz
              </Typography>
              <Slider
                value={rightFreq}
                min={50}
                max={1000}
                onChange={(_, value) => setRightFreq(value as number)}
                sx={{ color: '#ff9500' }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom sx={{ color: '#fff' }}>
                Amplitude: {amplitude.toFixed(2)}
              </Typography>
              <Slider
                value={amplitude}
                min={0}
                max={1}
                step={0.01}
                onChange={(_, value) => setAmplitude(value as number)}
                sx={{ color: '#fff' }}
              />
            </Box>

            <Typography variant="body2" sx={{ color: '#4caf50', mb: 2 }}>
              Binaural Beat: {Math.abs(rightFreq - leftFreq).toFixed(1)} Hz
            </Typography>

            {/* Control Buttons */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Button 
                variant="contained" 
                onClick={handleStart}
                disabled={binauralEngine.state.isPlaying}
                sx={{ backgroundColor: '#4caf50' }}
              >
                Start Audio
              </Button>
              <Button 
                variant="contained" 
                onClick={handleStop}
                disabled={!binauralEngine.state.isPlaying}
                sx={{ backgroundColor: '#f44336' }}
              >
                Stop Audio
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleManualFrequencyUpdate}
                disabled={!binauralEngine.state.isPlaying}
              >
                Update Frequencies
              </Button>
            </Box>

            {/* WebSocket Controls */}
            <Typography variant="h6" gutterBottom sx={{ color: '#fff', mt: 3 }}>
              WebSocket Testing
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Button 
                variant="outlined" 
                onClick={handleConnectWebSocket}
                disabled={websocket.state.connected}
                color="primary"
              >
                Connect WebSocket
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleDisconnectWebSocket}
                disabled={!websocket.state.connected}
                color="secondary"
              >
                Disconnect
              </Button>
              <Button 
                variant="contained" 
                onClick={simulateFrequencyTransition}
                disabled={!websocket.state.connected || !binauralEngine.state.isPlaying}
                sx={{ backgroundColor: '#9c27b0' }}
              >
                Test Transitions
              </Button>
            </Box>

            {/* Status Display */}
            <Box sx={{ mt: 2 }}>
              <Alert severity={websocket.state.connected ? 'success' : 'warning'}>
                WebSocket: {websocket.state.connected ? 'Connected' : 'Disconnected'}
                {websocket.state.error && ` (${websocket.state.error})`}
              </Alert>
            </Box>

            <Box sx={{ mt: 1 }}>
              <Alert severity={binauralEngine.state.isPlaying ? 'success' : 'info'}>
                Audio Engine: {binauralEngine.state.isPlaying ? 'Playing' : 'Stopped'}
                {binauralEngine.state.isPlaying && 
                  ` (${binauralEngine.state.leftFreq}Hz / ${binauralEngine.state.rightFreq}Hz)`}
              </Alert>
            </Box>
          </Paper>
        </Grid>

        {/* Visualization Panel */}
        <Grid item xs={12} md={6}>
          <FrequencyVisualizer
            getVisualizationData={binauralEngine.state.isPlaying ? binauralEngine.getVisualizationData : null}
            title="Real-time Frequency Analysis"
            height={300}
            width={600}
          />
        </Grid>

        {/* Full Width Visualizer */}
        <Grid item xs={12}>
          {binauralEngine.state.isPlaying && (
            <FrequencyVisualizer
              getVisualizationData={binauralEngine.getVisualizationData}
              title="Full Spectrum Analysis"
              height={250}
              width={1200}
            />
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};