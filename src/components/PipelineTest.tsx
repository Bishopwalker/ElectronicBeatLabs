// Pipeline Test Component - Triggers CI/CD Pipeline
import React from 'react';

interface PipelineTestProps {
  pipelineId?: string;
  triggerTime?: string;
}

const PipelineTest: React.FC<PipelineTestProps> = ({ 
  pipelineId = 'test-trigger', 
  triggerTime = new Date().toISOString() 
}) => {
  return (
    <div style={{ 
      padding: '20px', 
      background: 'linear-gradient(45deg, #ff6b00, #8a2be2)',
      color: 'white',
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <h2>🚀 CI/CD Pipeline Test</h2>
      <p>Pipeline ID: {pipelineId}</p>
      <p>Trigger Time: {triggerTime}</p>
      <p>Status: ✅ Pipeline should be running!</p>
      <div style={{ marginTop: '10px', fontSize: '12px' }}>
        This component was created to trigger the GitLab CI/CD pipeline.<br/>
        Check GitLab CI/CD → Pipelines to see it in action! 
      </div>
    </div>
  );
};

export default PipelineTest;