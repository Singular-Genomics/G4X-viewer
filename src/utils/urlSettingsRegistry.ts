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
  encodeVisible,
  isDefaultSelectionIndices
} from './urlSettings.channelHelpers';

export const SETTINGS_REGISTRY: SettingDef[] = [
  // Layer visibility
  {
    key: 'ch',
    type: 'boolean',
    defaultValue: true,
    read: () => useChannelsStore.getState().isLayerVisible,
    write: (val) => useChannelsStore.setState({ isLayerVisible: val as boolean })
  },
  {
    key: 'he',
    type: 'boolean',
    defaultValue: true,
    read: () => useBrightfieldImagesStore.getState().isLayerVisible,
    write: (val) => useBrightfieldImagesStore.setState({ isLayerVisible: val as boolean })
  },
  {
    key: 'tr',
    type: 'boolean',
    defaultValue: false,
    read: () => useTranscriptLayerStore.getState().isTranscriptLayerOn,
    write: (val) => useTranscriptLayerStore.setState({ isTranscriptLayerOn: val as boolean })
  },
  {
    key: 'seg',
    type: 'boolean',
    defaultValue: false,
    read: () => useCellSegmentationLayerStore.getState().isCellLayerOn,
    write: (val) => useCellSegmentationLayerStore.setState({ isCellLayerOn: val as boolean })
  },
  // View settings
  {
    key: 'ov',
    type: 'boolean',
    defaultValue: true,
    read: () => useViewerStore.getState().isOverviewOn,
    write: (val) => useViewerStore.setState({ isOverviewOn: val as boolean })
  },
  {
    key: 'gt',
    type: 'number',
    defaultValue: 0,
    read: () => useViewerStore.getState().globalSelection.t ?? 0,
    write: (val) =>
      useViewerStore.setState((state) => ({
        globalSelection: { ...state.globalSelection, t: val as number }
      }))
  },
  {
    key: 'gz',
    type: 'number',
    defaultValue: 0,
    read: () => useViewerStore.getState().globalSelection.z ?? 0,
    write: (val) =>
      useViewerStore.setState((state) => ({
        globalSelection: { ...state.globalSelection, z: val as number }
      }))
  },
  {
    key: 'cam',
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
    key: 'pol',
    type: 'boolean',
    defaultValue: true,
    read: () => usePolygonDrawingStore.getState().isPolygonLayerVisible,
    write: (val) => usePolygonDrawingStore.setState({ isPolygonLayerVisible: val as boolean })
  },
  {
    key: 'poa',
    type: 'number',
    defaultValue: 0.5,
    read: () => usePolygonDrawingStore.getState().polygonOpacity,
    write: (val) => usePolygonDrawingStore.setState({ polygonOpacity: val as number })
  },
  // Transcript layer settings
  {
    key: 'tr_gf',
    type: 'boolean',
    defaultValue: false,
    read: () => useTranscriptLayerStore.getState().isGeneNameFilterActive,
    write: (val) => useTranscriptLayerStore.setState({ isGeneNameFilterActive: val as boolean })
  },
  {
    key: 'tr_sf',
    type: 'boolean',
    defaultValue: false,
    read: () => useTranscriptLayerStore.getState().showFilteredPoints,
    write: (val) => useTranscriptLayerStore.setState({ showFilteredPoints: val as boolean })
  },
  {
    key: 'tr_ps',
    type: 'number',
    defaultValue: 1.5,
    read: () => useTranscriptLayerStore.getState().pointSize,
    write: (val) => useTranscriptLayerStore.setState({ pointSize: val as number })
  },
  {
    key: 'tr_ol',
    type: 'boolean',
    defaultValue: false,
    read: () => useTranscriptLayerStore.getState().overrideLayers,
    write: (val) => useTranscriptLayerStore.setState({ overrideLayers: val as boolean })
  },
  {
    key: 'tr_ml',
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
  // Cell segmentation settings
  {
    key: 'seg_fo',
    type: 'number',
    defaultValue: 0.2,
    read: () => useCellSegmentationLayerStore.getState().cellFillOpacity,
    write: (val) => useCellSegmentationLayerStore.setState({ cellFillOpacity: val as number })
  },
  {
    key: 'seg_sb',
    type: 'boolean',
    defaultValue: false,
    read: () => useCellSegmentationLayerStore.getState().showBoundary,
    write: (val) => useCellSegmentationLayerStore.setState({ showBoundary: val as boolean })
  },
  {
    key: 'seg_bw',
    type: 'number',
    defaultValue: 1,
    read: () => useCellSegmentationLayerStore.getState().boundaryWidth,
    write: (val) => useCellSegmentationLayerStore.setState({ boundaryWidth: val as number })
  },
  {
    key: 'seg_cf',
    type: 'boolean',
    defaultValue: false,
    read: () => useCellSegmentationLayerStore.getState().isCellNameFilterOn,
    write: (val) => useCellSegmentationLayerStore.setState({ isCellNameFilterOn: val as boolean })
  },
  {
    key: 'seg_sf',
    type: 'boolean',
    defaultValue: false,
    read: () => useCellSegmentationLayerStore.getState().showFilteredCells,
    write: (val) => useCellSegmentationLayerStore.setState({ showFilteredCells: val as boolean })
  },
  // Brightfield images settings
  {
    key: 'he_op',
    type: 'number',
    defaultValue: 1,
    read: () => useBrightfieldImagesStore.getState().opacity,
    write: (val) => useBrightfieldImagesStore.setState({ opacity: val as number })
  },
  {
    key: 'he_img',
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
    key: 'ch_n',
    type: 'number',
    defaultValue: -1,
    read: () => {
      const { channelsVisible } = useChannelsStore.getState();
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
    key: 'cm',
    type: 'string',
    defaultValue: '',
    read: () => useViewerStore.getState().colormap,
    write: (val) => useViewerStore.setState({ colormap: val as string })
  },
  {
    key: 'ln',
    type: 'boolean',
    defaultValue: false,
    read: () => useViewerStore.getState().isLensOn,
    write: (val) => useViewerStore.setState({ isLensOn: val as boolean })
  },
  {
    key: 'ls',
    type: 'number',
    defaultValue: 0,
    read: () => useViewerStore.getState().lensSelection,
    write: (val) => useViewerStore.setState({ lensSelection: val as number })
  },
  {
    key: 'ch_v',
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
    key: 'ch_c',
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
        store.setPropertiesForChannel(i, { colors: decoded[i] });
      }
    }
  },
  {
    key: 'ch_cl',
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
        store.setPropertiesForChannel(i, { contrastLimits: decoded[i] });
      }
    }
  },
  {
    key: 'ch_s',
    type: 'string',
    defaultValue: '',
    read: () => {
      const { selections } = useChannelsStore.getState();
      const indices = selections.map((s, i) => s.c ?? i);
      return isDefaultSelectionIndices(indices) ? '' : encodeSelectionIndices(indices);
    },
    write: (val) => {
      if (!val) return;
      const store = useChannelsStore.getState();
      const channelOptions = useViewerStore.getState().channelOptions;
      const decoded = decodeSelectionIndices(val as string);
      const count = Math.min(decoded.length, store.selections.length);
      for (let i = 0; i < count; i++) {
        const c = channelOptions.length > 0 ? Math.min(decoded[i], channelOptions.length - 1) : decoded[i];
        store.setPropertiesForChannel(i, { selections: { ...store.selections[i], c } });
      }
    }
  },
  {
    key: 'ch_si',
    type: 'number',
    defaultValue: -1,
    read: () => {
      const { soloChannelIndex } = useChannelsStore.getState();
      return soloChannelIndex ?? -1;
    },
    write: (val) => {
      const index = val as number;
      if (index < 0) return;
      useChannelsStore.getState().setSoloChannel(index);
    }
  }
];
