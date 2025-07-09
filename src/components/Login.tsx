import { Box, Button, Card, CardContent, Link, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeToggle } from '../App';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useThemeToggle();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem('access_token', 'mock_token');
      navigate('/');
    }, 800);
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