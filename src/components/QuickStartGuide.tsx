// Quick Start Guide Component
// Clear step-by-step instructions for using the application

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  Step,
  StepLabel,
  StepContent,
  Stepper,
  Paper,
  Fab
} from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

interface QuickStartGuideProps {
  autoShow?: boolean;
}

const QuickStartGuide: React.FC<QuickStartGuideProps> = ({ autoShow = true }) => {
  const [isVisible, setIsVisible] = useState(autoShow);

  const steps = [
    {
      label: "🎵 Test Audio First",
      description: "Click the orange 'Start 4Hz Beat' button in the top-right corner. You should hear different tones in each ear creating a beating effect. Use headphones for best results."
    },
    {
      label: "🎛️ Choose a Pattern",
      description: "In the left panel, select a binaural beat pattern like 'Maximum Resonance Toroid' or 'Focus Enhancement Vortex'. Each pattern has different frequencies and benefits."
    },
    {
      label: "▶️ Start the Session",
      description: "Click the PLAY button in the main controls. The electromagnetic field visualization will start, and you'll hear the binaural beats. Close your eyes and relax."
    },
    {
      label: "🔧 Adjust Settings",
      description: "Use the frequency controls to fine-tune the beat frequency (1-40Hz). Lower frequencies (1-8Hz) are relaxing, higher frequencies (15-40Hz) are for focus and alertness."
    },
    {
      label: "🎚️ Control Volume",
      description: "Adjust volume to a comfortable level. The beats should be audible but not distracting. You can work, meditate, or focus on tasks while listening."
    },
    {
      label: "⏹️ Stop When Done",
      description: "Click STOP when finished. Sessions typically last 10-30 minutes. For ADHD protocols, follow the specific duration recommendations in the ADHD tab."
    }
  ];

  return (
    <>
      <Fab
        color="primary"
        onClick={() => setIsVisible(true)}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          background: 'rgba(255, 107, 0, 0.9)',
          color: 'white',
          zIndex: 1001,
          '&:hover': {
            background: 'rgba(255, 107, 0, 1)',
          }
        }}
        size="small"
      >
        <HelpIcon />
      </Fab>

      <Dialog
        open={isVisible}
        onClose={() => setIsVisible(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(20, 0, 20, 0.9))',
            border: '2px solid #ff6b00',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(255, 107, 0, 0.3)'
          }
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          <Typography
            variant="h4"
            sx={{
              color: '#ff6b00',
              textAlign: 'center',
              mb: 3,
              textShadow: '0 0 10px rgba(255, 107, 0, 0.5)'
            }}
          >
            🚀 Quick Start Guide
          </Typography>

          <Stepper orientation="vertical">
            {steps.map((step, index) => (
              <Step key={index} active={true} completed={false}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: '#00ff88',
                      fontSize: '1.1rem',
                      fontWeight: 'bold'
                    },
                    '& .MuiStepIcon-root': {
                      color: '#00ff88'
                    }
                  }}
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  <Paper
                    sx={{
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderLeft: '4px solid #00ff88',
                      borderRadius: 2
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#e0e0e0',
                        lineHeight: 1.5
                      }}
                    >
                      {step.description}
                    </Typography>
                  </Paper>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>

        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button
            onClick={() => setIsVisible(false)}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #ff6b00, #8a2be2)',
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: 'uppercase',
              '&:hover': {
                background: 'linear-gradient(45deg, #ff8533, #9944d9)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Got It!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuickStartGuide;