import { useState } from 'react';
import { BoxChartProps } from './BoxChart.types';
import {
  BoxChartControls,
  BoxChartHueValueOptions,
  BoxChartPlot,
  BoxChartSettingOptions,
  BoxChartSettings,
  BoxChartValueType
} from './sections';
import { GxDashboardGraphWindow } from '../../../shared/components/GxDashboardGraphWindow';

export const BoxChart = ({ id, title, removable = true }: BoxChartProps) => {
  const [selectedRois, setSelectedRois] = useState<number[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>(' ');
  const [selectedHue, setSelectedHue] = useState<BoxChartHueValueOptions>('none');
  const [selectedValueType, setSelectedValueType] = useState<BoxChartValueType>('protein');
  const [settings, setSettings] = useState<BoxChartSettingOptions>({
    swapAxis: false,
    dataMode: 'suspectedoutliers'
  });

  return (
    <GxDashboardGraphWindow
      id={id}
      title={title}
      removable={removable}
      controlsContent={
        <BoxChartControls
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
        <BoxChartSettings
          settings={settings}
          onChangeSettings={setSettings}
        />
      }
      graphContent={
        <BoxChartPlot
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
