// Electromagnetic Beat Lab - ADHD Tab Component
// ADHD-specific gamma wave protocols

import React from 'react';
import styled from 'styled-components';
import { ADHD_PROTOCOLS } from '../../data/patterns';
import type { AppState, AudioEngineState, Pattern8D, ADHDProtocol } from '../../types';

const Container = styled.div`
  padding: 1rem 0;
`;

const ProtocolGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const ProtocolCard = styled.div`
  padding: 1rem;
  background: rgba(255, 20, 147, 0.1);
  border: 1px solid rgba(255, 20, 147, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 20, 147, 0.15);
    transform: translateY(-2px);
  }
`;

const ProtocolName = styled.h4`
  color: #ff1493;
  margin-bottom: 0.5rem;
`;

const ProtocolType = styled.div`
  color: #8a2be2;
  font-size: 0.9rem;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const GammaFreq = styled.div`
  color: #00ff88;
  font-family: 'Courier New', monospace;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const Effectiveness = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
`;

interface ADHDTabProps {
  appState: AppState;
  audioEngine: AudioEngineState;
  patterns8D: Pattern8D[];
  onStateChange: (state: Partial<AppState>) => void;
}

const ADHDTab: React.FC<ADHDTabProps> = ({
  audioEngine
}) => {
  const handleProtocolSelect = (protocol: ADHDProtocol) => {
    audioEngine.createGammaProtocol(protocol.gammaFreq, protocol.duration);
  };

  return (
    <Container>
      <h4 style={{ color: '#ff1493', marginBottom: '1rem' }}>ADHD Gamma Protocols</h4>
      
      <ProtocolGrid>
        {ADHD_PROTOCOLS.map((protocol) => (
          <ProtocolCard
            key={protocol.id}
            onClick={() => handleProtocolSelect(protocol)}
          >
            <ProtocolName>{protocol.name}</ProtocolName>
            <ProtocolType>{protocol.type}</ProtocolType>
            <GammaFreq>{protocol.gammaFreq}Hz Gamma Wave</GammaFreq>
            <Effectiveness>
              Effectiveness: {(protocol.effectiveness * 100).toFixed(0)}%
            </Effectiveness>
          </ProtocolCard>
        ))}
      </ProtocolGrid>
    </Container>
  );
};

export default ADHDTab;