import { Box } from '@mui/material';
import { RoiMultiSelect } from './controls';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useShallow } from 'zustand/react/shallow';
import { useMemo } from 'react';

type PieChartControlsProps = {
  selectedRois: number[];
  onRoiChange: (rois: number[]) => void;
};

export const PieChartControls = ({ selectedRois, onRoiChange }: PieChartControlsProps) => {
  const selectedCells = useCellSegmentationLayerStore(useShallow((store) => store.selectedCells));

  const availableRois = useMemo(() => {
    return Array.from(new Set(selectedCells.map((cell) => cell.roiId))).sort((a, b) => a - b);
  }, [selectedCells]);

  return (
    <Box sx={sx.container}>
      <RoiMultiSelect
        selectedRois={selectedRois}
        availableRois={availableRois}
        onChange={onRoiChange}
      />
    </Box>
  );
};

const sx = {
  container: {
    display: 'flex',
    gap: 1
  }
};
