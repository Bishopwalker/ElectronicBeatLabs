// Master Stop Control with Active Audio Status Panel
// Provides centralized control over all audio engines and clear visibility

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SpatialAudioIcon from '@mui/icons-material/SpatialAudio';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import RadioIcon from '@mui/icons-material/Radio';

interface ActiveAudioStatus {
  binauralEngine: boolean;
  backendEngine: boolean;
  spatialAudio: boolean;
  patterns: boolean;
  testTones: boolean;
}

interface MasterStopControlProps {
  activeStatus: ActiveAudioStatus;
  onMasterStop: () => void;
  onMasterStart?: () => void;
  frequencies?: {
    left: number;
    right: number;
    beat: number;
  };
  volume: number;
}

const MasterStopControl: React.FC<MasterStopControlProps> = ({
  activeStatus,
  onMasterStop,
  onMasterStart,
  frequencies,
  volume
}) => {
  const isAnyActive = Object.values(activeStatus).some(Boolean);
  const activeCount = Object.values(activeStatus).filter(Boolean).length;

  const getStatusChip = (isActive: boolean, label: string, icon: React.ReactNode) => (
    <Chip
      icon={icon as React.ReactElement}
      label={label}
      color={isActive ? "success" : "default"}
      variant={isActive ? "filled" : "outlined"}
      size="small"
      sx={{
        minWidth: 100,
        '& .MuiChip-icon': {
          color: isActive ? 'inherit' : 'rgba(255,255,255,0.5)'
        }
      }}
    />
  );

  return (
    <Card sx={{ 
      background: 'rgba(138, 43, 226, 0.08)',
      borderColor: isAnyActive ? 'rgba(255, 102, 0, 0.5)' : 'rgba(138, 43, 226, 0.3)',
      border: isAnyActive ? '2px solid' : '1px solid',
      boxShadow: isAnyActive ? '0 0 20px rgba(255, 102, 0, 0.3)' : 'none',
    }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h5" align="center" color="secondary" gutterBottom>
          🛑 Master Audio Control
        </Typography>
        
        {/* Emergency Stop Button */}
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="error"
            onClick={onMasterStop}
            startIcon={<StopIcon />}
            size="large"
            disabled={!isAnyActive}
            sx={{ 
              minWidth: 180,
              py: 1.5,
              background: isAnyActive 
                ? 'linear-gradient(45deg, #ff0066, #ff3333)'
                : 'rgba(255, 255, 255, 0.1)',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              '&:hover': {
                background: isAnyActive
                  ? 'linear-gradient(45deg, #ff3388, #ff5555)'
                  : 'rgba(255, 255, 255, 0.15)',
                transform: 'scale(1.05)',
                boxShadow: '0 0 25px rgba(255, 0, 102, 0.5)',
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {isAnyActive ? `STOP ALL (${activeCount})` : 'ALL STOPPED'}
          </Button>
        </Box>

        {onMasterStart && !isAnyActive && (
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={onMasterStart}
              startIcon={<PlayArrowIcon />}
              sx={{ 
                background: 'linear-gradient(45deg, #ff6b00, #8a2be2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #ff8533, #9944d9)',
                }
              }}
            >
              Quick Start
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Status Overview */}
        {isAnyActive && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 2, 
              background: 'rgba(255, 152, 0, 0.1)',
              border: '1px solid rgba(255, 152, 0, 0.3)',
              '& .MuiAlert-icon': {
                color: '#ff9800'
              }
            }}
          >
            <Typography variant="body2">
              <strong>{activeCount} audio system{activeCount > 1 ? 's' : ''} currently active</strong>
              {frequencies && (
                <><br />
                Frequencies: {frequencies.left}Hz ← → {frequencies.right}Hz (Beat: {frequencies.beat}Hz)</>
              )}
              <br />
              Volume: {Math.round(volume * 100)}%
            </Typography>
          </Alert>
        )}

        {/* Active Components Status */}
        <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
          Audio Systems Status
        </Typography>
        
        <Stack spacing={1.5}>
          {getStatusChip(
            activeStatus.binauralEngine,
            "Binaural Engine",
            <RadioIcon />
          )}
          
          {getStatusChip(
            activeStatus.backendEngine,
            "Backend Engine",
            <SpatialAudioIcon />
          )}
          
          {getStatusChip(
            activeStatus.spatialAudio,
            "Spatial Audio",
            <GraphicEqIcon />
          )}
          
          {getStatusChip(
            activeStatus.patterns,
            "Pattern System",
            <VolumeUpIcon />
          )}
          
          {getStatusChip(
            activeStatus.testTones,
            "Test Tones",
            <PlayArrowIcon />
          )}
        </Stack>

        {!isAnyActive && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ✅ All audio systems are stopped
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MasterStopControl;