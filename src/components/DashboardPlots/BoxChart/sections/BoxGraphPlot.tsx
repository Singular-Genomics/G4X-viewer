import { Box } from '@mui/material';
import { BoxGraphPlotProps } from './BoxGraphPlot.types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useBoxGraphPlotDataParser } from './BoxGraphPlot.helpers';
import Plot from 'react-plotly.js';
import { Layout } from 'plotly.js';
import { debounce } from 'lodash';

export const BoxGraphPlot = ({
  selectedROIs,
  selectedValueType,
  selectedValue,
  selectedHue,
  settings
}: BoxGraphPlotProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const { parseCellsByRoi } = useBoxGraphPlotDataParser();

  const boxPlotData = useMemo(
    () =>
      parseCellsByRoi(
        selectedROIs,
        selectedValueType,
        selectedValue,
        selectedHue,
        settings.swapAxis ? 'h' : 'v',
        settings.dataMode
      ),
    [parseCellsByRoi, selectedValue, selectedROIs, selectedValueType, selectedHue, settings.swapAxis, settings.dataMode]
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

  const layout: Partial<Layout> = {
    width: dimensions.width,
    height: dimensions.height,
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    autosize: true,
    showlegend: true,
    boxmode: selectedHue === 'none' ? undefined : 'group',
    annotations: []
  };

  return (
    <Box
      ref={containerRef}
      sx={sx.plotContainer}
    >
      <Plot
        data={boxPlotData}
        layout={layout}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
        config={{
          scrollZoom: false,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['lasso2d', 'select2d']
        }}
      />
    </Box>
  );
};

const sx = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  },
  plotContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    overflow: 'hidden',
    padding: 2
  }
};
