export type HeatmapChartControlsProps = {
  selectedValue: string;
  selectedROIs: number[];
  selectedValueType: HeatmapChartValueType;
  onRoiChange: (newRoiValues: number[]) => void;
  onValueChange: (newGeneValue: string) => void;
  onValueTypeChange: (newType: HeatmapChartValueType) => void;
};

export type HeatmapChartValueType = 'gene' | 'protein';
