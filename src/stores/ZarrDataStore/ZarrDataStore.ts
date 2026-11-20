import { create } from 'zustand';
import { ZarrDataStore, ZarrDataStoreValues, LayerConfig, DirectSeqData } from './ZarrDataStore.types';

const defaultLayerConfig: LayerConfig = {
  layer_width: 16000,
  layer_height: 15232,
  layers: 6,
  tile_size: 4096
};

const createDefaultDirectSeqData = (): DirectSeqData => ({
  hasData: false,
  configLoaded: false,
  layerConfig: defaultLayerConfig,
  colorMapConfig: []
});

const createDefaultZarrDataStoreValues = (): ZarrDataStoreValues => ({
  fileName: '',
  layerConfig: defaultLayerConfig,
  colorMapConfig: [],
  loadedColorMapConfig: [],
  zarrUrl: undefined,
  hasTranscriptsData: false,
  hasSegmentationData: false,
  transcriptConfigLoaded: false,
  pendingTranscriptAttrs: null,
  zarrStoreFactory: undefined,
  zarrDataSet: null,
  directSeq: createDefaultDirectSeqData()
});

export const useZarrDataStore = create<ZarrDataStore>((set) => ({
  ...createDefaultZarrDataStoreValues(),
  setFileName: (newFileName) => set({ fileName: newFileName }),
  setLayerConfig: (layerConfig) => set({ layerConfig }),
  setColormapConfig: (colorMapConfig) => set({ colorMapConfig }),
  setLoadedColorMapConfig: (loadedColorMapConfig) => set({ loadedColorMapConfig }),
  setZarrUrl: (zarrUrl) => set({ zarrUrl }),
  setHasTranscriptsData: (hasTranscriptsData) => set({ hasTranscriptsData }),
  setHasSegmentationData: (hasSegmentationData) => set({ hasSegmentationData }),
  setTranscriptConfigLoaded: (transcriptConfigLoaded) => set({ transcriptConfigLoaded }),
  setPendingTranscriptAttrs: (pendingTranscriptAttrs) => set({ pendingTranscriptAttrs }),
  setZarrStoreFactory: (zarrStoreFactory) => set({ zarrStoreFactory }),
  setDirectSeqData: (data) => set((store) => ({ directSeq: { ...store.directSeq, ...data } })),
  reset: () => set({ ...createDefaultZarrDataStoreValues() })
}));
