// Electromagnetic Beat Lab - Settings Tab Component

import React from 'react';
import styled from 'styled-components';
import SpatialAudioControls from '../SpatialAudioControls';

const Container = styled.div`
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionTitle = styled.h4`
  color: #ffd700;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

interface SettingsTabProps {
  appState: any;
  audioEngine: any;
  patterns8D: any;
  onStateChange: (state: any) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  appState,
  audioEngine,
  onStateChange
}) => {
  const handleSpatialSettingsChange = (spatialSettings: any) => {
    // Update spatial audio settings in app state
    onStateChange((prev: any) => ({
      ...prev,
      spatialAudio: {
        ...prev.spatialAudio,
        ...spatialSettings
      }
    }));

    // Update backend settings if connected
    if (audioEngine.updateSpatialSettings) {
      audioEngine.updateSpatialSettings(spatialSettings);
    }
  };

  const handleSystemSettingChange = (key: string, value: any) => {
    onStateChange((prev: any) => ({
      ...prev,
      systemSettings: {
        ...prev.systemSettings,
        [key]: value
      }
    }));
  };

  return (
    <Container>
      <Section>
        <SpatialAudioControls
          settings={{
            enabled: appState.spatialAudio?.enabled || false,
            movement_speed: appState.spatialAudio?.movement_speed || 0.08,
            spatial_intensity: appState.spatialAudio?.spatial_intensity || 0.85,
            reverb_enabled: appState.spatialAudio?.reverb_enabled || true,
            reverberance: appState.spatialAudio?.reverberance || 0.5,
            room_scale: appState.spatialAudio?.room_scale || 1.0,
            hf_damping: appState.spatialAudio?.hf_damping || 0.5
          }}
          onChange={handleSpatialSettingsChange}
        />
      </Section>

      <Section>
        <SectionTitle>
          ⚡ Backend Connection
        </SectionTitle>
        {audioEngine.backendConnected ? (
          <div style={{ color: '#00ff88' }}>
            ✅ Connected to backend (Session: {audioEngine.sessionId?.slice(-8)})
          </div>
        ) : (
          <div style={{ color: '#ff6b00' }}>
            ⚠️ Using local audio engine
          </div>
        )}
        
        {audioEngine.websocketState && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#e0e0e0' }}>
            WebSocket: {audioEngine.websocketState.connected ? 'Connected' : 
                      audioEngine.websocketState.connecting ? 'Connecting...' : 'Disconnected'}
            {audioEngine.websocketState.error && (
              <div style={{ color: '#ff4444', marginTop: '0.25rem' }}>
                Error: {audioEngine.websocketState.error}
              </div>
            )}
          </div>
        )}
      </Section>

      <Section>
        <SectionTitle>
          🔧 Audio Settings
        </SectionTitle>
        <div style={{ color: '#e0e0e0', fontSize: '0.9rem' }}>
          <div>Sample Rate: {audioEngine.audioState?.context?.sampleRate || 44100} Hz</div>
          <div>Audio Context State: {audioEngine.audioState?.context?.state || 'Not initialized'}</div>
          <div>Web Audio Support: {audioEngine.isSupported ? '✅ Supported' : '❌ Not supported'}</div>
        </div>
      </Section>

      <Section>
        <SectionTitle>
          📊 Performance
        </SectionTitle>
        <div style={{ color: '#e0e0e0', fontSize: '0.9rem' }}>
          <div>Electromagnetic State: {appState.electromagnetic?.state || 'INACTIVE'}</div>
          <div>Field Strength: {((appState.electromagnetic?.strength || 0) * 100).toFixed(1)}%</div>
          <div>Coherence: {((appState.electromagnetic?.coherence || 0) * 100).toFixed(1)}%</div>
          <div>Beat Frequency: {appState.frequency?.toFixed(2) || '0.00'} Hz</div>
        </div>
      </Section>
    </Container>
  );
};

export default SettingsTab;