// Simple Audio Test Component
// Basic binaural beat test for immediate audio verification

import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: fixed;
  top: 50px;
  right: 10px;
  background: rgba(0, 0, 0, 0.9);
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid #ff6b00;
  z-index: 1000;
  min-width: 200px;
`;

const Title = styled.h3`
  color: #ff6b00;
  margin: 0 0 1rem 0;
  font-size: 1rem;
`;

const Button = styled.button`
  background: linear-gradient(45deg, #ff6b00, #8a2be2);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin: 0.25rem 0;
  width: 100%;
  
  &:hover {
    background: linear-gradient(45deg, #ff8533, #9944d9);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Status = styled.div<{ $isPlaying: boolean }>`
  color: ${props => props.$isPlaying ? '#00ff88' : '#666'};
  font-size: 0.8rem;
  margin-top: 0.5rem;
`;

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
    <Container>
      <Title>🎵 Audio Test</Title>
      
      <Button 
        onClick={startTest}
        disabled={isPlaying}
      >
        Start 4Hz Beat
      </Button>
      
      <Button 
        onClick={stopTest}
        disabled={!isPlaying}
      >
        Stop Audio
      </Button>
      
      <Status $isPlaying={isPlaying}>
        {isPlaying ? '▶ Playing 4Hz Binaural Beat' : '⏹ Audio Stopped'}
      </Status>
    </Container>
  );
};

export default SimpleAudioTest;