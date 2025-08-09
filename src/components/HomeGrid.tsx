import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
  Paper,
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { API_BASE_URL } from '../api';
import { AvatarService, AvatarItem } from '../services/avatarService';

type HomeGridProps = {
  isDarkTheme: boolean;
  setActiveTab: (tab: string) => void;
  layout?: 'standalone' | 'sidebar';
};

type ExtendedUser = {
  id: number;
  name?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  is_following?: boolean;
};

type Community = {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  is_member?: boolean;
};

export default function HomeGrid({ isDarkTheme, setActiveTab, layout = 'standalone' }: HomeGridProps) {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [avatars, setAvatars] = useState<AvatarItem[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingAvatars, setLoadingAvatars] = useState(true);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [followLoading, setFollowLoading] = useState<{ [userId: number]: boolean }>({});
  const [communityActionLoading, setCommunityActionLoading] = useState<{ [communityId: number]: boolean }>({});

  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/users?per_page=1000`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.users)) setUsers(data.users);
        else setUsers([]);
      } catch {
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    const loadAvatars = async () => {
      setLoadingAvatars(true);
      try {
        const res = await AvatarService.getAvatars();
        if (res.success) setAvatars(res.data);
        else setAvatars([]);
      } catch {
        setAvatars([]);
      } finally {
        setLoadingAvatars(false);
      }
    };

    const loadCommunities = async () => {
      setLoadingCommunities(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        const [allRes, joinedRes] = await Promise.all([
          fetch(`${API_BASE_URL}/communities`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/communities/joined`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (allRes.ok && joinedRes.ok) {
          const all = await allRes.json();
          const joined = await joinedRes.json();
          const joinedIds = new Set((joined || []).map((c: Community) => c.id));
          const merged = (all || []).map((c: Community) => ({ ...c, is_member: joinedIds.has(c.id) }));
          setCommunities(merged);
        } else {
          setCommunities([]);
        }
      } catch {
        setCommunities([]);
      } finally {
        setLoadingCommunities(false);
      }
    };

    // Load all in parallel
    loadUsers();
    loadAvatars();
    loadCommunities();
  }, []);

  const handleFollow = async (userId: number) => {
    setFollowLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/users/${userId}/follow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_following: true } : u)));
      }
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnfollow = async (userId: number) => {
    setFollowLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/users/${userId}/unfollow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_following: false } : u)));
      }
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleJoinLeave = async (community: Community, join: boolean) => {
    setCommunityActionLoading((prev) => ({ ...prev, [community.id]: true }));
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/communities/${community.id}/${join ? 'join' : 'leave'}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCommunities((prev) => prev.map((c) => (c.id === community.id ? { ...c, is_member: join } : c)));
      }
    } finally {
      setCommunityActionLoading((prev) => ({ ...prev, [community.id]: false }));
    }
  };

  const SectionHeader = ({ title, onViewAll }: { title: string; onViewAll: () => void }) => (
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5} px={0.5}>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 800,
          letterSpacing: 0.3,
          textTransform: 'uppercase',
          color: isDarkTheme ? 'rgba(255,255,255,0.7)' : 'rgba(31,41,55,0.7)'
        }}
      >
        {title}
      </Typography>
      <Button
        size="small"
        endIcon={<ArrowForwardIcon />}
        onClick={onViewAll}
        sx={{ fontWeight: 700, color: '#6366f1', px: 1 }}
      >
        View all
      </Button>
    </Box>
  );

  const Grid = ({ children }: { children: React.ReactNode }) => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: layout === 'sidebar' ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
          sm: layout === 'sidebar' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          md: layout === 'sidebar' ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          lg: layout === 'sidebar' ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)',
        },
        gap: layout === 'sidebar' ? { xs: 1, md: 1.5, lg: 2 } : 1.5,
      }}
    >
      {children}
    </Box>
  );

  const ShellCard = () => (
    <Card
      sx={{
        borderRadius: 2,
        p: 1,
        background: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
        border: isDarkTheme ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <Box className="loading-shimmer" sx={{ height: 80, borderRadius: 2, mb: 1 }} />
      <Box className="loading-shimmer" sx={{ height: 10, width: '70%', borderRadius: 1 }} />
    </Card>
  );

  const SectionCard = ({ children }: { children: React.ReactNode }) => (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 3,
        background: isDarkTheme 
          ? 'linear-gradient(135deg, rgba(26,26,46,0.8) 0%, rgba(30,30,60,0.9) 50%, rgba(26,26,46,0.8) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 50%, rgba(255,255,255,0.95) 100%)',
        border: isDarkTheme ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(20px)',
        boxShadow: isDarkTheme 
          ? '0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)'
          : '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.7)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDarkTheme
            ? 'linear-gradient(45deg, rgba(99, 102, 241, 0.05) 0%, transparent 50%, rgba(168, 85, 247, 0.05) 100%)'
            : 'linear-gradient(45deg, rgba(99, 102, 241, 0.02) 0%, transparent 50%, rgba(168, 85, 247, 0.02) 100%)',
          opacity: 0.5,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
        },
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: isDarkTheme 
            ? '0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)'
            : '0 8px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.85)',
          '&::before': {
            opacity: 0.7,
          }
        }
      }}
    >
      {children}
    </Paper>
  );

  return (
    <Box sx={{
      px: layout === 'sidebar' ? 1 : 2,
      pt: layout === 'sidebar' ? 1 : 2,
      pb: layout === 'sidebar' ? 8 : 12,
      maxWidth: layout === 'sidebar' ? 'none' : 1200,
      mx: layout === 'sidebar' ? 0 : 'auto'
    }}>
      {/* Companions */}
      <SectionCard>
        <SectionHeader title="Companions" onViewAll={() => setActiveTab('avatars')} />
        {loadingAvatars ? (
          <Grid>
            {Array.from({ length: 6 }).map((_, i) => (
              <ShellCard key={`a-skel-${i}`} />
            ))}
          </Grid>
        ) : (
          <Grid>
            {avatars.slice(0, 6).map((a, idx) => (
              <Card
                key={`${a.name}-${idx}`}
                sx={{
                  borderRadius: 3,
                  background: isDarkTheme ? 'rgba(26,26,46,0.9)' : '#ffffff',
                  border: isDarkTheme ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: isDarkTheme ? '0 2px 10px rgba(0,0,0,0.15)' : '0 2px 10px rgba(0,0,0,0.06)',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: isDarkTheme ? '0 8px 24px rgba(0,0,0,0.25)' : '0 8px 24px rgba(0,0,0,0.12)' },
                }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, py: 1.25 }}>
                  <Box sx={{ p: 0.4, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    <Avatar src={a.image_url} sx={{ width: 44, height: 44, border: '2px solid', borderColor: isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(99,102,241,0.25)' }} />
                  </Box>
                  <Typography variant="body2" noWrap title={a.name} sx={{ fontWeight: 700, textAlign: 'center', width: '100%', fontSize: '0.85rem' }}>
                    {a.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap title={a.quote} sx={{ textAlign: 'center', width: '100%', fontSize: '0.72rem' }}>
                    {a.quote}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 1, pt: 0 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      localStorage.setItem('startAvatarChatName', a.name);
                      setActiveTab('avatars');
                    }}
                  >
                    Chat
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Grid>
        )}
      </SectionCard>

      {/* People Suggestions */}
      <SectionCard>
        <SectionHeader
          title="People"
          onViewAll={() => {
            localStorage.setItem('searchClicked', 'true');
            setActiveTab('connect');
          }}
        />
        {loadingUsers ? (
          <Grid>
            {Array.from({ length: 6 }).map((_, i) => (
              <ShellCard key={`u-skel-${i}`} />
            ))}
          </Grid>
        ) : (
          <Grid>
            {users.slice(0, 6).map((user) => (
              <Card
                key={user.id}
                sx={{
                  borderRadius: 4,
                  background: isDarkTheme
                    ? 'linear-gradient(135deg, rgba(26,26,46,0.95) 0%, rgba(30,30,60,0.98) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.99) 100%)',
                  border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                  backdropFilter: 'blur(15px)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isDarkTheme
                    ? '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
                    : '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1) 0%, transparent 50%, rgba(168, 85, 247, 0.1) 100%)',
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                    pointerEvents: 'none',
                  },
                  '&:hover': {
                    transform: 'translateY(-6px) scale(1.02)',
                    boxShadow: isDarkTheme
                      ? '0 12px 40px rgba(0,0,0,0.3), 0 4px 16px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                      : '0 12px 40px rgba(0,0,0,0.15), 0 4px 16px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255,255,255,1)',
                    borderColor: isDarkTheme ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)',
                    '&::before': {
                      opacity: 1,
                    }
                  },
                }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, position: 'relative', zIndex: 1, py: 1.25 }}>
                  <Box sx={{
                    position: 'relative',
                    p: 0.4,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    transition: 'all 0.3s ease',
                    animation: 'float 3s ease-in-out infinite',
                    '@keyframes float': {
                      '0%, 100%': { transform: 'translateY(0px)' },
                      '50%': { transform: 'translateY(-4px)' },
                    },
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -4,
                      left: -4,
                      right: -4,
                      bottom: -4,
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899, #6366f1)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      animation: 'spin 4s linear infinite',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    },
                    '&:hover::before': {
                      opacity: 0.7,
                    }
                  }}>
                    <Avatar
                      src={user.avatarUrl}
                      sx={{
                        width: 44,
                        height: 44,
                        border: '2px solid',
                        borderColor: isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(99,102,241,0.25)',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    >
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                  </Box>
                  <Typography variant="body2" noWrap title={user.name || user.email} sx={{ fontWeight: 700, textAlign: 'center', width: '100%', fontSize: '0.85rem' }}>
                    {user.name || user.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap title={user.bio || 'No bio available'} sx={{ textAlign: 'center', width: '100%', fontSize: '0.72rem' }}>
                    {user.bio || 'No bio available'}
                  </Typography>
                </CardContent>
                <CardActions
                  sx={{
                    justifyContent: 'center',
                    pb: 1,
                    pt: 0,
                    gap: 0.75,
                    flexWrap: 'wrap',
                    width: '100%'
                  }}
                >
                  <Button
                    size="small"
                    variant={user.is_following ? 'outlined' : 'contained'}
                    color={user.is_following ? 'error' : 'secondary'}
                    startIcon={followLoading[user.id] ? <CircularProgress size={16} /> : user.is_following ? <PersonRemoveIcon /> : <PersonAddIcon />}
                    onClick={() => (user.is_following ? handleUnfollow(user.id) : handleFollow(user.id))}
                    disabled={followLoading[user.id]}
                    sx={{
                      minWidth: 0,
                      px: 1,
                      flexBasis: { xs: '100%', sm: 'auto' },
                      flexGrow: { xs: 1, sm: 0 },
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {user.is_following ? 'Unfollow' : 'Follow'}
                  </Button>
                  <Tooltip title="Message">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => {
                        localStorage.setItem('searchClicked', 'true');
                        setActiveTab('connect');
                      }}
                      sx={{ width: 32, height: 32 }}
                    >
                      <ChatBubbleOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            ))}
          </Grid>
        )}
      </SectionCard>

      {/* Communities */}
      <SectionCard>
        <SectionHeader title="Communities" onViewAll={() => setActiveTab('community')} />
        {loadingCommunities ? (
          <Grid>
            {Array.from({ length: 6 }).map((_, i) => (
              <ShellCard key={`c-skel-${i}`} />
            ))}
          </Grid>
        ) : (
          <Grid>
            {communities.slice(0, 6).map((c) => (
            <Card
              key={c.id}
              sx={{
                borderRadius: 3,
                background: isDarkTheme ? 'rgba(26,26,46,0.9)' : '#ffffff',
                border: isDarkTheme ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: isDarkTheme ? '0 2px 10px rgba(0,0,0,0.15)' : '0 2px 10px rgba(0,0,0,0.06)',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: isDarkTheme ? '0 8px 24px rgba(0,0,0,0.25)' : '0 8px 24px rgba(0,0,0,0.12)' },
              }}
            >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, py: 1.25 }}>
                <Box sx={{ p: 0.5, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <Avatar 
                    src={c.image_url}
                    sx={{ 
                      width: 44, 
                      height: 44, 
                      mb: 0, 
                      bgcolor: '#6366f1', 
                      border: '2px solid', 
                      borderColor: isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(99,102,241,0.25)' 
                    }}
                  >
                    {c.image_url ? null : <GroupsIcon />}
                  </Avatar>
                </Box>
                  <Typography variant="body2" noWrap title={c.name} sx={{ fontWeight: 700, textAlign: 'center', width: '100%', fontSize: '0.85rem' }}>
                  {c.name}
                </Typography>
                {c.description && (
                    <Typography variant="caption" color="text.secondary" noWrap title={c.description} sx={{ textAlign: 'center', width: '100%', fontSize: '0.72rem' }}>
                    {c.description}
                  </Typography>
                )}
                {c.is_member && (
                    <Chip label="Member" size="small" sx={{ mt: 0.25, fontWeight: 600 }} />
                )}
              </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 1, pt: 0 }}>
                <Button
                  size="small"
                  variant={c.is_member ? 'outlined' : 'contained'}
                  color={c.is_member ? 'inherit' : 'primary'}
                  onClick={() => handleJoinLeave(c, !c.is_member)}
                  disabled={communityActionLoading[c.id]}
                >
                  {communityActionLoading[c.id] ? (
                      <CircularProgress size={16} />
                  ) : c.is_member ? (
                    'Leave'
                  ) : (
                    'Join'
                  )}
                </Button>
              </CardActions>
            </Card>
          ))}
          </Grid>
        )}
      </SectionCard>
    </Box>
  );
}


