import { Avatar, Box, Card, CardContent, CardHeader, CircularProgress, Typography, IconButton, Tooltip, TextField, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemAvatar, ListItemText, Divider, Button, Chip } from '@mui/material';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useNavigate } from 'react-router-dom';
import FAB from './FAB';

interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  author?: {
    name?: string;
    avatarUrl?: string;
  };
  images: Array<{ id?: number; url: string }>;
  likes_count?: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  comments_count?: number;
  community?: {
    id: number;
    name: string;
  };
  // Add more fields as needed
}

export default function HomeContent({ isDarkTheme }: { isDarkTheme: boolean }) {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');
  const [likeLoading, setLikeLoading] = useState<{[key:number]:boolean}>({});
  const [bookmarkLoading, setBookmarkLoading] = useState<{[key:number]:boolean}>({});
  const [commentText, setCommentText] = useState<{[key:number]:string}>({});
  const [commentLoading, setCommentLoading] = useState<{[key:number]:boolean}>({});
  const [snackbar, setSnackbar] = useState<{open:boolean, message:string, severity:'success'|'error'}>({open:false, message:'', severity:'success'});
  const [commentsOpen, setCommentsOpen] = useState<{open: boolean, postId: number | null}>({open: false, postId: null});
  const [comments, setComments] = useState<{[key:number]: any[]}>({});
  const [commentsLoading, setCommentsLoading] = useState<{[key:number]: boolean}>({});
  const navigate = useNavigate();

  // FAB and modal state for profile post
  const [openProfilePostModal, setOpenProfilePostModal] = useState(false);
  const [profilePostTitle, setProfilePostTitle] = useState('');
  const [profilePostContent, setProfilePostContent] = useState('');
  const [profilePostImages, setProfilePostImages] = useState(''); // comma-separated URLs
  const [profilePostError, setProfilePostError] = useState('');
  const [creatingProfilePost, setCreatingProfilePost] = useState(false);

  useEffect(() => {
    const fetchFeed = async () => {
      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/feed`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login', { replace: true });
          return;
        }
        const data = await response.json();
        if (response.ok) {
          setPosts(data.posts || []);
        } else {
          setError(data.error || 'Failed to load feed');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeed();
  }, [navigate]);

  const handleLike = async (postId: number) => {
    setLikeLoading(l => ({...l, [postId]: true}));
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setPosts(posts => posts.map(p => p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1, is_liked: true } : p));
        setSnackbar({open:true, message:'Post liked!', severity:'success'});
      } else {
        setSnackbar({open:true, message:'Failed to like post', severity:'error'});
      }
    } finally {
      setLikeLoading(l => ({...l, [postId]: false}));
    }
  };

  const handleBookmark = async (postId: number, isBookmarked: boolean) => {
    setBookmarkLoading(l => ({...l, [postId]: true}));
    try {
      const token = localStorage.getItem('access_token');
      const method = isBookmarked ? 'DELETE' : 'POST';
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/bookmark`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setPosts(posts => posts.map(p => p.id === postId ? { ...p, is_bookmarked: !isBookmarked } : p));
        setSnackbar({open:true, message: isBookmarked ? 'Bookmark removed' : 'Bookmarked!', severity:'success'});
      } else {
        setSnackbar({open:true, message:'Failed to update bookmark', severity:'error'});
      }
    } finally {
      setBookmarkLoading(l => ({...l, [postId]: false}));
    }
  };

  const handleShare = (postId: number) => {
    const url = window.location.origin + '/post/' + postId;
    navigator.clipboard.writeText(url);
    setSnackbar({open:true, message:'Post link copied!', severity:'success'});
  };

  const handleComment = async (postId: number) => {
    setCommentLoading(l => ({...l, [postId]: true}));
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: commentText[postId] })
      });
      if (response.ok) {
        setCommentText(t => ({...t, [postId]: ''}));
        setSnackbar({open:true, message:'Comment added!', severity:'success'});
        // Re-fetch comments for this post to update the UI
        const fetchResponse = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setComments(c => ({...c, [postId]: data}));
        }
      } else {
        setSnackbar({open:true, message:'Failed to add comment', severity:'error'});
      }
    } finally {
      setCommentLoading(l => ({...l, [postId]: false}));
    }
  };

  const openCommentsModal = async (postId: number) => {
    setCommentsOpen({open: true, postId});
    if (!comments[postId]) {
      setCommentsLoading(l => ({...l, [postId]: true}));
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setComments(c => ({...c, [postId]: data}));
        }
      } finally {
        setCommentsLoading(l => ({...l, [postId]: false}));
      }
    }
  };

  const closeCommentsModal = () => setCommentsOpen({open: false, postId: null});

  // Handler for creating profile post
  const handleCreateProfilePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfilePostError('');
    setCreatingProfilePost(true);
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${API_BASE_URL}/profile/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: profilePostTitle,
          content: profilePostContent,
          image_urls: profilePostImages
            .split(',')
            .map(url => url.trim())
            .filter(url => url.length > 0),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setPosts(posts => [{
          ...data.post,
          images: (data.post.image_urls || []).map((url: string) => ({ url })),
        }, ...posts]);
        setProfilePostTitle('');
        setProfilePostContent('');
        setProfilePostImages('');
        setOpenProfilePostModal(false);
        setSnackbar({ open: true, message: 'Profile post created!', severity: 'success' });
      } else {
        setProfilePostError(data.error || data.message || 'Failed to create post');
      }
    } catch {
      setProfilePostError('Network error');
    }
    setCreatingProfilePost(false);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography align="center" color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {posts.length === 0 ? (
        <Typography align="center" color="text.secondary">No posts yet. Be the first to share something!</Typography>
      ) : (
        posts.map((post: Post) => (
          <Card key={post.id} sx={{ mb: 2 }}>
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
            <Box display="flex" alignItems="center" px={2} pb={1}>
              <Tooltip title="Like">
                <span>
                  <IconButton onClick={() => handleLike(post.id)} disabled={likeLoading[post.id] || post.is_liked} color={post.is_liked ? 'primary' : 'default'}>
                    {post.is_liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </span>
              </Tooltip>
              <Typography variant="body2" sx={{ mr: 2 }}>{post.likes_count || 0}</Typography>
              <Tooltip title="Bookmark">
                <span>
                  <IconButton onClick={() => handleBookmark(post.id, !!post.is_bookmarked)} disabled={bookmarkLoading[post.id]} color={!!post.is_bookmarked ? 'primary' : 'default'}>
                    {post.is_bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Share">
                <IconButton onClick={() => handleShare(post.id)}>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Comment">
                <IconButton onClick={() => openCommentsModal(post.id)}>
                  <ChatBubbleOutlineIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box px={2} pb={2}>
              <TextField
                size="small"
                placeholder="Add a comment..."
                value={commentText[post.id] || ''}
                onChange={e => setCommentText(t => ({...t, [post.id]: e.target.value}))}
                onKeyDown={e => { if (e.key === 'Enter') handleComment(post.id); }}
                disabled={commentLoading[post.id]}
                sx={{ width: '100%' }}
              />
            </Box>
          </Card>
        ))
      )}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({...s, open:false}))}>
        <Alert onClose={() => setSnackbar(s => ({...s, open:false}))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog open={commentsOpen.open} onClose={closeCommentsModal} maxWidth="sm" fullWidth>
        <DialogTitle>Comments</DialogTitle>
        <DialogContent dividers>
          {commentsLoading[commentsOpen.postId ?? -1] ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="20vh"><CircularProgress /></Box>
          ) : (
            <List>
              {(comments[commentsOpen.postId ?? -1] || []).length === 0 ? (
                <Typography align="center" color="text.secondary">No comments yet.</Typography>
              ) : (
                (comments[commentsOpen.postId ?? -1] || []).map((comment: any) => (
                  <div key={comment.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar src={comment.author?.avatarUrl || undefined} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={comment.author?.name || 'User'}
                        secondary={<>
                          <Typography component="span" variant="body2" color="text.primary">{comment.content}</Typography>
                          <br/>
                          <Typography component="span" variant="caption" color="text.secondary">{new Date(comment.created_at).toLocaleString()}</Typography>
                        </>}
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </div>
                ))
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
          {commentsOpen.postId && (
            <Box width="100%" px={2} pb={1}>
              <TextField
                size="small"
                placeholder="Add a comment..."
                value={commentText[commentsOpen.postId] || ''}
                onChange={e => setCommentText(t => ({...t, [commentsOpen.postId!]: e.target.value}))}
                onKeyDown={e => { if (e.key === 'Enter') handleComment(commentsOpen.postId!); }}
                disabled={commentLoading[commentsOpen.postId]}
                sx={{ width: '100%' }}
              />
            </Box>
          )}
          <Button onClick={closeCommentsModal}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* FAB for creating profile post */}
      <FAB isDarkTheme={isDarkTheme} onClick={() => setOpenProfilePostModal(true)} />
      <Dialog open={openProfilePostModal} onClose={() => setOpenProfilePostModal(false)}>
        <DialogTitle>Create Profile Post</DialogTitle>
        <form onSubmit={handleCreateProfilePost}>
          <DialogContent>
            <TextField
              label="Title"
              value={profilePostTitle}
              onChange={e => setProfilePostTitle(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Content"
              value={profilePostContent}
              onChange={e => setProfilePostContent(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              minRows={2}
              required
            />
            <TextField
              label="Image URLs (comma separated)"
              value={profilePostImages}
              onChange={e => setProfilePostImages(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
            />
            {profilePostError && <Typography color="error" sx={{ mt: 1 }}>{profilePostError}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenProfilePostModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={creatingProfilePost}>
              {creatingProfilePost ? 'Posting...' : 'Post'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 