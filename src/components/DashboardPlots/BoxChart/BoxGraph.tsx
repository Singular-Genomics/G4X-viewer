import { GxDashboardGraphWindow } from '../../../shared/components/GxDashboardGraphWindow';
import { BoxGraphControls, BoxGraphPlot, BoxGraphSettings } from './sections';

export const BoxGraph = ({ id = 'Test_id', title = 'Test Label', removable = true }) => {
  return (
    <GxDashboardGraphWindow
      id={id}
      title={title}
      removable={removable}
      controlsContent={<BoxGraphControls />}
      settingsContent={<BoxGraphSettings />}
      graphContent={<BoxGraphPlot />}
    />
  );
};
