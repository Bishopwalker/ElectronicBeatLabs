import React, { useEffect } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useUsageTracking } from '../hooks/useUsageTracking';

/**
 * Example component showing how to integrate usage tracking
 * This can be added to the main ElectromagneticBeatLab component
 */
export const UsageTrackingExample: React.FC = () => {
  const { user, usage, canUseApp } = useAuth();
  const { startSession, endSession, isSessionActive } = useUsageTracking();

  // Auto-start session when component mounts (if user can use the app)
  useEffect(() => {
    if (canUseApp() && !isSessionActive) {
      startSession();
    }
    
    // Auto-end session when component unmounts
    return () => {
      if (isSessionActive) {
        endSession();
      }
    };
  }, [canUseApp(), isSessionActive]);

  return (
    <Box sx={{ p: 2, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Usage Tracking Demo
      </Typography>
      
      {/* Show current usage status */}
      {usage && (
        <Alert severity={canUseApp() ? "info" : "warning"} sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>This month:</strong><br/>
            Used: {Math.round(usage.used_minutes)} minutes<br/>
            Remaining: {Math.round(usage.remaining_minutes)} minutes<br/>
            {user ? `User: ${user.email}` : 'Anonymous usage'}
          </Typography>
        </Alert>
      )}

      {/* Session controls */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          variant={isSessionActive ? "outlined" : "contained"}
          onClick={isSessionActive ? endSession : startSession}
          disabled={!canUseApp()}
        >
          {isSessionActive ? 'End Session' : 'Start Session'}
        </Button>
        
        {isSessionActive && (
          <Alert severity="success" sx={{ flex: 1 }}>
            Session active 🟢
          </Alert>
        )}
      </Box>

      {/* Instructions */}
      <Typography variant="caption" display="block">
        💡 In the real app, sessions would start automatically when users begin listening to binaural beats and end when they stop.
      </Typography>
    </Box>
  );
};

export default UsageTrackingExample;