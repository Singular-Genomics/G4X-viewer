import { Box, SxProps } from '@mui/material';
import { HeatmapChartPlotProps } from './HeatmapChartPlot.types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useHeatmapChartPlotDataParser } from './HeatmapChartPlot.helpers';
import Plot from 'react-plotly.js';
import { Layout } from 'plotly.js';
import { debounce } from 'lodash';
import { GxColorscaleSlider } from '../../../../../shared/components/GxColorscaleSlider';

export const HeatmapChartPlot = ({
  selectedROIs,
  selectedValueType,
  selectedValues,
  settings
}: HeatmapChartPlotProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [threshold, setThreshold] = useState<{ lower?: number; upper?: number }>({});
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const { parseCellsByRoi } = useHeatmapChartPlotDataParser();

  const heatmapData = useMemo(
    () => parseCellsByRoi(selectedROIs, selectedValueType, selectedValues, settings, threshold.upper, threshold.lower),
    [parseCellsByRoi, selectedValues, selectedROIs, selectedValueType, settings, threshold]
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

  let minZValue: number | undefined = Infinity;
  let maxZValue: number | undefined = -Infinity;

  if (heatmapData.length === 1 && minZValue !== undefined && maxZValue !== undefined) {
    heatmapData[0].z.flat().forEach((z) => {
      if (z < minZValue!) minZValue = z;
      if (z > maxZValue!) maxZValue = z;
    });
  } else {
    minZValue = undefined;
    maxZValue = undefined;
  }

  const layout: Partial<Layout> = {
    width: dimensions.width,
    height: dimensions.height,
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    autosize: true,
    showlegend: false,
    uirevision: 'true',
    annotations: [],
    margin: {
      l: 100
    },
    ...(settings.customTitle
      ? {
          title: { text: settings.customTitle }
        }
      : {})
  };

  return (
    <Box sx={sx.container}>
      <Box
        ref={containerRef}
        sx={sx.plotContainer}
      >
        <Plot
          data={heatmapData}
          layout={layout}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
          config={{
            scrollZoom: false,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: [
              'pan2d',
              'lasso2d',
              'select2d',
              'zoom2d',
              'zoomIn2d',
              'zoomOut2d',
              'autoScale2d',
              'resetScale2d'
            ]
          }}
        />
      </Box>
      <Box sx={sx.sliderWrapper}>
        <GxColorscaleSlider
          scaleMax={maxZValue}
          scaleMin={minZValue}
          colorscale={settings.colorscale}
          lowerThreshold={threshold.lower}
          upperThreshold={threshold.upper}
          onThresholdChange={(lower, upper) => {
            setThreshold({ lower, upper });
          }}
        />
      </Box>
    </Box>
  );
};

const sx: Record<string, SxProps> = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    padding: 2
  },
  plotContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden'
  },
  sliderWrapper: {
    width: '100%',
    backgroundColor: 'white',
    paddingInline: '32px'
  }
};
