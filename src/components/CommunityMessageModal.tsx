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
  CircularProgress
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

interface CommunityMessageModalProps {
  open: boolean;
  onClose: () => void;
  communityName: string;
  isDarkTheme: boolean;
}

interface Message {
  id: number;
  text: string;
  sender: string;
  senderAvatar?: string;
  timestamp: Date;
  isOwnMessage: boolean;
}

const CommunityMessageModal: React.FC<CommunityMessageModalProps> = ({
  open,
  onClose,
  communityName,
  isDarkTheme
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hey everyone! Welcome to the community! 👋",
      sender: "Sarah Johnson",
      senderAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      timestamp: new Date(Date.now() - 3600000),
      isOwnMessage: false
    },
    {
      id: 2,
      text: "Thanks Sarah! Excited to be here!",
      sender: "Mike Chen",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      timestamp: new Date(Date.now() - 3000000),
      isOwnMessage: false
    },
    {
      id: 3,
      text: "Anyone up for a weekend trip?",
      sender: "You",
      timestamp: new Date(Date.now() - 1800000),
      isOwnMessage: true
    },
    {
      id: 4,
      text: "I'm definitely interested! Where are you thinking?",
      sender: "Emma Davis",
      senderAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      timestamp: new Date(Date.now() - 900000),
      isOwnMessage: false
    },
    {
      id: 5,
      text: "Maybe we could go hiking? The weather looks great!",
      sender: "Alex Rodriguez",
      senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      timestamp: new Date(Date.now() - 300000),
      isOwnMessage: false
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: message.trim(),
        sender: "You",
        timestamp: new Date(),
        isOwnMessage: true
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Simulate someone typing and responding
      setIsTyping(true);
      setTimeout(() => {
        const responses = [
          "That sounds great! 👍",
          "I'm in! When are we leaving?",
          "Perfect timing!",
          "Can't wait for this trip!",
          "This is going to be amazing!"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const responseMessage: Message = {
          id: messages.length + 2,
          text: randomResponse,
          sender: "Community Member",
          senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
          timestamp: new Date(),
          isOwnMessage: false
        };
        setMessages(prev => [...prev, responseMessage]);
        setIsTyping(false);
      }, 2000);
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
          {messages.map((msg) => (
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
          ))}
          
          {isTyping && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
                <Paper
                  sx={{
                    p: 1.5,
                    bgcolor: isDarkTheme ? '#374151' : '#f3f4f6',
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CircularProgress size={12} />
                    <Typography variant="body2" color="text.secondary">
                      typing...
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box
          sx={{
            p: 2,
            borderTop: isDarkTheme 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(0, 0, 0, 0.1)',
            bgcolor: isDarkTheme ? '#1a1a1a' : '#ffffff'
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
                        <IconButton
                          size="small"
                          onClick={handleSendMessage}
                          disabled={!message.trim()}
                          sx={{
                            color: message.trim() ? (isDarkTheme ? '#6366f1' : '#3b82f6') : 'inherit'
                          }}
                        >
                          <SendIcon fontSize="small" />
                        </IconButton>
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
