/**
 * Tutorial Startup Modal Component
 *
 * Welcome modal shown on first visit, introducing the app
 * and offering to start the guided tutorial.
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Stack,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Close as SkipIcon,
  Explore as ExploreIcon,
  Science as ScienceIcon,
  Headphones as AudioIcon,
  EmojiObjects as BulbIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useTutorial } from './TutorialContext';
import { TutorialStartupModalProps } from './types';

/**
 * TutorialStartupModal Component
 *
 * First-time user welcome and tutorial start prompt.
 */
export const TutorialStartupModal: React.FC<TutorialStartupModalProps> = ({
  open: openProp,
  onClose: onCloseProp
}) => {
  const {
    showOnStartup,
    completedSteps,
    toggleShowOnStartup,
    startTutorial,
    stopTutorial
  } = useTutorial();

  const [dontShowAgain, setDontShowAgain] = React.useState(!showOnStartup);
  const [isModalDismissed, setIsModalDismissed] = React.useState(false);

  // Determine if modal should be open
  const isFirstVisit = completedSteps.length === 0;
  const shouldShowByDefault = isFirstVisit && showOnStartup && !isModalDismissed;
  const isOpen = openProp !== undefined ? openProp : shouldShowByDefault;

  /**
   * Handle start tutorial
   */
  const handleStartTutorial = () => {
    if (dontShowAgain) {
      toggleShowOnStartup();
    }
    setIsModalDismissed(true); // Close modal first
    startTutorial();
    if (onCloseProp) {
      onCloseProp();
    }
  };

  /**
   * Handle skip
   */
  const handleSkip = () => {
    if (dontShowAgain) {
      toggleShowOnStartup();
    }
    setIsModalDismissed(true); // Close modal
    stopTutorial();
    if (onCloseProp) {
      onCloseProp();
    }
  };

  /**
   * Handle checkbox change
   */
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDontShowAgain(event.target.checked);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleSkip}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'background.paper',
          backgroundImage: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: 'rgba(0, 255, 136, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AudioIcon sx={{ fontSize: 28, color: '#00ff88' }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Welcome to EBL
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Electromagnetic Beat Lab
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* HEADPHONES REQUIRED - Critical Warning */}
          <Alert
            severity="warning"
            icon={<AudioIcon />}
            sx={{
              bgcolor: 'rgba(255, 152, 0, 0.15)',
              border: '2px solid #ff9800',
              '& .MuiAlert-icon': { color: '#ff9800' }
            }}
          >
            <AlertTitle sx={{ fontWeight: 700, color: '#ff9800' }}>
              HEADPHONES REQUIRED
            </AlertTitle>
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              Binaural beats <strong>only work with stereo headphones</strong>. Each ear must receive
              a different frequency to create the brainwave entrainment effect. Speakers will NOT work.
            </Typography>
          </Alert>

          {/* Introduction */}
          <Typography variant="body1" sx={{ color: 'text.primary' }}>
            EBL is an advanced binaural beat generator with 8D spatial audio, real-time
            visualization, and scientifically-backed frequency protocols for meditation,
            focus, creativity, and ADHD treatment.
          </Typography>

          <Divider />

          {/* Features Highlight */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              What you'll learn:
            </Typography>
            <Stack spacing={1.5}>
              <FeatureItem
                icon={<AudioIcon />}
                color="#00ff88"
                title="Binaural Beat Generation"
                description="Control frequencies, waveforms, and brainwave states"
              />
              <FeatureItem
                icon={<ExploreIcon />}
                color="#2196f3"
                title="8D Spatial Audio"
                description="Immersive sound movement in 3D space"
              />
              <FeatureItem
                icon={<ScienceIcon />}
                color="#9c27b0"
                title="Scientific Explanations"
                description="Learn the neuroscience behind each feature"
              />
              <FeatureItem
                icon={<BulbIcon />}
                color="#ff9800"
                title="Optimized Presets"
                description="Pre-configured patterns for different goals"
              />
            </Stack>
          </Box>

          <Divider />

          {/* Don't Show Again Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={dontShowAgain}
                onChange={handleCheckboxChange}
                sx={{
                  color: 'rgba(255, 255, 255, 0.3)',
                  '&.Mui-checked': {
                    color: '#00ff88'
                  }
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Don't show this message again
              </Typography>
            }
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={handleSkip}
          startIcon={<SkipIcon />}
          sx={{
            color: 'text.secondary',
            textTransform: 'none',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.05)'
            }
          }}
        >
          Skip for now
        </Button>
        <Button
          onClick={handleStartTutorial}
          variant="contained"
          startIcon={<StartIcon />}
          sx={{
            bgcolor: '#00ff88',
            color: '#000',
            textTransform: 'none',
            px: 3,
            '&:hover': {
              bgcolor: '#00dd77'
            }
          }}
        >
          Start Tutorial
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * Feature Item Component
 */
interface FeatureItemProps {
  icon: React.ReactElement;
  color: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  icon,
  color,
  title,
  description
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          bgcolor: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {React.cloneElement(icon, {
          sx: { fontSize: 20, color }
        })}
      </Box>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {description}
        </Typography>
      </Box>
    </Box>
  );
};
