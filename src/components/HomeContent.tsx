import { Avatar, Box, Card, CardContent, CardHeader, CircularProgress, Typography, IconButton, Tooltip, TextField, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemAvatar, ListItemText, Divider, Button, Chip } from '@mui/material';
import { useState, useEffect } from 'react';
import { parseISO, isValid as isValidDate, parse } from 'date-fns';
import { API_BASE_URL } from '../api';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import FAB from './FAB';
import { postEventManager } from '../utils/postEvents';

interface Post {
  id: number;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: {
    name?: string;
    avatarUrl?: string;
    id?: number;
  };
  author_id?: number;
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
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<{[key:number]:boolean}>({});
  const navigate = useNavigate();

  // FAB and modal state for profile post
  const [openProfilePostModal, setOpenProfilePostModal] = useState(false);
  const [profilePostTitle, setProfilePostTitle] = useState('');
  const [profilePostContent, setProfilePostContent] = useState('');
  const [profilePostImages, setProfilePostImages] = useState(''); // comma-separated URLs
  const [profilePostError, setProfilePostError] = useState('');
  const [creatingProfilePost, setCreatingProfilePost] = useState(false);

  // Fetch current user ID
  useEffect(() => {
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

  // Listen for post creation events from other components
  useEffect(() => {
    const unsubscribe = postEventManager.addListener((event) => {
      if (event.source === 'community') {
        // Add the new community post to the home feed
        setPosts(posts => [event.post, ...posts]);
      }
    });

    // Cleanup listener on unmount
    return unsubscribe;
  }, []);

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
        // Create a properly formatted post object with correct image structure
        const newPost = {
          ...data.post,
          images: Array.isArray(data.post.images) 
            ? data.post.images 
            : (data.post.image_urls || []).map((url: string) => ({ url })),
          // Ensure we have the author information
          author: {
            name: data.post.author?.name || 'You',
            avatarUrl: data.post.author?.avatarUrl,
            id: data.post.author?.id || currentUserId
          }
        };
        
        // Debug logging to see what's being created
        console.log('Created new post:', newPost);
        console.log('Post images:', newPost.images);
        
        setPosts(posts => [newPost, ...posts]);
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

  const handleDeletePost = async (postId: number) => {
    setDeleteLoading(l => ({...l, [postId]: true}));
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setPosts(posts => posts.filter(p => p.id !== postId));
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

  const parseDateSafe = (input: unknown): Date | null => {
    if (!input) return null;
    try {
      if (input instanceof Date) {
        return isValidDate(input) ? input : null;
      }
      if (typeof input === 'number') {
        const d = new Date(input);
        return isValidDate(d) ? d : null;
      }
      if (typeof input === 'string') {
        const tzlessRegex = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?)$/;
        const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(input);
        if (!hasTimezone && tzlessRegex.test(input)) {
          // Treat timezone-less backend strings as UTC
          const isoCandidate = input.replace(' ', 'T') + 'Z';
          const utcDate = new Date(isoCandidate);
          if (isValidDate(utcDate)) return utcDate;
        }
        // Common ISO formats
        let d: Date | null = null;
        try {
          d = parseISO(input);
          if (isValidDate(d)) return d;
        } catch {}
        // Native parse (without modification)
        const nativeDirect = new Date(input);
        if (isValidDate(nativeDirect)) return nativeDirect;
        // Try space-separated datetime like "yyyy-MM-dd HH:mm:ss"
        const patterns = [
          'yyyy-MM-dd HH:mm:ss',
          'yyyy-MM-dd HH:mm',
          'yyyy/MM/dd HH:mm:ss',
          'yyyy/MM/dd HH:mm',
        ];
        for (const pattern of patterns) {
          try {
            const parsed = parse(input, pattern, new Date());
            if (isValidDate(parsed)) return parsed;
          } catch {}
        }
        // Last resort: native Date
        const native = new Date(input.replace(' ', 'T'));
        if (isValidDate(native)) return native;
      }
    } catch {}
    return null;
  };

  const formatDateTime = (input: unknown): string => {
    const d = parseDateSafe(input);
    if (!d) return '';
    try {
      const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Toronto',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return dtf.format(d);
    } catch {
      return '';
    }
  };

  const choosePostDate = (post: Post): string | undefined => {
    return post.created_at || post.createdAt || post.updated_at || post.updatedAt;
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
          <Card 
            key={post.id} 
            sx={{ 
              mb: 3,
              borderRadius: 4,
              background: isDarkTheme 
                ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: isDarkTheme
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: isDarkTheme 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDarkTheme
                  ? '0 16px 48px rgba(0, 0, 0, 0.4)'
                  : '0 16px 48px rgba(0, 0, 0, 0.12)',
              },
              animation: 'fadeIn 0.6s ease-out',
            }}
          >
            <CardHeader
              avatar={
                <Avatar 
                  src={post.author?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'User')}`} 
                  alt={post.author?.name || 'User'} 
                  sx={{ 
                    width: 56, 
                    height: 56,
                    border: '3px solid',
                    borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                    boxShadow: isDarkTheme
                      ? '0 4px 16px rgba(0, 0, 0, 0.3)'
                      : '0 4px 16px rgba(99, 102, 241, 0.2)',
                  }} 
                />
              }
              title={
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    background: isDarkTheme
                      ? 'linear-gradient(135deg, #ffffff, #e2e8f0)'
                      : 'linear-gradient(135deg, #1f2937, #374151)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {post.author?.name || 'User'}
                </Typography>
              }
              subheader={(() => {
                const text = formatDateTime(choosePostDate(post)) || 'Just now';
                return (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      opacity: 0.7,
                      color: isDarkTheme ? '#9ca3af' : '#6b7280',
                      fontWeight: 500,
                    }}
                  >
                    {text}
                  </Typography>
                );
              })()}
              sx={{
                pb: 1,
                '& .MuiCardHeader-content': {
                  overflow: 'hidden',
                }
              }}
            />
            <CardContent sx={{ pt: 0 }}>
              {post.community && (
                <Box mb={2}>
                  <Chip 
                    label={post.community.name} 
                    size="small" 
                    sx={{ 
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                      color: 'white',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease',
                    }} 
                  />
                </Box>
              )}
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  mb: 2,
                  background: isDarkTheme
                    ? 'linear-gradient(135deg, #ffffff, #e2e8f0)'
                    : 'linear-gradient(135deg, #1f2937, #374151)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {post.title}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  lineHeight: 1.6,
                  color: isDarkTheme ? '#e2e8f0' : '#374151',
                  mb: 2,
                }}
              >
                {post.content}
              </Typography>
              {Array.isArray(post.images) && post.images.length > 0 && (
                <Box sx={{ 
                  mt: 2, 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 2,
                  '& img': {
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    }
                  }
                }}>
                  {post.images.map((img: any) => (
                    <img
                      key={img.id || img.url}
                      src={img.url}
                      alt={post.title}
                      style={{ maxWidth: '100%', maxHeight: 200 }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
                         {/* Beautiful Action Buttons Section */}
             <Box 
               sx={{
                 borderTop: '1px solid',
                 borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                 background: isDarkTheme 
                   ? 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)'
                   : 'linear-gradient(180deg, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0.02) 100%)',
                 pt: 3,
                 pb: 2,
                 px: 3,
               }}
             >
               {/* Main Actions Row */}
               <Box 
                 display="flex" 
                 alignItems="center" 
                 justifyContent="space-between"
                 mb={2}
               >
                 {/* Left side - Like with enhanced styling */}
                 <Box 
                   display="flex" 
                   alignItems="center" 
                   gap={1.5}
                   sx={{
                     background: isDarkTheme 
                       ? 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)'
                       : 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.03) 100%)',
                     borderRadius: 3,
                     px: 2,
                     py: 1,
                     border: '1px solid',
                     borderColor: post.is_liked 
                       ? 'rgba(239,68,68,0.3)' 
                       : (isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                   }}
                 >
                   <Tooltip title="Like" arrow>
                     <span>
                       <IconButton 
                         onClick={() => handleLike(post.id)} 
                         disabled={likeLoading[post.id] || post.is_liked} 
                         size="large"
                         sx={{
                           color: post.is_liked ? '#ef4444' : (isDarkTheme ? '#9ca3af' : '#6b7280'),
                           '&:hover': {
                             background: 'rgba(239, 68, 68, 0.15)',
                             transform: 'scale(1.1)',
                           },
                           transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                           borderRadius: 2,
                           width: 44,
                           height: 44,
                         }}
                       >
                         {post.is_liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                       </IconButton>
                     </span>
                   </Tooltip>
                   <Typography 
                     variant="h6" 
                     sx={{ 
                       fontWeight: 700,
                       color: post.is_liked ? '#ef4444' : (isDarkTheme ? '#e2e8f0' : '#374151'),
                       minWidth: '24px',
                       textAlign: 'center',
                     }}
                   >
                     {post.likes_count || 0}
                   </Typography>
                 </Box>

                 {/* Right side - Action buttons with beautiful grouping */}
                 <Box 
                   display="flex" 
                   alignItems="center" 
                   gap={1}
                   sx={{
                     background: isDarkTheme 
                       ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
                       : 'linear-gradient(135deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.01) 100%)',
                     borderRadius: 3,
                     px: 2,
                     py: 1,
                     border: '1px solid',
                     borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                   }}
                 >
                   {/* Bookmark */}
                   <Tooltip title="Bookmark" arrow>
                     <span>
                       <IconButton 
                         onClick={() => handleBookmark(post.id, !!post.is_bookmarked)} 
                         disabled={bookmarkLoading[post.id]} 
                         size="large"
                         sx={{
                           color: post.is_bookmarked ? '#f59e0b' : (isDarkTheme ? '#9ca3af' : '#6b7280'),
                           '&:hover': {
                             background: 'rgba(245, 158, 11, 0.15)',
                             transform: 'scale(1.1)',
                           },
                           transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                           borderRadius: 2,
                           width: 44,
                           height: 44,
                         }}
                       >
                         {post.is_bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                       </IconButton>
                     </span>
                   </Tooltip>
                   
                   {/* Comment */}
                   <Tooltip title="Comment" arrow>
                     <IconButton 
                       onClick={() => openCommentsModal(post.id)}
                       size="large"
                       sx={{
                         color: isDarkTheme ? '#9ca3af' : '#6b7280',
                         '&:hover': {
                           background: 'rgba(16, 185, 129, 0.15)',
                           transform: 'scale(1.1)',
                         },
                         transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                         borderRadius: 2,
                         width: 44,
                         height: 44,
                       }}
                     >
                       <ChatBubbleOutlineIcon />
                     </IconButton>
                   </Tooltip>
                   
                   {/* Share */}
                   <Tooltip title="Share" arrow>
                     <IconButton 
                       onClick={() => handleShare(post.id)}
                       size="large"
                       sx={{
                         color: isDarkTheme ? '#9ca3af' : '#6b7280',
                         '&:hover': {
                           background: 'rgba(99, 102, 241, 0.15)',
                           transform: 'scale(1.1)',
                         },
                         transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                         borderRadius: 2,
                         width: 44,
                         height: 44,
                       }}
                     >
                       <ShareIcon />
                     </IconButton>
                   </Tooltip>
                   
                   {/* Delete - only for author */}
                   {currentUserId === post.author_id && (
                     <Tooltip title="Delete Post" arrow>
                       <span>
                         <IconButton 
                           onClick={() => handleDeletePost(post.id)} 
                           disabled={deleteLoading[post.id]} 
                           size="large"
                           sx={{
                             color: isDarkTheme ? '#9ca3af' : '#6b7280',
                             '&:hover': {
                               background: 'rgba(239, 68, 68, 0.15)',
                               transform: 'scale(1.1)',
                             },
                             transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                             borderRadius: 2,
                             width: 44,
                             height: 44,
                           }}
                         >
                           <DeleteIcon />
                         </IconButton>
                       </span>
                     </Tooltip>
                   )}
                 </Box>
               </Box>
             </Box>
            <Box px={3} pb={3}>
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
                          <Typography component="span" variant="caption" color="text.secondary">{formatDateTime((comment as any).created_at || (comment as any).createdAt) || 'Just now'}</Typography>
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


