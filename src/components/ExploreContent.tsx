import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Paper, 
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ExploreIcon from '@mui/icons-material/Explore';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../api';
import userProgressService, { UserProgress } from '../services/userProgressService';
import QuestMap from './QuestMap';

interface GameLevel {
  id: number;
  name: string;
  description: string;
  type: string;
  radius: number;
  requiredPlaces: number;
  xpReward: number;
  completed: boolean;
  currentProgress: number;
}

export default function ExploreContent({ isDarkTheme, questLocation, questRadius }: { 
  isDarkTheme: boolean;
  questLocation?: string;
  questRadius?: number;
}) {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState('');
  const [places, setPlaces] = useState<any[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState('');
  const [address, setAddress] = useState('');
  const [geocodeResult, setGeocodeResult] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const [currentLevel, setCurrentLevel] = useState<GameLevel | null>(null);
  const [gameProgress, setGameProgress] = useState<UserProgress>({
    id: 0,
    userId: 0,
    level: 1,
    totalXP: 0,
    placesDiscovered: 0,
    touristTrail: 0,
    foodExplorer: 0,
    culturalQuest: 0,
    natureWanderer: 0,
    entertainmentHunter: 0,
    lastPlayedAt: new Date().toISOString()
  });
  const [showLevelComplete, setShowLevelComplete] = useState(false);

  const [progressLoading, setProgressLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);
  const [visitedSpots, setVisitedSpots] = useState<Set<string>>(new Set());
  const [xpNotification, setXpNotification] = useState<{xp: number, message: string} | null>(null);



  // Helper function to get updated game levels
  const getUpdatedGameLevels = () => {
    return gameLevels.map(level => {
      let progress = 0;
      let completed = false;
      switch (level.id) {
        case 1:
          progress = gameProgress.touristTrail || 0;
          completed = progress >= level.requiredPlaces;
          break;
        case 2:
          progress = gameProgress.foodExplorer || 0;
          completed = progress >= level.requiredPlaces;
          break;
        case 3:
          progress = gameProgress.culturalQuest || 0;
          completed = progress >= level.requiredPlaces;
          break;
        case 4:
          progress = gameProgress.natureWanderer || 0;
          completed = progress >= level.requiredPlaces;
          break;
        case 5:
          progress = gameProgress.entertainmentHunter || 0;
          completed = progress >= level.requiredPlaces;
          break;
        default:
          break;
      }
      return {
        ...level,
        completed,
        currentProgress: progress
      };
    });
  };



  // Game levels configuration
  const gameLevels: GameLevel[] = [
    {
      id: 1,
      name: "Tourist Trail",
      description: "Discover 3 tourist attractions near you",
      type: "tourist_attraction",
      radius: 1000,
      requiredPlaces: 3,
      xpReward: 50,
      completed: false,
      currentProgress: 0
    },
    {
      id: 2,
      name: "Food Explorer",
      description: "Find 5 restaurants and cafes",
      type: "restaurant",
      radius: 1500,
      requiredPlaces: 5,
      xpReward: 75,
      completed: false,
      currentProgress: 0
    },
    {
      id: 3,
      name: "Cultural Quest",
      description: "Visit 2 museums and art galleries",
      type: "museum",
      radius: 2000,
      requiredPlaces: 2,
      xpReward: 100,
      completed: false,
      currentProgress: 0
    },
    {
      id: 4,
      name: "Nature Wanderer",
      description: "Explore 3 parks and natural areas",
      type: "park",
      radius: 2500,
      requiredPlaces: 3,
      xpReward: 125,
      completed: false,
      currentProgress: 0
    },
    {
      id: 5,
      name: "Entertainment Hunter",
      description: "Discover 4 entertainment venues",
      type: "amusement_park",
      radius: 3000,
      requiredPlaces: 4,
      xpReward: 150,
      completed: false,
      currentProgress: 0
    }
  ];

  // Load user progress from backend
  useEffect(() => {
    const loadUserProgress = async () => {
      try {
        setProgressLoading(true);
        const progress = await userProgressService.getUserProgress();
        setGameProgress(progress);
      } catch (error) {
        console.error('Error loading user progress:', error);
        // Continue with default progress
      } finally {
        setProgressLoading(false);
      }
    };

    loadUserProgress();
  }, []);

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
          }
        },
        (err) => setError('Location access denied or unavailable')
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  }, []);

  const handleLevelStart = async (level: GameLevel) => {
    
    
    // Check if we have location and radius from header
    if (!questLocation || !questRadius) {
      setPlacesError('Please set a location and radius in the header first');
      return;
    }
    
    // Use the handleStartQuestWithLocation function which is already set up for header location/radius
    await handleStartQuestWithLocation(level, questLocation, questRadius);
  };

  const handleStartQuestWithLocation = async (level: GameLevel, locationQuery: string, radius: number) => {

    
    // Get the current progress for this level from gameProgress
    let progress = 0;
    switch (level.id) {
      case 1:
        progress = gameProgress.touristTrail || 0;
        break;
      case 2:
        progress = gameProgress.foodExplorer || 0;
        break;
      case 3:
        progress = gameProgress.culturalQuest || 0;
        break;
      case 4:
        progress = gameProgress.natureWanderer || 0;
        break;
      case 5:
        progress = gameProgress.entertainmentHunter || 0;
        break;
      default:
        break;
    }
    const levelWithProgress = { ...level, currentProgress: progress };
    

    setCurrentLevel(levelWithProgress);
    
    setPlacesError('');
    setGeocodeError('');
    setPlaces([]);
    setPlacesLoading(true);
    setGeocodeLoading(true);
    setShowMap(false);
    
    try {
      // Geocode the location
      const token = localStorage.getItem('access_token');
      
      const geocodeResponse = await fetch(`${API_BASE_URL}/explore/geocode?address=` + encodeURIComponent(locationQuery), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const geocodeData = await geocodeResponse.json();

      
      if (geocodeResponse.ok && typeof geocodeData.latitude === 'number' && typeof geocodeData.longitude === 'number') {
        const lat = geocodeData.latitude;
        const lng = geocodeData.longitude;

        
        // Fetch places with the specified radius

        const response = await fetch(`${API_BASE_URL}/explore/places?lat=${lat}&lng=${lng}&radius=${radius * 1000}&type=${level.type}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        
        if (response.ok && data.results) {

          setPlaces(data.results);
          setMapCenter({ lat, lng });
          setShowMap(true);
          // Don't call checkLevelProgress here as it might interfere with manual progress updates
        } else {
          console.error('Places API error:', data);
          setPlacesError(data.error || 'Could not fetch places');
        }
      } else {
        console.error('Geocode API error:', geocodeData);
        setGeocodeError(geocodeData.error || 'Could not find coordinates for the location');
      }
    } catch (err) {
      console.error('Network error:', err);
      setPlacesError('Network error');
    } finally {
      setPlacesLoading(false);
      setGeocodeLoading(false);
    }
  };

  const checkLevelProgress = async (level: GameLevel, placesFound: number) => {
    const progress = Math.min(placesFound, level.requiredPlaces);
    const isCompleted = progress >= level.requiredPlaces;
    
    if (isCompleted && !level.completed) {
      // Level completed! Show completion notification
      setShowLevelComplete(true);
    }
  };

  const handlePlaceVisit = async (place: any) => {
    // Simulate visiting a place
    if (currentLevel) {
      // Check if quest is already completed
      if (currentLevel.currentProgress >= currentLevel.requiredPlaces) {
        // Quest is already completed, only increment places discovered
        setGameProgress(prev => ({
          ...prev,
          placesDiscovered: prev.placesDiscovered + 1
        }));
        
        // Update only places discovered in backend
        try {
          await userProgressService.updateUserProgress({
            placesDiscovered: gameProgress.placesDiscovered + 1
          });
        } catch (error) {
          console.error('Error updating places discovered:', error);
        }
        return;
      }
      
      const newProgress = currentLevel.currentProgress + 1;
      const visitXP = Math.floor(currentLevel.xpReward / currentLevel.requiredPlaces);
      
      // Update UI immediately for better user experience
      setCurrentLevel({ ...currentLevel, currentProgress: newProgress });
      setGameProgress(prev => {
        const updated: any = {
          ...prev,
          totalXP: prev.totalXP + visitXP,
          placesDiscovered: prev.placesDiscovered + 1
        };
        switch (currentLevel.id) {
          case 1:
            updated.touristTrail = newProgress;
            break;
          case 2:
            updated.foodExplorer = newProgress;
            break;
          case 3:
            updated.culturalQuest = newProgress;
            break;
          case 4:
            updated.natureWanderer = newProgress;
            break;
          case 5:
            updated.entertainmentHunter = newProgress;
            break;
          default:
            break;
        }
        return updated;
      });
      
      // Mark spot as visited
      setVisitedSpots(prev => new Set(Array.from(prev).concat([place.place_id])));
      
      // Show XP gain notification immediately
      setXpNotification({
        xp: visitXP,
        message: `Visited ${place.name}`
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => setXpNotification(null), 3000);
      
      // Update progress in backend (non-blocking)
      try {
        const update: any = {
          totalXP: gameProgress.totalXP + visitXP,
          placesDiscovered: gameProgress.placesDiscovered + 1
        };
        switch (currentLevel.id) {
          case 1:
            update.touristTrail = newProgress;
            break;
          case 2:
            update.foodExplorer = newProgress;
            break;
          case 3:
            update.culturalQuest = newProgress;
            break;
          case 4:
            update.natureWanderer = newProgress;
            break;
          case 5:
            update.entertainmentHunter = newProgress;
            break;
          default:
            break;
        }
        await userProgressService.updateUserProgress(update);
        
      } catch (error) {
        console.error('Error updating quest progress:', error);
      }
      
      if (newProgress >= currentLevel.requiredPlaces) {
        checkLevelProgress(currentLevel, newProgress);
      }
    }
  };

  const handleMapSpotVisit = (spot: any) => {
    
    handlePlaceVisit(spot);
  };



  if (progressLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      justifyContent="flex-start" 
      alignItems="center" 
      minHeight="100vh" 
      width="100%" 
      sx={{ 
        bgcolor: isDarkTheme ? '#222' : '#fafafa',
        background: isDarkTheme
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        position: 'relative',
        pb: '100px', // Add bottom padding to account for BottomNav
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDarkTheme
            ? 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}
    >
      {/* Game Header */}
      <Box
        sx={{
          width: '100%',
          p: 3,
          background: isDarkTheme
            ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 15, 35, 0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: isDarkTheme
            ? '1px solid rgba(255, 255, 255, 0.12)'
            : '1px solid rgba(99, 102, 241, 0.15)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800,
            textAlign: 'center',
            color: isDarkTheme ? 'rgba(255, 255, 255, 0.98)' : 'rgba(31, 41, 55, 0.98)',
            mb: 2,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          🗺️ Explore Quest
        </Typography>
        
        {/* Progress Stats */}
        <Box display="flex" justifyContent="center" gap={4} mb={3}>
          <Box textAlign="center">
            <Typography variant="h6" sx={{ color: '#6366f1', fontWeight: 700 }}>
              Level {gameProgress.level}
            </Typography>
            <Typography variant="body2" sx={{ color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)' }}>
              Current Level
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#fbbf24', 
                fontWeight: 700,
                transition: 'all 0.3s ease',
                transform: xpNotification ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              {gameProgress.totalXP} XP
            </Typography>
            <Typography variant="body2" sx={{ color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)' }}>
              Total Experience
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 700 }}>
              {gameProgress.placesDiscovered}
            </Typography>
            <Typography variant="body2" sx={{ color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)' }}>
              Places Discovered
            </Typography>
          </Box>
        </Box>


      </Box>

      {/* XP Notification */}
      {xpNotification && (
        <Box
          sx={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            animation: 'slideIn 0.5s ease-out',
            '@keyframes slideIn': {
              '0%': {
                transform: 'translateX(100%)',
                opacity: 0,
              },
              '100%': {
                transform: 'translateX(0)',
                opacity: 1,
              },
            },
          }}
        >
          <Paper
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: 'white',
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(251, 191, 36, 0.3)',
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                +{xpNotification.xp} XP
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {xpNotification.message}
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}

        {/* Game Levels */}
        <Box sx={{ p: 3, width: '100%', maxWidth: 1200 }}>
          {!questLocation || !questRadius ? (
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  color: isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)',
                }}
              >
                📍 Set a location and radius in the header to start questing!
              </Typography>
            </Box>
          ) : null}
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              mb: 3, 
              textAlign: 'center',
              color: isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(31, 41, 55, 0.9)',
            }}
          >
            Choose Your Quest
          </Typography>
        
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 3, 
            justifyContent: 'center',
            maxWidth: 1200,
            mx: 'auto'
          }}
        >
          {getUpdatedGameLevels().map((level) => (
            <Box 
              key={level.id}
              sx={{ 
                width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' },
                minWidth: { sm: 300, md: 280 }
              }}
            >
              <Zoom in={true} style={{ transitionDelay: `${level.id * 100}ms` }}>
                <Card
                  sx={{
                    background: isDarkTheme
                      ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(15, 15, 35, 0.95) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: isDarkTheme
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(99, 102, 241, 0.1)',
                    borderRadius: 3,
                    boxShadow: isDarkTheme
                      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                      : '0 8px 32px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: isDarkTheme
                        ? '0 16px 48px rgba(0, 0, 0, 0.4)'
                        : '0 16px 48px rgba(0, 0, 0, 0.15)',
                    }
                  }}
                  onClick={() => handleLevelStart(level)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar
                        sx={{
                          bgcolor: level.completed ? '#10b981' : '#6366f1',
                          width: 48,
                          height: 48,
                          mr: 2,
                        }}
                      >
                        {level.completed ? <EmojiEventsIcon /> : <ExploreIcon />}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: isDarkTheme ? 'white' : 'black' }}>
                          {level.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)' }}>
                          {level.description}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" sx={{ color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)' }}>
                          Progress
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6366f1', fontWeight: 600 }}>
                          {level.currentProgress}/{level.requiredPlaces}
                        </Typography>
                      </Box>
                      <LinearProgress
                        key={`progress-${level.id}-${level.currentProgress}`}
                        variant="determinate"
                        value={(level.currentProgress / level.requiredPlaces) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            borderRadius: 4,
                          }
                        }}
                      />
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip
                        label={`${level.xpReward} XP`}
          size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                      <Button
                        variant="contained"
          size="small"
                        disabled={level.completed || (!questLocation || !questRadius)}
            sx={{ 
                          background: level.completed 
                            ? 'linear-gradient(135deg, #10b981, #059669)' 
                            : (!questLocation || !questRadius)
                            ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
                          fontWeight: 600,
              '&:hover': {
                            background: level.completed 
                              ? 'linear-gradient(135deg, #059669, #047857)' 
                              : (!questLocation || !questRadius)
                              ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                              : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                          }
                        }}
                      >
                        {level.completed ? 'Completed' : questLocation && questRadius ? 'Start Quest' : 'Set Location First'}
          </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Current Level Progress */}
      {currentLevel && (
        <Box sx={{ p: 3, width: '100%', maxWidth: 1200 }}>
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
              🎯 Current Quest: {currentLevel.name}
            </Typography>
            <Typography variant="body2" sx={{ color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)', mb: 2 }}>
              {currentLevel.description}
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body2" sx={{ color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)' }}>
                Progress: {currentLevel.currentProgress}/{currentLevel.requiredPlaces} places
          </Typography>
              <Chip
                label={`${currentLevel.xpReward} XP Reward`}
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
          </Box>
            <LinearProgress
              key={`progress-${currentLevel.id}-${currentLevel.currentProgress}`}
              variant="determinate"
              value={(currentLevel.currentProgress / currentLevel.requiredPlaces) * 100}
              sx={{
                height: 12,
                borderRadius: 6,
                bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  borderRadius: 6,
                  transition: 'transform 0.5s ease-in-out',
                }
              }}
            />

        </Paper>

          {/* Map View */}
          {showMap && mapCenter && places.length > 0 && (
            <Paper
              sx={{
                p: 3,
                mb: 3,
                background: isDarkTheme
                  ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(15, 15, 35, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)',
                backdropFilter: 'blur(20px)',
                border: isDarkTheme
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(99, 102, 241, 0.1)',
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: isDarkTheme ? 'white' : 'black' }}>
                🗺️ Quest Map - {questLocation || 'Current Location'}
              </Typography>
              <Typography variant="body2" sx={{ color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)', mb: 2 }}>
                Explore the marked locations within {questRadius || 5}km radius
              </Typography>
              

              
                             
              <QuestMap
                isDarkTheme={isDarkTheme}
                center={mapCenter}
                spots={places.map(place => ({
                  ...place,
                  visited: visitedSpots.has(place.place_id)
                }))}
                radius={questRadius || 5}
                onSpotVisit={handleMapSpotVisit}
                currentLevel={currentLevel}
              />
            </Paper>
          )}


        </Box>
      )}

      {/* Level Complete Dialog */}
      <Dialog
        open={showLevelComplete}
        onClose={() => setShowLevelComplete(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: isDarkTheme
              ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 15, 35, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            border: isDarkTheme
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(99, 102, 241, 0.1)',
            borderRadius: 4,
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', color: isDarkTheme ? 'white' : 'black' }}>
          🎉 Level Complete!
        </DialogTitle>
        <DialogContent>
          <Box textAlign="center" py={2}>
            <EmojiEventsIcon sx={{ fontSize: 64, color: '#fbbf24', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, color: isDarkTheme ? 'white' : 'black' }}>
              Congratulations!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)' }}>
              You've completed {currentLevel?.name} and earned {currentLevel?.xpReward} XP!
            </Typography>
            <Chip
              label={`+${currentLevel?.xpReward} XP`}
              sx={{
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1.1rem',
                p: 1,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', p: 3 }}>
          <Button
            onClick={() => setShowLevelComplete(false)}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              }
            }}
          >
            Continue Exploring
          </Button>
        </DialogActions>
      </Dialog>


    </Box>
  );
} 