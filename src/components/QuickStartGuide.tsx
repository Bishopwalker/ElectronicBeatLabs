// Quick Start Guide Component
// Clear step-by-step instructions for using the application

import React, { useState } from 'react';
import styled from 'styled-components';

const Overlay = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 2000;
  display: ${props => props.$show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
`;

const Modal = styled.div`
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(20, 0, 20, 0.9));
  border: 2px solid #ff6b00;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(255, 107, 0, 0.3);
`;

const Title = styled.h2`
  color: #ff6b00;
  margin: 0 0 1.5rem 0;
  text-align: center;
  font-size: 1.8rem;
  text-shadow: 0 0 10px rgba(255, 107, 0, 0.5);
`;

const Step = styled.div<{ $number: number }>`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid #00ff88;

  &::before {
    content: "${props => props.$number}";
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: #00ff88;
    color: black;
    border-radius: 50%;
    font-weight: bold;
    margin-right: 1rem;
    flex-shrink: 0;
  }
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h3`
  color: #00ff88;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
`;

const StepDescription = styled.p`
  color: #e0e0e0;
  margin: 0;
  line-height: 1.5;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
`;

const Button = styled.button`
  background: linear-gradient(45deg, #ff6b00, #8a2be2);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  text-transform: uppercase;
  
  &:hover {
    background: linear-gradient(45deg, #ff8533, #9944d9);
    transform: translateY(-1px);
  }
`;

const ToggleButton = styled.button`
  position: fixed;
  top: 10px;
  left: 10px;
  background: rgba(255, 107, 0, 0.9);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  z-index: 1001;
  font-size: 0.8rem;
  
  &:hover {
    background: rgba(255, 107, 0, 1);
  }
`;

interface QuickStartGuideProps {
  autoShow?: boolean;
}

const QuickStartGuide: React.FC<QuickStartGuideProps> = ({ autoShow = true }) => {
  const [isVisible, setIsVisible] = useState(autoShow);

  const steps = [
    {
      title: "🎵 Test Audio First",
      description: "Click the orange 'Start 4Hz Beat' button in the top-right corner. You should hear different tones in each ear creating a beating effect. Use headphones for best results."
    },
    {
      title: "🎛️ Choose a Pattern",
      description: "In the left panel, select a binaural beat pattern like 'Maximum Resonance Toroid' or 'Focus Enhancement Vortex'. Each pattern has different frequencies and benefits."
    },
    {
      title: "▶️ Start the Session",
      description: "Click the PLAY button in the main controls. The electromagnetic field visualization will start, and you'll hear the binaural beats. Close your eyes and relax."
    },
    {
      title: "🔧 Adjust Settings",
      description: "Use the frequency controls to fine-tune the beat frequency (1-40Hz). Lower frequencies (1-8Hz) are relaxing, higher frequencies (15-40Hz) are for focus and alertness."
    },
    {
      title: "🎚️ Control Volume",
      description: "Adjust volume to a comfortable level. The beats should be audible but not distracting. You can work, meditate, or focus on tasks while listening."
    },
    {
      title: "⏹️ Stop When Done",
      description: "Click STOP when finished. Sessions typically last 10-30 minutes. For ADHD protocols, follow the specific duration recommendations in the ADHD tab."
    }
  ];

  return (
    <>
      <ToggleButton onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? 'Hide Guide' : 'Show Guide'}
      </ToggleButton>

      <Overlay $show={isVisible}>
        <Modal>
          <Title>🚀 Quick Start Guide</Title>
          
          {steps.map((step, index) => (
            <Step key={index} $number={index + 1}>
              <StepContent>
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </StepContent>
            </Step>
          ))}

          <ButtonContainer>
            <Button onClick={() => setIsVisible(false)}>
              Got It!
            </Button>
          </ButtonContainer>
        </Modal>
      </Overlay>
    </>
  );
};

export default QuickStartGuide;