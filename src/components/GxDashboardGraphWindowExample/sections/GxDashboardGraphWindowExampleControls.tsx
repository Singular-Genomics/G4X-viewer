import { Box } from '@mui/material';
import { ExampleMultiSelect } from './controls';

export const GxDashboardGraphWindowExampleControls = () => {
  return (
    <Box sx={sx.container}>
      <ExampleMultiSelect />
    </Box>
  );
};

const sx = {
  container: {
    display: 'flex',
    gap: 1
  }
};
