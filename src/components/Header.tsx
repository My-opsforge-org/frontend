import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { AppBar, Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography, TextField, Switch, FormControlLabel, Chip, Divider } from '@mui/material';
import React, { useState } from 'react';
import { API_BASE_URL } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Header({ name, profileImage, isDarkTheme, showOptions, setShowOptions, toggleTheme, handleLogout, profileData, activeTab, onProfileUpdate }: any) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState(profileData || {});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    setEditProfile(profileData || {});
  }, [profileData]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="static"
      color="primary"
      sx={{
        mb: 2,
        width: '100%',
        left: 0,
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
        background: isDarkTheme
          ? 'linear-gradient(90deg, #23272f 0%, #2c313a 100%)'
          : 'linear-gradient(90deg, #fff 0%, #f5f7fa 100%)',
        borderRadius: '0 0 20px 20px',
        zIndex: 1200,
        // Remove any overflow or minWidth that could cause scroll
        overflowX: 'hidden',
      }}
    >
      <Toolbar sx={{ minHeight: 72, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tooltip title="View Profile">
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setProfileOpen(true)}>
            <Avatar src={profileImage} alt={name} sx={{ mr: 2, width: 48, height: 48, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
            <Typography variant="h5" component="div" sx={{ fontWeight: 700, letterSpacing: 1 }}>
              {name}
            </Typography>
          </Box>
        </Tooltip>
        <IconButton color="inherit" onClick={handleMenuOpen} sx={{ ml: 'auto' }}>
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => { toggleTheme(); handleMenuClose(); }}>
            {isDarkTheme ? <Brightness7Icon sx={{ mr: 1 }} /> : <Brightness4Icon sx={{ mr: 1 }} />}
            {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
          </MenuItem>
          <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}>
            <LogoutIcon sx={{ mr: 1 }} /> Logout
          </MenuItem>
        </Menu>
        <Dialog open={profileOpen} onClose={() => { setProfileOpen(false); setEditMode(false); }} maxWidth="xs" fullWidth>
          <DialogTitle>Profile</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
              <Box
                display="flex"
                alignItems="center"
                width="100%"
                justifyContent="center"
                mb={2}
                sx={{
                  bgcolor: isDarkTheme ? '#23272f' : '#f5f7fa',
                  borderRadius: 3,
                  p: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <Avatar
                  src={editProfile.avatarUrl || profileImage}
                  alt={editProfile.name || name}
                  sx={{ width: 72, height: 72, mr: 3, border: '2px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                />
                {!editMode && (
                  <Button
                    variant="contained"
                    size="medium"
                    startIcon={<AccountCircleIcon />}
                    onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                    sx={{
                      ml: 1,
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      '&:hover': { bgcolor: 'primary.dark' },
                      transition: 'all 0.2s',
                    }}
                  >
                    Go to Profile
                  </Button>
                )}
              </Box>
              <Divider sx={{ width: '100%', mb: 2 }} />
              {saveError && <Typography color="error" sx={{ mt: 1 }}>{saveError}</Typography>}
              {saveSuccess && <Typography color="success.main" sx={{ mt: 1 }}>Profile updated!</Typography>}
              {!editMode ? (
                <>
                  <Typography variant="h6">{editProfile.name || name}</Typography>
                  <Typography color="text.secondary">{editProfile.email}</Typography>
                  {editProfile.bio && <Typography mt={1}>{editProfile.bio}</Typography>}
                  {editProfile.age && <Typography>Age: {editProfile.age}</Typography>}
                  {editProfile.gender && <Typography>Gender: {editProfile.gender}</Typography>}
                  {editProfile.sun_sign && <Typography>Sun Sign: {editProfile.sun_sign}</Typography>}
                  {Array.isArray(editProfile.interests) && editProfile.interests.length > 0 && (
                    <Box mt={1}>
                      {editProfile.interests.map((interest: string, idx: number) => (
                        <Chip key={idx} label={interest} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </Box>
                  )}
                </>
              ) : (
                <Box component="form" sx={{ width: '100%' }}>
                  <TextField label="Name" value={editProfile.name || ''} onChange={e => setEditProfile({ ...editProfile, name: e.target.value })} fullWidth margin="dense" />
                  <TextField label="Email" value={editProfile.email || ''} onChange={e => setEditProfile({ ...editProfile, email: e.target.value })} fullWidth margin="dense" />
                  <TextField label="Bio" value={editProfile.bio || ''} onChange={e => setEditProfile({ ...editProfile, bio: e.target.value })} fullWidth margin="dense" multiline minRows={2} />
                  <TextField label="Age" type="number" value={editProfile.age || ''} onChange={e => setEditProfile({ ...editProfile, age: e.target.value })} fullWidth margin="dense" />
                  <TextField label="Gender" value={editProfile.gender || ''} onChange={e => setEditProfile({ ...editProfile, gender: e.target.value })} fullWidth margin="dense" />
                  <TextField label="Sun Sign" value={editProfile.sun_sign || ''} onChange={e => setEditProfile({ ...editProfile, sun_sign: e.target.value })} fullWidth margin="dense" />
                  <TextField label="Interests (comma separated)" value={Array.isArray(editProfile.interests) ? editProfile.interests.join(', ') : ''} onChange={e => setEditProfile({ ...editProfile, interests: e.target.value.split(',').map((i: string) => i.trim()).filter(Boolean) })} fullWidth margin="dense" />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            {!editMode ? (
              <Button onClick={() => setEditMode(true)}>Edit</Button>
            ) : (
              <Button variant="contained" color="primary" onClick={async () => {
                setSaveLoading(true);
                setSaveError('');
                setSaveSuccess(false);
                try {
                  const token = localStorage.getItem('access_token');
                  const response = await fetch(`${API_BASE_URL}/profile`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(editProfile)
                  });
                  const data = await response.json();
                  if (response.ok) {
                    setSaveSuccess(true);
                    setEditMode(false);
                    if (onProfileUpdate) onProfileUpdate(data.user || editProfile);
                  } else {
                    setSaveError(data.error || 'Failed to update profile');
                  }
                } catch (err) {
                  setSaveError('Network error');
                } finally {
                  setSaveLoading(false);
                }
              }} disabled={saveLoading}>
                {saveLoading ? 'Saving...' : 'Save'}
              </Button>
            )}
            <Button onClick={() => { setProfileOpen(false); setEditMode(false); }}>Close</Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
} 