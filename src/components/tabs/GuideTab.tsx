// Electromagnetic Beat Lab - Guide Tab Component
// Pattern explanations and instructions

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { PATTERN_EXPLANATIONS } from '../../data/patterns';
import type { AppState, AudioEngine, Pattern8D } from '../../types';

interface GuideTabProps {
  appState: AppState;
  audioEngine: AudioEngine;
  patterns8D: Pattern8D[];
  onStateChange: (state: Partial<AppState>) => void;
}

const GuideTab: React.FC<GuideTabProps> = () => {
  return (
    <Box sx={{ py: 1 }}>
      <Typography
        variant="h5"
        component="h4"
        sx={{ color: '#00ff88', mb: 3 }}
      >
        Electromagnetic Wave Guide
      </Typography>
      
      {Object.entries(PATTERN_EXPLANATIONS).map(([key, explanation]) => (
        <Paper
          key={key}
          sx={{
            mb: 2,
            p: 3,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3
          }}
        >
          <Typography
            variant="h6"
            component="h4"
            sx={{
              color: '#00ff88',
              mb: 1,
              fontSize: '1.2rem'
            }}
          >
            {explanation.title}
          </Typography>
          
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1.6,
              mb: 1
            }}
          >
            {explanation.description}
          </Typography>
          
          <Box
            sx={{
              background: 'rgba(0, 191, 255, 0.1)',
              p: 1,
              borderLeft: '4px solid #00bfff',
              mb: 1,
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.8)'
            }}
          >
            <strong>Scientific Basis:</strong> {explanation.science}
          </Box>
          
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="h6"
              component="h5"
              sx={{ color: '#8a2be2', mb: 0.5, fontSize: '1rem' }}
            >
              Benefits:
            </Typography>
            <Box component="ul" sx={{ mb: 1, pl: 3 }}>
              {explanation.benefits.map((benefit, index) => (
                <Typography
                  key={index}
                  component="li"
                  sx={{
                    color: '#8a2be2',
                    mb: 0.5,
                    fontSize: '0.9rem'
                  }}
                >
                  {benefit}
                </Typography>
              ))}
            </Box>
          </Box>
          
          <Box>
            <Typography
              variant="h6"
              component="h5"
              sx={{ color: '#ff6b00', mb: 0.5, fontSize: '1rem' }}
            >
              Instructions:
            </Typography>
            <Box component="ol" sx={{ pl: 3 }}>
              {explanation.instructions.map((instruction, index) => (
                <Typography
                  key={index}
                  component="li"
                  sx={{
                    color: '#ff6b00',
                    mb: 0.5,
                    fontSize: '0.9rem'
                  }}
                >
                  {instruction}
                </Typography>
              ))}
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default GuideTab;