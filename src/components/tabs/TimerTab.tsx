// Electromagnetic Beat Lab - Timer Tab Component
import React from 'react';
import styled from 'styled-components';
import TimerControls from '../TimerControls';
import type { AppState, AudioEngine, Pattern8D } from '../../types';

const Container = styled.div`
  padding: 1rem 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h4`
  font-size: 1.2rem;
  color: #ff6b00;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  text-align: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

interface TimerTabProps {
  appState: AppState;
  audioEngine: AudioEngine;
  patterns8D: Pattern8D[];
  onStateChange: (state: Partial<AppState>) => void;
}

const TimerTab: React.FC<TimerTabProps> = () => {
  return (
    <Container>
      <SectionTitle>Frequency Timer Sessions</SectionTitle>
      <Description>
        Schedule automated frequency transitions for extended sessions. 
        Perfect for sleep induction, meditation progressions, and lucid dreaming protocols.
      </Description>
      <TimerControls />
    </Container>
  );
};

export default TimerTab;