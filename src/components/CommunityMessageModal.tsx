import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Paper,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import CommunityMembersModal from './CommunityMembersModal';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { CommunityChatService, CommunityMessage } from '../services/communityChatService';

interface CommunityMessageModalProps {
  open: boolean;
  onClose: () => void;
  communityId: number;
  communityName: string;
  isDarkTheme: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: string;
  senderAvatar?: string;
  timestamp: Date;
  isOwnMessage: boolean;
}

const CommunityMessageModal: React.FC<CommunityMessageModalProps> = ({
  open,
  onClose,
  communityId,
  communityName,
  isDarkTheme
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = CommunityChatService.getCurrentUserId();

  // Subscribe to real-time messages
  useEffect(() => {
    if (open && communityId) {
      // Initialize socket connection
      CommunityChatService.initializeSocket();
      
      // Join the community chat room
      CommunityChatService.joinCommunityRoom(communityId);
      
      // Subscribe to new messages
      const handleNewMessage = (newMessage: CommunityMessage) => {
        console.log('Handling new community message:', newMessage);
        
        // Don't add the message if it's from the current user (to avoid duplicates)
        if (newMessage.sender_id === currentUserId) {
          console.log('Skipping own message to avoid duplicate');
          return;
        }
        
        const formattedMessage: Message = {
          id: newMessage.id,
          text: newMessage.content,
          sender: newMessage.sender?.name || 'Unknown User',
          senderAvatar: newMessage.sender?.avatarUrl,
          timestamp: new Date(newMessage.createdAt),
          isOwnMessage: newMessage.sender_id === currentUserId
        };
        console.log('Formatted message:', formattedMessage);
        setMessages(prev => [...prev, formattedMessage]);
      };

      CommunityChatService.subscribeToCommunityMessages(handleNewMessage);

      // Cleanup on unmount
      return () => {
        CommunityChatService.unsubscribeFromCommunityMessages(handleNewMessage);
        CommunityChatService.leaveCommunityRoom(communityId);
      };
    }
  }, [open, communityId, currentUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load messages when modal opens
  useEffect(() => {
    if (open && communityId) {
      loadMessages();
    }
  }, [open, communityId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await CommunityChatService.getCommunityChatHistory(communityId);
      if (response.success && response.data) {
        const formattedMessages: Message[] = response.data.map(msg => ({
          id: msg.id,
          text: msg.content,
          sender: msg.sender?.name || 'Unknown User',
          senderAvatar: msg.sender?.avatarUrl,
          timestamp: new Date(msg.createdAt),
          isOwnMessage: msg.sender_id === currentUserId
        }));
        setMessages(formattedMessages);
      } else {
        setError(response.error || 'Failed to load messages');
      }
    } catch (error) {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() && !sending) {
      setSending(true);
      setError(null);
      
      try {
        const response = await CommunityChatService.sendCommunityMessage(communityId, message.trim());
        if (response.success && response.data) {
          const newMessage = response.data[0];
          const formattedMessage: Message = {
            id: newMessage.id,
            text: newMessage.content,
            sender: newMessage.sender?.name || 'You',
            senderAvatar: newMessage.sender?.avatarUrl,
            timestamp: new Date(newMessage.createdAt),
            isOwnMessage: newMessage.sender_id === currentUserId
          };
          setMessages(prev => [...prev, formattedMessage]);
          setMessage('');
          
          // Scroll to bottom after sending
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else {
          setError(response.error || 'Failed to send message');
        }
      } catch (error) {
        setError('Failed to send message');
      } finally {
        setSending(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMemberModalOpen = () => {
    setMemberModalOpen(true);
  };

  const handleMemberModalClose = () => {
    setMemberModalOpen(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: isDarkTheme ? '#1a1a1a' : '#ffffff',
        color: isDarkTheme ? '#ffffff' : '#000000',
        zIndex: 1300,
        display: open ? 'flex' : 'none',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          borderBottom: isDarkTheme 
            ? '1px solid rgba(255, 255, 255, 0.1)' 
            : '1px solid rgba(0, 0, 0, 0.1)',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: isDarkTheme ? '#1a1a1a' : '#ffffff'
        }}
      >
                 <Box display="flex" alignItems="center" gap={2}>
           <IconButton
             onClick={onClose}
             sx={{
               color: isDarkTheme ? '#d1d5db' : '#374151',
               '&:hover': {
                 bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
               }
             }}
           >
             <ArrowBackIcon />
           </IconButton>
           <Avatar
             sx={{
               bgcolor: isDarkTheme ? '#6366f1' : '#3b82f6',
               width: 40,
               height: 40
             }}
           >
             <PersonIcon />
           </Avatar>
           <Box>
             <Typography variant="h6" component="div">
               {communityName}
             </Typography>
             <Typography variant="body2" color="text.secondary">
               Community Chat
             </Typography>
           </Box>
         </Box>
         <IconButton
           onClick={handleMemberModalOpen}
           sx={{
             color: isDarkTheme ? '#d1d5db' : '#374151',
             '&:hover': {
               bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
             }
           }}
         >
           <PeopleIcon />
         </IconButton>
      </Box>

      {/* Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography color="text.secondary">
                No messages yet. Start the conversation!
              </Typography>
            </Box>
          ) : (
            messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.isOwnMessage ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: msg.isOwnMessage ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    gap: 1
                  }}
                >
                  {!msg.isOwnMessage && (
                    <Avatar
                      src={msg.senderAvatar}
                      sx={{ width: 32, height: 32 }}
                    >
                      <PersonIcon fontSize="small" />
                    </Avatar>
                  )}
                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor: msg.isOwnMessage 
                        ? (isDarkTheme ? '#6366f1' : '#3b82f6')
                        : (isDarkTheme ? '#374151' : '#f3f4f6'),
                      color: msg.isOwnMessage ? '#ffffff' : (isDarkTheme ? '#ffffff' : '#1f2937'),
                      borderRadius: 2,
                      maxWidth: '100%',
                      wordBreak: 'break-word'
                    }}
                  >
                    {!msg.isOwnMessage && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mb: 0.5,
                          fontWeight: 600,
                          color: msg.isOwnMessage ? 'rgba(255, 255, 255, 0.8)' : (isDarkTheme ? '#9ca3af' : '#6b7280')
                        }}
                      >
                        {msg.sender}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      {msg.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        color: msg.isOwnMessage ? 'rgba(255, 255, 255, 0.7)' : (isDarkTheme ? '#6b7280' : '#9ca3af'),
                        textAlign: msg.isOwnMessage ? 'right' : 'left'
                      }}
                    >
                      {formatTime(msg.timestamp)}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            ))
          )}
          
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box
          sx={{
            p: 3,
            pb: 12, // Increased bottom padding to account for bottom navigation
            borderTop: isDarkTheme 
              ? '1px solid rgba(255, 255, 255, 0.08)' 
              : '1px solid rgba(0, 0, 0, 0.08)',
            bgcolor: isDarkTheme ? '#1a1a1a' : '#ffffff',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: isDarkTheme
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, transparent 100%)'
                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.01) 0%, transparent 100%)',
              pointerEvents: 'none',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              variant="outlined"
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Attach file">
                        <IconButton size="small">
                          <AttachFileIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Add emoji">
                        <IconButton size="small">
                          <EmojiIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                                              <Tooltip title="Send message">
                        <span>
                          <IconButton
                            size="small"
                            onClick={handleSendMessage}
                            disabled={!message.trim() || sending}
                            sx={{
                              color: message.trim() && !sending ? (isDarkTheme ? '#6366f1' : '#3b82f6') : 'inherit'
                            }}
                          >
                            {sending ? <CircularProgress size={16} /> : <SendIcon fontSize="small" />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: isDarkTheme ? '#374151' : '#f9fafb',
                  '& fieldset': {
                    borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
                  },
                  '&:hover fieldset': {
                    borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isDarkTheme ? '#6366f1' : '#3b82f6'
                  }
                }
              }}
            />
          </Box>
                 </Box>
       </Box>
       
       {/* Community Members Modal */}
       <CommunityMembersModal
         open={memberModalOpen}
         onClose={handleMemberModalClose}
         communityId={1} // You might want to pass this as a prop
         communityName={communityName}
         isDarkTheme={isDarkTheme}
       />
     </Box>
   );
 };

export default CommunityMessageModal;
