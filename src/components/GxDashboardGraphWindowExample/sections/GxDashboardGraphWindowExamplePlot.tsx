import { Box, Typography } from '@mui/material';

export const GxDashboardGraphWindowExamplePlot = () => {
  return (
    <Box sx={sx.container}>
      <Typography
        variant="h4"
        color="text.primary"
      >
        Example Chart
      </Typography>
    </Box>
  );
};

const sx = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  }
};
