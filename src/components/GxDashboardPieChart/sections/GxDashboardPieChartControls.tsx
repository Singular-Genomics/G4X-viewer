import { Box } from '@mui/material';
import { RoiMultiSelect } from './controls';

type GxDashboardPieChartControlsProps = {
  selectedRois: number[];
  onRoiChange: (rois: number[]) => void;
};

export const GxDashboardPieChartControls = ({ selectedRois, onRoiChange }: GxDashboardPieChartControlsProps) => {
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
