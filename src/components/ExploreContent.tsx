import { Box, Typography, Button, TextField, CircularProgress, List, ListItem, ListItemText, Paper, Divider, ListItemSecondaryAction, IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import DirectionsIcon from '@mui/icons-material/Directions';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../api';
import MuiBox from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';

export default function ExploreContent({ isDarkTheme }: { isDarkTheme: boolean }) {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [places, setPlaces] = useState<any[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState('');
  const [address, setAddress] = useState('');
  const [geocodeResult, setGeocodeResult] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          // Only auto-search if no address or manual search has been done
          if (!address && !geocodeResult && !places.length) {
            // Try to get the address from coordinates (reverse geocoding)
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
            // Auto-load places on first render
            setPlacesError('');
            setPlaces([]);
            setPlacesLoading(true);
            try {
              const token = localStorage.getItem('access_token');
              const response = await fetch(`${API_BASE_URL}/explore/places?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius=5000&type=tourist_attraction`, {
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
  }, []);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacesError('');
    setPlaces([]);
    setPlacesLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/explore/places?lat=` + manualLat + '&lng=' + manualLng, {
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
  };

  const handleGeocodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeocodeError('');
    setGeocodeResult(null);
    setGeocodeLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/explore/geocode?address=` + encodeURIComponent(address), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.latitude && data.longitude) {
        setGeocodeResult({ lat: data.latitude, lng: data.longitude, address: data.address });
      } else {
        setGeocodeError(data.error || 'Could not find coordinates for the address');
      }
    } catch (err) {
      setGeocodeError('Network error');
    } finally {
      setGeocodeLoading(false);
    }
  };

  const handleFindPlacesFromGeocode = async () => {
    if (!geocodeResult) return;
    setPlacesError('');
    setPlaces([]);
    setPlacesLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/explore/places?lat=` + geocodeResult.lat + '&lng=' + geocodeResult.lng, {
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
  };

  // Helper to search places by lat/lng directly
  const handleFindPlacesFromCoords = async (lat: number, lng: number) => {
    setPlacesError('');
    setPlaces([]);
    setPlacesLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/explore/places?lat=` + lat + '&lng=' + lng, {
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
  };

  const handleGetPlaces = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacesError('');
    setPlaces([]);
    setPlacesLoading(true);
    let lat: number | null = null;
    let lng: number | null = null;
    let usedAddress = address.trim();
    try {
      if (usedAddress) {
        // Geocode the address first
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
          setPlacesError(geocodeData.error || 'Could not find coordinates for the address');
          setPlacesLoading(false);
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
        return;
      }
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/explore/places?lat=${lat}&lng=${lng}&radius=5000&type=tourist_attraction`, {
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
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="flex-start" alignItems="center" minHeight="100vh" width="100%" sx={{ bgcolor: isDarkTheme ? '#18191A' : '#F8F9FA' }}>
      {error && (
        <Typography mt={2} color="error.main">{error}</Typography>
      )}
      <Box component="form" onSubmit={handleGetPlaces} mt={4} display="flex" gap={2} alignItems="center" width="100%" maxWidth="700px">
        <TextField
          label="Address"
          value={address}
          onChange={e => setAddress(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 220 }}
        />
        <Button type="submit" variant="contained" color="primary" disabled={geocodeLoading || placesLoading} sx={{ ml: 2, minWidth: 120 }}>
          {geocodeLoading || placesLoading ? <CircularProgress size={20} /> : 'Get Places'}
        </Button>
      </Box>
      {geocodeError && (
        <Typography mt={2} color="error.main">{geocodeError}</Typography>
      )}
      {geocodeResult && (
        <Paper sx={{ mt: 3, width: '100%', maxWidth: 500, p: 2 }}>
          <Typography variant="subtitle1" mb={1}>Coordinates for: <b>{geocodeResult.address}</b></Typography>
          <Typography>Latitude: {geocodeResult.lat.toFixed(6)}</Typography>
          <Typography>Longitude: {geocodeResult.lng.toFixed(6)}</Typography>
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
                  src={place.photos && place.photos[0]?.photo_reference ?
                    `https://maps.googleapis.com/maps/api/place/photo?maxwidth=80&photoreference=${place.photos[0].photo_reference}&key=YOUR_GOOGLE_PLACES_API_KEY` // <-- Replace with your actual Google Places API key
                    : undefined}
                  alt={place.name}
                  sx={{ width: 48, height: 48, mr: 2, borderRadius: 2, bgcolor: '#eee', objectFit: 'cover' }}
                >
                  {(!place.photos || !place.photos[0]?.photo_reference)
                    ? <PlaceOutlinedIcon sx={{ color: '#888', fontSize: 28 }} />
                    : null}
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