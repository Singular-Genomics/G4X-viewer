import { alpha, Box, MenuItem, Theme, Typography, useTheme } from '@mui/material';
import Plot from 'react-plotly.js';
import { Data, Datum, Layout } from 'plotly.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { GxSelect } from '../../../../../shared/components/GxSelect';
import { CytometrySettingsMenu } from './CytometrySettingsMenu/CytometrySettingsMenu';
import { GraphRangeInputs } from '../GraphRangeInputs';
import { HeatmapWorker } from './helpers/heatmapWorker';
import { useSnackbar } from 'notistack';
import { debounce } from 'lodash';
import { useCytometryGraphStore } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore';
import { HeatmapRanges } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore.types';

export const CytometryGraph = () => {
  const containerRef = useRef(null);
  const theme = useTheme();
  const sx = styles(theme);

  const { enqueueSnackbar } = useSnackbar();
  const { cellMasksData } = useCellSegmentationLayerStore();
  const { settings, updateProteinNames } = useCytometryGraphStore();
  const [heatmapData, setHeatmapData] = useState<{ x: Datum[]; y: Datum[]; z: Datum[][] }>({
    x: [],
    y: [],
    z: []
  });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [xAxisProtein, setXAxisProtein] = useState('');
  const [yAxisProtein, setYAxisProtein] = useState('');
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

      const { ranges, proteinNames } = useCytometryGraphStore.getState();

      setAvailableProteinNames(listOfProteinNames);

      if (!proteinNames.xAxis || !proteinNames.yAxis) {
        setXAxisProtein(listOfProteinNames[0]);
        setYAxisProtein(listOfProteinNames[1]);
      } else {
        setXAxisProtein(proteinNames.xAxis);
        setYAxisProtein(proteinNames.yAxis);
      }

      if (ranges) {
        setSelectionRange(ranges);
      }

      useCytometryGraphStore.setState({
        proteinNames: {
          xAxis: listOfProteinNames[0],
          yAxis: listOfProteinNames[1]
        }
      });
    }
  }, [cellMasksData, enqueueSnackbar]);

  useEffect(() => {
    if (cellMasksData && xAxisProtein && yAxisProtein && settings.binSize) {
      const worker = new HeatmapWorker();
      worker.onMessage((output) => {
        if (output.completed && output.data) {
          setHeatmapData(output.data);
        }
      });
      worker.onError((error) => console.error(error));
      worker.postMessage({
        xValues: cellMasksData.map((mask: any) => mask.proteins[xAxisProtein]),
        yValues: cellMasksData.map((mask: any) => mask.proteins[yAxisProtein]),
        binSize: settings.binSize
      });
    }
  }, [cellMasksData, xAxisProtein, yAxisProtein, settings.binSize]);

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

  const handleProteinChange = useCallback(
    (proteinName: string, axis: 'y' | 'x') =>
      setTimeout(() => {
        updateProteinNames(axis === 'x' ? { xAxis: proteinName } : { yAxis: proteinName });
      }, 10),
    [updateProteinNames]
  );

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
        text: xAxisProtein,
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
        text: yAxisProtein,
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
      <Box sx={sx.headerWrapper}>
        <Box sx={sx.selectWrapper}>
          <Typography sx={sx.selectLabel}>X Axis Source: </Typography>
          <GxSelect
            fullWidth
            value={xAxisProtein}
            onChange={(e) => {
              setXAxisProtein(e.target.value as string);
              handleProteinChange(e.target.value as string, 'x');
            }}
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
            onChange={(e) => {
              setYAxisProtein(e.target.value as string);
              handleProteinChange(e.target.value as string, 'y');
            }}
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
        {plotData && (
          <Plot
            data={plotData}
            layout={layout as Partial<Layout>}
            config={{
              modeBarButtons: [['select2d', 'zoom2d', 'zoomIn2d', 'zoomOut2d', 'pan2d', 'autoScale2d', 'resetViews']],
              responsive: true,
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

const styles = (theme: Theme) => ({
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
  },
  headerWrapper: {
    display: 'flex',
    alignItems: 'center',
    height: 'min-content'
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
