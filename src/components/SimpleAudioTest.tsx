// Simple Audio Test Component
// Basic binaural beat test for immediate audio verification

import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';

const SimpleAudioTest: React.FC = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [oscillators, setOscillators] = useState<{ left: OscillatorNode | null, right: OscillatorNode | null }>({ left: null, right: null });
  const [isPlaying, setIsPlaying] = useState(false);

  const startTest = async () => {
    try {
      const context = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      if (context.state === 'suspended') {
        await context.resume();
      }

      // 440Hz left, 444Hz right = 4Hz binaural beat
      const oscLeft = context.createOscillator();
      const oscRight = context.createOscillator();
      
      const gainLeft = context.createGain();
      const gainRight = context.createGain();
      
      const pannerLeft = context.createStereoPanner();
      const pannerRight = context.createStereoPanner();

      // Configure oscillators
      oscLeft.frequency.value = 440;
      oscRight.frequency.value = 444;
      oscLeft.type = 'sine';
      oscRight.type = 'sine';

      // Configure gain (volume)
      gainLeft.gain.value = 0.1;
      gainRight.gain.value = 0.1;

      // Configure panners
      pannerLeft.pan.value = -1; // Full left
      pannerRight.pan.value = 1;  // Full right

      // Connect audio graph
      oscLeft.connect(gainLeft).connect(pannerLeft).connect(context.destination);
      oscRight.connect(gainRight).connect(pannerRight).connect(context.destination);

      // Start oscillators
      oscLeft.start();
      oscRight.start();

      setAudioContext(context);
      setOscillators({ left: oscLeft, right: oscRight });
      setIsPlaying(true);

      console.log('Binaural beat test started: 440Hz (L) / 444Hz (R) = 4Hz beat');

    } catch (error) {
      console.error('Audio test failed:', error);
      alert('Audio test failed. Check console for details.');
    }
  };

  const stopTest = () => {
    if (oscillators.left) {
      oscillators.left.stop();
      oscillators.left.disconnect();
    }
    
    if (oscillators.right) {
      oscillators.right.stop();
      oscillators.right.disconnect();
    }

    if (audioContext) {
      audioContext.close();
    }

    setOscillators({ left: null, right: null });
    setAudioContext(null);
    setIsPlaying(false);

    console.log('Binaural beat test stopped');
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 50,
        right: 10,
        background: 'rgba(0, 0, 0, 0.9)',
        p: 2,
        borderRadius: 2,
        border: '2px solid #ff6b00',
        zIndex: 1000,
        minWidth: 200
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: '#ff6b00',
          m: 0,
          mb: 2,
          fontSize: '1rem'
        }}
      >
        🎵 Audio Test
      </Typography>
      
      <Button
        variant="contained"
        onClick={startTest}
        disabled={isPlaying}
        fullWidth
        sx={{
          background: 'linear-gradient(45deg, #ff6b00, #8a2be2)',
          mb: 1,
          '&:hover': {
            background: 'linear-gradient(45deg, #ff8533, #9944d9)',
          },
          '&:disabled': {
            opacity: 0.5
          }
        }}
      >
        Start 4Hz Beat
      </Button>
      
      <Button
        variant="contained"
        onClick={stopTest}
        disabled={!isPlaying}
        fullWidth
        sx={{
          background: 'linear-gradient(45deg, #ff6b00, #8a2be2)',
          mb: 1,
          '&:hover': {
            background: 'linear-gradient(45deg, #ff8533, #9944d9)',
          },
          '&:disabled': {
            opacity: 0.5
          }
        }}
      >
        Stop Audio
      </Button>
      
      <Typography
        variant="body2"
        sx={{
          color: isPlaying ? '#00ff88' : '#666',
          fontSize: '0.8rem',
          mt: 1
        }}
      >
        {isPlaying ? '▶ Playing 4Hz Binaural Beat' : '⏹ Audio Stopped'}
      </Typography>
    </Box>
  );
};

export default SimpleAudioTest;