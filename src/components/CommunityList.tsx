import { List, ListItem, ListItemButton, ListItemText, ListItemSecondaryAction, Button, IconButton, Tooltip, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MessageIcon from '@mui/icons-material/Message';
import React, { useState } from 'react';
import CommunityMessageModal from './CommunityMessageModal';

interface Community {
  id: number;
  name: string;
  description: string;
  is_member?: boolean;
}

interface CommunityListProps {
  communities: Community[];
  actionLoading: number | null;
  handleJoinLeave: (community: Community, join: boolean) => void;
  handleSelectCommunity: (community: Community) => void;
  handleViewMembers: (community: Community) => void;
  selectedCommunity: Community | null;
  isDarkTheme: boolean;
}

const CommunityList: React.FC<CommunityListProps> = ({
  communities,
  actionLoading,
  handleJoinLeave,
  handleSelectCommunity,
  handleViewMembers,
  selectedCommunity,
  isDarkTheme
}) => {
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedCommunityForMessage, setSelectedCommunityForMessage] = useState<Community | null>(null);

  const handleMessageClick = (community: Community) => {
    setSelectedCommunityForMessage(community);
    setMessageModalOpen(true);
  };

  const handleCloseMessageModal = () => {
    setMessageModalOpen(false);
    setSelectedCommunityForMessage(null);
  };

  return (
  <>
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
            <Box display="flex" alignItems="center" gap={1}>
              {community.is_member && (
                <Tooltip title="Message Community">
                  <IconButton
                    size="small"
                    onClick={e => { e.stopPropagation(); handleMessageClick(community); }}
                    sx={{
                      color: isDarkTheme ? '#d1d5db' : '#374151',
                      '&:hover': {
                        bgcolor: isDarkTheme ? 'rgba(99, 102, 241, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        transform: 'scale(1.05)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <MessageIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {community.is_member && (
                <Tooltip title="View Members">
                  <IconButton
                    size="small"
                    onClick={e => { e.stopPropagation(); handleViewMembers(community); }}
                    sx={{
                      color: isDarkTheme ? '#d1d5db' : '#374151',
                      '&:hover': {
                        bgcolor: isDarkTheme ? 'rgba(99, 102, 241, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        transform: 'scale(1.05)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <PeopleIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
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
            </Box>
          </ListItemSecondaryAction>
        </ListItemButton>
      </ListItem>
            ))}
      
      {/* Community Message Modal */}
      {selectedCommunityForMessage && (
        <CommunityMessageModal
          open={messageModalOpen}
          onClose={handleCloseMessageModal}
          communityName={selectedCommunityForMessage.name}
          isDarkTheme={isDarkTheme}
        />
      )}
  </>
  );
};

export default CommunityList; 