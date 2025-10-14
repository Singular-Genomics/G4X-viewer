import { useState, useEffect } from 'react';
import { GxDashboardGraphWindow } from '../GxDashboardGraphWindow';
import { GxDashboardPieChartPlot } from './sections/GxDashboardPieChartPlot';
import { GxDashboardPieChartControls } from './sections/GxDashboardPieChartControls';
import { GxDashboardPieChartProps } from './GxDashboardPieChart.types';
import { PIE_CHART_CONFIG } from './GxDashboardPieChart.config';

export const GxDashboardPieChart = ({
  id,
  title = PIE_CHART_CONFIG.label,
  backgroundColor = PIE_CHART_CONFIG.defaultBackgroundColor,
  removable = true,
  initialRois = []
}: GxDashboardPieChartProps) => {
  const [selectedRois, setSelectedRois] = useState<number[]>(initialRois);

  useEffect(() => {
    if (initialRois.length > 0 && selectedRois.length === 0) {
      setSelectedRois(initialRois);
    }
  }, [initialRois, selectedRois.length]);

  return (
    <GxDashboardGraphWindow
      id={id}
      title={title}
      backgroundColor={backgroundColor}
      removable={removable}
      controlsContent={
        <GxDashboardPieChartControls
          selectedRois={selectedRois}
          onRoiChange={setSelectedRois}
        />
      }
      graphContent={<GxDashboardPieChartPlot selectedRois={selectedRois} />}
    />
  );
};
