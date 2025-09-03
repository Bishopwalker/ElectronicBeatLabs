// Electromagnetic Beat Lab - Electromagnetic Status Component
// Real-time electromagnetic field status display

import React from 'react';
import { Box, Typography } from '@mui/material';
import type { ElectromagneticStatusProps } from '../types/index';

const getStatusColor = (state: string) => {
  switch (state) {
    case 'INACTIVE': return '#666666';
    case 'CHARGING': return '#ffaa00';
    case 'ACTIVE': return '#00ff88';
    case 'RESONANT': return '#ff6b00';
    case 'CRITICAL': return '#ff0066';
    default: return '#666666';
  }
};

const getStatusShadow = (state: string) => {
  switch (state) {
    case 'INACTIVE': return 'rgba(102, 102, 102, 0.5)';
    case 'CHARGING': return 'rgba(255, 170, 0, 0.5)';
    case 'ACTIVE': return 'rgba(0, 255, 136, 0.5)';
    case 'RESONANT': return 'rgba(255, 107, 0, 0.5)';
    case 'CRITICAL': return 'rgba(255, 0, 102, 0.5)';
    default: return 'rgba(102, 102, 102, 0.5)';
  }
};

const ElectromagneticStatus: React.FC<ElectromagneticStatusProps> = ({ field, status }) => {
  const statusState = status?.state || 'INACTIVE';
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 1,
        bgcolor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          bgcolor: getStatusColor(statusState),
          boxShadow: `0 0 10px ${getStatusShadow(statusState)}`,
          animation: statusState !== 'INACTIVE' ? 'pulse 1s ease-in-out infinite' : 'none',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1, transform: 'scale(1)' },
            '50%': { opacity: 0.7, transform: 'scale(1.2)' }
          }
        }}
      />
      
      <Typography
        sx={{
          fontSize: '0.9rem',
          fontWeight: 600,
          color: '#ffffff',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {statusState}
      </Typography>
      
      <Typography
        sx={{
          fontFamily: 'Courier New, monospace',
          fontSize: '0.8rem',
          color: '#00ff88',
          ml: 'auto'
        }}
      >
        {field.strength.toFixed(2)}T
      </Typography>
      
      <Box
        sx={{
          width: 80,
          height: 4,
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            width: `${Math.min(100, field.coherence * 100)}%`,
            height: '100%',
            bgcolor: 'linear-gradient(90deg, #ff6b00, #00ff88)',
            transition: 'width 0.3s ease'
          }}
        />
      </Box>
    </Box>
  );
};

export default ElectromagneticStatus;