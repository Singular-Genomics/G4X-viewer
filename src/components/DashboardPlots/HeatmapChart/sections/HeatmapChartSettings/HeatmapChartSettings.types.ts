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
  colorscale?: ColorScaleOption;
};
