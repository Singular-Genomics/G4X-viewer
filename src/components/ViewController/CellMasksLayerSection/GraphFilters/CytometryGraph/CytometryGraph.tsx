import { alpha, Box, MenuItem, Theme, Typography, useTheme } from '@mui/material';
import Plot from 'react-plotly.js';
import { Data, Datum, Layout } from 'plotly.js';
import { useEffect, useRef, useState } from 'react';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { GxSelect } from '../../../../../shared/components/GxSelect';
import { GetBrandColorscale } from './CytometryGraph.helpers';
import { CytometrySettingsMenu } from './CytometrySettingsMenu/CytometrySettingsMenu';
import { GraphRangeInputs } from '../GraphRangeInputs';
import { CytometryFilter } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore.types';
import * as protobuf from 'protobufjs';
import { CellMasksSchema } from '../../../../../layers/cell-masks-layer/cell-masks-schema';
import { HeatmapWorker } from './helpers/heatmapWorker';
import { useSnackbar } from 'notistack';

const protoRoot = protobuf.Root.fromJSON(CellMasksSchema);

export const CytometryGraph = () => {
  const containerRef = useRef(null);
  const theme = useTheme();
  const sx = styles(theme);

  const { enqueueSnackbar } = useSnackbar();
  const { cytometryFilter, cellMasksData } = useCellSegmentationLayerStore();
  const [heatmapData, setHeatmapData] = useState<{ x: Datum[]; y: Datum[]; z: any }>({
    x: [],
    y: [],
    z: []
  });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [xAxisProtein, setXAxisProtein] = useState('');
  const [yAxisProtein, setYAxisProtein] = useState('');
  const [availableProteinNames, setAvailableProteinNames] = useState<string[]>([]);

  useEffect(() => {
    if (cellMasksData) {
      const parsedMasks = (protoRoot.lookupType('CellMasks').decode(cellMasksData) as any).cellMasks;
      if (!parsedMasks.length) {
        enqueueSnackbar({
          message: 'Missing cell masks in given data set',
          variant: 'error'
        });
        return;
      }

      const listOfProteinNames = Object.keys(parsedMasks[0].proteins);
      if (listOfProteinNames.length < 2) {
        enqueueSnackbar({
          message:
            'Data set contains only a single channel data. At least to channels are required for plotting the heatmap',
          variant: 'error'
        });
        return;
      }

      setAvailableProteinNames(listOfProteinNames);
      setXAxisProtein(listOfProteinNames[0]);
      setYAxisProtein(listOfProteinNames[1]);
    }
  }, [cellMasksData, enqueueSnackbar]);

  useEffect(() => {
    if (cellMasksData && xAxisProtein && yAxisProtein) {
      const parsedMasks = (protoRoot.lookupType('CellMasks').decode(cellMasksData) as any).cellMasks;
      const worker = new HeatmapWorker();
      worker.onMessage((output) => {
        if (output.completed && output.data) {
          setHeatmapData(output.data);
        }
      });
      worker.onError((error) => console.error(error));
      worker.postMessage({
        xValues: parsedMasks.map((mask: any) => mask.proteins[xAxisProtein]),
        yValues: parsedMasks.map((mask: any) => mask.proteins[yAxisProtein]),
        binSize: 20
      });
    }
  }, [cellMasksData, xAxisProtein, yAxisProtein]);

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || !entries[0]) return;

      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

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
      colorscale: GetBrandColorscale(),
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
        text: 'Test X',
        font: { size: 14 }
      },
      type: 'linear',
      autorange: true,
      linewidth: 2,
      mirror: true,
      tickmode: 'array',
      tickfont: { size: 12 },
      exponentformat: 'power'
    },
    yaxis: {
      title: {
        text: 'Test Y',
        font: { size: 14 },
        standoff: 10
      },
      type: 'linear',
      autorange: true,
      linewidth: 2,
      mirror: true,
      tickmode: 'array',
      tickfont: { size: 12 },
      exponentformat: 'power',
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
      ...(cytometryFilter
        ? [
            {
              line: {
                color: theme.palette.gx.primary.black,
                width: 2,
                dash: 'solid'
              },
              opacity: 1,
              type: 'rect',
              x0: cytometryFilter.xRangeStart,
              x1: cytometryFilter.xRangeEnd,
              xref: 'x',
              y0: cytometryFilter.yRangeEnd,
              y1: cytometryFilter.yRangeStart,
              yref: 'y'
            }
          ]
        : [])
    ]
  };

  return (
    <Box sx={sx.container}>
      <Box sx={sx.headerWrapper}>
        <Box sx={sx.selectWrapper}>
          <Typography sx={sx.selectLabel}>X Axis Source: </Typography>
          <GxSelect
            fullWidth
            value={xAxisProtein}
            onChange={(e) => setXAxisProtein(e.target.value as string)}
            label="Select Data Source"
            MenuProps={{ sx: { zIndex: 3000 } }}
          >
            {availableProteinNames.map((proteinName) => (
              <MenuItem
                value={proteinName}
                disabled={proteinName === yAxisProtein}
              >
                {proteinName}
              </MenuItem>
            ))}
          </GxSelect>
          <Typography sx={sx.selectLabel}>Y Axis Source: </Typography>
          <GxSelect
            fullWidth
            value={yAxisProtein}
            onChange={(e) => setYAxisProtein(e.target.value as string)}
            label="Select Data Source"
            MenuProps={{ sx: { zIndex: 3000 } }}
          >
            {availableProteinNames.map((proteinName) => (
              <MenuItem
                value={proteinName}
                disabled={proteinName === xAxisProtein}
              >
                {proteinName}
              </MenuItem>
            ))}
          </GxSelect>
        </Box>
        <CytometrySettingsMenu />
      </Box>

      <Box
        ref={containerRef}
        sx={sx.graphWrapper}
      >
        <Plot
          data={plotData}
          layout={layout as Partial<Layout>}
          style={sx.plot}
          config={{
            modeBarButtons: [['select2d', 'zoom2d', 'zoomIn2d', 'zoomOut2d', 'pan2d', 'autoScale2d', 'resetViews']],
            responsive: true,
            displayModeBar: true
          }}
          onSelected={(e) => {
            if (e?.range) {
              useCellSegmentationLayerStore.setState({
                cytometryFilter: {
                  xRangeProteinName: cytometryFilter?.xRangeProteinName || '',
                  yRangeProteinName: cytometryFilter?.yRangeProteinName || '',
                  xRangeStart: e.range.x[0],
                  xRangeEnd: e.range.x[1],
                  yRangeStart: e.range.y[1],
                  yRangeEnd: e.range.y[0]
                }
              });
            }
          }}
        />
      </Box>
      <GraphRangeInputs
        rangeSource={cytometryFilter}
        onUpdateRange={(newFilter) =>
          useCellSegmentationLayerStore.setState({
            cytometryFilter: newFilter as CytometryFilter
          })
        }
        onClear={() =>
          useCellSegmentationLayerStore.setState({
            cytometryFilter: undefined
          })
        }
      />
    </Box>
  );
};

const styles = (theme: Theme) => ({
  container: {
    width: '100%',
    height: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1px'
  },
  graphWrapper: {
    overflow: 'hidden'
  },
  plot: {
    width: '100%'
  },
  headerWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  selectWrapper: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    backgroundColor: theme.palette.gx.primary.white,
    gap: '16px',
    padding: '8px'
  },
  selectLabel: {
    textAlign: 'right',
    textWrap: 'nowrap',
    fontWeight: 'bold'
  }
});
