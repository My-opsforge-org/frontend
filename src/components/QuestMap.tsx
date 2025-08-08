import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { Box, Typography, Paper, Chip, Button } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import DirectionsIcon from '@mui/icons-material/Directions';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

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

interface QuestMapProps {
  isDarkTheme: boolean;
  center: { lat: number; lng: number };
  spots: QuestSpot[];
  radius: number;
  onSpotVisit: (spot: QuestSpot) => void;
  currentLevel?: any;
}

const QuestMap: React.FC<QuestMapProps> = ({ 
  isDarkTheme, 
  center, 
  spots, 
  radius, 
  onSpotVisit,
  currentLevel 
}) => {
  const [selectedSpot, setSelectedSpot] = useState<QuestSpot | null>(null);

  // Check if Google Maps API is loaded
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsGoogleMapsLoaded(true);
      } else {
        setTimeout(checkGoogleMaps, 100);
      }
    };
    
    checkGoogleMaps();
  }, []);

  const mapContainerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '16px',
  };

  const mapOptions = {
    styles: isDarkTheme ? [
      { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b9a76' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }],
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f3d19c' }],
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }],
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#17263c' }],
      },
    ] : [],
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    mapTypeControl: false,
  };

  const onLoad = (map: google.maps.Map) => {
    // Map loaded successfully
  };

  const onUnmount = () => {
    // Map unmounted
  };

  const handleMarkerClick = (spot: QuestSpot) => {
    setSelectedSpot(spot);
  };

  const handleDirections = (spot: QuestSpot) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.geometry.location.lat},${spot.geometry.location.lng}`;
    window.open(url, '_blank', 'noopener');
  };

  const handleSpotVisit = (spot: QuestSpot) => {
    onSpotVisit(spot);
    setSelectedSpot(null);
  };

  // Show loading or error state
  if (!isGoogleMapsLoaded) {
    return (
      <Box 
        sx={{ 
          width: '100%', 
          height: '500px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: isDarkTheme ? '#1a1a2e' : '#f8fafc',
          borderRadius: '16px',
          border: '2px dashed',
          borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(99, 102, 241, 0.2)',
        }}
      >
        <Box textAlign="center">
          <Typography variant="h6" sx={{ color: isDarkTheme ? 'white' : 'black', mb: 2 }}>
            🗺️ Loading Map...
          </Typography>
          <Typography variant="body2" sx={{ color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)', mb: 2 }}>
            Please wait while Google Maps loads
          </Typography>
        </Box>
      </Box>
    );
  }



  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
          {/* Search radius circle */}
          <Circle
            center={center}
            radius={radius * 1000} // Convert km to meters
            options={{
              fillColor: isDarkTheme ? '#6366f1' : '#6366f1',
              fillOpacity: 0.1,
              strokeColor: isDarkTheme ? '#6366f1' : '#6366f1',
              strokeOpacity: 0.3,
              strokeWeight: 2,
            }}
          />

          {/* Quest spots markers */}
          {spots.map((spot, index) => (
            <Marker
              key={spot.place_id || index}
              position={spot.geometry.location}
              onClick={() => handleMarkerClick(spot)}
              icon={{
                url: spot.visited 
                  ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="18" fill="#10b981" stroke="white" stroke-width="2"/>
                      <path d="M16 20L18 22L24 16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  `)
                  : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="18" fill="#6366f1" stroke="white" stroke-width="2"/>
                      <path d="M20 8L24 20L20 32L16 20L20 8Z" fill="white"/>
                    </svg>
                  `),
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20),
              }}
            />
          ))}

          {/* Info Window */}
          {selectedSpot && (
            <InfoWindow
              position={selectedSpot.geometry.location}
              onCloseClick={() => setSelectedSpot(null)}
              options={{
                pixelOffset: new google.maps.Size(0, -40),
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  minWidth: 250,
                  background: isDarkTheme
                    ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 15, 35, 0.98) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: isDarkTheme
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(99, 102, 241, 0.1)',
                  borderRadius: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: isDarkTheme ? 'white' : 'black',
                      mb: 1,
                    }}
                  >
                    {selectedSpot.name}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
                      mb: 2,
                    }}
                  >
                    {selectedSpot.vicinity}
                  </Typography>

                  {selectedSpot.rating && (
                    <Box display="flex" alignItems="center" mb={2}>
                      <StarIcon sx={{ color: '#FFD700', fontSize: 20, mr: 1 }} />
                      <Typography
                        variant="body2"
                        sx={{
                          color: isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)',
                          fontWeight: 600,
                        }}
                      >
                        {selectedSpot.rating.toFixed(1)}
                      </Typography>
                    </Box>
                  )}

                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<DirectionsIcon />}
                      onClick={() => handleDirections(selectedSpot)}
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
                    
                    {!selectedSpot.visited && currentLevel && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<EmojiEventsIcon />}
                        onClick={() => handleSpotVisit(selectedSpot)}
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

                  {selectedSpot.visited && (
                    <Chip
                      icon={<EmojiEventsIcon />}
                      label="Visited"
                      size="small"
                      sx={{
                        mt: 1,
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>
              </Paper>
            </InfoWindow>
                     )}
         </GoogleMap>
     </Box>
   );
 };

export default QuestMap; 