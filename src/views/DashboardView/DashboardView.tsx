import { useMemo, useState } from 'react';
import { alpha, Box, SxProps, Theme, useTheme } from '@mui/material';
import { Layout } from 'react-grid-layout';
import { DashboardGrid, DashboardGridItem } from '../../components/DashboardGrid';
import { AddGraphButton } from '../../components/AddGraphButton';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { DASHBOARD_GRAPHS_IDS } from '../../components/DashboardPlots/DashboardPlots.helpers';
import { GraphOption } from './DashboardView.types';
import { BoxGraph } from '../../components/DashboardPlots/BoxChart';
import { BarChart } from '../../components/DashboardPlots/BarChart';
import { HeatmapChart } from '../../components/DashboardPlots/HeatmapChart';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { BAR_CHART_CONFIG } from '../../components/DashboardPlots/BarChart/BarChart.config';
import { HEATMAP_CHART_CONFIG } from '../../components/DashboardPlots/HeatmapChart/HeatmapChart.config';

export const DashboardView = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const { selectedCells } = useCellSegmentationLayerStore();

  const graphOptions: GraphOption[] = useMemo(
    () => [
      {
        id: DASHBOARD_GRAPHS_IDS.BOX_GRAPH,
        label: t('dashboard.graphOptions_boxGraph')
      },
      {
        id: BAR_CHART_CONFIG.id,
        label: t(BAR_CHART_CONFIG.labelKey)
      },
      {
        id: HEATMAP_CHART_CONFIG.id,
        label: t(HEATMAP_CHART_CONFIG.labelKey)
      }
    ],
    [t]
  );

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

    if (selectedCells.length === 0) {
      enqueueSnackbar(t('dashboard.noROIAvailableError'), { variant: 'error' });
      return;
    }

    let newItem: DashboardGridItem;
    const newItemId = `item-${Date.now()}`;

    switch (graphOption.id) {
      case DASHBOARD_GRAPHS_IDS.BOX_GRAPH:
        newItem = (
          <BoxGraph
            key={newItemId}
            id={newItemId}
            title={graphOption.label}
            removable={true}
          />
        );
        break;
      case BAR_CHART_CONFIG.id:
        newItem = (
          <BarChart
            key={newItemId}
            id={newItemId}
            title={graphOption.label}
            removable={true}
          />
        );
        break;
      case HEATMAP_CHART_CONFIG.id:
        newItem = (
          <HeatmapChart
            key={newItemId}
            id={newItemId}
            title={graphOption.label}
            removable={true}
          />
        );
        break;
      default:
        return;
    }

    setGridItems((prev) => [newItem, ...prev]);
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
