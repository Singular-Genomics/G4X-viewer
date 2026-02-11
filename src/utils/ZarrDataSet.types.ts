import { SingleMask, ColormapEntry, SegmentationMetadata } from '../shared/types';

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
};

export type ZarrCellsMetadataField = 'cell_id' | 'area' | 'cluster_id' | 'total_counts' | 'total_genes' | 'umap';

export type ZarrCellsPolygonsField = 'polygon_offsets' | 'polygon_vertices_xy';

export type ZarrCellsProteinField = 'protein_names' | 'protein_values';

export type ZarrCellsGenesField = 'gene_names' | 'data' | 'indices' | 'indptr';

export type ZarrTranscriptField = 'cell_id' | 'gene_name' | 'position';

export type ZarrTranscriptTileFieldParams = ZarrTileCoordinates & {
  field: ZarrTranscriptField;
};

export type ZarrPathsCells = {
  metadata: (field: ZarrCellsMetadataField) => string;
  polygons: (field: ZarrCellsPolygonsField) => string;
  protein: (field: ZarrCellsProteinField) => string;
  genes: (field: ZarrCellsGenesField) => string;
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
};

export type ZarrPathBuilder = {
  cells: ZarrPathsCells;
  images: ZarrPathsImages;
  transcripts: ZarrPathsTranscripts;
  attrs: ZarrPathsAttrs;
};
