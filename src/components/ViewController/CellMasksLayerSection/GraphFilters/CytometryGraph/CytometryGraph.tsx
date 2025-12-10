import { alpha, Box, IconButton, Theme, Typography, useTheme } from '@mui/material';
import Plot from 'react-plotly.js';
import { Data, Layout } from 'plotly.js';
import { useEffect, useRef, useState } from 'react';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { GraphRangeInputs } from '../GraphRangeInputs';
import { useSnackbar } from 'notistack';
import { debounce } from 'lodash';
import { useCytometryGraphStore } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore';
import { HeatmapRanges, ProteinIndices } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore.types';
import { CytometryHeader } from './CytometryHeader/CytometryHeader';
import { CytometryWorker } from './helpers/cytometryWorker';
import { GxLoader } from '../../../../../shared/components/GxLoader';
import { GraphData, LoaderInfo } from './CytometryGraph.types';
import { mapValuesToColors } from './CytometryGraph.helpers';
import { SingleMask } from '../../../../../shared/types';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { GxColorscaleSlider, thresholdColorMap } from '../../../../../shared/components/GxColorscaleSlider';

export function CustomErrorMessage(failedIds: string[], cellMasksData: SingleMask[], proteinIndices: ProteinIndices) {
  const handleDownload = () => {
    if (proteinIndices.xAxisIndex < 0 || proteinIndices.yAxisIndex < 0) {
      console.error('Failed to find protein values');
      return;
    }

    const filteredCells = cellMasksData
      .filter((mask) => failedIds.includes(mask.cellId))
      .map((mask) => ({
        cellId: mask.cellId,
        proteinValues: [mask.proteinValues[proteinIndices.xAxisIndex], mask.proteinValues[proteinIndices.yAxisIndex]]
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
      <Typography>{`${i18n.t('segmentationSettings.cytometryDownloadFailedLabel')}: `}</Typography>
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
  const { cellMasksData, segmentationMetadata } = useCellSegmentationLayerStore();
  const { proteinIndices, settings, updateSettings, ranges: savedRanges } = useCytometryGraphStore();
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

      if (!segmentationMetadata || segmentationMetadata.proteinNames.length < 2) {
        enqueueSnackbar({
          message: t('segmentationSettings.cytometryGraphMissingChannelsError'),
          variant: 'gxSnackbar',
          titleMode: 'error'
        });
        return;
      }

      const { ranges } = useCytometryGraphStore.getState();

      setAvailableProteinNames(segmentationMetadata.proteinNames);

      if (ranges) {
        setSelectionRange(ranges);
      }
    }
  }, [cellMasksData, enqueueSnackbar, t, segmentationMetadata]);

  useEffect(() => {
    if (
      !cellMasksData ||
      proteinIndices.xAxisIndex < 0 ||
      proteinIndices.yAxisIndex < 0 ||
      !settings.binCountX ||
      !settings.binCountY
    ) {
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
            customContent: CustomErrorMessage(output.metadata.failed, cellMasksData, proteinIndices),
            persist: true
          });
        }

        setLoader(undefined);
      } else if (output.completed && !output.success) {
        enqueueSnackbar({
          message: t(`segmentationSettings.cytometryGraphWorker_${output.status}`),
          variant: 'gxSnackbar',
          titleMode: 'error'
        });
      } else {
        setLoader({
          progress: output.progress,
          message: t(`segmentationSettings.cytometryGraphWorker_${output.status}`)
        });
      }
    });
    worker.onError((error: any) => console.error(error));
    worker.postMessage({
      maskData: cellMasksData,
      xProteinIndex: proteinIndices.xAxisIndex,
      yProteinIndex: proteinIndices.yAxisIndex,
      binXCount: settings.binCountX,
      binYCount: settings.binCountY,
      axisType: settings.axisType,
      subsamplingStep: settings.subsamplingValue,
      graphMode: settings.graphMode
    });
  }, [
    cellMasksData,
    proteinIndices,
    proteinIndices.xAxisIndex,
    proteinIndices.yAxisIndex,
    settings.binCountX,
    settings.binCountY,
    settings.axisType,
    settings.subsamplingValue,
    settings.graphMode,
    enqueueSnackbar,
    availableProteinNames,
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

  const handleThresholdChange = (newLowerThreshold: number, newUpperThreshold: number) => {
    const currentColorscaleSettings = useCytometryGraphStore.getState().settings.colorscale;
    updateSettings({
      colorscale: {
        ...currentColorscaleSettings,
        upperThreshold: newUpperThreshold,
        lowerThreshold: newLowerThreshold
      }
    });
  };

  const xProteinName =
    proteinIndices.xAxisIndex >= 0 && proteinIndices.xAxisIndex < availableProteinNames.length
      ? availableProteinNames[proteinIndices.xAxisIndex]
      : '';
  const yProteinName =
    proteinIndices.yAxisIndex >= 0 && proteinIndices.yAxisIndex < availableProteinNames.length
      ? availableProteinNames[proteinIndices.yAxisIndex]
      : '';

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
            hovertemplate: `${xProteinName}: %{x:.2f}<br>${yProteinName}: %{y:.2f}<br>Density: %{text}<extra></extra>`
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
            hovertemplate: `${xProteinName}: %{x:.2f}<br>${yProteinName}: %{y:.2f}<br>Density: %{z:.2f}<extra></extra>`,
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
        text: xProteinName,
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
        text: yProteinName,
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
        <GxColorscaleSlider
          scaleMin={heatmapData.metadata?.zMin}
          scaleMax={heatmapData.metadata?.zMax}
          colorscale={settings.colorscale}
          lowerThreshold={settings.colorscale.lowerThreshold}
          upperThreshold={settings.colorscale.upperThreshold}
          onThresholdChange={handleThresholdChange}
        />
      </Box>
      <GraphRangeInputs
        rangeSource={selectionRange}
        savedRange={savedRanges}
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
