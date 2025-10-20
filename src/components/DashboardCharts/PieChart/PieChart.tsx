import { useState } from 'react';
import { PieChartProps } from './PieChart.types';
import { GxDashboardGraphWindow } from '../../../shared/components/GxDashboardGraphWindow';
import { PieChartControls, PieChartPlot } from './sections';

export const PieChart = ({ id, title, removable = true }: PieChartProps) => {
  const [selectedROIs, setSelectedROIs] = useState<number[]>([]);

  return (
    <GxDashboardGraphWindow
      id={id}
      title={title}
      removable={removable}
      controlsContent={
        <PieChartControls
          selectedROIs={selectedROIs}
          onRoiChange={setSelectedROIs}
        />
      }
      graphContent={<PieChartPlot selectedRois={selectedROIs} />}
    />
  );
};
