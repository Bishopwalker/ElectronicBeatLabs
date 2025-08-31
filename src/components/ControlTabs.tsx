// Electromagnetic Beat Lab - Control Tabs Component
// Tab navigation for different control panels

import React from 'react';
import styled from 'styled-components';
import type { ControlTabsProps } from '../types/index';

const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
  overflow-x: auto;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: ${props => props.active ? '#ff6b00' : 'rgba(255, 255, 255, 0.6)'};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => props.active && `
    border-bottom-color: #ff6b00;
    background: rgba(255, 107, 0, 0.1);
    box-shadow: 0 0 10px rgba(255, 107, 0, 0.2);
  `}
  
  &:hover:not([disabled]) {
    color: ${props => props.active ? '#ff8533' : 'rgba(255, 255, 255, 0.8)'};
    background: rgba(255, 107, 0, 0.05);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const TabIcon = styled.span`
  font-size: 1rem;
`;

const ControlTabs: React.FC<ControlTabsProps> = ({
  tabs,
  activeTab,
  onTabChange
}) => {
  return (
    <TabContainer>
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          active={activeTab === tab.id}
          disabled={!tab.enabled}
          onClick={() => tab.enabled && onTabChange(tab.id)}
        >
          <TabIcon>{tab.icon}</TabIcon>
          {tab.label}
        </TabButton>
      ))}
    </TabContainer>
  );
};

export default ControlTabs;