// Collapsible Section Component - Reusable collapsible UI element
// Extracted from main component for better modularity

import React from 'react';
import { Box, Card, CardContent, IconButton, Typography } from '@mui/material';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onClose?: (id: string) => void;
  compact?: boolean;
}

// 🎨 Color scheme mapping based on component type
const COMPONENT_COLORS: Record<string, { border: string; bg: string; glow: string }> = {
  // 🎛️ CONTROLS - Orange theme
  masterControls: {
    border: '#ff6b00',
    bg: 'rgba(255, 107, 0, 0.08)',
    glow: 'rgba(255, 107, 0, 0.3)'
  },
  quickStart: {
    border: '#ff6b00',
    bg: 'rgba(255, 107, 0, 0.08)',
    glow: 'rgba(255, 107, 0, 0.3)'
  },
  
  // 🎧 AUDIO GENERATORS - Purple theme
  binauralBeats: {
    border: '#8a2be2',
    bg: 'rgba(138, 43, 226, 0.08)',
    glow: 'rgba(138, 43, 226, 0.3)'
  },
  equalizer: {
    border: '#8a2be2',
    bg: 'rgba(138, 43, 226, 0.08)',
    glow: 'rgba(138, 43, 226, 0.3)'
  },
  
  // 🎨 VISUALIZERS - Cyan/Green theme
  frequencyVisualizer: {
    border: '#00ff88',
    bg: 'rgba(0, 255, 136, 0.06)',
    glow: 'rgba(0, 255, 136, 0.3)'
  },
  visualizeID: {
    border: '#00ff88',
    bg: 'rgba(0, 255, 136, 0.06)',
    glow: 'rgba(0, 255, 136, 0.3)'
  },
  
  // ⏰ TIMER/PATTERNS - Blue theme
  timerPanel: {
    border: '#00bfff',
    bg: 'rgba(0, 191, 255, 0.06)',
    glow: 'rgba(0, 191, 255, 0.3)'
  },
  patternID: {
    border: '#00bfff',
    bg: 'rgba(0, 191, 255, 0.06)',
    glow: 'rgba(0, 191, 255, 0.3)'
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
  compact = false
}) => {
  // 🔥 FIXED: Sections always open, no collapse state (confusing UX removed)
  const isOpen = true;
  
  // 🎨 Get color scheme for this component
  const colors = getComponentColors(id);
  
  const handleSectionClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose) onClose(id);
  };
  
  return (
    <Card elevation={2} sx={{ 
      bgcolor: colors.bg,  // 🎨 Component-specific background
      backdropFilter: 'blur(10px)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: compact ? 1 : 2,
      overflow: 'hidden',
      border: `2px solid ${colors.border}`,  // 🎨 STRONGER border with color
      boxShadow: `0 0 15px ${colors.glow}, 0 4px 12px rgba(0, 0, 0, 0.5)`,  // 🎨 Glow effect
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: `0 0 25px ${colors.glow}, 0 6px 16px rgba(0, 0, 0, 0.6)`,  // 🎨 Enhanced glow on hover
        transform: 'translateY(-2px)'
      }
    }}>
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
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              console.log('🚫 Closing section:', id);  // Debug
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
          overflow: 'auto',  // ✅ SCROLL HERE if content overflows
          overflowX: 'hidden',  // ✅ NO horizontal scroll
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
    </Card>
  );
};

export default CollapsibleSection;