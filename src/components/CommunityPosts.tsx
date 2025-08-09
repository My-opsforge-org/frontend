import React from 'react';
import { Box, Typography, Button, CircularProgress, TextField, Paper, List, ListItem, ListItemText, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export interface CommunityPostsProps {
  selectedCommunity: { id: number; name: string } | null;
  posts: Array<{ id: number; title: string; content: string; created_at?: string; image_urls?: string[] }>;
  postsLoading: boolean;
  postTitle: string;
  postContent: string;
  postError: string;
  creatingPost: boolean;
  handleCreatePost: (e: React.FormEvent) => Promise<void> | void;
  setPostTitle: (v: string) => void;
  setPostContent: (v: string) => void;
  isDarkTheme: boolean;
  onBack: () => void;
  postImages: string;
  setPostImages: (v: string) => void;
}

export default function CommunityPosts(props: CommunityPostsProps) {
  const {
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
  } = props;

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <IconButton onClick={onBack} aria-label="Back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {selectedCommunity?.name || 'Community'}
        </Typography>
      </Box>

      {/* Create post */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          bgcolor: isDarkTheme ? '#1f2937' : '#f9fafb',
          border: isDarkTheme ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <form onSubmit={handleCreatePost}>
          <TextField
            label="Title"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Content"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
          />
          <TextField
            label="Image URLs (comma separated)"
            value={postImages}
            onChange={(e) => setPostImages(e.target.value)}
            fullWidth
            margin="normal"
          />
          {postError && (
            <Typography color="error" sx={{ mt: 1 }}>
              {postError}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button type="submit" variant="contained" disabled={creatingPost}>
              {creatingPost ? 'Posting...' : 'Post'}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Posts list */}
      <Paper elevation={0} sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
        {postsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {posts.map((p) => (
              <ListItem key={p.id} divider>
                <ListItemText
                  primary={p.title}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {p.content}
                      </Typography>
                      {p.image_urls && p.image_urls.length > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {p.image_urls.join(', ')}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
            {posts.length === 0 && (
              <Box sx={{ p: 2 }}>
                <Typography color="text.secondary">No posts yet.</Typography>
              </Box>
            )}
          </List>
        )}
      </Paper>
    </Box>
  );
}


