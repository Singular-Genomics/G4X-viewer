export type BoxChartSettingsProps = {
  settings: BoxChartSettingOptions;
  onChangeSettings: (newSettings: BoxChartSettingOptions) => void;
};

export type BoxChartSettingOptions = {
  swapAxis: boolean;
  dataMode: BoxChartDataMode;
  customTitle?: string;
};

export type BoxChartDataMode = 'all' | 'outliers' | 'suspectedoutliers' | 'none';
