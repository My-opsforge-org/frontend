import React, { useState } from 'react';
import FirebaseAuthService from '../services/firebaseAuthService';
import { API_BASE_URL } from '../api';
import { Box, Button, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';

interface FirebaseLoginProps {
  onLoginSuccess: (token: string, user: any) => void;
  onLoginError: (error: string) => void;
}

const FirebaseLogin: React.FC<FirebaseLoginProps> = ({ onLoginSuccess, onLoginError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleFirebaseAuth = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setLoadingProvider(provider);

    try {
      let authResult;
      
      if (provider === 'google') {
        authResult = await FirebaseAuthService.signInWithGoogle();
      } else {
        authResult = await FirebaseAuthService.signInWithApple();
      }

      if (!authResult.success || !authResult.idToken) {
        throw new Error(authResult.error || 'Authentication failed');
      }

      // Send Firebase ID token to backend
      const response = await fetch(`${API_BASE_URL}/firebase-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: authResult.idToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Backend authentication failed');
      }

      const data = await response.json();
      
      // Call success callback with JWT token and user data
      onLoginSuccess(data.access_token, data.user);
      
    } catch (error: any) {
      console.error(`${provider} authentication error:`, error);
      onLoginError(error.message || `${provider} authentication failed`);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Google Login Button */}
        <Button
          variant="outlined"
          fullWidth
          onClick={() => handleFirebaseAuth('google')}
          disabled={isLoading}
          startIcon={
            loadingProvider === 'google' ? (
              <CircularProgress size={20} sx={{ color: '#4285f4' }} />
            ) : (
              <GoogleIcon sx={{ fontSize: 24, color: '#4285f4' }} />
            )
          }
          sx={{
            height: 56,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            border: '2px solid',
            borderColor: '#2d3748',
            background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
            color: '#e2e8f0',
            borderRadius: 3,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: '#4285f4',
              background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
              boxShadow: '0 8px 25px rgba(66, 133, 244, 0.3)',
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&:disabled': {
              opacity: 0.6,
              background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
              borderColor: '#4a5568',
            }
          }}
        >
          {loadingProvider === 'google' ? 'Signing in...' : 'Continue with Google'}
        </Button>

        {/* Apple Login Button */}
        <Button
          variant="outlined"
          fullWidth
          onClick={() => handleFirebaseAuth('apple')}
          disabled={isLoading}
          startIcon={
            loadingProvider === 'apple' ? (
              <CircularProgress size={20} sx={{ color: '#ffffff' }} />
            ) : (
              <AppleIcon sx={{ fontSize: 24, color: '#ffffff' }} />
            )
          }
          sx={{
            height: 56,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            border: '2px solid',
            borderColor: '#1a1a1a',
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
            color: '#ffffff',
            borderRadius: 3,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: '#333333',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&:disabled': {
              opacity: 0.6,
              background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
              borderColor: '#2d2d2d',
            }
          }}
        >
          {loadingProvider === 'apple' ? 'Signing in...' : 'Continue with Apple'}
        </Button>
      </Box>
    </Box>
  );
};

export default FirebaseLogin;
