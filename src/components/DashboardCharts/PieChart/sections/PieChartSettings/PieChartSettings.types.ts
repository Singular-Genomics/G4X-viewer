export type PieChartSettingsProps = {
  settings: PieChartSettingOptions;
  onChangeSettings: (newSettings: PieChartSettingOptions) => void;
};

export type PieChartSettingOptions = {
  sortRois: boolean;
};
