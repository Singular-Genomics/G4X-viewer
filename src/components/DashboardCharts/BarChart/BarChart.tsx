import { useState } from 'react';
import { GxDashboardGraphWindow } from '../../../shared/components/GxDashboardGraphWindow';
import { BarChartProps } from './BarChart.types';
import { BarChartControls, BarChartPlot, BarChartSettings } from './sections';
import { BarChartValueType, BarChartHueValueOptions } from './sections/BarChartControls';
import { BarChartSettingOptions } from './sections/BarChartSettings';

export const BarChart = ({ id, title, removable = true }: BarChartProps) => {
  const [selectedRois, setSelectedRois] = useState<number[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>(' ');
  const [selectedHue, setSelectedHue] = useState<BarChartHueValueOptions>('none');
  const [selectedValueType, setSelectedValueType] = useState<BarChartValueType>('protein');
  const [settings, setSettings] = useState<BarChartSettingOptions>({
    swapAxis: false,
    barMode: 'group'
  });

  return (
    <GxDashboardGraphWindow
      id={id}
      title={title}
      removable={removable}
      controlsContent={
        <BarChartControls
          selectedValue={selectedValue}
          selectedROIs={selectedRois}
          selectedHue={selectedHue}
          selectedValueType={selectedValueType}
          onRoiChange={setSelectedRois}
          onValueChange={setSelectedValue}
          onHueChange={setSelectedHue}
          onValueTypeChange={setSelectedValueType}
        />
      }
      settingsContent={
        <BarChartSettings
          settings={settings}
          onChangeSettings={setSettings}
        />
      }
      graphContent={
        <BarChartPlot
          selectedROIs={selectedRois}
          selectedValueType={selectedValueType}
          selectedValue={selectedValue}
          selectedHue={selectedHue}
          settings={settings}
        />
      }
    />
  );
};
