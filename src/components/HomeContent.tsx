import { Avatar, Box, Card, CardContent, CardHeader, CircularProgress, Typography } from '@mui/material';
import { useState } from 'react';

const mockPosts = [
  {
    id: 1,
    title: 'Welcome to GoTripping!',
    content: 'This is your first post. Start sharing your travel stories!',
    author: { name: 'Admin', avatarUrl: 'https://ui-avatars.com/api/?name=Admin' },
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Share your favorite destination',
    content: 'Tell us about a place you love to visit.',
    author: { name: 'Jane Doe', avatarUrl: 'https://ui-avatars.com/api/?name=Jane+Doe' },
    created_at: new Date().toISOString(),
  },
];

export default function HomeContent({ isDarkTheme }: { isDarkTheme: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const posts = mockPosts;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {posts.length === 0 ? (
        <Typography align="center" color="text.secondary">No posts yet. Be the first to share something!</Typography>
      ) : (
        posts.map(post => (
          <Card key={post.id} sx={{ mb: 2 }}>
            <CardHeader
              avatar={<Avatar src={post.author.avatarUrl} alt={post.author.name} />}
              title={post.author.name}
              subheader={new Date(post.created_at).toLocaleDateString()}
            />
            <CardContent>
              <Typography variant="h6">{post.title}</Typography>
              <Typography>{post.content}</Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
} 