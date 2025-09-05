// Electromagnetic Beat Lab - ADHD Tab Component
// ADHD-specific gamma wave protocols

import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { ADHD_PROTOCOLS } from '../../data/patterns';
import type { AppState, AudioEngine, Pattern8D, ADHDProtocol } from '../../types';

interface ADHDTabProps {
  appState: AppState;
  audioEngine: AudioEngine;
  patterns8D: Pattern8D[];
  onStateChange: (state: Partial<AppState>) => void;
}

const ADHDTab: React.FC<ADHDTabProps> = ({
  audioEngine
}) => {
  const handleProtocolSelect = (protocol: ADHDProtocol) => {
    audioEngine.createGammaProtocol(protocol);
  };

  return (
    <Box sx={{ py: 1 }}>
      <Typography 
        variant="h5" 
        component="h4" 
        sx={{ color: '#ff1493', mb: 1 }}
      >
        ADHD Gamma Protocols
      </Typography>
      
      <Grid container spacing={1}>
        {ADHD_PROTOCOLS.map((protocol) => (
          <Grid item xs={12} sm={6} xl={3}  key={protocol.id}>
            <Paper
              onClick={() => handleProtocolSelect(protocol)}
              sx={{
                p: 1,
                background: 'rgba(255, 20, 147, 0.1)',
                border: '1px solid rgba(255, 20, 147, 0.3)',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255, 20, 147, 0.15)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Typography
                variant="h6"
                component="h4"
                sx={{
                  color: '#ff1493',
                  mb: 0.5
                }}
              >
                {protocol.name}
              </Typography>
              
              <Typography
                sx={{
                  color: '#8a2be2',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  mb: 0.5
                }}
              >
                {protocol.type}
              </Typography>
              
              <Typography
                sx={{
                  color: '#00ff88',
                  fontFamily: 'Courier New, monospace',
                  fontWeight: 700,
                  mb: 0.5
                }}
              >
                {protocol.gammaFreq}Hz Gamma Wave
              </Typography>
              
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.85rem'
                }}
              >
                Effectiveness: {(protocol.effectiveness * 100).toFixed(0)}%
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ADHDTab;