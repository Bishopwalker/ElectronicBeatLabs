/**
 * Tutorial Progress Component
 *
 * Displays tutorial completion progress with category breakdown,
 * navigation controls, and completion status.
 */

import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Stack,
  IconButton,
  Collapse,
  Divider
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  EmojiEvents as TrophyIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Headphones as AudioIcon,
  Palette as PatternsIcon,
  ThreeDRotation as SpatialIcon,
  Timer as TimerIcon,
  Equalizer as EqualizerIcon,
  Visibility as VizIcon,
  Settings as AdvancedIcon
} from '@mui/icons-material';
import { useTutorial } from './TutorialContext';
import { TutorialProgressProps, TutorialCategory } from './types';

/**
 * Category icon mapping
 */
const CATEGORY_ICONS: Record<TutorialCategory, React.ReactElement> = {
  audio: <AudioIcon />,
  patterns: <PatternsIcon />,
  spatial: <SpatialIcon />,
  timer: <TimerIcon />,
  equalizer: <EqualizerIcon />,
  visualization: <VizIcon />,
  advanced: <AdvancedIcon />
};

/**
 * Category color mapping
 */
const CATEGORY_COLORS: Record<TutorialCategory, string> = {
  audio: '#00ff88',
  patterns: '#2196f3',
  spatial: '#9c27b0',
  timer: '#ff9800',
  equalizer: '#f44336',
  visualization: '#00bcd4',
  advanced: '#607d8b'
};

/**
 * TutorialProgress Component
 */
export const TutorialProgress: React.FC<TutorialProgressProps> = ({
  compact = false,
  showCategories = true
}) => {
  const {
    isActive,
    isTutorialComplete,
    completedSteps,
    currentStep,
    startTutorial,
    stopTutorial,
    skipToCategory,
    getCategoryProgress,
    getAllSteps
  } = useTutorial();

  const [expanded, setExpanded] = React.useState(!compact);

  // Calculate overall progress
  const allSteps = useMemo(() => getAllSteps(), [getAllSteps]);
  const totalSteps = allSteps.filter(s => !s.optional).length;
  const completedCount = completedSteps.filter(id => {
    const step = allSteps.find(s => s.id === id);
    return step && !step.optional;
  }).length;
  const progressPercentage = Math.round((completedCount / totalSteps) * 100);

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(allSteps.map(s => s.category))) as TutorialCategory[];
  }, [allSteps]);

  // Toggle expansion
  const handleToggleExpand = () => {
    setExpanded(prev => !prev);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: isTutorialComplete ? '#9c27b0' : 'divider'
      }}
    >
      <Stack spacing={2}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Tutorial Progress
            </Typography>
            {isTutorialComplete && (
              <TrophyIcon sx={{ color: '#9c27b0', fontSize: 24 }} />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isActive ? (
              <Button
                size="small"
                variant="contained"
                startIcon={<StartIcon />}
                onClick={startTutorial}
                sx={{
                  bgcolor: '#00ff88',
                  color: '#000',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#00dd77' }
                }}
              >
                {completedCount > 0 ? 'Continue' : 'Start'} Tutorial
              </Button>
            ) : (
              <Button
                size="small"
                variant="outlined"
                startIcon={<StopIcon />}
                onClick={stopTutorial}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'text.secondary',
                  textTransform: 'none'
                }}
              >
                Stop
              </Button>
            )}
            {!compact && (
              <IconButton size="small" onClick={handleToggleExpand}>
                {expanded ? <CollapseIcon /> : <ExpandIcon />}
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Overall Progress */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Overall Progress
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {completedCount} / {totalSteps} ({progressPercentage}%)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                bgcolor: isTutorialComplete ? '#9c27b0' : '#00ff88',
                borderRadius: 4
              }
            }}
          />
        </Box>

        {/* Current Step */}
        {isActive && currentStep && (
          <Box>
            <Chip
              label={`Current: ${currentStep.title}`}
              size="small"
              sx={{
                bgcolor: 'rgba(0, 255, 136, 0.2)',
                color: '#00ff88',
                fontWeight: 600
              }}
            />
          </Box>
        )}

        {/* Category Breakdown */}
        {showCategories && (
          <Collapse in={expanded}>
            <Stack spacing={1.5}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Categories
              </Typography>
              {categories.map(category => {
                const progress = getCategoryProgress(category);
                const isComplete = progress.completed === progress.total;
                const color = CATEGORY_COLORS[category];

                return (
                  <Box key={category}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Box sx={{ color, display: 'flex', alignItems: 'center' }}>
                        {React.cloneElement(CATEGORY_ICONS[category], { fontSize: 'small' })}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          flex: 1,
                          textTransform: 'capitalize',
                          fontWeight: 500
                        }}
                      >
                        {category}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {progress.completed}/{progress.total}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => skipToCategory(category)}
                        disabled={isComplete}
                        sx={{
                          minWidth: 60,
                          fontSize: '0.7rem',
                          textTransform: 'none',
                          color,
                          borderColor: color,
                          '&:hover': {
                            borderColor: color,
                            bgcolor: `${color}20`
                          }
                        }}
                        variant="outlined"
                      >
                        {isComplete ? 'Done' : 'Start'}
                      </Button>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress.percentage}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: color,
                          borderRadius: 2
                        }
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Collapse>
        )}

        {/* Completion Message */}
        {isTutorialComplete && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: 'rgba(156, 39, 176, 0.1)',
              borderLeft: '4px solid #9c27b0',
              borderRadius: 1
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#9c27b0' }}>
              Congratulations! You've completed the tutorial!
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
              You're ready to explore all the features of the Electromagnetic Beat Lab.
            </Typography>
          </Paper>
        )}
      </Stack>
    </Paper>
  );
};
