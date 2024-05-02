export type FilesState = {
  fileName: string;
  files: File[];
  setFiles: (files: File[]) => void;
  setFileName: (newFileName: string) => void;
  config: LayerConfig;
  setConfig: (config: LayerConfig) => void;
};

export type LayerConfig = {
  layer_height: number;
  layer_width: number;
  layers: number;
  tile_size: number;
};
