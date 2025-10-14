import { useState, useEffect, useMemo } from 'react';
import { GxDashboardGraphWindow } from '../../GxDashboardGraphWindow';
import { PieChartPlot } from './sections/PieChartPlot';
import { PieChartControls } from './sections/PieChartControls';
import { PieChartProps } from './PieChart.types';
import { PIE_CHART_CONFIG } from './PieChart.config';
import { usePolygonDrawingStore } from '../../../stores/PolygonDrawingStore/PolygonDrawingStore';
import { useShallow } from 'zustand/react/shallow';

export const PieChart = ({
  id,
  title = PIE_CHART_CONFIG.label,
  backgroundColor = PIE_CHART_CONFIG.defaultBackgroundColor,
  removable = true,
  initialRois = []
}: PieChartProps) => {
  const [selectedRois, setSelectedRois] = useState<number[]>(() => [...initialRois].sort((a, b) => a - b));
  const polygonFeatures = usePolygonDrawingStore(useShallow((store) => store.polygonFeatures));

  const availablePolygonIds = useMemo(() => {
    return new Set(
      polygonFeatures.map((feature) => feature.properties?.polygonId).filter((id): id is number => id !== undefined)
    );
  }, [polygonFeatures]);

  useEffect(() => {
    const validRois = selectedRois.filter((roiId) => availablePolygonIds.has(roiId));

    if (validRois.length !== selectedRois.length) {
      setSelectedRois(validRois);
    }
  }, [availablePolygonIds, selectedRois]);

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
