export type BinaryFilesStore = BinaryFilesStoreValues & BinaryFilesStoreMethods;

export type BinaryFilesStoreValues = {
  fileName: string;
  files: File[];
  layerConfig: LayerConfig;
  colorMapConfig: ColorMapEntry[];
  collectiveFileName: string;
};

export type BinaryFilesStoreMethods = {
  setFiles: (files: File[]) => void;
  setFileName: (newFileName: string) => void;
  setLayerConfig: (layerConfig: LayerConfig) => void;
  setColormapConfig: (colorMapConfig: ColorMapEntry[]) => void;
  setCollectiveFileName: (name: string) => void;
  reset: () => void;
};

export type ColorMapEntry = {
  gene_name: string;
  color: number[];
};

export type ConfigFileData = {
  color_map: ColorMapEntry[];
} & LayerConfig;

export type LayerConfig = {
  layer_height: number;
  layer_width: number;
  layers: number;
  tile_size: number;
};
