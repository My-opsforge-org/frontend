import { Box, Typography, CircularProgress, List, ListItem, ListItemText, Paper, IconButton, Tooltip, Avatar, ListItemAvatar, Snackbar, Alert } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../api';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

interface User {
  id: number;
  name: string;
  email: string;
  bio?: string;
  age?: number;
  gender?: string;
  sun_sign?: string;
  is_following?: boolean;
  // Add other fields as needed
}

export default function PeopleContent({ isDarkTheme }: { isDarkTheme: boolean }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followLoading, setFollowLoading] = useState<{[userId: number]: boolean}>({});
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({open: false, message: '', severity: 'success'});
  const [currentUserId, setCurrentUserId] = useState<number|null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Not authenticated. Please log in.');
          setLoading(false);
          return;
        }
        // Get current user id from profile
        const profileRes = await fetch(`${API_BASE_URL}/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setCurrentUserId(profileData.id);
        }
        // Try to fetch all users by setting a very high per_page value
        const response = await fetch(`${API_BASE_URL}/users?per_page=10000`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users);
        } else {
          setError(data.error || 'Failed to fetch users');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleFollow = async (userId: number) => {
    setFollowLoading((prev) => ({ ...prev, [userId]: true }));
    setSnackbar({open: false, message: '', severity: 'success'});
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setSnackbar({open: true, message: 'Not authenticated. Please log in.', severity: 'error'});
        setFollowLoading((prev) => ({ ...prev, [userId]: false }));
        return;
      }
      const response = await fetch(`${API_BASE_URL}/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers((prev) => prev.map(u => u.id === userId ? { ...u, is_following: true } : u));
        setSnackbar({open: true, message: data.message || 'Followed successfully!', severity: 'success'});
      } else {
        setSnackbar({open: true, message: data.error || data.message || 'Failed to follow user', severity: 'error'});
      }
    } catch (err) {
      setSnackbar({open: true, message: 'Network error', severity: 'error'});
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnfollow = async (userId: number) => {
    setFollowLoading((prev) => ({ ...prev, [userId]: true }));
    setSnackbar({open: false, message: '', severity: 'success'});
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setSnackbar({open: true, message: 'Not authenticated. Please log in.', severity: 'error'});
        setFollowLoading((prev) => ({ ...prev, [userId]: false }));
        return;
      }
      const response = await fetch(`${API_BASE_URL}/users/${userId}/unfollow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers((prev) => prev.map(u => u.id === userId ? { ...u, is_following: false } : u));
        setSnackbar({open: true, message: data.message || 'Unfollowed successfully!', severity: 'success'});
      } else {
        setSnackbar({open: true, message: data.error || data.message || 'Failed to unfollow user', severity: 'error'});
      }
    } catch (err) {
      setSnackbar({open: true, message: 'Network error', severity: 'error'});
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" justifyContent="flex-start" width="100%" height="100%" minHeight="100vh" bgcolor={isDarkTheme ? '#222' : '#fafafa'}>
      <Typography variant="h5" color={isDarkTheme ? 'white' : 'black'} gutterBottom sx={{ p: 2 }}>
        People
      </Typography>
      {loading ? (
        <Box flex={1} display="flex" alignItems="center" justifyContent="center">
          <CircularProgress color={isDarkTheme ? 'inherit' : 'primary'} />
        </Box>
      ) : error ? (
        <Box flex={1} display="flex" alignItems="center" justifyContent="center">
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <Paper sx={{ width: '100%', height: '100%', flex: 1, display: 'flex', flexDirection: 'column', p: 0, m: 0, boxShadow: 'none', borderRadius: 0 }}>
          <List sx={{ width: '100%', flex: 1, overflow: 'auto', p: 0 }}>
            {users.length === 0 ? (
              <ListItem>
                <ListItemText primary="No people found." />
              </ListItem>
            ) : (
              users.map((user) => (
                <ListItem key={user.id} divider secondaryAction={
                  <Box display="flex" gap={1}>
                    <Tooltip title="Message">
                      <IconButton color="primary" size="small">
                        <ChatBubbleOutlineIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={currentUserId === user.id ? 'You cannot follow yourself' : user.is_following ? 'Unfollow' : 'Follow'}>
                      <span>
                        <IconButton
                          color={user.is_following ? 'error' : 'secondary'}
                          size="small"
                          disabled={followLoading[user.id] || currentUserId === user.id}
                          onClick={() => user.is_following ? handleUnfollow(user.id) : handleFollow(user.id)}
                        >
                          {followLoading[user.id] ? <CircularProgress size={20} /> : user.is_following ? <PersonRemoveIcon /> : <PersonAddIcon />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                }>
                  <ListItemAvatar>
                    <Avatar>
                      {user.name && user.name.length > 0
                        ? user.name.charAt(0).toUpperCase()
                        : <ChatBubbleOutlineIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={user.email + (user.bio ? ` — ${user.bio}` : '')}
                  />
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({...prev, open: false}))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 