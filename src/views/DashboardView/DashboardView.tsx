import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Layout } from 'react-grid-layout';
import { DashboardViewProps } from './DashboardView.types';
import { DashboardGrid, DashboardGridItem } from '../../components/DashboardGrid';
import { AddGraphButton } from '../../components/AddGraphButton';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

export const DashboardView = ({ className }: DashboardViewProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const graphOptions = [
    { id: 'graph1', label: 'Graph 1' },
    { id: 'graph2', label: 'Graph 2' },
    { id: 'graph3', label: 'Graph 3' }
  ];

  // Example items
  const [gridItems, setGridItems] = useState<DashboardGridItem[]>([
    {
      id: 'item-1',
      title: 'Widget 1',
      content: (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography
            variant="h4"
            color="text.primary"
          >
            Box 1
          </Typography>
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

  const handleAddGraph = (graphId: string) => {
    const graphOption = graphOptions.find((opt) => opt.id === graphId);
    const newItemId = `item-${Date.now()}`;

    const newItem: DashboardGridItem = {
      id: newItemId,
      title: graphOption?.label || 'New Graph',
      content: (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography
            variant="h4"
            color="text.primary"
          >
            {graphOption?.label}
          </Typography>
        </Box>
      ),
      backgroundColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
      removable: true
    };

    setGridItems((prev) => [newItem, ...prev]);
    enqueueSnackbar(t('dashboard.graphAdded', { graphName: graphOption?.label }), { variant: 'success' });
  };

  return (
    <Box
      className={className}
      sx={sx.dashboardContainer}
    >
      <Box sx={sx.addButtonContainer}>
        <AddGraphButton
          options={graphOptions}
          onSelectGraph={handleAddGraph}
          buttonText={t('dashboard.addGraphButton')}
        />
      </Box>
      <Box sx={sx.gridContainer}>
        <DashboardGrid
          items={gridItems}
          onLayoutChange={handleLayoutChange}
          onRemoveItem={handleRemoveItem}
        />
      </Box>
    </Box>
  );
};

const sx = {
  dashboardContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  addButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '16px 16px 0 16px',
    flexShrink: 0
  },
  gridContainer: {
    flex: 1
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
