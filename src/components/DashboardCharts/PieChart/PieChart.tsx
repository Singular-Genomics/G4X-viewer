import { useState } from 'react';
import { PieChartProps } from './PieChart.types';
import { GxDashboardGraphWindow } from '../../../shared/components/GxDashboardGraphWindow';
import { PieChartControls, PieChartPlot, PieChartSettings, PieChartSettingOptions } from './sections';

export const PieChart = ({ id, title, removable = true }: PieChartProps) => {
  const [selectedROIs, setSelectedROIs] = useState<number[]>([]);
  const [settings, setSettings] = useState<PieChartSettingOptions>({
    sortRois: false
  });

  return (
    <GxDashboardGraphWindow
      id={id}
      title={title}
      removable={removable}
      controlsContent={
        <PieChartControls
          selectedROIs={selectedROIs}
          onRoiChange={setSelectedROIs}
        />
      }
      settingsContent={
        <PieChartSettings
          settings={settings}
          onChangeSettings={setSettings}
        />
      }
      graphContent={
        <PieChartPlot
          selectedRois={selectedROIs}
          settings={settings}
        />
      }
    />
  );
};
