// Electromagnetic Beat Lab - Guide Tab Component
// Pattern explanations and instructions

import React from 'react';
import styled from 'styled-components';
import { PATTERN_EXPLANATIONS } from '../../data/patterns';
import type { AppState, AudioEngineState, Pattern8D } from '../../types';

const Container = styled.div`
  padding: 1rem 0;
`;

const GuideCard = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
`;

const GuideTitle = styled.h4`
  color: #00ff88;
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;

const GuideDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const GuideScience = styled.div`
  background: rgba(0, 191, 255, 0.1);
  padding: 1rem;
  border-left: 4px solid #00bfff;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
`;

const BenefitsList = styled.ul`
  margin-bottom: 1rem;
  padding-left: 1.5rem;
`;

const BenefitItem = styled.li`
  color: #8a2be2;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const InstructionsList = styled.ol`
  padding-left: 1.5rem;
`;

const InstructionItem = styled.li`
  color: #ff6b00;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

interface GuideTabProps {
  appState: AppState;
  audioEngine: AudioEngineState;
  patterns8D: Pattern8D[];
  onStateChange: (state: Partial<AppState>) => void;
}

const GuideTab: React.FC<GuideTabProps> = () => {
  return (
    <Container>
      <h4 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>Electromagnetic Wave Guide</h4>
      
      {Object.entries(PATTERN_EXPLANATIONS).map(([key, explanation]) => (
        <GuideCard key={key}>
          <GuideTitle>{explanation.title}</GuideTitle>
          <GuideDescription>{explanation.description}</GuideDescription>
          
          <GuideScience>
            <strong>Scientific Basis:</strong> {explanation.science}
          </GuideScience>
          
          <div style={{ marginBottom: '1rem' }}>
            <h5 style={{ color: '#8a2be2', marginBottom: '0.5rem' }}>Benefits:</h5>
            <BenefitsList>
              {explanation.benefits.map((benefit, index) => (
                <BenefitItem key={index}>{benefit}</BenefitItem>
              ))}
            </BenefitsList>
          </div>
          
          <div>
            <h5 style={{ color: '#ff6b00', marginBottom: '0.5rem' }}>Instructions:</h5>
            <InstructionsList>
              {explanation.instructions.map((instruction, index) => (
                <InstructionItem key={index}>{instruction}</InstructionItem>
              ))}
            </InstructionsList>
          </div>
        </GuideCard>
      ))}
    </Container>
  );
};

export default GuideTab;