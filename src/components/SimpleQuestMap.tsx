import React from 'react';
import { Box, Typography, Paper, Chip, Button } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import DirectionsIcon from '@mui/icons-material/Directions';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PlaceIcon from '@mui/icons-material/Place';

interface QuestSpot {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  visited?: boolean;
}

interface SimpleQuestMapProps {
  isDarkTheme: boolean;
  center: { lat: number; lng: number };
  spots: QuestSpot[];
  radius: number;
  onSpotVisit: (spot: QuestSpot) => void;
  currentLevel?: any;
}

const SimpleQuestMap: React.FC<SimpleQuestMapProps> = ({ 
  isDarkTheme, 
  center, 
  spots, 
  radius, 
  onSpotVisit,
  currentLevel 
}) => {
  const handleDirections = (spot: QuestSpot) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.geometry.location.lat},${spot.geometry.location.lng}`;
    window.open(url, '_blank', 'noopener');
  };

  const handleSpotVisit = (spot: QuestSpot) => {
    onSpotVisit(spot);
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* Simple Map Representation */}
      <Paper
        sx={{
          p: 3,
          background: isDarkTheme
            ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(15, 15, 35, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: isDarkTheme
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(99, 102, 241, 0.1)',
          borderRadius: 3,
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: isDarkTheme ? 'white' : 'black' }}>
          🗺️ Quest Spots ({spots.length} found)
        </Typography>
        <Typography variant="body2" sx={{ color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)', mb: 3 }}>
          Explore these locations within {radius}km radius
        </Typography>

        {/* Quest Spots List */}
        <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
          {spots.map((spot, index) => (
            <Paper
              key={spot.place_id || index}
              sx={{
                p: 2,
                mb: 2,
                background: isDarkTheme
                  ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(15, 15, 35, 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%)',
                backdropFilter: 'blur(10px)',
                border: isDarkTheme
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(99, 102, 241, 0.1)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: isDarkTheme
                    ? '0 8px 24px rgba(0, 0, 0, 0.3)'
                    : '0 8px 24px rgba(0, 0, 0, 0.1)',
                }
              }}
            >
              <Box display="flex" alignItems="center" mb={1}>
                <PlaceIcon 
                  sx={{ 
                    color: spot.visited ? '#10b981' : '#6366f1', 
                    mr: 1,
                    fontSize: 20
                  }} 
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: isDarkTheme ? 'white' : 'black',
                    flex: 1,
                  }}
                >
                  {spot.name}
                </Typography>
                {spot.visited && (
                  <Chip
                    icon={<EmojiEventsIcon />}
                    label="Visited"
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>
              
              <Typography
                variant="body2"
                sx={{
                  color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
                  mb: 2,
                }}
              >
                {spot.vicinity}
              </Typography>

              {spot.rating && (
                <Box display="flex" alignItems="center" mb={2}>
                  <StarIcon sx={{ color: '#FFD700', fontSize: 18, mr: 1 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)',
                      fontWeight: 600,
                    }}
                  >
                    {spot.rating.toFixed(1)}
                  </Typography>
                </Box>
              )}

              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DirectionsIcon />}
                  onClick={() => handleDirections(spot)}
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                    },
                  }}
                >
                  Directions
                </Button>
                
                {!spot.visited && currentLevel && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<EmojiEventsIcon />}
                    onClick={() => handleSpotVisit(spot)}
                    sx={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669, #047857)',
                      },
                    }}
                  >
                    Visit
                  </Button>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default SimpleQuestMap; 