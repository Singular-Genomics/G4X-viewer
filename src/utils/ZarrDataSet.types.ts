import { SingleMask, ColormapEntry, SegmentationMetadata } from '../shared/types';
import type { ClusterLabelEntry } from './ZarrCellsLoader';

export type ZarrLayerConfig = {
  layer_width: number;
  layer_height: number;
  layers: number;
  tile_size: number;
};

export type ZarrGeneColors = Record<string, [number, number, number]>;

export type ZarrTileCoordinates = {
  z: number;
  y: number;
  x: number;
};

export type ZarrTranscriptTileData = {
  pointsData: ZarrTranscriptPoint[];
  numberOfPoints: number;
};

export type ZarrTranscriptPoint = {
  cellId: string;
  geneName: string;
  position: [number, number];
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

export type ZarrTranscriptField = 'cell_id' | 'gene_name' | 'position';

export type ZarrTranscriptTileFieldParams = ZarrTileCoordinates & {
  field: ZarrTranscriptField;
};

export type ZarrPathsCells = {
  base: () => string;
};

export type ZarrPathsImages = {
  multiplex: (level?: number) => string;
  h_and_e: (level?: number) => string;
};

export type ZarrPathsTranscripts = {
  base: () => string;
  tile: (params: ZarrTileCoordinates) => string;
  tileField: (params: ZarrTranscriptTileFieldParams) => string;
};

export type ZarrPathsAttrs = {
  root: () => string;
  transcripts: () => string;
  multiplexLevel: (level: number) => string;
  images: () => string;
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
