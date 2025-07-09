import { Box, Typography } from '@mui/material';

export default function PeopleContent({ isDarkTheme }: { isDarkTheme: boolean }) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
      <Typography variant="h5" color={isDarkTheme ? 'white' : 'black'}>
        People Coming Soon
      </Typography>
    </Box>
  );
} 