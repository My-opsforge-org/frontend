import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import communityService, { CommunityMember, CommunityMembersResponse } from '../services/communityService';

interface CommunityMembersModalProps {
  open: boolean;
  onClose: () => void;
  communityId: number;
  communityName: string;
  isDarkTheme: boolean;
}

const CommunityMembersModal: React.FC<CommunityMembersModalProps> = ({
  open,
  onClose,
  communityId,
  communityName,
  isDarkTheme
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [membersData, setMembersData] = useState<CommunityMembersResponse | null>(null);

  useEffect(() => {
    if (open && communityId) {
      fetchMembers();
    }
  }, [open, communityId]);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await communityService.getCommunityMembers(communityId);
      setMembersData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: isDarkTheme ? '#1a1a1a' : '#ffffff',
          color: isDarkTheme ? '#ffffff' : '#000000',
          borderRadius: 2,
          boxShadow: isDarkTheme 
            ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: isDarkTheme 
            ? '1px solid rgba(255, 255, 255, 0.1)' 
            : '1px solid rgba(0, 0, 0, 0.1)',
          pb: 2
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            {communityName} Members
          </Typography>
          {membersData && (
            <Chip
              label={`${membersData.members.length} members`}
              size="small"
              sx={{
                bgcolor: isDarkTheme ? '#6366f1' : '#3b82f6',
                color: 'white',
                fontWeight: 600
              }}
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && membersData && (
          <List sx={{ width: '100%', bgcolor: 'transparent' }}>
            {membersData.members.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body2" color="text.secondary">
                  No members found
                </Typography>
              </Box>
            ) : (
              membersData.members.map((member) => (
                <ListItem
                  key={member.id}
                  sx={{
                    borderBottom: isDarkTheme 
                      ? '1px solid rgba(255, 255, 255, 0.05)' 
                      : '1px solid rgba(0, 0, 0, 0.05)',
                    '&:last-child': {
                      borderBottom: 'none'
                    }
                  }}
                >
                  <ListItemAvatar>
                    {member.avatarUrl ? (
                      <Avatar
                        src={member.avatarUrl}
                        alt={member.name}
                        sx={{
                          width: 48,
                          height: 48,
                          border: isDarkTheme 
                            ? '2px solid rgba(255, 255, 255, 0.1)' 
                            : '2px solid rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: isDarkTheme ? '#6366f1' : '#3b82f6',
                          border: isDarkTheme 
                            ? '2px solid rgba(255, 255, 255, 0.1)' 
                            : '2px solid rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: isDarkTheme ? '#ffffff' : '#1f2937'
                        }}
                      >
                        {member.name}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        {member.bio && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: isDarkTheme ? '#9ca3af' : '#6b7280',
                              mb: 1
                            }}
                          >
                            {member.bio}
                          </Typography>
                        )}
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {member.age && (
                            <Chip
                              label={`${member.age} years`}
                              size="small"
                              sx={{
                                bgcolor: isDarkTheme ? '#374151' : '#f3f4f6',
                                color: isDarkTheme ? '#d1d5db' : '#374151',
                                fontSize: '0.75rem'
                              }}
                            />
                          )}
                          {member.gender && (
                            <Chip
                              label={member.gender}
                              size="small"
                              sx={{
                                bgcolor: isDarkTheme ? '#374151' : '#f3f4f6',
                                color: isDarkTheme ? '#d1d5db' : '#374151',
                                fontSize: '0.75rem'
                              }}
                            />
                          )}
                          {member.sun_sign && (
                            <Chip
                              label={member.sun_sign}
                              size="small"
                              sx={{
                                bgcolor: isDarkTheme ? '#374151' : '#f3f4f6',
                                color: isDarkTheme ? '#d1d5db' : '#374151',
                                fontSize: '0.75rem'
                              }}
                            />
                          )}
                        </Box>
                        {member.interests.length > 0 && (
                          <Box display="flex" gap={0.5} flexWrap="wrap" mt={1}>
                            {member.interests.slice(0, 3).map((interest, index) => (
                              <Chip
                                key={index}
                                label={interest}
                                size="small"
                                sx={{
                                  bgcolor: isDarkTheme ? '#1f2937' : '#e5e7eb',
                                  color: isDarkTheme ? '#9ca3af' : '#374151',
                                  fontSize: '0.7rem',
                                  height: '20px'
                                }}
                              />
                            ))}
                            {member.interests.length > 3 && (
                              <Chip
                                label={`+${member.interests.length - 3} more`}
                                size="small"
                                sx={{
                                  bgcolor: isDarkTheme ? '#1f2937' : '#e5e7eb',
                                  color: isDarkTheme ? '#9ca3af' : '#374151',
                                  fontSize: '0.7rem',
                                  height: '20px'
                                }}
                              />
                            )}
                          </Box>
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            color: isDarkTheme ? '#6b7280' : '#9ca3af',
                            display: 'block',
                            mt: 1
                          }}
                        >
                          Joined {formatDate(member.joinedAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: isDarkTheme 
        ? '1px solid rgba(255, 255, 255, 0.1)' 
        : '1px solid rgba(0, 0, 0, 0.1)' 
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: isDarkTheme ? '#6366f1' : '#3b82f6',
            borderColor: isDarkTheme ? '#6366f1' : '#3b82f6',
            '&:hover': {
              borderColor: isDarkTheme ? '#4f46e5' : '#2563eb',
              bgcolor: isDarkTheme ? 'rgba(99, 102, 241, 0.1)' : 'rgba(59, 130, 246, 0.1)'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommunityMembersModal;
