export type FilesState = {
  files: File[];
  setFiles: (files: File[]) => void;
  config: LayerConfig;
  setConfig: (config: LayerConfig) => void;
};

export type LayerConfig = {
  layer_height: number;
  layer_width: number;
  layers: number;
  tile_size: number;
};
