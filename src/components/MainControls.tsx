// Electromagnetic Beat Lab - Main Controls Component
// Primary playback and volume controls

import React from 'react';
import { Box, Typography, Button, Slider } from '@mui/material';
import { PlayArrow, Stop, VolumeUp } from '@mui/icons-material';
import type {MainControlsProps} from '../types/index';

  overflow: hidden;
  
  ${props => props.primary ? `
    background: linear-gradient(45deg, #ff6b00, #8a2be2);
    border: 2px solid transparent;
    color: #ffffff;
    
    &:hover {
      background: linear-gradient(45deg, #ff8533, #9944d9);
      box-shadow: 0 0 20px rgba(255, 107, 0, 0.4);
      transform: translateY(-2px);
    }
  ` : `
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    
    &:hover {
      background: rgba(255, 107, 0, 0.1);
      border-color: #ff6b00;
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const VolumeSection = styled.div`
  margin-bottom: 0.5rem;
`;

const VolumeLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #ffffff;
  text-align: center;
`;

const VolumeSlider = styled.input`
  width: 100%;
  height: 8px;
  background: linear-gradient(
    90deg,
    rgba(138, 43, 226, 0.3) 0%,
    rgba(255, 107, 0, 0.5) 50%,
    rgba(255, 0, 102, 0.7) 100%
  );
  border-radius: 4px;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(45deg, #8a2be2, #ff6b00);
    border: 2px solid #ffffff;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(138, 43, 226, 0.5);
    transition: all 0.3s ease;
  }
  
  &::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 0 15px rgba(138, 43, 226, 0.7);
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(45deg, #8a2be2, #ff6b00);
    border: 2px solid #ffffff;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(138, 43, 226, 0.5);
    transition: all 0.3s ease;
  }
`;

const VolumeDisplay = styled.div`
  text-align: center;
  margin-top: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  color: #8a2be2;
  font-weight: 700;
`;

const StatusDisplay = styled.div`
  text-align: center;
  padding: 0.25rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  margin-top: 0.5rem;
`;

const MainControls: React.FC<MainControlsProps> = ({
  isPlaying,
  volume,
  onPlay,
  onStop,
  onVolumeChange
}) => {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onVolumeChange(value);
  };

  return (
    <Container>
      <Title>Master Controls</Title>
      
      <PlaybackControls>
        <ControlButton
          primary
          onClick={isPlaying ? onStop : onPlay}
        >
          {isPlaying ? '⏹ Stop' : '▶ Play'}
        </ControlButton>
      </PlaybackControls>
      
      <VolumeSection>
        <VolumeLabel>Master Volume</VolumeLabel>
        <VolumeSlider
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
        />
        <VolumeDisplay>
          {Math.round(volume * 100)}%
        </VolumeDisplay>
      </VolumeSection>
      
      <StatusDisplay>
        {isPlaying ? 
          'Electromagnetic field active - Binaural beats playing' : 
          'Ready to generate electromagnetic resonance'
        }
      </StatusDisplay>
    </Container>
  );
};

export default MainControls;