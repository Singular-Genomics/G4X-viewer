import { useState, useEffect } from 'react';
import { GxDashboardGraphWindow } from '../../GxDashboardGraphWindow';
import { PieChartPlot } from './sections/PieChartPlot';
import { PieChartControls } from './sections/PieChartControls';
import { PieChartProps } from './PieChart.types';
import { PIE_CHART_CONFIG } from './PieChart.config';

export const PieChart = ({
  id,
  title = PIE_CHART_CONFIG.label,
  backgroundColor = PIE_CHART_CONFIG.defaultBackgroundColor,
  removable = true,
  initialRois = []
}: PieChartProps) => {
  const [selectedRois, setSelectedRois] = useState<number[]>(() => [...initialRois].sort((a, b) => a - b));

  useEffect(() => {
    if (initialRois.length > 0 && selectedRois.length === 0) {
      setSelectedRois([...initialRois].sort((a, b) => a - b));
    }
  }, [initialRois, selectedRois.length]);

  return (
    <GxDashboardGraphWindow
      id={id}
      title={title}
      backgroundColor={backgroundColor}
      removable={removable}
      controlsContent={
        <PieChartControls
          selectedRois={selectedRois}
          onRoiChange={setSelectedRois}
        />
      }
      graphContent={<PieChartPlot selectedRois={selectedRois} />}
    />
  );
};
