// Electromagnetic Beat Lab - Pattern Tab Component
// Pattern selection and management interface

import React from 'react';
import styled from 'styled-components';
import type { PatternConfig, PatternPreset } from '../../types/index';

const Container = styled.div`
  padding: 1rem 0;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h4`
  font-size: 1.1rem;
  color: #ff6b00;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PatternGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

const PatternCard = styled.div<{ selected: boolean }>`
  padding: 1rem;
  background: ${props => props.selected ? 
    'rgba(255, 107, 0, 0.15)' : 
    'rgba(255, 255, 255, 0.03)'
  };
  border: 1px solid ${props => props.selected ? '#ff6b00' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 107, 0, 0.1);
    border-color: #ff6b00;
    transform: translateY(-2px);
  }
`;

const PatternName = styled.div`
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const PatternType = styled.div`
  font-size: 0.8rem;
  color: #00ff88;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const PatternDescription = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  margin-bottom: 0.75rem;
`;

const PatternBenefits = styled.div`
  margin-bottom: 0.75rem;
`;

const BenefitItem = styled.div`
  font-size: 0.75rem;
  color: #8a2be2;
  margin-bottom: 0.25rem;
  &:before {
    content: '• ';
    color: #00ff88;
  }
`;

const PatternFreq = styled.div`
  font-size: 0.8rem;
  color: #ff6b00;
  font-family: 'Courier New', monospace;
  background: rgba(255, 107, 0, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

const PatternDuration = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
`;

const ADHDIndicator = styled.div`
  display: inline-block;
  background: linear-gradient(45deg, #ff1493, #8a2be2);
  color: #ffffff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

interface PatternTabProps {
  patterns: PatternConfig[];
  presets: PatternPreset[];
  appState: any;
  audioEngine: any;
  patterns8D: any;
  onStateChange: (state: any) => void;
  onPatternSelect: (patternId: string) => void;
}

const PatternTab: React.FC<PatternTabProps> = ({
  patterns,
  presets,
  appState,
  onPatternSelect
}) => {
  return (
    <Container>
      <Section>
        <SectionTitle>Electromagnetic Wave Patterns</SectionTitle>
        <PatternGrid>
          {patterns.map((pattern) => (
            <PatternCard
              key={pattern.id}
              selected={appState.currentPattern?.id === pattern.id}
              onClick={() => onPatternSelect(pattern.id)}
            >
              {pattern.adhd && <ADHDIndicator>ADHD Protocol</ADHDIndicator>}
              <PatternName>{pattern.name}</PatternName>
              <PatternType>{pattern.type}</PatternType>
              <PatternDescription>{pattern.description}</PatternDescription>
              <PatternBenefits>
                {pattern.benefits.slice(0, 3).map((benefit, index) => (
                  <BenefitItem key={index}>{benefit}</BenefitItem>
                ))}
              </PatternBenefits>
              <PatternFreq>
                {pattern.frequencies.beat}Hz • {pattern.frequencies.range}
              </PatternFreq>
              <PatternDuration>
                Duration: {pattern.duration} minutes
              </PatternDuration>
            </PatternCard>
          ))}
        </PatternGrid>
      </Section>
      
      <Section>
        <SectionTitle>Quick Presets</SectionTitle>
        <PatternGrid>
          {presets.map((preset) => (
            <PatternCard
              key={preset.id}
              selected={false}
              onClick={() => onPatternSelect(preset.pattern.id)}
            >
              <PatternName>{preset.name}</PatternName>
              <PatternType>{preset.category}</PatternType>
              <PatternDescription>{preset.pattern.description}</PatternDescription>
              <PatternFreq>
                {preset.pattern.frequencies.beat}Hz • Rating: {preset.rating}/5
              </PatternFreq>
            </PatternCard>
          ))}
        </PatternGrid>
      </Section>
    </Container>
  );
};

export default PatternTab;