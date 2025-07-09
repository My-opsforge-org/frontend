import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { AppBar, Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography } from '@mui/material';
import React, { useState } from 'react';

export default function Header({ name, profileImage, isDarkTheme, showOptions, setShowOptions, toggleTheme, handleLogout, profileData, activeTab }: any) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);

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
        width: '100vw',
        left: 0,
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
        background: isDarkTheme
          ? 'linear-gradient(90deg, #23272f 0%, #2c313a 100%)'
          : 'linear-gradient(90deg, #fff 0%, #f5f7fa 100%)',
        borderRadius: '0 0 20px 20px',
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ minHeight: 72, px: 3 }}>
        <Tooltip title="View Profile">
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setProfileOpen(true)}>
            <Avatar src={profileImage} alt={name} sx={{ mr: 2, width: 48, height: 48, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
              {name}
            </Typography>
          </Box>
        </Tooltip>
        <IconButton color="inherit" onClick={handleMenuOpen}>
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
        <Dialog open={profileOpen} onClose={() => setProfileOpen(false)}>
          <DialogTitle>Profile</DialogTitle>
          <DialogContent>
            <Typography>Name: {name}</Typography>
            {/* Add more profile fields here */}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProfileOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
} 