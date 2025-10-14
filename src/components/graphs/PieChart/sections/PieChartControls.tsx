import { Box } from '@mui/material';
import { RoiMultiSelect } from './controls';

type PieChartControlsProps = {
  selectedRois: number[];
  onRoiChange: (rois: number[]) => void;
};

export const PieChartControls = ({ selectedRois, onRoiChange }: PieChartControlsProps) => {
  return (
    <Box sx={sx.container}>
      <RoiMultiSelect
        selectedRois={selectedRois}
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
