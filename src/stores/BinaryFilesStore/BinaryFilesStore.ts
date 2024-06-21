import { create } from "zustand";
import { FilesState, LayerConfig } from "./BinaryFilesStore.types";

const defaultLayerConfig: LayerConfig = {
  layer_width: 16000,
  layer_height: 15232,
  layers: 6,
  tile_size: 4096,
};

export const useBinaryFilesStore = create<FilesState>((set) => ({
  files: [],
  fileName: '',
  setFiles: (files) => set({ files }),
  setFileName: (newFileName) => set({ fileName: newFileName}),
  layerConfig: defaultLayerConfig,
  colorMapConfig: [],
  setLayerConfig: (layerConfig) => set({ layerConfig }),
  setColormapConfig: (colorMapConfig) => set({ colorMapConfig }),
}));
