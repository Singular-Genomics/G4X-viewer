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
  setFiles: (files) => set({ files }),
  config: defaultLayerConfig,
  setConfig: (config) => set({ config }),
}));
