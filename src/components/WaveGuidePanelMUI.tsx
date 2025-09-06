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
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import type { WaveGuidePanelProps, WaveGuideConfig } from '../types';

const WaveGuidePanelMUI: React.FC<WaveGuidePanelProps> = ({
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
    const baseStyle: React.CSSProperties = {
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
        return baseStyle;
    }
  };

  return (
    <Card sx={{
      maxHeight: 400,
      overflow: 'auto',
      background: 'rgba(138, 43, 226, 0.05)',
      borderColor: 'rgba(138, 43, 226, 0.3)',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'linear-gradient(45deg, #8a2be2, #ff6b00)',
        borderRadius: '4px',
      },
    }}>
      <CardContent sx={{ p: 1.5 }}>
        <Typography variant="h4" align="center" color="secondary" gutterBottom>
          Wave Guide
        </Typography>

        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
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
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <TextField
              label="Width (mm)"
              type="number"
              size="small"
              fullWidth
              value={config.dimensions.width}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
            />
            
            <TextField
              label="Height (mm)"
              type="number"
              size="small"
              fullWidth
              value={config.dimensions.height}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
            />
          </Stack>
          
          <TextField
            label="Resonance (Hz)"
            type="number"
            size="small"
            fullWidth
            value={config.resonance}
            onChange={(e) => handleResonanceChange(e.target.value)}
            inputProps={{ step: 0.1 }}
          />
          
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
              borderColor: `${getMaterialColor(config.material)}66`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={getShapeStyle()} />
            
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                color: getMaterialColor(config.material),
                fontFamily: 'monospace',
                fontSize: '0.65rem',
              }}
            >
              {config.resonance.toFixed(1)} Hz
            </Typography>
          </Paper>

          <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap">
            <Chip
              label={config.type.toUpperCase()}
              size="small"
              sx={{
                background: `${getMaterialColor(config.material)}22`,
                color: getMaterialColor(config.material),
                fontSize: '0.65rem',
              }}
            />
            <Chip
              label={config.material.toUpperCase()}
              size="small"
              sx={{
                background: `${getMaterialColor(config.material)}22`,
                color: getMaterialColor(config.material),
                fontSize: '0.65rem',
              }}
            />
            <Chip
              label={`${config.dimensions.width}×${config.dimensions.height}mm`}
              size="small"
              sx={{
                background: `${getMaterialColor(config.material)}22`,
                color: getMaterialColor(config.material),
                fontSize: '0.65rem',
              }}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default WaveGuidePanelMUI;