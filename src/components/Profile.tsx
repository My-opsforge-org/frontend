import React from 'react';
import { Box, Typography, IconButton, Avatar, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export interface ProfileProps {
  isDarkTheme: boolean;
  onBack?: () => void;
  userId?: number;
}

export default function Profile({ isDarkTheme, onBack, userId }: ProfileProps) {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '60vh',
        p: 2,
        bgcolor: isDarkTheme ? '#111827' : '#ffffff',
        color: isDarkTheme ? '#ffffff' : '#111827',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        {onBack && (
          <IconButton onClick={onBack} aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Profile
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: isDarkTheme ? '#1f2937' : '#f9fafb',
          border: isDarkTheme ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 64, height: 64 }}>U</Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {userId ? `User #${userId}` : 'You'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Basic profile placeholder
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}


