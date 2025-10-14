export type GxDashboardPieChartProps = {
  id: string;
  title?: string;
  backgroundColor?: string;
  removable?: boolean;
  initialRois?: number[];
};

export type GxDashboardPieChartPlotProps = {
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
