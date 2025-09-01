import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

interface SubscriptionFlowProps {
  userEmail: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SubscriptionFlow: React.FC<SubscriptionFlowProps> = ({
  userEmail,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const premiumFeatures = [
    'Unlimited usage - no monthly limits',
    'Access to all binaural beat patterns',
    'Advanced ADHD treatment protocols', 
    '8D spatial audio effects',
    'Progress tracking and analytics',
    'Priority customer support'
  ];

  const createPaymentIntent = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscription/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.client_secret);
      
      // Here you would initialize Stripe Elements
      // For now, just simulate the flow
      alert('Stripe Elements would be initialized here with client secret');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment setup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!clientSecret) {
      await createPaymentIntent();
      return;
    }

    // Here you would confirm the payment with Stripe
    // For demo purposes, just simulate success
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      alert('Payment successful! (This is a demo - integrate Stripe Elements)');
      onSuccess();
    }, 2000);
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Upgrade to Premium
          </Typography>
          
          <Typography variant="h5" color="primary" gutterBottom>
            $3.99/month
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            Unlock unlimited access to all features
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Premium Features:
          </Typography>
          
          <List>
            {premiumFeatures.map((feature, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={feature}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
          >
            Maybe Later
          </Button>
          
          <Button
            variant="contained"
            onClick={handleSubscribe}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {clientSecret ? 'Complete Payment' : 'Subscribe Now'}
          </Button>
        </Box>

        <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'center' }}>
          Cancel anytime. Secure payments powered by Stripe.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SubscriptionFlow;