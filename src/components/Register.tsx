import { Box, Button, Card, CardContent, Link, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeToggle } from '../App';
import { API_BASE_URL } from '../api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useThemeToggle();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.error || 'Registration failed');
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
          <Typography variant="h5" align="center" gutterBottom>Register</Typography>
          <form onSubmit={handleRegister}>
            <TextField
              label="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
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
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            {error && (
              <Typography color="error" align="center" sx={{ mt: 1 }}>{error}</Typography>
            )}
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={isLoading} sx={{ mt: 2 }}>
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </form>
          <Box mt={2} textAlign="center">
            <Link href="/login" underline="hover">Already have an account? Login</Link>
          </Box>
          <Box mt={2} textAlign="center">
            <Button onClick={toggleTheme} size="small">{isDark ? 'Light Mode' : 'Dark Mode'}</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
} 