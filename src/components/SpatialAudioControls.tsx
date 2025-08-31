// Spatial Audio Controls Component
// 8D audio effects and spatial positioning controls

import React from 'react';
import styled from 'styled-components';

interface SpatialAudioControlsProps {
  settings: {
    enabled: boolean;
    movement_speed: number;
    spatial_intensity: number;
    reverb_enabled: boolean;
    reverberance?: number;
    room_scale?: number;
    hf_damping?: number;
  };
  onChange: (settings: any) => void;
}

const Container = styled.div`
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(255, 107, 0, 0.2);
  max-height: 250px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 107, 0, 0.5) rgba(0, 0, 0, 0.3);
  
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

const Title = styled.h3`
  color: #ff6b00;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ControlGroup = styled.div`
  margin-bottom: 0.5rem;
`;

const Label = styled.label`
  display: block;
  color: #e0e0e0;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
  font-weight: 500;
`;

const Slider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  height: 6px;
  background: linear-gradient(90deg, rgba(255, 107, 0, 0.3), rgba(0, 255, 136, 0.3));
  outline: none;
  border-radius: 3px;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    background: linear-gradient(45deg, #ff6b00, #00ff88);
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 0 10px rgba(255, 107, 0, 0.5);
    transition: all 0.3s ease;
  }
  
  &::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 0 15px rgba(255, 107, 0, 0.7);
  }
`;

const Toggle = styled.div<{ checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  
  input {
    display: none;
  }
  
  .toggle-switch {
    width: 50px;
    height: 24px;
    background: ${props => props.checked ? 'linear-gradient(45deg, #ff6b00, #8a2be2)' : '#333'};
    border-radius: 12px;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid ${props => props.checked ? 'rgba(255, 107, 0, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
  }
  
  .toggle-slider {
    width: 20px;
    height: 20px;
    background: #fff;
    border-radius: 50%;
    position: absolute;
    top: 1px;
    left: ${props => props.checked ? '27px' : '1px'};
    transition: left 0.3s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }
`;

const ValueDisplay = styled.span`
  color: #00ff88;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
`;

const PresetButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const PresetButton = styled.button`
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 107, 0, 0.3);
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 107, 0, 0.1);
    border-color: rgba(255, 107, 0, 0.6);
    color: #ff6b00;
  }
`;

const SpatialAudioControls: React.FC<SpatialAudioControlsProps> = ({
  settings,
  onChange
}) => {
  const handleToggle = (key: string) => {
    onChange({
      ...settings,
      [key]: !settings[key as keyof typeof settings]
    });
  };

  const handleSliderChange = (key: string, value: number) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  const applyPreset = (preset: string) => {
    const presets = {
      off: {
        enabled: false,
        movement_speed: 0,
        spatial_intensity: 0,
        reverb_enabled: false
      },
      subtle: {
        enabled: true,
        movement_speed: 0.04,
        spatial_intensity: 0.3,
        reverb_enabled: true,
        reverberance: 0.3,
        room_scale: 0.6
      },
      standard: {
        enabled: true,
        movement_speed: 0.08,
        spatial_intensity: 0.85,
        reverb_enabled: true,
        reverberance: 0.5,
        room_scale: 1.0
      },
      intense: {
        enabled: true,
        movement_speed: 0.15,
        spatial_intensity: 1.0,
        reverb_enabled: true,
        reverberance: 0.7,
        room_scale: 1.5
      }
    };

    onChange({
      ...settings,
      ...presets[preset as keyof typeof presets]
    });
  };

  return (
    <Container>
      <Title>
        🎧 Spatial Audio (8D Effects)
      </Title>

      <ControlGroup>
        <Toggle 
          checked={settings.enabled}
          onClick={() => handleToggle('enabled')}
        >
          <input 
            type="checkbox" 
            checked={settings.enabled}
            onChange={() => {}}
          />
          <div className="toggle-switch">
            <div className="toggle-slider" />
          </div>
          <Label>Enable 8D Audio</Label>
        </Toggle>
      </ControlGroup>

      {settings.enabled && (
        <>
          <ControlGroup>
            <Label>
              Movement Speed: <ValueDisplay>{settings.movement_speed.toFixed(2)} Hz</ValueDisplay>
            </Label>
            <Slider
              min={0.01}
              max={0.5}
              step={0.01}
              value={settings.movement_speed}
              onChange={(e) => handleSliderChange('movement_speed', parseFloat(e.target.value))}
            />
          </ControlGroup>

          <ControlGroup>
            <Label>
              Spatial Intensity: <ValueDisplay>{(settings.spatial_intensity * 100).toFixed(0)}%</ValueDisplay>
            </Label>
            <Slider
              min={0.1}
              max={1.0}
              step={0.05}
              value={settings.spatial_intensity}
              onChange={(e) => handleSliderChange('spatial_intensity', parseFloat(e.target.value))}
            />
          </ControlGroup>

          <ControlGroup>
            <Toggle 
              checked={settings.reverb_enabled}
              onClick={() => handleToggle('reverb_enabled')}
            >
              <input 
                type="checkbox" 
                checked={settings.reverb_enabled}
                onChange={() => {}}
              />
              <div className="toggle-switch">
                <div className="toggle-slider" />
              </div>
              <Label>Reverb Effect</Label>
            </Toggle>
          </ControlGroup>

          {settings.reverb_enabled && (
            <>
              <ControlGroup>
                <Label>
                  Reverberance: <ValueDisplay>{((settings.reverberance || 0.5) * 100).toFixed(0)}%</ValueDisplay>
                </Label>
                <Slider
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={settings.reverberance || 0.5}
                  onChange={(e) => handleSliderChange('reverberance', parseFloat(e.target.value))}
                />
              </ControlGroup>

              <ControlGroup>
                <Label>
                  Room Scale: <ValueDisplay>{((settings.room_scale || 1.0) * 100).toFixed(0)}%</ValueDisplay>
                </Label>
                <Slider
                  min={0.3}
                  max={2.0}
                  step={0.1}
                  value={settings.room_scale || 1.0}
                  onChange={(e) => handleSliderChange('room_scale', parseFloat(e.target.value))}
                />
              </ControlGroup>

              <ControlGroup>
                <Label>
                  HF Damping: <ValueDisplay>{((settings.hf_damping || 0.5) * 100).toFixed(0)}%</ValueDisplay>
                </Label>
                <Slider
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={settings.hf_damping || 0.5}
                  onChange={(e) => handleSliderChange('hf_damping', parseFloat(e.target.value))}
                />
              </ControlGroup>
            </>
          )}

          <PresetButtons>
            <PresetButton onClick={() => applyPreset('off')}>
              Off
            </PresetButton>
            <PresetButton onClick={() => applyPreset('subtle')}>
              Subtle
            </PresetButton>
            <PresetButton onClick={() => applyPreset('standard')}>
              Standard 8D
            </PresetButton>
            <PresetButton onClick={() => applyPreset('intense')}>
              Intense
            </PresetButton>
          </PresetButtons>
        </>
      )}
    </Container>
  );
};

export default SpatialAudioControls;