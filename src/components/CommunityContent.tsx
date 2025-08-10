import { Box, Typography, Button, CircularProgress, TextField, Paper, List, Snackbar, Alert } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../api';
import FAB from './FAB';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useNavigate } from 'react-router-dom';
import CommunityList from './CommunityList';
import CommunityPosts from './CommunityPosts';
import CommunityMembersModal from './CommunityMembersModal';
import { postEventManager } from '../utils/postEvents';

interface Community {
  id: number;
  name: string;
  description: string;
  members_details?: any[];
  is_member?: boolean;
  image_url?: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author_id: number;
  created_at: string;
  image_urls?: string[];
}

export default function CommunityContent({ isDarkTheme, searchQuery }: { isDarkTheme: boolean; searchQuery?: string }) {
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
  const [postImages, setPostImages] = useState(''); // comma-separated URLs
  const [actionLoading, setActionLoading] = useState<number | null>(null); // community id for which join/leave is loading
  const [communityModalOpen, setCommunityModalOpen] = useState(false);
  const [openMembersModal, setOpenMembersModal] = useState(false);
  const [selectedCommunityForMembers, setSelectedCommunityForMembers] = useState<Community | null>(null);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDesc, setNewCommunityDesc] = useState('');
  const [newCommunityImage, setNewCommunityImage] = useState('');
  const [creatingCommunity, setCreatingCommunity] = useState(false);
  const [communityError, setCommunityError] = useState('');
  const [editingCommunityId, setEditingCommunityId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login', { replace: true });
          return;
        }
        const data = await res.json();
        if (res.ok) setProfile(data);
      } catch {}
    };
    fetchProfile();
  }, [navigate]);

  // Fetch all communities and joined communities, then merge is_member
  useEffect(() => {
    const fetchCommunitiesAndJoined = async () => {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }
      try {
        const [allRes, joinedRes] = await Promise.all([
          fetch(`${API_BASE_URL}/communities`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/communities/joined`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        if (allRes.status === 401 || joinedRes.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login', { replace: true });
          return;
        }
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

  // Prefill community image with Picsum when opening create dialog
  useEffect(() => {
    if (communityModalOpen && !editingCommunityId && !newCommunityImage) {
      const seed = Math.floor(Math.random() * 100000);
      setNewCommunityImage(`https://picsum.photos/seed/new-community-${seed}/256`);
    }
  }, [communityModalOpen, editingCommunityId, newCommunityImage]);

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

  // Handle edit/delete events coming from CommunityPosts menu
  React.useEffect(() => {
    const handleEdit = (e: any) => {
      const { id, name, description, image_url } = e.detail || {};
      setNewCommunityName(name || '');
      setNewCommunityDesc(description || '');
      setNewCommunityImage(image_url || '');
      setEditingCommunityId(id || null);
      setCommunityModalOpen(true);
    };
    const handleDelete = async (e: any) => {
      const { id } = e.detail || {};
      if (!id) return;
      const token = localStorage.getItem('access_token');
      try {
        const res = await fetch(`${API_BASE_URL}/communities/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          // Remove from list
          setCommunities(prev => prev.filter(c => c.id !== id));
          if (selectedCommunity && selectedCommunity.id === id) {
            setSelectedCommunity(null);
          }
          if (editingCommunityId === id) {
            setEditingCommunityId(null);
            setCommunityModalOpen(false);
          }
          setSnackbar({ open: true, message: 'Community deleted', severity: 'success' });
        } else {
          const data = await res.json().catch(() => ({}));
          setSnackbar({ open: true, message: data.error || 'Failed to delete community', severity: 'error' });
        }
      } catch {}
    };
    window.addEventListener('community:requestEdit', handleEdit as any);
    window.addEventListener('community:requestDelete', handleDelete as any);
    return () => {
      window.removeEventListener('community:requestEdit', handleEdit as any);
      window.removeEventListener('community:requestDelete', handleDelete as any);
    };
  }, [selectedCommunity, editingCommunityId]);

  // Handle view members
  const handleViewMembers = (community: Community) => {
    setSelectedCommunityForMembers(community);
    setOpenMembersModal(true);
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
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
          image_urls: postImages
            .split(',')
            .map(url => url.trim())
            .filter(url => url.length > 0)
        })
      });
      const data = await res.json();
      if (res.ok) {
        // Create a properly formatted post object with correct image structure
        const newPost = {
          ...data,
          images: Array.isArray(data.images) 
            ? data.images 
            : (data.image_urls || []).map((url: string) => ({ url })),
          // Ensure we have the author information
          author: {
            name: data.author?.name || 'You',
            avatarUrl: data.author?.avatarUrl,
            id: data.author?.id || data.author_id
          }
        };
        
        // Debug logging to see what's being created
        console.log('Created new community post:', newPost);
        console.log('Post images:', newPost.images);
        
        setPosts([newPost, ...posts]);
        setPostTitle('');
        setPostContent('');
        setPostImages('');
        
        // Emit event to notify other components (like HomeContent) about the new post
        // This ensures the home feed refreshes and shows the new post with images immediately
        postEventManager.emitPostCreated({
          post: newPost,
          source: 'community'
        });
      } else {
        setPostError(data.error || 'Failed to create post');
      }
    } catch {
      setPostError('Network error');
    }
    setCreatingPost(false);
  };

  // Handle create or update community
  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommunityError('');
    setCreatingCommunity(true);
    const token = localStorage.getItem('access_token');
    try {
      const isEditing = !!editingCommunityId;
      const url = isEditing ? `${API_BASE_URL}/communities/${editingCommunityId}` : `${API_BASE_URL}/communities`;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          name: newCommunityName, 
          description: newCommunityDesc,
          image_url: newCommunityImage
        })
      });
      const data = await res.json();
      if (res.ok) {
        if (method === 'POST') {
          const newCommunity = { ...data.community, image_url: newCommunityImage };
          setCommunities(prev => [newCommunity, ...prev]);
        } else {
          // Update existing in list
          const updated = data.community || { id: editingCommunityId, name: newCommunityName, description: newCommunityDesc, image_url: newCommunityImage };
          setCommunities(prev => prev.map(c => c.id === editingCommunityId ? { ...c, ...updated } : c));
          if (selectedCommunity && selectedCommunity.id === editingCommunityId) {
            setSelectedCommunity({ ...selectedCommunity, ...updated });
          }
        }
        setCommunityModalOpen(false);
        setNewCommunityName('');
        setNewCommunityDesc('');
        setNewCommunityImage('');
        setEditingCommunityId(null);
      } else {
        setCommunityError(data.error || 'Failed to create community');
      }
    } catch {
      setCommunityError('Network error');
    }
    setCreatingCommunity(false);
  };

  // Filter communities based on search query from header
  const filteredCommunities = communities.filter(community =>
    !searchQuery || community.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render
  if (loading || !profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" justifyContent="flex-start" width="100%" height="100%" minHeight="100vh" bgcolor={isDarkTheme ? '#222' : '#fafafa'} sx={{ pb: '100px' }}>
      {!selectedCommunity ? (
        <>
          {/* Header */}
          <Box
            sx={{
              py: 1.5,
              px: 2,
              background: isDarkTheme
                ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.6) 0%, rgba(15, 15, 35, 0.7) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(248, 250, 252, 0.8) 100%)',
              backdropFilter: 'blur(10px)',
              borderBottom: isDarkTheme
                ? '1px solid rgba(255, 255, 255, 0.08)'
                : '1px solid rgba(99, 102, 241, 0.08)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: isDarkTheme
                  ? 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)'
                  : 'radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.03) 0%, transparent 50%)',
                pointerEvents: 'none',
              }
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                letterSpacing: 0.3,
                color: isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(31, 41, 55, 0.9)',
                textAlign: 'left',
                position: 'relative',
                zIndex: 1,
                fontSize: '1.1rem'
              }}
            >
              Communities
            </Typography>
          </Box>
          <Paper sx={{ width: '100%', height: '100%', flex: 1, display: 'flex', flexDirection: 'column', p: 0, m: 0, boxShadow: 'none', borderRadius: 0 }}>
            <List sx={{ width: '100%', flex: 1, overflow: 'auto', p: 0, paddingBottom: '100px' }}>
              {filteredCommunities.length === 0 ? (
                <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                  {searchQuery ? `No communities found matching "${searchQuery}".` : 'No communities found.'}
                </Typography>
              ) : (
                <CommunityList
                  communities={filteredCommunities}
                  actionLoading={actionLoading}
                  handleJoinLeave={handleJoinLeave}
                  handleSelectCommunity={handleSelectCommunity}
                  handleViewMembers={handleViewMembers}
                  selectedCommunity={selectedCommunity}
                  isDarkTheme={isDarkTheme}
                />
              )}
            </List>
          </Paper>
        </>
      ) : (
        <CommunityPosts
          selectedCommunity={selectedCommunity}
          posts={posts}
          postsLoading={postsLoading}
          postTitle={postTitle}
          postContent={postContent}
          postError={postError}
          creatingPost={creatingPost}
          handleCreatePost={handleCreatePost}
          setPostTitle={setPostTitle}
          setPostContent={setPostContent}
          isDarkTheme={isDarkTheme}
          onBack={() => setSelectedCommunity(null)}
          postImages={postImages}
          setPostImages={setPostImages}
          onPostDeleted={(postId: number) => setPosts(prev => prev.filter(p => p.id !== postId))}
        />
      )}
      {/* FAB for creating a new community */}
      {!selectedCommunity && (
        <FAB 
          isDarkTheme={isDarkTheme} 
          onClick={() => {
            setEditingCommunityId(null);
            setNewCommunityName('');
            setNewCommunityDesc('');
            setNewCommunityImage('');
            setCommunityModalOpen(true);
          }} 
        />
      )}
      
      {/* Community Members Modal */}
      {selectedCommunityForMembers && (
        <CommunityMembersModal
          open={openMembersModal}
          onClose={() => {
            setOpenMembersModal(false);
            setSelectedCommunityForMembers(null);
          }}
          communityId={selectedCommunityForMembers.id}
          communityName={selectedCommunityForMembers.name}
          isDarkTheme={isDarkTheme}
        />
      )}
      
      <Dialog open={communityModalOpen} onClose={() => { setCommunityModalOpen(false); setEditingCommunityId(null); }}>
        <DialogTitle>{editingCommunityId ? 'Edit Community' : 'Create Community'}</DialogTitle>
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
            <TextField
              label="Image URL"
              value={newCommunityImage}
              onChange={e => setNewCommunityImage(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="https://picsum.photos/seed/your-seed/256"
            />
            {communityError && <Typography color="error" sx={{ mt: 1 }}>{communityError}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setCommunityModalOpen(false); setEditingCommunityId(null); }}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={creatingCommunity}>
              {creatingCommunity ? (editingCommunityId ? 'Saving...' : 'Creating...') : (editingCommunityId ? 'Save' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 