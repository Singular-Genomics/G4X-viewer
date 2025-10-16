import { useState } from 'react';
import { GxDashboardGraphWindow } from '../../../shared/components/GxDashboardGraphWindow';
import { BoxGraphProps } from './BoxGraph.types';
import { BoxGraphControls, BoxGraphPlot, BoxGraphSettings } from './sections';
import { BoxGraphValueType, HueValueOptions } from './sections/BoxGraphControls.types';
import { BoxGraphSettingOptions } from './sections/BoxGraphSettings.types';

export const BoxGraph = ({ id, title, removable = true }: BoxGraphProps) => {
  const [selectedRois, setSelectedRois] = useState<number[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>(' ');
  const [selectedHue, setSelectedHue] = useState<HueValueOptions>('none');
  const [selectedValueType, setSelectedValueType] = useState<BoxGraphValueType>('protein');
  const [settings, setSettings] = useState<BoxGraphSettingOptions>({
    swapAxis: false,
    dataMode: 'suspectedoutliers'
  });

  return (
    <GxDashboardGraphWindow
      id={id}
      title={title}
      removable={removable}
      controlsContent={
        <BoxGraphControls
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
        <BoxGraphSettings
          settings={settings}
          onChangeSettings={setSettings}
        />
      }
      graphContent={
        <BoxGraphPlot
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
