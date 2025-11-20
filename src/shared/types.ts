export type UmapEntry = {
  umapY: number;
  umapX: number;
};

export type SingleMask = {
  vertices: number[];
  area: number;
  totalCounts: number;
  totalGenes: number;
  cellId: string;
  clusterId: string;
  proteinValues: number[];
  nonzeroGeneIndices: number[];
  nonzeroGeneValues: number[];
  umapValues: UmapEntry;
};

export type ColormapEntry = {
  clusterId: string;
  color: number[];
};

export type SegmentationMetadata = {
  proteinNames: string[];
  geneNames: string[];
};

export type CellMasks = {
  cellMasks: SingleMask[];
  colormap: ColormapEntry[];
  numberOfCells: number[];
  metadata: SegmentationMetadata;
};

export type PointData = {
  position: number[];
  geneName: string;
  cellId: string;
};

export type TileData = {
  pointsData: PointData[];
  numberOfPoints: number;
};

export type ColumnData = {
  columnTiles: TileData[];
};

export type LevelData = {
  levelColumns: ColumnData[];
};

export type TranscriptsMetadata = {
  level: LevelData[];
};
