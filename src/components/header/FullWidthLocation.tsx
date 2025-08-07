import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Typography, TextField, InputAdornment, IconButton, CircularProgress, Button } from '@mui/material';
import React, { useState } from 'react';

interface FullWidthLocationProps {
  isDarkTheme: boolean;
  userLocation: {lat: number, lng: number} | null;
  userAddress: string;
  locationLoading: boolean;
  locationError: string;
  showLocationInput: boolean;
  manualLocation: string;
  onManualLocationChange: (location: string) => void;
  onManualLocationSubmit: () => void;
  onGetUserLocation: () => void;
  onShowLocationInput: () => void;
  onCancelLocationInput: () => void;
}

export default function FullWidthLocation({
  isDarkTheme,
  userLocation,
  userAddress,
  locationLoading,
  locationError,
  showLocationInput,
  manualLocation,
  onManualLocationChange,
  onManualLocationSubmit,
  onGetUserLocation,
  onShowLocationInput,
  onCancelLocationInput
}: FullWidthLocationProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleLocationClick = () => {
    if (!showLocationInput) {
      onShowLocationInput();
    }
  };

  const handleSubmit = () => {
    onManualLocationSubmit();
    setIsEditing(false);
  };

  const handleCancel = () => {
    onCancelLocationInput();
    setIsEditing(false);
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 80, // Space for profile section
        right: 60, // Space for option icon
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1,
      }}
    >
      {showLocationInput ? (
        // Location input mode
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            placeholder="Enter location..."
            value={manualLocation}
            onChange={(e) => onManualLocationChange(e.target.value)}
            size="small"
            fullWidth
            sx={{
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
          <IconButton
            onClick={handleSubmit}
            sx={{
              background: isDarkTheme 
                ? 'rgba(34, 197, 94, 0.2)' 
                : 'rgba(34, 197, 94, 0.1)',
              borderRadius: 2,
              p: 1,
              '&:hover': {
                background: isDarkTheme 
                  ? 'rgba(34, 197, 94, 0.3)' 
                  : 'rgba(34, 197, 94, 0.2)',
              }
            }}
          >
            <Typography variant="caption" sx={{ color: '#22c55e' }}>
              ✓
            </Typography>
          </IconButton>
          <IconButton
            onClick={handleCancel}
            sx={{
              background: isDarkTheme 
                ? 'rgba(239, 68, 68, 0.2)' 
                : 'rgba(239, 68, 68, 0.1)',
              borderRadius: 2,
              p: 1,
              '&:hover': {
                background: isDarkTheme 
                  ? 'rgba(239, 68, 68, 0.3)' 
                  : 'rgba(239, 68, 68, 0.2)',
              }
            }}
          >
            <Typography variant="caption" sx={{ color: '#ef4444' }}>
              ✕
            </Typography>
          </IconButton>
        </Box>
      ) : (
        // Location display mode
        <Box
          onClick={handleLocationClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: '8px 16px',
            borderRadius: 3,
            background: isDarkTheme 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(99, 102, 241, 0.1)',
            border: '1px solid',
            borderColor: isDarkTheme 
              ? 'rgba(255, 255, 255, 0.2)' 
              : 'rgba(99, 102, 241, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: isDarkTheme 
                ? 'rgba(255, 255, 255, 0.15)' 
                : 'rgba(99, 102, 241, 0.15)',
              borderColor: isDarkTheme 
                ? 'rgba(255, 255, 255, 0.3)' 
                : 'rgba(99, 102, 241, 0.3)',
            }
          }}
        >
          <LocationOnIcon sx={{ 
            color: isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : 'rgba(99, 102, 241, 0.6)',
            fontSize: 20
          }} />
          <Typography
            variant="body2"
            sx={{
              color: isDarkTheme ? 'white' : '#1f2937',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {userAddress || 'Set your location'}
          </Typography>
          {locationLoading ? (
            <CircularProgress size={16} sx={{ color: isDarkTheme ? 'white' : '#6366f1' }} />
          ) : (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onGetUserLocation();
              }}
              sx={{
                p: 0.5,
                '&:hover': {
                  background: isDarkTheme 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(99, 102, 241, 0.1)',
                }
              }}
            >
              <MyLocationIcon sx={{ 
                color: isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : 'rgba(99, 102, 241, 0.6)',
                fontSize: 18
              }} />
            </IconButton>
          )}
        </Box>
      )}
      
      {locationError && (
        <Typography
          variant="caption"
          sx={{
            color: '#ef4444',
            mt: 0.5,
            display: 'block',
            textAlign: 'center'
          }}
        >
          {locationError}
        </Typography>
      )}
    </Box>
  );
} 