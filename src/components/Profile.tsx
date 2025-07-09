import { Avatar, Box, Card, CardContent, CardHeader, Typography } from '@mui/material';
import { useThemeToggle } from '../App';

const mockUser = {
  name: 'User',
  avatarUrl: 'https://ui-avatars.com/api/?name=User',
};

const mockPosts = [
  {
    id: 1,
    title: 'My First Post',
    content: 'This is my first post on GoTripping!',
    created_at: new Date().toISOString(),
  },
];

export default function Profile() {
  const { isDark } = useThemeToggle();
  return (
    <Box sx={{ bgcolor: isDark ? '#1C1C1E' : '#F8F9FA', minHeight: '100vh', p: 2 }}>
      <Card sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
        <CardHeader
          avatar={<Avatar src={mockUser.avatarUrl} alt={mockUser.name} />}
          title={mockUser.name}
          subheader="Profile"
        />
        <CardContent>
          <Typography>Email: user@example.com</Typography>
        </CardContent>
      </Card>
      <Typography variant="h6" align="center" gutterBottom>Posts</Typography>
      {mockPosts.map(post => (
        <Card key={post.id} sx={{ maxWidth: 400, mx: 'auto', mb: 2 }}>
          <CardHeader
            title={post.title}
            subheader={new Date(post.created_at).toLocaleDateString()}
          />
          <CardContent>
            <Typography>{post.content}</Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
} 