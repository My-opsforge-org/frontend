import { Box, Typography, Card, CardContent, CardHeader, Avatar, Button, TextField, CircularProgress, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import { parseISO, isValid as isValidDate, parse } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import FAB from './FAB';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { API_BASE_URL } from '../api';
import CommunityMembersModal from './CommunityMembersModal';

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
  image_urls?: string[];
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
  onPostDeleted?: (postId: number) => void;
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
  setPostImages,
  onPostDeleted
}) => {
  const [openPostModal, setOpenPostModal] = React.useState(false);
  const [openMembersModal, setOpenMembersModal] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState<{[key:number]:boolean}>({});
  const [snackbar, setSnackbar] = React.useState<{open:boolean, message:string, severity:'success'|'error'}>({open:false, message:'', severity:'success'});

  React.useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
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
        setSnackbar({open:true, message:'Post deleted successfully', severity:'success'});
        if (onPostDeleted) {
          onPostDeleted(postId);
        }
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

  // Utilities to format dates like Home feed
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
          const isoCandidate = input.replace(' ', 'T') + 'Z';
          const utcDate = new Date(isoCandidate);
          if (isValidDate(utcDate)) return utcDate;
        }
        let d: Date | null = null;
        try {
          d = parseISO(input);
          if (isValidDate(d)) return d;
        } catch {}
        const nativeDirect = new Date(input);
        if (isValidDate(nativeDirect)) return nativeDirect;
        const patterns = ['yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd HH:mm', 'yyyy/MM/dd HH:mm:ss', 'yyyy/MM/dd HH:mm'];
        for (const pattern of patterns) {
          try {
            const parsed = parse(input, pattern, new Date());
            if (isValidDate(parsed)) return parsed;
          } catch {}
        }
        const native = new Date(input.replace(' ', 'T'));
        if (isValidDate(native)) return native;
      }
    } catch {}
    return null;
  };

  const choosePostDate = (post: Post): string | undefined => {
    return (post as any).created_at || (post as any).createdAt || (post as any).updated_at || (post as any).updatedAt;
  };

  const formatDateTime = (input: unknown): string => {
    const d = parseDateSafe(input);
    if (!d) return '';
    try {
      const dtf = new Intl.DateTimeFormat('en-US', {
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

  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);

  return (
    <Box
      mt={2}
      sx={{
        px: { xs: 2, sm: 3, md: 4, lg: 6 },
        width: '100%',
        maxWidth: '100%',
        mx: 'auto',
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Tooltip title="Back to Communities">
            <IconButton onClick={onBack} sx={{ mr: 1, bgcolor: isDarkTheme ? '#23272f' : '#f5f5f5', boxShadow: 1, '&:hover': { bgcolor: isDarkTheme ? '#1a1a1a' : '#e0e0e0' } }}>
              <ArrowBackIcon sx={{ color: isDarkTheme ? 'white' : 'black' }} />
        </IconButton>
          </Tooltip>
          <Avatar sx={{ width: 40, height: 40 }} src={(selectedCommunity as any).image_url || undefined}>
            {(selectedCommunity?.name || 'C').charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h5" color={isDarkTheme ? 'white' : 'black'} gutterBottom sx={{ fontWeight: 600 }}>
            {selectedCommunity.name}
          </Typography>
      </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="View Members">
            <IconButton 
              onClick={() => setOpenMembersModal(true)}
              sx={{ 
                bgcolor: isDarkTheme ? '#374151' : '#f3f4f6', 
                color: isDarkTheme ? '#d1d5db' : '#374151',
                boxShadow: 1, 
                '&:hover': { 
                  bgcolor: isDarkTheme ? '#4b5563' : '#e5e7eb',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <PeopleIcon />
            </IconButton>
          </Tooltip>
          {/* More options menu */}
          <IconButton
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ bgcolor: isDarkTheme ? '#374151' : '#f3f4f6', color: isDarkTheme ? '#d1d5db' : '#374151' }}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            PaperProps={{ sx: { borderRadius: 2 } }}
          >
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                const evt = new CustomEvent('community:requestEdit', { 
                  detail: { 
                    id: selectedCommunity.id,
                    name: selectedCommunity.name,
                    description: (selectedCommunity as any).description || '',
                    image_url: (selectedCommunity as any).image_url || ''
                  } 
                });
                window.dispatchEvent(evt);
              }}
            >
              Edit community
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                const evt = new CustomEvent('community:requestDelete', { detail: { id: selectedCommunity.id } });
                window.dispatchEvent(evt);
              }}
            >
              Delete community
            </MenuItem>
          </Menu>
        </Box>
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
              // Expand to use full width on large screens
              width: '100%',
              maxWidth: '1400px',
              mx: 'auto',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDarkTheme
                  ? '0 16px 48px rgba(0, 0, 0, 0.4)'
                  : '0 16px 48px rgba(0, 0, 0, 0.12)'
              }
            }}
          >
            {(() => {
              const author = (post as any).author || {};
              const authorName: string = author.name || (post.author_id ? `User ${post.author_id}` : 'User');
              const authorAvatar: string | undefined = author.avatarUrl || undefined;
              return (
                <CardHeader
                  avatar={
                    <Avatar 
                      src={authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}`} 
                      alt={authorName}
                      sx={{ 
                        width: 48, 
                        height: 48,
                        border: '2px solid',
                        borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(99, 102, 241, 0.2)'
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
                      {authorName}
                    </Typography>
                  }
                  subheader={(() => {
                    const dateText = formatDateTime(choosePostDate(post));
                    return (
                      <Typography variant="body2" sx={{ color: isDarkTheme ? '#9ca3af' : '#6b7280', fontWeight: 500 }}>
                        {dateText}
                      </Typography>
                    );
                  })()}
                  sx={{ pb: 0 }}
                />
              );
            })()}
            <CardContent sx={{ pt: 1.5 }}>
              {/* Post title styled like Home feed */}
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  mb: 1.5,
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
              {(post.images && post.images.length > 0) ? (
                <Box sx={{ 
                  mt: 1, 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 2,
                  '& img': {
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    maxHeight: 200,
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    }
                  }
                }}>
                  {post.images.map((img, idx) => (
                    <img key={idx} src={img.url} alt="post" />
                  ))}
                </Box>
              ) : (post.image_urls && post.image_urls.length > 0) ? (
                <Box sx={{ 
                  mt: 1, 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 2,
                  '& img': {
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    maxHeight: 200,
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    }
                  }
                }}>
                  {post.image_urls.map((url, idx) => (
                    <img key={idx} src={url} alt="post" />
                  ))}
                </Box>
              ) : null}
              {currentUserId === post.author_id && (
                <Box display="flex" justifyContent="flex-end" mt={1}>
                  <Tooltip title="Delete Post" arrow>
                    <span>
                      <IconButton 
                        onClick={() => handleDeletePost(post.id)} 
                        disabled={deleteLoading[post.id]} 
                        sx={{
                          color: isDarkTheme ? '#9ca3af' : '#6b7280',
                          '&:hover': {
                            background: 'rgba(239, 68, 68, 0.1)',
                            transform: 'scale(1.05)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
              </Box>
            )}
            </CardContent>
          </Card>
        ))
      )}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({...s, open:false}))}>
        <Alert onClose={() => setSnackbar(s => ({...s, open:false}))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <CommunityMembersModal
        open={openMembersModal}
        onClose={() => setOpenMembersModal(false)}
        communityId={selectedCommunity.id}
        communityName={selectedCommunity.name}
        isDarkTheme={isDarkTheme}
      />
    </Box>
  );
};

export default CommunityPosts;