// STANDALONE TEST FOR SPATIALVISUALIZER
// Drop this into App.tsx temporarily to test if SpatialVisualizer renders

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import SpatialVisualizer from './components/SpatialVisualizer';
import type { Pattern8D, ElectromagneticField } from './types';

// Test data - simple mock pattern
const TEST_PATTERN: Pattern8D = {
  id: 'test-pattern',
  name: 'Test Pattern',
  description: 'Test visualization',
  speed: 1,
  direction: 'clockwise',
  intensity: 0.8,
  color: '#00ff88',
  electromagnetic: {
    frequency: 10,
    wavelength: 100,
    amplitude: 1,
    phase: 0
  },
  path: [
    { x: 0, y: -100, z: 0 },
    { x: 70.7, y: -70.7, z: 10 },
    { x: 100, y: 0, z: 20 },
    { x: 70.7, y: 70.7, z: 30 },
    { x: 0, y: 100, z: 40 },
    { x: -70.7, y: 70.7, z: 30 },
    { x: -100, y: 0, z: 20 },
    { x: -70.7, y: -70.7, z: 10 }
  ]
};

// Test electromagnetic field
const TEST_ELECTROMAGNETIC: ElectromagneticField = {
  strength: 0.8,
  frequency: 10,
  phase: 0,
  coherence: 0.9,
  resonance: 0.7,
  state: 'ACTIVE',
  stability: 0.85
};

export const SpatialVisualizerTest: React.FC = () => {
  console.log('🧪 SpatialVisualizerTest: Component mounted');
  console.log('🧪 Test Pattern:', TEST_PATTERN);
  console.log('🧪 Test Electromagnetic:', TEST_ELECTROMAGNETIC);

  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      bgcolor: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 4
    }}>
      <Typography variant="h4" sx={{ color: '#00ff88', mb: 2 }}>
        🧪 Spatial Visualizer Standalone Test
      </Typography>

      <Paper elevation={10} sx={{
        width: '600px',
        height: '600px',
        bgcolor: 'rgba(0, 0, 0, 0.9)',
        border: '2px solid #00ff88',
        p: 2
      }}>
        <Box sx={{
          width: '100%',
          height: '100%',
          border: '1px solid #ff6b00',
          position: 'relative'
        }}>
          <SpatialVisualizer
            pattern={TEST_PATTERN}
            electromagnetic={TEST_ELECTROMAGNETIC}
            size={550}
          />
        </Box>
      </Paper>

      <Typography variant="body1" sx={{ color: 'white', mt: 2, textAlign: 'center' }}>
        If you see a black square above with nothing rendering:<br/>
        1. Open console (F12)<br/>
        2. Look for error messages<br/>
        3. Check if canvas is being created<br/>
        <br/>
        Expected: You should see a green toroidal field rotating
      </Typography>
    </Box>
  );
};

export default SpatialVisualizerTest;
