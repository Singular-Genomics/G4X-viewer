export type HeatmapChartSettingsProps = {
  settings: HeatmapChartSettingOptions;
  onChangeSettings: (newSettings: HeatmapChartSettingOptions) => void;
};

export type ColorScaleOption = {
  label: string;
  value: [number, string][];
  reversed: boolean;
};

export type HeatmapChartSettingOptions = {
  colorscale: ColorScaleOption;
  customTitle?: string;
  normalization?: HeatmapChartNormalizationOption;
  normalizationAxis?: HeatmapChartNormalizationAxisOption;
};

export type HeatmapChartNormalizationOption = 'none' | 'min-max' | 'z-score';
export type HeatmapChartNormalizationAxisOption = 'y' | 'x' | 'both';
