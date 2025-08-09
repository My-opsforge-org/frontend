import React, { useState } from 'react';
import FirebaseAuthService from '../services/firebaseAuthService';
import { API_BASE_URL } from '../api';

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
    <div className="firebase-login-container">
      <div className="auth-buttons">
        <button
          className={`auth-button google ${loadingProvider === 'google' ? 'loading' : ''}`}
          onClick={() => handleFirebaseAuth('google')}
          disabled={isLoading}
        >
          {loadingProvider === 'google' ? (
            <span className="loading-spinner">⏳</span>
          ) : (
            <span className="google-icon">🔍</span>
          )}
          Continue with Google
        </button>

        <button
          className={`auth-button apple ${loadingProvider === 'apple' ? 'loading' : ''}`}
          onClick={() => handleFirebaseAuth('apple')}
          disabled={isLoading}
        >
          {loadingProvider === 'apple' ? (
            <span className="loading-spinner">⏳</span>
          ) : (
            <span className="apple-icon">🍎</span>
          )}
          Continue with Apple
        </button>
      </div>

      <style>{`
        .firebase-login-container {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
        }

        .auth-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .auth-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 12px 24px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          background: white;
          color: #333;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 48px;
        }

        .auth-button:hover:not(:disabled) {
          border-color: #007bff;
          box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
        }

        .auth-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-button.google:hover:not(:disabled) {
          border-color: #4285f4;
          box-shadow: 0 2px 8px rgba(66, 133, 244, 0.2);
        }

        .auth-button.apple:hover:not(:disabled) {
          border-color: #000;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .google-icon, .apple-icon {
          font-size: 20px;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FirebaseLogin;
