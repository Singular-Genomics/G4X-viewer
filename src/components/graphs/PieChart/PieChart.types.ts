export type PieChartProps = {
  id: string;
  title?: string;
  backgroundColor?: string;
  removable?: boolean;
  initialRois?: number[];
};

export type PieChartPlotProps = {
  selectedRois: number[];
};

export type ClusterData = {
  clusterId: string;
  count: number;
  color: string;
};

export type SinglePieChartProps = {
  polygonId: number;
};
