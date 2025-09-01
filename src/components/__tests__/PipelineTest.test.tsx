import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PipelineTest from '../PipelineTest';

describe('PipelineTest', () => {
  test('renders pipeline test component', () => {
    render(<PipelineTest />);
    expect(screen.getByText(/CI\/CD Pipeline Test/i)).toBeInTheDocument();
  });

  test('displays pipeline ID', () => {
    render(<PipelineTest pipelineId="custom-test-123" />);
    expect(screen.getByText(/custom-test-123/)).toBeInTheDocument();
  });

  test('shows trigger time', () => {
    const testTime = '2025-01-01T10:00:00.000Z';
    render(<PipelineTest triggerTime={testTime} />);
    expect(screen.getByText((content, element) => content.includes(testTime))).toBeInTheDocument();
  });

  test('displays success status', () => {
    render(<PipelineTest />);
    expect(screen.getByText(/Pipeline should be running/i)).toBeInTheDocument();
  });

  test('renders with default props', () => {
    render(<PipelineTest />);
    expect(screen.getByText(/test-trigger/)).toBeInTheDocument();
    expect(screen.getByText(/Status: ✅ Pipeline should be running!/)).toBeInTheDocument();
  });
});