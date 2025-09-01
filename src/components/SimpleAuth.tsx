import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Typography, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export const SimpleAuth: React.FC = () => {
  const { user, usage, requiresLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // This would integrate with Google OAuth
      // For now, simulate with a test token
      alert('Google OAuth integration needed - add your Google Client ID to backend .env');
      
      // Example of how it would work:
      // 1. Get Google OAuth token from popup
      // 2. Send to backend for verification
      // await login('google', googleToken);
      
    } catch {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      alert('GitHub OAuth integration needed - add your GitHub Client ID to backend .env');
      // await login('github', githubToken);
    } catch {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const openSubscriptionFlow = () => {
    if (!user) return;
    
    // This would open Stripe Checkout or your subscription UI
    alert(`Subscription flow for ${user.email} - integrate with Stripe Elements`);
  };

  if (!user) {
    // Login screen - different messaging based on whether login is required
    const isRequired = requiresLogin;
    
    return (
      <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {isRequired ? 'Login Required' : 'Optional Login'}
          </Typography>
          
          {isRequired ? (
            <Typography variant="body2" color="text.secondary" paragraph>
              You've used your free 3 hours this month. Login for a fresh 3-hour limit or upgrade to unlimited for $3.99/month.
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" paragraph>
              Login for additional benefits and to track your usage across devices. Or continue using anonymously with your free 3 hours per month.
            </Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleGoogleLogin}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}
            >
              Login with Google
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleGitHubLogin}
              disabled={loading}
            >
              Login with GitHub
            </Button>
          </Box>

          <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'center' }}>
            We only store your email for billing purposes
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // User dashboard
  return (
    <Card sx={{ maxWidth: 500, mx: 'auto', mt: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6">
              Welcome back!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email} ({user.oauth_provider})
            </Typography>
          </Box>
          
          <Button size="small" onClick={() => alert('Logout functionality')}>
            Logout
          </Button>
        </Box>

        {user.is_premium ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            🎵 Premium subscriber - unlimited usage!
          </Alert>
        ) : (
          <Box>
            {usage && (
              <Alert 
                severity={usage.can_use ? "info" : "warning"}
                sx={{ mb: 2 }}
              >
                <Typography variant="body2">
                  <strong>Free Tier Usage:</strong><br/>
                  Used: {Math.round(usage.used_minutes)} minutes<br/>
                  Remaining: {Math.round(usage.remaining_minutes)} minutes this month
                </Typography>
              </Alert>
            )}
            
            {usage && !usage.can_use && (
              <Button
                variant="contained"
                color="primary"
                onClick={openSubscriptionFlow}
                sx={{ mb: 2 }}
              >
                Upgrade to Premium - $3.99/month
              </Button>
            )}
          </Box>
        )}

        {/* Example usage recording buttons for testing */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button size="small" onClick={() => alert('Record 5min session')}>
            Record 5min session
          </Button>
          <Button size="small" onClick={() => alert('Record 30min session')}>
            Record 30min session
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SimpleAuth;