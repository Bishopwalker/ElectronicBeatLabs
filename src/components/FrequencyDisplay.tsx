// Electromagnetic Beat Lab - Frequency Display Component
// Real-time frequency display with precision controls

import React from 'react';
import styled from 'styled-components';
import type { FrequencyDisplayProps } from '../types/index';

const Container = styled.div`
  padding: 1rem;
`;

const Title = styled.h3`
  margin-bottom: 1rem;
  color: #00ff88;
  text-align: center;
`;

const FrequencyValue = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: #00ff88;
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.6);
`;

const BeatFrequency = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 1rem;
  color: #ff6b00;
`;

const RangeLabel = styled.div`
  text-align: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: #ffffff;
`;

const SliderContainer = styled.div`
  margin-bottom: 1rem;
`;

const Slider = styled.input`
  width: 100%;
  height: 8px;
  background: linear-gradient(90deg, #ff6b00, #00ff88, #8a2be2);
  border-radius: 4px;
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(45deg, #ff6b00, #00ff88);
    border: 2px solid #ffffff;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
  }
`;

const PrecisionControls = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const PrecisionButton = styled.button`
  flex: 1;
  padding: 0.5rem;
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 107, 0, 0.2);
    border-color: #ff6b00;
  }
`;

const FrequencyDisplay: React.FC<FrequencyDisplayProps> = ({
  frequency,
  beatFreq,
  target,
  range,
  onChange
}) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onChange(value);
  };

  const handlePrecisionAdjust = (delta: number) => {
    const newFreq = Math.max(0.1, Math.min(50, frequency + delta));
    onChange(Math.round(newFreq * 10) / 10);
  };

  const getRangeInfo = (range: string) => {
    switch (range) {
      case 'delta':
        return { name: 'Delta', color: '#4a0080', description: 'Deep Sleep (0.5-4 Hz)' };
      case 'theta':
        return { name: 'Theta', color: '#0066cc', description: 'Deep Meditation (4-8 Hz)' };
      case 'alpha':
        return { name: 'Alpha', color: '#00cc66', description: 'Relaxed Awareness (8-13 Hz)' };
      case 'beta':
        return { name: 'Beta', color: '#cc6600', description: 'Normal Consciousness (13-30 Hz)' };
      case 'gamma':
        return { name: 'Gamma', color: '#cc0066', description: 'High Cognition (30-100 Hz)' };
      default:
        return { name: 'Unknown', color: '#ffffff', description: 'Unknown Range' };
    }
  };

  const rangeInfo = getRangeInfo(range);

  return (
    <Container>
      <Title>Beat Frequency</Title>
      
      <FrequencyValue>
        {frequency.toFixed(1)} Hz
      </FrequencyValue>
      
      <BeatFrequency>
        Beat: {beatFreq.toFixed(1)} Hz
      </BeatFrequency>
      
      <RangeLabel style={{ color: rangeInfo.color }}>
        {rangeInfo.name} Wave - {rangeInfo.description}
      </RangeLabel>
      
      <SliderContainer>
        <Slider
          type="range"
          min="0.1"
          max="50"
          step="0.1"
          value={frequency}
          onChange={handleSliderChange}
        />
      </SliderContainer>
      
      <PrecisionControls>
        <PrecisionButton onClick={() => handlePrecisionAdjust(-1)}>
          -1.0 Hz
        </PrecisionButton>
        <PrecisionButton onClick={() => handlePrecisionAdjust(-0.1)}>
          -0.1 Hz
        </PrecisionButton>
        <PrecisionButton onClick={() => handlePrecisionAdjust(0.1)}>
          +0.1 Hz
        </PrecisionButton>
        <PrecisionButton onClick={() => handlePrecisionAdjust(1)}>
          +1.0 Hz
        </PrecisionButton>
      </PrecisionControls>
      
      {target > 0 && (
        <div style={{ 
          marginTop: '1rem', 
          textAlign: 'center', 
          fontSize: '0.9rem',
          color: Math.abs(frequency - target) < 0.5 ? '#00ff88' : '#ffaa00'
        }}>
          Target: {target.toFixed(1)} Hz
          {Math.abs(frequency - target) < 0.1 && ' ✓ LOCKED'}
        </div>
      )}
    </Container>
  );
};

export default FrequencyDisplay;