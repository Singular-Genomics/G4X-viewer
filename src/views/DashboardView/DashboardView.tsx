import { useState } from 'react';
import { alpha, Box, SxProps, Theme, useTheme } from '@mui/material';
import { Layout } from 'react-grid-layout';
import { DashboardGrid, DashboardGridItem } from '../../components/DashboardGrid';
import { AddGraphButton } from '../../components/AddGraphButton';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

export const DashboardView = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const graphOptions: { id: string; label: string }[] = [];
  const [gridItems, setGridItems] = useState<DashboardGridItem[]>([]);

  const handleLayoutChange = (layout: Layout[]) => {
    console.log('Layout changed:', layout);
  };

  const handleRemoveItem = (itemId: string) => {
    setGridItems((prev) => prev.filter((item) => item.props.id !== itemId));
  };

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddGraph = (graphId: string) => {
    const graphOption = graphOptions.find((opt) => opt.id === graphId);
    // const newItemId = `item-${Date.now()}`;

    // setGridItems((prev) => [newItem, ...prev]);
    enqueueSnackbar(t('dashboard.graphAdded', { graphName: graphOption?.label }), { variant: 'success' });
  };

  return (
    <Box sx={sx.dashboardContainer}>
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

const styles = (theme: Theme): Record<string, SxProps> => ({
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
    borderBottom: `1px solid ${alpha(theme.palette.gx.primary.white, 0.1)}`,
    flexShrink: 0
  },
  title: {
    fontWeight: 600,
    marginBottom: '4px'
  }
});
