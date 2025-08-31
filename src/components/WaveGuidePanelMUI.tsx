// Electromagnetic Beat Lab - Wave Guide Panel Component (Material UI)
// Advanced wave guide configuration and visualization

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  TextField,
  Grid,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import type { WaveGuidePanelProps } from '../types/index';

const WaveGuidePanelMUI: React.FC<WaveGuidePanelProps> = ({
  config,
  onChange
}) => {
  const handleTypeChange = (value: string) => {
    onChange({
      ...config,
      type: value as any
    });
  };

  const handleMaterialChange = (value: string) => {
    onChange({
      ...config,
      material: value as any
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

  const getMaterialColor = (material: string) => {
    switch (material) {
      case 'copper': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'plasma': return '#FF00FF';
      default: return '#ffffff';
    }
  };

  const getShapeStyle = () => {
    const baseStyle: any = {
      border: `2px solid ${getMaterialColor(config.material)}`,
      boxShadow: `0 0 15px ${getMaterialColor(config.material)}66`,
      transition: 'all 0.3s ease',
    };

    switch (config.type) {
      case 'toroidal':
        return {
          ...baseStyle,
          width: Math.min(config.dimensions.width * 0.3, 80),
          height: Math.min(config.dimensions.height * 0.3, 80),
          borderRadius: '50%',
        };
      case 'circular':
        return {
          ...baseStyle,
          width: Math.min(config.dimensions.width * 0.4, 100),
          height: Math.min(config.dimensions.height * 0.4, 100),
          borderRadius: '50%',
        };
      case 'elliptical':
        return {
          ...baseStyle,
          width: Math.min(config.dimensions.width * 0.4, 120),
          height: Math.min(config.dimensions.height * 0.3, 60),
          borderRadius: '50%',
        };
      case 'linear':
        return {
          ...baseStyle,
          width: Math.min(config.dimensions.width * 0.6, 150),
          height: Math.min(config.dimensions.height * 0.2, 20),
          borderRadius: '4px',
        };
      default:
        return {
          ...baseStyle,
          width: 60,
          height: 60,
          borderRadius: '8px',
        };
    }
  };

  return (
    <Card sx={{ 
      maxHeight: 300,
      overflow: 'auto',
      background: 'rgba(255, 215, 0, 0.05)',
      borderColor: 'rgba(255, 215, 0, 0.3)',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'linear-gradient(45deg, #ffd700, #ff6b00)',
        borderRadius: '4px',
      },
    }}>
      <CardContent sx={{ p: 1.5 }}>
        <Typography variant="h4" align="center" color="warning" gutterBottom>
          Wave Guide
        </Typography>
        
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>
            Configuration
          </Typography>
          
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={config.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="toroidal">Toroidal</MenuItem>
                  <MenuItem value="circular">Circular</MenuItem>
                  <MenuItem value="elliptical">Elliptical</MenuItem>
                  <MenuItem value="linear">Linear</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Material</InputLabel>
                <Select
                  value={config.material}
                  onChange={(e) => handleMaterialChange(e.target.value)}
                  label="Material"
                >
                  <MenuItem value="copper">Copper</MenuItem>
                  <MenuItem value="silver">Silver</MenuItem>
                  <MenuItem value="gold">Gold</MenuItem>
                  <MenuItem value="plasma">Plasma</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="Width (mm)"
                type="number"
                size="small"
                fullWidth
                value={config.dimensions.width}
                onChange={(e) => handleDimensionChange('width', e.target.value)}
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
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Resonance (Hz)"
                type="number"
                size="small"
                fullWidth
                value={config.resonance}
                onChange={(e) => handleResonanceChange(e.target.value)}
                inputProps={{ step: 0.1 }}
              />
            </Grid>
          </Grid>
          
          <Paper
            elevation={0}
            sx={{
              height: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `radial-gradient(circle at center, 
                ${getMaterialColor(config.material)}1A 0%, 
                rgba(0, 0, 0, 0.8) 100%
              )`,
              border: '1px solid',
              borderColor: getMaterialColor(config.material) + '4D',
            }}
          >
            <Box sx={getShapeStyle()} />
          </Paper>
          
          <Paper
            elevation={0}
            sx={{
              p: 1,
              textAlign: 'center',
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Resonant Frequency
            </Typography>
            <Typography 
              variant="h5" 
              color="warning"
              sx={{ fontFamily: 'monospace', fontWeight: 700 }}
            >
              {config.resonance.toFixed(1)} Hz
            </Typography>
            <Chip 
              label={`Impedance: ${config.impedance}Ω`}
              size="small"
              sx={{ 
                mt: 0.5,
                fontSize: '0.7rem',
                background: 'rgba(255, 255, 255, 0.05)',
              }}
            />
          </Paper>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default WaveGuidePanelMUI;