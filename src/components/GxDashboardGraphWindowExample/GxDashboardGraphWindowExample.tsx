import { GxDashboardGraphWindow } from '../GxDashboardGraphWindow';
import { GxDashboardGraphWindowExampleControls } from './sections/GxDashboardGraphWindowExampleControls';
import { GxDashboardGraphWindowExampleSettings } from './sections/GxDashboardGraphWindowExampleSettings';
import { GxDashboardGraphWindowExamplePlot } from './sections/GxDashboardGraphWindowExamplePlot';
import { GxDashboardGraphWindowExampleProps } from './GxDashboardGraphWindowExample.types';
import { EXAMPLE_CHART_CONFIG } from './GxDashboardGraphWindowExample.config';

export const GxDashboardGraphWindowExample = ({
  id,
  title = EXAMPLE_CHART_CONFIG.label,
  backgroundColor = EXAMPLE_CHART_CONFIG.defaultBackgroundColor,
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
