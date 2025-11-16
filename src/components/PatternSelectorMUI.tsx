// Electromagnetic Beat Lab - Pattern Selector Component (Material UI)
// Pattern selection with mode controls

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Stack,
  Paper,
} from '@mui/material';
import type { PatternSelectorProps, PatternMode } from '../types';

interface PatternSelectorPropsExtended extends PatternSelectorProps {
  activePattern?: string | null; // Currently active pattern (from timer, visualizer, etc.)
}

const PatternSelectorMUI: React.FC<PatternSelectorPropsExtended> = ({
  patterns,
  selected,
  onSelect,
  mode,
  onModeChange,
  activePattern
}) => {
  const modes: PatternMode[] = ['AUTO', 'MANUAL', 'SYNC', 'FLOW'];
  
  const getModeColor = (m: PatternMode): 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' => {
    switch (m) {
      case 'AUTO': return 'primary';
      case 'MANUAL': return 'secondary';
      case 'SYNC': return 'success';
      case 'FLOW': return 'info';
      default: return 'inherit';
    }
  };

  // 🔥 NEW: Distinct colors for each pattern type - matching app theme
  const getPatternColors = (patternType: string, index: number) => {
    // Color palette matching the app's vibrant theme
    const colorPalette = [
      { bg: 'rgba(255, 107, 0, 0.15)', border: '#ff6b00', gradient: 'linear-gradient(135deg, #ff6b00, #ff8533)' }, // Orange
      { bg: 'rgba(138, 43, 226, 0.15)', border: '#8a2be2', gradient: 'linear-gradient(135deg, #8a2be2, #9944d9)' }, // Purple
      { bg: 'rgba(0, 255, 136, 0.15)', border: '#00ff88', gradient: 'linear-gradient(135deg, #00ff88, #00cc6a)' }, // Green
      { bg: 'rgba(0, 191, 255, 0.15)', border: '#00bfff', gradient: 'linear-gradient(135deg, #00bfff, #0099cc)' }, // Cyan
      { bg: 'rgba(255, 64, 129, 0.15)', border: '#ff4081', gradient: 'linear-gradient(135deg, #ff4081, #f50057)' }, // Pink
      { bg: 'rgba(255, 193, 7, 0.15)', border: '#ffc107', gradient: 'linear-gradient(135deg, #ffc107, #ff9800)' }, // Amber
      { bg: 'rgba(76, 175, 80, 0.15)', border: '#4caf50', gradient: 'linear-gradient(135deg, #4caf50, #388e3c)' }, // Green Alt
      { bg: 'rgba(156, 39, 176, 0.15)', border: '#9c27b0', gradient: 'linear-gradient(135deg, #9c27b0, #7b1fa2)' }, // Deep Purple
    ];

    // Return color based on index (cycles through palette)
    return colorPalette[index % colorPalette.length];
  };

  return (
    <Card sx={{
      height: '100%',
      width: '100%',  // 🔥 FIXED: Fill parent grid cell
      display: 'flex',
      paddingBlockEnd: '6',
      flexDirection: 'column',
      overflowX: 'hidden',
      overflowY: 'auto',  // 🔥 FIXED: auto instead of scroll to prevent scrollbar when not needed
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    }}>
      <CardContent sx={{ p: 1.5, pb: 0, flexShrink: 0 }}>
        <Typography variant="h4" align="center" color="primary" gutterBottom>
          Pattern Selector
        </Typography>

        <ButtonGroup
          fullWidth
          size="small"
          sx={{ mb: 1 }}
        >
          {modes.map((m) => (
            <Button
              key={m}
              variant={mode === m ? 'contained' : 'outlined'}
              color={getModeColor(m)}
              onClick={() => onModeChange(m)}
              sx={{
                fontSize: '0.7rem',
                py: 0.5,
                ...(mode === m && {
                  background: 'linear-gradient(45deg, #ff6b00, #8a2be2)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #ff8533, #9944d9)',
                  },
                }),
              }}
            >
              {m}
            </Button>
          ))}
        </ButtonGroup>
      </CardContent>

      <Box sx={{
        flex: '1 1 auto',
        overflow: 'visible',
        px: 1.5,
        pb: 1.5,
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'linear-gradient(45deg, #ff6b00, #8a2be2)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'linear-gradient(45deg, #ff8533, #9944d9)',
        },
      }}>
        <List dense sx={{ p: 0 }}>
          {patterns.map((pattern, index) => {
            const isSelected = selected === pattern.id;
            const isActive = activePattern === pattern.id;
            const patternColors = getPatternColors(pattern.type, index);

            return (
              <ListItem key={pattern.id} disablePadding sx={{ mb: 0.5 }}>
                <Paper
                  elevation={0}
                  sx={{
                    width: '100%',
                    background: isActive
                      ? 'rgba(0, 191, 255, 0.25)' // Blue for active (timer/visualizer)
                      : isSelected
                      ? patternColors.bg // 🔥 DISTINCT COLOR when selected
                      : 'rgba(255, 255, 255, 0.03)',
                    border: '2px solid',
                    borderColor: isActive
                      ? '#00bfff' // Blue border for active
                      : isSelected
                      ? patternColors.border // 🔥 DISTINCT BORDER when selected
                      : 'rgba(255, 255, 255, 0.1)',
                    borderLeft: `4px solid ${patternColors.border}`, // 🔥 ALWAYS show distinct color on left edge
                    borderStyle: 'solid',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&:hover': {
                      background: isActive
                        ? 'rgba(0, 191, 255, 0.3)'
                        : patternColors.bg, // 🔥 DISTINCT HOVER COLOR
                      borderColor: isActive ? '#00bfff' : patternColors.border,
                      boxShadow: `0 0 12px ${patternColors.border}40`, // 🔥 GLOW on hover
                    },
                    // Glow effect for active patterns
                    ...(isActive && {
                      boxShadow: '0 0 8px rgba(0, 191, 255, 0.4)',
                      '&::after': {
                        content: '""',
                        top: -2,
                        left: -2,
                        right: -2,
                        bottom: -2,
                        background: 'linear-gradient(45deg, #00bfff, #8a2be2)',
                        borderRadius: '8px',
                        zIndex: -1,
                        opacity: 0.3,
                        animation: 'pulse 2s infinite'
                      }
                    })
                  }}
                >
                <ListItemButton
                  onClick={() => onSelect(pattern.id)}
                  sx={{ py: 0.75, px: 1 }}
                >
                  <ListItemText
                    primaryTypographyProps={{ component: 'div' }}
                    secondaryTypographyProps={{ component: 'div' }}
                    primary={
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                          {pattern.name}
                        </Typography>
                        {isActive && (
                          <Chip
                            label="ACTIVE"
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              background: 'linear-gradient(45deg, #00bfff, #00ff88)',
                              color: 'white',
                              '& .MuiChip-label': {
                                px: 0.5
                              }
                            }}
                          />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Stack spacing={0.5}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Chip
                            label={pattern.type}
                            size="small"
                            color="success"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              textTransform: 'uppercase',
                            }}
                          />
                          <Typography
                            variant="caption"
                            color="secondary"
                            sx={{ fontFamily: 'monospace' }}
                          >
                            {pattern.frequencies.beat.toFixed(1)} Hz
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {pattern.description}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItemButton>
              </Paper>
            </ListItem>
          );
        })}
        </List>
      </Box>
    </Card>
  );
};

export default PatternSelectorMUI;