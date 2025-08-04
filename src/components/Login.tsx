import { Box, Button, Card, CardContent, Link, TextField, Typography, IconButton, Paper, Divider } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeToggle } from '../App';
import { API_BASE_URL } from '../api';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useThemeToggle();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        background: isDark 
          ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark 
            ? 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}
    >
      {/* Floating elements for visual appeal */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
          opacity: 0.1,
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #f59e0b, #fbbf24)',
          opacity: 0.1,
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      <Card 
        sx={{
          maxWidth: 400,
          width: '100%',
          backdropFilter: 'blur(20px)',
          background: isDark 
            ? 'rgba(26, 26, 46, 0.8)'
            : 'rgba(255, 255, 255, 0.9)',
          border: isDark 
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: isDark
            ? '0 25px 50px rgba(0, 0, 0, 0.5)'
            : '0 25px 50px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(0)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: isDark
              ? '0 35px 70px rgba(0, 0, 0, 0.6)'
              : '0 35px 70px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Welcome Back
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ opacity: 0.8 }}
            >
              Sign in to continue your journey
            </Typography>
          </Box>

          {/* Theme Toggle */}
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <IconButton 
              onClick={toggleTheme}
              sx={{
                color: isDark ? '#fbbf24' : '#6366f1',
                '&:hover': {
                  transform: 'rotate(180deg)',
                  transition: 'transform 0.3s ease',
                }
              }}
            >
              {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <Box sx={{ mb: 3 }}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                required
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1',
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                required
                InputProps={{
                  startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'text.secondary' }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1',
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Box>

            {error && (
              <Paper 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  textAlign: 'center',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2">{error}</Typography>
              </Paper>
            )}

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              disabled={isLoading}
              sx={{ 
                mb: 3,
                height: 56,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                }
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3, opacity: 0.3 }}>
            <Typography variant="body2" color="text.secondary">or</Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Link 
              href="/register" 
              underline="none"
              sx={{
                color: '#6366f1',
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  color: '#4f46e5',
                  textDecoration: 'underline',
                }
              }}
            >
              Don't have an account? Create one
            </Link>
          </Box>
        </CardContent>
      </Card>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
        `}
      </style>
    </Box>
  );
} 