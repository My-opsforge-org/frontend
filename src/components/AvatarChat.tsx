import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  CircularProgress,
  Alert,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { AvatarItem } from '../services/avatarService';
import { AvatarChatService } from '../services/avatarChatService';
import MessageBubble from './MessageBubble';
import { Message } from './ChatUtils';

interface AvatarChatProps {
  avatar: AvatarItem;
  isDarkTheme: boolean;
  onClose: () => void;
}

export default function AvatarChat({ avatar, isDarkTheme, onClose }: AvatarChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: `Hello! I'm ${avatar.name}. What would you like to discuss today?`,
      sender: 'avatar',
      timestamp: new Date(),
      isRead: true,
      type: 'text'
    };
    setMessages([welcomeMessage]);
  }, [avatar]);



  const generateAvatarResponse = async (userMessage: string): Promise<string> => {
    try {
      setError(null);
      
      // Call the real API
      const response = await AvatarChatService.sendMessageToCharacter(
        avatar.name,
        userMessage,
        conversationHistory
      );

      if (response.success && response.data) {
        // Update conversation history
        const newHistory = [
          ...conversationHistory,
          { role: 'user' as const, content: userMessage },
          { role: 'assistant' as const, content: response.data.characterResponse }
        ];
        setConversationHistory(newHistory);
        
        return response.data.characterResponse;
      } else {
        throw new Error('Failed to get character response');
      }
    } catch (error) {
      console.error('Error generating avatar response:', error);
      setError('Failed to get response from character. Please try again.');
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      isRead: true,
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const avatarResponse = await generateAvatarResponse(newMessage.trim());
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: avatarResponse,
        sender: 'avatar',
        timestamp: new Date(),
        isRead: true,
        type: 'text'
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      // Don't add error message to chat, just show it in UI
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Fade in={true} timeout={500}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
          background: isDarkTheme
            ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
          display: 'flex',
          flexDirection: 'column',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDarkTheme
              ? 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)'
              : 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)',
            pointerEvents: 'none',
          }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            background: isDarkTheme
              ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 15, 35, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            borderBottom: isDarkTheme
              ? '1px solid rgba(255, 255, 255, 0.12)'
              : '1px solid rgba(99, 102, 241, 0.15)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={onClose}
              sx={{
                color: isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)',
                '&:hover': {
                  color: isDarkTheme ? 'white' : '#6366f1',
                  background: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Avatar
              src={avatar.image_url}
              alt={avatar.name}
              sx={{
                width: 50,
                height: 50,
                border: isDarkTheme
                  ? '3px solid rgba(99, 102, 241, 0.6)'
                  : '3px solid rgba(99, 102, 241, 0.4)',
                boxShadow: isDarkTheme
                  ? '0 8px 24px rgba(99, 102, 241, 0.3), 0 4px 12px rgba(0,0,0,0.4)'
                  : '0 8px 24px rgba(99, 102, 241, 0.25), 0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: isDarkTheme ? 'rgba(255, 255, 255, 0.98)' : 'rgba(31, 41, 55, 0.98)',
                  fontSize: '1.25rem',
                }}
              >
                {avatar.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
                  fontSize: '0.875rem',
                }}
              >
                Inspiring Figure
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)',
              '&:hover': {
                color: isDarkTheme ? 'white' : '#ef4444',
                background: isDarkTheme ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {messages.map((message) => (
              <Zoom in={true} key={message.id}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <MessageBubble
                    message={message}
                    isOwnMessage={message.sender === 'user'}
                    isDarkTheme={isDarkTheme}
                  />
                </Box>
              </Zoom>
            ))}
            

            
            {error && (
              <Zoom in={true}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Alert 
                    severity="error" 
                    sx={{ 
                      maxWidth: '80%',
                      background: isDarkTheme ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                      border: isDarkTheme ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(239, 68, 68, 0.15)',
                    }}
                  >
                    {error}
                  </Alert>
                </Box>
              </Zoom>
            )}
            
            <div ref={messagesEndRef} />
          </Box>
        </Box>

                 {/* Input Area */}
         <Box
           sx={{
             p: 3,
             pb: 11, // Add bottom padding to account for bottom navigation
             background: isDarkTheme
               ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 15, 35, 0.98) 100%)'
               : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)',
             backdropFilter: 'blur(20px)',
             borderTop: isDarkTheme
               ? '1px solid rgba(255, 255, 255, 0.12)'
               : '1px solid rgba(99, 102, 241, 0.15)',
             position: 'relative',
             zIndex: 1,
           }}
         >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: isDarkTheme
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(99, 102, 241, 0.05)',
              borderRadius: 3,
              p: 1,
              border: isDarkTheme
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(99, 102, 241, 0.2)',
            }}
          >
            <TextField
              ref={inputRef}
              fullWidth
              multiline
              maxRows={4}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Chat with ${avatar.name}...`}
              disabled={isLoading}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                sx: {
                  color: isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(31, 41, 55, 0.9)',
                  fontSize: '1rem',
                  '& .MuiInputBase-input': {
                    padding: '12px 16px',
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(31, 41, 55, 0.5)',
                    opacity: 1,
                  },
                },
              }}
            />
            <Tooltip title="Send message">
              <IconButton
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isLoading}
                sx={{
                  color: newMessage.trim() && !isLoading
                    ? (isDarkTheme ? '#6366f1' : '#6366f1')
                    : (isDarkTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(31, 41, 55, 0.3)'),
                  '&:hover': {
                    background: isDarkTheme ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                  },
                  '&:disabled': {
                    color: isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(31, 41, 55, 0.2)',
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Fade>
  );
} 