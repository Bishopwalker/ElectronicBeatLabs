// Electromagnetic Beat Lab - Electromagnetic Status Component
// Real-time electromagnetic field status display

import React from 'react';
import styled from 'styled-components';
import type { ElectromagneticStatusProps } from '../types/index';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatusIndicator = styled.div<{ state: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => {
    switch (props.state) {
      case 'INACTIVE': return '#666666';
      case 'CHARGING': return '#ffaa00';
      case 'ACTIVE': return '#00ff88';
      case 'RESONANT': return '#ff6b00';
      case 'CRITICAL': return '#ff0066';
      default: return '#666666';
    }
  }};
  box-shadow: 0 0 10px ${props => {
    switch (props.state) {
      case 'INACTIVE': return 'rgba(102, 102, 102, 0.5)';
      case 'CHARGING': return 'rgba(255, 170, 0, 0.5)';
      case 'ACTIVE': return 'rgba(0, 255, 136, 0.5)';
      case 'RESONANT': return 'rgba(255, 107, 0, 0.5)';
      case 'CRITICAL': return 'rgba(255, 0, 102, 0.5)';
      default: return 'rgba(102, 102, 102, 0.5)';
    }
  }};
  animation: ${props => props.state !== 'INACTIVE' ? 'pulse 1s ease-in-out infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.2); }
  }
`;

const StatusText = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FieldStrength = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: #00ff88;
  margin-left: auto;
`;

const CoherenceBar = styled.div`
  width: 80px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
`;

const CoherenceLevel = styled.div<{ level: number }>`
  height: 100%;
  width: ${props => props.level * 100}%;
  background: linear-gradient(90deg, #ff6b00, #00ff88);
  transition: width 0.3s ease;
`;

const ElectromagneticStatus: React.FC<ElectromagneticStatusProps> = ({
  field
}) => {
  const getStateLabel = (state: string) => {
    switch (state) {
      case 'INACTIVE': return 'Inactive';
      case 'CHARGING': return 'Charging';
      case 'ACTIVE': return 'Active';
      case 'RESONANT': return 'Resonant';
      case 'CRITICAL': return 'Critical';
      default: return 'Unknown';
    }
  };

  return (
    <Container>
      <StatusIndicator state={field.state} />
      <StatusText>{getStateLabel(field.state)}</StatusText>
      <FieldStrength>
        {(field.strength * 100).toFixed(0)}%
      </FieldStrength>
      <CoherenceBar>
        <CoherenceLevel level={field.coherence} />
      </CoherenceBar>
    </Container>
  );
};

export default ElectromagneticStatus;