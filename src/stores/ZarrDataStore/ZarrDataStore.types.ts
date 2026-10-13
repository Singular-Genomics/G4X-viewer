import type { ZarritaStoreFactory } from '../../utils/ZarrDataSet.types';
import type { ZarrDataSet } from '../../utils/ZarrDataSet';

export type ZarrDataStore = ZarrDataStoreValues & ZarrDataStoreMethods;

export type ZarrDataStoreValues = {
  fileName: string;
  layerConfig: LayerConfig;
  colorMapConfig: ColorMapEntry[];
  loadedColorMapConfig: ColorMapEntry[];
  zarrUrl: string | undefined;
  hasTranscriptsData: boolean;
  hasSegmentationData: boolean;
  transcriptConfigLoaded: boolean;
  pendingTranscriptAttrs: Record<string, any> | null;
  zarrStoreFactory: ZarritaStoreFactory | undefined;
  zarrDataSet: ZarrDataSet | null;
  directSeq: DirectSeqData;
};

// Direct-Seq (optional second batch of transcripts), loaded on demand
export type DirectSeqData = {
  hasData: boolean;
  configLoaded: boolean;
  layerConfig: LayerConfig;
  colorMapConfig: ColorMapEntry[];
};

export type ZarrDataStoreMethods = {
  setFileName: (newFileName: string) => void;
  setLayerConfig: (layerConfig: LayerConfig) => void;
  setColormapConfig: (colorMapConfig: ColorMapEntry[]) => void;
  setLoadedColorMapConfig: (loadedColorMapConfig: ColorMapEntry[]) => void;
  setZarrUrl: (zarrUrl: string | undefined) => void;
  setHasTranscriptsData: (hasTranscriptsData: boolean) => void;
  setHasSegmentationData: (hasSegmentationData: boolean) => void;
  setTranscriptConfigLoaded: (loaded: boolean) => void;
  setPendingTranscriptAttrs: (attrs: Record<string, any> | null) => void;
  setZarrStoreFactory: (factory: ZarritaStoreFactory | undefined) => void;
  setDirectSeqData: (data: Partial<DirectSeqData>) => void;
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
