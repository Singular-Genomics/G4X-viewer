export type BarChartSettingsProps = {
  settings: BarChartSettingOptions;
  onChangeSettings: (newSettings: BarChartSettingOptions) => void;
};

export type BarChartSettingOptions = {
  swapAxis: boolean;
  barMode: BarChartBarMode;
};

export type BarChartBarMode = 'group' | 'stack' | 'relative' | 'overlay';
