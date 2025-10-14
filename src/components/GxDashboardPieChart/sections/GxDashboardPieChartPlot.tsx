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
import type { GxDashboardPieChartPlotProps, ClusterData, SinglePieChartProps } from '../GxDashboardPieChart.types';

const buildColorMap = (colorMapConfig: CellSegmentationColormapEntry[]) => {
  return Object.fromEntries(colorMapConfig.map((entry) => [entry.clusterId, `rgb(${entry.color.join(',')})`]));
};

const SinglePieChart = ({ polygonId }: SinglePieChartProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

  const [polygonFeatures] = usePolygonDrawingStore(useShallow((store) => [store.polygonFeatures]));
  const { cellMasksData } = useCellSegmentationLayerStore();
  const [colorMapConfig] = useCellSegmentationLayerStore(useShallow((store) => [store.cellColormapConfig]));

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

  const selectedPolygon = polygonFeatures.find((feature) => feature.properties?.polygonId === polygonId);

  const clusterData: ClusterData[] = useMemo(() => {
    if (!cellMasksData || !selectedPolygon) return [];

    const clusterCounts = new Map<string, number>();
    cellMasksData.forEach((mask) => {
      clusterCounts.set(mask.clusterId, (clusterCounts.get(mask.clusterId) || 0) + 1);
    });

    const colorMap = buildColorMap(colorMapConfig);

    return Array.from(clusterCounts.entries())
      .map(([clusterId, count]) => ({
        clusterId,
        count,
        color: colorMap[clusterId] || theme.palette.gx.mediumGrey[500]
      }))
      .sort((a, b) => Number(a.clusterId) - Number(b.clusterId));
  }, [cellMasksData, selectedPolygon, colorMapConfig, theme.palette.gx.mediumGrey]);

  if (!selectedPolygon) {
    return (
      <Box sx={sx.container}>
        <Typography
          variant="body1"
          color="text.secondary"
        >
          {t('pieChart.polygonNotFound', { polygonId })}
        </Typography>
      </Box>
    );
  }

  if (!cellMasksData?.length || clusterData.length === 0) {
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

  const pieData: Partial<Data>[] = [
    {
      type: 'pie',
      labels: clusterData.map((d) => d.clusterId),
      values: clusterData.map((d) => d.count),
      marker: {
        colors: clusterData.map((d) => d.color)
      },
      textinfo: 'label+percent',
      hoverinfo: 'label+value+percent'
    }
  ];

  const layout: Partial<Layout> = {
    width: dimensions.width,
    height: dimensions.height,
    autosize: true,
    uirevision: 'true',
    margin: { l: 50, r: 50, b: 50, t: 50 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: {
      color: theme.palette.gx.primary.white
    },
    showlegend: true,
    legend: {
      itemsizing: 'constant',
      orientation: 'v',
      x: 1,
      y: 0.5,
      title: {
        text: `${t('pieChart.clusterId')}<br>`,
        font: {
          size: 13,
          color: theme.palette.gx.primary.white
        }
      },
      font: {
        size: 12,
        color: theme.palette.gx.primary.white
      }
    }
  };

  return (
    <Box sx={sx.singleChartContainer}>
      <Typography
        variant="subtitle1"
        sx={sx.chartTitle}
      >
        {t('pieChart.roiTitle', { polygonId })}
      </Typography>
      <Box
        ref={containerRef}
        sx={sx.graphWrapper}
      >
        <Plot
          data={pieData}
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
    </Box>
  );
};

export const GxDashboardPieChartPlot = ({ selectedRois }: GxDashboardPieChartPlotProps) => {
  const { t } = useTranslation();
  const { cellMasksData } = useCellSegmentationLayerStore();

  if (!cellMasksData || cellMasksData.length === 0) {
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

  return (
    <Box sx={sx.chartsGrid}>
      {selectedRois.map((roiId) => (
        <SinglePieChart
          key={roiId}
          polygonId={roiId}
        />
      ))}
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
  chartsGrid: {
    width: '100%',
    height: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: 2,
    padding: 2
  },
  singleChartContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '150px',
    height: '100%'
  },
  chartTitle: {
    fontWeight: 600,
    marginBottom: 1,
    textAlign: 'center',
    color: '#ffffff'
  },
  graphWrapper: {
    overflow: 'hidden',
    flex: 1,
    width: '100%',
    minHeight: '200px'
  }
};
