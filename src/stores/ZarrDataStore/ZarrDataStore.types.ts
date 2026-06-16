import type { ZarritaStoreFactory } from '../../utils/ZarrDataSet.types';
import type { ZarrDataSet } from '../../utils/ZarrDataSet';

export type ZarrDataStore = ZarrDataStoreValues & ZarrDataStoreMethods;

export type ZarrDataStoreValues = {
  fileName: string;
  layerConfig: LayerConfig;
  colorMapConfig: ColorMapEntry[];
  zarrUrl: string | undefined;
  hasTranscriptsData: boolean;
  hasSegmentationData: boolean;
  transcriptConfigLoaded: boolean;
  pendingTranscriptAttrs: Record<string, any> | null;
  zarrStoreFactory: ZarritaStoreFactory | undefined;
  zarrDataSet: ZarrDataSet | null;
};

export type ZarrDataStoreMethods = {
  setFileName: (newFileName: string) => void;
  setLayerConfig: (layerConfig: LayerConfig) => void;
  setColormapConfig: (colorMapConfig: ColorMapEntry[]) => void;
  setZarrUrl: (zarrUrl: string | undefined) => void;
  setHasTranscriptsData: (hasTranscriptsData: boolean) => void;
  setHasSegmentationData: (hasSegmentationData: boolean) => void;
  setTranscriptConfigLoaded: (loaded: boolean) => void;
  setPendingTranscriptAttrs: (attrs: Record<string, any> | null) => void;
  setZarrStoreFactory: (factory: ZarritaStoreFactory | undefined) => void;
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
