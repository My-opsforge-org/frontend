import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';

interface HeaderMenuProps {
  isDarkTheme: boolean;
  toggleTheme: () => void;
  handleLogout: () => void;
}

export default function HeaderMenu({ isDarkTheme, toggleTheme, handleLogout }: HeaderMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
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
    </>
  );
} 