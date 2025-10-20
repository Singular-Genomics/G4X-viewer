import { useState } from 'react';
import { alpha, Box, SxProps, Theme, useTheme } from '@mui/material';
import { Layout } from 'react-grid-layout';
import { DashboardGrid, DashboardGridItem } from '../../components/DashboardGrid';
import { PieChart, PIE_CHART_CONFIG } from '../../components/DashboardCharts/PieChart';
import { AddGraphButton } from '../../components/AddGraphButton';
import { useTranslation } from 'react-i18next';
import { usePolygonDrawingStore } from '../../stores/PolygonDrawingStore/PolygonDrawingStore';
import { useShallow } from 'zustand/react/shallow';
import { DASHBOARD_GRAPHS_IDS } from '../../components/DashboardCharts/DashboardPlots.helpers';
import { BoxChart } from '../../components/DashboardCharts/BoxChart';

export const DashboardView = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

  const [polygonFeatures] = usePolygonDrawingStore(useShallow((store) => [store.polygonFeatures]));

  const graphOptions = [
    { id: PIE_CHART_CONFIG.id, label: t(PIE_CHART_CONFIG.labelKey) },
    {
      id: DASHBOARD_GRAPHS_IDS.BOX_GRAPH,
      label: t('boxChart.chartTitle')
    }
  ];

  const [gridItems, setGridItems] = useState<DashboardGridItem[]>([]);

  const handleLayoutChange = (layout: Layout[]) => {
    console.log('Layout changed:', layout);
  };

  const handleRemoveItem = (itemId: string) => {
    setGridItems((prev) => prev.filter((item) => item.props.id !== itemId));
  };

  const handleAddGraph = (graphId: string) => {
    const graphOption = graphOptions.find((opt) => opt.id === graphId);
    if (!graphOption) return;

    let newItem: DashboardGridItem;
    const newItemId = `item-${Date.now()}`;

    const availableRois = polygonFeatures
      .map((f) => f.properties?.polygonId)
      .filter((id): id is number => id !== undefined);

    switch (graphOption.id) {
      case DASHBOARD_GRAPHS_IDS.BOX_GRAPH:
        newItem = (
          <BoxChart
            key={newItemId}
            id={newItemId}
            title={graphOption.label}
            removable={true}
          />
        );
        break;
      case PIE_CHART_CONFIG.id:
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
        break;
      default:
        return;
    }

    if (newItem) {
      setGridItems((prev) => [newItem, ...prev]);
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
