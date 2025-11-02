import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 * Prevents entire app crash from component errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {

    this.setState({
      error,
      errorInfo
    });

    // Log to external monitoring service if available
    if (window.analytics) {
      window.analytics.track('React Error Boundary', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            p: 3
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              border: '1px solid rgba(244, 67, 54, 0.3)'
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{ color: '#f44336', fontWeight: 'bold' }}
            >
              ⚠️ Something went wrong
            </Typography>

            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
              The application encountered an error. This has been logged for investigation.
            </Typography>

            {this.state.error && (
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 1,
                  border: '1px solid rgba(244, 67, 54, 0.2)'
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#f44336',
                    fontFamily: 'monospace',
                    display: 'block',
                    wordBreak: 'break-word',
                    mb: 1
                  }}
                >
                  {this.state.error.name}: {this.state.error.message}
                </Typography>

                {this.state.error.cause && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#ff9800',
                      fontFamily: 'monospace',
                      display: 'block',
                      wordBreak: 'break-word',
                      mb: 1
                    }}
                  >
                    Caused by: {String(this.state.error.cause)}
                  </Typography>
                )}

                {this.state.errorInfo && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#f44336',
                      fontFamily: 'monospace',
                      display: 'block',
                      wordBreak: 'break-word',
                      fontSize: '0.7rem'
                    }}
                  >
                    Component Stack: {this.state.errorInfo.componentStack}
                  </Typography>
                )}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={this.handleReset}
                sx={{
                  backgroundColor: '#ff6b00',
                  '&:hover': {
                    backgroundColor: '#ff8533'
                  }
                }}
              >
                Try Again
              </Button>

              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)'
                  }
                }}
              >
                Reload Page
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Analytics type declaration
declare global {
  interface Window {
    analytics?: {
      track: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}