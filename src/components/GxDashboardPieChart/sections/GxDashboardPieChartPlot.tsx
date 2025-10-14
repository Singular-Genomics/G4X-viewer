import { Box, Typography, useTheme } from '@mui/material';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import { debounce } from 'lodash';
import { usePolygonDrawingStore } from '../../../stores/PolygonDrawingStore/PolygonDrawingStore';
import { useCellSegmentationLayerStore } from '../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import type { CellSegmentationColormapEntry } from '../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore.types';
import { useShallow } from 'zustand/react/shallow';
import type { GxDashboardPieChartPlotProps } from '../GxDashboardPieChart.types';

const buildColorMap = (colorMapConfig: CellSegmentationColormapEntry[]) => {
  return Object.fromEntries(colorMapConfig.map((entry) => [entry.clusterId, `rgb(${entry.color.join(',')})`]));
};

export const GxDashboardPieChartPlot = ({ selectedRois }: GxDashboardPieChartPlotProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const [polygonFeatures] = usePolygonDrawingStore(useShallow((store) => [store.polygonFeatures]));
  const [selectedCells, colorMapConfig] = useCellSegmentationLayerStore(
    useShallow((store) => [store.selectedCells, store.cellColormapConfig])
  );

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const handleResize = debounce((entries) => {
      if (!entries || !entries[0]) return;

      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    }, 250);

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerEl);

    return () => {
      if (containerEl) {
        resizeObserver.unobserve(containerEl);
      }
    };
  }, []);

  const pieChartData = useMemo(() => {
    if (!selectedCells || !polygonFeatures) return [];

    const colorMap = buildColorMap(colorMapConfig);
    const pieData: Partial<Data>[] = [];
    const numRois = selectedRois.length;

    const minPieSize = 300;
    const cols = Math.max(1, Math.floor(dimensions.width / minPieSize));
    const rows = Math.ceil(numRois / cols);

    const horizontalSpacing = 0.08;
    const verticalSpacing = 0.08;

    const actualCols = numRois < cols ? numRois : cols;
    const offset = (cols - actualCols) / (2 * cols);

    selectedRois.forEach((roiId, roiIndex) => {
      const selectedPolygon = polygonFeatures.find((feature) => feature.properties?.polygonId === roiId);
      if (!selectedPolygon) return;

      const roiCells = selectedCells.find((selection) => selection.roiId === roiId)?.data;
      if (!roiCells || roiCells.length === 0) return;

      const clusterCounts = new Map<string, number>();
      roiCells.forEach((mask) => {
        clusterCounts.set(mask.clusterId, (clusterCounts.get(mask.clusterId) || 0) + 1);
      });

      if (clusterCounts.size === 0) return;

      const sortedClusters = Array.from(clusterCounts.entries()).sort((a, b) => Number(a[0]) - Number(b[0]));

      const labels = sortedClusters.map(([clusterId]) => clusterId);
      const values = sortedClusters.map(([, count]) => count);
      const colors = sortedClusters.map(([clusterId]) => colorMap[clusterId] || theme.palette.gx.mediumGrey[500]);

      const col = roiIndex % cols;
      const row = Math.floor(roiIndex / cols);

      const cellWidth = 1 / cols;
      const cellHeight = 1 / rows;

      const xStart = offset + col * cellWidth + horizontalSpacing / 2;
      const xEnd = offset + (col + 1) * cellWidth - horizontalSpacing / 2;
      const yStart = 1 - (row + 1) * cellHeight + verticalSpacing / 2;
      const yEnd = 1 - row * cellHeight - verticalSpacing / 2;

      pieData.push({
        type: 'pie',
        labels: labels,
        values: values,
        name: `ROI ${roiId}`,
        marker: { colors: colors },
        domain: {
          x: [xStart, xEnd],
          y: [yStart, yEnd]
        },
        textinfo: 'label+percent',
        hoverinfo: 'label+value+percent',
        showlegend: roiIndex === 0,
        legendgroup: 'clusters'
      });
    });

    return pieData;
  }, [selectedCells, polygonFeatures, selectedRois, colorMapConfig, theme.palette.gx.mediumGrey, dimensions.width]);

  const layout: Partial<Layout> = useMemo(() => {
    const annotations: any[] = [];
    const numRois = selectedRois.length;
    const minPieSize = 300;
    const cols = Math.max(1, Math.floor(dimensions.width / minPieSize));
    const rows = Math.ceil(numRois / cols);

    const verticalSpacing = 0.08;

    const actualCols = numRois < cols ? numRois : cols;
    const offset = (cols - actualCols) / (2 * cols);

    selectedRois.forEach((roiId, roiIndex) => {
      const col = roiIndex % cols;
      const row = Math.floor(roiIndex / cols);

      const cellWidth = 1 / cols;
      const cellHeight = 1 / rows;

      annotations.push({
        text: `<b>${t('pieChart.roiTitle', { polygonId: roiId })}</b>`,
        x: offset + (col + 0.5) * cellWidth,
        y: 1 - row * cellHeight - verticalSpacing / 3,
        xref: 'paper',
        yref: 'paper',
        xanchor: 'center',
        yanchor: 'bottom',
        showarrow: false,
        font: { size: 14, color: theme.palette.gx.primary.white }
      });
    });

    return {
      width: dimensions.width,
      height: dimensions.height,
      autosize: true,
      uirevision: 'true',
      margin: { l: 30, r: 150, b: 30, t: 30 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: {
        color: theme.palette.gx.primary.white
      },
      showlegend: true,
      legend: {
        itemsizing: 'constant',
        orientation: 'v',
        x: 1.01,
        xanchor: 'left',
        y: 0.5,
        yanchor: 'middle',
        title: {
          text: `${t('pieChart.clusterId')}<br>`,
          font: {
            size: 13,
            color: theme.palette.gx.primary.white,
            weight: 500
          }
        },
        font: {
          size: 12,
          color: theme.palette.gx.primary.white
        }
      },
      annotations: annotations
    };
  }, [dimensions, selectedRois, t, theme.palette.gx.primary.white]);

  if (!selectedCells || selectedCells.length === 0) {
    return (
      <Box sx={sx.container}>
        <Typography
          variant="body1"
          color="text.secondary"
        >
          {t('pieChart.noCellSegmentationData')}
        </Typography>
      </Box>
    );
  }

  if (selectedRois.length === 0) {
    return (
      <Box sx={sx.container}>
        <Typography
          variant="body1"
          color="text.secondary"
        >
          {t('pieChart.noRoiSelected')}
        </Typography>
      </Box>
    );
  }

  if (pieChartData.length === 0) {
    return (
      <Box sx={sx.container}>
        <Typography
          variant="body1"
          color="text.secondary"
        >
          {t('pieChart.noDataForPolygon')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={sx.plotContainer}
    >
      <Plot
        data={pieChartData}
        layout={layout}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
        config={{
          scrollZoom: false,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: [
            'lasso2d',
            'select2d',
            'zoom2d',
            'pan2d',
            'zoomIn2d',
            'zoomOut2d',
            'autoScale2d',
            'toImage'
          ]
        }}
      />
    </Box>
  );
};

const sx = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1
  },
  plotContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    overflow: 'hidden',
    padding: 2
  }
};
