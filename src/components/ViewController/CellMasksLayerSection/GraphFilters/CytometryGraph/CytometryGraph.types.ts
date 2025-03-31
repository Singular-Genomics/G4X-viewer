export type ServerDataPoint = {
  value_X: number;
  value_Y: number;
  count: number;
};

export type SelectionBounds = {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

export type CytometryGraphProps = {
  data: ServerDataPoint[];
  onSelectionChange?: (bounds: SelectionBounds | null) => void;
  onPointsSelected?: (points: ServerDataPoint[]) => void;
  binSize?: number;
};
