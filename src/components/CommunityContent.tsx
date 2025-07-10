import { Box, Typography, Button, Card, CardContent, CircularProgress, TextField, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../api';
import FAB from './FAB';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

interface Community {
  id: number;
  name: string;
  description: string;
  members_details?: any[];
  is_member?: boolean;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author_id: number;
  created_at: string;
  image_urls?: string[];
}

export default function CommunityContent({ isDarkTheme }: { isDarkTheme: boolean }) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postError, setPostError] = useState('');
  const [creatingPost, setCreatingPost] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null); // community id for which join/leave is loading
  const [fabOpen, setFabOpen] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDesc, setNewCommunityDesc] = useState('');
  const [creatingCommunity, setCreatingCommunity] = useState(false);
  const [communityError, setCommunityError] = useState('');

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setProfile(data);
      } catch {}
    };
    fetchProfile();
  }, []);

  // Fetch all communities and joined communities, then merge is_member
  useEffect(() => {
    const fetchCommunitiesAndJoined = async () => {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      try {
        const [allRes, joinedRes] = await Promise.all([
          fetch(`${API_BASE_URL}/communities`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/communities/joined`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        const allData = await allRes.json();
        const joinedData = await joinedRes.json();
        if (allRes.ok && joinedRes.ok) {
          const joinedIds = new Set(joinedData.map((c: Community) => c.id));
          const merged = allData.map((c: Community) => ({ ...c, is_member: joinedIds.has(c.id) }));
          setCommunities(merged);
          // If a community is selected, update its is_member status
          if (selectedCommunity) {
            const updated = merged.find((c: Community) => c.id === selectedCommunity.id);
            if (updated) setSelectedCommunity(updated);
          }
        }
      } catch {}
      setLoading(false);
    };
    fetchCommunitiesAndJoined();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch posts for selected community
  const fetchPosts = async (community: Community) => {
    setPostsLoading(true);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_BASE_URL}/communities/${community.id}/posts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setPosts(data);
      else setPosts([]);
    } catch {
      setPosts([]);
    }
    setPostsLoading(false);
  };

  // Handle join/leave
  const handleJoinLeave = async (community: Community, join: boolean) => {
    setActionLoading(community.id);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_BASE_URL}/communities/${community.id}/${join ? 'join' : 'leave'}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        // Update membership locally
        setCommunities(prev => prev.map(c => c.id === community.id ? { ...c, is_member: join } : c));
        if (selectedCommunity && selectedCommunity.id === community.id) {
          setSelectedCommunity({ ...selectedCommunity, is_member: join });
        }
      }
    } catch {}
    setActionLoading(null);
  };

  // Handle select community
  const handleSelectCommunity = async (community: Community) => {
    setSelectedCommunity(community);
    fetchPosts(community);
  };

  // Handle create post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError('');
    setCreatingPost(true);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_BASE_URL}/communities/${selectedCommunity?.id}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: postTitle, content: postContent, image_urls: [] })
      });
      const data = await res.json();
      if (res.ok) {
        setPosts([data, ...posts]);
        setPostTitle('');
        setPostContent('');
      } else {
        setPostError(data.error || 'Failed to create post');
      }
    } catch {
      setPostError('Network error');
    }
    setCreatingPost(false);
  };

  // Handle create community
  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommunityError('');
    setCreatingCommunity(true);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_BASE_URL}/communities`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          name: newCommunityName, 
          description: newCommunityDesc 
        })
      });
      const data = await res.json();
      if (res.ok) {
        // Add the new community to the list
        const newCommunity = data.community;
        setCommunities(prev => [newCommunity, ...prev]);
        setFabOpen(false);
        setNewCommunityName('');
        setNewCommunityDesc('');
      } else {
        setCommunityError(data.error || 'Failed to create community');
      }
    } catch {
      setCommunityError('Network error');
    }
    setCreatingCommunity(false);
  };

  // Render
  if (loading || !profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" color={isDarkTheme ? 'white' : 'black'} gutterBottom>Communities</Typography>
      <List>
        {communities.map(community => (
          <ListItem key={community.id} disablePadding>
            <ListItemButton
              selected={selectedCommunity?.id === community.id}
              onClick={() => handleSelectCommunity(community)}
            >
              <ListItemText
                primary={community.name}
                secondary={community.description}
              />
              <ListItemSecondaryAction>
                {community.is_member ? (
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    disabled={actionLoading === community.id}
                    onClick={e => { e.stopPropagation(); handleJoinLeave(community, false); }}
                  >
                    {actionLoading === community.id ? 'Leaving...' : 'Leave'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    disabled={actionLoading === community.id}
                    onClick={e => { e.stopPropagation(); handleJoinLeave(community, true); }}
                  >
                    {actionLoading === community.id ? 'Joining...' : 'Join'}
                  </Button>
                )}
              </ListItemSecondaryAction>
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {selectedCommunity && (
        <Box mt={4}>
          <Typography variant="h5" color={isDarkTheme ? 'white' : 'black'} gutterBottom>
            Posts in {selectedCommunity.name}
          </Typography>
          {selectedCommunity.is_member && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Create a Post</Typography>
                <form onSubmit={handleCreatePost}>
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
                  {postError && <Typography color="error">{postError}</Typography>}
                  <Button type="submit" variant="contained" color="primary" disabled={creatingPost} sx={{ mt: 1 }}>
                    {creatingPost ? 'Posting...' : 'Post'}
                  </Button>
                </form>
              </CardContent>
            </Card>
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
                  <Typography variant="body2" color="textSecondary">{post.content}</Typography>
                  <Typography variant="caption" color="textSecondary">By User {post.author_id} on {new Date(post.created_at).toLocaleString()}</Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}
      {/* FAB for creating a new community */}
      <FAB isDarkTheme={isDarkTheme} onClick={() => setFabOpen(true)} />
      <Dialog open={fabOpen} onClose={() => setFabOpen(false)}>
        <DialogTitle>Create Community</DialogTitle>
        <form onSubmit={handleCreateCommunity}>
          <DialogContent>
            <TextField
              label="Community Name"
              value={newCommunityName}
              onChange={e => setNewCommunityName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Description"
              value={newCommunityDesc}
              onChange={e => setNewCommunityDesc(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              minRows={2}
              required
            />
            {communityError && <Typography color="error" sx={{ mt: 1 }}>{communityError}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFabOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={creatingCommunity}>
              {creatingCommunity ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 