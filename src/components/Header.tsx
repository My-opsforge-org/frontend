import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import ExploreIcon from '@mui/icons-material/Explore';
import StarIcon from '@mui/icons-material/Star';
import DiamondIcon from '@mui/icons-material/Diamond';
import { AppBar, Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography, TextField, Chip, Divider, Paper, InputAdornment, Slider, LinearProgress } from '@mui/material';
import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../api';
import { useUserProgress } from '../contexts/UserProgressContext';

export default function Header({ name, profileImage, isDarkTheme, showOptions, setShowOptions, toggleTheme, handleLogout, profileData, activeTab, setActiveTab, onProfileUpdate, searchQuery, setSearchQuery, onLocationChange, onRadiusChange }: any) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState(profileData || {});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [radiusValue, setRadiusValue] = useState(5);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const { userProgress, refreshUserProgress, loading: progressLoading } = useUserProgress();



  React.useEffect(() => {
    setEditProfile(profileData || {});
  }, [profileData]);

  // Refresh user progress when tab changes to home (after exploring)
  useEffect(() => {
    if (activeTab === 'home') {
      console.log('Refreshing user progress due to tab change to home');
      refreshUserProgress();
    }
  }, [activeTab, refreshUserProgress]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle search field click based on active tab
  const handleSearchClick = () => {
    if (activeTab === 'avatars') {
      // Already on avatars tab, just focus the search
      return;
    } else if (activeTab === 'home') {
      // On home tab, don't redirect - just focus the search
      return;
    } else if (activeTab !== 'connect' && activeTab !== 'community') {
      setActiveTab('avatars');
      // Set a flag to indicate search was clicked
      localStorage.setItem('searchClicked', 'true');
    }
  };

  return (
    <>
      <AppBar
        position="static"
        color="primary"
        sx={{
          mb: 2,
          width: '100%',
          left: 0,
          background: isDarkTheme
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 70%, #1a1a2e 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 30%, #e2e8f0 70%, #ffffff 100%)',
          borderRadius: '0 0 32px 32px',
          zIndex: 1200,
            overflow: 'hidden',
          boxShadow: isDarkTheme
            ? '0 12px 40px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(99, 102, 241, 0.3)'
            : '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(99, 102, 241, 0.2)',
          border: isDarkTheme
            ? '1px solid rgba(255, 255, 255, 0.15)'
            : '1px solid rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(25px)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDarkTheme
              ? 'linear-gradient(45deg, rgba(99, 102, 241, 0.1) 0%, transparent 50%, rgba(168, 85, 247, 0.1) 100%)'
              : 'linear-gradient(45deg, rgba(99, 102, 241, 0.05) 0%, transparent 50%, rgba(168, 85, 247, 0.05) 100%)',
            pointerEvents: 'none',
            opacity: 0.8,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDarkTheme
              ? 'radial-gradient(circle at 30% 60%, rgba(34, 197, 94, 0.1) 0%, transparent 40%)'
              : 'radial-gradient(circle at 70% 40%, rgba(34, 197, 94, 0.05) 0%, transparent 40%)',
            pointerEvents: 'none',
            animation: 'pulse 4s ease-in-out infinite',
          },
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.6 },
            '50%': { opacity: 1 },
          },
        }}
      >
        <Toolbar sx={{ 
          minHeight: 90, 
          px: 4, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
          overflow: 'hidden',
        }}>
          <Tooltip title="View Profile" arrow>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                p: { xs: 0.25, sm: 0.5, md: 1 },
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
                  mr: { xs: 0.5, sm: 1, md: 2 }, 
                  width: { xs: 32, sm: 40, md: 48, lg: 56 }, 
                  height: { xs: 32, sm: 40, md: 48, lg: 56 }, 
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
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
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
                    mb: 0.5,
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem', lg: '1.25rem' }
                  }}
                >
                  {name}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.7,
                    color: isDarkTheme ? '#9ca3af' : '#6b7280',
                    fontWeight: 500,
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' }
                  }}
                >
                  {userProgress ? (
                    userProgress.totalXP >= 500 ? "🌟 Legendary Wanderer" :
                    userProgress.totalXP >= 388 ? "🗺️ World Traveler" :
                    userProgress.totalXP >= 291 ? "🏔️ Adventure Seeker" :
                    userProgress.totalXP >= 194 ? "🌍 Discovery Pioneer" :
                    userProgress.totalXP >= 97 ? "🗺️ Pathfinder" :
                    "🚀 New Explorer"
                  ) : "Ready to explore!"}
                </Typography>
              </Box>
            </Box>
          </Tooltip>

          {/* User Progress Display - Only on wide screens and home tab */}
          {activeTab === 'home' && (
            <Tooltip title="Click to explore and discover more places!" arrow>
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: { md: 3, lg: 4, xl: 5 },
                  position: 'absolute',
                  left: { md: '45%', lg: '50%' },
                  transform: 'translateX(-50%)',
                  maxWidth: { md: 600, lg: 700, xl: 800 },
                  px: { md: 4, lg: 5, xl: 6 },
                  py: { md: 2.5, lg: 3, xl: 3.5 },
                  borderRadius: 4,
                  background: isDarkTheme
                    ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(26, 26, 46, 0.8) 50%, rgba(0, 0, 0, 0.6) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 50%, rgba(255, 255, 255, 0.9) 100%)',
                  border: '1px solid',
                  borderColor: isDarkTheme
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(99, 102, 241, 0.4)',
                  backdropFilter: 'blur(20px)',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isDarkTheme
                    ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 8px 32px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    background: isDarkTheme
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.3) 50%, rgba(99, 102, 241, 0.3) 100%)'
                      : 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(99, 102, 241, 0.15) 100%)',
                    transform: 'translateX(-50%) translateY(-4px) scale(1.02)',
                    boxShadow: isDarkTheme
                      ? '0 16px 48px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      : '0 16px 48px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                    borderColor: isDarkTheme
                      ? 'rgba(99, 102, 241, 0.6)'
                      : 'rgba(99, 102, 241, 0.6)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 4,
                    background: isDarkTheme
                      ? 'linear-gradient(45deg, rgba(99, 102, 241, 0.1) 0%, transparent 50%, rgba(168, 85, 247, 0.1) 100%)'
                      : 'linear-gradient(45deg, rgba(99, 102, 241, 0.05) 0%, transparent 50%, rgba(168, 85, 247, 0.05) 100%)',
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                    pointerEvents: 'none',
                  },
                  '&:hover::before': {
                    opacity: 1,
                  }
                }}
                onClick={() => setActiveTab('explore')}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }}>
                  <Box sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                    animation: 'rotate 3s linear infinite',
                    '@keyframes rotate': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}>
                    <StarIcon sx={{ 
                      color: '#ffffff',
                      fontSize: 18,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }} />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: isDarkTheme ? '#ffffff' : '#1f2937',
                      minWidth: 'fit-content',
                      textShadow: isDarkTheme ? '0 2px 4px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    Level {userProgress?.level || 1}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }}>
                  <Box sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.1)' },
                    },
                  }}>
                    <ExploreIcon sx={{ 
                      color: '#ffffff',
                      fontSize: 16,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }} />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: isDarkTheme ? '#9ca3af' : '#6b7280',
                      minWidth: 'fit-content',
                      textShadow: isDarkTheme ? '0 2px 4px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {userProgress?.placesDiscovered || 0} places
                  </Typography>
                </Box>

                {/* Total XP Display (matches explore section) */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }}>
                  <Box sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                    animation: 'glow 2.5s ease-in-out infinite alternate',
                    '@keyframes glow': {
                      '0%': { boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' },
                      '100%': { boxShadow: '0 4px 20px rgba(99, 102, 241, 0.6)' },
                    },
                  }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: '#ffffff',
                        fontSize: '10px',
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
                      }}
                    >
                      XP
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: isDarkTheme ? '#ffffff' : '#1f2937',
                      minWidth: 'fit-content',
                      textShadow: isDarkTheme ? '0 2px 4px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {userProgress?.totalXP || 0}
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          )}
          
          {/* Location Field for Explore Tab */}
          {activeTab === 'explore' ? (
            <>
              {/* Mobile Layout for Explore Tab */}
              <Box sx={{ 
                display: { xs: 'flex', sm: 'none' }, 
                flexDirection: 'column',
                width: '100%',
                gap: 1.5,
                px: 1,
                py: 1
              }}>
                {/* Mobile Location Input */}
                <TextField
                  placeholder="📍 Enter location..."
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    if (onLocationChange) onLocationChange(e.target.value);
                  }}
                  size="small"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: isDarkTheme 
                        ? 'rgba(255, 255, 255, 0.15)' 
                        : 'rgba(99, 102, 241, 0.15)',
                      border: isDarkTheme 
                        ? '1px solid rgba(255, 255, 255, 0.2)' 
                        : '1px solid rgba(99, 102, 241, 0.3)',
                      '&:hover': {
                        background: isDarkTheme 
                          ? 'rgba(255, 255, 255, 0.2)' 
                          : 'rgba(99, 102, 241, 0.2)',
                        borderColor: isDarkTheme 
                          ? 'rgba(255, 255, 255, 0.3)' 
                          : 'rgba(99, 102, 241, 0.4)',
                      },
                      '&.Mui-focused': {
                        background: isDarkTheme 
                          ? 'rgba(255, 255, 255, 0.25)' 
                          : 'rgba(99, 102, 241, 0.25)',
                        borderColor: isDarkTheme 
                          ? 'rgba(255, 255, 255, 0.4)' 
                          : 'rgba(99, 102, 241, 0.5)',
                        boxShadow: isDarkTheme
                          ? '0 0 0 3px rgba(255, 255, 255, 0.2)'
                          : '0 0 0 3px rgba(99, 102, 241, 0.3)',
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: isDarkTheme ? 'white' : '#1f2937',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      '&::placeholder': {
                        color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
                        opacity: 1
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ 
                          color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(99, 102, 241, 0.7)',
                          fontSize: 18
                        }} />
                      </InputAdornment>
                    ),
                  }}
                />
                
                {/* Mobile Radius Control */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: 1,
                  px: 0.5,
                  py: 0.5,
                  borderRadius: 2,
                  background: isDarkTheme 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid',
                  borderColor: isDarkTheme 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'rgba(99, 102, 241, 0.2)',
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: isDarkTheme ? 'rgba(255,255,255,0.9)' : 'rgba(31,41,55,0.9)',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    🎯 {radiusValue}km
                  </Typography>
                  <Slider
                    value={radiusValue}
                    onChange={(_, value) => {
                      setRadiusValue(value as number);
                      if (onRadiusChange) onRadiusChange(value as number);
                    }}
                    min={1}
                    max={10}
                    step={1}
                    size="small"
                    sx={{
                      width: 100,
                      color: '#6366f1',
                      '& .MuiSlider-thumb': {
                        width: 18,
                        height: 18,
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
                      },
                      '& .MuiSlider-track': {
                        height: 4,
                      },
                      '& .MuiSlider-rail': {
                        height: 4,
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Desktop Layout for Explore Tab */}
              <Box sx={{ 
                display: { xs: 'none', sm: 'flex' }, 
                alignItems: 'center', 
                flex: { xs: 0, sm: 1 }, 
                mx: { xs: 0.5, sm: 1, md: 1.5 }, 
                gap: { xs: 0.5, sm: 1, md: 1.5 },
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                maxWidth: { sm: 'calc(100% - 300px)', md: 'calc(100% - 350px)', lg: 'calc(100% - 400px)' },
                minWidth: { sm: 200, md: 250, lg: 300 }
              }}>
                <TextField
                  placeholder="Enter location..."
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    if (onLocationChange) onLocationChange(e.target.value);
                  }}
                  size="small"
                  sx={{
                    flex: 1,
                    cursor: 'pointer',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
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
                        <LocationOnIcon sx={{ 
                          color: isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : 'rgba(99, 102, 241, 0.6)',
                          fontSize: 20
                        }} />
                      </InputAdornment>
                    ),
                  }}
                />
              
                {/* Radius Slider */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: { xs: 0.5, sm: 1 },
                  minWidth: { xs: 140, sm: 180, md: 250 },
                  flexShrink: 1,
                  px: { xs: 1.5, sm: 2, md: 4 },
                  py: { xs: 0.5, sm: 1 },
                  borderRadius: 3,
                  background: isDarkTheme 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid',
                  borderColor: isDarkTheme 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : 'rgba(99, 102, 241, 0.2)',
                }}>
                  <MyLocationIcon sx={{ 
                    color: isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : 'rgba(99, 102, 241, 0.6)',
                    fontSize: { xs: 16, sm: 18 }
                  }} />
                  <Slider
                    value={radiusValue}
                    onChange={(_, value) => {
                      setRadiusValue(value as number);
                      if (onRadiusChange) onRadiusChange(value as number);
                    }}
                    min={1}
                    max={10}
                    step={1}
                    size="small"
                    sx={{
                      color: isDarkTheme ? '#6366f1' : '#6366f1',
                      '& .MuiSlider-track': {
                        background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                      },
                      '& .MuiSlider-thumb': {
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                        }
                      },
                      '& .MuiSlider-rail': {
                        background: isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                      }
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(99, 102, 241, 0.8)',
                      fontWeight: 600,
                      minWidth: { xs: 22, sm: 25 },
                      textAlign: 'center'
                    }}
                  >
                    {radiusValue}km
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            /* Search Field for other tabs */
            <TextField
              placeholder="Search..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              onClick={handleSearchClick}
              size="small"
              sx={{
                ml: 'auto',
                mr: { xs: 0.5, sm: 1, md: 1.5 },
                width: { xs: 100, sm: 120, md: 140, lg: 160, xl: 180 },
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
          )}
          
          {/* Pro Icon */}
          <Box 
            onClick={() => setSubscriptionModalOpen(true)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)',
              boxShadow: '0 6px 20px rgba(255, 215, 0, 0.5), 0 0 0 2px rgba(255, 215, 0, 0.3)',
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
              },
              mr: 1.5,
              flexShrink: 0,
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: '0 8px 25px rgba(255, 215, 0, 0.6), 0 0 0 3px rgba(255, 215, 0, 0.4)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #FFD700, #FFA500, #FF8C00, #FFD700)',
                zIndex: -1,
                opacity: 0.7,
                animation: 'rotate 3s linear infinite',
              },
              '@keyframes rotate': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              }
            }}
          >
            <DiamondIcon sx={{ 
              color: '#ffffff',
              fontSize: 18,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }} />
          </Box>
          
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              color: isDarkTheme ? 'white' : '#1f2937',
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

          {/* Options Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                borderRadius: 3,
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
                mt: 1,
                minWidth: 200
              }
            }}
          >
            <MenuItem 
              onClick={() => { 
                toggleTheme(); 
                handleMenuClose(); 
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 1.5,
                px: 2,
                color: isDarkTheme ? 'white' : '#1f2937',
                '&:hover': {
                  background: isDarkTheme 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(99, 102, 241, 0.1)',
                }
              }}
            >
              {isDarkTheme ? <Brightness7Icon /> : <Brightness4Icon />}
              {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
            </MenuItem>
            
            <Divider sx={{ 
              my: 0.5, 
              background: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.1)' 
            }} />
            
            <MenuItem 
              onClick={() => { 
                handleLogout(); 
                handleMenuClose(); 
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 1.5,
                px: 2,
                color: isDarkTheme ? '#ef4444' : '#dc2626',
                '&:hover': {
                  background: isDarkTheme 
                    ? 'rgba(239, 68, 68, 0.1)' 
                    : 'rgba(220, 38, 38, 0.1)',
                }
              }}
            >
              <LogoutIcon />
              Logout
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
                      label="Avatar URL" 
                      value={editProfile.avatarUrl || ''} 
                      onChange={e => setEditProfile({ ...editProfile, avatarUrl: e.target.value })} 
                      fullWidth 
                      margin="dense" 
                      placeholder="Enter image URL for your profile picture"
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
      
      {/* Subscription Modal */}
      <Dialog
        open={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        maxWidth="sm"
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
            maxHeight: '90vh',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{
          textAlign: 'center',
          py: 2,
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700,
          fontSize: '1.4rem'
        }}>
          ✨ Upgrade to Pro ✨
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2, pb: 1, px: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)',
              boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)',
              mx: 'auto',
              mb: 1.5
            }}>
              <DiamondIcon sx={{ 
                color: '#ffffff',
                fontSize: 35,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }} />
            </Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              color: isDarkTheme ? '#ffffff' : '#1f2937',
              mb: 0.5,
              fontSize: '1.1rem'
            }}>
              Unlock Premium Features
            </Typography>
            <Typography variant="body2" sx={{ 
              color: isDarkTheme ? '#9ca3af' : '#6b7280',
              opacity: 0.8,
              fontSize: '0.9rem'
            }}>
              Get access to exclusive features and enhance your experience
            </Typography>
          </Box>

          {/* Features List */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600,
              color: isDarkTheme ? '#ffffff' : '#1f2937',
              mb: 1.5,
              fontSize: '1rem'
            }}>
              🚀 What you'll get:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                '✨ Unlimited quests and adventures',
                '🌟 Premium avatar customization',
                '🗺️ Advanced map features',
                '📊 Detailed progress analytics',
                '🎯 Priority support',
                '💎 Exclusive rewards'
              ].map((feature, index) => (
                <Box key={index} sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  borderRadius: 2,
                  background: isDarkTheme 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid',
                  borderColor: isDarkTheme 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(99, 102, 241, 0.1)',
                }}>
                  <Box sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    flexShrink: 0
                  }} />
                  <Typography variant="body2" sx={{
                    color: isDarkTheme ? '#e5e7eb' : '#374151',
                    fontWeight: 500,
                    fontSize: '0.85rem'
                  }}>
                    {feature}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Pricing */}
          <Box sx={{
            textAlign: 'center',
            p: 1.5,
            borderRadius: 3,
            background: isDarkTheme 
              ? 'rgba(255, 215, 0, 0.1)' 
              : 'rgba(255, 215, 0, 0.1)',
            border: '1px solid',
            borderColor: isDarkTheme 
              ? 'rgba(255, 215, 0, 0.3)' 
              : 'rgba(255, 215, 0, 0.3)',
            mb: 2
          }}>
            <Typography variant="h5" sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5
            }}>
              $9.99/month
            </Typography>
            <Typography variant="body2" sx={{
              color: isDarkTheme ? '#9ca3af' : '#6b7280',
              opacity: 0.8,
              fontSize: '0.8rem'
            }}>
              Cancel anytime • 7-day free trial
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 2.5, 
          pt: 1,
          justifyContent: 'center',
          gap: 2
        }}>
          <Button
            onClick={() => setSubscriptionModalOpen(false)}
            variant="outlined"
            size="medium"
            sx={{
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(99, 102, 241, 0.3)',
              color: isDarkTheme ? '#ffffff' : '#6366f1',
              '&:hover': {
                borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(99, 102, 241, 0.5)',
                background: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.1)',
              }
            }}
          >
            Maybe Later
          </Button>
          <Button
            variant="contained"
            size="medium"
            sx={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              color: '#ffffff',
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #FFA500, #FF8C00)',
                boxShadow: '0 6px 20px rgba(255, 215, 0, 0.6)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            Start Free Trial
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 