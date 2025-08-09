import { Box, Typography, CircularProgress, Alert, Avatar, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { AvatarService, AvatarApiResponse, AvatarItem } from '../services/avatarService';
import AvatarChat from './AvatarChat';

interface AvatarsContentProps {
  isDarkTheme: boolean;
  searchQuery?: string;
}

export default function AvatarsContent({ isDarkTheme, searchQuery = '' }: AvatarsContentProps) {
  const [avatars, setAvatars] = useState<AvatarItem[]>([]);
  const [filteredAvatars, setFilteredAvatars] = useState<AvatarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Add CSS animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: AvatarApiResponse = await AvatarService.getAvatars();
        if (response.success) {
          setAvatars(response.data);
          setFilteredAvatars(response.data);
        } else {
          setError('Failed to fetch avatars');
        }
      } catch (err) {
        setError('Error loading avatars. Please try again later.');
        console.error('Error fetching avatars:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatars();
  }, []);

  // If coming from HomeGrid with a specific companion, auto-open chat
  useEffect(() => {
    const targetName = localStorage.getItem('startAvatarChatName');
    if (targetName && avatars.length > 0) {
      const target = avatars.find(a => a.name === targetName);
      if (target) {
        setSelectedAvatar(target);
        setChatOpen(true);
      }
      localStorage.removeItem('startAvatarChatName');
    }
  }, [avatars]);

  // Filter avatars based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAvatars(avatars);
    } else {
      const filtered = avatars.filter(avatar => 
        avatar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        avatar.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        avatar.quote.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAvatars(filtered);
    }
  }, [searchQuery, avatars]);

  const handleAvatarClick = (avatarItem: AvatarItem) => {
    setSelectedAvatar(avatarItem);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAvatar(null);
  };

  const handleStartChat = () => {
    setDialogOpen(false);
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setSelectedAvatar(null);
  };

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="stretch" 
      justifyContent="flex-start" 
      width="100%" 
      height="100%" 
      minHeight="100vh" 
      bgcolor={isDarkTheme ? '#222' : '#fafafa'}
      sx={{
        background: isDarkTheme
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        position: 'relative',
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
      {/* Header */}
      <Box
        sx={{
          py: 4,
          px: 4,
          background: isDarkTheme
            ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 15, 35, 0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: isDarkTheme
            ? '1px solid rgba(255, 255, 255, 0.12)'
            : '1px solid rgba(99, 102, 241, 0.15)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDarkTheme
              ? 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 60%)'
              : 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 60%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800,
            letterSpacing: 1,
            color: isDarkTheme ? 'rgba(255, 255, 255, 0.98)' : 'rgba(31, 41, 55, 0.98)',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            fontSize: '2rem',
            textShadow: isDarkTheme ? '0 4px 8px rgba(0,0,0,0.4)' : '0 4px 8px rgba(0,0,0,0.15)',
            mb: 1
          }}
        >
          Choose Your Companion
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            fontSize: '1.1rem',
            fontWeight: 400
          }}
        >
          Select an inspiring figure to talk to
        </Typography>

        {/* Search Results Info */}
        {searchQuery && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : 'rgba(31, 41, 55, 0.6)',
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
              fontSize: '0.9rem',
              fontWeight: 500,
              mt: 2
            }}
          >
            {filteredAvatars.length === 0 
              ? `No avatars found for "${searchQuery}"`
              : `Found ${filteredAvatars.length} avatar${filteredAvatars.length === 1 ? '' : 's'} for "${searchQuery}"`
            }
          </Typography>
        )}
      </Box>

      {/* Content */}
      <Box 
        flex={1} 
        display="flex" 
        flexDirection="column"
        px={6}
        py={6}
        pb={12} // Add extra bottom padding to account for bottom navigation
        position="relative"
        zIndex={1}
        sx={{
          background: isDarkTheme
            ? 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)'
            : 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.03) 0%, transparent 50%)',
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
            <CircularProgress 
              sx={{ 
                color: isDarkTheme ? '#6366f1' : '#6366f1',
                '& .MuiCircularProgress-circle': {
                  strokeWidth: 3
                }
              }} 
            />
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
            <Alert 
              severity="error" 
              sx={{ 
                maxWidth: 400,
                background: isDarkTheme
                  ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(15, 15, 35, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)',
                backdropFilter: 'blur(20px)',
                border: isDarkTheme
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(99, 102, 241, 0.1)',
              }}
            >
              {error}
            </Alert>
          </Box>
        ) : (
          <>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                  lg: 'repeat(5, 1fr)',
                  xl: 'repeat(6, 1fr)'
                },
                gap: 6,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'start',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -20,
                  left: -20,
                  right: -20,
                  bottom: -20,
                  background: isDarkTheme
                    ? 'radial-gradient(circle at 30% 70%, rgba(139, 92, 246, 0.03) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(99, 102, 241, 0.03) 0%, transparent 50%)'
                    : 'radial-gradient(circle at 30% 70%, rgba(139, 92, 246, 0.02) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(99, 102, 241, 0.02) 0%, transparent 50%)',
                  pointerEvents: 'none',
                  zIndex: -1,
                }
              }}
            >
              {filteredAvatars.map((avatarItem, index) => (
                <Tooltip
                  key={index}
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        "{avatarItem.quote}"
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {avatarItem.description}
                      </Typography>
                    </Box>
                  }
                  arrow
                  placement="top"
                  sx={{
                    '& .MuiTooltip-tooltip': {
                      bgcolor: isDarkTheme ? 'rgba(26, 26, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      color: isDarkTheme ? 'white' : 'black',
                      border: isDarkTheme ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(10px)',
                      maxWidth: 300,
                      fontSize: '0.875rem',
                      boxShadow: isDarkTheme 
                        ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                        : '0 8px 32px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      '&:hover': {
                        transform: 'scale(1.05) translateY(-12px)',
                        '& .avatar-glow': {
                          opacity: 1,
                          transform: 'scale(1.2)',
                        },
                        '& .avatar-name': {
                          color: isDarkTheme ? '#6366f1' : '#6366f1',
                          transform: 'scale(1.05)',
                        }
                      }
                    }}
                    onClick={() => handleAvatarClick(avatarItem)}
                  >
                    {/* Glow effect */}
                    <Box
                      className="avatar-glow"
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 140,
                        height: 140,
                        borderRadius: '50%',
                        background: isDarkTheme
                          ? 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 70%)'
                          : 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 70%)',
                        opacity: 0,
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        zIndex: -1,
                        filter: 'blur(8px)',
                      }}
                    />
                    <Avatar
                      src={avatarItem.image_url}
                      alt={avatarItem.name}
                      sx={{
                        width: 130,
                        height: 130,
                        mb: 3,
                        border: isDarkTheme
                          ? '4px solid rgba(99, 102, 241, 0.4)'
                          : '4px solid rgba(99, 102, 241, 0.3)',
                        boxShadow: isDarkTheme
                          ? '0 16px 40px rgba(99, 102, 241, 0.3), 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                          : '0 16px 40px rgba(99, 102, 241, 0.25), 0 8px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        zIndex: 1,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -3,
                          left: -3,
                          right: -3,
                          bottom: -3,
                          background: isDarkTheme
                            ? 'linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899, #6366f1)'
                            : 'linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899, #6366f1)',
                          borderRadius: '50%',
                          zIndex: -1,
                          opacity: 0,
                          transition: 'opacity 0.5s ease',
                          backgroundSize: '400% 400%',
                          animation: 'gradientShift 3s ease infinite',
                        },
                        '&:hover': {
                          boxShadow: isDarkTheme
                            ? '0 24px 48px rgba(99, 102, 241, 0.5), 0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
                            : '0 24px 48px rgba(99, 102, 241, 0.4), 0 12px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.9)',
                          border: isDarkTheme
                            ? '4px solid rgba(99, 102, 241, 0.8)'
                            : '4px solid rgba(99, 102, 241, 0.6)',
                          transform: 'scale(1.02)',
                          '&::before': {
                            opacity: 0.4,
                          }
                        }
                      }}
                    />
                    <Typography 
                      className="avatar-name"
                      variant="body1" 
                      sx={{ 
                        fontWeight: 700,
                        color: isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(31, 41, 55, 0.9)',
                        textAlign: 'center',
                        fontSize: '1rem',
                        lineHeight: 1.4,
                        maxWidth: '140px',
                        wordWrap: 'break-word',
                        textShadow: isDarkTheme ? '0 2px 4px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0,0,0,0.15)',
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        letterSpacing: 0.5,
                        '&:hover': {
                          color: isDarkTheme ? 'rgba(255, 255, 255, 1)' : 'rgba(31, 41, 55, 1)',
                        }
                      }}
                    >
                      {avatarItem.name}
                    </Typography>
                  </Box>
                </Tooltip>
              ))}
            </Box>
          </>
        )}
      </Box>

      {/* Avatar Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDarkTheme ? '#1C1C1E' : '#fff',
            borderRadius: 4,
            boxShadow: isDarkTheme 
              ? '0 32px 64px rgba(0, 0, 0, 0.5), 0 16px 32px rgba(99, 102, 241, 0.2)' 
              : '0 32px 64px rgba(0, 0, 0, 0.2), 0 16px 32px rgba(99, 102, 241, 0.1)',
            border: isDarkTheme 
              ? '1px solid rgba(255, 255, 255, 0.15)' 
              : '1px solid rgba(99, 102, 241, 0.2)',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: isDarkTheme
                ? 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)'
                : 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.03) 0%, transparent 50%)',
              pointerEvents: 'none',
            }
          }
        }}
      >
        {selectedAvatar && (
          <>
            <DialogTitle
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                color: isDarkTheme ? 'white' : 'black',
                borderBottom: isDarkTheme 
                  ? '1px solid rgba(255, 255, 255, 0.15)' 
                  : '1px solid rgba(99, 102, 241, 0.2)',
                pb: 3,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: isDarkTheme
                    ? 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent)',
                }
              }}
            >
              <Avatar
                src={selectedAvatar.image_url}
                alt={selectedAvatar.name}
                sx={{
                  width: 80,
                  height: 80,
                  border: isDarkTheme
                    ? '4px solid rgba(99, 102, 241, 0.6)'
                    : '4px solid rgba(99, 102, 241, 0.4)',
                  boxShadow: isDarkTheme
                    ? '0 8px 24px rgba(99, 102, 241, 0.3), 0 4px 12px rgba(0,0,0,0.4)'
                    : '0 8px 24px rgba(99, 102, 241, 0.25), 0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {selectedAvatar.name}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                  fontWeight: 500
                }}>
                  Inspiring Figure
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 4, pb: 2 }}>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ 
                  mb: 3, 
                  p: 3, 
                  borderRadius: 3,
                  background: isDarkTheme
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.03) 100%)',
                  border: isDarkTheme
                    ? '1px solid rgba(99, 102, 241, 0.2)'
                    : '1px solid rgba(99, 102, 241, 0.15)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                    borderRadius: '2px',
                  }
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700,
                      color: isDarkTheme ? '#6366f1' : '#6366f1',
                      mb: 2,
                      fontStyle: 'italic',
                      fontSize: '1.25rem',
                      lineHeight: 1.5,
                      textAlign: 'center',
                      position: 'relative',
                      pl: 2,
                    }}
                  >
                    "{selectedAvatar.quote}"
                  </Typography>
                </Box>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: isDarkTheme ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.75)',
                    lineHeight: 1.7,
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    textAlign: 'center',
                    px: 2
                  }}
                >
                  {selectedAvatar.description}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 4, pt: 0, justifyContent: 'center', gap: 2 }}>
              <Button
                onClick={handleCloseDialog}
                variant="outlined"
                sx={{
                  border: isDarkTheme
                    ? '2px solid rgba(255, 255, 255, 0.3)'
                    : '2px solid rgba(99, 102, 241, 0.3)',
                  color: isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(99, 102, 241, 0.9)',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    border: isDarkTheme
                      ? '2px solid rgba(255, 255, 255, 0.6)'
                      : '2px solid rgba(99, 102, 241, 0.6)',
                    background: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Close
              </Button>
              <Button
                onClick={handleStartChat}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: isDarkTheme
                    ? '0 8px 24px rgba(99, 102, 241, 0.4), 0 4px 12px rgba(0,0,0,0.3)'
                    : '0 8px 24px rgba(99, 102, 241, 0.3), 0 4px 12px rgba(0,0,0,0.1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    boxShadow: isDarkTheme
                      ? '0 12px 32px rgba(99, 102, 241, 0.5), 0 6px 16px rgba(0,0,0,0.4)'
                      : '0 12px 32px rgba(99, 102, 241, 0.4), 0 6px 16px rgba(0,0,0,0.15)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Start Chat
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Avatar Chat Panel */}
      {chatOpen && selectedAvatar && (
        <AvatarChat
          avatar={selectedAvatar}
          isDarkTheme={isDarkTheme}
          onClose={handleCloseChat}
        />
      )}
    </Box>
  );
} 