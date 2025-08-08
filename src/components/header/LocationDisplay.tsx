import SearchIcon from '@mui/icons-material/Search';
import { Box, TextField, InputAdornment } from '@mui/material';
import React from 'react';

interface LocationDisplayProps {
  activeTab: string;
  isDarkTheme: boolean;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onSearchClick: () => void;
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

export default function LocationDisplay({
  activeTab,
  isDarkTheme,
  searchQuery,
  setSearchQuery,
  onSearchClick,
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
}: LocationDisplayProps) {
  
  // Render search field for non-explore tabs
  const renderSearchField = () => (
    <TextField
      placeholder="Search..."
      value={searchQuery || ''}
      onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
      onClick={onSearchClick}
      size="small"
      sx={{
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
  );

  // Don't render anything for explore tab - let the explore content handle location
  if (activeTab === 'explore') {
    return null;
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {renderSearchField()}
    </Box>
  );
} 