import { GxDashboardGraphWindow } from '../GxDashboardGraphWindow';
import { GxDashboardGraphWindowExampleControls } from './sections/GxDashboardGraphWindowExampleControls';
import { GxDashboardGraphWindowExampleSettings } from './sections/GxDashboardGraphWindowExampleSettings';
import { GxDashboardGraphWindowExamplePlot } from './sections/GxDashboardGraphWindowExamplePlot';
import { GxDashboardGraphWindowExampleProps } from './GxDashboardGraphWindowExample.types';

export const GxDashboardGraphWindowExample = ({
  id,
  title = 'Example Chart',
  backgroundColor = '#2d3748',
  removable = true
}: GxDashboardGraphWindowExampleProps) => {
  return (
    <GxDashboardGraphWindow
      id={id}
      title={title}
      backgroundColor={backgroundColor}
      removable={removable}
      controlsContent={<GxDashboardGraphWindowExampleControls />}
      settingsContent={<GxDashboardGraphWindowExampleSettings />}
      graphContent={<GxDashboardGraphWindowExamplePlot />}
    />
  );
};
