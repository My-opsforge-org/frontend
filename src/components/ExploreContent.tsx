import { Box, Typography, Button, TextField, CircularProgress, List, ListItem, ListItemText, Paper, Divider, ListItemSecondaryAction, IconButton, Select, MenuItem, InputLabel, FormControl, useTheme, useMediaQuery } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import DirectionsIcon from '@mui/icons-material/Directions';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../api';
import MuiBox from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';

export default function ExploreContent({ isDarkTheme }: { isDarkTheme: boolean }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState('');
  const [places, setPlaces] = useState<any[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState('');
  const [address, setAddress] = useState('');
  const [geocodeResult, setGeocodeResult] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');

  const [radius, setRadius] = useState(1500); // meters
  const [type, setType] = useState('tourist_attraction');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          if (!address && !geocodeResult && !places.length) {
            try {
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
              const data = await response.json();
              if (data && data.display_name) {
                setAddress(data.display_name);
              } else {
                setAddress(`${pos.coords.latitude},${pos.coords.longitude}`);
              }
            } catch {
              setAddress(`${pos.coords.latitude},${pos.coords.longitude}`);
            }
            setGeocodeResult({ lat: pos.coords.latitude, lng: pos.coords.longitude, address: `${pos.coords.latitude},${pos.coords.longitude}` });
            setPlacesError('');
            setPlaces([]);
            setPlacesLoading(true);
            try {
              const token = localStorage.getItem('access_token');
              const response = await fetch(`${API_BASE_URL}/explore/places?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius=${radius}&type=${type}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const data = await response.json();
              if (response.ok && data.results) {
                setPlaces(data.results);
              } else {
                setPlacesError(data.error || 'Could not fetch places');
              }
            } catch (err) {
              setPlacesError('Network error');
            } finally {
              setPlacesLoading(false);
            }
          }
        },
        (err) => setError('Location access denied or unavailable')
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius, type]);

  const handleGetPlaces = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacesError('');
    setGeocodeError('');
    setPlaces([]);
    setPlacesLoading(true);
    setGeocodeLoading(true);
    let lat: number | null = null;
    let lng: number | null = null;
    let usedAddress = address.trim();
    try {
      if (usedAddress) {
        const token = localStorage.getItem('access_token');
        const geocodeResponse = await fetch(`${API_BASE_URL}/explore/geocode?address=` + encodeURIComponent(usedAddress), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const geocodeData = await geocodeResponse.json();
        if (geocodeResponse.ok && typeof geocodeData.latitude === 'number' && typeof geocodeData.longitude === 'number') {
          lat = geocodeData.latitude;
          lng = geocodeData.longitude;
          setGeocodeResult({ lat: lat as number, lng: lng as number, address: geocodeData.address });
        } else {
          setGeocodeError(geocodeData.error || 'Could not find coordinates for the address');
          setPlacesLoading(false);
          setGeocodeLoading(false);
          return;
        }
      } else if (location) {
        lat = location.lat;
        lng = location.lng;
      } else if (geocodeResult) {
        lat = geocodeResult.lat;
        lng = geocodeResult.lng;
      }
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        setPlacesError('No location available');
        setPlacesLoading(false);
        setGeocodeLoading(false);
        return;
      }
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/explore/places?lat=${lat}&lng=${lng}&radius=${radius}&type=${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.results) {
        setPlaces(data.results);
      } else {
        setPlacesError(data.error || 'Could not fetch places');
      }
    } catch (err) {
      setPlacesError('Network error');
    } finally {
      setPlacesLoading(false);
      setGeocodeLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="flex-start" alignItems="center" minHeight="100vh" width="100%" sx={{ bgcolor: isDarkTheme ? '#18191A' : '#F8F9FA' }}>
      {error && (
        <Typography mt={2} color="error.main">{error}</Typography>
      )}
      <Box component="form" onSubmit={handleGetPlaces} mt={4} display="flex" gap={2} alignItems="center" width="100%" maxWidth="900px">
        <TextField
          label="Address"
          value={address}
          onChange={e => setAddress(e.target.value)}
          size="small"
          sx={{ flex: 3, minWidth: 180 }}
        />
        <FormControl size="small" sx={{ flex: 2, minWidth: 120 }}>
          <InputLabel id="type-label">Type</InputLabel>
          <Select
            labelId="type-label"
            value={type}
            label="Type"
            onChange={e => setType(e.target.value)}
          >
            <MenuItem value="tourist_attraction">Tourist Attraction</MenuItem>
            <MenuItem value="restaurant">Restaurant</MenuItem>
            <MenuItem value="park">Park</MenuItem>
            <MenuItem value="museum">Museum</MenuItem>
            <MenuItem value="cafe">Cafe</MenuItem>
            <MenuItem value="shopping_mall">Shopping Mall</MenuItem>
            <MenuItem value="night_club">Night Club</MenuItem>
            <MenuItem value="art_gallery">Art Gallery</MenuItem>
            <MenuItem value="zoo">Zoo</MenuItem>
            <MenuItem value="amusement_park">Amusement Park</MenuItem>
            <MenuItem value="lodging">Lodging</MenuItem>
            <MenuItem value="bar">Bar</MenuItem>
            <MenuItem value="church">Church</MenuItem>
            <MenuItem value="hindu_temple">Hindu Temple</MenuItem>
            <MenuItem value="mosque">Mosque</MenuItem>
            <MenuItem value="synagogue">Synagogue</MenuItem>
            <MenuItem value="movie_theater">Movie Theater</MenuItem>
            <MenuItem value="aquarium">Aquarium</MenuItem>
            <MenuItem value="library">Library</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Radius (meters)"
          type="number"
          value={radius}
          onChange={e => setRadius(Number(e.target.value))}
          size="small"
          sx={{ flex: 1, minWidth: 100 }}
          inputProps={{ min: 100, max: 50000, step: 100 }}
        />
        {isSmallScreen ? (
          <IconButton 
            type="submit" 
            color="primary" 
            disabled={geocodeLoading || placesLoading}
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark'
              },
              '&:disabled': {
                bgcolor: 'action.disabledBackground'
              }
            }}
          >
            {geocodeLoading || placesLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          </IconButton>
        ) : (
          <Button type="submit" variant="contained" color="primary" disabled={geocodeLoading || placesLoading} sx={{ flex: 1, minWidth: 120 }}>
            {geocodeLoading || placesLoading ? <CircularProgress size={20} /> : 'Get Places'}
          </Button>
        )}
      </Box>
      {geocodeError && (
        <Typography mt={2} color="error.main">{geocodeError}</Typography>
      )}
      {geocodeResult && (
        <Paper sx={{ mt: 3, width: '100%', maxWidth: 900, p: 3, bgcolor: isDarkTheme ? '#23272f' : '#f5f5f5', boxShadow: 1, borderRadius: 2 }}>
          <Typography variant="h6" mb={1} sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
            {geocodeResult.address}
          </Typography>
          <Box display="flex" gap={4} flexWrap="wrap">
            <Typography>Latitude: {geocodeResult.lat.toFixed(6)}</Typography>
            <Typography>Longitude: {geocodeResult.lng.toFixed(6)}</Typography>
            <Typography>Radius: {radius} meters</Typography>
            <Typography>Type: {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Typography>
          </Box>
          <Divider sx={{ my: 2, borderColor: isDarkTheme ? '#444' : '#bbb', borderBottomWidth: 2, borderRadius: 2 }} />
        </Paper>
      )}
      {placesError && (
        <Typography mt={2} color="error.main">{placesError}</Typography>
      )}
      {places.length > 0 && (
        <Paper sx={{ mt: 3, width: '100%', p: 2, pb: 10, boxShadow: 2, borderRadius: 3 }}>
          <List>
            {places.map((place, idx) => (
              <ListItem
                key={place.place_id || idx}
                divider
                component="a"
                href={
                  place.place_id
                    ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
                    : (place.geometry && place.geometry.location
                        ? `https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat},${place.geometry.location.lng}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.vicinity || place.formatted_address || place.name)}`)
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <Avatar
                  src="https://fastly.picsum.photos/id/88/1920/1080.jpg?hmac=sgVEfGP8uWZ5wpQxnpPWXZ88momJpr_EQuYcTGKrdTs"
                  alt={place.name}
                  sx={{ width: 48, height: 48, mr: 2, borderRadius: 2, bgcolor: '#eee', objectFit: 'cover' }}
                >
                  {place.name && place.name.length > 0
                    ? place.name.charAt(0).toUpperCase()
                    : <PlaceOutlinedIcon sx={{ color: '#888', fontSize: 28 }} />}
                </Avatar>
                <ListItemText
                  primary={place.name}
                  secondary={place.vicinity || place.formatted_address}
                />
                {typeof place.rating === 'number' && (
                  <ListItemSecondaryAction>
                    <MuiBox display="flex" alignItems="center" gap={1}>
                      <IconButton
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={e => {
                          e.stopPropagation();
                          e.preventDefault();
                          const url =
                            place.geometry && place.geometry.location
                              ? `https://www.google.com/maps/dir/?api=1&destination=${place.geometry.location.lat},${place.geometry.location.lng}`
                              : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.vicinity || place.formatted_address || place.name)}`;
                          window.open(url, '_blank', 'noopener');
                        }}
                        aria-label="Directions"
                      >
                        <DirectionsIcon sx={{ color: 'primary.main' }} />
                      </IconButton>
                      <StarIcon sx={{ color: '#FFD700', fontSize: 22 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 32, textAlign: 'right', fontWeight: 600 }}>
                        {place.rating.toFixed(1)}
                      </Typography>
                    </MuiBox>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
} 