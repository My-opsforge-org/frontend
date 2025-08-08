import { Avatar, Box, Tooltip, Typography } from '@mui/material';
import React from 'react';

interface ProfileSectionProps {
  name: string;
  profileImage: string;
  isDarkTheme: boolean;
  onProfileClick: () => void;
}

export default function ProfileSection({ name, profileImage, isDarkTheme, onProfileClick }: ProfileSectionProps) {
  return (
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
        onClick={onProfileClick}
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
  );
} 