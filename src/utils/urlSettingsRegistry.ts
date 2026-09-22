import { DETAIL_VIEW_ID } from '@hms-dbmi/viv';
import { useBrightfieldImagesStore } from '../stores/BrightfieldImagesStore';
import { useCellSegmentationLayerStore } from '../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useTranscriptLayerStore } from '../stores/TranscriptLayerStore';
import { useChannelsStore } from '../stores/ChannelsStore';
import { useViewerStore } from '../stores/ViewerStore/ViewerStore';
import { usePolygonDrawingStore } from '../stores/PolygonDrawingStore';
import { SettingDef } from './urlSettings.types';
import {
  decodeColors,
  decodeContrastLimits,
  decodeSelectionIndices,
  decodeVisible,
  encodeColors,
  encodeContrastLimits,
  encodeSelectionIndices,
  encodeVisible
} from './urlSettings.channelHelpers';
import { encodeFilterIndices, encodeChangedColors } from './urlSettings.cellFilterHelpers';
import { encodeTranscriptFilterIndices, encodeTranscriptChangedColors } from './urlSettings.transcriptHelpers';
import { useZarrDataStore } from '../stores/ZarrDataStore';
import { useUmapGraphStore } from '../stores/UmapGraphStore/UmapGraphStore';
import { useCytometryGraphStore } from '../stores/CytometryGraphStore/CytometryGraphStore';
import {
  AVAILABLE_AXIS_TYPES,
  AVAILABLE_COLORSCALES,
  AVAILABLE_EXPONENT_FORMATS,
  AVAILABLE_GRAPH_MODES
} from '../stores/CytometryGraphStore/CytometryGraphStore.types';
import { URL_KEYS } from './urlSettings.keys';

export const SETTINGS_REGISTRY: SettingDef[] = [
  // Layer visibility
  {
    key: URL_KEYS.channelsVisible,
    type: 'boolean',
    defaultValue: true,
    read: () => useChannelsStore.getState().isLayerVisible,
    write: (val) => useChannelsStore.setState({ isLayerVisible: val as boolean })
  },
  {
    key: URL_KEYS.heVisible,
    type: 'boolean',
    defaultValue: true,
    read: () => useBrightfieldImagesStore.getState().isLayerVisible,
    write: (val) => useBrightfieldImagesStore.setState({ isLayerVisible: val as boolean })
  },
  {
    key: URL_KEYS.transcriptOn,
    type: 'boolean',
    defaultValue: false,
    read: () => useTranscriptLayerStore.getState().isTranscriptLayerOn,
    write: (val) => useTranscriptLayerStore.setState({ isTranscriptLayerOn: val as boolean })
  },
  {
    key: URL_KEYS.cellOn,
    type: 'boolean',
    defaultValue: false,
    read: () => useCellSegmentationLayerStore.getState().isCellLayerOn,
    write: (val) => useCellSegmentationLayerStore.setState({ isCellLayerOn: val as boolean })
  },
  // View settings
  {
    key: URL_KEYS.overview,
    type: 'boolean',
    defaultValue: true,
    read: () => useViewerStore.getState().isOverviewOn,
    write: (val) => useViewerStore.setState({ isOverviewOn: val as boolean })
  },
  {
    key: URL_KEYS.globalT,
    type: 'number',
    defaultValue: 0,
    read: () => useViewerStore.getState().globalSelection.t ?? 0,
    write: (val) =>
      useViewerStore.setState((state) => ({
        globalSelection: { ...state.globalSelection, t: val as number }
      }))
  },
  {
    key: URL_KEYS.globalZ,
    type: 'number',
    defaultValue: 0,
    read: () => useViewerStore.getState().globalSelection.z ?? 0,
    write: (val) =>
      useViewerStore.setState((state) => ({
        globalSelection: { ...state.globalSelection, z: val as number }
      }))
  },
  {
    key: URL_KEYS.camera,
    type: 'string',
    defaultValue: '',
    read: () => {
      const { viewState } = useViewerStore.getState();
      if (!viewState || !Array.isArray(viewState.target) || typeof viewState.zoom !== 'number') {
        return '';
      }
      const [x, y] = viewState.target;
      return `${Number(x.toFixed(2))},${Number(y.toFixed(2))},${Number(viewState.zoom.toFixed(4))}`;
    },
    write: (val) => {
      if (!val || typeof val !== 'string') return;
      const parts = (val as string).split(',').map(Number);
      if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return;
      const [x, y, zoom] = parts;
      const current = useViewerStore.getState().viewState;
      useViewerStore.setState({
        viewState: {
          ...(current ?? {}),
          // id is required: PictureInPictureViewer matches viewState by id === DETAIL_VIEW_ID
          id: DETAIL_VIEW_ID,
          target: [x, y, 0],
          zoom
        }
      });
    }
  },
  {
    key: URL_KEYS.polygonVisible,
    type: 'boolean',
    defaultValue: true,
    read: () => usePolygonDrawingStore.getState().isPolygonLayerVisible,
    write: (val) => usePolygonDrawingStore.setState({ isPolygonLayerVisible: val as boolean })
  },
  {
    key: URL_KEYS.polygonOpacity,
    type: 'number',
    defaultValue: 0.5,
    read: () => usePolygonDrawingStore.getState().polygonOpacity,
    write: (val) => usePolygonDrawingStore.setState({ polygonOpacity: val as number })
  },
  // Transcript layer settings
  {
    key: URL_KEYS.transcriptGeneFilterActive,
    type: 'boolean',
    defaultValue: false,
    read: () => useTranscriptLayerStore.getState().isGeneNameFilterActive,
    write: (val) => useTranscriptLayerStore.setState({ isGeneNameFilterActive: val as boolean })
  },
  {
    key: URL_KEYS.transcriptShowFiltered,
    type: 'boolean',
    defaultValue: false,
    read: () => useTranscriptLayerStore.getState().showFilteredPoints,
    write: (val) => useTranscriptLayerStore.setState({ showFilteredPoints: val as boolean })
  },
  {
    key: URL_KEYS.transcriptPointSize,
    type: 'number',
    defaultValue: 1.5,
    read: () => useTranscriptLayerStore.getState().pointSize,
    write: (val) => useTranscriptLayerStore.setState({ pointSize: val as number })
  },
  {
    key: URL_KEYS.transcriptOverrideLayers,
    type: 'boolean',
    defaultValue: false,
    read: () => useTranscriptLayerStore.getState().overrideLayers,
    write: (val) => useTranscriptLayerStore.setState({ overrideLayers: val as boolean })
  },
  {
    key: URL_KEYS.transcriptMaxLayers,
    type: 'number',
    defaultValue: -1,
    read: () => {
      const { maxVisibleLayers } = useTranscriptLayerStore.getState();
      return maxVisibleLayers ?? -1;
    },
    write: (val) => {
      const n = val as number;
      if (n < 0) return;
      useTranscriptLayerStore.setState({ maxVisibleLayers: n });
    }
  },
  {
    key: URL_KEYS.transcriptFilterIndices,
    type: 'string',
    defaultValue: '',
    read: () => {
      const { geneNameFilters } = useTranscriptLayerStore.getState();
      if (!geneNameFilters.length) return '';
      const { colorMapConfig } = useZarrDataStore.getState();
      if (!colorMapConfig.length) return '';
      return encodeTranscriptFilterIndices(geneNameFilters, colorMapConfig);
    },
    write: () => {}
  },
  {
    key: URL_KEYS.transcriptFilterColors,
    type: 'string',
    defaultValue: '',
    read: () => {
      const { colorMapConfig, loadedColorMapConfig } = useZarrDataStore.getState();
      if (!colorMapConfig.length || !loadedColorMapConfig.length) return '';
      return encodeTranscriptChangedColors(colorMapConfig, loadedColorMapConfig);
    },
    write: () => {}
  },
  // UMAP settings
  {
    key: URL_KEYS.umapRanges,
    type: 'string',
    defaultValue: '',
    read: () => {
      const { ranges } = useUmapGraphStore.getState();
      if (!ranges) return '';
      const { xStart, xEnd, yStart, yEnd } = ranges;
      return `${xStart.toFixed(4)},${xEnd.toFixed(4)},${yStart.toFixed(4)},${yEnd.toFixed(4)}`;
    },
    write: (val) => {
      if (!val || typeof val !== 'string') return;
      const parts = (val as string).split(',').map(Number);
      if (parts.length !== 4 || parts.some(isNaN)) return;
      const [xStart, xEnd, yStart, yEnd] = parts;
      if (xStart >= xEnd || yEnd >= yStart) return;
      useUmapGraphStore.setState({ ranges: { xStart, xEnd, yStart, yEnd } });
    }
  },
  {
    key: URL_KEYS.umapPointSize,
    type: 'number',
    defaultValue: 1,
    read: () => useUmapGraphStore.getState().settings.pointSize,
    write: (val) => {
      const n = val as number;
      if (n < 1 || n > 10) return;
      useUmapGraphStore.setState((state) => ({ settings: { ...state.settings, pointSize: n } }));
    }
  },
  {
    key: URL_KEYS.umapSubsampling,
    type: 'number',
    defaultValue: 2,
    read: () => useUmapGraphStore.getState().settings.subsamplingValue,
    write: (val) => {
      const n = val as number;
      if (n < 2 || n > 20) return;
      useUmapGraphStore.setState((state) => ({ settings: { ...state.settings, subsamplingValue: n } }));
    }
  },
  // Cytometry settings
  {
    key: URL_KEYS.cytoGraphMode,
    type: 'string',
    defaultValue: 'scattergl',
    read: () => useCytometryGraphStore.getState().settings.graphMode,
    write: (val) => {
      if (!AVAILABLE_GRAPH_MODES.includes(val as (typeof AVAILABLE_GRAPH_MODES)[number])) return;
      useCytometryGraphStore.setState((state) => ({
        settings: { ...state.settings, graphMode: val as (typeof AVAILABLE_GRAPH_MODES)[number] }
      }));
    }
  },
  {
    key: URL_KEYS.cytoPointSize,
    type: 'number',
    defaultValue: 2,
    read: () => useCytometryGraphStore.getState().settings.pointSize,
    write: (val) => {
      const n = val as number;
      if (n < 1 || n > 10) return;
      useCytometryGraphStore.setState((state) => ({ settings: { ...state.settings, pointSize: n } }));
    }
  },
  {
    key: URL_KEYS.cytoSubsampling,
    type: 'number',
    defaultValue: 2,
    read: () => useCytometryGraphStore.getState().settings.subsamplingValue,
    write: (val) => {
      const n = val as number;
      if (n < 2 || n > 20) return;
      useCytometryGraphStore.setState((state) => ({ settings: { ...state.settings, subsamplingValue: n } }));
    }
  },
  {
    key: URL_KEYS.cytoBinCountX,
    type: 'number',
    defaultValue: 100,
    read: () => useCytometryGraphStore.getState().settings.binCountX,
    write: (val) => {
      const n = val as number;
      if (n < 2) return;
      useCytometryGraphStore.setState((state) => ({ settings: { ...state.settings, binCountX: n } }));
    }
  },
  {
    key: URL_KEYS.cytoBinCountY,
    type: 'number',
    defaultValue: 100,
    read: () => useCytometryGraphStore.getState().settings.binCountY,
    write: (val) => {
      const n = val as number;
      if (n < 2) return;
      useCytometryGraphStore.setState((state) => ({ settings: { ...state.settings, binCountY: n } }));
    }
  },
  {
    key: URL_KEYS.cytoAxisType,
    type: 'string',
    defaultValue: 'linear',
    read: () => useCytometryGraphStore.getState().settings.axisType,
    write: (val) => {
      if (!AVAILABLE_AXIS_TYPES.includes(val as (typeof AVAILABLE_AXIS_TYPES)[number])) return;
      useCytometryGraphStore.setState((state) => ({
        settings: { ...state.settings, axisType: val as (typeof AVAILABLE_AXIS_TYPES)[number] }
      }));
    }
  },
  {
    key: URL_KEYS.cytoExponentFormat,
    type: 'string',
    defaultValue: 'none',
    read: () => useCytometryGraphStore.getState().settings.exponentFormat,
    write: (val) => {
      if (!AVAILABLE_EXPONENT_FORMATS.includes(val as (typeof AVAILABLE_EXPONENT_FORMATS)[number])) return;
      useCytometryGraphStore.setState((state) => ({
        settings: { ...state.settings, exponentFormat: val as (typeof AVAILABLE_EXPONENT_FORMATS)[number] }
      }));
    }
  },
  {
    key: URL_KEYS.cytoColorscale,
    type: 'string',
    defaultValue: 'Singular',
    read: () => useCytometryGraphStore.getState().settings.colorscale.label,
    write: (val) => {
      const scale = AVAILABLE_COLORSCALES.find((c) => c.label === val);
      if (!scale) return;
      useCytometryGraphStore.setState((state) => ({
        settings: {
          ...state.settings,
          colorscale: { ...state.settings.colorscale, label: scale.label, value: scale.value }
        }
      }));
    }
  },
  {
    key: URL_KEYS.cytoColorscaleReversed,
    type: 'boolean',
    defaultValue: false,
    read: () => useCytometryGraphStore.getState().settings.colorscale.reversed,
    write: (val) =>
      useCytometryGraphStore.setState((state) => ({
        settings: { ...state.settings, colorscale: { ...state.settings.colorscale, reversed: val as boolean } }
      }))
  },
  {
    key: URL_KEYS.cytoLowerThreshold,
    type: 'number',
    defaultValue: -1,
    read: () => useCytometryGraphStore.getState().settings.colorscale.lowerThreshold ?? -1,
    write: (val) => {
      const n = val as number;
      if (n < 0 || n > 1) return;
      useCytometryGraphStore.setState((state) => ({
        settings: { ...state.settings, colorscale: { ...state.settings.colorscale, lowerThreshold: n } }
      }));
    }
  },
  {
    key: URL_KEYS.cytoUpperThreshold,
    type: 'number',
    defaultValue: -1,
    read: () => useCytometryGraphStore.getState().settings.colorscale.upperThreshold ?? -1,
    write: (val) => {
      const n = val as number;
      if (n < 0 || n > 1) return;
      useCytometryGraphStore.setState((state) => ({
        settings: { ...state.settings, colorscale: { ...state.settings.colorscale, upperThreshold: n } }
      }));
    }
  },
  // Cytometry filter - applied after cell data loads (see applyCytometryFilterUrlSettings)
  {
    key: URL_KEYS.cytoAxes,
    type: 'string',
    defaultValue: '',
    read: () => {
      const { xAxisIndex, yAxisIndex } = useCytometryGraphStore.getState().proteinIndices;
      if (xAxisIndex < 0 || yAxisIndex < 0) return '';
      return `${xAxisIndex},${yAxisIndex}`;
    },
    write: () => {}
  },
  {
    key: URL_KEYS.cytoRanges,
    type: 'string',
    defaultValue: '',
    read: () => {
      const { ranges } = useCytometryGraphStore.getState();
      if (!ranges) return '';
      const { xStart, xEnd, yStart, yEnd } = ranges;
      return `${xStart.toFixed(4)},${xEnd.toFixed(4)},${yStart.toFixed(4)},${yEnd.toFixed(4)}`;
    },
    write: () => {}
  },
  // Cell segmentation settings
  {
    key: URL_KEYS.segFillOpacity,
    type: 'number',
    defaultValue: 0.2,
    read: () => useCellSegmentationLayerStore.getState().cellFillOpacity,
    write: (val) => useCellSegmentationLayerStore.setState({ cellFillOpacity: val as number })
  },
  {
    key: URL_KEYS.segShowBoundary,
    type: 'boolean',
    defaultValue: false,
    read: () => useCellSegmentationLayerStore.getState().showBoundary,
    write: (val) => useCellSegmentationLayerStore.setState({ showBoundary: val as boolean })
  },
  {
    key: URL_KEYS.segBoundaryWidth,
    type: 'number',
    defaultValue: 1,
    read: () => useCellSegmentationLayerStore.getState().boundaryWidth,
    write: (val) => useCellSegmentationLayerStore.setState({ boundaryWidth: val as number })
  },
  {
    key: URL_KEYS.segCellFilterOn,
    type: 'boolean',
    defaultValue: false,
    read: () => useCellSegmentationLayerStore.getState().isCellNameFilterOn,
    write: (val) => useCellSegmentationLayerStore.setState({ isCellNameFilterOn: val as boolean })
  },
  {
    key: URL_KEYS.segClusterKey,
    type: 'string',
    defaultValue: '',
    read: () => {
      const { selectedClusterLabelKey, availableClusterLabels } = useCellSegmentationLayerStore.getState();
      if (!availableClusterLabels.length || selectedClusterLabelKey === availableClusterLabels[0].key) return '';
      return selectedClusterLabelKey;
    },
    write: () => {}
  },
  {
    key: URL_KEYS.segFilterIndices,
    type: 'string',
    defaultValue: '',
    read: () => {
      const { cellNameFilters, availableClusterLabels, selectedClusterLabelKey } =
        useCellSegmentationLayerStore.getState();
      if (!cellNameFilters.length) return '';
      const label = availableClusterLabels.find((l) => l.key === selectedClusterLabelKey);
      if (!label) return '';
      return encodeFilterIndices(cellNameFilters, label.clusterIdOrder);
    },
    write: () => {}
  },
  {
    key: URL_KEYS.segFilterColors,
    type: 'string',
    defaultValue: '',
    read: () => {
      const { cellColormapConfig, availableClusterLabels, selectedClusterLabelKey } =
        useCellSegmentationLayerStore.getState();
      if (!cellColormapConfig.length) return '';
      const label = availableClusterLabels.find((l) => l.key === selectedClusterLabelKey);
      if (!label) return '';
      return encodeChangedColors(cellColormapConfig, label.clusterIdColors, label.clusterIdOrder);
    },
    write: () => {}
  },
  {
    key: URL_KEYS.segShowFiltered,
    type: 'boolean',
    defaultValue: false,
    read: () => useCellSegmentationLayerStore.getState().showFilteredCells,
    write: (val) => useCellSegmentationLayerStore.setState({ showFilteredCells: val as boolean })
  },
  // Brightfield images settings
  {
    key: URL_KEYS.heOpacity,
    type: 'number',
    defaultValue: 1,
    read: () => useBrightfieldImagesStore.getState().opacity,
    write: (val) => useBrightfieldImagesStore.setState({ opacity: val as number })
  },
  {
    key: URL_KEYS.heImage,
    type: 'string',
    defaultValue: '',
    read: () => {
      const { brightfieldImageSource } = useBrightfieldImagesStore.getState();
      if (!brightfieldImageSource) return '';
      const { urlOrFile } = brightfieldImageSource;
      if (typeof urlOrFile !== 'string') return '';
      return urlOrFile;
    },
    write: (val) => {
      if (!val) return;
      useBrightfieldImagesStore.getState().setActiveImage(val as string);
    }
  },
  // Channel settings
  {
    key: URL_KEYS.channelCount,
    type: 'number',
    defaultValue: -1,
    read: () => {
      const { channelsVisible, loadedChannelsVisible } = useChannelsStore.getState();
      // Only when channels were removed from the loaded set
      if (!loadedChannelsVisible.length || channelsVisible.length === loadedChannelsVisible.length) return -1;
      return channelsVisible.length;
    },
    write: (val) => {
      const targetCount = val as number;
      if (targetCount < 1) return;
      const store = useChannelsStore.getState();
      const currentCount = store.channelsVisible.length;
      for (let i = currentCount - 1; i >= targetCount; i--) {
        store.removeChannel(i);
      }
    }
  },
  {
    key: URL_KEYS.colormap,
    type: 'string',
    defaultValue: '',
    read: () => useViewerStore.getState().colormap,
    write: (val) => useViewerStore.setState({ colormap: val as string })
  },
  {
    key: URL_KEYS.lensOn,
    type: 'boolean',
    defaultValue: false,
    read: () => useViewerStore.getState().isLensOn,
    write: (val) => useViewerStore.setState({ isLensOn: val as boolean })
  },
  {
    key: URL_KEYS.lensSelection,
    type: 'number',
    defaultValue: 0,
    read: () => useViewerStore.getState().lensSelection,
    write: (val) => useViewerStore.setState({ lensSelection: val as number })
  },
  {
    key: URL_KEYS.channelVisibility,
    type: 'string',
    defaultValue: '',
    read: () => {
      const { channelsVisible, soloChannelIndex, presoloChannelsVisible, loadedChannelsVisible } =
        useChannelsStore.getState();
      const effective = soloChannelIndex !== null ? presoloChannelsVisible : channelsVisible;
      if (loadedChannelsVisible.length === 0) return '';
      if (
        effective.length === loadedChannelsVisible.length &&
        effective.every((v, i) => v === loadedChannelsVisible[i])
      )
        return '';
      return encodeVisible(effective);
    },
    write: (val) => {
      if (!val) return;
      const store = useChannelsStore.getState();
      const decoded = decodeVisible(val as string);
      const count = Math.min(decoded.length, store.channelsVisible.length);
      for (let i = 0; i < count; i++) {
        store.setPropertiesForChannel(i, { channelsVisible: decoded[i] });
      }
    }
  },
  {
    key: URL_KEYS.channelColors,
    type: 'string',
    defaultValue: '',
    read: () => {
      const { colors, loadedColors } = useChannelsStore.getState();
      if (loadedColors.length === 0) return '';
      if (
        colors.length === loadedColors.length &&
        colors.every(
          (c, i) => c[0] === loadedColors[i][0] && c[1] === loadedColors[i][1] && c[2] === loadedColors[i][2]
        )
      )
        return '';
      return encodeColors(colors);
    },
    write: (val) => {
      if (!val) return;
      const store = useChannelsStore.getState();
      const decoded = decodeColors(val as string);
      const count = Math.min(decoded.length, store.colors.length);
      for (let i = 0; i < count; i++) {
        if (decoded[i].some((c) => !Number.isFinite(c))) continue;
        store.setPropertiesForChannel(i, { colors: decoded[i] });
      }
    }
  },
  {
    key: URL_KEYS.channelContrast,
    type: 'string',
    defaultValue: '',
    read: () => {
      const { contrastLimits, loadedContrastLimits } = useChannelsStore.getState();
      if (loadedContrastLimits.length === 0) return '';
      if (
        contrastLimits.length === loadedContrastLimits.length &&
        contrastLimits.every((c, i) => c[0] === loadedContrastLimits[i][0] && c[1] === loadedContrastLimits[i][1])
      )
        return '';
      return encodeContrastLimits(contrastLimits);
    },
    write: (val) => {
      if (!val) return;
      const store = useChannelsStore.getState();
      const decoded = decodeContrastLimits(val as string);
      const count = Math.min(decoded.length, store.contrastLimits.length);
      for (let i = 0; i < count; i++) {
        if (decoded[i].some((c) => !Number.isFinite(c))) continue;
        store.setPropertiesForChannel(i, { contrastLimits: decoded[i] });
      }
    }
  },
  {
    key: URL_KEYS.channelSelections,
    type: 'string',
    defaultValue: '',
    read: () => {
      const { selections, loadedSelections } = useChannelsStore.getState();
      const indices = selections.map((s, i) => s.c ?? i);
      // Baseline is the loaded image's active channels, not 0..n
      if (loadedSelections.length === indices.length && indices.every((v, i) => v === loadedSelections[i])) return '';
      return encodeSelectionIndices(indices);
    },
    write: (val) => {
      if (!val) return;
      const store = useChannelsStore.getState();
      const channelOptions = useViewerStore.getState().channelOptions;
      const decoded = decodeSelectionIndices(val as string);
      const count = Math.min(decoded.length, store.selections.length);
      for (let i = 0; i < count; i++) {
        if (!Number.isInteger(decoded[i]) || decoded[i] < 0) continue;
        const c = channelOptions.length > 0 ? Math.min(decoded[i], channelOptions.length - 1) : decoded[i];
        store.setPropertiesForChannel(i, { selections: { ...store.selections[i], c } });
      }
    }
  },
  {
    key: URL_KEYS.soloChannel,
    type: 'number',
    defaultValue: -1,
    read: () => {
      const { soloChannelIndex } = useChannelsStore.getState();
      return soloChannelIndex ?? -1;
    },
    write: (val) => {
      const index = val as number;
      if (index < 0) return;
      // applyUrlSettings runs twice; setSoloChannel toggles, so set state idempotently.
      useChannelsStore.setState((store) => {
        if (index >= store.channelsVisible.length) return store;
        return {
          presoloChannelsVisible:
            store.soloChannelIndex === null ? [...store.channelsVisible] : store.presoloChannelsVisible,
          soloChannelIndex: index,
          channelsVisible: store.channelsVisible.map((_, i) => i === index)
        };
      });
    }
  }
];
