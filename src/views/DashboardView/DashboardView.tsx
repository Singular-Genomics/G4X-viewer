import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Layout } from 'react-grid-layout';
import { DashboardViewProps } from './DashboardView.types';
import { NAVIGATION_HEIGHT } from '../../components/Navigation/Navigation';
import { DashboardGrid, DashboardGridItem } from '../../components/DashboardGrid';
import { PieChart } from '../../components/DashboardGrid/PieChart';

export const DashboardView = ({ className }: DashboardViewProps) => {
  // Example items
  const [gridItems, setGridItems] = useState<DashboardGridItem[]>([
    {
      id: 'item-1',
      title: 'Widget 1',
      content: (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%'
          }}
        >
          <PieChart />
        </Box>
      ),
      backgroundColor: '#2d3748',
      removable: true
    },
    {
      id: 'item-2',
      title: 'Widget 2',
      content: (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography
            variant="h4"
            color="text.primary"
          >
            Box 2
          </Typography>
        </Box>
      ),
      backgroundColor: '#4a5568',
      removable: true
    },
    {
      id: 'item-3',
      title: 'Widget 3',
      content: (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography
            variant="h4"
            color="text.primary"
          >
            Box 3
          </Typography>
        </Box>
      ),
      backgroundColor: '#2b6cb0',
      removable: true
    },
    {
      id: 'item-4',
      title: 'Widget 4',
      content: (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography
            variant="h4"
            color="text.primary"
          >
            Box 4
          </Typography>
        </Box>
      ),
      backgroundColor: '#805ad5'
    }
  ]);

  const handleLayoutChange = (layout: Layout[]) => {
    console.log('Layout changed:', layout);
  };

  const handleRemoveItem = (itemId: string) => {
    setGridItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  return (
    <Box
      className={className}
      sx={sx.dashboardContainer}
    >
      <DashboardGrid
        items={gridItems}
        onLayoutChange={handleLayoutChange}
        onRemoveItem={handleRemoveItem}
      />
    </Box>
  );
};

const sx = {
  dashboardContainer: {
    marginTop: NAVIGATION_HEIGHT,
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    padding: '24px 24px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    flexShrink: 0
  },
  title: {
    fontWeight: 600,
    marginBottom: '4px'
  }
};
