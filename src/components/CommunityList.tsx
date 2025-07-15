import { List, ListItem, ListItemButton, ListItemText, ListItemSecondaryAction, Button, Typography } from '@mui/material';
import React from 'react';

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
  selectedCommunity: Community | null;
  isDarkTheme: boolean;
}

const CommunityList: React.FC<CommunityListProps> = ({
  communities,
  actionLoading,
  handleJoinLeave,
  handleSelectCommunity,
  selectedCommunity,
  isDarkTheme
}) => (
  <>
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
  </>
);

export default CommunityList; 