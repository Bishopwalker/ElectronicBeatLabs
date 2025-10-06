// Electromagnetic Beat Lab - Equalizer Tab Component
// Tab content wrapper for the EqualizerMUI component

import React from 'react';
import { Box } from '@mui/material';
import EqualizerMUI from '../EqualizerMUI';
import type { AppState } from '../../types';

interface EqualizerTabProps {
  appState: AppState;
  audioEngine: {
    audioContext?: AudioContext | null;
    setEqualizerNodes?: (inputNode: GainNode | null, outputNode: GainNode | null) => void;
  };
  onStateChange: (updates: Partial<AppState>) => void;
}

const EqualizerTab: React.FC<EqualizerTabProps> = ({
  audioEngine
}) => {
  const handleEqualizerChange = (inputNode: GainNode | null, outputNode: GainNode | null) => {
    if (audioEngine.setEqualizerNodes) {
      audioEngine.setEqualizerNodes(inputNode, outputNode);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <EqualizerMUI
        audioContext={audioEngine.audioContext || null}
        onEqualizerChange={handleEqualizerChange}
      />
    </Box>
  );
};

export default EqualizerTab;
