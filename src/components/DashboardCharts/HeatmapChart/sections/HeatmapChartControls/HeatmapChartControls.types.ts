export type HeatmapChartControlsProps = {
  selectedValues: string[];
  selectedROIs: number[];
  selectedValueType: HeatmapChartValueType;
  onRoiChange: (newRoiValues: number[]) => void;
  onValuesChange: (newValues: string[]) => void;
  onValueTypeChange: (newType: HeatmapChartValueType) => void;
};

export type HeatmapChartValueType = 'gene' | 'protein';
