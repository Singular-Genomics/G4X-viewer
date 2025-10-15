import { useState } from 'react';
import { GxDashboardGraphWindow } from '../../../shared/components/GxDashboardGraphWindow';
import { BoxGraphProps } from './BoxGraph.types';
import { BoxGraphControls, BoxGraphPlot, BoxGraphSettings } from './sections';
import { BoxGraphValueType, HueValueOptions } from './sections/BoxGraphControls.types';

export const BoxGraph = ({ id, title, removable = true }: BoxGraphProps) => {
  const [selectedRois, setSelectedRois] = useState<number[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>(' ');
  const [selectedHue, setSelectedHue] = useState<HueValueOptions>('none');
  const [selectedValueType, setSelectedValueType] = useState<BoxGraphValueType>('protein');

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
      settingsContent={<BoxGraphSettings />}
      graphContent={<BoxGraphPlot />}
    />
  );
};
