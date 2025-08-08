import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Avatar, Button, Typography, Chip, Divider, Paper, TextField } from '@mui/material';
import React from 'react';

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
  profileImage: string;
  name: string;
  editMode: boolean;
  editProfile: any;
  setEditProfile: (profile: any) => void;
  setEditMode: (mode: boolean) => void;
  saveLoading: boolean;
  saveError: string;
  saveSuccess: boolean;
  onProfileUpdate: (profile: any) => void;
  setActiveTab: (tab: string) => void;
  onSave: () => void;
}

export default function ProfileDialog({
  open,
  onClose,
  isDarkTheme,
  profileImage,
  name,
  editMode,
  editProfile,
  setEditProfile,
  setEditMode,
  saveLoading,
  saveError,
  saveSuccess,
  onProfileUpdate,
  setActiveTab,
  onSave
}: ProfileDialogProps) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: isDarkTheme 
            ? 'rgba(26, 26, 46, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: isDarkTheme 
            ? '1px solid rgba(255, 255, 255, 0.1)' 
            : '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: isDarkTheme
            ? '0 25px 50px rgba(0, 0, 0, 0.5)'
            : '0 25px 50px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 700,
        fontSize: '1.5rem'
      }}>
        Profile
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              justifyContent: 'center',
              mb: 2,
              bgcolor: isDarkTheme ? 'rgba(26, 26, 46, 0.5)' : 'rgba(248, 250, 252, 0.8)',
              borderRadius: 3,
              p: 3,
              boxShadow: isDarkTheme
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: isDarkTheme 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            <Avatar
              src={editProfile.avatarUrl || profileImage}
              alt={editProfile.name || name}
              sx={{ 
                width: 80, 
                height: 80, 
                mr: 3, 
                border: '3px solid',
                borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                boxShadow: isDarkTheme
                  ? '0 8px 24px rgba(0, 0, 0, 0.3)'
                  : '0 8px 24px rgba(99, 102, 241, 0.2)',
              }}
            />
            {!editMode && (
              <Button
                variant="contained"
                size="medium"
                startIcon={<AccountCircleIcon />}
                onClick={() => { onClose(); setActiveTab('profile'); }}
                sx={{
                  ml: 1,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Go to Profile
              </Button>
            )}
          </Box>
          <Divider sx={{ width: '100%', mb: 2, opacity: 0.3 }} />
          {saveError && (
            <Paper 
              sx={{ 
                p: 2, 
                mb: 2, 
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                textAlign: 'center',
                borderRadius: 2,
                width: '100%'
              }}
            >
              <Typography variant="body2">{saveError}</Typography>
            </Paper>
          )}
          {saveSuccess && (
            <Paper 
              sx={{ 
                p: 2, 
                mb: 2, 
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                textAlign: 'center',
                borderRadius: 2,
                width: '100%'
              }}
            >
              <Typography variant="body2">Profile updated successfully!</Typography>
            </Paper>
          )}
          {!editMode ? (
            <>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {editProfile.name || name}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {editProfile.email}
              </Typography>
              {editProfile.bio && (
                <Typography mt={1} sx={{ textAlign: 'center', fontStyle: 'italic' }}>
                  "{editProfile.bio}"
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                {editProfile.age && (
                  <Chip 
                    label={`Age: ${editProfile.age}`} 
                    size="small" 
                    sx={{ 
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: 'white',
                      fontWeight: 600
                    }} 
                  />
                )}
                {editProfile.gender && (
                  <Chip 
                    label={`Gender: ${editProfile.gender}`} 
                    size="small" 
                    sx={{ 
                      background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                      color: 'white',
                      fontWeight: 600
                    }} 
                  />
                )}
                {editProfile.sun_sign && (
                  <Chip 
                    label={`Sun Sign: ${editProfile.sun_sign}`} 
                    size="small" 
                    sx={{ 
                      background: 'linear-gradient(135deg, #10b981, #34d399)',
                      color: 'white',
                      fontWeight: 600
                    }} 
                  />
                )}
              </Box>
              {Array.isArray(editProfile.interests) && editProfile.interests.length > 0 && (
                <Box mt={2} sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Interests
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {editProfile.interests.map((interest: string, idx: number) => (
                      <Chip 
                        key={idx} 
                        label={interest} 
                        size="small" 
                        sx={{ 
                          background: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                          color: isDarkTheme ? '#e2e8f0' : '#6366f1',
                          fontWeight: 500,
                          border: isDarkTheme ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)',
                        }} 
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </>
          ) : (
            <Box component="form" sx={{ width: '100%' }}>
              <TextField 
                label="Name" 
                value={editProfile.name || ''} 
                onChange={e => setEditProfile({ ...editProfile, name: e.target.value })} 
                fullWidth 
                margin="dense" 
                sx={{ mb: 2 }}
              />
              <TextField 
                label="Email" 
                value={editProfile.email || ''} 
                onChange={e => setEditProfile({ ...editProfile, email: e.target.value })} 
                fullWidth 
                margin="dense" 
                sx={{ mb: 2 }}
              />
              <TextField 
                label="Avatar URL" 
                value={editProfile.avatarUrl || ''} 
                onChange={e => setEditProfile({ ...editProfile, avatarUrl: e.target.value })} 
                fullWidth 
                margin="dense" 
                placeholder="Enter image URL for your profile picture"
                sx={{ mb: 2 }}
              />
              <TextField 
                label="Bio" 
                value={editProfile.bio || ''} 
                onChange={e => setEditProfile({ ...editProfile, bio: e.target.value })} 
                fullWidth 
                margin="dense" 
                multiline 
                minRows={2} 
                sx={{ mb: 2 }}
              />
              <TextField 
                label="Age" 
                type="number" 
                value={editProfile.age || ''} 
                onChange={e => setEditProfile({ ...editProfile, age: e.target.value })} 
                fullWidth 
                margin="dense" 
                sx={{ mb: 2 }}
              />
              <TextField 
                label="Gender" 
                value={editProfile.gender || ''} 
                onChange={e => setEditProfile({ ...editProfile, gender: e.target.value })} 
                fullWidth 
                margin="dense" 
                sx={{ mb: 2 }}
              />
              <TextField 
                label="Sun Sign" 
                value={editProfile.sun_sign || ''} 
                onChange={e => setEditProfile({ ...editProfile, sun_sign: e.target.value })} 
                fullWidth 
                margin="dense" 
                sx={{ mb: 2 }}
              />
              <TextField 
                label="Interests (comma separated)" 
                value={Array.isArray(editProfile.interests) ? editProfile.interests.join(', ') : ''} 
                onChange={e => setEditProfile({ ...editProfile, interests: e.target.value.split(',').map((i: string) => i.trim()).filter(Boolean) })} 
                fullWidth 
                margin="dense" 
                sx={{ mb: 2 }}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        {!editMode ? (
          <Button 
            onClick={() => setEditMode(true)}
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            Edit
          </Button>
        ) : (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onSave}
            disabled={saveLoading}
            sx={{
              background: 'linear-gradient(135deg, #10b981, #34d399)',
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #059669, #10b981)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: 'linear-gradient(135deg, #9ca3af, #6b7280)',
              }
            }}
          >
            {saveLoading ? 'Saving...' : 'Save'}
          </Button>
        )}
        <Button 
          onClick={onClose}
          sx={{
            color: isDarkTheme ? '#9ca3af' : '#6b7280',
            fontWeight: 600,
            '&:hover': {
              background: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.1)',
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
} 