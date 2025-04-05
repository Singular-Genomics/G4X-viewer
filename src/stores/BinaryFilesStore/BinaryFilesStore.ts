import { create } from 'zustand';
import { BinaryFilesStore, BinaryFilesStoreValues, LayerConfig } from './BinaryFilesStore.types';

const defaultLayerConfig: LayerConfig = {
  layer_width: 16000,
  layer_height: 15232,
  layers: 6,
  tile_size: 4096
};

const DEFAULT_BINARY_FILE_STORE_VALUES: BinaryFilesStoreValues = {
  files: [],
  fileName: '',
  collectiveFileName: '',
  layerConfig: defaultLayerConfig,
  colorMapConfig: []
};

export const useBinaryFilesStore = create<BinaryFilesStore>((set) => ({
  ...DEFAULT_BINARY_FILE_STORE_VALUES,
  setFiles: (files) => set({ files }),
  setFileName: (newFileName) => set({ fileName: newFileName }),
  setCollectiveFileName: (name) => set({ collectiveFileName: name }),
  layerConfig: defaultLayerConfig,
  colorMapConfig: [],
  setLayerConfig: (layerConfig) => set({ layerConfig }),
  setColormapConfig: (colorMapConfig) => set({ colorMapConfig }),
  reset: () => set({ ...DEFAULT_BINARY_FILE_STORE_VALUES })
}));
