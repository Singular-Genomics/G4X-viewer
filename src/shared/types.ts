export type UmapEntry = {
  umapY: number;
  umapX: number;
};

export type SingleMask = {
  vertices: number;
  color: number[];
  area: string;
  totalCounts: string;
  totalGenes: string;
  cellId: string;
  clusterId: string;
  proteins: {
    [key: string]: number;
  };
  umapValues: UmapEntry;
};

export type ColormapEntry = {
  clusterId: string;
  color: number[];
};

export type CellMasks = {
  cellMasks: SingleMask[];
  colormap: ColormapEntry[];
  numberOfCells: number[];
};

export type PointData = {
  position: number[];
  color: number[];
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

export type Metadata = {
  level: LevelData[];
};
