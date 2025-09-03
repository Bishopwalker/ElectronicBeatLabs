// Electromagnetic Beat Lab - Binaural Test Component
// Test individual left/right frequencies

import React, {useState} from 'react';
import { Box, Typography, Grid, TextField, Button } from '@mui/material';
import type {BinauralTestProps} from '../types/index';

`;

const BeatFreqDisplay = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(0, 191, 255, 0.1);
  border: 1px solid rgba(0, 191, 255, 0.3);
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const BeatFreqLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
`;

const BeatFreqValue = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #00bfff;
`;

const TestButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
`;

const TestButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  background: rgba(0, 191, 255, 0.1);
  border: 1px solid rgba(0, 191, 255, 0.3);
  color: #00bfff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 191, 255, 0.2);
    border-color: #00bfff;
    box-shadow: 0 0 10px rgba(0, 191, 255, 0.3);
  }
`;

const PresetButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
`;

const PresetButton = styled.button`
  padding: 0.5rem;
  font-size: 0.7rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 191, 255, 0.1);
    border-color: #00bfff;
  }
`;

const BinauralTest: React.FC<BinauralTestProps> = ({
  leftFreq,
  rightFreq,
  onFrequencyChange
}) => {
  const [localLeftFreq, setLocalLeftFreq] = useState(leftFreq.toString());
  const [localRightFreq, setLocalRightFreq] = useState(rightFreq.toString());

  const beatFreq = Math.abs(parseFloat(localRightFreq) - parseFloat(localLeftFreq));

  const handleLeftFreqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalLeftFreq(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      onFrequencyChange(numValue, parseFloat(localRightFreq));
    }
  };

  const handleRightFreqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalRightFreq(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      onFrequencyChange(parseFloat(localLeftFreq), numValue);
    }
  };

  const applyPreset = (left: number, right: number) => {
    setLocalLeftFreq(left.toString());
    setLocalRightFreq(right.toString());
    onFrequencyChange(left, right);
  };

  const presets = [
    { name: 'Alpha 10Hz', left: 200, right: 210 },
    { name: 'Theta 6Hz', left: 200, right: 206 },
    { name: 'Gamma 40Hz', left: 200, right: 240 },
    { name: 'Beta 15Hz', left: 200, right: 215 },
    { name: 'Delta 2Hz', left: 200, right: 202 },
    { name: 'Focus 12Hz', left: 440, right: 452 }
  ];

  return (
    <Container>
      <Title>Binaural Test</Title>
      
      <FrequencyInputs>
        <InputGroup>
          <Label>Left Ear (Hz)</Label>
          <FrequencyInput
            type="number"
            min="20"
            max="2000"
            step="0.1"
            value={localLeftFreq}
            onChange={handleLeftFreqChange}
          />
        </InputGroup>
        
        <InputGroup>
          <Label>Right Ear (Hz)</Label>
          <FrequencyInput
            type="number"
            min="20"
            max="2000"
            step="0.1"
            value={localRightFreq}
            onChange={handleRightFreqChange}
          />
        </InputGroup>
      </FrequencyInputs>
      
      <BeatFreqDisplay>
        <BeatFreqLabel>Beat Frequency</BeatFreqLabel>
        <BeatFreqValue>{beatFreq.toFixed(1)} Hz</BeatFreqValue>
      </BeatFreqDisplay>
      
      <TestButtons>
        <TestButton>Test Left</TestButton>
        <TestButton>Test Right</TestButton>
        <TestButton>Test Both</TestButton>
      </TestButtons>
      
      <PresetButtons>
        {presets.map((preset, index) => (
          <PresetButton
            key={index}
            onClick={() => applyPreset(preset.left, preset.right)}
          >
            {preset.name}
          </PresetButton>
        ))}
      </PresetButtons>
    </Container>
  );
};

export default BinauralTest;