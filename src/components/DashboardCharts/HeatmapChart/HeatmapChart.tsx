import { useState } from 'react';
import { GxDashboardGraphWindow } from '../../../shared/components/GxDashboardGraphWindow';
import { HeatmapChartProps } from './HeatmapChart.types';
import { HeatmapChartControls, HeatmapChartPlot, HeatmapChartSettings } from './sections';
import { HeatmapChartValueType } from './sections/HeatmapChartControls';
import { HeatmapChartSettingOptions } from './sections/HeatmapChartSettings';
import { AVAILABLE_COLORSCALES } from '../../../stores/CytometryGraphStore/CytometryGraphStore.types';

export const HeatmapChart = ({ id, title, removable = true }: HeatmapChartProps) => {
  const [selectedRois, setSelectedRois] = useState<number[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>(' ');
  const [selectedValueType, setSelectedValueType] = useState<HeatmapChartValueType>('protein');
  const [settings, setSettings] = useState<HeatmapChartSettingOptions>({
    colorscale: { ...AVAILABLE_COLORSCALES[0], reversed: false }
  });

  return (
    <GxDashboardGraphWindow
      id={id}
      title={title}
      removable={removable}
      controlsContent={
        <HeatmapChartControls
          selectedValue={selectedValue}
          selectedROIs={selectedRois}
          selectedValueType={selectedValueType}
          onRoiChange={setSelectedRois}
          onValueChange={setSelectedValue}
          onValueTypeChange={setSelectedValueType}
        />
      }
      settingsContent={
        <HeatmapChartSettings
          settings={settings}
          onChangeSettings={setSettings}
        />
      }
      graphContent={
        <HeatmapChartPlot
          selectedROIs={selectedRois}
          selectedValueType={selectedValueType}
          selectedValue={selectedValue}
          settings={settings}
        />
      }
    />
  );
};
