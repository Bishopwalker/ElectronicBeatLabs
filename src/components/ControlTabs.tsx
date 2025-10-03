// Electromagnetic Beat Lab - Control Tabs Component
// Tab navigation for different control panels

import React from 'react';
import { Tabs, Tab } from '@mui/material';
import type {ControlTabsProps} from '../types/index';


const ControlTabs: React.FC<ControlTabsProps> = ({
  tabs,
  activeTab,
  onTabChange
}) => {
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
  
  return (
    <Tabs
      value={activeIndex >= 0 ? activeIndex : 0}
      onChange={(_, newValue) => {
        const selectedTab = tabs[newValue];
        if (selectedTab?.enabled) {
          onTabChange(selectedTab.id);
        }
      }}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={{
        borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
        mb: 2,
        '& .MuiTab-root': {
          color: 'rgba(255, 255, 255, 0.6)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          minWidth: 80,
          px: 1.5,
          '&.Mui-selected': {
            color: '#ff6b00'
          },
          '&.Mui-disabled': {
            opacity: 0.3
          }
        },
        '& .MuiTabs-indicator': {
          backgroundColor: '#ff6b00',
          height: 2
        },
        '& .MuiTabs-scrollButtons': {
          color: '#ff6b00',
          '&.Mui-disabled': {
            opacity: 0.3
          }
        }
      }}
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          label={`${tab.icon} ${tab.label}`}
          disabled={!tab.enabled}
        />
      ))}
    </Tabs>
  );
};

export default ControlTabs;