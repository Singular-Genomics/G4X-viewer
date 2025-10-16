export type BoxGraphSettingsProps = {
  settings: BoxGraphSettingOptions;
  onChangeSettings: (newSettings: BoxGraphSettingOptions) => void;
};

export type BoxGraphSettingOptions = {
  swapAxis: boolean;
  dataMode: BoxGraphDataMode;
};

export type BoxGraphDataMode = 'all' | 'outliers' | 'suspectedoutliers' | 'none';
