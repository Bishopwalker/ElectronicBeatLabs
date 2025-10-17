// Collapsible Section Component - Reusable collapsible UI element
// Extracted from main component for better modularity

import React, { useState } from 'react';
import { Box, Card, CardContent, Collapse, IconButton, Typography } from '@mui/material';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onClose?: (id: string) => void;
  compact?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  id,
  title, 
  icon, 
  children, 
  defaultOpen = false,
  onClose,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const handleSectionClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose) onClose(id);
  };
  
  return (
    <Card elevation={2} sx={{ 
      bgcolor: 'rgba(0, 0, 0, 0.3)', 
      backdropFilter: 'blur(10px)',
      height: '100%',  // ✅ Fill parent container
      display: 'flex',
      flexDirection: 'column',
      borderRadius: compact ? 1 : 2,
      overflow: 'hidden'  // ✅ Prevent outer overflow
    }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: compact ? 0.5 : 1,
          cursor: 'pointer',
          borderBottom: isOpen ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          flexShrink: 0,
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.05)'
          }
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Typography variant={compact ? "body2" : "h6"} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: compact ? 0.5 : 1,
          userSelect: 'none'
        }}>
          <span style={{ fontSize: compact ? '0.9rem' : '1rem' }}>
            {isOpen ? '▼' : '▶'}
          </span>
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
      <Collapse in={isOpen} sx={{ 
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
      </Collapse>
    </Card>
  );
};

export default CollapsibleSection;