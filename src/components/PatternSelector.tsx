// Electromagnetic Beat Lab - Pattern Selector Component
// Pattern selection with mode controls

import React from 'react';
import { Box, Typography, Grid, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type {PatternMode, PatternSelectorProps} from '../types/index';

const modes: PatternMode[] = ['AUTO', 'MANUAL', 'PRESET', 'OFF'];
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
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 107, 0, 0.5) rgba(0, 0, 0, 0.3);
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #ff6b00, #8a2be2);
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(255, 107, 0, 0.5);
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(45deg, #ff8533, #9944d9);
    box-shadow: 0 0 15px rgba(255, 107, 0, 0.7);
  }
`;

const PatternItem = styled.div<{ selected: boolean }>`
  padding: 0.5rem;
  margin-bottom: 0.25rem;
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
  margin-bottom: 0.15rem;
  font-size: 0.9rem;
`;

const PatternType = styled.div`
  font-size: 0.7rem;
  color: #00ff88;
  text-transform: uppercase;
  margin-bottom: 0.15rem;
`;

const PatternDescription = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.2;
`;

const PatternFreq = styled.div`
  font-size: 0.7rem;
  color: #8a2be2;
  margin-top: 0.15rem;
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