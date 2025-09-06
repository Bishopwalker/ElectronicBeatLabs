// Electromagnetic Beat Lab - Pattern Tab Component
// Pattern selection and management interface

import React from 'react';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import type { PatternConfig, PatternPreset, AppState, AudioEngine, Pattern8D } from '../../types';

interface PatternTabProps {
  patterns: PatternConfig[];
  presets: PatternPreset[];
  appState: AppState;
  audioEngine: AudioEngine;
  patterns8D: Pattern8D[];
  onStateChange: (state: Partial<AppState>) => void;
  onPatternSelect: (patternId: string) => void;
}

const PatternTab: React.FC<PatternTabProps> = ({
  patterns,
  presets,
  appState,
  onPatternSelect,
  onStateChange
}) => {
  
  const handlePatternSelect = (patternId: string) => {
    const pattern = patterns.find(p => p.id === patternId);
    if (pattern && onStateChange) {
      onStateChange({ currentPattern: pattern });
    }
    onPatternSelect(patternId);
  };
  return (
    <Box sx={{ py: 1 }}>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          component="h4"
          sx={{ mb: 1, color: '#ffd700' }}
        >
          Electromagnetic Wave Patterns
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 1 }}>
          {patterns.map((pattern) => (
            <Box key={pattern.id}>
              <Card
                onClick={() => handlePatternSelect(pattern.id)}
                sx={{
                  background: appState.currentPattern?.id === pattern.id
                    ? 'rgba(255, 215, 0, 0.1)'
                    : 'rgba(255, 255, 255, 0.02)',
                  border: appState.currentPattern?.id === pattern.id
                    ? '1px solid rgba(255, 215, 0, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255, 215, 0, 0.05)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 1 }}>
                  {pattern.adhd && (
                    <Chip
                      label="ADHD Protocol"
                      size="small"
                      sx={{
                        background: 'linear-gradient(45deg, #ff1493, #8a2be2)',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        mb: 0.5
                      }}
                    />
                  )}
                  
                  <Typography
                    variant="h6"
                    component="h5"
                    sx={{
                      mb: 0.5,
                      fontSize: '1rem',
                      color: '#ffffff'
                    }}
                  >
                    {pattern.name}
                  </Typography>
                  
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      color: '#00ff88',
                      textTransform: 'uppercase',
                      mb: 0.5,
                      fontWeight: 600
                    }}
                  >
                    {pattern.type}
                  </Typography>
                  
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      color: 'rgba(255, 255, 255, 0.7)',
                      lineHeight: 1.4,
                      mb: 0.75
                    }}
                  >
                    {pattern.description}
                  </Typography>
                  
                  <Box sx={{ mb: 0.75 }}>
                    {pattern.benefits.slice(0, 3).map((benefit, index) => (
                      <Typography
                        key={index}
                        sx={{
                          fontSize: '0.75rem',
                          color: '#8a2be2',
                          mb: 0.25,
                          '&:before': {
                            content: '"• "',
                            color: '#00ff88'
                          }
                        }}
                      >
                        {benefit}
                      </Typography>
                    ))}
                  </Box>
                  
                  <Box
                    sx={{
                      fontSize: '0.8rem',
                      color: '#ff6b00',
                      fontFamily: 'Courier New, monospace',
                      background: 'rgba(255, 107, 0, 0.1)',
                      p: 0.5,
                      borderRadius: 1,
                      mb: 0.5
                    }}
                  >
                    {pattern.frequencies.beat}Hz • {pattern.frequencies.range}
                  </Box>
                  
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}
                  >
                    Duration: {pattern.duration} minutes
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
      
      <Box>
        <Typography
          variant="h6"
          component="h4"
          sx={{ mb: 1, color: '#ffd700' }}
        >
          Quick Presets
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 1 }}>
          {presets.map((preset) => (
            <Box key={preset.id}>
              <Card
                onClick={() => handlePatternSelect(preset.pattern.id)}
                sx={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255, 215, 0, 0.05)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 1 }}>
                  <Typography
                    variant="h6"
                    component="h5"
                    sx={{
                      mb: 0.5,
                      fontSize: '1rem',
                      color: '#ffffff'
                    }}
                  >
                    {preset.name}
                  </Typography>
                  
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      color: '#00ff88',
                      textTransform: 'uppercase',
                      mb: 0.5,
                      fontWeight: 600
                    }}
                  >
                    {preset.category}
                  </Typography>
                  
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      color: 'rgba(255, 255, 255, 0.7)',
                      lineHeight: 1.4,
                      mb: 0.75
                    }}
                  >
                    {preset.pattern.description}
                  </Typography>
                  
                  <Box
                    sx={{
                      fontSize: '0.8rem',
                      color: '#ff6b00',
                      fontFamily: 'Courier New, monospace',
                      background: 'rgba(255, 107, 0, 0.1)',
                      p: 0.5,
                      borderRadius: 1
                    }}
                  >
                    {preset.pattern.frequencies.beat}Hz • Rating: {preset.rating}/5
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PatternTab;