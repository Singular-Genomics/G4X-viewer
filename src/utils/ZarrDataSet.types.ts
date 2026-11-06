import { SingleMask, ColormapEntry, SegmentationMetadata } from '../shared/types';
import type { ClusterLabelEntry } from './ZarrCellsLoader';

export type ZarritaReadableStore = { get(key: string): Promise<Uint8Array | undefined> };
export type ZarritaStoreFactory = (subpath: string) => ZarritaReadableStore;

export type ZarrLayerConfig = {
  layer_width: number;
  layer_height: number;
  layers: number;
  tile_size: number;
  /** Absent/1 = legacy per-tile {position, gene_name, cell_id}; 2 = typed-array format (see TranscriptTileFormat) */
  format_version?: number;
  /** v2: only 'split' is supported; positions are uint16 tile-relative */
  layout?: string;
  consolidated_metadata?: boolean;
  /** v2: gene names indexed by `gene_index` (gene_order fallback if missing) */
  gene_index_names?: string[];
};

export type ZarrGeneColors = Record<string, [number, number, number]>;

export type ZarrTranscriptAttrs = {
  layer_config?: ZarrLayerConfig;
  gene_colors?: ZarrGeneColors;
  gene_order?: string[];
};

export type ZarrTileCoordinates = {
  z: number;
  y: number;
  x: number;
};

/** Columnar tile: point i is (positions[2i], positions[2i+1]) in absolute layer pixels, gene = names[geneIndex[i]]. */
export type ZarrTranscriptTileData = {
  length: number;
  positions: Float32Array;
  geneIndex: Uint16Array;
  cellId: Int32Array;
};

export type ZarrCellsData = {
  cellMasks: SingleMask[];
  colormap: ColormapEntry[];
  metadata: SegmentationMetadata;
  clusterLabels: ClusterLabelEntry[];
};

export type ZarrRunMetadata = {
  metadata: Record<string, any>;
  smpInfoOrder: string[];
};

export type ZarrCellsSegmentations = {
  segmentationOrder: string[];
  segmentationSources: Record<string, string>;
};

export type ZarrTranscriptField = 'cell_id' | 'gene_name' | 'position' | 'gene_index' | 'data';

export type ZarrPathsCells = {
  base: () => string;
  segmentation: (folder: string) => string;
  field: (folder: string, field: string) => string;
};

export type ZarrPathsImages = {
  multiplex: (level?: number) => string;
  h_and_e: (level?: number) => string;
};

export type ZarrPathsTranscripts = {
  base: () => string;
  tile: (params: ZarrTileCoordinates) => string;
};

export type ZarrPathsAttrs = {
  root: () => string;
  group: () => string;
  transcripts: () => string;
  multiplexLevel: (level: number) => string;
  images: () => string;
  cells: () => string;
  cellsSegmentation: (folder: string) => string;
};

export type ZarrPathsMisc = {
  summary: () => string;
};

export type ZarrPathBuilder = {
  cells: ZarrPathsCells;
  images: ZarrPathsImages;
  transcripts: ZarrPathsTranscripts;
  attrs: ZarrPathsAttrs;
  misc: ZarrPathsMisc;
};
