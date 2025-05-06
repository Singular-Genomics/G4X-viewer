import { alpha, Box, useTheme } from '@mui/material';
import Plot from 'react-plotly.js';
import { Data, Datum, Layout } from 'plotly.js';
import { useEffect, useRef, useState } from 'react';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { GraphRangeInputs } from '../GraphRangeInputs';
import { HeatmapWorker } from './helpers/heatmapWorker';
import { useSnackbar } from 'notistack';
import { debounce } from 'lodash';
import { useCytometryGraphStore } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore';
import { HeatmapRanges } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore.types';
import { CytometryHeader } from './CytometryHeader/CytometryHeader';

export const CytometryGraph = () => {
  const containerRef = useRef(null);
  const theme = useTheme();

  const { enqueueSnackbar } = useSnackbar();
  const { cellMasksData } = useCellSegmentationLayerStore();
  const { proteinNames, settings } = useCytometryGraphStore();
  const [heatmapData, setHeatmapData] = useState<{ x: Datum[]; y: Datum[]; z: Datum[][] }>({
    x: [],
    y: [],
    z: []
  });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectionRange, setSelectionRange] = useState<HeatmapRanges | undefined>(undefined);
  const [availableProteinNames, setAvailableProteinNames] = useState<string[]>([]);

  useEffect(() => {
    if (cellMasksData) {
      if (!cellMasksData.length) {
        enqueueSnackbar({
          message: 'Missing cell masks in given data set',
          variant: 'error'
        });
        return;
      }

      const listOfProteinNames = Object.keys(cellMasksData[0].proteins);
      if (listOfProteinNames.length < 2) {
        enqueueSnackbar({
          message:
            'Data set contains only a single channel data. At least to channels are required for plotting the heatmap',
          variant: 'error'
        });
        return;
      }

      const { ranges } = useCytometryGraphStore.getState();

      setAvailableProteinNames(listOfProteinNames);

      if (ranges) {
        setSelectionRange(ranges);
      }
    }
  }, [cellMasksData, enqueueSnackbar]);

  useEffect(() => {
    if (cellMasksData && proteinNames.xAxis && proteinNames.yAxis && settings.binSize) {
      const worker = new HeatmapWorker();
      worker.onMessage((output) => {
        if (output.completed && output.data) {
          setHeatmapData(output.data);
        }
      });
      worker.onError((error) => console.error(error));
      worker.postMessage({
        xValues: cellMasksData.map((mask: any) => mask.proteins[proteinNames.xAxis as string]),
        yValues: cellMasksData.map((mask: any) => mask.proteins[proteinNames.yAxis as string]),
        binSize: settings.binSize
      });
    }
  }, [cellMasksData, proteinNames.xAxis, proteinNames.yAxis, settings.binSize]);

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

  const plotData: Data[] = [
    {
      type: 'heatmap',
      x: heatmapData.x,
      y: heatmapData.y,
      z: heatmapData.z,
      colorscale: settings.colorscale.value,
      showscale: true,
      hoverinfo: 'x+y+z',
      hovertemplate: 'X: %{x}<br>Y: %{y}<br>Count: %{z}<extra></extra>'
    }
  ];

  const layout = {
    dragmode: 'select',
    hovermode: 'closest',
    margin: { t: 50, r: 100, b: 80, l: 100 },
    paper_bgcolor: theme.palette.gx.primary.white,
    plot_bgcolor: theme.palette.gx.lightGrey[900],
    xaxis: {
      title: {
        text: proteinNames.xAxis,
        font: { size: 14 }
      },
      type: settings.axisType,
      autorange: true,
      linewidth: 2,
      mirror: true,
      tickmode: 'array',
      tickfont: { size: 12 },
      exponentformat: settings.exponentFormat
    },
    yaxis: {
      title: {
        text: proteinNames.yAxis,
        font: { size: 14 },
        standoff: 10
      },
      type: settings.axisType,
      autorange: true,
      linewidth: 2,
      mirror: true,
      tickmode: 'array',
      tickfont: { size: 12 },
      exponentformat: settings.exponentFormat,
      scaleanchor: 'x',
      scaleratio: 1
    },
    width: dimensions.width,
    height: dimensions.height,
    activeselection: {
      opacity: 1,
      fillcolor: alpha(theme.palette.gx.primary.black, 0.1)
    },
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
      <CytometryHeader availableProteinNames={availableProteinNames} />
      <Box
        ref={containerRef}
        sx={sx.graphWrapper}
      >
        {plotData && (
          <Plot
            data={plotData}
            layout={layout as Partial<Layout>}
            config={{
              modeBarButtons: [
                ['select2d', 'zoom2d', 'zoomIn2d', 'zoomOut2d', 'pan2d', 'autoScale2d', 'resetViews', 'toImage']
              ],
              displayModeBar: true
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
        )}
      </Box>
      <GraphRangeInputs
        rangeSource={selectionRange}
        onUpdateRange={(newFilter) => setSelectionRange(newFilter)}
        onClear={() => {
          setSelectionRange(undefined);
          useCytometryGraphStore.setState({ ranges: undefined });
        }}
        onConfirm={() =>
          useCytometryGraphStore.setState({
            ranges: selectionRange
          })
        }
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
    gap: '1px'
  },
  graphWrapper: {
    overflow: 'hidden',
    height: '100%',
    width: '100%'
  },
  plot: {
    width: '100%'
  }
};
