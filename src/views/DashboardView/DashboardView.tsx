import { Box, Typography } from '@mui/material';
import { DashboardViewProps } from './DashboardView.types';
import { NAVIGATION_HEIGHT } from '../../components/Navigation/Navigation';

export const DashboardView = ({ className }: DashboardViewProps) => {
  return (
    <Box
      className={className}
      sx={sx.dashboardContainer}
    >
      <Typography variant="h1">Dashboard</Typography>
    </Box>
  );
};

const sx = {
  dashboardContainer: {
    marginTop: NAVIGATION_HEIGHT,
    height: '100%',
    width: '100%'
  }
};
