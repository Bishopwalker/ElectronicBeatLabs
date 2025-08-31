// Electromagnetic Beat Lab - Wave Guide Panel Component
// Advanced wave guide configuration and visualization

import React from 'react';
import styled from 'styled-components';
import type { WaveGuidePanelProps } from '../types/index';

const Container = styled.div`
  padding: 1rem;
`;

const Title = styled.h3`
  margin-bottom: 1rem;
  color: #ffd700;
  text-align: center;
`;

const ConfigSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h4`
  font-size: 0.9rem;
  color: #ffffff;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ParameterGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Parameter = styled.div`
  display: flex;
  flex-direction: column;
`;

const ParameterLabel = styled.label`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.25rem;
`;

const ParameterInput = styled.input`
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #ffffff;
  font-size: 0.8rem;
  
  &:focus {
    border-color: #ffd700;
    box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
  }
`;

const ParameterSelect = styled.select`
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #ffffff;
  font-size: 0.8rem;
  
  option {
    background: #1a1a1a;
    color: #ffffff;
  }
  
  &:focus {
    border-color: #ffd700;
    box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
  }
`;

const WaveGuideVisualization = styled.div`
  width: 100%;
  height: 150px;
  background: radial-gradient(circle at center, 
    rgba(255, 215, 0, 0.1) 0%, 
    rgba(0, 0, 0, 0.8) 100%
  );
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GuideShape = styled.div<{ 
  type: string; 
  width: number; 
  height: number; 
  material: string 
}>`
  border: 2px solid ${props => {
    switch (props.material) {
      case 'copper': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'plasma': return '#FF00FF';
      default: return '#ffffff';
    }
  }};
  
  ${props => {
    switch (props.type) {
      case 'toroidal':
        return `
          width: ${Math.min(props.width * 0.3, 80)}px;
          height: ${Math.min(props.height * 0.3, 80)}px;
          border-radius: 50%;
          box-shadow: 
            inset 0 0 20px rgba(255, 215, 0, 0.3),
            0 0 20px rgba(255, 215, 0, 0.2);
        `;
      case 'circular':
        return `
          width: ${Math.min(props.width * 0.4, 100)}px;
          height: ${Math.min(props.height * 0.4, 100)}px;
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
        `;
      case 'elliptical':
        return `
          width: ${Math.min(props.width * 0.4, 120)}px;
          height: ${Math.min(props.height * 0.3, 60)}px;
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
        `;
      case 'linear':
        return `
          width: ${Math.min(props.width * 0.6, 150)}px;
          height: ${Math.min(props.height * 0.2, 20)}px;
          border-radius: 4px;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
        `;
      default:
        return `
          width: 60px;
          height: 60px;
          border-radius: 8px;
        `;
    }
  }}
  
  background: ${props => {
    switch (props.material) {
      case 'plasma': return 'radial-gradient(circle, rgba(255, 0, 255, 0.2), transparent)';
      default: return 'transparent';
    }
  }};
`;

const ResonanceDisplay = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const ResonanceLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.25rem;
`;

const ResonanceValue = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffd700;
`;

const ImpedanceDisplay = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
`;

const WaveGuidePanel: React.FC<WaveGuidePanelProps> = ({
  config,
  onChange
}) => {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...config,
      type: e.target.value as any
    });
  };

  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...config,
      material: e.target.value as any
    });
  };

  const handleDimensionChange = (dimension: 'width' | 'height' | 'depth', value: string) => {
    onChange({
      ...config,
      dimensions: {
        ...config.dimensions,
        [dimension]: parseFloat(value) || 0
      }
    });
  };

  const handleResonanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...config,
      resonance: parseFloat(e.target.value) || 0
    });
  };

  return (
    <Container>
      <Title>Wave Guide</Title>
      
      <ConfigSection>
        <SectionTitle>Configuration</SectionTitle>
        
        <ParameterGroup>
          <Parameter>
            <ParameterLabel>Type</ParameterLabel>
            <ParameterSelect value={config.type} onChange={handleTypeChange}>
              <option value="toroidal">Toroidal</option>
              <option value="circular">Circular</option>
              <option value="elliptical">Elliptical</option>
              <option value="linear">Linear</option>
            </ParameterSelect>
          </Parameter>
          
          <Parameter>
            <ParameterLabel>Material</ParameterLabel>
            <ParameterSelect value={config.material} onChange={handleMaterialChange}>
              <option value="copper">Copper</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="plasma">Plasma</option>
            </ParameterSelect>
          </Parameter>
        </ParameterGroup>
        
        <ParameterGroup>
          <Parameter>
            <ParameterLabel>Width (mm)</ParameterLabel>
            <ParameterInput
              type="number"
              value={config.dimensions.width}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
            />
          </Parameter>
          
          <Parameter>
            <ParameterLabel>Height (mm)</ParameterLabel>
            <ParameterInput
              type="number"
              value={config.dimensions.height}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
            />
          </Parameter>
        </ParameterGroup>
        
        <Parameter>
          <ParameterLabel>Resonance (Hz)</ParameterLabel>
          <ParameterInput
            type="number"
            step="0.1"
            value={config.resonance}
            onChange={handleResonanceChange}
          />
        </Parameter>
      </ConfigSection>
      
      <WaveGuideVisualization>
        <GuideShape
          type={config.type}
          width={config.dimensions.width}
          height={config.dimensions.height}
          material={config.material}
        />
      </WaveGuideVisualization>
      
      <ResonanceDisplay>
        <ResonanceLabel>Resonant Frequency</ResonanceLabel>
        <ResonanceValue>{config.resonance.toFixed(1)} Hz</ResonanceValue>
        <ImpedanceDisplay>
          Impedance: {config.impedance}Ω
        </ImpedanceDisplay>
      </ResonanceDisplay>
    </Container>
  );
};

export default WaveGuidePanel;