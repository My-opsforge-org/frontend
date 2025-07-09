import { Box, Typography } from '@mui/material';

export default function ExploreContent({ isDarkTheme }: { isDarkTheme: boolean }) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
      <Typography variant="h5" color={isDarkTheme ? 'white' : 'black'}>
        Explore Coming Soon
      </Typography>
    </Box>
  );
} 