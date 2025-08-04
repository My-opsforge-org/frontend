import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import { AppBar, Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography, TextField, Chip, Divider, Paper, InputAdornment } from '@mui/material';
import React, { useState } from 'react';
import { API_BASE_URL } from '../api';

export default function Header({ name, profileImage, isDarkTheme, showOptions, setShowOptions, toggleTheme, handleLogout, profileData, activeTab, setActiveTab, onProfileUpdate, searchQuery, setSearchQuery }: any) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState(profileData || {});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

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
        background: isDarkTheme
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
        borderRadius: '0 0 24px 24px',
        zIndex: 1200,
        overflowX: 'hidden',
        boxShadow: isDarkTheme
          ? '0 8px 32px rgba(0, 0, 0, 0.4)'
          : '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: isDarkTheme
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <Toolbar sx={{ 
        minHeight: 80, 
        px: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDarkTheme
            ? 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}>
        <Tooltip title="View Profile" arrow>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              p: 1,
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: isDarkTheme 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(99, 102, 241, 0.1)',
                transform: 'translateY(-2px)',
              }
            }} 
            onClick={() => setProfileOpen(true)}
          >
            <Avatar 
              src={profileImage} 
              alt={name} 
              sx={{ 
                mr: 2, 
                width: 56, 
                height: 56, 
                border: '3px solid',
                borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                boxShadow: isDarkTheme
                  ? '0 8px 24px rgba(0, 0, 0, 0.3)'
                  : '0 8px 24px rgba(99, 102, 241, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: isDarkTheme
                    ? '0 12px 32px rgba(0, 0, 0, 0.4)'
                    : '0 12px 32px rgba(99, 102, 241, 0.3)',
                }
              }} 
            />
            <Box>
              <Typography 
                variant="h5" 
                component="div" 
                sx={{ 
                  fontWeight: 700, 
                  letterSpacing: 0.5,
                  background: isDarkTheme
                    ? 'linear-gradient(135deg, #ffffff, #e2e8f0)'
                    : 'linear-gradient(135deg, #1f2937, #374151)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}
              >
                {name}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.7,
                  color: isDarkTheme ? '#9ca3af' : '#6b7280',
                  fontWeight: 500
                }}
              >
                Welcome back!
              </Typography>
            </Box>
          </Box>
        </Tooltip>
        
        {/* Search Field */}
        <TextField
          placeholder="Search..."
          value={searchQuery || ''}
          onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
          onClick={() => {
            // Navigate to appropriate tab based on current context
            if (activeTab !== 'connect' && activeTab !== 'community') {
              setActiveTab('connect');
              // Set a flag to indicate search was clicked
              localStorage.setItem('searchClicked', 'true');
            }
          }}
          size="small"
          sx={{
            ml: 'auto',
            mr: 2,
            width: 200,
            cursor: 'pointer',
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              background: isDarkTheme 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(99, 102, 241, 0.1)',
              border: 'none',
              '&:hover': {
                background: isDarkTheme 
                  ? 'rgba(255, 255, 255, 0.15)' 
                  : 'rgba(99, 102, 241, 0.15)',
              },
              '&.Mui-focused': {
                background: isDarkTheme 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(99, 102, 241, 0.2)',
                boxShadow: isDarkTheme
                  ? '0 0 0 2px rgba(255, 255, 255, 0.3)'
                  : '0 0 0 2px rgba(99, 102, 241, 0.3)',
              }
            },
            '& .MuiInputBase-input': {
              color: isDarkTheme ? 'white' : '#1f2937',
              '&::placeholder': {
                color: isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : 'rgba(31, 41, 55, 0.6)',
                opacity: 1
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ 
                  color: isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : 'rgba(99, 102, 241, 0.6)',
                  fontSize: 20
                }} />
              </InputAdornment>
            ),
          }}
        />
        
        <IconButton 
          color="inherit" 
          onClick={handleMenuOpen} 
          sx={{ 
            background: isDarkTheme 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(99, 102, 241, 0.1)',
            borderRadius: 2,
            p: 1.5,
            transition: 'all 0.3s ease',
            '&:hover': {
              background: isDarkTheme 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(99, 102, 241, 0.2)',
              transform: 'rotate(90deg)',
            }
          }}
        >
          <MoreVertIcon />
        </IconButton>
        
        <Menu 
          anchorEl={anchorEl} 
          open={Boolean(anchorEl)} 
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 3,
              mt: 1,
              background: isDarkTheme 
                ? 'rgba(26, 26, 46, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: isDarkTheme 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: isDarkTheme
                ? '0 20px 40px rgba(0, 0, 0, 0.4)'
                : '0 20px 40px rgba(0, 0, 0, 0.1)',
            }
          }}
        >
          <MenuItem 
            onClick={() => { toggleTheme(); handleMenuClose(); }}
            sx={{
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: isDarkTheme 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(99, 102, 241, 0.1)',
              }
            }}
          >
            {isDarkTheme ? <Brightness7Icon sx={{ mr: 1, color: '#fbbf24' }} /> : <Brightness4Icon sx={{ mr: 1, color: '#6366f1' }} />}
            {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
          </MenuItem>
          <MenuItem 
            onClick={() => { handleLogout(); handleMenuClose(); }}
            sx={{
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'rgba(239, 68, 68, 0.1)',
              }
            }}
          >
            <LogoutIcon sx={{ mr: 1, color: '#ef4444' }} /> Logout
          </MenuItem>
        </Menu>
        
        <Dialog 
          open={profileOpen} 
          onClose={() => { setProfileOpen(false); setEditMode(false); }} 
          maxWidth="xs" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: isDarkTheme 
                ? 'rgba(26, 26, 46, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: isDarkTheme 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: isDarkTheme
                ? '0 25px 50px rgba(0, 0, 0, 0.5)'
                : '0 25px 50px rgba(0, 0, 0, 0.1)',
            }
          }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            fontSize: '1.5rem'
          }}>
            Profile
          </DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  justifyContent: 'center',
                  mb: 2,
                  bgcolor: isDarkTheme ? 'rgba(26, 26, 46, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                  borderRadius: 3,
                  p: 3,
                  boxShadow: isDarkTheme
                    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                    : '0 8px 32px rgba(0, 0, 0, 0.08)',
                  border: isDarkTheme 
                    ? '1px solid rgba(255, 255, 255, 0.1)' 
                    : '1px solid rgba(255, 255, 255, 0.8)',
                }}
              >
                <Avatar
                  src={editProfile.avatarUrl || profileImage}
                  alt={editProfile.name || name}
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mr: 3, 
                    border: '3px solid',
                    borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                    boxShadow: isDarkTheme
                      ? '0 8px 24px rgba(0, 0, 0, 0.3)'
                      : '0 8px 24px rgba(99, 102, 241, 0.2)',
                  }}
                />
                {!editMode && (
                  <Button
                    variant="contained"
                    size="medium"
                    startIcon={<AccountCircleIcon />}
                    onClick={() => { setProfileOpen(false); setActiveTab('profile'); }}
                    sx={{
                      ml: 1,
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white',
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    Go to Profile
                  </Button>
                )}
              </Box>
              <Divider sx={{ width: '100%', mb: 2, opacity: 0.3 }} />
              {saveError && (
                <Paper 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    textAlign: 'center',
                    borderRadius: 2,
                    width: '100%'
                  }}
                >
                  <Typography variant="body2">{saveError}</Typography>
                </Paper>
              )}
              {saveSuccess && (
                <Paper 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    textAlign: 'center',
                    borderRadius: 2,
                    width: '100%'
                  }}
                >
                  <Typography variant="body2">Profile updated successfully!</Typography>
                </Paper>
              )}
              {!editMode ? (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {editProfile.name || name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {editProfile.email}
                  </Typography>
                  {editProfile.bio && (
                    <Typography mt={1} sx={{ textAlign: 'center', fontStyle: 'italic' }}>
                      "{editProfile.bio}"
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {editProfile.age && (
                      <Chip 
                        label={`Age: ${editProfile.age}`} 
                        size="small" 
                        sx={{ 
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          color: 'white',
                          fontWeight: 600
                        }} 
                      />
                    )}
                    {editProfile.gender && (
                      <Chip 
                        label={`Gender: ${editProfile.gender}`} 
                        size="small" 
                        sx={{ 
                          background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                          color: 'white',
                          fontWeight: 600
                        }} 
                      />
                    )}
                    {editProfile.sun_sign && (
                      <Chip 
                        label={`Sun Sign: ${editProfile.sun_sign}`} 
                        size="small" 
                        sx={{ 
                          background: 'linear-gradient(135deg, #10b981, #34d399)',
                          color: 'white',
                          fontWeight: 600
                        }} 
                      />
                    )}
                  </Box>
                  {Array.isArray(editProfile.interests) && editProfile.interests.length > 0 && (
                    <Box mt={2} sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Interests
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {editProfile.interests.map((interest: string, idx: number) => (
                          <Chip 
                            key={idx} 
                            label={interest} 
                            size="small" 
                            sx={{ 
                              background: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                              color: isDarkTheme ? '#e2e8f0' : '#6366f1',
                              fontWeight: 500,
                              border: isDarkTheme ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)',
                            }} 
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </>
              ) : (
                <Box component="form" sx={{ width: '100%' }}>
                  <TextField 
                    label="Name" 
                    value={editProfile.name || ''} 
                    onChange={e => setEditProfile({ ...editProfile, name: e.target.value })} 
                    fullWidth 
                    margin="dense" 
                    sx={{ mb: 2 }}
                  />
                  <TextField 
                    label="Email" 
                    value={editProfile.email || ''} 
                    onChange={e => setEditProfile({ ...editProfile, email: e.target.value })} 
                    fullWidth 
                    margin="dense" 
                    sx={{ mb: 2 }}
                  />
                  <TextField 
                    label="Bio" 
                    value={editProfile.bio || ''} 
                    onChange={e => setEditProfile({ ...editProfile, bio: e.target.value })} 
                    fullWidth 
                    margin="dense" 
                    multiline 
                    minRows={2} 
                    sx={{ mb: 2 }}
                  />
                  <TextField 
                    label="Age" 
                    type="number" 
                    value={editProfile.age || ''} 
                    onChange={e => setEditProfile({ ...editProfile, age: e.target.value })} 
                    fullWidth 
                    margin="dense" 
                    sx={{ mb: 2 }}
                  />
                  <TextField 
                    label="Gender" 
                    value={editProfile.gender || ''} 
                    onChange={e => setEditProfile({ ...editProfile, gender: e.target.value })} 
                    fullWidth 
                    margin="dense" 
                    sx={{ mb: 2 }}
                  />
                  <TextField 
                    label="Sun Sign" 
                    value={editProfile.sun_sign || ''} 
                    onChange={e => setEditProfile({ ...editProfile, sun_sign: e.target.value })} 
                    fullWidth 
                    margin="dense" 
                    sx={{ mb: 2 }}
                  />
                  <TextField 
                    label="Interests (comma separated)" 
                    value={Array.isArray(editProfile.interests) ? editProfile.interests.join(', ') : ''} 
                    onChange={e => setEditProfile({ ...editProfile, interests: e.target.value.split(',').map((i: string) => i.trim()).filter(Boolean) })} 
                    fullWidth 
                    margin="dense" 
                    sx={{ mb: 2 }}
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            {!editMode ? (
              <Button 
                onClick={() => setEditMode(true)}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Edit
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={async () => {
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
                }} 
                disabled={saveLoading}
                sx={{
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669, #10b981)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #9ca3af, #6b7280)',
                  }
                }}
              >
                {saveLoading ? 'Saving...' : 'Save'}
              </Button>
            )}
            <Button 
              onClick={() => { setProfileOpen(false); setEditMode(false); }}
              sx={{
                color: isDarkTheme ? '#9ca3af' : '#6b7280',
                fontWeight: 600,
                '&:hover': {
                  background: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
} 