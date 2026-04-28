// Collapsible Section Component - Reusable collapsible UI element
// Extracted from main component for better modularity

import React from 'react';
import {Box, Card, CardContent, Collapse, IconButton, Typography} from '@mui/material';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onClose?: (id: string) => void;
  onFullscreen?: (id: string) => void;
  compact?: boolean;
}

// 🎨 Color scheme mapping based on component type - UNIQUE COLORS FOR EACH
const COMPONENT_COLORS: Record<string, { border: string; bg: string; glow: string }> = {
  // ⏱️ TIMER COUNTDOWN - Orange/Purple gradient
  timerCountdown: {
    border: '#ff6b00',
    bg: 'linear-gradient(45deg, rgba(255, 107, 0, 0.1), rgba(138, 43, 226, 0.1))',
    glow: 'rgba(255, 107, 0, 0.3)'
  },
  timerDisplay: {
    border: '#ff6b00',
    bg: 'linear-gradient(45deg, rgba(255, 107, 0, 0.1), rgba(138, 43, 226, 0.1))',
    glow: 'rgba(255, 107, 0, 0.3)'
  },

  // ⌚ TIMER PRESETS - Blue/Cyan
  timerPanel: {
    border: '#2196f3',
    bg: 'linear-gradient(45deg, rgba(33, 150, 243, 0.1), rgba(0, 188, 212, 0.1))',
    glow: 'rgba(33, 150, 243, 0.3)'
  },

  // 🌀 PATTERNS - Purple/Magenta
  patternID: {
    border: '#9c27b0',
    bg: 'linear-gradient(45deg, rgba(156, 39, 176, 0.1), rgba(233, 30, 99, 0.1))',
    glow: 'rgba(156, 39, 176, 0.3)'
  },
  patterns: {
    border: '#9c27b0',
    bg: 'linear-gradient(45deg, rgba(156, 39, 176, 0.1), rgba(233, 30, 99, 0.1))',
    glow: 'rgba(156, 39, 176, 0.3)'
  },

  // 📊 FREQUENCY VISUALIZER - Green/Cyan
  frequencyVisualizer: {
    border: '#00ff88',
    bg: 'linear-gradient(45deg, rgba(0, 255, 136, 0.1), rgba(0, 188, 212, 0.1))',
    glow: 'rgba(0, 255, 136, 0.3)'
  },

  // 🎧 BINAURAL BEATS - Orange/Red
  binauralBeats: {
    border: '#ff6b00',
    bg: 'linear-gradient(45deg, rgba(255, 107, 0, 0.1), rgba(244, 67, 54, 0.1))',
    glow: 'rgba(255, 107, 0, 0.3)'
  },

  // 🎛️ MASTER CONTROLS - Teal/Blue
  masterControls: {
    border: '#009688',
    bg: 'linear-gradient(45deg, rgba(0, 150, 136, 0.1), rgba(0, 188, 212, 0.1))',
    glow: 'rgba(0, 150, 136, 0.3)'
  },
  quickStart: {
    border: '#009688',
    bg: 'linear-gradient(45deg, rgba(0, 150, 136, 0.1), rgba(0, 188, 212, 0.1))',
    glow: 'rgba(0, 150, 136, 0.3)'
  },

  // 🎚️ EQUALIZER - Purple/Blue
  equalizer: {
    border: '#673ab7',
    bg: 'linear-gradient(45deg, rgba(103, 58, 183, 0.1), rgba(63, 81, 181, 0.1))',
    glow: 'rgba(103, 58, 183, 0.3)'
  },

  // 🌀 SPATIAL VISUALIZER - Multi-color spectrum
  spatialVisualizer: {
    border: '#8a2be2',
    bg: 'linear-gradient(135deg, rgba(255, 107, 0, 0.1) 0%, rgba(138, 43, 226, 0.1) 50%, rgba(0, 255, 136, 0.1) 100%)',
    glow: 'rgba(138, 43, 226, 0.3)'
  },
  visualizeID: {
    border: '#8a2be2',
    bg: 'linear-gradient(135deg, rgba(255, 107, 0, 0.1) 0%, rgba(138, 43, 226, 0.1) 50%, rgba(0, 255, 136, 0.1) 100%)',
    glow: 'rgba(138, 43, 226, 0.3)'
  },

  // 👁️ REMOTE VIEWING - Purple/Cyan mystical
  remoteViewing: {
    border: '#8a2be2',
    bg: 'linear-gradient(135deg, rgba(138, 43, 226, 0.15) 0%, rgba(0, 255, 136, 0.1) 100%)',
    glow: 'rgba(138, 43, 226, 0.4)'
  },

  // 🔧 DEFAULT - White/Gray theme for unknown components
  default: {
    border: 'rgba(255, 255, 255, 0.3)',
    bg: 'rgba(255, 255, 255, 0.05)',
    glow: 'rgba(255, 255, 255, 0.2)'
  }
};

// Helper to get colors for a component
const getComponentColors = (id: string) => {
  return COMPONENT_COLORS[id] || COMPONENT_COLORS.default;
};

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id,
  title,
  icon,
  children,
  defaultOpen = false,
  onClose,
  onFullscreen,
  compact = false
}) => {
  // 🔥 FIXED: Sections always open, no collapse state (confusing UX removed)
  // "Closed" means panel is in HEADER mode, not that it collapses internally
  const isOpen = true;
  
  // 🎨 Get color scheme for this component
  const colors = getComponentColors(id);
  
  const handleSectionClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose) onClose(id);
  };
  
  return (
    <Card
      id={id}  // 🔥 FIX: Add id attribute for tutorial targeting
      elevation={2}
      sx={{
        background: colors.bg,  // 🎨 Component-specific background gradient
        backdropFilter: 'blur(10px)',
        height: '100%',  // Fill grid cell
        maxHeight: compact ? '350px' : '450px',  // 🔥 Constrain height to fit on screen
        width: '100%',   // Fill grid cell
        display: 'flex',
        flexDirection: 'column',
        borderRadius: compact ? 1 : 2,
        overflow: 'hidden',
        border: `2px solid ${colors.border}`,  // 🎨 STRONGER border with color
        boxShadow: `0 0 20px ${colors.glow}, 0 4px 12px rgba(0, 0, 0, 0.5)`,  // 🎨 Stronger glow effect
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 0 30px ${colors.glow}, 0 6px 16px rgba(0, 0, 0, 0.6)`,  // 🎨 Enhanced glow on hover
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: compact ? 0.5 : 1,
          borderBottom: `2px solid ${colors.border}`,  // 🎨 STRONGER colored border
          flexShrink: 0,
          bgcolor: 'rgba(0, 0, 0, 0.4)',  // 🎨 Darker header for contrast
          background: `linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%)`  // 🎨 Subtle gradient
        }}
      >
        <Typography variant={compact ? "h6" : "h5"} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: compact ? 0.5 : 1,
          userSelect: 'none',
          fontSize: compact ? '1.1rem' : '1.4rem',  // 🔥 BIGGER: was h6 (1.25rem) now 1.4rem
          fontWeight: 600
        }}>
          {icon} {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: compact ? 0.5 : 1 }}>
          {/* Fullscreen button - only show if handler provided */}
          {onFullscreen && (
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                onFullscreen(id);
              }} 
              sx={{ 
                color: '#00bfff', 
                padding: compact ? '2px' : '8px',
                '&:hover': {
                  bgcolor: 'rgba(0, 191, 255, 0.2)',
                  color: '#00d4ff'
                }
              }}
              title="Fullscreen"
            >
              ⛶
            </IconButton>
          )}
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              handleSectionClose(e);
            }} 
            sx={{ 
              color: '#ff4444', 
              padding: compact ? '2px' : '8px',
              '&:hover': {
                bgcolor: 'rgba(255, 68, 68, 0.2)',
                color: '#ff6666'
              }
            }}
          >
            ✕
          </IconButton>
        </Box>
      </Box>
      <Collapse in={isOpen} timeout={300}>
        <Box sx={{
          flex: 1,  // ✅ Take remaining space
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',  // ✅ Let CardContent handle scroll
          minHeight: 0  // ✅ Allow flex shrinking
        }}>
          <CardContent sx={{
            p: compact ? '5px !important' : '10px !important',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,  // ✅ Allow flex shrinking
            // Only Pattern section should scroll vertically; others clamp and avoid inner scroll
            overflowY: id === 'patternID' ? 'auto' : 'hidden',
            maxHeight: id === 'patternID' ? '42.5vh' : '100%',
            overflowX: 'hidden',
            // ✅ Custom scrollbar styling
            '&::-webkit-scrollbar': {
              width: '8px'
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.05)'
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(138, 43, 226, 0.5)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(138, 43, 226, 0.7)'
              }
            }
          }}>
            {children}
          </CardContent>
        </Box>
      </Collapse>
    </Card>
  );
};

export default CollapsibleSection;