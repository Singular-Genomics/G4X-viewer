export type ZarrDataStore = ZarrDataStoreValues & ZarrDataStoreMethods;

export type ZarrDataStoreValues = {
  fileName: string;
  files: File[];
  layerConfig: LayerConfig;
  colorMapConfig: ColorMapEntry[];
  zarrUrl: string | undefined;
};

export type ZarrDataStoreMethods = {
  setFileName: (newFileName: string) => void;
  setFiles: (files: File[]) => void;
  setLayerConfig: (layerConfig: LayerConfig) => void;
  setColormapConfig: (colorMapConfig: ColorMapEntry[]) => void;
  setZarrUrl: (zarrUrl: string | undefined) => void;
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
