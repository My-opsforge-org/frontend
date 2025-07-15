import { Avatar, Box, Card, CardContent, CardHeader, Typography } from '@mui/material';
import { useThemeToggle } from '../App';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

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

export default function Profile({ isDarkTheme, onBack }: { isDarkTheme: boolean; onBack?: () => void }) {
  const { isDark } = useThemeToggle();
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };
  const [tab, setTab] = React.useState(0);
  return (
    <Box sx={{ bgcolor: isDark ? '#18191A' : '#fff', minHeight: '100vh', p: 0 }}>
      {/* Header Bar */}
      <Box display="flex" alignItems="center" width="100%" sx={{ px: 2, py: 2, bgcolor: isDark ? '#23272f' : '#fff', boxShadow: 1, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
        <IconButton onClick={handleBack} sx={{ mr: 1, bgcolor: 'transparent', boxShadow: 0, '&:hover': { bgcolor: isDark ? '#23272f' : '#f5f5f5' } }}>
          <ArrowBackIcon sx={{ color: isDark ? '#fafafa' : 'black', fontSize: 32 }} />
        </IconButton>
      </Box>
      {/* Profile Section */}
      <Box display="flex" flexDirection="column" alignItems="center" mt={2} mb={4}>
        <Avatar src={mockUser.avatarUrl} alt={mockUser.name} sx={{ width: 120, height: 120, fontSize: 48, bgcolor: isDark ? '#2d3a4a' : '#cce9fa', color: isDark ? '#fafafa' : '#222', mb: 2, border: isDark ? '3px solid #333' : 'none', boxShadow: isDark ? '0 4px 24px #0008' : 'none' }} />
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, fontSize: 40, color: isDark ? '#fafafa' : '#222' }}>Aftab</Typography>
        <Typography sx={{ color: isDark ? '#b0b8c1' : '#555', mb: 1, fontSize: 18 }}>
          <span style={{ fontSize: 18 }}>@khanaftaba1</span>
        </Typography>
        <Typography sx={{ fontWeight: 600, mb: 2, fontSize: 18, color: isDark ? '#e0e0e0' : '#222' }}>
          2 followers · 3 following
        </Typography>
        <Box display="flex" gap={2} mb={2}>
          <Button variant="contained" sx={{ bgcolor: isDark ? '#23272f' : '#e9e5dc', color: isDark ? '#fafafa' : '#222', borderRadius: 3, px: 4, fontWeight: 600, fontSize: 18, boxShadow: 0, '&:hover': { bgcolor: isDark ? '#31343b' : '#d6d1c7' } }}>Share</Button>
          <Button variant="contained" sx={{ bgcolor: isDark ? '#23272f' : '#e9e5dc', color: isDark ? '#fafafa' : '#222', borderRadius: 3, px: 4, fontWeight: 600, fontSize: 18, boxShadow: 0, '&:hover': { bgcolor: isDark ? '#31343b' : '#d6d1c7' } }}>Edit profile</Button>
        </Box>
      </Box>
      {/* User's Posts Section */}
      <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', px: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: isDark ? '#fafafa' : '#222' }}>Your Posts</Typography>
        {mockPosts.length === 0 ? (
          <Typography sx={{ color: isDark ? '#b0b8c1' : '#555', fontSize: 20, mb: 2, textAlign: 'center' }}>You haven't posted anything yet.</Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {mockPosts.map(post => (
              <Box key={post.id} sx={{ bgcolor: isDark ? '#23272f' : '#f9f9f9', borderRadius: 3, p: 3, boxShadow: isDark ? '0 2px 8px #0004' : '0 2px 8px #0001' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: isDark ? '#fafafa' : '#222' }}>{post.title}</Typography>
                <Typography sx={{ color: isDark ? '#b0b8c1' : '#555', mb: 1 }}>{post.content}</Typography>
                <Typography sx={{ color: isDark ? '#888' : '#888', fontSize: 14 }}>{new Date(post.created_at).toLocaleDateString()}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
} 