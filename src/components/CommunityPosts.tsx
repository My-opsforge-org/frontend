import { Box, Typography, Card, CardContent, Button, TextField, CircularProgress, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import React from 'react';
import FAB from './FAB';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

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
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default CommunityPosts; 