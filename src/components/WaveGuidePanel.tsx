// Electromagnetic Beat Lab - Wave Guide Panel Component
// Advanced wave guide configuration and visualization

import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Paper
} from '@mui/material';
import type { WaveGuidePanelProps, WaveGuideConfig } from '../types/index';

const getMaterialColor = (material: string) => {
  switch (material) {
    case 'copper': return '#CD7F32';
    case 'silver': return '#C0C0C0';
    case 'gold': return '#FFD700';
    case 'plasma': return '#FF00FF';
    default: return '#ffffff';
  }
};

const getShapeStyles = (type: string, width: number, height: number) => {
  switch (type) {
    case 'toroidal':
      return {
        width: Math.min(width * 0.3, 80),
        height: Math.min(height * 0.3, 80),
        borderRadius: '50%',
        boxShadow: 'inset 0 0 20px rgba(255, 215, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.2)'
      };
    case 'circular':
      return {
        width: Math.min(width * 0.4, 100),
        height: Math.min(height * 0.4, 100),
        borderRadius: '50%',
        boxShadow: '0 0 15px rgba(255, 215, 0, 0.3)'
      };
    case 'elliptical':
      return {
        width: Math.min(width * 0.4, 120),
        height: Math.min(height * 0.3, 60),
        borderRadius: '50%',
        boxShadow: '0 0 15px rgba(255, 215, 0, 0.3)'
      };
    case 'linear':
      return {
        width: Math.min(width * 0.6, 150),
        height: Math.min(height * 0.2, 20),
        borderRadius: 1,
        boxShadow: '0 0 15px rgba(255, 215, 0, 0.3)'
      };
    default:
      return {
        width: 60,
        height: 60,
        borderRadius: 2
      };
  }
};

const WaveGuidePanel: React.FC<WaveGuidePanelProps> = ({
  config,
  onChange
}) => {
  const handleTypeChange = (value: string) => {
    onChange({
      ...config,
      type: value as WaveGuideConfig['type']
    });
  };

  const handleMaterialChange = (value: string) => {
    onChange({
      ...config,
      material: value as WaveGuideConfig['material']
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

  const handleResonanceChange = (value: string) => {
    onChange({
      ...config,
      resonance: parseFloat(value) || 0
    });
  };

  const shapeStyles = getShapeStyles(config.type, config.dimensions.width, config.dimensions.height);
  const materialColor = getMaterialColor(config.material);

  return (
    <Box 
      sx={{ 
        p: 0.5, 
        maxHeight: 300, 
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      <Typography 
        variant="h6" 
        component="h3" 
        sx={{ 
          mb: 0.5, 
          color: '#ffd700', 
          textAlign: 'center', 
          fontSize: '1rem' 
        }}
      >
        Wave Guide
      </Typography>
      
      <Box sx={{ mb: 1 }}>
        <Typography 
          variant="h6" 
          component="h4" 
          sx={{ 
            fontSize: '0.8rem', 
            color: '#ffffff', 
            mb: 0.5, 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px' 
          }}
        >
          Configuration
        </Typography>
        
        <Grid container spacing={0.5} sx={{ mb: 0.5 }}>
          <Grid item xs={6}>
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
                Type
              </InputLabel>
              <Select
                value={config.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                sx={{
                  fontSize: '0.8rem',
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ffd700'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ffd700'
                  },
                  background: 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <MenuItem value="toroidal">Toroidal</MenuItem>
                <MenuItem value="circular">Circular</MenuItem>
                <MenuItem value="elliptical">Elliptical</MenuItem>
                <MenuItem value="linear">Linear</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6}>
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
                Material
              </InputLabel>
              <Select
                value={config.material}
                onChange={(e) => handleMaterialChange(e.target.value)}
                sx={{
                  fontSize: '0.8rem',
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ffd700'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ffd700'
                  },
                  background: 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <MenuItem value="copper">Copper</MenuItem>
                <MenuItem value="silver">Silver</MenuItem>
                <MenuItem value="gold">Gold</MenuItem>
                <MenuItem value="plasma">Plasma</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Grid container spacing={0.5} sx={{ mb: 0.5 }}>
          <Grid item xs={6}>
            <TextField
              label="Width (mm)"
              type="number"
              size="small"
              fullWidth
              value={config.dimensions.width}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
              InputLabelProps={{
                sx: { color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.8rem',
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  },
                  '&:hover fieldset': {
                    borderColor: '#ffd700'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ffd700'
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              label="Height (mm)"
              type="number"
              size="small"
              fullWidth
              value={config.dimensions.height}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
              InputLabelProps={{
                sx: { color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.8rem',
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  },
                  '&:hover fieldset': {
                    borderColor: '#ffd700'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ffd700'
                  }
                }
              }}
            />
          </Grid>
        </Grid>
        
        <TextField
          label="Resonance (Hz)"
          type="number"
          size="small"
          fullWidth
          inputProps={{ step: 0.1 }}
          value={config.resonance}
          onChange={(e) => handleResonanceChange(e.target.value)}
          InputLabelProps={{
            sx: { color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '0.8rem',
              color: '#ffffff',
              background: 'rgba(255, 255, 255, 0.05)',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.1)'
              },
              '&:hover fieldset': {
                borderColor: '#ffd700'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ffd700'
              }
            }
          }}
        />
      </Box>
      
      <Box
        sx={{
          width: '100%',
          height: 100,
          background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            border: `2px solid ${materialColor}`,
            background: config.material === 'plasma' 
              ? 'radial-gradient(circle, rgba(255, 0, 255, 0.2), transparent)' 
              : 'transparent',
            ...shapeStyles
          }}
        />
      </Box>
      
      <Paper
        sx={{
          textAlign: 'center',
          p: 0.5,
          background: 'rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: 2,
          mb: 1
        }}
      >
        <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', mb: 0.25 }}>
          Resonant Frequency
        </Typography>
        <Typography 
          sx={{ 
            fontFamily: 'Courier New, monospace', 
            fontSize: '1.2rem', 
            fontWeight: 700, 
            color: '#ffd700' 
          }}
        >
          {config.resonance.toFixed(1)} Hz
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
          Impedance: {config.impedance}Ω
        </Typography>
      </Paper>
    </Box>
  );
};

export default WaveGuidePanel;