// Electromagnetic Beat Lab - Pattern Selector Component
// Pattern selection with mode controls

import React from 'react';
import styled from 'styled-components';
import type { PatternSelectorProps, PatternMode } from '../types/index';

const Container = styled.div`
  padding: 1rem;
`;

const Title = styled.h3`
  margin-bottom: 1rem;
  color: #ff6b00;
  text-align: center;
`;

const ModeSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ModeButton = styled.button<{ active: boolean }>`
  padding: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => props.active ? 
    'linear-gradient(45deg, #ff6b00, #8a2be2)' : 
    'rgba(255, 255, 255, 0.05)'
  };
  border: 1px solid ${props => props.active ? '#ff6b00' : 'rgba(255, 255, 255, 0.1)'};
  color: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? 
      'linear-gradient(45deg, #ff8533, #9944d9)' : 
      'rgba(255, 107, 0, 0.1)'
    };
    border-color: #ff6b00;
  }
`;

const PatternList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const PatternItem = styled.div<{ selected: boolean }>`
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: ${props => props.selected ? 
    'rgba(255, 107, 0, 0.2)' : 
    'rgba(255, 255, 255, 0.03)'
  };
  border: 1px solid ${props => props.selected ? '#ff6b00' : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 107, 0, 0.1);
    border-color: #ff6b00;
  }
`;

const PatternName = styled.div`
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.25rem;
`;

const PatternType = styled.div`
  font-size: 0.8rem;
  color: #00ff88;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
`;

const PatternDescription = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.3;
`;

const PatternFreq = styled.div`
  font-size: 0.8rem;
  color: #8a2be2;
  margin-top: 0.25rem;
  font-family: 'Courier New', monospace;
`;

const PatternSelector: React.FC<PatternSelectorProps> = ({
  patterns,
  selected,
  mode,
  onSelect,
  onModeChange
}) => {
  const modes: { key: PatternMode; label: string; color: string }[] = [
    { key: 'AUTO', label: 'Auto', color: '#00ff88' },
    { key: 'MANUAL', label: 'Manual', color: '#ff6b00' },
    { key: 'OFF', label: 'Off', color: '#666666' },
    { key: 'CUSTOM', label: 'Custom', color: '#8a2be2' }
  ];

  return (
    <Container>
      <Title>Electromagnetic Patterns</Title>
      
      <ModeSelector>
        {modes.map((modeOption) => (
          <ModeButton
            key={modeOption.key}
            active={mode === modeOption.key}
            onClick={() => onModeChange(modeOption.key)}
          >
            {modeOption.label}
          </ModeButton>
        ))}
      </ModeSelector>
      
      {mode !== 'OFF' && (
        <PatternList>
          {patterns.map((pattern) => (
            <PatternItem
              key={pattern.id}
              selected={selected === pattern.id}
              onClick={() => onSelect(pattern.id)}
            >
              <PatternName>{pattern.name}</PatternName>
              <PatternType>{pattern.type}</PatternType>
              <PatternDescription>
                {pattern.description.length > 80 ? 
                  `${pattern.description.substring(0, 80)}...` : 
                  pattern.description
                }
              </PatternDescription>
              <PatternFreq>
                {pattern.frequencies.beat}Hz • {pattern.frequencies.range}
                {pattern.adhd && ' • ADHD Protocol'}
              </PatternFreq>
            </PatternItem>
          ))}
        </PatternList>
      )}
      
      {mode === 'OFF' && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '0.9rem'
        }}>
          Electromagnetic field generation disabled
        </div>
      )}
    </Container>
  );
};

export default PatternSelector;