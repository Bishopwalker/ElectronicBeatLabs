/**
 * Tutorial Settings Component
 *
 * Settings panel for tutorial preferences, progress management,
 * and dismissed tooltips restoration.
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  Button,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import {
  RestartAlt as ResetIcon,
  PlayArrow as StartIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  Science as ScienceIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material';
import { useTutorial } from './TutorialContext';
import { TutorialSettingsProps } from './types';

/**
 * TutorialSettings Component
 */
export const TutorialSettings: React.FC<TutorialSettingsProps> = ({
  embedded = false
}) => {
  const {
    showOnStartup,
    showScienceByDefault,
    dismissedTooltips,
    completedSteps,
    isTutorialComplete,
    toggleShowOnStartup,
    toggleShowScience,
    resetTutorial,
    startTutorial,
    restoreTooltip,
    getAllSteps
  } = useTutorial();

  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  // Get all steps for dismissed tooltip names
  const allSteps = getAllSteps();

  // Handle reset with confirmation
  const handleResetClick = () => {
    if (showResetConfirm) {
      resetTutorial();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 5000);
    }
  };

  const Container = embedded ? Box : Paper;
  const containerProps = embedded
    ? {}
    : {
        elevation: 3,
        sx: {
          p: 3,
          borderRadius: 2,
          bgcolor: 'background.paper'
        }
      };

  return (
    <Container {...containerProps}>
      <Stack spacing={3}>
        {/* Header */}
        {!embedded && (
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Tutorial Settings
          </Typography>
        )}

        {/* Show on Startup Toggle */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Show tutorial on startup
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Display welcome message and tutorial prompt when first loading the app
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={showOnStartup}
              onChange={toggleShowOnStartup}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#00ff88'
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  bgcolor: '#00ff88'
                }
              }}
            />
          </Box>
        </Box>

        {/* Show Science by Default Toggle */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScienceIcon sx={{ color: '#2196f3', fontSize: 20 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Show science explanations by default
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Automatically expand scientific content in tutorial tooltips
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={showScienceByDefault}
              onChange={toggleShowScience}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#2196f3'
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  bgcolor: '#2196f3'
                }
              }}
            />
          </Box>
        </Box>

        <Divider />

        {/* Tutorial Actions */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Tutorial Actions
          </Typography>
          <Stack spacing={1.5}>
            {/* Start Guided Tour */}
            <Button
              fullWidth
              variant="contained"
              startIcon={<StartIcon />}
              onClick={startTutorial}
              sx={{
                bgcolor: '#00ff88',
                color: '#000',
                textTransform: 'none',
                justifyContent: 'flex-start',
                '&:hover': {
                  bgcolor: '#00dd77'
                }
              }}
            >
              {completedSteps.length > 0 ? 'Continue guided tour' : 'Start guided tour'}
            </Button>

            {/* Reset Tutorial Progress */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ResetIcon />}
              onClick={handleResetClick}
              sx={{
                borderColor: showResetConfirm ? '#f44336' : 'rgba(255, 255, 255, 0.3)',
                color: showResetConfirm ? '#f44336' : 'text.secondary',
                textTransform: 'none',
                justifyContent: 'flex-start',
                '&:hover': {
                  borderColor: '#f44336',
                  bgcolor: 'rgba(244, 67, 54, 0.1)'
                }
              }}
            >
              {showResetConfirm ? 'Click again to confirm reset' : 'Reset tutorial progress'}
            </Button>

            {showResetConfirm && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                This will erase all tutorial progress and restore all dismissed tooltips.
              </Alert>
            )}
          </Stack>
        </Box>

        {/* Progress Summary */}
        {completedSteps.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Progress Summary
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`${completedSteps.length} steps completed`}
                size="small"
                sx={{
                  bgcolor: 'rgba(0, 255, 136, 0.2)',
                  color: '#00ff88'
                }}
              />
              {isTutorialComplete && (
                <Chip
                  label="Tutorial Complete!"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(156, 39, 176, 0.2)',
                    color: '#9c27b0',
                    fontWeight: 600
                  }}
                />
              )}
            </Box>
          </Box>
        )}

        {/* Dismissed Tooltips */}
        {dismissedTooltips.length > 0 && (
          <>
            <Divider />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Dismissed Tooltips ({dismissedTooltips.length})
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                Restore tooltips you've previously dismissed
              </Typography>
              <List
                dense
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 1,
                  maxHeight: 200,
                  overflow: 'auto'
                }}
              >
                {dismissedTooltips.map(tooltipId => {
                  const step = allSteps.find(s => s.id === tooltipId);
                  const title = step?.title || tooltipId;

                  return (
                    <ListItem key={tooltipId}>
                      <ListItemText
                        primary={title}
                        secondary={step?.category}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { fontWeight: 500 }
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption',
                          sx: { textTransform: 'capitalize' }
                        }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => restoreTooltip(tooltipId)}
                          sx={{
                            color: '#00ff88',
                            '&:hover': {
                              bgcolor: 'rgba(0, 255, 136, 0.1)'
                            }
                          }}
                        >
                          <RestoreIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          </>
        )}
      </Stack>
    </Container>
  );
};
