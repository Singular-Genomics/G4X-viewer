export type ZarrDataStore = ZarrDataStoreValues & ZarrDataStoreMethods;

export type ZarrDataStoreValues = {
  fileName: string;
  layerConfig: LayerConfig;
  colorMapConfig: ColorMapEntry[];
  zarrUrl: string | undefined;
  hasTranscriptsData: boolean;
};

export type ZarrDataStoreMethods = {
  setFileName: (newFileName: string) => void;
  setLayerConfig: (layerConfig: LayerConfig) => void;
  setColormapConfig: (colorMapConfig: ColorMapEntry[]) => void;
  setZarrUrl: (zarrUrl: string | undefined) => void;
  setHasTranscriptsData: (hasTranscriptsData: boolean) => void;
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
