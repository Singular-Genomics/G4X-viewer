export type BoxChartSettingsProps = {
  settings: BoxChartSettingOptions;
  onChangeSettings: (newSettings: BoxChartSettingOptions) => void;
};

export type BoxChartSettingOptions = {
  swapAxis: boolean;
  dataMode: BoxChartDataMode;
};

export type BoxChartDataMode = 'all' | 'outliers' | 'suspectedoutliers' | 'none';
