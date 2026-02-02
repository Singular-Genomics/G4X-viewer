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
