import { useState } from 'react';
import { alpha, Box, SxProps, Theme, useTheme } from '@mui/material';
import { Layout } from 'react-grid-layout';
import { DashboardGrid, DashboardGridItem } from '../../components/DashboardGrid';
import { GxDashboardGraphWindowExample, EXAMPLE_CHART_CONFIG } from '../../components/GxDashboardGraphWindowExample';
import { PieChart, PIE_CHART_CONFIG } from '../../components/graphs/PieChart';
import { AddGraphButton } from '../../components/AddGraphButton';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { usePolygonDrawingStore } from '../../stores/PolygonDrawingStore/PolygonDrawingStore';
import { useShallow } from 'zustand/react/shallow';

export const DashboardView = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const [polygonFeatures] = usePolygonDrawingStore(useShallow((store) => [store.polygonFeatures]));

  const graphOptions = [
    { id: EXAMPLE_CHART_CONFIG.id, label: EXAMPLE_CHART_CONFIG.label },
    { id: PIE_CHART_CONFIG.id, label: t(PIE_CHART_CONFIG.labelKey) }
  ];

  // Example items
  const [gridItems, setGridItems] = useState<DashboardGridItem[]>([
    <GxDashboardGraphWindowExample
      key="item-1"
      id="item-1"
      title={EXAMPLE_CHART_CONFIG.label}
      backgroundColor={EXAMPLE_CHART_CONFIG.defaultBackgroundColor}
      removable={true}
    />
  ]);

  const handleLayoutChange = (layout: Layout[]) => {
    console.log('Layout changed:', layout);
  };

  const handleRemoveItem = (itemId: string) => {
    setGridItems((prev) => prev.filter((item) => item.props.id !== itemId));
  };

  const handleAddGraph = (graphId: string) => {
    const graphOption = graphOptions.find((opt) => opt.id === graphId);
    const newItemId = `item-${Date.now()}`;
    let newItem: DashboardGridItem | null = null;

    if (graphId === EXAMPLE_CHART_CONFIG.id) {
      newItem = (
        <GxDashboardGraphWindowExample
          key={newItemId}
          id={newItemId}
          title={graphOption?.label || 'Example Chart'}
          backgroundColor={'#' + Math.floor(Math.random() * 16777215).toString(16)}
          removable={true}
        />
      );
    } else if (graphId === PIE_CHART_CONFIG.id) {
      if (polygonFeatures.length === 0) {
        enqueueSnackbar(t('dashboard.noPolygonsAvailable'), { variant: 'warning' });
        return;
      }

      const availableRois = polygonFeatures
        .map((f) => f.properties?.polygonId)
        .filter((id): id is number => id !== undefined);

      newItem = (
        <PieChart
          key={newItemId}
          id={newItemId}
          title={graphOption?.label || 'Pie Chart'}
          backgroundColor={PIE_CHART_CONFIG.defaultBackgroundColor}
          removable={true}
          initialRois={availableRois.slice(0, 1)}
        />
      );
    }

    if (newItem) {
      setGridItems((prev) => [newItem, ...prev]);
      enqueueSnackbar(t('dashboard.graphAdded', { graphName: graphOption?.label }), { variant: 'success' });
    }
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
