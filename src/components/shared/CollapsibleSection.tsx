// Collapsible Section Component - Reusable collapsible UI element
// Extracted from main component for better modularity

import React, { useState } from 'react';
import { Box, Card, CardContent, Collapse, IconButton, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onClose?: (id: string) => void;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  id,
  title, 
  icon, 
  children, 
  defaultOpen = false,
  onClose 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const handleSectionClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose) onClose(id);
  };
  
  return (
    <Card elevation={2} sx={{ 
      mb: '10px', 
      bgcolor: 'rgba(0, 0, 0, 0.3)', 
      backdropFilter: 'blur(10px)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 1,
          cursor: 'pointer',
          borderBottom: isOpen ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          flexShrink: 0
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon} {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={handleSectionClose} sx={{ color: '#ff4444' }}>
            ✕
          </IconButton>
          <IconButton size="small">
            {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>
      <Collapse in={isOpen} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ 
          p: '10px !important', 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          overflow: 'auto'
        }}>
          {children}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default CollapsibleSection;