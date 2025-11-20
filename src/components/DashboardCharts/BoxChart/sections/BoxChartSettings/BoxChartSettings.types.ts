export type BoxChartSettingsProps = {
  settings: BoxChartSettingOptions;
  onChangeSettings: (newSettings: BoxChartSettingOptions) => void;
};

export type BoxChartSettingOptions = {
  swapAxis: boolean;
  dataMode: BoxChartDataMode;
  customTitle?: string;
  sortRois: boolean;
};

export type BoxChartDataMode = 'all' | 'outliers' | 'suspectedoutliers' | 'none';
