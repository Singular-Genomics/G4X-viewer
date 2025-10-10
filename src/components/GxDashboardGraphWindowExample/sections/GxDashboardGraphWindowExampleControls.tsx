import { Box, Typography } from '@mui/material';

export const GxDashboardGraphWindowExampleControls = () => {
  return (
    <Box sx={sx.container}>
      <Typography variant="body2">Controls</Typography>
    </Box>
  );
};

const sx = {
  container: {
    display: 'flex',
    gap: 1
  }
};
