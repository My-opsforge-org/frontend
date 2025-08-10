import { Avatar, Box, Card, CardContent, CardHeader, Typography, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import { useThemeToggle } from '../App';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import DeleteIcon from '@mui/icons-material/Delete';
import { API_BASE_URL } from '../api';

import ButtonGroup from '@mui/material/ButtonGroup';

export default function Profile({ isDarkTheme, onBack, userId: propUserId }: { isDarkTheme: boolean; onBack?: () => void; userId?: number }) {
  const { isDark } = useThemeToggle();
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };
  const [followersCount, setFollowersCount] = React.useState<number>(0);
  const [followingCount, setFollowingCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [profileData, setProfileData] = React.useState<any>({});
  const [editOpen, setEditOpen] = React.useState(false);
  const [editProfile, setEditProfile] = React.useState<any>({});
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [saveError, setSaveError] = React.useState('');
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [shareCopied, setShareCopied] = React.useState(false);
  const [userPosts, setUserPosts] = React.useState<any[]>([]);
  const [postsLoading, setPostsLoading] = React.useState(true);
  const [postsError, setPostsError] = React.useState('');
  const [isOwnProfile, setIsOwnProfile] = React.useState(true);
  const [view, setView] = React.useState<'posts' | 'bookmarks'>('posts');
  const [bookmarks, setBookmarks] = React.useState<any[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = React.useState(false);
  const [bookmarksError, setBookmarksError] = React.useState('');
  const [deleteLoading, setDeleteLoading] = React.useState<{[key:number]:boolean}>({});
  const [snackbar, setSnackbar] = React.useState<{open:boolean, message:string, severity:'success'|'error'}>({open:false, message:'', severity:'success'});

  const handleDeletePost = async (postId: number) => {
    setDeleteLoading(l => ({...l, [postId]: true}));
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setUserPosts(posts => posts.filter(p => p.id !== postId));
        setSnackbar({open:true, message:'Post deleted successfully', severity:'success'});
      } else {
        const data = await response.json();
        setSnackbar({open:true, message: data.error || 'Failed to delete post', severity:'error'});
      }
    } catch (err) {
      setSnackbar({open:true, message:'Network error while deleting post', severity:'error'});
    } finally {
      setDeleteLoading(l => ({...l, [postId]: false}));
    }
  };

  React.useEffect(() => {
    const fetchProfileAndFollows = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Not authenticated. Please log in.');
          setLoading(false);
          navigate('/login', { replace: true });
          return;
        }
        // Get current user profile to compare
        let currentUserId = null;
        if (!propUserId) {
          // Viewing own profile
          const profileRes = await fetch(`${API_BASE_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (profileRes.status === 401) {
            localStorage.removeItem('access_token');
            navigate('/login', { replace: true });
            return;
          }
          const profileData = await profileRes.json();
          if (!profileRes.ok) {
            setError(profileData.error || 'Failed to fetch profile');
            setLoading(false);
            return;
          }
          setProfileData(profileData);
          setEditProfile(profileData);
          setIsOwnProfile(true);
          currentUserId = profileData.id;
        } else {
          // Viewing another user's profile
          // Get current user id for comparison
          const meRes = await fetch(`${API_BASE_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const meData = await meRes.json();
          currentUserId = meData.id;
          setIsOwnProfile(propUserId === meData.id);
          // Fetch the other user's profile (FIX: use /users/<id> endpoint)
          const profileRes = await fetch(`${API_BASE_URL}/users/${propUserId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const profileData = await profileRes.json();
          if (!profileRes.ok || !profileData) {
            setError(profileData.error || 'Failed to fetch user profile');
            setLoading(false);
            return;
          }
          setProfileData(profileData);
          setEditProfile(profileData);
        }
        // Fetch followers, following, and posts
        const [followersRes, followingRes, postsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/${propUserId || currentUserId}/followers`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/users/${propUserId || currentUserId}/following`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/profile/${propUserId || currentUserId}/posts`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        const followersData = await followersRes.json();
        const followingData = await followingRes.json();
        setFollowersCount(Array.isArray(followersData.followers) ? followersData.followers.length : 0);
        setFollowingCount(Array.isArray(followingData.following) ? followingData.following.length : 0);
        // Handle posts
        const postsData = await postsRes.json();
        if (postsRes.ok && Array.isArray(postsData.posts)) {
          setUserPosts(postsData.posts);
          setPostsError('');
        } else {
          setUserPosts([]);
          setPostsError(postsData.error || 'Failed to load posts');
        }
        setPostsLoading(false);
      } catch (err) {
        setError('Network error');
        setPostsError('Network error');
        setPostsLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndFollows();
  }, [navigate, propUserId]);

  // Fetch bookmarks when toggled to bookmarks view
  React.useEffect(() => {
    if (view === 'bookmarks' && isOwnProfile) {
      const fetchBookmarks = async () => {
        setBookmarksLoading(true);
        setBookmarksError('');
        try {
          const token = localStorage.getItem('access_token');
          const res = await fetch(`${API_BASE_URL}/bookmarks`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.status === 401) {
            localStorage.removeItem('access_token');
            navigate('/login', { replace: true });
            return;
          }
          const data = await res.json();
          if (res.ok && Array.isArray(data)) {
            setBookmarks(data);
            setBookmarksError('');
          } else {
            setBookmarks([]);
            setBookmarksError(data.error || 'Failed to load bookmarks');
          }
        } catch {
          setBookmarksError('Network error');
          setBookmarks([]);
        } finally {
          setBookmarksLoading(false);
        }
      };
      fetchBookmarks();
    }
  }, [view, isOwnProfile, navigate]);

  return (
    <Box sx={{ bgcolor: isDark ? '#18191A' : '#fff', minHeight: '100vh', p: 0 }}>
      {/* Header Bar */}
      <Box display="flex" alignItems="center" width="100%" sx={{ px: { xs: 2, md: 4, lg: 6 }, py: 2, bgcolor: isDark ? '#23272f' : '#fff', boxShadow: 1, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
        <IconButton onClick={handleBack} sx={{ mr: 1, bgcolor: 'transparent', boxShadow: 0, '&:hover': { bgcolor: isDark ? '#23272f' : '#f5f5f5' } }}>
          <ArrowBackIcon sx={{ color: isDark ? '#fafafa' : 'black', fontSize: 32 }} />
        </IconButton>
      </Box>
      
      {/* Profile Section */}
      <Box display="flex" flexDirection="column" alignItems="center" mt={2} mb={4} sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4, lg: 6 } }}>
        <Avatar 
          src={profileData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}`} 
          alt={profileData.name || 'User'} 
          sx={{ 
            width: 120, 
            height: 120, 
            fontSize: 48, 
            bgcolor: isDark ? '#2d3a4a' : '#cce9fa', 
            color: isDark ? '#fafafa' : '#222', 
            mb: 2, 
            border: isDark ? '3px solid #333' : 'none', 
            boxShadow: isDark ? '0 4px 24px #0008' : 'none' 
          }} 
        />
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, fontSize: 40, color: isDark ? '#fafafa' : '#222' }}>
          {profileData.name || 'User'}
        </Typography>
        <Typography sx={{ color: isDark ? '#b0b8c1' : '#555', mb: 1, fontSize: 18 }}>
          <span style={{ fontSize: 18 }}>{profileData.username ? `@${profileData.username}` : ''}</span>
        </Typography>
        
        {/* Additional Profile Info */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3, mb: 2, maxWidth: 800 }}>
          {profileData.bio && (
            <Typography sx={{ color: isDark ? '#b0b8c1' : '#555', fontSize: 16, textAlign: 'center', maxWidth: 600 }}>
              {profileData.bio}
            </Typography>
          )}
          {profileData.age && (
            <Chip 
              label={`Age: ${profileData.age}`} 
              sx={{ 
                bgcolor: isDark ? '#2d3a4a' : '#e9e5dc',
                color: isDark ? '#fafafa' : '#222',
                fontWeight: 600
              }} 
            />
          )}
          {profileData.gender && (
            <Chip 
              label={profileData.gender} 
              sx={{ 
                bgcolor: isDark ? '#2d3a4a' : '#e9e5dc',
                color: isDark ? '#fafafa' : '#222',
                fontWeight: 600
              }} 
            />
          )}
          {profileData.sun_sign && (
            <Chip 
              label={profileData.sun_sign} 
              sx={{ 
                bgcolor: isDark ? '#2d3a4a' : '#e9e5dc',
                color: isDark ? '#fafafa' : '#222',
                fontWeight: 600
              }} 
            />
          )}
        </Box>
        
        {loading ? (
          <Typography sx={{ fontWeight: 600, mb: 2, fontSize: 18, color: isDark ? '#e0e0e0' : '#222' }}>
            Loading followers...
          </Typography>
        ) : error ? (
          <Typography sx={{ fontWeight: 600, mb: 2, fontSize: 18, color: 'red' }}>{error}</Typography>
        ) : (
          <Typography sx={{ fontWeight: 600, mb: 2, fontSize: 18, color: isDark ? '#e0e0e0' : '#222' }}>
            {followersCount} followers · {followingCount} following
          </Typography>
        )}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          gap: 3, 
          mb: 3,
          maxWidth: 800,
          '& .MuiButton-root': {
            minWidth: 140,
            height: 48
          }
        }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: isDark ? '#23272f' : '#e9e5dc', 
              color: isDark ? '#fafafa' : '#222', 
              borderRadius: 3, 
              px: 4, 
              fontWeight: 600, 
              fontSize: 18, 
              boxShadow: 0, 
              '&:hover': { bgcolor: isDark ? '#31343b' : '#d6d1c7' } 
            }}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
              } catch {
                // fallback: create a temp input
                const input = document.createElement('input');
                input.value = window.location.href;
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
              }
            }}
          >
            Share
          </Button>
          {shareCopied && (
            <Typography sx={{ color: isDark ? '#90caf9' : '#1976d2', fontWeight: 500, alignSelf: 'center' }}>
              Profile link copied!
            </Typography>
          )}
          {isOwnProfile && (
            <Button 
              variant="contained" 
              sx={{ 
                bgcolor: isDark ? '#23272f' : '#e9e5dc', 
                color: isDark ? '#fafafa' : '#222', 
                borderRadius: 3, 
                px: 4, 
                fontWeight: 600, 
                fontSize: 18, 
                boxShadow: 0, 
                '&:hover': { bgcolor: isDark ? '#31343b' : '#d6d1c7' } 
              }} 
              onClick={() => setEditOpen(true)}
            >
              Edit profile
            </Button>
          )}
        </Box>
      </Box>

      {/* User's Posts Section */}
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4, lg: 6 }, pb: 8 }}>
        <ButtonGroup
          variant="contained"
          sx={{
            mb: 3,
            borderRadius: 3,
            boxShadow: isDark ? '0 2px 8px #0006' : '0 2px 8px #bbb2',
            overflow: 'hidden',
            width: '100%',
            '& .MuiButton-root': {
              flex: 1,
              fontWeight: 700,
              fontSize: 18,
              border: 'none',
              borderRadius: 0,
              transition: 'background 0.2s, color 0.2s',
              color: isDark ? '#fafafa' : '#222',
              bgcolor: isDark ? '#23272f' : '#e9e5dc',
              '&.active': {
                bgcolor: isDark ? '#1976d2' : '#1976d2',
                color: '#fff',
              },
              '&:hover': {
                bgcolor: isDark ? '#31343b' : '#d6d1c7',
              },
            },
          }}
          fullWidth
        >
          <Button
            className={view === 'posts' ? 'active' : ''}
            onClick={() => setView('posts')}
            disableElevation
            sx={{ borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}
          >
            Posts
          </Button>
          {isOwnProfile && (
            <Button
              className={view === 'bookmarks' ? 'active' : ''}
              onClick={() => setView('bookmarks')}
              disableElevation
              sx={{ borderTopRightRadius: 12, borderBottomRightRadius: 12 }}
            >
              Bookmarks
            </Button>
          )}
        </ButtonGroup>

        {view === 'posts' ? (
          <>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: isDark ? '#fafafa' : '#222' }}>
              Posts
            </Typography>
            {postsLoading ? (
              <Typography sx={{ color: isDark ? '#b0b8c1' : '#555', fontSize: 20, mb: 2, textAlign: 'center' }}>
                Loading posts...
              </Typography>
            ) : postsError ? (
              <Typography sx={{ color: 'red', fontSize: 20, mb: 2, textAlign: 'center' }}>
                {postsError}
              </Typography>
            ) : userPosts.length === 0 ? (
              <Typography sx={{ color: isDark ? '#b0b8c1' : '#555', fontSize: 20, mb: 2, textAlign: 'center' }}>
                You haven't posted anything yet.
              </Typography>
            ) : (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                gap: 3,
                width: '100%'
              }}>
                {userPosts.map(post => (
                  <Card key={post.id} sx={{ 
                    bgcolor: isDark ? '#23272f' : '#f9f9f9', 
                    borderRadius: 3, 
                    boxShadow: isDark ? '0 2px 8px #0004' : '0 2px 8px #0001',
                    height: 'fit-content',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <CardHeader
                      avatar={<Avatar src={profileData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}`} alt={profileData.name || 'User'} />}
                      title={profileData.name || 'User'}
                      subheader={new Date(post.created_at).toLocaleDateString()}
                      action={
                        isOwnProfile && (
                          <Tooltip title="Delete Post" arrow>
                            <span>
                              <IconButton 
                                onClick={() => handleDeletePost(post.id)} 
                                disabled={deleteLoading[post.id]} 
        sx={{
                                  color: isDark ? '#9ca3af' : '#6b7280',
                                  '&:hover': {
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )
                      }
                    />
                    <CardContent>
                      {post.community && (
                        <Box mb={1}>
                          <Chip label={post.community.name} color="secondary" size="small" sx={{ fontWeight: 700, mr: 1 }} />
                        </Box>
                      )}
                      <Typography variant="h6">{post.title}</Typography>
                      <Typography>{post.content}</Typography>
                      {Array.isArray(post.images) && post.images.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {post.images.map((img: any) => (
                            <img
                              key={img.id || img.url}
                              src={img.url}
                              alt={post.title}
                              style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
                            />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </>
        ) : (
          <>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: isDark ? '#fafafa' : '#222' }}>
              Bookmarked Posts
            </Typography>
            {bookmarksLoading ? (
              <Typography sx={{ color: isDark ? '#b0b8c1' : '#555', fontSize: 20, mb: 2, textAlign: 'center' }}>
                Loading bookmarks...
              </Typography>
            ) : bookmarksError ? (
              <Typography sx={{ color: 'red', fontSize: 20, mb: 2, textAlign: 'center' }}>
                {bookmarksError}
            </Typography>
            ) : bookmarks.length === 0 ? (
              <Typography sx={{ color: isDark ? '#b0b8c1' : '#555', fontSize: 20, mb: 2, textAlign: 'center' }}>
                You haven't bookmarked any posts yet.
            </Typography>
            ) : (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                gap: 3,
                width: '100%'
              }}>
                {bookmarks.map(post => (
                  <Card key={post.id} sx={{ 
                    bgcolor: isDark ? '#23272f' : '#f9f9f9', 
                    borderRadius: 3, 
                    boxShadow: isDark ? '0 2px 8px #0004' : '0 2px 8px #0001',
                    height: 'fit-content',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <CardHeader
                      avatar={<Avatar src={post.author?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'User')}`} alt={post.author?.name || 'User'} />}
                      title={post.author?.name || 'User'}
                      subheader={new Date(post.created_at).toLocaleDateString()}
                    />
                    <CardContent>
                      {post.community && (
                        <Box mb={1}>
                          <Chip label={post.community.name} color="secondary" size="small" sx={{ fontWeight: 700, mr: 1 }} />
                        </Box>
                      )}
                      <Typography variant="h6">{post.title}</Typography>
                      <Typography>{post.content}</Typography>
                      {Array.isArray(post.images) && post.images.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {post.images.map((img: any) => (
                            <img
                              key={img.id || img.url}
                              src={img.url}
                              alt={post.title}
                              style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
                            />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Edit Profile Dialog */}
      {isOwnProfile && (
        <Dialog open={editOpen} onClose={() => { setEditOpen(false); setSaveError(''); setSaveSuccess(false); }} maxWidth="xs" fullWidth>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
              <Avatar
                src={editProfile.avatarUrl || profileData.avatarUrl}
                alt={editProfile.name || profileData.name}
                sx={{ width: 72, height: 72, mb: 2, border: '2px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
              />
              <Divider sx={{ width: '100%', mb: 2 }} />
              {saveError && <Typography color="error" sx={{ mt: 1 }}>{saveError}</Typography>}
              {saveSuccess && <Typography color="success.main" sx={{ mt: 1 }}>Profile updated!</Typography>}
              <Box component="form" sx={{ width: '100%' }}>
                <TextField label="Name" value={editProfile.name || ''} onChange={e => setEditProfile({ ...editProfile, name: e.target.value })} fullWidth margin="dense" />
                <TextField label="Email" value={editProfile.email || ''} onChange={e => setEditProfile({ ...editProfile, email: e.target.value })} fullWidth margin="dense" />
                <TextField label="Avatar URL" value={editProfile.avatarUrl || ''} onChange={e => setEditProfile({ ...editProfile, avatarUrl: e.target.value })} fullWidth margin="dense" placeholder="Enter image URL for your profile picture" />
                <TextField label="Bio" value={editProfile.bio || ''} onChange={e => setEditProfile({ ...editProfile, bio: e.target.value })} fullWidth margin="dense" multiline minRows={2} />
                <TextField label="Age" type="number" value={editProfile.age || ''} onChange={e => setEditProfile({ ...editProfile, age: e.target.value })} fullWidth margin="dense" />
                <TextField label="Gender" value={editProfile.gender || ''} onChange={e => setEditProfile({ ...editProfile, gender: e.target.value })} fullWidth margin="dense" />
                <TextField label="Sun Sign" value={editProfile.sun_sign || ''} onChange={e => setEditProfile({ ...editProfile, sun_sign: e.target.value })} fullWidth margin="dense" />
                <TextField label="Interests (comma separated)" value={Array.isArray(editProfile.interests) ? editProfile.interests.join(', ') : ''} onChange={e => setEditProfile({ ...editProfile, interests: e.target.value.split(',').map((i: string) => i.trim()).filter(Boolean) })} fullWidth margin="dense" />
          </Box>
        </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setEditOpen(false); setSaveError(''); setSaveSuccess(false); }}>Cancel</Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={async () => {
                setSaveLoading(true);
                setSaveError('');
                setSaveSuccess(false);
                try {
                  const token = localStorage.getItem('access_token');
                  const response = await fetch(`${API_BASE_URL}/profile`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(editProfile)
                  });
                  const data = await response.json();
                  if (response.ok) {
                    setSaveSuccess(true);
                    setEditOpen(false);
                    setProfileData(data.user || editProfile);
                    setEditProfile(data.user || editProfile);
                  } else {
                    setSaveError(data.error || 'Failed to update profile');
                  }
                } catch (err) {
                  setSaveError('Network error');
                } finally {
                  setSaveLoading(false);
                }
              }} 
              disabled={saveLoading}
            >
              {saveLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({...s, open:false}))}>
        <Alert onClose={() => setSnackbar(s => ({...s, open:false}))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}


