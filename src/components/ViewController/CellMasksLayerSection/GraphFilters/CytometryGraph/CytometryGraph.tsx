import { alpha, Box, Theme, Typography, useTheme } from '@mui/material';
import Plot from 'react-plotly.js';
import { Data, Layout } from 'plotly.js';
import { useEffect, useRef, useState } from 'react';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { GraphRangeInputs } from '../GraphRangeInputs';
import { useSnackbar } from 'notistack';
import { debounce } from 'lodash';
import { useCytometryGraphStore } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore';
import { HeatmapRanges } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore.types';
import { CytometryHeader } from './CytometryHeader/CytometryHeader';
import { CytometryWorker } from './helpers/cytometryWorker';
import { GxLoader } from '../../../../../shared/components/GxLoader';
import { GraphData, LoaderInfo } from './CytometryGraph.types';
import { mapValuesToColors } from './CytometryGraph.helpers';
import { ColorscaleSlider } from './ColorscaleSlider/ColorscaleSlider';

export const CytometryGraph = () => {
  const containerRef = useRef(null);
  const theme = useTheme();
  const sx = styles(theme);

  const { enqueueSnackbar } = useSnackbar();
  const { cellMasksData } = useCellSegmentationLayerStore();
  const { proteinNames, settings } = useCytometryGraphStore();
  const [loader, setLoader] = useState<LoaderInfo | undefined>();
  const [heatmapData, setHeatmapData] = useState<GraphData>({ axisType: 'linear', graphMode: 'scattergl' });
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
    if (cellMasksData && proteinNames.xAxis && proteinNames.yAxis && settings.binCountX && settings.binCountY) {
      const worker = new CytometryWorker();
      worker.onMessage((output) => {
        if (output.completed && output.success && output.data) {
          setHeatmapData({
            ...output,
            graphMode: settings.graphMode,
            axisType: settings.axisType
          });
          setLoader(undefined);
        } else if (output.completed && !output.success) {
          enqueueSnackbar({
            message: output.message,
            variant: 'error'
          });
        } else {
          setLoader({
            progress: output.progress,
            message: output.message
          });
        }
      });
      worker.onError((error: any) => console.error(error));
      worker.postMessage({
        maskData: cellMasksData,
        xProteinName: proteinNames.xAxis,
        yProteinName: proteinNames.yAxis,
        binXCount: settings.binCountX,
        binYCount: settings.binCountY,
        axisType: settings.axisType,
        subsamplingStep: settings.subsamplingValue,
        graphMode: settings.graphMode
      });
    }
  }, [
    cellMasksData,
    proteinNames.xAxis,
    proteinNames.yAxis,
    settings.binCountX,
    settings.binCountY,
    settings.axisType,
    settings.subsamplingValue,
    settings.graphMode,
    enqueueSnackbar
  ]);

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
      x: heatmapData.data?.x,
      y: heatmapData.data?.y,
      hoverinfo: 'x+y+z',
      ...(heatmapData.graphMode === 'scattergl'
        ? {
            type: 'scattergl',
            mode: 'markers',
            marker: {
              color: mapValuesToColors(
                heatmapData.data?.z as number[],
                settings.colorscale.value,
                settings.colorscale.upperThreshold,
                settings.colorscale.lowerThreshold,
                settings.colorscale.reversed
              ),
              size: settings.pointSize
            },
            hovertemplate: 'X: %{x}<br>Y: %{y}<br><extra></extra>'
          }
        : {
            type: 'heatmap',
            z: heatmapData.data?.z,
            colorscale: settings.colorscale.value,
            reversescale: settings.colorscale.reversed,
            hovertemplate: 'X: %{x}<br>Y: %{y}<br><extra></extra>',
            showscale: false
          })
    }
  ];

  const layout = {
    dragmode: 'select',
    hovermode: 'closest',
    uirevision: 'true',
    margin: { t: 50, r: 100, b: 80, l: 100 },
    paper_bgcolor: theme.palette.gx.primary.white,
    plot_bgcolor: theme.palette.gx.lightGrey[900],
    xaxis: {
      title: {
        text: proteinNames.xAxis,
        font: { size: 14 }
      },
      type: heatmapData.axisType,
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
      type: heatmapData.axisType,
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
        {loader && (
          <Box sx={sx.loaderWrapper}>
            <Box sx={sx.loaderInfoBox}>
              <GxLoader />
              <Typography sx={sx.loaderProgressValueText}>{`${loader?.progress} %`}</Typography>
              {loader?.message && <Typography sx={sx.loaderProgressMessage}>{loader.message}</Typography>}
            </Box>
          </Box>
        )}
        <Plot
          data={loader ? [] : plotData}
          layout={layout as Partial<Layout>}
          config={{
            modeBarButtons: [
              ['select2d', 'zoom2d', 'zoomIn2d', 'zoomOut2d', 'pan2d', 'autoScale2d', 'resetViews', 'toImage']
            ],
            scrollZoom: true,
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
      </Box>
      <Box sx={{ backgroundColor: theme.palette.gx.primary.white, paddingInline: '32px' }}>
        <ColorscaleSlider
          min={heatmapData.metadata?.zMin}
          max={heatmapData.metadata?.zMax}
          disabled={heatmapData.graphMode === 'heatmap'}
        />
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
    position: 'relative',
    height: '100%',
    width: '100%'
  },
  loaderWrapper: {
    position: 'absolute',
    zIndex: 10,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loaderInfoBox: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px',
    background: alpha(theme.palette.gx.darkGrey[500], 0.55)
  },
  loaderProgressValueText: {
    color: theme.palette.gx.primary.white,
    fontSize: '24px',
    fontWeight: 700,
    marginBlockStart: '16px'
  },
  loaderProgressMessage: {
    color: theme.palette.gx.primary.white,
    fontSize: '24px',
    fontWeight: 700
  },
  plot: {
    width: '100%'
  }
});
