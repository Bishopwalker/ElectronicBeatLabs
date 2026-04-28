/**
 * Tutorial Tooltip Component
 *
 * Smart tooltip wrapper with tutorial functionality, science content,
 * and dismissal tracking. Wraps MUI Tooltip with enhanced features.
 */

import React, { useState, useCallback } from 'react';
import {
  Tooltip,
  Box,
  Typography,
  Button,
  IconButton,
  Collapse,
  Paper,
  Stack
} from '@mui/material';
import {
  NavigateBefore as PreviousIcon,
  NavigateNext as NextIcon,
  Close as CloseIcon,
  Science as ScienceIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useTutorial } from './TutorialContext';
import { TutorialTooltipProps } from './types';

/**
 * TutorialTooltip Component
 *
 * Enhanced tooltip with tutorial controls and science content.
 */
export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
  tooltipId,
  children,
  placement = 'auto',
  showScience: showScienceProp,
  category,
  title,
  content,
  scienceContent,
  disabled = false,
  forceShow = false
}) => {
  const {
    isActive,
    currentStep,
    completedSteps,
    dismissedTooltips,
    showScienceByDefault,
    nextStep,
    previousStep,
    dismissTooltip,
    getCategoryProgress
  } = useTutorial();

  const [showScienceSection, setShowScienceSection] = useState(
    showScienceProp ?? showScienceByDefault
  );

  // Determine if this tooltip should be shown
  const isCurrentStep = currentStep?.id === tooltipId;
  const isDismissed = dismissedTooltips.includes(tooltipId);
  const isCompleted = completedSteps.includes(tooltipId);
  const shouldShow = (isActive && isCurrentStep) || forceShow;

  // Don't show if disabled or dismissed (unless forced)
  if (disabled || (isDismissed && !forceShow)) {
    return <>{children}</>;
  }

  // Determine tooltip content
  const tooltipTitle = currentStep?.title || title || 'Tutorial';
  const tooltipContent = currentStep?.content || content || '';
  const tooltipScience = currentStep?.scienceContent || scienceContent;

  // Toggle science section
  const handleToggleScience = useCallback(() => {
    setShowScienceSection(prev => !prev);
  }, []);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    dismissTooltip(tooltipId);
  }, [dismissTooltip, tooltipId]);

  // Get progress info
  const progressInfo = category ? getCategoryProgress(category) : null;

  // Create tooltip content
  const tooltipElement = (
    <Paper
      elevation={8}
      sx={{
        maxWidth: 400,
        p: 2,
        bgcolor: 'background.paper',
        border: '2px solid',
        borderColor: isCompleted ? '#9c27b0' : '#00ff88',
        borderRadius: 2
      }}
    >
      <Stack spacing={1.5}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#00ff88',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              {tooltipTitle}
              {isCompleted && (
                <CheckIcon sx={{ fontSize: 18, color: '#9c27b0' }} />
              )}
            </Typography>
            {progressInfo && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {category?.toUpperCase()}: {progressInfo.completed}/{progressInfo.total} ({progressInfo.percentage}%)
              </Typography>
            )}
          </Box>
          <IconButton
            size="small"
            onClick={handleDismiss}
            sx={{ ml: 1, color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Main Content */}
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {tooltipContent}
        </Typography>

        {/* Science Section */}
        {tooltipScience && (
          <Box>
            <Button
              size="small"
              startIcon={<ScienceIcon />}
              onClick={handleToggleScience}
              sx={{
                color: '#2196f3',
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
                '&:hover': {
                  bgcolor: 'transparent',
                  textDecoration: 'underline'
                }
              }}
            >
              {showScienceSection ? 'Hide' : 'Show'} Science
            </Button>
            <Collapse in={showScienceSection}>
              <Paper
                elevation={0}
                sx={{
                  mt: 1,
                  p: 1.5,
                  bgcolor: 'rgba(33, 150, 243, 0.1)',
                  borderLeft: '3px solid #2196f3',
                  borderRadius: 1
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    whiteSpace: 'pre-line',
                    display: 'block'
                  }}
                >
                  {tooltipScience}
                </Typography>
              </Paper>
            </Collapse>
          </Box>
        )}

        {/* Navigation Buttons */}
        {isActive && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', mt: 1 }}>
            <Button
              size="small"
              startIcon={<PreviousIcon />}
              onClick={previousStep}
              variant="outlined"
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'text.secondary',
                textTransform: 'none'
              }}
            >
              Previous
            </Button>
            <Button
              size="small"
              endIcon={<NextIcon />}
              onClick={nextStep}
              variant="contained"
              sx={{
                bgcolor: '#00ff88',
                color: '#000',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#00dd77'
                }
              }}
            >
              {isCompleted ? 'Next' : 'Got it'}
            </Button>
          </Box>
        )}
      </Stack>
    </Paper>
  );

  return (
    <Tooltip
      title={tooltipElement}
      open={shouldShow}
      placement={placement}
      arrow
      disableFocusListener
      disableHoverListener
      disableTouchListener
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'transparent',
            p: 0,
            maxWidth: 'none'
          }
        },
        arrow: {
          sx: {
            color: isCompleted ? '#9c27b0' : '#00ff88'
          }
        }
      }}
    >
      <Box sx={{ display: 'inline-block' }}>
        {children}
      </Box>
    </Tooltip>
  );
};
