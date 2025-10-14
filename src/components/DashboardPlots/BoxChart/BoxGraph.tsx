import { useState } from 'react';
import { GxDashboardGraphWindow } from '../../../shared/components/GxDashboardGraphWindow';
import { BoxGraphProps } from './BoxGraph.types';
import { BoxGraphControls, BoxGraphPlot, BoxGraphSettings } from './sections';
import { HueValueOptions } from './sections/BoxGraphControls.types';

export const BoxGraph = ({ id, title, removable = true }: BoxGraphProps) => {
  const [selectedRois, setSelectedRois] = useState<number[]>([]);
  const [selectedGene, setSelectedGene] = useState<string>(' ');
  const [selectedHue, setSelectedHue] = useState<HueValueOptions>('none');

  return (
    <GxDashboardGraphWindow
      id={id}
      title={title}
      removable={removable}
      controlsContent={
        <BoxGraphControls
          selectedGene={selectedGene}
          selectedROIs={selectedRois}
          selectedHue={selectedHue}
          onRoiChange={setSelectedRois}
          onGeneChange={setSelectedGene}
          onHueChange={setSelectedHue}
        />
      }
      settingsContent={<BoxGraphSettings />}
      graphContent={<BoxGraphPlot />}
    />
  );
};
