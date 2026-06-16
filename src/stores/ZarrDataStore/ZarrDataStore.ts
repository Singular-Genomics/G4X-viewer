import { create } from 'zustand';
import { ZarrDataStore, ZarrDataStoreValues, LayerConfig } from './ZarrDataStore.types';

const defaultLayerConfig: LayerConfig = {
  layer_width: 16000,
  layer_height: 15232,
  layers: 6,
  tile_size: 4096
};

const DEFAULT_ZARR_DATA_STORE_VALUES: ZarrDataStoreValues = {
  fileName: '',
  layerConfig: defaultLayerConfig,
  colorMapConfig: [],
  zarrUrl: undefined,
  hasTranscriptsData: false,
  hasSegmentationData: false,
  transcriptConfigLoaded: false,
  pendingTranscriptAttrs: null,
  zarrStoreFactory: undefined,
  zarrDataSet: null
};

export const useZarrDataStore = create<ZarrDataStore>((set) => ({
  ...DEFAULT_ZARR_DATA_STORE_VALUES,
  setFileName: (newFileName) => set({ fileName: newFileName }),
  setLayerConfig: (layerConfig) => set({ layerConfig }),
  setColormapConfig: (colorMapConfig) => set({ colorMapConfig }),
  setZarrUrl: (zarrUrl) => set({ zarrUrl }),
  setHasTranscriptsData: (hasTranscriptsData) => set({ hasTranscriptsData }),
  setHasSegmentationData: (hasSegmentationData) => set({ hasSegmentationData }),
  setTranscriptConfigLoaded: (transcriptConfigLoaded) => set({ transcriptConfigLoaded }),
  setPendingTranscriptAttrs: (pendingTranscriptAttrs) => set({ pendingTranscriptAttrs }),
  setZarrStoreFactory: (zarrStoreFactory) => set({ zarrStoreFactory }),
  reset: () => set({ ...DEFAULT_ZARR_DATA_STORE_VALUES })
}));
