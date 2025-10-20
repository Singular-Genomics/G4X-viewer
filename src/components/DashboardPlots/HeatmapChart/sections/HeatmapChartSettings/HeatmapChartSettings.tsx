import { Box } from '@mui/material';
import { HeatmapChartSettingsProps } from './HeatmapChartSettings.types';

export const HeatmapChartSettings = ({ settings, onChangeSettings }: HeatmapChartSettingsProps) => {
  console.log(settings, onChangeSettings);
  return <Box>{/* Empty for now - settings will be added later */}</Box>;
};
