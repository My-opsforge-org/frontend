import { Box, Button, Card, CardContent, Link, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeToggle } from '../App';
import { API_BASE_URL } from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor={isDark ? '#1C1C1E' : '#F8F9FA'}>
      <Card sx={{ minWidth: 320 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>Login</Typography>
          <form onSubmit={handleLogin}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            {error && (
              <Typography color="error" align="center" sx={{ mt: 1 }}>{error}</Typography>
            )}
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={isLoading} sx={{ mt: 2 }}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <Box mt={2} textAlign="center">
            <Link href="/register" underline="hover">Don't have an account? Register</Link>
          </Box>
          <Box mt={2} textAlign="center">
            <Button onClick={toggleTheme} size="small">{isDark ? 'Light Mode' : 'Dark Mode'}</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
} 