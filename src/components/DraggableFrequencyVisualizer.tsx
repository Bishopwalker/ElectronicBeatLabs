// Draggable Frequency Visualizer Component
// Wraps the FrequencyVisualizer in a draggable/resizable container

import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, IconButton, Typography } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { FrequencyVisualizer } from './FrequencyVisualizer';

interface DraggableFrequencyVisualizerProps {
  state: any;
  audioContext?: AudioContext;
  analyserNode?: AnalyserNode;
  onClose: () => void;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
}

const DraggableFrequencyVisualizer: React.FC<DraggableFrequencyVisualizerProps> = ({
  state,
  audioContext,
  analyserNode,
  onClose,
  defaultPosition = { x: window.innerWidth - 520, y: 150 },
  defaultSize = { width: 500, height: 200 }
}) => {
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [collapsed, setCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [previousSize, setPreviousSize] = useState(defaultSize);
  const [previousPosition, setPreviousPosition] = useState(defaultPosition);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
  };

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Keep within viewport bounds
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - (collapsed ? 50 : size.height);
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      } else if (isResizing) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        setSize(prev => ({
          width: Math.max(300, Math.min(800, prev.width + deltaX)),
          height: Math.max(150, Math.min(400, prev.height + deltaY))
        }));
        
        setDragStart({
          x: e.clientX,
          y: e.clientY
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, size, collapsed]);

  // Toggle full screen mode
  const makeFullScreen = () => {
    if (isFullScreen) {
      // Restore to previous size and position
      setSize(previousSize);
      setPosition(previousPosition);
      setIsFullScreen(false);
      console.log('Exiting full screen mode, restoring to:', previousSize);
    } else {
      // Save current size and position before going full screen
      setPreviousSize(size);
      setPreviousPosition(position);

      // Set to full screen dimensions
      const fullScreenSize = {
        width: window.innerWidth - 40, // Leave 20px margin on each side
        height: window.innerHeight - 100 // Leave space for top position
      };

      setSize(fullScreenSize);
      setPosition({ x: 20, y: 50 }); // Center with margin
      setIsFullScreen(true);
      console.log('Entering full screen mode:', fullScreenSize);
    }
  };

  return (
    <Paper
      ref={containerRef}
      elevation={6}
      sx={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: size.width,
        minHeight: '450px',
        height: collapsed ? 'auto' : size.height,
        zIndex: 1000,
        bgcolor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        overflow: 'hidden',
        userSelect: isDragging || isResizing ? 'none' : 'auto',
        cursor: isDragging ? 'grabbing' : 'default',
        transition: collapsed ? 'height 0.3s ease' : 'none'
      }}
    >
      {/* Header with drag handle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          bgcolor: 'rgba(138, 43, 226, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing'
          }
        }}
        onMouseDown={handleDragStart}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '75%'}}>
          <DragIndicatorIcon sx={{ color: '#8a2be2', fontSize: '1.2rem' }} />
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold', userSelect: 'none' }}>
            📊 Frequency Visualizer
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={makeFullScreen}
            sx={{ color: 'white', p: 0.5 }}
            title={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullScreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setCollapsed(!collapsed)}
            sx={{ color: 'white', p: 0.5 }}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '▼' : '▲'}
          </IconButton>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: '#ff4444', p: 0.5 }}
            title="Close"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

      </Box>

      {/* Content */}
      {!collapsed && (
        <Box sx={{ 
          height: `calc(100% - 40px)`,
          position: 'relative',
          p: 1
        }}>
          <FrequencyVisualizer
            state={state}
            audioContext={audioContext}
            analyserNode={analyserNode}
            title=""
            showSpectrum={true}
            showFrequencies={true}
            showMetrics={false}
            height={size.height - 60}
            width={100}
          />
          
          {/* Resize handle */}
      
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 20,
              height: 20,
              cursor: 'nwse-resize',
              bgcolor: 'transparent',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 10,
                height: 10,
                borderRight: '2px solid rgba(255, 255, 255, 0.3)',
                borderBottom: '2px solid rgba(255, 255, 255, 0.3)'
              }
            }}
            onMouseDown={handleResizeStart}
          />
        </Box>
      )}
    </Paper>
  );
};

export default DraggableFrequencyVisualizer;