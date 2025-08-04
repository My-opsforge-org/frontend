import { Box, Typography, Card, CardContent, Button, TextField, CircularProgress, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import React from 'react';
import FAB from './FAB';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { API_BASE_URL } from '../api';

interface Community {
  id: number;
  name: string;
  is_member?: boolean;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author_id: number;
  created_at: string;
  images?: Array<{ url: string }>;
}

interface CommunityPostsProps {
  selectedCommunity: Community;
  posts: Post[];
  postsLoading: boolean;
  postTitle: string;
  postContent: string;
  postError: string;
  creatingPost: boolean;
  handleCreatePost: (e: React.FormEvent) => void;
  setPostTitle: (title: string) => void;
  setPostContent: (content: string) => void;
  isDarkTheme: boolean;
  onBack: () => void;
  postImages: string;
  setPostImages: (images: string) => void;
}

const CommunityPosts: React.FC<CommunityPostsProps> = ({
  selectedCommunity,
  posts,
  postsLoading,
  postTitle,
  postContent,
  postError,
  creatingPost,
  handleCreatePost,
  setPostTitle,
  setPostContent,
  isDarkTheme,
  onBack,
  postImages,
  setPostImages
}) => {
  const [openPostModal, setOpenPostModal] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState<{[key:number]:boolean}>({});
  const [snackbar, setSnackbar] = React.useState<{open:boolean, message:string, severity:'success'|'error'}>({open:false, message:'', severity:'success'});

  // Fetch current user ID
  React.useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUserId(userData.id);
        }
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleDeletePost = async (postId: number) => {
    setDeleteLoading(l => ({...l, [postId]: true}));
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        // Note: We can't directly update posts here since it's passed as a prop
        // The parent component should handle the state update
        setSnackbar({open:true, message:'Post deleted successfully', severity:'success'});
        // Reload the page or trigger a refresh
        window.location.reload();
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

  return (
    <Box mt={2}>
      <Box display="flex" alignItems="center" mb={2}>
        <Tooltip title="Back to Communities">
          <IconButton onClick={onBack} sx={{ mr: 1, bgcolor: isDarkTheme ? '#23272f' : '#f5f5f5', boxShadow: 1, '&:hover': { bgcolor: isDarkTheme ? '#1a1a1a' : '#e0e0e0' } }}>
            <ArrowBackIcon sx={{ color: isDarkTheme ? 'white' : 'black' }} />
          </IconButton>
        </Tooltip>
        <Typography variant="h5" color={isDarkTheme ? 'white' : 'black'} gutterBottom sx={{ fontWeight: 600 }}>
          Posts in {selectedCommunity.name}
        </Typography>
      </Box>
      {selectedCommunity.is_member && (
        <>
          <FAB isDarkTheme={isDarkTheme} onClick={() => setOpenPostModal(true)} />
          <Dialog open={openPostModal} onClose={() => setOpenPostModal(false)}>
            <DialogTitle>Create a Post in {selectedCommunity.name}</DialogTitle>
            <form onSubmit={e => { handleCreatePost(e); if (!creatingPost && !postError) setOpenPostModal(false); }}>
              <DialogContent>
                <TextField
                  label="Title"
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                />
                <TextField
                  label="Content"
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  fullWidth
                  margin="normal"
                  multiline
                  minRows={2}
                  required
                />
                <TextField
                  label="Image URLs (comma separated)"
                  value={postImages}
                  onChange={e => setPostImages(e.target.value)}
                  fullWidth
                  margin="normal"
                  placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                />
                {postError && <Typography color="error">{postError}</Typography>}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenPostModal(false)}>Cancel</Button>
                <Button type="submit" variant="contained" color="primary" disabled={creatingPost}>
                  {creatingPost ? 'Posting...' : 'Post'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </>
      )}
      {postsLoading ? (
        <CircularProgress />
      ) : posts.length === 0 ? (
        <Typography color={isDarkTheme ? 'white' : 'black'}>No posts yet.</Typography>
      ) : (
        posts.map(post => (
          <Card key={post.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box flex={1}>
                  <Typography variant="h6">{post.title}</Typography>
                  {/* Show images if present */}
                  {post.images && post.images.length > 0 && (
                    <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                      {post.images.map((img, idx) => (
                        <Box key={idx} component="img" src={img.url} alt="post image" sx={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 2, boxShadow: 1 }} />
                      ))}
                    </Box>
                  )}
                  <Typography variant="body2" color="textSecondary">{post.content}</Typography>
                  <Typography variant="caption" color="textSecondary">By User {post.author_id} on {new Date(post.created_at).toLocaleString()}</Typography>
                </Box>
                {currentUserId === post.author_id && (
                  <Tooltip title="Delete Post" arrow>
                    <span>
                      <IconButton 
                        onClick={() => handleDeletePost(post.id)} 
                        disabled={deleteLoading[post.id]} 
                        sx={{
                          color: isDarkTheme ? '#9ca3af' : '#6b7280',
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
                )}
              </Box>
            </CardContent>
          </Card>
        ))
      )}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({...s, open:false}))}>
        <Alert onClose={() => setSnackbar(s => ({...s, open:false}))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CommunityPosts; 