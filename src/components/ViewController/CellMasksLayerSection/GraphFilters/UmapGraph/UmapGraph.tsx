import { Box, darken, useTheme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import Plot from 'react-plotly.js';
import { GraphRangeInputs } from '../GraphRangeInputs';
import { Datum, Layout } from 'plotly.js';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useSnackbar } from 'notistack';
import { useUmapGraphStore } from '../../../../../stores/UmapGraphStore/UmapGraphStore';
import { UmapRange } from '../../../../../stores/UmapGraphStore/UmapGraphStore.types';
import { UmapGraphHeader } from './UmapGraphHeader/UmapGraphHeader';
import { debounce } from 'lodash';
import { getPlotData } from './UmapGraph.helpers';

export const UmapGraph = () => {
  const theme = useTheme();
  const sx = styles();

  const containerRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();
  const { cellMasksData } = useCellSegmentationLayerStore();
  const { settings } = useUmapGraphStore();
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const [selectionRange, setSelectionRange] = useState<UmapRange | undefined>(undefined);
  const [plotData, setPlotData] = useState<{ x: Datum[]; y: Datum[] }>({ x: [], y: [] });

  useEffect(() => {
    const { ranges } = useUmapGraphStore.getState();
    if (ranges) {
      setSelectionRange(ranges);
    }
  }, []);

  useEffect(() => {
    if (cellMasksData) {
      getPlotData(cellMasksData, settings.subsamplingValue).then((results) => setPlotData(results));
    }
  }, [cellMasksData, enqueueSnackbar, settings.subsamplingValue]);

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

  const layout = {
    width: dimensions.width,
    height: dimensions.height,
    dragmode: 'select',
    margin: { l: 50, r: 50, b: 50, t: 50 },
    selections: [
      ...(selectionRange
        ? [
            {
              line: {
                color: theme.palette.gx.primary.black,
                width: 2,
                dash: 'solid'
              },
              opacity: 1,
              type: 'rect',
              x0: selectionRange.xStart,
              x1: selectionRange.xEnd,
              xref: 'x',
              y0: selectionRange.yStart,
              y1: selectionRange.yEnd,
              yref: 'y'
            }
          ]
        : [])
    ]
  };

  return (
    <Box sx={sx.container}>
      <UmapGraphHeader />
      <Box
        ref={containerRef}
        sx={sx.graphWrapper}
      >
        <Plot
          data={[
            {
              x: plotData.x,
              y: plotData.y,
              mode: 'markers',
              type: 'scattergl',
              marker: {
                color: darken(theme.palette.gx.accent.greenBlue, 0.25),
                size: settings.pointSize
              }
            }
          ]}
          style={{
            width: '100%'
          }}
          layout={layout as Partial<Layout>}
          config={{
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'toImage']
          }}
          onSelected={(e) => {
            if (e?.range) {
              setSelectionRange({
                xStart: e.range.x[0],
                xEnd: e.range.x[1],
                yStart: e.range.y[1],
                yEnd: e.range.y[0]
              });
            }
          }}
        />
      </Box>
      <GraphRangeInputs
        rangeSource={selectionRange}
        onUpdateRange={(newFilter) => setSelectionRange(newFilter)}
        onClear={() => {
          setSelectionRange(undefined);
          useUmapGraphStore.setState({ ranges: undefined });
        }}
        onConfirm={() => useUmapGraphStore.setState({ ranges: selectionRange })}
        inputPrecission={3}
      />
    </Box>
  );
};

const styles = () => ({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px'
  },
  graphWrapper: {
    overflow: 'hidden',
    height: '100%',
    width: '100%'
  }
});
