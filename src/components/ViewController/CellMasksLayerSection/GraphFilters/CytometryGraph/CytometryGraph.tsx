import { alpha, Box, IconButton, Theme, Typography, useTheme } from '@mui/material';
import Plot from 'react-plotly.js';
import { Data, Layout } from 'plotly.js';
import { useEffect, useRef, useState } from 'react';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { GraphRangeInputs } from '../GraphRangeInputs';
import { useSnackbar } from 'notistack';
import { debounce } from 'lodash';
import { useCytometryGraphStore } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore';
import { HeatmapRanges, ProteinNames } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore.types';
import { CytometryHeader } from './CytometryHeader/CytometryHeader';
import { CytometryWorker } from './helpers/cytometryWorker';
import { GxLoader } from '../../../../../shared/components/GxLoader';
import { GraphData, LoaderInfo } from './CytometryGraph.types';
import { mapValuesToColors, thresholdColorMap } from './CytometryGraph.helpers';
import { ColorscaleSlider } from './ColorscaleSlider/ColorscaleSlider';
import { SingleMask } from '../../../../../shared/types';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';

export function CustomErrorMessage(failedIds: string[], cellMasksData: SingleMask[], proteinNames: ProteinNames) {
  const { t } = useTranslation();
  const handleDownload = () => {
    const filteredCells = cellMasksData
      .filter((mask) => failedIds.includes(mask.cellId))
      .map((mask) => ({
        cellId: mask.cellId,
        proteins: Object.fromEntries(
          Object.entries(mask.proteins).filter(([key]) => Object.values(proteinNames).includes(key))
        )
      }));

    const blob = new Blob([JSON.stringify(filteredCells)], { type: 'application/json' });

    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'FailedCells.json';
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  return (
    <Box sx={messageSx.customErrorMessage}>
      <Typography>{`${t('cytometryDownloadFailedLabel')}: `}</Typography>
      <IconButton onClick={handleDownload}>
        <DownloadIcon sx={messageSx.downloadIcon} />
      </IconButton>
    </Box>
  );
}

export const CytometryGraph = () => {
  const containerRef = useRef(null);
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

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
          message: t('segmentationSettings.cytometryGraphMissingDataError'),
          variant: 'gxSnackbar',
          titleMode: 'error'
        });
        return;
      }

      const listOfProteinNames = Object.keys(cellMasksData[0].proteins);
      if (listOfProteinNames.length < 2) {
        enqueueSnackbar({
          message: t('segmentationSettings.cytometryGraphMissingChannelsError'),
          variant: 'gxSnackbar',
          titleMode: 'error'
        });
        return;
      }

      const { ranges } = useCytometryGraphStore.getState();

      setAvailableProteinNames(listOfProteinNames);

      if (ranges) {
        setSelectionRange(ranges);
      }
    }
  }, [cellMasksData, enqueueSnackbar, t]);

  useEffect(() => {
    if (!cellMasksData || !proteinNames.xAxis || !proteinNames.yAxis || !settings.binCountX || !settings.binCountY) {
      return;
    }

    const worker = new CytometryWorker();

    worker.onMessage((output) => {
      if (output.completed && output.success && output.data) {
        setHeatmapData({
          ...output,
          graphMode: settings.graphMode,
          axisType: settings.axisType
        });

        if (output.metadata?.failed?.length) {
          enqueueSnackbar({
            variant: 'gxSnackbar',
            titleMode: 'error',
            message: t('segmentationSettings.cytometryGraphBinningError', { count: output.metadata.failed.length }),
            customContent: CustomErrorMessage(output.metadata.failed, cellMasksData, proteinNames),
            persist: true
          });
        }

        setLoader(undefined);
      } else if (output.completed && !output.success) {
        enqueueSnackbar({
          message: t(`segmentationSettings.cytometryGraphWorker-${output.status}`),
          variant: 'gxSnackbar',
          titleMode: 'error'
        });
      } else {
        setLoader({
          progress: output.progress,
          message: t(`segmentationSettings.cytometryGraphWorker-${output.status}`)
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
  }, [
    cellMasksData,
    proteinNames,
    proteinNames.xAxis,
    proteinNames.yAxis,
    settings.binCountX,
    settings.binCountY,
    settings.axisType,
    settings.subsamplingValue,
    settings.graphMode,
    enqueueSnackbar,
    t
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

  const handleConfirmFilter = () => {
    if (selectionRange) {
      useCytometryGraphStore.setState({
        ranges: {
          xStart: selectionRange.xStart - 1,
          yStart: selectionRange.yStart - 1,
          xEnd: selectionRange.xEnd - 1,
          yEnd: selectionRange.yEnd - 1
        }
      });
    }
  };

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
            text: heatmapData.data?.z ? heatmapData.data.z.map((e) => (e as number).toFixed(3)) : [],
            hovertemplate: `${proteinNames.xAxis}: %{x:.2f}<br>${proteinNames.yAxis}: %{y:.2f}<br>Density: %{text}<extra></extra>`
          }
        : {
            type: 'heatmap',
            z: heatmapData.data?.z,
            colorscale: thresholdColorMap(
              settings.colorscale.value,
              settings.colorscale.upperThreshold,
              settings.colorscale.lowerThreshold
            ),
            reversescale: settings.colorscale.reversed,
            hovertemplate: `${proteinNames.xAxis}: %{x:.2f}<br>${proteinNames.yAxis}: %{y:.2f}<br>Density: %{z:.2f}<extra></extra>`,
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
              <Typography sx={sx.loaderProgressValueText}>{`${loader?.progress} % `}</Typography>
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
        />
      </Box>
      <GraphRangeInputs
        rangeSource={selectionRange}
        onUpdateRange={(newFilter) => setSelectionRange(newFilter)}
        onClear={() => {
          setSelectionRange(undefined);
          useCytometryGraphStore.setState({ ranges: undefined });
        }}
        onConfirm={handleConfirmFilter}
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

const messageSx = {
  customErrorMessage: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingInline: '16px'
  },
  downloadIcon: {
    color: (theme: Theme) => theme.palette.gx.darkGrey[700]
  }
};
