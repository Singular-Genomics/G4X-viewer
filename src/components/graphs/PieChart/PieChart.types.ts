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
